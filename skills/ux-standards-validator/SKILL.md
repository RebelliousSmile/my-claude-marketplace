---
name: ux-standards-validator
description: Validate UI/UX design against ergonomics standards, brand guidelines, and accessibility rules (WCAG AA/AAA). Use when reviewing interfaces, checking accessibility, validating responsive design, or when user mentions "UI", "UX", "design", "accessibility", "a11y", "responsive", "mobile", "WCAG".
version: 1.0.0
---
# Note: Skills inherit permissions from parent context (no allowed-tools field)

# UX Standards Validator

Validate UI/UX implementations against:
1. **Ergonomics standards** (usability, touch targets, spacing)
2. **Brand guidelines** (colors, typography, visual identity)
3. **Accessibility rules** (WCAG 2.1 AA minimum, AAA preferred)

## Workflow

### Step 1: Discover Project Standards

**BEFORE validating**, read project documentation:

```bash
Read CLAUDE.md
Glob pattern="**/design-system.md"
Glob pattern="**/brand-guidelines.md"
Glob pattern="**/style-guide.md"
```

**Extract**:
- Color palette (primary, secondary, neutral, semantic)
- Typography (font families, sizes, weights)
- Spacing system (base unit, scale)
- Component library

### Step 2: Analyze the UI/UX

#### Pillar 1: Ergonomics (0-100)

- [ ] Touch targets >= 48x48px
- [ ] Spacing follows project system
- [ ] Typography readable (min 14px, line-height >= 1.5)
- [ ] Responsive design (mobile-first if required)
- [ ] Loading states visible
- [ ] Error messages clear and actionable
- [ ] Form validation inline
- [ ] Navigation intuitive

#### Pillar 2: Brand Guidelines (0-100)

- [ ] Colors match project palette
- [ ] Typography uses project fonts
- [ ] Font sizes follow scale
- [ ] Spacing uses project units
- [ ] Component consistency
- [ ] Dark mode (if required)
- [ ] Visual hierarchy clear

#### Pillar 3: Accessibility WCAG 2.1 (0-100)

- [ ] Semantic HTML (header, nav, main, footer)
- [ ] Heading hierarchy (h1 -> h2 -> h3, no skips)
- [ ] Alt text for images
- [ ] Form labels properly associated
- [ ] Color contrast >= 4.5:1 (text), >= 3:1 (large)
- [ ] Keyboard navigation supported
- [ ] Focus indicators visible
- [ ] ARIA labels where needed

### Step 3: Generate Report

```markdown
# UX Standards Validation Report

**File/Component**: [Name]
**Date**: [ISO date]

## Overall Score: [X/100]

| Pillar | Score | Status |
|--------|-------|--------|
| Ergonomics | X/100 | pass/warn/fail |
| Brand Guidelines | X/100 | pass/warn/fail |
| Accessibility (AA) | X/100 | pass/warn/fail |

## Critical Issues (Must Fix)
1. **[Issue]** - `file:line`
   - Problem: [description]
   - Fix: [solution]

## Important Issues (Should Fix)
1. **[Issue]** - `file:line`

## Suggestions (Nice to Have)
1. **[Suggestion]**

## Testing Checklist
- [ ] Test with keyboard only
- [ ] Test with screen reader
- [ ] Test at 200% zoom
- [ ] Test on mobile device
```

## Fallback Standards

If project documentation is missing:
- Use WCAG 2.1 AA as minimum
- Use Material Design ergonomics (48px touch targets)
- Use 4.5:1 contrast ratio for text
- Use mobile-first responsive approach

## Severity Classification

**CRITICAL**: Missing alt text, insufficient contrast, keyboard broken, focus removed
**HIGH**: Touch targets < 48px, hardcoded colors, inconsistent spacing
**MEDIUM**: Non-semantic HTML, heading skips, missing ARIA
**LOW**: AAA improvements, minor inconsistencies
