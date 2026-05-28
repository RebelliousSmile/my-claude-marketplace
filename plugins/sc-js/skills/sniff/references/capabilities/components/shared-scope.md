---
paths:
  - "components/**/*.vue"
---

# Shared components — page-specific content

- Before adding content to a shared component, grep all usages: `grep -r "ComponentName" pages/`
- Page-specific content (section titles, extra sections) must be behind an optional prop (`showTitle: false`, `showCta: false`, etc.) — never hardcoded in the shared template
- If a component is used on only one page, it can be promoted to a page-level component instead

## Pattern

```vue
<!-- ✅ shared component with optional title -->
defineProps({ showTitle: { type: Boolean, default: false } })
<div v-if="showTitle">...</div>

<!-- ❌ title hardcoded in shared component — leaks to all callers -->
<SectionTitle>Nos derniers articles</SectionTitle>
```
