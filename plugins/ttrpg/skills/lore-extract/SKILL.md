---
name: lore-extract
model: sonnet
description: Extracts and organizes universe lore from raw source files into structured thematic files under canon/ and mj/ (terminologie, factions, histoire, géographie, personnages, and optional themes), separating canonical lore (canon/) from homemade/user-created content (mj/). Works from the current directory; resolves the game domain R locally (walks up to the _campagnes/, _univers/ or _pjs/ marker) to place outputs. Use when processing PDF extracts, notes, or raw text into universe documentation ready for other writing skills (and by ttrpg:campaign for JDR universes). Do NOT use for web research — use `obs:research` instead; do NOT use for PDF extraction — use `extract-pdf` first, then pipe output here.
---

# Lore Extract

Transforms raw source files into thematic `canon/` and `mj/` files for a universe. Detects themes automatically, validates with the user, extracts and deduplicates across themes, synthesizes if files exceed 250 lines, and resolves contradictions interactively.

## References

- `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md` — local convention of a game domain, resolution of `R`, canon pipeline, extract-pdf / lore-extract / rules-keeper boundary.

## Available actions

| #   | Action    | Role                                                         | Input                                       |
| --- | --------- | ------------------------------------------------------------ | ------------------------------------------- |
| 01  | `extract` | Validate sources → detect themes → extract → synthesize → write files | source file paths + options |

## Default flow

Single action: `01`. Validation checkpoints before extraction and before writing.

Trigger-to-action mapping:
- "lore-extract", "extract lore", "extract universe", "extraire le lore", "organiser les sources", "fichiers thématiques" → `extract`

## Transversal rules

- **Never overwrite existing `canon/` or `mj/` files without `--update` or `--force`** — warn and stop.
- Information lives in exactly ONE file; other files reference or summarize. Never duplicate a full entry.
- Theme priority order: terminologie > factions > personnages > histoire > géographie > optional themes.
- Max 250 lines per output file. If exceeded → auto-synthesize; if still exceeded → request human arbitration.
- All output in French. Universe-specific terms: keep original in parentheses on first mention.
- Ask for arbitration when contradictions are found — never silently discard either version.
- **Canon vs homemade** : the universe lore tree is split by provenance into two identical thematic subtrees — `canon/` (**official** lore, extracted from canonical sources) and `mj/` (**homemade / non-canon** content, created by the author or the game master). Route each extraction to the right subtree: canonical sources → `canon/` (default); homemade sources/notes → `mj/` (option `--homemade`). **Never** mix the two in the same file; homemade content must not silently contradict canon — report any divergence (canon is authoritative).
- **Shared tree** : these `canon/` + `mj/` subtrees (same file names, "one info in a single file" rule) are **shared with `ttrpg:campaign`** for JDR universes. A universe lives in `<univers-root>` = `R/_univers/<univers>/` within the self-contained game domain `R` (discovered locally — see `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md`). `ttrpg:campaign` writes GM content into the same `mj/`. Keep the structure for interoperability.
- **Regenerable sources** — A universe's `sources/` (`<univers-root>/sources/`, this skill's raw inputs) are **large and regenerable** from the official PDFs; if `R` is versioned, it is the natural candidate to gitignore. The `canon/` + `mj/` output, by contrast, is durable authoritative content — consumers (`write`, `review`, `ttrpg:campaign`) stay operational without a re-run. To **regenerate or enrich** the lore without the `sources/`, first re-extract via `extract-pdf` (commercial PDF required), then re-run `lore-extract`.
