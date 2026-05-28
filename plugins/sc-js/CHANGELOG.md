# Changelog — sc-js

## [0.4.0] — 2026-05-28

### Breaking changes

- **sniff no longer installs capability rules to `.claude/rules/capabilities/`**. In 0.3.0, `sniff` would write files like `.claude/rules/capabilities/state/pinia.md` to the project. In 0.4.0, those files are loaded from the plugin at audit time — never installed.
- **`skills/setup` removed**. The install-all setup skill is gone. Use `sniff` (detector) and `audit` (code review) instead.
- **`02-sync` action renamed to `02-install-pivots`**. Scope is now restricted to perf and data pivots only.

### New features

- **`/sc-js:audit`** — new skill that detects the project stack, loads applicable JS capability pivots from the plugin, and delegates a structured code review to `aidd-dev:reviewer`. Zero file writes.
- **`03-clean` migration action** — opt-in migration tool to remove orphaned `.claude/rules/capabilities/*` files left by sc-js 0.3.0. Safe: only deletes files whose content matches the plugin reference exactly (content-match guard). Invoke explicitly with `/sc-js:sniff clean`.

### Preserved

- Perf pivots (`perf-pivots-*.md`) and data pivots (`data-pivots-*.md`) are still installed to `.claude/rules/07-quality/` by `02-install-pivots`. The `web-optimize` and `data-optimize` contract is unchanged.

### Migration from 0.3.0

1. Reload the plugin (Claude Code: `/reload-plugins`)
2. Run `/sc-js:sniff` on your project — emits pivot manifeste and installs perf/data pivots as before
3. Optionally clean up orphaned capability rules: `/sc-js:sniff clean --dry-run` to preview, then `/sc-js:sniff clean` to delete

If you have manually edited any `.claude/rules/capabilities/` file, `03-clean` will detect the content mismatch and skip it — your edits are safe.

## [0.3.0]

Capability-based rules: sniff detects runtime/framework/ORMs and installs matching coding rules.

## [0.2.0]

Flat rule files install model.
