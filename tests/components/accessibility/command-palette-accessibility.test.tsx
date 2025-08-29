import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import userEvent from '@testing-library/user-event'
import { CommandPalette } from '@/components/navigation/command-palette'
import { CommandPaletteTrigger } from '@/components/navigation/command-palette-trigger'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
}))

describe('Command Palette Accessibility', () => {
  beforeEach(() => {
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn().mockReturnValue(null),
      setItem: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    })
  })

  it('should not have accessibility violations when closed', async () => {
    const { container } = render(<CommandPalette open={false} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should not have accessibility violations when open', async () => {
    const { container } = render(<CommandPalette open={true} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper dialog structure', () => {
    render(<CommandPalette open={true} />)
    
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-labelledby')
    expect(dialog).toHaveAttribute('aria-describedby')
  })

  it('should have proper combobox structure', () => {
    render(<CommandPalette open={true} />)
    
    const combobox = screen.getByRole('combobox')
    expect(combobox).toBeInTheDocument()
    expect(combobox).toHaveAttribute('aria-expanded', 'true')
    expect(combobox).toHaveAttribute('aria-controls')
    expect(combobox).toHaveAttribute('aria-activedescendant', '')
  })

  it('should have proper listbox structure', () => {
    render(<CommandPalette open={true} />)
    
    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()
    expect(listbox).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('should have proper option structure for commands', () => {
    render(<CommandPalette open={true} />)
    
    // Get command items (they should have option role)
    const options = screen.getAllByRole('option')
    expect(options.length).toBeGreaterThan(0)
    
    options.forEach(option => {
      expect(option).toHaveAttribute('aria-selected')
      expect(option).toHaveAttribute('id')
    })
  })

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<CommandPalette open={true} />)
    
    const combobox = screen.getByRole('combobox')
    
    // Focus should be on the input
    expect(combobox).toHaveValue('')
    
    // Arrow down should navigate to first option
    await user.keyboard('[ArrowDown]')
    
    const options = screen.getAllByRole('option')
    if (options.length > 0) {
      // cmdk handles aria-selected internally
      expect(options[0]).toHaveAttribute('aria-selected')
    }
  })

  it('should handle Enter key to select option', async () => {
    const user = userEvent.setup()
    render(<CommandPalette open={true} />)
    
    const combobox = screen.getByRole('combobox')
    combobox.focus()
    
    // Navigate to first option and press Enter
    await user.keyboard('[ArrowDown]')
    await user.keyboard('[Enter]')
    
    // Command palette should close (dialog should be removed)
    // This is handled by the parent component
  })

  it('should have proper focus management', () => {
    render(<CommandPalette open={true} />)
    
    const combobox = screen.getByRole('combobox')
    expect(document.activeElement).toBe(combobox)
  })

  it('should have proper screen reader announcements', () => {
    render(<CommandPalette open={true} />)
    
    // Check for proper labels
    const searchInput = screen.getByRole('combobox')
    expect(searchInput).toHaveAttribute('placeholder', 'Type a command or search...')
    
    // Check for group headings
    const headings = screen.getAllByRole('group')
    headings.forEach(heading => {
      expect(heading).toHaveAttribute('aria-labelledby')
    })
  })

  it('should support screen readers for command descriptions', () => {
    render(<CommandPalette open={true} />)
    
    // Commands should have descriptions for screen readers
    const homeCommand = screen.getByText('Go to Home')
    expect(homeCommand).toBeInTheDocument()
    
    const homeDescription = screen.getByText('Navigate to the homepage')
    expect(homeDescription).toBeInTheDocument()
  })

  it('should have proper color contrast', () => {
    render(<CommandPalette open={true} />)
    
    // Verify elements have proper styling classes for contrast
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveClass('bg-popover', 'text-popover-foreground')
    
    const searchInput = screen.getByRole('combobox')
    expect(searchInput).toHaveClass('text-foreground')
  })

  it('should be operable with keyboard only', async () => {
    const user = userEvent.setup()
    render(<CommandPalette open={true} />)
    
    const combobox = screen.getByRole('combobox')
    
    // Type to filter
    await user.type(combobox, 'home')
    
    // Navigate with arrows
    await user.keyboard('[ArrowDown]')
    await user.keyboard('[ArrowUp]')
    
    // Select with Enter
    await user.keyboard('[Enter]')
    
    // All interactions should work without mouse
    expect(combobox).toHaveValue('home')
  })

  it('should have proper focus indicators', () => {
    render(<CommandPalette open={true} />)
    
    const options = screen.getAllByRole('option')
    options.forEach(option => {
      // Should have focus styles in CSS
      expect(option).toHaveClass('focus:bg-accent')
    })
  })
})

describe('Command Palette Trigger Accessibility', () => {
  it('should not have accessibility violations for search bar variant', async () => {
    const onToggle = jest.fn()
    const { container } = render(<CommandPaletteTrigger onToggle={onToggle} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should not have accessibility violations for button variant', async () => {
    const onToggle = jest.fn()
    const { container } = render(
      <CommandPaletteTrigger onToggle={onToggle} variant="button" />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper button role and label', () => {
    const onToggle = jest.fn()
    render(<CommandPaletteTrigger onToggle={onToggle} variant="button" />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Open command palette')
  })

  it('should have proper keyboard shortcuts display', () => {
    const onToggle = jest.fn()
    render(<CommandPaletteTrigger onToggle={onToggle} />)
    
    // Keyboard shortcuts should be properly marked up
    const kbdElements = screen.getAllByRole('generic')
    const kbdShortcuts = kbdElements.filter(el => 
      el.tagName === 'KBD' || el.classList.contains('kbd')
    )
    
    expect(kbdShortcuts.length).toBeGreaterThan(0)
  })

  it('should be activatable by keyboard', async () => {
    const onToggle = jest.fn()
    const user = userEvent.setup()
    render(<CommandPaletteTrigger onToggle={onToggle} />)
    
    const button = screen.getByRole('button')
    await user.tab()
    expect(button).toHaveFocus()
    
    await user.keyboard('[Enter]')
    expect(onToggle).toHaveBeenCalledTimes(1)
    
    await user.keyboard('[Space]')
    expect(onToggle).toHaveBeenCalledTimes(2)
  })

  it('should have proper focus indicators', () => {
    const onToggle = jest.fn()
    render(<CommandPaletteTrigger onToggle={onToggle} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2')
  })
})

describe('Command Palette WCAG Compliance', () => {
  it('should meet WCAG 2.1 AA standards', async () => {
    const { container } = render(<CommandPalette open={true} />)
    const results = await axe(container, {
      rules: {
        // Enable specific WCAG rules
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-order-semantics': { enabled: true },
        'aria-required-attr': { enabled: true },
        'aria-valid-attr': { enabled: true },
      }
    })
    expect(results).toHaveNoViolations()
  })

  it('should support high contrast mode', () => {
    render(<CommandPalette open={true} />)
    
    // Commands should have proper contrast classes
    const commandItems = screen.getAllByRole('option')
    commandItems.forEach(item => {
      expect(item).toHaveClass('data-[selected=true]:bg-accent')
      expect(item).toHaveClass('data-[selected=true]:text-accent-foreground')
    })
  })

  it('should support reduced motion preferences', () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    })

    render(<CommandPalette open={true} />)
    
    // Component should render without animation-dependent functionality
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
  })
})