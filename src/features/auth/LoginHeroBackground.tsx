/** Abstract flowing-ribbon backdrop for the login hero panel, inspired by glossy 3D marketing renders. */
export function LoginHeroBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ribbon-light" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8f0ff" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#0284c7" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="ribbon-mid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="ring-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="torus" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#dce8ff" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>

      <circle cx="760" cy="230" r="220" fill="url(#ring-glow)" />

      <path
        d="M -50 620 C 150 480, 350 700, 520 560 C 680 430, 820 520, 1050 400 L 1050 620 C 820 720, 680 630, 520 740 C 350 860, 150 700, -50 800 Z"
        fill="url(#ribbon-mid)"
      />
      <path
        d="M -50 500 C 180 340, 400 600, 600 460 C 780 330, 900 420, 1050 300 L 1050 480 C 900 580, 780 500, 600 620 C 400 750, 180 500, -50 640 Z"
        fill="url(#ribbon-light)"
      />

      <g transform="translate(760 230)">
        <path
          d="M -100 0 A 100 100 0 1 1 100 0 A 100 100 0 1 1 -100 0 M -70 0 A 70 70 0 1 0 70 0 A 70 70 0 1 0 -70 0"
          fill="url(#torus)"
          fillRule="evenodd"
        />
        <ellipse cx="-25" cy="-55" rx="35" ry="14" fill="#ffffff" opacity="0.55" transform="rotate(-30 -25 -55)" />
      </g>

      <path
        d="M -50 720 C 200 620, 420 820, 650 700 C 850 590, 950 660, 1050 580 L 1050 700 C 950 780, 850 710, 650 820 C 420 940, 200 740, -50 840 Z"
        fill="url(#ribbon-mid)"
        opacity="0.6"
      />
    </svg>
  )
}
