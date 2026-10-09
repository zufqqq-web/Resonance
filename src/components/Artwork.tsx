import React from 'react';

interface ArtworkProps {
  artworkKey?: string;
  artworkUrl?: string;
  className?: string;
  alt?: string;
}

/**
 * High fidelity vector album art renderer.
 * STRICTLY NO GRADIENTS: uses layered solid colors from the TokyoNight palette.
 */
export const Artwork: React.FC<ArtworkProps> = ({
  artworkKey = 'midnight_drive',
  artworkUrl,
  className = 'w-full h-full',
  alt = 'Album Artwork',
}) => {
  if (artworkUrl) {
    return (
      <img
        src={artworkUrl}
        alt={alt}
        referrerPolicy="no-referrer"
        className={`object-cover ${className}`}
      />
    );
  }

  // Render solid color vector illustrations based on key
  switch (artworkKey) {
    case 'midnight_drive':
      return (
        <svg
          viewBox="0 0 200 200"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Solid Sky */}
          <rect width="200" height="200" fill="#1f2335" />
          {/* Violet Full Moon */}
          <circle cx="140" cy="55" r="28" fill="#bb9af7" />
          {/* Distant skyline */}
          <rect x="10" y="90" width="25" height="110" fill="#16161e" />
          <rect x="40" y="70" width="30" height="130" fill="#24283b" />
          <rect x="75" y="110" width="22" height="90" fill="#16161e" />
          <rect x="102" y="85" width="35" height="115" fill="#24283b" />
          <rect x="142" y="100" width="26" height="100" fill="#16161e" />
          <rect x="172" y="80" width="25" height="120" fill="#24283b" />
          {/* Windows / lights - solid dots */}
          <rect x="48" y="85" width="4" height="4" fill="#bb9af7" />
          <rect x="56" y="85" width="4" height="4" fill="#7aa2f7" />
          <rect x="48" y="100" width="4" height="4" fill="#ff9e64" />
          <rect x="56" y="100" width="4" height="4" fill="#bb9af7" />
          <rect x="110" y="95" width="5" height="5" fill="#7aa2f7" />
          <rect x="120" y="95" width="5" height="5" fill="#bb9af7" />
          <rect x="110" y="115" width="5" height="5" fill="#ff9e64" />
          <rect x="120" y="115" width="5" height="5" fill="#7aa2f7" />
          <rect x="180" y="92" width="4" height="4" fill="#ff9e64" />
          <rect x="180" y="108" width="4" height="4" fill="#bb9af7" />
          {/* Foreground bridge / road */}
          <polygon points="0,200 70,165 130,165 200,200" fill="#16161e" />
          <line x1="100" y1="165" x2="100" y2="200" stroke="#bb9af7" strokeWidth="2" strokeDasharray="6 6" />
        </svg>
      );

    case 'fragments':
      return (
        <svg
          viewBox="0 0 200 200"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Deep Navy Sea Sky */}
          <rect width="200" height="200" fill="#16161e" />
          {/* Sun in background */}
          <circle cx="150" cy="70" r="22" fill="#e0af68" />
          {/* Sea base */}
          <path d="M0 130 Q50 140 100 130 T200 135 L200 200 L0 200 Z" fill="#1a1b26" />
          {/* Great Wave back body */}
          <path d="M200 180 C130 180 90 120 70 80 C85 85 100 110 130 115 C100 90 85 60 40 40 C35 70 50 120 20 160 L0 170 L0 200 L200 200 Z" fill="#24283b" />
          {/* Mid wave layer */}
          <path d="M0 200 C30 150 60 120 110 110 C80 95 65 75 40 40 C30 55 25 90 0 130 Z" fill="#7aa2f7" />
          {/* Wave spray & claws - solid white/cyan accents */}
          <circle cx="40" cy="40" r="5" fill="#c0caf5" />
          <circle cx="32" cy="48" r="4" fill="#c0caf5" />
          <circle cx="50" cy="48" r="4" fill="#c0caf5" />
          <circle cx="62" cy="58" r="3" fill="#c0caf5" />
          <circle cx="78" cy="70" r="4" fill="#c0caf5" />
          <circle cx="95" cy="85" r="3" fill="#c0caf5" />
          <circle cx="115" cy="105" r="4" fill="#c0caf5" />
        </svg>
      );

    case 'bloom':
      return (
        <svg
          viewBox="0 0 200 200"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Soft dark surface */}
          <rect width="200" height="200" fill="#24283b" />
          {/* Solid cherry tree branches */}
          <path d="M0 120 Q50 90 110 110 T200 80" stroke="#16161e" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M80 102 Q100 60 130 40" stroke="#16161e" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M120 108 Q140 130 170 145" stroke="#16161e" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Sakura Blossoms - solid pink/violet petals */}
          {[
            { cx: 70, cy: 90, r: 16 },
            { cx: 120, cy: 50, r: 18 },
            { cx: 145, cy: 40, r: 14 },
            { cx: 165, cy: 80, r: 20 },
            { cx: 110, cy: 115, r: 15 },
            { cx: 150, cy: 135, r: 16 },
            { cx: 40, cy: 105, r: 12 },
          ].map((flower, i) => (
            <g key={i}>
              <circle cx={flower.cx - 6} cy={flower.cy - 6} r={flower.r * 0.45} fill="#f7768e" />
              <circle cx={flower.cx + 6} cy={flower.cy - 6} r={flower.r * 0.45} fill="#f7768e" />
              <circle cx={flower.cx - 6} cy={flower.cy + 6} r={flower.r * 0.45} fill="#f7768e" />
              <circle cx={flower.cx + 6} cy={flower.cy + 6} r={flower.r * 0.45} fill="#f7768e" />
              <circle cx={flower.cx} cy={flower.cy} r={flower.r * 0.3} fill="#bb9af7" />
              <circle cx={flower.cx} cy={flower.cy} r={flower.r * 0.15} fill="#ffffff" />
            </g>
          ))}
        </svg>
      );

    case 'neon_skies':
      return (
        <svg
          viewBox="0 0 200 200"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Tokyo Night Sky */}
          <rect width="200" height="200" fill="#16161e" />
          {/* Surrounding Buildings */}
          <rect x="15" y="80" width="40" height="120" fill="#1f2335" />
          <rect x="145" y="90" width="42" height="110" fill="#1f2335" />
          {/* Tokyo Tower Architecture */}
          {/* Spire */}
          <line x1="100" y1="20" x2="100" y2="70" stroke="#f7768e" strokeWidth="3" />
          <circle cx="100" cy="20" r="3" fill="#ff9e64" />
          {/* Upper deck */}
          <rect x="92" y="70" width="16" height="8" rx="2" fill="#f7768e" />
          {/* Mid lattice */}
          <polygon points="94,78 106,78 114,130 86,130" fill="#24283b" stroke="#f7768e" strokeWidth="2" />
          {/* Main observation deck */}
          <rect x="80" y="130" width="40" height="14" rx="2" fill="#ff9e64" />
          {/* Base legs */}
          <polygon points="84,144 70,200 90,200 95,144" fill="#f7768e" />
          <polygon points="116,144 130,200 110,200 105,144" fill="#f7768e" />
          {/* Central base arch */}
          <path d="M88 200 Q100 165 112 200 Z" fill="#16161e" />
          {/* Surrounding city sparkles */}
          <rect x="25" y="95" width="3" height="3" fill="#7aa2f7" />
          <rect x="35" y="110" width="3" height="3" fill="#bb9af7" />
          <rect x="25" y="130" width="3" height="3" fill="#7aa2f7" />
          <rect x="155" y="115" width="3" height="3" fill="#7aa2f7" />
          <rect x="170" y="135" width="3" height="3" fill="#bb9af7" />
        </svg>
      );

    case 'solstice':
      return (
        <svg
          viewBox="0 0 200 200"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Space void */}
          <rect width="200" height="200" fill="#16161e" />
          {/* Stars */}
          {[
            { cx: 30, cy: 35 }, { cx: 80, cy: 25 }, { cx: 170, cy: 40 },
            { cx: 160, cy: 160 }, { cx: 40, cy: 170 }, { cx: 185, cy: 110 },
            { cx: 20, cy: 95 }
          ].map((s, i) => (
            <circle key={i} cx={s.cx} cy={s.cy} r="1.5" fill="#c0caf5" />
          ))}
          {/* Corona Ring Rays - solid layered circles & flares */}
          <circle cx="100" cy="100" r="54" fill="#292e42" />
          <circle cx="100" cy="100" r="48" fill="#bb9af7" />
          <circle cx="100" cy="100" r="45" fill="#7aa2f7" />
          <circle cx="100" cy="100" r="42" fill="#c0caf5" />
          {/* Eclipse Moon Body (total blackness) */}
          <circle cx="100" cy="100" r="39" fill="#101118" />
          {/* Diamond ring prominence flare */}
          <circle cx="132" cy="72" r="5" fill="#ffffff" />
          <polygon points="132,60 135,72 144,72 136,76 139,88 132,80 125,88 128,76 120,72 129,72" fill="#bb9af7" />
        </svg>
      );

    case 'metamorphosis':
      return (
        <svg
          viewBox="0 0 200 200"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dark mystical forest background */}
          <rect width="200" height="200" fill="#1a1b26" />
          {/* Tree branch */}
          <path d="M10 190 Q90 140 190 120" stroke="#24283b" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M100 145 Q130 90 170 70" stroke="#24283b" strokeWidth="5" fill="none" strokeLinecap="round" />
          {/* Primary Butterfly */}
          <g transform="translate(100, 85) rotate(-15)">
            {/* Left Upper Wing */}
            <path d="M0 0 C-45 -50 -55 -20 -35 15 C-20 20 -5 10 0 0 Z" fill="#7aa2f7" />
            <path d="M-8 -10 C-35 -40 -45 -18 -28 10 Z" fill="#bb9af7" />
            {/* Left Lower Wing */}
            <path d="M0 5 C-30 15 -35 45 -15 45 C-5 45 0 25 0 5 Z" fill="#7dcfff" />
            {/* Right Upper Wing */}
            <path d="M0 0 C45 -50 55 -20 35 15 C20 20 5 10 0 0 Z" fill="#7aa2f7" />
            <path d="M8 -10 C35 -40 45 -18 28 10 Z" fill="#bb9af7" />
            {/* Right Lower Wing */}
            <path d="M0 5 C30 15 35 45 15 45 C5 45 0 25 0 5 Z" fill="#7dcfff" />
            {/* Body */}
            <ellipse cx="0" cy="5" rx="2.5" ry="16" fill="#16161e" />
          </g>
          {/* Small companion butterfly */}
          <g transform="translate(45, 60) scale(0.55) rotate(25)">
            <path d="M0 0 C-45 -50 -55 -20 -35 15 Z" fill="#7dcfff" />
            <path d="M0 0 C45 -50 55 -20 35 15 Z" fill="#7dcfff" />
            <ellipse cx="0" cy="5" rx="3" ry="14" fill="#16161e" />
          </g>
        </svg>
      );

    case 'echoes':
      return (
        <svg
          viewBox="0 0 200 200"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sky outside */}
          <rect width="200" height="200" fill="#24283b" />
          {/* Golden dusk horizon */}
          <rect x="0" y="90" width="200" height="110" fill="#1f2335" />
          <circle cx="100" cy="85" r="26" fill="#f7768e" />
          {/* Calm water bands */}
          <rect x="0" y="115" width="200" height="6" fill="#bb9af7" />
          <rect x="0" y="130" width="200" height="4" fill="#7aa2f7" />
          {/* Classical stone arch frame in foreground */}
          <path
            d="M0 0 L200 0 L200 200 L0 200 L0 180 L40 180 L40 100 Q40 40 100 40 Q160 40 160 100 L160 180 L0 180 Z"
            fill="#16161e"
          />
          {/* Arch inner molding */}
          <path
            d="M50 180 L50 105 Q50 55 100 55 Q150 55 150 105 L150 180"
            stroke="#292e42"
            strokeWidth="4"
            fill="none"
          />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 200 200"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="200" height="200" fill="#1f2335" />
          <circle cx="100" cy="100" r="50" fill="#bb9af7" />
          <circle cx="100" cy="100" r="20" fill="#16161e" />
        </svg>
      );
  }
};
