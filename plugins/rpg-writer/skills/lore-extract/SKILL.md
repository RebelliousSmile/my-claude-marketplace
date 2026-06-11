---
name: lore-extract
model: sonnet
description: Extracts and organizes universe lore from raw source files into structured thematic files under canon/ and mj/ (terminologie, factions, histoire, géographie, personnages, and optional themes), separating canonical lore (canon/) from homemade/user-created content (mj/). Works from the current directory; reads bank.yml to resolve output paths. Use when processing PDF extracts, notes, or raw text into universe documentation ready for other writing skills (and by obsidian:rpg for JDR universes). Do NOT use for web research — use `research` instead; do NOT use for PDF extraction — use `extract-pdf` first, then pipe output here.
---

# Lore Extract

Transforms raw source files into thematic `canon/` and `mj/` files for a universe. Detects themes automatically, validates with the user, extracts and deduplicates across themes, synthesizes if files exceed 250 lines, and resolves contradictions interactively.

## References

- `@setup/references/vault-layout.md` — convention des chemins par jeu, pipeline canon, frontière extract-pdf / lore-extract / rules-keeper.

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
- **Arborescence partagée** : ces sous-arbres `canon/` + `mj/` (mêmes noms de fichiers, règle « une info dans un seul fichier ») sont **partagés avec `obsidian:rpg`** pour les univers de JDR. Le coffre JDR est rangé **par jeu** : un univers vit dans `<vault>/<jeu>/_univers/<univers>/` (`<jeu>` = premier segment sous la racine du coffre, déduit du répertoire courant ou du `bank.yml`). `rpg` écrit le contenu MJ dans le même `mj/`. Conserver la structure pour l'interopérabilité.
- **Setup après clone (`tnn-jdr`)** — Les `sources/` d'univers (`<univers-root>/sources/`, entrées brutes de ce skill) sont **gitignored** : absentes après un clone sur une nouvelle machine. La sortie `canon/` + `mj/` est, elle, **versionnée** et survit au clone — les consommateurs (`write`, `review`, `obsidian:rpg`) restent opérationnels sans re-run. Pour **régénérer ou enrichir** le lore après un clone, re-extraire d'abord les `sources/` via `extract-pdf` (PDF commercial requis), puis relancer `lore-extract`.
