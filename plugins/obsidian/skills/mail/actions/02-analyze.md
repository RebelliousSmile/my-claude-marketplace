# 02 - Analyze

Classifier chaque email selon les deux passes de décision et produire la liste des décisions.

## Inputs

- `file_list` — liste des chemins absolus des `.md` à analyser (depuis `01-scan`)
- `config` — contenu parsé de `mail-config.yaml`

## Outputs

- `decisions` — liste structurée : pour chaque fichier, `content_action` + `placement_action` + métadonnées

## Process

1. **Déléguer à un sous-agent** (`Agent` tool) avec pour mission :
   - Pour chaque fichier de `file_list`, lire le **frontmatter YAML uniquement** (pas le corps complet sauf si nécessaire pour la taxonomie `summarize`)
   - Appliquer la **Passe A** (décision de contenu) :
     1. L'adresse `from` ou la branche matche une règle `suppress` (et aucune exception contraire) → `delete`
     2. L'adresse `from` ou la branche matche une règle `preserve` (et aucune exception contraire) → `intact`
     3. Même `from` + `to` + `subject` normalisé qu'un autre fichier (sans Re:/Fwd:/RE:/FW:, casse ignorée) → `merge` (grouper avec les autres membres du thread)
     4. Sinon → `summarize`
   - Appliquer la **Passe B** (décision de placement) :
     - Le fichier n'est pas dans une sous-branche de niveau 3 (est en racine ou dans `ATrier/`) → `classify` vers branche proposée (niveau 3)
     - Déjà dans une branche niveau-3 → `none`
   - Pour chaque `summarize`, identifier le **type** selon la taxonomie :
     - `transactionnel` : livraison, commande, facture, paiement, ticket
     - `newsletter` : Kickstarter, Patreon, blog, newsletter, update
     - `notification` : login, sécurité, espace disque, alerte
     - `promotionnel` : offre, promo, réduction
   - Retourner la liste de décisions (sans contenu des emails)

2. Recevoir la liste de décisions du sous-agent.

3. Vérifier la cohérence :
   - Les threads `merge` sont bien groupés (tous les membres du thread ont le même group_id)
   - Les décisions `delete` ne concernent pas des fichiers en branche `preserve`

4. Retourner `decisions` pour transmission à `03-propose`.

## Format de sortie des décisions

```yaml
decisions:
  - path: "C:/Users/fxgui/Public/Notes/Thunderbird/Internet/..."
    content_action: summarize   # delete | intact | merge | summarize
    placement_action: none      # classify | none
    classify_target: null       # branche cible si placement_action=classify
    summary_type: newsletter    # transactionnel | newsletter | notification | promotionnel | null
    merge_group: null           # identifiant de groupe pour les threads (ex: "bingo@patreon.com|fxg|miska-maps")
```

## Test

- `decisions` contient une entrée pour chaque fichier de `file_list`.
- Les threads `merge` partagent le même `merge_group`.
- Aucun fichier d'une branche `preserve` n'a `content_action: delete`.
- Aucun contenu d'email n'est apparu dans le chat principal.
