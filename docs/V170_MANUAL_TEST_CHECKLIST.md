# v1.7.0 Manual Testing Checklist

**Version:** 1.7.0-beta.1  
**Test Date:** [Date of testing]  
**Tested By:** [Your name]  
**Environment:** [Staging/Production]  
**Status:** Ready for Release

---

## Pre-Testing Setup

### Prerequisites

- [ ] Fresh database with test data seeded
- [ ] v1.7.1 migration deployed to Supabase
  ```bash
  # Run: docs/migrations/v1.7.1_custom_events_lunar.sql
  SELECT lunar_month, lunar_day FROM custom_events LIMIT 1;  # Should work
  ```
- [ ] Access to admin account for testing
- [ ] All dependencies installed: `npm install`
- [ ] Latest code from `newfeature` branch
- [ ] Dev server running: `npm run dev`
- [ ] Test user accounts created in database
- [ ] Browser dev tools open for console errors

### Test Environment

```bash
# Verify environment
echo "API URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "Environment: $(node -e 'console.log(process.env.NODE_ENV)')"

# Start dev server
npm run dev
# Visit: http://localhost:3000
```

---

## Feature 1: Lunar Events

### 1.1 Create Lunar Custom Event

**Scenario:** User creates a custom event with lunar calendar dates

**Steps:**

1. Navigate to: Dashboard → Settings → Events
2. Click "Add Custom Event"
3. Enter event details:
   - Name: "Ancestor Birth (Lunar)"
   - Description: "Important lunar calendar event"
   - Lunar Month: 5 (dropdown)
   - Lunar Day: 15 (input)
   - Repeats: Annually
4. Click "Save Event"

**Expected Results:**
- [ ] Event created successfully
- [ ] Lunar month/day displayed in event details
- [ ] Event appears in sidebar with lunar date
- [ ] No console errors
- [ ] Database shows: `SELECT * FROM custom_events WHERE name LIKE '%Lunar%';`

**Database Verification:**
```sql
SELECT id, name, lunar_month, lunar_day, description 
FROM custom_events 
WHERE name LIKE '%Ancestor%' 
LIMIT 1;

-- Should show:
-- id: uuid
-- lunar_month: 5
-- lunar_day: 15
-- description: [text entered]
```

### 1.2 Lunar Date Display

**Scenario:** Lunar dates display correctly in all views

**Steps:**

1. Go to Dashboard → Members
2. Look for events with lunar dates
3. Hover over lunar date badge
4. Verify format shows lunar + gregorian

**Expected Results:**
- [ ] Lunar date shown as badge
- [ ] Format: "Lunar 5/15 (Gregorian 6/X)"
- [ ] Color coding visible (red for lunar)
- [ ] Tooltip shows full date info

### 1.3 Lunar Event Recurrence

**Scenario:** Annual lunar events recur correctly

**Steps:**

1. Create recurring lunar event (annual)
2. View year 2026 and 2027
3. Verify event appears in both years
4. Check gregorian date shifts (lunar date stays same)

**Expected Results:**
- [ ] Event appears in 2026 and 2027
- [ ] Lunar date: 5/15 (same)
- [ ] Gregorian dates different (due to lunar calendar shift)
- [ ] Format: "Lunar 5/15 (Gregorian Jun 8 or Jun 27)" depending on year

---

## Feature 2: PDF Export with Lunar Dates

### 2.1 Export Single Person

**Scenario:** User exports person information to PDF including lunar dates

**Steps:**

1. Navigate to: Dashboard → Members → [Select a member]
2. Click "Export" → "PDF"
3. Save PDF as: `test-export-lunar.pdf`
4. Open PDF in viewer

**Expected Results:**
- [ ] PDF generates without errors
- [ ] Page title includes person name
- [ ] Lunar events appear with both lunar and gregorian dates
- [ ] Formatting is readable
- [ ] No broken layout
- [ ] File size < 5MB

