# 07 — Condense

Distillation destructive d'un fichier individuel : conserver intacts les éléments à valeur intrinsèque, résumer les idées en prose minimale, éliminer tout le langage de remplissage inutile à la relecture. Le fichier est modifié en place (le contenu original est remplacé).

Utiliser quand un fichier (email, note, compte-rendu) contient trop de verbiage et doit être réduit à l'essentiel sans perdre les données critiques.

## Inputs
- `path` (required) — fichier unique **ou** répertoire
- `filter` (optional) — glob ou critère pour cibler un sous-ensemble si `path` est un répertoire
- `--dry-run` (flag) — afficher le résultat condensé sans modifier le fichier

## Modes

### Fichier unique (`path` = fichier)
Condense le fichier, affiche l'aperçu avant/après, demande confirmation, écrit en place.

### Bucket (`path` = répertoire)
Applique condense à chaque fichier éligible du répertoire. Avant d'écrire quoi que ce soit :
1. Scanner tous les fichiers et calculer leur statut :
   - **skip:credential** — corps contient un pattern de credential (`whsec_`, clé hex longue, token API) → ne jamais modifier
   - **skip:court** — corps < 100 mots après exclusion signature/citations → rien à gagner
   - **attachment-only** — corps vide + `attachments:` non vide → traitement stub (voir section dédiée)
   - **éligible** — tous les autres
2. Afficher un tableau de prévisualisation : un fichier par ligne, statut, word count actuel, gain estimé
3. Attendre confirmation avant d'écrire le premier fichier
4. Traiter les fichiers éligibles un par un ; les `attachment-only` en lot après confirmation séparée

## Outputs
- Fichier(s) modifié(s) en place
- Rapport : nb traités / nb skippés par raison / réduction moyenne en % de mots

## Règles de traitement

**Éléments préservés verbatim — ne jamais résumer ni tronquer :**
- Blocs de code (``` ou `inline`) et commandes shell
- Credentials, tokens, clés API, mots de passe, hash
- Données chiffrées : montants, coordonnées, numéros de référence, IDs techniques
- Inclusions d'images : `![[fichier.png]]` ou `![alt](url)` — conserver telle quelle
- Dates et plages de dates précises
- Liens URL

**Éléments résumés — prose condensée en bullet points ou phrases courtes :**
- Corps de l'email ou de la note : extraire les idées, supprimer les détails rhétoriques
- Instructions et explications : garder le quoi/comment, supprimer la justification verbale si évidente

**Éléments supprimés :**
- Formules de politesse (salutations, remerciements, formules de clôture)
- Répétitions et reformulations de la même idée
- Transitions et connecteurs de remplissage ("par ailleurs", "il convient de noter que", etc.)
- Contexte déjà évident depuis le frontmatter (sujet, expéditeur, date)
- **Citations répétées (priorité haute pour les emails)** : blocs `> …` et sections introduites par `> On … wrote:` ou `---------- Forwarded message ---------`. Ces chaînes de citations s'accumulent exponentiellement dans les threads et constituent la principale source de bruit. Règle : supprimer si le contenu cité est présent dans un autre fichier du même thread (`subject_hash`). Si le fichier est seul dans son thread, remplacer la citation par une ligne de résumé (`> [citation — <expéditeur>, <date>]`).

## Cas particulier — fichier `attachment-only`

Si le corps est vide (hors signature/séparateurs) mais que `attachments:` est non vide, le fichier est une enveloppe de transmission. Le condenser en stub minimal :

```markdown
---
<frontmatter inchangé>
condensed: true
condensed_at: YYYY-MM-DD
---

### Pièces jointes
- [nom-fichier.ext](nom-fichier.ext)
```

Tout le reste (corps vide, signature, séparateurs) est supprimé. Le stub conserve uniquement le frontmatter et la section pièces jointes, ce qui suffit à retrouver les fichiers liés.

## Process
1. Lire le fichier et classifier : credential / court / attachment-only / éligible.
2. Si skip : signaler la raison, ne pas toucher le fichier.
3. Identifier les blocs à préserver verbatim dans le corps.
4. Résumer le reste : extraire les idées clés en bullet points ou phrases courtes.
5. Si `--dry-run` : afficher le résultat condensé et le ratio de réduction, ne pas écrire.
6. Sinon : afficher un aperçu (avant/après mot count) et demander confirmation.
7. Écrire le fichier condensé en place — frontmatter inchangé sauf ajout de `condensed: true` et `condensed_at: YYYY-MM-DD`.
8. Rapport : taille avant → après en mots, ratio de réduction, fichiers skippés.

## Test
Le fichier condensé contient tous les blocs de code et images du fichier original. Le word count du corps est inférieur à l'original. Le frontmatter est identique.
