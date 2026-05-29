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

If `rules-files` paths are present in bank.yml: load their content now — required for cross-referencing in Step 3 ("Interactions avec les Règles Système").

Read source file (argument or `overview.md`).

### Step 2 — Identify local rules

Extract only rules that are **specific to this document**:
- New mechanics introduced (abilities, items, conditions not in the system rules)
- Variant rules that override or modify system defaults
- Document-specific NPCs with unique capabilities
- Special items with mechanical effects

**Classify each candidate rule using this decision table:**

| Test | → Local (`document-rules.md`) | → System (already in `rules-files/`) |
|------|-------------------------------|---------------------------------------|
| Applies only in this document? | ✓ | ✗ |
| References a named entity specific to this document? | ✓ | ✗ |
| Would change how the base system works if exported to another project? | ✗ | ✓ |
| Could appear verbatim in any other project using the same system? | ✗ | ✓ |

**Examples:**

| Mechanic | Classification | Reason |
|----------|----------------|--------|
| "La Coche de lien de Toravel donne accès à Pelive" | Local | References a document-specific NPC and merveille |
| "Un jet de Sang difficile se coche en astral" | System | General astral stress rule, applies in any Nadir game |
| "En acte I, le Seuil force un Contrecoup supplémentaire" | Local | Specific to this campaign's act structure |
| "2d6 + compétence vs difficulté" | System | Core resolution — already in rules-files |

If a candidate is ambiguous: present it to the user with the two options rather than deciding unilaterally.

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