**PDF Content Verification:**
- [ ] Person name at top
- [ ] Birth date (gregorian)
- [ ] Relationships listed
- [ ] Custom events listed with "Lunar 5/15 (6/X)" format
- [ ] Ancestor events highlighted differently if configured

### 2.2 Export Family Tree

**Scenario:** Full family tree PDF with all lunar events

**Steps:**

1. Navigate to: Dashboard → Export
2. Click "Export Family Tree" → PDF
3. Options:
   - Format: A4 Landscape
   - Include: All events (with lunar)
   - Orientation: Vertical
4. Generate PDF

**Expected Results:**
- [ ] PDF generates successfully
- [ ] Family tree structure visible
- [ ] All members included
- [ ] Lunar events formatted correctly
- [ ] No overlapping text
- [ ] Lunar date badges visible in print
- [ ] Can be printed at 100% scale

### 2.3 Print with Lunar Dates

**Scenario:** User prints page with lunar events

**Steps:**

1. Open member detail page (with lunar event)
2. Press Ctrl+P (Cmd+P on Mac)
3. Click "Print"

**Expected Results:**
- [ ] Print preview shows lunar dates
- [ ] Colors preserved in print (if color printer)
- [ ] No layout issues
- [ ] All information legible
- [ ] Lunar badges print correctly

---

## Feature 3: Family Groups UI

### 3.1 Collapse/Expand Groups

**Scenario:** User can collapse and expand family groups

**Steps:**

1. Navigate to: Dashboard → Members
2. Toggle view: "Grid" → "Family Groups" (if available)
3. Observe family groups displayed
4. Click collapse button (▶) for first group

**Expected Results:**
- [ ] Group collapses smoothly (animation)
- [ ] Members in group hidden
- [ ] Collapse button changes to expand (▼)
- [ ] Group name still visible
- [ ] No console errors
- [ ] Animation duration: 200-300ms

**Expand Group:**
5. Click expand button
6. Group expands showing all members

**Expected Results:**
- [ ] Group expands smoothly
- [ ] All members appear
- [ ] Correct member count shown
- [ ] No duplicates

### 3.2 Group Headers

**Scenario:** Family group headers display correctly

**Steps:**

1. View Family Groups in dashboard
2. Check each group header:
   - Group name
   - Member count
   - Expand/collapse button

**Expected Results:**
- [ ] Header format: "Group Name (5 members)"
- [ ] Count matches actual members shown
- [ ] Icon clearly indicates state (collapsed/expanded)
- [ ] Dark mode styling applied
- [ ] Font sizing readable

### 3.3 Persist Group State

**Scenario:** Group collapse state persists across navigation

**Steps:**

1. Collapse "Family Group A"
2. Verify state in localStorage: 
   ```javascript
   localStorage.getItem('expandedGroups');
   ```
3. Navigate away: Dashboard → Settings
4. Return to Dashboard → Members
5. Check "Family Group A" state

**Expected Results:**
- [ ] Group remains collapsed after navigation
- [ ] State persists in localStorage
- [ ] Format: `{"expandedGroups": ["group-id-1", "group-id-3"]}`
- [ ] Works after browser refresh

---

## Feature 4: Vertical Names Display

### 4.1 Toggle Vertical Names

**Scenario:** User toggles vertical names display on/off

**Steps:**

1. Navigate to: Dashboard → Members
2. Look for settings/options menu
3. Find option: "Vertical Names" or "Show Names Vertically"
4. Toggle ON

**Expected Results:**
- [ ] Toggle activates
- [ ] Names display vertically (top to bottom)
- [ ] Animation smooth (fade in/out)
- [ ] Option remembered (check URL or localStorage)
- [ ] No console errors

### 4.2 Vertical Names Rendering

**Scenario:** Names render correctly in vertical orientation

**Steps:**

1. Enable vertical names display
2. Observe member cards showing names
3. Check different name lengths:
   - Short: "An" (2 chars)
   - Medium: "Nguyễn Văn A" (Vietnamese name)
   - Long: "Very Long Full Name With Many Characters"

