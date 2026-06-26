---
paths:
  - "wp-content/themes/**/patterns/**/*.php"
  - "!vendor/**"
---

# WordPress FSE block-pattern authoring — capability pivot for sc-php audit

Standalone pivot. Conventions for **static FSE block patterns** — the `patterns/*.php`
files a block theme registers (header-based auto-registration). Scope is *authoring
correctness and client editability*, not the design vocabulary (closed token/class set —
handled by the design contract / `sc-php:design-bridge`) and not dynamic render blocks
(see `wordpress/ssr.md`). Loaded at audit time when a block theme with a `patterns/`
directory is detected.

#### Client-editable text lives in native blocks, never trapped in `wp:html`

- A `<!-- wp:html -->` block is edited as **raw HTML** in Gutenberg — the client cannot
  click a heading or paragraph and type. Visible copy (titles, body text, button labels)
  placed inside `wp:html` is effectively code-only, defeating the purpose of a pattern the
  client is meant to edit.
- Look for: a pattern whose copy sits inside `<!-- wp:html --> … </… > <!-- /wp:html -->`
  (text nodes between tags), rather than in `wp:paragraph` / `wp:heading` / `wp:list` /
  `wp:button`. Worst case: a whole content composition (callout, CTA, comparison table)
  authored as one `wp:html` blob.
- Convention: author editable copy in **native RichText blocks**. Reserve `wp:html` for
  structural/decorative markup that carries *no* editable copy (an inline SVG icon, a CSS
  grid wrapper). For content/article patterns (the ones a non-dev edits), use **no
  `wp:html` at all** — every text-bearing node is a native block.

#### Native conversion must neutralize WP layout injection (else the render drifts)

- When copy is moved out of `wp:html` into native blocks, WordPress injects layout CSS the
  raw markup never had: `.is-layout-flex` forces `align-items:center`, and flow/flex groups
  add `block-gap` margins between children. A component whose CSS assumed bare `<div>`s then
  renders mis-aligned (icon vertically centered instead of top, extra gaps).
- Look for: a native-block pattern reusing a component class (`display:flex` in CSS) without
  a matching reset — icons/labels drift from the mock; vertical rhythm changes vs the prior
  `wp:html` version.
- Convention: when the component CSS owns the layout, reset the injected properties on the
  component (`align-items`, `margin-block:0` to kill `block-gap`) so the CSS governs. Style
  a native button on the **anchor** (`.<component>__x .wp-block-button__link`), not on the
  `.wp-block-button` wrapper where `className` lands — and raise specificity above the prose
  link rule.

#### Pattern CSS must also be an editor style (WYSIWYG in Gutenberg)

- Block/component CSS enqueued only on `wp_enqueue_scripts` loads on the **front end only**.
  In the editor canvas the pattern then renders unstyled (raw text + emoji), so the client
  can't see what they're building.
- Look for: component stylesheets registered via `wp_enqueue_style` / `wp_enqueue_block_style`
  on `wp_enqueue_scripts` with **no** corresponding `add_editor_style()` (or
  `enqueue_block_assets`) call.
- Convention: feed the same block CSS to the editor — `add_editor_style()` on
  `after_setup_theme` (block themes load it into the canvas iframe).

#### Complete, consistent pattern headers; every category registered

- A header-registered pattern needs `Title` and `Slug` (WP-required); `Categories` and
  `Inserter` should be present for a consistent, discoverable library. A `Categories:`
  naming a category that was never passed to `register_block_pattern_category()` leaves the
  pattern ungrouped in the inserter.
- Look for: a `patterns/*.php` docblock missing `Title` / `Slug` / `Categories` / `Inserter`;
  a category string in a header with no matching `register_block_pattern_category()` call.
- Convention: declare all four headers; register every category used (one source of truth,
  e.g. a single `after_setup_theme` registration map).

#### Slug ↔ filename, and no duplicate slugs

- WP keys patterns by slug. A slug whose last segment differs from the filename is a
  maintenance trap; two files sharing a slug → the last registered silently wins.
- Look for: `Slug: <ns>/<x>` in `<y>.php` with `<x> != <y>`; the same slug in two files.
- Convention: the slug's final segment equals the filename; slugs are unique.

#### Valid block grammar (no "invalid content" in the editor)

- Malformed Gutenberg delimiters make Gutenberg flag the block as invalid content on open.
- Look for: unbalanced `<!-- wp:x -->` / `<!-- /wp:x -->` (or mis-nested), attribute JSON
  that doesn't parse, a `wp:name` that isn't a registered block.
- Convention: balanced/properly-nested delimiters, parseable attribute JSON, real block
  names.

> Deterministic counterpart: these conventions can be enforced as a project gate by a
> structural pattern linter (header/native/slug/grammar checks) wired into pre-commit —
> the design pipeline realizes it via `design:enforce` → `sc-php:design-bridge`
> (`01-realize-lint`). This pivot is the audit-time (review) half of the same rules.
