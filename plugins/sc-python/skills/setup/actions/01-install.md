# Action 01 — install

Write Python ecosystem rule files (perf pivots + data pivots) to the current project's `.claude/rules/`.

## Process

Read each reference file listed below and write its content verbatim to the target path in the current project. Create parent directories as needed.

### Perf pivots (consumed by `web-optimize`)

| Reference file | Target path |
|---|---|
| `references/07-perf-pivots-django.md` | `.claude/rules/07-quality/perf-pivots-django.md` |
| `references/07-perf-pivots-fastapi.md` | `.claude/rules/07-quality/perf-pivots-fastapi.md` |

### Data pivots (consumed by `data-optimize`)

| Reference file | Target path |
|---|---|
| `references/08-data-pivots-django-orm.md` | `.claude/rules/07-quality/data-pivots-django-orm.md` |
| `references/08-data-pivots-sqlalchemy.md` | `.claude/rules/07-quality/data-pivots-sqlalchemy.md` |

## Output

After all files are written, confirm:

```
✅ sc-python rules installed — 4 files written to .claude/rules/
  Perf pivots (2):
    - .claude/rules/07-quality/perf-pivots-django.md
    - .claude/rules/07-quality/perf-pivots-fastapi.md
  Data pivots (2):
    - .claude/rules/07-quality/data-pivots-django-orm.md
    - .claude/rules/07-quality/data-pivots-sqlalchemy.md
```
