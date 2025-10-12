# Design Document

## Overview

This design document outlines the architecture and implementation strategy for transforming the Passi City College frontend into a premium, high-performance experience with sophisticated animations and microinteractions. The solution leverages Framer Motion for React/Next.js, implements a comprehensive design system with the specified color palette, and ensures accessibility and performance across all devices.

The implementation focuses on six main pages: Home, About, Programs, Admissions, News & Events, and Contact. The design prioritizes GPU-accelerated animations, respects user motion preferences, and maintains 50-60 FPS on mid-range mobile devices.

## Architecture

### Technology Stack

- **Framework**: Next.js 15.5.2 (already in use)
- **Animation Library**: Framer Motion 11.x (to be added)
- **Styling**: Tailwind CSS 4.x (already in use)
- **Typography**: Inter, Poppins, Space Grotesk (Google Fonts)
- **State Management**: React hooks for animation states
- **Performance Monitoring**: React DevTools Profiler + custom performance hooks

### Design System Foundation

#### Color Palette
```typescript
// src/styles/theme.ts
export const premiumTheme = {
  colors: {
    primary: '#0B132B',      // Very dark navy
    accent: '#FF5A5F',       // Vibrant coral (CTA)
    secondary: '#00D4FF',    // Electric cyan
    surface: '#0F1724',      // Dark surface (cards)
    textLight: '#F8FAFC',    // Near white
    textMuted: '#9AA4B2',    // Muted text
  },
  typography: {
    headline: {
      fontFamily: 'var(--font-headline)',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    body: {
      fontFamily: 'var(--font-body)',
      fontWeight: 400,
    },
    cta: {
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
    },
  },
  scale: {
    h1: '48px',
    h2: '28px',
    body: '16px',
  },
};
```

### Component Architecture

```
src/
├── components/
│   ├── animations/
│   │   ├── HeroMorph.tsx           # Morphing blob with parallax
│   │   ├── PageTransition.tsx      # Framer Motion page wrapper
│   │   ├── LoadingMask.tsx         # Full-screen loading animation
│   │   ├── CardHover.tsx           # Reusable card hover wrapper
│   │   ├── ButtonRipple.tsx        # CTA microinteraction
│   │   ├── SVGLineDraw.tsx         # SVG line-drawing animation
│   │   └── CursorTrail.tsx         # Optional cursor effect
│   ├── motion/
│   │   ├── MotionProvider.tsx      # Motion preferences context
│   │   ├── MotionWrapper.tsx       # Conditional animation wrapper
│   │   └── useReducedMotion.ts     # Hook for motion preferences
│   └── premium/
│       ├── PremiumButton.tsx       # Enhanced button with ripple
│       ├── PremiumCard.tsx         # Card with hover morphing
│       ├── PremiumInput.tsx        # Input with focus animations
│       └── PremiumHero.tsx         # Hero section component
├── hooks/
│   ├── useParallax.ts              # Parallax scroll hook
│   ├── useInView.ts                # Intersection observer hook
│   └── usePerformance.ts           # FPS monitoring hook
├── styles/
│   ├── theme.ts                    # Design system tokens
│   ├── animations.css              # Custom CSS animations
│   └── premium.css                 # Premium-specific styles
└── utils/
    ├── animationConfig.ts          # Framer Motion configs
    └── performanceUtils.ts         # Performance helpers
```

## Components and Interfaces

### 1. Motion Provider & Context

```typescript
// src/components/motion/MotionProvider.tsx
interface MotionContextValue {
  prefersReducedMotion: boolean;
  enableAnimations: boolean;
  performanceMode: 'high' | 'medium' | 'low';
}

export const MotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [performanceMode, setPerformanceMode] = useState<'high' | 'medium' | 'low'>('high');
  
  // Monitor FPS and adjust performance mode
  useEffect(() => {
    // Performance monitoring logic
  }, []);
  
  return (
    <MotionContext.Provider value={{ prefersReducedMotion, enableAnimations: !prefersReducedMotion, performanceMode }}>
      {children}
    </MotionContext.Provider>
  );
};
```

### 2. Hero Morphing Blob

