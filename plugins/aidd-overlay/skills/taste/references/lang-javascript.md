# JavaScript — obsolescence detection patterns

Extensions: `.js`, `.mjs`, `.cjs`, `.jsx`

---

## Detector A — Import extraction

```regex
# ESM
import\s+(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]
import\s+['"]([^'"]+)['"]

# CJS
(?:const|let|var)\s+.*=\s*require\(['"]([^'"]+)['"]\)
```

**External package heuristic**: captured path does NOT start with `.` or `/`.

**Manifest to check**: `package.json` (`dependencies` + `devDependencies`).

**Deprecated check** (if npm available):
```bash
npm outdated --json 2>/dev/null | jq 'keys[]'
```

---

## Detector B — Symbol declaration patterns

```regex
# Function declarations
(export\s+)?(async\s+)?function\s+(\w+)\s*\(
(export\s+)?const\s+(\w+)\s*=\s*(async\s*)?\(
module\.exports\s*=\s*\{[^}]*(\w+)\s*[,}]
module\.exports\.(\w+)\s*=

# Class declarations
(export\s+)?class\s+(\w+)
```

**Grep command**:
```bash
rg -n "function\s+\w+|const\s+\w+\s*=|class\s+\w+|module\.exports" \
  --glob "**/*.js" --glob "**/*.mjs" --glob "**/*.cjs" --glob "**/*.jsx"
```

---

## Notes

- No strict type system — symbol detection relies on grep + heuristics. False positives possible with dynamic property assignment.
- `require()` in CJS files: resolve as external if not a relative path and not a Node.js built-in module.
- Node.js built-ins (do NOT flag as missing): `fs`, `path`, `os`, `url`, `http`, `https`, `crypto`, `stream`, `events`, `util`, `child_process`, `cluster`, `net`, `dns`, `assert`, `buffer`, `process`, `module`, `readline`, `zlib`.
