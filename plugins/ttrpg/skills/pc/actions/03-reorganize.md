# 03 - Reorganize

Redistribute existing content into the 6 standard PJ files.

## Inputs

- `pj` (required) - the target PJ folder under `R/_pjs/<pj>/`, **or** a single loose `.md` file to restructure.
- `R` (resolved) - the game domain discovered locally.

## Outputs

A validated redistribution into the standard PJ files under `R/_pjs/<pj>/`, plus dated session files under `R/<AAAA>/<MM>/<pj>/` for any session reports. Source files archived to `R/_pjs/<pj>/.archive/`.

## Process

1. Reads all existing PJ files (recursively if folder; otherwise the single `.md`).
2. Presents a redistribution plan before writing anything:
   - Which source content goes to which target file
   - Which missing files will be created from template
   - Which content belongs outside `_pjs/` (campaign prep → `campaign` ; durable univers → `lore-extract`/`campaign` tree ; live play → `ttrpg:solo-mc`)
   - Which content is ambiguous and needs user arbitration
3. Waits for user validation.
4. If source is a single `.md`: creates `R/_pjs/<slug>/` first, then copies missing files from template.
5. Redistributes validated content. Preserves existing target content — completes, never overwrites.
6. Archives source files to `R/_pjs/<pj>/.archive/` (never deletes directly).

Redistribution rules:
- `pj.md` ← identity, name, age, gender, origin, social facade, background, personality, world relationship
- `fiche_technique.md` ← stats, attributes, skills, power/weakness tags, spells, equipment, persistent statuses
- `intention.md` ← themes, tone, truths, what I want to experience/avoid, visceral question, story threads
- `etat-jeu.md` ← mechanical game state per the active rules (game system): gauges, resources, statuses, counters and pending elements
- **session reports** ← **dated files** `R/<AAAA>/<MM>/<pj>/session-<AAAA-MM-JJ>-<N>.md` (one per session — **not** an aggregated `journal.md`), named and numbered per the **canonical session ordering** (`../../references/jdr-layout.md › Ordre canonique des séances`). An old `journal.md` encountered during reorganization is split into dated files (one per entry, `<N>` assigned in chronological order), then archived.
- `backlog.md` ← scene ideas, threads to revive, open questions, narrative todo

## Test

After validation, the standard PJ files under `R/_pjs/<pj>/` hold the redistributed content, any session entries live in dated `session-<AAAA-MM-JJ>-<N>.md` files (no `journal.md` remains), and the original sources are present under `R/_pjs/<pj>/.archive/`.
