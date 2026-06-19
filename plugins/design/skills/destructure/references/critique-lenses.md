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

Critique de direction, pas audit complet (l'audit de code est `sc-css:audit`, la gate d'implémentation est `enforce`) :

**Contrastes :**
- Paires texte/fond limites (sous AA 4.5:1 pour le corps, sous AA 3:1 pour les grands titres) dans la direction proposée.
- Tokens sémantiques dont la valeur calculée échoue WCAG — souvent un `neutral.300` utilisé comme texte sur `neutral.100`.

**Couleur et état :**
- Couleur comme seul vecteur d'état (erreur rouge, succès vert) sans icône ou forme alternative.
- États hover/focus/disabled portés uniquement par une nuance de couleur — invisible en `forced-colors` ou daltonisme.

**Interaction & perception :**
- Cibles tactiles < 44×44px dans les tokens de sizing prévus pour les CTA.
- `prefers-reduced-motion` : une direction riche en animations doit prévoir son fallback dans la charte.
- **Emoji porteurs de sens** comme icônes (smell bloquant) → proposer le jeu d'icônes de remplacement.

**Navigation clavier (direction) :**
- Ordre de tabulation impliqué par la structure des composants — un modal sans focus-trap évident, un menu sans `Escape`.
- Rôles ARIA implicitement nécessaires pour la direction (carousels, accordéons, onglets) — la direction les impose sans les nommer.

Pistes : la correction qui débloque le plus de paires d'un coup (souvent un token sémantique, pas un patch local). Distinguer ce qui est un choix de direction (ex. palette restreinte) de ce qui est un risque d'implémentation (ex. gestion du focus).

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

## 6. États comportementaux (UX implicite)

Une direction de design est incomplète si elle ne dit pas comment les composants se comportent sous charge, erreur, ou interaction. Ces lacunes découvertes après `adjust` coûtent un re-figeage.

**États des composants :**
- Quels états sont désignés ? `default / hover / focus / active / disabled / loading / error / success / empty` — pour chaque composant interactif listé dans la direction.
- Un état absent de la direction sera inventé par le développeur → incohérence systémique.
- Piste concrète : identifier les 3 composants les plus critiques (CTA, form input, card cliquable) et lister les états manquants à concevoir avant `adjust`.

**Flux et friction :**
- La direction suppose-t-elle des patterns d'interaction non standard (swipe là où l'utilisateur attend un clic, scroll infini là où une pagination serait attendue) ? → nommer le risque et proposer le pattern familier alternatif.
- Les messages d'erreur et les états vides sont-ils prévus dans l'inventaire des composants, ou seulement les cas heureux ?

**Affordance :**
- Les éléments cliquables se distinguent-ils visuellement sans survol (underline, icône, couleur distincte) ?
- La densité d'information est-elle adaptée au contexte d'usage (mobile debout → objets larges, espace ; tableau de bord → densité intentionnelle) ?

Pistes : un tableau d'états par composant critique (souvent 5 min à esquisser, évite plusieurs jours de correction post-intégration). Ne pas corriger tous les composants — se concentrer sur le CTA primaire et le formulaire de contact comme pilotes.

## 7. Lisibilité & hiérarchie de lecture

La direction donne-t-elle un flux de lecture naturel et lisible ?

**Typographie :**
- Taille de corps : sous 16px sur desktop / 14px sur mobile → risque de lisibilité pour les utilisateurs 40+.
- Longueur de ligne : au-dessus de 75–80 caractères par ligne → fatigue oculaire sur les textes longs.
- Contraste de taille entre niveaux de titre : H1/H2/H3 doivent avoir un rapport > 1.25 pour créer une hiérarchie lisible.
- Interlignage (`line-height`) : sous 1.4 pour le corps → texte étouffé.

**Hiérarchie visuelle :**
- Y a-t-il un point d'entrée évident par page (headline > sous-titre > corps) ou tout est au même niveau de poids ?
- Les CTA primaires sont-ils visuellement dominants sans concurrence d'autres éléments de même poids ?
- La grille et l'espacement font-ils respirer le contenu, ou la direction est-elle trop dense / trop aérée pour son contexte ?

Pistes : corriger d'abord la taille de corps et le contraste de titres — ces deux axes impactent la lisibilité pour tous les utilisateurs, pas seulement en accessibilité.

## Coût contrat (à attacher à chaque piste, mode standalone figé)

- **Rentre dans le contrat** — réalisable avec le vocabulaire fermé actuel (manifeste + tokens en place).
- **Demande un re-figeage** — changerait un token canonique ou le manifeste → passe par `adjust`, puis réconciliation par `enforce`.
