import { useState, useEffect, useRef } from 'react';

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  isLowPerformance: boolean;
  performanceMode: 'high' | 'medium' | 'low';
}

/**
 * Hook for monitoring animation performance
 * Measures FPS using requestAnimationFrame and determines performance status
 * 
 * @returns PerformanceMetrics object with current performance data
 */
export const usePerformance = (): PerformanceMetrics => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    isLowPerformance: false,
    performanceMode: 'high',
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameIdRef = useRef<number>();

  useEffect(() => {
    const measureFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTimeRef.current;

      // Calculate FPS every second
      if (elapsed >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / elapsed);
        const frameTime = elapsed / frameCountRef.current;

        // Determine performance mode based on FPS
        let performanceMode: 'high' | 'medium' | 'low' = 'high';
        let isLowPerformance = false;

        if (fps < 30) {
          performanceMode = 'low';
          isLowPerformance = true;
        } else if (fps < 50) {
          performanceMode = 'medium';
          isLowPerformance = true;
        }

        setMetrics({
          fps,
          frameTime: Math.round(frameTime * 100) / 100,
          isLowPerformance,
          performanceMode,
        });

        // Reset counters
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationFrameIdRef.current = requestAnimationFrame(measureFPS);
    };

    // Start monitoring
    animationFrameIdRef.current = requestAnimationFrame(measureFPS);

    // Cleanup
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  return metrics;
};
