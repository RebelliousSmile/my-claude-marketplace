# 06 - Align

Audit the gap between what a project's test strategy document *says* and what the project *does*, then propose the document's update in two strictly separated blocks: the facts this skill measured, and the strategy the project has to decide.

Mirror image of `05-stats` in direction rather than in kind: `stats` reads the situation and stops, `align` gives its findings somewhere to go. It is the only action of this skill that writes into the target project's own documentation, and it does so under the narrowest terms in the skill - see the transversal rule in `SKILL.md`.

## Inputs

- `project_path` (required) - absolute path to the target project root
- `scope` (optional, default: whole project) - a subdirectory or glob to limit the measurements
- `phase` (optional) - overrides the resolved project phase for this run only

## Outputs

```
PHASE
  <as produced by 05-stats: value, provenance, question, divergence>

GAP AUDIT
  | nature | subject | document says | reality |
  |--------|---------|---------------|---------|
  | missing fact  | e2e runner        | -                       | Playwright, wired in package.json |
  | stale fact    | coverage gate     | "80% global planned"    | thresholds at 47/45/33/45, enforced in CI |
  | missing decision | tier vocabulary | -                     | no line decides what deserves a test |

MEASURED FACTS          (authority: control - proposed as written)
  <the block, in full, exactly as it would be inserted>

PROPOSED STRATEGY       (authority: the project - proposed, never applied by default)
  <the block, in full, exactly as it would be inserted>

PHASE SWITCH            (only when the resolved phase differs from the declared one)
  from -> to  : <declared phase> -> <resolved phase>
  outgoing    : <n> tests, by motive: inherited heuristics <n>, phase-obsolete <n>
  incoming    : <n> gaps the entering phase raises, each routed through 01-write
  net balance : <±n> on a suite of <total> - <the displacement, in one sentence>

REMOVAL BATCH           (only when outgoing > 0 - one consent, or refusal en bloc)
  selection criterion : <one sentence - what every member of this set has in common>
  by rejection motive : <count per motive>
  sample              : <a representative handful, shown on screen>
  exhaustive list     : <path to the file, written before the question is put>
  excluded            : external boundaries <n>, held by consequence <n>, sole net <n>

WRITE PATH
  route       : aidd-context project-memory skill | direct write (fallback)
  consequence : <what this route does, and what it does not do>
```

Nothing is written as part of producing this output.

## Process

1. Resolve `project_path` and `scope`. Resolve the project **phase** per `@../references/phase-framework.md` - by renvoi, not by re-deriving it.

2. **Run the gap audit on `05-stats`'s production, never on a recomputation.** `05-stats` already establishes the authority in force, the document's readability, the tooling actually wired, the volume by tier and the observed order of the three buckets. This action consumes those results; it redefines none of them. Two sources of truth for the same measurement will diverge, and the one that diverges silently is the one nobody runs.

3. Classify every gap into exactly one of three natures. The distinction is what keeps the two blocks apart later, because the first two are facts and the third is not:
   - **Missing fact** - true of the project, absent from the document (an E2E tool in use and never named, an external boundary nobody wrote down).
   - **Stale fact** - stated in the document, no longer true of the project (a runner that was replaced, a threshold that moved, a plan that was carried out or abandoned).
   - **Missing decision** - no line of the document settles something this skill is nonetheless forced to settle at every run: the phase, the tier vocabulary, what the project deliberately refuses to test, a cap on the number of tests. This is not a defect in the document; it is the question the document has not been asked yet.

4. **Document absent.** When no `testing.md` (or project-level equivalent) exists, produce the audit anyway - everything is a missing fact - then offer, as an explicit choice, to create the document or to abstain. **Never create it by default.** A project that has never written a test strategy may have decided exactly that, and a file appearing unrequested in `aidd_docs/memory/` is a decision taken on the project's behalf. When the user abstains, the audit stands as the output and the run ends there.

