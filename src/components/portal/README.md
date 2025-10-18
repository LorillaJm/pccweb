# Portal Components

World-class, futuristic components for the PCC Student Portal Dashboard.

## Components

### WelcomeCard
Animated hero section with gradient background, floating particles, and student info.

```tsx
import { WelcomeCard } from '@/components/portal';

<WelcomeCard
  firstName="John"
  program="BSCS"
  yearLevel={3}
  semester={1}
/>
```

**Features:**
- Animated gradient background (Blue → Indigo → Purple)
- 20 floating particles
- Random motivational quotes
- Pulsing info badges
- Responsive design

---

### QuickStatsCard
Reusable animated stat card with customizable gradient and icon.

```tsx
import { QuickStatsCard } from '@/components/portal';
import { BookOpen } from 'lucide-react';

<QuickStatsCard
  title="Enrolled Subjects"
  value={8}
  subtitle="Active courses"
  icon={BookOpen}
  gradient="from-blue-600 to-indigo-600"
  delay={0.1}
/>
```

**Features:**
- Staggered entrance animation
- Hover scale and lift effects
- Rotating icon on hover
- Pulsing status indicator
- Customizable gradient

---

### AnnouncementsFeed
Real-time announcements with priority-based color coding and filtering.

```tsx
import { AnnouncementsFeed } from '@/components/portal';

<AnnouncementsFeed
  announcements={announcements}
  isLoading={false}
/>
```

**Features:**
- Priority-based colors (Urgent, High, Normal, Low)
- Category filtering
- Smooth slide-in animations
- Hover effects with arrow
- Real-time updates

---

### UpcomingEventsSection
Calendar-style event cards with date, time, and location.

```tsx
import { UpcomingEventsSection } from '@/components/portal';

<UpcomingEventsSection events={events} />
```

**Features:**
- Event cards with full details
- Category badges
- Hover animations
- Responsive layout
- Mock data included

---

## Usage

### Import All Components
```tsx
import {
  WelcomeCard,
  QuickStatsCard,
  AnnouncementsFeed,
  UpcomingEventsSection
} from '@/components/portal';
```

### Import Individual Components
```tsx
import { WelcomeCard } from '@/components/portal/WelcomeCard';
```

---

## Styling

All components use:
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Glassmorphism** effects

### Color System
```tsx
// Gradients
"from-blue-600 to-indigo-600"    // Primary
"from-emerald-600 to-green-600"  // Success
"from-amber-600 to-orange-600"   // Warning
"from-purple-600 to-pink-600"    // Accent
```

---

## Animation System

### Entrance Animations
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.1 }}
```

### Hover Animations
```tsx
whileHover={{ scale: 1.02, y: -5 }}
```

### Icon Rotations
```tsx
whileHover={{ rotate: 360 }}
transition={{ duration: 0.5 }}
```

---

## Customization

### Change Colors
```tsx
<QuickStatsCard
  gradient="from-red-600 to-pink-600"  // Custom gradient
/>
```

### Change Animation Speed
```tsx
<motion.div
  transition={{ duration: 0.3 }}  // Faster
/>
```

### Add Custom Icons
```tsx
import { YourIcon } from 'lucide-react';

<QuickStatsCard icon={YourIcon} />
```

---

## Performance

All components are optimized for:
- ✅ 60 FPS animations
- ✅ GPU acceleration
- ✅ Minimal re-renders
- ✅ Lazy loading
- ✅ Tree-shaking

---

## Accessibility

- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast (WCAG 2.1)

---

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

---

## TypeScript

All components are fully typed:

```tsx
interface WelcomeCardProps {
  firstName: string;
  program?: string;
  yearLevel?: number;
  semester?: number;
}
```

---

## Examples

See the main dashboard implementation:
```
src/app/portal/student/page.tsx
```

---

## Documentation

- **STUDENT_DASHBOARD_REDESIGN.md** - Technical docs
- **STUDENT_DASHBOARD_VISUAL_GUIDE.md** - Visual guide
- **STUDENT_DASHBOARD_QUICK_START.md** - Quick start
- **STUDENT_DASHBOARD_FEATURES_SHOWCASE.md** - Feature showcase

---

**Built with ❤️ for PCC Portal**
