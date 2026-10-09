import React, { useState, useRef } from 'react';
import {
  Music2,
  Disc,
  User,
  Compass,
  ArrowUpDown,
  LayoutGrid,
  List,
  Upload,
} from 'lucide-react';
import { Track, Album, LibraryTab, ViewMode, SortOption } from '../types/music';
import { AlbumCard } from './AlbumCard';
import { TrackList } from './TrackList';

interface LibraryViewProps {
  tracks: Track[];
  albums: Album[];
  currentTrackId?: string;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onPlayAlbum: (album: Album) => void;
  onToggleFavorite: (trackId: string) => void;
  onAddToQueue: (track: Track) => void;
  onPlayNext: (track: Track) => void;
  onImportFiles: (files: FileList) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  tracks,
  albums,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onPlayAlbum,
  onToggleFavorite,
  onAddToQueue,
  onPlayNext,
  onImportFiles,
}) => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('songs');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Tab definitions matching reference image
  const tabs = [
    { id: 'songs' as LibraryTab, label: 'Songs', icon: Music2 },
    { id: 'albums' as LibraryTab, label: 'Albums', icon: Disc },
    { id: 'artists' as LibraryTab, label: 'Artists', icon: User },
    { id: 'genres' as LibraryTab, label: 'Genres', icon: Compass },
  ];

  // Sorting logic
  const sortedTracks = [...tracks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'artist':
        return a.artist.localeCompare(b.artist);
      case 'album':
        return a.album.localeCompare(b.album);
      case 'duration':
        return b.duration - a.duration;
      case 'recent':
      default:
        return 0; // retain collection order
    }
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImportFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex-1 flex flex-col px-8 pt-6 pb-28 overflow-y-auto"
    >
      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-4 rounded-3xl bg-[#1A1B26]/95 border-2 border-dashed border-[#BB9AF7] z-50 flex flex-col items-center justify-center pointer-events-none">
          <Upload className="w-12 h-12 text-[#BB9AF7] mb-3 animate-bounce" />
          <h3 className="text-lg font-semibold text-white">Drop audio files here</h3>
          <p className="text-sm text-[#9AA5CE] mt-1">MP3, WAV, OGG, and FLAC formats supported</p>
        </div>
      )}

      {/* Library Title & Subtitle matching reference */}
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#C0CAF5]">
          Library
        </h1>
        <p className="text-[13px] text-[#565F89] mt-0.5">
          Your music collection, all in one place
        </p>
      </div>

      {/* Navigation Tabs and Controls Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-6 select-none">
        {/* Left: Filter Tabs matching reference image */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#16161E]/80 border border-[#414868]/30">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#24283B] text-[#BB9AF7] shadow-sm border border-[#BB9AF7]/30'
                    : 'text-[#9AA5CE] hover:text-[#C0CAF5] hover:bg-[#24283B]/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#BB9AF7]' : 'text-[#565F89]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Sort Dropdown & View Mode Toggles */}
        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#16161E]/80 border border-[#414868]/30 text-xs text-[#9AA5CE] hover:text-[#C0CAF5] hover:bg-[#24283B]/60 transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#565F89]" />
              <span className="capitalize">{sortBy}</span>
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 top-9 w-36 rounded-xl bg-[#24283B] border border-[#414868]/60 shadow-xl py-1 z-30 flex flex-col text-xs text-[#C0CAF5]">
                {(['recent', 'title', 'artist', 'album', 'duration'] as SortOption[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSortBy(opt);
                      setSortDropdownOpen(false);
                    }}
                    className={`px-3 py-1.5 text-left capitalize transition-colors hover:bg-[#292E42] cursor-pointer ${
                      sortBy === opt ? 'text-[#BB9AF7] font-semibold' : 'text-[#9AA5CE]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Toggles: Grid / List */}
          <div className="flex items-center p-0.5 rounded-xl bg-[#16161E]/80 border border-[#414868]/30">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#24283B] text-[#BB9AF7]'
                  : 'text-[#565F89] hover:text-[#C0CAF5]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="List View"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#24283B] text-[#BB9AF7]'
                  : 'text-[#565F89] hover:text-[#C0CAF5]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hidden native file input for empty state or custom triggers */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.flac"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onImportFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Album Artwork Cards Carousel / Row matching reference image */}
      {albums.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                isPlaying={isPlaying && tracks.find((t) => t.id === currentTrackId)?.album === album.title}
                onPlayAlbum={onPlayAlbum}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Track Collection */}
      <div className="flex flex-col">
        {viewMode === 'list' ? (
          <TrackList
            tracks={sortedTracks}
            currentTrackId={currentTrackId}
            isPlaying={isPlaying}
            onPlayTrack={onPlayTrack}
            onToggleFavorite={onToggleFavorite}
            onAddToQueue={onAddToQueue}
            onPlayNext={onPlayNext}
            onImportClick={() => fileInputRef.current?.click()}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-24">
            {sortedTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track)}
                className={`flex flex-col p-3 rounded-2xl bg-[#1A1B26]/60 hover:bg-[#24283B] border transition-colors cursor-pointer ${
                  track.id === currentTrackId
                    ? 'border-[#BB9AF7]/40 bg-[#24283B]'
                    : 'border-[#414868]/30 hover:border-[#414868]/60'
                }`}
              >
                <div className="aspect-square w-full rounded-xl overflow-hidden mb-2.5 bg-[#16161E]">
                  <AlbumCard
                    album={{
                      id: track.id,
                      title: track.title,
                      artist: track.artist,
                      artworkKey: track.artworkKey,
                      artworkUrl: track.artworkUrl,
                      trackCount: 1,
                    }}
                    onPlayAlbum={() => onPlayTrack(track)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
