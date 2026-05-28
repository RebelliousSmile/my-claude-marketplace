# Action 01 — explain

Explain a JS/TS/Vue/Nuxt concept using real examples from the current project codebase.

## Process

### Step 1 — Identify the concept

Extract the concept or pattern from the user's request. Examples:
- Language: closures, the event loop, prototype chain, generators, async iterators
- TypeScript: generics, mapped types, conditional types, `infer`, decorators
- Vue: composables, `ref` vs `reactive`, `watch` vs `watchEffect`, `provide`/`inject`, slots
- Nuxt: middleware, plugins, server routes, `useAsyncData` vs `useFetch`, composable auto-import
- Pinia: store definition, `$patch`, `storeToRefs`, persisted state

### Step 2 — Find a project example

Search the codebase for a real usage of the concept:
- Grep for the function name, keyword, or pattern
- Read the surrounding context (≥10 lines)
- If multiple examples exist, pick the most representative one

If no project example exists, note it and proceed with a minimal invented snippet styled after the project (same framework, same TypeScript config, same formatting).

### Step 3 — Explain with the example as anchor

Structure the explanation:
1. **One-line summary** — what the concept does
2. **Project example** — the found (or invented) snippet, annotated inline
3. **How it works** — the mechanism, 3–5 bullet points max
4. **When to use vs when not to** — 2 lines

### Step 4 — Offer practice

End with: "Want a practice exercise on this?"

## Test

Invoke with "explain Vue composables"; verify the output includes a code snippet from the project (or invented), inline annotations, and ends with the practice offer.
