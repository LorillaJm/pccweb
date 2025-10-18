# Reduced Motion Quick Reference Card

## 🎯 Quick Test (30 seconds)

### Enable Reduced Motion
**Chrome DevTools:**
```
F12 → Ctrl+Shift+P → "Rendering" → "prefers-reduced-motion" → "reduce"
```

### Test in Console
```javascript
// Check preference
window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Should return: true (enabled) or false (disabled)
```

---

## 📋 Component Behavior

| Component | With Animations | Reduced Motion |
|-----------|----------------|----------------|
| **PageTransition** | Fade + Slide (300ms) | Quick Fade (150ms) |
| **HeroMorph** | Morphing + Parallax | Static Gradient |
| **PremiumCard** | Scale + Morph + Shadow | Subtle Opacity |
| **PremiumButton** | Ripple + Scale | No Animation |
| **LoadingMask** | Full Animation | Simple Fade |

---

## ✅ Quick Checklist

### With Reduced Motion ENABLED
- [ ] No morphing animations
- [ ] No parallax scrolling
- [ ] No scale transforms
- [ ] No ripple effects
- [ ] All content visible
- [ ] All buttons work
- [ ] No console errors

### Both Modes
- [ ] All functionality works
- [ ] Navigation functional
- [ ] Forms submit correctly
- [ ] Content accessible
- [ ] No layout shifts

---

## 🧪 Testing Tools

### Browser Tool
```bash
open verify-reduced-motion.html
```

### Console Script
```bash
# Copy from test-reduced-motion-console.js
# Paste in browser console
```

---

## 📚 Documentation

- **Full Report:** `REDUCED_MOTION_VERIFICATION_REPORT.md`
- **Testing Guide:** `REDUCED_MOTION_TESTING_GUIDE.md`
- **Completion Summary:** `TASK_16.2_COMPLETION_SUMMARY.md`

---

## 🎓 Implementation Pattern

```typescript
// Always check motion preference
const { prefersReducedMotion } = useMotionContext();

// Provide fallback
if (prefersReducedMotion) {
  return <StaticComponent />;
}

return <AnimatedComponent />;
```

---

## ✅ Status

**Task:** 16.2 Verify reduced motion fallbacks  
**Status:** ✅ COMPLETED  
**Tests:** 22/22 PASSED (100%)  
**Requirements:** 6.1, 6.4 ✅
