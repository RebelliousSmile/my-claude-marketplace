---
objective: "Combler les gaps SvelteKit dans sc-js — pivot perf SvelteKit, pivot Svelte stores, pivot Biome, câblage sniff+improve, release 0.6.0"
success_condition: "grep -r 'sveltekit' plugins/sc-js/skills/sniff/references/capabilities/perf/ && grep -r 'svelte-stores' plugins/sc-js/skills/sniff/actions/01-scan.md && grep -r 'biome' plugins/sc-js/skills/sniff/actions/01-scan.md && grep -r 'biome' plugins/sc-js/skills/sniff/references/capabilities/tools/ && grep 'sveltekit' plugins/sc-js/skills/sniff/actions/02-install-pivots.md && grep 'svelte-stores' plugins/sc-js/skills/improve/actions/01-analyze.md"
iteration: 0
created_at: "2026-05-28T00:00:00+02:00"
---

# sc-js — SvelteKit pivots (0.5.6 → 0.6.0)

## User journey

```mermaid
flowchart LR
    A[/sc-js:sniff\nsur projet SvelteKit] --> B[Détecte @sveltejs/kit]
    B --> C[Mappe state/svelte-stores.md\n→ chargé à l'audit]
    B --> D[Installe perf/sveltekit.md\n→ .claude/rules/07-quality/]
    B --> E[Mappe tools/biome.md\n→ chargé à l'audit]
    D --> F[/web-optimize\nconsomme règles SvelteKit]
    C --> G[/sc-js:audit\ncharge svelte-stores anti-patterns]
    E --> G
```

## Architecture projection

