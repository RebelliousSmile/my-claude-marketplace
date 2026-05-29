# Output style — specification

Style de sortie par défaut pour un cahier des charges. Définit la **voix et le formatage** (la structure vient de `spec-template.md` + `spec-structure.md`). Remplaçable via `--style <chemin>`.

## Voix & ton

- Formel, normatif, impersonnel. Pas de « je » / « nous ».
- Ton contractuel : chaque phrase engage. Aucune ambiguïté tolérée.
- Aucune promesse marketing ; aucun adjectif non quantifié (« rapide », « convivial », « moderne »).

## Temps & mode

- Exigences au présent normatif : « Le système **doit** … » (Must), « **devrait** » (Should), « **pourra** » (Could).
- Le « doit » est réservé aux exigences obligatoires.

## Formatage

- Numérotation de sections stable (1, 2, 3…) ; ne pas renuméroter à la légère.
- Exigences en **tableaux** : `ID | Exigence | Priorité | Critère d'acceptation`.
- IDs stables et uniques : `FR-n` (fonctionnelles), `NFR-n` (non-fonctionnelles).
- Périmètre en deux listes explicites : **Inclus** / **Hors périmètre**.
- Une exigence = une ligne = une seule chose (pas de « et » qui en cache deux).

## Règles de fond (rappel)

- Décrire le **quoi**, pas le **comment** : les choix techniques imposés vont en § Contraintes.
- Toute exigence Must/Should a un critère d'acceptation **mesurable**.
- Aucun chiffre, date ou budget inventé : placeholder + report en § Hypothèses & questions ouvertes.

## Exemple

> ## 4. Exigences fonctionnelles
>
> | ID | Exigence | Priorité | Critère d'acceptation |
> |---|---|---|---|
> | FR-1 | Le système doit permettre la réinitialisation du mot de passe par e-mail. | Must | L'e-mail arrive en ≤ 1 min ; le nouveau mot de passe authentifie. |
> | FR-2 | Le système doit journaliser chaque tentative de connexion. | Should | Une entrée horodatée par tentative, consultable par un administrateur. |
