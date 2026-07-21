# Testing pivot contract

A language plugin (e.g. `sc-js`, `sc-php`, `sc-python`, `sc-rust`) MAY provide a `testing` capability pivot, nested under its own `sniff`-equivalent skill tree alongside its existing capability categories - e.g. in `sc-js` this lives at `skills/sniff/references/capabilities/tools/testing.md`, next to `tools/vitest.md` and `tools/playwright.md`. Only `sc-js` ships one today; other language plugins could provide one following the same shape, but none is an established example yet. `control` consumes the pivot when the target project's active language plugin ships one; it degrades to `references/decision-framework.md` and to tool-agnostic checks when no pivot is available.

## Detecting the active language plugin

Use the same detection convention the language plugin's own `sniff`-equivalent action uses for the target project (e.g. inspecting its package manifest or build files) - `control` does not re-implement stack detection, it reuses whichever language plugin is already installed and applicable.

## Locating the testing pivot

Canonical filename: `testing.md`. Discovery glob: `**/capabilities/**/testing.md`, run under the active language plugin's own root directory - never project-wide. The parent directory right above `testing.md` is each language plugin's own choice (`tools/`, a dedicated `testing/`, or directly under `capabilities/`); the glob's `**` accepts all of them, so no further convention is needed there.

The active language plugin's root directory is resolved the same way as its detection in the section above: the root of whichever installation is actually loaded in the current session - `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/` in normal execution, or the plugin's source root (`plugins/<plugin>/`) when `control` runs directly against a marketplace repo (e.g. while developing `control` itself). `control` does not hardcode either path; it locates the root the same way it already locates the plugin to detect it.

## Expected shape

A `testing` pivot is a markdown file with:

- **Test runner(s)** - the command(s) used to run unit/contract tests and, separately, E2E tests.
- **Test file glob** - the pattern(s) identifying test files in this stack (e.g. `**/*.spec.js`, `**/*_test.py`).
- **Test-count command** - a command or query returning the current number of tests (or test files), used by the `write` action's number-constraint check.
- **Tier thresholds** (optional) - stack-specific refinements to the generic tier decision (e.g. "a component with no DOM access is always `contract`").
- **Known tooling gotchas** - entries covering three axes (issue, detection, fix) for config bugs specific to this stack's test tooling (e.g. a coverage-threshold config key that silently disables the gate on an invalid schema) - as structured keys or as tagged prose, either is acceptable since `control` reads this pivot as an agent, not as a parser. Consumed by the `configure` action.
- **Canonical E2E tool** - the name of the E2E framework this stack standardizes on, if any. Informational only - `control` never proposes replacing it, regardless of what this field says.

## Absence

No pivot existing for the detected language plugin is not an error. `control` runs its generic checks only, and states in its output that stack-specific refinement was unavailable for that run.

## Language

A pivot is written in whichever language its own language plugin already uses for its other capability files - `control` does not impose a single language across plugins, only consistency within each plugin's own tree.
