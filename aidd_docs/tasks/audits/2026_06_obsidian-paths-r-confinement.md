---
name: audit
description: Obsidian skills — confinement R + intégrité des chemins/références
---

# Codebase Audit for plugins/obsidian/skills (chemins & confinement R)

Audit ciblé (et non générique) sur trois questions : (1) les traitements restent-ils dans `R` ? (2) les chemins sont-ils corrects ? (3) des changements de chemin pointent-ils vers des ressources manquantes ?

- Status: 🔴 ANOMALIES (2 hard, références cassées) + 🟡 3 incohérences
- Confidence: élevée sur les références cassées (preuve par résolution croisée) ; moyenne sur les nuances de convention `judge`
- Scope: `plugins/obsidian/skills/**` + `plugins/obsidian/references/`

## Fait de résolution établi (clé de tout l'audit)

`${CLAUDE_PLUGIN_ROOT}` = **racine du plugin** = `plugins/obsidian/`. Preuve : `jdr-layout.md` n'existe **qu'à** `plugins/obsidian/references/jdr-layout.md` (niveau plugin, hors `skills/`) et 7 skills le référencent via `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md` — ces refs ne fonctionnent que si `${CLAUDE_PLUGIN_ROOT}` pointe la racine plugin. Les refs relatives concordent (`rpg/SKILL.md:80` `../../references/jdr-layout.md` → `plugins/obsidian/references/`).

**Corollaire :** toute ref `${CLAUDE_PLUGIN_ROOT}/references/<X>` n'est correcte que si `<X>` vit réellement dans `plugins/obsidian/references/`. Les fichiers de référence restés au niveau **skill** (`skills/<skill>/references/`) mais référencés via `${CLAUDE_PLUGIN_ROOT}/references/` sont donc **cassés**.

## Findings

- [🔴] **Référence cassée**: `plugins/obsidian/skills/tree/SKILL.md:13` et `:55`, `tree/actions/01-index.md:5` et `:29`, `02-check.md:5`, `03-fix.md:5`, `04-sort.md:5`, `05-judge.md:5` — `${CLAUDE_PLUGIN_ROOT}/references/tree-convention.md` résout vers `plugins/obsidian/references/tree-convention.md`, **inexistant**. Le fichier réel est `plugins/obsidian/skills/tree/references/tree-convention.md`. Chaque action `tree` instruit de lire un fichier introuvable au chemin donné. (Fix : déplacer `tree-convention.md` → `plugins/obsidian/references/` **ou** remplacer la ref par `references/tree-convention.md` (relative skill).)
- [🔴] **Référence cassée**: `plugins/obsidian/skills/brief/SKILL.md:13` et `:58`, `brief/actions/01-assemble.md:10` — `${CLAUDE_PLUGIN_ROOT}/references/bank-yml.md` résout vers `plugins/obsidian/references/bank-yml.md`, **inexistant**. Fichier réel : `plugins/obsidian/skills/brief/references/bank-yml.md`. (Même fix.)
- [🟡] **Incohérence de ref (jdr-layout)**: `plugins/obsidian/skills/lore-extract/SKILL.md:37` et `extract-pdf/SKILL.md:68` utilisent la forme **relative** `references/jdr-layout.md` → résout vers `skills/<skill>/references/jdr-layout.md`, **inexistant**, alors que les lignes voisines des mêmes fichiers utilisent correctement `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md`. Aligner sur la forme `${CLAUDE_PLUGIN_ROOT}`.
- [🟡] **Cohérence convention (judge vs tree-convention)**: `plugins/obsidian/skills/tree/actions/05-judge.md:101` — le verdict « garder + avancer » écrit un **fichier isolé** dans `R/<AAAA>/<MM>/<filename>`, mais l'axe daté de `tree-convention.md` héberge des **unités projet** (`R/<AAAA>/<MM>/<projet>/`) ; `sort` cible explicitement des répertoires-unités. Un fichier nu à ce niveau serait re-signalé comme `unsorted`/drift par `check`/`sort` → `judge` peut produire exactement ce que les autres actions « corrigent ». (Confirmer l'intention, ou avancer vers une unité plutôt qu'un fichier nu.)
- [🟡] **Découverte de R divergente**: `plugins/obsidian/skills/tree/actions/05-judge.md:9` résout `R` par « walk up to the domain root, then into `R/` », alors que tout l'écosystème JDR (`research/SKILL.md:26`, `extract-pdf/actions/01-setup.md:47`, `jdr-layout.md`) résout `R` en **remontant jusqu'au marqueur `_savoir/`**. Risque : `judge` cible un répertoire différent des autres skills R. Aligner sur le marqueur `_savoir/`.
- [🟢] **Confinement R (judge)**: `plugins/obsidian/skills/tree/actions/05-judge.md:71,101,115` — toutes les destinations d'écriture (`R/_trash/`, `R/<AAAA>/<MM>/`) restent **dans `R`**. Aucune fuite hors `R`. ✓
- [🟢] **Garde credentials**: `plugins/obsidian/skills/tree/actions/05-judge.md:20-33` — détection par nom seul, jamais de lecture, exception `_code/`. Conforme. ✓
- [🟢] **Hardcoding hors-R (informatif)**: `mail/SKILL.md:18,47`, `project/SKILL.md:9,37,38,45` codent en dur `C:/Users/fxgui/Public/Notes/...`. Contredit la philosophie de portabilité de `tree`, mais ce sont des skills de domaine **non-R** (Notes/Thunderbird, Pro/Projets) et c'est **préexistant** — hors périmètre strict « traitements dans R ». À noter seulement.

