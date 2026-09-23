# Stats

Read-only snapshot of a project's test situation in one screen: how many tests exist, of which kind, and **which test strategy is actually in force** - the project's own, or this skill's generic default.

Writes nothing, proposes nothing, deletes nothing. It is the **entry point** of the skill: the action a user runs before deciding whether they need `audit`, `strengthen`, `configure` or `align` (`SKILL.md`, *Action chaining*).

## Inputs

- `project_path` (required) - absolute path to the target project root
- `scope` (optional, default: whole project) - a subdirectory or glob to limit the counts. **`scope` designates one universe, here as everywhere in this skill: the source code and the tests that match it**, resolved **symmetrically** in either direction. No action has a universe of its own.
- `domain` (optional) - a functional domain, resolved to code by the terms the project supplies, by **its own name**, by the terms `@../references/domain-catalogue.md` lists for it, and by the pivot's *Domain resolution* field - all four as literal case-insensitive substrings, no regex and no synonym expansion (`SKILL.md` › *Transversal rules*). Confirmed in `<project_path>/aidd_docs/memory/testing-domains.md` (`06-align`'s output) or **residue**: a name that file does not carry - or a project having no such file - is resolved per `SKILL.md` › *Transversal rules* (the name stands as declared by the argument; its **level** is the catalogue's default taken without a question where the name matches an entry, an open question where it does not, never persisted here), never collapsed into out-of-domain. It **orders the reading; it never bounds the counts** - a snapshot whose figures silently excluded part of the project would be the one thing this action must never produce. Mutually exclusive with `scope` - given both, stop and ask which was meant (`SKILL.md`, *Parameters*). **One name, not a list** - given `domain=auth,payment`, stop and ask which was meant too: this action parses no multi-valued `domain`, and neither splitting it nor taking the first is a reading anyone asked for.
- `phase` (optional) - overrides the resolved project phase for this run only

## Outputs

```
PHASE
  value       : scaffolding | hardening | production | sustaining | default | undetermined
  provenance  : argument | declared <path> | answered <this run only> | unanswered
  question    : <the question put to the user, and the observations offered with it>
                (present whenever provenance is `answered` or `unanswered`; absent otherwise)
  divergence  : <argument vs declared, when both exist and differ> | none
  excluded    : <every file the phase set aside, each with the phase motive that
                 set it aside - the phase may narrow the universe, never in silence>
              | none - this phase narrows nothing
  axes        : expected <order for this phase> / observed <order measured>
              | none expected under `default` - neutrality was declared, so no order is
                predicted; the observed one is reported alone
              | none expected under `undetermined` - the phase is unknown, so nothing
                predicts an order; the observed one is reported alone
                (classification is approximate: tier + role of the source file exercised + churn)
  domains     : <domains in force, their level, their provenance, and for each:
                 resolved to <n> files | term matched nothing>
  dom. source : declared <path> | argument <not persisted - 06-align freezes it> | none
                (the domains' own provenance - keyed differently from `provenance` above,
                 which is the phase's, and named apart from it on purpose: two keys
                 spelled `provenance` in one block leave a reader unable to say which
                 axis a value belongs to)
                (keyed on what is **in force**, never on what is declared: a `domain`
                 argument puts a domain in force on a project that declared none, and
                 suppressing the block on the declaration alone would assert the
                 out-of-domain regime while `unmatched` is firing on that very term)
                (`none` - no domain in force at all - is the out-of-domain column of the
                 matrix, read like the other three, never a fallback carrying a
                 substitute inventory of its own. **Say it in words**: "no domain
                 established, out-of-domain regime applied" - an absence of requirement
                 rendered as an empty block reads as a requirement met. Carry the
                 `06-align` referral with that statement, and **drop the referral when
                 "no domain" is the project's own recorded answer** - referring the
                 project back to the action that just answered re-asks a settled question)
  unmatched   : <n> source files matched by no domain in force - still in the analysis,
                 ranked last <one line each: <path> - nearest term that failed to
                 recognise it> | none - every source file was matched
                (rendered in every run, including when no domain is in force at all: the
                 count is then the whole universe and the nearest-term column reads
                 `no domain in force - no term to fail`. Suppressing the block there would
                 make "nothing to report" and "nothing was measured" the same rendering)
                (past the point where the list stops fitting the one screen this action
                 promises: the count, a representative sample, and the statement that the
                 list was cut - never a path to a file, this action writes none (l. 5), and
                 never a silent truncation)
                (**where the exhaustive list does live is named, not left to be noticed**:
                 `06-align`'s own pass file, that action being the only one here that
                 writes. A run needing the full residue narrows `scope` until it fits, or
                 runs `06-align`. Cutting a list without saying where the whole one can be
                 had is how a bounded disclosure reads as the disclosure there is)

STRATEGY
  authority   : project doc <path> | generic default (references/decision-matrix.md)
  readability : actionable | empty-template | filled-but-undeciding | absent
                (the last three fall back to the default tier mapping - name which one,
                 they call for opposite corrections)
  tiers       : <tiers named by the authority in force, and the mapping applied if any>
  budget      : <explicit test-count limit from the project doc> | null (nothing declared - what refuses is the cell ceiling in DOMAINES below; the density is reported alongside, never in its place)
  density     : median <ratio> over <n> files carrying a matched case (<n> unmatched, excluded)
              | insufficient population (<n> files carry a test - no median is defensible)
              | not measurable - no coverage report, so no denominator (-> 03-configure)
              | not measurable - coverage tooling absent from this machine: <prerequisite>
                (the project is not at fault and 03-configure has nothing to wire -
                 install the prerequisite, then re-run)
              | not measurable - report present but in line mode, no branch data
                (-> 03-configure: one runner flag, not coverage from scratch)
  outliers    : <n> past 3x the median | none (measured, no outlier)
              | not measurable - no coverage report, so no denominator
              | not measurable - coverage tooling absent from this machine: <prerequisite>
              | not measurable - report present but in line mode, no branch data
              <one line each: <path> <ratio> - refactoring signal (top decile of branch points) | low-value tests (-> 02-audit)>
  matching    : <how test cases were mapped to source files> - <n> unmatched
  declared    : <any coverage percentage the doc states, verbatim - reported, never used as a target>
  mechanics   : <language plugin> testing pivot | none (stack-agnostic run)

DOMAINES exigé / trouvé
  <domain @ level> : exigé <required proof + ceiling, `phase x level` cell,
                            or "none required, no ceiling - empty cell">
                    | trouvé <n proofs of that form the suite already carries>
                (one line per domain in force at the resolved phase, **plus an
                 out-of-domain line whenever files actually sit in that column** - which is
                 the case when no domain is in force at all, and equally when the residue
                 below is non-empty. Keyed on what is in force, like `dom. source` above,
                 never on what is declared: a `domain` argument on a project that declared
                 none puts one domain in force, and the earlier defect this block was
                 corrected for twice was rendering an out-of-domain line beside it with an
                 **empty** residue - reporting a column no file was read in. A non-empty
                 residue is the opposite case: those files are read in the out-of-domain
                 column, so suppressing its line would leave part of the universe measured
                 against a cell the snapshot never shows)
                (two columns only - no third that subtracts them: a verdict like "this
                 domain is missing its proof" is the matrix's own application, decided
                 elsewhere, never deduced here. `stats` displays what is declared and what
                 is measured; it produces nothing deduced from the two.)
  ratio       : <n> test files for <n> source files
  counting    : <what the `ratio` line counted: cases (pivot test-count command) | files
                 only (no count command available)>, and <how the tests `trouvé` reads were
                 enumerated: pivot test file glob | project convention <pattern>, approximate>
                (`trouvé` itself is neither of those counts - it is a count of **proofs**,
                 read per decision-matrix.md › *Counting what is established*, or `unknown`)

TOOLING
  runner      : <command actually wired in the project>
  coverage    : gate configured and invoked in <CI/hook> | configured but never invoked | none
  e2e tool    : <established tool - never a replacement candidate>

FLAGS
  - <one line per divergence or gap, each naming the action that addresses it>
```

**On a project with more than one applicable language plugin, `ratio`, `counting` and the whole `TOOLING` block are rendered once per stack, each labelled with its stack** (`@../references/pivot-contract.md` › *The pivot follows the file*). One `ratio` over a Rust suite and a Vitest suite counts two populations by two conventions and reports a quantity nothing measured; one `runner` line for a repository wiring two runners is false whichever runner it names. `enumerated` likewise states the glob **of that stack**, not a union flattened into one pattern. The rest of the snapshot - phase, domains, the declared/measured pair - is project-level and stays single.

## Process

1. Resolve `project_path` and `scope`.
1-bis. **Phase provenance** - resolve the project phase per `@../references/phase-framework.md`, which **never deduces it**, and report the four possible provenances distinctly: **argument** (given explicitly for this run), **declared** (cite the document path), **answered** (the user was asked before anything was ranked, and answered - good for this run only, recorded nowhere), **unanswered** (the question was asked and left unanswered).

   **`value` and `provenance` are two different lines and never collapse into one.** The value says *which phase*, the provenance says *where that came from*, and only one pairing is forced: provenance `unanswered` always carries value `undetermined`, and vice versa. Every other combination is free - `default` can arrive by argument, by declaration or by an answer, exactly like `production`. The provenance axis is deliberately worded as the `answered` / `unanswered` pair, so that the axis names itself rather than borrowing the name of a phase value it happens to imply once.

   When an argument and a declaration both exist and differ, report the divergence - the argument wins for this run, the declaration stays in the file. An answer given in conversation is never written down by this action, and never reported as if the project had declared it: `06-align` is what turns it into a declaration.
1-ter. **Reading-axis order** - compare the expected ordering of the axes for the resolved phase (`foundations` and the domain-level of the project's declared domains, per `phase-framework.md`) against the observed one. A project declaring no domain reads the **out-of-domain** column - like the other three, never a fallback carrying a substitute inventory of its own. Report **orders, never shares**: no percentage is produced here, and the classification of an existing test onto an axis is an approximation, declared as such next to the comparison.

   **Under `default` and `undetermined` there is no expected order, and the line says so in words.** Neither phase predicts one - `default` because neutrality was chosen, `undetermined` because nothing is known - so the observed order is reported alone. An empty expected side of a comparison reads as a measurement that failed, which is the opposite of what is true here.

1-quater. **Domain resolution** - resolve every domain **in force** to code per `phase-framework.md` and report, per domain, how many files it matched. A domain is in force when the project declares it *or* when it arrives as the `domain` argument: **provenance changes what the run may write down, never how the term resolves.** An argument orders this run and is recorded nowhere - only `06-align` turns it into a declaration - but while it is in force it resolves, reports and leaves a residue exactly like a declared one. Suspending the resolution because the project never wrote the term down would make the argument silently inert, which is the one outcome a caller cannot detect. **Its level is resolved too, not only its files** - step 5 needs a level to read a cell at, and a residual domain whose level was never settled would be read in the out-of-domain column, which is a level nobody chose. Resolve it per `SKILL.md` › *Transversal rules*: the catalogue's default level taken without a question where the name matches an entry and cited as such, an open question where it matches nothing, either way good for this run only and the output pointing to `06-align`. **A term that matched nothing is reported as such**, never omitted: an unresolved domain and a domain with nothing to report look identical in a snapshot, and only one of the two is good news.

   And the symmetric half, which is the one that bites: **report the residue - every source file no domain *in force* matched.** *In force*, not *declared*, and the two are the same word this step opened with: a domain arriving as an argument resolves and leaves a residue exactly like a declared one, so keying the residue on declaration alone would empty it on precisely the runs where the argument is the only thing being tested. A domain prioritises, it never restricts, so that residue stays in the analysis and is only ranked last; it is never excluded, and never silently dropped. Name, for each, the nearest term that failed to recognise it. The reason is the failure mode of term matching: searching `Login` and `Register` finds `LoginForm.tsx` and misses `SessionController`, and the missed zone does not surface as excluded - it surfaces as a zone with no gap, which is the exact opposite of the truth. A phase excludes by rule and a rule can be re-read; a term match fails silently, so only the trace makes it visible. That trace has a second use: it feeds `06-align`'s drift detection, where a domain vocabulary that stopped matching the code is what drift looks like.
2. **Strategy provenance** - the point of this action. Look for the project's documented strategy at the exact-case path `<project_path>/aidd_docs/memory/testing.md` (AIDD memory convention, generated by `aidd-context`'s project-memory skill - refer to the document, not to a pinned action name, since those change across `aidd-context` majors) using `SKILL.md` › *The conventional strategy path is exact-case*, or an explicitly named equivalent project-level document defining its own tiers. Report which one is in force, by path, and never merge the two silently. A differently-cased sibling such as `TESTING.md` is reported as a non-canonical candidate but yields the same `absent` conventional-document result on every OS. If the project has no authoritative document, say the generic default is in force, and say so as a finding, not as a neutral state - it means `budget` is structurally `null` and no tier vocabulary is owned by the project.
3. **Strategy readability** - a `testing.md` existing is not the same as a `testing.md` this skill can act on. The canonical AIDD template does not speak this skill's tier vocabulary, and its shape varies by `aidd-context` major (older ones list test types and a "desired coverage percentage"; newer ones use Strategy / Tools / Conventions / Run with unfilled placeholders). Classify the document as:
   - **actionable** - it names tiers, or states what must be tested versus not, in terms this skill can map to `contract` / `e2e` / `skip`;
   - **empty-template** - untouched placeholders, the generic template as `aidd-context` generated it. Nothing was filled;
   - **filled-but-undeciding** - **something was authored in place of the generated placeholders** - none is left standing - and it settles no tier all the same: it lists test *types*, tools and conventions without ever saying what deserves a test. **The load-bearing attribute is the absence of placeholders, not the volume**: a fourteen-line file somebody wrote is this shape, and reading it as `empty-template` because it is short inverts the diagnosis. Richly written is an illustration of the shape, never its test. This is the one that misleads, because it reads as a strategy in force and governs nothing;

   The last two both fall back to the same mapping - unit and integration -> `contract`, end-to-end -> `e2e` - and the tier decision is flagged as still generic in both. **Report which of the three shapes was met, never the fallback alone** (`SKILL.md`, *Transversal rules*): the correction differs, and reporting the third as "template-shaped" sends the project to fill placeholders it already filled. This classification is what `06-align` consumes at its step 2 rather than recomputing, so a shape collapsed here is a shape that action can never recover.
   - **budget** - populate it only from an explicit test-count limit. A coverage percentage is **not** a budget and never becomes one - report it verbatim as declared, outside the `budget` line.

3-bis. **The universe comes from the source glob, never from the coverage report.** Establish the set of files this snapshot reasons over from the pivot's **Source glob & exclusions** (`@../references/pivot-contract.md`), or from the project's own directory convention when no pivot is available - the same universe `04-strengthen` ranks. The coverage report then **adds detail to that universe; it never defines it.** Reports routinely omit files no test ever imports, so a universe read off the report is a universe with its own gaps already deleted from it - and a snapshot whose figures silently excluded the untested part of the project is the one thing this action must never produce. Report the two counts side by side whenever they differ: files in the universe, and files the report knows about.

   **A project's own coverage exclusions are not exclusions of the universe.** A coverage tool's `omit` / `exclude` list states what the project chose not to **measure**; what is classifiable production code is the source glob's business and nothing else. So a file the project omits stays in the universe and is reported as carrying no figure, **with the omission named as the reason** - never rendered as a file no test ever imported. Say which of the two it is: an entry point, a settings module or a task-queue bootstrap the project excluded on purpose is a different fact from an untested module nobody noticed, and merging them yields noise on one side or a hidden gap on the other. This action reconciles the two lists and reports the difference; it never adopts the `omit` list as an exclusion of its own.

   **`excluded` is populated here, and it is populated to `none` unless a phase actually set a file aside.** No phase in `phase-framework.md` narrows the universe - a phase re-weights an order and resolves a cell, and the source glob alone decides what is classifiable - so the line reads `none - this phase narrows nothing` on every run the model currently produces. It exists so that the day a phase does narrow, it cannot narrow in silence: an exclusion the snapshot never printed is an exclusion the user cannot contest. **Exclusions coming from the source glob are not this line's subject and are never moved into it** - they are a property of the universe and are reported as one; folding them here would attribute to the phase a narrowing the glob performed.

3-ter. **Density** per `@../references/test-density.md`. A `null` budget is not an absence of constraint, and this is the line that makes that true: compute the project's own distribution from its coverage report, report the median, and list every file past **3× that median** with **which of the two readings applies** - top decile of branch points means the code branches too much (a refactoring signal, and this skill proposes no refactoring), otherwise it means tests with no detection power (which is `02-audit`'s subject, named as such and judged no further here).

   Two things are reported and not glossed over. **The matching rule**, with how many test files it failed to map to a source - a ratio built on a naming convention carries that convention's error rate, and an undeclared approximation is how a number acquires authority it did not earn. And **`insufficient population`** when too few files carry a matched case: emit no median and no outlier rather than a median over three points. That is the ordinary state of a small or young project and is reported as a fact about the measurement, never as a finding about the suite.

   **`outliers` inherits the measurement state from `density`.** No report, a missing local prerequisite, or a line-mode report means `outliers: not measurable - <same cause>`; it never means `none`. `none` is reserved for a completed distribution with no file past the threshold. Rendering both as `none` turns an absent measurement into a measured negative result.

