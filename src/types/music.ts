export interface TrackFileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  durationFormatted: string;
  fileMetadata?: TrackFileMetadata;
  artworkKey: string; // identifier for vector artwork or data URL
  artworkUrl?: string; // custom cover image or object URL
  isFavorite: boolean;
  audioUrl?: string; // audio object URL
  isProcedural?: boolean; // synthesized audio (legacy flag)
  audioStyle?: 'synthwave' | 'ambient' | 'chill' | 'lofi' | 'deep' | 'dream' | 'cosmic';
  year?: number;
  genre?: string;
  trackNumber?: number;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artworkKey: string;
  artworkUrl?: string;
  year?: number;
  trackCount: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  trackIds: string[];
  createdAt: number;
}

export type NavSection = 'home' | 'library' | 'playlists' | 'favorites' | 'settings';
export type LibraryTab = 'songs' | 'albums' | 'artists' | 'genres';
export type ViewMode = 'list' | 'grid';
export type SortOption = 'recent' | 'title' | 'artist' | 'album' | 'duration';
export type RepeatMode = 'off' | 'all' | 'one';

export interface ThemeSettings {
  backgroundOpacity: number; // e.g. 0.85
  blurIntensity: number; // e.g. 24
  accentColor: string; // e.g. '#BB9AF7'
  secondaryAccentColor: string; // e.g. '#7AA2F7'
  compactMode: boolean;
  visualizerBars: number; // default 24
  smoothingTimeConstant: number; // default 0.8
  themeName: 'tokyonight' | 'tokyonight-storm' | 'tokyonight-moon';
}
