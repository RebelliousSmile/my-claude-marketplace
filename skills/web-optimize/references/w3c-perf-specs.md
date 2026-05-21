# W3C / WICG Performance Specs — Implementer Reference

## Purpose

- Use as a pre-implementation checklist when touching DOM, network, or JS execution
- Use as a cross-check during audit to verify findings are grounded in the spec, not just Lighthouse convention
- One entry per spec → testable criterion → detection pattern
- Generic: applies to any web stack (not framework-specific)

---

## 1. LCP — Largest Contentful Paint

**Spec:** WICG LCP API — https://wicg.github.io/largest-contentful-paint/
**Threshold:** ≤ 2.5s Good · ≤ 4.0s Needs Improvement · > 4.0s Poor

Implementer checklist:
- LCP candidate is `<img>`, `<image>` inside SVG, `<video poster>`, or block element with `background-image` — prefer `<img>` (background-image is NOT preloadable by scanner)
- `loading="lazy"` FORBIDDEN on above-fold images — LCP element must load eagerly
- `fetchpriority="high"` on the `<img>` tag that is the LCP candidate
- `<link rel="preload" as="image" fetchpriority="high">` in `<head>` for the LCP image
- No render-blocking resource between `<head>` opening and LCP element
- LCP image must have `width` + `height` set to avoid decode resize on first paint

Detection:
```bash
grep -rn 'loading="lazy"' --include="*.html" --include="*.vue" --include="*.jsx" --include="*.tsx"
grep -rn '<img' --include="*.html" --include="*.vue" --include="*.jsx" | grep -v 'fetchpriority'
grep -rn 'background-image\|background:.*url(' --include="*.css" --include="*.vue" --include="*.jsx"
```

---

## 2. CLS — Cumulative Layout Shift

**Spec:** WICG Layout Instability API — https://wicg.github.io/layout-instability/
**Threshold:** ≤ 0.1 Good · ≤ 0.25 Needs Improvement · > 0.25 Poor

Implementer checklist:
- Explicit `width` + `height` on EVERY `<img>`, `<video>`, `<iframe>`, `<embed>` — absence causes shift when resource loads
- `aspect-ratio` CSS is an accepted equivalent to explicit width + height
- `font-display: swap` → FOUT (text visible immediately but shifts at font swap); `font-display: optional` → no shift (font only used if already cached)
- No content injected above viewport fold after initial render (ads, banners, cookie notices)
- Animations: only `transform` + `opacity` are composited — `top`, `left`, `width`, `height`, `margin` trigger layout → cause CLS
- Absolutely-positioned elements that change size do NOT cause CLS (out of flow)
- Use `transform: translateY()` to animate banners rather than `top` or `margin-top`

Detection:
```bash
grep -rn '<img' --include="*.html" --include="*.vue" --include="*.jsx" | grep -v 'width'
grep -rn '<iframe\|<video\|<embed' --include="*.html" --include="*.vue" | grep -v 'width'
grep -rn 'font-display' --include="*.css" --include="*.vue"
grep -rn 'transition-all\|transition:.*top\|transition:.*margin\|transition:.*height\|transition:.*width' --include="*.css" --include="*.vue"
```

---

## 3. INP — Interaction to Next Paint

**Spec:** WICG Event Timing API — https://wicg.github.io/event-timing/
**Threshold:** ≤ 200ms Good · ≤ 500ms Needs Improvement · > 500ms Poor

Implementer checklist:
- INP = input delay + processing time + presentation delay — worst interaction across the session
- Synchronous work inside click/keydown/input handlers MUST complete in < 50ms total
- Heavy computation → move to `queueMicrotask()`, `scheduler.postTask()`, or Web Worker
- No synchronous XHR (`XMLHttpRequest` with `async=false`) in any interaction handler
- `setTimeout(fn, 0)` defers to next task but does NOT yield to browser paint — use `scheduler.yield()` or MessageChannel trick to yield before paint
- `addEventListener` on scroll/touchstart MUST use `{ passive: true }` — synchronous handlers block scroll
- Debounce `input` / `keyup` handlers (≥ 200ms) — every keystroke counts as an interaction
- Third-party scripts with synchronous event listeners → audit in DevTools → load with `defer` or after `load` event

Detection:
```bash
grep -rn 'XMLHttpRequest\|\.open(' --include="*.js" --include="*.ts" --include="*.vue" | grep 'false'
grep -rn 'addEventListener.*scroll\|addEventListener.*touchstart' --include="*.js" --include="*.ts" --include="*.vue" | grep -v 'passive'
grep -rn '@input\|@keyup\|@keydown' --include="*.vue" | grep -v 'debounce\|throttle'
```

---

## 4. FCP — First Contentful Paint

**Spec:** W3C Paint Timing — https://www.w3.org/TR/paint-timing/
**Threshold:** ≤ 1.8s Good · ≤ 3.0s Needs Improvement · > 3.0s Poor

