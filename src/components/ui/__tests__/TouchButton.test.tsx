import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TouchButton from '../TouchButton';

describe('TouchButton', () => {
  it('should render children', () => {
    render(<TouchButton>Click me</TouchButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<TouchButton onClick={handleClick}>Click me</TouchButton>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<TouchButton disabled>Click me</TouchButton>);
    const button = screen.getByText('Click me');
    expect(button).toBeDisabled();
  });

  it('should show loading state', () => {
    render(<TouchButton loading>Click me</TouchButton>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should not trigger click when loading', () => {
    const handleClick = vi.fn();
    render(<TouchButton loading onClick={handleClick}>Click me</TouchButton>);
    
    const button = screen.getByText('Loading...').closest('button');
    if (button) {
      fireEvent.click(button);
    }
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply primary variant by default', () => {
    const { container } = render(<TouchButton>Click me</TouchButton>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-blue-600');
  });

  it('should apply custom variant', () => {
    const { container } = render(<TouchButton variant="danger">Click me</TouchButton>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-red-600');
  });

  it('should apply full width class', () => {
    const { container } = render(<TouchButton fullWidth>Click me</TouchButton>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('w-full');
  });

  it('should apply different sizes', () => {
    const { container: smallContainer } = render(<TouchButton size="sm">Small</TouchButton>);
    const { container: largeContainer } = render(<TouchButton size="lg">Large</TouchButton>);
    
    const smallButton = smallContainer.querySelector('button');
    const largeButton = largeContainer.querySelector('button');
    
    expect(smallButton?.className).toContain('text-sm');
    expect(largeButton?.className).toContain('text-lg');
  });
});
