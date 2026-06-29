# Email converti en Markdown — format de référence

Les fichiers email convertis en Markdown suivent une convention stable. Cette fiche permet à `filler` d'identifier, trier, résumer, fusionner et nettoyer ces fichiers correctement.

## Nom de fichier

```
email_YYYY-MM-DD_<ExpéditeurCourt>_<SujetCourt>_to_<DestinataireCourt>.md
```

- `YYYY-MM-DD` — date de l'email (source canonique pour le tri)
- `<ExpéditeurCourt>` — 7-8 premiers caractères du nom de l'expéditeur (CamelCase, sans espaces)
- `<SujetCourt>` — 12 premiers caractères du sujet (sans espaces ni caractères spéciaux)
- `<DestinataireCourt>` — idem pour le destinataire

Exemples :
- `email_2026-06-01_DaviEspi_NouveauMessa_to_FranGuil.md`
- `email_2026-06-01_OnetCdg_MatérielSmar_to_Pro.md`

## Frontmatter YAML

```yaml
---
from: Prénom Nom <email@domaine.com>
to: Prénom Nom <email@domaine.com>          # ou alias court (ex: pro@fxguillois.email)
date: 2026-06-01T11:04:11+00:00             # ISO 8601 avec timezone
subject: 'Sujet complet de l'email'         # guillemets simples si caractères spéciaux
subject_hash: 8def16                        # 6 caractères — identifiant de thread
tags:
  - INBOX                                   # chemin de dossier (style IMAP)
  - INBOX/smartlockers/clients/onet
attachments:
  - 2026-06-01_nom-fichier.ext             # fichiers joints présents dans le même répertoire
email_type: direct | mailing_list
---
```

### Champs clés pour filler

| Champ | Usage dans filler |
|-------|-------------------|
| `date` | Tri chronologique, critère `old:<date>` dans clean |
| `from` | Tri par expéditeur, regroupement de conversations |
| `to` | Utilisé à la place de `from` quand l'expéditeur est le propriétaire du vault (voir ci-dessous) |
| `subject_hash` | Détection de threads (emails du même fil = même hash) |
| `tags` | Équivalent du dossier IMAP — tri par tag = tri par dossier |
| `email_type` | `mailing_list` = candidat prioritaire pour clean |
| `attachments` | Permet de ne pas supprimer un email si sa pièce jointe est unique |

### Emails envoyés — règle d'entité

Quand `from:` est l'adresse du propriétaire du vault, le fichier est une **réponse dans une conversation**. L'entité significative est le **correspondant**, pas l'expéditeur. Dans ce cas, `filler` utilise `to:` pour déterminer l'entité bucket.

- `from: moi@…` → entité = destinataire (`to:`)
- `from: quelqu'un@…` → entité = expéditeur (`from:`)

Le propriétaire est identifié par heuristique : les adresses email qui apparaissent le plus souvent en `from:` dans des fichiers dont le nom contient `GuilXavi` ou l'alias connu (`pro@`, `fx@`). Si ambiguïté, demander à l'utilisateur de confirmer ses adresses avant de trier.

### Bruit des citations répétées

L'objectif de convertir les emails en markdown est de **limiter le bruit**. La principale source de bruit est le **chaînage des citations** : chaque réponse inclut la réponse précédente, qui inclut celle d'avant, etc. Un fil de 5 échanges peut ainsi contenir 4 copies du premier message.

Dans `condense`, les blocs de citation (lignes commençant par `>`, ou sections introduites par `> On ... wrote:`, `---------- Forwarded message ---------`) sont des cibles **prioritaires** de suppression, à condition que le contenu cité soit déjà présent dans un autre fichier du même thread (`subject_hash`). S'il n'existe qu'un seul fichier du thread, conserver un résumé de la citation plutôt que de la supprimer.

## Corps du document

Structure typique (ordre variable) :

1. **Corps principal** — texte libre, souvent en markdown léger
2. **Signature** — bloc texte avec nom, titre, coordonnées (identifiable par pattern nom+titre+téléphone)
3. **Message transféré** — introduit par `---------- Forwarded message ---------`
4. **Pièces jointes** — section `### Pieces jointes :` avec liens markdown vers les fichiers

## Actions filler adaptées aux emails MD

### survey
- Grouper par `email_type` (direct vs mailing_list)
- Grouper par `tags` (dossier IMAP)
- Détecter les threads : fichiers partageant le même `subject_hash`
- Flaguer `empty` : corps < 30 mots hors signature et pièces jointes
- Flaguer `duplicate` : deux fichiers avec le même `subject_hash` et le même `from`

### sort
Schémas recommandés pour des emails :
- **Par tag** : reproduire la hiérarchie IMAP en sous-dossiers (`INBOX/smartlockers/clients/onet` → `smartlockers/clients/onet/`)
- **Par expéditeur** : un sous-dossier par domaine `from`
- **Par date** : sous-dossiers `YYYY-MM/`

### digest
Cas d'usage principal : notifications automatiques système (depuis `noreply@…`, sujet répétitif, corps d'une seule ligne).

**Exemple — ONET CDG MatérielSmar** :
- Filtre : `from: ONET CDG <noreply@smartlockers.io>` + sujet contenant "n'a pas été remis"
- Schéma extrait :
  - `date` et `heure` → champ frontmatter `date` (ISO 8601)
  - `machine` → `(ONET1)` en fin de sujet
  - `equipment_id` → `CDG-SMAR-XXXXX` dans le sujet et le corps
  - `agent_name` → `PRÉNOM NOM` avant la parenthèse dans le corps
  - `badge_id` → code hexadécimal entre parenthèses dans le corps
- Sortie : tableau markdown dans `<Subcategory>/YYYY/MM/onet/ONET CDG - Matériel non rendu - YYYY-MM.md` (reste dans le bucket mensuel, pas remonté à `<Subcategory>`)
- Sources supprimées après confirmation

**Distinction emails client ONET vs notifications** : les vrais emails client (NouveauCompt, demandes) restent en fichiers individuels et passent par `sort`.

### index
- `group-by: thread` recommandé : grouper par `subject_hash`, une section H2 par fil de conversation
- Chaque entrée : `- [[nom-de-fichier]] — expéditeur, date, résumé en 1 ligne`
- Ignorer les signatures et messages transférés pour la description courte

### merge
- Regrouper par thread (`subject_hash`) pour reconstituer des conversations complètes
- Trier par `date` ASC dans le fichier fusionné
- En-tête H2 = sujet du thread

### clean
Critères pertinents pour des emails :
- `empty` — corps < 30 mots (notifications automatiques sans contenu utile)
- `mailing_list` — `email_type: mailing_list` après une date donnée
- `duplicate` — même `subject_hash` + même `from` (doublon d'envoi)
- Vérifier `attachments` avant suppression : ne pas supprimer si la pièce jointe n'existe que dans cet email

## Fichiers associés dans le répertoire

Les pièces jointes référencées dans `attachments:` sont dans le **même répertoire** que le fichier email, avec le même préfixe de date. Elles portent le suffixe `_2`, `_3` etc. si le même nom de fichier existe plusieurs fois (doublons d'import).

Exemple :
```
email_2026-06-01_DaviEspi_NouveauMessa_to_FranGuil.md
2026-06-01_msg0016_2.WAV          ← pièce jointe référencée
```