Implementer checklist:
- FCP = time when browser renders first DOM text or image pixel
- `<link rel="stylesheet">` in `<head>` blocks rendering — inline critical CSS, defer non-critical via `media="print" onload`
- `<script>` without `defer`/`async` in `<head>` blocks HTML parsing
- `type="module"` scripts are deferred by default (equivalent to `defer`)
- Fonts: `font-display: swap` provides fallback text at FCP (avoids FOIT); `optional` skips font if not in cache
- TTFB is the floor for FCP — server response time directly sets minimum FCP

Detection:
```bash
grep -rn '<script' --include="*.html" --include="*.vue" | grep -v 'defer\|async\|type="module"\|type="application/ld'
grep -rn '<link rel="stylesheet"' --include="*.html" | grep -v 'media="print"\|onload'
grep -rn "@font-face" --include="*.css" --include="*.vue" | grep -v 'font-display'
```

---

## 5. TTFB — Time to First Byte

**Spec:** Navigation Timing Level 2 — https://www.w3.org/TR/navigation-timing-2/
(`responseStart - fetchStart`)
**Threshold:** ≤ 800ms Good · ≤ 1800ms Needs Improvement · > 1800ms Poor

Implementer checklist:
- Redirect chain → each hop adds ≥ 1 RTT — avoid chains (301 A→B→C) on landing pages
- `Cache-Control: s-maxage=N` on CDN → serve from edge, no origin hit on repeated requests
- No synchronous heavy DB query or external API call in the critical rendering path
- Brotli (preferred) or gzip compression on all text responses — check `Content-Encoding` header
- HTTP/2 or HTTP/3 eliminates head-of-line blocking for concurrent subresources
- CDN configured: HTML can carry short `s-maxage` (e.g. 60s) with `stale-while-revalidate` for edge freshness

Detection:
```bash
curl -o /dev/null -s -w "TTFB: %{time_starttransfer}s\n" https://your-domain.com/
# Redirect chain:
curl -sIL https://your-domain.com/ | grep -E 'HTTP/|Location:'
# Compression:
curl -sI -H 'Accept-Encoding: br,gzip' https://your-domain.com/ | grep 'content-encoding'
```

---

## 6. TBT — Total Blocking Time

**Spec:** WICG Long Tasks API — https://w3c.github.io/longtasks/
(TBT = sum of blocking portions of tasks > 50ms during FCP → TTI)
**Threshold:** ≤ 200ms Good · ≤ 600ms Needs Improvement · > 600ms Poor

Implementer checklist:
- Any JS task > 50ms on main thread contributes to TBT — blocking portion = `(duration - 50ms)`
- Script evaluation at page load is a common source — code-split, lazy-load non-critical JS
- `import()` dynamic import to defer heavy modules until interaction/route needed
- Third-party scripts (analytics, chat, ads) → load with `defer` or after `load` event
- `JSON.parse` of large payloads on main thread is blocking — parse in Web Worker or stream
- `requestIdleCallback` for non-critical initialization work (post-TTI)
- Large `for` loops / array transformations in synchronous rendering path → profile first

Detection:
```bash
# Large synchronous top-level imports in entry chunk
grep -rn '^import ' --include="*.ts" --include="*.js" --include="*.vue" | wc -l

# setTimeout(fn, 0) pseudo-yields that don't actually yield to paint
grep -rn 'setTimeout.*,\s*0' --include="*.ts" --include="*.js" --include="*.vue"
```

---

## 7. Preload

**Spec:** W3C Preload — https://www.w3.org/TR/preload/

Implementer checklist:
- `<link rel="preload">` REQUIRES `as=` attribute — missing `as` → browser ignores or double-fetches the resource
- Valid `as` values: `script`, `style`, `image`, `font`, `fetch`, `document`, `worker`, `audio`, `video`, `track`
- Fonts: MUST add `crossorigin` attribute even for same-origin fonts (CORS requirement in spec)
- Every `rel="preload"` MUST be consumed by the page — unused preload = console warning + wasted bandwidth
- `fetchpriority="high"` on `rel="preload"` for the single most critical resource
- Responsive images: use `imagesrcset` + `imagesizes` on `<link rel="preload" as="image">` to match the correct source
- Do NOT preload resources that are already render-blocking (browser already prioritizes them)

Detection:
```bash
grep -rn 'rel="preload"' --include="*.html" --include="*.vue" | grep -v 'as='
grep -rn 'rel="preload".*as="font"' --include="*.html" --include="*.vue" | grep -v 'crossorigin'
# Detect likely unused preloads (preload present, no matching tag in same file):
grep -rn 'rel="preload"' --include="*.html" --include="*.vue"
```

---

## 8. Resource Hints

**Spec:** W3C Resource Hints — https://www.w3.org/TR/resource-hints/

