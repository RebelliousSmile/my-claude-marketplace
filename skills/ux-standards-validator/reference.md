# UX Standards Validator Reference

## WCAG 2.1 Quick Reference

### Level AA (Minimum Required)

#### Perceivable

| Criterion | Requirement | Test |
|-----------|-------------|------|
| 1.1.1 Non-text Content | Alt text for images | Check all `<img>` have `alt` |
| 1.3.1 Info and Relationships | Semantic HTML | Verify landmarks, headings |
| 1.3.4 Orientation | No orientation lock | Test landscape/portrait |
| 1.4.3 Contrast (Minimum) | 4.5:1 text, 3:1 large | Use contrast checker |
| 1.4.4 Resize Text | 200% zoom no loss | Test browser zoom |
| 1.4.10 Reflow | No horizontal scroll at 320px | Test narrow viewport |
| 1.4.11 Non-text Contrast | 3:1 for UI components | Check borders, icons |

#### Operable

| Criterion | Requirement | Test |
|-----------|-------------|------|
| 2.1.1 Keyboard | All functions via keyboard | Tab through page |
| 2.1.2 No Keyboard Trap | Can tab away from elements | Test all components |
| 2.4.3 Focus Order | Logical tab order | Verify sequence |
| 2.4.6 Headings and Labels | Descriptive headings | Review h1-h6 |
| 2.4.7 Focus Visible | Clear focus indicator | Check outline/ring |

#### Understandable

| Criterion | Requirement | Test |
|-----------|-------------|------|
| 3.1.1 Language of Page | `lang` attribute | Check `<html lang>` |
| 3.2.1 On Focus | No context change on focus | Test focus events |
| 3.3.1 Error Identification | Errors identified clearly | Submit empty forms |
| 3.3.2 Labels or Instructions | Form fields labeled | Check `<label>` tags |

#### Robust

| Criterion | Requirement | Test |
|-----------|-------------|------|
| 4.1.1 Parsing | Valid HTML | W3C validator |
| 4.1.2 Name, Role, Value | ARIA correct | Screen reader test |

### Level AAA (Recommended)

| Criterion | Requirement |
|-----------|-------------|
| 1.4.6 Contrast (Enhanced) | 7:1 text, 4.5:1 large |
| 2.4.9 Link Purpose (Link Only) | Link text meaningful alone |
| 3.2.5 Change on Request | User-initiated changes only |

---

## Ergonomics Standards

### Touch Targets

| Platform | Minimum Size | Recommended |
|----------|--------------|-------------|
| iOS | 44x44 pt | 48x48 pt |
| Android | 48x48 dp | 48x48 dp |
| Web (Mobile) | 48x48 px | 48x48 px |
| Web (Desktop) | 24x24 px | 32x32 px |

### Spacing System

Common spacing scales (based on 4px or 8px):

```
4px scale:  4, 8, 12, 16, 24, 32, 48, 64, 96
8px scale:  8, 16, 24, 32, 48, 64, 96, 128
```

### Typography

| Element | Min Size | Line Height | Max Width |
|---------|----------|-------------|-----------|
| Body text | 16px | 1.5 | 65-75 chars |
| Small text | 14px | 1.4 | 65-75 chars |
| Headings | varies | 1.2-1.3 | - |
| Labels | 12px | 1.4 | - |

### Form UX

- Inline validation (real-time feedback)
- Clear error messages with solutions
- Logical tab order
- Visible required field indicators
- Appropriate input types (email, tel, etc.)

---

## Color Contrast Ratios

### Text Contrast (WCAG)

| Text Type | AA Minimum | AAA Enhanced |
|-----------|------------|--------------|
| Normal text (<18px) | 4.5:1 | 7:1 |
| Large text (>=18px or 14px bold) | 3:1 | 4.5:1 |
| UI components | 3:1 | 4.5:1 |

### Common Passing Combinations

| Background | Foreground | Ratio | Level |
|------------|------------|-------|-------|
| #FFFFFF | #000000 | 21:1 | AAA |
| #FFFFFF | #595959 | 7:1 | AAA |
| #FFFFFF | #757575 | 4.6:1 | AA |
| #F5F5F5 | #333333 | 10.9:1 | AAA |
| #1a1a1a | #FFFFFF | 16.1:1 | AAA |

### Tools for Checking

- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools (Accessibility panel)
- Stark plugin (Figma/Sketch)

---

## Semantic HTML Landmarks

### Required Landmarks

```html
<header role="banner">       <!-- One per page -->
<nav role="navigation">      <!-- Primary navigation -->
<main role="main">           <!-- One per page, main content -->
<footer role="contentinfo">  <!-- One per page -->
```