```typescript
// src/components/animations/HeroMorph.tsx
interface HeroMorphProps {
  colors: string[];
  speed?: number;
  parallaxIntensity?: number;
}

export const HeroMorph: React.FC<HeroMorphProps> = ({ colors, speed = 1, parallaxIntensity = 0.5 }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150 * parallaxIntensity]);
  
  return (
    <motion.div
      style={{ y }}
      className="absolute inset-0 overflow-hidden"
    >
      <svg viewBox="0 0 1000 1000" className="w-full h-full">
        <defs>
          <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        <motion.path
          d="M500,300 Q700,400 600,600 T400,500 Q300,400 500,300"
          fill="url(#blobGradient)"
          animate={{
            d: [
              "M500,300 Q700,400 600,600 T400,500 Q300,400 500,300",
              "M500,350 Q650,450 550,650 T450,550 Q350,450 500,350",
              "M500,300 Q700,400 600,600 T400,500 Q300,400 500,300",
            ],
          }}
          transition={{
            duration: 8 / speed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </motion.div>
  );
};
```

### 3. Page Transition Wrapper

```typescript
// src/components/animations/PageTransition.tsx
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
  const { prefersReducedMotion } = useMotionContext();
  
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }
  
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
```

### 4. Loading Mask

```typescript
// src/components/animations/LoadingMask.tsx
export const LoadingMask: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 bg-primary flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 0,
            borderRadius: '100%',
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="w-24 h-24 border-4 border-accent border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

### 5. Premium Card with Hover Morph

```typescript
// src/components/premium/PremiumCard.tsx
interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({ 
  children, 
  className, 
  hoverScale = 1.03 
}) => {
  const { prefersReducedMotion } = useMotionContext();
  
  const cardVariants = {
    rest: { 
      scale: 1, 
      borderRadius: '1rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    hover: { 
      scale: hoverScale,
      borderRadius: '1.5rem',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    },
  };
  
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }
  
  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
```

### 6. Button with Ripple Effect

```typescript
// src/components/premium/PremiumButton.tsx
export const PremiumButton: React.FC<ButtonProps> = ({ children, onClick, ...props }) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRipples([...ripples, { x, y, id: Date.now() }]);
    onClick?.(e);
    
    setTimeout(() => {
      setRipples(ripples => ripples.slice(1));
    }, 600);
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="relative overflow-hidden"
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
          animate={{
            width: 300,
            height: 300,
            x: -150,
            y: -150,
            opacity: [0.5, 0],
          }}
          transition={{ duration: 0.6 }}
        />
      ))}
    </motion.button>
  );
};
```

## Data Models

### Animation Configuration

```typescript
// src/utils/animationConfig.ts
export const animationConfig = {
  // Easing curves
  easing: {
    smooth: [0.22, 1, 0.36, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
    sharp: [0.4, 0, 0.2, 1],
  },
  
  // Duration presets
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
  },
  
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  
  // Card hover
  cardHover: {
    rest: { scale: 1, borderRadius: '1rem' },
    hover: { scale: 1.03, borderRadius: '1.5rem' },
    transition: { duration: 0.25 },
  },
  
  // Button interactions
  button: {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    transition: { duration: 0.15 },
  },
};
```

### Performance Metrics

```typescript
// src/hooks/usePerformance.ts
interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  isLowPerformance: boolean;
}

