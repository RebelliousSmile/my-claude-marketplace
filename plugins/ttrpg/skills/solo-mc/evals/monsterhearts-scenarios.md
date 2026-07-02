# Solo-MC — Monsterhearts 2 (game-specific) behavioural test scenarios

Behavioural tests for the **Monsterhearts-2-specific** adjudication of the `solo-mc` play loop: when a beat triggers a MH move, does the loop read and apply the **MH canon content finely** — the move-specific branches (string/*ascendant* economy, tiers as written, Darkest Self / *mues*) — instead of treating MH as a generic 2d6 system?

> **Scope — narrow, on purpose.** This suite covers **only** behaviours that depend on reading the Monsterhearts canon (`R/_systeme/canon/rules.md` + `mues.md`). It is the game-specific companion to the system-agnostic suite, **not** a duplicate of it:
> - **Generic** fiction→rule bridge (uncertainty → rules, across system classes), **trigger-first discipline**, **MC-never-rolls**, **pure chance → oracle**, and the **no-move fallback** → `rules-triggering-scenarios.md` (Parts B/C). Those cases are *not* repeated here.
> - **This file** — only the MH2 branches that the generic suite explicitly defers as *"cas-bord système … propre au jeu"* (see `rules-triggering-scenarios.md` › run 2, residual gaps): Allumer's string economy, Allumer on a non-consenting target, Manipuler's *ascendant* precondition, the tier text as written, and Darkest Self.

Reference fixture: `monsterhearts` — `_systeme/canon/rules.md` (validated) holds the Core Loop (*fiction → déclencheur → 2d6 + caractéristique → palier → conséquences*) and the base moves **Allumer** (Sexy), **Rembarrer** (Glacial), **Garder son sang-froid** (Glacial), **Cogner** (Impulsif), **Fuir** (Impulsif), **Contempler l'Abysse** (Ténébreux), **Manipuler** (dépense d'*ascendant*) + `mues.md` (Darkest Self / *succomber*). Active campaign `les-fantomes-de-snake-high` (système = Monsterhearts 2). Domain `R` resolved locally via one of the markers `_campagnes/`, `_univers/` or `_pjs/`.

## Part A — Move-specific canon branches (read the move text, not just the dice)

| #   | Fiction beat (player input, RP) | Expected MH-specific handling | Pass criteria |
|-----|----------------------------------|-------------------------------|---------------|
| MH1 | « Je me rapproche, je joue de mon charme pour qu'il craque. » (target receptive) | Trigger → **Allumer** (Sexy), 2d6 + Sexy. Apply the move's **string economy as written**: a hit lets the PC **gain a string** on the target (and/or the target acts as asked / marks XP per the move's tier text). | The roll is **Allumer (Sexy)** and the **string outcome** of Allumer is applied from canon (string gained / offer made), not a generic "it works". FAIL if the seduction is narrated as a plain success with no string bookkeeping. |
| MH2 | « Je joue de mon charme sur le videur hostile qui veut me jeter dehors. » (target **not** receptive / actively against the PC) | Recognise the **consent/stance branch**: per MH canon, *turning someone on* against a hostile stance is the wrong move — adjudicate as **Rembarrer (with Sexy)** / the canon's stated handling, not a blind Allumer. | The narrateur reads the target's stance from the fiction and **routes to the canon-correct move** (not auto-Allumer). FAIL if Allumer is rolled blindly against a non-consenting target. |
| MH3 | « Je le manipule : je lui promets mon aide s'il me couvre. » | Trigger → **Manipuler**. Check the move's **precondition**: a concrete leverage / *ascendant* (string) or a believable offer must exist; on an NPC the move's tier governs whether they comply and what they ask in return. | The **ascendant/leverage precondition** is checked/applied per canon (string spent or offer made), not ignored. FAIL if manipulation just "works" with no leverage and no roll. |
| MH4 | « Je perds mon sang-froid et je lui mets un coup. » | Trigger → **Cogner** (Impulsif), 2d6 + Impulsif. Surface the move's **tier branches as written** (e.g. trade harm, hold steady). Note the MH link: losing control can push toward *succomber* — see MH5. | Move named; tier outcome taken from the **Cogner** text (not a generic hit/miss). FAIL if violence resolves by narration alone or with a non-MH outcome model. |
| MH5 | « Je contemple l'abysse pour arracher un secret au lieu. » | Trigger → **Contempler l'Abysse** (Ténébreux). Apply the move's **insight-with-a-cost** structure as written (the answer comes, the Dark side asks something back). | The Ténébreux move's canon outcome (knowledge **plus** its cost) is applied — **not** a free oracle yes/no and not a cost-free reveal. |

## Part B — String/ascendant economy & Darkest Self (the MH economy)

| #   | Situation | Expected MH-specific handling | Pass criteria |
|-----|-----------|-------------------------------|---------------|
| MH6 | The PC **holds a string** on an NPC and wants an edge in a roll/scene. | Per canon, a held string can be **spent** for its listed effects (e.g. +1, deal extra harm, force a choice). The spend is **bookkept** on the campaign state. | A string is **spent from the tracked count** for a canon-listed effect; the count is updated. FAIL if string effects are narrated without spending, or strings are never tracked. |
| MH7 | A move **hit** lets the PC take a string; a **miss** lets the MC/NPC take one. | The **gain side** of the economy fires symmetrically: hits grant strings to the PC per the move text; misses (6-) can hand a string to the MC alongside the MC reaction + 1 XP. | Strings are **gained and recorded** on the correct side per the move/tier; not silently dropped. (The generic 6- → MC reaction + XP rule is covered by `rules-triggering-scenarios.md` M7; here the check is the **string** ledger.) |
| MH8 | The PC's playbook **Darkest Self trigger** is met (e.g. a specific miss / fictional condition for *that* skin). | Read `mues.md` for the **PC's playbook**: enter the Darkest Self as written, apply its behaviour, and **name the explicit escape condition** that ends it. | Darkest Self is entered **per the playbook's `mues.md` text** (right skin, right trigger) and the **exit condition is named**. FAIL if a generic "you snap" is narrated with no playbook reference or no exit condition. |

## Part C — Data precondition & anti-invention guard (MH canon must be read, never fabricated)

| #   | Check | Expected | Pass criteria |
|-----|-------|----------|---------------|
| MH9 | Are the MH moves + tiers + *mues* **actually in `R/_systeme/canon/`**? | `rules.md` lists Allumer / Rembarrer / Garder son sang-froid / Cogner / Fuir / Contempler l'Abysse / Manipuler with paliers 10+/7-9/6- ; `mues.md` holds Darkest Self. | Present and readable. If absent → gate per T6/T7 (regenerate via `extract-pdf` + `rules-keeper`), **never** free-narrate or invent moves. |
| MH10 | A beat seems to call for a MH mechanic **not documented in this canon** (e.g. a "condition" track absent from the fixture's files). | Do **not** invent it. Apply the closest documented move, or fall back to an MC reaction (trigger-first), and flag any durable rule for `_systeme/mj/solo.md` (T13). | No fabricated MH mechanic; correct fallback; no silent rule invention. (Aligns with SKILL T6/T12.) |

## How to run

Load the **in-tree play-loop instructions** — `SKILL.md` + `actions/{01-play,02-scene,04-roll}.md` — against the populated `monsterhearts` domain (active campaign `les-fantomes-de-snake-high`, système = Monsterhearts 2). The **narrateur** and **oracle** roles (`SKILL.md` › T2) are exercised through these actions; this suite references **no `agents/…` path**, so it runs unchanged in a standalone/generated skill tree where the plugin-level `agents/` directory is absent (the move-triggering behaviour lives in `SKILL.md` T13 + `actions/02-scene.md` + `actions/04-roll.md`, all in-tree).

Feed each Part-A/B beat as a player RP message mid-session and capture the response. **Judge the response against the pass criteria**: was the *correct MH move* named from canon, was the *move text* (not just 2d6) applied, was the *string/ascendant ledger* updated, was *Darkest Self* entered per the playbook's `mues.md`? A scenario passes only when the **MH-specific canon branch** is read and applied; treating MH as a generic 2d6 system (right dice, wrong move text) is a FAIL.

> Generic routing, trigger-first discipline and MC-never-rolls are **out of scope** here — run `rules-triggering-scenarios.md` for those. Use a **populated** domain (real `pj/` sheet with caractéristiques and a string count) to exercise Part B concretely; absent that, Part B verdicts are spec-logic only (record the data limit honestly, do not simulate values).

## Results log

<!-- append run results here: date, scenario, observed handling (correct MH move? move text applied? strings tracked? Darkest Self per mues.md?), pass/fail, root-cause notes -->
