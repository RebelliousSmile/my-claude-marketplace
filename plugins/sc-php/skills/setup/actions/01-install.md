# Action 01 — install

Write PHP ecosystem rule files (perf pivots + data pivots) to the current project's `.claude/rules/`.

## Process

Read each reference file listed below and write its content verbatim to the target path in the current project. Create parent directories as needed.

### Perf pivots (consumed by `web-optimize`)

| Reference file | Target path |
|---|---|
| `references/07-perf-pivots-laravel.md` | `.claude/rules/07-quality/perf-pivots-laravel.md` |
| `references/07-perf-pivots-symfony.md` | `.claude/rules/07-quality/perf-pivots-symfony.md` |
| `references/07-perf-pivots-wordpress.md` | `.claude/rules/07-quality/perf-pivots-wordpress.md` |
| `references/07-perf-pivots-htmx.md` | `.claude/rules/07-quality/perf-pivots-htmx.md` |

### Data pivots (consumed by `data-optimize`)

| Reference file | Target path |
|---|---|
| `references/08-data-pivots-eloquent.md` | `.claude/rules/07-quality/data-pivots-eloquent.md` |
| `references/08-data-pivots-doctrine.md` | `.claude/rules/07-quality/data-pivots-doctrine.md` |

## Output

After all files are written, confirm:

```
✅ sc-php rules installed — 6 files written to .claude/rules/
  Perf pivots (4):
    - .claude/rules/07-quality/perf-pivots-laravel.md
    - .claude/rules/07-quality/perf-pivots-symfony.md
    - .claude/rules/07-quality/perf-pivots-wordpress.md
    - .claude/rules/07-quality/perf-pivots-htmx.md
  Data pivots (2):
    - .claude/rules/07-quality/data-pivots-eloquent.md
    - .claude/rules/07-quality/data-pivots-doctrine.md
```
