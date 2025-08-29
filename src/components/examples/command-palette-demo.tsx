'use client'

import * as React from 'react'
import { CommandPalette } from '@/components/navigation/command-palette'
import { CommandPaletteTrigger } from '@/components/navigation/command-palette-trigger'
import { Button } from '@/components/ui/button'

export function CommandPaletteDemo() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="p-8 space-y-6">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">Command Palette Demo</h1>

        <div className="prose max-w-none mb-8">
          <p className="text-lg text-muted-foreground">
            The command palette provides quick access to all major features in
            GoodBuy HQ. Try the different ways to activate it:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Open Command Palette</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-background border rounded">
                    ⌘ + K
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Close/Escape</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-background border rounded">
                    Esc
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">UI Triggers</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Search Bar Style:
                </label>
                <CommandPaletteTrigger
                  onToggle={() => setIsOpen(true)}
                  variant="search-bar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Button Style:
                </label>
                <CommandPaletteTrigger
                  onToggle={() => setIsOpen(true)}
                  variant="button"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Commands</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2 text-primary">Navigation</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Go to Home</li>
                <li>• Browse Marketplace</li>
                <li>• Business Calculator</li>
                <li>• Dashboard (auth)</li>
                <li>• Messages (auth)</li>
                <li>• Sell Business</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2 text-primary">
                Business Actions
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Evaluate Business</li>
                <li>• Contact Seller</li>
                <li>• Add to Favorites</li>
                <li>• Search Businesses</li>
                <li>• Search by Location</li>
                <li>• Search by Category</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2 text-primary">Settings & Help</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Profile Settings</li>
                <li>• Billing & Payments</li>
                <li>• Notifications</li>
                <li>• Help & Support</li>
                <li>• Documentation</li>
                <li>• Sign In/Out</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium">🔍 Smart Search</h3>
              <p className="text-sm text-muted-foreground">
                Type to filter commands instantly. Search by command name,
                description, or keywords.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">📱 Responsive</h3>
              <p className="text-sm text-muted-foreground">
                Works perfectly on desktop and mobile devices with
                touch-friendly interface.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">🎯 Context Aware</h3>
              <p className="text-sm text-muted-foreground">
                Shows relevant commands based on authentication state and user
                permissions.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">♿ Accessible</h3>
              <p className="text-sm text-muted-foreground">
                Full keyboard navigation, ARIA labels, and screen reader
                support.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">💭 Recent Searches</h3>
              <p className="text-sm text-muted-foreground">
                Remembers your recent searches for quick access to frequently
                used actions.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">🏢 Business Focused</h3>
              <p className="text-sm text-muted-foreground">
                Tailored commands for business evaluation, contact management,
                and marketplace navigation.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t">
          <Button
            onClick={() => setIsOpen(true)}
            className="w-full md:w-auto"
            size="lg"
          >
            Open Command Palette Demo
          </Button>
        </div>
      </div>

      <CommandPalette open={isOpen} onOpenChange={setIsOpen} />
    </div>
  )
}
