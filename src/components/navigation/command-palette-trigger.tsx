'use client'

import * as React from 'react'
import { Search, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CommandPaletteTriggerProps {
  onToggle: () => void
  className?: string
  variant?: 'button' | 'search-bar'
}

export function CommandPaletteTrigger({
  onToggle,
  className,
  variant = 'search-bar',
}: CommandPaletteTriggerProps) {
  const [isMac, setIsMac] = React.useState(false)

  React.useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  if (variant === 'button') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className={cn(
          'h-9 w-9 p-0 hover:bg-accent hover:text-accent-foreground',
          className
        )}
        aria-label="Open command palette"
      >
        <Command className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex items-center gap-2 w-full max-w-sm px-3 py-2 text-sm text-muted-foreground',
        'bg-muted/50 hover:bg-muted/70 rounded-md border border-border/50',
        'transition-colors duration-200 focus:outline-none focus:ring-2',
        'focus:ring-primary/20 focus:border-primary/50',
        className
      )}
      aria-label="Open command palette"
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left truncate">
        Search businesses, navigate...
      </span>
      <div className="flex items-center gap-1 ml-auto">
        <kbd className="inline-flex items-center justify-center h-5 min-w-5 px-1 font-mono text-[10px] font-medium text-muted-foreground bg-background border border-border rounded">
          {isMac ? '⌘' : 'Ctrl'}
        </kbd>
        <kbd className="inline-flex items-center justify-center h-5 min-w-5 px-1 font-mono text-[10px] font-medium text-muted-foreground bg-background border border-border rounded">
          K
        </kbd>
      </div>
    </button>
  )
}
