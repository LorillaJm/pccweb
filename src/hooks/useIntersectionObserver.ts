'use client';

import { useEffect, useState, useRef, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [RefObject<HTMLDivElement>, boolean] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If already visible and freeze is enabled, don't observe
    if (freezeOnceVisible && isIntersecting) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible, isIntersecting]);

  return [elementRef, isIntersecting];
}

// Hook for lazy loading content when it enters viewport
export function useLazyLoad<T>(
  loadFn: () => Promise<T>,
  options: UseIntersectionObserverOptions = {}
): [RefObject<HTMLDivElement>, T | null, boolean, Error | null] {
  const [ref, isIntersecting] = useIntersectionObserver({
    ...options,
    freezeOnceVisible: true
  });
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isIntersecting && !data && !isLoading) {
      setIsLoading(true);
      loadFn()
        .then(setData)
        .catch(setError)
        .finally(() => setIsLoading(false));
    }
  }, [isIntersecting, data, isLoading, loadFn]);

  return [ref, data, isLoading, error];
}
