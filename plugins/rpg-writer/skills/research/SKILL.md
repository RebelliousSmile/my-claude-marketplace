---
name: research
model: sonnet
description: Performs cross-referenced documentary research for writing projects — web research on historical, cultural, or world-building topics, plus terminology extraction from universe source files. Use when a topic lacks documentation in the universe docs, when forge identifies a knowledge gap, or when extracting terminology from a PDF extraction result. Do NOT use for general software research — use web search directly; do NOT use for reviewing chapter content — use `review` instead.
---

# Research

Two documentary tools for writing projects AND game prep: **research** performs structured web research (minimum 3 searches, cross-referenced sources, comparison with existing docs, contradiction flagging) and saves a report under the **target scope's** `research/` folder (setting/univers, campagne, or writing project — see Transversal rules) ; **extract-terminology** distills terminology, proper nouns, and world-building elements from universe source documents into a canonical `terminologie.md`.

## Available actions

| #   | Action                | Role                                                               | Input                                        |
| --- | --------------------- | ------------------------------------------------------------------ | -------------------------------------------- |
| 01  | `research`            | Web research with cross-referencing and existing-doc comparison    | sujet/question + portée (univers/setting \| campagne) |
| 02  | `extract-terminology` | Extract and classify terminology from universe source files        | `<univers>` + source file(s)                 |

## Default flow

Trigger-to-action mapping:
- "research", "web research", "look up", "find documentation about", "documentary research" → `research`
- "extract terminology", "extract terms", "univers-extract", "terminology from source", "build terminologie.md" → `extract-terminology`

## Transversal rules

- **Portée de `research` (déterminer AVANT d'écrire — ne plus cibler « univers » par défaut).** Toute recherche vise une **portée** explicite : un **setting/univers** (savoir **durable, partagé** entre campagnes) ou une **campagne** (savoir **propre à une partie**). Demander/déduire la portée ; lister les `univers/` et `campagnes/` du jeu. Chemins — source de vérité `setup/references/vault-layout.md` :
  - **Setting/univers** : trouvailles vérifiées → `<univers-root>/canon/<thème>.md` (deviennent du **canon partagé**) ; rapport de travail → `<univers-root>/research/<slug>-<date>.md`.
  - **Campagne** : rapport → `<campagne-root>/research/<slug>-<date>.md` ; les faits retenus restent **propres à la partie** (versés dans la prep de campagne par `rpg`) et ne sont **promus en canon partagé que sur décision explicite**.
  - **Projet d'écriture** (`<projet-root>` = `ecrits/<projet>/`) : rapport → `<projet-root>/research/<slug>-<date>.md` ; findings vérifiés → le `canon/` de l'univers du projet.
- `research`: minimum 3 distinct web searches; cross-reference ≥ 3 different sources; compare ALL findings with existing docs **of the chosen scope** (univers `canon/` ; + lore de campagne si portée campagne); flag contradictions explicitly.
- `research` — **mode workflow (optionnel, sujets larges)** : pour un sujet **décomposable** (corpus de techniques, univers entier, époque, thème multi-facettes), proposer un **workflow** plutôt qu'une recherche inline : *fan-out* (1 agent par sous-question/angle) → **vérification adversariale** des affirmations → **synthèse citée**. C'est le pattern `deep-research`. Garde-fous : le workflow **exige un opt-in explicite** de l'utilisateur (coût en tokens) — **jamais auto-lancé**, on le propose et on attend l'accord ; les garanties de qualité s'appliquent **par sous-sujet** (≥3 sources croisées, comparaison au canon, contradictions signalées, aucune source inventée) ; la synthèse finale et l'écriture des fichiers restent déterministes (revue avant d'écrire). Pour un sujet **étroit** (un fait, un terme), conserver le **mode inline** (≥3 recherches) — plus rapide et moins coûteux.
- `extract-terminology`: never invent terms not present in the source; organize output by category (proper nouns, places, organizations, concepts, mechanics); append to or create `<univers-root>/canon/terminologie.md`. It is the terminology-focused complement of `lore-extract` (both write `canon/`).
- Both actions must validate before writing files.
- If web search is unavailable, state clearly and suggest manual research fallback.

> Path variables: see `setup/references/vault-layout.md`.
