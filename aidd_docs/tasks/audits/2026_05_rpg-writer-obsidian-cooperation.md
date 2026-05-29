---
name: audit
description: Audit de cohérence des données, du contrat bank.yml et de la coopération inter-skills (obsidian + rpg-writer)
---

# Codebase Audit for plugins/obsidian + plugins/rpg-writer

Audit ciblé sur **l'organisation des données, le contrat `bank.yml`, et la coopération** entre les deux plugins le long de la chaîne : gamme officielle → canon → prep MJ + développement joueur → récit final. Ce n'est pas un audit de bugs de code (les skills sont des prompts Markdown) mais un audit de **cohérence d'architecture**.

- Status: 🔴 Désalignement structurel à la frontière de coopération
- Confidence: Élevée (lecture exhaustive des fichiers d'action concernés)
- Scope: `plugins/obsidian/skills/{pc,rpg,solo-mc}`, `plugins/rpg-writer/skills/{forge,toc,write,review,persona,setup,lore-extract,rules-keeper,extract-pdf}`

## Chaîne de coopération visée (modèle cible)

1. **Gamme officielle (PDF)** → `extract-pdf` (transcription + ventilation) → **crée le canon**
2. `lore-extract` → `univers/<u>/.docs/canon/` (lore) · `rules-keeper` → `<jeu>/systeme/canon/` + `subsystems/<n>/canon/` (règles)
3. **MJ** (`rpg`) → `univers/<u>/.docs/mj/` + `campagnes/<c>/` (prep) · **Joueur** (`pc`) → `pjs/<pj>/intention.md` · house-rules → `…/mj/`
4. `solo-mc` joue · **`rpg-writer`** (`forge`→`toc`→`write`→`review`) bâtit le récit final à partir de **tout** ce matériel

Le constat central : la session de réorganisation par-jeu + canon/mj a migré **le côté obsidian (pc/rpg/solo-mc), les SKILL.md de lore-extract/rules-keeper, `bank-yml.md` et les `bank.yml` réels** — mais **pas la couche d'action de rpg-writer ni `extract-pdf`**, qui restent sur l'ancienne convention plate. La cassure tombe exactement sur la frontière de coopération.

## Findings

### 🔴 Le producteur de canon (`extract-pdf`) ignore `canon/` et l'arbre par-jeu

- [🔴] **Organisation données**: `plugins/rpg-writer/skills/extract-pdf/actions/03-distribute.md:50-51` la ventilation écrit le lore dans `<univers-path>/.docs/UNIVERS.md` et `.docs/terminologie.md` **à plat**, jamais dans `.docs/canon/`. Or c'est « ce qui crée le canon » → le sous-arbre `canon/` (référencé par lore-extract, rpg, solo-mc, pc) n'est **jamais alimenté** par ce pipeline. (Ventiler le lore vers `univers/<u>/.docs/canon/`.)
- [🔴] **Organisation données**: `extract-pdf/actions/03-distribute.md:53` les règles vont dans `docs/rules-files/<source>.md`, jamais dans `<jeu>/systeme/canon/` ni `subsystems/<n>/canon/` (le domaine de `rules-keeper`). (Router les règles vers `systeme/canon/` ou déléguer à `rules-keeper`.)
- [🔴] **Résolution chemin**: `extract-pdf/actions/03-distribute.md:29` calcule `<univers-path>` = répertoire **parent** du projet (CWD `…/spire/mon-roman/` → `…/spire`). C'est l'ancien layout `<univers>/<projet>`. En par-jeu, l'univers est `<jeu>/univers/<univers>/`, pas le parent du projet → résolution fausse. (Résoudre via `<jeu>/univers/<document.univers>/`.)
- [🟡] **Redondance / rôles**: `extract-pdf/SKILL.md` (distribue le final) vs `lore-extract/SKILL.md` (« do NOT use for PDF extraction — use extract-pdf first, then pipe output here »). Les deux ventilent du lore vers des destinations **différentes** (extract-pdf→`.docs/*` plat ; lore-extract→`.docs/canon/` thématique) → chevauchement de responsabilité et double source de vérité. (Décider : extract-pdf produit du **brut**, lore-extract/rules-keeper ventilent vers `canon/`.)

### 🔴 Couche d'action rpg-writer non migrée (dérive de chemins)

- [🔴] **Convention**: `plugins/rpg-writer/skills/setup/actions/01-init.md:30,32` valide un chemin à **2 segments** `<univers>/<projet>` et scaffolde `<univers>/.output-styles/`, `<univers>/.docs/UNIVERS.md` (à plat, **sans `canon/`+`mj/`**), `<univers>/.templates/personas/` à la racine du workspace. Tout nouveau projet créé par `init` **diverge** de l'arbre par-jeu. (Scaffolder `<jeu>/univers/<u>/.docs/{canon,mj}/` + projet sous `<jeu>/ecrits/<projet>/`.)
- [🔴] **Convention**: `rpg-writer/skills/write/actions/02-write-roleplaying.md:2` charge l'output-style `<univers>/.output-styles/<univers>-roleplaying.md` (préfixe `univers/` manquant → ne résout pas en par-jeu).
- [🟡] **Convention**: format `<univers>/<projet>` répété dans `forge/actions/01-forge.md:7`, `setup/actions/02-audit.md:7`, `extract-pdf/SKILL.md:62`, `extract-pdf/actions/03-distribute.md:7`. (Propager `<jeu>/ecrits/<projet>` + racine-jeu.)

### 🔴 Le writer ne consomme pas la matière MJ/joueur (objectif de coopération non tenu)

- [🔴] **Coopération**: `write/actions/02-write-roleplaying.md:3` ne charge que `UNIVERS.md` + `terminologie.md` **à plat** : (a) après migration le lore est dans `.docs/canon/` → le writer ne le **trouve plus** ; (b) ne lit **jamais** `.docs/mj/` (développement d'univers du MJ) ; (c) ne lit jamais `systeme/`/`subsystems/`. Donc « le writer utilise tout le matériel » échoue : les apports MJ et les règles affermies n'arrivent pas au récit. (Rendre le writer **piloté par bank.yml**, et faire pointer bank.yml vers `canon/` + `mj/`.)
- [🟡] **Incohérence inter-skills**: `forge/actions/01-forge.md:2` est piloté par bank.yml (« Load all files declared in bank.yml ») alors que `write-roleplaying:3` code en dur 2 noms de fichiers → deux skills, deux comportements de chargement.

### 🟡 Contrat `bank.yml` incohérent après migration

- [🟡] **Contrat**: `plugins/rpg-writer/skills/setup/references/bank-yml.md:30-31` documente `docs.univers: univers/<univers>/.docs/UNIVERS.md` (sans `canon/`), mais les `bank.yml` réels migrés pointent désormais `.docs/canon/UNIVERS.md` (ex. `JDR/zombiology/ecrits/rouedutemps-adrenaline/bank.yml`). Doc ≠ données → `setup audit` produira de faux `[MISSING]`.
- [🟡] **Contrat**: `bank-yml.md:42-43` conserve `personas.global: docs/templates/personas/<id>.yml` alors que les personas globaux ont été déplacés **dans les univers** (décision de session). Référence pendante.
- [🟡] **Contrat**: `bank-yml.md:64` commente `<univers>/.rules-files/<file>.md` (préfixe `univers/` manquant ; non aligné sur `<jeu>/systeme/{canon,mj}/`).

### 🟡 Résolution des personas décrite de 3 façons divergentes

- [🟡] **Cohérence**: `persona/actions/01-generate.md:62` (sans univers → `docs/templates/personas/`) vs `review/actions/01-comment.md:38` (ordre `<univers>/<projet>/.templates → <univers>/.templates → docs/templates`) vs décision de session (par-univers `univers/<u>/.templates/personas/`) vs `bank-yml.md:42`. Aucune source unique ; les fichiers globaux physiquement déplacés laissent ces références orphelines. (Unifier sur : projet → univers → partagé `_shared/personas/`.)

### 🟡 Sortie de `rules-keeper` non câblée au writer

- [🟡] **Coopération**: `rules-keeper` écrit `<jeu>/systeme/{canon,mj}/` + `subsystems/` ; `write-roleplaying:4` lit `bank.yml > rules-files` ; mais `bank-yml.md:59-64` et le `bank.yml` WoT pointent vers `.rules-files/adrenaline-d100.md` (projet-local), jamais `systeme/canon/`. Les règles « affermies » par le joueur n'atteignent pas le writer sans câblage manuel.

### 🟢 Mineurs / quick wins

- [🟢] **Naming**: `forge/actions/01-forge.md:1` titre « 01 - Brainstorm » alors que le skill est `forge`.
- [🟢] **Donnée**: `JDR/zombiology/ecrits/au-service-des-tenebres/bank.yml` `output-style global: univers/wot/.output-styles/wot-astd.md` — fichier absent sur disque (était projet-local) ; `setup audit` le signalera `[MISSING]`.

## ✅ Audit Checklist

### Organisation des données
- [🔴] Arbre par-jeu cohérent côté obsidian, **incohérent** côté rpg-writer (actions + extract-pdf)
- [🔴] Sous-arbre `canon/` non alimenté par le pipeline qui le crée (`extract-pdf`)
- [🟡] Split `canon/`+`mj/` non scaffoldé par `setup init`

### Contrat bank.yml
- [🟡] Schéma (`bank-yml.md`) divergent des `bank.yml` réels (canon/, personas, rules-files)
- [🔴] Writer partiellement non piloté par bank.yml (chemins en dur)

### Coopération inter-skills
- [🔴] `mj/` (apports MJ) jamais lu par le writer
- [🔴] `systeme/`/`subsystems/` (rules-keeper) non câblés au writer
- [🟡] Rôles `extract-pdf` vs `lore-extract` qui se chevauchent (double ventilation)
- [🟡] Personas : 3 schémas de résolution concurrents

## Recommendations

Classées par impact (haut → bas) :

1. **Aligner `extract-pdf` sur le canon par-jeu** : `distribute` ventile le lore → `univers/<u>/.docs/canon/`, les règles → `systeme/canon/` (ou délègue à `lore-extract`/`rules-keeper`) ; corriger `<univers-path>` (03-distribute.md:29) vers `<jeu>/univers/<document.univers>/`. Trancher le chevauchement extract-pdf↔lore-extract (extract-pdf = brut, lore-extract = ventilation canon/).
2. **Propager la convention par-jeu + canon/mj dans toutes les actions rpg-writer** (forge, toc, write-*, setup init/audit, persona, review, tone-finder, research, extract-pdf, tabula-rasa). Définir la règle de résolution une fois par SKILL.md, référencée par les actions.
3. **Rendre le writer 100 % piloté par bank.yml** et faire pointer bank.yml `docs` vers `.docs/canon/` **et** `.docs/mj/`, `rules-files` vers `systeme/canon/` + `subsystems/<actifs>/{canon,mj}/` → le récit final intègre canon + apports MJ + règles affermies.
4. **Mettre à jour `setup init`** pour scaffolder l'arbre par-jeu avec `.docs/{canon,mj}/`, et `setup/02-audit` + `bank-yml.md` (canon/, personas, rules-files→systeme/).
5. **Unifier la résolution des personas** (projet → univers → `_shared/personas/`) dans `persona generate`, `review comment`, `bank-yml.md`.

## Final Audit

- **Score**: 5.5/10 — arbre de données + chaîne obsidian (pc/rpg/solo-mc) cohérents ; couche d'action rpg-writer et surtout le producteur de canon `extract-pdf` non migrés, ce qui rompt la couture de coopération.
- **Top risks**: (1) le canon n'est jamais écrit dans `canon/` par `extract-pdf` ; (2) le writer ne voit ni `canon/` (après migration) ni `mj/` ni `systeme/` → récit final bâti sur une vue partielle/obsolète.
- **Quick wins**: corriger `bank-yml.md` (canon/, personas), titre `forge`, signaler le `wot-astd.md` manquant.
- **Follow-up actions**: migrer les actions rpg-writer + extract-pdf (reco 1-2), puis recâbler les `bank.yml` réels vers canon/+mj/+systeme/ (reco 3).
- **Additional notes**: les `bank.yml` réels (rouedutemps, astd, shattered-paris) ont déjà été partiellement migrés cette session ; ils serviront de cas-test une fois les actions rpg-writer alignées. Coffre non versionné git → prudence sur toute écriture de masse.
