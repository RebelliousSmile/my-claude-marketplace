---
name: mail
description: >-
  Sorts, summarizes, merges, and files emails exported as Markdown in
  C:/Users/fxgui/Public/Notes/Thunderbird/. Scans a scope (all of
  Thunderbird/ or a sub-branch), applies the rules in mail-config.yaml,
  proposes validatable action batches, then executes classify / delete /
  merge / summarize / flag-phishing. Detects duplicates, applies prune
  rules, identifies phishing, and logs each session.
  Use when the user invokes /obs:mail. Do NOT use for project management —
  use obs:project instead.
disable-model-invocation: true
model: sonnet
---

# Mail

Processes emails exported as Markdown in `C:/Users/fxgui/Public/Notes/Thunderbird/`.
Scans the scope, analyzes each file, proposes validatable action batches
batch by batch, executes them, and produces a final report.

## Available actions

| #   | Action      | Role                                                              | Input                       |
| --- | ----------- | ----------------------------------------------------------------- | --------------------------- |
| 01  | `scan`      | List all `.md` files in the scope and load mail-config.yaml      | scope (optional)            |
| 02  | `analyze`   | Classify each email according to the two decision passes         | file list + config          |
| 03  | `propose`   | Group decisions into batches and wait for validation             | list of decisions           |
| 04  | `execute`   | Apply a validated batch (classify/delete/merge/summarize/intact/flag-phishing) | validated batch |
| 05  | `report`    | Produce the final processing report                              | accumulated results         |

## Default flow

Internal pipeline — the user never picks an action directly.
The flow is always:

```
01-scan → 02-analyze → 03-propose → [04-execute → 03-propose]* → 05-report
```

The invocation `/obs:mail [branche]` always triggers the full pipeline.

## Transversal rules

### Paths

- Root: `C:/Users/fxgui/Public/Notes/Thunderbird/`
- Config: `<root>/mail-config.yaml`
- Archive: `<root>/.archive/YYYY-MM-DD/`
- Log: `<root>/mail-sessions.log.md`

### Email file format

Mandatory YAML frontmatter:
```yaml
from: "expediteur@domaine.com"
to: "destinataire"
date: 2026-04-09T15:53:35+00:00
subject: Sujet du mail
subject_hash: a00eae
tags: [INBOX]
attachments: []
```
Body in Markdown (HTML artifacts possible).
Naming: `email_YYYY-MM-DD_<exp>_<sujet>_to_<dest>[_N].md`

### Two-pass decision rule

Apply both passes **independently** for each file.
Files with `processed: true` in their frontmatter are excluded from the scan (except with the `--reprocess` flag).

**Pass A — content decision** (decreasing priority):
1. `suppress` match (sender or branch) → action = `delete`
2. Exact duplicate: same `subject_hash` + same `from` + same `date` as another file → action = `delete` (keep the oldest; on a date tie → first alphabetically)
3. `prune` match AND `date < (today - days)` → action = `delete`; `days: 0` = always delete
4. `preserve` match (sender or branch) AND no contrary exception → action = `intact`
5. Detected thread (same normalized `from`+`to`+`subject`, not preserve) → action = `merge`
6. Everything else → action = `summarize`

**Pass B — placement decision** (independent of A):
- The file is not in a level-3 branch (root or under `ATrier/`) → add `classify` toward the proposed branch
- Already classified at the right level → no placement action

A file can have a content action (A) **and** a placement action (B).
Example: a preserve email at root → `intact` + `classify`.

### Thread detection

Same `from` + same `to` + same normalized `subject` (without `Re:`, `Fwd:`, `RE:`, `FW:`, case ignored) → same thread.

If `merge_by_domain: true` in `mail-config.yaml`: normalize `from` to the root domain before comparison.
Rule: extract the last two segments of the domain (e.g. `mail.mondialrelay.com` → `mondialrelay.com`).
Country TLDs are kept as-is (`mondialrelay.fr` ≠ `mondialrelay.com`).

### Thread merge format

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

### Taxonomy for `summarize`

| Type | Detection criteria | Data to keep |
|------|-----------------------|---------------------|
| Transactionnel | livraison, commande, facture, paiement, ticket | montant · référence · date · statut |
| Newsletter/update | Kickstarter, Patreon, blog, newsletter | date · titre · liens d'update |
| Notification/alerte | login, sécurité, espace disque, alerte | service · date · action requise si présente |
| Promotionnel | offre, promo, réduction (hors suppress) | offre · date d'expiration si présente |

Keep the full frontmatter (from/to/date/subject) in all cases.
Replace the body with the key data according to the type, in Markdown list format.

### Phishing detection

If the display name in `from` (e.g. `"Google" <suspicious@domain.com>`) contains a known brand name but the address domain does not match → action = `flag-phishing`.

Default brand list: google, paypal, amazon, apple, microsoft, netflix, impots, ameli, caf, pole-emploi.
Extensible via `mail-config.yaml` (key `phishing_brands`).

### `processed` tag

After any action **except `intact`** (classify, delete, merge, summarize, flag-phishing), add `processed: true` in the frontmatter of the resulting file.
`intact` files are not marked — they remain in the scope of subsequent sessions.
Files with `processed: true` are excluded from the scan by default. Included with the `--reprocess` flag.

### Session log format

`05-report` prepends an entry at the top of `mail-sessions.log.md` for each session:

```markdown
## Session YYYY-MM-DD HH:MM — <périmètre>

- Classify : N · Delete : N · Merge : N · Summarize : N · Intact : N · Phishing : N
- Doublons supprimés : N
- Fichiers epoch signalés : N
- Branches créées : <liste ou "aucune">
```

### mail-config.yaml template

Generate this template if `mail-config.yaml` is absent:

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

### Sub-agent principle (confidentiality)

The `scan` and `analyze` actions delegate via `Agent()`.
Email content never appears in the main chat.
Only file names and proposed decisions bubble up.

### Safety and archiving

- Never delete, merge, rewrite, or move without explicit batch validation.
- Any irreversible action (delete, merge, summarize) first archives the original in `.archive/YYYY-MM-DD/`.
- Missing branches are created during `classify` execution, never before.
- Language of all messages: French.
