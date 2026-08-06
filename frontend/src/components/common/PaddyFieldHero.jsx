import { useId } from 'react';

/**
 * Animated dawn-over-paddy-field scene: rising sun, distant hills,
 * a farmer bending to plant with a mamotty (hoe), a swaying scarecrow,
 * drifting birds, and rippling grass. Pure SVG + CSS animation, no JS timers.
 *
 * Figures are built from simple, sturdy primitives (circles, rotated
 * ellipses, thick round-cap strokes) rather than fine bezier outlines,
 * and are drawn LAST so grass/hills never paint over them.
 */
export default function PaddyFieldHero({ className = '' }) {
  const uid = useId().replace(/:/g, '');

  const grassRows = Array.from({ length: 34 }, (_, i) => {
    const x = 8 + i * 24 + (i % 2 === 0 ? 4 : 0);
    const h = 20 + ((i * 7) % 12);
    const tone = i % 3 === 0 ? '#dff29b' : i % 3 === 1 ? '#8fd17a' : '#4f9a5c';
    const delay = (i % 8) * 0.18;
    const dur = 2.6 + (i % 5) * 0.25;
    return { x, h, tone, delay, dur, key: `g-${i}` };
  });

  const birds = [
    { top: 20, delay: 0, dur: 16, scale: 1 },
    { top: 34, delay: 3.5, dur: 19, scale: 0.75 },
    { top: 14, delay: 8, dur: 21, scale: 0.6 },
  ];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 800 260"
        preserveAspectRatio="xMidYMax slice"
        className="h-full w-full"
        role="img"
        aria-label="Illustration of a farmer working with a mamotty at sunrise, beside a scarecrow, birds overhead"
      >
        <defs>
          <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16233a" />
            <stop offset="45%" stopColor="#5a4a6b" />
            <stop offset="72%" stopColor="#e08a4f" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
          <radialGradient id={`sun-glow-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff3c4" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#f4b860" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f4b860" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`fade-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#064e3b" stopOpacity="0" />
            <stop offset="100%" stopColor="#064e3b" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="800" height="260" fill={`url(#sky-${uid})`} />

        {/* Sun - kept upper-left-of-center, away from the figures */}
        <g className={`pfh-sun-${uid}`} style={{ transformOrigin: '540px 85px' }}>
          <circle cx="540" cy="85" r="62" fill={`url(#sun-glow-${uid})`} />
          <circle cx="540" cy="85" r="24" fill="#ffe9a8" />
        </g>

        {/* Birds */}
        {birds.map((b, i) => (
          <g
            key={`bird-${i}`}
            className={`pfh-bird-${uid}`}
            style={{
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.dur}s`,
              '--pfh-y': `${b.top}px`,
              '--pfh-s': b.scale,
            }}
          >
            <path
              d="M0 0 Q 8 -8 16 0 Q 8 -4 0 0 Z M16 0 Q 24 -8 32 0 Q 24 -4 16 0 Z"
              fill="none"
              stroke="#0b1c22"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Distant hills */}
        <path d="M0 190 Q 120 160 260 185 T 520 178 T 800 190 V 260 H 0 Z" fill="#0d3b2e" opacity="0.85" />
        <path d="M0 205 Q 160 180 340 202 T 800 200 V 260 H 0 Z" fill="#0a2e24" />

        {/* Foreground grass (drawn before the figures, so it never covers them) */}
        <g transform="translate(0,150)">
          {grassRows.map((row) => (
            <path
              key={row.key}
              className={`pfh-blade-${uid}`}
              d={`M${row.x} 110 Q${row.x - 3} ${110 - row.h * 0.6} ${row.x + 1} ${110 - row.h}`}
              stroke={row.tone}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              style={{ transformOrigin: `${row.x}px 110px`, animationDelay: `${row.delay}s`, animationDuration: `${row.dur}s` }}
            />
          ))}
        </g>

        <rect x="0" y="150" width="800" height="110" fill={`url(#fade-${uid})`} opacity="0.22" />

        {/* Farmer with mamotty - positioned left-of-center, clear of the logo (top-left) and sun */}
        <g className={`pfh-farmer-${uid}`} style={{ transformOrigin: '300px 225px' }} transform="translate(300,225)">
          {/* back leg */}
          <path d="M4 -42 L11 -22 L15 -1" stroke="#22405a" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* front leg */}
          <path d="M-6 -40 L-15 -20 L-15 0" stroke="#2c4f6c" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* leaning torso */}
          <ellipse cx="-9" cy="-55" rx="12" ry="25" transform="rotate(-35 -9 -55)" fill="#c1552e" />
          {/* resting arm */}
          <path d="M-16 -66 L-5 -52" stroke="#caa06c" strokeWidth="7" strokeLinecap="round" />
          {/* head */}
          <circle cx="-24" cy="-77" r="10" fill="#caa06c" />
          {/* conical hat */}
          <ellipse cx="-24" cy="-79" rx="18" ry="4.5" fill="#c8933f" />
          <path d="M-24 -98 L-42 -79 L-6 -79 Z" fill="#e3b04b" />

          {/* reaching arm, gripping the mamotty handle, drawn last so it sits over the torso */}
          <path d="M-19 -68 Q-28 -46 -31 -26" stroke="#caa06c" strokeWidth="7.5" strokeLinecap="round" fill="none" />

          {/* mamotty (hoe): wooden handle + angled metal blade, held in the reaching hand */}
          <g>
            <path d="M-31 -26 L-41 4" stroke="#6b4423" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M-45 -2 L-32 -6 L-36 10 L-49 12 Z" fill="#52535a" />
            <path d="M-45 -2 L-32 -6 L-34 0 L-46 4 Z" fill="#787a82" opacity="0.6" />
            {/* grip binding */}
            <path d="M-30 -30 L-33 -20" stroke="#3f2b17" strokeWidth="6" strokeLinecap="round" />
          </g>
        </g>

        {/* Scarecrow (soolakaadu pommai) - far right, clear of the logo and sun */}
        <g className={`pfh-scarecrow-${uid}`} style={{ transformOrigin: '660px 222px' }} transform="translate(660,222)">
          {/* pole */}
          <rect x="-3" y="-92" width="6" height="92" rx="2" fill="#5b3a20" />
          {/* crossbar */}
          <rect x="-34" y="-70" width="68" height="7" rx="3.5" fill="#6b4423" />

          {/* legs (straw-stuffed trousers) */}
          <rect x="-13" y="-32" width="9" height="30" rx="4" fill="#294a63" />
          <rect x="4" y="-32" width="9" height="30" rx="4" fill="#213e54" />
          <path d="M-13 -3 l-6 6 M-9 -3 l-2 7 M8 -3 l6 6 M13 -3 l2 7" stroke="#f2e2a1" strokeWidth="2" strokeLinecap="round" />

          {/* sack torso with a patch */}
          <rect x="-19" y="-72" width="38" height="42" rx="11" fill="#d9a441" />
          <rect x="-11" y="-64" width="15" height="13" rx="3" fill="#8a5a2e" opacity="0.55" transform="rotate(-8 -3 -57)" />

          {/* flapping sleeves with straw poking out */}
          <g className={`pfh-arm-left-${uid}`} style={{ transformOrigin: '-34px -66px' }}>
            <rect x="-46" y="-71" width="14" height="20" rx="6" fill="#7a3b2e" transform="rotate(18 -39 -61)" />
            <path d="M-49 -52 l-6 7 M-45 -50 l-4 8 M-41 -51 l-2 8" stroke="#f2e2a1" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g className={`pfh-arm-right-${uid}`} style={{ transformOrigin: '34px -66px' }}>
            <rect x="32" y="-71" width="14" height="20" rx="6" fill="#3f5f7a" transform="rotate(-14 39 -61)" />
            <path d="M49 -52 l6 7 M45 -50 l4 8 M41 -51 l2 8" stroke="#f2e2a1" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* head */}
          <circle cx="0" cy="-84" r="15" fill="#e3c08a" />
          {/* stitched face */}
          <path d="M-8 -86 L-3 -82 M-8 -82 L-3 -86 M3 -86 L8 -82 M3 -82 L8 -86 M-5 -75 Q0 -71 5 -75" stroke="#5b3a20" strokeWidth="1.6" fill="none" strokeLinecap="round" />

          {/* straw hat */}
          <ellipse cx="0" cy="-93" rx="23" ry="5.5" fill="#a9762f" />
          <path d="M0 -111 L-15 -93 L15 -93 Z" fill="#c8933f" />
        </g>
      </svg>

      <style>{`
        .pfh-sun-${uid} { animation: pfh-sun-pulse-${uid} 5s ease-in-out infinite; }
        @keyframes pfh-sun-pulse-${uid} { 0%, 100% { opacity: 0.9; } 50% { opacity: 1; } }

        .pfh-bird-${uid} { animation-name: pfh-bird-fly-${uid}; animation-timing-function: linear; animation-iteration-count: infinite; }
        @keyframes pfh-bird-fly-${uid} {
          0% { transform: translateX(-40px) translateY(var(--pfh-y, 0px)) scale(var(--pfh-s, 1)); opacity: 0; }
          8% { opacity: 1; }
          92% { opacity: 1; }
          100% { transform: translateX(840px) translateY(var(--pfh-y, 0px)) scale(var(--pfh-s, 1)); opacity: 0; }
        }

        .pfh-blade-${uid} { animation-name: pfh-sway-${uid}; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        @keyframes pfh-sway-${uid} { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(6deg); } }

        .pfh-scarecrow-${uid} { animation: pfh-scarecrow-sway-${uid} 4.5s ease-in-out infinite; }
        @keyframes pfh-scarecrow-sway-${uid} { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2.5deg); } }
        .pfh-arm-left-${uid} { animation: pfh-arm-left-${uid} 2.6s ease-in-out infinite; }
        @keyframes pfh-arm-left-${uid} { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(10deg); } }
        .pfh-arm-right-${uid} { animation: pfh-arm-right-${uid} 2.3s ease-in-out infinite; }
        @keyframes pfh-arm-right-${uid} { 0%, 100% { transform: rotate(8deg); } 50% { transform: rotate(-6deg); } }

        .pfh-farmer-${uid} { animation: pfh-farmer-bend-${uid} 2.8s ease-in-out infinite; }
        @keyframes pfh-farmer-bend-${uid} {
          0%, 100% { transform: translate(300px,225px) rotate(0deg); }
          40%, 55% { transform: translate(300px,230px) rotate(4deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .pfh-sun-${uid}, .pfh-bird-${uid}, .pfh-blade-${uid}, .pfh-scarecrow-${uid},
          .pfh-arm-left-${uid}, .pfh-arm-right-${uid}, .pfh-farmer-${uid} { animation: none !important; }
        }
      `}</style>
    </div>
  );
}