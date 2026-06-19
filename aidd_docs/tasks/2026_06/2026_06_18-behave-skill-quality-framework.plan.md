# Plan — overcode:behave quality framework

**Objectif :** Rendre la skill `overcode:behave` utile pour concevoir, juger et maintenir des tests comportementaux de haute qualité, en ajoutant un vrai cadre d'évaluation sans casser le contrat existant.

**Contrainte centrale :** deux niveaux distincts à ne pas mélanger — (1) qualité d'un test individuel, (2) couverture d'une suite.

---

## Composants livrés

### 1. `references/quality-grid.md` (nouveau)
Grille de qualité par scénario individuel — répond à : "Ce test est-il bien écrit ?"

**Contenu :**
- 7 axes (Fidélité au contrat · Observabilité · Non-ambiguïté · Réalisme du fixture · Anti-invention · Minimalité · Reproductibilité), chacun coté 0–2
- Score global /14 avec 3 seuils : vert (12–14), jaune (8–11), rouge (0–7)
- Anti-patterns documentés avec before/after : faux bon test, scénario trop vague, scénario trop large
- Test de discriminance opérationnel ("Si le target avait violé la règle, le critère aurait-il donné FAIL ?")

### 2. `actions/04-review.md` (nouveau)
Action de révision de suite — répond à : "Cette suite couvre-t-elle vraiment le comportement cible ?"

**Contenu :**
- Passe 1 — couverture comportementale : extraction de la carte du spec → mapping scénarios → identification des gaps (critique / important / mineur)
- Passe 2 — qualité : scoring 7 axes par scénario, détection d'anti-patterns, calcul de la qualité moyenne de suite
- Synthèse : lacunes prioritaires (avec sketch), améliorations ciblées (chirurgicales, axe par axe)
- Règles transversales : les deux passes sont indépendantes, ne pas modifier la suite, ne pas appeler le harness

### 3. `references/harness-conventions.md` (modifié)
Ajout des règles de jugement renforcées.

**Ajouts :**
- Section "PASS / FAIL / N/A — règles de jugement précises" : 3 conditions pour PASS, FAIL ssi règle explicite violée, N/A vs data limit séparés
- Section "Détection des faux bons tests" : 4 signaux, test de discriminance, action corrective
- Section "Détection des scénarios trop vagues" : 3 signaux, action corrective
- Section "Détection des scénarios trop larges" : 3 signaux, décomposition atomique

### 4. `SKILL.md` (modifié)
- Action 04 `review` dans la table et le routing
- Tableau "Two questions — two tools" pour séparation explicite des niveaux
- Référence à `quality-grid.md` dans Conventions & assets
- Description front-matter mise à jour pour inclure les triggers review/quality

---

## Structure de référence résultante

```
plugins/overcode/skills/behave/
├── SKILL.md                          ← hub; table 4 actions; deux niveaux séparés
├── actions/
│   ├── 01-scaffold.md
│   ├── 02-run.md
│   ├── 03-regress.md
│   └── 04-review.md                  ← nouveau
├── references/
│   ├── harness-conventions.md        ← contrat + jugement renforcé
│   ├── checker-pattern.md
│   └── quality-grid.md               ← nouveau
└── assets/
    └── scenario-template.md
```

---

## Invariants à préserver

- Dry-run, never mutate real data
- Reproduce-then-confirm
- Write-scoped observables > prose
- N/A ≠ FAIL ≠ PASS
- Judge faithfully (no idealized-agent PASS)
- Results log append toujours daté avec Δ

---

## Hors scope

- Pas de modification des actions 01/02/03 (contrat existant intact)
- Pas de code review généraliste
- Pas d'extension aux tests unitaires
- La grille de qualité n'est pas un blocage pour exécuter une suite (advisory, pas gate)
