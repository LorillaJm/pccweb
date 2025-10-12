import { describe, it, expect, vi, beforeEach } from 'vitest';
import { debounce, throttle, getPerformanceMetrics } from '../performance';

describe('Performance Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('debounce', () => {
    it('should delay function execution', () => {
      const func = vi.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      expect(func).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous calls', () => {
      const func = vi.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      debouncedFunc();
      debouncedFunc();

      vi.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments correctly', () => {
      const func = vi.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc('test', 123);
      vi.advanceTimersByTime(100);

      expect(func).toHaveBeenCalledWith('test', 123);
    });
  });

  describe('throttle', () => {
    it('should limit function execution', () => {
      const func = vi.fn();
      const throttledFunc = throttle(func, 100);

      throttledFunc();
      throttledFunc();
      throttledFunc();

      expect(func).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      throttledFunc();

      expect(func).toHaveBeenCalledTimes(2);
    });

    it('should execute immediately on first call', () => {
      const func = vi.fn();
      const throttledFunc = throttle(func, 100);

      throttledFunc();
      expect(func).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return empty object when performance API is not available', () => {
      const originalPerformance = global.performance;
      // @ts-ignore
      delete global.performance;

      const metrics = getPerformanceMetrics();
      expect(metrics).toEqual({});

      global.performance = originalPerformance;
    });

    it('should return metrics when available', () => {
      const mockNavigation = {
        responseStart: 100,
        requestStart: 50
      };

      vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
        mockNavigation as any
      ]);

      const metrics = getPerformanceMetrics();
      expect(metrics).toHaveProperty('ttfb');
      expect(metrics.ttfb).toBe(50);
    });
  });
});