5. **Build the `MEASURED FACTS` block.** It carries only what this skill is itself the source of:
   - the test runner actually wired, and the established E2E tool;
   - whether a coverage gate is configured **and invoked**, or configured and inert;
   - volume by tier, and the observed order of the three buckets, with the approximation declared as `05-stats` declares it;
   - the **inventory of external boundaries** - third-party integrations found in the manifest and in the source, and for each one whether any test references it or not.

   That inventory is the most perishable fact in the block, and it is what makes a second run of this action worthwhile on a project whose own code has not moved: a third-party SDK major can shift, or an integration can be added by a dependency bump alone, and no internal signal fires. Nothing enters this block that the skill cannot measure - a fact it merely believes is a strategy in disguise.

6. **Build the `PROPOSED STRATEGY` block.** It carries what the project has to decide and the skill only drafts: the declared phase, the tier vocabulary, what the project refuses to test, an explicit cap on the number of tests. It is proposed as **complete prose, in the document's own language**, so the user validates a text rather than an intention - and it is validated **line by line**. Nothing here is applied by default, and a block the user leaves unanswered counts as refused.

7. **Approve each block independently.** Refusing the strategy does not withdraw the facts; refusing the facts does not withdraw the strategy. An all-or-nothing gate would make the action unusable in the exact case it exists for - a project that accepts being described and is not ready to commit to a doctrine.

8. **Write path.** When `aidd-context`'s project-memory skill is installed, **delegate to it**: it owns `memory/`, it carries its own approval gate, and it does one thing a direct write does not - it resynchronises the AI-context files that embed the project memory. In the version installed at the time of writing (`1.0.1`) that skill is `aidd-context:05-learn`, chaining `01-scope` (analyse, categorise, **user approval**) → `02-write` (create or update the `memory/` files) → `03-sync` (refresh the AI-context block). Resolve it by that role, never by that number - the naming has changed across `aidd-context` majors, and a pinned action is how this action silently stops delegating. Enter through its scoping step so its own gate applies, and make sure its sync step runs. **A silent sync is not a successful sync.** That step legitimately has nothing to do when the AI-context files already list the document, and it then exits with no output at all - indistinguishable from a failure that swallowed its own error. So do not take a clean exit as proof: open the AI-context file and check the memory block actually names the document. Report which of the two it was - resynchronised, or already up to date. When it is absent, fall back to a **direct write**. Either way, **announce the route taken in the output, and say what the route does not do**: a fallback that silently skips resynchronisation leaves the AI-context files stating the old strategy, which is worse than not writing at all.

9. **Fidelity rule - the delegate is not a scribe.** The project-memory skill analyses, categorises and reformulates what it retains before writing; nothing in its contract promises it inscribes a supplied text **verbatim**. The "validated line by line" guarantee would therefore break in silence. So: hand the approved text over as **literal content to be inscribed verbatim**, not as material to analyse; then **re-read the written file** and compare it, line for line, to the approved text. Any divergence - a reformulation, a section moved, a line absorbed into another - is **reported to the user, and never corrected on the spot**. It is another plugin's document; silently rewriting it would recreate the very problem delegation avoids.

