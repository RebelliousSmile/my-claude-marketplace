# Action 02 — install-pivots

Install perf and data pivots to `.claude/rules/07-quality/` for consumption by `web-optimize` and `data-optimize`. Does not install capability pivots — those are loaded on demand by `/sc-python:audit`.

## Process

Read the pivot manifeste emitted by `01-scan`. For each perf or data pivot listed:

### Perf pivots — install to `.claude/rules/07-quality/`

| Source (in plugin) | Target (in project) |
|---|---|
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/django.md` | `.claude/rules/07-quality/perf-pivots-django.md` |
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/drf.md` | `.claude/rules/07-quality/perf-pivots-drf.md` |
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/celery.md` | `.claude/rules/07-quality/perf-pivots-celery.md` |
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/fastapi.md` | `.claude/rules/07-quality/perf-pivots-fastapi.md` |
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/httpx.md` | `.claude/rules/07-quality/perf-pivots-httpx.md` |

### Data pivots — install to `.claude/rules/07-quality/`

| Source (in plugin) | Target (in project) |
|---|---|
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/django-orm.md` | `.claude/rules/07-quality/data-pivots-django-orm.md` |
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/sqlalchemy.md` | `.claude/rules/07-quality/data-pivots-sqlalchemy.md` |
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/datasets.md` | `.claude/rules/07-quality/data-pivots-datasets.md` |

### Protocol pivots — install to `.claude/rules/07-quality/`

Loaded by `/ap-optimize`, not by `web-optimize` or `data-optimize`.

| Source (in plugin) | Target (in project) |
|---|---|
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/protocol/activitypub-django.md` | `.claude/rules/07-quality/ap-pivots-django-activitypub.md` |

### Install rules

For each pivot in the manifeste:

1. If the target file does not exist → **install**: read source, write to target; create parent directories as needed
2. If the target file exists and content matches source → **skip** (already up-to-date)
3. If the target file exists and content differs → **update**: overwrite silently

### Scope constraint

This action installs ONLY to `.claude/rules/07-quality/`. It NEVER installs capability pivots (those are loaded at audit time by `/sc-python:audit`).

## Output

```
✅ sc-python sniff — pivots installed

  Perf pivots:
    + .claude/rules/07-quality/perf-pivots-django.md   (installed)
    ✓ .claude/rules/07-quality/perf-pivots-fastapi.md  (skipped — not applicable)

  Data pivots:
    + .claude/rules/07-quality/data-pivots-django-orm.md  (installed)
    ✓ .claude/rules/07-quality/data-pivots-sqlalchemy.md  (skipped — not applicable)

  Capability pivots: not installed (loaded on demand by /sc-python:audit)

→ /web-optimize and /data-optimize are ready for detected pivots.
→ Run /sc-python:audit to review Python code quality against capability pivots.
```
