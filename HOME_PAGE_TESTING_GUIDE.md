# 🧪 Home Page Testing Guide - Passi City College

## 📋 Pre-Testing Checklist

Before you start testing, ensure:
- ✅ Development server is running (`npm run dev`)
- ✅ Browser is open at `http://localhost:3000`
- ✅ Browser console is open (F12) to check for errors
- ✅ You have different screen sizes to test (or use browser DevTools)

---

## 🖥️ Desktop Testing (1920px+)

### 1. Navigation Bar
**What to Test:**
- [ ] Logo appears and links to home page
- [ ] All navigation links are visible
- [ ] Hover effects work on navigation items (underline animation)
- [ ] Search icon opens search bar
- [ ] Language switcher shows dropdown with 3 languages
- [ ] Login/Portal button is visible and styled correctly
- [ ] Navigation becomes sticky when scrolling down

**Expected Behavior:**
- Navigation should stick to top when scrolling
- Hover effects should be smooth (300ms transition)
- Search bar should slide down smoothly
- Language dropdown should appear below the button

---

### 2. Announcements Ticker
**What to Test:**
- [ ] Yellow banner appears at the top
- [ ] Announcements rotate every 5 seconds
- [ ] Bell icon is animated (pulse effect)
- [ ] Close button (X) dismisses the ticker
- [ ] Text is readable and not cut off

**Expected Behavior:**
- Smooth fade transition between announcements
- Ticker should disappear when closed
- Should not reappear after closing (until page refresh)

---

### 3. Hero Section
**What to Test:**
- [ ] Full-screen hero section displays
- [ ] Background image loads correctly
- [ ] College name and tagline are prominent
- [ ] Three CTA buttons are visible:
  - [ ] "Apply Now" (yellow button)
  - [ ] "View Events" (white outline button)
  - [ ] "Campus Tour" (white outline button with play icon)
- [ ] Statistics counter animates from 0 to target numbers
- [ ] All four statistics cards display:
  - [ ] 2,500+ Students
  - [ ] 15+ Programs
  - [ ] 150+ Faculty
  - [ ] 25+ Years
- [ ] Scroll indicator bounces at bottom
- [ ] Hover effects work on buttons (scale up)

**Expected Behavior:**
- Numbers should count up over 2 seconds
- Buttons should scale to 105% on hover
- Background should have parallax effect when scrolling
- Clicking "Campus Tour" should scroll to video section

---

### 4. Mission, Vision & Core Values
**What to Test:**
- [ ] Three cards display side by side
- [ ] Each card has correct icon and color:
  - [ ] Mission (Blue with target icon)
  - [ ] Vision (Yellow with eye icon)
  - [ ] Core Values (Green with star icon)
- [ ] Cards lift up on hover (-8px translate)
- [ ] Icons scale up on hover (110%)
- [ ] Text is readable and properly formatted

**Expected Behavior:**
- Smooth hover animations
- Cards should have shadow that increases on hover
- Icons should scale smoothly

---

### 5. Programs Highlight
**What to Test:**
- [ ] Dark background with gradient
- [ ] Six program cards display in 3-column grid
- [ ] Each program has:
  - [ ] Unique gradient icon
  - [ ] Title
  - [ ] Description
  - [ ] List of courses (2 items)
  - [ ] "Learn More" link
- [ ] Cards lift on hover
- [ ] "View All Programs" button at bottom
- [ ] Background has glowing orb effects

**Expected Behavior:**
- Cards should lift -8px on hover
- Icons should scale to 110%
- "Learn More" links should translate right on hover
- Button should scale to 105% on hover

---

### 6. Latest News
**What to Test:**
- [ ] Four news cards display in 4-column grid
- [ ] Each card has:
  - [ ] Featured image
  - [ ] Category badge (top-left of image)
  - [ ] Date with calendar icon
  - [ ] Title
  - [ ] Excerpt (2 lines max)
  - [ ] "Read More" link
- [ ] Images zoom on hover (110% scale)
- [ ] Cards lift on hover
- [ ] "View All News & Events" button at bottom

**Expected Behavior:**
- Image should zoom smoothly within container
- Cards should lift -8px on hover
- Title should change color to blue on hover
- Button should scale to 105% on hover

---

### 7. Events Calendar
**What to Test:**
- [ ] Four event cards display in 2-column grid
- [ ] Each card has:
  - [ ] Colored date badge (left side)
  - [ ] Category tag
  - [ ] Event title
  - [ ] Time (with clock icon)
  - [ ] Location (with map pin icon)
  - [ ] Attendees count (with users icon)
  - [ ] "View Details" link
- [ ] Cards lift on hover
- [ ] "View Full Calendar" button at bottom

**Expected Behavior:**
- Cards should lift -4px on hover
- Title should change color to blue on hover
- "View Details" link should translate right on hover
- Button should scale to 105% on hover

