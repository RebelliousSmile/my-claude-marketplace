# Critique lenses

Les lentilles que `01-challenge` passe sur une direction de design. Chacune force une critique **concrète** et des pistes **actionnables** — l'objectif n'est pas de noter, mais d'ouvrir l'espace des possibles avant qu'`adjust` ne le referme. Une piste qui ne nomme ni inspiration ni principe directeur n'en est pas une.

## 1. Générique vs distinctif

La lentille reine. Un LLM (et un humain pressé) converge vers le "plausible" : bleu de framework, Inter partout, ombres molles, radius 8px. Demander :

- Qu'est-ce qui, dans cette direction, pourrait appartenir à **n'importe quel** produit ?
- Où la personnalité du brief / de la marque **devrait** transparaître et ne transparaît pas ?
- Quel choix est un **défaut non assumé** (pris par confort) plutôt qu'une décision ?

Pistes attendues : nommer 2–4 territoires visuels alternatifs concrets (ex. « éditorial à empattement + grille asymétrique », « brutalisme contrôlé », « néo-suisse dense ») avec l'effet sur le core trio.

## 2. Cohérence interne

La direction se contredit-elle ?

- Tokens qui se marchent dessus (deux gris quasi identiques, deux échelles d'espacement).
- Rythme d'espacement irrégulier ; échelle de type sans logique modulaire.
- Radius/ombre/motion qui n'envoient pas le même message (net+plat ET arrondi+flou).

Pistes : rationaliser une dimension précise, pas "harmoniser le tout".

## 3. Accessibilité

Critique, pas audit complet (l'audit dur est `enforce`) :

- Paires texte/fond limites (sous AA) dans la direction proposée.
- Couleur comme seul vecteur d'état.
- Cibles tactiles, focus, `prefers-reduced-motion` ignorés par la direction.
- **Emoji porteurs de sens** comme icônes (smell bloquant) → proposer le jeu d'icônes de remplacement.

Pistes : la correction qui débloque le plus de paires d'un coup (souvent un token sémantique, pas un patch local).

## 4. Tendances & fraîcheur

- Où la direction **date** (gradients 2014, neumorphism, glassmorphism mal dosé) ?
- Où suit-elle une mode **fragile** qui vieillira vite ?
- Quel choix est intemporel vs daté-mais-réversible ?

Pistes : distinguer ce qui mérite d'être gardé de ce qui est un coût de mode.

## 5. Divergence d'inspiration

La lentille la plus générative. Sortir de la référence unique :

- Quelles **familles visuelles** voisines ouvriraient un autre territoire (éditorial, technique, ludique, luxe, institutionnel) ?
- Quelles **références concrètes** (sans copier) incarnent une alternative crédible à la direction posée ?
- Si on poussait **un** axe à fond (typo expressive ? palette restreinte ? densité ?), à quoi ressemblerait le résultat ?

Pistes : 2–4 inspirations nommées, chacune avec ce qu'elle changerait au core trio et son coût contrat (rentre / re-figeage).

## Coût contrat (à attacher à chaque piste, mode standalone figé)

- **Rentre dans le contrat** — réalisable avec le vocabulaire fermé actuel (manifeste + tokens en place).
- **Demande un re-figeage** — changerait un token canonique ou le manifeste → passe par `adjust`, puis réconciliation par `enforce`.
