# SEO — robots.txt directives

- `Disallow:` is a **prefix match**, not exact match. `Disallow: /entreprise` blocks `/entreprises`, `/entreprises/inscription`, etc.
- Always use the `$` end-of-URL anchor when targeting a single page: `Disallow: /entreprise$` (supported by Googlebot and Bingbot).
- When adding a new private page (e.g. `/foo`), check that no existing page starts with the same prefix. If yes, anchor with `$`.
- Verify in production after deploy: fetch `https://jeveuxtravailler.com/robots.txt` and run `site:jeveuxtravailler.com/<path>` in Google to confirm crawl is allowed for indexed pages.
- Sitemap (`server/routes/sitemap.xml.ts`) and `robots.txt` must agree: a page in the sitemap with `index, follow` must NOT be `Disallow`-ed by any prefix.
