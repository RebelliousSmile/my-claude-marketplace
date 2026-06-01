# Master Plan: solo-mc Evolution — Anti-linearity, Dual Agents, Companion Play

## Overview

- **Goal**: Refactor `solo-mc` into a single canonical skill backed by two agnostic agents (`oracle` / `narrateur`), a decisional grid that forces rule-grounded play, and a companion substitution mode for split-party scenes.
- **Risk Score**: 7/10
- **Branch**: `feat/solo-mc-evolution/`

## Child Plans

| #   | Plan                              | File                                        | Status   | Validated |
| --- | --------------------------------- | ------------------------------------------- | -------- | --------- |
| 1   | Skill unification                 | `./2026_06_01-solo-mc-evolution-part-1.md`  | pending  | [ ]       |
| 2   | Vault convention                  | `./2026_06_01-solo-mc-evolution-part-2.md`  | blocked  | [ ]       |
| 3   | Agent refactor (oracle/narrateur) | `./2026_06_01-solo-mc-evolution-part-3.md`  | blocked  | [ ]       |
| 4   | Decisional grid                   | `./2026_06_01-solo-mc-evolution-part-4.md`  | blocked  | [ ]       |
| 5   | Companion substitution            | `./2026_06_01-solo-mc-evolution-part-5.md`  | blocked  | [ ]       |

## Validation Protocol

1. Complete Part 1, verify SKILL.md is self-contained and SKILL-remote.md is gone.
2. [ ] Checkpoint 1: user confirms Part 1.
3. Complete Part 2, verify vault-layout.md documents `campagnes/<campagne>/mj/`.
4. [ ] Checkpoint 2: user confirms Part 2.
5. Complete Part 3, verify agents are agnostic, templates exist.
6. [ ] Checkpoint 3: user confirms Part 3.
7. Complete Part 4, verify decisional grid rule is in SKILL.md and wired to scene/oracle actions.
8. [ ] Checkpoint 4: user confirms Part 4.
9. Complete Part 5, verify companion substitution logic is in SKILL.md and scene action.
10. [ ] Final: spot-check full SKILL.md coherence.

## User Journey

```mermaid
---
title: solo-mc Evolution — Full Flow
---
flowchart TD
  Player["Player input (RP/HRP)"]
  LogPrev["T10 — log previous exchange"]
  DecisionPoint{"Decision point?"}
  Canon{"In canon?"}
  ApplyRule["Apply rule from systeme/ + subsystems/"]
  Grid["Decisional grid"]
  Trivial["Trivial / no stakes — log only"]
  NewElement["New place/NPC — name + describe"]
  StakeDecision["Staked decision"]
  OracleAgent["oracle agent — invisible decision"]
  MusesOracles["muses-et-oracles (hasard)"]
  Parallaxe["parallaxe (decision)"]
  LinkRule["Tie to test / manoeuvre / rule"]
  NarrateurAgent["narrateur agent (templates)"]
  Cinerio["cinerio (description)"]
  ConversationCards["conversation-cards (dialogue)"]
  Response["Response + mechanical question if stakes"]
  CompanionMode{"Team separated?"}
  PlayCompanion["Play companion — substitution sheet"]
  FreezePC["PC frozen — timeline resyncs"]
  ReturnPC["End companion scene — return to PC"]
  PromoteMJ["Promote to mj/ (campagne or univers or solo.md)"]

  Player --> LogPrev
  LogPrev --> DecisionPoint
  DecisionPoint --> Canon
  Canon -- yes --> ApplyRule
  Canon -- no --> Grid
  Grid --> Trivial
  Grid --> NewElement
  Grid --> StakeDecision
  NewElement --> PromoteMJ
  StakeDecision --> OracleAgent
  OracleAgent --> MusesOracles
  OracleAgent --> Parallaxe
  OracleAgent --> LinkRule
  ApplyRule --> NarrateurAgent
  LinkRule --> NarrateurAgent
  Trivial --> NarrateurAgent
  PromoteMJ --> NarrateurAgent
  NarrateurAgent --> Cinerio
  NarrateurAgent --> ConversationCards
  NarrateurAgent --> Response
  Response --> CompanionMode
  CompanionMode -- yes --> PlayCompanion
  PlayCompanion --> FreezePC
  FreezePC --> ReturnPC
  CompanionMode -- no --> Player
  ReturnPC --> Player
```

## Estimations

- **Confidence**: 9/10
- **Duration**: 5 independent sessions, each ~30 min
