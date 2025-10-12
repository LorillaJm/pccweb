# Motion System

This directory contains the motion context and utilities for managing animations throughout the application.

## Components

### MotionProvider

The `MotionProvider` wraps the entire application and provides motion preferences and performance monitoring.

**Features:**
- Detects user's `prefers-reduced-motion` preference
- Monitors FPS and automatically adjusts performance mode
- Provides context for all animation components

**Usage:**
```tsx
// Already integrated in src/app/layout.tsx
<MotionProvider>
  <App />
</MotionProvider>
```

### MotionWrapper

Conditionally renders animations based on user preferences and performance.

**Props:**
- `children`: Animated content to render
- `fallback`: Static content to render when animations are disabled
- `respectPerformance`: (optional) Whether to respect performance mode

**Usage:**
```tsx
import { MotionWrapper } from '@/components/motion/MotionWrapper';

<MotionWrapper 
  fallback={<div className="static-card">Content</div>}
  respectPerformance
>
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="animated-card"
  >
    Content
  </motion.div>
</MotionWrapper>
```

## Hooks

### useReducedMotion

Detects if the user prefers reduced motion.

**Returns:** `boolean` - `true` if user prefers reduced motion

**Usage:**
```tsx
import { useReducedMotion } from '@/hooks/useReducedMotion';

function MyComponent() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div>
      {prefersReducedMotion ? (
        <StaticContent />
      ) : (
        <AnimatedContent />
      )}
    </div>
  );
}
```

### useMotionContext

Access the motion context for animation preferences and performance data.

**Returns:** `MotionContextValue`
- `prefersReducedMotion`: boolean
- `enableAnimations`: boolean (inverse of prefersReducedMotion)
- `performanceMode`: 'high' | 'medium' | 'low'
- `setPerformanceMode`: Function to manually set performance mode

**Usage:**
```tsx
import { useMotionContext } from '@/components/motion/MotionProvider';

function MyComponent() {
  const { enableAnimations, performanceMode } = useMotionContext();
  
  return (
    <div>
      Animations: {enableAnimations ? 'enabled' : 'disabled'}
      Performance: {performanceMode}
    </div>
  );
}
```

## Performance Monitoring

The `MotionProvider` automatically monitors FPS and adjusts the performance mode:

- **High mode** (FPS ≥ 55): All animations enabled
- **Medium mode** (45 ≤ FPS < 55): Reduced animation complexity
- **Low mode** (FPS < 45): Minimal animations

Components can use `respectPerformance` prop in `MotionWrapper` to automatically disable animations in low performance mode.

## Accessibility

The motion system respects the user's `prefers-reduced-motion` setting:

- When enabled, all animations are disabled by default
- Components wrapped in `MotionWrapper` automatically show fallback content
- Ensures WCAG 2.1 compliance for motion sensitivity

## Requirements Satisfied

- **6.1**: Respects `prefers-reduced-motion` preference across all animations
- **6.4**: Maintains functionality with instant state changes when animations are disabled
- **7.1**: Monitors and maintains 60 FPS on desktop devices
- **7.2**: Monitors and maintains 50-60 FPS on mobile devices
