---
paths:
  - "tsconfig.json"
  - "tsconfig.*.json"
  - "**/*.ts"
  - "**/*.vue"
---

# TypeScript — patterns Vue / Nuxt / Vite

Applicable quand `typescript` ou `vue-tsc` est détecté en devDependencies, ou quand Nuxt 3 est le framework (TypeScript par défaut).

## tsconfig.json — flags à vérifier

| Flag | Valeur attendue | Impact si absent |
|---|---|---|
| `strict` | `true` | Masque `null`/`undefined`, `any` implicites, `this` non typé |
| `verbatimModuleSyntax` | `true` (TS 5+) | Imports de type non purgés au build |
| `noUncheckedIndexedAccess` | `true` | Accès tableau sans garde `undefined` |
| `exactOptionalPropertyTypes` | `true` | `undefined` assignable à une prop optionnelle |

Si `strict: false` ou absent → activer `strictNullChecks` en premier, puis les autres flags un par un.

## Vue SFC — typage des composants

```vue
<script setup lang="ts">
// ✅ defineProps générique (Vue 3.3+) — pas de PropType<T>
const props = defineProps<{
  userId: string
  label?: string
}>()

// ✅ withDefaults pour les valeurs par défaut
const props = withDefaults(defineProps<{ count?: number }>(), { count: 0 })

// ✅ defineEmits générique
const emit = defineEmits<{
  submit: [payload: FormData]
  close: []
}>()

// ❌ PropType<T> — verbeux, remplacé par la syntaxe générique depuis Vue 3.3
// props: { userId: { type: String as PropType<string>, required: true } }
</script>
```

## Composables — typage du retour

```ts
// ✅ Type de retour explicite — évite les inférences fragiles pour les appelants
export function useUser(id: Ref<string>): { user: Ref<User | null>; loading: Ref<boolean> } {
  const user = ref<User | null>(null)
  const loading = ref(false)
  return { user, loading }
}

// ❌ Pas de type de retour — l'appelant subit l'inférence, fragile au refactor
export function useUser(id) { ... }
```

## Appels API — typage des réponses

```ts
// ✅ Réponse typée avec generic
const { data } = await useFetch<User[]>('/api/users')

// ✅ Zod / valibot pour valider + inférer en même temps
import { z } from 'zod'
const UserSchema = z.object({ id: z.string(), name: z.string() })
type User = z.infer<typeof UserSchema>

// ❌ assertion sans validation — aucune garantie à runtime
const data = response.data as User[]
```

## Import style (TS 4.5+ / verbatimModuleSyntax)

```ts
// ✅
import type { User } from './types'
import { ref, type Ref } from 'vue'

// ❌ import normal pour un type pur
import { User } from './types'
```

## Anti-patterns à signaler

| Anti-pattern | Détection | Alternative |
|---|---|---|
| `as any` | `grep -rn "as any"` | Type correct ou `as unknown as T` avec commentaire |
| `!` non-null assertion | `grep -rn "[^!=]![^=]"` | Guard explicite ou optional chaining |
| `@ts-ignore` sans commentaire | `grep -rn "@ts-ignore"` | `@ts-expect-error` avec explication |
| `catch (e)` + `e.message` direct | revue manuelle | `if (e instanceof Error) e.message` |
| `: any` explicite | `grep -rn ": any"` | Type précis ou `unknown` |
| `: Function` type | `grep -rn ": Function"` | Signature explicite `() => void` |
