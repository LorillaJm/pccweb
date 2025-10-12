# Core Animation Components

This directory contains the core animation components for the premium frontend experience.

## Components

### LoadingMask

Full-screen loading animation with morph exit effect.

**Requirements:** 5.1, 5.2, 5.3, 5.4, 5.5

**Features:**
- Full-screen animated loading mask
- Morphs into page content on load complete
- Rotating spinner animation with dual rings
- Respects reduced motion preferences
- Uses brand colors (#0B132B, #FF5A5F, #00D4FF)

**Usage:**

```tsx
import { LoadingMask } from '@/components/animations';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <LoadingMask isLoading={isLoading} />
      {/* Your content */}
    </>
  );
}
```

**Props:**
- `isLoading: boolean` - Controls visibility of loading mask
- `className?: string` - Additional CSS classes

---

### PageTransition

Wrapper component for smooth page transitions with fade and slide effects.

**Requirements:** 4.1, 4.2, 4.3, 4.4, 4.5, 4.6

**Features:**
- Fade and slide transitions using Framer Motion
- Support for shared element morphing
- Respects reduced motion preferences
- Optimized for 60 FPS on desktop, 50-60 FPS on mobile
- GPU-accelerated animations

**Usage:**

```tsx
import { PageTransition } from '@/components/animations';

function Page() {
  return (
    <PageTransition pageKey="home">
      <div>
        <h1>Home Page</h1>
        {/* Page content */}
      </div>
    </PageTransition>
  );
}
```

**Props:**
- `children: ReactNode` - Page content to animate
- `className?: string` - Additional CSS classes
- `pageKey?: string` - Unique key to trigger transitions
- `variants?: Variants` - Custom Framer Motion variants

---

### SharedElement

Wrapper for shared element morphing between pages.

**Requirements:** 4.2

**Features:**
- Smooth morphing transitions between pages
- Uses Framer Motion's layoutId
- Automatically disabled with reduced motion

**Usage:**

```tsx
import { SharedElement } from '@/components/animations';

// On page 1
<SharedElement layoutId="hero-image">
  <img src="/hero.jpg" alt="Hero" />
</SharedElement>

// On page 2 (same layoutId creates morphing effect)
<SharedElement layoutId="hero-image">
  <img src="/hero.jpg" alt="Hero" />
</SharedElement>
```

**Props:**
- `children: ReactNode` - Element to morph
- `layoutId: string` - Unique ID for morphing
- `className?: string` - Additional CSS classes

---

### HeroMorph

Animated morphing blob with parallax scrolling for hero sections.

**Requirements:** 1.1, 1.2, 1.3, 1.4, 1.5

**Features:**
- SVG morphing blob animation
- Animated gradients that transition smoothly
- Parallax scrolling effect
- GPU-accelerated animations
- Respects reduced motion preferences
- Dual-layer blobs for depth

**Usage:**

```tsx
import { HeroMorph } from '@/components/animations';

function HeroSection() {
  return (
    <div className="relative h-screen">
      <HeroMorph 
        colors={['#FF5A5F', '#00D4FF']}
        speed={1}
        parallaxIntensity={0.5}
      />
      <div className="relative z-10">
        {/* Hero content */}
      </div>
    </div>
  );
}
```

**Props:**
- `colors?: string[]` - Gradient colors (default: ['#FF5A5F', '#00D4FF'])
- `speed?: number` - Animation speed multiplier (default: 1)
- `parallaxIntensity?: number` - Parallax effect strength 0-1 (default: 0.5)
- `className?: string` - Additional CSS classes

---

## Performance Considerations

All components are optimized for performance:

1. **GPU Acceleration**: Only animate `transform` and `opacity` properties
2. **Reduced Motion**: Automatically respect user preferences
3. **Frame Rate**: Target 60 FPS on desktop, 50-60 FPS on mobile
4. **Will-Change**: Applied strategically for critical animations
5. **AnimatePresence**: Proper cleanup of unmounted animations

## Accessibility

All components support accessibility features:

1. **Reduced Motion**: Fallback to instant transitions or static content
2. **Keyboard Navigation**: No interference with focus management
3. **Screen Readers**: Animations don't block content access
4. **ARIA**: Appropriate labels where needed

## Testing

Run tests with:

```bash
npm test src/components/animations/__tests__/animations.test.tsx
```

## Requirements Coverage

- **Requirement 1**: Hero morphing animation with parallax (HeroMorph)
- **Requirement 4**: Page transitions (PageTransition, SharedElement)
- **Requirement 5**: Full-screen loading mask (LoadingMask)
- **Requirement 6**: Accessibility and reduced motion (all components)
- **Requirement 7**: Performance optimization (all components)