10. **Phase switch - detect it, never assume it.** A switch exists when the resolved phase **differs from the one declared in the document**, or when the user explicitly overrides it. Comparison, not supposition: a project whose document declares nothing is not switching, it is declaring for the first time, and that is step 6's business.

    When there is one, report the movement **as one thing**, because a suite's centre of gravity moving is a single event and not two unrelated lists.

    - **Outgoing** rests on **two distinct motives**, and needs both. The heuristics of `02-audit` alone would produce an empty batch by construction: a model-shape test written in `scaffolding` is not a duplicate, not trivial, not a getter, and no existing heuristic would ever qualify it.
      - *Inherited motive* - `02-audit`'s value heuristics (duplicate, trivial, getter/setter), simply moved up the ranking by the entering phase. Taken as they are, redefined nowhere.
      - *Motive proper to the switch - **phase-obsolete***: a test whose **only** justification is a criterion the outgoing phase raised and the entering phase lowers. It qualifies only when **no other criterion holds it**: not consequence (money, authorisation, persistence, deletion), not a dependency on an external contract, not being the sole net on its subject. A test held by any one of those three stays, whatever the switch. This is the single removal motive this action adds, and those three exclusions are its bounds. The phase still decides nothing about **tier**: it qualifies a removal, never a classification.
    - **Incoming** is obtained by re-running `04-strengthen`'s ranking with the new phase in force - never by reimplementing it here. Each confirmed gap goes back through `01-write`, **one at a time**, with the number constraint re-evaluated between each, exactly as `04-strengthen` already routes them.
    - **Net balance** is a **finding, never a target.** No phase requires a negative balance - `sustaining` expects one, it does not demand it. A suite that comes out of a switch larger is not a failure.
    - **`sustaining` carries the exception to its own negative balance:** external boundaries are excluded from every removal batch and remain the one legitimate motive for addition. It is the phase where nothing internal moves any more while external contracts keep moving; stripping their only net at that exact moment would be the worst possible timing.

11. **The removal batch - consent bears on a rule, not on a scroll.** At the scale where a batch earns its keep, several hundred lines are no more readable than a counter. So a batch is composed of four things, all four required:
    - its **selection criterion**, spelled out in one sentence - what every member of the set has in common;
    - the **count per rejection motive**;
    - a **representative sample**, shown on screen;
    - the path to a file holding the **exhaustive list**, written **before** the question is put and offered for reading explicitly.

    **Refusal is en bloc, unconditional, and triggers no fallback** - in particular no per-item confirmation, which would walk around the refusal one test at a time.

    Excluded from any batch, whatever the switch: tests covering an external boundary, tests some consequence criterion holds by other means, tests that are the sole net on their subject, and every test **neither of the two motives qualifies**. Belonging to the bucket the phase lowers is not, by itself, a reason to delete anything. When nothing qualifies, say so - an empty batch is a legitimate result and is reported as one, never dressed up as a hollow one.

12. **Never overwrite in silence.** Adding is the default behaviour. An existing section is replaced only after its difference has been shown and that specific replacement explicitly validated - a hand-written paragraph is the most valuable content in the file, precisely because no tool produced it.

13. Report the result: what was written, by which route, what was removed or left in place, and what remains open.

## Constraints

- A document not yet aligned keeps being classified *template-shaped* by `05-stats`. That is not a detection failure - it is the state this action exists to change, and it must stay visible until it does.
- **Outside a phase switch, this action proposes no test, ranks no gap and deletes nothing.** When a plain alignment reveals the suite itself needs work, name `02-audit` or `04-strengthen` and stop. A switch is the one occasion where it does more than describe - and even then it originates nothing: the outgoing motives come from `02-audit`, the incoming ranking from `04-strengthen`, and every addition goes back through `01-write`. It reports the movement; it does not invent either of its halves.
- The phase is written into the document as a **declaration by the project**, in the strategy block - never as a fact in the measured block. This skill never deduces it and therefore never has one of its own to write: what reaches the file is the user's answer, presented back for validation as the decision it is. A phase written down as a measured fact would be read by every later run as authority, and nobody would ever be asked again.
- This is the action that ends the questioning. A phase resolved by asking is worth one run; once it is declared in the document, every action reads it from there. When the user declines to declare it, say plainly that the question will be put again at the next run - that is the cost of not writing it down, and it is theirs to accept.

## Test

Run against a real project that already has a `testing.md`. Verify the gap audit distinguishes the three natures, that refusing the strategy block still lets the facts be written, that the route taken is announced, and that the text in the file matches the text approved on screen - or that the divergence was reported. Run it a second time with the project unchanged and verify no fact-level gap remains. Run it a third time against a project with no document at all, refuse the creation, and verify no file appears.

**Never** a fixture document - a real project's real `testing.md` is the test.
