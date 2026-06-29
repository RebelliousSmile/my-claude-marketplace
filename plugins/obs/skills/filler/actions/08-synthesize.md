# 08 — Synthesize

Transformation d'un ensemble d'emails (ou de communications) en un document d'information. Les sources sont dissoutes : la forme email disparaît, seule l'information subsiste. Le résultat est un fichier de contenu organisé par thème, non par date ou expéditeur.

Utiliser quand plusieurs emails sur un même sujet ou thread contiennent des informations qui peuvent être regroupées en un seul document utile. La valeur est dans l'information, pas dans l'échange.

Différences avec les autres actions :
- **`digest`** — N fichiers homogènes (même structure) → 1 table de données. Pour les notifications répétitives.
- **`merge`** — N fichiers → 1 fichier avec TOC. La structure email est conservée.
- **`synthesize`** — N fichiers de communication → 1 document d'information. La structure email disparaît.

## Inputs
- `path` (required) — répertoire ou liste de fichiers
- `filter` (required) — critère pour identifier le groupe : glob, `subject_hash`, tag, pattern de nom, ou description libre
- `output` (optional) — nom du fichier de sortie. Défaut : titre inféré du sujet commun + plage de dates
- `--keep-sources` (flag) — ne pas supprimer les sources après confirmation (défaut : suppression)

## Outputs
- 1 document d'information au niveau du bucket courant
- Sources supprimées après confirmation (sauf `--keep-sources`)

## Format du document produit

```yaml
---
title: <titre descriptif du sujet, pas du thread>
type: note
subtype: synthesized
source: <description du filtre ou liste des fichiers sources>
participants: [Prénom Nom, Prénom Nom]
date_range: YYYY-MM-DD / YYYY-MM-DD
synthesized_at: YYYY-MM-DD
---
```

Corps organisé par sections thématiques, pas chronologiquement :

```markdown
## Contexte
<ce qu'il faut savoir pour comprendre le sujet — 2-5 phrases>

## Décisions
- <décision 1> — <date si pertinente>
- <décision 2>

## Points ouverts
- <question non résolue ou action en attente>

## Informations clés
<données factuelles, chiffres, références, liens — toujours préservés verbatim>
```

Sections présentes uniquement si elles ont du contenu. Adapter les titres au domaine.

## Règles de traitement

**Préserver verbatim :**
- Credentials, tokens, clés API, données chiffrées
- Chiffres, montants, dates précises, IDs techniques
- URLs et liens
- Blocs de code et commandes

**Extraire et reformuler :**
- Positions, décisions, demandes exprimées dans les emails
- Contexte implicite dans les échanges (ce qui est sous-entendu mais informatif)

**Supprimer :**
- Formules de politesse, remerciements, salutations
- Répétitions d'une même information dans différents emails
- Citations redondantes
- Métadonnées de communication (from/to/date) — elles passent dans le frontmatter `participants` et `date_range`

## Process
1. Identifier les fichiers correspondant à `filter`.
2. Lire tous les fichiers et extraire les informations : décisions, contexte, faits, points ouverts.
3. Dédupliquer : si la même information apparaît dans plusieurs emails, la garder une seule fois.
4. Construire le document organisé par sections thématiques.
5. Afficher un aperçu du document et la liste des sources à supprimer.
6. Demander confirmation.
7. Écrire le document, supprimer les sources (sauf `--keep-sources`).
8. Rapport : nb sources traitées, nb sections produites, chemin du fichier.

## Test
Le document produit ne contient aucune formule de politesse ni structure d'email. Toutes les informations factuelles des sources sont présentes. Le word count du document est inférieur à la somme des sources.
