# 01 - Brainstorm

Challenge and iterate on a writing project's overview until all required narrative elements are solid enough for TOC generation.

## Inputs

- `project_path` (required) — string, format `<jeu>/_ecrits/<projet>` (resolved to `<projet-root>` = `<jeu>/_ecrits/<projet>/`)

> Path variables: `<univers-root>` = `<jeu>/_univers/<univers>/`, `<projet-root>` = `<jeu>/_ecrits/<projet>/`. See `setup/references/vault-layout.md`.

## Outputs

Updated overview file (the path declared in `bank.yml > overview:`, inside `<projet-root>`):

```markdown
# [Project Title]

## Pitch
[2-3 sentence concept]

## Structure
[Acts / parts / chapter overview]

## Characters
[Protagonists and antagonists with motivations]

## Stakes
[Central conflict and consequences]

## Tone
[Atmosphere and register]
```

Plus optional detail files for projects with 3+ distinct parts:
- `.docs/scenarios-details.md` (type: scenario)
- `.docs/novels-details.md` (type: novel)
- `.docs/livrets-details.md` (type: roleplaying)
- `.docs/sections-details.md` (type: guide)

## Process

1. Load `bank.yml`. If absent or invalid → STOP and ask user to run `setup init <project_path>` first.
2. Load ALL files declared in `bank.yml`: overview, output-style, and every doc listed in `bank.yml > docs`. Universe docs span both `<univers-root>/canon/` (official lore) and `<univers-root>/mj/` (MJ additions). Note `document.type` (default: "scenario").
3. Check overview state:
   - No overview file → prompt for a minimal description (concept, genre/tone, protagonists). Create a typed template from user responses.
   - Minimal overview (fewer than 2 complete sections) → proceed directly to step 4.
   - Existing overview with ≥2 complete sections → summarize current state and open questions, then jump to step 4.
4. **Analyze**: read the overview. Identify present elements and missing/vague zones (motivations, conflicts, scope, POV, etc.).
5. **Challenge**: pose 2–3 questions using the techniques below. Use universe docs to verify consistency; flag any contradiction.
   - Challenge techniques: "What if…?", "Why not…?", "5 Whys", "Consequences?", "Devil's advocate", "Inversion".
   - Type-specific questions: scenario → PJ role, agency, decision points; novel → POV, emotional arcs; roleplaying → Callings, relevant rules; guide → sections, target audience.
6. **Propose alternatives**: for each vague zone, offer 2–3 options with advantages, drawbacks, and output-style compatibility note.
7. **Update**: after user responds, draft the updated overview excerpt. Present it with a change summary: "Additions: X. Modifications: Y → Z. Deletions: W. Confirm?" Write only after confirmation.
8. **Iterate** (back to step 4): identify 2–3 new open questions from the update.
9. **Exit check**: all required overview elements present AND the last 2–3 iterations produced only minor adjustments? → Present the completion summary and suggest: `toc generate-toc <overview-path>`.

## Test

After 3+ iterations on a project, the overview file at the `bank.yml`-declared path contains at minimum: pitch, structure, at least 2 named characters with motivations, and a tone/atmosphere statement.
