# Overview Completeness Checklist

Exit criteria for the `forge` skill. Propose the transition to `toc generate-toc` only when:
- All **Required** elements for the project type are present in the overview, AND
- The last 2–3 iterations produced only minor adjustments (no structural changes).

---

## Required elements — all types

- [ ] **Pitch** — core concept in 2–3 sentences: what it is, what makes it unique
- [ ] **Structure** — beginning / middle / end (or act breakdown, session count, chapter rough count)
- [ ] **Protagonists** — named with explicit motivations
- [ ] **Antagonists / Obstacles** — named or described with credible reasons
- [ ] **Stakes** — what the protagonists stand to lose or gain
- [ ] **Tone and atmosphere** — genre register, mood, emotional target

---

## Additional elements by `document.type`

### `scenario` (RPG scenario)

- [ ] **Player role** — what PCs do, their entry point, their agency
- [ ] **Decision points** — at least 2 moments where player choices matter
- [ ] **Freedom of action** — railroaded vs. sandbox balance stated explicitly
- [ ] **GM hooks** — at least one per major NPC or faction

### `novel` (narrative fiction)

- [ ] **Point of view** — POV character(s) and narrative distance
- [ ] **Emotional arcs** — how protagonists change from start to end
- [ ] **Denouement** — resolution direction (even if vague)
- [ ] **Key scenes sketched** — at least 3 milestone moments identified

### `roleplaying` (RPG supplement: playbooks, callings, rules)

- [ ] **Callings / Playbooks targeted** — named, with central mechanic per calling
- [ ] **Applicable rules** — which system moves, stats, or economies are involved
- [ ] **GM advice angle** — what guidance this document aims to provide
- [ ] **Play examples** — at least one concrete in-play situation described

### `guide` (reference, tutorial, or essay)

- [ ] **Sections planned** — list of main sections with one-line purpose each
- [ ] **Target audience** — who reads this, what they know, what they need
- [ ] **Reading structure** — reference (non-linear) vs. tutorial (linear) vs. essay
- [ ] **Index planned** — yes / no

---

## Recommended elements (all types)

- [ ] Themes explored (beyond plot)
- [ ] Character arcs sketched (secondary characters)
- [ ] Turning points / reversals identified
- [ ] Contradictions with universe docs resolved

---

## How to apply

During step 6 of `brainstorm`, scan the current `overview.md` against this checklist for the active `document.type`. Report:

```
Completeness check (type: <type>):
  [✓] Pitch
  [✓] Structure
  [✗] Player role — not yet defined
  [✗] Decision points — not yet defined
  ...
  
Still missing: 2 required elements. Continue iterating.
```

When all required items are checked and the last 2–3 rounds were adjustments only:

```
Overview complete. All required elements for <type> are present.
Suggested next step: toc generate-toc <project_path>
```
