# Code Review for solo-mc Evolution

Static quality review of `git diff main...feat/solo-mc-evolution`. Scope: hermes skill/agents/templates + rpg-writer vault-layout. Markdown skill/agent definitions — no executable code, so security/perf/frontend sections are largely N/A.

- Statuts: APPROVED WITH MINOR FOLLOW-UPS (no blockers)
- Confidence: 8.5/10

---

## Main expected Changes

- [x] SKILL.md unified (vault resolution + agnostic framing), SKILL-remote.md deleted
- [x] vault-layout.md documents campagnes/<campagne>/mj/
- [x] oracle rewritten (invisible decision engine), mj-solo → narrateur (GM voice)
- [x] response-templates.md created
- [x] T13 decisional grid + T14 companion substitution wired into actions

## Scoring

- [🟡] **Markdown list integrity** `actions/02-scene.md:24-25` — ordered list runs `1.` → `1b.` → `2.`. `1b.` is not a valid ordered-list marker; it renders as literal text and breaks auto-numbering. Suggestion: demote to a sub-bullet under step 1, or renumber (1 = grid, 2 = companion-mode, 3+ = reads).
- [🟡] **Subsystem house rules not consulted** `agents/oracle.md:20-21`, `agents/narrateur.md:24-25` — both agents read only `subsystems/<nom>/systeme/canon/`. T6 doctrine (SKILL.md:55) states effective rules = canon + declared house rules (`mj/`). A subsystem's `systeme/mj/` is never read. Suggestion: add `systeme/mj/` to the read path or a one-line note "also consult `systeme/mj/` if present (declared overrides win)".
- [🟡] **Implicit session-state schema** `SKILL.md:72`, `actions/01-play.md:8` — T14 introduces `active_character` and `pc_frozen_at` in `.session-state.yaml`, but no file documents the session-state structure. 01-play seeds `active_character` (good); `pc_frozen_at` only appears on swap. Low risk; consider a one-line schema note.
- [🟢] **Game-agnostic purge** `agents/oracle.md`, `agents/narrateur.md` — confirmed no hard-coded universe tables (Demon Slayer / Vampire V5 / Roue du Temps) remain. Tone/style correctly deferred to `config.yaml` + `systeme/canon/`.
- [🟢] **Cross-platform portability** — all paths via `<vault>` (resolved in T0 from `~/.jdr.yaml`); no absolute path hard-coded except the documented default value. Plan success_conditions use `git grep` / POSIX `test` (portable Windows+Linux).
- [🟢] **Graceful degrade** `agents/oracle.md:30-41` — double fallback (subsystem absent → systeme/canon; systeme absent → generic 2d6) is robust and matches hypothesis A1.
- [🟡] **Legacy wall-clock phrasing** `agents/narrateur.md:70` — "Continue for more than 5 minutes without player interaction" is odd in an async chat context (carried from legacy mj-solo). Cosmetic; consider rephrasing to a turn/exchange count.
- [🟢] **Rename consistency** — `mj-solo-agent` → `narrateur-agent` propagated; `git grep mj-solo plugins/hermes/` returns nothing.

## Code Quality Checklist

### Potentially Unnecessary Elements
- [🟢] No dead content; legacy game tables removed.

### Standards Compliance
- [🟡] Naming conventions followed; one Markdown list-marker glitch (02-scene.md).
- [x] Coding rules: project rules inventory empty — none to violate.

### Architecture
- [🟡] Separation of concerns is strong (oracle = decision engine, narrateur = voice); the one gap is subsystem `mj/` not read.
- [x] Two-agent split is clean and disjoint.

### Code Health
- [x] File sizes reasonable; no magic numbers; degrade paths explicit.

### Security
- [🟢] No secrets in repo; `~/.jdr.yaml` (path + git remote) is local non-versioned config. No injection/XSS/auth surface (docs only).

### Error management
- [🟢] Graceful-degrade notes cover missing subsystems and missing systeme/canon; companion-sheet-absent message included (T14).

### Performance / Frontend / Backend
- [N/A] Documentation-only change.

## Final Review

- **Score**: 8.5/10
- **Feedback**: Clean, agnostic, portable. Two-agent architecture and templates are coherent and well-scoped. No blockers.
- **Follow-up Actions**: (1) fix 02-scene.md `1b.` list marker; (2) decide whether agents should also read `subsystems/<nom>/systeme/mj/` (T6 consistency); (3) optional: rephrase narrateur "5 minutes"; (4) optional: document session-state schema.
- **Additional Notes**: `cinerio` (narration subsystem) does not exist in the vault yet (tool in crowdfunding) — narrateur description routing currently always hits graceful-degrade. Expected and intended.
