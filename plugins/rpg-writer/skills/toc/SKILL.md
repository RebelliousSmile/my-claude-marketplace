---
name: toc
model: sonnet
description: Generates a table of contents (TOC) for a writing project from a source document, producing .toc/INDEX.md with chapter synopses and key points; optionally generates detailed per-chapter spec files. Use when starting a new project structure, planning chapters from a synopsis or overview, or detailing an existing chapter entry. Do NOT use for writing chapter content — use `write` instead; do NOT use for concept development — use forge instead.
---

# TOC

Analyzes a source document (overview, synopsis, notes, or extraction) and generates `.toc/INDEX.md` — a structured table of contents with chapter synopses, key points, character `[INTRO]`/`[REF]` tags, and output-style references. On request, generates per-chapter spec files (`toc-chapter<NN>.md`) with detailed writing instructions.

## Available actions

| #   | Action              | Role                                                         | Input                                     |
| --- | ------------------- | ------------------------------------------------------------ | ----------------------------------------- |
| 01  | `generate-toc`      | Analyze source document, validate chapter breakdown, write INDEX.md | source file path + `bank.yml`      |
| 02  | `write-toc-chapter` | Generate a detailed per-chapter spec from INDEX.md entry     | chapter number + `.toc/INDEX.md`          |

## Default flow

`01 → user validates chapter breakdown → INDEX.md written`. Then `02` on demand for any chapter.

Trigger-to-action mapping:
- "generate TOC", "create table of contents", "plan chapters", "structure my novel", "generate the outline" → `generate-toc`
- "write chapter spec", "detail chapter NN", "toc-chapter", "chapter breakdown", "fiche de chapitre" → `write-toc-chapter`

## Transversal rules

- Always propose the chapter breakdown for user validation before writing INDEX.md.
- Load ALL files declared in `bank.yml` sections `docs` and `rules-files` for cross-referencing.
- Tag first appearances: `[INTRO]` for characters/mechanics/concepts; subsequent chapters use `[REF ChXX]`.
- Content in French unless project configuration declares another language.
- `toc-chapter<NN>.md` files are optional; generate only on explicit user request.
- Chapter numbers formatted as 2 digits: `01`, `02`, … `10`, `11`.

## External data

- `bank.yml` at `<projet-root>` — declares all documentation files to cross-reference.
- `.toc/INDEX.md` — produced by `generate-toc`, consumed by `write-toc-chapter`.
- `setup/references/vault-layout.md` — path-variable convention (`<univers-root>`, `<projet-root>`, …).
