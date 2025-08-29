import { CommandPaletteDemo } from '@/components/examples/command-palette-demo'

export default function TestCommandPalettePage() {
  return (
    <div className="min-h-screen bg-background">
      <CommandPaletteDemo />
    </div>
  )
}

export const metadata = {
  title: 'Command Palette Demo | GoodBuy HQ',
  description: 'Demo page for testing the command palette functionality',
}
