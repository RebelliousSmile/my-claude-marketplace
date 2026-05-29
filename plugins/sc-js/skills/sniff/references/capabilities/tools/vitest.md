---
---

# Vitest — tests unitaires JS/TS

Applicable quand `vitest` est détecté en devDependencies.

## Config minimale (`vitest.config.ts`)

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',          // 'jsdom' / 'happy-dom' pour du code DOM
    globals: false,               // préférer les imports explicites (describe/it/expect)
    coverage: {
      provider: 'v8',             // @vitest/coverage-v8
      reporter: ['text', 'html'],
      thresholds: { lines: 80, functions: 80, branches: 70 },
    },
  },
})
```

- `globals: false` par défaut : imports explicites depuis `vitest` → pas de pollution du scope global, meilleure traçabilité.
- N'activer `environment: 'jsdom'` que pour les fichiers qui touchent le DOM — l'émulation DOM ralentit les tests purement logiques. Utiliser un commentaire `// @vitest-environment jsdom` par fichier plutôt qu'un environnement global.

## Couverture (`@vitest/coverage-v8`)

```bash
vitest run --coverage
```

- Le provider `v8` est natif et rapide ; préférer à `istanbul` sauf besoin d'instrumentation fine.
- Fixer des `thresholds` qui font échouer la CI sous le seuil — une couverture non gardée par un seuil dérive toujours vers le bas.

## Modes d'exécution

| Commande | Usage |
|---|---|
| `vitest` | Watch interactif — **développement local uniquement** |
| `vitest run` | Exécution unique, exit code propre — **CI** |
| `vitest run --coverage` | CI avec couverture |
| `vitest --ui` | Interface web de debug |

En CI, toujours `vitest run` (jamais `vitest` seul, qui reste en watch et bloque le pipeline).

## Anti-patterns

| Anti-pattern | Problème |
|---|---|
| `environment: 'jsdom'` global pour tout le projet | Pénalise les tests logiques qui n'ont pas besoin du DOM ; cibler par fichier |
| `vitest` (watch) en script `test` de CI | Le process ne se termine jamais — pipeline qui hang |
| Aucun `thresholds` de couverture | La couverture dérive sans garde-fou ; fixer un seuil qui casse la CI |
| `vi.mock` non réinitialisé entre tests | État de mock qui fuit ; `clearMocks: true` / `restoreMocks: true` dans la config |
| Mélanger assertions Jest et Vitest | API proche mais non identique (`vi` vs `jest`) — s'en tenir à `vi` |
