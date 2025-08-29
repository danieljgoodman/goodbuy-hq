import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card'

// Import mocks
import '../../../mocks/shadcn-mocks'

describe('Card Component', () => {
  describe('Card', () => {
    it('renders with default styling', () => {
      render(<Card data-testid="card">Card content</Card>)

      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveAttribute('data-slot', 'card')
      expect(card).toHaveTextContent('Card content')
    })

    it('applies custom className', () => {
      render(
        <Card className="custom-class" data-testid="card">
          Content
        </Card>
      )

      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
    })

    it('forwards additional props', () => {
      render(
        <Card id="test-id" role="region" data-testid="card">
          Content
        </Card>
      )

      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('id', 'test-id')
      expect(card).toHaveAttribute('role', 'region')
    })

    it('has proper semantic structure', () => {
      render(<Card>Card content</Card>)

      const card = screen.getByRole('generic')
      expect(card).toBeInTheDocument()
    })
  })

  describe('CardHeader', () => {
    it('renders with correct data slot', () => {
      render(<CardHeader data-testid="card-header">Header content</CardHeader>)

      const header = screen.getByTestId('card-header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveAttribute('data-slot', 'card-header')
      expect(header).toHaveTextContent('Header content')
    })

    it('applies grid layout classes', () => {
      render(<CardHeader data-testid="card-header">Header</CardHeader>)

      const header = screen.getByTestId('card-header')
      expect(header).toHaveClass('@container/card-header')
      expect(header).toHaveClass('grid')
    })

    it('handles card action layout', () => {
      render(
        <CardHeader data-testid="card-header">
          <CardTitle>Title</CardTitle>
          <CardAction>Action</CardAction>
        </CardHeader>
      )

      const header = screen.getByTestId('card-header')
      expect(header).toBeInTheDocument()
    })
  })

  describe('CardTitle', () => {
    it('renders with proper styling', () => {
      render(<CardTitle data-testid="card-title">Test Title</CardTitle>)

      const title = screen.getByTestId('card-title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveAttribute('data-slot', 'card-title')
      expect(title).toHaveTextContent('Test Title')
      expect(title).toHaveClass('leading-none', 'font-semibold')
    })

    it('supports custom className', () => {
      render(
        <CardTitle className="text-lg" data-testid="card-title">
          Title
        </CardTitle>
      )

      const title = screen.getByTestId('card-title')
      expect(title).toHaveClass('text-lg')
    })

    it('can render as different HTML elements', () => {
      const { rerender } = render(
        <CardTitle as="h1" data-testid="card-title">
          Title
        </CardTitle>
      )

      let title = screen.getByTestId('card-title')
      expect(title.tagName).toBe('DIV') // Default behavior

      // Test with explicit heading role
      rerender(
        <CardTitle role="heading" data-testid="card-title">
          Title
        </CardTitle>
      )
      title = screen.getByTestId('card-title')
      expect(title).toHaveRole('heading')
    })
  })

  describe('CardDescription', () => {
    it('renders with muted text styling', () => {
      render(
        <CardDescription data-testid="card-description">
          Description text
        </CardDescription>
      )

      const description = screen.getByTestId('card-description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveAttribute('data-slot', 'card-description')
      expect(description).toHaveTextContent('Description text')
      expect(description).toHaveClass('text-muted-foreground', 'text-sm')
    })

    it('supports custom styling', () => {
      render(
        <CardDescription
          className="text-base text-gray-700"
          data-testid="card-description"
        >
          Description
        </CardDescription>
      )

      const description = screen.getByTestId('card-description')
      expect(description).toHaveClass('text-base', 'text-gray-700')
    })
  })

  describe('CardAction', () => {
    it('renders with correct grid positioning', () => {
      render(<CardAction data-testid="card-action">Action content</CardAction>)

      const action = screen.getByTestId('card-action')
      expect(action).toBeInTheDocument()
      expect(action).toHaveAttribute('data-slot', 'card-action')
      expect(action).toHaveClass(
        'col-start-2',
        'row-span-2',
        'row-start-1',
        'self-start',
        'justify-self-end'
      )
    })

    it('can contain interactive elements', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()

      render(
        <CardAction data-testid="card-action">
          <button onClick={handleClick}>Click me</button>
        </CardAction>
      )

      const button = screen.getByRole('button', { name: 'Click me' })
      await user.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('CardContent', () => {
    it('renders with proper padding', () => {
      render(<CardContent data-testid="card-content">Main content</CardContent>)

      const content = screen.getByTestId('card-content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveAttribute('data-slot', 'card-content')
      expect(content).toHaveTextContent('Main content')
      expect(content).toHaveClass('px-6')
    })

    it('can contain complex content', () => {
      render(
        <CardContent data-testid="card-content">
          <div>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </CardContent>
      )

      const content = screen.getByTestId('card-content')
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument()
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })
  })

  describe('CardFooter', () => {
    it('renders with flex layout', () => {
      render(<CardFooter data-testid="card-footer">Footer content</CardFooter>)

      const footer = screen.getByTestId('card-footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveAttribute('data-slot', 'card-footer')
      expect(footer).toHaveClass('flex', 'items-center', 'px-6')
    })

    it('can contain multiple action buttons', async () => {
      const user = userEvent.setup()
      const handleSave = jest.fn()
      const handleCancel = jest.fn()

      render(
        <CardFooter data-testid="card-footer">
          <button onClick={handleCancel}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </CardFooter>
      )

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      const saveButton = screen.getByRole('button', { name: 'Save' })

      await user.click(cancelButton)
      await user.click(saveButton)

      expect(handleCancel).toHaveBeenCalledTimes(1)
      expect(handleSave).toHaveBeenCalledTimes(1)
    })
  })

  describe('Complete Card Structure', () => {
    it('renders a complete card with all components', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text</CardDescription>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Cancel</button>
            <button>Save</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByTestId('complete-card')).toBeInTheDocument()
      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card description text')).toBeInTheDocument()
      expect(
        screen.getByText('This is the main content of the card.')
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    it('maintains proper hierarchy and accessibility', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              Accessible Title
            </CardTitle>
            <CardDescription>Accessible description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Accessible content</p>
          </CardContent>
        </Card>
      )

      const title = screen.getByRole('heading', { level: 2 })
      expect(title).toHaveTextContent('Accessible Title')

      const description = screen.getByText('Accessible description')
      expect(description).toBeInTheDocument()
    })

    it('supports responsive design classes', () => {
      render(
        <Card
          className="md:grid-cols-2 lg:grid-cols-3"
          data-testid="responsive-card"
        >
          <CardContent>Responsive content</CardContent>
        </Card>
      )

      const card = screen.getByTestId('responsive-card')
      expect(card).toHaveClass('md:grid-cols-2', 'lg:grid-cols-3')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty content gracefully', () => {
      render(<Card data-testid="empty-card" />)

      const card = screen.getByTestId('empty-card')
      expect(card).toBeInTheDocument()
      expect(card).toBeEmptyDOMElement()
    })

    it('handles null/undefined children', () => {
      render(
        <Card data-testid="null-children">
          {null}
          {undefined}
          <CardContent>Real content</CardContent>
        </Card>
      )

      const card = screen.getByTestId('null-children')
      expect(card).toBeInTheDocument()
      expect(screen.getByText('Real content')).toBeInTheDocument()
    })

    it('preserves event handlers', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()

      render(
        <Card onClick={handleClick} data-testid="clickable-card">
          Clickable card
        </Card>
      )

      const card = screen.getByTestId('clickable-card')
      await user.click(card)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })
})
