# TypeScript — obsolescence detection patterns

Extensions: `.ts`, `.tsx`

---

## Detector A — Import extraction

```regex
import\s+(?:type\s+)?(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]
import\s+['"]([^'"]+)['"]
require\(['"]([^'"]+)['"]\)
```

**External package heuristic**: captured path does NOT start with `.` or `/` and is not a TypeScript path alias (check `tsconfig.json` → `compilerOptions.paths` to identify aliases).

**Manifest to check**: `package.json` (`dependencies` + `devDependencies`).

**Deprecated check** (if npm available):
```bash
npm outdated --json 2>/dev/null | jq 'keys[]'
```

---

## Detector B — Symbol declaration patterns

```regex
# Function declarations
(export\s+)?(async\s+)?function\s+(\w+)\s*[<(]
(export\s+)?const\s+(\w+)\s*=\s*(async\s*)?\(
(export\s+)?const\s+(\w+)\s*=\s*<[^>]+>\s*\(

# Class declarations
(export\s+)?(abstract\s+)?class\s+(\w+)

# Interface and type
(export\s+)?interface\s+(\w+)
(export\s+)?type\s+(\w+)\s*=

# Enum
(export\s+)?enum\s+(\w+)
```

**Grep command**:
```bash
rg -n "function|const\s+\w+\s*=|class\s+\w+|interface\s+\w+|type\s+\w+\s*=" \
  --glob "**/*.ts" --glob "**/*.tsx" --glob "**/*.d.ts"
```

---

## Detector A+B — Type-only imports

`import type { Foo }` — do NOT check for runtime existence; only check that the type is exported from the source package/file.

```bash
rg -n "^export\s+(type\s+)?(interface|type|class|enum)" <source-file>
```

---

## Notes

- `@types/*` packages in `devDependencies` — missing is non-blocking (type-only). Flag as 🟡 Medium if absent.
- Path aliases (e.g., `@/`, `~/`) — resolve via `tsconfig.json` `paths` before checking file existence.
- Declaration merging: a symbol may be declared across multiple files (common with `namespace`). Flag only if ALL occurrences are missing.
