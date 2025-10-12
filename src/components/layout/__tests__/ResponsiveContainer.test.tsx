import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResponsiveContainer from '../ResponsiveContainer';

describe('ResponsiveContainer', () => {
  it('should render children', () => {
    render(
      <ResponsiveContainer>
        <div>Test Content</div>
      </ResponsiveContainer>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply default max-width class', () => {
    const { container } = render(
      <ResponsiveContainer>
        <div>Test</div>
      </ResponsiveContainer>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('max-w-screen-xl');
  });

  it('should apply custom max-width class', () => {
    const { container } = render(
      <ResponsiveContainer maxWidth="md">
        <div>Test</div>
      </ResponsiveContainer>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('max-w-screen-md');
  });

  it('should apply padding by default', () => {
    const { container } = render(
      <ResponsiveContainer>
        <div>Test</div>
      </ResponsiveContainer>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('px-4');
  });

  it('should not apply padding when padding is false', () => {
    const { container } = render(
      <ResponsiveContainer padding={false}>
        <div>Test</div>
      </ResponsiveContainer>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).not.toContain('px-4');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ResponsiveContainer className="custom-class">
        <div>Test</div>
      </ResponsiveContainer>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-class');
  });
});
