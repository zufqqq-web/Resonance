import React, { useState } from 'react';
import { Play, Pause, Heart, MoreHorizontal, ListPlus, Copy } from 'lucide-react';
import { Track } from '../types/music';
import { Artwork } from './Artwork';

interface TrackRowProps {
  track: Track;
  index: number;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
  onAddToQueue: (track: Track) => void;
  onPlayNext: (track: Track) => void;
}

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  index,
  isCurrentTrack,
  isPlaying,
  onPlayTrack,
  onToggleFavorite,
  onAddToQueue,
  onPlayNext,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMenuOpen(false);
      }}
      onClick={() => onPlayTrack(track)}
      onDoubleClick={() => onPlayTrack(track)}
      className={`group relative grid grid-cols-[36px_minmax(180px,2fr)_minmax(120px,1.2fr)_minmax(120px,1.2fr)_70px_36px_36px] items-center px-4 py-2.5 rounded-xl text-[13px] transition-colors cursor-pointer select-none ${
        isCurrentTrack
          ? 'bg-[#BB9AF7]/14 text-[#C0CAF5] border border-[#BB9AF7]/20 shadow-sm'
          : 'hover:bg-[#24283B]/50 text-[#9AA5CE] hover:text-[#C0CAF5]'
      }`}
    >
      {/* 1. Track Number or Play/Equalizer indicator */}
      <div className="flex items-center justify-center w-7 h-7 text-xs font-mono">
        {isCurrentTrack && isPlaying ? (
          <div className="flex items-end gap-0.5 h-3.5">
            <span className="w-0.5 h-3 bg-[#BB9AF7] rounded-full animate-bounce"></span>
            <span className="w-0.5 h-4 bg-[#7AA2F7] rounded-full animate-bounce delay-100"></span>
            <span className="w-0.5 h-2.5 bg-[#BB9AF7] rounded-full animate-bounce delay-200"></span>
          </div>
        ) : isHovered ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlayTrack(track);
            }}
            className="w-6 h-6 rounded-md flex items-center justify-center text-[#C0CAF5] hover:text-[#BB9AF7]"
          >
            {isCurrentTrack && isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
          </button>
        ) : (
          <span className={`text-[12px] tabular-nums ${isCurrentTrack ? 'text-[#BB9AF7] font-semibold' : 'text-[#565F89]'}`}>
            {index + 1}
          </span>
        )}
      </div>

      {/* 2. Artwork + Title */}
      <div className="flex items-center gap-3 min-w-0 pr-3">
        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-[#16161E] border border-[#414868]/30">
          <Artwork
            artworkKey={track.artworkKey}
            artworkUrl={track.artworkUrl}
            className="w-full h-full object-cover"
            alt={track.title}
          />
        </div>
        <span
          className={`font-medium truncate ${
            isCurrentTrack ? 'text-white font-semibold' : 'text-[#C0CAF5]'
          }`}
        >
          {track.title}
        </span>
      </div>

      {/* 3. Artist */}
      <div className="truncate pr-3 text-[#9AA5CE]">
        {track.artist}
      </div>

      {/* 4. Album */}
      <div className="truncate pr-3 text-[#565F89] group-hover:text-[#9AA5CE] transition-colors">
        {track.album}
      </div>

      {/* 5. Duration (Tabular figures) */}
      <div className="font-mono text-xs tabular-nums text-[#565F89] group-hover:text-[#9AA5CE] text-right pr-2">
        {track.durationFormatted}
      </div>

      {/* 6. Favorite Button */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(track.id);
          }}
          title={track.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="p-1 rounded-md text-[#565F89] hover:text-[#BB9AF7] transition-colors"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              track.isFavorite
                ? 'fill-[#BB9AF7] text-[#BB9AF7]'
                : 'text-[#565F89] group-hover:text-[#9AA5CE]'
            }`}
          />
        </button>
      </div>

      {/* 7. More Options with Popover Menu */}
      <div className="relative flex items-center justify-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          title="More actions"
          className="p-1 rounded-md text-[#565F89] hover:text-[#C0CAF5] transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-7 w-40 rounded-xl bg-[#24283B] border border-[#414868]/60 shadow-xl py-1.5 z-30 flex flex-col text-xs text-[#C0CAF5]"
          >
            <button
              type="button"
              onClick={() => {
                onPlayNext(track);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#292E42] text-left transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-[#BB9AF7]" />
              <span>Play Next</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onAddToQueue(track);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#292E42] text-left transition-colors cursor-pointer"
            >
              <ListPlus className="w-3.5 h-3.5 text-[#7AA2F7]" />
              <span>Add to Queue</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onToggleFavorite(track.id);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#292E42] text-left transition-colors cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-[#BB9AF7]" />
              <span>{track.isFavorite ? 'Unfavorite' : 'Favorite'}</span>
            </button>
            <div className="h-px bg-[#414868]/40 my-1"></div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`${track.title} - ${track.artist}`);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#292E42] text-left text-[#9AA5CE] transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Title</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