Implementer checklist:
- `dns-prefetch`: DNS resolution only (< 1 KB, no connection) — use for third-party origins loaded conditionally
- `preconnect`: DNS + TCP + TLS handshake in advance — use only for critical origins; limit to ≤ 6 per page (each costs CPU + network)
- `prefetch`: fetch resource for likely NEXT navigation at low priority — do NOT use for current-page resources
- `prerender`: prerender an entire next page — very high cost, Chrome supports 1 prerender per page; use sparingly
- `preconnect` subsumes `dns-prefetch` — provide `dns-prefetch` as fallback for older browsers
- Fonts from external CDN: `crossorigin` required on `preconnect` for CORS font requests

Detection:
```bash
# Known third-party domains missing preconnect:
grep -rn 'fonts.googleapis\|fonts.gstatic\|cdn\.cloudinary\|cdnjs\.cloudflare\|unpkg\.com\|jsdelivr\.net' --include="*.html" --include="*.vue"
# Count preconnects — flag if > 6:
grep -rn 'rel="preconnect"' --include="*.html" --include="*.vue" | wc -l
# dns-prefetch without matching preconnect:
grep -rn 'rel="dns-prefetch"' --include="*.html" --include="*.vue"
```

---

## 9. HTML Living Standard — Performance Attributes

**Spec:** WHATWG HTML LS — https://html.spec.whatwg.org/

| Attribute | Element | Rule | Perf implication |
|---|---|---|---|
| `loading="lazy"` | `img`, `iframe` | Below-fold ONLY | Reduces initial requests — FORBIDDEN on above-fold |
| `loading="eager"` | `img`, `iframe` | LCP candidate | Explicit eager load; default behavior, but declare it |
| `fetchpriority="high"` | `img`, `script`, `link` | LCP image + critical preloads | Elevates resource priority in the browser's scheduler |
| `fetchpriority="low"` | `img`, `script`, `link` | Below-fold images, non-critical scripts | Deprioritizes resource to free bandwidth for critical path |
| `decoding="async"` | `img` | Non-critical images | Decodes off main thread → reduces TBT |
| `decoding="sync"` | `img` | Images needed before first paint | Blocks main thread; use only for LCP if needed |
| `width` + `height` | `img`, `video`, `iframe` | ALWAYS | Browser reserves space → prevents CLS |
| `async` | `script` | Non-critical independent scripts | Executes ASAP after download, no order guarantee |
| `defer` | `script` | DOM-dependent scripts | Executes after HTML parse, in order — preferred over `async` for most scripts |
| `type="module"` | `script` | ES modules | Deferred by default (equivalent to `defer`), strict CORS mode |

---

## 10. PerformanceObserver API

**Spec:** W3C Performance Timeline Level 2 — https://www.w3.org/TR/performance-timeline/

Entry types available for observation:

| Entry type | Spec | Measures |
|---|---|---|
| `largest-contentful-paint` | WICG LCP API | LCP element + timing |
| `layout-shift` | WICG Layout Instability | CLS score accumulation |
| `event` | WICG Event Timing | INP interactions |
| `longtask` | WICG Long Tasks | Tasks > 50ms on main thread |
| `navigation` | Navigation Timing L2 | TTFB, DOMContentLoaded, load |
| `resource` | Resource Timing L2 | Individual resource load times |
| `paint` | W3C Paint Timing | FP and FCP timestamps |
| `mark` / `measure` | User Timing L3 | Custom instrumentation |

Quick DevTools console verification:
```js
new PerformanceObserver(list =>
  list.getEntries().forEach(e => console.log(e.entryType, Math.round(e.startTime), e))
).observe({
  entryTypes: ['largest-contentful-paint', 'layout-shift', 'longtask', 'event', 'paint']
})
```

---

## Quick Cross-Reference: PSI Audit → Spec

| PSI / Lighthouse audit | Driving spec | Key criterion |
|---|---|---|
| Largest Contentful Paint | WICG LCP API | `fetchpriority=high` + no lazy-load on above-fold |
| Avoid large layout shifts | WICG Layout Instability | `width`+`height` on all media; composited-only animations |
| Interaction to Next Paint | WICG Event Timing | Handler processing < 50ms; passive listeners |
| First Contentful Paint | W3C Paint Timing | No render-blocking CSS/JS; `font-display` set |
| Server initial response time | Navigation Timing L2 | TTFB < 800ms; CDN; no redirect chains |
| Avoid long main-thread tasks | WICG Long Tasks | No task > 50ms in critical path |
| Preload key requests | W3C Preload | `as=` required; `crossorigin` on fonts; no unused preloads |
| Preconnect to required origins | WICG Resource Hints | ≤ 6 preconnects; `crossorigin` for CORS |
| Properly size images | HTML LS | `width`+`height` or `aspect-ratio` on every `<img>` |
| Use lazy loading on offscreen images | HTML LS | `loading="lazy"` below fold; `loading="eager"` on LCP |
| Eliminate render-blocking resources | W3C / HTML LS | `defer`/`async`/`type="module"` on scripts; critical CSS inline |
