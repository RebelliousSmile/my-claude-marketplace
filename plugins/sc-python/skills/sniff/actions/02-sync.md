# Action 02 — sync

Install missing rules and update outdated ones identified by `01-scan`.

## Process

Read the manifest emitted by `01-scan`. For each rule file listed:

### MISSING files — install

1. Read the corresponding reference file from the plugin's `references/` directory (path listed in the manifest)
2. Write it verbatim to the target path in `.claude/rules/` of the current project
3. Create parent directories as needed

### OUTDATED files — update

1. Read the corresponding reference file from the plugin's `references/` directory
2. Overwrite the existing target file with the updated content
3. Do not ask for confirmation — overwrite silently

### UP-TO-DATE files — skip

Do not write. Do not read again. Skip entirely.

### NOT-APPLICABLE files — skip

Do not write. Do not remove if already present. Skip entirely.

### Flask-only projects

If Flask was the only framework detected (no Django, no FastAPI), do not install any perf pivot automatically. Instead, output:

```
ℹ️  Flask detected — no dedicated Flask perf pivot in sc-python.
   Tip: run /sc-python:setup to install everything, or skip.
```

Then stop — do not install the FastAPI pivot without explicit user confirmation.

## Reference mapping

### Perf pivots (consumed by `web-optimize`)

| Reference | Target |
|---|---|
| `references/07-perf-pivots-django.md` | `.claude/rules/07-quality/perf-pivots-django.md` |
| `references/07-perf-pivots-fastapi.md` | `.claude/rules/07-quality/perf-pivots-fastapi.md` |

### Data pivots (consumed by `data-optimize`)

| Reference | Target |
|---|---|
| `references/08-data-pivots-django-orm.md` | `.claude/rules/07-quality/data-pivots-django-orm.md` |
| `references/08-data-pivots-sqlalchemy.md` | `.claude/rules/07-quality/data-pivots-sqlalchemy.md` |

## Output

After all operations, report:

```
✅ sc-python sniff — sync complete

  Installed (1):
    + .claude/rules/07-quality/perf-pivots-django.md
  Updated (1):
    ↺ .claude/rules/07-quality/data-pivots-django-orm.md
  Not applicable (2):
    ✗ 07-quality/perf-pivots-fastapi.md (FastAPI not detected)
    ✗ 07-quality/data-pivots-sqlalchemy.md (SQLAlchemy not detected)
  Skipped — already up-to-date (0): —

Gaps reported (no plugin rule):
  (none)
```
