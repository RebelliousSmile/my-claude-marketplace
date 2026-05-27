---
paths:
  - "server/plugins/**/*.js"
  - "server/plugins/**/*.ts"
  - "server/api/**/*.js"
  - "server/api/**/*.ts"
---

# Nitro server plugins — module imports

- Always import shared/internal modules via the `~~/` alias (project root), never via relative paths
- Reason : pendant le prerender, Nitro bundle vers `.nuxt/prerender/index.mjs` et resolve les chemins relatifs depuis ce fichier — `../../shared/foo.js` finit en `C:\shared\foo.js` → ENOENT
- Le hot-reload dev peut masquer le problème : l'erreur n'apparaît qu'au `nuxt build` / prerender
- Pour les modules npm : import standard ESM (résolu via `node_modules`)

## Pattern

```js
// ✅ alias root — résolu correctement en build et prerender
import { isMarketingPath } from '~~/shared/marketingRoutes'

// ❌ relatif — échoue pendant nitro prerender bundle
import { isMarketingPath } from '../../shared/marketingRoutes.js'
```

## Aliases disponibles dans Nitro

| Alias | Cible | Usage |
|---|---|---|
| `~~/` | racine projet | code partagé `shared/`, `utils/`, etc. |
| `#imports` | auto-imports Nitro | `defineEventHandler`, `useRuntimeConfig`, etc. |
| `#internal/nitro` | runtime Nitro | rare, internals |

`~/` (Nuxt srcDir alias) **n'est pas garanti** côté Nitro — préférer `~~/` toujours.
