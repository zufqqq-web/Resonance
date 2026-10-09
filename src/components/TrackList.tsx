import React from 'react';
import { Clock, Heart, Music } from 'lucide-react';
import { Track } from '../types/music';
import { TrackRow } from './TrackRow';

interface TrackListProps {
  tracks: Track[];
  currentTrackId?: string;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
  onAddToQueue: (track: Track) => void;
  onPlayNext: (track: Track) => void;
  onImportClick?: () => void;
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onToggleFavorite,
  onAddToQueue,
  onPlayNext,
  onImportClick,
}) => {
  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-[#565F89]">
        <div className="w-12 h-12 rounded-2xl bg-[#24283B] flex items-center justify-center mb-3">
          <Music className="w-6 h-6 text-[#9AA5CE]" />
        </div>
        <p className="text-sm font-medium text-[#C0CAF5]">No songs in library</p>
        <p className="text-xs text-[#565F89] mt-1 max-w-sm">
          Drag and drop MP3, WAV, OGG, or FLAC files directly here or click Import Audio above.
        </p>
        <p className="text-[11px] text-[#565F89]/80 mt-1 max-w-sm italic">
          Files are played in-memory and must be re-imported after a browser refresh.
        </p>
        {onImportClick && (
          <button
            type="button"
            onClick={onImportClick}
            className="mt-4 px-4 py-2 rounded-xl bg-[#24283B] hover:bg-[#292E42] text-xs font-semibold text-[#BB9AF7] border border-[#BB9AF7]/40 transition-colors cursor-pointer"
          >
            Select Audio Files
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Table Header matching reference image */}
      <div className="grid grid-cols-[36px_minmax(180px,2fr)_minmax(120px,1.2fr)_minmax(120px,1.2fr)_70px_36px_36px] items-center px-4 py-2 border-b border-[#414868]/30 text-[11px] font-medium text-[#565F89] tracking-wider uppercase select-none">
        <div className="text-center">#</div>
        <div>Title</div>
        <div>Artist</div>
        <div>Album</div>
        <div className="flex justify-end pr-3">
          <Clock className="w-3.5 h-3.5" />
        </div>
        <div className="flex justify-center">
          <Heart className="w-3.5 h-3.5" />
        </div>
        <div></div>
      </div>

      {/* Track Rows */}
      <div className="flex flex-col gap-0.5 mt-1">
        {tracks.map((track, idx) => (
          <TrackRow
            key={track.id}
            track={track}
            index={idx}
            isCurrentTrack={track.id === currentTrackId}
            isPlaying={isPlaying}
            onPlayTrack={onPlayTrack}
            onToggleFavorite={onToggleFavorite}
            onAddToQueue={onAddToQueue}
            onPlayNext={onPlayNext}
          />
        ))}
      </div>
    </div>
  );
};
