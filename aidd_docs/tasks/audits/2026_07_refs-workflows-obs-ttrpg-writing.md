---
name: audit
description: Codebase audit report template
argument-hint: N/A
---

# Codebase Audit for plugins/{obs, ttrpg, writing}

Audit ciblé sur les **références cassées** et les **workflows cassés** dans les trois plugins `obs`, `ttrpg` et `writing`, après la série d'extractions récentes (ttrpg extrait de obs ; lore-extract/rules-keeper déplacés vers ttrpg ; forge déplacé vers writing). Vérité terrain établie par inventaire filesystem, puis confrontation mécanique de chaque référence (cross-plugin `plugin:skill`, `${CLAUDE_PLUGIN_ROOT}/…`, chemins relatifs `../…`, includes `@…`, evals, routers).

- Status: **FIXED** (toutes les références résolvables cassées corrigées et revérifiées)
- Confidence: **Élevée** (résolution de chemins vérifiée `ls`/`realpath`/`grep` avant et après correction, faux positifs écartés en contexte)
- Scope: `plugins/obs`, `plugins/ttrpg`, `plugins/writing`

## Findings

### 🔴→✅ Chemins `../../references/` cassés dans les fichiers `actions/` de ttrpg (corrigé)

Les `SKILL.md` sont à `skills/<skill>/SKILL.md` → `../../references/` résout vers `ttrpg/references/` (correct). Mais les fichiers `actions/` sont **un niveau plus profond** (`skills/<skill>/actions/…`) : `../../references/` y résolvait vers `ttrpg/skills/references/`, **qui n'existe pas**. Défaut **pré-existant** (hérité de obs avant l'extraction), non introduit par les déplacements récents.

**Correction de vérification** : la première passe de cet audit avait sur-compté la casse à 14 occurrences en incluant à tort les fichiers `evals/` — un second passage `grep` précis (distinguant `../../references/` à deux niveaux du `../../../references/` à trois niveaux, ce dernier étant correct depuis `evals/`) a montré que les 8 occurrences en `evals/` (`campaign-scenarios.md`, `pc-scenarios.md`, `narrateur-scenarios.md`, `oracle-scenarios.md`, `play-scenarios.md`) utilisaient déjà `../../../references/`, donc résolvaient correctement. Seules les 6 occurrences en `actions/` ci-dessous étaient réellement cassées. Toutes corrigées vers `${CLAUDE_PLUGIN_ROOT}/references/…`, alignant ces fichiers sur la convention déjà en usage dans `rules-keeper`, `solo-mc` et `lore-extract` (actions/evals) de ttrpg, et sur `obs`/`writing`.

- [✅] **Corrigé**: `plugins/ttrpg/skills/campaign/actions/03-prep-session.md:24` `../../references/jdr-layout.md` → `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md`
- [✅] **Corrigé**: `plugins/ttrpg/skills/campaign/actions/06-review.md:25` (idem)
- [✅] **Corrigé**: `plugins/ttrpg/skills/pc/actions/03-reorganize.md:32` (idem)
- [✅] **Corrigé**: `plugins/ttrpg/skills/pc/actions/04-log-session.md:26` (idem)
- [✅] **Corrigé**: `plugins/ttrpg/skills/pc/actions/05-show.md:25` (idem)
- [✅] **Corrigé**: `plugins/ttrpg/skills/pc/actions/08-sessions.md:22` (idem)

### 🔴→✅ `writing:research` — cross-ref vers un skill inexistant (corrigé)

`research` vit dans **obs**, pas dans writing. Deux « Do NOT use » orientaient vers `writing:research`, qui n'existe pas.

- [✅] **Corrigé**: `plugins/ttrpg/skills/lore-extract/SKILL.md:4` « use `writing:research` instead » → « use `obs:research` instead » (cross-plugin, ttrpg→obs)
- [✅] **Corrigé**: `plugins/obs/skills/extract-pdf/SKILL.md:3` « use `writing:research` instead » → « use `research` instead » (bare : `extract-pdf` et `research` sont tous deux dans `obs`, convention same-plugin confirmée par `brief/SKILL.md` qui référence déjà `research` en bare 2×)

### 🟡→✅ Préfixe de skill au lieu de préfixe de plugin (`tree:references/…`) (corrigé)

- [✅] **Corrigé**: `plugins/obs/skills/brief/SKILL.md:61` `tree:references/tree-convention.md` → `obs:references/tree-convention.md` — la forme adressable est le **plugin**, pas le skill.

### 🟡→✅ Attribution erronée d'un fichier de référence de niveau plugin (corrigé)

- [✅] **Corrigé**: `plugins/obs/skills/tree/SKILL.md:61` « format in `obs:brief`'s `references/bank-yml.md` » → « format in `${CLAUDE_PLUGIN_ROOT}/references/bank-yml.md` » — `bank-yml.md` est au **niveau plugin** (existence vérifiée : `plugins/obs/references/bank-yml.md`), pas propriété du skill `brief`.

### 🟢 Renvoi cross-plugin en prose (par conception, non résolvable à l'exécution)

- [🟢] **Note**: `plugins/writing/skills/forge/SKILL.md:30` « `ttrpg`'s `references/jdr-layout.md` » — pointeur conceptuel vers un fichier d'un autre plugin (writing ne peut pas résoudre le fichier de ttrpg à l'exécution ; il n'y a pas de mécanisme cross-plugin pour `${CLAUDE_PLUGIN_ROOT}`). Formulation volontaire et explicite ; acceptable. Alternative : ne renvoyer que vers `ttrpg:campaign` (skill) sans citer le chemin de fichier.

