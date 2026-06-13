# 04 - Local

Generate a `document-rules.md` for rules that are specific to one document (scenario, campaign, supplement) — as opposed to the base game system.

> Local rules live in `<projet-root>/.docs/document-rules.md`. References to the game system point to `<systeme-root>/canon/` (or `<subsys-root>/canon/`). All paths are relative to `R`, discovered locally.
> See `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md` for the full convention.

## Inputs

- `project-path` (required) — path to the writing project directory; expected format `R/<AAAA>/<MM>/<projet>/`. Maps to `<projet-root>`. `R` is discovered by walking up to one of the markers `_campagnes/`, `_univers/` or `_pjs/`.
- `source` (optional) — source file to extract the local rules from (default `overview.md`)

## Outputs

- `<projet-root>/.docs/document-rules.md`

## Process

### Step 1 — Load context

Discover `R` locally: start from `<project-path>` (or the CWD), walk up the parents to the first folder containing one of the markers `_campagnes/`, `_univers/` or `_pjs/`; that folder is `R`. If no marker is found: the target is not inside an initialized RPG domain — report it and stop.

Resolve paths relative to `R`:
- `<systeme-root>` = `R/_systeme/` (canon/ + mj/)
- `<subsys-root>` = `R/_subsystems/<nom>/`

Locate the system rules files by a **local scan** of `<systeme-root>/canon/` (= `R/_systeme/canon/`) (and `<subsys-root>/canon/` for the relevant subsystems). These are the files to load for cross-referencing in Step 3 ("Interactions avec les Règles Système").

> The `R/bank.yml` manifest may give hints (universe slug, file list) but is **not** the source of truth for resolution: always scan the filesystem relative to `R`.

If `R/_systeme/canon/` is empty: warn that local rules won't be able to reference the system rules (run `restructure-all` first to generate the canon).

If system canon files are found: load their content now — required for cross-referencing in Step 3.

Read source file (argument or `overview.md`).

### Step 2 — Identify local rules

Extract only rules that are **specific to this document**:
- New mechanics introduced (abilities, items, conditions not in the system rules)
- Variant rules that override or modify system defaults
- Document-specific NPCs with unique capabilities
- Special items with mechanical effects

**Classify each candidate rule using this decision table:**

| Test | → Local (`document-rules.md`) | → System (already in `<systeme-root>/canon/`) |
|------|-------------------------------|---------------------------------------|
| Applies only in this document? | ✓ | ✗ |
| References a named entity specific to this document? | ✓ | ✗ |
| Would change how the base system works if exported to another project? | ✗ | ✓ |
| Could appear verbatim in any other project using the same system? | ✗ | ✓ |

**Examples:**

| Mechanic | Classification | Reason |
|----------|----------------|--------|
| "La Coche de lien de Toravel donne accès à Pelive" | Local | References a document-specific NPC and merveille |
| "Un jet de Sang difficile se coche en astral" | System | General astral stress rule, applies in any Nadir game → belongs in `R/_systeme/canon/` |
| "En acte I, le Seuil force un Contrecoup supplémentaire" | Local | Specific to this campaign's act structure |
| "2d6 + compétence vs difficulté" | System | Core resolution — already in `<systeme-root>/canon/` |

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

- [System rule from `<systeme-root>/canon/<fichier>.md`] + [local rule] = [how they combine]

---
**Document :** [project name]
**Règles système :** [reference to `R/_systeme/canon/<fichier>.md` or `R/_subsystems/<nom>/canon/<fichier>.md`]
**Màj :** [date]
```

### Step 4 — Report

```
document-rules.md généré : <projet-root>/.docs/document-rules.md
[N] mécaniques locales documentées
```

> The `R/bank.yml` manifest (tree cache) is maintained by `obs:tree`, not by `rules-keeper`: no write to `bank.yml` here.

## Test

After `rules-keeper --local <project>`, verify that `<projet-root>/.docs/document-rules.md` exists, contains at least one mechanic section, and that any system rule reference points to `R/_systeme/canon/<fichier>.md` (not to a flat unprefixed path).
