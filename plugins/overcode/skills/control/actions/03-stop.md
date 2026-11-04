# Stop

Arrête le commentaire proprement.

## Inputs

- Le Monitor `control — <dépôt>` actif, et son dossier d'état.

## Process

1. Arrêter le Monitor (`TaskStop`), et ne plus le réarmer à son expiration.
2. Rattraper ce que `emitted.log` porte après `commented` (`01-watch` § 7, étapes *Trou* et *Marquer*), puis produire un recap final selon `02-recap` : le journal disparaît avec l'état à l'étape suivante.
3. Supprimer le dossier d'état, sauf si l'utilisateur veut reprendre plus tard (il le dit) : le garder permet un `watch` qui repart de la même base.

## Outputs

- Plus aucune sonde active ; un recap final ; l'état supprimé ou conservé, et dit.

## Test

Après `stop`, une modification du dépôt observé ne produit plus aucune notification, et le dossier d'état n'existe plus (sauf conservation demandée).
