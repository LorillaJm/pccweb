# Premium UI Components

High-quality animated components with premium interactions for the Passi City College platform.

## Components

### PremiumCard

A card component with sophisticated hover animations including scale transformation, border-radius morphing, and shadow elevation.

**Features:**
- Hover scale transformation (default 1.03x)
- Border-radius morphing on hover (1rem → 1.5rem)
- Animated box-shadow for elevation effect
- No layout shifts during animation
- Respects reduced motion preferences

**Usage:**
```tsx
import { PremiumCard } from '@/components/premium';

<PremiumCard className="p-6 bg-surface">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</PremiumCard>

// Custom hover scale
<PremiumCard hoverScale={1.05} className="p-6 bg-surface">
  <h3>Larger Scale</h3>
</PremiumCard>

// Disable hover effect
<PremiumCard disableHover className="p-6 bg-surface">
  <h3>No Hover</h3>
</PremiumCard>
```

**Props:**
- `children`: ReactNode - Card content
- `className`: string - Additional CSS classes
- `hoverScale`: number - Scale factor on hover (default: 1.03)
- `disableHover`: boolean - Disable hover animations
- All standard div props via HTMLMotionProps

**Requirements:** 3.1, 3.2, 3.3, 3.4, 3.5, 3.6

---

### PremiumButton

A button component with ripple effect, hover/tap animations, and high-contrast focus states.

**Features:**
- Ripple effect on click
- Hover scale animation (1.05x)
- Tap scale animation (0.95x)
- High-contrast focus ring for accessibility
- Multiple variants and sizes
- Respects reduced motion preferences

**Usage:**
```tsx
import { PremiumButton } from '@/components/premium';

// Primary button
<PremiumButton variant="primary" onClick={handleClick}>
  Click Me
</PremiumButton>

// Secondary button
<PremiumButton variant="secondary" size="lg">
  Large Button
</PremiumButton>

// Outline button
<PremiumButton variant="outline" size="sm">
  Small Outline
</PremiumButton>

// Disabled button
<PremiumButton disabled>
  Disabled
</PremiumButton>

// Without ripple effect
<PremiumButton disableRipple>
  No Ripple
</PremiumButton>
```

**Props:**
- `children`: ReactNode - Button content
- `variant`: 'primary' | 'secondary' | 'outline' - Button style variant
- `size`: 'sm' | 'md' | 'lg' - Button size
- `disableRipple`: boolean - Disable ripple effect
- All standard button props

**Requirements:** 2.1, 2.2, 2.3, 6.2, 6.3

---

### PremiumInput

An input component with floating label animation, smooth focus states, and validation animations.

**Features:**
- Floating label animation on focus
- Smooth focus state transitions
- Validation state animations (success, error, warning)
- Animated validation icons
- High-contrast focus ring
- Respects reduced motion preferences

**Usage:**
```tsx
import { PremiumInput } from '@/components/premium';

// Basic input
<PremiumInput
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  helperText="We'll never share your email"
/>

// Success state
<PremiumInput
  label="Username"
  value="johndoe"
  validationState="success"
  successText="Username is available!"
/>

// Error state
<PremiumInput
  label="Password"
  type="password"
  validationState="error"
  errorText="Password must be at least 8 characters"
/>

// Warning state
<PremiumInput
  label="Phone"
  validationState="warning"
  helperText="Please include country code"
/>

// Different sizes
<PremiumInput label="Small" size="sm" />
<PremiumInput label="Medium" size="md" />
<PremiumInput label="Large" size="lg" />
```

**Props:**
- `label`: string - Floating label text
- `helperText`: string - Helper text below input
- `errorText`: string - Error message (shown when validationState is 'error')
- `successText`: string - Success message (shown when validationState is 'success')
- `validationState`: 'idle' | 'success' | 'error' | 'warning' - Validation state
- `size`: 'sm' | 'md' | 'lg' - Input size
- All standard input props

**Requirements:** 2.4, 6.2, 6.3

---

## Design System Integration

All components use the premium color palette:

```typescript
{
  primary: '#0B132B',      // Very dark navy
  accent: '#FF5A5F',       // Vibrant coral (CTA)
  secondary: '#00D4FF',    // Electric cyan
  surface: '#0F1724',      // Dark surface (cards)
  textLight: '#F8FAFC',    // Near white
  textMuted: '#9AA4B2',    // Muted text
}
```

## Accessibility

All components:
- Respect `prefers-reduced-motion` media query
- Provide high-contrast focus indicators (3:1 minimum)
- Support keyboard navigation
- Include appropriate ARIA labels
- Meet WCAG 2.1 AA standards

## Performance

All components:
- Use GPU-accelerated properties only (transform, opacity)
- Avoid layout shifts during animations
- Target 60 FPS on desktop, 50-60 FPS on mobile
- Automatically adjust based on device performance

## Testing

See `PremiumComponents.test.tsx` for a demo page showcasing all components.

To test the components:
1. Import the demo component
2. Add it to a page
3. Test hover, click, and focus interactions
4. Verify reduced motion fallbacks work
5. Test keyboard navigation

## Dependencies

- `framer-motion`: Animation library
- `react`: React framework
- `@/components/motion/MotionProvider`: Motion context provider
- `@/hooks/useReducedMotion`: Reduced motion detection hook
