# Calage

## Rôle

Composer le spécimen dans InDesign, lire les pages rendues et ajuster `maquette.json` jusqu'à une mise en page juste, un réglage à la fois.

## Préconditions

- Accord explicite de l'utilisateur, InDesign fermé, `pdftoppm` disponible.
- Modèle généré (action `modele`).

## Processus

1. Composer le spécimen : `node <DOC_PDF_PLUGIN_ROOT>/engine/cli.js pdf compose --guide specimen --config <dossier>/specimen/documentation.config.json`.
2. Rendre les pages : `pdftoppm -png -r 60 <pdf> <préfixe>`, puis les lire.
3. Choisir un seul écart et annoncer à l'utilisateur les pages qui doivent changer, puis modifier la valeur correspondante de `maquette.json`, regénérer (`idml`) et recomposer (`pdf compose --remplacer`). Les tailles, interlignes et couleurs des styles se règlent dans `formats.<style>` (par exemple `formats.Intertitre-2.size`) ; les `attributes` de `styles.paragraph` ne servent qu'aux définitions de styles des ICML et `formats` l'emporte dans l'IDML : ne pas les retirer, ne pas s'y fier pour régler le rendu.
4. Comparer avec l'essai précédent (`compare-pdfs`) : seules les pages annoncées à l'étape 3 doivent changer. Sinon annuler le réglage.
5. Vérifier qu'aucune tâche planifiée `doc-pdf-*` ne reste.
6. Répéter, un écart à la fois, jusqu'à ce que l'utilisateur valide le rendu du spécimen : c'est lui qui clôt le calage.

## Limites

Une retouche manuelle du `.indd` est écrasée par la recomposition : la porter dans `maquette.json`. Un besoin qui exige de changer le moteur ou un nom de style n'est pas un calage : le signaler.
