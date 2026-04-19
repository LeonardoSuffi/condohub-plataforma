import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './input'

describe('Input', () => {
  // ========================================
  // Rendering Tests
  // ========================================

  describe('rendering', () => {
    it('renders an input element', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter your name" />)

      const input = screen.getByPlaceholderText('Enter your name')
      expect(input).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<Input className="custom-class" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-class')
    })

    it('maintains default styles with custom className', () => {
      render(<Input className="custom-class" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('h-10')
      expect(input).toHaveClass('w-full')
      expect(input).toHaveClass('rounded-md')
    })
  })

  // ========================================
  // Type Tests
  // ========================================

  describe('type attribute', () => {
    it('renders as an input element', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input.tagName).toBe('INPUT')
    })

    it('renders with email type', () => {
      render(<Input type="email" />)

      const input = document.querySelector('input[type="email"]')
      expect(input).toBeInTheDocument()
    })

    it('renders with password type', () => {
      render(<Input type="password" />)

      const input = document.querySelector('input[type="password"]')
      expect(input).toBeInTheDocument()
    })

    it('renders with number type', () => {
      render(<Input type="number" />)

      const input = screen.getByRole('spinbutton')
      expect(input).toBeInTheDocument()
    })

    it('renders with tel type', () => {
      render(<Input type="tel" />)

      const input = document.querySelector('input[type="tel"]')
      expect(input).toBeInTheDocument()
    })
  })

  // ========================================
  // Value Tests
  // ========================================

  describe('value handling', () => {
    it('handles controlled value', () => {
      render(<Input value="test value" onChange={() => {}} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('test value')
    })

    it('handles defaultValue', () => {
      render(<Input defaultValue="default text" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('default text')
    })

    it('handles value change', async () => {
      const handleChange = vi.fn()
      render(<Input onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'hello')

      expect(handleChange).toHaveBeenCalled()
    })

    it('updates value on user input', async () => {
      const user = userEvent.setup()
      const { container } = render(<Input defaultValue="" />)

      const input = container.querySelector('input')
      await user.type(input, 'typed text')

      expect(input).toHaveValue('typed text')
    })
  })

  // ========================================
  // Disabled State Tests
  // ========================================

  describe('disabled state', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Input disabled />)

      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('has disabled styles', () => {
      render(<Input disabled />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('disabled:cursor-not-allowed')
      expect(input).toHaveClass('disabled:opacity-50')
    })

    it('does not respond to user input when disabled', async () => {
      const handleChange = vi.fn()
      render(<Input disabled onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'test')

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  // ========================================
  // Event Handler Tests
  // ========================================

  describe('event handlers', () => {
    it('calls onChange handler', async () => {
      const handleChange = vi.fn()
      render(<Input onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'new value' } })

      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('calls onFocus handler', () => {
      const handleFocus = vi.fn()
      render(<Input onFocus={handleFocus} />)

      const input = screen.getByRole('textbox')
      fireEvent.focus(input)

      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('calls onBlur handler', () => {
      const handleBlur = vi.fn()
      render(<Input onBlur={handleBlur} />)

      const input = screen.getByRole('textbox')
      fireEvent.blur(input)

      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('calls onKeyDown handler', () => {
      const handleKeyDown = vi.fn()
      render(<Input onKeyDown={handleKeyDown} />)

      const input = screen.getByRole('textbox')
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(handleKeyDown).toHaveBeenCalledTimes(1)
    })
  })

  // ========================================
  // Ref Forwarding Tests
  // ========================================

  describe('ref forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = { current: null }
      render(<Input ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it('can focus input via ref', () => {
      const ref = { current: null }
      render(<Input ref={ref} />)

      ref.current.focus()

      expect(document.activeElement).toBe(ref.current)
    })
  })

  // ========================================
  // Accessibility Tests
  // ========================================

  describe('accessibility', () => {
    it('has focus ring styles', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus-visible:ring-2')
    })

    it('supports aria-label', () => {
      render(<Input aria-label="Email address" />)

      const input = screen.getByRole('textbox', { name: /email address/i })
      expect(input).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="help-text" />
          <span id="help-text">Enter your email</span>
        </>
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('supports required attribute', () => {
      render(<Input required />)

      const input = screen.getByRole('textbox')
      expect(input).toBeRequired()
    })
  })

  // ========================================
  // Form Integration Tests
  // ========================================

  describe('form integration', () => {
    it('supports name attribute', () => {
      render(<Input name="email" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('name', 'email')
    })

    it('supports id attribute', () => {
      render(<Input id="my-input" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id', 'my-input')
    })

    it('works with label association', () => {
      render(
        <>
          <label htmlFor="test-input">Name</label>
          <Input id="test-input" />
        </>
      )

      const input = screen.getByLabelText('Name')
      expect(input).toBeInTheDocument()
    })

    it('supports autoComplete attribute', () => {
      render(<Input autoComplete="email" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('autocomplete', 'email')
    })

    it('supports minLength and maxLength', () => {
      render(<Input minLength={3} maxLength={10} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('minlength', '3')
      expect(input).toHaveAttribute('maxlength', '10')
    })
  })

  // ========================================
  // Style Tests
  // ========================================

  describe('styles', () => {
    it('has correct border styles', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border')
      expect(input).toHaveClass('border-input')
    })

    it('has correct background styles', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('bg-background')
    })

    it('has correct text styles', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('text-sm')
    })

    it('has placeholder styles', () => {
      render(<Input placeholder="Placeholder" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('placeholder:text-muted-foreground')
    })
  })
})
