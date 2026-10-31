# Recap

Fait le point depuis la ligne de base : la partie entière, pas le dernier lot.

## Inputs

- **Dossier d'état** de la sonde (celui noté par `watch`) — il porte `baseline_head` et le compteur de lots.
- **Dépôt observé**, et le plan s'il a été fourni.

## Process

1. Lire `baseline_head` et `batch` dans le dossier d'état. Sans état, le dire et proposer `watch`.
2. Mesurer depuis la base : `git log --oneline <baseline_head>..HEAD`, `git diff --stat <baseline_head>` (commits **et** arbre de travail).
3. Relire les commentaires déjà émis dans cette conversation : les `⚠` restés sans réponse sont des points ouverts.
4. Rédiger :

   ```
   ## Recap — <dépôt> · <n> lots depuis <heure de base>
   **Trajectoire** — 2–3 phrases : où en est le chantier, par rapport au plan s'il existe
   **Ce qui a bougé** — commits, puis fichiers les plus touchés (diff --stat)
   **Points ouverts** — les ⚠ non levés, un par ligne
   **À vérifier en premier** — au plus trois actions concrètes pour l'utilisateur
   ```

## Outputs

- Le recap, en réponse. Aucun fichier écrit. La sonde continue de tourner.

## Test

Le recap cite le nombre de lots égal au contenu du fichier `batch` de l'état, et chaque commit de `git log <baseline_head>..HEAD` y figure.
