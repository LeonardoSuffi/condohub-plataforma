import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  // ========================================
  // Rendering Tests
  // ========================================

  describe('rendering', () => {
    it('renders with default variant', () => {
      render(<Button>Click me</Button>)

      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-primary')
    })

    it('renders children correctly', () => {
      render(<Button>Test Button</Button>)

      expect(screen.getByText('Test Button')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<Button className="custom-class">Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })
  })

  // ========================================
  // Variant Tests
  // ========================================

  describe('variants', () => {
    it('renders with destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive')
    })

    it('renders with outline variant', () => {
      render(<Button variant="outline">Outline</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('border')
      expect(button).toHaveClass('bg-background')
    })

    it('renders with secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary')
    })

    it('renders with ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent')
    })

    it('renders with link variant', () => {
      render(<Button variant="link">Link</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-primary')
      expect(button).toHaveClass('underline-offset-4')
    })

    it('renders with success variant', () => {
      render(<Button variant="success">Success</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-success')
    })

    it('renders with warning variant', () => {
      render(<Button variant="warning">Warning</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-warning')
    })

    it('renders with info variant', () => {
      render(<Button variant="info">Info</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-info')
    })
  })

  // ========================================
  // Size Tests
  // ========================================

  describe('sizes', () => {
    it('renders with default size', () => {
      render(<Button>Default</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10')
      expect(button).toHaveClass('px-4')
    })

    it('renders with small size', () => {
      render(<Button size="sm">Small</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9')
      expect(button).toHaveClass('px-3')
    })

    it('renders with large size', () => {
      render(<Button size="lg">Large</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-11')
      expect(button).toHaveClass('px-8')
    })

    it('renders with icon size', () => {
      render(<Button size="icon">+</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10')
      expect(button).toHaveClass('w-10')
    })
  })

  // ========================================
  // Disabled State Tests
  // ========================================

  describe('disabled state', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('has disabled styles', () => {
      render(<Button disabled>Disabled</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('disabled:opacity-50')
    })

    it('does not call onClick when disabled', () => {
      const handleClick = vi.fn()
      render(<Button disabled onClick={handleClick}>Click</Button>)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  // ========================================
  // Loading State Tests
  // ========================================

  describe('loading state', () => {
    it('is disabled when loading', () => {
      render(<Button loading>Loading</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('shows loading spinner when loading', () => {
      render(<Button loading>Loading</Button>)

      // Check for the Loader2 icon (svg with animate-spin class)
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('does not call onClick when loading', () => {
      const handleClick = vi.fn()
      render(<Button loading onClick={handleClick}>Click</Button>)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('still shows children text when loading', () => {
      render(<Button loading>Submit</Button>)

      expect(screen.getByText('Submit')).toBeInTheDocument()
    })
  })

  // ========================================
  // Click Handler Tests
  // ========================================

  describe('click handler', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('passes event to onClick handler', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalledWith(expect.any(Object))
    })
  })

  // ========================================
  // asChild Tests
  // ========================================

  describe('asChild prop', () => {
    it('renders as child element when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )

      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })

    it('applies button styles to child element', () => {
      render(
        <Button asChild variant="destructive">
          <a href="/test">Link Button</a>
        </Button>
      )

      const link = screen.getByRole('link')
      expect(link).toHaveClass('bg-destructive')
    })
  })

  // ========================================
  // Ref Forwarding Tests
  // ========================================

  describe('ref forwarding', () => {
    it('forwards ref to button element', () => {
      const ref = { current: null }
      render(<Button ref={ref}>Button</Button>)

      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })

  // ========================================
  // Type Attribute Tests
  // ========================================

  describe('type attribute', () => {
    it('renders as a button element', () => {
      render(<Button>Button</Button>)

      const button = screen.getByRole('button')
      expect(button.tagName).toBe('BUTTON')
    })

    it('accepts submit type', () => {
      render(<Button type="submit">Submit</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })
  })

  // ========================================
  // Accessibility Tests
  // ========================================

  describe('accessibility', () => {
    it('has correct focus styles', () => {
      render(<Button>Focus me</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:ring-2')
    })

    it('supports aria-label', () => {
      render(<Button aria-label="Close dialog">X</Button>)

      const button = screen.getByRole('button', { name: /close dialog/i })
      expect(button).toBeInTheDocument()
    })
  })
})
