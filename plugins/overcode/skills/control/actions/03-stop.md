# Stop

Arrête le commentaire proprement.

## Inputs

- Le Monitor `control — <dépôt>` actif, et son dossier d'état.

## Process

1. Arrêter le Monitor (`TaskStop`), et ne plus le réarmer à son expiration.
2. Produire un recap final selon `02-recap`.
3. Supprimer le dossier d'état, sauf si l'utilisateur veut reprendre plus tard (il le dit) : le garder permet un `watch` qui repart de la même base.

## Outputs

- Plus aucune sonde active ; un recap final ; l'état supprimé ou conservé, et dit.

## Test

Après `stop`, une modification du dépôt observé ne produit plus aucune notification, et le dossier d'état n'existe plus (sauf conservation demandée).
