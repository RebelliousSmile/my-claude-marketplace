# Recap

Fait le point depuis la ligne de base : la partie entière, pas le dernier lot.

## Inputs

- **Dossier d'état** de la sonde (celui noté par `watch`) — il porte `baseline_head`, `baseline_snapshot` (l'arbre déjà modifié au départ) et le compteur de lots.
- **Dépôt observé**, et le plan s'il a été fourni.

## Process

1. Lire `baseline_head`, `baseline_snapshot` et `batch` dans le dossier d'état. Sans état, le dire et proposer `watch`.
2. Mesurer depuis la base : `git log --oneline <baseline_head>..HEAD`, `git diff --stat <baseline_head>` (commits **et** arbre de travail), et les fichiers non suivis.
3. **Écarter ce qui était déjà là.** Un fichier présent dans `baseline_snapshot` avec la **même signature** (`taille:mtime`) qu'aujourd'hui est préexistant : il ne figure pas dans *Ce qui a bougé* ; le mentionner une fois en *préexistant, hors session*. Signature changée depuis la base → le compter, marqué *mixte* (modifié avant et pendant).
4. Relire les commentaires déjà émis dans cette conversation : les `⚠` restés sans réponse sont des points ouverts.
5. Rédiger :

   ```
   ## Recap — <dépôt> · <n> lots depuis <heure de base>
   **Trajectoire** — 2–3 phrases : où en est le chantier, par rapport au plan s'il existe
   **Ce qui a bougé** — commits, puis fichiers les plus touchés (diff --stat), hors préexistants
   **Préexistant, hors session** — les fichiers écartés à l'étape 3, s'il y en a
   **Points ouverts** — les ⚠ non levés, un par ligne
   **À vérifier en premier** — au plus trois actions concrètes pour l'utilisateur
   ```

## Outputs

- Le recap, en réponse. Aucun fichier écrit. La sonde continue de tourner.

## Test

Le recap cite le nombre de lots égal au contenu du fichier `batch` de l'état, et chaque commit de `git log <baseline_head>..HEAD` y figure ; aucun fichier de `baseline_snapshot` à signature inchangée n'apparaît dans *Ce qui a bougé*.
