# Code Patterns — assess-code (cross-language reference)

This file covers language-agnostic detection logic. Per-language import/symbol/comment patterns are in the `references/` directory — load the file matching the detected extension before running Detectors A and B.

## Language dispatch

| Extension(s) | Reference file |
|---|---|
| `.ts`, `.tsx` | `@../references/lang-typescript.md` |
| `.js`, `.mjs`, `.cjs`, `.jsx` | `@../references/lang-javascript.md` |
| `.vue` | `@../references/lang-vue.md` |
| `.php` | `@../references/lang-php.md` |
| `.py` | `@../references/lang-python.md` |
| `.rs` | `@../references/lang-rust.md` |
| Unknown | Skip Detectors A & B; run C and D only |

---

## Detector C — Rule violation parsing (all languages)

### Extracting forbidden patterns from rule files

Scan each `.md` file in `.claude/rules/` for lines matching:

```regex
^[-*]\s+(Never|never|Do not use|do not use|Forbidden|forbidden|Must not|must not)\s+(.+)
```

The captured group after the keyword is the **forbidden expression**. Extract the first quoted term, backtick term, or first proper noun/technical symbol.

**Examples:**

| Rule bullet | Extracted pattern to grep |
|---|---|
| `Never use transition-all` | `transition-all\|transition: all` |
| `` Do not use `console.log` in production `` | `console\.log` |
| `Forbidden: direct DOM manipulation via document.querySelector` | `document\.querySelector` |
| `Must not import firebase/compat` | `firebase/compat` |

### Scope

Respect the rule file's `paths:` frontmatter if present — restrict the grep to those globs. If `paths:` is absent, grep the entire codebase.

---

## Detector D — Stale comment patterns (all languages)

### Regex

```regex
(TODO|FIXME|HACK|XXX|TEMP)\s*[:\-]?\s*(.*)
```

### Age determination

Preferred: `git blame` on the specific line.

```bash
# Get blame date for a specific line
git blame -L <line>,<line> --date=short <file> | grep -oP '\d{4}-\d{2}-\d{2}'
```

Fallback (if git unavailable): file modification date.

```bash
# macOS / Linux
stat -c %y <file>

# Windows (PowerShell)
(Get-Item "<file>").LastWriteTime.ToString("yyyy-MM-dd")
```

---

## Severity mapping

| Finding type | Severity | Suggested action |
|---|---|---|
| Missing dependency | 🔴 High | Remove import or run install |
| Deprecated package | 🟡 Medium | Migrate to replacement package |
| Missing function / symbol | 🔴 High | Remove call or restore declaration |
| Rule violation | 🔴 High | Refactor per the referenced rule file |
| Stale comment | 🟡 Medium | Create issue or remove the comment |
