---
name: mail
description: >-
  Trie, résume, fusionne et classe les emails exportés en Markdown dans
  C:/Users/fxgui/Public/Notes/Thunderbird/. Scanne un périmètre (tout
  Thunderbird/ ou une sous-branche), applique les règles de mail-config.yaml,
  propose des lots d'actions validables, puis exécute classify / delete /
  merge / summarize / flag-phishing. Détecte les doublons, applique les règles
  prune, identifie le phishing, et journalise chaque session.
  Use when the user invokes /obsidian:mail. Do NOT use for project management —
  use obsidian:project instead.
disable-model-invocation: true
model: sonnet
---

# Mail

Traite les emails exportés en Markdown dans `C:/Users/fxgui/Public/Notes/Thunderbird/`.
Scanne le périmètre, analyse chaque fichier, propose des lots d'actions validables
lot par lot, exécute, et produit un rapport final.

## Available actions

| #   | Action      | Role                                                              | Input                       |
| --- | ----------- | ----------------------------------------------------------------- | --------------------------- |
| 01  | `scan`      | Lister tous les `.md` du périmètre et charger mail-config.yaml   | périmètre (optionnel)       |
| 02  | `analyze`   | Classifier chaque email selon les deux passes de décision        | liste de fichiers + config  |
| 03  | `propose`   | Regrouper les décisions en lots et attendre validation           | liste de décisions          |
| 04  | `execute`   | Appliquer un lot validé (classify/delete/merge/summarize/intact/flag-phishing) | lot validé |
| 05  | `report`    | Produire le rapport final de traitement                          | résultats cumulés           |

## Default flow

Pipeline interne — l'utilisateur ne choisit jamais une action directement.
Le flux est toujours :

```
01-scan → 02-analyze → 03-propose → [04-execute → 03-propose]* → 05-report
```

L'invocation `/obsidian:mail [branche]` déclenche toujours le pipeline complet.

## Transversal rules

### Chemins

- Racine : `C:/Users/fxgui/Public/Notes/Thunderbird/`
- Config : `<racine>/mail-config.yaml`
- Archive : `<racine>/.archive/YYYY-MM-DD/`
- Log : `<racine>/mail-sessions.log.md`

### Format des fichiers email

Frontmatter YAML obligatoire :
```yaml
from: "expediteur@domaine.com"
to: "destinataire"
date: 2026-04-09T15:53:35+00:00
subject: Sujet du mail
subject_hash: a00eae
tags: [INBOX]
attachments: []
```
Corps en Markdown (artefacts HTML possibles).
Nommage : `email_YYYY-MM-DD_<exp>_<sujet>_to_<dest>[_N].md`

### Règle de décision en deux passes

Appliquer les deux passes **indépendamment** pour chaque fichier.
Les fichiers avec `processed: true` dans leur frontmatter sont exclus du scan (sauf flag `--reprocess`).

**Passe A — décision de contenu** (priorité décroissante) :
1. `suppress` match (expéditeur ou branche) → action = `delete`
2. Doublon exact : même `subject_hash` + même `from` + même `date` qu'un autre fichier → action = `delete` (conserver le plus ancien ; à égalité de date → premier alphabétiquement)
3. `prune` match ET `date < (aujourd'hui - days)` → action = `delete` ; `days: 0` = toujours supprimer
4. `preserve` match (expéditeur ou branche) ET aucune exception contraire → action = `intact`
5. Thread détecté (même `from`+`to`+`subject` normalisé, non preserve) → action = `merge`
6. Tout le reste → action = `summarize`

**Passe B — décision de placement** (indépendante de A) :
- Le fichier n'est pas dans une branche de niveau 3 (racine ou sous `ATrier/`) → ajouter `classify` vers branche proposée
- Déjà classé au bon niveau → aucune action de placement

Un fichier peut avoir une action de contenu (A) **et** une action de placement (B).
Exemple : un email preserve en racine → `intact` + `classify`.

### Détection de thread

Même `from` + même `to` + même `subject` normalisé (sans `Re:`, `Fwd:`, `RE:`, `FW:`, casse ignorée) → même thread.

