# 03 - Propose

Regrouper les décisions en lots thématiques, les présenter à l'utilisateur et attendre validation lot par lot.

## Inputs

- `decisions` — liste de décisions depuis `02-analyze`
- `batch_index` (internal) — index du lot courant (commence à 0, incrémenté à chaque appel)

## Outputs

- `validated_batch` — lot validé prêt pour `04-execute`
- `remaining_decisions` — décisions non encore traitées

## Process

1. **Regrouper les décisions en lots thématiques** :
   - Un lot = un groupe cohérent d'actions similaires. Exemples de regroupements naturels :
     - "Suppression — 12 emails Klaviyo/spam"
     - "Fusion — 3 threads Patreon (Miska's Cyberpunk Maps)"
     - "Classement — 5 emails en racine"
     - "Résumé — 8 newsletters BNP"
   - Les lots peuvent contenir une **règle globale** si une même action s'applique à tous les emails d'un expéditeur ou d'une branche (ex: "supprimer tous les mails de klaviyo.com"). Formuler explicitement la règle.
   - Taille cible d'un lot : 5 à 20 fichiers. Adapter selon la cohérence thématique.

2. **Présenter le lot courant** avec ce format :

   ```
   ## Lot N/Total — <Titre du lot>

   Action : <action>
   Fichiers concernés (N) :
   - <nom_fichier>
     From: <from> | Date: <YYYY-MM-DD> | Sujet: <subject tronqué à 60 chars>
     → <branche cible si classify, sinon action>
   - ...

   [Si règle globale] Règle appliquée : <description de la règle>

   Valider ce lot ? (oui / non / modifier / passer)
   ```

3. **Attendre la réponse de l'utilisateur** :
   - `oui` → retourner `validated_batch` pour `04-execute`, puis revenir à `03-propose` avec le lot suivant
   - `non` → abandonner ce lot, passer au suivant
   - `modifier` → demander les modifications, reformuler le lot, re-présenter
   - `passer` → sauter au lot suivant sans exécuter

4. **Répéter** jusqu'à épuisement des lots.

5. Quand tous les lots ont été traités → déclencher `05-report`.

## Test

- Chaque lot affiche clairement : action, liste des fichiers, destination si applicable.
- Chaque fichier affiche from, date et subject (tronqué à 60 chars).
- L'utilisateur peut rejeter ou modifier un lot sans bloquer les suivants.
- Aucun lot n'est exécuté sans confirmation explicite.
