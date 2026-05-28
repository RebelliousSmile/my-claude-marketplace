# 02 - Analyze

Classifier chaque email selon les deux passes de décision et produire la liste des décisions.

## Inputs

- `file_list` — liste des chemins absolus des `.md` à analyser (depuis `01-scan`)
- `config` — contenu parsé de `mail-config.yaml`
- `prelim_report` — rapport préliminaire depuis `01-scan` (ATrier/, epoch)

## Outputs

- `decisions` — liste structurée : pour chaque fichier, `content_action` + `placement_action` + métadonnées
- `analyze_summary` — compteurs et anomalies pour `05-report`

## Process

1. Afficher le `prelim_report` reçu de `01-scan` si non vide (fichiers ATrier/, epoch).

2. **Déléguer à un sous-agent (`model: sonnet`)** avec pour mission :

   **Pré-traitement :**
   - Lire le frontmatter YAML de chaque fichier (from, to, date, subject, subject_hash)
   - Lire le corps si nécessaire pour la taxonomie `summarize` ou la détection phishing

   **Détection de doublons (avant Passe A) :**
   - Regrouper par `(subject_hash, from, date)` → si N > 1 → doublon exact
   - Dans chaque groupe de doublons : conserver 1) le fichier à la date la plus ancienne ; 2) à égalité → premier alphabétiquement
   - Marquer tous les autres membres du groupe : `content_action: delete`, `duplicate: true`

   **Passe A — décision de contenu** (priorité décroissante, appliquée aux fichiers non-doublons) :
   1. `suppress` match (adresse `from` ou branche contient une règle `suppress`) → `delete`
   2. `prune` match ET `date < (aujourd'hui - days)` → `delete` ; `days: 0` = toujours supprimer
   3. `preserve` match (adresse `from` ou branche, aucune exception contraire) → `intact`
   4. Thread : même `from` + `to` + `subject` normalisé (sans Re:/Fwd:/RE:/FW:, casse ignorée) partagé avec ≥1 autre fichier non-preserve → `merge`
      - Si `merge_by_domain: true` dans config : normaliser `from` en domaine racine (deux derniers segments, ex: `mail.mondialrelay.com` → `mondialrelay.com`) avant comparaison ; TLDs de pays conservés (`.fr` ≠ `.com`)
   5. Sinon → `summarize`

   **Passe B — décision de placement** (indépendante de A) :
   - Fichier en racine directe ou dans tout sous-dossier `ATrier/` → `classify` vers branche proposée (niveau 3)
   - Déjà dans une branche niveau-3 → `none`

   **Taxonomie summarize** (lire corps si nécessaire) :
   - `transactionnel` : livraison, commande, facture, paiement, ticket
   - `newsletter` : Kickstarter, Patreon, blog, newsletter, update
   - `notification` : login, sécurité, espace disque, alerte
   - `promotionnel` : offre, promo, réduction

   **Détection phishing** :
   - Si nom affiché dans `from` contient une marque connue mais domaine de l'adresse ne correspond pas → `flag-phishing`
   - Marques par défaut : google, paypal, amazon, apple, microsoft, netflix, impots, ameli, caf, pole-emploi
   - Compléter avec `config.phishing_brands` si présent
   - Remplace le `content_action` calculé par `flag-phishing`

   **Retourner** la liste de décisions (sans contenu des emails)

3. Recevoir la liste de décisions du sous-agent.

4. Vérifier la cohérence :
   - Les threads `merge` sont bien groupés (même `merge_group`)
   - Aucun fichier `preserve` n'a `content_action: delete` (sauf si doublon exact)

5. Retourner `decisions` et `analyze_summary` pour transmission à `03-propose`.

## Format de sortie des décisions

```yaml
decisions:
  - path: "C:/Users/fxgui/Public/Notes/Thunderbird/Internet/..."
    from: "expediteur@domaine.com"
    date: "2026-04-09"
    subject: "Sujet du mail"
    content_action: summarize    # delete | intact | merge | summarize | flag-phishing
    placement_action: none       # classify | none
    classify_target: null        # branche cible si placement_action=classify
    summary_type: newsletter     # transactionnel | newsletter | notification | promotionnel | null
    merge_group: null            # slug de groupe pour les threads
    duplicate: false             # true si doublon supprimé
```

## Test

- `decisions` contient une entrée pour chaque fichier de `file_list`.
- Les threads `merge` partagent le même `merge_group`.
- Aucun fichier `preserve` n'a `content_action: delete` (sauf `duplicate: true`).
- Les doublons ont `content_action: delete` et `duplicate: true`.
- Les fichiers phishing ont `content_action: flag-phishing`.
- `from`, `date`, `subject` sont renseignés pour chaque décision.
- Aucun contenu d'email n'est apparu dans le chat principal.
