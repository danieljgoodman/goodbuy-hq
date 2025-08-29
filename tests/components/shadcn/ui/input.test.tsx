import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

// Import mocks
import '../../../mocks/shadcn-mocks'

describe('Input Component', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Input data-testid="input" />)

      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter your name" />)

      const input = screen.getByPlaceholderText('Enter your name')
      expect(input).toBeInTheDocument()
    })

    it('renders with default value', () => {
      render(<Input defaultValue="Default text" />)

      const input = screen.getByDisplayValue('Default text')
      expect(input).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input ref={ref} defaultValue="Test" />)

      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      expect(ref.current?.value).toBe('Test')
    })
  })

  describe('Input Types', () => {
    it('renders text input by default', () => {
      render(<Input data-testid="text-input" />)

      const input = screen.getByTestId('text-input')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('renders email input', () => {
      render(<Input type="email" data-testid="email-input" />)

      const input = screen.getByTestId('email-input')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('renders password input', () => {
      render(<Input type="password" data-testid="password-input" />)

      const input = screen.getByTestId('password-input')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('renders number input', () => {
      render(<Input type="number" data-testid="number-input" />)

      const input = screen.getByTestId('number-input')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('renders tel input', () => {
      render(<Input type="tel" data-testid="tel-input" />)

      const input = screen.getByTestId('tel-input')
      expect(input).toHaveAttribute('type', 'tel')
    })

    it('renders url input', () => {
      render(<Input type="url" data-testid="url-input" />)

      const input = screen.getByTestId('url-input')
      expect(input).toHaveAttribute('type', 'url')
    })

    it('renders search input', () => {
      render(<Input type="search" data-testid="search-input" />)

      const input = screen.getByTestId('search-input')
      expect(input).toHaveAttribute('type', 'search')
    })
  })

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Input disabled placeholder="Disabled input" />)

      const input = screen.getByPlaceholderText('Disabled input')
      expect(input).toBeDisabled()
    })

    it('handles readonly state', () => {
      render(<Input readOnly defaultValue="Readonly text" />)

      const input = screen.getByDisplayValue('Readonly text')
      expect(input).toHaveAttribute('readonly')
    })

    it('handles required state', () => {
      render(<Input required data-testid="required-input" />)

      const input = screen.getByTestId('required-input')
      expect(input).toBeRequired()
    })

    it('handles focus state', async () => {
      render(<Input data-testid="focusable-input" />)

      const input = screen.getByTestId('focusable-input')
      input.focus()
      expect(input).toHaveFocus()
    })
  })

  describe('User Interactions', () => {
    it('handles typing', async () => {
      const user = userEvent.setup()
      render(<Input data-testid="typing-input" />)

      const input = screen.getByTestId('typing-input')
      await user.type(input, 'Hello world')

      expect(input).toHaveValue('Hello world')
    })

    it('handles clearing input', async () => {
      const user = userEvent.setup()
      render(<Input defaultValue="Initial text" data-testid="clear-input" />)

      const input = screen.getByTestId('clear-input')
      expect(input).toHaveValue('Initial text')

      await user.clear(input)
      expect(input).toHaveValue('')
    })

    it('handles paste events', async () => {
      const user = userEvent.setup()
      render(<Input data-testid="paste-input" />)

      const input = screen.getByTestId('paste-input')
      input.focus()
      await user.paste('Pasted text')

      expect(input).toHaveValue('Pasted text')
    })

    it('handles backspace', async () => {
      const user = userEvent.setup()
      render(<Input defaultValue="Delete me" data-testid="backspace-input" />)

      const input = screen.getByTestId('backspace-input')
      input.focus()
      await user.keyboard('{Backspace}{Backspace}')

      expect(input).toHaveValue('Delete ')
    })
  })

  describe('Event Handlers', () => {
    it('calls onChange when value changes', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()

      render(<Input onChange={handleChange} data-testid="change-input" />)

      const input = screen.getByTestId('change-input')
      await user.type(input, 'a')

      expect(handleChange).toHaveBeenCalled()
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: 'a',
          }),
        })
      )
    })

    it('calls onFocus when input gains focus', async () => {
      const user = userEvent.setup()
      const handleFocus = jest.fn()

      render(<Input onFocus={handleFocus} data-testid="focus-input" />)

      const input = screen.getByTestId('focus-input')
      await user.click(input)

      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('calls onBlur when input loses focus', async () => {
      const user = userEvent.setup()
      const handleBlur = jest.fn()

      render(
        <div>
          <Input onBlur={handleBlur} data-testid="blur-input" />
          <button>Other element</button>
        </div>
      )

      const input = screen.getByTestId('blur-input')
      const button = screen.getByRole('button')

      await user.click(input) // Focus
      await user.click(button) // Blur

      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('calls onKeyDown on key press', async () => {
      const user = userEvent.setup()
      const handleKeyDown = jest.fn()

      render(<Input onKeyDown={handleKeyDown} data-testid="key-input" />)

      const input = screen.getByTestId('key-input')
      input.focus()
      await user.keyboard('{Enter}')

      expect(handleKeyDown).toHaveBeenCalled()
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'Enter',
        })
      )
    })
  })

  describe('Validation', () => {
    it('handles HTML5 validation attributes', () => {
      render(
        <Input
          type="email"
          required
          minLength={5}
          maxLength={50}
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          data-testid="validation-input"
        />
      )

      const input = screen.getByTestId('validation-input')
      expect(input).toBeRequired()
      expect(input).toHaveAttribute('minlength', '5')
      expect(input).toHaveAttribute('maxlength', '50')
      expect(input).toHaveAttribute(
        'pattern',
        '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$'
      )
    })

    it('shows validation state with invalid input', async () => {
      const user = userEvent.setup()
      render(<Input type="email" required data-testid="email-validation" />)

      const input = screen.getByTestId('email-validation')
      await user.type(input, 'invalid-email')

      expect(input).toHaveValue('invalid-email')
      expect(input).toBeInvalid()
    })

    it('shows validation state with valid input', async () => {
      const user = userEvent.setup()
      render(<Input type="email" required data-testid="email-validation" />)

      const input = screen.getByTestId('email-validation')
      await user.type(input, 'valid@email.com')

      expect(input).toHaveValue('valid@email.com')
      expect(input).toBeValid()
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(
        <Input className="custom-input-class" data-testid="custom-input" />
      )

      const input = screen.getByTestId('custom-input')
      expect(input).toHaveClass('custom-input-class')
    })

    it('applies custom styles', () => {
      render(
        <Input
          style={{ backgroundColor: 'lightblue', color: 'darkblue' }}
          data-testid="styled-input"
        />
      )

      const input = screen.getByTestId('styled-input')
      expect(input).toHaveStyle({
        backgroundColor: 'lightblue',
        color: 'darkblue',
      })
    })
  })

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Input aria-label="Search products" />)

      const input = screen.getByLabelText('Search products')
      expect(input).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      render(
        <div>
          <Input aria-describedby="help-text" data-testid="described-input" />
          <div id="help-text">Enter your full name</div>
        </div>
      )

      const input = screen.getByTestId('described-input')
      expect(input).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('supports aria-invalid for error state', () => {
      render(<Input aria-invalid="true" data-testid="invalid-input" />)

      const input = screen.getByTestId('invalid-input')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('works with labels', () => {
      render(
        <div>
          <label htmlFor="labeled-input">Name</label>
          <Input id="labeled-input" />
        </div>
      )

      const input = screen.getByLabelText('Name')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('id', 'labeled-input')
    })
  })

  describe('Form Integration', () => {
    it('submits with form', async () => {
      const user = userEvent.setup()
      const handleSubmit = jest.fn(e => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        return formData.get('username')
      })

      render(
        <form onSubmit={handleSubmit}>
          <Input name="username" defaultValue="john_doe" />
          <button type="submit">Submit</button>
        </form>
      )

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      expect(handleSubmit).toHaveBeenCalled()
    })

    it('resets with form', async () => {
      const user = userEvent.setup()

      render(
        <form>
          <Input
            name="username"
            defaultValue="john_doe"
            data-testid="reset-input"
          />
          <button type="reset">Reset</button>
        </form>
      )

      const input = screen.getByTestId('reset-input') as HTMLInputElement
      const resetButton = screen.getByRole('button', { name: 'Reset' })

      // Change value
      await user.clear(input)
      await user.type(input, 'changed_value')
      expect(input.value).toBe('changed_value')

      // Reset form
      await user.click(resetButton)
      expect(input.value).toBe('john_doe')
    })
  })

  describe('Edge Cases', () => {
    it('handles null/undefined values gracefully', () => {
      render(<Input value={undefined as any} data-testid="undefined-input" />)

      const input = screen.getByTestId('undefined-input')
      expect(input).toHaveValue('')
    })

    it('handles very long strings', async () => {
      const user = userEvent.setup()
      const longString = 'a'.repeat(1000)

      render(<Input data-testid="long-string-input" />)

      const input = screen.getByTestId('long-string-input')
      await user.type(input, longString)

      expect(input).toHaveValue(longString)
    })

    it('handles special characters', async () => {
      const user = userEvent.setup()
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'

      render(<Input data-testid="special-chars-input" />)

      const input = screen.getByTestId('special-chars-input')
      await user.type(input, specialChars)

      expect(input).toHaveValue(specialChars)
    })

    it('preserves other input attributes', () => {
      render(
        <Input
          id="test-input"
          name="test"
          autoComplete="username"
          data-custom="custom-value"
          data-testid="attributes-input"
        />
      )

      const input = screen.getByTestId('attributes-input')
      expect(input).toHaveAttribute('id', 'test-input')
      expect(input).toHaveAttribute('name', 'test')
      expect(input).toHaveAttribute('autocomplete', 'username')
      expect(input).toHaveAttribute('data-custom', 'custom-value')
    })
  })
})