3-quater. **Coverage is read as `covered`/`total`, never as a percentage alone.** Whenever a figure comes out of the coverage report - to feed the density denominator, or to be reported at all - carry both terms. A percentage alone loses the population it was computed over, and that loss is not cosmetic: **a file with no branch point reports 100 % branch coverage while being entirely untested**, because the ratio is `0/0` rounded up by the tool. Read that way, the most dangerous file in the snapshot reads as the safest. Report `covered`/`total` per file whenever a per-file figure is emitted, and flag any `0/0` explicitly as *no branch to cover - says nothing about whether the file is tested*. This bound holds regardless of the resolved phase.
4. **Mechanics provenance** - detect the applicable language plugins and which of them ship a `testing` pivot (`@../references/pivot-contract.md`). Report found/absent **per plugin**; absent is not an error, it only means the counts and tooling lines are stack-agnostic **for that stack**. On a project with more than one applicable plugin, provenance reported as a single value is wrong whichever value it takes.
5. **Domaines exigé/trouvé** - for each domain in force, **plus the out-of-domain column whenever any file was read in it** - when none is in force at all, and equally when the residue of step 1-quater is non-empty, never merely because none is *declared*; one line per column actually read, and an argued domain is a column - read the resolved `phase x domain-level` cell's required proof and ceiling (`@../references/decision-matrix.md`, or the project's own override) as `exigé`, and count the proofs the suite already carries in that required form as `trouvé`. **Two columns, never a third that subtracts them**: a verdict such as "this domain is missing its proof" is the matrix's own application - the phase's arbitration - and rendering it here would create a second place where that arbitration happens. This action **displays what is declared and what is measured; it produces nothing deduced from the two.**

   **`trouvé` is a count of proofs, and a count of files or cases is not one.** Obtain it per `@../references/decision-matrix.md` › *Counting what is established* - it is the same number as `01-write`'s `cell.established` and `04-strengthen`'s `established`, so a snapshot producing a different one has a defect. Enumerate the tests to read with the pivot's **Test file glob**; absent a pivot, with the project's own observed convention, named in the output and stated as approximate - **never a pattern shaped by one stack**, which would enumerate nothing on the others and render an empty `trouvé` indistinguishable from a suite carrying no proof.

   **Where the proofs cannot be read, `trouvé` is `unknown`.** The pivot's test-count command gives test **cases** and a bare enumeration gives **files**; both are cheap and neither is a proof count, so substituting one and labelling it *file-level* still puts a number in the column the matrix reads. Report the file and case counts on the `ratio` and `counting` lines where they belong, and leave `trouvé` at `unknown` with the reason - `05-stats` compares nothing, but the figure it displays is the one `01-write` refuses on. Add the source-file ratio using the pivot's source glob when it provides one. No line here compares proof forms against each other - that comparison has no referent without the matrix, and the matrix is what supplies `exigé`/`trouvé` instead.

   **The absence of a pivot is not, by itself, a reason the proofs cannot be read.** The condition on `unknown` is that the *reading* failed - no enumeration resolved, the files are unavailable - never that the enumeration was unassisted. A stack the marketplace ships no `testing` pivot for enumerates on the project's own observed convention, declared approximate, and produces a real `trouvé`. Reading `unknown` off the missing pivot alone would put every un-pivoted stack permanently outside the one measurement the matrix turns on, and would do it on a run where nothing was actually attempted.
