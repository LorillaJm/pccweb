# Quick Start Guide: PWA and Performance Features

## For Developers

### Using PWA Features

#### Check if app is installed
```typescript
import { usePWA } from '@/hooks/usePWA';

function MyComponent() {
  const { isInstalled, canInstall, promptInstall } = usePWA();
  
  return (
    <div>
      {!isInstalled && canInstall && (
        <button onClick={promptInstall}>
          Install App
        </button>
      )}
    </div>
  );
}
```

#### Check online status
```typescript
import { usePWA } from '@/hooks/usePWA';

function MyComponent() {
  const { isOnline } = usePWA();
  
  return (
    <div>
      {!isOnline && <p>You're offline</p>}
    </div>
  );
}
```

#### Enable notifications
```typescript
import { usePWA } from '@/hooks/usePWA';

function MyComponent() {
  const { enableNotifications, notificationPermission } = usePWA();
  
  const handleEnableNotifications = async () => {
    const granted = await enableNotifications();
    if (granted) {
      console.log('Notifications enabled');
    }
  };
  
  return (
    <button onClick={handleEnableNotifications}>
      Enable Notifications
    </button>
  );
}
```

### Using Responsive Components

#### Responsive Container
```typescript
import ResponsiveContainer from '@/components/layout/ResponsiveContainer';

<ResponsiveContainer maxWidth="xl" padding={true}>
  <h1>My Content</h1>
</ResponsiveContainer>
```

#### Responsive Grid
```typescript
import ResponsiveGrid from '@/components/layout/ResponsiveGrid';

<ResponsiveGrid cols={{ default: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</ResponsiveGrid>
```

#### Touch Button
```typescript
import TouchButton from '@/components/ui/TouchButton';

<TouchButton 
  variant="primary" 
  size="md" 
  fullWidth={false}
  loading={false}
  onClick={handleClick}
>
  Click Me
</TouchButton>
```

#### Touch Input
```typescript
import TouchInput from '@/components/ui/TouchInput';

<TouchInput
  label="Email"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
  fullWidth={true}
/>
```

### Using Performance Features

#### Lazy Load Images
```typescript
import LazyImage from '@/components/ui/LazyImage';

<LazyImage
  src="/images/photo.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false}
/>
```

#### Skeleton Loaders
```typescript
import SkeletonLoader, { CardSkeleton, ListSkeleton } from '@/components/ui/SkeletonLoader';

// Simple skeleton
<SkeletonLoader variant="text" width="80%" />

// Card skeleton
<CardSkeleton />

// List skeleton
<ListSkeleton count={3} />
```

#### Fetch with Cache
```typescript
import { fetchWithCache } from '@/lib/dataFetching';

const data = await fetchWithCache(
  '/api/users',
  { method: 'GET' },
  5 * 60 * 1000 // Cache for 5 minutes
);
```

#### Batch Requests
```typescript
import { batchRequests } from '@/lib/dataFetching';

const [users, posts, comments] = await batchRequests([
  () => fetch('/api/users').then(r => r.json()),
  () => fetch('/api/posts').then(r => r.json()),
  () => fetch('/api/comments').then(r => r.json())
]);
```

#### Debounce Values
```typescript
import { useDebounce } from '@/hooks/useDebounce';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    // This only runs 500ms after user stops typing
    if (debouncedSearch) {
      performSearch(debouncedSearch);
    }
  }, [debouncedSearch]);
  
  return (
    <input 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
}
```

#### Intersection Observer
```typescript
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

function LazyComponent() {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: '50px'
  });
  
  return (
    <div ref={ref}>
      {isIntersecting && <ExpensiveComponent />}
    </div>
  );
}
```

#### Lazy Load Data
```typescript
import { useLazyLoad } from '@/hooks/useIntersectionObserver';

function DataComponent() {
  const [ref, data, isLoading, error] = useLazyLoad(
    () => fetch('/api/data').then(r => r.json())
  );
  
  return (
    <div ref={ref}>
      {isLoading && <SkeletonLoader />}
      {error && <p>Error loading data</p>}
      {data && <DataDisplay data={data} />}
    </div>
  );
}
```

