---
name: lore-extract
model: sonnet
description: Extracts and organizes universe lore from raw source files into structured thematic .docs/ files (terminologie, factions, histoire, géographie, personnages, and optional themes). Works from the current directory; reads bank.yml to resolve output paths. Use when processing PDF extracts, notes, or raw text into universe documentation ready for other writing skills. Do NOT use for web research — use `research` instead; do NOT use for PDF extraction — use `extract-pdf` first, then pipe output here.
---

# Lore Extract

Transforms raw source files into thematic `.docs/` files for a universe. Detects themes automatically, validates with the user, extracts and deduplicates across themes, synthesizes if files exceed 250 lines, and resolves contradictions interactively.

## Available actions

| #   | Action    | Role                                                         | Input                                       |
| --- | --------- | ------------------------------------------------------------ | ------------------------------------------- |
| 01  | `extract` | Validate sources → detect themes → extract → synthesize → write files | source file paths + options |

## Default flow

Single action: `01`. Validation checkpoints before extraction and before writing.

Trigger-to-action mapping:
- "lore-extract", "extract lore", "extract universe", "extraire le lore", "organiser les sources", "fichiers thématiques" → `extract`

## Transversal rules

- **Never overwrite existing .docs/ files without `--update` or `--force`** — warn and stop.
- Information lives in exactly ONE file; other files reference or summarize. Never duplicate a full entry.
- Theme priority order: terminologie > factions > personnages > histoire > géographie > optional themes.
- Max 250 lines per output file. If exceeded → auto-synthesize; if still exceeded → request human arbitration.
- All output in French. Universe-specific terms: keep original in parentheses on first mention.
- Ask for arbitration when contradictions are found — never silently discard either version.
