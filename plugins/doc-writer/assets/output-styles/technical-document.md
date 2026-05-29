# Output style — technical-document

Style de sortie par défaut pour un document technique. Définit la **voix et le formatage** (la structure par type vient de `doc-types.md`). Remplaçable via `--style <chemin>`.

## Voix & ton

- Neutre, précis, factuel. Impersonnel ou « on ».
- Densité d'information élevée : pas de phrase de remplissage, pas de transition décorative.
- On affirme, on ne « pense » pas : ce que fait le code, pas ce qu'il devrait faire.

## Temps & mode

- Présent de l'indicatif, voix active.
- Conditionnel réservé aux cas réellement hypothétiques.

## Formatage

- Titres = composant / endpoint / opération.
- Code, signatures et commandes en blocs clôturés avec le langage (` ```ts `, ` ```bash `).
- Citations de code : `chemin/fichier.ext:symbole` ou `:ligne`.
- Paramètres, erreurs, options : en **tableaux** (nom · type · requis · description).
- Flux et séquences : diagrammes **Mermaid** éditables.
- Liens vers les ADR / docs existantes plutôt que reformulation.

## Lexique

- Termes techniques et noms d'API en version d'origine (ne pas franciser un identifiant).
- Acronymes explicités à la première occurrence, puis réutilisés tels quels.
- Bannir le marketing et les superlatifs.

## Exemple

> ### `POST /v1/invoices`
>
> Crée une facture pour le client authentifié.
>
> | Paramètre | Type | Requis | Description |
> |---|---|---|---|
> | `customer_id` | string | oui | Identifiant du client (`cus_…`). |
> | `currency` | string | oui | Code ISO 4217. |
>
> Réponse `201` :
>
> ```json
> { "id": "inv_123", "status": "draft" }
> ```
>
> Renvoie `404` si `customer_id` est introuvable (voir `billing/customers.ts:getCustomer`).
