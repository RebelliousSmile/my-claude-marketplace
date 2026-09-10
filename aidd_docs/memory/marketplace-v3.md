# Marketplace — état courant

Source de vérité : `plugins/<nom>/.claude-plugin/plugin.json`, recopié dans `.claude-plugin/marketplace.json`. Ce fichier en est la lecture, pas une archive datée.

Un `version.txt` racine a existé et a été **supprimé le 2026-07-30** : aucun fichier du dépôt ne le lisait et il avait dérivé de six mineures. Ne pas le recréer — un second porteur de version rediverge dès le bump suivant.

**⚠ `pnpm test` lit l'arbre de travail, jamais l'état commité.** La règle M1 de `tools/eval/consistency.mjs` (parité version + description `plugin.json` ↔ `marketplace.json`, l. 45-46) passe par `readFileSync(join(ROOT, p))` (l. 29) : elle n'interroge ni l'index ni un commit. Un test vert n'atteste donc rien du contenu qu'on est en train de livrer. **Mesuré le 2026-08-05** sur `feat/design-harness-durcissement` : quatre commits consécutifs (`7c7997f`, `8c3b26b`, `7e7e080`, `53be804`) portaient `plugin=2.9.1` contre `marketplace=2.9.0` — violation M1 dans l'arbre commité — pendant que le gate restait vert, parce que la copie de travail portait déjà le bump à venir. Corollaire pratique : le bump et son contenu doivent atterrir dans **le même commit**, et vérifier la parité se fait sur `git show HEAD:…`, pas sur `pnpm test`.

## Chargement sélectif des workflows composites

Une skill composite coûteuse conserve son comportement complet historique comme route `all`, mais expose comme actions utilisateur les résultats réellement demandables. L'inventaire, l'orchestration et le rapport restent des actions de support : ils ne deviennent pas des choix utilisateur par accident.

Une route ciblée charge uniquement son action, ses prérequis et leurs références. Une dépendance fournit le niveau minimal requis — par exemple une consultation `status-only` ne réutilise pas une réconciliation capable de fermer un item. La détection ou l'état partagé possède un seul propriétaire puis circule dans le contexte d'exécution ; la dupliquer dans plusieurs actions recrée du coût et des contradictions. La réponse développe le résultat demandé, résume les prérequis et omet les sections qui n'ont pas tourné au lieu de fabriquer des zéros.

| Plugin | Rôle |
|---|---|
| `overcode` | Extensions AIDD projet-agnostiques : alias, behave, control, harvest, status, taste, foresee, baby, readme, changelog, decompose, journey, reconcile-normative, seo-optimize, data/web/ap-optimize |
| `design` | Entonnoir design system 5 verbes (define→destructure→adjust→enforce→diffuse) + detail et harness hors entonnoir |
| `game-writer` | Contenu narratif jeu vidéo (bank, dialogic-draft, dialogic-review) |
| `sc-godot` | Godot/GDScript — coquille (skills à porter) |
| `sc-js` | Écosystème JS (Nuxt/Vue/Svelte/Vite/Astro) + design-bridge, wp-blocks |
| `sc-css` | Écosystème CSS + design-bridge |
| `sc-php` | Écosystème PHP (WP/Laravel/Symfony) + log-analysis, bruno, setup, design-bridge, builder-coverage |
| `sc-python` | Écosystème Python (Django/FastAPI/Flask) |
| `sc-rust` | Écosystème Rust (Axum/Actix + SQLx/Diesel) |
| `web-tiers` | SaaS tiers (Firebase/Firestore, Klaviyo, GTM, Clarity, PSI) |
| `obs` | Notes Obsidian, arbre Documents/, filler, research, extract-pdf |

## Plugins supprimés ou renommés

| Ancien | Devenu |
|---|---|
| `aidd-overlay` | `overcode` (renommé en 3.0.0) |
| `obsidian` | `obs` (renommé) |
| `gamedesign` | `game-writer` (renommé) |
| `doc-writer` | `writing` (fusion), puis `writing` retiré du marketplace |
| `rpg-writer` | `writing` (craft narratif) + `obs` (skills JDR + assemblage intrants) |
| `tabula-rasa` | — (supprimé, système de reset abandonné) |

## Skills supprimées

| Skill | Plugin | Remplacée par |
|---|---|---|
| `dig` | `overcode` | output style natif Learning (blocs ★ Insight) — le rappel actif noté /20 n'a pas d'équivalent |

## Séparation des responsabilités (BREAKING v3)

- **`obs`** assemble les intrants : `brief` (construit `_brief/`), `forge` (concept), `research` (données), `lore-extract`, `rules-keeper`, `extract-pdf`.
- La production éditoriale à partir d'un brief ne remonte jamais vers `R` ni `bank.yml`.
