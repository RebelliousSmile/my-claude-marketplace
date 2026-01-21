# SEO Validator Reference

## Meta Tags Checklist

### Essential Tags

| Tag | Required | Max Length | Purpose |
|-----|----------|------------|---------|
| `<title>` | Yes | 60 chars | Page title in search results |
| `<meta name="description">` | Yes | 160 chars | Snippet in search results |
| `<meta name="viewport">` | Yes | - | Mobile responsiveness |
| `<link rel="canonical">` | Yes | - | Prevent duplicate content |
| `<html lang="xx">` | Yes | - | Language declaration |

### Open Graph (Social)

| Tag | Purpose |
|-----|---------|
| `og:title` | Social share title |
| `og:description` | Social share description |
| `og:image` | Social share image (1200x630px) |
| `og:url` | Canonical URL |
| `og:type` | Content type (website, article) |

### Twitter Cards

| Tag | Purpose |
|-----|---------|
| `twitter:card` | Card type (summary_large_image) |
| `twitter:title` | Twitter title |
| `twitter:description` | Twitter description |
| `twitter:image` | Twitter image |

## Structured Data (JSON-LD)

### Common Schemas

```json
// Organization
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company Name",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png"
}

// BreadcrumbList
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com/" },
    { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://example.com/products" }
  ]
}

// Article
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "author": { "@type": "Person", "name": "Author Name" },
  "datePublished": "2026-01-21",
  "image": "https://example.com/image.jpg"
}
```

## Semantic HTML

### Heading Hierarchy

```html
<!-- GOOD: Proper hierarchy -->
<h1>Main Title</h1>
  <h2>Section 1</h2>
    <h3>Subsection 1.1</h3>
  <h2>Section 2</h2>

<!-- BAD: Skipping levels -->
<h1>Main Title</h1>
  <h3>Section 1</h3>  <!-- Skipped h2! -->
```

### Semantic Elements

| Element | Purpose |
|---------|---------|
| `<header>` | Page/section header |
| `<nav>` | Navigation links |
| `<main>` | Main content |
| `<article>` | Self-contained content |
| `<section>` | Thematic grouping |
| `<aside>` | Sidebar content |
| `<footer>` | Page/section footer |

## Performance Factors

### Core Web Vitals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | ≤2.5s | ≤4s | >4s |
| FID (First Input Delay) | ≤100ms | ≤300ms | >300ms |
| CLS (Cumulative Layout Shift) | ≤0.1 | ≤0.25 | >0.25 |

### Image Optimization

- Use `loading="lazy"` for below-fold images
- Provide `width` and `height` attributes
- Use modern formats (WebP, AVIF)
- Serve responsive images with `srcset`

### Critical Resources

- Inline critical CSS
- Defer non-critical JavaScript
- Preload key resources
- Use resource hints (preconnect, dns-prefetch)

## Mobile Optimization

### Requirements

- [ ] Viewport meta tag present
- [ ] Touch targets ≥ 48x48px
- [ ] Text readable without zoom (≥16px)
- [ ] No horizontal scroll
- [ ] Fast mobile load time

## Robots & Sitemap

### robots.txt

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://example.com/sitemap.xml
```

### sitemap.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-01-21</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

## Common Issues

| Issue | Impact | Fix |
|-------|--------|-----|
| Missing title | High | Add unique title per page |
| Duplicate titles | Medium | Make titles unique |
| Missing description | Medium | Add meta description |
| Missing alt text | Medium | Add descriptive alt attributes |
| Broken links | High | Fix or remove broken links |
| Slow load time | High | Optimize images, defer scripts |
| No HTTPS | High | Enable SSL/TLS |
| Missing canonical | Medium | Add canonical URLs |
| No structured data | Low | Add JSON-LD schemas |
