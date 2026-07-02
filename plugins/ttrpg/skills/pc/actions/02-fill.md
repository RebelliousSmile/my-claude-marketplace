# 02 - Fill

Fill PJ files from a pasted source text (brainstorm, notes, etc.).

## Inputs

- `pj` (required) - the target PJ folder under `R/_pjs/<pj>/`.
- `source text` (required) - pasted text to distribute. **If the user has no starting text**, switch to `background` (genre-driven questionnaire) instead of filling on an empty basis.

## Outputs

Updated durable PJ files under `R/_pjs/<pj>/` (`pj.md`, `fiche_technique.md`, `intention.md`, `etat-jeu.md`, `backlog.md`), completed from the source text — existing content preserved, gaps marked `[To complete]`.

## Process

Ask the user to paste the source text. **If the user has no starting text**, switch to `background` (genre-driven questionnaire) rather than filling on an empty basis. Otherwise:

1. Analyzes the text and identifies which sections it feeds:
   - Identity, facade, background, personality, world relationship → `pj.md`
   - Stats, power/weakness tags, equipment, mechanics → `fiche_technique.md`
   - Themes, tone, truths, line rouge, visceral question → `intention.md`
   - Mechanical game state (gauges, resources, statuses, counters per the active rules (game system)) → `etat-jeu.md`
   - Scene ideas, open threads → `backlog.md`

2. Distributes content into the relevant files. Preserves existing content — completes, never overwrites.

3. Marks incomplete sections with `[To complete]`.

4. Does not invent content missing from the source text.

Reports modified files and lists sections still marked `[To complete]`.

## Test

The PJ files under `R/_pjs/<pj>/` contain the distributed source content without overwriting prior content, and every gap is marked with the literal string `[To complete]`.
