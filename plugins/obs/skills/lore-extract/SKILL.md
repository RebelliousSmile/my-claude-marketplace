---
name: lore-extract
model: sonnet
description: Extracts and organizes universe lore from raw source files into structured thematic files under canon/ and mj/ (terminologie, factions, histoire, géographie, personnages, and optional themes), separating canonical lore (canon/) from homemade/user-created content (mj/). Works from the current directory; resolves the game domain R locally (walks up to the _campagnes/, _univers/ or _pjs/ marker) to place outputs. Use when processing PDF extracts, notes, or raw text into universe documentation ready for other writing skills (and by obs:rpg for JDR universes). Do NOT use for web research — use `writing:research` instead; do NOT use for PDF extraction — use `extract-pdf` first, then pipe output here.
---

# Lore Extract

Transforms raw source files into thematic `canon/` and `mj/` files for a universe. Detects themes automatically, validates with the user, extracts and deduplicates across themes, synthesizes if files exceed 250 lines, and resolves contradictions interactively.

## References

- `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md` — convention locale d'un domaine de jeu, résolution de `R`, pipeline canon, frontière extract-pdf / lore-extract / rules-keeper.

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
- **Canon vs maison (homemade)** : l'arborescence du lore d'univers est scindée par provenance en deux sous-arbres thématiques identiques — `canon/` (lore **officiel**, extrait de sources canoniques) et `mj/` (contenu **maison / non-canon**, créé par l'auteur ou le maître de jeu). Router chaque extraction vers le bon sous-arbre : sources canoniques → `canon/` (défaut) ; sources/notes maison → `mj/` (option `--homemade`). Ne **jamais** mélanger les deux dans un même fichier ; le contenu maison ne doit pas contredire le canon en silence — signaler toute divergence (le canon fait autorité).
- **Arborescence partagée** : ces sous-arbres `canon/` + `mj/` (mêmes noms de fichiers, règle « une info dans un seul fichier ») sont **partagés avec `obs:rpg`** pour les univers de JDR. Un univers vit dans `<univers-root>` = `R/_univers/<univers>/` au sein du domaine de jeu autonome `R` (découvert localement — voir `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md`). `rpg` écrit le contenu MJ dans le même `mj/`. Conserver la structure pour l'interopérabilité.
- **Sources régénérables** — Les `sources/` d'univers (`<univers-root>/sources/`, entrées brutes de ce skill) sont **volumineuses et régénérables** depuis les PDF officiels ; si `R` est versionné, c'est le candidat naturel à gitignorer. La sortie `canon/` + `mj/` est, elle, du contenu durable qui fait foi — les consommateurs (`write`, `review`, `obs:rpg`) restent opérationnels sans re-run. Pour **régénérer ou enrichir** le lore sans les `sources/`, re-extraire d'abord via `extract-pdf` (PDF commercial requis), puis relancer `lore-extract`.
