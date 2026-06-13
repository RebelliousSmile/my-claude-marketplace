# tools/eval — harness de conformité brief → output

Validateur **déterministe** (zéro LLM, zéro réseau, zéro dépendance) du contrat
de travail `writing` : un répertoire projet `<projet>/` doit respecter le modèle
**brief → output** et les **invariants de portabilité**.

- Contrat brief→output : `plugins/writing/references/brief-model.md`
- Invariants I1–I4 : `plugins/obsidian/skills/tree/references/tree-convention.md`

## Lancer

```bash
node tools/eval/harness.mjs                 # valide les 4 fixtures bundlées
node tools/eval/harness.mjs <projet-dir>... # valide des projets réels
node tools/eval/coverage.mjs                # couverture de routage (tous les skills)
```

Exit `0` si tout est conforme, `1` sinon. Chaque violation est listée avec sa règle.

Trois couches de test, du plus déterministe au comportemental :

1. **`harness.mjs`** — structure d'un projet `<projet>/` (contrat brief→output + invariants + artefact plateau). Déterministe.
2. **`coverage.mjs`** — chaque action *routable* (table trigger→action de `SKILL.md`) a ≥ 1 cas dans son `evals/scenarios.json`. Déterministe. Les labels `expect_action` hors table (sémantiques, ex. `build+wire`) sont signalés en info, pas en échec.
3. **`behavioral/`** — comportement des skills (scoring, triage, PLATEAU, déclenchements `persona:train`/`tone-finder:improve`) : spec + rubrique jugées par un LLM à la demande (voir `behavioral/README.md`). Non déterministe.

## Ce qui est vérifié

**Côté `_brief/`**
- `_brief/` et `_brief/summary.md` présents, `summary.md` non vide.
- `summary.md` déclare **`type:`** et **`language:`** en front-matter YAML.
- `_brief/personas/` ≥ **3 personas distincts** et `_brief/output-styles/` ≥ **3 styles distincts** (triangulation requise par `review:comment`).

**Côté `_output/`**
- `_output/chapters/` contient ≥ 1 fichier, tous en `chapter-NN.md` (2 chiffres).
- `toc/` **optionnel** → si présent, `INDEX.md` requis + specs en `chapter-NN.md`.
- `review/` **optionnel** → `chapter-NN-<persona>.md`. Si un `chapter-NN-scores.md`
  est présent (historique de la boucle de review), l'**invariant plateau** est vérifié :
  première ligne sans `Δ`, `PLATEAU ⟺ Δ < 1.0`, `CONTINUE ⟺ Δ ≥ 1.0` (cf.
  `plugins/writing/references/review-loop.md`).
- `storyboard/` **optionnel** → `chapter-NN.md`.

**Invariants de portabilité**
- **I1** — répertoires de travail du projet préfixés `_` (`_brief`, `_output`).
- **I2** — contenu interne non préfixé `_`.
- **I3** — slugs libres en `kebab-case`, sans accent ni caractère non-ASCII
  (`INDEX.md`, `chapter-NN.md`, `chapter-NN-<persona>.md` exemptés).

> **I4** (dates `AAAA`/`MM` bien formées) relève de l'arborescence `Documents/`
> gérée par `obsidian:tree`, hors du périmètre d'un projet isolé — non vérifié ici.

## Fixtures

Quatre projets « golden » couvrant les branches du contrat :

Chaque fixture a ≥ 3 personas + ≥ 3 output-styles (contrat).

| Fixture | Type | TOC | Particularité |
|---------|------|-----|---------------|
| `technical-doc` | `technical-doc` (en) | oui | + review |
| `cheat-sheet` | `cheat-sheet` (fr) | non | court, 1 chapitre |
| `rpg-scenario` | `rpg-scenario` (fr) | oui | + storyboard |
| `fantasy-novella` | `novel` (fr) | non | court + review + **score-history (plateau démontré)** |

Elles servent à la fois d'**exemples canoniques** de sortie valide et de **garde
de régression** : modifier le contrat sans mettre à jour fixtures + harness fait
échouer le run.
