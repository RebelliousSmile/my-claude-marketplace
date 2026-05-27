---
paths:
  - "**/*.vue"
  - "**/*.js"
  - "**/*.ts"
---

# Vite — dynamic imports et code-splitting

## Règle

- Pour lazy-loader un module, **TOUS** les importeurs du graphe d'entrée doivent utiliser `await import()`
- Un seul `import X from "..."` statique restant collapse le module dans le chunk parent
- La conversion partielle a zéro impact sur le bundle — convertir tout, ou rien

## Avant tout split

```bash
# Lister les imports statiques de la cible
grep -r "from ['\"]<module>" --include="*.{vue,js,ts}" .
```

- Inclure les importeurs transitifs (middlewares, layouts, navbars, stores)
- Convertir l'ensemble du graphe ou abandonner

## Signal load-bearing

- Warning Vite/Rollup `dynamic import will not move module into another chunk` = bug, pas cosmétique
- Vérifier `pnpm nuxt build` après chaque tentative de split — toute occurrence de ce warning bloque

## Anti-patterns rejetés

- `manualChunks` Rollup — force le split mais le bundle reste préchargé via modulepreload
- Convertir uniquement les sites évidents — fausse sensation de progrès
