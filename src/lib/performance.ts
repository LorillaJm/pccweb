// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

// Report Web Vitals
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }

  // Send to analytics endpoint
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      label: metric.label,
      timestamp: Date.now()
    });

    // Use sendBeacon if available
    if (navigator.sendBeacon) {
      navigator.sendBeacon(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, body);
    } else {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        body,
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(console.error);
    }
  }
}

// Measure component render time
export function measureRenderTime(componentName: string, callback: () => void) {
  if (typeof window === 'undefined') {
    callback();
    return;
  }

  const startTime = performance.now();
  callback();
  const endTime = performance.now();
  const renderTime = endTime - startTime;

  if (process.env.NODE_ENV === 'development') {
    console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
  }

  // Log slow renders
  if (renderTime > 16) { // More than one frame at 60fps
    console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
  }
}

// Debounce function for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Lazy load images
export function lazyLoadImage(
  src: string,
  placeholder?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(src);
    img.onerror = reject;
  });
}

// Preload critical resources
export function preloadResource(href: string, as: string) {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

// Prefetch resources
export function prefetchResource(href: string) {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

// Check if resource is cached
export async function isResourceCached(url: string): Promise<boolean> {
  if (typeof caches === 'undefined') return false;

  try {
    const cache = await caches.open('pcc-runtime-v1');
    const response = await cache.match(url);
    return !!response;
  } catch {
    return false;
  }
}

// Measure API response time
export async function measureApiCall<T>(
  apiCall: () => Promise<T>,
  endpoint: string
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await apiCall();
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (process.env.NODE_ENV === 'development') {
      console.log(`API call to ${endpoint}: ${duration.toFixed(2)}ms`);
    }

    // Log slow API calls
    if (duration > 1000) {
      console.warn(`Slow API call detected: ${endpoint} took ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.error(`API call to ${endpoint} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
}

// Get performance metrics
export function getPerformanceMetrics(): PerformanceMetrics {
  if (typeof window === 'undefined' || !window.performance) {
    return {};
  }

  const metrics: PerformanceMetrics = {};

  // Get navigation timing
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    metrics.ttfb = navigation.responseStart - navigation.requestStart;
  }

  // Get paint timing
  const paintEntries = performance.getEntriesByType('paint');
  const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
  if (fcp) {
    metrics.fcp = fcp.startTime;
  }

  return metrics;
}

// Monitor long tasks
export function monitorLongTasks(callback: (duration: number) => void) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms
          callback(entry.duration);
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (error) {
    console.error('Failed to observe long tasks:', error);
  }
}

// Calculate bundle size impact
export function logBundleSize(moduleName: string, size: number) {
  if (process.env.NODE_ENV === 'development') {
    const sizeInKB = (size / 1024).toFixed(2);
    console.log(`Module ${moduleName}: ${sizeInKB} KB`);
  }
}