### Optional Landmarks

```html
<aside role="complementary">  <!-- Sidebar, related content -->
<section role="region">       <!-- With aria-label -->
<article role="article">      <!-- Self-contained content -->
<form role="form">            <!-- With aria-label -->
```

### Heading Hierarchy

```
GOOD:                    BAD:
h1                       h1
├── h2                   ├── h3  ← Skipped h2!
│   ├── h3              │   └── h4
│   └── h3              └── h2
└── h2
```

---

## ARIA Best Practices

### When to Use ARIA

1. **No native HTML equivalent** (tabs, trees, grids)
2. **Dynamic content changes** (live regions)
3. **Custom components** (styled dropdowns)

### Common ARIA Patterns

```html
<!-- Button with state -->
<button aria-pressed="true">Toggle</button>

<!-- Expandable section -->
<button aria-expanded="false" aria-controls="panel1">
<div id="panel1" hidden>Content</div>

<!-- Live region for updates -->
<div aria-live="polite" aria-atomic="true">
  Status: Loading...
</div>

<!-- Loading state -->
<div aria-busy="true" aria-label="Loading content">

<!-- Required field -->
<input aria-required="true" aria-invalid="false">

<!-- Description -->
<input aria-describedby="hint1">
<span id="hint1">Must be 8+ characters</span>
```

### ARIA Roles Reference

| Role | Use Case |
|------|----------|
| `alert` | Important time-sensitive message |
| `alertdialog` | Alert requiring user action |
| `dialog` | Modal dialog |
| `tab`, `tablist`, `tabpanel` | Tab interface |
| `menu`, `menuitem` | Navigation menu |
| `tooltip` | Descriptive tooltip |
| `status` | Status message |

---

## Responsive Design Breakpoints

### Common Breakpoints

| Device | Width | Usage |
|--------|-------|-------|
| Mobile S | 320px | Minimum supported |
| Mobile M | 375px | iPhone X/11/12 |
| Mobile L | 425px | Large phones |
| Tablet | 768px | iPad portrait |
| Laptop | 1024px | iPad landscape, small laptops |
| Desktop | 1440px | Standard desktop |
| 4K | 2560px | Large displays |

### Mobile-First Media Queries

```css
/* Base: Mobile */
.element { font-size: 14px; }

/* Tablet and up */
@media (min-width: 768px) {
  .element { font-size: 16px; }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .element { font-size: 18px; }
}
```

---

## Focus Management

### Visible Focus Requirements

```css
/* Minimum visible focus */
:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}

/* Skip link */
.skip-link:focus {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
}
```

### Focus Order Rules

1. Left-to-right, top-to-bottom (LTR languages)
2. Match visual order
3. No focus traps (except modals)
4. Restore focus after modal close

---

## Testing Checklist

### Automated Testing

| Tool | What it Catches |
|------|-----------------|
| axe-core | ~30% of WCAG issues |
| Lighthouse | Performance + accessibility |
| WAVE | Visual accessibility audit |
| Pa11y | CI/CD integration |

### Manual Testing Required

- [ ] Keyboard-only navigation
- [ ] Screen reader experience (NVDA, VoiceOver)
- [ ] 200% zoom test
- [ ] Mobile device test
- [ ] Color blindness simulation
- [ ] Cognitive load assessment

### Screen Reader Testing

| OS | Screen Reader | Browser |
|----|---------------|---------|
| Windows | NVDA | Firefox |
| Windows | JAWS | Chrome |
| macOS | VoiceOver | Safari |
| iOS | VoiceOver | Safari |
| Android | TalkBack | Chrome |

---

## Severity Classification

| Severity | Impact | Examples |
|----------|--------|----------|
| **Critical** | Blocks users completely | No keyboard access, missing alt text on essential images, contrast < 3:1 |
| **High** | Significant barriers | Touch targets < 48px, unclear form errors, broken focus |
| **Medium** | Usability issues | Non-semantic HTML, heading skips, missing ARIA |
| **Low** | Enhancement opportunities | AAA improvements, minor inconsistencies |

---

## Quick Fixes Reference

| Issue | Fix |
|-------|-----|
| Missing alt text | Add `alt="description"` or `alt=""` for decorative |
| Low contrast | Darken text or lighten background |
| No focus visible | Add `outline` or custom focus ring |
| Small touch target | Add padding, min 48px clickable |
| Missing labels | Add `<label for="id">` or `aria-label` |
| Heading skip | Use proper h1-h6 sequence |
| No language | Add `lang="en"` to `<html>` |
| Keyboard trap | Ensure focus can exit with Tab |
