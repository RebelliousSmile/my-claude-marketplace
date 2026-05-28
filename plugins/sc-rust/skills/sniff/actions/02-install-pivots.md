# Action 02 — install-pivots

Install perf and data pivots to `.claude/rules/07-quality/` for consumption by `web-optimize` and `data-optimize`. Does not install capability pivots — those are loaded on demand by `/sc-rust:audit`.

## Process

Read the pivot manifeste emitted by `01-scan`. For each perf or data pivot listed:

### Perf pivots — install to `.claude/rules/07-quality/`

| Source (in plugin) | Target (in project) |
|---|---|
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/axum.md` | `.claude/rules/07-quality/perf-pivots-axum.md` |

### Data pivots — install to `.claude/rules/07-quality/`

| Source (in plugin) | Target (in project) |
|---|---|
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/sqlx.md` | `.claude/rules/07-quality/data-pivots-sqlx.md` |
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/diesel.md` | `.claude/rules/07-quality/data-pivots-diesel.md` |

### Install rules

For each pivot in the manifeste:

1. If the target file does not exist → **install**: read source, write to target; create parent directories as needed
2. If the target file exists and content matches source → **skip** (already up-to-date)
3. If the target file exists and content differs → **update**: overwrite silently

### Scope constraint

This action installs ONLY to `.claude/rules/07-quality/`. It NEVER installs capability pivots (those are loaded at audit time by `/sc-rust:audit`).

## Output

```
✅ sc-rust sniff — pivots installed

  Perf pivots:
    + .claude/rules/07-quality/perf-pivots-axum.md   (installed)

  Data pivots:
    + .claude/rules/07-quality/data-pivots-sqlx.md   (installed)
    ✓ .claude/rules/07-quality/data-pivots-diesel.md (skipped — not applicable)

  Capability pivots: not installed (loaded on demand by /sc-rust:audit)

→ /web-optimize and /data-optimize are ready for detected pivots.
→ Run /sc-rust:audit to review Rust code quality against capability pivots.
```
