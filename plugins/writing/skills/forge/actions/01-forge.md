# 01 - Brainstorm

Challenge and iterate on a writing project's overview until all required narrative elements are solid enough for TOC generation.

## Inputs

- `<projet>` (optional, positional) — the writing project directory. Default: current working directory. Local path — `forge` operates relative to it, never via a global vault.

> If the project belongs to a JDR domain, universe docs are resolved locally: `R/_univers/<univers>/{canon,mj}/` where `R` is discovered by walking up to l'un des marqueurs `_campagnes/`, `_univers/` ou `_pjs/`. See `ttrpg`'s `references/jdr-layout.md`.

## Outputs

Updated overview file at `<projet>/_brief/overview.md` (working dir `_brief/`, content not prefixed):

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

Plus optional detail files for projects with 3+ distinct parts, under `<projet>/_brief/`:
- `scenarios-details.md` (type: scenario)
- `novels-details.md` (type: novel)
- `livrets-details.md` (type: roleplaying)
- `sections-details.md` (type: guide)

## Process

1. Locate `<projet>/_brief/overview.md`. If `_brief/` is absent, create it (or suggest `obs:brief assemble <projet>` to set up the working dir first). Read the project `type` from the overview frontmatter (default: "scenario"); ask if unset.
2. If the project belongs to a JDR domain, load the relevant universe docs for consistency: resolve `R` locally (walk up to `_campagnes/`, `_univers/` or `_pjs/`), then read `R/_univers/<univers>/canon/` (official lore) and `R/_univers/<univers>/mj/` (MJ additions). For a non-JDR project, skip this step.
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
9. **Exit check**: all required overview elements present AND the last 2–3 iterations produced only minor adjustments? → Present the completion summary and suggest the next step: `obs:brief assemble <projet>` to consolidate the brief, then `toc`.

## Test

After 3+ iterations on a project, `<projet>/_brief/overview.md` contains at minimum: pitch, structure, at least 2 named characters with motivations, and a tone/atmosphere statement.
