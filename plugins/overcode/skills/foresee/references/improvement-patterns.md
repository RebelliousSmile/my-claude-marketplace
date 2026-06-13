# Improvement Patterns — foresee

Common anti-patterns by artifact family. Use these as a detection checklist during analysis — they do not replace reading the artifact, but they ensure recurring patterns are never missed.

---

## Document patterns (analyze-doc)

### 🔴 Will break

| Pattern | Signal | Why it breaks |
|---|---|---|
| **Unfulfilled promise** | Document states "X will be done" but no step, task, or constraint enforces it | LLM or implementer skips X — it has no forcing function |
| **Circular prerequisite** | Step A requires B, Step B requires A | Deadlock at execution |
| **Undefined reference** | `@path/to/file` or concept used but file absent / term never defined | Instruction unparseable; execution fails or silently skips |
| **Contradictory rules** | Two rules prescribe opposite behaviors for the same input | Non-deterministic outcome; agent picks arbitrarily |
| **Missing stop condition** | Iterative or conditional flow with no explicit exit | Infinite loop or agent waits indefinitely for input |

### 🟡 Will degrade

| Pattern | Signal | Why it degrades |
|---|---|---|
| **Implicit context** | Instruction assumes shared knowledge not in the document or adjacent context | Works today; breaks when context changes or new agent runs without history |
| **Ambiguous pronoun / "it"** | "Update it" / "delete this" with an unclear antecedent | LLM may resolve to the wrong referent |
| **Vague verb** | "Handle", "manage", "deal with" without an explicit action | Behavior varies by invocation |
| **Missing failure path** | Happy path documented, error/exception path absent | Silent failure or undefined rollback |
| **Over-broad scope** | "Analyze the entire codebase" without bounding criteria | Unbounded execution, inconsistent depth |

### 🟢 Latent debt

| Pattern | Signal | Why it accumulates |
|---|---|---|
| **Orphan section** | Section present in the document that no trigger, action, or consumer ever references | Dead weight; confuses future readers |
| **Stale example** | Example uses a file, function, or pattern that no longer exists | Misleading; will cause incorrect inference |
| **Redundant instruction** | Same rule stated in two places with slightly different wording | Divergence over time; second copy will drift |
| **Missing "Do NOT use for"** | Skill or command description lacks an explicit exclusion clause | Triggers on off-target prompts |

---

## Code patterns (analyze-code)

### 🔴 Will break

| Pattern | Signal | Why it breaks |
|---|---|---|
| **Implicit null** | Returns `null` / `undefined` without caller contract; caller doesn't check | NullPointerException / TypeError at runtime |
| **Hidden mutation** | Function modifies an argument or external state without declaring it | Caller assumes immutability; state corruption |
| **Uncaught async** | `await` call with no `.catch()` and no `try/catch`; unhandled rejection | Silent failure; Node.js process may crash |
| **Hardcoded env assumption** | `process.env.NODE_ENV === 'production'` inline; port 3000 hardcoded | Fails in staging, test, or containerized env |
| **Missing authorization check** | Controller/handler reads/writes data without role or ownership check | Privilege escalation |

### 🟡 Will degrade

| Pattern | Signal | Why it degrades |
|---|---|---|
| **God function** | Function > 50 lines, multiple `if`/`switch` branches, > 5 parameters | Every feature addition increases complexity quadratically |
| **Temporal coupling** | Two functions must be called in strict order but no type/contract enforces this | Easy to call out-of-order; fails silently in some paths |
| **Duplicate logic** | Same algorithm / validation appears in 2+ files without a shared utility | Diverges over time; bugs fixed in one copy, not the other |
| **Leaky abstraction** | Lower-level detail (SQL, HTTP status codes, file paths) surfaces in a higher-level module | Interface change forces refactor across layers |
| **Boolean parameter** | `doSomething(true)` — caller must read the function signature to understand meaning | Intent invisible at call site |

### 🟢 Latent debt

| Pattern | Signal | Why it accumulates |
|---|---|---|
| **Dead export** | Exported symbol never imported anywhere in the project | Inflates public API surface; removal becomes riskier over time |
| **Magic number** | Inline literal `86400`, `0.85`, `42` with no named constant | Meaning opaque; value duplicated when changed |
| **Test absent for public API** | Exported function with no test file or test case | Regression undetected; refactor confidence low |
| **TODO older than 30 days** | `// TODO: fix this` comment with no associated issue | Never gets done; documents known tech debt without resolving it |

---

## Dependency patterns (analyze-dep)

See `@../references/dep-risk-signals.md` for the full dep-specific catalogue.

### Quick heuristics

| Pattern | Signal |
|---|---|
| **Pinned to major version with known breaking changes** | `"^1.x"` when `2.0` dropped significant APIs the project uses |
| **No abstraction wrapper** | Package imported directly in 20+ files — migration would require touching all of them |
| **Dev-only package in production deps** | `eslint`, `prettier`, `vitest` listed in `dependencies` not `devDependencies` |
| **Transitive vulnerability** | Direct dep is safe but pulls in a vulnerable sub-dep via its own `dependencies` |
