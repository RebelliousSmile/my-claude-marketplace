# 03 - Update

Merge a supplement or errata into an existing optimized rules file.

> `base-file` vit dans `<systeme-root>/canon/` (ou `<subsys-root>/canon/`). `supplement` vit dans `<systeme-root>/sources/<source>/` (ou `<subsys-root>/sources/<source>/`) si issu du pipeline `extract-pdf`.
> Voir `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md` pour la convention complète.

## Inputs

- `base-file` (required) — chemin vers le fichier de règles optimisé existant (doit déjà être au format rules-keeper) ; typiquement `<systeme-root>/canon/<fichier>.md` ou `<subsys-root>/canon/<fichier>.md`.
- `supplement` (required) — chemin vers le fichier de supplément ou d'errata à fusionner ; typiquement `<systeme-root>/sources/<source>/rules.md` si issu d'`extract-pdf`.

## Process

### Step 1 — Validate inputs

Read both files.

If `base-file` does not contain CHEATSHEET / FULL REFERENCE sections: stop.
Report: `"Base file must be in rules-keeper format. Run restructure first."`

If `supplement` is empty or contains no game mechanics: stop and report.

### Step 2 — Classify supplement content

For each rule in the supplement, classify as:
- **New mechanic** — not present in base
- **Modified mechanic** — changes an existing value or threshold
- **Extended mechanic** — adds options to an existing rule (new result tier, new modifier)

### Step 3 — Detect conflicts

Compare all numerical values, thresholds, and rule statements between supplement and base.

For each conflict:
```
CONFLIT DÉTECTÉ :
  Base  : "[rule/value from base]"
  Supplément : "[rule/value from supplement]"
  Sujet : [e.g. "seuil de réussite critique"]

Quelle version conserver ? (base / supplément / les deux)
```

Never resolve conflicts silently.

### Step 4 — Merge strategy

| Content type      | Action                                      |
|-------------------|---------------------------------------------|
| New mechanic      | Add to appropriate section(s)               |
| Modified, no conflict | Update value in place                  |
| Modified, conflict | Ask user (Step 3)                          |
| Extended mechanic | Append to existing entry                    |

Update sections:
- **CHEATSHEET** — only if core loop or resolution table changes
- **LEXICON** — add new terms from supplement
- **PATTERNS** — add new action types; update existing patterns if affected
- **ENTITY TEMPLATES** — update template files in `.templates/` if new fields needed
- **FULL REFERENCE** — merge by category, maintain existing organization

### Step 5 — Add CHANGELOG entry

```markdown
| YYYY-MM-DD | <supplement-filename> | Added [X], modified [Y] |
```

### Step 6 — Preview and confirm

Show a diff preview of changes across all sections. Ask: `"Apply merge? [Y/n]"`

On confirmation: write the updated base file and any updated template files.

## Test

After `rules-keeper --update <base> <supplement>`, verify that: (1) CHANGELOG has a new entry with today's date and the supplement filename, (2) new mechanics from the supplement appear in FULL REFERENCE, (3) any detected conflict was shown to the user before the merge was applied.
