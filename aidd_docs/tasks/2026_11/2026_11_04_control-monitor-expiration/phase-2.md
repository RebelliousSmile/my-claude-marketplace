---
status: done
---

# Phase 2 — Rattrapage dans les consignes et les evals

## Architecture projection

```
notification batch #k  ─┐
expiration du Monitor  ─┼─► comparer k à $state/commented (dernier_k)
                        │     k == dernier_k + 1 → commentaire normal (§ 7)
                        │     k >  dernier_k + 1 → lire emitted.log après dernier_k
                        │                          → bloc « rattrapage #a–#b » puis #k
                        ├─► à l'expiration : relire emitted.log, puis réarmer (même --state)
                        └─► après chaque commentaire : écrire k dans $state/commented
```

## User Journey

1. Le Monitor expire. Avant de réarmer, le commentateur lit `emitted.log` après le dernier lot commenté, commente ce qu'il y trouve, puis réarme.
2. Une notification `batch #269` arrive après #234. Le commentateur signale le trou (`? 34 lots non notifiés, rattrapés depuis le journal`) et les commente groupés : une ligne par lot jusqu'à 5, au-delà un résumé (fichiers touchés, commits, total `errors×n`) avec les `⚠` détaillés.

## Test Scope

```mermaid
journey
  title Scénario L8 — trou de notifications
  section Setup
    Fixture session, commented = 3, batches.log jusqu'à #7: 5
  section Happy path
    Notification #7, rattrapage #4–#6 depuis le journal, puis #7: 5
  section Edge case
    Expiration sans notification, relecture du journal avant réarmement: 4
  section Teardown
    Aucune écriture dans la fixture: 5
```

## Wireframe

Sans objet (aucune interface).

## Tasks to do

- [x] `actions/01-watch.md` § 5 : remonter `timeout_ms` = 1 800 000 en tête de l'armement, marqué obligatoire (« ne jamais armer sans ») ; à l'expiration, relire le journal **avant** de réarmer
- [x] `actions/01-watch.md` § 7 : ajouter l'étape 0 « détecter un trou » (comparaison de `k` à `$state/commented`, lecture de `emitted.log`), le format du bloc de rattrapage, et l'écriture de `k` dans `$state/commented` après chaque commentaire
- [x] `SKILL.md` : préciser dans « Lecture seule » que le dossier d'état appartient à control (seul `commented` y est écrit par le commentateur) ; compléter « Un lot, un commentaire » (un trou se rattrape depuis le journal, jamais en silence) et « La sonde vit au-delà d'un Monitor » (expiration = relecture puis réarmement) ; citer `emitted.log` dans References et W10 dans Evals
- [x] `evals/fixtures/session/README.md` : dire que `batches.log` tient lieu de `emitted.log`, et poser `commented` = 3 dans le dossier d'état décrit
- [x] `evals/lifecycle-scenarios.md` : ajouter L8 (trou de notifications) et L9 (expiration : relecture avant réarmement), puis jouer un run à sec (dry-run) et consigner le tableau
- [x] `plugins/overcode/CHANGELOG.md` : entrée `[Unreleased]` › `### Fixed` (lots perdus entre deux notifications, journal et rattrapage)

## Test acceptance criteria

- L8 : le bloc de rattrapage #4–#6 nomme en `⚠` `.env` (lot #4) et la dépendance ajoutée (`package.json`, lot #5), sans recopier de valeur ; puis `commented` = 7
- L1 à L9 en dry-run : L8 et L9 PASS, aucun recul sur L1 à L6 (L7 reste rouge, hors périmètre)
- Le texte de `01-watch.md` ne permet plus d'armer sans `timeout_ms`
- Après un compactage simulé (L8 sans historique de conversation), le rattrapage repart de `$state/commented`
- `node tools/eval/control-watch.mjs` toujours vert
- Aucune mention de chemin de cache (`~/.claude/plugins/cache/`) dans les fichiers modifiés