### Using Media Query Hooks

```typescript
import { useIsMobile, useIsTablet, useIsDesktop, useIsTouchDevice } from '@/hooks/useMediaQuery';

function ResponsiveComponent() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const isTouch = useIsTouchDevice();
  
  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
      {isTouch && <p>Touch device detected</p>}
    </div>
  );
}
```

### Accessibility

#### Skip to Content
```typescript
import SkipToContent from '@/components/accessibility/SkipToContent';

// Add at the top of your layout
<SkipToContent />
```

#### Screen Reader Only
```typescript
import ScreenReaderOnly from '@/components/accessibility/ScreenReaderOnly';

<button>
  <Icon />
  <ScreenReaderOnly>Delete item</ScreenReaderOnly>
</button>
```

## Common Patterns

### Loading State with Skeleton
```typescript
function DataList() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData().then(setData).finally(() => setLoading(false));
  }, []);
  
  if (loading) {
    return <ListSkeleton count={5} />;
  }
  
  return <List data={data} />;
}
```

### Responsive Layout
```typescript
function PageLayout() {
  return (
    <ResponsiveContainer maxWidth="xl">
      <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap={6}>
        <ResponsiveCard hover={true}>
          <h2>Card 1</h2>
        </ResponsiveCard>
        <ResponsiveCard hover={true}>
          <h2>Card 2</h2>
        </ResponsiveCard>
        <ResponsiveCard hover={true}>
          <h2>Card 3</h2>
        </ResponsiveCard>
      </ResponsiveGrid>
    </ResponsiveContainer>
  );
}
```

### Form with Touch Inputs
```typescript
function ContactForm() {
  return (
    <form>
      <TouchInput
        label="Name"
        type="text"
        fullWidth={true}
        required
      />
      <TouchInput
        label="Email"
        type="email"
        fullWidth={true}
        required
      />
      <TouchButton
        type="submit"
        variant="primary"
        size="lg"
        fullWidth={true}
      >
        Submit
      </TouchButton>
    </form>
  );
}
```

### Optimized Data Fetching
```typescript
async function fetchUserData(userId: string) {
  // Try cache first
  const cached = dataCache.get(`user-${userId}`);
  if (cached) return cached;
  
  // Fetch with retry
  const data = await fetchWithRetry(`/api/users/${userId}`, {}, 3, 1000);
  
  // Cache result
  dataCache.set(`user-${userId}`, data, 5 * 60 * 1000);
  
  return data;
}
```

## Performance Tips

1. **Use lazy loading for images below the fold**
2. **Implement skeleton screens for better perceived performance**
3. **Cache API responses when appropriate**
4. **Debounce search inputs and form validations**
5. **Use intersection observer for lazy loading components**
6. **Batch multiple API requests when possible**
7. **Implement optimistic updates for better UX**
8. **Monitor Web Vitals in production**

## Debugging

### Check Service Worker Status
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

### Check Cache Storage
```javascript
// In browser console
caches.keys().then(keys => {
  console.log('Cache keys:', keys);
  keys.forEach(key => {
    caches.open(key).then(cache => {
      cache.keys().then(requests => {
        console.log(`${key}:`, requests.map(r => r.url));
      });
    });
  });
});
```

### Monitor Performance
```javascript
// In browser console
performance.getEntriesByType('navigation');
performance.getEntriesByType('paint');
performance.getEntriesByType('largest-contentful-paint');
```

## Resources

- Full Documentation: `PWA_PERFORMANCE_GUIDE.md`
- Completion Summary: `TASK_8_COMPLETION_SUMMARY.md`
- Deployment Checklist: `TASK_8_DEPLOYMENT_CHECKLIST.md`

---

**Quick Start Version:** 1.0
**Last Updated:** 2025-10-02
