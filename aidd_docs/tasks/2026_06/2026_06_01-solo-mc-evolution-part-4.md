---
objective: "SKILL.md contains a decisional grid transversal rule (T13) that forces rule-grounded play at every decision point; actions scene and oracle wire it explicitly."
success_condition: "git grep -q 'T13' plugins/hermes/skills/solo-mc/SKILL.md"
iteration: 0
created_at: "2026-06-01T00:00:00Z"
---

# Part 4 — Decisional Grid (Anti-Linearity)

## Feature

- **Summary**: Add a transversal decisional grid (T13) to SKILL.md that fires at every decision point in play: check canon first, then apply jurisprudence logic (trivial→log only; new element→name+describe+promote; staked→must tie to test/manoeuvre/rule via oracle). Wire scene and oracle actions to enforce it.
- **Stack**: `Markdown`
- **Branch name**: `feat/solo-mc-evolution/part-4-decisional-grid`
- **Parent Plan**: `./2026_06_01-solo-mc-evolution-master.md`
- **Sequence**: `4 of 5`
- Confidence: 9/10
- Time to implement: ~25 min

## Architecture projection

### Files to modify

- `plugins/hermes/skills/solo-mc/SKILL.md` — add T13 (decisional grid); update Common Pitfalls with "no narrated outcome without test" entry
- `plugins/hermes/skills/solo-mc/actions/02-scene.md` — add explicit grid-check step before generating scene content
- `plugins/hermes/skills/solo-mc/actions/03-oracle.md` — add explicit grid-check step; clarify oracle = invisible decision tool not player-facing command

### Files to create

- none

### Files to delete

- none

## Applicable rules

| Tool | Name | Path | Why it applies |
| ---- | ---- | ---- | -------------- |
| none | —    | —    | inventory empty |

## User Journey

```mermaid
---
title: Part 4 — Decisional Grid
---
flowchart TD
  Beat["Play beat — LLM about to decide something"]
  CheckCanon{"Covered by canon?"}
  ApplyCanon["Apply rule — systeme/ + subsystems/"]
  Jurisprudence{"Stakes?"]
  Trivial["No stakes — decide silently, log only"]
  NewElement["New place or NPC — name + describe + promote to mj/"]
  Staked["Staked — MUST tie to test / manoeuvre / rule"]
  Oracle["Call oracle (invisible) — muses-et-oracles or parallaxe"]
  Narrateur["narrateur renders result"]

  Beat --> CheckCanon
  CheckCanon -- yes --> ApplyCanon
  CheckCanon -- no --> Jurisprudence
  ApplyCanon --> Narrateur
  Jurisprudence -- trivial --> Trivial
  Jurisprudence -- new element --> NewElement
  Jurisprudence -- staked --> Staked
  Trivial --> Narrateur
  NewElement --> Narrateur
  Staked --> Oracle
  Oracle --> Narrateur
```

## Risk register

| Risk | Impact | Mitigation |
| ---- | ------ | ---------- |
| "Trivial" threshold is subjective | LLM under- or over-fires oracle | Define concrete examples in T13: color of a stranger's shirt = trivial; whether a door is locked in a tense scene = staked |
| Grid adds friction to every beat | Play feels mechanical | Emphasize: trivial decisions are silent — the grid only shows when there is actual uncertainty or consequence |
| Subsystems absent — grid still fires | LLM has no tools to resolve | Graceful-degrade: use system-native dice + log `[HRP] subsystem not installed` (same as Part 3) |

## Implementation phases

### Phase 1: Write T13 in SKILL.md

> Single, concrete transversal rule applied at every decision point.

#### Tasks

1. After T12, add `T13 — Grille décisionnelle (anti-linéarité)`.
2. T13 content:
   - Step 1: Is this covered by the active system's canon (`systeme/` + `subsystems/`)? → apply it.
   - Step 2: Not in canon → the LLM decides. Jurisprudence: any declared fiction fact becomes binding.
   - Step 3: Routing by stakes:
     - **Trivial / no consequence** (hair color of a background NPC, time of day) → decide silently; stays in session log only; no promotion.
     - **New named place or NPC** → name it, write a one-line description, promote to `campagnes/<campagne>/mj/` (or `univers/<univers>/mj/` if world-level).
     - **Staked decision** (uncertain outcome, player consequence, narrative branch) → MUST be resolved via oracle (muses-et-oracles for chance; parallaxe for decision); result tied to a test, manoeuvre, or rule element; never narrate the outcome freely.
3. Add concrete heuristic: "If removing the die roll would make the outcome feel scripted, it is staked."

### Phase 2: Update Common Pitfalls

> Add the "no free narrated outcome" pitfall.

#### Tasks

1. Add pitfall: **Narrating a staked outcome without a test** — whenever the fiction has genuine uncertainty or consequence, the outcome must pass through the decisional grid (T13); never resolve it by narrating a result directly.

### Phase 3: Wire scene action (02-scene.md)

> Force the grid before generating scene content.

#### Tasks

1. In `02-scene.md` Process, add as Step 1 (before reading state files): "Apply T13 decisional grid to every element that will be introduced or resolved in this scene."
2. Add note: any new NPC or place introduced in the scene triggers the "new named element" branch of T13.

### Phase 4: Wire oracle action (03-oracle.md)

> Clarify oracle = the LLM's invisible tool, not a player command.

#### Tasks

1. In `03-oracle.md` Process, add Step 0: "Oracle is called by the LLM when T13 identifies a staked decision or chance element — it is not a player-facing command; the player may never see the oracle call itself, only its narrative consequence."
2. Clarify routing: hasard (dice, random concept) → muses-et-oracles subsystem; decision (what does the world choose?) → parallaxe subsystem.

## Acceptance criteria

- [ ] SKILL.md contains T13 with all three routing branches (trivial / new element / staked).
- [ ] T13 includes the "scripted feel" heuristic.
- [ ] Common Pitfalls contains the "no free narrated outcome" entry.
- [ ] `02-scene.md` Process Step 1 references T13.
- [ ] `03-oracle.md` Step 0 clarifies oracle as LLM-internal tool + subsystem routing.
- [ ] `(Select-String -Path 'plugins/hermes/skills/solo-mc/SKILL.md' -Pattern 'T13').Count -gt 0` returns True.
- [ ] Note confirmed: T13 is a transversal rule — `11-play-resume.md` does NOT need a separate grid-check step (it reads already-declared facts; jurisprudence applies automatically).

## Amendments

## Log

## Validation flow demonstration

1. Open SKILL.md — T13 section visible after T12.
2. Open `actions/02-scene.md` — Step 1 references T13.
3. Open `actions/03-oracle.md` — Step 0 present.
4. Run success_condition → returns ≥ 1.
