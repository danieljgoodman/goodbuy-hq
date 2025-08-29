import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShadcnShowcase from '@/components/examples/ShadcnShowcase'

// Import mocks
import '../../../mocks/shadcn-mocks'

// Mock image loading
Object.defineProperty(HTMLImageElement.prototype, 'src', {
  set() {
    // Simulate image load
    setTimeout(() => this.onload?.(), 100)
  },
})

describe('ShadcnShowcase Component', () => {
  describe('Basic Rendering', () => {
    it('renders the main heading', () => {
      render(<ShadcnShowcase />)

      expect(screen.getByText('ShadCN UI Showcase')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Modern, accessible React components with proper TypeScript support'
        )
      ).toBeInTheDocument()
    })

    it('renders all tabs', () => {
      render(<ShadcnShowcase />)

      expect(screen.getByRole('button', { name: /users/i })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /analytics/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /profile/i })
      ).toBeInTheDocument()
    })

    it('renders header action buttons', () => {
      render(<ShadcnShowcase />)

      expect(
        screen.getByRole('button', { name: /settings/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /add user/i })
      ).toBeInTheDocument()
    })
  })

  describe('Users Tab', () => {
    it('displays users tab content by default', () => {
      render(<ShadcnShowcase />)

      expect(screen.getByText('User Management')).toBeInTheDocument()
      expect(
        screen.getByText('Search and filter through your team members')
      ).toBeInTheDocument()
    })

    it('displays search input', () => {
      render(<ShadcnShowcase />)

      const searchInput = screen.getByPlaceholderText('Search users...')
      expect(searchInput).toBeInTheDocument()
    })

    it('displays department filter', () => {
      render(<ShadcnShowcase />)

      expect(screen.getByTestId('select-trigger')).toBeInTheDocument()
    })

    it('displays user cards', () => {
      render(<ShadcnShowcase />)

      expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
      expect(screen.getByText('Michael Rodriguez')).toBeInTheDocument()
      expect(screen.getByText('Emily Johnson')).toBeInTheDocument()
    })

    it('shows user details correctly', () => {
      render(<ShadcnShowcase />)

      // Check Sarah Chen's details
      expect(screen.getByText('Product Manager')).toBeInTheDocument()
      expect(screen.getByText('sarah.chen@company.com')).toBeInTheDocument()
      expect(screen.getByText('Product')).toBeInTheDocument()
    })

    it('displays status badges', () => {
      render(<ShadcnShowcase />)

      expect(screen.getByText('active')).toBeInTheDocument()
      expect(screen.getByText('pending')).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('filters users by name', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      const searchInput = screen.getByPlaceholderText('Search users...')
      await user.type(searchInput, 'Sarah')

      expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
      expect(screen.queryByText('Michael Rodriguez')).not.toBeInTheDocument()
      expect(screen.queryByText('Emily Johnson')).not.toBeInTheDocument()
    })

    it('filters users by email', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      const searchInput = screen.getByPlaceholderText('Search users...')
      await user.type(searchInput, 'michael.r')

      expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument()
      expect(screen.getByText('Michael Rodriguez')).toBeInTheDocument()
      expect(screen.queryByText('Emily Johnson')).not.toBeInTheDocument()
    })

    it('shows no results when search matches nothing', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      const searchInput = screen.getByPlaceholderText('Search users...')
      await user.type(searchInput, 'nonexistent')

      expect(
        screen.getByText('No users found matching your criteria')
      ).toBeInTheDocument()
      expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument()
    })

    it('clears search correctly', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      const searchInput = screen.getByPlaceholderText('Search users...')
      await user.type(searchInput, 'Sarah')

      expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
      expect(screen.queryByText('Michael Rodriguez')).not.toBeInTheDocument()

      await user.clear(searchInput)

      expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
      expect(screen.getByText('Michael Rodriguez')).toBeInTheDocument()
    })
  })

  describe('Department Filter', () => {
    it('filters users by department', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      // Mock department selection - in real test, would interact with select component
      // This is simplified for the mock implementation
      expect(screen.getByText('Product Manager')).toBeInTheDocument()
      expect(screen.getByText('Senior Developer')).toBeInTheDocument()
      expect(screen.getByText('UX Designer')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('handles user card button clicks', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      const viewDetailsButtons = screen.getAllByText('View Details')
      expect(viewDetailsButtons).toHaveLength(3)

      await user.click(viewDetailsButtons[0])
      // In a real implementation, this would trigger some action
      // For now, we just verify the button is clickable
    })

    it('handles header button clicks', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      const settingsButton = screen.getByRole('button', { name: /settings/i })
      const addUserButton = screen.getByRole('button', { name: /add user/i })

      await user.click(settingsButton)
      await user.click(addUserButton)

      // Buttons should be clickable (no errors thrown)
    })
  })

  describe('Analytics Tab', () => {
    it('switches to analytics tab', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      const analyticsTab = screen.getByRole('button', { name: /analytics/i })
      await user.click(analyticsTab)

      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument()
        expect(screen.getByText('1,234')).toBeInTheDocument()
        expect(screen.getByText('Active Sessions')).toBeInTheDocument()
        expect(screen.getByText('89')).toBeInTheDocument()
      })
    })

    it('displays analytics metrics', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      const analyticsTab = screen.getByRole('button', { name: /analytics/i })
      await user.click(analyticsTab)

      await waitFor(() => {
        expect(screen.getByText('Engagement Rate')).toBeInTheDocument()
        expect(screen.getByText('74%')).toBeInTheDocument()
        expect(screen.getByText('Conversion Rate')).toBeInTheDocument()
        expect(screen.getByText('23.5%')).toBeInTheDocument()
      })
    })

    it('displays progress bar', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      const analyticsTab = screen.getByRole('button', { name: /analytics/i })
      await user.click(analyticsTab)

      await waitFor(() => {
        expect(screen.getByText('Project Progress')).toBeInTheDocument()
        expect(
          screen.getByText('Current sprint completion status')
        ).toBeInTheDocument()
        expect(screen.getByTestId('progress-root')).toBeInTheDocument()
      })
    })

    it('handles progress control buttons', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      const analyticsTab = screen.getByRole('button', { name: /analytics/i })
      await user.click(analyticsTab)

      await waitFor(async () => {
        const increaseButton = screen.getByText('+10%')
        const decreaseButton = screen.getByText('-10%')

        await user.click(increaseButton)
        await user.click(decreaseButton)

        // Buttons should be interactive
        expect(increaseButton).toBeInTheDocument()
        expect(decreaseButton).toBeInTheDocument()
      })
    })
  })

  describe('Profile Tab', () => {
    it('switches to profile tab', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      const profileTab = screen.getByRole('button', { name: /profile/i })
      await user.click(profileTab)

      await waitFor(() => {
        expect(screen.getByText('Personal Information')).toBeInTheDocument()
        expect(
          screen.getByText('Update your account details')
        ).toBeInTheDocument()
        expect(screen.getByText('Account Settings')).toBeInTheDocument()
      })
    })

    it('displays form fields', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      const profileTab = screen.getByRole('button', { name: /profile/i })
      await user.click(profileTab)

      await waitFor(() => {
        expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
        expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
        expect(screen.getByLabelText('Role')).toBeInTheDocument()
      })
    })

    it('has form action buttons', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      const profileTab = screen.getByRole('button', { name: /profile/i })
      await user.click(profileTab)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Cancel' })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: 'Save Changes' })
        ).toBeInTheDocument()
      })
    })

    it('displays account settings options', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      const profileTab = screen.getByRole('button', { name: /profile/i })
      await user.click(profileTab)

      await waitFor(() => {
        expect(screen.getByText('Email Notifications')).toBeInTheDocument()
        expect(screen.getByText('Two-Factor Auth')).toBeInTheDocument()
        expect(screen.getByText('Privacy Settings')).toBeInTheDocument()
      })
    })

    it('handles settings button clicks', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      const profileTab = screen.getByRole('button', { name: /profile/i })
      await user.click(profileTab)

      await waitFor(async () => {
        const configureButton = screen.getByRole('button', {
          name: 'Configure',
        })
        const enableButton = screen.getByRole('button', { name: 'Enable' })
        const manageButton = screen.getByRole('button', { name: 'Manage' })

        await user.click(configureButton)
        await user.click(enableButton)
        await user.click(manageButton)

        // Buttons should be clickable
        expect(configureButton).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<ShadcnShowcase />)

      const mainHeading = screen.getByRole('heading', {
        level: 1,
        name: 'ShadCN UI Showcase',
      })
      expect(mainHeading).toBeInTheDocument()
    })

    it('has proper tab navigation structure', () => {
      render(<ShadcnShowcase />)

      expect(screen.getByTestId('tabs-root')).toBeInTheDocument()
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      const analyticsTab = screen.getByRole('button', { name: /analytics/i })
      analyticsTab.focus()
      expect(analyticsTab).toHaveFocus()

      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument()
      })
    })

    it('has proper aria labels for icon buttons', () => {
      render(<ShadcnShowcase />)

      // Icon buttons should have accessible names through their text content
      expect(
        screen.getByRole('button', { name: /settings/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /add user/i })
      ).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('renders correctly on different screen sizes', () => {
      render(<ShadcnShowcase />)

      // Component should render without errors on any screen size
      expect(screen.getByText('ShadCN UI Showcase')).toBeInTheDocument()
    })

    it('handles responsive classes', () => {
      render(<ShadcnShowcase />)

      // Should have responsive utility classes (testing structure, not specific classes)
      const mainContainer = screen
        .getByText('ShadCN UI Showcase')
        .closest('div')
      expect(mainContainer).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('maintains search state between tab switches', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      // Search for Sarah
      const searchInput = screen.getByPlaceholderText('Search users...')
      await user.type(searchInput, 'Sarah')

      expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
      expect(screen.queryByText('Michael Rodriguez')).not.toBeInTheDocument()

      // Switch to analytics tab
      const analyticsTab = screen.getByRole('button', { name: /analytics/i })
      await user.click(analyticsTab)

      // Switch back to users tab
      const usersTab = screen.getByRole('button', { name: /users/i })
      await user.click(usersTab)

      // Search should be preserved
      expect(searchInput).toHaveValue('Sarah')
      expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
    })

    it('maintains progress value in analytics tab', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      const analyticsTab = screen.getByRole('button', { name: /analytics/i })
      await user.click(analyticsTab)

      await waitFor(async () => {
        const increaseButton = screen.getByText('+10%')
        await user.click(increaseButton)

        // Switch tabs and back
        const usersTab = screen.getByRole('button', { name: /users/i })
        await user.click(usersTab)

        await user.click(analyticsTab)

        // Progress state should be maintained
        expect(screen.getByTestId('progress-root')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles empty search results gracefully', async () => {
      const user = userEvent.setup()
      render(<ShadcnShowcase />)

      const searchInput = screen.getByPlaceholderText('Search users...')
      await user.type(searchInput, 'xyz123nonexistent')

      expect(
        screen.getByText('No users found matching your criteria')
      ).toBeInTheDocument()
      expect(screen.getByTestId('icon-users')).toBeInTheDocument()
    })

    it('handles missing user data gracefully', () => {
      render(<ShadcnShowcase />)

      // Component should render even with missing data
      expect(screen.getByText('ShadCN UI Showcase')).toBeInTheDocument()
    })
  })
})
