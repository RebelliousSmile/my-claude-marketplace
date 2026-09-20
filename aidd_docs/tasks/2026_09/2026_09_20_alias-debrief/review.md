# Review: alias debrief

- **Verdict**: changes-requested
- **Diff**: `HEAD...working-tree` (5 modifiés, 2 non suivis)
- **Axes run**: code, functional, relevancy
- **Date**: 2026_09_20
- **Findings**: 0 critical, 5 warning, 6 minor

## Phases

### Phase 1 — Demande du 2026-09-20 (aucun plan ; critères dérivés de la demande utilisateur)

- [x] Pendant de `previously` dans les alias d'overcode — `plugins/overcode/skills/alias/SKILL.md:38`, `actions/11-debrief.md:5`
- [x] Analyse les conversations (transcripts de sessions) — `actions/11-debrief.md:35-147`
- [x] Trouve les blocages — `actions/11-debrief.md:160` (erreurs d'outils, interruptions, compactions, prompts de correction)
- [x] Axes d'amélioration sur l'utilisation des compétences — `actions/11-debrief.md:162`
- [x] Axes d'amélioration sur les prompts — `actions/11-debrief.md:164`
- [x] Synergies entre plugins — `actions/11-debrief.md:166` (bigrammes de skills → candidat alias)

## Findings

| Sev | Kind | Phase | Location | Issue | Fix |
| --- | ---- | ----- | -------- | ----- | --- |
| 🟡 | code | 1 | `actions/11-debrief.md:47-50` | `CORRECT` ne matche pas l'apostrophe typographique U+2019 : « je t'ai dit » → match, « je t’ai dit » → pas de match. Mesuré : 294 lignes portant U+2019 dans les 4 transcripts les plus récents. Faux négatifs systématiques sur l'axe Frictions chez un utilisateur francophone | Normaliser avant match : `t = t.replace("’", "'")`, idem pour les guillemets si besoin |
| 🟡 | code | 1 | `actions/11-debrief.md:112-113` | Tout bloc `text` d'un message `user` de type liste est compté comme prompt, y compris les `<system-reminder>` et les contenus injectés. Mesuré : session `3fbcbf01` rapporte `prompts: 2` pour 1 prompt réel. Le compteur alimente l'axe Prompts et la ligne `Coverage` du rapport | Exclure les blocs `text` commençant par `<system-reminder>`, `<command-message>` ou `Caveat:` avant d'incrémenter |
| 🟡 | code | 1 | `actions/11-debrief.md:56` | La fenêtre temporelle est calculée sur `os.path.getmtime(p)`, pas sur les timestamps des messages. Une session ouverte il y a 60 jours et reprise hier entre en entier dans une fenêtre de 30 jours, ses données anciennes comprises — ce que la ligne 17 ne dit pas | Filtrer aussi sur le dernier timestamp lu, ou reformuler la ligne 17 en « sessions actives dans la fenêtre » et s'appuyer sur le `span` affiché |
| 🟡 | conform | 1 | `actions/11-debrief.md:150` | « a duration depth passes the day count and a high session cap » : le cap n'est pas chiffré, alors que toutes les autres bornes de l'action le sont (8 sessions, 30 jours, 30 s, `timeout 10`). Deux exécutions de `debrief 30d` peuvent lire des populations différentes | Fixer la valeur dans le texte (ex. 40 sessions) |
| 🟡 | code | 1 | `actions/11-debrief.md:170` | « keep only the matching section and drop the other three, header and verdict included » ne statue pas sur `Change this first`, `Recommendations` et `Coverage`, qui existent dans le template sans appartenir aux quatre axes. Deux lectures également soutenues : les garder restreints à l'axe, ou les supprimer | Énoncer que les trois blocs sont conservés et restreints à l'axe retenu |
| 🟢 | code | 1 | `actions/11-debrief.md:25,38` | Sonde unique sous `timeout 10` avec interdiction de réessayer (l. 25) : une expiration ne dégrade pas une section, elle vide le rapport entier. Mesuré à 1,15 s pour 8 sessions / 62 Mo, donc marge large aujourd'hui — le risque revient si le cap de sessions monte | `timeout 25` sur cette sonde, ou autoriser une seule reprise à profondeur réduite |
| 🟢 | code | 1 | `actions/11-debrief.md:134` | `terse prompts` inclut les marqueurs d'attachement : `[Image #1]`, `[Image #2]` observés en `--scope global`, classés comme prompts laconiques et donc comme signal de demande sous-spécifiée | Exclure `^\[Image #\d+\]$` et formes voisines du calcul |
| 🟢 | conform | 1 | `actions/11-debrief.md:20,179` + `assets/debrief.md:6` | `--save` insère un rapport commençant par `# Debrief — How We Worked` sous un titre `## Debrief <date>` : H1 sous H2, hiérarchie inversée dans le fichier cumulé | Rétrograder les titres d'un niveau à l'insertion, ou faire du titre daté le H1 et supprimer celui du template |
| 🟢 | code | 1 | `actions/11-debrief.md:44` | Le slug est dérivé de `$PWD`, qui vaut un chemin POSIX sous Git Bash ; l'exécution ne réussit que parce que MSYS convertit l'argument pour un Python Windows. Vérifié fonctionnel sur cette plateforme, et identique à `04-previously.md:~` — donc cohérent, pas portable | Normaliser le chemin dans le script (`os.path.abspath` + séparateurs) si la portabilité hors MSYS devient un objectif |
| 🟢 | rot | 1 | `actions/11-debrief.md:38-147` vs `actions/04-previously.md` | Résolution du slug et fenêtrage des transcripts dupliqués entre les deux actions, avec deux implémentations divergentes de la même connaissance du format `.jsonl` | Tolérable à deux consommateurs — chaque action d'alias est autonome par contrat. Extraire vers `references/` au troisième |
| 🟢 | rot | 1 | `skills/alias/evals/scenarios.json:66-75` | 10 scénarios positifs ajoutés, aucun négatif et aucun cas de frontière avec `previously`, alors que le fichier porte des `expect_action: null` pour les autres actions | Ajouter « résume-moi la dernière conversation » (frontière `previously`) et un cas de refus type `debrief --focus inconnu` |

## Verification

| Metric        | Value                                             |
| ------------- | ------------------------------------------------- |
| Verified      | 100% (6/6)                                        |
| Files checked | `skills/alias/actions/11-debrief.md`, `skills/alias/assets/debrief.md`, `skills/alias/SKILL.md`, `skills/alias/evals/scenarios.json`, `docs/aliases.md`, `README.md`, `CHANGELOG.md` |
| Unchecked     | none                                              |
| Unplanned     | bump `version: 4.7.0 → 4.8.0` (`SKILL.md:5`), entrée `[Unreleased]` du `CHANGELOG.md`, ligne d'alias du `README.md:51` — conventions du dépôt, aucun critère ne les demandait |
