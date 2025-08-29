import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '@/components/layout/header-new'
import { LayoutWithCommandPalette } from '@/components/layout/layout-with-command-palette'

// Mock next/navigation
const mockPush = jest.fn()
const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      },
    },
    status: 'authenticated',
  }),
}))

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

describe('Command Palette Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('integrates properly with header component', () => {
    render(<Header />)
    
    // Should find command palette trigger in header
    const trigger = screen.getByRole('button', { name: /search businesses/i })
    expect(trigger).toBeInTheDocument()
  })

  it('opens command palette when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<Header />)
    
    const trigger = screen.getByRole('button', { name: /search businesses/i })
    await user.click(trigger)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument()
    })
  })

  it('opens command palette with global keyboard shortcut', async () => {
    render(
      <LayoutWithCommandPalette>
        <Header />
      </LayoutWithCommandPalette>
    )
    
    // Simulate Cmd+K
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('navigates to marketplace when marketplace command is selected', async () => {
    const user = userEvent.setup()
    render(<Header />)
    
    // Open command palette
    const trigger = screen.getByRole('button', { name: /search businesses/i })
    await user.click(trigger)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Click marketplace command
    const marketplaceCommand = screen.getByText('Browse Marketplace')
    await user.click(marketplaceCommand)
    
    expect(mockPush).toHaveBeenCalledWith('/marketplace')
  })

  it('executes search command and navigates with query', async () => {
    const user = userEvent.setup()
    render(<Header />)
    
    // Open command palette
    const trigger = screen.getByRole('button', { name: /search businesses/i })
    await user.click(trigger)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Type search query
    const searchInput = screen.getByPlaceholderText('Type a command or search...')
    await user.type(searchInput, 'restaurant')
    
    // Select search businesses command
    const searchCommand = screen.getByText('Search Businesses')
    await user.click(searchCommand)
    
    expect(mockPush).toHaveBeenCalledWith('/marketplace')
  })

  it('shows mobile command palette trigger on small screens', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    render(<Header />)
    
    // Should find mobile trigger (button variant)
    const mobileTriggers = screen.getAllByRole('button', { name: /open command palette/i })
    expect(mobileTriggers.length).toBeGreaterThanOrEqual(1)
  })

  it('closes command palette when clicking outside', async () => {
    const user = userEvent.setup()
    render(<Header />)
    
    // Open command palette
    const trigger = screen.getByRole('button', { name: /search businesses/i })
    await user.click(trigger)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Click outside dialog (on backdrop)
    const dialog = screen.getByRole('dialog')
    const backdrop = dialog.parentElement
    if (backdrop) {
      await user.click(backdrop)
    }
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('closes command palette with Escape key', async () => {
    render(
      <LayoutWithCommandPalette>
        <Header />
      </LayoutWithCommandPalette>
    )
    
    // Open command palette
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Close with Escape
    fireEvent.keyDown(document, { key: 'Escape' })
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})

describe('Command Palette Business Actions Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('navigates to calculator for evaluate business action', async () => {
    const user = userEvent.setup()
    render(<Header />)
    
    // Open command palette
    const trigger = screen.getByRole('button', { name: /search businesses/i })
    await user.click(trigger)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Click evaluate business command
    const evaluateCommand = screen.getByText('Evaluate Business')
    await user.click(evaluateCommand)
    
    expect(mockPush).toHaveBeenCalledWith('/calculator')
  })

  it('handles contact seller action', async () => {
    const user = userEvent.setup()
    render(<Header />)
    
    // Open command palette
    const trigger = screen.getByRole('button', { name: /search businesses/i })
    await user.click(trigger)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Click contact seller command
    const contactCommand = screen.getByText('Contact Seller')
    await user.click(contactCommand)
    
    expect(mockPush).toHaveBeenCalledWith('/marketplace')
  })

  it('shows authenticated user commands when signed in', async () => {
    const user = userEvent.setup()
    render(<Header />)
    
    // Open command palette
    const trigger = screen.getByRole('button', { name: /search businesses/i })
    await user.click(trigger)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Should show dashboard and messages for authenticated users
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Messages')).toBeInTheDocument()
    expect(screen.getByText('Add to Favorites')).toBeInTheDocument()
  })
})

describe('Command Palette Search Integration', () => {
  it('saves and displays recent searches', async () => {
    const user = userEvent.setup()
    
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn().mockReturnValue(JSON.stringify([
        {
          id: '1',
          query: 'restaurant',
          timestamp: new Date().toISOString(),
          type: 'business'
        }
      ])),
      setItem: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    })

    render(<Header />)
    
    // Open command palette
    const trigger = screen.getByRole('button', { name: /search businesses/i })
    await user.click(trigger)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Should show recent searches
    expect(screen.getByText('Recent Searches')).toBeInTheDocument()
    expect(screen.getByText('Search: restaurant')).toBeInTheDocument()
  })

  it('filters commands as user types', async () => {
    const user = userEvent.setup()
    render(<Header />)
    
    // Open command palette
    const trigger = screen.getByRole('button', { name: /search businesses/i })
    await user.click(trigger)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText('Type a command or search...')
    await user.type(searchInput, 'calc')
    
    // Should show calculator command
    expect(screen.getByText('Business Calculator')).toBeInTheDocument()
    
    // Should not show unrelated commands
    expect(screen.queryByText('Browse Marketplace')).not.toBeInTheDocument()
  })

  it('shows "No results found" when search has no matches', async () => {
    const user = userEvent.setup()
    render(<Header />)
    
    // Open command palette
    const trigger = screen.getByRole('button', { name: /search businesses/i })
    await user.click(trigger)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText('Type a command or search...')
    await user.type(searchInput, 'xyzabc123nonexistent')
    
    await waitFor(() => {
      expect(screen.getByText('No results found.')).toBeInTheDocument()
    })
  })
})