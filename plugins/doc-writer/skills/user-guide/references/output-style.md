# Output style — user-guide

Style de sortie par défaut pour un guide utilisateur. Définit la **voix et le formatage** (le quoi/structure vient de `user-guide-structure.md`). Remplaçable via `--style <chemin>`.

## Voix & ton

- Vouvoiement (« vous »).
- Ton direct, rassurant, orienté action. Jamais condescendant.
- Phrases courtes : une idée par phrase.
- On s'adresse à la personne, pas à « l'utilisateur » à la 3e personne.

## Temps & mode

- Impératif pour les étapes (« Cliquez sur… », « Saisissez… »).
- Présent pour les explications.

## Formatage

- Titres de section = objectif utilisateur (« Envoyer une facture »), pas un écran.
- Étapes en liste **numérotée** ; une action par étape ; finir l'étape par le résultat visible.
- Encarts en blockquote, préfixés :
  - `> **Astuce :** …`
  - `> **Attention :** …`
  - `> **Note :** …`
- Captures d'écran : placeholder `[capture : ce qu'elle montre]`.
- Libellés d'UI en **gras**, repris exactement tels qu'affichés par le produit.

## Lexique

- Pas de jargon technique ; définir tout terme indispensable à sa première occurrence.
- Termes cohérents d'un bout à l'autre, alignés sur l'UI.
- Bannir le marketing (« puissant », « simple », « il vous suffit de »).

## Exemple

> ## Réinitialiser votre mot de passe
>
> 1. Sur l'écran de connexion, cliquez sur **Mot de passe oublié**.
> 2. Saisissez votre adresse e-mail, puis cliquez sur **Envoyer**. Un e-mail de réinitialisation vous est envoyé.
> 3. Ouvrez l'e-mail et cliquez sur **Choisir un nouveau mot de passe**.
>
> > **Astuce :** si l'e-mail n'arrive pas sous une minute, vérifiez vos courriers indésirables.
