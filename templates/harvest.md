---
name: harvest
description: Harvest session report — inventory, decisions extracted, issues closed, files purged, remaining files reviewed
---

<!--
AI instructions:
- Fill every section. Use "aucun" for empty lists, never omit a section.
- Dates in ISO format (YYYY-MM-DD).
- File paths relative to project root.
- One line per item in all lists.
-->

# Harvest — {YYYY-MM-DD}

## Inventaire initial

| Type | Nombre |
|---|---|
| Plans terminés (`.processed.md`) | {n} |
| Reviews (`.review.md`) | {n} |
| Journeys (`.journey.md`) | {n} |
| User stories | {n} |
| Checklists / phases | {n} |
| Sous-plans (`-part-N`, `-master`) | {n} |
| Plans actifs (`.md`) | {n} |
| Audits (`audits/`) | {n} |
| **Total** | {n} |

---

## Réconciliation tracker

### Issues à fermer (ouvertes, plan terminé)

- [ ] #{n} — {titre}

### Issues déjà fermées (plans purgeables)

- #{n} — {titre}

### Plans sans issue détectée

- `{chemin/fichier.processed.md}`

---

## Décisions harvestées

### `.claude/rules/custom/`

- [ ] `{règle.md}` — {sujet}

### `aidd_docs/memory/`

- [ ] `{fichier.md}` — {sujet}

### `aidd_docs/internal/decisions/`

- [ ] `{XXX-titre.md}` — {sujet}

### Mémoire auto Claude

- [ ] `{feedback_xxx.md}` — {sujet}

### Skippées (déjà présentes)

- {sujet} → déjà dans `{fichier}`

---

## Clôture des issues

- [ ] Commentaire rédigé et montré pour #{n}
- [ ] Commentaire posté
- [ ] Issue fermée

---

## Reconciliation mémoire (Phase 4)

### Doublons fusionnés

- `{fichier-source}` → fusionné dans `{fichier-cible}`

### Contradictions résolues

- `{sujet}` : `{fichier-a}` vs `{fichier-b}` → conservé `{fichier-choisi}` ({raison})

### Patterns élevés en règles

- [ ] `.claude/rules/custom/{règle.md}` — {sujet}

### Décisions obsolètes signalées

- `{fichier}` — {raison de l'obsolescence}

---

## Purge des fichiers éphémères (Phase 5)

### Supprimés

- `{chemin}` — {raison}

### Conservés

- `{chemin}` — {raison}

---

## Revue des fichiers restants (Phase 6)

### User stories

| Fichier | Issue | État issue | Action |
|---|---|---|---|
| `{fichier}` | #{n} | fermée / ouverte / aucune | supprimé / conservé / signalé |

### Checklists / phases

| Fichier | Master associé | Action |
|---|---|---|
| `{fichier}` | `{master.processed.md}` / aucun | supprimé / conservé / orphelin |

### Sous-plans

| Fichier | Master `.processed.md` ? | Action |
|---|---|---|
| `{fichier}` | oui / non | supprimé / conservé |

### Plans actifs (potentiellement abandonnés)

| Fichier | Ancienneté | Issue | Décision |
|---|---|---|---|
| `{fichier}` | {n} jours | #{n} fermée / ouverte / aucune | conservé / supprimé / à revoir |

### Audits

| Fichier | Ancienneté | Décision |
|---|---|---|
| `{fichier}` | {n} jours | conservé / supprimé |

---

## Résumé final

```
Issues fermées        : {n}
Décisions écrites     : {n}
Fichiers supprimés    : {n}  (éphémères + revue)
Plans actifs restants : {n}
Fichiers conservés    : {n}
```

**Statut** : {Propre | {n} fichiers à retraiter au prochain harvest}
