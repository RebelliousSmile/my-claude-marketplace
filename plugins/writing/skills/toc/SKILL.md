---
name: toc
model: sonnet
description: Generates a table of contents (TOC) for a writing project from the brief's summary.md, producing <output>/toc/INDEX.md with chapter synopses and key points; optionally generates detailed per-chapter spec files. Use when planning chapters for a long-form project. Skip entirely for short-form writing (no TOC needed). Do NOT use for writing chapter content — use `write` instead; do NOT use for concept development — use `forge` instead.
---

# TOC

Analyzes the brief's `summary.md` and generates `<output>/toc/INDEX.md` — a structured table of contents with chapter synopses, key points, character `[INTRO]`/`[REF]` tags, and output-style references. On request, generates per-chapter spec files (`<output>/toc/chapter-<NN>.md`) with detailed writing instructions.

Reads the **brief model**: `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md`. The `<brief>/` is read-only; everything `toc` needs is in `<brief>/summary.md`. **Short-form writing skips the TOC entirely** — go straight to `write`.

## Available actions

| #   | Action              | Role                                                         | Input                                       |
| --- | ------------------- | ------------------------------------------------------------ | ------------------------------------------- |
| 01  | `generate-toc`      | Analyze `summary.md`, validate chapter breakdown, write INDEX.md | `<brief>` `--out <output>`              |
| 02  | `write-toc-chapter` | Generate a detailed per-chapter spec from INDEX.md entry     | chapter number + `<output>/toc/INDEX.md`    |

## Default flow

`01 → user validates chapter breakdown → INDEX.md written`. Then `02` on demand for any chapter.

Trigger-to-action mapping:
- "generate TOC", "create table of contents", "plan chapters", "structure my novel", "generate the outline" → `generate-toc`
- "write chapter spec", "detail chapter NN", "chapter breakdown", "fiche de chapitre" → `write-toc-chapter`

## Transversal rules

- Read **only** the brief: `<brief>/summary.md` (concept/synopsis/constraints/lore consolidated), `<brief>/personas/`, `<brief>/output-styles/`. Never read outside `<brief>/`.
- Always propose the chapter breakdown for user validation before writing INDEX.md.
- Tag first appearances: `[INTRO]` for characters/mechanics/concepts; subsequent chapters use `[REF ChXX]`.
- Language and content type are declared in `summary.md` (default: French).
- `<output>/toc/chapter-<NN>.md` files are optional; generate only on explicit user request.
- Chapter numbers formatted as 2 digits: `01`, `02`, … `10`, `11`.

## External data

- `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md` — the brief → output working-dir contract.
- `<brief>/summary.md` — the autonomous brief; sole source of context.
- `<output>/toc/INDEX.md` — produced by `generate-toc`, consumed by `write-toc-chapter` and `write`.
