# bank.yml — Schema and Field Reference

`bank.yml` is the canonical configuration file for a writing project. It declares all resources consumed by the workshop pipeline (forge, toc, write, review, tone-finder, persona, research, extract-pdf).

Location: `<projet-root>/bank.yml` — i.e. `<jeu>/ecrits/<projet>/bank.yml`. Les chemins ci-dessous sont relatifs à la **racine du jeu** `<jeu>/`.
Les ressources d'univers vivent sous `<univers-root>` = `<jeu>/univers/<univers>/`, le système du jeu sous `<systeme-root>` = `<jeu>/systeme/{canon,mj}/`, les sous-systèmes sous `<subsys-root>` = `<jeu>/subsystems/<nom>/{canon,mj}/`.

> See also: `setup/references/vault-layout.md` — single source of truth for all path variables.

---

## Full schema with annotations

```yaml
document:
  name: "Project title"          # Required. Display name of the document.
  univers: "univers-slug"        # Required. Must match the parent directory name.
  type: "scenario"               # Required. One of: novel | roleplaying | scenario | guide
                                 # Drives output-style selection and brainstorm/plan behavior.

# Output style files — writing conventions per universe + type.
# Convention: <univers>-<type>.md
# At least one key is required.
output-style:
  scenario: "univers/<univers>/.output-styles/<univers>-scenario.md"
  novel:    "univers/<univers>/.output-styles/<univers>-novel.md"
  roleplaying: "univers/<univers>/.output-styles/<univers>-roleplaying.md"
  guide:    "univers/<univers>/.output-styles/<univers>-guide.md"
  projet:   ".output-styles/<projet>.md"    # Optional project-level override.

# Universe and project documentation files.
# Paths relative to <jeu>/
docs:
  # --- Universe docs (canon tier — official lore from lore-extract/research) ---
  univers:      "univers/<univers>/canon/UNIVERS.md"       # Required. Universe overview.
  terminologie: "univers/<univers>/canon/terminologie.md"  # Required. Canonical vocabulary.
  # Additional named canon keys are allowed:
  # factions:   "univers/<univers>/canon/factions.md"
  # personnages: "univers/<univers>/canon/personnages.md"
  # histoire:   "univers/<univers>/canon/histoire.md"

  # --- Universe docs (mj tier — homemade/house content) ---
  # mj-notes:  "univers/<univers>/mj/<file>.md"
  # mj-npc:    "univers/<univers>/mj/pnj.md"

  # --- Project-specific docs ---
  projet:                                           # Optional. Project-specific docs.
    - ".docs/<file1>.md"
    - ".docs/<file2>.md"
    # MJ project files (house content for this project) may also be listed here:
    # - ".docs/mj/<file>.md"

# Reader personas — YAML files with scoring criteria and weights.
# Consumed by: review comment
# Resolution waterfall (first match wins):
#   1. projet   → <projet-root>/.templates/personas/<id>.yml
#   2. univers  → <univers-root>/.templates/personas/<id>.yml
#   3. shared   → <vault>/_shared/personas/<id>.yml
personas:
  projet:           # Project-specific personas.
    - ".templates/personas/<id>.yml"
  univers:          # Universe-level personas (shared across projects in this universe).
    - "univers/<univers>/.templates/personas/<id>.yml"
  shared:           # Agnostic personas shared across all games.
    - "_shared/personas/<id>.yml"   # resolved as <vault>/_shared/personas/<id>.yml

# Canonical project overview — source of truth for forge and toc.
overview: "overview.md"

# Table of contents configuration.
toc:
  fichier: ".toc/INDEX.md"  # Required. Main TOC index file.
  # Individual chapter entries are linked from INDEX.md as .toc/toc-chapter<NN>.md

# Game rules files — consumed by write (roleplaying) and extract-pdf.
# Optional. Only relevant for scenario / roleplaying types.
# Paths relative to <jeu>/
rules-files:
  systeme: "systeme/canon/<system>.md"         # Core game-system rules (canonical tier — rules-keeper output).
  regles-specifiques:                           # Additional game-system rules references.
    - "systeme/canon/<supplement>.md"           # More canonical rules.
  # MJ/house rules may also be listed:
  # mj-rules: "systeme/mj/<file>.md"
# NOTE: only the game system (systeme/) belongs here. Generic subsystems (subsystems/) are
# live-play tools consumed by obsidian:solo-mc only — never referenced in a writing bank.yml.

# ICML export configuration (InDesign pipeline).
icml:
  chapitres-source: "chapitres/"            # Source directory for chapter files.
  chapitres-order: []                       # Ordered list of chapter filenames (optional).
  output: "output/<projet>.icml"           # ICML output path.

# Project metadata.
metadata:
  auteur: ""                    # Author name(s).
  date-creation: "YYYY-MM-DD"  # ISO date.
  version: "0.1"               # Semver-like version string.
  statut: "draft"              # One of: draft | wip | review | final | published
```

---

## Required vs. optional fields

| Field | Required | Notes |
|-------|----------|-------|
| `document.name` | ✅ | Non-empty string |
| `document.univers` | ✅ | Must match directory |
| `document.type` | ✅ | novel / roleplaying / scenario / guide |
| `output-style` (≥1 key) | ✅ | File must exist on disk |
| `docs.univers` | ✅ | Points to `canon/UNIVERS.md` |
| `docs.terminologie` | ✅ | Points to `canon/terminologie.md` |
| `overview` | ✅ | |
| `toc.fichier` | ✅ | May not exist yet on disk |
| `personas` | Recommended | Required for `review comment` |
| `rules-files` | Optional | Only for scenario/roleplaying |
| `icml` | Optional | Only for InDesign pipeline |
| `metadata` | Recommended | |

---

## Audit checks (used by `setup audit`)

For each file path declared in `bank.yml`:
- **`[OK]`** — file exists and is non-empty
- **`[MISSING]`** — file declared but not found on disk
- **`[EMPTY]`** — file exists but has zero content

For persona files: additionally check that `criteria` weights sum to 1.0.

For `output-style` files: additionally check that each has at least a `## Philosophie d'écriture` section.

For `docs.univers` and `docs.terminologie`: confirm path is inside `canon/` (warn if pointing elsewhere).

---

## Consumed by

| Skill | Fields read |
|-------|------------|
| `forge` | `overview`, `docs`, `output-style`, `document.type` |
| `toc generate-toc` | `overview`, `docs`, `toc`, `document.type`, `output-style` |
| `toc write-toc-chapter` | `toc.fichier`, `docs`, `output-style` |
| `write` | All fields |
| `review comment` | `personas`, `output-style`, `docs` |
| `review doctor` | `output-style`, `docs.terminologie`, `rules-files` |
| `tone-finder` | `output-style`, `docs`, `document.type` |
| `persona generate` | `document.type`, `docs`, `personas` |
| `research` | `docs`, `document.type` |
| `extract-pdf` | `document.name`, `docs` |
| `tabula-rasa reset` | `overview`, `toc.fichier` |
