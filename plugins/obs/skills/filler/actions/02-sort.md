# 02 — Sort

## Inputs
- `path` (required) — répertoire cible
- `scheme` (optional) — `entity` | `date` | `type` | `topic` | `custom:<description>`. Défaut : inféré depuis le contenu.

## Outputs
- Plan de déplacement avec structure cible (affiché avant exécution)
- Fichiers déplacés dans des sous-répertoires de `path`
- Si scheme `entity` : rapport de triage par entité (action recommandée par répertoire)

## Schemes

### entity (scheme principal pour emails et documents multi-sources)
Regroupe les fichiers par entité source (expéditeur, organisation, système émetteur). Crée un sous-répertoire par entité dans `path`.

1. Extraire l'entité depuis chaque fichier :
   - Si `from:` est l'adresse du propriétaire du vault → utiliser `to:` comme entité (le fichier est une réponse ; l'entité significative est le correspondant, pas l'expéditeur). Voir règle complète dans `references/email-md-format.md`.
   - Sinon : `from:` → nom court de l'expéditeur (ex. `from: ONET CDG <noreply@…>` → `onet`)
   - À défaut : pattern dans le nom de fichier (ex. `_OnetCdg_` → `onet`)
   - À défaut : domaine de l'expéditeur (`@smartlockers.io` → `smartlockers`)
   - Normaliser en slug kebab-case minuscule, sans accents, sans caractères spéciaux.
2. Lister les entités détectées avec leur count : `onet (109)`, `smartlockers (4)`, `client-x (12)`…
3. Construire la carte : `path/<entity>/` pour chaque fichier.
4. Afficher le plan et attendre confirmation.
5. Créer les sous-répertoires et déplacer les fichiers.
6. **Phase triage** : pour chaque répertoire entité, produire une recommandation d'action :
   - **digest** — N fichiers de structure identique (notifications système, alertes répétitives)
   - **condense** — fichiers longs avec beaucoup de prose (emails narratifs, CR de réunion)
   - **keep** — fichiers uniques ou à faible volume (< 3 fichiers), contenu non répétitif
   - **clean** — fichiers vides, doublons, ou sans valeur exploitable
   Afficher sous forme de tableau récapitulatif, une ligne par entité.

### date
Regroupe par date de dernière modification ou frontmatter `date:` : `YYYY/MM/` ou `YYYY/`.

### type
Regroupe par extension ou frontmatter `type:` : `notes/`, `emails/`, `reports/`…

### topic
Regroupe par frontmatter `tags:` ou mots-clés inférés du titre : un sous-répertoire par topic principal.

### custom:<description>
Schéma libre décrit en langage naturel. Inférer la logique depuis la description, proposer le plan avant de l'appliquer.

## Process (commun à tous les schemes)
1. Exécuter survey (ou réutiliser le résultat récent) pour construire l'inventaire.
2. Si `scheme` non fourni : inspecter les fichiers et proposer le scheme le plus pertinent.
3. Construire la carte de déplacement : `source → destination` pour chaque fichier.
4. Détecter les conflits (deux fichiers vers la même destination, champ manquant, etc.).
5. Afficher le plan complet et attendre confirmation.
6. Créer les répertoires cibles et exécuter les déplacements.
7. Si scheme `entity` : afficher le tableau de triage par entité.
8. Rapport : nb déplacés, nb ignorés (conflit), structure résultante.

## Test
Après sort, aucun fichier source n'est perdu. Chaque fichier est dans le sous-répertoire correspondant à son entité/date/type/topic. Si scheme `entity`, le tableau de triage par entité est présent.
