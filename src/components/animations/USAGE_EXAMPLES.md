# Animation Components Usage Examples

## SVGLineDraw

Animate SVG paths with a line-drawing effect that triggers when the element enters the viewport.

```tsx
import { SVGLineDraw } from '@/components/animations';

// Basic usage
<SVGLineDraw 
  path="M 10 80 Q 52.5 10, 95 80 T 180 80"
  strokeColor="#FF5A5F"
  strokeWidth={3}
  duration={2}
/>

// With fill after drawing
<SVGLineDraw 
  path="M 50 50 L 150 50 L 100 150 Z"
  strokeColor="#00D4FF"
  fill="#00D4FF"
  duration={1.5}
  delay={0.5}
/>

// Custom viewBox for complex SVGs
<SVGLineDraw 
  path="M150 0 L75 200 L225 200 Z"
  viewBox="0 0 300 200"
  strokeColor="#FF5A5F"
  strokeWidth={2}
  once={true}
/>
```

## useParallax Hook

Create smooth parallax scroll effects with customizable intensity.

```tsx
import { useParallax } from '@/hooks/useParallax';
import { motion } from 'framer-motion';

function ParallaxSection() {
  const { y, ref } = useParallax({ intensity: 0.5 });
  
  return (
    <div ref={ref} className="relative h-screen">
      <motion.div 
        style={{ y }}
        className="absolute inset-0"
      >
        <img src="/hero-bg.jpg" alt="Background" />
      </motion.div>
    </div>
  );
}

// Multiple layers with different intensities
function MultiLayerParallax() {
  const { y: y1 } = useParallax({ intensity: 0.3 });
  const { y: y2 } = useParallax({ intensity: 0.6 });
  const { y: y3 } = useParallax({ intensity: 0.9 });
  
  return (
    <div className="relative h-screen">
      <motion.div style={{ y: y1 }} className="layer-1">Background</motion.div>
      <motion.div style={{ y: y2 }} className="layer-2">Middle</motion.div>
      <motion.div style={{ y: y3 }} className="layer-3">Foreground</motion.div>
    </div>
  );
}

// Horizontal parallax
import { useParallaxX } from '@/hooks/useParallax';

function HorizontalParallax() {
  const { x } = useParallaxX({ intensity: 0.4 });
  
  return (
    <motion.div style={{ x }}>
      Slides horizontally on scroll
    </motion.div>
  );
}
```

## useInView Hook

Trigger animations when elements enter the viewport.

```tsx
import { useInView } from '@/hooks/useInView';
import { motion } from 'framer-motion';

// Basic fade-in on scroll
function FadeInSection() {
  const { ref, inView } = useInView({ threshold: 0.5, once: true });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6 }}
    >
      Content fades in when 50% visible
    </motion.div>
  );
}

// Staggered animation for multiple items
import { useInViewMultiple } from '@/hooks/useInView';

function StaggeredList({ items }: { items: string[] }) {
  const { refs, inViewStates } = useInViewMultiple(items.length, {
    threshold: 0.3,
    once: true,
  });
  
  return (
    <div>
      {items.map((item, i) => (
        <motion.div
          key={i}
          ref={refs[i]}
          initial={{ opacity: 0, x: -50 }}
          animate={
            inViewStates[i] 
              ? { opacity: 1, x: 0 } 
              : { opacity: 0, x: -50 }
          }
          transition={{ 
            duration: 0.5, 
            delay: i * 0.1 // Stagger effect
          }}
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
}

// Continuous animation (not just once)
function ContinuousAnimation() {
  const { ref, inView } = useInView({ 
    threshold: 0.5, 
    once: false // Animates in and out
  });
  
  return (
    <motion.div
      ref={ref}
      animate={inView ? { scale: 1 } : { scale: 0.8 }}
      transition={{ duration: 0.4 }}
    >
      Scales when in view
    </motion.div>
  );
}

// With custom margin (trigger earlier)
function EarlyTrigger() {
  const { ref, inView } = useInView({ 
    margin: '-100px', // Triggers 100px before entering viewport
    once: true 
  });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
    >
      Animates before fully visible
    </motion.div>
  );
}
```

## Combining All Three

Create rich, layered animations by combining these tools:

```tsx
import { SVGLineDraw } from '@/components/animations';
import { useParallax } from '@/hooks/useParallax';
import { useInView } from '@/hooks/useInView';
import { motion } from 'framer-motion';

function RichAnimatedSection() {
  const { y } = useParallax({ intensity: 0.4 });
  const { ref, inView } = useInView({ threshold: 0.3, once: true });
  
  return (
    <div ref={ref} className="relative min-h-screen">
      {/* Parallax background */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 -z-10"
      >
        <div className="bg-gradient-to-b from-primary to-surface" />
      </motion.div>
      
      {/* Content that fades in */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto py-20"
      >
        <h2 className="text-4xl font-bold mb-8">Animated Section</h2>
        
        {/* SVG line drawing animation */}
        <div className="w-64 h-64 mx-auto">
          <SVGLineDraw
            path="M 50 150 Q 100 50, 150 150 T 250 150"
            strokeColor="#FF5A5F"
            strokeWidth={3}
            duration={2}
            delay={0.5}
          />
        </div>
      </motion.div>
    </div>
  );
}
```

## Performance Tips

1. **Use `once: true`** for most animations to avoid re-triggering
2. **Set appropriate thresholds** - higher values (0.5-0.8) ensure elements are more visible before animating
3. **Use negative margins** to trigger animations slightly before elements enter viewport for smoother UX
4. **Limit parallax intensity** - values between 0.3-0.7 work best for most cases
5. **Combine with MotionProvider** to respect reduced motion preferences automatically
