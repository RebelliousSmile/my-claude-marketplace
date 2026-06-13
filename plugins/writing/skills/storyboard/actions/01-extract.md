# 01 - Extract

Lit un chapitre, identifie et classe les moments visuellement illustrables, les soumet à la validation de l'utilisateur, puis écrit la liste dans `<output>/storyboard/chapter-<NN>.md`.

## Inputs

- `<brief>` (required, positional) — le répertoire de brief (lecture seule)
- `--out <output>` (required) — le répertoire de sortie
- `--chapter <NN>` (required) — numéro du chapitre à analyser (2 chiffres, ex. `03`)
- `--limit N` (optional) — nombre maximum de moments à extraire (défaut : pas de limite)
- `--type` (optional) — filtrer par type de moment : `scene-setting`, `intro`, `action`, `emotion`, `symbol`

## Outputs

- Liste des moments présentée à l'utilisateur pour validation/sélection
- `<output>/storyboard/chapter-<NN>.md` écrit après confirmation

## Process

> Working dirs per `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md`. `<brief>/` is read-only.

### 1. Chargement du contexte

Résoudre `<brief>` (positionnel), `--out <output>` et `--chapter <NN>` depuis `$ARGUMENTS`.

Lire dans cet ordre :
1. `<brief>/summary.md` → source unique de contexte univers (personnages, lieux, terminologie, lore consolidé, type, langue)
2. Charger les fichiers depuis `<brief>/output-styles/` si présents → extraire les éléments visuels (palette, ambiance, références artistiques)
3. Vérifier que `<output>/chapters/chapter-<NN>.md` existe → ABORT si absent, signaler à l'utilisateur

Si `<brief>/summary.md` ne contient pas de descriptions de personnages ou de lieux : poursuivre sans contexte visuel canonique ; signaler dans l'output que les descriptions seront déduites du texte uniquement.

### 2. Lecture du chapitre

Lire `<output>/chapters/chapter-<NN>.md` en entier. Identifier sa structure narrative (début, développement, climax, résolution).

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
- **ID** : `ch<NN>-<MM>` (ex. `ch03-01`)
- **Type** : un des 5 types ci-dessus
- **Position** : citation courte (≤ 20 mots) indiquant où il se situe dans le texte
- **Éléments visuels présents** : personnages, décor, objets, lumière mentionnés explicitement ou implicitement
- **Tag VISUAL-INTRO** : si c'est la première apparition visuelle d'un élément canonique (d'après `<brief>/summary.md`)

### 4. Validation

Présenter la liste à l'utilisateur sous ce format :

```
## Moments illustrables — chapter-<NN>

| ID       | Type                        | Position (extrait)           | Éléments visuels             |
|----------|-----------------------------|------------------------------|------------------------------|
| ch03-01  | scene-setting               | "La salle était plongée…"   | Salle du trône, chandelles   |
| ch03-02  | intro 🏷 VISUAL-INTRO       | "Elle entra, vêtue de…"     | Personnage X, robe, épée     |
| ch03-03  | emotion                     | "Il posa la main sur…"       | Deux personnages, geste      |
```

Demander : "Quels moments souhaites-tu développer en brief ?"

### 5. Écriture du fichier

Après confirmation (ou si l'utilisateur valide tout) :

Créer `<output>/storyboard/` si absent. Écrire `<output>/storyboard/chapter-<NN>.md` avec le tableau complet et, pour chaque moment, un bloc de contexte narratif (2-3 phrases).

Ne pas écraser un fichier moments existant sans confirmation — proposer de fusionner ou remplacer.

Suggérer comme étape suivante : `describe ch<NN>-01` pour générer le premier brief visuel.

## Test

Invoquer sur `<output>/chapters/chapter-03.md` avec un brief valide. Vérifier :
- Au moins 3 moments identifiés de types différents
- Les personnages cités correspondent aux descriptions dans `<brief>/summary.md` (pas d'invention)
- Le fichier `<output>/storyboard/chapter-03.md` est créé après confirmation
- Les tags `[VISUAL-INTRO]` sont présents sur les premières apparitions
