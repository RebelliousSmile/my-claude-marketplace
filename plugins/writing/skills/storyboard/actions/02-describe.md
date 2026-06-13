# 02 - Describe

Génère un brief visuel détaillé pour un moment ciblé — cohérent avec le brief univers et le ton visuel du projet. Deux formats de sortie : brief artiste (prose structurée) ou prompt IA (mots-clés séquencés).

## Inputs

- `moment` (required) — ID depuis `<output>/storyboard/chapter-<NN>.md` (ex. `ch03-02`), ou description directe du moment si pas d'extract préalable
- `--brief <brief>` (required) — le répertoire de brief (lecture seule), pour accéder au contexte univers
- `--out <output>` (required) — le répertoire de sortie (pour lire le fichier moments et écrire le brief)
- `--format artist|ai` (optional, défaut : `artist`) — format du brief de sortie
- `--lang fr|en` (optional, défaut : langue du projet selon `<brief>/summary.md`) — langue du brief

## Outputs

- Brief visuel imprimé dans la réponse
- Ajout du brief dans `<output>/storyboard/chapter-<NN>.md` après confirmation de l'utilisateur

## Process

> Working dirs per `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md`. `<brief>/` is read-only.

### 1. Chargement du contexte

1. Résoudre `moment`, `--brief <brief>`, `--out <output>` depuis `$ARGUMENTS`.
2. Si `moment` est un ID (format `ch<NN>-<MM>`) : lire `<output>/storyboard/chapter-<NN>.md` et charger le bloc du moment concerné.
3. Lire `<brief>/summary.md` → extraire les descriptions de personnages, de lieux, et la langue du projet.
4. Charger les fichiers depuis `<brief>/output-styles/` si présents → extraire le ton visuel, la palette, les références esthétiques.
5. Si `[VISUAL-INTRO]` est tagué sur ce moment : la description physique doit être intégralement issue de `<brief>/summary.md` — jamais inventée.

### 2. Identification des contraintes visuelles

Avant de rédiger, lister explicitement (en interne) :
- Personnages présents : descriptions canoniques depuis `<brief>/summary.md`
- Décor : éléments canoniques connus + inférences acceptables depuis le texte du chapitre
- Palette / ambiance : extraite de `<brief>/output-styles/` ou de `<brief>/summary.md`
- Contraintes de cohérence : éléments déjà décrits dans des briefs précédents du même projet (si disponibles dans `<output>/storyboard/`)

### 3. Génération selon le format

#### Format `artist` (défaut)

Prose structurée, destinée à un illustrateur humain.

```markdown
# Brief visuel — [ID] [Titre court du moment]

## Contexte narratif
[2-3 phrases : ce qui vient de se passer, l'enjeu émotionnel, ce qui vient après]

## Description de la scène
[Prose descriptive, 80-150 mots : composition, position des personnages,
décor, éclairage, profondeur de champ suggérée]

## Personnages présents
[Pour chaque personnage : nom, description physique canonique, tenue dans ce moment, posture/expression]

## Éléments visuels essentiels
- **Point focal** : [ce qui doit immédiatement attirer l'œil]
- **Second plan** : [éléments de contexte]
- **Lumière** : [source, direction, qualité, couleur]
- **Palette dominante** : [2-3 couleurs ou tons]

## Ton et références
[Issu de l'output-style : ambiance générale, références esthétiques si présentes]

## Notes pour l'illustrateur
[Liberté laissée, éléments à ne pas modifier, format suggéré si connu]
```

#### Format `ai`

Prompt structuré pour génération d'image par IA (Midjourney, DALL·E, Stable Diffusion, etc.).

Structure : `[sujet principal], [action/pose], [décor], [éclairage], [ambiance], [style artistique], [qualité technique]`

```
[description du sujet], [décor], [éclairage], [palette], [style], [qualité]
```

Règles pour le format `ai` :
- Langue anglaise par défaut (meilleure compatibilité modèles image), sauf `--lang fr` explicite
- Pas de phrases, uniquement des syntagmes séparés par des virgules
- Commencer par le sujet le plus important
- Terminer par les directives de style et de qualité
- Éviter les termes négatifs (préférer les formulations positives)
- Maximum 200 tokens

### 4. Vérification de cohérence

Avant de rendre :
- Les descriptions de personnages correspondent à `<brief>/summary.md` ? Sinon corriger.
- Le ton est cohérent avec l'output-style chargé ? Sinon ajuster.
- Si des briefs précédents existent pour le même chapitre dans `<output>/storyboard/` : vérifier l'absence de contradiction (même personnage décrit différemment).

### 5. Output

Imprimer le brief dans la réponse.

Demander : "Enregistrer ce brief dans `<output>/storyboard/chapter-<NN>.md` ?"

Écrire uniquement après confirmation. Ne jamais écraser un brief existant sans confirmation — proposer d'ajouter à la suite du fichier.

## Test

Invoquer avec un moment `[VISUAL-INTRO]` pour un personnage dont la description est dans `<brief>/summary.md`. Vérifier :
- La description physique du personnage correspond exactement à `<brief>/summary.md` (pas d'invention)
- Le format `artist` produit les 6 sections attendues
- Le format `ai` produit un prompt en anglais de moins de 200 tokens
- Le ton est cohérent avec l'output-style chargé
