# Action 02 — realize-components

## Rôle

Générer un fichier CSS BEM par composant depuis `design/components.json`, organisés en `@layer design.components`.

## Procédure

1. Lire `design/components.json`.
2. Pour chaque composant du manifeste :
   a. Créer `design/css/<canonical-name>.css`.
   b. Déclarer `@layer design.components { ... }`.
   c. Générer le bloc racine (`.base`) avec les props de layout/fond dérivées du contrat :
      - `backgrounds` du manifeste → `background-color: var(--token-path)` si un seul fond, sinon pas de règle (fond piloté par modificateur).
   d. Générer un sélecteur vide par `elements.*` (le développeur rempli les props — la structure est posée).
   e. Générer un bloc par `modifiers.*` avec les overrides attendus (fond alternatif si background token présent dans le modificateur).
   f. Générer les règles a11y minimales : si `a11y.role` présent → ajouter un commentaire `/* role: <role> */` ; si `a11y.requires` non vide → ajouter un commentaire `/* required: <attrs> */`.
3. Si un fichier composant existe déjà, comparer les sélecteurs et signaler les sélecteurs orphelins (présents dans le CSS mais absents du manifeste → candidats à supprimer) et les sélecteurs manquants (présents dans le manifeste mais absents du CSS → ajoutés).

## Format produit

```css
/* Généré par sc-css:design-bridge depuis design/components.json — structure BEM posée, props à compléter */
@layer design.components {

  /* ── hero ── */
  .hero {
    /* fond : color.semantic.background | color.brand.primary | color.neutral.900 */
    background-color: var(--color-semantic-background);
  }

  .hero__eyebrow {
    /* font-size, color, letter-spacing */
  }

  .hero__headline {
    /* font-size, line-height */
  }

  .hero__body {
    /* font-size, color */
  }

  .hero__cta {
    /* voir .btn pour les styles du bouton */
  }

  .hero__media {
    /* width, aspect-ratio */
  }

  /* Modificateurs */
  .hero--dark {
    background-color: var(--color-neutral-900);
    color: var(--color-neutral-0);
  }

  .hero--centered {
    text-align: center;
  }

} /* @layer design.components */
```

## Règle de non-invention

Aucun sélecteur produit ne peut être absent du manifeste. Si une classe CSS est nécessaire pour le rendu mais non déclarée dans `components.json`, signaler → passer par `adjust` pour l'ajouter au manifeste d'abord.

## Output

```
✅ design/css/hero.css — 7 sélecteurs générés (.hero × 1, .hero__* × 5, .hero--* × 2)
✅ design/css/btn.css  — 8 sélecteurs générés
⚠️  design/css/card.css — 2 sélecteurs orphelins détectés (.card__badge, .card__tag) — absents du manifeste
```
