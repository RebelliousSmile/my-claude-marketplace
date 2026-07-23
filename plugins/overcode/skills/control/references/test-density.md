# Test density

The number constraint of this skill is **not** a count of tests. It is a ratio, read against the project's own habits.

```
density(f) = test cases exercising f / max(1, branch points of f)
```

`f` is a source file (or a function, when the tooling resolves that far). *Branch points* are what a coverage tool already computes to report branch coverage - conditionals, ternaries, logical short-circuits, `catch` arms, default parameters. Nothing here recomputes them: the number comes from the coverage report the project already produces, or the density is not computed at all.

## Why a ratio, and why against the project itself

An absolute cap - "no more than N tests" - answers the wrong question. It cannot tell a suite that is too large from a codebase that is large, and it makes the same demand of a validation module full of branches and a barrel file that re-exports six symbols. Worse, it degrades into a target: something to sit just under, which is how a cap becomes a reason to stop testing the one file that needed it.

A density says what a count cannot: **whether the effort spent on a file is proportionate to what there is to get wrong in it.**

The reference is the **median of the project's own distribution**, over the files that have at least one matched test case. Not a cross-project constant. Projects legitimately test at different intensities - a payment library and a static site generator have no business sharing a number - and the only defensible reference for "unusual here" is *here*.

## The alert factor: 3× the median

A file whose density exceeds **three times** the project's median is reported as an outlier. Not refused - reported. See the authority bound below.

That factor is calibrated, not asserted. Measured on a real project (72 source files, 24 with matched tests, median density 0.714):

| Factor | Files flagged | Share |
|---|---|---|
| 2× | 5 | 21% |
| 3× | 2 | 8% |
| 4× | 0 | 0% |

At 2× the signal names a fifth of the tested files, which is a list nobody reads twice. At 4× it names nothing. **3× is where the alert stays a minority small enough to be examined one by one** - which is the only form in which this signal is worth emitting. A signal the user learns to ignore is worse than no signal.

## Reading an outlier: two readings, and how to tell them apart

A high density has two causes, and they call for opposite actions. Never emit one reading without having discriminated.

- **The file is in the top decile of branch points of the project.** Then the density is high because the *denominator* pulled it there despite being large, meaning the tests are chasing a combinatorial explosion. The signal is about **the code**: a file that needs that many tests to be pinned down is a refactoring candidate. Say so, and stop - this skill proposes no refactoring.
- **Otherwise.** The density is high because the *numerator* is inflated: many cases over little logic. The signal is about **the tests** - tests with no detection power - and it belongs to `02-audit`, which owns the trivial / duplicate / getter heuristics. Hand it over; do not re-judge it here.

The decile is computed on the same distribution, in the same run. A hardcoded threshold on branch count would reintroduce the cross-project constant this whole reference exists to avoid.

## Known blind spot - state it, do not paper over it

**Data-driven discrimination does not appear in the denominator.** A regex with eight alternatives, a lookup table, a schema, a parser driven by a character class: each is one branch point to a coverage tool, and each legitimately deserves several test cases. A file built that way will read as an outlier while its tests genuinely discriminate.

This was observed on the calibration project: of its two 3× outliers, one was a file of literal constants asserted one by one (a true positive - no detection power), the other an email/format validation module whose eight cases each exercise a distinct regex alternative (a false positive - the tests discriminate, the denominator cannot see it).

So: **an outlier is a file to look at, never a verdict rendered on it.** When the inflated numerator is explained by data-driven cases, say the density is not applicable to that file and move on. Recording that as a fact in the project's document is the honest end of that examination - and is exactly `06-align`'s business.

## Degenerate cases

They stack, and the order they are reported in matters. **Check "no tests at all" first**, even though "no coverage report" is the more common cause of a missing denominator: a project with zero tests also has no coverage report, and leading with the report would suggest wiring coverage is what stands between it and a density. It is not. Report the outermost fact, once.

- **No coverage report.** The most common case by far, and the first to check: a project can run a real suite and still produce no branch data, because coverage was never wired. There is then **no denominator**, and the density is not computed - not approximated, not substituted with a line count. Report it as *not measurable, and why*, and name `03-configure` as what changes that. A ratio invented over a missing denominator is worse than the absent measurement it replaces.
- **No tests at all in the project.** No distribution, therefore no median, therefore no density. Report it as such; the project's problem is not density.
- **Population too small for a median.** Fewer than a handful of files carry a matched test case: report `insufficient population` and emit no outlier. A median over three points is a number, not a reference. This is the normal state of a `scaffolding` project and must not be dressed up as a measurement.
- **A file with no branch point.** `max(1, ...)` keeps the division defined, and the result is read for what it is: the number of cases spent on a file with nothing to get wrong. It is a legitimate outlier - it is the shape `lib/constants.js` had.
- **Files with zero matched test cases are excluded from the median.** They would drag it to zero and turn every tested file into an outlier. Their absence of tests is `04-strengthen`'s subject, not this one's.

Matching test cases to source files is approximate whenever it rests on naming convention. **Declare the matching rule used and the number of files it failed to match**, the same way `05-stats` declares its counting approximation. An unstated approximation is how a ratio acquires an authority it never earned.

## Authority bound

**Density never refuses a test.** A refusal is a tier decision, and it comes from the tier table in force - the project's documented strategy, or `decision-framework.md` - never from a ratio. Density prioritises and it reports; it does not classify. The same boundary the phase has.

Nor is it a target. No action of this skill proposes work whose only justification is moving a density toward the median - that is the coverage-percentage mistake wearing another number.

## Precedence

When the project's own documented strategy states an **explicit test-count cap**, that cap wins, as a cap. It is the project's decision, and this skill does not override a project's declared strategy with a measurement. The density is still computed and still reported alongside it, because a cap says how many and a density says whether they are in the right place - and a project can be under its cap while spending all of it on the wrong file.