**Expected Results (for each name length):**
- [ ] Characters stack vertically
- [ ] Each character on separate line
- [ ] Proper spacing between characters
- [ ] No character wrapping within line
- [ ] Text is readable and not blurry
- [ ] Supports Unicode (Vietnamese: á, ă, đ, etc.)

**Example rendering:**
```
╔─────╗
║ N   ║
║ g   ║
║ u   ║
║ y   ║
║ ễ   ║
║ n   ║
└─────┘
```

### 4.3 Vertical Names Dark Mode

**Scenario:** Vertical names display correctly in dark mode

**Steps:**

1. Enable dark mode (system → Settings → Dark Mode)
2. Enable vertical names
3. View member cards

**Expected Results:**
- [ ] Text color inverts for dark mode
- [ ] SVG text visible against dark background
- [ ] Contrast ratio >= 4.5:1 (WCAG AA)
- [ ] No color blending
- [ ] Styling consistent with rest of app

### 4.4 Vertical Names Responsive

**Scenario:** Vertical names work on mobile/tablet

**Steps:**

1. Open DevTools (F12)
2. Toggle Device Toolbar (mobile view)
3. Test viewports:
   - iPhone 12: 390px
   - iPad: 768px
   - Desktop: 1920px
4. Enable vertical names on each viewport

**Expected Results (per viewport):**

**Mobile (390px):**
- [ ] Text size readable
- [ ] Not cut off by edges
- [ ] Card layout preserved
- [ ] Touch targets >= 44x44px

**Tablet (768px):**
- [ ] Text larger than mobile
- [ ] Proper spacing maintained
- [ ] Multiple names visible without scroll

**Desktop (1920px):**
- [ ] Large readable display
- [ ] Professional appearance
- [ ] Spacing looks balanced

### 4.5 Vertical Names Accessibility

**Scenario:** Vertical names accessible to screen readers

**Steps:**

1. Inspect member card HTML
2. Check for aria-label:
   ```html
   <svg aria-label="Nguyễn Văn A">...</svg>
   ```
3. Enable screen reader (use browser extension)
4. Navigate to name element

**Expected Results:**
- [ ] aria-label contains full name
- [ ] Screen reader announces full name (not individual chars)
- [ ] Fallback text visible if SVG fails
- [ ] Semantic HTML structure maintained

---

## Cross-Feature Testing

### 4.1 Lunar Events + Vertical Names

**Scenario:** Features work together on member cards

**Steps:**

1. Enable vertical names
2. View member with lunar event
3. Check lunar date badge display

**Expected Results:**
- [ ] Vertical name displayed
- [ ] Lunar event date shown clearly
- [ ] No overlap with vertical text
- [ ] Badge color visible
- [ ] Information hierarchy clear

### 4.2 Family Groups + Vertical Names

**Scenario:** Vertical names work in family groups view

**Steps:**

1. Enable Family Groups view
2. Collapse/expand groups
3. Enable vertical names
4. Toggle groups again

**Expected Results:**
- [ ] Vertical names appear in groups
- [ ] Collapse animation smooth with text
- [ ] No layout shift when toggling
- [ ] Performance acceptable (no lag)

### 4.3 PDF Export with Vertical Names

**Scenario:** PDF includes vertical names if enabled

**Steps:**

1. Enable vertical names
2. Export person to PDF
3. Open PDF

**Expected Results:**
- [ ] PDF generated successfully
- [ ] Vertical names rendered in PDF
- [ ] Or fallback to horizontal names in PDF
- [ ] File displays correctly

---

## Browser Compatibility

### Desktop Browsers

| Browser | Version | Vertical | Lunar | Groups | PDF | Notes |
|---------|---------|----------|-------|--------|-----|-------|
| Chrome | Latest | [ ] | [ ] | [ ] | [ ] | |
| Firefox | Latest | [ ] | [ ] | [ ] | [ ] | |
| Safari | Latest | [ ] | [ ] | [ ] | [ ] | |
| Edge | Latest | [ ] | [ ] | [ ] | [ ] | |

### Mobile Browsers

