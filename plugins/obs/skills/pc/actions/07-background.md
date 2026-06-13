# 07 - Background

Build the PJ's background through a questionnaire tailored to the game's **genre**.

## Inputs

- `pj` (required) - the PJ (argument or `R/.current-session`).
- `genre` (required) - the game's genre, inferred from the active `R` domain; failing that, ask the user for the GROG theme or the game pitch.
- `R` (resolved) - the game domain discovered locally.

## Outputs

- `R/_pjs/<pj>/pj.md` (identity, facade, background, personality, relations) and `R/_pjs/<pj>/intention.md` (visceral question, line rouge, themes, truths), completed from the answers — existing content preserved, open sections marked `[To complete]`.

## Process

Builds the PJ's background through a **questionnaire tailored to the game's genre**. Questions, genre families and the GROG mapping table: `references/genres-et-background.md`. Inspired by Ecryme 2e character creation (built from concrete questions, not from boxes).

1. **Determine the PJ** (argument or `R/.current-session`) and the game's **genre** — inferred from the active `R` domain; failing that, ask the user for the GROG theme or the game pitch.
2. **Map** the genre to a **family** (+ modulators) via the table in `references/genres-et-background.md`.
3. Ask the **common trunk**, then the family's **signature questions**, in **batches of 2–4 questions** — offer 2–3 leads per question, let the user choose/amend (back-and-forth, never one block).
4. **Distribute** the answers into `pj.md` (identity, facade, background, personality, relations) and `intention.md` (visceral question, line rouge, themes, truths), following the "Where the answers land" table in the reference. Complete, never overwrite; mark `[To complete]` the sections left open.
5. **Invent no mechanics**: stats/tags/rolls stay deferred to `R/_systeme/{canon,mj}/`.

Reports modified files and lists sections still marked `[To complete]`.

## Test

`R/_pjs/<pj>/pj.md` and `R/_pjs/<pj>/intention.md` hold the questionnaire answers distributed per the reference table, with no invented mechanics and open sections marked `[To complete]`.
