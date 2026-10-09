import React from 'react';
import { Home, Music2, ListMusic, Heart, Settings } from 'lucide-react';
import { NavSection } from '../types/music';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  favoriteCount: number;
  playlistCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  favoriteCount,
}) => {
  const navItems = [
    { id: 'home' as NavSection, label: 'Home', icon: Home },
    { id: 'library' as NavSection, label: 'Library', icon: Music2 },
    { id: 'playlists' as NavSection, label: 'Playlists', icon: ListMusic },
    { id: 'favorites' as NavSection, label: 'Favorites', icon: Heart, badge: favoriteCount },
    { id: 'settings' as NavSection, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 shrink-0 h-full glass-sidebar flex flex-col justify-between p-5 select-none z-20">
      <div className="flex flex-col gap-8">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3 px-2 pt-1">
          {/* Soundwave Logo Icon */}
          <div className="w-9 h-9 rounded-xl bg-[#24283B] flex items-center justify-center gap-0.5 border border-[#414868]/40 shrink-0">
            <span className="w-0.5 h-3 bg-[#BB9AF7] rounded-full inline-block"></span>
            <span className="w-0.5 h-5 bg-[#BB9AF7] rounded-full inline-block"></span>
            <span className="w-0.5 h-3.5 bg-[#7AA2F7] rounded-full inline-block"></span>
            <span className="w-0.5 h-2 bg-[#BB9AF7] rounded-full inline-block"></span>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold tracking-tight text-[#C0CAF5] leading-none">
              Resonance
            </span>
            <span className="text-[11px] text-[#565F89] mt-1 font-normal truncate">
              Music for a calmer you
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#24283B] text-[#BB9AF7] border border-[#BB9AF7]/25 shadow-sm'
                    : 'text-[#9AA5CE] hover:text-[#C0CAF5] hover:bg-[#1A1B26]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#BB9AF7]' : 'text-[#9AA5CE]'
                    }`}
                  />
                  <span className="tracking-wide text-[13px]">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[11px] font-mono tabular-nums px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? 'bg-[#BB9AF7]/20 text-[#BB9AF7]'
                        : 'bg-[#24283B] text-[#565F89]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Desktop App Status & Tauri Integration Note */}
      <div className="p-3 rounded-xl bg-[#1A1B26]/80 border border-[#414868]/30 text-xs">
        <div className="flex items-center justify-between text-[#9AA5CE] mb-1">
          <span className="text-[11px] font-medium">Tauri Desktop</span>
          <span className="text-[10px] font-mono text-[#7AA2F7]">v2.0 Ready</span>
        </div>
        <p className="text-[10.5px] text-[#565F89] leading-tight">
          Native window blur & transparent surface active.
        </p>
      </div>
    </aside>
  );
};
