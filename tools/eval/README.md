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
```

Exit `0` si tout est conforme, `1` sinon. Chaque violation est listée avec sa règle.

## Ce qui est vérifié

**Côté `_brief/`**
- `_brief/` et `_brief/summary.md` présents, `summary.md` non vide.
- `summary.md` déclare **`type:`** et **`language:`** en front-matter YAML.
- `_brief/output-styles/` contient ≥ 1 style ; `_brief/personas/` présent (0+).

**Côté `_output/`**
- `_output/chapters/` contient ≥ 1 fichier, tous en `chapter-NN.md` (2 chiffres).
- `toc/` **optionnel** → si présent, `INDEX.md` requis + specs en `chapter-NN.md`.
- `review/` **optionnel** → `chapter-NN-<persona>.md`.
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

| Fixture | Type | TOC | Personas | Particularité |
|---------|------|-----|----------|---------------|
| `technical-doc` | `technical-doc` (en) | oui | 2 | + review |
| `cheat-sheet` | `cheat-sheet` (fr) | non | 0 (vide) | court, 1 chapitre |
| `rpg-scenario` | `rpg-scenario` (fr) | oui | 1 | + storyboard |
| `fantasy-novella` | `novel` (fr) | non | 1 | court + review |

Elles servent à la fois d'**exemples canoniques** de sortie valide et de **garde
de régression** : modifier le contrat sans mettre à jour fixtures + harness fait
échouer le run.
