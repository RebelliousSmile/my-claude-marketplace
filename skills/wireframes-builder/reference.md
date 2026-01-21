# Wireframes Builder Reference

## Semantic HTML5 Elements

### Document Structure

| Element | Purpose | ARIA Role |
|---------|---------|-----------|
| `<header>` | Page/section header | `banner` (page-level) |
| `<nav>` | Navigation links | `navigation` |
| `<main>` | Primary content | `main` |
| `<article>` | Self-contained content | `article` |
| `<section>` | Thematic grouping | `region` (with aria-label) |
| `<aside>` | Sidebar/related | `complementary` |
| `<footer>` | Page/section footer | `contentinfo` (page-level) |

### Interactive Elements

| Element | Purpose | Notes |
|---------|---------|-------|
| `<button>` | Actions | Not for navigation |
| `<a>` | Navigation | Has href |
| `<dialog>` | Modal dialogs | Native modal support |
| `<details>` | Collapsible | Accessible accordion |
| `<form>` | User input | Group related inputs |

---

## CSS Variables System

### Color Palette Template

```css
:root {
    /* Brand Colors */
    --color-primary: #2563eb;
    --color-primary-dark: #1d4ed8;
    --color-primary-light: #3b82f6;

    /* Neutral Colors */
    --color-gray-50: #f8fafc;
    --color-gray-100: #f1f5f9;
    --color-gray-200: #e2e8f0;
    --color-gray-300: #cbd5e1;
    --color-gray-400: #94a3b8;
    --color-gray-500: #64748b;
    --color-gray-600: #475569;
    --color-gray-700: #334155;
    --color-gray-800: #1e293b;
    --color-gray-900: #0f172a;

    /* Semantic Colors */
    --color-success: #16a34a;
    --color-warning: #d97706;
    --color-error: #dc2626;
    --color-info: #0891b2;

    /* Surface Colors */
    --color-background: #ffffff;
    --color-surface: #f8fafc;
    --color-surface-elevated: #ffffff;
}
```

### Typography Scale

```css
:root {
    /* Font Families */
    --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-serif: Georgia, Cambria, 'Times New Roman', serif;
    --font-mono: 'Fira Code', Consolas, Monaco, monospace;

    /* Font Sizes (Major Third Scale - 1.25) */
    --text-xs: 0.75rem;    /* 12px */
    --text-sm: 0.875rem;   /* 14px */
    --text-base: 1rem;     /* 16px */
    --text-lg: 1.125rem;   /* 18px */
    --text-xl: 1.25rem;    /* 20px */
    --text-2xl: 1.5rem;    /* 24px */
    --text-3xl: 1.875rem;  /* 30px */
    --text-4xl: 2.25rem;   /* 36px */

    /* Line Heights */
    --leading-tight: 1.25;
    --leading-snug: 1.375;
    --leading-normal: 1.5;
    --leading-relaxed: 1.625;

    /* Font Weights */
    --font-normal: 400;
    --font-medium: 500;
    --font-semibold: 600;
    --font-bold: 700;
}
```

### Spacing Scale

```css
:root {
    /* 4px base unit */
    --space-0: 0;
    --space-px: 1px;
    --space-0.5: 2px;
    --space-1: 4px;
    --space-1.5: 6px;
    --space-2: 8px;
    --space-2.5: 10px;
    --space-3: 12px;
    --space-3.5: 14px;
    --space-4: 16px;
    --space-5: 20px;
    --space-6: 24px;
    --space-7: 28px;
    --space-8: 32px;
    --space-9: 36px;
    --space-10: 40px;
    --space-12: 48px;
    --space-14: 56px;
    --space-16: 64px;
    --space-20: 80px;
    --space-24: 96px;
}
```

---

## Responsive Breakpoints

### Mobile-First Media Queries

```css
/* Mobile (default) */
.element { /* mobile styles */ }

/* Tablet (640px+) */
@media (min-width: 640px) {
    .element { /* tablet styles */ }
}

/* Laptop (1024px+) */
@media (min-width: 1024px) {
    .element { /* laptop styles */ }
}

/* Desktop (1280px+) */
@media (min-width: 1280px) {
    .element { /* desktop styles */ }
}
```

### Container Widths

| Breakpoint | Container Max-Width |
|------------|---------------------|
| Mobile | 100% (with padding) |
| sm (640px) | 640px |
| md (768px) | 768px |
| lg (1024px) | 1024px |
| xl (1280px) | 1280px |
| 2xl (1536px) | 1536px |

---

## Common Wireframe Patterns

### Page Layouts

