interface STLogoProps {
  collapsed?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  layout?: 'horizontal' | 'vertical' | 'iconOnly'
  className?: string
  onClick?: () => void
}

const ICON_SIZES: Record<NonNullable<STLogoProps['size']>, string> = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
  xl: 'w-20 h-20',
}

const TITLE_SIZES: Record<NonNullable<STLogoProps['size']>, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl tracking-wider',
  xl: 'text-2xl tracking-widest font-extrabold',
}

const SUBTITLE_SIZES: Record<NonNullable<STLogoProps['size']>, string> = {
  sm: 'text-[9px]',
  md: 'text-[10px]',
  lg: 'text-xs',
  xl: 'text-xs tracking-wider',
}

export function STLogo({ collapsed = false, size = 'md', layout = 'horizontal', className = '', onClick }: STLogoProps) {
  const isIconOnly = layout === 'iconOnly' || collapsed

  return (
    <div
      onClick={onClick}
      className={`group flex select-none items-center gap-3 ${onClick ? 'cursor-pointer' : ''} ${
        layout === 'vertical' ? 'flex-col text-center gap-3' : ''
      } ${className}`}
    >
      <div
        className={`relative ${ICON_SIZES[size]} flex shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105`}
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-[0_4px_16px_rgba(6,182,212,0.45)] transition-all duration-300 group-hover:drop-shadow-[0_6px_24px_rgba(6,182,212,0.7)]"
        >
          <defs>
            <linearGradient id="stGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="35%" stopColor="#38bdf8" />
              <stop offset="70%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="stGradHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#a5f3fc" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.6" />
            </linearGradient>
            <filter id="stLogoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <circle cx="60" cy="60" r="45" fill="#06b6d4" opacity="0.12" filter="url(#stLogoGlow)" />

          <path
            d="M 52 32 C 30 32 20 40 20 52 C 20 62 30 68 45 70 C 60 72 68 76 68 86 C 68 96 58 102 42 102 C 28 102 22 96 22 88"
            stroke="url(#stGradMain)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />

          <path
            d="M 60 32 C 36 32 24 40 24 52 C 24 63 35 68 50 71 C 65 74 72 78 72 88 C 72 98 62 104 46 104 C 30 104 22 96 22 88"
            stroke="url(#stGradMain)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M 56 32 C 38 32 26 39 26 50 C 26 61 36 66 51 69 C 66 72 70 77 70 86 C 70 96 60 102 46 102 C 32 102 25 96 25 90"
            stroke="url(#stGradHighlight)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />

          <path d="M 52 32 L 100 32" stroke="url(#stGradMain)" strokeWidth="10" strokeLinecap="round" />
          <path
            d="M 56 32 L 96 32"
            stroke="url(#stGradHighlight)"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.85"
          />

          <path d="M 76 32 L 76 104" stroke="url(#stGradMain)" strokeWidth="10" strokeLinecap="round" />
          <path
            d="M 76 36 L 76 100"
            stroke="url(#stGradHighlight)"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.85"
          />

          <circle cx="76" cy="32" r="3" fill="#ffffff" opacity="0.9" />
        </svg>
      </div>

      {!isIconOnly && (
        <div className={`flex flex-col ${layout === 'vertical' ? 'items-center' : 'items-start'}`}>
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black uppercase tracking-tight text-white transition-colors group-hover:text-cyan-200 ${TITLE_SIZES[size]}`}
            >
              ST Billing
            </span>
            {size !== 'xl' && (
              <span className="rounded border border-cyan-400/30 bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                GST
              </span>
            )}
          </div>
          <span className={`font-normal tracking-wide text-slate-400 ${SUBTITLE_SIZES[size]}`}>
            Smart billing. Simplified business.
          </span>
        </div>
      )}
    </div>
  )
}
