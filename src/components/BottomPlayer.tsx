import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  ListMusic,
} from 'lucide-react';
import { Track, RepeatMode } from '../types/music';
import { Artwork } from './Artwork';
import { AudioVisualizer } from './AudioVisualizer';

interface BottomPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  visualizerBars?: number;
  accentColor?: string;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onToggleFavorite: (trackId: string) => void;
  onToggleQueue: () => void;
  isQueueOpen?: boolean;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const BottomPlayer: React.FC<BottomPlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  repeatMode,
  visualizerBars = 20,
  accentColor = '#BB9AF7',
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onCycleRepeat,
  onToggleFavorite,
  onToggleQueue,
  isQueueOpen = false,
}) => {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const scrubValueRef = useRef(scrubValue);
  scrubValueRef.current = scrubValue;

  const activeTime = isScrubbing ? scrubValue : currentTime;
  const progressPercent = duration > 0 ? Math.min(100, (activeTime / duration) * 100) : 0;
  const effectiveVolume = isMuted ? 0 : volume;

  useEffect(() => {
    if (!isScrubbing) return;
    const handleGlobalEnd = () => {
      setIsScrubbing(false);
      onSeek(scrubValueRef.current);
    };
    window.addEventListener('mouseup', handleGlobalEnd);
    window.addEventListener('touchend', handleGlobalEnd);
    return () => {
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isScrubbing, onSeek]);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrubValue(val);
  };

  const handleSeekStart = () => {
    setIsScrubbing(true);
    setScrubValue(currentTime);
  };

  const handleSeekEnd = () => {
    if (isScrubbing) {
      setIsScrubbing(false);
      onSeek(scrubValue);
    }
  };

  return (
    <footer className="fixed bottom-3 left-4 right-4 md:left-6 md:right-6 h-20 rounded-2xl glass-dock px-5 flex items-center justify-between z-40 select-none shadow-2xl border border-[rgba(192,202,245,0.15)]">
      {/* 1. Left Section: Artwork + Title + Artist + Favorite */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[200px]">
        {currentTrack ? (
          <>
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#16161E] shadow-md border border-[#414868]/40">
              <Artwork
                artworkKey={currentTrack.artworkKey}
                artworkUrl={currentTrack.artworkUrl}
                className="w-full h-full object-cover"
                alt={currentTrack.title}
              />
            </div>
            <div className="flex flex-col min-w-0 pr-1">
              <h4 className="text-[13.5px] font-semibold text-[#C0CAF5] truncate leading-tight">
                {currentTrack.title}
              </h4>
              <p className="text-[11.5px] text-[#9AA5CE] truncate mt-0.5">
                {currentTrack.artist}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggleFavorite(currentTrack.id)}
              title={currentTrack.isFavorite ? 'Favorited' : 'Favorite'}
              className="p-1 rounded-md text-[#565F89] hover:text-[#BB9AF7] transition-colors ml-1 shrink-0"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  currentTrack.isFavorite ? 'fill-[#BB9AF7] text-[#BB9AF7]' : 'text-[#565F89]'
                }`}
              />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3 text-[#565F89] text-xs">
            <div className="w-12 h-12 rounded-xl bg-[#24283B] flex items-center justify-center border border-[#414868]/20">
              <ListMusic className="w-5 h-5 text-[#565F89]" />
            </div>
            <span>No track selected</span>
          </div>
        )}
      </div>

      {/* 2. Center Section: Playback Controls & Scrubber */}
      <div className="flex-1 max-w-xl px-4 flex flex-col items-center gap-1.5">
        {/* Buttons Row */}
        <div className="flex items-center gap-4">
          {/* Shuffle */}
          <button
            type="button"
            onClick={onToggleShuffle}
            title={isShuffle ? 'Shuffle Enabled' : 'Shuffle Disabled'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isShuffle ? 'text-[#BB9AF7]' : 'text-[#565F89] hover:text-[#C0CAF5]'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous */}
          <button
            type="button"
            onClick={onPrevious}
            title="Previous Track"
            className="p-1.5 rounded-lg text-[#9AA5CE] hover:text-[#C0CAF5] transition-colors cursor-pointer active:scale-95"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          {/* Play / Pause - Solid Purple Pill/Circle matching reference image */}
          <button
            type="button"
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            className="w-10 h-10 rounded-full bg-[#BB9AF7] hover:bg-[#cbb2f9] text-[#16161E] flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-[#16161E]" />
            ) : (
              <Play className="w-4 h-4 fill-[#16161E] ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            type="button"
            onClick={onNext}
            title="Next Track"
            className="p-1.5 rounded-lg text-[#9AA5CE] hover:text-[#C0CAF5] transition-colors cursor-pointer active:scale-95"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          {/* Repeat */}
          <button
            type="button"
            onClick={onCycleRepeat}
            title={`Repeat: ${repeatMode}`}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${
              repeatMode !== 'off' ? 'text-[#BB9AF7]' : 'text-[#565F89] hover:text-[#C0CAF5]'
            }`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
            {repeatMode !== 'off' && (
              <span className="absolute bottom-0 right-1 w-1 h-1 bg-[#BB9AF7] rounded-full"></span>
            )}
          </button>
        </div>

        {/* Scrubber Progress Bar Row */}
        <div className="w-full flex items-center gap-3 text-[11px] font-mono tabular-nums text-[#565F89]">
          <span className="w-9 text-right">{formatTime(activeTime)}</span>

          <div className="relative flex-1 flex items-center group py-1 cursor-pointer">
            {/* Background Track - Solid Color */}
            <div className="w-full h-1 bg-[#24283B] rounded-full overflow-hidden">
              {/* Active Track - Solid Color */}
              <div
                className="h-full bg-[#BB9AF7] rounded-full transition-all duration-75"
                style={{ width: `${currentTrack && duration > 0 ? progressPercent : 0}%` }}
              />
            </div>

            {/* Native range input for accessible seeking */}
            <input
              type="range"
              min={0}
              max={duration > 0 ? duration : 100}
              step={0.5}
              disabled={!currentTrack || duration <= 0}
              value={currentTrack ? activeTime : 0}
              onChange={handleSeekChange}
              onMouseDown={handleSeekStart}
              onMouseUp={handleSeekEnd}
              onTouchStart={handleSeekStart}
              onTouchEnd={handleSeekEnd}
              className={`absolute inset-0 w-full opacity-0 ${
                currentTrack && duration > 0 ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
            />

            {/* Custom Thumb - Solid White */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-md pointer-events-none transition-transform group-hover:scale-125"
              style={{ left: `${currentTrack && duration > 0 ? progressPercent : 0}%` }}
            />
          </div>

          <span className="w-9">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Right Section: CAVA Visualizer + Volume + Queue */}
      <div className="flex items-center justify-end gap-4 w-1/4 min-w-[200px]">
        {/* Real-time CAVA Visualizer Canvas matching reference image */}
        <div className="hidden sm:flex items-center px-2 py-1 rounded-lg bg-[#16161E]/50 border border-[#414868]/30">
          <AudioVisualizer
            isPlaying={isPlaying}
            barCount={visualizerBars}
            barColor={accentColor}
            className="w-24 h-6"
          />
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="p-1 rounded-md text-[#565F89] hover:text-[#C0CAF5] transition-colors cursor-pointer"
          >
            {isMuted || effectiveVolume === 0 ? (
              <VolumeX className="w-4 h-4 text-[#F7768E]" />
            ) : effectiveVolume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          {/* Volume Slider */}
          <div className="relative w-16 md:w-20 flex items-center group py-1">
            <div className="w-full h-1 bg-[#24283B] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7AA2F7] rounded-full"
                style={{ width: `${effectiveVolume * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={effectiveVolume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Playback Queue Drawer Button */}
        <button
          type="button"
          onClick={onToggleQueue}
          title="Playback Queue"
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isQueueOpen
              ? 'bg-[#24283B] text-[#BB9AF7] border border-[#BB9AF7]/30'
              : 'text-[#9AA5CE] hover:text-[#C0CAF5] hover:bg-[#24283B]/50'
          }`}
        >
          <ListMusic className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};
