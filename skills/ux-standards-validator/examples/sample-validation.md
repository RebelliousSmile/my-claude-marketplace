# Example: UX Standards Validation Output

## Input

Component: `src/components/LoginForm.tsx`

## Generated Report

```markdown
# UX Standards Validation Report

**File/Component**: LoginForm.tsx
**Date**: 2026-01-21
**Validator**: /ux-standards-validator

---

## Overall Score: 68/100

| Pillar | Score | Status | Weight |
|--------|-------|--------|--------|
| Ergonomics | 75/100 | ⚠️ Warn | 30% |
| Brand Guidelines | 85/100 | ✅ Pass | 30% |
| Accessibility (WCAG 2.1 AA) | 52/100 | ❌ Fail | 40% |

**Status Legend**: ✅ Pass (>=80) | ⚠️ Warn (60-79) | ❌ Fail (<60)

---

## Executive Summary

The LoginForm component has good brand consistency but fails WCAG 2.1 AA accessibility requirements. Critical issues include missing form labels, insufficient color contrast on the submit button, and no visible focus indicators. These must be fixed before deployment.

---

## Ergonomics Analysis

### Touch Targets

| Element | Size | Status |
|---------|------|--------|
| `button.submit` | 48x40px | ⚠️ Height below 48px |
| `input[type="email"]` | 100%x44px | ✅ Good |
| `input[type="password"]` | 100%x44px | ✅ Good |
| `a.forgot-password` | 120x24px | ❌ Too small |

### Spacing & Layout

- [✅] Spacing follows system
- [✅] Responsive at all breakpoints
- [✅] Clear visual hierarchy

### Typography

| Check | Status | Notes |
|-------|--------|-------|
| Minimum font size (16px) | ✅ | Body: 16px, inputs: 16px |
| Line height (>=1.5) | ⚠️ | Error messages: 1.3 |
| Line length (<=75 chars) | ✅ | Form width constrained |

### Form UX

- [❌] All fields have visible labels
- [✅] Inline validation present
- [⚠️] Error messages clear and actionable
- [✅] Required fields indicated

---

## Brand Guidelines Analysis

### Colors

| Usage | Expected | Found | Status |
|-------|----------|-------|--------|
| Primary button | `#2563eb` | `#2563eb` | ✅ |
| Error text | `#dc2626` | `#ef4444` | ⚠️ Close but not exact |
| Background | `#ffffff` | `#ffffff` | ✅ |
| Text | `#1f2937` | `#1f2937` | ✅ |

### Typography

| Element | Expected Font | Found | Status |
|---------|---------------|-------|--------|
| Headings | Inter | Inter | ✅ |
| Body | Inter | Inter | ✅ |
| Inputs | Inter | system-ui | ⚠️ |

### Component Consistency

- ✅ `Button`: Matches design system
- ✅ `Input`: Matches design system
- ⚠️ `Link`: Underline missing on hover

---

## Accessibility Analysis (WCAG 2.1 AA)

### Perceivable

| Criterion | Status | Details |
|-----------|--------|---------|
| 1.1.1 Non-text Content | ✅ | No images requiring alt text |
| 1.3.1 Info and Relationships | ❌ | Labels not programmatically associated |
| 1.4.3 Contrast (Minimum) | ❌ | Button text: 3.2:1 (needs 4.5:1) |
| 1.4.4 Resize Text | ✅ | Works at 200% zoom |
| 1.4.10 Reflow | ✅ | No horizontal scroll at 320px |

### Operable

| Criterion | Status | Details |
|-----------|--------|---------|
| 2.1.1 Keyboard | ✅ | All elements focusable |
| 2.1.2 No Keyboard Trap | ✅ | Can tab through and exit |
| 2.4.3 Focus Order | ✅ | Logical order: email -> password -> submit |
| 2.4.7 Focus Visible | ❌ | `outline: none` removes focus indicator |

### Understandable

| Criterion | Status | Details |
|-----------|--------|---------|
| 3.1.1 Language of Page | ✅ | `lang="en"` present |
| 3.3.1 Error Identification | ⚠️ | Errors shown but not linked to fields |
| 3.3.2 Labels or Instructions | ❌ | Placeholder-only labels |

### Robust

| Criterion | Status | Details |
|-----------|--------|---------|
| 4.1.1 Parsing | ✅ | Valid HTML |
| 4.1.2 Name, Role, Value | ❌ | Missing aria-label on inputs |

### Heading Structure

```
(no headings in component)
Consider adding: h2: Login to your account
```

---

## Issues Found

### Critical (Must Fix)

1. **Missing visible labels** - `LoginForm.tsx:24-35`
   - **Problem**: Inputs use placeholder as label, disappears on focus
   - **Impact**: Users lose context, screen readers can't identify fields
   - **Fix**: Add `<label>` elements or visible text labels
   - **WCAG**: 3.3.2 Labels or Instructions

2. **Insufficient button contrast** - `LoginForm.tsx:48`
   - **Problem**: White text on #2563eb is 3.2:1, needs 4.5:1
   - **Impact**: Low vision users cannot read button text
   - **Fix**: Darken button to #1d4ed8 (4.7:1) or use darker text
   - **WCAG**: 1.4.3 Contrast (Minimum)

3. **No focus indicator** - `styles/login.css:12`
   - **Problem**: `outline: none` with no replacement
   - **Impact**: Keyboard users cannot see focused element
   - **Fix**: Add `outline: 2px solid #2563eb` or visible ring
   - **WCAG**: 2.4.7 Focus Visible

### High Priority (Should Fix)

1. **Forgot password link too small** - `LoginForm.tsx:52`
   - **Problem**: 24px height, minimum is 48px for touch
   - **Fix**: Add padding or larger clickable area

2. **Error messages not linked to inputs** - `LoginForm.tsx:30`
   - **Problem**: Errors shown but not associated via aria-describedby
   - **Fix**: Add `aria-describedby="error-email"` to input

### Medium Priority (Recommended)

1. **Add form heading** - `LoginForm.tsx`
   - Consider adding h2 "Login to your account" for screen reader context

2. **Use semantic form element** - `LoginForm.tsx:20`
   - Wrap in `<form>` instead of `<div>` for better semantics

### Low Priority (Nice to Have)

1. Consider adding "Show password" toggle for better usability
2. Add loading state to submit button during authentication

---

## Testing Checklist

### Automated Testing
- [✅] axe-core audit run
- [✅] Lighthouse accessibility audit

### Manual Testing Required
- [ ] Keyboard-only navigation test
- [ ] Screen reader test (VoiceOver/NVDA)
- [ ] 200% zoom test
- [ ] Mobile device test
- [ ] Color blindness simulation

---

## Recommendations

### Quick Wins (< 30 min)

- Add visible `<label>` elements to form fields
- Remove `outline: none` or add custom focus ring
- Darken submit button background color

### Medium Effort (1-4 hours)

- Add `aria-describedby` for error message association
- Increase forgot password link touch target
- Add semantic `<form>` wrapper with heading

### Larger Refactoring

- Consider implementing a design system form component
- Add password visibility toggle

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

---

*Generated by /ux-standards-validator*
```
