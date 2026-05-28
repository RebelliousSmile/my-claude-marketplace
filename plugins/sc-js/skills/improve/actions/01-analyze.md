# Action 01 — analyze

Read the JS/TS codebase, identify anti-patterns and improvement opportunities per category, emit structured findings.

## Process

### Step 1 — Detect project context

Read `package.json` to identify:
- Framework (Nuxt, Vue SPA, Alpine, Vite, Astro) — from dependencies
- TypeScript usage — presence of `tsconfig.json`
- Runtime target (Node, browser, SSR)

### Step 2 — Scan for anti-patterns

For each category, search the codebase and record findings with file + line references.

#### Async and promises

- Callbacks where async/await is applicable — flag `then().catch()` chains that can be flattened
- Missing `await` on async calls (common in event handlers)
- `async` functions that never `await` — pointless async wrapper
- Unhandled promise rejections — `async` function calls without try/catch or `.catch()`
- `Promise.all` where `Promise.allSettled` is safer, or vice versa

#### TypeScript type coverage

- Implicit `any` — untyped function parameters, return types, variables
- Type assertions (`as X`) that bypass safety — flag without justification comment
- Missing interface/type for component props not using `defineProps<T>()`
- `unknown` used where a proper type exists

#### Vue / Nuxt patterns

- Options API components where Composition API is available — flag for migration consideration
- Direct `$store` / Vuex usage in a Pinia project
- Prop drilling beyond 2 levels — suggest composable or Pinia store
- Watchers on computed values — use `computed` directly
- Missing `defineEmits` type annotation
- `ref` used where `reactive` is more appropriate and vice versa
- Mutating props directly — should emit instead

#### Module and imports

- CommonJS `require()` in an ESM project
- Circular imports — detect via grep for mutual references
- Wildcard imports (`import * as`) for tree-shakeable libraries

#### General JS

- `var` declarations — should be `const` or `let`
- Mutable `let` that is never reassigned — should be `const`
- `==` comparisons — should be `===`
- `console.log` left in production code

### Step 3 — Emit findings

For each finding, record:
- Category
- File and line
- Anti-pattern name
- Severity: 🔴 (likely bug) / 🟡 (maintainability) / 🟢 (style)
- Problematic snippet (≤3 lines)
- Proposed fix (≤3 lines)

## Output

```
📋 sc-js improve — analysis

Framework: Nuxt 3 + TypeScript

Findings (N total — N 🔴, N 🟡, N 🟢):

🔴 Unhandled promise rejection — src/composables/useData.ts:42
   Current:  fetchData()
   Improved: await fetchData().catch(err => handleError(err))

🟡 Options API component — src/components/UserCard.vue:1
   Current:  export default { data() {...}, methods: {...} }
   Improved: <script setup lang="ts"> with defineProps<T>()

🟢 var declaration — src/utils/format.ts:7
   Current:  var formatter = new Intl.DateTimeFormat(...)
   Improved: const formatter = new Intl.DateTimeFormat(...)

→ proceed to 02-plan
```

## Test

Invoke on a project with at least one `.vue` or `.ts` file; verify findings include file paths, severity indicators, and before/after snippets.
