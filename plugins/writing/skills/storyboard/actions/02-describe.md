# 02 - Describe

Génère un brief visuel détaillé pour un moment ciblé — cohérent avec les docs univers et le ton visuel du projet. Deux formats de sortie : brief artiste (prose structurée) ou prompt IA (mots-clés séquencés).

## Inputs

- `moment` (required) — ID depuis `.storyboard/<chapitre>-moments.md` (ex. `ch03-02`), ou description directe du moment si pas d'extract préalable
- `--format artist|ai` (optional, défaut : `artist`) — format du brief de sortie
- `--lang fr|en` (optional, défaut : langue du projet selon `bank.yml`) — langue du brief

## Outputs

- Brief visuel imprimé dans la réponse
- `.storyboard/<chapitre>-brief-<NN>.md` écrit si l'utilisateur valide

## Process

### 1. Chargement du contexte

1. Si `moment` est un ID : lire `.storyboard/<chapitre>-moments.md` et charger le bloc du moment concerné.
2. Lire `bank.yml` → charger les docs de personnages et de lieux impliqués dans le moment.
3. Charger l'output-style → extraire le ton visuel, la palette, les références esthétiques.
4. Si `[VISUAL-INTRO]` est tagué sur ce moment : la description physique doit être intégralement issue des docs univers — jamais inventée.

### 2. Identification des contraintes visuelles

Avant de rédiger, lister explicitement (en interne) :
- Personnages présents : descriptions canoniques depuis les docs
- Décor : éléments canoniques connus + inférences acceptables depuis le texte
- Palette / ambiance : extraite de l'output-style
- Contraintes de cohérence : éléments déjà décrits dans des briefs précédents du même projet (si disponibles dans `.storyboard/`)

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
- Les descriptions de personnages correspondent aux docs univers ? Sinon corriger.
- Le ton est cohérent avec l'output-style ? Sinon ajuster.
- Si des briefs précédents existent pour le même projet : vérifier l'absence de contradiction (même personnage décrit différemment).

### 5. Output

Imprimer le brief dans la réponse.

Demander : "Enregistrer ce brief dans `.storyboard/<chapitre>-brief-<NN>.md` ?"

Écrire uniquement après confirmation. Ne jamais écraser un brief existant sans confirmation.

## Test

Invoquer avec un moment `[VISUAL-INTRO]` pour un personnage dont la description est dans un doc univers. Vérifier :
- La description physique du personnage correspond exactement au doc univers (pas d'invention)
- Le format `artist` produit les 6 sections attendues
- Le format `ai` produit un prompt en anglais de moins de 200 tokens
- Le ton est cohérent avec l'output-style chargé
