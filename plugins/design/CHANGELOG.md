# Changelog — design

## [0.1.0] — 2026-05-28

Initial release. A condensed, mobile-first responsive design-system plugin.

### Skills

- **`setup`** — installs six binding rules to `.claude/rules/08-design/` (mobile-first, progressive enrichment, mobile-only UX, design-token discipline, reusable components with options, accessibility baseline), each with a `paths:` glob for auto-loading on UI files.
- **`from-reference`** — establishes the design system from a visual reference (screenshot, URL, Figma export, existing CSS): `capture → extract → write-system`.
- **`from-brief`** — establishes the design system from a written need / user story with no reference: `clarify → derive → write-system`.
- **`wireframe`** — turns a user story into a living, standalone mobile-first HTML preview across three breakpoints, with enriched-only and mobile-only regions made explicit: `layout → render`.
- **`component`** — designs and implements reusable components driven by options/variants: `spec → implement` (framework-agnostic).
- **`audit`** — verifies any wireframe/page/component against the system and rules; severity-ranked report with fixes (read-only by default, `--fix` to apply).

### Conventions

- Tokens are framework-agnostic (W3C DTCG) in `design/tokens.json`; CSS-variable and Tailwind adapters are generated and never hand-edited.
- Shared contract and procedures (`design-system-contract.md`, `token-schema.md`, `write-system-procedure.md`) live at the plugin root and are referenced via `${CLAUDE_PLUGIN_ROOT}` to keep the two intake skills DRY.
