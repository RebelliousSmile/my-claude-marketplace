# 01 - Extract

Lit un chapitre, identifie et classe les moments visuellement illustrables, les soumet à la validation de l'utilisateur, puis écrit la liste dans `.storyboard/<chapitre>-moments.md`.

## Inputs

- `chapter_file` (required) — chemin du chapitre à analyser (ex. `chapitres/chapitre03.md`)
- `--limit N` (optional) — nombre maximum de moments à extraire (défaut : pas de limite)
- `--type` (optional) — filtrer par type de moment : `scene-setting`, `intro`, `action`, `emotion`, `symbol`

## Outputs

- Liste des moments présentée à l'utilisateur pour validation/sélection
- `.storyboard/<chapitre>-moments.md` écrit après confirmation

## Process

### 1. Chargement du contexte visuel

Lire dans cet ordre :
1. `bank.yml` → identifier les fichiers `docs` (personnages, lieux) et le fichier `output-style`
2. Charger l'output-style : extraire les éléments visuels (palette, ambiance, références artistiques si présentes)
3. Charger les docs de personnages et de lieux déclarés dans `bank.yml`

Si `bank.yml` est absent : poursuivre sans contexte univers ; signaler dans l'output que les descriptions seront génériques.

### 2. Lecture du chapitre

Lire le fichier chapitre en entier. Identifier sa structure narrative (début, développement, climax, résolution).

### 3. Identification des moments

Parcourir le chapitre et identifier les moments selon ces 5 types :

| Type | Critères |
|---|---|
| `scene-setting` | Introduction d'un décor important ; ambiance visuelle forte |
| `intro` | Première apparition d'un personnage, lieu, ou objet narrativement important |
| `action` | Pic d'action ou de tension ; mouvement, conflit, danger |
| `emotion` | Climax émotionnel ; moment intime, révélation, rupture |
| `symbol` | Élément symbolique fort ; objet récurrent, geste chargé de sens |

Pour chaque moment identifié, extraire :
- **ID** : `<chapitre>-<NN>` (ex. `ch03-01`)
- **Type** : un des 5 types ci-dessus
- **Position** : citation courte (≤ 20 mots) indiquant où il se situe dans le texte
- **Éléments visuels présents** : personnages, décor, objets, lumière mentionnés explicitement ou implicitement
- **Tag VISUAL-INTRO** : si c'est la première apparition visuelle d'un élément canonique

### 4. Validation

Présenter la liste à l'utilisateur sous ce format :

```
## Moments illustrables — <titre du chapitre>

| ID      | Type         | Position (extrait)           | Éléments visuels             |
|---------|--------------|------------------------------|------------------------------|
| ch03-01 | scene-setting | "La salle était plongée…"   | Salle du trône, chandelles   |
| ch03-02 | intro 🏷 VISUAL-INTRO | "Elle entra, vêtue de…" | Personnage X, robe, épée |
| ch03-03 | emotion      | "Il posa la main sur…"       | Deux personnages, geste      |
```

Demander : "Quels moments souhaites-tu développer en brief ?"

### 5. Écriture du fichier

Après confirmation (ou si l'utilisateur valide tout) :

Écrire `.storyboard/<chapitre>-moments.md` avec le tableau complet et, pour chaque moment, un bloc de contexte narratif (2-3 phrases).

Ne pas écraser un fichier moments existant sans confirmation — proposer de fusionner ou remplacer.

## Test

Invoquer sur un chapitre de 1 000+ mots. Vérifier :
- Au moins 3 moments identifiés de types différents
- Les personnages cités correspondent aux docs univers chargés (pas d'invention)
- Le fichier `.storyboard/<chapitre>-moments.md` est créé après confirmation
- Les tags `[VISUAL-INTRO]` sont présents sur les premières apparitions
