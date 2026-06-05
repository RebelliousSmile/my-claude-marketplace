# Action 10 — weeklyemail

Collecte les commits de la semaine sur tous les dépôts accessibles d'une plateforme (`github` ou `gitlab`), synthétise l'activité par projet et génère un e-mail client prêt à envoyer.

## Context required

- Plateforme : `github` ou `gitlab`. Si absente, demander : *"GitHub ou GitLab ?"*
- Optionnel : `since` (date ISO ou nombre de jours, défaut = 7 jours). Exemple : `since=monday`, `since=14d`.

## Prompt

### Step 0 — Resolve date range

Compute `since_date` = aujourd'hui − 7 jours (ou la valeur passée via `since`).

```bash
# Linux / macOS
date -d "7 days ago" +%Y-%m-%dT00:00:00Z   # GNU date
date -v-7d +%Y-%m-%dT00:00:00Z             # BSD date (macOS)

# Windows (PowerShell)
(Get-Date).AddDays(-7).ToString("yyyy-MM-ddT00:00:00Z")
```

### Step 1 — List accessible repos with recent activity

**GitHub:**
```bash
gh repo list --limit 200 --json nameWithOwner,pushedAt \
  | jq --arg since "<since_date>" \
    '[.[] | select(.pushedAt >= $since) | .nameWithOwner]'
```

**GitLab:**
```bash
glab api /projects --paginate \
  --field membership=true \
  --field last_activity_after=<since_date> \
  --field per_page=100 \
  | jq '[.[] | {id: .id, path: .path_with_namespace}]'
```

Si la liste est vide → afficher "Aucune activité détectée sur la période." et s'arrêter.

### Step 2 — Fetch commits per repo (parallel agents)

Spawn un agent Haiku par dépôt (max 20 repos en parallèle ; si > 20, prioriser par `pushedAt` décroissant).

**Agent "commits-{repo}"** :

*GitHub :*
```bash
gh api /repos/<nameWithOwner>/commits \
  --field since=<since_date> \
  --field per_page=100 \
  | jq '[.[] | {sha: .sha[0:7], message: .commit.message | split("\n")[0], author: .commit.author.name, date: .commit.author.date}]'
```

*GitLab :*
```bash
glab api /projects/<id>/repository/commits \
  --field since=<since_date> \
  --field per_page=100 \
  | jq '[.[] | {sha: .short_id, message: .title, author: .author_name, date: .created_at}]'
```

Retourner : `{ repo, commits[] }`.

### Step 3 — Synthesize per repo

Pour chaque dépôt avec ≥ 1 commit, produire un résumé en **2-4 phrases** :

- Thèmes principaux inférés des messages de commit (feature, fix, refactor, perf, chore)
- N commits au total
- Auteurs actifs (si plusieurs)
- Points notables (breaking changes, releases, migrations détectées)

Regrouper par thème transverse si plusieurs dépôts partagent le même domaine fonctionnel (ex : `api-*` → "couche API").

### Step 4 — Generate client email

Produire un e-mail en Markdown structuré, **ton professionnel, concis** :

```
Objet : Rapport d'activité hebdomadaire — semaine du {lundi} au {dimanche}

Bonjour,

Voici le résumé des travaux réalisés cette semaine.

---

## {Projet ou groupe fonctionnel}

{Résumé 2-4 phrases}

---

## {Projet ou groupe fonctionnel 2}

{Résumé 2-4 phrases}

---

**Bilan** : {N} commits sur {N} dépôts actifs.

Cordialement,
```

Règles de rédaction :
- Pas de jargon technique brut (SHA, noms de branch internes) — traduire en termes produit/fonctionnel
- Chaque section commence par le bénéfice ou la valeur livrée, pas par le moyen technique
- Les bugs fixes sont mentionnés comme "corrections" ou "stabilisations"
- Les refactors internes non visibles du client sont regroupés sous "Amélioration de la base de code" si mentionnés du tout

### Step 5 — Display and offer

Afficher l'e-mail complet. Proposer ensuite :

> "Souhaitez-vous modifier le ton, fusionner des projets, ou exclure certains dépôts ?"

Si l'utilisateur valide sans modification → c'est terminé.
Si des ajustements sont demandés → appliquer et réafficher.
