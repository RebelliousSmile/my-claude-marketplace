# Action 09 — aiddlegacy

Nettoie une installation AIDD antérieure à v4 dans le `.claude/` du projet courant : scan → rapport dry-run → confirmation → suppression → arbitrage rules.

## Context required

Être à la racine du projet contenant un `.claude/` à nettoyer.
Le cache `~/.claude/plugins/cache/aidd-framework/` doit exister (il fournit le référentiel des handles v4).

## Prompt

Execute the following workflow verbatim:

---

### Step 1 — Scan

**1a. Construire le référentiel des handles v4.**

Scanner `~/.claude/plugins/cache/aidd-framework/` — plugins `aidd-dev`, `aidd-refine`, `aidd-context`. Pour chaque skill trouvé sous `<plugin>/<version>/skills/<NN>-<name>/`, extraire le **nom court** (ex. `01-plan` → `plan`, `02-project-init` → `project-init`, `01-brainstorm` → `brainstorm`). C'est l'ensemble des handles v4.

**1b. Scanner `.claude/` du projet courant.**

Collecter :
- `agents/` — lister les fichiers présents (s'il existe).
- `commands/` — lister chaque fichier `.md`. Pour chacun, normaliser son nom (retirer préfixe `aidd:`, numéros `NN:`, tirets et underscores → nom court). Chercher un match laxiste dans les handles v4. Classer : **transféré** (match) ou **sans équivalent** (pas de match).
- `skills/` — idem par dossier.
- `rules/` — lister tous les fichiers récursivement, grouper par sous-dossier de premier niveau (= catégorie). Classer les fichiers hors sous-dossier sous `(racine)`.

---

### Step 2 — Rapport dry-run

Afficher le rapport complet. **Aucune modification à cette étape.**

```
🔍 aiddlegacy — rapport dry-run
Projet : <cwd>

📁 agents/
  → SUPPRIMER (<N> agents) : <liste>
  (absent — rien à faire)              ← si le dossier n'existe pas

📂 commands/
  → SUPPRIMER (transférés en plugin) :
      plan.md            (→ aidd-dev:plan)
      implement.md       (→ aidd-dev:implement)
      …
  → CONSERVER (sans équivalent plugin) :
      mon-custom.md
      …
  (absent — rien à faire)

📂 skills/
  → SUPPRIMER (transférés en plugin) :
      aidd-plan/         (→ aidd-dev:plan)
      …
  → CONSERVER (sans équivalent plugin) :
      mon-skill-perso/
      …
  (absent — rien à faire)

📂 rules/
  00-architecture/    <N> fichier(s) : <liste>
  01-standards/       <N> fichier(s) : <liste>
  07-quality/         <N> fichier(s) : <liste>
  (racine)            <N> fichier(s) : <liste>  ← hors catégories
  (absent — rien à faire)

Aucun fichier modifié.
→ Confirmer pour appliquer la suppression de agents/ + commands/ transférés + skills/ transférés ?
  Les rules seront arbitrées séparément à l'étape suivante.
  [oui / non]
```

Attendre la confirmation de l'utilisateur avant de continuer.

---

### Step 3 — Appliquer (sur confirmation « oui »)

Exécuter les suppressions :
1. Supprimer le dossier `agents/` en entier (s'il existait).
2. Supprimer chaque fichier `commands/` classé **transféré**.
3. Supprimer chaque dossier `skills/` classé **transféré**.

Ne pas toucher aux éléments **conservés** ni aux `rules/`.

Afficher un résumé concis :

```
✅ Suppression effectuée
  - agents/           supprimé
  - commands/         N fichier(s) supprimé(s), M conservé(s)
  - skills/           N dossier(s) supprimé(s), M conservé(s)
```

---

### Step 4 — Arbitrage rules

Si `.claude/rules/` est absent ou vide, afficher `Aucune rule à arbitrer.` et terminer.

Sinon, présenter chaque **catégorie** (sous-dossier) une par une, dans l'ordre numérique. Pour la catégorie `(racine)` (fichiers hors sous-dossier), la traiter en dernier.

Pour chaque catégorie :

```
📋 Rules — <catégorie> (<N> fichier(s))
  - <fichier1>
  - <fichier2>
  …
→ Action ? [garder tout / supprimer tout / arbitrer un par un]
```

- **garder tout** : passer à la catégorie suivante, rien ne change.
- **supprimer tout** : supprimer tous les fichiers de cette catégorie.
- **arbitrer un par un** : pour chaque fichier, demander `[garder / supprimer]` et appliquer immédiatement.

Après la dernière catégorie, afficher le rapport final :

```
✅ aiddlegacy — terminé

  Rules conservées : <liste>
  Rules supprimées : <liste>

  Commands conservés (sans équivalent plugin) :
    <liste — à traiter manuellement : migrer en skill plugin ou garder>

  Skills conservés (sans équivalent plugin) :
    <liste — à traiter manuellement : migrer en skill plugin ou garder>
```
