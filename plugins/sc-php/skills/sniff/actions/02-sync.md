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
| `references/07-perf-pivots-laravel.md` | `.claude/rules/07-quality/perf-pivots-laravel.md` |
| `references/07-perf-pivots-symfony.md` | `.claude/rules/07-quality/perf-pivots-symfony.md` |
| `references/07-perf-pivots-wordpress.md` | `.claude/rules/07-quality/perf-pivots-wordpress.md` |
| `references/07-perf-pivots-htmx.md` | `.claude/rules/07-quality/perf-pivots-htmx.md` |

### Data pivots (consumed by `data-optimize`)

| Reference | Target |
|---|---|
| `references/08-data-pivots-eloquent.md` | `.claude/rules/07-quality/data-pivots-eloquent.md` |
| `references/08-data-pivots-doctrine.md` | `.claude/rules/07-quality/data-pivots-doctrine.md` |

## Output

After all operations, report:

```
✅ sc-php sniff — sync complete

  Installed (1):
    + .claude/rules/07-quality/perf-pivots-laravel.md
  Updated (1):
    ↺ .claude/rules/07-quality/data-pivots-eloquent.md
  Not applicable (4):
    ✗ 07-quality/perf-pivots-symfony.md (Symfony not detected)
    ✗ 07-quality/perf-pivots-wordpress.md (WordPress not detected)
    ✗ 07-quality/perf-pivots-htmx.md (HTMX not detected)
    ✗ 07-quality/data-pivots-doctrine.md (Doctrine not detected)
  Skipped — already up-to-date (0): —

Gaps reported (no plugin rule):
  livewire/livewire
```