6. **Tooling** - report the runner command actually wired in the project (not the one the docs claim), whether a coverage gate exists **and is invoked** by something that runs, and the established E2E tool. Never evaluate the E2E tool choice.
7. **Flags** - one line per divergence found, each naming the action that handles it. Report only what the snapshot itself proves:
   - no documented strategy -> the generic default is in force, and no **cap** is declared; what still refuses is the `phase x domain-level` cell's ceiling, and the density is reported alongside it (see `write`);
   - density outliers reported -> name the action each one routes to, and route nothing here: refactoring signals are stated and left with the user, low-value readings go to `02-audit`;
   - `testing.md` present but settling no tier -> it exists without governing anything; the fix is to fill it in the project's own terms, through whichever `aidd-context` project-memory action owns that document in the installed version - this skill never writes it. **Name the shape** (`empty-template` or `filled-but-undeciding`): the first needs the placeholders filled, the second needs a decision the document never took, and offering the first to a project that already wrote three pages reads as a run that did not open the file;
   - documented strategy naming a tool the project does not actually have installed, or vice versa -> stale document, the gap between the document and reality being what `06-align` audits -> `06-align`;

     **Independent flags accumulate.** If one document both settles no tier and disagrees with installed tooling, emit both lines and both destinations: the project-memory owner for the missing strategic decision, and `06-align` for measured drift. Neither has precedence and naming only one loses a distinct correction.
   - coverage gate declared but invoked by nothing -> `03-configure`;
   - source-to-test ratio with large untested areas -> `04-strengthen`;
   - observed axis order matching an earlier phase's expected order better than the resolved phase's -> **centre of gravity left on the previous phase**: the suite still protects what the product used to be. Deduced from comparing orders, never from a stored history - `control` keeps no state between runs. Not raisable under `default` or `undetermined`, which predict no order to compare against;
   - a domain **in force** resolving to no file -> either the domain is named differently in the code than in the document, or it does not exist yet. *In force*, not *declared* - the same word step 1-quater resolves on: a `domain` argument that matches nothing is the case a caller is most likely testing, and keying the flag to the declaration would silence it on exactly that run. Report the term and both readings; decide neither -> `06-align`;
   - a coverage or test threshold the document **declares** diverging from the one the project actually **enforces** -> stale document, the same species of drift as a tool named but not installed, and it routes the same way -> `06-align`. Read both terms and report them side by side (`declared <n> / enforced <n>, at <path>`), naming where each was read: a document promising 80 % against a gate wired at 50 % governs nothing, and a snapshot printing only one of the two figures reads as a project meeting its own bar. Decide neither number - which one is wrong is the project's call;
   - source files matched by no domain in force -> the vocabulary no longer covers the code. Report the residue with the term that failed on each; the same trace is what `06-align` reads as drift. Not a finding about the suite, and never an exclusion -> `06-align`. **The first condition is that a vocabulary exists to have drifted: with no domain in force at all, there is no drift reading and no referral on this flag.** The residue is then the whole universe by construction - every source file, matched by nothing because nothing was in force - and calling that a vocabulary that stopped matching the code would flag a project for the state of never having declared a domain. That state is the flag below's subject, and it carries its own conditional referral; raising both would send the user to `06-align` twice for one fact. Report the residue as `<n>/<n>` and route nowhere. **Beyond that, raised as drift only when two further terms hold at once, one relative and one absolute** (`docs/control.md` › *L'idempotence par jugement matérialisé*). The residue is rendered as `<residue>/<source files>`, two terms, never a rate - the same reading rule as everywhere else in this skill. Against that ratio, the drift *reading* needs the residue to exceed **one file in four** *and* to exceed **two files** outright; failing either, the residue is reported as a count and routed nowhere. Neither number is invented here: the page fixes them by counter-example, *un résidu de deux fichiers sur huit n'est pas une dérive* - two files, exactly one in four, and not a drift - which is what rules out each term taken alone. A small project would otherwise be told its vocabulary has drifted the day it gains its second unmatched file. **The residue itself is always reported; what the two terms gate is the drift *reading* and its referral**, never the measurement;
   - no domain in force at all -> state the out-of-domain regime in words, and carry the `06-align` referral **unless "no domain" is the project's own recorded answer**, in which case the statement stands alone. A referral back to the action that produced the answer re-asks a settled question. This is the one flag whose referral is conditional, and the condition is the record, not the emptiness;
   - a per-file coverage figure of `0/0` reported as 100 % -> a file with no branch point, which the tool scores as fully covered while nothing exercises it. Report both terms and say so -> `04-strengthen`;
   - provenance `unanswered` (so value `undetermined`), or **any** value whose provenance is `answered` -> the project's document does not say what phase it is in, and every run will keep asking until it does -> `06-align`. **What silences this flag is the provenance, not the value.** A `default` whose provenance is `declared` raises nothing - the question has been settled, and re-routing it would ask the project to decide what it has already decided. A `default` whose provenance is `answered` raises the flag exactly like any other answered value: it was said out loud and written nowhere, so the next run will ask again. Reading this flag off the value alone is the mistake the two-axis split exists to prevent.
