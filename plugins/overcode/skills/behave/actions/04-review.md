# Review

Relire une suite comportementale existante sous **deux angles indépendants** et produire un rapport de révision actionnable.

> Cette action répond à la question : **"Cette suite couvre-t-elle vraiment le comportement cible ?"**
>
> Pour la question **"Ce test est-il bien écrit ?"**, voir `@../references/quality-grid.md`.
>
> Les deux niveaux sont complémentaires — `review` les applique l'un après l'autre, sans les mélanger.

## Inputs

- `$ARGUMENTS` (required) — `<suite.md> <target>`
  - `suite.md` : chemin vers la suite à réviser.
  - `target` : chemin vers la spec du target (SKILL.md / agent.md + ses actions et références).

## Outputs

```
## Behave — review <name>-scenarios.md

### Passe 1 — Couverture comportementale
| Comportement (issu du spec) | Scénario(s) | Couvert ? |
|-----------------------------|-------------|-----------|
| <rule / invariant / router decision> | S2, S4 | ✓ |
| <autre règle> | — | ✗ GAP |
…

Couverture : X/Y comportements couverts (Z gaps)

### Passe 2 — Qualité des scénarios
| # | Score/14 | Axe(s) faible(s) | Anti-pattern détecté |
|---|----------|-----------------|---------------------|
| S1 | 12/14 | Minimalité (1) | — |
| S3 | 6/14 | Observabilité (0), Non-ambiguïté (0) | Scénario trop vague |
…

Qualité moyenne : X.X/14 (<couleur>)

### Lacunes prioritaires
1. <comportement non couvert> — sketch de scénario proposé
…

### Améliorations concrètes
- S3 → <réécriture proposée>
…
```

Ne modifie pas la suite. N'exécute pas le harness. N'appende rien au Results log.

## Process

### Passe 1 — Couverture comportementale (suite vs spec)

**Step 1a — Extraire la carte comportementale du spec.**

Lire le `SKILL.md` / `agent.md` du target ET ses fichiers action/référence. Construire la liste exhaustive de tout ce que le target est censé faire, refuser, router, écrire, ou ne pas écrire :

- Règles de comportement explicites (doit faire X, doit refuser Y)
- Invariants transversaux (dry-run, never-mutate, reproduce-then-confirm…)
- Décisions de routing (quand appeler action A vs B)
- Contraintes d'écriture (scope interdit, fichier cible, format)
- Comportements de repli / edge cases documentés

Chaque entrée = une ligne dans la carte. Regrouper les règles fortement liées mais ne pas écraser des comportements distincts.

**Step 1b — Mapper les scénarios de la suite sur la carte.**

Pour chaque comportement de la carte : identifier le(s) scénario(s) qui le couvrent (GO ou NO-GO). Un scénario couvre un comportement si son pass criteria le vérifie directement — pas par inférence.

- **Couvert** : au moins un scénario GO + (idéalement) un NO-GO miroir.
- **Partiellement couvert** : GO présent mais pas de NO-GO discriminant (ou inversement).
- **GAP** : aucun scénario ne teste ce comportement.

**Step 1c — Identifier les gaps et leur priorité.**

Classer les gaps :
- **Critique** : le comportement est load-bearing (ex. chemin d'écriture interdit, règle de refus, reproduce-then-confirm).
- **Important** : le comportement est fréquent mais non critique.
- **Mineur** : edge case documenté mais rare.

---

### Passe 2 — Qualité des scénarios (quality-grid)

**Step 2a — Scorer chaque scénario sur la grille.**

Appliquer `@../references/quality-grid.md` à chaque scénario de la suite : scorer les 7 axes (0–2), noter les axes faibles, détecter les anti-patterns (faux bon test, trop vague, trop large). Pour le test de discriminance et les règles précises de PASS/FAIL/N/A, charger `@../references/judgment-rules.md`.

**Step 2b — Identifier les scénarios faibles.**

Un scénario est faible si :
- Score < 8/14 (rouge) → à réécrire avant de compter dessus
- Score 8–11/14 (jaune) ET un axe à 0 → corriger l'axe critique avant le prochain run
- Un anti-pattern est détecté (faux bon test en particulier — invalide le verdict même si score acceptable)

**Step 2c — Calculer la qualité moyenne de la suite.**

Moyenne des scores individuels. Reporter la couleur globale (vert / jaune / rouge) et signaler si ≥1 faux bon test est présent (indépendamment de la moyenne — un seul faux bon test pollue la confiance dans la suite).

---

### Synthèse — Lacunes et améliorations

**Step 3a — Lacunes prioritaires.**

Pour chaque GAP critique ou important : proposer un sketch de scénario (Situation → Expected → Pass criteria draft) en utilisant le fixture nommé dans la suite. Ne pas rédiger la ligne finale — juste suffisamment de matière pour que l'auteur puisse la compléter.

**Step 3b — Améliorations concrètes.**

Pour chaque scénario rouge ou porteur d'un anti-pattern : proposer une réécriture ciblée sur l'axe le plus faible. Ne pas réécrire tout le scénario si un seul axe est problématique — être chirurgical.

**Step 3c — Ne pas modifier la suite.**

Le résultat de `review` est un rapport, pas une édition. Si l'utilisateur valide les propositions, l'implémentation se fait manuellement ou via `scaffold` pour les nouveaux scénarios.

---

## Règles transversales

- **Passe 1 et Passe 2 sont indépendantes.** Un scénario peut couvrir un comportement ET être mal écrit. Un scénario bien écrit peut couvrir un comportement déjà couvert (redondance utile ou non). Les deux niveaux s'analysent séparément avant d'être synthétisés.
- **Ne pas fabriquer des comportements du spec.** La carte comportementale liste uniquement ce que les fichiers du target *stipulent explicitement* — pas ce qu'un agent idéal ferait.
- **Un gap = une occasion de suite, pas une condamnation.** La suite existante reste valide pour ce qu'elle couvre. Le gap indique ce qui manque, pas que la suite est inutilisable.
- **Le faux bon test est la priorité absolue.** Un seul faux bon test dans une suite suffit à invalider sa confiance globale — signaler en tête du rapport, pas dans un tableau secondaire.

## Test

Le rapport de révision produit : une table de couverture comportementale exhaustive (issue du spec, pas inventée) avec distinction couvert / gap ; une table de qualité par scénario avec scores 7 axes et anti-patterns détectés ; une liste de lacunes prioritaires avec sketch ; une liste d'améliorations ciblées sur les axes faibles ; aucune modification de la suite ; aucun append au Results log.
