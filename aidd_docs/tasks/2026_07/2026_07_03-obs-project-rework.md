# Chantier — rework de `obs:project` : communication → information

> **Statut** : à traiter (design, implémentation non commencée)
> **Date** : 2026-07-03
> **Plugin** : `obs` — skill `project`, couplé à `obs:filler` (et `obs:mail` en amont, rôle à confirmer)

## Contexte & diagnostic

`obs:project` gère les notes de projet (`Pro/Projets/<name>/`) : create, fill, reorganize, log-session, log-meeting, add-invoice, export-rag. Il est **outdated** :

1. **Chemins morts.** Toutes les actions hardcodent `C:/Users/fxgui/Public/Notes/…` — inexistant. Le vrai vault est sous `C:/Users/fxgui/Documents/` (projets réels sous `Documents/Pro/Projets/`). Occurrences : `02-fill`, `03-reorganize` (`Public/Notes/CLAUDE.md` + `Patterns/projet-template/`), SKILL.md.
2. **Pas de couplage `filler`.** `fill`/`reorganize`/`export-rag` réimplémentent de la consolidation que `obs:filler` fait déjà.
3. **Pas de gestion du cycle de vie de l'information.** `log-meeting`/`add-invoice` demandent la saisie manuelle ; rien ne distille le contenu daté du projet vers ses fichiers structurels ; rien ne gère l'obsolescence des répertoires `YYYY/MM`.

### Baseline behave (run 1, 2026-07-03)
`project-scenarios.md` passe **12/12 PASS** — mais ça mesure la conformité au spec *actuel*, pas l'actualité. Le juge a même adapté le chemin mort (`Public/Notes/` → `Notes/`) pour bâtir son fixture : l'obsolescence est invisible à la suite par construction. Gap de spec relevé au run (à corriger ici) : **`01-create` n'a pas de garde template vide/corrompu** (S8 ne tient que sur sa clause anti-fabrication).

---

## Modèle d'ensemble — communication → information

Principe directeur : **faire passer le projet de la communication à l'information.** Le contenu daté d'un projet (`Pro/Projets/<name>/YYYY/MM/`) est de la **communication brute** (emails **et autres documents** — pas que des emails). Les fichiers structurels du projet (`projet.md`, `commercial.md`, `backlog.md`) sont l'**information distillée durable**. Le rework installe un pipeline continu qui distille la première vers la seconde et **prune** le passé.

```
Pro/Projets/<name>/
├── projet.md        ← information distillée : fonctionnement / technique
├── commercial.md    ← information distillée : gestion de projet
├── backlog.md       ← information distillée : tâches à planifier
└── YYYY/MM/         ← communication brute datée (emails + docs), TRANSITOIRE
```

Pipeline en deux temps + une balayage temporel :

1. **`filler` : communication → information.** Sur le contenu d'un `YYYY/MM`, filler supprime le bruit, résume, fait des digests, ne garde que l'information importante (sa philosophie « réduction continue »). Agnostique au type : emails via `synthesize`/`digest`, autres docs via `condense`/`clean`.
2. **`project` : classer l'information survivante.** project lit ce que filler a laissé et route chaque élément :
   | Information | Destination |
   |---|---|
   | définit le **fonctionnement / la technique** du projet | `projet.md` |
   | relève de la **gestion de projet** (commercial, admin) | `commercial.md` |
   | **tâche à planifier** pour le futur | `backlog.md` |
   | ni l'un ni l'autre, encore actuelle | reste un doc daté, ramené au **mois courant** |
   | obsolète | **archivée / supprimée** |
3. **Décroissance temporelle & consolidation forward** (cf. Volet 4).

---

## Volet 1 — Corriger les chemins (mécanique)

- Remplacer tout `C:/Users/fxgui/Public/Notes/…` par une **résolution ancrée via `obs:tree`** (walk-up vers `Pro`/`Perso`, puis `Projets/`). Aucun chemin absolu hardcodé.
- Cibles réelles sous `Documents/Pro/Projets/`.
- **[DÉCIDÉ] Templates + règles de redistribution supprimés → recréés dans `plugins/obs/skills/project/references/`** (skill auto-contenue, plus de dépendance au vault) : `references/projet-template/` (fichiers `projet.md`/`backlog.md`/`commercial.md` [`## Historique devis`/`## Facturation`/`## CR Réunions`/`## Accès`]/`communication.md`/`memory.md`/`snippets.md` selon type) + `references/redistribution-rules.md` (ex-« Règles de redistribution » du `CLAUDE.md`). Contenu reconstruit depuis les actions.
- Fichiers : SKILL.md (roots/templates/External data) + `02-fill` + `03-reorganize`.

## Volet 2 — `filler` réduit communication → information

