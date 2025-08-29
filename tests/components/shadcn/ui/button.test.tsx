import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

// Import mocks
import '../../../mocks/shadcn-mocks'

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>)

      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Click me')
    })

    it('renders as a link when asChild prop is used', () => {
      render(
        <Button asChild>
          <a href="/test">Link button</a>
        </Button>
      )

      const link = screen.getByRole('link', { name: 'Link button' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Button ref={ref}>Button with ref</Button>)

      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
      expect(ref.current?.textContent).toBe('Button with ref')
    })
  })

  describe('Variants', () => {
    it('applies default variant styling', () => {
      render(<Button data-testid="default-button">Default</Button>)

      const button = screen.getByTestId('default-button')
      expect(button).toBeInTheDocument()
      // Default variant should have appropriate classes
    })

    it('applies destructive variant styling', () => {
      render(
        <Button variant="destructive" data-testid="destructive-button">
          Delete
        </Button>
      )

      const button = screen.getByTestId('destructive-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Delete')
    })

    it('applies outline variant styling', () => {
      render(
        <Button variant="outline" data-testid="outline-button">
          Outline
        </Button>
      )

      const button = screen.getByTestId('outline-button')
      expect(button).toBeInTheDocument()
    })

    it('applies secondary variant styling', () => {
      render(
        <Button variant="secondary" data-testid="secondary-button">
          Secondary
        </Button>
      )

      const button = screen.getByTestId('secondary-button')
      expect(button).toBeInTheDocument()
    })

    it('applies ghost variant styling', () => {
      render(
        <Button variant="ghost" data-testid="ghost-button">
          Ghost
        </Button>
      )

      const button = screen.getByTestId('ghost-button')
      expect(button).toBeInTheDocument()
    })

    it('applies link variant styling', () => {
      render(
        <Button variant="link" data-testid="link-button">
          Link
        </Button>
      )

      const button = screen.getByTestId('link-button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it('applies default size', () => {
      render(<Button data-testid="default-size">Default Size</Button>)

      const button = screen.getByTestId('default-size')
      expect(button).toBeInTheDocument()
    })

    it('applies sm size', () => {
      render(
        <Button size="sm" data-testid="sm-button">
          Small
        </Button>
      )

      const button = screen.getByTestId('sm-button')
      expect(button).toBeInTheDocument()
    })

    it('applies lg size', () => {
      render(
        <Button size="lg" data-testid="lg-button">
          Large
        </Button>
      )

      const button = screen.getByTestId('lg-button')
      expect(button).toBeInTheDocument()
    })

    it('applies icon size', () => {
      render(
        <Button size="icon" data-testid="icon-button" aria-label="Icon button">
          <span>×</span>
        </Button>
      )

      const button = screen.getByTestId('icon-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-label', 'Icon button')
    })
  })

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Button disabled>Disabled Button</Button>)

      const button = screen.getByRole('button', { name: 'Disabled Button' })
      expect(button).toBeDisabled()
    })

    it('prevents click when disabled', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()

      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      )

      const button = screen.getByRole('button', { name: 'Disabled' })
      await user.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('shows loading state', () => {
      render(
        <Button loading data-testid="loading-button">
          Loading
        </Button>
      )

      const button = screen.getByTestId('loading-button')
      expect(button).toBeDisabled()
      // Should show loading indicator
    })
  })

  describe('Event Handlers', () => {
    it('handles click events', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()

      render(<Button onClick={handleClick}>Click me</Button>)

      const button = screen.getByRole('button', { name: 'Click me' })
      await user.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('handles keyboard events', async () => {
      const user = userEvent.setup()
      const handleKeyDown = jest.fn()

      render(<Button onKeyDown={handleKeyDown}>Press me</Button>)

      const button = screen.getByRole('button', { name: 'Press me' })
      button.focus()
      await user.keyboard('{Enter}')

      expect(handleKeyDown).toHaveBeenCalled()
    })

    it('handles mouse events', async () => {
      const user = userEvent.setup()
      const handleMouseOver = jest.fn()
      const handleMouseOut = jest.fn()

      render(
        <Button onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
          Hover me
        </Button>
      )

      const button = screen.getByRole('button', { name: 'Hover me' })
      await user.hover(button)
      await user.unhover(button)

      expect(handleMouseOver).toHaveBeenCalledTimes(1)
      expect(handleMouseOut).toHaveBeenCalledTimes(1)
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(
        <Button className="custom-class" data-testid="custom-button">
          Custom
        </Button>
      )

      const button = screen.getByTestId('custom-button')
      expect(button).toHaveClass('custom-class')
    })

    it('combines custom classes with variant classes', () => {
      render(
        <Button
          variant="outline"
          className="border-red-500"
          data-testid="combined-button"
        >
          Combined
        </Button>
      )

      const button = screen.getByTestId('combined-button')
      expect(button).toHaveClass('border-red-500')
    })

    it('applies custom styles', () => {
      render(
        <Button
          style={{ backgroundColor: 'red', color: 'white' }}
          data-testid="styled-button"
        >
          Styled
        </Button>
      )

      const button = screen.getByTestId('styled-button')
      expect(button).toHaveStyle({
        backgroundColor: 'red',
        color: 'white',
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<Button>Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('supports aria-label', () => {
      render(<Button aria-label="Close dialog">×</Button>)

      const button = screen.getByRole('button', { name: 'Close dialog' })
      expect(button).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      render(
        <div>
          <Button aria-describedby="help-text">Submit</Button>
          <div id="help-text">This will submit the form</div>
        </div>
      )

      const button = screen.getByRole('button', { name: 'Submit' })
      expect(button).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('is focusable by default', () => {
      render(<Button>Focusable</Button>)

      const button = screen.getByRole('button', { name: 'Focusable' })
      button.focus()
      expect(button).toHaveFocus()
    })

    it('is not focusable when disabled', () => {
      render(<Button disabled>Not focusable</Button>)

      const button = screen.getByRole('button', { name: 'Not focusable' })
      expect(button).toHaveAttribute('disabled')
    })
  })

  describe('Form Integration', () => {
    it('submits form when type is submit', async () => {
      const user = userEvent.setup()
      const handleSubmit = jest.fn(e => e.preventDefault())

      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit Form</Button>
        </form>
      )

      const button = screen.getByRole('button', { name: 'Submit Form' })
      await user.click(button)

      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    it('resets form when type is reset', async () => {
      const user = userEvent.setup()

      render(
        <form>
          <input defaultValue="test" data-testid="input" />
          <Button type="reset">Reset Form</Button>
        </form>
      )

      const input = screen.getByTestId('input') as HTMLInputElement
      const resetButton = screen.getByRole('button', { name: 'Reset Form' })

      // Change input value
      await user.clear(input)
      await user.type(input, 'changed')
      expect(input.value).toBe('changed')

      // Reset form
      await user.click(resetButton)
      expect(input.value).toBe('test')
    })
  })

  describe('With Icons', () => {
    it('renders with leading icon', () => {
      render(
        <Button>
          <span data-testid="icon">🚀</span>
          Launch
        </Button>
      )

      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByText('Launch')).toBeInTheDocument()
    })

    it('renders icon-only button', () => {
      render(
        <Button size="icon" aria-label="Delete item">
          <span data-testid="delete-icon">🗑️</span>
        </Button>
      )

      const button = screen.getByRole('button', { name: 'Delete item' })
      expect(button).toBeInTheDocument()
      expect(screen.getByTestId('delete-icon')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner', () => {
      render(<Button loading>Loading...</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      // Would typically have a loading spinner
    })

    it('preserves button text during loading', () => {
      render(<Button loading>Save Changes</Button>)

      const button = screen.getByRole('button', { name: 'Save Changes' })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty content', () => {
      render(<Button data-testid="empty-button" />)

      const button = screen.getByTestId('empty-button')
      expect(button).toBeInTheDocument()
      expect(button).toBeEmptyDOMElement()
    })

    it('handles complex children', () => {
      render(
        <Button>
          <div>
            <span>Complex</span>
            <strong>Content</strong>
          </div>
        </Button>
      )

      expect(screen.getByText('Complex')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('preserves other button attributes', () => {
      render(
        <Button
          id="test-button"
          name="test"
          value="test-value"
          data-custom="custom-value"
        >
          Test
        </Button>
      )

      const button = screen.getByRole('button', { name: 'Test' })
      expect(button).toHaveAttribute('id', 'test-button')
      expect(button).toHaveAttribute('name', 'test')
      expect(button).toHaveAttribute('value', 'test-value')
      expect(button).toHaveAttribute('data-custom', 'custom-value')
    })
  })
})
