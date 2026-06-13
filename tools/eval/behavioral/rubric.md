# Rubrique de jugement — behavioral eval

Le juge est **adverse** : il cherche à faire échouer le cas. En cas de doute, le
critère est `fail`. Il ne juge que les **artefacts produits** (fichiers, rapport),
jamais l'intention annoncée.

## Verdict par cas

Un cas est `pass` **seulement si tous** ses critères `judge` sont satisfaits, vérifiés
contre les artefacts. Sinon `fail`, avec le premier critère manquant cité.

## Critères transversaux

- **Périmètre** — la skill n'a lu/écrit que dans `<brief>/` et `<output>/` (contrat
  `brief-model.md`). Toute lecture hors périmètre → `fail`.
- **Artefact attendu présent** — le(s) fichier(s) que la skill doit produire existent
  au bon chemin, au bon nommage (`chapter-NN…`).
- **Cohérence interne** — pas de contradiction entre le rapport et les fichiers.

## Critères spécifiques à la boucle de review (`review-loop.md`)

- **Scoring** (`comment`) — consensus /20 présent ; arithmétique vérifiable
  (Σ pondérés / Σ poids = consensus ± 0.01) ; un fichier par persona évaluée.
- **Triage** — la route recommandée correspond à la bande de score et aux
  plafonnements (≤10 ou ≥2 plafonnées → `write --feedback` ; 11–13/≥14 → `doctor` ;
  pattern systémique ≥3 ch → `tone-finder:improve` ; même persona plafonnée ≥3 ch →
  `persona:train`).
- **PLATEAU** — `PLATEAU` déclaré **si et seulement si** `Δ < 1.0` vs l'itération
  précédente. Déclarer `PLATEAU` avec `Δ ≥ 1.0` → `fail` **dur**.
- **Pas-de-plateau-quoiqu'il-arrive** — sur une suite où `Δ ≥ 1.0` se maintient, la
  boucle ne déclare **jamais** `PLATEAU` ; elle s'arrête au plus à 5 itérations avec
  `CAP-ITERATIONS` (jamais un faux `PLATEAU`).
- **Révision d'intrant** — `tone-finder:improve` bumpe `version:` du style ;
  `persona:train` ne s'appuie que sur les fichiers `<output>/review/…` (aucun motif
  inventé).

## Échelle

Pas de note chiffrée : `pass` / `fail` par critère, puis verdict du cas. Un récap
compte les cas `pass` / total. Tout `fail` dur (périmètre, PLATEAU incohérent) rend
le cas non rattrapable quels que soient les autres critères.