Si `merge_by_domain: true` dans `mail-config.yaml` : normaliser `from` en domaine racine avant comparaison.
Règle : extraire les deux derniers segments du domaine (ex: `mail.mondialrelay.com` → `mondialrelay.com`).
Les TLDs de pays sont conservés tels quels (`mondialrelay.fr` ≠ `mondialrelay.com`).

### Format de fusion de thread

```markdown
---
from: expediteur@domaine.com
to: destinataire
date_start: YYYY-MM-DD
date_end: YYYY-MM-DD
subject: Sujet normalisé
thread_count: N
---

- YYYY-MM-DD — Titre ou sujet du message — https://lien-si-présent
- YYYY-MM-DD — Titre ou sujet du message — (pas de lien)
```

### Taxonomie pour `summarize`

| Type | Critères de détection | Données à conserver |
|------|-----------------------|---------------------|
| Transactionnel | livraison, commande, facture, paiement, ticket | montant · référence · date · statut |
| Newsletter/update | Kickstarter, Patreon, blog, newsletter | date · titre · liens d'update |
| Notification/alerte | login, sécurité, espace disque, alerte | service · date · action requise si présente |
| Promotionnel | offre, promo, réduction (hors suppress) | offre · date d'expiration si présente |

Conserver le frontmatter complet (from/to/date/subject) dans tous les cas.
Remplacer le corps par les données clés selon le type, au format liste Markdown.

### Détection de phishing

Si le nom affiché dans `from` (ex: `"Google" <suspicious@domain.com>`) contient un nom de marque connue mais que le domaine de l'adresse ne correspond pas → action = `flag-phishing`.

Liste de marques par défaut : google, paypal, amazon, apple, microsoft, netflix, impots, ameli, caf, pole-emploi.
Extensible via `mail-config.yaml` (clé `phishing_brands`).

### Tag `processed`

Après toute action **sauf `intact`** (classify, delete, merge, summarize, flag-phishing), ajouter `processed: true` dans le frontmatter du fichier résultant.
Les fichiers `intact` ne sont pas marqués — ils restent dans le périmètre des sessions suivantes.
Fichiers avec `processed: true` exclus du scan par défaut. Inclus si flag `--reprocess`.

### Format du journal de session

`05-report` ajoute une entrée en tête de `mail-sessions.log.md` à chaque session :

```markdown
## Session YYYY-MM-DD HH:MM — <périmètre>

- Classify : N · Delete : N · Merge : N · Summarize : N · Intact : N · Phishing : N
- Doublons supprimés : N
- Fichiers epoch signalés : N
- Branches créées : <liste ou "aucune">
```

### Template mail-config.yaml

Générer ce template si `mail-config.yaml` est absent :

```yaml
# Emails et branches à conserver intacts (ne pas résumer, ne pas fusionner)
preserve:
  senders: []        # ex: - domain: gmail.com
  branches: []       # ex: - Banque/

# Emails et branches à supprimer (spam, notifications sans valeur)
suppress:
  senders: []        # ex: - domain: klaviyo.com
  branches: []       # ex: - Publicités/Spam/

# Exceptions aux règles preserve/suppress
exceptions: []       # ex: - address: foo@bar.com\n  action: preserve

# Suppression automatique par âge (days: 0 = toujours supprimer)
prune: []
# ex:
#   - branch: Publicités/Spam/
#     days: 0
#   - sender:
#       domain: jeveuxtravailler.com
#     days: 7

# Fusionner les threads par domaine racine plutôt que par adresse exacte
merge_by_domain: false

# Marques à surveiller pour la détection phishing (complète la liste par défaut)
phishing_brands: []
# ex: - bnp
#     - credit-agricole
```

### Principe sous-agent (confidentialité)

Les actions `scan` et `analyze` délèguent via `Agent()`.
Le contenu des emails n'apparaît jamais dans le chat principal.
Seuls les noms de fichiers et les décisions proposées remontent.

### Sécurité et archivage

- Jamais supprimer, fusionner, réécrire ou déplacer sans validation explicite du lot.
- Toute action irréversible (delete, merge, summarize) archive d'abord l'original dans `.archive/YYYY-MM-DD/`.
- Les branches manquantes sont créées lors de l'exécution `classify`, jamais avant.
- Langue de tous les messages : français.
