import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils'

function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 text-xs font-bold text-white border border-cyan-400/40 shadow-[0_2px_10px_rgba(6,182,212,0.3)]',
        className,
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarFallback }