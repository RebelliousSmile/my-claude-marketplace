---
paths:
  - "server/plugins/**/*.js"
  - "server/plugins/**/*.ts"
  - "server/api/**/*.js"
  - "server/api/**/*.ts"
  - "server/middleware/**/*.ts"
---

# Nitro — imports dans les plugins serveur

## Règle

Toujours importer les modules internes/partagés via l'alias `~~/` (racine projet), jamais par chemin relatif.

```js
// ✅ alias racine — résolu correctement en build et prerender
import { isMarketingPath } from '~~/shared/marketingRoutes'

// ❌ relatif — échoue pendant le bundle Nitro prerender
import { isMarketingPath } from '../../shared/marketingRoutes.js'
```

## Pourquoi

Pendant le prerender, Nitro bundle vers `.nuxt/prerender/index.mjs` et résout les chemins relatifs depuis ce fichier — `../../shared/foo.js` devient `C:\shared\foo.js` → ENOENT.

Le hot-reload dev peut masquer le problème : l'erreur n'apparaît qu'au `nuxt build` / prerender.

## Aliases disponibles dans Nitro

| Alias | Cible | Usage |
|---|---|---|
| `~~/` | Racine projet | Code partagé `shared/`, `utils/`, etc. |
| `#imports` | Auto-imports Nitro | `defineEventHandler`, `useRuntimeConfig`, etc. |
| `#internal/nitro` | Runtime Nitro | Rare, internals |

`~/` (alias srcDir Nuxt) **n'est pas garanti** côté Nitro — toujours préférer `~~/`.

Pour les modules npm : import ESM standard (résolu via `node_modules`, pas d'alias nécessaire).
