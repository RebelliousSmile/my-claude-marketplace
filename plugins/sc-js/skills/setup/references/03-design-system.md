---
paths:
  - "pages/**/*.vue"
  - "components/**/*.vue"
  - "layouts/**/*.vue"
  - "assets/css/*.css"
---

# Design system

> ⚠️ **Customize per project**: token names (`theme-primary`, `semantic-error`…), font families, border radius, shadow values, and color palette are project-specific. This file is a template — adapt all concrete values to the actual design system before using.

## Colors — theme

- Accent colors: always `*-theme-primary`, never hardcoded hex or Tailwind colors
- Secondary accent: `*-theme-secondary`
- Light backgrounds: `bg-theme-primary/10`, `bg-theme-primary/20`
- Never use hardcoded hex or specific Tailwind color names for accents
- In CSS files: use `var(--color-primary)`, `var(--color-primary-rgb)`

## Colors — opacity variants (IMPORTANT)

- Tailwind JIT cannot auto-generate opacity variants for CSS custom property tokens
- All variants (`bg-theme-primary/10`, `bg-theme-primary/90`, etc.) are manually defined in `assets/css/tailwind.css` using `rgba(var(--color-primary-rgb), opacity)`
- Before using a new variant, verify it exists in `tailwind.css` — if missing, add it there
- Gradient utilities `from-theme-*` / `to-theme-*` do NOT exist — use `bg-theme-*` for solid backgrounds

## Colors — semantic

- Error / destructive: `text-semantic-error`, `bg-semantic-error-light`, `border-semantic-error-border`, `text-semantic-error-text`
- Success: `text-semantic-success`, `bg-semantic-success-light`, `text-semantic-success-text`
- Warning: `text-semantic-warning`, `bg-semantic-warning-light`, `text-semantic-warning-text`
- Info: `text-semantic-info`, `bg-semantic-info-light`, `border-semantic-info-border`, `text-semantic-info-text`
- Delete buttons: always `semantic-error`, never theme color

## Colors — neutral

- Body text: `text-gray-900` or `text-white`
- Secondary text: `text-gray-600`, `text-gray-500`
- Page background: `bg-gray-50`
- Borders: `border-gray-200`

## Buttons

- Border radius: `rounded-full` (30px) for primary/secondary buttons
- Primary: `bg-theme-primary text-white hover:opacity-90`
- Outline: `border-2 border-theme-primary text-theme-primary bg-white hover:bg-theme-primary hover:text-white`
- Destructive: `bg-semantic-error text-white hover:bg-semantic-error/90`
- Shadow: `shadow-[2px_5px_10px_2px_rgba(0,0,0,0.08)]`
- Hover lift: `transition-[background-color,color,box-shadow,transform] hover:-translate-y-0.5` (never `transition-all` — see css-transitions rule)
- Icon buttons (round): `w-10 h-10 rounded-full flex items-center justify-center`

## Cards and containers

- Border radius: adapt to design system (e.g. `rounded-2xl` sections, `rounded-xl` cards)
- Shadow: use a consistent custom class or design-token shadow (e.g. `shadow-elevated`)
- Section titles: `font-bold text-gray-900` + heading size per design scale
- Card spacing: consistent padding and gap per design system

## Forms

- Input: `rounded-lg border border-gray-300 px-4 py-2.5 text-sm`
- Focus: `focus:ring-2 focus:ring-theme-primary focus:border-theme-primary outline-none`
- Label: `block text-sm font-medium text-gray-700 mb-1`
- Helper text: `text-xs text-gray-500`
- Validation error: `text-sm text-semantic-error`

## Messages and alerts

- Error alert: `bg-semantic-error-light text-semantic-error-text border border-semantic-error-border rounded-lg p-4`
- Success alert: `bg-semantic-success-light text-semantic-success-text border border-semantic-success-border rounded-lg p-4`
- Warning alert: `bg-semantic-warning-light text-semantic-warning-text border border-semantic-warning-border rounded-lg p-4`
- Info box: `bg-semantic-info-light text-semantic-info-text border-l-4 border-semantic-info p-4 rounded-r-lg`
- Toast notification: `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg`
