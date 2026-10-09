import React, { useRef } from 'react';
import { Search, FolderPlus, Minus, Square, X } from 'lucide-react';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onImportFiles: (files: FileList) => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  onImportFiles,
  isMaximized = false,
  onToggleMaximize,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportFiles(e.target.files);
      // Reset so same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 z-20 border-b border-[#414868]/20 select-none">
      {/* Left empty spacer to align with sidebar */}
      <div className="w-12 md:w-24"></div>

      {/* Center: Search Field matching reference image */}
      <div className="flex-1 max-w-lg mx-auto relative flex items-center">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#565F89] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search songs, artists, albums..."
            className="w-full h-9 pl-11 pr-4 rounded-full bg-[#24283B]/70 hover:bg-[#24283B] focus:bg-[#24283B] text-[13px] text-[#C0CAF5] placeholder-[#565F89] border border-[#414868]/40 focus:border-[#BB9AF7]/60 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#565F89] hover:text-[#C0CAF5]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: Import Action + Window Controls */}
      <div className="flex items-center gap-4">
        {/* Hidden native file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Import local audio files (MP3, WAV, OGG, FLAC)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#24283B]/80 hover:bg-[#292E42] text-[12px] font-medium text-[#C0CAF5] border border-[#414868]/40 transition-colors cursor-pointer"
        >
          <FolderPlus className="w-3.5 h-3.5 text-[#BB9AF7]" />
          <span className="hidden sm:inline">Import Audio</span>
        </button>

        {/* Desktop Window Controls matching reference image */}
        <div className="flex items-center gap-1 ml-2">
          <button
            type="button"
            title="Minimize"
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#24283B] text-[#9AA5CE] hover:text-[#C0CAF5] transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onToggleMaximize}
            title={isMaximized ? 'Restore' : 'Maximize'}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#24283B] text-[#9AA5CE] hover:text-[#C0CAF5] transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            type="button"
            title="Close"
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F7768E]/20 text-[#9AA5CE] hover:text-[#F7768E] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
