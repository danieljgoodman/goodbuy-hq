'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Command } from 'lucide-react'

interface KeyboardHintProps {
  keys: string[]
  className?: string
  size?: 'sm' | 'md'
  description?: string
}

export function KeyboardHint({
  keys,
  className,
  size = 'sm',
  description,
}: KeyboardHintProps) {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
  }

  const isMac =
    typeof window !== 'undefined' &&
    navigator.platform.toUpperCase().indexOf('MAC') >= 0

  const displayKeys = keys.map(key => {
    if (key === 'cmd' || key === 'meta') {
      return isMac ? '⌘' : 'Ctrl'
    }
    if (key === 'alt') {
      return isMac ? '⌥' : 'Alt'
    }
    if (key === 'shift') {
      return isMac ? '⇧' : 'Shift'
    }
    return key.toUpperCase()
  })

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {description && (
        <span className="text-xs text-muted-foreground mr-1">
          {description}
        </span>
      )}
      <div className="flex items-center gap-1">
        {displayKeys.map((key, index) => (
          <React.Fragment key={index}>
            <kbd
              className={cn(
                'pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted font-mono font-medium text-muted-foreground',
                sizeClasses[size]
              )}
            >
              {key}
            </kbd>
            {index < displayKeys.length - 1 && (
              <span className="text-muted-foreground">+</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export function SearchHint() {
  return (
    <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
      <Command className="h-3 w-3" />
      <span>Quick search</span>
      <KeyboardHint keys={['cmd', 'k']} />
    </div>
  )
}
