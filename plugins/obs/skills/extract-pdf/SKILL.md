---
name: extract-pdf
description: Multi-session pipeline for extracting content from large PDF files and distributing it into raw reference source documents under sources/. Use when importing an existing PDF (rulebook, novel, technical manual, source document) into a domain (R) across multiple sessions. Operates on the generic domain-layout convention; applies the JDR profile (lore/rules split, canon pipeline) only when the domain is JDR. Do NOT use for web research — use `research` instead; do NOT use for writing new content — use `writing:write` instead. Do NOT use to produce final synthesized reference (`reference/` generically, `canon/` under the JDR profile) — that is the role of the downstream ventilation skills (`ttrpg:lore-extract` / `ttrpg:rules-keeper` under the JDR profile).
disable-model-invocation: true
---

# Extract PDF

Four-phase pipeline for large PDF extraction across multiple Claude Code sessions.

> **Generic model, conditional profile.** `extract-pdf` operates on the **generic** working-directory convention `${CLAUDE_PLUGIN_ROOT}/references/domain-layout.md` (`R` = subcategory, working-dir buckets `R/_<bucket>/`, `bank.yml`, raw `sources/` + synthesized `reference/`, scopes `shared`/`project`). A **JDR game domain is one profile** of that model: the JDR profile (`${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md`) is applied **only when the domain is JDR** (see *Profile detection* below).

> **Role in the pipeline**: `extract-pdf` produces **raw reference sources** under `<target>/sources/<source>/`. It **never** ventilates into the synthesized layer — `reference/` generically, or `canon/`/`mj/` under the JDR profile. Ventilation is a downstream role (under the JDR profile: `ttrpg:lore-extract` for lore, `ttrpg:rules-keeper` for rules).

## Profile detection

Resolve `R`, then decide which layout applies **before** writing anything:

1. **JDR profile** — apply if `R/bank.yml` declares `profile: jdr`, **or** (zero-config fallback) `R` contains the signature buckets `_univers/` or `_systeme/`. Under this profile: raw sources split by provenance (lore → `_univers/<u>/sources/`, rules → `_systeme/sources/`); ventilation goes to `canon/`/`mj/` via `ttrpg:lore-extract` / `ttrpg:rules-keeper`; the `Univers` field names the target universe; the marker shortcut (`_campagnes/`/`_univers/`/`_pjs/`) is used to locate `R`.
2. **Generic core** — otherwise. Raw sources land under a **single resolved target** `<target>/sources/<source>/` (`<target>` = a working-dir bucket `R/_<bucket>/` or the work-unit/project directory); ventilation (downstream, out of scope here) goes to `<bucket>/reference/`. The `Univers` field holds the **target bucket/scope** slug.

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

> `<project-dir>` = the work-unit / writing project directory (`R/<AAAA>/<MM>/<projet>/`), or any directory located under an `R` domain. `R` is **discovered locally** (see *Transversal rules*); no global path. See `${CLAUDE_PLUGIN_ROOT}/references/domain-layout.md`.

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

- **Call the skill from the work-unit directory** (`R/<AAAA>/<MM>/<projet>/`). All relative working paths (`docs/`, `scripts/`) are resolved from this directory.
- `R` (the domain root = a **subcategory** `(Perso|Pro)/<Category>/<Subcategory>/`) is **discovered locally**, never hardcoded:
  - **Generic core**: start from the reference directory (argument or CWD) and walk up to a `Perso`/`Pro` segment; the **subcategory** level is `R` (the `obs:tree` anchor mechanism). No domain marker required.
  - **JDR profile shortcut**: walk up the parents to the first folder containing one of the markers `_campagnes/`, `_univers/` or `_pjs/`; that folder is `R`. This is the JDR profile's fast path.
  No global path, no per-machine config. See `${CLAUDE_PLUGIN_ROOT}/references/domain-layout.md` (and `references/jdr-layout.md` for the JDR profile).
- The extracted reference sources land under **`<target>/sources/<source>/`** — never in the synthesized layer (`reference/` generically; `canon/`/`mj/` under the JDR profile):
  - **Generic core**: a single resolved `<target>` (a working-dir bucket `R/_<bucket>/` or the work-unit directory) → `<target>/sources/<source>/`.
  - **JDR profile**: split by provenance — lore/terminology → `<univers-root>/sources/<source>/` (`<univers-root> = R/_univers/<univers>/`), rules → `<systeme-root>/sources/<source>/` (`<systeme-root> = R/_systeme/`).
- **Preserve the raw text.** Every populated `sources/<source>/` ALSO contains `fulltext.md` — the document's full normalized text, assembled from the chunks. This is "the content of the extraction": it must never be destroyed during cleanup. The classified files (`lore.md`, `terminology.md`, `rules.md`…) are **reference bundles** placed alongside it, which serve as input to the downstream ventilation (under the JDR profile: `ttrpg:lore-extract`/`ttrpg:rules-keeper`, which in turn produce `canon/`). Thus `sources/` = raw + input bundles; the synthesized layer (`reference/` generically, `canon/` under JDR) is produced downstream.
- **Companion documents.** A source line often ships related material in SEPARATE files (character booklets, MC screen, accessories, supplements, appendices). The detail (e.g. lists of names/appearances from the player booklets) is NOT in the core book. Treat each file as a **distinct source** (one `setup` per file, or per coherent batch), with its own `<source>`.
- One chunk per session for large PDFs (>50 pages).
- Working artifacts (PDF chunks, working folder) stored in `docs/extraction/<source-name>/`; only `fulltext.md` and the classified bundles survive in `sources/` after cleanup.
- NEVER invent content not present in the source PDF.
- Verify each extracted segment against the source before writing.
- Ask user validation before writing classified files.
- `progress.md` tracks which chunks are done and which remain.
- Valid statuses in `progress.md`: **`pending`** / **`done`** / **`failed`** (not `TODO`/`DONE`).

## References

- `${CLAUDE_PLUGIN_ROOT}/references/domain-layout.md` — **primary** generic convention of an `R` domain: `R` = subcategory (discovered via the `obs:tree` anchor), working-dir buckets `R/_<bucket>/`, `bank.yml`, raw `sources/` + synthesized `reference/`, scopes `shared`/`project`, profile detection.
- `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md` — the **JDR profile** applied when the domain is JDR: bucket names `_univers`/`_systeme`, `canon/`+`mj/` provenance split, marker-based `R` shortcut, the `extract-pdf` / `ttrpg:lore-extract` / `ttrpg:rules-keeper` canon pipeline.

## External data

- `docs/extraction/<source-name>/progress.md` — session tracking state; also carries the `Univers` field, filled in at setup. Under the JDR profile it is the slug of the target universe; in the generic core it is the target **bucket/scope** slug.
- `docs/prompts/workshop/extract.prompt.md` — setup Phase A (template in `prompts/`).
- `docs/prompts/workshop/extract-chunk.prompt.md` — extraction of a chunk (template in `prompts/`).
- `docs/prompts/workshop/extract-distribute.prompt.md` — distribution Phase C (template in `prompts/`).
- `docs/prompts/workshop/extract-debug.prompt.md` — diagnostic (template in `prompts/`).
