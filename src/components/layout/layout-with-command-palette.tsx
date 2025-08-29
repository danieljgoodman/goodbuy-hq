'use client'

import * as React from 'react'
import { CommandPalette } from '@/components/navigation/command-palette'
import { CommandPaletteProvider } from '@/components/providers/command-palette-provider'

interface LayoutWithCommandPaletteProps {
  children: React.ReactNode
}

export function LayoutWithCommandPalette({
  children,
}: LayoutWithCommandPaletteProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }

      // Escape key to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <CommandPaletteProvider>
      {children}
      <CommandPalette open={isOpen} onOpenChange={setIsOpen} />
    </CommandPaletteProvider>
  )
}