### 🟢 Vérifications passées (pas de casse)

- [🟢] **Workflows / routers**: `plugins/*/skills/*/SKILL.md` — chaque action déclarée dans les tables « Available actions » possède un fichier `actions/*-<nom>.md`. Aucune action orpheline.
- [🟢] **`${CLAUDE_PLUGIN_ROOT}/references/*` et `/skills/*/references/*`**: toutes résolvent dans leur propre plugin (obs, ttrpg, writing).
- [🟢] **evals**: tous les `evals/scenarios.json` cités dans les `SKILL.md` existent.
- [🟢] **`@references/…` (includes)**: résolution cohérente au niveau racine du skill (convention partagée obs/ttrpg/writing).
- [🟢] **Cross-refs `plugin:skill` restantes**: toutes valides ; les seules occurrences de skills déplacés (`obs:solo-mc`, `obs:lore-extract`, `obs:rules-keeper`, `obs:rpg`, `obs:forge`, `writing:rules-keeper`) sont **historiques** (CHANGELOG, table « ancien schéma » de `writing/references/review-loop.md`) — laissées intactes à dessein.
- [🟢] **Aucune ref bare** vers un skill parti (`forge`/`lore-extract`/`rules-keeper`/`pc`/`campaign`/`solo-mc`/`rpg`) ne subsiste dans les skills de `obs`.

## ✅ Audit Checklist

### Dead and unused code

- [~] Non applicable (plugins de définitions de skills en Markdown ; pas de code applicatif dans le périmètre). `jdr-layout-checks.py` non analysé côté logique (hors scope « références/workflows »).

### Duplication

- [x] `jdr-layout.md` et `jdr-layout-checks.py` dupliqués obs↔ttrpg — **par conception** : ttrpg se plie à l'arborescence de domaine définie par obs, et un plugin ne peut pas lire les fichiers d'un autre à l'exécution. À garder **synchronisés manuellement** (notice de duplication déjà présente en tête des deux copies), pas à fusionner.

### Complexity

- [~] Non applicable au périmètre.

### Standards and conventions

- [x] Convention de résolution de références désormais **uniforme** : les 6 fichiers `actions/` de ttrpg qui utilisaient encore `../../references/` (cassé à cette profondeur) sont passés à `${CLAUDE_PLUGIN_ROOT}/references/`, alignés sur le reste de ttrpg (`rules-keeper`, `solo-mc`, `lore-extract`) et sur obs/writing.
- [x] Nommage `plugin:skill` : convention désormais respectée partout — les 2 `writing:research` (dont un corrigé en bare `research`, same-plugin) et le `tree:references/` corrigés.

### Error handling / Test coverage / Performance / Security

- [~] Non applicable au périmètre « références/workflows » de cet audit.

## Recommendations

Toutes appliquées :

1. ✅ **Chemins `../../references/` cassés dans `ttrpg/skills/{campaign,pc}/actions/`** → `${CLAUDE_PLUGIN_ROOT}/references/` (6 fichiers).
2. ✅ **`writing:research` → cible correcte** (`ttrpg/lore-extract/SKILL.md:4` → `obs:research` ; `obs/extract-pdf/SKILL.md:3` → `research` bare, same-plugin).
3. ✅ **2 attributions plugin/skill dans obs** (`brief/SKILL.md:61` `tree:` → `obs:` ; `tree/SKILL.md:61` `obs:brief`'s `references/…` → `${CLAUDE_PLUGIN_ROOT}/references/…`).
4. Non appliqué (optionnel, jugé acceptable en l'état) : la prose cross-plugin de `writing:forge/SKILL.md:30` reste un pointeur conceptuel volontaire vers `ttrpg`'s `references/jdr-layout.md` — pas de mécanisme cross-plugin pour `${CLAUDE_PLUGIN_ROOT}`, donc pas de meilleure forme disponible.

## Final Audit

- **Score initial**: 🔴 8 références résolvables réellement cassées (6 chemins `actions/` de ttrpg + 2 cross-ref `writing:research`) + 2 imprécisions doc 🟡 + 1 note 🟢. *(Rectificatif : la première passe avait sur-compté à 14+2=16 en incluant à tort 8 occurrences `evals/` déjà correctes à trois niveaux — voir le détail dans la section Findings.)*
- **Score final**: ✅ 0 référence cassée restante, toutes corrections revérifiées par `grep`/`ls` post-fix.
- **Top risks (résolus)**: un agent exécutant les actions `pc`/`campaign` ne pouvait pas ouvrir `jdr-layout.md` (chemin faux) → perte de la convention d'arborescence de domaine au runtime ; instruction « use `writing:research` » pointait vers un skill inexistant. Les deux sont corrigés.
- **Follow-up actions**: envisager un check CI léger (script) validant que toute ref `references/…` résolue dans le plugin existe, pour prévenir une régression de ce type.
- **Additional notes**: les mentions de skills déplacés dans les CHANGELOG et la table « ancien schéma » de `review-loop.md` sont **historiques** et correctes en l'état — non touchées. La duplication `jdr-layout.*` obs↔ttrpg est **voulue** (ttrpg conforme à l'arborescence obs, confirmé explicitement par l'utilisateur) et reste synchronisée manuellement, pas dédupliquée.
