# Decision: Consommation d'un pivot sc-* par un autre plugin

| Field   | Value |
|---------|-------|
| ID      | DEC-004 |
| Date    | 2026-07-22 |
| Feature | `overcode:control` ⇄ pivot `sc-js/tools/testing.md` |
| Status  | Accepted |

## Context

`overcode:control` gouverne la suite de tests d'un projet sans rien savoir de sa stack. Les mécaniques stack-spécifiques (commande de coverage, code de production classable, ce qui est structurellement à forte conséquence) vivent naturellement dans le plugin de langage. C'est le premier cas d'un pivot `sc-*` lu par un plugin **autre** que le sien : `tools/testing.md` n'est consommé par aucune skill de `sc-js`.

## Decision

### 1 — Découverte par glob, jamais par chemin en dur

Le consommateur globe `**/capabilities/**/testing.md` sous la racine du plugin de langage actif. Un chemin en dur casserait à la première réorganisation du plugin producteur, et interdirait à un autre `sc-*` de fournir le même pivot.

La racine résolue est le cache (`~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`), **ou la racine source `plugins/<plugin>/` quand le consommateur tourne contre un dépôt marketplace**. Sans cette seconde branche, aucun pivot n'est testable avant publication : les versions sont épinglées à l'installation et `/plugin install` est interactif.

### 2 — Le contrat appartient au consommateur

`overcode/skills/control/references/pivot-contract.md` fait foi sur les champs attendus. Le pivot producteur s'y conforme ; il ne négocie pas. Chaque champ est **optionnel avec son repli documenté** — un pivot partiel doit dégrader proprement, jamais bloquer.

### 3 — Une section par champ, et le titre énonce le champ

Un champ que le consommateur ne sait pas localiser est traité comme **absent**, jamais inféré d'une section voisine. Quand les titres du pivot divergent de l'anglais du contrat, c'est au **pivot** de déclarer sa liste de correspondance.

Corollaire d'authoring : `sc-js` est rédigé en français, `overcode` en anglais. Les **titres de section** du pivot suivent le contrat mot pour mot (anglais), la **prose** reste dans la langue du plugin producteur.

### 4 — Frontière d'autorité : le pivot priorise, il ne classe pas

Les *Risk signals* d'un pivot pondèrent un classement. Ils ne décident jamais d'un tier. L'autorité sur le tier reste à la stratégie du projet puis au framework de décision générique — un pivot ne peut la raffiner que sur une frontière restant locale/émulée.

## Alternatives Considered

| Alternative | Pros | Cons | Rejected because |
|---|---|---|---|
| Mécaniques stack codées dans `control` | Aucun contrat à maintenir | `control` devient JS-spécifique, puis PHP-spécifique, puis… | Nie la raison d'être d'un plugin projet-agnostique |
| Contrat détenu par le pivot producteur | Le producteur reste libre | Autant de contrats que de plugins de langage | Le consommateur doit lire N formes différentes |
| Champs obligatoires | Lecture simple, pas de repli | Un pivot incomplet bloque l'action | Un repli dégradé et annoncé vaut mieux qu'un échec |

## Consequences

- Tout futur pivot `testing` (`sc-php`, `sc-python`, `sc-rust`…) se conforme au même contrat — aucune modification de `control` requise pour l'accueillir.
- Le contrat de `control` est désormais une interface publique : le modifier de façon incompatible casse les pivots existants.
- Étend `DEC-001` (conventions d'authoring des pivots `sc-*`) au cas cross-plugin.
