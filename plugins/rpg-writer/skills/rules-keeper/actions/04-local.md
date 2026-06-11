# 04 - Local

Generate a `document-rules.md` for rules that are specific to one document (scenario, campaign, supplement) — as opposed to the base game system.

> Les règles locales vivent dans `<projet-root>/.docs/document-rules.md`. Les références au système de jeu pointent vers `<systeme-root>/canon/` (ou `<subsys-root>/canon/`). Tous les chemins sont résolus via les variables de chemin par jeu.
> Voir `@setup/references/vault-layout.md` pour la convention complète.

## Inputs

- `project-path` (required) — chemin vers le répertoire du projet contenant `bank.yml` ; format attendu `<jeu>/_ecrits/<projet>` (résolu depuis `<vault>/`). Correspond à `<projet-root>`.
- `source` (optional) — fichier source depuis lequel extraire les règles locales (par défaut `overview.md`)

## Outputs

- `<projet-root>/.docs/document-rules.md`
- bank.yml mis à jour pour référencer le nouveau fichier sous `docs.projet`

## Process

### Step 1 — Load context

Read `bank.yml` from `<project-path>`. Extract:
- `document.univers` → slug univers
- `rules-files` → chemins vers les fichiers de règles système déjà disponibles

Résoudre les chemins par jeu :
- `<jeu>` = premier segment sous `<vault>` (`C:/Users/fxgui/Public/Notes/Perso/RPG/`), déduit du `project-path` ou du CWD
- `<systeme-root>` = `<jeu>/_systeme/` (canon/ + mj/)
- `<subsys-root>` = `<jeu>/_subsystems/<nom>/` (repli : `<vault>/_subsystems/<nom>/`)
- Les `rules-files` déclarés dans `bank.yml` pointent typiquement vers `<systeme-root>/canon/<fichier>.md` ou `<subsys-root>/canon/<fichier>.md`

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
| "Un jet de Sang difficile se coche en astral" | System | General astral stress rule, applies in any Nadir game → belongs in `<systeme-root>/canon/` |
| "En acte I, le Seuil force un Contrecoup supplémentaire" | Local | Specific to this campaign's act structure |
| "2d6 + compétence vs difficulté" | System | Core resolution — already in `<systeme-root>/canon/rules-files` |

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
**Règles système :** [reference to `<systeme-root>/canon/<fichier>.md` or `<subsys-root>/canon/<fichier>.md`]
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

After `rules-keeper --local <project>`, verify that `<projet-root>/.docs/document-rules.md` exists, contains at least one mechanic section, that `bank.yml` references it under `docs.projet`, and that any system rule reference points to `<systeme-root>/canon/<fichier>.md` (not to a flat unprefixed path).