| Browser | Version | Vertical | Lunar | Groups | Notes |
|---------|---------|----------|-------|--------|-------|
| Chrome Mobile | Latest | [ ] | [ ] | [ ] | |
| Safari iOS | Latest | [ ] | [ ] | [ ] | |
| Firefox Mobile | Latest | [ ] | [ ] | [ ] | |

### Tablet Browsers

| Device | Browser | Vertical | Lunar | Groups | Notes |
|--------|---------|----------|-------|--------|-------|
| iPad | Safari | [ ] | [ ] | [ ] | |
| Android Tablet | Chrome | [ ] | [ ] | [ ] | |

---

## Performance Testing

### Load Time

**Test:** Measure page load time

```javascript
// In DevTools Console:
performance.timing.loadEventEnd - performance.timing.navigationStart
```

**Targets:**
- [ ] Page load: < 3 seconds
- [ ] First Contentful Paint: < 1.5 seconds
- [ ] Largest Contentful Paint: < 2.5 seconds

### Rendering Performance

**Test:** Enable Performance tab in DevTools

**Steps:**

1. Start recording (Cmd+Shift+E)
2. Enable vertical names (trigger state change)
3. Collapse family group (trigger animation)
4. Stop recording
5. Analyze FPS

**Targets:**
- [ ] 60 FPS maintained during animations
- [ ] No frame drops below 30 FPS
- [ ] Vertical name toggle: < 100ms
- [ ] Group collapse animation: 200-300ms

### Memory Usage

**Steps:**

1. Open DevTools → Memory tab
2. Take heap snapshot before features
3. Enable vertical names, lunar display, groups
4. Take heap snapshot after
5. Compare memory delta

**Targets:**
- [ ] Initial heap: < 50MB
- [ ] After features: < 80MB
- [ ] No memory leaks (check over 5 minutes)

---

## Accessibility Testing

### Keyboard Navigation

**Test:** Navigate using only keyboard

**Steps:**

1. Disable mouse
2. Use Tab to navigate features
3. Use Enter/Space for interactions
4. Use arrow keys for groups

**Checklist:**
- [ ] All buttons reachable via Tab
- [ ] Focus visible on all interactive elements
- [ ] Tab order logical (left→right, top→bottom)
- [ ] Can toggle vertical names via keyboard
- [ ] Can collapse/expand groups via keyboard
- [ ] No keyboard traps

### Screen Reader

**Test:** Use screen reader (VoiceOver on Mac, NVDA on Windows)

**Steps:**

1. Enable screen reader
2. Navigate through member list
3. Listen for:
   - Member name announcement
   - Role/relationship info
   - Lunar date info
   - Button states

**Checklist:**
- [ ] Names announced correctly
- [ ] Lunar dates explained (not just "Lunar")
- [ ] Buttons announced with state (e.g., "Expand, button")
- [ ] Headings structured properly
- [ ] Images/SVG have alt text
- [ ] No unlabeled form inputs

### Color Contrast

**Test:** Check color contrast ratios

**Tools:** 
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools → Lighthouse

**Checklist:**
- [ ] Text on background: >= 4.5:1 (WCAG AA)
- [ ] UI components: >= 3:1
- [ ] Lunar date badge: >= 4.5:1
- [ ] Dark mode text: >= 4.5:1
- [ ] Works with high contrast mode

---

## Error Cases & Edge Cases

### Missing Lunar Data

**Scenario:** Event without lunar dates

**Steps:**

1. Create custom event (leave lunar fields empty)
2. View event in UI
3. Check database

**Expected:**
- [ ] Event still displays
- [ ] Lunar fields blank/N/A
- [ ] No console error
- [ ] UI doesn't break

### Long Names (Vertical)

**Scenario:** Very long names in vertical display

**Steps:**

1. Create person with name: "Very Long Name With Many Words"
2. Enable vertical names
3. View on different viewports

**Expected:**
- [ ] Text doesn't overflow container
- [ ] Readable at small viewport
- [ ] Or gracefully falls back to horizontal

### Special Characters in Names

