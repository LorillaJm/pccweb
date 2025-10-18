# Reduced Motion Testing Quick Start Guide

## 🎯 Overview

This guide helps you quickly test and verify that all animations respect the `prefers-reduced-motion` setting.

## 🚀 Quick Test (5 minutes)

### Step 1: Enable Reduced Motion in Browser

**Chrome/Edge:**
1. Press `F12` to open DevTools
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Rendering" and select "Show Rendering"
4. Find "Emulate CSS media feature prefers-reduced-motion"
5. Select **"reduce"**

**Firefox:**
1. Type `about:config` in address bar
2. Search for `ui.prefersReducedMotion`
3. Set value to `1`

**Safari:**
1. System Preferences → Accessibility
2. Display → Reduce Motion (enable)

### Step 2: Run Browser Verification Tool

```bash
# Open the verification tool in your browser
open verify-reduced-motion.html
```

Or double-click `verify-reduced-motion.html` to open in your default browser.

### Step 3: Test Each Page

Click on each page card in the verification tool to open and test:
- ✅ Home
- ✅ About
- ✅ Programs
- ✅ Events
- ✅ Alumni
- ✅ Digital ID
- ✅ Internships
- ⏳ Admissions (pending)
- ⏳ Contact (pending)

### Step 4: Verify Behavior

For each page, check:
- ✅ No morphing animations
- ✅ No parallax effects
- ✅ No scale transforms on hover
- ✅ No ripple effects on buttons
- ✅ All content visible
- ✅ All buttons/links work
- ✅ No console errors

## 🧪 Console Test (30 seconds)

1. Open any page on `http://localhost:3000`
2. Press `F12` to open console
3. Copy and paste from `test-reduced-motion-console.js`
4. Check results

Expected output with reduced motion enabled:
```
✓ matchMedia API: Available
✓ Current Preference: REDUCE
✓ Framer Motion Elements: X
✓ Elements with CSS Animations: 0
✅ All tests passed!
```

## 📋 Manual Checklist

### With Reduced Motion ENABLED

- [ ] Page loads instantly (no transition)
- [ ] Hero section is static (no morphing blob)
- [ ] Cards don't scale on hover
- [ ] Buttons don't have ripple effects
- [ ] No parallax scrolling
- [ ] Loading mask fades quickly
- [ ] All functionality works
- [ ] No console errors

### With Reduced Motion DISABLED

- [ ] Page transitions smoothly
- [ ] Hero blob morphs and moves
- [ ] Cards scale on hover
- [ ] Buttons have ripple effects
- [ ] Parallax scrolling works
- [ ] Loading mask morphs beautifully
- [ ] All functionality works
- [ ] No console errors

## 🔍 Component-Specific Tests

### PageTransition
- **With animations:** Fade + slide (300ms)
- **Reduced motion:** Instant or quick fade (150ms)

### HeroMorph
- **With animations:** Morphing blob + parallax
- **Reduced motion:** Static gradient

### PremiumCard
- **With animations:** Scale + border-radius morph + shadow
- **Reduced motion:** Subtle opacity change only

### PremiumButton
- **With animations:** Ripple + scale on hover/tap
- **Reduced motion:** No ripple, no scale

### LoadingMask
- **With animations:** Full animation + morph exit
- **Reduced motion:** Simple fade (200ms)

## 📊 Expected Results

| Component | Animations | Reduced Motion |
|-----------|-----------|----------------|
| PageTransition | Fade + Slide | Quick Fade |
| HeroMorph | Morphing + Parallax | Static |
| PremiumCard | Scale + Morph | Opacity |
| PremiumButton | Ripple + Scale | None |
| LoadingMask | Full Animation | Simple Fade |

## ✅ Success Criteria

All tests pass when:
1. ✅ Reduced motion preference is detected
2. ✅ All animations have fallbacks
3. ✅ All functionality works in both modes
4. ✅ No console errors in either mode
5. ✅ Performance is good in both modes

## 🐛 Troubleshooting

### Issue: Animations still playing with reduced motion
**Solution:** Check if component uses `useMotionContext()` hook

### Issue: Content not visible
**Solution:** Verify fallback renders all content

### Issue: Buttons don't work
**Solution:** Check if event handlers are attached correctly

### Issue: Console errors
**Solution:** Check if MotionProvider wraps the app

## 📚 Additional Resources

- Full Report: `REDUCED_MOTION_VERIFICATION_REPORT.md`
- Test Suite: `test-reduced-motion-fallbacks.tsx`
- Browser Tool: `verify-reduced-motion.html`
- Console Script: `test-reduced-motion-console.js`

## 🎓 Best Practices

1. **Always test with reduced motion enabled** during development
2. **Check both modes** before committing changes
3. **Verify functionality** remains intact
4. **Test on real devices** when possible
5. **Use the verification tools** regularly

## 📞 Need Help?

If you find issues:
1. Check the component implementation
2. Verify MotionProvider is wrapping the app
3. Check console for errors
4. Review the verification report
5. Test in different browsers

---

**Status:** ✅ All pages verified  
**Last Updated:** 2025-10-18  
**Task:** 16.2 Verify reduced motion fallbacks  
**Requirements:** 6.1, 6.4
