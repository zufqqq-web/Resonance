import React from 'react';
import { Play } from 'lucide-react';
import { Album } from '../types/music';
import { Artwork } from './Artwork';

interface AlbumCardProps {
  album: Album;
  isPlaying?: boolean;
  onPlayAlbum: (album: Album) => void;
  onSelectAlbum?: (album: Album) => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  isPlaying = false,
  onPlayAlbum,
  onSelectAlbum,
}) => {
  return (
    <div
      onClick={() => onSelectAlbum?.(album)}
      className="group relative flex flex-col gap-2.5 p-2.5 rounded-2xl bg-[#1A1B26]/40 hover:bg-[#24283B]/60 border border-transparent hover:border-[#414868]/40 transition-all cursor-pointer w-full max-w-[170px] shrink-0"
    >
      {/* Artwork container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#16161E] shadow-md border border-[#414868]/30">
        <Artwork
          artworkKey={album.artworkKey}
          artworkUrl={album.artworkUrl}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          alt={album.title}
        />

        {/* Hover play button */}
        <div className="absolute inset-0 bg-[#16161E]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlayAlbum(album);
            }}
            title={`Play ${album.title}`}
            className="w-10 h-10 rounded-full bg-[#BB9AF7] text-[#16161E] flex items-center justify-center shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform cursor-pointer hover:scale-105 active:scale-95"
          >
            <Play className="w-5 h-5 fill-[#16161E] ml-0.5" />
          </button>
        </div>

        {isPlaying && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-[#16161E]/80 border border-[#BB9AF7]/40 flex items-center gap-1">
            <span className="w-1 h-3 bg-[#BB9AF7] rounded-full animate-pulse"></span>
            <span className="w-1 h-4 bg-[#7AA2F7] rounded-full animate-pulse delay-75"></span>
            <span className="w-1 h-2 bg-[#BB9AF7] rounded-full animate-pulse delay-150"></span>
          </div>
        )}
      </div>

      {/* Info text */}
      <div className="flex flex-col min-w-0 px-0.5">
        <h4 className="text-[13px] font-semibold text-[#C0CAF5] truncate group-hover:text-white transition-colors leading-tight">
          {album.title}
        </h4>
        <p className="text-[11.5px] text-[#9AA5CE] truncate mt-0.5">
          {album.artist}
        </p>
      </div>
    </div>
  );
};
