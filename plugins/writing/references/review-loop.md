# Boucle de review — convergence & PLATEAU

Source de vérité de la **boucle qualité** d'un chapitre. Partagée par `review`
(`comment`/`doctor`), `write` (`--feedback`), `persona` (`train`) et `tone-finder`
(`improve`). Tout chemin de routage entre ces skills est décrit **ici** ; les
SKILL.md y renvoient au lieu de redéfinir.

> Périmètre : opère **uniquement** dans `<output>/` et `<brief>/` (contrat
> `brief-model.md`). Le terminal de la boucle est le **chapitre `.md` figé** ; la
> mise en page finale (export **ICML**, cf. `export-icml.md`) est une étape
> **séparée et postérieure**, hors de cette boucle.

---

## Vue d'ensemble

```
chapter-NN.md
   │
   ▼
[comment]  ── score consensus /20 ──►  Triage
   ▲                                     │
   │                    ┌────────────────┼─────────────────────────┐
   │                    ▼                ▼                          ▼
   │           structurel /        patchable                pattern systémique
   │         ≥2 personas plaf.     (11-13 ou ≥14)              (≥3 chapitres)
   │                    │                │                          │
   │                    ▼                ▼                          ▼
   │          [write-* --feedback]   [doctor]            [tone-finder:improve]
   │           réécriture / TOC    corrections             output-style v+1
   │                    │           chirurgicales                  │
   │                    │                │                         ▼
   │                    └───────┬────────┘              [write-* --feedback]
   │                            ▼                                   │
   └───────── re-comment / re-scoring ◄──────────────────────────┘
                                │
                    Δ = |score − score_précédent|
                                │
                ┌───────────────┴───────────────┐
            Δ ≥ 1.0                          Δ < 1.0
         (progresse encore)              = **PLATEAU**
                │                               │
         reboucle (triage)            chapitre figé → fin
                                      (export ICML = étape séparée)
```

Correspondance avec l'ancien schéma (pré-refonte v3) : `brainstorm`→`obsidian:forge`,
`generate-toc`/`write-toc-chapter`→`toc`, `write-novel|write-roleplaying`→`write`,
`univers-extract`→`obsidian:lore-extract`. `bank.yml` n'intervient **plus** dans
cette boucle (`writing` est découplé). `md-to-tex` est **abandonné** ; le terminal
est le chapitre figé, l'export ICML est postérieur.

---

## Constantes (seuils)

Tous les seuils de la boucle sont **ici**, en un seul endroit (pas dispersés en prose) :

| Constante | Valeur | Rôle |
|-----------|--------|------|
| `PLATEAU_DELTA` | **1.0** | en-deçà (`Δ < 1.0`), le gain est marginal → PLATEAU |
| `MAX_ITERATIONS` | **5** | garde anti-boucle par chapitre → `CAP-ITERATIONS` |
| `SYSTEMIC_CHAPTERS` | **3** | un symptôme sur ≥3 chapitres devient « transverse » → révision d'intrant (`tone-finder:improve` / `persona:train`) |

