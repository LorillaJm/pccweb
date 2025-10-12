'use client';

import { useEffect } from 'react';
import { reportWebVitals, monitorLongTasks } from '@/lib/performance';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Monitor long tasks
    monitorLongTasks((duration) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Long task detected: ${duration.toFixed(2)}ms`);
      }
    });

    // Report web vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Observe FCP
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              reportWebVitals({
                name: 'FCP',
                value: entry.startTime,
                id: 'fcp',
                label: 'web-vital'
              });
            }
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

        // Observe LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          reportWebVitals({
            name: 'LCP',
            value: lastEntry.startTime,
            id: 'lcp',
            label: 'web-vital'
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Observe FID
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            reportWebVitals({
              name: 'FID',
              value: (entry as any).processingStart - entry.startTime,
              id: 'fid',
              label: 'web-vital'
            });
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Observe CLS
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
              reportWebVitals({
                name: 'CLS',
                value: clsValue,
                id: 'cls',
                label: 'web-vital'
              });
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.error('Failed to observe performance metrics:', error);
      }
    }
  }, []);

  return null;
}
