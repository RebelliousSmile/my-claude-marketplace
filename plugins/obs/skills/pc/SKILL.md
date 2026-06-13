---
name: pc
description: >-
  Manages JDR solo player-character files stored in R/_pjs/<pj>/ — create a new PJ,
  fill or reorganize its files, log a game session (système de jeu), display the character
  sheet tied to the active campaign, or manage the PJ's companions (the recurring team).
  Use when the user's message is about PJ management in a solo JDR domain or invokes
  /obs:pc with a player-character intent.
  Do NOT use for campaign prep (scénarios, PNJ, factions) — use `rpg`; nor for live play
  (scene, oracle, roll) — use `obs:solo-mc`.
disable-model-invocation: true
---

# PC — Player Character

Manages player character folders stored in `R/_pjs/<pj>/`.
Routes to the appropriate action based on user intent.

**Résolution du domaine `R` (locale, découverte)** — `pc` opère relativement à un répertoire de référence (argument passé, sinon CWD) et **découvre** le domaine de jeu `R` : remonter les parents jusqu'au premier dossier contenant l'un des marqueurs `_campagnes/`, `_univers/` ou `_pjs/` — ce dossier est `R` (typiquement `Perso/RPG/<jeu>/`, mais déplaçable n'importe où). Aucun marqueur trouvé → la cible n'est pas dans un domaine JDR initialisé : le signaler. **Aucun chemin absolu, aucune config par machine** : tout est relatif à `R`. Les personnages vivent dans `R/_pjs/<pj>/`. Référence complète : `../../references/jdr-layout.md`.

## Available actions

| #   | Action        | Role                                                              | Input                     |
| --- | ------------- | ----------------------------------------------------------------- | ------------------------- |
| 01  | `new`         | Create a new PJ folder from the `_template/`                      | PJ name                   |
| 02  | `fill`        | Fill PJ files from a pasted text (brainstorm, notes, etc.)        | PJ name, source text      |
| 03  | `reorganize`  | Redistribute content to the 6 standard files                      | PJ name or loose .md file |
| 04  | `log-session` | Update PJ files after a game session (système de jeu)      | PJ name, session info     |
| 05  | `show`        | Display the current character sheet (tags, statuses, relations)   | PJ name or active session |
| 06  | `companion`   | Create / fill / show a companion sheet (autonome ou par référence) ; register it in the PJ-level team roster | companion name |
| 07  | `background`  | Construire le background du PJ par un questionnaire adapté au **genre** du jeu | PJ name, genre |

## Default flow

Router — dispatches based on user intent:

- "nouveau PJ", "créer PJ", "new PJ", "créer <nom>" → `new`
- "remplir PJ", "fill PJ", "remplir les fichiers" → `fill`
- "réorganiser PJ", "reorganize", "restructurer <nom>" → `reorganize`
- "log session", "mettre à jour après session", "fin de session" → `log-session`
- "afficher PJ", "fiche personnage", "show PJ", "/pj" → `show`
- "compagnon", "companion", "team", "équipe", "allié", "ajouter un compagnon" → `companion`
- "construire le background", "background", "questionnaire", "aide-moi à créer le perso", "construire le perso" → `background`

## Transversal rules

- PJ root: `R/_pjs/<pj>/` (`R` discovered locally via `_campagnes/`, `_univers/` or `_pjs/` marker — see resolution above)
- Template (shared, dans `R`): `R/_shared/pj-template/`
- Manager script (shared, dans `R`): `R/_shared/pj-manager.py`
- Ask for the PJ name if not supplied via `$ARGUMENTS`. List existing folders in `R/_pjs/`.
- Rules reference (terminology and mechanics): the active **game system**'s rules-keeper-optimized rules at `R/_systeme/{canon,mj}/` (official `canon/` + GM house rules `mj/`), produced by `obs:rules-keeper`. Effective rules = canon + declared house rules. **Generic subsystems** (Parallaxe, Cinério, Muses et Oracles) are live-play tools consumed by `obs:solo-mc` only — `pc` does not reference them.
- Never invent mechanics — always consult the references above.
- **Règles indisponibles** — si `R/_systeme/canon/` (sortie de `rules-keeper`) n'existe pas encore (par exemple sources brutes non encore ventilées : relancer `extract-pdf` puis `rules-keeper`), les références de règles ci-dessus sont indisponibles : n'inventer aucune mécanique, demander à l'utilisateur de régénérer le système. Les règles maison `R/_systeme/mj/` et le lore `R/_univers/<univers>/canon/` ne dépendent pas de cette régénération.
- Le `_template/` et `pj-manager.py` reflètent le **système de jeu** actif ; pour tout terme mécanique, ce skill défère aux références rules-keeper (`R/_systeme/{canon,mj}/`) du système de jeu ci-dessus. (Les sous-systèmes — Parallaxe, Cinério, Muses et Oracles — restent du ressort de `obs:solo-mc`.)
- Date format: `YYYY-MM-DD` throughout all files.
- **Compagnons (team du PJ)** — Le PJ peut avoir une **team** de compagnons jouée **par substitution** (recréer le feeling d'une partie sur table, pas piloter 4-5 PJ complets). Fiches **wrapper** légères dans `R/_pjs/<pj>/compagnons/<slug>.md`.
  - **Roster.** Le roster de référence vit **au niveau du PJ** : `R/_pjs/<pj>/compagnons/_roster.yaml`. Il est ainsi définissable **sans campagne active** (on peut constituer une team dès la création du PJ). Quand une campagne démarre, son `config.yaml` (clé `compagnons:`) **référence** ce roster PJ-level (par `roster: _pjs/<pj>/compagnons/_roster.yaml`, ou recopie des entrées `actif: true`) plutôt que de le redéfinir.
  - **Fiche par référence.** Une fiche compagnon peut soit être autonome (structure *Minimal jouable* ci-dessous), soit **référencer une fiche de personnage canonique existante** (un prétiré de setting, une mue, un PNJ d'univers) via le champ `ref:`. Dans ce cas, la fiche wrapper ne **duplique pas** les mécaniques : elle pointe vers la source canonique et n'ajoute que rôle dans la team, lien au PJ et état courant. C'est le mode recommandé quand le compagnon a déjà une fiche complète ailleurs (ex. `_univers/<univers>/pretires/<x>.md`).
  - Lues par `obs:solo-mc` au jeu (substitution) — `pc` détient la donnée, le jeu est l'affaire de solo-mc.

## Action: new

Runs:
```bash
python "<R>/_shared/pj-manager.py" new "<nom>" --into "<R>/_pjs"
```

The script copies the template, slugifies the name for the folder, and replaces `[Nom du PJ]` in all `.md` files.

Files created: `pj.md`, `fiche_technique.md`, `intention.md`, `etat-jeu.md`, `backlog.md` (état durable du PJ dans `R/_pjs/<pj>/`). **Pas de `journal.md`** : les comptes-rendus de session sont des **fichiers datés** créés par `log-session` sous `R/<AAAA>/<MM>/<pj>/` (même axe daté que `solo-mc`).

After creation, remind the user to:
1. Fill `pj.md` (background) — use `background` for a genre-driven questionnaire (recommended for a fresh PJ), or `fill` if starting from an existing text
2. Choose the system in `fiche_technique.md`
3. Fill `intention.md` before the first session

## Action: fill

Asks the user to paste the source text. **Si l'utilisateur n'a pas de texte de départ**, basculer sur `background` (questionnaire guidé par genre) plutôt que de remplir à vide. Sinon :

1. Analyzes the text and identifies which sections it feeds:
   - Identity, facade, background, personality, world relationship → `pj.md`
   - Stats, power/weakness tags, equipment, mechanics → `fiche_technique.md`
   - Themes, tone, truths, line rouge, visceral question → `intention.md`
   - État mécanique de jeu (jauges, ressources, statuts, compteurs selon les règles actives (système de jeu) → `etat-jeu.md`
   - Scene ideas, open threads → `backlog.md`

2. Distributes content into the relevant files. Preserves existing content — completes, never overwrites.

3. Marks incomplete sections with `[À compléter]`.

4. Does not invent content missing from the source text.

Reports modified files and lists sections still marked `[À compléter]`.

## Action: reorganize

1. Reads all existing PJ files (recursively if folder; otherwise the single `.md`).
2. Presents a redistribution plan before writing anything:
   - Which source content goes to which target file
   - Which missing files will be created from template
   - Which content belongs outside `_pjs/` (campaign prep → `rpg` ; univers durable → arborescence `lore-extract`/`rpg` ; jeu en direct → `obs:solo-mc`)
   - Which content is ambiguous and needs user arbitration
3. Waits for user validation.
4. If source is a single `.md`: creates `R/_pjs/<slug>/` first, then copies missing files from template.
5. Redistributes validated content. Preserves existing target content — completes, never overwrites.
6. Archives source files to `R/_pjs/<pj>/.archive/` (never deletes directly).

Redistribution rules:
- `pj.md` ← identity, name, age, gender, origin, social facade, background, personality, world relationship
- `fiche_technique.md` ← stats, attributes, skills, power/weakness tags, spells, equipment, persistent statuses
- `intention.md` ← themes, tone, truths, what I want to experience/avoid, visceral question, story threads
- `etat-jeu.md` ← état mécanique de jeu selon les règles actives (système de jeu) : jauges, ressources, statuts, compteurs et éléments en suspens
- **comptes-rendus de session** ← **fichiers datés** `R/<AAAA>/<MM>/<pj>/session-<AAAA-MM-JJ>-<N>.md` (un par session — **pas** un `journal.md` agrégé). Un ancien `journal.md` rencontré en réorganisation est éclaté en fichiers datés (un par entrée), puis archivé.
- `backlog.md` ← scene ideas, threads to revive, open questions, narrative todo

## Action: background

Construit le background du PJ par un **questionnaire adapté au genre du jeu**. Questions, familles de genre et table de correspondance GROG : `references/genres-et-background.md`. Inspiré de la création d'Ecryme 2e (construction par questions concrètes, pas par cases).

1. **Déterminer le PJ** (argument ou `R/.current-session`) et le **genre** du jeu — déduit du domaine `R` actif ; à défaut, demander à l'utilisateur le thème GROG ou le pitch du jeu.
2. **Mapper** le genre vers une **famille** (+ modulateurs) via la table de `references/genres-et-background.md`.
3. Poser le **tronc commun** puis les **questions signature** de la famille, par **lots de 2–4 questions** — proposer 2–3 pistes par question, laisser l'utilisateur choisir/amender (allers-retours, jamais d'un bloc).
4. **Distribuer** les réponses dans `pj.md` (identité, façade, background, personnalité, relations) et `intention.md` (question viscérale, ligne rouge, thèmes, vérités), selon la table « Où atterrissent les réponses » de la fiche. Compléter, ne jamais écraser ; marquer `[À compléter]` les sections laissées ouvertes.
5. **Ne rien inventer de mécanique** : stats/tags/jets restent déférés à `R/_systeme/{canon,mj}/`.

Reports modified files and lists sections still marked `[À compléter]`.

## Action: log-session

Asks the user for:
1. Session number and date (default: today)
2. Played scenes (short summary per scene)
3. Mechanical events of the session (resources gained/spent, statuses, counters) per the active rules (game system)
4. Notable outcomes / turning points of the session
5. Final mechanical state of the sheet per the active rules (game system) (jauges, ressources, statuts, compteurs, éléments en suspens)

Then updates:
1. **Dated session file** — determine `<N>` by scanning the PJ's dated session home **across all year/month folders** (`R/<AAAA>/<MM>/<pj>/` for every `<AAAA>/<MM>`, files `session-*.md`; `<N>` is global, not per-month), then create `R/<AAAA>/<MM>/<pj>/session-<AAAA-MM-JJ>-<N>.md` (today's folders, create if absent) with scenes, mechanical events, outcomes, free notes. This is the session journal — one file per session, mirroring `solo-mc`.
2. **`etat-jeu.md`** (durable, `R/_pjs/<pj>/`) — snapshot of the current mechanical state per the active rules (game system) (jauges, ressources, statuts, compteurs, éléments en suspens)
3. **`intention.md`** (durable) — proposes an update if a new story thread emerged, the visceral question evolved, or a theme shifted
4. **`backlog.md`** (durable) — proposes adding new scene ideas and open questions that emerged

Reports modified files at the end (dated session file + the durable PJ sheets touched).

## Action: show

Determines the active PJ:
- If argument supplied (`/obs:pc show @<pj>`): use it
- Otherwise read `.current-session` at the domain root (`R/.current-session`)
- If empty or missing: prompt the user

Loads character state from (priority order):
1. `R/_campagnes/<campagne>/.session-state.yaml` (if active session)
2. `R/_campagnes/<campagne>/config.yaml`
3. `R/_pjs/<pj>/fiche_technique.md` and `R/_pjs/<pj>/pj.md`
4. Latest dated session file `R/<AAAA>/<MM>/<pj>/session-*.md` (most recent year/month) for recent scenes, tag changes and events

Displays a structured sheet with: progress statuses, themes, power/weakness tags, recent tag changes, active statuses, NPC relations, objectives.

For campaign-level mechanics and narrative context, refer the user to `/status` and `/previously`.

## Action: companion

Manages the PJ's **companions** — the recurring team played **by substitution** to recreate a tabletop feel (not to run 4–5 full PCs). Infer the mode from intent: **create**, **fill/update**, or **show**.

Resolution (always first):
1. Determine the active PJ (argument or `R/.current-session`) and the active campaign.
2. List existing `R/_pjs/<pj>/compagnons/` before creating — never overwrite a sheet without explicit confirmation.

### create
1. Ask the companion name if not supplied; slugify it for the filename.
2. Choose the sheet mode:
   - **par référence** (recommandé si le compagnon a déjà une fiche complète ailleurs — prétiré, mue, PNJ d'univers) — la fiche wrapper pointe vers la source canonique via `ref:` et ne duplique aucune mécanique (structure *Référence* ci-dessous).
   - **autonome** — fiche *Minimal jouable* rédigée sur place (structure ci-dessous).
3. Create `R/_pjs/<pj>/compagnons/<slug>.md` with the chosen structure.
4. Register the companion in the **PJ-level roster** `R/_pjs/<pj>/compagnons/_roster.yaml` — append the entry, never duplicate one (créer le fichier s'il n'existe pas) :

```yaml
pj: <pj-slug>
compagnons:
  - nom: <Nom>
    role: <rôle dans la team>
    fiche: _pjs/<pj>/compagnons/<slug>.md
    ref: _univers/<univers>/pretires/<x>.md   # mode par référence ; omettre si autonome
    actif: true
```

5. **Si une campagne est active**, faire pointer son `config.yaml` vers ce roster (`compagnons: { roster: _pjs/<pj>/compagnons/_roster.yaml }`) ou y recopier les entrées `actif: true`. **Sans campagne**, le roster PJ-level suffit (la team est définissable dès la création du PJ).

### fill / update
Distribute pasted text into the companion sheet. Preserve existing content — complete, never overwrite. Mark gaps `[À compléter]`. Do not invent content absent from the source.

### show
Display a companion sheet; with no name, list the active team from the campaign roster (`config.yaml › compagnons:`).

### Fiche compagnon — structure (Minimal jouable, ~1 page)

```markdown
# <Nom du compagnon>

- **Rôle dans la team** : <éclaireur, soutien, mentor…>
- **Lien au PJ** : <relation + historique en une ligne>
- **Voix / personnalité** : <2–3 tics de langage ou de comportement>

## Mécanique (substitution)
- Système : hérité de la campagne (`config.yaml › system`)
- 3 à 5 prises clés : stats / tags / moves saillants, suffisants pour résoudre ses actions selon les règles actives (système de jeu) — jamais de mécanique inventée

## État courant
- Statuts, ressources, blessures, position — tenu à jour au fil du jeu
```

### Fiche compagnon — structure (Référence, ~½ page)

Quand le compagnon a déjà une fiche complète ailleurs (prétiré, mue, PNJ d'univers), ne pas dupliquer ses mécaniques : pointer vers la source.

```markdown
# <Nom du compagnon>

- **Mue / fiche source** : [[<chemin relatif vers la fiche canonique>]]  ← mécaniques complètes ici
- **Rôle dans la team** : <éclaireur, soutien, mentor, muscle…>
- **Lien au PJ** : <relation + ascendants de départ en une ligne>
- **Voix / personnalité** : <2–3 tics>

## Prises clés (rappel)
- 3 à 5 stats / tags / moves saillants recopiés pour le jeu rapide — la référence fait foi.

## État courant
- Statuts, ressources, blessures, position — tenu à jour au fil du jeu.
```

Le `ref:` du roster (`_roster.yaml`) pointe vers la même fiche canonique.

Les fiches wrapper vivent sous `_pjs/<pj>/compagnons/` ; le **roster PJ-level** (`_roster.yaml`) les liste, et le `config.yaml` d'une campagne (si elle existe) ne fait que **référencer** ce roster (comme l'instance de campagne référence le PJ canonique). Lus par `obs:solo-mc` en jeu pour la substitution.
