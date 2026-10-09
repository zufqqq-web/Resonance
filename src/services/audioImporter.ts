import { Track, TrackFileMetadata } from '../types/music';
import { parseAudioFile } from '../utils/id3Parser';

export interface ImportSkippedItem {
  name: string;
  reason: string;
}

export interface ImportResult {
  tracks: Track[];
  skippedUnsupported: ImportSkippedItem[];
  skippedDuplicates: string[];
}

// Active Object URL registry to prevent memory leaks
const activeObjectUrls = new Set<string>();

export function registerObjectUrl(url: string): void {
  if (url && (url.startsWith('blob:') || url.startsWith('data:'))) {
    activeObjectUrls.add(url);
  }
}

export function revokeTrackUrls(track: Track): void {
  if (track.audioUrl && activeObjectUrls.has(track.audioUrl)) {
    URL.revokeObjectURL(track.audioUrl);
    activeObjectUrls.delete(track.audioUrl);
  }
  if (track.artworkUrl && activeObjectUrls.has(track.artworkUrl)) {
    URL.revokeObjectURL(track.artworkUrl);
    activeObjectUrls.delete(track.artworkUrl);
  }
}

export function revokeAllRegisteredUrls(): void {
  activeObjectUrls.forEach((url) => {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore
    }
  });
  activeObjectUrls.clear();
}

// Register window cleanup on unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    revokeAllRegisteredUrls();
  });
}

const ARTWORK_KEYS = [
  'midnight_drive',
  'fragments',
  'bloom',
  'neon_skies',
  'solstice',
  'metamorphosis',
  'echoes',
];

/**
 * Checks if an audio file format is supported by the browser runtime.
 */
export function isAudioFormatSupported(file: File): { supported: boolean; reason?: string } {
  const name = file.name.toLowerCase();
  const extMatch = name.match(/\.([a-z0-9]+)$/);
  const ext = extMatch ? extMatch[1] : '';

  const knownExtensions = ['mp3', 'wav', 'ogg', 'oga', 'flac', 'm4a', 'aac', 'webm'];
  const isAudioType = file.type.startsWith('audio/') || knownExtensions.includes(ext);

  if (!isAudioType) {
    return {
      supported: false,
      reason: `"${file.name}" is not a recognized audio file.`,
    };
  }

  // Runtime playback support verification
  const audioTester = document.createElement('audio');

  if (ext === 'flac' || file.type === 'audio/flac' || file.type === 'audio/x-flac') {
    const canPlayFlac = audioTester.canPlayType('audio/flac') || audioTester.canPlayType('audio/x-flac');
    if (!canPlayFlac) {
      return {
        supported: false,
        reason: `FLAC audio playback is not supported by this browser runtime.`,
      };
    }
  } else if (file.type) {
    const canPlay = audioTester.canPlayType(file.type);
    if (!canPlay && ext && !['mp3', 'wav', 'ogg'].includes(ext)) {
      return {
        supported: false,
        reason: `Audio format "${ext.toUpperCase()}" is not supported by your browser.`,
      };
    }
  }

  return { supported: true };
}

/**
 * Measures real track duration in seconds using HTMLAudioElement.
 */
export function getAudioDuration(objectUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    let settled = false;

    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('error', onError);
      audio.src = '';
    };

    const finish = (duration: number) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(isFinite(duration) && duration > 0 ? duration : 0);
    };

    const onLoaded = () => {
      finish(audio.duration);
    };

    const onError = () => {
      finish(0);
    };

    audio.addEventListener('loadedmetadata', onLoaded, { once: true });
    audio.addEventListener('error', onError, { once: true });
    audio.src = objectUrl;

    // Safety timeout after 2.5 seconds
    setTimeout(() => {
      finish(0);
    }, 2500);
  });
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Imports a list of local files, extracting metadata, validating formats,
 * eliminating duplicates, and returning typed Track objects.
 */
export async function importAudioFiles(
  fileList: FileList | File[],
  existingTracks: Track[]
): Promise<ImportResult> {
  const tracks: Track[] = [];
  const skippedUnsupported: ImportSkippedItem[] = [];
  const skippedDuplicates: string[] = [];

  const files = Array.from(fileList);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // 1. Check supported audio format
    const formatCheck = isAudioFormatSupported(file);
    if (!formatCheck.supported) {
      skippedUnsupported.push({
        name: file.name,
        reason: formatCheck.reason || 'Unsupported audio format',
      });
      continue;
    }

    // 2. Duplicate detection against existing tracks and newly processed tracks in this batch
    const isDuplicateExisting = existingTracks.some((t) => {
      if (!t.fileMetadata) return false;
      return (
        t.fileMetadata.name === file.name &&
        t.fileMetadata.size === file.size &&
        t.fileMetadata.lastModified === file.lastModified
      );
    });

    const isDuplicateBatch = tracks.some((t) => {
      if (!t.fileMetadata) return false;
      return (
        t.fileMetadata.name === file.name &&
        t.fileMetadata.size === file.size &&
        t.fileMetadata.lastModified === file.lastModified
      );
    });

    if (isDuplicateExisting || isDuplicateBatch) {
      skippedDuplicates.push(file.name);
      continue;
    }

    // 3. Create audio Object URL
    const audioUrl = URL.createObjectURL(file);
    registerObjectUrl(audioUrl);

    // 4. Extract ID3 metadata and duration
    let title: string | undefined;
    let artist: string | undefined;
    let album: string | undefined;
    let artworkUrl: string | undefined;
    let year: number | undefined;
    let genre: string | undefined;
    let trackNumber: number | undefined;

    try {
      const parsed = await parseAudioFile(file);
      title = parsed.title;
      artist = parsed.artist;
      album = parsed.album;
      year = parsed.year;
      genre = parsed.genre;
      trackNumber = parsed.trackNumber;

      if (parsed.pictureUrl) {
        artworkUrl = parsed.pictureUrl;
        registerObjectUrl(artworkUrl);
      }
    } catch {
      // ID3 parsing failed or missing; fallback to filename
    }

    // Fallback title from file name without extension
    if (!title || title.trim() === '') {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      if (nameWithoutExt.includes(' - ')) {
        const parts = nameWithoutExt.split(' - ');
        artist = artist || parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      } else {
        title = nameWithoutExt;
      }
    }

    if (!artist || artist.trim() === '') {
      artist = 'Unknown Artist';
    }

    if (!album || album.trim() === '') {
      album = 'Local Music';
    }

    // 5. Measure real audio duration
    const realDuration = await getAudioDuration(audioUrl);
    const durationFormatted = formatDuration(realDuration);

    // Pick deterministic fallback artwork key based on title hash
    const artworkKeyIndex = Math.abs(
      title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % ARTWORK_KEYS.length;
    const artworkKey = ARTWORK_KEYS[artworkKeyIndex];

    const fileMetadata: TrackFileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    };

    const newTrack: Track = {
      id: `local-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      artist,
      album,
      duration: Math.round(realDuration),
      durationFormatted,
      fileMetadata,
      audioUrl,
      artworkUrl,
      artworkKey,
      isFavorite: false,
      year: year || new Date(file.lastModified).getFullYear(),
      genre: genre || 'Local Audio',
      trackNumber,
    };

    tracks.push(newTrack);
  }

  return {
    tracks,
    skippedUnsupported,
    skippedDuplicates,
  };
}