**Scenario:** Names with special characters

**Test names:**
- Vietnamese: "Nguyễn Phú Trọng"
- Arabic: "محمد علي"
- Chinese: "习近平"
- Emoji: "🎃 Jack"

**Expected:**
- [ ] All display correctly
- [ ] No rendering errors
- [ ] Vertical alignment correct
- [ ] PDF exports properly

### Concurrent Operations

**Scenario:** Rapid toggling of features

**Steps:**

1. Rapidly click: Vertical names toggle
2. Rapidly open/close family groups
3. Change viewport while features active

**Expected:**
- [ ] No UI freeze
- [ ] All state updates correctly
- [ ] No console errors
- [ ] Performance acceptable

### Offline Mode

**Scenario:** App behavior with no internet

**Steps:**

1. Open Network tab in DevTools
2. Select "Offline" mode
3. Try to view features
4. Try to export

**Expected:**
- [ ] Page loads from cache
- [ ] Vertical names still work
- [ ] Groups still collapse/expand
- [ ] Export shows offline message
- [ ] No unhandled errors

---

## Database Verification

### Lunar Events Table

```sql
-- Verify lunar_month and lunar_day columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'custom_events' 
AND column_name IN ('lunar_month', 'lunar_day');

-- Should return:
-- | column_name  | data_type |
-- |--------------|-----------|
-- | lunar_month  | integer   |
-- | lunar_day    | integer   |
```

### Test Data

```sql
-- Verify test data created
SELECT COUNT(*) as event_count FROM custom_events 
WHERE lunar_month IS NOT NULL AND lunar_day IS NOT NULL;

-- Should return count > 0
```

### RLS Policies

```sql
-- Verify RLS still enforced
SELECT * FROM pg_policies WHERE tablename = 'custom_events';

-- Should have policies for:
-- - INSERT (authenticated users)
-- - SELECT (public + role-based)
-- - UPDATE (owner or editor)
-- - DELETE (owner or admin)
```

---

## Post-Testing Checklist

### Bug Tracking

**Bugs found:**
- [ ] None ✓ (release ready)
- [ ] Minor UI issues (document, non-blocking)
- [ ] Major issues (fix before release)
- [ ] Critical issues (block release)

### Test Report

**Document:**
- [ ] Date tested
- [ ] Environment (staging/prod)
- [ ] Tested by (name)
- [ ] Browser versions tested
- [ ] Devices tested
- [ ] Any bugs or issues
- [ ] Overall assessment: PASS/FAIL

### Sign-Off

- Tester Name: ______________________
- Date: ______________________
- Result: [✓ PASS / ✗ FAIL]
- Comments: ______________________

---

## Release Readiness

### Before Release

- [ ] All manual tests passed (above)
- [ ] No critical bugs
- [ ] Database migrations verified
- [ ] Build passes with 0 errors
- [ ] TypeScript strict mode passes
- [ ] Code review completed
- [ ] CHANGELOG.md updated

### Release Steps

```bash
# 1. Create release branch
git checkout -b release/v1.7.0

# 2. Update version
# package.json: "version": "1.7.0"
# CHANGELOG.md: Add v1.7.0 entry

# 3. Commit
git commit -am "chore: Release v1.7.0"

# 4. Create PR
# newfeature → main
# Title: "Release: v1.7.0 with Lunar Events, PDF Export, Family Groups, Vertical Names"

# 5. After merge, tag
git tag v1.7.0
git push origin v1.7.0

# 6. Deploy
# Vercel auto-deploys main branch
```

### Post-Release

- [ ] Verify deployed to production
- [ ] Monitor error tracking (Sentry, etc.)
- [ ] Check user feedback
- [ ] Watch analytics for issues
- [ ] Prepare hotfix if needed

---

**Test Date:** _____________________  
**Tester Name:** _____________________  
**Status:** [✓ READY FOR RELEASE / ✗ NEEDS FIXES]  
**Sign-Off:** _____________________

---

**v1.7.0 is production-ready once all tests pass! 🚀**