- project **invoque** `obs:filler` (Skill tool) sur le `YYYY/MM` traité, comme première étape : `survey` → `synthesize`/`digest` (emails & communications) → `condense`/`clean` (docs verbeux, bruit).
- filler garde son contrat (dry-run avant destructif, digest jamais sur messages humains → synthesize, pas d'écrasement silencieux, non-récursif par défaut).
- Résultat : le `YYYY/MM` ne contient plus que de l'**information** (bruit éliminé, communications résumées), prête à être classée.

## Volet 3 — `project` classe l'information survivante

**[DÉCIDÉ] Exposée via une action dédiée à la demande** — ex. `/obs:project distill <projet>` (orchestre : réduction filler → classification → décroissance temporelle). Pas d'effet de bord de `log-session`.
- Lire chaque élément d'information survivant dans le `YYYY/MM`.
- Router selon la table du Modèle : `projet.md` (fonctionnement/technique) · `commercial.md` (gestion) · `backlog.md` (tâches futures) · rester doc daté (actuel) · archiver/supprimer (obsolète).
- **Validation avant écriture** dans les fichiers structurels (la classification est une proposition).
- `log-meeting`/`add-invoice` deviennent des **cas particuliers** de cette classification : un CR extrait → entrée datée dans `commercial.md`/`communication.md`/`projet.md` ; une facture extraite → ligne `commercial.md › Historique devis`. Le pré-remplissage depuis l'information distillée remplace la saisie manuelle (fallback saisie si rien à extraire).

## Volet 4 — Décroissance temporelle & consolidation forward

Principe : **plus c'est vieux, plus c'est probablement obsolète** ; on ne garde pas une pile de répertoires passés.
- Balayer les `YYYY/MM` (du plus vieux au plus récent). Pour chaque mois, après réduction filler + classification project, décider par élément restant :
  - **encore actuel** → **ramener au mois courant** (déplacer le doc dans le `YYYY/MM` courant) ;
  - **obsolète** → **archiver ou supprimer** ;
  - **structurel** → déjà classé (Volet 3).
- **Invariant** : la **date d'origine reste dans le document** (frontmatter/en-tête) même quand il change de répertoire — on perd le répertoire daté, pas la date.
- **Objectif** : les `YYYY/MM` du passé **se vident et disparaissent** ; il ne reste idéalement que le mois courant + les fichiers structurels. C'est la philosophie « réduction continue » de filler appliquée à l'axe temporel.
- Garde-fous (behave) : jamais de suppression sans dry-run + confirmation ; archivage traçable ; ne jamais détruire une information encore actuelle.

## Volet 5 — Rôle de `mail` (à confirmer)

Avec ce modèle, `mail` **n'est plus piloté** par project. Son seul rôle possible reste **amont** : déposer/classer les emails du projet (depuis `Thunderbird/`) dans les `YYYY/MM` du projet, d'où filler+project prennent le relais. → **Choix** : garder mail comme mécanisme de livraison des emails projet, ou le sortir de ce chantier (les emails arrivent dans les dirs par un autre moyen).

## Volet 6 — Corriger le gap S8 (issu du run)

Ajouter à `01-create` : « si un fichier template est vide/illisible, signaler le corps manquant et ne pas écrire ce fichier — ne jamais inventer de contenu. »

---

## Impact sur la suite behave

`project-scenarios.md` devient **outdated** → re-scaffold après implémentation. Nouveaux comportements à épingler :
- **Pipeline com→info** : filler réduit d'abord (invoqué), project classe ensuite.
- **Classification** : info « fonctionnement » → `projet.md` ; « gestion » → `commercial.md` ; « tâche » → `backlog.md` ; NO-GO : mis-classification, ou écriture structurelle sans validation.
- **Contenu mixte** : un `YYYY/MM` avec emails ET docs → les deux traités.
- **Décroissance temporelle** : info actuelle ramenée au mois courant avec **date préservée dans le doc** ; obsolète archivée/supprimée (dry-run+confirm) ; NO-GO : perte d'une info actuelle, ou suppression sans confirmation, ou date perdue.
- **Consolidation forward** : les `YYYY/MM` passés se vident ; NO-GO : accumulation de répertoires passés.
- Chemins corrigés (résolution ancrée). Gap S8 en NO-GO reproduce-then-confirm.

## Séquencement

1. **Chemins** (quick win isolé).
2. **Couplage filler** (Volet 2 : réduction invoquée).
3. **Classification project** (Volet 3 : nouvelle action de routing info → projet/commercial/backlog).
4. **Décroissance temporelle** (Volet 4 : balayage YYYY/MM + consolidation forward + date-préservée).
5. **Gap S8** (garde template vide).
6. **Rôle mail** selon le choix.
7. **Re-scaffold** de la suite behave + re-run.
8. Bump version `obs`.

## Choix

1. **Rôle de `mail`** — *[À CONFIRMER]* : mail est l'organiseur de la **boîte mail globale** (Thunderbird → branches, réduction com→info spécialisée email : phishing/threads/prune/taxonomie). Il chevauche fortement filler. Reste : garde-t-il un rôle **amont de livraison** (router les emails d'un projet vers son dir `YYYY/MM`), ou hors de ce chantier ?
2. **Forme de la classification** — *[DÉCIDÉ]* action dédiée à la demande `/obs:project distill <projet>` (découle de « à la demande »). Pas d'effet de bord de `log-session`.
3. **Templates + règles de redistribution** — *[DÉCIDÉ]* recréés dans `plugins/obs/skills/project/references/` (cf. Volet 1).
4. **Granularité du balayage temporel** — *[DÉCIDÉ]* à la demande.

## Rappel — frictions des autres runs (backlog spec-hardening, hors ce chantier)

- `mail` : définir le prédicat « domain match » du phishing (égalité du label registrable) ; câbler `exceptions.action` vers son rung.
- `filler` : aligner `01-survey` Outputs sur T9 (console-only strict) ; préciser le slug d'entité multi-mots ; noter le raffinement par-action de T8.
- `tree` : `references/*` absentes (format bank.yml/destinations non vérifiable) ; S2/S3 flag hors sous-arbre `zombiology` ; mécanisme de staleness S12 sous-spécifié.
