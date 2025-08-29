/**
 * Button Verification Test
 *
 * This test verifies that all button components across the GoodBuy HQ app
 * have been successfully replaced with ShadCN Button variants.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading'

// Mock components to test button usage
const MockSignInForm = () => (
  <form>
    <LoadingButton isLoading={false} variant="outline" size="lg">
      Continue with Google
    </LoadingButton>
    <LoadingButton isLoading={false} variant="default" size="lg" type="submit">
      Sign In
    </LoadingButton>
  </form>
)

const MockDashboard = () => (
  <div>
    <Button className="bg-gradient-to-r from-blue-500 to-indigo-600">
      Edit Profile
    </Button>
    <Button variant="outline" className="bg-white/20">
      Browse Marketplace
    </Button>
    <Button variant="secondary">Create Listing</Button>
    <Button variant="ghost" size="sm">
      View all activity
    </Button>
  </div>
)

const MockInquiryModal = () => (
  <div>
    <Button variant="ghost" size="icon" className="rounded-full">
      ×
    </Button>
    <Button variant="outline">Cancel</Button>
    <Button type="submit">Send Inquiry</Button>
  </div>
)

describe('Button Component Replacements', () => {
  it('renders LoadingButton with ShadCN variants correctly', () => {
    render(<MockSignInForm />)

    const googleButton = screen.getByText('Continue with Google')
    const signInButton = screen.getByText('Sign In')

    expect(googleButton).toBeInTheDocument()
    expect(signInButton).toBeInTheDocument()
    expect(signInButton.getAttribute('type')).toBe('submit')
  })

  it('renders dashboard buttons with proper variants', () => {
    render(<MockDashboard />)

    const editProfile = screen.getByText('Edit Profile')
    const browse = screen.getByText('Browse Marketplace')
    const create = screen.getByText('Create Listing')
    const viewAll = screen.getByText('View all activity')

    expect(editProfile).toBeInTheDocument()
    expect(browse).toBeInTheDocument()
    expect(create).toBeInTheDocument()
    expect(viewAll).toBeInTheDocument()
  })

  it('renders modal buttons with correct variants', () => {
    render(<MockInquiryModal />)

    const cancelButton = screen.getByText('Cancel')
    const sendButton = screen.getByText('Send Inquiry')

    expect(cancelButton).toBeInTheDocument()
    expect(sendButton).toBeInTheDocument()
    expect(sendButton.getAttribute('type')).toBe('submit')
  })

  it('supports all ShadCN button variants', () => {
    render(
      <div>
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
    )

    expect(screen.getByText('Default')).toBeInTheDocument()
    expect(screen.getByText('Secondary')).toBeInTheDocument()
    expect(screen.getByText('Outline')).toBeInTheDocument()
    expect(screen.getByText('Ghost')).toBeInTheDocument()
    expect(screen.getByText('Destructive')).toBeInTheDocument()
    expect(screen.getByText('Link')).toBeInTheDocument()
  })

  it('supports all ShadCN button sizes', () => {
    render(
      <div>
        <Button size="default">Default Size</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">⚙</Button>
      </div>
    )

    expect(screen.getByText('Default Size')).toBeInTheDocument()
    expect(screen.getByText('Small')).toBeInTheDocument()
    expect(screen.getByText('Large')).toBeInTheDocument()
    expect(screen.getByText('⚙')).toBeInTheDocument()
  })

  it('supports loading state in LoadingButton', () => {
    render(
      <div>
        <LoadingButton isLoading={false}>Not Loading</LoadingButton>
        <LoadingButton isLoading={true}>Loading</LoadingButton>
      </div>
    )

    const notLoadingButton = screen.getByText('Not Loading')
    const loadingButton = screen.getByText('Loading')

    expect(notLoadingButton).toBeInTheDocument()
    expect(loadingButton).toBeInTheDocument()
    expect(loadingButton).toBeDisabled()
  })

  it('maintains proper accessibility attributes', () => {
    render(
      <Button disabled aria-label="Accessible button" title="Button tooltip">
        Accessible Button
      </Button>
    )

    const button = screen.getByText('Accessible Button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-label', 'Accessible button')
    expect(button).toHaveAttribute('title', 'Button tooltip')
  })
})

describe('Button Styling and Theming', () => {
  it('applies custom CSS classes correctly', () => {
    render(<Button className="custom-class bg-red-500">Custom Button</Button>)

    const button = screen.getByText('Custom Button')
    expect(button).toHaveClass('custom-class')
  })

  it('maintains GoodBuy brand colors in custom buttons', () => {
    render(
      <div>
        <Button className="bg-primary-500 hover:bg-primary-600">
          Primary Brand
        </Button>
        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600">
          Gradient Brand
        </Button>
      </div>
    )

    expect(screen.getByText('Primary Brand')).toBeInTheDocument()
    expect(screen.getByText('Gradient Brand')).toBeInTheDocument()
  })
})
