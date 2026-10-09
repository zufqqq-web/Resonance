import React from 'react';
import { X, Trash2, Music } from 'lucide-react';
import { Track } from '../types/music';
import { Artwork } from './Artwork';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Track[];
  currentTrack: Track | null;
  onPlayTrack: (track: Track) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  isOpen,
  onClose,
  queue,
  currentTrack,
  onPlayTrack,
  onRemoveFromQueue,
  onClearQueue,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 glass-dock shadow-2xl z-50 flex flex-col p-5 border-l border-[#414868]/40 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#414868]/30 select-none">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-[#BB9AF7]" />
          <h3 className="text-sm font-semibold text-[#C0CAF5]">Playback Queue</h3>
          <span className="text-xs font-mono text-[#565F89]">({queue.length})</span>
        </div>

        <div className="flex items-center gap-1">
          {queue.length > 0 && (
            <button
              type="button"
              onClick={onClearQueue}
              title="Clear queue"
              className="p-1.5 rounded-lg text-[#565F89] hover:text-[#F7768E] hover:bg-[#24283B] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#565F89] hover:text-[#C0CAF5] hover:bg-[#24283B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Now Playing preview */}
      {currentTrack && (
        <div className="py-4 border-b border-[#414868]/30">
          <span className="text-[11px] font-medium text-[#565F89] uppercase tracking-wider block mb-2">
            Now Playing
          </span>
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#24283B]/70 border border-[#BB9AF7]/20">
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#16161E]">
              <Artwork
                artworkKey={currentTrack.artworkKey}
                artworkUrl={currentTrack.artworkUrl}
                className="w-full h-full object-cover"
                alt={currentTrack.title}
              />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-[#C0CAF5] truncate">
                {currentTrack.title}
              </span>
              <span className="text-[11px] text-[#9AA5CE] truncate">
                {currentTrack.artist}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-[#565F89] uppercase tracking-wider block mb-1">
          Next Up
        </span>

        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-[#565F89]">
            <p className="text-xs">Queue is empty</p>
            <p className="text-[11px] text-[#565F89] mt-0.5">
              Click &quot;...&quot; on any track to add it here.
            </p>
          </div>
        ) : (
          queue.map((track, idx) => (
            <div
              key={`${track.id}-${idx}`}
              onClick={() => onPlayTrack(track)}
              className="group flex items-center justify-between p-2 rounded-xl hover:bg-[#24283B]/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="text-[11px] font-mono text-[#565F89] w-4 text-center">
                  {idx + 1}
                </span>
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-[#16161E]">
                  <Artwork
                    artworkKey={track.artworkKey}
                    artworkUrl={track.artworkUrl}
                    className="w-full h-full object-cover"
                    alt={track.title}
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-medium text-[#C0CAF5] truncate group-hover:text-white">
                    {track.title}
                  </span>
                  <span className="text-[11px] text-[#565F89] truncate">
                    {track.artist}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-[#565F89]">
                  {track.durationFormatted}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromQueue(idx);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-[#F7768E] transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
