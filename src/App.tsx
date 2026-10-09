import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { NavSection, Track, Album, RepeatMode, ThemeSettings } from './types/music';
import { AudioEngine } from './services/audioEngine';
import { importAudioFiles } from './services/audioImporter';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { LibraryView } from './components/LibraryView';
import { HomeView } from './components/HomeView';
import { PlaylistsView } from './components/PlaylistsView';
import { FavoritesView } from './components/FavoritesView';
import { SettingsModal } from './components/SettingsModal';
import { BottomPlayer } from './components/BottomPlayer';
import { QueueDrawer } from './components/QueueDrawer';

const DEFAULT_THEME: ThemeSettings = {
  backgroundOpacity: 0.85,
  blurIntensity: 24,
  accentColor: '#BB9AF7',
  secondaryAccentColor: '#7AA2F7',
  compactMode: false,
  visualizerBars: 20,
  smoothingTimeConstant: 0.8,
  themeName: 'tokyonight',
};

export default function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeSection, setActiveSection] = useState<NavSection>('library'); // Library by default per requirements
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [queue, setQueue] = useState<Track[]>([]);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(DEFAULT_THEME);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 4500);
  }, []);

  // Dynamically derive albums from imported tracks
  const albums = useMemo<Album[]>(() => {
    const map = new Map<string, { album: Album; tracks: Track[] }>();
    tracks.forEach((t) => {
      const key = t.album || 'Local Music';
      if (!map.has(key)) {
        map.set(key, {
          album: {
            id: `alb-${key.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            title: key,
            artist: t.artist,
            artworkKey: t.artworkKey,
            artworkUrl: t.artworkUrl,
            year: t.year,
            trackCount: 1,
          },
          tracks: [t],
        });
      } else {
        const item = map.get(key)!;
        item.album.trackCount += 1;
        item.tracks.push(t);
        if (!item.album.artworkUrl && t.artworkUrl) {
          item.album.artworkUrl = t.artworkUrl;
        }
      }
    });
    return Array.from(map.values()).map((v) => v.album);
  }, [tracks]);

  // Sync theme settings to CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--app-bg-opacity', themeSettings.backgroundOpacity.toString());
    root.style.setProperty('--app-blur', `${themeSettings.blurIntensity}px`);
    root.style.setProperty('--app-accent', themeSettings.accentColor);
    root.style.setProperty('--app-accent-secondary', themeSettings.secondaryAccentColor);
  }, [themeSettings]);

  // Forward declaration of handleNextTrack for the ended event
  const handleNextTrackRef = useRef<() => void>(() => {});

  // Audio Engine event listeners setup
  useEffect(() => {
    const engine = AudioEngine.getInstance();

    const unsubTime = engine.onTimeUpdate((curr, dur) => {
      setCurrentTime(curr);
      if (dur > 0) setDuration(dur);
    });

    const unsubState = engine.onStateChange((playing) => {
      setIsPlaying(playing);
    });

    const unsubEnded = engine.onTrackEnded(() => {
      handleNextTrackRef.current();
    });

    const unsubLoaded = engine.onTrackLoaded((trk) => {
      setCurrentTrack(trk);
      setDuration(trk.duration || 0);
    });

    const unsubError = engine.onError((err) => {
      showToast(err);
    });

    return () => {
      unsubTime();
      unsubState();
      unsubEnded();
      unsubLoaded();
      unsubError();
    };
  }, [showToast]);

  // Update audio engine settings when smoothing changes
  useEffect(() => {
    const engine = AudioEngine.getInstance();
    engine.setAnalyserSmoothing(themeSettings.smoothingTimeConstant);
  }, [themeSettings.smoothingTimeConstant]);

  // Playback handlers
  const handlePlayTrack = useCallback(async (track: Track) => {
    const engine = AudioEngine.getInstance();
    setCurrentTrack(track);
    setDuration(track.duration || 0);
    const success = await engine.loadAndPlayTrack(track);
    if (!success) {
      setIsPlaying(false);
    }
  }, []);

  const handleTogglePlay = useCallback(async () => {
    const engine = AudioEngine.getInstance();
    if (!currentTrack) {
      if (tracks.length > 0) {
        await handlePlayTrack(tracks[0]);
      } else {
        showToast('Your library is empty. Import audio files to start listening.');
      }
      return;
    }
    await engine.togglePlay();
  }, [currentTrack, tracks, handlePlayTrack, showToast]);

  const handleSeek = useCallback((seconds: number) => {
    const engine = AudioEngine.getInstance();
    engine.seek(seconds);
    setCurrentTime(seconds);
  }, []);

  const handleVolumeChange = useCallback((newVol: number) => {
    const engine = AudioEngine.getInstance();
    engine.setVolume(newVol);
    setVolume(newVol);
    setIsMuted(newVol === 0);
  }, []);

  const handleToggleMute = useCallback(() => {
    const engine = AudioEngine.getInstance();
    engine.toggleMute();
    setIsMuted(engine.getIsMuted());
    setVolume(engine.getVolume());
  }, []);

  const handleNextTrack = useCallback(() => {
    // 1. If queue has tracks, take the first one from queue
    if (queue.length > 0) {
      const [nextFromQueue, ...rest] = queue;
      setQueue(rest);
      handlePlayTrack(nextFromQueue);
      return;
    }

    // 2. Repeat one mode
    if (repeatMode === 'one' && currentTrack) {
      handlePlayTrack(currentTrack);
      return;
    }

    // 3. Normal track sequence or shuffle
    if (!currentTrack || tracks.length === 0) return;

    if (isShuffle) {
      const remaining = tracks.filter((t) => t.id !== currentTrack.id);
      const randomTrack = remaining[Math.floor(Math.random() * remaining.length)] || tracks[0];
      handlePlayTrack(randomTrack);
      return;
    }

    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;

    if (nextIndex === 0 && repeatMode === 'off') {
      const engine = AudioEngine.getInstance();
      engine.pause();
      return;
    }

    handlePlayTrack(tracks[nextIndex]);
  }, [queue, repeatMode, currentTrack, tracks, isShuffle, handlePlayTrack]);

  // Keep ref up to date for ended listener
  useEffect(() => {
    handleNextTrackRef.current = handleNextTrack;
  }, [handleNextTrack]);

  const handlePreviousTrack = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;

    // If current time is > 3 seconds, restart current track
    if (currentTime > 3) {
      handleSeek(0);
      return;
    }

    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    handlePlayTrack(tracks[prevIndex]);
  }, [currentTrack, tracks, currentTime, handleSeek, handlePlayTrack]);

  const handleCycleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const handleToggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const handleToggleFavorite = useCallback((trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, isFavorite: !t.isFavorite } : t))
    );
    if (currentTrack && currentTrack.id === trackId) {
      setCurrentTrack((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  }, [currentTrack]);

  const handleAddToQueue = useCallback((track: Track) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  const handlePlayNext = useCallback((track: Track) => {
    setQueue((prev) => [track, ...prev]);
  }, []);

  const handleRemoveFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  // Import local audio files (MP3, WAV, OGG, FLAC)
  const handleImportFiles = useCallback(
    async (fileList: FileList | File[]) => {
      try {
        const result = await importAudioFiles(fileList, tracks);

        if (result.tracks.length > 0) {
          setTracks((prev) => [...prev, ...result.tracks]);

          // If no track was playing, load and play the first imported track
          if (!currentTrack) {
            handlePlayTrack(result.tracks[0]);
          }
        }

        const feedback: string[] = [];
        if (result.tracks.length > 0) {
          feedback.push(`Imported ${result.tracks.length} track${result.tracks.length > 1 ? 's' : ''}`);
        }
        if (result.skippedDuplicates.length > 0) {
          feedback.push(`${result.skippedDuplicates.length} duplicate(s) skipped`);
        }
        if (result.skippedUnsupported.length > 0) {
          feedback.push(
            `${result.skippedUnsupported.length} unsupported file(s) skipped (MP3, WAV, OGG, FLAC supported)`
          );
        }

        if (feedback.length > 0) {
          showToast(feedback.join(' • '));
        } else if (fileList.length === 0) {
          showToast('No audio files were found.');
        }
      } catch (err) {
        console.error('Failed to import audio files:', err);
        showToast('Error importing files. Please try again.');
      }
    },
    [tracks, currentTrack, handlePlayTrack, showToast]
  );

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in search input or input fields
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleTogglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSeek(currentTime + 5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSeek(Math.max(0, currentTime - 5));
          break;
        case 'KeyM':
          handleToggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleSeek, handleToggleMute, currentTime]);

  // Filtered tracks based on search query
  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return tracks;
    const q = searchQuery.toLowerCase();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        (t.genre && t.genre.toLowerCase().includes(q))
    );
  }, [tracks, searchQuery]);

  const favoriteCount = useMemo(() => tracks.filter((t) => t.isFavorite).length, [tracks]);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center p-0 md:p-4 select-none font-sans">
      {/* 
        Browser Preview Ambient Backdrop (strictly outside the app window):
        Demonstrates the genuine glassmorphic backdrop-filter: blur(24px)
        with solid bokeh circles and room tones matching the reference image.
      */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden bg-[#0c0d13]">
        {/* Deep atmospheric bokeh circles in background (pure solid colors blurred) */}
        <div className="absolute top-1/4 left-1/5 w-96 h-96 rounded-full bg-[#3d274c] blur-[120px] opacity-70"></div>
        <div className="absolute bottom-1/6 right-1/4 w-[500px] h-[500px] rounded-full bg-[#1b2b4d] blur-[140px] opacity-60"></div>
        <div className="absolute top-1/10 right-1/10 w-72 h-72 rounded-full bg-[#e0af68] blur-[160px] opacity-25"></div>
        <div className="absolute bottom-1/10 left-1/10 w-80 h-80 rounded-full bg-[#f7768e] blur-[150px] opacity-30"></div>

        {/* Subtle silhouette of evening window frames and houseplant in corner */}
        <svg className="absolute inset-0 w-full h-full opacity-35" preserveAspectRatio="none">
          <line x1="28%" y1="0" x2="28%" y2="100%" stroke="#16161e" strokeWidth="8" />
          <line x1="72%" y1="0" x2="72%" y2="100%" stroke="#16161e" strokeWidth="8" />
          <line x1="0" y1="42%" x2="100%" y2="42%" stroke="#16161e" strokeWidth="8" />
        </svg>
      </div>

      {/* 
        Main Desktop Application Container:
        Follows the attached reference image's layout, proportions, and solid TokyoNight colors.
        Uses solid translucent backgrounds and backdrop-filter: blur(24px).
      */}
      <div
        className={`relative flex flex-col glass-surface overflow-hidden transition-all duration-300 ${
          isMaximized
            ? 'w-full h-full rounded-none'
            : 'w-full h-full max-w-[1440px] max-h-[920px] rounded-2xl md:rounded-3xl shadow-2xl border border-[rgba(192,202,245,0.14)]'
        }`}
      >
        {/* Top Desktop Bar */}
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onImportFiles={handleImportFiles}
          isMaximized={isMaximized}
          onToggleMaximize={() => setIsMaximized(!isMaximized)}
        />

        {/* Main Content Area (Sidebar + Active View) */}
        <div className="relative flex-1 flex overflow-hidden">
          {/* Left Navigation Sidebar */}
          <Sidebar
            activeSection={activeSection}
            onSelectSection={setActiveSection}
            favoriteCount={favoriteCount}
            playlistCount={3}
          />

          {/* Dynamic Main Views */}
          <main className="flex-1 flex flex-col overflow-hidden relative">
            {activeSection === 'library' && (
              <LibraryView
                tracks={filteredTracks}
                albums={albums}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                onPlayTrack={handlePlayTrack}
                onPlayAlbum={(alb) => {
                  const firstAlbumTrack = tracks.find((t) => t.album === alb.title) || tracks[0];
                  if (firstAlbumTrack) handlePlayTrack(firstAlbumTrack);
                }}
                onToggleFavorite={handleToggleFavorite}
                onAddToQueue={handleAddToQueue}
                onPlayNext={handlePlayNext}
                onImportFiles={handleImportFiles}
              />
            )}

            {activeSection === 'home' && (
              <HomeView
                tracks={tracks}
                albums={albums}
                onPlayTrack={handlePlayTrack}
                onGoToLibrary={() => setActiveSection('library')}
              />
            )}

            {activeSection === 'playlists' && (
              <PlaylistsView
                tracks={tracks}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                onPlayTrack={handlePlayTrack}
                onToggleFavorite={handleToggleFavorite}
                onAddToQueue={handleAddToQueue}
                onPlayNext={handlePlayNext}
              />
            )}

            {activeSection === 'favorites' && (
              <FavoritesView
                tracks={tracks}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                onPlayTrack={handlePlayTrack}
                onToggleFavorite={handleToggleFavorite}
                onAddToQueue={handleAddToQueue}
                onPlayNext={handlePlayNext}
              />
            )}

            {activeSection === 'settings' && (
              <SettingsModal
                settings={themeSettings}
                onUpdateSettings={(newVals) =>
                  setThemeSettings((prev) => ({ ...prev, ...newVals }))
                }
              />
            )}
          </main>
        </div>

        {/* Bottom Dock Audio Player */}
        <BottomPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          isShuffle={isShuffle}
          repeatMode={repeatMode}
          visualizerBars={themeSettings.visualizerBars}
          accentColor={themeSettings.accentColor}
          onTogglePlay={handleTogglePlay}
          onNext={handleNextTrack}
          onPrevious={handlePreviousTrack}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          onToggleShuffle={handleToggleShuffle}
          onCycleRepeat={handleCycleRepeat}
          onToggleFavorite={handleToggleFavorite}
          onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
          isQueueOpen={isQueueOpen}
        />

        {/* Playback Queue Drawer */}
        <QueueDrawer
          isOpen={isQueueOpen}
          onClose={() => setIsQueueOpen(false)}
          queue={queue}
          currentTrack={currentTrack}
          onPlayTrack={handlePlayTrack}
          onRemoveFromQueue={handleRemoveFromQueue}
          onClearQueue={handleClearQueue}
        />

        {/* Floating Notification Toast for playback errors or import feedback */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed top-6 right-6 z-50 max-w-sm px-4 py-3 rounded-2xl bg-[#24283B] border border-[#BB9AF7]/40 text-xs text-[#C0CAF5] shadow-2xl flex items-center gap-2.5 transition-all"
          >
            <div className="w-2 h-2 rounded-full bg-[#BB9AF7] shrink-0" />
            <span className="flex-1 font-medium">{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-[#565F89] hover:text-[#C0CAF5] text-xs ml-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
