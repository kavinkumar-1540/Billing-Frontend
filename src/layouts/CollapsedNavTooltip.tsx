import { useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface CollapsedNavTooltipProps {
  label: string
  enabled?: boolean
  children: ReactNode
}

export function CollapsedNavTooltip({ label, enabled = true, children }: CollapsedNavTooltipProps) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)

  function handleEnter() {
    if (!enabled) return
    const rect = anchorRef.current?.getBoundingClientRect()
    if (!rect) return
    setCoords({ top: rect.top + rect.height / 2, left: rect.right + 12 })
  }

  return (
    <div ref={anchorRef} onMouseEnter={handleEnter} onMouseLeave={() => setCoords(null)}>
      {children}
      {coords &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[60] -translate-y-1/2 whitespace-nowrap rounded-md border border-white/10 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 shadow-xl"
            style={{ top: coords.top, left: coords.left }}
          >
            {label}
          </div>,
          document.body,
        )}
    </div>
  )
}
