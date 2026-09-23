---
name: debrief
description: Synthetic output template for the /debrief command — retrospective on how the sessions were conducted.
---
Fill every placeholder from evidenced digest data and the bounded contracts. Remove axis sections excluded
by `--focus`, remove this instruction, and leave no scaffold placeholder in the rendered report.

# Debrief — How We Worked
**Change this first:** <the single adjustment that would have saved the most time, as an action>
**Window:** <n> sessions · <yyyy-mm-dd> → <yyyy-mm-dd> · scope `<project|global>`
## Frictions
> What cost time. One row per cause, not per occurrence.
| Friction | Signal | Seen | Cost | Fix |
|----------|--------|------|------|-----|
| `<cause>` | <tool errors / interrupts / compactions / corrections> | <n> sessions | <what it visibly cost> | <concrete change> |
## Skill usage
| Skill | Invoked | Observation |
|-------|---------|-------------|
| `<plugin:skill>` | <n> | <fired at the right moment / abandoned right after / never fired> |
**Done by hand instead:** `<skill>` covers <what was done through Read/Edit/Bash in session `<id>` (<yyyy-mm-dd>)> — invoke it at <the moment it should have fired>.
**Never used in the window:** `<skill>`, `<skill>` — <one clause on whether that is expected>
## Skill quality
> Inspect at most three evidenced contracts. Editorial and functional changes are reserved for `my-marketplace` skills.
| Skill | Ownership | Evidence | Contract finding | Allowed action |
|-------|-----------|----------|------------------|----------------|
| `<plugin:skill>` | `my-marketplace` / `external` | `telemetry only` / `contract inspected` / `reproduced` | <routing, clarity, completeness, recovery, or output finding> | <source change / invocation change / local adapter / upstream candidate> |
## Prompt patterns
| Shape | Outcome | Rewrite |
|-------|---------|---------|
| <"terse prompt then correction" / "context-loaded prompt then clean run"> | <what followed> | <one concrete reformulation> |
## Plugin synergies
**Recurring chains:** `<skill A> → <skill B> → <skill C>` — <n> times, no alias covers it. Candidate: `<name>`.
**Competing skills:** `<A>` and `<B>` alternate on <the same job> — <which one to keep for it>.
**Untouched plugins:** `<plugin>` — <installed, never invoked in the window>
## Token use
**Measurement:** `exact via aidd-telemetry` / `partial via aidd-telemetry` / `contextual proxies only — <reason>`
**Telemetry period:** <yyyy-mm-dd → yyyy-mm-dd, or N/A> · <sessions and requests covered, or coverage limit>
| Signal | Measure | Evidence | Interpretation |
|--------|---------|----------|----------------|
| <total / cache share / step, prompt, agent, or model hotspot / contextual proxy> | <official figure, or observed count without a token estimate> | <CLI attribution or digest session/date> | <bounded reading from the token-optimization recipe> |
## Recommendations
1. **<action>** — <evidence: session `<id>` (<yyyy-mm-dd>), <signal>>. <Expected gain.>
2. **<action>** — <evidence>. <Expected gain.>
---
**Coverage:** <n> sessions read · <n> prompts · <n> skill invocations · <n> tool errors · <n> skill contracts inspected · token telemetry <exact / partial / N/A>. <Probes that returned N/A, population mismatch, ambiguous errors excluded from cost, and historical availability limits, if any.>
**One-liner:** <What the window says about the working method, in one sentence.>
