# 02 - Write TOC Chapter

Generate a detailed per-chapter spec file (`<output>/toc/chapter-<NN>.md`) from the INDEX.md entry.

## Inputs

- `chapter_number` (required) — integer, the chapter to detail (e.g. `3` or `03`)
- `--out <output>` (required) — the output directory containing `toc/INDEX.md`
- `<brief>` (optional, positional) — to enrich from `summary.md` if needed

## Depends on

- `generate-toc`

## Outputs

```markdown
# Chapitre 03 : [Titre]

## Synopsis
[2-3 sentences]

## Points clés
- [mandatory narrative element]
- [reveal or turning point]
- [character development]

## Personnages
| Nom | Rôle dans ce chapitre |
|-----|-----------------------|
| [character] | [action/arc] |

## Lieux
- [location] : [brief description]

## Ambiance
[Tone, atmosphere, visual references]

## Output-style
[filename — e.g. wot-novel.md, from <brief>/output-styles/]

## Connexions
- Précédent : [link to chapter N-1, or "Premier chapitre"]
- Suivant : [setup for chapter N+1, or "Dernier chapitre"]

## Notes d'écriture
[Specific instructions, points of attention, constraints drawn from summary.md]
```

Saved to: `<output>/toc/chapter-<NN>.md`

## Process

> Working dirs per `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md`. Lore/constraints come from `<brief>/summary.md`; never read outside `<brief>/`.

1. Load `<output>/toc/INDEX.md`. Locate the entry for chapter `<NN>`. If not found → ABORT and ask user to run `generate-toc` first.
2. Load `<brief>/summary.md` for the lore/constraints relevant to this chapter (characters, mechanics, locations named in the key points). Reference `<brief>/output-styles/` and `<brief>/personas/` by filename.
3. Expand the INDEX.md entry into the full spec format:
   - **Synopsis**: elaborate to 2–3 precise sentences covering the full arc of the chapter.
   - **Points clés**: expand each bullet with detail; where `[INTRO]` tags exist, specify full description format; where `[REF ChXX]` tags exist, specify abbreviated reference format.
   - **Personnages**: for each character appearing in this chapter, note their specific role/action/arc here.
   - **Lieux**: list locations used; add brief descriptions if defined in `summary.md`.
   - **Ambiance**: synthesize tone from the INDEX.md entry and the referenced output-style.
   - **Output-style**: copy the filename from the INDEX.md `**Output-style:**` field.
   - **Connexions**: link to the previous chapter's outcome and the next chapter's setup.
   - **Notes d'écriture**: add specific writing instructions (POV constraints, mechanics/terms to include, `[INTRO]`/`[REF]` formatting rules).
4. If personas are declared for this chapter in INDEX.md: keep the `**Personas:**` field listing the filenames.
5. Write to `<output>/toc/chapter-<NN>.md` (two-digit chapter number format).
6. Report: "Spec file written: `<output>/toc/chapter-<NN>.md`. Suggest: `write <brief> --out <output> --chapter <NN>` to write the chapter."

## Test

After `write-toc-chapter 3 --out <output>`, verify that `<output>/toc/chapter-03.md` exists and contains non-empty **Synopsis**, **Points clés**, and **Output-style** sections.
