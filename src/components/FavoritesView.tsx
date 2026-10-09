import React from 'react';
import { Heart, Play } from 'lucide-react';
import { Track } from '../types/music';
import { TrackList } from './TrackList';

interface FavoritesViewProps {
  tracks: Track[];
  currentTrackId?: string;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
  onAddToQueue: (track: Track) => void;
  onPlayNext: (track: Track) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onToggleFavorite,
  onAddToQueue,
  onPlayNext,
}) => {
  const favoriteTracks = tracks.filter((t) => t.isFavorite);

  return (
    <div className="flex-1 flex flex-col px-8 pt-6 pb-28 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#C0CAF5]">Favorites</h1>
          <p className="text-[13px] text-[#565F89] mt-0.5">
            Songs you&apos;ve loved and saved to your heart collection
          </p>
        </div>

        {favoriteTracks.length > 0 && (
          <button
            type="button"
            onClick={() => onPlayTrack(favoriteTracks[0])}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#BB9AF7] hover:bg-[#cbb2f9] text-[#16161E] font-semibold text-xs transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>Play All Favorites</span>
          </button>
        )}
      </div>

      {favoriteTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#24283B] flex items-center justify-center mb-3 border border-[#414868]/40">
            <Heart className="w-6 h-6 text-[#565F89]" />
          </div>
          <h3 className="text-base font-semibold text-[#C0CAF5]">No favorites yet</h3>
          <p className="text-xs text-[#565F89] mt-1 max-w-sm">
            Click the heart icon on any song in your Library to quickly save it here.
          </p>
        </div>
      ) : (
        <TrackList
          tracks={favoriteTracks}
          currentTrackId={currentTrackId}
          isPlaying={isPlaying}
          onPlayTrack={onPlayTrack}
          onToggleFavorite={onToggleFavorite}
          onAddToQueue={onAddToQueue}
          onPlayNext={onPlayNext}
        />
      )}
    </div>
  );
};
