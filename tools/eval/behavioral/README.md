# Behavioral eval — couche LLM-juge

Troisième couche de test, **comportementale** : elle vérifie ce que `harness.mjs`
(structure) et `coverage.mjs` (routage) ne peuvent pas — le **comportement** des
skills à l'exécution : scoring, décisions de triage, détection de PLATEAU,
déclenchement des révisions d'intrants.

C'est intrinsèquement **non déterministe** (un LLM exécute la skill, un LLM juge la
sortie). Le dépôt n'embarque donc **pas de runner** : comme `evals/scenarios.json`,
c'est une **spec exécutée à la demande** par Claude Code.

## Pièces

- **`rubric.md`** — comment le juge décide (critères, pass/fail, posture adverse).
- **`cases.json`** — les cas comportementaux : `id`, `skill`, `action`, contexte
  d'entrée (fixture + arguments), comportement attendu, critères de jugement.
- **`results-<date>.md`** — trace d'une exécution (verdict par cas). Régénérable.

## Protocole d'exécution (à la demande)

Pour chaque cas de `cases.json` :

1. **Préparer l'entrée** — copier la fixture désignée dans un dossier de travail
   jetable (les skills écrivent ; ne pas polluer les fixtures versionnées).
2. **Exécuter la skill** `skill:action` sur cette entrée (vraie invocation, ou un
   sous-agent qui joue la skill avec sa `SKILL.md` + ses `actions/` + références).
3. **Juger** la sortie via un **second** agent, isolé, avec `rubric.md` + le
   `expect`/`judge` du cas. Le juge ne voit pas le raisonnement du producteur,
   seulement les artefacts produits.
4. **Consigner** `pass`/`fail` + justification dans `results-<date>.md`.

> Lancer producteur et juge dans des **contextes séparés** (deux sous-agents) :
> un juge qui a produit la sortie n'est pas un juge.

## Lien avec les couches déterministes

Les invariants vérifiables sans LLM (nommage, `PLATEAU ⟺ Δ<1.0` sur l'artefact
`scores.md`, couverture de routage) restent du ressort de `harness.mjs` /
`coverage.mjs` — la couche comportementale ne les re-teste pas, elle teste ce qui
exige du **jugement** (qualité du scoring, pertinence du triage, recalibrage).
