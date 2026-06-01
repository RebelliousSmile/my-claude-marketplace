# Functional Review for solo-mc Evolution

- **Plan**: `aidd_docs/tasks/2026_06/2026_06_01-solo-mc-evolution-master.md` (+ parts 1-5)
- **Diff scope**: `main...feat/solo-mc-evolution`
- **Date**: 2026-06-01

## Verdict

PASS — all 25 acceptance criteria across the 5 parts trace to the diff; gaps found are non-blocking and mostly external (vault content the user owns).

## Scoring Matrix

| Criterion | Files | Status | Severity | Notes |
| --------- | ----- | ------ | -------- | ----- |
| P1 — SKILL.md resolves `<vault>` via `~/.jdr.yaml` | SKILL.md:49 | Met | — | T0 has path + git remote |
| P1 — agnostic-game framing note | SKILL.md:11 | Met | — | intro note present |
| P1 — action table exactly 12 rows | SKILL.md:15-28 | Met | — | 01-play … 12-journal-pdf |
| P1 — SKILL-remote.md deleted | (absent) | Met | — | verified `! test -f` |
| P1 — no hard-coded abs path | SKILL.md | Met | — | only the documented default value remains |
| P2 — tree has campagnes/<campagne>/mj/ | vault-layout.md:77 | Met | — | |
| P2 — routing table (4 rows) | vault-layout.md:88-97 | Met | — | |
| P2 — interop references campaign mj/ | vault-layout.md:149 | Met | — | |
| P2 — versioning row | vault-layout.md | Met | — | |
| P3 — mj-solo.md absent | (absent) | Met | — | git mv to narrateur |
| P3 — narrateur.md exists, agnostic, references templates | narrateur.md:1-18 | Met | — | |
| P3 — oracle.md routing + no game tables + degrade | oracle.md:16-41 | Met | — | |
| P3 — response-templates.md (4 templates) | response-templates.md | Met | — | scene/HRP-RP/Q/dialogue |
| P3 — SKILL.md T2 references narrateur-agent | SKILL.md (T2) | Met | — | oracle desc updated too |
| P3 — agents read from `<vault>/subsystems/...` | oracle.md/narrateur.md | Met | — | realigned to `systeme/canon/` |
| P4 — T13 with 3 branches | SKILL.md:62-69 | Met | — | trivial/new/staked |
| P4 — T13 "scripted feel" heuristic | SKILL.md:69 | Met | — | |
| P4 — Common Pitfall "no free narrated outcome" | SKILL.md:86 | Met | — | |
| P4 — 02-scene Step 1 references T13 | 02-scene.md:24 | Met | — | |
| P4 — 03-oracle Step 0 (LLM-internal + routing) | 03-oracle.md | Met | — | |
| P4 — play-resume NOT given separate grid step | 11-play-resume.md | Met | — | correctly untouched |
| P5 — T14 (trigger…return…degrade) | SKILL.md:70-76 | Met | — | all sub-sections present |
| P5 — T14 references config compagnons + sheet path | SKILL.md:71 | Met | — | |
| P5 — 02-scene Step 1b companion-mode | 02-scene.md:25 | Met | — | |
| P5 — 01-play loads roster + seeds active_character | 01-play.md:20,26 | Met | — | |

## Missing Behaviors

- none

## Unplanned Behaviors

- [ ] Subsystem path level changed to `.../systeme/canon/` (not in the original plans, which said `subsystems/<nom>/canon/`). Traced to the user's mid-implementation vault revision + vault-layout.md update; recorded as a 🤖 amendment in part-3. Confirmed in scope.

## Flow / Edge-case Gaps

- [ ] **Subsystem house rules (`mj/`) not consulted** — agents read only `systeme/canon/` of each subsystem; T6 says effective rules include declared `mj/` overrides. Non-blocking until a subsystem ships house rules.
- [ ] **Cinério always degrades** — the narration subsystem does not exist in the vault yet (crowdfunding). Until it ships, every `description` route hits graceful-degrade. Expected; flagged so it is not mistaken for a bug.
- [ ] **session-state schema implicit** — `active_character` / `pc_frozen_at` (T14) are referenced but never formally defined; 01-play seeds `active_character`, which is sufficient for the happy path.

## Summary

- **Criteria covered**: 25/25
- **Blockers**: 0
- **Follow-up actions**: optionally add `systeme/mj/` to agent read paths; populate subsystem canon in the vault (user); document session-state schema.
- **Additional notes**: feature is functionally complete and internally consistent. Real-world activation depends on vault subsystem content (user's responsibility).
