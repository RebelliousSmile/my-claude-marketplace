# Templates — Standard Themes

Limit: 250 lines per file. Include the metadata block at the end of the file. The template content below is reproduced verbatim into the generated French artifacts — keep it in French.

---

## terminologie.md

**IMPORTANT:** This file contains only the vocabulary specific to the fictional universe. Game rules (attributes, dice, mechanics) go in `rules-files/`.

```markdown
# Terminologie : [Nom Univers]

## Termes Principaux

| Terme | Définition |
|-------|------------|
| [terme1] | [définition courte] |

## Noms Propres

### Lieux

| Nom | Type | Notes |
|-----|------|-------|
| [Lieu1] | Ville | [description courte] |

### Personnages

| Nom | Titre/Fonction | Notes |
|-----|----------------|-------|
| [Perso1] | [titre] | [description courte] |

### Organisations

| Nom | Description |
|-----|-------------|
| [Orga1] | [rôle] |

## Termes à Ne Pas Utiliser

| Incorrect | Correct | Raison |
|-----------|---------|--------|
| [terme faux] | [terme juste] | [explication] |

---
**Lignes:** [N]/250
**Sources:** [fichiers]
**Màj:** [date]
```

---

## histoire.md

```markdown
# Histoire : [Nom Univers]

## Chronologie

| Période/Date | Événement | Impact |
|--------------|-----------|--------|
| [date] | [événement] | [conséquences] |

## Ères / Périodes

### [Nom Période 1]

**Dates :** [début] - [fin]
**Caractéristiques :** [description]

[Paragraphe résumé]

## Événements Majeurs

### [Événement 1]

**Date :** [date]
**Acteurs :** [qui]
**Cause :** [pourquoi]
**Conséquences :** [impact]

[Paragraphe détail]

---
**Lignes:** [N]/250
**Sources:** [fichiers]
**Màj:** [date]
```

---

## factions.md

```markdown
# Factions : [Nom Univers]

## Vue d'Ensemble des Relations

```
[Faction A] --alliance--> [Faction B]
[Faction A] --conflit--> [Faction C]
[Faction B] --neutre--> [Faction C]
```

## Factions Majeures

### [Faction 1]

**Type :** [gouvernement / guilde / ordre / culte / ...]
**Siège :** [lieu]
**Chef :** [nom] (voir personnages.md)
**Objectifs :** [buts]
**Ressources :** [forces, richesses, influence]

**Relations :**
- Allié de : [factions]
- Ennemi de : [factions]
- Neutre avec : [factions]

[Paragraphe description]

## Factions Mineures

| Nom | Type | Influence | Notes |
|-----|------|-----------|-------|
| [Faction] | [type] | [faible/moyenne] | [description courte] |

---
**Lignes:** [N]/250
**Sources:** [fichiers]
**Màj:** [date]
```

---

## geographie.md

```markdown
# Géographie : [Nom Univers]

## Carte Mentale

```
[Région Nord]
    └── [Ville A]
    └── [Ville B]
[Région Sud]
    └── [Ville C]
[Mer / Frontière]
```

## Régions

### [Région 1]

**Climat :** [description]
**Terrain :** [description]
**Ressources :** [liste]
**Population :** [estimation]

**Lieux notables :**
- [Lieu A] : [description courte]
- [Lieu B] : [description courte]

## Lieux Importants

### [Lieu 1]

**Type :** [ville / forteresse / ruine / ...]
**Région :** [région]
**Population :** [si applicable]
**Particularité :** [ce qui le rend unique]

[Paragraphe description]

## Distances et Voyages

| De | À | Distance | Durée |
|----|---|----------|-------|
| [A] | [B] | [km/lieues] | [jours] |

---
**Lignes:** [N]/250
**Sources:** [fichiers]
**Màj:** [date]
```

---

## personnages.md

```markdown
# Personnages : [Nom Univers]

## Personnages Majeurs

### [Personnage 1]

**Nom complet :** [nom]
**Titre/Fonction :** [titre]
**Affiliation :** [faction] (voir factions.md)
**Lieu :** [résidence]

**Description :** [apparence, traits marquants]
**Personnalité :** [traits de caractère]
**Objectifs :** [motivations]
**Secrets :** [informations cachées — pour le MJ]

**Relations :**
- [Perso B] : [relation]
- [Faction X] : [relation]

## Personnages Secondaires

| Nom | Fonction | Lieu | Notes |
|-----|----------|------|-------|
| [Perso] | [rôle] | [lieu] | [trait distinctif] |

---
**Lignes:** [N]/250
**Sources:** [fichiers]
**Màj:** [date]
```
