---
name: wireframes-builder
description: Generate HTML wireframes for UI/UX prototyping. Creates semantic, accessible HTML mockups in documentation/wireframes/. Use when user needs "wireframe", "mockup", "prototype", "UI sketch", "layout preview".
version: 1.0.0
---
# Note: Skills inherit permissions from parent context (no allowed-tools field)

# Wireframes Builder

Generate semantic HTML wireframes for rapid UI prototyping and validation.

## Output Location

All wireframes are generated in: `documentation/wireframes/`

## Workflow

### Step 1: Discover Project Design Standards

**Read project documentation first**:

```bash
Read CLAUDE.md
Read documentation/project-config.md
Glob pattern="**/design-system.md"
Glob pattern="**/style-guide.md"
Glob pattern="**/brand-guidelines.md"
```

**Extract if available**:
- Color palette (CSS variables)
- Typography (font families, sizes)
- Spacing system (base unit)
- Component patterns

### Step 2: Understand Requirements

**Clarify with user**:
- Page/component name
- Key sections/elements
- User flows to support
- Responsive requirements

### Step 3: Generate Wireframe

**Structure principles**:
- Semantic HTML5 (header, nav, main, footer, section, article)
- Accessible by default (ARIA landmarks, labels)
- Mobile-first responsive
- CSS Variables for theming
- Minimal inline styles (clarity over perfection)

**Template structure**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Page Name] - Wireframe</title>
    <style>
        :root {
            /* Colors - from design-system.md or defaults */
            --color-primary: #2563eb;
            --color-secondary: #64748b;
            --color-background: #ffffff;
            --color-surface: #f8fafc;
            --color-text: #1e293b;
            --color-text-muted: #64748b;
            --color-border: #e2e8f0;
            --color-error: #dc2626;
            --color-success: #16a34a;

            /* Typography - from style-guide.md or defaults */
            --font-sans: system-ui, -apple-system, sans-serif;
            --font-mono: 'Fira Code', monospace;

            /* Spacing - 4px base */
            --space-1: 4px;
            --space-2: 8px;
            --space-3: 12px;
            --space-4: 16px;
            --space-6: 24px;
            --space-8: 32px;

            /* Sizing */
            --touch-target: 48px;
            --border-radius: 6px;
        }

        *, *::before, *::after { box-sizing: border-box; }

        body {
            font-family: var(--font-sans);
            color: var(--color-text);
            background: var(--color-background);
            line-height: 1.5;
            margin: 0;
        }

        /* Wireframe-specific styles */
        .wireframe-note {
            background: #fef3c7;
            border: 1px dashed #f59e0b;
            padding: var(--space-2);
            font-size: 12px;
            color: #92400e;
        }
    </style>
</head>
<body>
    <!-- Content here -->
</body>
</html>
```

### Step 4: Save and Document

**File naming**: `documentation/wireframes/[page-name].html`

**Add companion README**:

```markdown
# [Page Name] Wireframe

**Created**: [date]
**Status**: Draft | Review | Approved

## Purpose
[What this page does]

## User Stories
- As a [user], I want to [action] so that [benefit]

## Key Elements
1. [Element 1]: [description]
2. [Element 2]: [description]

## Responsive Notes
- Mobile: [behavior]
- Desktop: [behavior]

## Validation Status
- [ ] Reviewed with /ux-standards-validator
- [ ] Accessibility checked
- [ ] Stakeholder approved
```

### Step 5: Validate with UX Standards

After generating, recommend validation:

```
/ux-standards-validator documentation/wireframes/[page-name].html
```

## Wireframe Component Patterns

### Navigation

```html
<nav aria-label="Main navigation">
    <ul role="list">
        <li><a href="#" aria-current="page">Home</a></li>
        <li><a href="#">Products</a></li>
        <li><a href="#">About</a></li>
    </ul>
</nav>
```

### Form

```html
<form>
    <div class="field">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required
               aria-describedby="email-hint">
        <span id="email-hint" class="hint">We'll never share your email</span>
    </div>
    <button type="submit">Submit</button>
</form>
```

### Card

```html
<article class="card">
    <img src="placeholder.jpg" alt="[Description]" loading="lazy">
    <div class="card-body">
        <h3>Card Title</h3>
        <p>Card description text.</p>
        <a href="#" class="card-link">Learn more</a>
    </div>
</article>
```

### Modal

```html
<dialog id="modal" aria-labelledby="modal-title">
    <header>
        <h2 id="modal-title">Modal Title</h2>
        <button aria-label="Close" onclick="this.closest('dialog').close()">×</button>
    </header>
    <div class="modal-body">
        <!-- Content -->
    </div>
    <footer>
        <button type="button">Cancel</button>
        <button type="button" class="primary">Confirm</button>
    </footer>
</dialog>
```

## Output Format

```markdown
## Wireframe Generated

**File**: `documentation/wireframes/[name].html`
**Date**: [ISO date]

### Structure
- Header: [components]
- Main: [sections]
- Footer: [components]

### Accessibility Features
- [x] Semantic HTML landmarks
- [x] Form labels associated
- [x] ARIA labels where needed
- [x] Focus management

### Next Steps
1. Open in browser to preview
2. Run `/ux-standards-validator` for validation
3. Iterate based on feedback

### Preview
[Can be viewed at: file:///.../documentation/wireframes/[name].html]
```

## Fallback Standards

If no project design system exists, use:
- **Colors**: Tailwind CSS default palette
- **Typography**: System fonts stack
- **Spacing**: 4px base unit
- **Touch targets**: 48px minimum
