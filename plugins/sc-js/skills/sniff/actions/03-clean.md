# Action 03 — clean

Migration action for projects that installed capability rules via sc-js 0.3.0. Removes orphaned `.claude/rules/capabilities/*` files that are no longer installed or updated by sc-js 0.4.0.

**This action is opt-in only.** It is never triggered by the default sniff flow (`01-scan → 02-install-pivots`). Invoke explicitly with `/sc-js:sniff clean`.

## Invocation

```
/sc-js:sniff clean [--dry-run]
```

- Without flags: detect and delete eligible files
- `--dry-run`: report what would be deleted without deleting anything

## Closed path list

The following paths are the complete set of files that sc-js 0.3.0 could have installed. Only files whose path appears in this list are candidates for deletion.

```
.claude/rules/capabilities/components/shared-scope.md
.claude/rules/capabilities/state/pinia.md
.claude/rules/capabilities/state/alpine-store.md
.claude/rules/capabilities/code-splitting/dynamic-import.md
.claude/rules/capabilities/code-splitting/defineAsyncComponent.md
.claude/rules/capabilities/styling/design-system.md
.claude/rules/capabilities/styling/css-transitions.md
.claude/rules/capabilities/icons/lucide-vue.md
.claude/rules/capabilities/icons/svg-inline.md
.claude/rules/capabilities/images/web-optimization.md
.claude/rules/capabilities/networking/preconnect.md
.claude/rules/capabilities/server/nitro-imports.md
.claude/rules/capabilities/ssr/storage-guards.md
```

## Content-match guard

For each candidate path that exists in the project:

1. Read the file content from the project
2. Read the corresponding reference file from `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/<relative-path>`
3. Normalize both contents: strip trailing whitespace per line, normalize line endings to LF
4. If normalized content matches exactly → **delete** (file is unmodified plugin content)
5. If normalized content differs → **skip** + report conflict (user has modified the file)

Never delete a file whose content has been modified by the user.

## Process

### Step 1 — Dry-run scan

Regardless of mode, always scan first and report findings before any deletions:

```
🔍 sc-js clean — scanning .claude/rules/capabilities/

  Candidate files found: 7
    .claude/rules/capabilities/state/pinia.md         → matches plugin ref — eligible for deletion
    .claude/rules/capabilities/state/alpine-store.md  → not found — skip
    .claude/rules/capabilities/code-splitting/dynamic-import.md → matches — eligible
    .claude/rules/capabilities/code-splitting/defineAsyncComponent.md → matches — eligible
    .claude/rules/capabilities/styling/css-transitions.md → DIFFERS from plugin ref — SKIP (user-modified)
    .claude/rules/capabilities/icons/lucide-vue.md    → matches — eligible
    .claude/rules/capabilities/components/shared-scope.md → matches — eligible

  Would delete: 5 files
  Would skip (user-modified): 1 file (.../styling/css-transitions.md)
  Would skip (not found): 7 files
```

### Step 2 — Execute (unless --dry-run)

If `--dry-run` was specified, stop after Step 1 and display the report.

Otherwise, delete all eligible files and report:

```
✅ sc-js clean — complete

  Deleted (5):
    - .claude/rules/capabilities/state/pinia.md
    - .claude/rules/capabilities/code-splitting/dynamic-import.md
    - .claude/rules/capabilities/code-splitting/defineAsyncComponent.md
    - .claude/rules/capabilities/icons/lucide-vue.md
    - .claude/rules/capabilities/components/shared-scope.md

  Skipped — user-modified (1):
    ⚠ .claude/rules/capabilities/styling/css-transitions.md
      Content differs from plugin reference. Review and delete manually if no longer needed.

  Skipped — not found (7):
    (not installed or already removed)

→ Orphaned 0.3.0 capability rules removed. Project is clean for sc-js 0.4.0.
```

### Step 3 — Empty directory cleanup

After deletions, remove any empty `capabilities/` subdirectories left behind. Never remove non-empty directories.
