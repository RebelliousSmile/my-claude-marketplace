# Changelog — design

## [0.2.0] — 2026-05-28

### New skills

- **`doctor`** — design-health triage for projects already in production with no clean system: reverse-engineers the de-facto tokens, measures sprawl (color/font/spacing counts, hardcoded-value density, breakpoint chaos, emoji-as-icons, a11y red flags, duplicated components), and prescribes a phased, low-risk remediation roadmap. Read-only. `diagnose → prescribe`.
- **`refactor`** — migrates existing production UI into compliance incrementally: token substitution, mobile-first conversion, component de-dup, emoji→icon — in reviewable batches, each gated by `audit`. `plan → apply`.
- **`export-wordpress`** — ports a design onto a WordPress block theme: maps `design/tokens.json` to a `theme.json` (v3) palette/typography/spacing presets (rest under `settings.custom`), and turns wireframes/components into block patterns/templates with the token CSS enqueued. `theme-json → blocks`.

### Changed

- **Core trio first** — `from-reference` and `from-brief` now settle the palette anchor, type, and icon set up front and present them for one quick approval before expanding the full scale.
- **Iconography is now a foundation** — `icon.library`/`icon.style` recorded in `design-system.md`, `icon.size.*`/`icon.stroke.*` added to the token schema.
- **Never emoji** — new rule `08-design/7-iconography` (one icon set, sized from tokens, no emoji/emoticons as UI icons); `audit` adds an iconography category that flags emoji-as-icons as blocking; `setup` now installs seven rules.

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
