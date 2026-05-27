# Action 02 — sync

Install missing rules and update outdated ones identified by `01-scan`.

## Process

Read the manifest emitted by `01-scan`. For each rule file listed:

### MISSING files — install

1. Read the corresponding reference file from the plugin's `references/` directory (path listed in the manifest)
2. Write it verbatim to the target path in `.claude/rules/` of the current project
3. Create parent directories as needed (`mkdir -p` equivalent)

### OUTDATED files — update

1. Read the corresponding reference file from the plugin's `references/` directory
2. Overwrite the existing target file with the updated content
3. Do not ask for confirmation — overwrite silently

### UP-TO-DATE files — skip

Do not write. Do not read again. Skip entirely.

## Reference mapping

| Detected stack | Reference file | Target path |
|---|---|---|
| Axum or Actix-web | `references/07-perf-pivots-axum.md` | `.claude/rules/07-quality/perf-pivots-axum.md` |
| SQLx | `references/08-data-pivots-sqlx.md` | `.claude/rules/07-quality/data-pivots-sqlx.md` |
| Diesel | `references/08-data-pivots-diesel.md` | `.claude/rules/07-quality/data-pivots-diesel.md` |

Note: if both Axum and Actix-web are detected (unusual), install `perf-pivots-axum.md` only once.

## Output

After all operations, report:

```
✅ sc-rust sniff — sync complete

  Installed (1):
    + .claude/rules/07-quality/perf-pivots-axum.md
  Updated (0):
    (none)
  Skipped — already up-to-date (1):
    - .claude/rules/07-quality/data-pivots-sqlx.md
```