**Single Column (Mobile-First)**
```
┌─────────────────────┐
│       Header        │
├─────────────────────┤
│        Nav          │
├─────────────────────┤
│                     │
│        Main         │
│                     │
├─────────────────────┤
│       Footer        │
└─────────────────────┘
```

**Sidebar Layout (Desktop)**
```
┌─────────────────────────────┐
│           Header            │
├─────────┬───────────────────┤
│         │                   │
│  Side   │       Main        │
│         │                   │
├─────────┴───────────────────┤
│           Footer            │
└─────────────────────────────┘
```

**Dashboard Layout**
```
┌─────────────────────────────┐
│    Topbar with Actions      │
├───────┬─────────────────────┤
│       │   ┌───┐  ┌───┐      │
│  Nav  │   │   │  │   │      │
│       │   └───┘  └───┘      │
│       │   ┌─────────────┐   │
│       │   │   Table     │   │
│       │   └─────────────┘   │
└───────┴─────────────────────┘
```

### Component Patterns

**Form Pattern**
```html
<form class="form" novalidate>
    <fieldset>
        <legend>Personal Information</legend>

        <div class="form-group">
            <label for="name">Full Name <span aria-hidden="true">*</span></label>
            <input type="text" id="name" name="name" required
                   aria-required="true">
        </div>

        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email"
                   aria-describedby="email-error">
            <span id="email-error" class="error" hidden>
                Please enter a valid email
            </span>
        </div>
    </fieldset>

    <div class="form-actions">
        <button type="button">Cancel</button>
        <button type="submit">Save</button>
    </div>
</form>
```

**Table Pattern**
```html
<div class="table-container" role="region" aria-label="Data table" tabindex="0">
    <table>
        <caption class="sr-only">List of items</caption>
        <thead>
            <tr>
                <th scope="col">Name</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Item 1</td>
                <td><span class="badge">Active</span></td>
                <td>
                    <button aria-label="Edit Item 1">Edit</button>
                    <button aria-label="Delete Item 1">Delete</button>
                </td>
            </tr>
        </tbody>
    </table>
</div>
```

**List Pattern**
```html
<ul role="list" class="card-list">
    <li>
        <article class="card">
            <img src="placeholder.jpg" alt="" loading="lazy">
            <div class="card-content">
                <h3><a href="#">Card Title</a></h3>
                <p>Description text here.</p>
            </div>
        </article>
    </li>
</ul>
```

---

## Accessibility Checklist for Wireframes

### Landmarks

- [ ] `<header>` for page header
- [ ] `<nav>` for navigation (with aria-label if multiple)
- [ ] `<main>` for main content (one per page)
- [ ] `<footer>` for page footer
- [ ] `<section>` with aria-label for major sections

### Forms

- [ ] All inputs have associated `<label>`
- [ ] Required fields marked with `aria-required="true"`
- [ ] Error messages linked with `aria-describedby`
- [ ] Submit button has clear text
- [ ] Fieldset/legend for grouped inputs

### Navigation

- [ ] Skip link to main content
- [ ] Current page indicated with `aria-current="page"`
- [ ] Keyboard-accessible (Tab/Enter/Space)

### Images

- [ ] All `<img>` have `alt` attribute
- [ ] Decorative images: `alt=""`
- [ ] Informative images: descriptive alt text

### Interactive Elements

- [ ] Buttons for actions, links for navigation
- [ ] Touch targets >= 48x48px
- [ ] Focus indicators visible
- [ ] State changes announced to screen readers

---

## Placeholder Content

### Image Placeholders

```html
<!-- Local placeholder -->
<div class="img-placeholder" style="aspect-ratio: 16/9; background: #e2e8f0;">
    <span>Image 1200x675</span>
</div>

<!-- External service (if allowed) -->
<img src="https://placehold.co/1200x675" alt="Placeholder">
```

### Text Placeholders

```html
<!-- Lorem ipsum short -->
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>

<!-- Lorem ipsum paragraph -->
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
ad minim veniam, quis nostrud exercitation.</p>

<!-- Skeleton text -->
<div class="skeleton" style="height: 1em; width: 80%; background: #e2e8f0;"></div>
```

---

## File Organization

```
documentation/
└── wireframes/
    ├── README.md           # Index of all wireframes
    ├── home.html           # Homepage wireframe
    ├── login.html          # Login page wireframe
    ├── dashboard.html      # Dashboard wireframe
    └── components/         # Reusable component wireframes
        ├── navigation.html
        ├── forms.html
        └── cards.html
```

---

## Validation Workflow

1. **Create wireframe** with this skill
2. **Preview locally** in browser
3. **Validate** with `/ux-standards-validator`
4. **Iterate** based on feedback
5. **Document** decisions in companion README
6. **Archive** approved wireframes
