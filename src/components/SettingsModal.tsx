import React from 'react';
import { Sliders, Eye, Palette, Activity, Info, X } from 'lucide-react';
import { ThemeSettings } from '../types/music';

interface SettingsModalProps {
  settings: ThemeSettings;
  onUpdateSettings: (newSettings: Partial<ThemeSettings>) => void;
  onClose?: () => void;
  isModal?: boolean;
}

const ACCENT_COLORS = [
  { name: 'TokyoNight Purple', color: '#BB9AF7', secondary: '#7AA2F7' },
  { name: 'TokyoNight Blue', color: '#7AA2F7', secondary: '#BB9AF7' },
  { name: 'Cyan Sky', color: '#7DCFFF', secondary: '#7AA2F7' },
  { name: 'Emerald Forest', color: '#9ECE6A', secondary: '#73daca' },
  { name: 'Sunset Coral', color: '#F7768E', secondary: '#ff9e64' },
  { name: 'Golden Amber', color: '#E0AF68', secondary: '#f7768e' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  isModal = false,
}) => {
  return (
    <div className={`flex flex-col ${isModal ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60' : 'flex-1 px-8 pt-6 pb-28 overflow-y-auto'}`}>
      <div className={`w-full max-w-2xl rounded-3xl glass-surface p-7 border border-[#414868]/40 shadow-2xl flex flex-col gap-6 select-none ${isModal ? 'max-h-[90vh] overflow-y-auto' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#414868]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#24283B] flex items-center justify-center border border-[#414868]/40">
              <Sliders className="w-5 h-5 text-[#BB9AF7]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#C0CAF5]">Settings & Appearance</h2>
              <p className="text-xs text-[#565F89]">Configure desktop transparency, theme colors, and audio engine</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#565F89] hover:text-[#C0CAF5] hover:bg-[#24283B] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Section 1: Glass Transparency & Window Blur */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#C0CAF5]">
            <Eye className="w-4 h-4 text-[#7AA2F7]" />
            <span>Window Transparency & Blur</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opacity slider */}
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[#16161E]/70 border border-[#414868]/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9AA5CE]">Background Opacity</span>
                <span className="font-mono text-[#BB9AF7]">{Math.round(settings.backgroundOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.4}
                max={1.0}
                step={0.02}
                value={settings.backgroundOpacity}
                onChange={(e) => onUpdateSettings({ backgroundOpacity: parseFloat(e.target.value) })}
                className="w-full accent-[#BB9AF7] cursor-pointer"
              />
              <span className="text-[10.5px] text-[#565F89]">
                Adjusts solid background translucency for OS desktop passthrough.
              </span>
            </div>

            {/* Blur Intensity */}
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[#16161E]/70 border border-[#414868]/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9AA5CE]">Backdrop Blur</span>
                <span className="font-mono text-[#7AA2F7]">{settings.blurIntensity}px</span>
              </div>
              <input
                type="range"
                min={8}
                max={48}
                step={2}
                value={settings.blurIntensity}
                onChange={(e) => onUpdateSettings({ blurIntensity: parseInt(e.target.value, 10) })}
                className="w-full accent-[#7AA2F7] cursor-pointer"
              />
              <span className="text-[10.5px] text-[#565F89]">
                Hardware accelerated backdrop filter blur depth.
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Accent Color Selector */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#C0CAF5]">
            <Palette className="w-4 h-4 text-[#BB9AF7]" />
            <span>Solid Accent Color (Zero Gradients)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {ACCENT_COLORS.map((item) => {
              const isSelected = settings.accentColor === item.color;
              return (
                <button
                  key={item.color}
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      accentColor: item.color,
                      secondaryAccentColor: item.secondary,
                    })
                  }
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all border text-left cursor-pointer ${
                    isSelected
                      ? 'bg-[#24283B] border-[#C0CAF5] shadow-sm'
                      : 'bg-[#16161E]/60 border-[#414868]/30 hover:bg-[#24283B]/50'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full shrink-0 shadow-sm border border-black/20"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-[#C0CAF5] truncate">{item.name}</span>
                    <span className="text-[10px] font-mono text-[#565F89]">{item.color}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: CAVA Visualizer & Audio Config */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#C0CAF5]">
            <Activity className="w-4 h-4 text-[#7AA2F7]" />
            <span>CAVA Spectrum Visualizer Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bar Count */}
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[#16161E]/70 border border-[#414868]/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9AA5CE]">Number of Visualizer Bars</span>
                <span className="font-mono text-[#BB9AF7]">{settings.visualizerBars} bars</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {[16, 20, 24, 28, 32].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onUpdateSettings({ visualizerBars: num })}
                    className={`flex-1 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                      settings.visualizerBars === num
                        ? 'bg-[#BB9AF7] text-[#16161E] font-bold'
                        : 'bg-[#24283B] text-[#9AA5CE] hover:text-[#C0CAF5]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Smoothing */}
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[#16161E]/70 border border-[#414868]/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9AA5CE]">Frequency Smoothing Constant</span>
                <span className="font-mono text-[#7AA2F7]">{settings.smoothingTimeConstant}</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={0.95}
                step={0.05}
                value={settings.smoothingTimeConstant}
                onChange={(e) => onUpdateSettings({ smoothingTimeConstant: parseFloat(e.target.value) })}
                className="w-full accent-[#7AA2F7] cursor-pointer"
              />
              <span className="text-[10.5px] text-[#565F89]">
                Higher smoothing gives smoother fluid motion; lower reacts snappier to kicks.
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Tauri 2 Desktop Transparent Window Architecture */}
        <div className="p-4 rounded-2xl bg-[#16161E]/80 border border-[#414868]/40 flex items-start gap-3 text-xs">
          <Info className="w-5 h-5 text-[#7AA2F7] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-[#9AA5CE]">
            <span className="font-semibold text-[#C0CAF5]">Tauri 2 Native Desktop Window Architecture</span>
            <p className="text-[11px] leading-relaxed text-[#565F89]">
              This application is configured for Tauri 2 transparent multi-platform desktop deployment. In <code className="text-[#BB9AF7]">tauri.conf.json</code>, setting <code className="text-[#BB9AF7]">&quot;transparent&quot;: true</code> and <code className="text-[#BB9AF7]">&quot;decorations&quot;: false</code> enables hardware blur directly over macOS and Windows desktops with zero simulated wallpapers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
