# 04 - Local

Generate a `document-rules.md` for rules that are specific to one document (scenario, campaign, supplement) — as opposed to the base game system.

## Inputs

- `project-path` (required) — path to the project directory containing `bank.yml`
- `source` (optional) — source file to extract local rules from (defaults to `overview.md`)

## Outputs

- `<project-path>/.docs/document-rules.md`
- bank.yml updated to reference the new file under `docs.projet`

## Process

### Step 1 — Load context

Read `bank.yml` from `<project-path>`. Extract:
- `univers` — for cross-referencing system rules-files
- `rules-files` — paths to system rules already available

If no `rules-files` declared: warn that local rules won't be able to reference the system rules.

Read source file (argument or `overview.md`).

### Step 2 — Identify local rules

Extract only rules that are **specific to this document**:
- New mechanics introduced (abilities, items, conditions not in the system rules)
- Variant rules that override or modify system defaults
- Document-specific NPCs with unique capabilities
- Special items with mechanical effects

**Distinguish from system rules:**

| Type | Destination | Example |
|------|-------------|---------|
| System mechanic (generic) | `.rules-files/` — already handled | "2d6 roll" |
| Document-local mechanic | `.docs/document-rules.md` | "The Veil token: +1 on deception rolls" |

If a "local" rule is actually a general mechanic: flag it and suggest running `rules-keeper restructure` on the system file instead.

### Step 3 — Generate document-rules.md

```markdown
# Règles Spécifiques : [Document Name]

## Résumé

[Short list of mechanics added by this document]

## Mécaniques

### [Mechanic Name]

**Type :** [ability / item / condition / variant]
**Déclencheur :** [when it applies]
**Effet :** [mechanical effect]
**Durée :** [permanent / temporary / scene / session]

### [Mechanic Name]

...

## Objets Spéciaux

| Nom | Effet | Usages |
|-----|-------|--------|
| [item] | [effect] | [limit] |

## Interactions avec les Règles Système

- [System rule] + [local rule] = [how they combine]

---
**Document :** [project name]
**Règles système :** [reference to .rules-files/ path]
**Màj :** [date]
```

### Step 4 — Update bank.yml

Add `document-rules.md` path under `docs.projet` in bank.yml (if not already present).

### Step 5 — Report

```
document-rules.md généré : <project-path>/.docs/document-rules.md
[N] mécaniques locales documentées
bank.yml mis à jour.
```

## Test

After `rules-keeper --local <project>`, verify that `<project>/.docs/document-rules.md` exists, contains at least one mechanic section, and that `bank.yml` references it under `docs.projet`.
