# bank.yml — Schema and Field Reference

`bank.yml` is the canonical configuration file for a writing project. It declares all resources consumed by the workshop pipeline (brainstorm, plan, write, review, tone-finder, persona, research, extract-pdf).

Location: `<univers>/<projet>/bank.yml`

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
  scenario: "<univers>/.output-styles/<univers>-scenario.md"
  novel:    "<univers>/.output-styles/<univers>-novel.md"
  roleplaying: "<univers>/.output-styles/<univers>-roleplaying.md"
  guide:    "<univers>/.output-styles/<univers>-guide.md"
  projet:   ".output-styles/<projet>.md"    # Optional project-level override.

# Universe and project documentation files.
docs:
  univers:      "<univers>/.docs/UNIVERS.md"       # Required. Universe overview.
  terminologie: "<univers>/.docs/terminologie.md"  # Required. Canonical vocabulary.
  projet:                                           # Optional. Project-specific docs.
    - ".docs/<file1>.md"
    - ".docs/<file2>.md"
  # Additional named keys are allowed for any project doc:
  # lieux:      ".docs/lieux.md"
  # factions:   ".docs/factions.md"

# Reader personas — YAML files with scoring criteria and weights.
# Consumed by: review comment
personas:
  global:           # Optional. Reusable personas from the shared templates folder.
    - "docs/templates/personas/<id>.yml"
  univers:          # Universe-level personas (shared across projects in this universe).
    - "<univers>/.templates/personas/<id>.yml"
  projet:           # Project-specific personas.
    - ".templates/personas/<id>.yml"

# Canonical project overview — source of truth for brainstorm and plan.
overview: "overview.md"

# Table of contents configuration.
toc:
  fichier: ".toc/INDEX.md"  # Required. Main TOC index file.
  # Individual chapter entries are linked from INDEX.md as .toc/toc-chapter<NN>.md

# Game rules files — consumed by write (roleplaying) and extract-pdf.
# Optional. Only relevant for scenario / roleplaying types.
rules-files:
  systeme: "docs/rules-files/<system>.md"   # Core rules file.
  regles-specifiques:                        # Additional rules references.
    - "docs/rules-files/<supplement>.md"
  # Also read universe-level rules:
  # <univers>/.rules-files/<file>.md

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
| `docs.univers` | ✅ | |
| `docs.terminologie` | ✅ | |
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

---

## Consumed by

| Skill | Fields read |
|-------|------------|
| `brainstorm` | `overview`, `docs`, `output-style`, `document.type` |
| `plan generate-toc` | `overview`, `docs`, `toc`, `document.type`, `output-style` |
| `plan write-toc-chapter` | `toc.fichier`, `docs`, `output-style` |
| `write` | All fields |
| `review comment` | `personas`, `output-style`, `docs` |
| `review doctor` | `output-style`, `docs.terminologie`, `rules-files` |
| `tone-finder` | `output-style`, `docs`, `document.type` |
| `persona generate` | `document.type`, `docs`, `personas` |
| `research` | `docs`, `document.type` |
| `extract-pdf` | `document.name`, `docs` |
| `tabula-rasa reset` | `overview`, `toc.fichier` |
