---
name: extract-pdf
description: Multi-session pipeline for extracting content from large PDF files and distributing it into reference source documents under sources/. Use when importing an existing PDF (rulebook, novel, source document) into the by-game vault structure across multiple sessions. Do NOT use for web research — use `research` instead; do NOT use for writing new content — use `write` instead. Do NOT use to produce final canon — run `lore-extract` (lore) and `rules-keeper` (rules) on the resulting sources/ files to ventilate into canon/.
disable-model-invocation: true
---

# Extract PDF

Four-phase pipeline for large PDF extraction across multiple Claude Code sessions.

> **Rôle dans le pipeline canon** : `extract-pdf` produit des **sources de référence brutes** sous `sources/` (`<univers-root>/sources/<source>/` pour le lore, `<systeme-root>/sources/<source>/` pour les règles). Il ne ventile jamais vers `canon/` ni `mj/` directement — c'est le rôle de `lore-extract` et `rules-keeper`.
> Voir `@setup/references/vault-layout.md` pour la convention complète des chemins.

## Two modes

| Mode | Déclencheur | Usage |
|------|-------------|-------|
| **Manuel** | `/extract-pdf <action>` | Session par session, contrôle total |
| **Automatisé** | `python scripts/extract-pdf.py <project> <pdf>` | Orchestration complète, relance automatique |

En mode automatisé, le script Python gère l'enchaînement des sessions, les retries et le commit final. Il appelle les prompts dans `docs/prompts/workshop/` — le skill `setup` vérifie leur présence et indique les fichiers manquants.

## Available actions

| #   | Action          | Role                                                    | Input                                         |
| --- | --------------- | ------------------------------------------------------- | --------------------------------------------- |
| 01  | `setup`         | Session 1 — valider, chunker le PDF, écrire progress.md | `<project-path>` + `<source-document>`        |
| 02  | `process-chunk` | Sessions 2-N — extraire un chunk dans classified/*.md   | `<project-path>` + `<source-name>` + chunk id |
| 03  | `distribute`    | Session finale — fusionner dans les docs univers        | `<project-path>` + `<source-name>`            |
| 04  | `debug`         | Toute session — diagnostiquer les anomalies d'extraction | `<project-path>` + `<source-name>` [chunk-id] |

## Default flow

`01 → 02 (×N) → 03`. `04` on demand at any point.

Trigger-to-action mapping:
- "extract PDF", "start extraction", "import PDF" → `setup`
- "extract chunk", "process chunk", "next chunk" → `process-chunk`
- "distribute extraction", "merge extraction", "final session" → `distribute`
- "debug extraction", "extraction anomaly", "fix extraction" → `debug`

## Scripts Python

Trois scripts disponibles dans le dossier `scripts/` de ce skill dans l'overlay (à déployer dans `scripts/` du projet) :

| Script | Rôle |
|--------|------|
| `extract-pdf.py` | Orchestrateur multi-session (`--resume`, `--retry`, `--status`, `--distribute`, `--normalize`) |
| `split-pdf.py` | Découpe physique du PDF en chunks (requiert `pypdf`) |
| `normalize-text.py` | Correction encodage/ligatures PDF sur les fichiers bruts |

```bash
# Extraction complète automatisée
python scripts/extract-pdf.py <project-path> <source.pdf>

# Reprendre après interruption
python scripts/extract-pdf.py --resume docs/extraction/<source>/progress.md

# Statut
python scripts/extract-pdf.py --status docs/extraction/<source>/progress.md
```

## Transversal rules

- **Appeler le skill depuis le répertoire du projet** (`<jeu>/ecrits/<projet>/`). Tous les chemins relatifs (`docs/`, `scripts/`, `bank.yml`) sont résolus depuis ce répertoire.
- `<jeu>` = premier segment sous `<vault>` (`C:/Users/fxgui/Public/Notes/Perso/JDR/`) ; déduit du CWD ou de `bank.yml`.
- Les sources de référence extraites atterrissent dans `<univers-root>/sources/<source>/` (lore) et `<systeme-root>/sources/<source>/` (règles) — jamais dans `canon/`.
- One chunk per session for large PDFs (>50 pages).
- Intermediate results stored in `docs/extraction/<source-name>/`.
- NEVER invent content not present in the source PDF.
- Verify each extracted segment against the source before writing.
- Ask user validation before writing classified files.
- `progress.md` tracks which chunks are done and which remain.
- Statuts valides dans `progress.md` : **`pending`** / **`done`** / **`failed`** (pas `TODO`/`DONE`).

## References

- `@setup/references/vault-layout.md` — convention des chemins par jeu, pipeline canon, frontière extract-pdf / lore-extract / rules-keeper.

## External data

- `bank.yml` at project root — `document.univers` and `document.name` fields.
- `docs/extraction/<source-name>/progress.md` — session tracking state.
- `docs/prompts/workshop/extract.prompt.md` — setup Phase A (template dans `prompts/`).
- `docs/prompts/workshop/extract-chunk.prompt.md` — extraction d'un chunk (template dans `prompts/`).
- `docs/prompts/workshop/extract-distribute.prompt.md` — distribution Phase C (template dans `prompts/`).
- `docs/prompts/workshop/extract-debug.prompt.md` — diagnostic (template dans `prompts/`).
