# 01 — Survey

## Inputs
- `path` (required) — répertoire cible

## Outputs
- Rapport console (aucun fichier écrit sauf si l'utilisateur le demande)
- Tableau de synthèse : nom · extension · date · word count · flags

## Process
1. Lister tous les fichiers dans `path` (non-récursif par défaut). Ignorer les sous-répertoires commençant par `_`.
2. Pour chaque fichier : lire taille, date de dernière modification, extension, et les 50 premières lignes.
3. Détecter le frontmatter YAML (bloc entre `---`) et extraire `title`, `date`, `tags` si présents.
4. Compter les mots (approximatif : split sur espaces).
5. Poser les flags :
   - **empty** — corps sans aucun contenu textuel réel après exclusion de : la signature (bloc nom+titre+téléphone), les séparateurs (`--`, `---`), et les blocs de citation (`> …`). Ne pas flaguer si le corps contient un credential (clé API, token, hash hexadécimal long, `whsec_…`) ou des données structurées (nom, numéro, adresse). Un email court avec 1-2 phrases de contenu réel n'est **pas** empty.
   - **attachment-only** — sous-cas de `empty` : corps vide mais `attachments:` non vide. Le fichier est une enveloppe de transmission sans texte propre. Action recommandée : `condense` (réduire au stub frontmatter + liste des pièces jointes), pas `clean`.
   - **duplicate** — même titre ou premier paragraphe quasi-identique à un autre fichier
   - **orphan** — aucune métadonnée exploitable (pas de frontmatter, pas de titre, pas de date) et aucune référence vers ou depuis d'autres fichiers
6. Synthétiser : total fichiers, répartition par extension, plage de dates, items flagués.
7. Détecter les groupes homogènes (N fichiers de structure identique, taille similaire, même expéditeur ou même pattern de nom) et les signaler comme candidats à `digest`.
8. Suggérer la prochaine action selon les flags (beaucoup de doublons → clean ; nommage chaotique → sort ; groupe homogène dense → digest).

## Test
Le rapport produit un tableau avec au moins les colonnes nom et date, et une ligne mentionnant le nombre total de fichiers.
