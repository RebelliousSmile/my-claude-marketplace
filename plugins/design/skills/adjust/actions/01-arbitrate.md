# 01-arbitrate

## Rôle

Trancher les incohérences entre sources de matière malléable (maquettes multiples, pistes `destructure`, brief + maquette, ou re-figeage delta). Produire un **brief d'arbitrage résolu** — la liste de toutes les décisions prises — prêt à être consommé par `02-freeze`.

## Entrées acceptées

| Source | Exemple de signal |
|--------|-------------------|
| Sortie de `define` (matière malléable) | `design/design-system.md` (status: brouillon) + `design/tokens.json` (travail) |
| Pistes de `destructure` | Section "Pistes et inspirations" du rapport de challenge courant, ou rapport persisté sous `design/critique/` (optionnel, non-bloquant) |
| Maquettes multiples | "J'ai 3 directions issues des maquettes Figma" |
| Re-figeage delta | "On a décidé de changer la palette secondaire suite au destructure" |

Si aucune source de matière malléable n'est disponible (ni `design-system.md` brouillon, ni pistes, ni maquettes), signaler à l'utilisateur qu'`adjust` présuppose que `define` a été joué et proposer de reprendre depuis `define`.

## Processus

### Étape 1 — Collecter les sources

Identifier et lire toutes les sources présentes :
- `design/design-system.md` (status: brouillon/non figé)
- `design/tokens.json` (tokens de travail)
- Pistes `destructure` dans le rapport de challenge courant
- Maquettes ou références additionnelles mentionnées en contexte

En mode re-figeage : lire aussi `design/components.json` existant pour n'opérer que sur le delta.

**Entrée optionnelle — critique persistée.** Si `design/critique/` existe, lire le rapport le plus récent (nom de fichier daté `<yyyy_mm_dd>-<cible>.md` — trier par date, prendre le dernier) comme entrée additionnelle au même titre que les pistes de la conversation courante ; reprendre chaque piste retenue avec son étiquette de coût contrat (`rentre dans le contrat` / `demande un re-figeage`) telle qu'émise par `destructure`. Absence de fichier : non-bloquant, poursuivre sans.

### Étape 2 — Inventaire des conflits

Pour chaque domaine du design system (palette, typographie, espacement, composants, variantes, fonds), identifier les valeurs en compétition entre sources :

```
Domaine: couleur primaire
  Source A (maquette 1): #1a56db
  Source B (maquette 2): #2563eb
  Source C (piste destructure "plus corporate"): #1e3a8a
→ 3 options en compétition
```

### Étape 3 — Trancher les conflits

**Cas « direction unique » (défaut le plus courant).** Quand il n'y a **qu'une seule direction** — un `define` unique + des pistes `destructure` (ou un re-figeage delta) — il n'y a rien à faire voter : la matière de base fait foi, les pistes acceptées s'appliquent comme deltas, et **seules les vraies valeurs en compétition** (une piste qui remplace une valeur existante) passent au gate humain de l'étape 4. **Sauter la cérémonie de comptage** — elle n'a de sens qu'avec plusieurs sources concurrentes. Documenter simplement :

```
✓ palette anchor → #2563eb  [define, direction unique]
✓ piste "plus corporate" acceptée → color.brand.secondary #1e3a8a  [delta destructure]
⚠ radius.base : define=4px vs piste "moderne"=8px → gate humain (étape 4)
```

**Cas multi-sources (maquettes concurrentes).** Seulement quand plusieurs sources indépendantes se disputent la même valeur (N maquettes, brief + maquette divergents) : appliquer la règle du motif dominant. Compter les occurrences d'utilisation effective de chaque option dans les sources (pas le nombre de fois qu'une option est mentionnée, mais le nombre de maquettes/éléments qui l'utilisent réellement) :

- **Motif dominant (≥ 2/3 des sources)** → gagne automatiquement, aucune question posée.
- **Split sans dominant** → flaguer pour gate humain (étape 4).

Documenter chaque décision automatique :
```
✓ couleur primaire → #2563eb  [2/3 sources, motif dominant]
✓ font-family sans → Inter    [3/3 sources, consensus]
```

### Étape 4 — Gate humain sur les cas non tranchables

Pour chaque cas flagué (pas de motif dominant), présenter les options de façon neutre :

```
⚠ Cas non tranchable — arbitrage requis

Domaine : rayon de bordure global
  Option A · radius.base = 4px  (utilisée dans : maquette 1)
  Option B · radius.base = 8px  (utilisée dans : maquette 2 + piste "moderne")

Contexte : le choix influe sur la perception de rigueur vs. convivialité.
Votre décision ?
```

Attendre la réponse avant de continuer. Ne pas proposer de recommandation par défaut — c'est une décision de design.

Cas exceptionnels autorisés sans gate humain :
- Si l'option A est la valeur de `tokens.json` existant et l'option B est une piste `destructure` marquée "coût contrat: demande un re-figeage" → informer l'utilisateur et attendre confirmation explicite.

### Étape 5 — Produire le brief d'arbitrage

Synthétiser toutes les décisions (automatiques + humaines) dans un brief structuré :

```
## Brief d'arbitrage — [projet] — [date]

### Tokens résolus

| Groupe | Chemin | Valeur retenue | Source | Mode |
|--------|--------|----------------|--------|------|
| color | color.brand.primary | #2563eb | maquette 1+2 | motif dominant |
| font  | font.family.sans | Inter | consensus | motif dominant |
| radius | radius.base | 8px | humain | gate |

### Composants résolus

| Composant | Décision | Variantes retenues | Fonds autorisés |
|-----------|----------|--------------------|-----------------|
| btn | conservé | primary, secondary, ghost, sm, lg | background, surface, brand.primary |
| card | conservé | featured, horizontal | surface |
| hero | étendu | dark (ajout) | background, brand.primary, neutral.900 |

### Delta (re-figeage uniquement)

- Ajouts : [liste]
- Modifications : [liste avec ancien→nouveau]
- Suppressions : [liste — attention : déclenche major bump]

### Cas non tranchés

- aucun
```

Si des cas restent non tranchés (utilisateur n'a pas répondu), ne pas passer à `02-freeze` — signaler le blocage.

## Sortie

Le brief d'arbitrage est produit dans la conversation (pas dans un fichier). Il sert d'entrée directe à `02-freeze`.

Annoncer à l'utilisateur :
> Brief d'arbitrage complet. X décisions automatiques, Y décisions humaines. Prêt à figer avec `02-freeze` (ou taper `/design:adjust` pour continuer directement).
