# Action 08 — weeklyemail

Collecte les commits de la semaine sur les dépôts accessibles d'une plateforme (`github` ou `gitlab`), synthétise l'activité par thème fonctionnel et génère un e-mail client prêt à envoyer.

## Context required

- Plateforme : `github` ou `gitlab`. Si absente, demander : *"GitHub ou GitLab ?"*
- Optionnel : `since` (date ISO ou nombre de jours, défaut = 7 jours). Exemple : `since=monday`, `since=14d`.
- Optionnel : `author` (défaut = **utilisateur courant**, voir Step 0). `author=all` pour inclure tous les auteurs.

## Prompt

### Step 0 — Resolve date range and author

Compute `since_date` = aujourd'hui − 7 jours (ou la valeur passée via `since`).

```bash
# Linux / macOS
date -d "7 days ago" +%Y-%m-%dT00:00:00Z   # GNU date
date -v-7d +%Y-%m-%dT00:00:00Z             # BSD date (macOS)

# Windows (PowerShell)
(Get-Date).AddDays(-7).ToString("yyyy-MM-ddT00:00:00Z")
```

**Auteur par défaut = l'utilisateur courant.** Le rapport hebdo concerne presque toujours « mes commits ». Résoudre le nom à filtrer :

```bash
git config user.name          # nom de committer local (filtre par défaut)
glab api /user | jq -r .name  # GitLab : nom du compte authentifié
gh api /user   | jq -r .name  # GitHub : nom du compte authentifié
```

Filtrer sur ce nom sauf si `author=all` est passé. En cas de doute sur l'orthographe exacte (accents, etc.), confirmer le nom retenu avec l'utilisateur avant de générer.

### Step 1 — List accessible repos with recent activity

**GitHub:**
```bash
gh repo list --limit 200 --json nameWithOwner,pushedAt \
  | jq --arg since "<since_date>" \
    '[.[] | select(.pushedAt >= $since) | .nameWithOwner]'
```

**GitLab:**
```bash
glab api "/projects?membership=true&last_activity_after=<since_date>&per_page=100" --paginate \
  | jq -c '[.[] | {id: .id, path: .path_with_namespace, last: .last_activity_at}] | sort_by(.last) | reverse'
```

Si la liste est vide → afficher "Aucune activité détectée sur la période." et s'arrêter.

### Step 2 — Fetch commits per repo

Pour chaque dépôt, récupérer les commits de l'auteur retenu, **merges exclus**.

- Proportionnalité : ≤ ~6 dépôts → traiter en direct (boucle shell), pas d'agents. > 6 dépôts → un agent Haiku par dépôt (max 20 en parallèle, prioriser par activité décroissante).
- `since` filtre la **committed date** (GitLab) / **commit date** (GitHub) — c'est la bonne fenêtre. Si le volume paraît anormal, vérifier les dates réelles (`committed_date`) avant de conclure.

*GitHub :*
```bash
gh api "/repos/<nameWithOwner>/commits?since=<since_date>&per_page=100" --paginate \
  | jq -r '.[] | select(.commit.author.name=="<AUTHOR>") | select(.commit.message|test("^Merge ")|not)
           | "\(.sha[0:7]) | \(.commit.message|split("\n")[0])"'
```

*GitLab :*
```bash
glab api "/projects/<id>/repository/commits?since=<since_date>&per_page=100" --paginate \
  | jq -r '.[] | select(.author_name=="<AUTHOR>") | select(.title|test("^Merge ")|not)
           | "\(.short_id) | \(.title)"'
```

Retourner `{ repo_path, commits[] }`. Conserver le **chemin/nom exact du dépôt** (`path_with_namespace` ou `nameWithOwner`) — il sera cité tel quel dans l'e-mail.

### Step 3 — Synthesize by functional theme

Regrouper l'activité par **thème fonctionnel transverse** (CMS, sécurité, authentification, performances, nouvelle feature…), pas dépôt par dépôt. Un même thème peut couvrir plusieurs dépôts.

Pour chaque thème :
- Identifier la valeur livrée (bénéfice produit, pas le moyen technique).
- **Attribuer le dépôt en face de la ligne qu'il concerne**, avec son **nom exact** + un libellé fonctionnel court entre parenthèses (ex : `mjson-api` (API mobile), `multivitrines` (site public), `composercorefunctions` (bibliothèque PHP commune)). Jamais dans un en-tête au-dessus de la section. Ne jamais désigner un projet par un libellé vague seul (« le site public », « la lib commune ») — toujours le nom du dépôt.
- Pour un thème multi-dépôts (ex : sécurité), une ligne par dépôt, chacune portant son nom.
- Mettre en avant en premier le chantier principal de la semaine si l'utilisateur l'a indiqué.

### Step 4 — Generate client email

Produire un e-mail en Markdown structuré, **ton professionnel, concis** :

```
Objet : Rapport d'activité hebdomadaire — semaine du {lundi} au {dimanche}

Bonjour,

Voici le résumé des travaux réalisés cette semaine.

---

## {Thème fonctionnel}

- **{Point livré}** (`nom-exact` (libellé)) : {détail}
- **{Autre point}** (`autre-dépôt` (libellé)) : {détail}

---

## {Thème fonctionnel 2}

{Résumé — le dépôt est cité en fin de chaque ligne concernée : `nom-exact` (libellé)}

---

**Bilan** : interventions réparties sur N dépôts — `nom-1` (libellé), `nom-2` (libellé), …

Cordialement,
```

Règles de rédaction :
- **Le dépôt est cité en face de la ligne qu'il concerne**, jamais dans un paragraphe d'en-tête au-dessus de la section. Chaque point/ligne porte son `nom-exact` (libellé) ; pas de bloc `*Dépôts : …*` sous le titre.
- **Pas de décompte de commits** — ni par section, ni dans le bilan. Le bilan liste les dépôts concernés, pas des chiffres.
- Pas de jargon technique brut (SHA, noms de branche internes) — traduire en termes produit/fonctionnel.
- Chaque section commence par le bénéfice ou la valeur livrée, pas par le moyen technique.
- Les bugs fixes sont mentionnés comme "corrections" ou "stabilisations".
- Les refactors internes non visibles du client sont regroupés sous "Amélioration de la base de code" si mentionnés du tout.

### Step 5 — Display and offer

Afficher l'e-mail complet. Proposer ensuite :

> "Souhaitez-vous modifier le ton, fusionner des thèmes, ou exclure certains dépôts ?"

Si l'utilisateur valide sans modification → c'est terminé.
Si des ajustements sont demandés → appliquer et réafficher.