### Create
- `plugins/sc-js/skills/sniff/references/capabilities/perf/sveltekit.md` — pivot perf 12 sections (bundle route-based, `load()` server vs universal, adapter-static SSG, INP, hydration)
- `plugins/sc-js/skills/sniff/references/capabilities/state/svelte-stores.md` — pivot capability (writable/derived/readable, subscriptions & cleanup, `$store` auto-sub, runes alternative)
- `plugins/sc-js/skills/sniff/references/capabilities/tools/biome.md` — pivot tooling (config `biome.json`, règles correctness/suspicious/style, CI, anti-patterns d'ignore abusif)

### Modify
- `plugins/sc-js/skills/sniff/actions/01-scan.md` — ajouter : (a) `svelte` sans kit dans Step 3 comme framework "Svelte SPA", (b) svelte-stores dans State management (condition : `svelte` OR `@sveltejs/kit`), (c) biome dans nouvelle section Tools, (d) install perf SvelteKit dans table perf, (e) mettre à jour l'exemple `## Output` pour montrer SvelteKit
- `plugins/sc-js/skills/sniff/actions/02-install-pivots.md` — ajouter ligne `perf/sveltekit.md → perf-pivots-sveltekit.md`
- `plugins/sc-js/skills/improve/actions/01-analyze.md` — Step 1.5 : ajouter `state/svelte-stores.md` (condition : SvelteKit ou Svelte détecté)
- `plugins/sc-js/.claude-plugin/plugin.json` — bump 0.5.6 → 0.6.0
- `.claude-plugin/marketplace.json` — bump sc-js 0.5.6 → 0.6.0

### Delete
- aucun

## Applicable rules
- Travailler dans la source `plugins/<name>/skills/` — jamais le cache
- Format pivots : frontmatter `paths:`, 12 sections `§0–§11`, langue française
- Bump : `plugin.json` + `marketplace.json` toujours synchronisés
- Commits via `rtk git`

## Phases et tâches

### Phase 1 — Pivot perf SvelteKit
*Indépendante des phases 2 et 3*

- [ ] Créer `perf/sveltekit.md` avec frontmatter `paths: ["svelte.config.js", "svelte.config.ts"]` — signal de présence SvelteKit, cohérent avec `vite.config.ts` pour le pivot Vite (pas de glob large)
- [ ] §0 Pre-flight : `vite build`, warnings load-bearing, PSI baseline
- [ ] §1 Critical path : `<svelte:head>`, modulepreload, CSS critique above-fold
- [ ] §2 LCP : images above-fold dans layouts SvelteKit, `fetchpriority="high"`, `+layout.svelte`
- [ ] §3 CLS : `width`/`height` sur `<img>`, `font-display: swap`, composants conditionnels
- [ ] §4 Bundle (CRITIQUE) : code-split par route (`+page.svelte` = chunk naturel), lazy `import()` pour libs lourdes (Konva, pdf-lib), `manualChunks`
- [ ] §5 CSS : purge Tailwind (si présent) avec `src/**/*.svelte`, `transition: all` interdit
- [ ] §6 Caching : adapter-static → assets hashés, `Cache-Control: immutable`, `app.html` no-cache
- [ ] §7 SSR vs SPA : distinguer `adapter-static` (SPA/SSG) vs `adapter-node` (SSR) — **référencer `ssr/storage-guards.md` pour les règles browser guard, ne pas redéfinir**
- [ ] §8 INP/TBT : `{#if visible}` lazy-render, `IntersectionObserver`, `tick()` pour différer
- [ ] §9 Backend/API : TTFB via `load()` server-side, `Promise.all` dans `load()` pour paralléliser les fetches
- [ ] §10 Storage : **référencer `ssr/storage-guards.md`** — les règles `localStorage`/browser guard y sont déjà définies ; noter uniquement le contexte SvelteKit (`load()` s'exécute côté serveur même avec adapter-static en dev)
- [ ] §11 Verification : taille chunks route, PSI médiane ≥ 5 runs, Lighthouse CLI

### Phase 2 — Pivot Svelte stores
*Indépendante des phases 1 et 3*

- [ ] Créer `state/svelte-stores.md` avec frontmatter `paths: ["src/**/*.svelte", "src/**/*.ts", "src/**/*.js"]`
- [ ] Documenter `writable` : pattern de base, `set`/`update`, export depuis module partagé
- [ ] Documenter `derived` : dépendances multiples, valeur synchrone vs asynchrone
- [ ] Documenter `readable` : sources externes (WebSocket, timer), cleanup function
- [ ] `$store` auto-subscription : uniquement dans `.svelte`, jamais dans `.ts` (memory leak)
- [ ] Cleanup obligatoire dans `.ts` : `const unsub = store.subscribe(...); onDestroy(unsub)`
- [ ] Section `## Anti-patterns` : subscribe sans unsubscribe en dehors de composant, store mutable exposé directement, store comme cache sans invalidation
- [ ] Alternative Svelte 5 : note courte `Voir aussi legacy/references/svelte-migration.md` — ne pas redupliquer le contenu runes déjà défini dans ce fichier

### Phase 3 — Pivot Biome
*Indépendante des phases 1 et 2*

- [ ] Créer `tools/biome.md` (pas de frontmatter `paths:` restrictif — s'applique à tout projet avec `@biomejs/biome`)
- [ ] Config `biome.json` : structure minimale recommandée, `linter.enabled`, `formatter.enabled`, `organizeImports`
- [ ] Règles prioritaires : `correctness` (toutes ON), `suspicious` (toutes ON), `style` (sélectif)
- [ ] Section `## Anti-patterns` : `// biome-ignore` sans commentaire justificatif, `all: false` sur `correctness`, formatter désactivé en CI, `ignore` glob trop large (`**/*`)
- [ ] Intégration CI : `biome ci` (pas `biome check`) — exit code différent
- [ ] Pre-commit : `biome check --write` dans hook `pre-commit`
- [ ] VS Code : extension officielle Biome, `editor.defaultFormatter` dans `.vscode/settings.json`

### Phase 4 — Câblage sniff + improve
*Dépend des phases 1, 2, 3*

- [ ] `sniff/01-scan.md` — Step 3 : ajouter `| svelte (without @sveltejs/kit) | Svelte SPA |` dans la table framework
- [ ] `sniff/01-scan.md` — State management : ajouter `| Svelte stores | svelte OR @sveltejs/kit in dependencies | state/svelte-stores.md |`
- [ ] `sniff/01-scan.md` — Tools (nouvelle section après TypeScript) : `| Biome | @biomejs/biome in devDependencies | tools/biome.md |`
- [ ] `sniff/01-scan.md` — Perf pivots install : ajouter `| SvelteKit détecté | perf/sveltekit.md | perf-pivots-sveltekit.md |`
- [ ] `sniff/01-scan.md` — mettre à jour l'exemple `## Output` pour inclure un cas SvelteKit (svelte-stores + biome dans le manifeste)
- [ ] `sniff/02-install-pivots.md` — ajouter ligne dans la table perf : `| perf/sveltekit.md | .claude/rules/07-quality/perf-pivots-sveltekit.md |`
- [ ] `improve/01-analyze.md` — Step 1.5 : ajouter `| Svelte store patterns | svelte OR @sveltejs/kit in dependencies | state/svelte-stores.md |`

### Phase 5 — Release 0.6.0
*Dépend de la phase 4*

- [ ] Bumper `plugins/sc-js/.claude-plugin/plugin.json` : `0.5.6 → 0.6.0`
- [ ] Bumper `.claude-plugin/marketplace.json` : entrée sc-js `0.5.6 → 0.6.0`, mettre à jour description
- [ ] `rtk git add` des fichiers modifiés
- [ ] `rtk git commit -m "feat(sc-js): add SvelteKit perf pivot, Svelte stores pivot, Biome pivot — bump 0.5.6 → 0.6.0"`
- [ ] `rtk git push`

## Confidence

**9/10**

✓ Scope borné — 3 nouveaux fichiers + 6 modifications ciblées  
✓ Format bien établi — calqué sur `vue-spa.md`, `state/pinia.md`, patterns existants  
✓ Câblage mécanique — tables dans `01-scan` et `02-install-pivots` sont additives  
✓ Phases 1-3 parallélisables — pas de dépendance entre elles  
✓ §7/§10 perf SvelteKit référencent `ssr/storage-guards.md` — pas de duplication  
✓ Condition svelte-stores couvre Svelte SPA (sans kit) et SvelteKit  
✓ success_condition vérifie 6 points critiques sur les 8 changements