---

### 8. Testimonials
**What to Test:**
- [ ] Dark gradient background (purple/blue)
- [ ] One testimonial displays at a time
- [ ] Testimonial includes:
  - [ ] Large quote icon
  - [ ] Profile photo (circular)
  - [ ] 5 stars (filled yellow)
  - [ ] Quote text (italic)
  - [ ] Name (yellow color)
  - [ ] Degree and graduation year
  - [ ] Current position/company
- [ ] Navigation controls:
  - [ ] Previous button (left)
  - [ ] Next button (right)
  - [ ] Dot indicators (4 dots)
- [ ] Thumbnail preview (4 small profile photos)
- [ ] Clicking thumbnails changes testimonial

**Expected Behavior:**
- Smooth transition between testimonials
- Active dot should be wider and yellow
- Inactive dots should be small and white/transparent
- Navigation buttons should scale on hover
- Thumbnails should scale when active

---

### 9. Campus Tour
**What to Test:**
- [ ] Dark background
- [ ] Large video thumbnail displays
- [ ] Play button (yellow circle) in center
- [ ] Text overlay at bottom
- [ ] Four statistics cards below:
  - [ ] 50+ Modern Classrooms
  - [ ] 10+ Computer Labs
  - [ ] 20K+ Library Books
  - [ ] 5+ Sports Facilities
- [ ] Clicking play button opens video modal
- [ ] Video modal has:
  - [ ] Close button (X)
  - [ ] YouTube video embed
  - [ ] Dark overlay background
- [ ] Clicking outside modal closes it

**Expected Behavior:**
- Play button should scale on hover
- Image should zoom on hover
- Modal should appear smoothly
- Video should autoplay when modal opens
- Clicking overlay should close modal

---

### 10. Quick Links
**What to Test:**
- [ ] Six cards display in 3-column grid
- [ ] Each card has:
  - [ ] Gradient icon (unique color)
  - [ ] Title
  - [ ] Description
- [ ] Cards lift on hover
- [ ] Icons scale on hover

**Expected Behavior:**
- Cards should lift -8px on hover
- Icons should scale to 110%
- Shadow should increase on hover

---

### 11. Call to Action
**What to Test:**
- [ ] Full-width banner with background image
- [ ] Animated glowing orbs in background
- [ ] Large heading and subheading
- [ ] Two CTA buttons:
  - [ ] "Apply for Admission" (yellow)
  - [ ] "Contact Us" (white outline)
- [ ] Contact information:
  - [ ] Phone number with icon
  - [ ] Email address with icon

**Expected Behavior:**
- Buttons should scale to 105% on hover
- Background orbs should pulse
- Links should be clickable

---

### 12. Footer
**What to Test:**
- [ ] Dark background (gray-900)
- [ ] Four columns:
  - [ ] College info with social media icons
  - [ ] Quick links
  - [ ] Student resources
  - [ ] Contact information
- [ ] Social media icons:
  - [ ] Facebook (hover: blue)
  - [ ] YouTube (hover: red)
  - [ ] Instagram (hover: pink)
  - [ ] Twitter (hover: light blue)
- [ ] All links are clickable
- [ ] "View on Map" link has external icon
- [ ] Bottom section has:
  - [ ] Copyright notice
  - [ ] Legal links (Privacy, Terms, Accessibility, Sitemap)
  - [ ] Developer credit

**Expected Behavior:**
- Social icons should change color on hover
- Links should change color to yellow on hover
- Links should translate right on hover

---

## 📱 Mobile Testing (375px)

### General Mobile Checks
- [ ] Hamburger menu icon appears
- [ ] All sections stack vertically
- [ ] Text is readable (not too small)
- [ ] Buttons are large enough to tap (44px minimum)
- [ ] No horizontal scrolling
- [ ] Images scale properly

### Navigation
- [ ] Hamburger menu opens/closes smoothly
- [ ] All navigation links are in menu
- [ ] Search bar is in mobile menu
- [ ] Login/Portal button is in menu
- [ ] Menu closes when link is clicked

### Hero Section
- [ ] Text is readable
- [ ] Buttons stack vertically
- [ ] Statistics display in 2x2 grid
- [ ] Background image is visible

### Content Sections
- [ ] All cards stack in single column
- [ ] Images scale to full width
- [ ] Text is readable
- [ ] Buttons are full width or centered

### Testimonials
- [ ] Profile photo is visible
- [ ] Text is readable
- [ ] Navigation controls work
- [ ] Thumbnails are hidden on mobile

### Footer
- [ ] All columns stack vertically
- [ ] Social icons are visible
- [ ] Links are tappable
- [ ] Contact info is readable

---

## 🧪 Interaction Testing

