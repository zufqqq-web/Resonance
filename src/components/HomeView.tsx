import React from 'react';
import { Play, Sparkles, Disc, Radio } from 'lucide-react';
import { Track, Album } from '../types/music';
import { Artwork } from './Artwork';

interface HomeViewProps {
  tracks: Track[];
  albums: Album[];
  onPlayTrack: (track: Track) => void;
  onGoToLibrary: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  tracks,
  albums,
  onPlayTrack,
  onGoToLibrary,
}) => {
  const featuredTrack = tracks[0] || null;

  return (
    <div className="flex-1 flex flex-col px-8 pt-6 pb-28 overflow-y-auto">
      {/* Welcome header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#C0CAF5]">Welcome to Resonance</h1>
          <p className="text-[13px] text-[#565F89] mt-0.5">Late night chill electronic & ambient soundscapes</p>
        </div>

        <button
          type="button"
          onClick={onGoToLibrary}
          className="px-3.5 py-1.5 rounded-xl bg-[#24283B] hover:bg-[#292E42] text-xs font-semibold text-[#BB9AF7] border border-[#BB9AF7]/30 transition-colors"
        >
          Open Full Library
        </button>
      </div>

      {/* Featured Banner Card (Solid background, zero gradients!) */}
      {featuredTrack && (
        <div className="relative rounded-3xl bg-[#24283B] border border-[#414868]/40 p-6 mb-8 flex flex-col md:flex-row items-center gap-6 shadow-xl">
          <div className="w-36 h-36 rounded-2xl overflow-hidden shrink-0 bg-[#16161E] shadow-2xl border border-[#414868]/40">
            <Artwork
              artworkKey={featuredTrack.artworkKey}
              artworkUrl={featuredTrack.artworkUrl}
              className="w-full h-full object-cover"
              alt={featuredTrack.title}
            />
          </div>

          <div className="flex-1 flex flex-col items-start min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#BB9AF7] bg-[#BB9AF7]/15 px-2 py-0.5 rounded-md">
                Featured Record
              </span>
              <span className="text-[11px] text-[#565F89]">·</span>
              <span className="text-[11px] text-[#9AA5CE]">TokyoNight Chill Collection</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1 truncate w-full">
              {featuredTrack.title}
            </h2>
            <p className="text-sm text-[#9AA5CE] mb-4">
              By {featuredTrack.artist} — {featuredTrack.album} ({featuredTrack.genre || 'Electronic'})
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onPlayTrack(featuredTrack)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#BB9AF7] hover:bg-[#cbb2f9] text-[#16161E] font-semibold text-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play Track</span>
              </button>

              <button
                type="button"
                onClick={onGoToLibrary}
                className="px-4 py-2 rounded-xl bg-[#16161E]/80 hover:bg-[#16161E] text-[#C0CAF5] text-xs font-medium border border-[#414868]/40 transition-colors"
              >
                Explore More
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Albums Row */}
      <div className="flex flex-col mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#C0CAF5]">
            <Disc className="w-4 h-4 text-[#7AA2F7]" />
            <span>Essential Albums</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {albums.slice(0, 4).map((alb) => (
            <div
              key={alb.id}
              onClick={onGoToLibrary}
              className="p-3 rounded-2xl bg-[#1A1B26]/60 hover:bg-[#24283B] border border-[#414868]/30 transition-all cursor-pointer flex flex-col gap-2.5"
            >
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#16161E]">
                <Artwork
                  artworkKey={alb.artworkKey}
                  artworkUrl={alb.artworkUrl}
                  className="w-full h-full object-cover"
                  alt={alb.title}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#C0CAF5] truncate">{alb.title}</span>
                <span className="text-[11px] text-[#565F89] truncate">{alb.artist}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Mixes / Soundscapes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-[#16161E]/80 border border-[#414868]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#24283B] flex items-center justify-center border border-[#414868]/40">
              <Sparkles className="w-5 h-5 text-[#BB9AF7]" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#C0CAF5]">Synthesizer Station</h4>
              <p className="text-[11px] text-[#565F89]">Procedural analog arpeggios & warm pads</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => tracks[0] && onPlayTrack(tracks[0])}
            className="w-8 h-8 rounded-full bg-[#24283B] hover:bg-[#BB9AF7] hover:text-[#16161E] text-[#BB9AF7] flex items-center justify-center transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-[#16161E]/80 border border-[#414868]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#24283B] flex items-center justify-center border border-[#414868]/40">
              <Radio className="w-5 h-5 text-[#7AA2F7]" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#C0CAF5]">Night Cosmic Station</h4>
              <p className="text-[11px] text-[#565F89]">Sub-bass pulses and deep resonant space drone</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => tracks[4] && onPlayTrack(tracks[4])}
            className="w-8 h-8 rounded-full bg-[#24283B] hover:bg-[#7AA2F7] hover:text-[#16161E] text-[#7AA2F7] flex items-center justify-center transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
