# PWA and Performance Implementation Guide

## Overview

This document describes the Progressive Web App (PWA) and performance optimization features implemented in the PCC Portal system.

## PWA Features

### Service Worker

The service worker (`public/sw.js`) provides:

- **Offline Support**: Critical assets are cached for offline access
- **Background Sync**: Offline actions are synced when connection is restored
- **Push Notifications**: Real-time notifications even when app is closed
- **Cache Strategies**:
  - Network-first for API requests and HTML pages
  - Cache-first for images and static assets

### Web App Manifest

The manifest (`public/manifest.json`) defines:

- App name, icons, and theme colors
- Display mode (standalone)
- Shortcuts to key features
- Screenshots for app stores

### Installation

Users can install the app:

1. **Automatic Prompt**: Shows after 30 seconds if not dismissed
2. **Manual Install**: Via browser menu or install button
3. **Platform Support**: Works on iOS, Android, and desktop browsers

### Offline Capabilities

Features available offline:

- Digital ID viewing
- Cached event tickets
- Previously loaded content
- Offline page with connection status

## Responsive Design

### Layout Components

#### ResponsiveContainer
```tsx
<ResponsiveContainer maxWidth="xl" padding={true}>
  {/* Content */}
</ResponsiveContainer>
```

#### ResponsiveGrid
```tsx
<ResponsiveGrid cols={{ default: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
  {/* Grid items */}
</ResponsiveGrid>
```

#### ResponsiveCard
```tsx
<ResponsiveCard padding="md" hover={true}>
  {/* Card content */}
</ResponsiveCard>
```

### Touch-Optimized Components

#### TouchButton
- Minimum 44px height for touch targets
- Active state feedback
- Loading states
- Multiple variants and sizes

#### TouchInput
- Minimum 44px height
- Clear error states
- Helper text support
- Full accessibility support

### Mobile Navigation

The `MobileNav` component provides:

- Slide-out menu for mobile devices
- Touch-friendly navigation
- Icon-based menu items
- Smooth animations

## Accessibility

### WCAG 2.1 AA Compliance

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Visible focus indicators
- **Skip Links**: Skip to main content link
- **Color Contrast**: Meets WCAG contrast requirements

### Accessibility Components

#### SkipToContent
```tsx
<SkipToContent />
```

#### ScreenReaderOnly
```tsx
<ScreenReaderOnly>
  Hidden text for screen readers
</ScreenReaderOnly>
```

### Reduced Motion

Respects `prefers-reduced-motion` media query to disable animations for users who prefer reduced motion.

## Performance Optimization

### Code Splitting

Next.js automatically splits code by route. Additional optimizations:

- Dynamic imports for heavy components
- Lazy loading for below-the-fold content
- Route-based code splitting

### Image Optimization

#### LazyImage Component
```tsx
<LazyImage
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false}
/>
```

Features:
- Intersection Observer for lazy loading
- Placeholder images
- Automatic optimization via Next.js Image

### Loading States

#### SkeletonLoader
```tsx
<SkeletonLoader variant="card" />
<CardSkeleton />
<ListSkeleton count={3} />
<TableSkeleton rows={5} cols={4} />
```

### Data Fetching Optimization

#### Caching
```typescript
import { fetchWithCache } from '@/lib/dataFetching';

const data = await fetchWithCache('/api/data', {}, 5 * 60 * 1000);
```

#### Batch Requests
```typescript
import { batchRequests } from '@/lib/dataFetching';

const results = await batchRequests([
  () => fetch('/api/users'),
  () => fetch('/api/posts'),
  () => fetch('/api/comments')
]);
```

#### Retry Logic
```typescript
import { fetchWithRetry } from '@/lib/dataFetching';

const data = await fetchWithRetry('/api/data', {}, 3, 1000);
```

### Performance Monitoring

The `PerformanceMonitor` component tracks:

- **First Contentful Paint (FCP)**
- **Largest Contentful Paint (LCP)**
- **First Input Delay (FID)**
- **Cumulative Layout Shift (CLS)**
- **Time to First Byte (TTFB)**
- **Long Tasks** (>50ms)

