# Action 01 — install

Write Rust ecosystem rule files (perf pivots + data pivots) to the current project's `.claude/rules/`.

## Process

Read each reference file listed below and write its content verbatim to the target path in the current project. Create parent directories as needed.

### Perf pivots (consumed by `web-optimize`)

| Reference file | Target path |
|---|---|
| `references/07-perf-pivots-axum.md` | `.claude/rules/07-quality/perf-pivots-axum.md` |

### Data pivots (consumed by `data-optimize`)

| Reference file | Target path |
|---|---|
| `references/08-data-pivots-sqlx.md` | `.claude/rules/07-quality/data-pivots-sqlx.md` |
| `references/08-data-pivots-diesel.md` | `.claude/rules/07-quality/data-pivots-diesel.md` |

## Output

After all files are written, confirm:

```
✅ sc-rust rules installed — 3 files written to .claude/rules/
  Perf pivots (1):
    - .claude/rules/07-quality/perf-pivots-axum.md
  Data pivots (2):
    - .claude/rules/07-quality/data-pivots-sqlx.md
    - .claude/rules/07-quality/data-pivots-diesel.md
```
