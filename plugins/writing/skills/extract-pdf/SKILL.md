---
name: extract-pdf
description: Multi-session pipeline for extracting content from large PDF files and distributing it into project documentation (universe docs, terminologie.md, chapters). Use when importing an existing PDF (rulebook, novel, source document) into the workshop structure across multiple sessions. Do NOT use for web research — use `research` instead; do NOT use for writing new content — use `write` instead.
disable-model-invocation: true
---

# Extract PDF

Four-phase pipeline for large PDF extraction across multiple Claude Code sessions:
- **Session 1** (`setup`): validate environment, read the PDF, cut it into chunks, write `progress.md`.
- **Sessions 2-N** (`process-chunk`): extract one chunk per session, classify content into `classified/*.md`.
- **Final session** (`distribute`): merge classified content into universe docs.
- **Any session** (`debug`): diagnose anomalies in the extraction progress.

## Available actions

| #   | Action          | Role                                                    | Input                                         |
| --- | --------------- | ------------------------------------------------------- | --------------------------------------------- |
| 01  | `setup`         | Session 1 — validate, chunk PDF, write progress.md      | `<project-path>` + `<source-document>`        |
| 02  | `process-chunk` | Sessions 2-N — extract one chunk into classified/*.md   | `<project-path>` + chunk identifier           |
| 03  | `distribute`    | Final session — merge classified content into universe docs | `<project-path>`                           |
| 04  | `debug`         | Any session — diagnose extraction anomalies             | `<project-path>` [chunk-id]                   |

## Default flow

`01 → 02 (×N) → 03`. `04` on demand at any point.

Trigger-to-action mapping:
- "extract PDF", "start extraction", "import PDF" → `setup`
- "extract chunk", "process chunk", "next chunk" → `process-chunk`
- "distribute extraction", "merge extraction", "final session" → `distribute`
- "debug extraction", "extraction anomaly", "fix extraction" → `debug`

## Transversal rules

- One chunk per session for large PDFs (>50 pages).
- Intermediate results stored in `docs/extraction/<source-name>/`.
- NEVER invent content not present in the source PDF.
- Verify each extracted segment against the source before writing.
- Ask user validation before writing classified files.
- `progress.md` tracks which chunks are done and which remain.

## External data

- `bank.yml` at project root — `univers` and `document.name` fields.
- `docs/extraction/<source-name>/progress.md` — session tracking state.
