# Action 01 — install

Write PHP ecosystem rule files (perf pivots + data pivots) to the current project's `.claude/rules/`.

## Process

Read each reference file listed below and write its content verbatim to the target path in the current project. Create parent directories as needed.

<!-- If you add a new pivot, update sniff/01-scan.md Step 5 first -->

| Target path |
|---|
| `.claude/rules/07-quality/perf-pivots-laravel.md` |
| `.claude/rules/07-quality/perf-pivots-symfony.md` |
| `.claude/rules/07-quality/perf-pivots-wordpress.md` |
| `.claude/rules/07-quality/perf-pivots-htmx.md` |
| `.claude/rules/07-quality/data-pivots-eloquent.md` |
| `.claude/rules/07-quality/data-pivots-doctrine.md` |

> Full reference→target mapping with detection conditions: see [`sniff/actions/01-scan.md` Step 5](../../sniff/actions/01-scan.md) (Canonical mapping).

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
