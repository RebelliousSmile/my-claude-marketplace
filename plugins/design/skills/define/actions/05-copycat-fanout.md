# 05 - copycat-fanout

Chemin maquette **multi-pages mesurée**. Quand la référence est un système de pages
arbitraire (SPA `setPage` ou jeu d'URLs), on ne devine pas à l'œil : on **fan-out l'agent
`copycat`** (un par page, en parallèle) pour mesurer chaque page contre le contrat brouillon
via l'oracle déterministe, puis on **agrège** les fragments en une table de correspondance
unique soumise au **checkpoint humain (P2)**. Variante à l'échelle de `02-extract`.

## Inputs

- Une maquette multi-pages : SPA exposant `window.setPage`/`setViewport`, ou une liste d'URLs.
- Le contrat brouillon courant (tokens/composants candidats) à mapper.
- Le breakpoint set du projet (ex. mobile 375 / tablette 834 / desktop 1440).
- L'oracle : `${CLAUDE_PLUGIN_ROOT}/adapters/measure/` (`measure.py`, voir son README).
- L'agent : `copycat` (`${CLAUDE_PLUGIN_ROOT}/agents/copycat.md`).

## Process

### A. Lister + checklist (résumable)

1. **Dériver la liste des pages** : énumérer les clés `setPage` de la maquette (ou les URLs).
2. **Générer ou charger la checklist** (`references/copycat-checklist-schema.md`, mode `bulk`),
   dans le projet cible. **Détecter l'état réel** (pages déjà fidèles / tokens existants) plutôt
   que tout marquer `todo`. Ne traiter que les pages non `signed-off` (reprise idempotente).

### B. Fan-out (l'orchestrateur, pas une feuille)

3. **Pré-signal de complexité** (bon marché, sans lancer l'agent) : nombre de sections /
   poids DOM / type de template par page, pour router le modèle.
4. **Lancer un agent `copycat` par page, en parallèle** :
   - mécanisme : `Agent` (fan-out) pour une poignée de pages ; `Workflow` (pipeline) pour des
     dizaines. C'est `define` qui possède le fan-out — les agents `copycat` sont des **feuilles**
     (elles ne re-spawnent jamais).
   - modèle : **Sonnet par défaut** ; override `opts.model` seulement si le pré-signal classe la
     page triviale (**Haiku**) ou complexe (**Opus**).
   - chaque agent reçoit : la page, le mapping de sélecteurs maquette↔cible, le breakpoint set,
     et renvoie un **fragment de table de correspondance** (cf. son `## Outputs`).

### C. Agréger (sans arbitrer)

5. **Fusionner + dédoublonner** les fragments en une table de correspondance unique.
6. **FAIRE REMONTER les conflits inter-pages** (page A radius 8px vs page B 10px) dans la section
   *Conflicts* de la table — **ne pas trancher** : l'arbitrage (motif dominant) est le rôle de
   `adjust`. De même, regrouper les `proposed_extensions` (DS-prime : étendre seulement si justifié).
7. **Émettre l'inventaire agrégé** comme livrable du **checkpoint P2** et mettre à jour la checklist.

## Outputs

- Une **table de correspondance agrégée** (`references/correspondence-table-template.md`) : lignes
  par page, section Conflicts inter-pages, extensions proposées justifiées, lignes `derived` flaggées.
- La **checklist** mise à jour (pages → `aggregated`).
- **STOP au checkpoint P2** : présenter la table, attendre la validation humaine. Rien n'est figé
  ni écrit dans le contrat avant sign-off. Après validation, recommander d'invoquer `adjust`
  (arbitrage + figeage) **sur Opus** — non configuré ici.

## Test

- Un fragment par page non `signed-off` a été produit en parallèle ; relancer est idempotent
  (seules les pages non traitées repassent).
- Les conflits inter-pages sont **listés, pas auto-résolus** ; les extensions sont justifiées.
- Aucune écriture dans `tokens.json`/`components.json` ni aucun figeage : la sortie est une
  table soumise au checkpoint humain, consommée ensuite par `adjust`.
