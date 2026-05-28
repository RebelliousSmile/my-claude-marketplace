# Svelte Migration Reference

Key breaking changes and migration patterns — use during `01-scan` to identify migration work.

## Svelte 4 → Svelte 5 (Runes)

Svelte 5 introduces **runes** — a new reactivity primitive that replaces reactive declarations, reactive statements, and props. Runes are opt-in per file: a component switches to runes mode as soon as it uses any rune syntax (`$state`, `$derived`, `$effect`, `$props`). A file cannot mix runes and legacy reactive syntax.

### Reactivity

| Svelte 4 | Svelte 5 (runes) |
|---|---|
| `let count = 0` (reactive assignment) | `let count = $state(0)` |
| `let obj = { x: 1 }` + `obj = obj` trick | `let obj = $state({ x: 1 })` — mutate directly |
| `$: double = count * 2` | `let double = $derived(count * 2)` |
| `$: complex = a + b * c` (multi-expr) | `let complex = $derived.by(() => a + b * c)` |
| `$: { sideEffect(count) }` | `$effect(() => { sideEffect(count) })` |
| `$: if (cond) { … }` | `$effect(() => { if (cond) { … } })` |
| `beforeUpdate(() => …)` | `$effect.pre(() => …)` |
| `afterUpdate(() => …)` | `$effect(() => …)` |

**Detection**: `grep -n '\$:' src/**/*.svelte` — every `$:` line is a migration candidate.

### Props

| Svelte 4 | Svelte 5 (runes) |
|---|---|
| `export let prop` | `let { prop } = $props()` |
| `export let prop = default` | `let { prop = default } = $props()` |
| `export let a, b, c` | `let { a, b, c } = $props()` |
| `$$props` (all props) | `let props = $props()` (spread) |
| `$$restProps` (undeclared props) | destructure with `...rest`: `let { known, ...rest } = $props()` |
| Two-way binding: `export let value` + `bind:value` | `let { value = $bindable() } = $props()` |

**Detection**: `grep -n 'export let' src/**/*.svelte` — every `export let` in a `.svelte` file.

### Events

| Svelte 4 | Svelte 5 |
|---|---|
| `on:click={handler}` | `onclick={handler}` |
| `on:input={handler}` | `oninput={handler}` |
| `on:keydown|stopPropagation={fn}` | `onkeydown={(e) => { e.stopPropagation(); fn(e) }}` |
| `createEventDispatcher()` + `dispatch('event', data)` | Callback prop: `let { onevent } = $props()` then `onevent?.(data)` |
| `<Child on:customEvent={handler} />` | `<Child oncustomEvent={handler} />` |

**Detection**: `grep -n 'on:' src/**/*.svelte` — `on:` event directives and `createEventDispatcher`.

### Slots → Snippets

| Svelte 4 | Svelte 5 |
|---|---|
| `<slot />` | `{@render children?.()}` |
| `<slot name="header" />` | `{@render header?.()}` |
| `<slot {item} />` (scoped slot) | `{#snippet row(item)}…{/snippet}` + `{@render row(item)}` |
| `$$slots.header` check | `{#if header}{@render header()}{/if}` |

**Detection**: `grep -n '<slot' src/**/*.svelte`

### Shared reactive state (`.svelte.js` files)

Runes work outside `.svelte` components in `.svelte.js` / `.svelte.ts` files. This replaces the store pattern for shared state.

| Svelte 4 stores | Svelte 5 shared runes |
|---|---|
| `import { writable } from 'svelte/store'` | `// counter.svelte.js` |
| `export const count = writable(0)` | `export let count = $state(0)` |
| `$count` auto-subscription in components | `import { count } from './counter.svelte.js'` — direct access |
| `count.set(1)` / `count.update(n => n + 1)` | `count = 1` / `count++` |

**Note**: Svelte stores still work in Svelte 5. Migrate to `.svelte.js` runes only when sharing state between components that have already migrated to runes mode.

### Breaking changes in Svelte 5

| Change | Impact | Detection |
|---|---|---|
| `export let` in runes mode → compile error | Must use `$props()` | `grep 'export let' src/**/*.svelte` |
| Reactive `$:` in runes mode → compile error | Must use `$derived` / `$effect` | `grep '\$:' src/**/*.svelte` |
| `$state` objects are proxied (deep) | Direct mutation works — no more `obj = obj` trick | Visual review |
| `$derived` is lazy and memoized | Value computed on first read, not eagerly | Low risk |
| `$props()` is read-only by default | Must use `$bindable()` for two-way binding | grep `bind:` usage on custom components |
| Modifier syntax removed (`on:click|once`) | Must use DOM API manually | `grep 'on:.*|' src/**/*.svelte` |
| `<svelte:component this={C}>` still works | No change for dynamic components | — |

### Migration order

1. Migrate props (`export let` → `$props()`) first — lowest risk
2. Migrate reactive declarations (`let` → `$state`, `$:` → `$derived`)
3. Migrate reactive statements (`$:` side effects → `$effect`)
4. Migrate events (`on:` → DOM attributes, `createEventDispatcher` → callback props)
5. Migrate slots → snippets (last — requires parent and child changes together)

## SvelteKit 1 → SvelteKit 2

| SvelteKit 1 | SvelteKit 2 |
|---|---|
| `error(status, message)` — returns | `error(status, message)` — still same API |
| `redirect(status, location)` — returns | `redirect(status, location)` — now throws; call outside `try/catch` |
| `$app/stores` → `page` store | `$app/state` → `page` rune (Svelte 5 projects) |
| `import { page } from '$app/stores'` + `$page.url` | `import { page } from '$app/state'` + `page.url` |
| `resolvePath` (removed) | `resolveRoute` from `$app/paths` |
| `beforeNavigate` / `afterNavigate` | Same API — still available |
| `__data.json` internal fetch format | Changed — avoid relying on internal format |

**Detection for SK2 redirect change**: `grep -n 'return redirect(' src/**/*.{ts,js}` — must remove `return`.