### Scroll Behavior
- [ ] Smooth scrolling works
- [ ] Navigation becomes sticky
- [ ] Parallax effects work
- [ ] Scroll indicator disappears after scrolling

### Click/Tap Testing
- [ ] All buttons are clickable
- [ ] All links navigate correctly
- [ ] Modals open and close
- [ ] Dropdowns work
- [ ] Carousel navigation works

### Hover Effects (Desktop Only)
- [ ] All hover states work
- [ ] Transitions are smooth (300ms)
- [ ] No flickering or jumping
- [ ] Colors change correctly

### Animations
- [ ] Statistics counter animates
- [ ] Announcements rotate
- [ ] Carousel transitions smoothly
- [ ] Cards lift on hover
- [ ] Icons scale on hover

---

## 🎨 Visual Testing

### Colors
- [ ] Blue theme is consistent
- [ ] Yellow accents are prominent
- [ ] Text contrast is good (readable)
- [ ] Gradients look smooth

### Typography
- [ ] Headings are bold and clear
- [ ] Body text is readable
- [ ] Font sizes are appropriate
- [ ] Line heights are comfortable

### Spacing
- [ ] Sections have proper padding
- [ ] Cards have consistent spacing
- [ ] No elements are too close together
- [ ] White space is balanced

### Images
- [ ] All images load
- [ ] Images are high quality
- [ ] No broken image icons
- [ ] Images scale properly

---

## ⚡ Performance Testing

### Load Time
- [ ] Page loads in under 3 seconds
- [ ] Images load progressively
- [ ] No layout shift during load
- [ ] Animations start smoothly

### Browser Console
- [ ] No JavaScript errors
- [ ] No 404 errors
- [ ] No warning messages
- [ ] No CORS errors

### Lighthouse Audit (Chrome DevTools)
Run Lighthouse and check:
- [ ] Performance: 90+ score
- [ ] Accessibility: 90+ score
- [ ] Best Practices: 90+ score
- [ ] SEO: 90+ score

---

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] Tab key navigates through all interactive elements
- [ ] Focus states are visible
- [ ] Enter key activates buttons/links
- [ ] Escape key closes modals
- [ ] No keyboard traps

### Screen Reader Testing
- [ ] All images have alt text
- [ ] Buttons have aria-labels
- [ ] Headings are in correct order (h1, h2, h3)
- [ ] Links have descriptive text
- [ ] Form inputs have labels

### Color Contrast
- [ ] Text is readable on all backgrounds
- [ ] Links are distinguishable
- [ ] Buttons have good contrast
- [ ] Icons are visible

---

## 🌐 Browser Testing

Test in multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 🐛 Common Issues & Solutions

### Issue: Statistics don't animate
**Solution**: Refresh the page, animation runs on mount

### Issue: Images don't load
**Solution**: Check internet connection, images are from Unsplash

### Issue: Hover effects don't work on mobile
**Solution**: This is expected, hover effects are desktop-only

### Issue: Navigation doesn't stick
**Solution**: Scroll down more, it activates after 20px

### Issue: Video doesn't play
**Solution**: Check YouTube embed URL, may need to update

### Issue: Language switcher doesn't change language
**Solution**: This is a UI component, backend integration needed

---

## ✅ Testing Checklist Summary

### Desktop (1920px)
- [ ] All sections display correctly
- [ ] All hover effects work
- [ ] All animations work
- [ ] All links work
- [ ] No console errors

### Tablet (768px)
- [ ] 2-column layouts work
- [ ] Navigation menu works
- [ ] All content is readable
- [ ] No horizontal scroll

### Mobile (375px)
- [ ] Single column layout
- [ ] Hamburger menu works
- [ ] All buttons are tappable
- [ ] Text is readable
- [ ] No horizontal scroll

### Interactions
- [ ] All buttons work
- [ ] All links work
- [ ] Modals work
- [ ] Carousel works
- [ ] Search works

### Performance
- [ ] Fast load time
- [ ] No errors in console
- [ ] Smooth animations
- [ ] Good Lighthouse scores

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Good color contrast
- [ ] Focus states visible

---

## 📊 Testing Report Template

```
Date: ___________
Tester: ___________
Browser: ___________
Device: ___________

✅ PASSED:
- 

❌ FAILED:
- 

🐛 BUGS FOUND:
- 

💡 SUGGESTIONS:
- 

Overall Status: ✅ PASS / ❌ FAIL
```

---

## 🎉 Final Checklist

Before going to production:
- [ ] All tests passed
- [ ] No console errors
- [ ] All links work
- [ ] All images load
- [ ] Mobile responsive
- [ ] Accessibility compliant
- [ ] Performance optimized
- [ ] Content is accurate
- [ ] Contact info is correct
- [ ] Social media links are correct

---

**Status**: Ready for Testing
**Last Updated**: October 2, 2025
