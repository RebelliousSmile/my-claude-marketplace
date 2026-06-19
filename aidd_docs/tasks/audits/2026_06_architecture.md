# Codebase Audit: plugin `design` (pilier architecture)

Architecture saine et frontières nettes ; le seul écart systémique est l'incohérence des conventions de référencement de chemins entre skills.

- **Date**: 2026-06-16
- **Scope**: `plugins/design/` (hors `adapters/measure/.venv/` — deps tierces)
- **Health**: good
- **Findings**: 0 critical, 2 warning, 3 minor

Health: `good` — aucun finding critique ; les frontières documentées (pivot, agent-feuille, oracle déterministe) sont respectées.

## Findings

| Sev | Category     | Location | Issue | Suggested fix | Effort |
| --- | ------------ | -------- | ----- | ------------- | ------ |
| ~~🟡~~ ✅ | architecture | `skills/enforce/SKILL.md:22,24` · `skills/adjust/SKILL.md:17,61` · `skills/diffuse/SKILL.md:24,81` · `skills/define/SKILL.md:50,63` | **4 conventions de référencement coexistent** pour des cibles internes : `${CLAUDE_PLUGIN_ROOT}/references/X`, `design/references/X` (racine-marketplace), `<skill>/references/X` (omet le segment `skills/`), et `references/X` nu (skill-relatif). Les fichiers existent tous, mais une résolution littérale de `enforce/references/gate-wiring.md` depuis la racine du plugin ne trouve rien (chemin réel `skills/enforce/references/gate-wiring.md`). Navigation dépendante de la convention → un agent qui suit le chemin littéral échoue. | **RÉSOLU 2026-06-16** — standardisé sur `${CLAUDE_PLUGIN_ROOT}/...` dans tous les SKILL.md et fichiers action (enforce, adjust, diffuse, define, destructure). | M |
| 🟡 | architecture | `README.md:33-39` | **Surface documentée ≠ surface livrée.** La table Skills liste les 5 verbes du funnel ; le skill invocable `/design:harness` (livré en 1.3.0) est absent — même optionnel/préparatoire, il fait partie de la surface publique. | Ajouter une ligne `harness` à la table + une sous-section « harness — maquette de référence (préparatoire, optionnel) ». | S |
| 🟢 | architecture | `skills/define/actions/05-copycat-fanout.md:11` | Le consommateur décrit *verbatim* l'artefact que harness produit (« SPA exposant `window.setPage`/`setViewport` ») sans pointer vers son producteur optionnel. Lien producteur→consommateur manquant : un lecteur du funnel n'a aucun chemin vers « comment générer cette maquette ». (Séparation harness = intentionnelle ; seul le pointeur manque.) | Ajouter une mention « maquette générable via `design:harness` » en note dans `05-copycat-fanout` et `05-fidelity-gate`. | S |
| ~~🟢~~ ✅ | architecture | `skills/enforce/actions/05-fidelity-gate.md:95` vs `skills/enforce/SKILL.md:79,100` | Même cible référencée de deux façons dans un même skill : `references/gate-wiring.md` (l.95) vs `enforce/references/gate-wiring.md` (l.79,100). Instance la plus nette de l'incohérence globale ci-dessus. | **RÉSOLU 2026-06-16** — aligné sur `${CLAUDE_PLUGIN_ROOT}/skills/enforce/references/gate-wiring.md` partout. | S |
| 🟢 | architecture | `agents/copycat.md:1-204` | Plus gros module réel (204 l.) : porte les modes bulk + drift, 4 frontières, méthode 12 étapes, invariants de clôture, schéma de sortie. Borderline god-module mais cohérent (responsabilité unique = orchestration de réconciliation). | Watch-item : si un 3ᵉ mode apparaît, externaliser la méthode mode-spécifique en `references/`. | M |

## Top actions (ranked by impact)

1. **Unifier les conventions de référencement** (résout finding #1 + #4) — passer tous les chemins internes en `${CLAUDE_PLUGIN_ROOT}/...`. Impact le plus large : c'est le seul écart systémique, il touche la navigabilité par agent de tout le plugin. Handoff : `aidd-dev:07-refactor` (mécanique, non destructif).
2. **Documenter harness dans README** (résout finding #2) — table Skills + sous-section. Aligne surface documentée et surface livrée.
3. **Lier producteur→consommateur de la maquette** (résout finding #3) — note dans `05-copycat-fanout` / `05-fidelity-gate`. Ferme la boucle de navigation sans toucher à la séparation intentionnelle de harness.
4. **(Différé)** Surveiller `copycat.md` (finding #5) — n'agir que s'il grossit.

## Coverage

Évaluation de conformance et de couplage menée sur l'ensemble des `.md` du plugin + les deux scripts Python (`measure.py`, `harness.py`), docs d'ancrage : `README.md`, `references/sc-pivot-contract.md`, `references/design-system-contract.md`.

**Conformité — points positifs (sans finding) :**
- **Funnel 5 verbes** (define→destructure→adjust→enforce→diffuse) : structure réelle conforme au README et aux frontmatter.
- **Frontière du pivot** (`sc-pivot-contract.md`) nette et appliquée : `design` détient le QUOI (contrat), `sc-*:design-bridge` détient le COMMENT (réalisation native). Direction de dépendance correcte (design n'importe jamais de sc-*).
- **copycat = agent-feuille** : la règle « ne spawn aucun agent » est tenue ; le fan-out est détenu par `define/05`.
- **Oracle déterministe** : la mesure vit dans `measure.py`, jamais « à l'œil » dans l'agent. Frontière tool/data respectée (rapports écrits hors plugin, par chemin absolu).
- **Contrat 3 couches** : une valeur = une couche, documenté de façon cohérente partout.
- Aucune dépendance circulaire ni import inverse détecté entre skills/adapters.

- **Scanned**: architecture
- **Skipped**: code-quality, security, dependencies, performance, tests, ui (hors scope — audit ciblé architecture demandé)