8. Print the snapshot. Stop. Suggesting an action is allowed; running one is not - the user chooses.

## Constraints

- No number in this snapshot is a target. Coverage and counts are reported as **situation**, never as a goal to move; proposing to raise a figure is the job of `04-strengthen`, and only on risk grounds.
- Never infer a strategy the project has not written down. An undocumented project is reported as undocumented, not as "implicitly following the default well".

## Test

**Referred by file, never by row number.** A row list goes stale on the next renumbering of a suite, and a stale list is worse than none - it points a reader at a scenario that now tests something else. Each suite below declares the actions it targets in its own opening paragraph; that declaration is the authority for this list, and it is the thing to re-read when a suite is added or re-scoped.

Covered by `../evals/measurement-scenarios.md`, `../evals/matrix-scenarios.md`, `../evals/domains-scenarios.md`, `../evals/phase-scenarios.md`, `../evals/authority-scenarios.md` and `../evals/chaining-scenarios.md`.

`measurement-scenarios.md` owns the snapshot's numbers and the no-percentage rule; `matrix-scenarios.md` owns the rendering of the cell's requirement and ceiling; `domains-scenarios.md` owns what appears under which domain; `phase-scenarios.md` owns the phase question and its provenance; `authority-scenarios.md` owns the read-only bound; `chaining-scenarios.md` owns the graph position.

Run: `overcode:behave 02-run <suite> <fixture>`.
