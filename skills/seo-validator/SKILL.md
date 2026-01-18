---
name: seo-validator
description: Validate SEO implementation against best practices. Use when checking meta tags, structured data, semantic HTML, performance, mobile-friendliness, or when user mentions "SEO", "search", "Google", "meta tags", "keywords", "ranking".
version: 1.0.0
---
# Note: Skills inherit permissions from parent context (no allowed-tools field)

# SEO Validator

Validate SEO implementation against:
1. **On-Page SEO** (meta tags, headings, content structure)
2. **Technical SEO** (structured data, canonical URLs, performance)
3. **Mobile SEO** (responsive design, mobile-friendliness)
4. **Advanced SEO** (voice search, LLM/AI search optimization)

## Workflow

### Step 1: Discover Project SEO Strategy

```bash
Read CLAUDE.md
Glob pattern="**/seo*.md"
Grep pattern="SEO|meta tags|Open Graph|Schema.org"
```

### Step 2: Analyze Against 4 Pillars

#### Pillar 1: On-Page SEO (30 points)

1. **Title Tag** (8 pts)
   - [ ] Exists and unique
   - [ ] 50-60 characters
   - [ ] Contains primary keyword

2. **Meta Description** (6 pts)
   - [ ] Exists and unique
   - [ ] 150-160 characters
   - [ ] Includes call-to-action

3. **Headings Hierarchy** (6 pts)
   - [ ] Single `<h1>` per page
   - [ ] Logical hierarchy (no skips)
   - [ ] Descriptive and scannable

4. **Content Quality** (5 pts)
   - [ ] Minimum 300 words
   - [ ] Keywords natural (not stuffed)
   - [ ] Internal links present

5. **Images** (5 pts)
   - [ ] All have descriptive `alt` text
   - [ ] Optimized (WebP, lazy loading)
   - [ ] Responsive (`srcset`)

#### Pillar 2: Technical SEO (30 points)

1. **Meta Viewport** (4 pts)
2. **Canonical URL** (6 pts)
3. **Open Graph Tags** (6 pts)
4. **Twitter Cards** (3 pts)
5. **Structured Data (Schema.org)** (8 pts)
6. **Performance Hints** (3 pts)

#### Pillar 3: Mobile SEO (20 points)

1. **Mobile-Friendly Design** (10 pts)
2. **Page Speed** (10 pts)

#### Pillar 4: Advanced SEO (20 points)

1. **Voice Search Optimization** (10 pts)
   - Question-based content
   - Featured snippet optimization
   - FAQPage/HowTo schema

2. **LLM/AI Search Optimization** (10 pts)
   - Clear content structure
   - Direct answers with citations
   - Freshness and entity clarity

### Step 3: Generate Report

```markdown
# SEO Validation Report

**Page**: [Name/URL]
**Date**: [ISO date]

## Overall Score: [X/100]

| Pillar | Score | Status |
|--------|-------|--------|
| On-Page SEO | X/30 | pass/warn/fail |
| Technical SEO | X/30 | pass/warn/fail |
| Mobile SEO | X/20 | pass/warn/fail |
| Advanced SEO | X/20 | pass/warn/fail |

## Critical Issues
[List with fixes]

## Optimized Meta Tags
```html
<title>[Optimized title]</title>
<meta name="description" content="[Optimized]">
```

## Schema Markup Recommendation
```json
{
  "@context": "https://schema.org",
  "@type": "[type]"
}
```
```

## Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
