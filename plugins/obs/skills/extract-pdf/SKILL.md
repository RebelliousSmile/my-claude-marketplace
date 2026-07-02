---
name: extract-pdf
description: Multi-session pipeline for extracting content from large PDF files and distributing it into reference source documents under sources/. Use when importing an existing PDF (rulebook, novel, source document) into a by-game domain (R) across multiple sessions. Do NOT use for web research — use `research` instead; do NOT use for writing new content — use `writing:write` instead. Do NOT use to produce final canon — run `ttrpg:lore-extract` (lore) and `ttrpg:rules-keeper` (rules) on the resulting sources/ files to ventilate into canon/.
disable-model-invocation: true
---

# Extract PDF

Four-phase pipeline for large PDF extraction across multiple Claude Code sessions.

> **Role in the canon pipeline**: `extract-pdf` produces **raw reference sources** under `sources/` (`<univers-root>/sources/<source>/` for lore, `<systeme-root>/sources/<source>/` for rules). It never ventilates into `canon/` or `mj/` directly — that is the role of `ttrpg:lore-extract` and `ttrpg:rules-keeper`.
> See `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md` for the full path convention.

## Two modes

| Mode | Trigger | Usage |
|------|---------|-------|
| **Manual** | `/extract-pdf <action>` | Session by session, full control |
| **Automated** | `python scripts/extract-pdf.py <project> <pdf>` | Complete orchestration, automatic restart |

In automated mode, the Python script handles session chaining, retries and the final commit. It calls the prompts in `docs/prompts/workshop/` — the `setup` skill checks for their presence and reports the missing files.

## Available actions

| #   | Action          | Role                                                    | Input                                         |
| --- | --------------- | ------------------------------------------------------- | --------------------------------------------- |
| 01  | `setup`         | Session 1 — validate, chunk the PDF, write progress.md  | `<project-dir>` + `<source-document>`        |
| 02  | `process-chunk` | Sessions 2-N — extract a chunk into classified/*.md     | `<project-dir>` + `<source-name>` + chunk id |
| 03  | `distribute`    | Final session — merge into the reference sources         | `<project-dir>` + `<source-name>`            |
| 04  | `debug`         | Any session — diagnose extraction anomalies              | `<project-dir>` + `<source-name>` [chunk-id] |

> `<project-dir>` = the writing project directory (`R/<AAAA>/<MM>/<projet>/`), or any directory located under an `R` domain. `R` is **discovered locally** by walking up to the folder containing `_campagnes/`, `_univers/` or `_pjs/`; no global path. See `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md`.

## Default flow

`01 → 02 (×N) → 03`. `04` on demand at any point.

Trigger-to-action mapping:
- "extract PDF", "start extraction", "import PDF" → `setup`
- "extract chunk", "process chunk", "next chunk" → `process-chunk`
- "distribute extraction", "merge extraction", "final session" → `distribute`
- "debug extraction", "extraction anomaly", "fix extraction" → `debug`

## Python scripts

Three scripts available in this skill's `scripts/` folder in the overlay (to deploy into the project's `scripts/`):

| Script | Role |
|--------|------|
| `extract-pdf.py` | Multi-session orchestrator (`--resume`, `--retry`, `--status`, `--distribute`, `--normalize`) |
| `split-pdf.py` | Physical splitting of the PDF into chunks (requires `pypdf`) |
| `normalize-text.py` | PDF encoding/ligature correction on the raw files |

```bash
# Full automated extraction
python scripts/extract-pdf.py <project-path> <source.pdf>

# Resume after interruption
python scripts/extract-pdf.py --resume docs/extraction/<source>/progress.md

# Status
python scripts/extract-pdf.py --status docs/extraction/<source>/progress.md
```

## Transversal rules

- **Call the skill from the writing project directory** (`R/<AAAA>/<MM>/<projet>/`). All relative working paths (`docs/`, `scripts/`) are resolved from this directory.
- `R` (the game domain root) is **discovered locally**: start from the reference directory (argument or CWD), walk up the parents to the first folder containing `_campagnes/`, `_univers/` or `_pjs/`. No global path, no per-machine config. See `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md`.
- The extracted reference sources land in `<univers-root>/sources/<source>/` (lore) and `<systeme-root>/sources/<source>/` (rules), with `<univers-root> = R/_univers/<univers>/` and `<systeme-root> = R/_systeme/` — never in `canon/` or `mj/`.
- **Preserve the raw text.** Every populated `sources/<source>/` ALSO contains `fulltext.md` — the document's full normalized text, assembled from the chunks. This is "the content of the extraction": it must never be destroyed during cleanup. The classified files (`lore.md`, `terminology.md`, `rules.md`…) are **reference bundles** placed alongside it, which serve as input to `ttrpg:lore-extract`/`ttrpg:rules-keeper` (which, in turn, produce `canon/`). Thus `sources/` = raw + input bundles; `canon/` = final synthesis produced downstream.
- **Companion documents.** A game line often ships related material in SEPARATE files (character booklets, MC screen, accessories, supplements). The detail (e.g. lists of names/appearances from the player booklets) is NOT in the core book. Treat each file as a **distinct source** (one `setup` per file, or per coherent batch), with its own `<source>`.
- One chunk per session for large PDFs (>50 pages).
- Working artifacts (PDF chunks, working folder) stored in `docs/extraction/<source-name>/`; only `fulltext.md` and the classified bundles survive in `sources/` after cleanup.
- NEVER invent content not present in the source PDF.
- Verify each extracted segment against the source before writing.
- Ask user validation before writing classified files.
- `progress.md` tracks which chunks are done and which remain.
- Valid statuses in `progress.md`: **`pending`** / **`done`** / **`failed`** (not `TODO`/`DONE`).

## References

- `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md` — local path convention of an `R` domain, resolution by domain marker, canon pipeline, the extract-pdf / ttrpg:lore-extract / ttrpg:rules-keeper boundary.

## External data

- `docs/extraction/<source-name>/progress.md` — session tracking state; also carries the `Univers` field (slug of the target universe) filled in at setup.
- `docs/prompts/workshop/extract.prompt.md` — setup Phase A (template in `prompts/`).
- `docs/prompts/workshop/extract-chunk.prompt.md` — extraction of a chunk (template in `prompts/`).
- `docs/prompts/workshop/extract-distribute.prompt.md` — distribution Phase C (template in `prompts/`).
- `docs/prompts/workshop/extract-debug.prompt.md` — diagnostic (template in `prompts/`).