### Custom Hooks

#### useMediaQuery
```typescript
const isMobile = useIsMobile();
const isTablet = useIsTablet();
const isDesktop = useIsDesktop();
const isTouch = useIsTouchDevice();
```

#### useDebounce
```typescript
const debouncedValue = useDebounce(searchTerm, 500);
```

#### useIntersectionObserver
```typescript
const [ref, isIntersecting] = useIntersectionObserver({
  threshold: 0.5,
  rootMargin: '50px'
});
```

#### useLazyLoad
```typescript
const [ref, data, isLoading, error] = useLazyLoad(
  () => fetch('/api/data').then(r => r.json())
);
```

#### usePWA
```typescript
const {
  isInstalled,
  isOnline,
  canInstall,
  notificationPermission,
  promptInstall,
  enableNotifications
} = usePWA();
```

## Performance Best Practices

### 1. Minimize Bundle Size

- Use dynamic imports for large dependencies
- Remove unused dependencies
- Use tree-shaking compatible libraries

### 2. Optimize Images

- Use WebP format when possible
- Provide multiple sizes for responsive images
- Use lazy loading for below-the-fold images
- Compress images before upload

### 3. Reduce Network Requests

- Batch API calls when possible
- Use caching strategies
- Implement request deduplication
- Use HTTP/2 multiplexing

### 4. Optimize Rendering

- Use React.memo for expensive components
- Implement virtualization for long lists
- Avoid unnecessary re-renders
- Use CSS for animations when possible

### 5. Monitor Performance

- Track Core Web Vitals
- Monitor bundle sizes
- Profile component render times
- Test on real devices

## Testing

### PWA Testing

```bash
# Test service worker registration
npm run dev
# Open DevTools > Application > Service Workers

# Test offline functionality
# Open DevTools > Network > Offline checkbox

# Test install prompt
# Open DevTools > Application > Manifest
```

### Performance Testing

```bash
# Run Lighthouse audit
npm run build
npm start
# Open DevTools > Lighthouse > Run audit

# Run performance tests
npm test -- performance.test.ts
```

### Accessibility Testing

```bash
# Run axe accessibility tests
npm test -- accessibility.test.ts

# Manual testing with screen reader
# Use NVDA (Windows) or VoiceOver (Mac)
```

## Browser Support

### PWA Features

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Partial support (no push notifications)
- iOS Safari: Install to home screen supported

### Performance Features

- All modern browsers support Intersection Observer
- Service Workers supported in all major browsers
- Web Vitals tracking works in Chrome-based browsers

## Deployment Checklist

- [ ] Generate app icons in all required sizes
- [ ] Configure VAPID keys for push notifications
- [ ] Set up analytics endpoint for performance metrics
- [ ] Test offline functionality
- [ ] Test install prompt on mobile devices
- [ ] Run Lighthouse audit (score > 90)
- [ ] Test on real devices (iOS and Android)
- [ ] Verify HTTPS is enabled
- [ ] Test service worker updates
- [ ] Configure cache headers

## Environment Variables

```env
# PWA Configuration
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key

# Performance Monitoring
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://your-analytics-endpoint.com/api/metrics
```

## Troubleshooting

### Service Worker Not Registering

1. Ensure HTTPS is enabled (or localhost for development)
2. Check browser console for errors
3. Verify sw.js is accessible at /sw.js
4. Clear browser cache and reload

### Install Prompt Not Showing

1. Check if app is already installed
2. Verify manifest.json is valid
3. Ensure all required icons are present
4. Check browser compatibility

### Poor Performance

1. Run Lighthouse audit to identify issues
2. Check bundle size with webpack-bundle-analyzer
3. Profile component render times
4. Verify images are optimized
5. Check for memory leaks

### Offline Features Not Working

1. Verify service worker is active
2. Check cache storage in DevTools
3. Test network requests in offline mode
4. Verify cache strategies are correct

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