## ✅ Audit Checklist (sections pertinentes)

### Standards et conventions
- [x] Structure de dossiers vs architecture : **2 fichiers de référence mal placés** vs leur mode de référencement (`tree-convention.md`, `bank-yml.md`).
- [x] Convention de chemins respectée : **non** pour les refs `${CLAUDE_PLUGIN_ROOT}` ci-dessus.

### Dead/unused & duplication
- [x] Pas de ressource morte détectée ; `jdr-layout.md` est bien le hub partagé vivant (7 consommateurs).

### Sécurité
- [x] Garde credentials présente dans `judge` ; secrets jamais lus. ✓

## Recommandations (par impact)

1. **Trancher l'emplacement des références partagées.** Précédent posé par `jdr-layout.md` : les refs cross-skill vivent à `plugins/obsidian/references/`. Déplacer `tree-convention.md` et `bank-yml.md` à `plugins/obsidian/references/` (cohérent, refs `${CLAUDE_PLUGIN_ROOT}` deviennent justes) **ou**, si on les garde skill-locales, repasser les 10 refs en relatif `references/<X>`. La 1re option est la plus cohérente (les deux fichiers sont déjà cross-référencés par d'autres skills).
2. **Uniformiser les refs `jdr-layout`** : remplacer les 2 formes relatives `references/jdr-layout.md` par `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md`.
3. **Réconcilier `judge` avec `tree-convention`** : (a) résolution de `R` par marqueur `_savoir/` ; (b) décider si « avancer » cible un fichier nu ou une unité datée, pour ne pas générer du drift que `check`/`sort` re-signalent.

## Final Audit

- **Score**: 6/10 — confinement R sain, mais intégrité des chemins de référence dégradée (2 refs hard cassées, dupliquées sur 10 emplacements).
- **Top risks**: les actions `tree` (dont la nouvelle `judge`) et `brief` instruisent de lire des références introuvables → comportement dégradé silencieux (la convention/manifeste n'est pas chargée).
- **Quick wins**: déplacer 2 fichiers à `plugins/obsidian/references/` corrige 10 refs d'un coup ; corriger 2 lignes `jdr-layout`.
- **Follow-up actions**: aligner la résolution de `R` et la sémantique « avancer » de `judge`.
- **Additional notes**: `${CLAUDE_PLUGIN_ROOT}` = racine plugin (établi par preuve croisée `jdr-layout.md`) ; à valider d'un coup d'œil sur la doc plugin si un doute subsiste.