> Le seuil `SYSTEMIC_CHAPTERS` gouverne **les deux** déclencheurs de révision d'intrant
> (style ET persona). Le déclencheur `persona:train` sur ≥3 chapitres est un choix
> de conception (le schéma d'origine ne montrait que `tone-finder`) — à rediscuter si besoin.

## Le critère PLATEAU

Chaque passage de `comment` calcule un **score consensus** (cf. `01-comment.md`).
La boucle compare ce score à celui de l'itération précédente du **même chapitre** :

| Condition | Verdict | Suite |
|-----------|---------|-------|
| Première évaluation (aucun historique) | `INITIAL` | triage normal |
| `Δ ≥ 1.0` | `CONTINUE` | la correction a fait gagner ≥ 1 pt → reboucler via triage |
| `Δ < 1.0` | **`PLATEAU`** | gain marginal → **arrêter** ; le chapitre est figé |

- **Δ** = valeur absolue de l'écart entre le consensus courant et le précédent.
- Un PLATEAU **n'implique pas** un bon score : un chapitre peut plafonner bas.
  Si le PLATEAU est atteint avec un score faible **et** des personas
  systématiquement plafonnées, c'est le signal d'une **révision des intrants**
  (personas / output-style) — voir plus bas, pas d'un acharnement sur le texte.
- **Garde anti-boucle** : maximum **5 itérations** par chapitre. Atteint la
  borne sans `PLATEAU` → s'arrêter en consignant `verdict: CAP-ITERATIONS`
  (jamais déclarer `PLATEAU` à tort pour sortir).
- **Le PLATEAU ne doit jamais être déclaré tant que `Δ ≥ 1.0`**, quoi qu'il
  arrive : tant que le texte gagne ≥ 1 pt, on continue (borne d'itérations mise
  à part). C'est l'invariant testé en négatif.

### Artefact d'historique — `<output>/review/chapter-NN-scores.md`

Cumulatif, **une ligne par itération**, écrit par `comment` :

```markdown
# Score history — chapter-NN

| Itération | Date       | Consensus /20 | Δ    | Verdict        | Route            |
|-----------|------------|---------------|------|----------------|------------------|
| 1         | 2026-06-13 | 11.8          | —    | INITIAL        | doctor           |
| 2         | 2026-06-13 | 13.5          | 1.7  | CONTINUE       | write --feedback |
| 3         | 2026-06-13 | 14.1          | 0.6  | PLATEAU        | —                |
```

`Δ` vide à l'itération 1. `Route` = la décision de triage prise (vide si PLATEAU).

---

## Routes de triage (sortie de `comment`)

Décidées à partir du rapport `comment` (score consensus + plafonnements + Section 2
patterns systémiques) :

| Déclencheur | Route | Skill |
|-------------|-------|-------|
| Consensus ≤ 10/20 **ou** ≥ 2 personas plafonnées par un *must-have* structurel | réécriture | `write --feedback` |
| 11–13/20 (corrections importantes) ou ≥ 14/20 (optionnel) | corrections | `review:doctor` |
| Pattern systémique récurrent sur **≥ 3 chapitres** (Section 2) | révision **style** | `tone-finder:improve` → `output-style v+1` → puis `write --feedback` |
| Une **même persona** plafonnée (≤ 11/20 sur ses *must-have*) sur **≥ 3 chapitres** | révision **persona** | `persona:train` (recalibrer depuis les retours accumulés) |

> Les deux dernières routes ne s'appliquent **pas** chapitre par chapitre : elles
> corrigent un défaut **transverse au projet** (le style ou la persona elle-même),
> détecté seulement quand le même symptôme revient sur ≥ 3 chapitres. Après une
> révision d'intrant, les chapitres concernés repassent par `write --feedback`.

---

## Déclenchement des révisions d'intrants — quand `persona:train` / `tone-finder:improve`

- **`tone-finder:improve`** — quand `comment` relève un **pattern systémique**
  (Section 2) qui revient sur **≥ 3 chapitres** : ce n'est pas le texte qui dévie,
  c'est la convention de style qui est incomplète/inexacte → mettre à jour
  l'output-style (bump `version:` du fichier, `v+1`).
- **`persona:train`** — quand une **persona donnée** plafonne (≤ 11/20 sur ses
  *must-have*) de façon répétée sur **≥ 3 chapitres** : le signal n'est plus « ce
  chapitre est mauvais pour ce lecteur » mais « cette persona est mal calibrée /
  ses attentes ont dérivé » → la raffiner depuis `<output>/review/` accumulé.

Ces deux révisions consomment les fichiers `<output>/review/chapter-NN-*.md` (retours
`comment`) et réécrivent les intrants dans `<brief>/` (`output-styles/`, `personas/`).
