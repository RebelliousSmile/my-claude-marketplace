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

## Reference mapping

### Perf pivots (consumed by `web-optimize`)

| Reference | Target |
|---|---|
| `references/07-perf-pivots-axum.md` | `.claude/rules/07-quality/perf-pivots-axum.md` |

Note: covers both Axum and Actix-web. Install only once even if both are detected.

### Data pivots (consumed by `data-optimize`)

| Reference | Target |
|---|---|
| `references/08-data-pivots-sqlx.md` | `.claude/rules/07-quality/data-pivots-sqlx.md` |
| `references/08-data-pivots-diesel.md` | `.claude/rules/07-quality/data-pivots-diesel.md` |

## Output

After all operations, report:

```
✅ sc-rust sniff — sync complete

  Installed (1):
    + .claude/rules/07-quality/perf-pivots-axum.md
  Updated (0): —
  Not applicable (1):
    ✗ 07-quality/data-pivots-diesel.md (Diesel not detected)
  Skipped — already up-to-date (1):
    - .claude/rules/07-quality/data-pivots-sqlx.md

Gaps reported (no plugin rule):
  tower-http (middleware)
```
