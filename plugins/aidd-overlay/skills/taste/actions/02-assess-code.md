# Assess-code

Reads one code file or all code files in a directory, runs four obsolescence detectors, and returns a findings table with suggested actions.

## Inputs

- `$ARGUMENTS` (required) — string: path to a code file or a directory to scan recursively.

## Outputs

```
Code freshness — {file or directory}

| Finding | File:line | Type | Suggested action |
|---------|-----------|------|-----------------|
| {description} | {path:line} | {type} | {action} |

Summary: {N} obsolete imports, {N} missing symbols, {N} rule violations, {N} stale comments
```

If no findings: `All clear — no obsolescence signals detected.`

## Cross-language reference (dispatch)

@../assets/code-patterns.md

## Process

1. If `$ARGUMENTS` is a directory, collect all code files recursively (exclude `node_modules`, `.git`, `vendor`, `dist`, `build`, `.venv`, `venv`). If a single file, process that file only.

2. For each file, detect its language by extension. Load the matching language reference **before** running Detectors A and B:

   | Extension | Reference to load |
   |---|---|
   | `.ts`, `.tsx` | `@../references/lang-typescript.md` |
   | `.js`, `.mjs`, `.cjs`, `.jsx` | `@../references/lang-javascript.md` |
   | `.vue` | `@../references/lang-vue.md` |
   | `.php` | `@../references/lang-php.md` |
   | `.py` | `@../references/lang-python.md` |
   | `.rs` | `@../references/lang-rust.md` |
   | Other | Skip A and B; run C and D only |

3. Run the four detectors below.

---

### Detector A — Obsolete imports

Use the import extraction patterns from the loaded language reference.

1. Extract all import / use / require statements.
2. Read the dependency manifest at the project root (per language reference).
3. For each external package:
   - **Not in manifest** → Finding: `Missing dependency` 🔴; action: `Remove import or add package`.
   - **In manifest but deprecated** (if CLI available per language reference) → Finding: `Deprecated package` 🟡; action: `Migrate to replacement`.

---

### Detector B — Removed function / method calls

Use the symbol declaration patterns from the loaded language reference.

1. Extract all calls to project-internal symbols (skip standard library / built-ins listed in language reference).
2. For each symbol, grep its declaration across the codebase:
   ```bash
   rg -n "<declaration-pattern>" --glob "<extensions>"
   ```
3. If no declaration found anywhere → Finding: `Missing symbol` 🔴; action: `Remove call or restore declaration`.

---

### Detector C — Rule violations

See `@../assets/code-patterns.md` — Detector C section (language-agnostic).

---

### Detector D — Stale TODO / FIXME / HACK comments

See `@../assets/code-patterns.md` — Detector D section (language-agnostic).

Configuration (overridable via argument):
| Parameter | Default |
|---|---|
| `todo_stale_days` | 30 |

---

## Test

Invoke with a known code file that contains at least one import statement; verify the output includes a findings table (or "All clear") and a Summary line.