export const usePerformance = (): PerformanceMetrics => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    isLowPerformance: false,
  });
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;
      
      if (elapsed >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsed);
        const frameTime = elapsed / frameCount;
        
        setMetrics({
          fps,
          frameTime,
          isLowPerformance: fps < 50,
        });
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationFrameId = requestAnimationFrame(measureFPS);
    };
    
    animationFrameId = requestAnimationFrame(measureFPS);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, []);
  
  return metrics;
};
```

## Error Handling

### Graceful Degradation

1. **Motion Preference Detection**: Always check `prefers-reduced-motion` before applying animations
2. **Performance Monitoring**: Automatically reduce animation complexity if FPS drops below 50
3. **Fallback Rendering**: Provide static alternatives for all animated components
4. **Error Boundaries**: Wrap animation components in error boundaries to prevent crashes

```typescript
// src/components/motion/MotionWrapper.tsx
export const MotionWrapper: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => {
  const { prefersReducedMotion } = useMotionContext();
  const { isLowPerformance } = usePerformance();
  
  if (prefersReducedMotion || isLowPerformance) {
    return <>{fallback}</>;
  }
  
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
};
```

## Testing Strategy

### Unit Tests

1. **Component Rendering**: Test all animation components render correctly
2. **Motion Preferences**: Verify reduced motion fallbacks work
3. **Performance Hooks**: Test FPS monitoring and performance detection
4. **Animation States**: Verify animation variants and transitions

### Integration Tests

1. **Page Transitions**: Test navigation between pages with animations
2. **User Interactions**: Test hover, click, and focus animations
3. **Loading States**: Verify loading mask appears and disappears correctly
4. **Accessibility**: Test keyboard navigation and screen reader compatibility

### Performance Tests

1. **FPS Monitoring**: Measure frame rates during animations on various devices
2. **Load Time**: Measure impact of animations on initial page load
3. **Memory Usage**: Monitor memory consumption during extended use
4. **Bundle Size**: Ensure Framer Motion doesn't significantly increase bundle size

### Accessibility Tests

1. **Reduced Motion**: Verify all animations respect `prefers-reduced-motion`
2. **Keyboard Navigation**: Test all interactive elements are keyboard accessible
3. **Focus Indicators**: Verify high-contrast focus rings on all interactive elements
4. **Screen Readers**: Test with NVDA/JAWS to ensure animations don't break navigation

## Implementation Phases

### Phase 1: Foundation (Design System & Core Infrastructure)
- Install Framer Motion and configure
- Set up design system with color palette and typography
- Create MotionProvider and context
- Implement useReducedMotion hook
- Set up performance monitoring

### Phase 2: Core Animations
- Implement hero morphing blob
- Create page transition wrapper
- Build loading mask component
- Develop card hover component
- Create button ripple effect

### Phase 3: Page-Specific Implementation
- Update Home page with hero morph and animations
- Enhance Programs page with card hovers
- Add animations to About, Admissions, News & Events, Contact pages
- Implement page transitions between all pages

### Phase 4: Microinteractions & Polish
- Add SVG line-drawing animations
- Implement form input focus animations
- Create optional cursor trail effect
- Add parallax effects to hero sections
- Polish timing and easing curves

### Phase 5: Accessibility & Performance
- Implement comprehensive reduced motion fallbacks
- Add keyboard focus indicators
- Optimize animations for mobile devices
- Test and verify 50-60 FPS on mid-range devices
- Conduct accessibility audit

### Phase 6: Testing & Optimization
- Write unit tests for all components
- Perform integration testing
- Conduct performance testing on various devices
- Run accessibility tests
- Optimize bundle size and load times

## Performance Optimization Strategies

1. **GPU Acceleration**: Only animate `transform` and `opacity` properties
2. **Will-Change**: Use `will-change` CSS property sparingly for critical animations
3. **Lazy Loading**: Load animation components only when needed
4. **Code Splitting**: Split Framer Motion into separate chunks
5. **Memoization**: Use React.memo for animation components
6. **RequestAnimationFrame**: Use RAF for custom animations
7. **Intersection Observer**: Only animate elements when in viewport
8. **Debouncing**: Debounce scroll and resize event handlers

## Accessibility Considerations

1. **Reduced Motion**: Respect `prefers-reduced-motion` media query
2. **Focus Management**: Maintain logical focus order during transitions
3. **ARIA Labels**: Add appropriate ARIA labels to animated elements
4. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
5. **Color Contrast**: Maintain WCAG 2.1 AA contrast ratios (4.5:1 for text, 3:1 for UI)
6. **Focus Indicators**: Provide high-contrast focus rings (minimum 3:1 contrast)
7. **Screen Readers**: Ensure animations don't interfere with screen reader navigation
8. **Skip Links**: Provide skip links to bypass animated content

## Browser Compatibility

- **Modern Browsers**: Full support for Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Fallbacks**: Provide CSS-only fallbacks for older browsers
- **Feature Detection**: Use feature detection for advanced CSS properties

## Deployment Considerations

1. **Bundle Size**: Monitor impact of Framer Motion on bundle size (target: <50KB gzipped)
2. **CDN**: Serve fonts from Google Fonts CDN
3. **Caching**: Implement aggressive caching for animation assets
4. **Lazy Loading**: Lazy load animation components below the fold
5. **Progressive Enhancement**: Ensure core functionality works without animations

