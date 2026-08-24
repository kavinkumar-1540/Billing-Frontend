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

const WORDMARK_HEIGHTS: Record<NonNullable<STLogoProps['size']>, string> = {
  sm: 'h-8',
  md: 'h-9',
  lg: 'h-11',
  xl: 'h-16',
}

const WORDMARK_PADDING: Record<NonNullable<STLogoProps['size']>, string> = {
  sm: 'px-2 py-1',
  md: 'px-2.5 py-1.5',
  lg: 'px-3 py-2',
  xl: 'px-4 py-3',
}

export function STLogo({ collapsed = false, size = 'md', layout = 'horizontal', className = '', onClick }: STLogoProps) {
  const isIconOnly = layout === 'iconOnly' || collapsed

  if (isIconOnly) {
    return (
      <div
        onClick={onClick}
        className={`group flex shrink-0 select-none items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 ${ICON_SIZES[size]} ${onClick ? 'cursor-pointer' : ''} transition-transform duration-300 group-hover:scale-105 ${className}`}
      >
        <img src="/zentra-icon.svg" alt="ZENTRA" className="h-full w-full object-contain" />
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={`group flex select-none items-center ${onClick ? 'cursor-pointer' : ''} ${
        layout === 'vertical' ? 'flex-col text-center' : ''
      } ${className}`}
    >
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl bg-white ${WORDMARK_PADDING[size]} transition-transform duration-300 group-hover:scale-105`}
      >
        <img src="/zentra.svg" alt="ZENTRA" className={`${WORDMARK_HEIGHTS[size]} w-auto object-contain`} />
      </div>
    </div>
  )
}
