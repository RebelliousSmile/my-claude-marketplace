# 01-define-element

## Rôle

Construire la **spec neutre** d'un élément répétable à partir du manifeste figé. La spec neutre est stack-agnostique : elle ne référence que des entrées de `components.json` (vocabulaire fermé) et des chemins de `design/tokens.json`. C'est la matière d'entrée de `02-render`.

## Entrée

L'utilisateur fournit :
- Le nom du composant à produire (ex. `btn`, `card`, `hero`)
- Optionnellement : les variantes souhaitées, le contexte de fond, la stack cible

Si le composant n'existe pas dans `components.json` → STOP. Signaler que le composant n'est pas dans le manifeste et proposer de jouer `adjust` pour l'y ajouter.

## Processus

### Étape 1 — Lire le manifeste

Ouvrir `design/components.json` et extraire l'entrée du composant demandé :
- `.base` → classe BEM block
- `.elements` → map label → classe BEM
- `.modifiers` → map label → classe BEM
- `.backgrounds` → liste de chemins de tokens autorisés
- `.a11y` → rôle ARIA + attributs requis

### Étape 2 — Identifier les variantes à produire

Si l'utilisateur a précisé des variantes → les valider contre `.modifiers` du composant.
Si une variante demandée n'est pas dans le manifeste → la signaler et l'exclure (ne pas inventer).

Si aucune variante précisée → produire toutes les variantes déclarées dans `.modifiers` (ou la forme de base seule si le composant n'a pas de modifiers).

### Étape 3 — Construire les slots de contenu

Pour chaque élément BEM (`.elements`), définir le slot de contenu adapté au type de composant :

| Élément | Slot par défaut |
|---------|----------------|
| `__label`, `__title`, `__heading` | Texte représentatif |
| `__body`, `__content`, `__text` | Paragraphe représentatif |
| `__media`, `__image` | Placeholder image (`<img alt="..." src="">`) |
| `__icon` | Placeholder icône (`<span aria-hidden="true"></span>`) |
| `__actions`, `__cta` | Élément d'action (bouton ou lien) |

Ne jamais utiliser d'emoji comme contenu de slot (règle du design system).

### Étape 4 — Déterminer le fond

Si `.backgrounds` est défini : utiliser le premier token de la liste comme fond par défaut (sauf si l'utilisateur précise autrement). Vérifier que le chemin existe dans `tokens.json`.

### Étape 5 — Émettre la spec neutre

Format de la spec neutre (en Markdown, dans la conversation) :

```
## Spec neutre — <canonical-name>

**Source manifeste** : design/components.json v<$version>
**Base class** : <.base>

### Slots de contenu
| Élément | Classe BEM | Contenu |
|---------|-----------|---------|
| <label> | <classe> | <contenu> |
...

### Variantes à produire
| Label | Modifier | Forme complète |
|-------|----------|---------------|
| base  | (aucun)  | <.base> |
| <var> | <BEM-modifier> | <.base> <BEM-modifier> |
...

### Contexte de fond
Token : <token.path>
Valeur CSS var : var(--<token-css-property>)

### a11y
Role : <ARIA-role>
Attributs requis : <attr>=<value> (ou "aucun")

### Stack cible
<stack précisée par l'utilisateur ou "non précisée — baseline par défaut">
```

## Validation interne

Avant d'émettre la spec, vérifier mentalement :
- [ ] Toutes les classes référencées existent dans le manifeste (`.base`, `.elements.*`, `.modifiers.*`)
- [ ] Tous les chemins de tokens dans `backgrounds` existent dans `tokens.json`
- [ ] Aucun emoji dans les slots de contenu
- [ ] La spec ne contient aucune classe non déclarée

## Sortie

La spec neutre est émise dans la conversation. Elle sert d'entrée directe à `02-render`.

Annoncer :
> Spec neutre de `<canonical-name>` — <N> variante(s), fond `<token.path>`. Prêt à rendre.
> Préciser la stack cible ou taper `/design:diffuse` pour continuer vers le rendu.
