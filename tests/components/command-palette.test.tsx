import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommandPalette } from '@/components/navigation/command-palette'
import { CommandPaletteTrigger } from '@/components/navigation/command-palette-trigger'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('CommandPalette', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('renders without crashing', () => {
    render(<CommandPalette />)
    // Command palette should not be visible by default
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens when open prop is true', () => {
    render(<CommandPalette open={true} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Type a command or search...')
    ).toBeInTheDocument()
  })

  it('displays navigation commands', () => {
    render(<CommandPalette open={true} />)

    expect(screen.getByText('Go to Home')).toBeInTheDocument()
    expect(screen.getByText('Browse Marketplace')).toBeInTheDocument()
    expect(screen.getByText('Business Calculator')).toBeInTheDocument()
  })

  it('displays business action commands', () => {
    render(<CommandPalette open={true} />)

    expect(screen.getByText('Evaluate Business')).toBeInTheDocument()
    expect(screen.getByText('Contact Seller')).toBeInTheDocument()
    expect(screen.getByText('Add to Favorites')).toBeInTheDocument()
  })

  it('displays search commands', () => {
    render(<CommandPalette open={true} />)

    expect(screen.getByText('Search Businesses')).toBeInTheDocument()
    expect(screen.getByText('Search by Location')).toBeInTheDocument()
    expect(screen.getByText('Search by Category')).toBeInTheDocument()
  })

  it('filters commands based on search input', async () => {
    const user = userEvent.setup()
    render(<CommandPalette open={true} />)

    const searchInput = screen.getByPlaceholderText(
      'Type a command or search...'
    )
    await user.type(searchInput, 'calculator')

    expect(screen.getByText('Business Calculator')).toBeInTheDocument()
    // Other non-matching commands should not be visible
    expect(screen.queryByText('Go to Home')).not.toBeInTheDocument()
  })

  it('executes navigation command when selected', async () => {
    const user = userEvent.setup()
    render(<CommandPalette open={true} />)

    const homeCommand = screen.getByText('Go to Home')
    await user.click(homeCommand)

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('calls onOpenChange when dialog is closed', async () => {
    const onOpenChange = jest.fn()
    render(<CommandPalette open={true} onOpenChange={onOpenChange} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('displays keyboard shortcuts', () => {
    render(<CommandPalette open={true} />)

    // Check for keyboard shortcuts in command items
    const shortcuts = screen.getAllByRole('generic', { name: /kbd/i })
    expect(shortcuts.length).toBeGreaterThan(0)
  })

  it('shows recent searches when available', () => {
    // Mock localStorage with recent searches
    mockLocalStorage.getItem.mockReturnValue(
      JSON.stringify([
        {
          id: '1',
          query: 'restaurant',
          timestamp: new Date().toISOString(),
          type: 'business',
        },
      ])
    )

    render(<CommandPalette open={true} />)

    expect(screen.getByText('Recent Searches')).toBeInTheDocument()
    expect(screen.getByText('Search: restaurant')).toBeInTheDocument()
  })

  it('hides auth-required commands for unauthenticated users', () => {
    render(<CommandPalette open={true} />)

    // Dashboard should not be visible for unauthenticated users
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    // Messages should not be visible for unauthenticated users
    expect(screen.queryByText('Messages')).not.toBeInTheDocument()
  })
})

describe('CommandPaletteTrigger', () => {
  it('renders search bar variant by default', () => {
    const onToggle = jest.fn()
    render(<CommandPaletteTrigger onToggle={onToggle} />)

    expect(
      screen.getByText('Search businesses, navigate...')
    ).toBeInTheDocument()
    expect(screen.getByText('K')).toBeInTheDocument()
  })

  it('renders button variant when specified', () => {
    const onToggle = jest.fn()
    render(<CommandPaletteTrigger onToggle={onToggle} variant="button" />)

    const button = screen.getByRole('button', { name: /open command palette/i })
    expect(button).toBeInTheDocument()
  })

  it('calls onToggle when clicked', async () => {
    const onToggle = jest.fn()
    const user = userEvent.setup()
    render(<CommandPaletteTrigger onToggle={onToggle} />)

    const trigger = screen.getByRole('button')
    await user.click(trigger)

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('shows correct modifier key based on platform', () => {
    // Mock Mac platform
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    })

    const onToggle = jest.fn()
    render(<CommandPaletteTrigger onToggle={onToggle} />)

    expect(screen.getByText('⌘')).toBeInTheDocument()
  })
})

describe('Command Palette Keyboard Navigation', () => {
  it('handles keyboard shortcuts correctly', async () => {
    const onOpenChange = jest.fn()
    render(<CommandPalette open={false} onOpenChange={onOpenChange} />)

    // Simulate Cmd+K
    fireEvent.keyDown(document, { key: 'k', metaKey: true })

    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('handles Ctrl+K for Windows/Linux', async () => {
    const onOpenChange = jest.fn()
    render(<CommandPalette open={false} onOpenChange={onOpenChange} />)

    // Simulate Ctrl+K
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })

    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('navigates through commands with arrow keys', async () => {
    const user = userEvent.setup()
    render(<CommandPalette open={true} />)

    const commandList = screen.getByRole('listbox')
    expect(commandList).toBeInTheDocument()

    // Arrow key navigation is handled by cmdk internally
    // We can test that the list is focusable and accessible
    expect(commandList).toHaveAttribute('aria-orientation', 'vertical')
  })
})

describe('Command Palette Accessibility', () => {
  it('has proper ARIA labels and roles', () => {
    render(<CommandPalette open={true} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('supports screen reader navigation', () => {
    render(<CommandPalette open={true} />)

    const searchInput = screen.getByRole('combobox')
    expect(searchInput).toHaveAttribute('aria-expanded', 'true')
    expect(searchInput).toHaveAttribute('aria-controls')
  })

  it('provides descriptive text for commands', () => {
    render(<CommandPalette open={true} />)

    const homeCommand = screen.getByText('Go to Home')
    expect(screen.getByText('Navigate to the homepage')).toBeInTheDocument()
  })
})

describe('Command Palette Performance', () => {
  it('renders efficiently with many commands', () => {
    const startTime = performance.now()
    render(<CommandPalette open={true} />)
    const endTime = performance.now()

    // Should render in less than 100ms
    expect(endTime - startTime).toBeLessThan(100)
  })

  it('handles search filtering efficiently', async () => {
    const user = userEvent.setup()
    render(<CommandPalette open={true} />)

    const searchInput = screen.getByPlaceholderText(
      'Type a command or search...'
    )

    const startTime = performance.now()
    await user.type(searchInput, 'business')
    const endTime = performance.now()

    // Filtering should be fast
    expect(endTime - startTime).toBeLessThan(200)
  })
})
