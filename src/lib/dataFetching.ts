// Optimized data fetching utilities

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class DataCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > entry.expiresIn;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    const isExpired = Date.now() - entry.timestamp > entry.expiresIn;
    
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

export const dataCache = new DataCache();

// Fetch with caching
export async function fetchWithCache<T>(
  url: string,
  options?: RequestInit,
  cacheTime: number = 5 * 60 * 1000
): Promise<T> {
  const cacheKey = `${url}-${JSON.stringify(options)}`;

  // Check cache first
  const cachedData = dataCache.get<T>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Fetch from network
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Cache the result
  dataCache.set(cacheKey, data, cacheTime);

  return data;
}

// Batch multiple requests
export async function batchRequests<T>(
  requests: Array<() => Promise<T>>
): Promise<T[]> {
  return Promise.all(requests.map(request => request()));
}

// Retry failed requests
export async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
      }
    }
  }

  throw lastError!;
}

// Prefetch data
export function prefetchData(url: string, options?: RequestInit) {
  if (typeof window === 'undefined') return;

  // Use link prefetch
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);

  // Also fetch and cache
  fetchWithCache(url, options).catch(console.error);
}

// Optimistic updates
export async function optimisticUpdate<T>(
  cacheKey: string,
  optimisticData: T,
  updateFn: () => Promise<T>
): Promise<T> {
  // Store current data
  const previousData = dataCache.get<T>(cacheKey);

  // Set optimistic data immediately
  dataCache.set(cacheKey, optimisticData, 60000);

  try {
    // Perform actual update
    const result = await updateFn();
    
    // Update cache with real data
    dataCache.set(cacheKey, result, 60000);
    
    return result;
  } catch (error) {
    // Rollback on error
    if (previousData) {
      dataCache.set(cacheKey, previousData, 60000);
    } else {
      dataCache.delete(cacheKey);
    }
    
    throw error;
  }
}

// Parallel data fetching with dependencies
export async function fetchWithDependencies<T>(
  fetchers: Array<{
    key: string;
    fetch: (deps?: any) => Promise<T>;
    dependencies?: string[];
  }>
): Promise<Record<string, T>> {
  const results: Record<string, T> = {};
  const pending = new Map(fetchers.map(f => [f.key, f]));

  while (pending.size > 0) {
    const ready = Array.from(pending.values()).filter(
      f => !f.dependencies || f.dependencies.every(dep => dep in results)
    );

    if (ready.length === 0) {
      throw new Error('Circular dependency detected');
    }

    await Promise.all(
      ready.map(async (fetcher) => {
        const deps = fetcher.dependencies?.reduce((acc, dep) => {
          acc[dep] = results[dep];
          return acc;
        }, {} as any);

        results[fetcher.key] = await fetcher.fetch(deps);
        pending.delete(fetcher.key);
      })
    );
  }

  return results;
}
