---
paths:
  - "wp-content/**/render.php"
  - "wp-content/**/blocks/**/*.php"
  - "wp-content/themes/**/*.php"
  - "wp-content/plugins/**/*.php"
  - "!vendor/**"
---

# WordPress SSR block authoring — capability pivot for sc-php audit

Standalone pivot. Conventions for **dynamic (server-rendered) Gutenberg blocks** — the
`render_callback` / `render.php` layer. Scope is *authoring correctness*, not perf
(see `perf/wordpress.md` for the perf angle) and not design/markup (handled by
`sc-php:design-bridge`). Loaded at audit time when WordPress is detected.

#### Block attribute changes must be additive

- A block's attributes are serialized into every existing post that uses it. Renaming an
  attribute key, removing one, or changing an existing attribute's `default` **silently
  breaks already-inserted instances** (the old serialized markup no longer matches).
- Look for: a `block.json` diff that **renames/removes** an attribute, or changes the
  `default` of an existing attribute, rather than **adding** a new attribute with its own
  `default`.
- Look for: `render.php` reading `$attributes['x']` with no default in `block.json` and no
  null-guard → fatal/notice on legacy inserts that predate the attribute.
- Convention: extend a dynamic block by **adding** a new attribute (with a `default` that
  reproduces the pre-existing behaviour). Never repurpose an existing key.

#### Dynamic inline HTML: `wp_kses_post`, not `esc_html` and not raw echo

- `esc_html()` **strips** intended inline formatting (`<em>`, `<strong>`, `<a>`) coming
  from post content / meta / option values → typography and links silently disappear in SSR.
- Raw `echo $value` of post/meta/option data is an XSS hole.
- Look for: `echo esc_html( $meta )` where `$meta` is authored rich text; raw `echo`/
  `print` of `get_post_meta`, `get_option`, or `$attributes[...]` without escaping.
- Convention: `wp_kses_post()` when whitelisted inline HTML must survive; `esc_html()` for
  plain text; `esc_url()` for URLs; `esc_attr()` for attribute values. Pick by intent.

#### Compute counts/aggregates server-side, never hardcode

- Hardcoded counts/totals in markup or render callbacks (`"18 articles"`, a static badge
  number, a fixed list length) **drift** from the real data the moment content changes.
- Look for: numeric literals describing collection sizes in `render.php`/templates; a chip
  or label count that is not derived from a query.
- Convention: derive from `wp_count_posts()`, a `WP_Query`'s `found_posts`, or
  `count( get_terms() )`. Compute it **in the render callback**, not the client.
- Guard the N+1 trap: one counts query feeding all labels, not one query per label
  (cross-ref `perf/wordpress.md` §9 — `get_posts()` inside a loop).

#### Edit the registered source, not the stale build copy

- A block compiled by `@wordpress/scripts` exists twice: `blocks/<name>/render.php`
  (source) and `build/<name>/render.php` (generated). `register_block_type()` points at
  **one** of them; editing the other has **no effect** (or is overwritten on next build).
- Look for: `register_block_type( __DIR__ . '/build/...' )` while edits land in `blocks/`,
  or hand-edits inside a `build/` directory that a build step regenerates.
- Convention: confirm the path passed to `register_block_type` / `block.json` location,
  edit the **source**, and rebuild for build-registered blocks. Do not hand-edit `build/`.

#### Server-rendered navigation vs client-side show/hide

- A set of "filter" controls that map one-to-one to **real, indexable URLs** (category /
  archive pages) should be server-rendered links with an active state — not JS that hides
  DOM nodes on a single page.
- Look for: a single SSR page that renders the *whole* collection then relies on JS
  (`element.hidden = …`, `display:none`) to emulate distinct sections that already have
  their own routes → lost SEO, lost deep-linking, larger initial payload.
- Convention: when the variants are real routes, render `<a>` links + active state on each
  page. Reserve client-side show/hide for genuinely ephemeral, single-URL filtering.
