import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MotionProvider, useMotionContext } from '@/components/motion/MotionProvider';
import { MotionWrapper } from '@/components/motion/MotionWrapper';

describe('Motion System', () => {
  describe('useReducedMotion', () => {
    it('should return false by default', () => {
      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(false);
    });

    it('should detect prefers-reduced-motion', () => {
      // Mock matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(true);
    });
  });

  describe('MotionProvider', () => {
    it('should provide motion context', () => {
      const TestComponent = () => {
        const context = useMotionContext();
        return <div>{context.enableAnimations ? 'enabled' : 'disabled'}</div>;
      };

      render(
        <MotionProvider>
          <TestComponent />
        </MotionProvider>
      );

      expect(screen.getByText(/enabled|disabled/)).toBeInTheDocument();
    });

    it('should throw error when used outside provider', () => {
      const TestComponent = () => {
        useMotionContext();
        return <div>test</div>;
      };

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(() => render(<TestComponent />)).toThrow(
        'useMotionContext must be used within a MotionProvider'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('MotionWrapper', () => {
    it('should render children when animations are enabled', () => {
      const TestComponent = () => (
        <MotionProvider>
          <MotionWrapper fallback={<div>fallback</div>}>
            <div>animated</div>
          </MotionWrapper>
        </MotionProvider>
      );

      render(<TestComponent />);
      expect(screen.getByText('animated')).toBeInTheDocument();
    });

    it('should render fallback when reduced motion is preferred', () => {
      // Mock matchMedia to return reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const TestComponent = () => (
        <MotionProvider>
          <MotionWrapper fallback={<div>fallback</div>}>
            <div>animated</div>
          </MotionWrapper>
        </MotionProvider>
      );

      render(<TestComponent />);
      expect(screen.getByText('fallback')).toBeInTheDocument();
    });
  });
});
