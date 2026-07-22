# 02 - Curate

Maintenance pass on an **existing** `CHANGELOG.md`: fill the holes (released versions that were never documented, work landed after the last documented version), then condense the closed major cycles into a single bounded summary each, so the file stops growing without end.

Rewrites history sections; writes no tag. `01-generate` documents the *next* version — `curate` repairs and compacts the *past* ones.

## Inputs

- `changelog_path` (optional, default: `CHANGELOG.md` at repo root) - path to the file to curate
- `mode` (optional, default: both) - `fill` (holes only), `condense` (summaries only), or both
- `keep_detailed` (optional, default: current major) - the major cycles that stay expanded item by item

## Outputs

- `CHANGELOG.md` rewritten: holes filled in Keep a Changelog format, older majors replaced by one summary section each.
- A git commit: `docs(changelog): combler les trous et condenser les majeures antérieures` (scoped to what was actually done).
- A printed report: versions filled, versions summarized, lines dropped, anything left unrecoverable.
- No tag, ever.

## Process

1. **Read the file.** If `CHANGELOG.md` does not exist, stop and hand over to `01-generate` — this action never creates a changelog from nothing.
2. **Inventory.** Build two lists and compare them:
   - documented versions: every `## [<version>]` heading, with its date;
   - real versions: `git tag --sort=version:refname`, plus `HEAD`.
   Classify each divergence:
   - **tagged but undocumented** → a hole to fill;
   - **documented but untagged** → report it, change nothing (the tag may simply never have been pushed);
   - **numbering jump** with no tag behind it (e.g. `3.0.0` then `3.2.0`) → report as a versioning gap, do **not** invent a `3.1.0` section;
   - **commits after the last documented version** → an unreleased hole; document them under the version they belong to if a tag covers them, otherwise under `## [Unreleased]`.
3. **Fill each hole** from `git log <prev-tag>..<tag> --pretty="%h %s" --no-merges`, with the same grouping rules as `01-generate` (feat → Added, fix → Fixed, refactor/perf → Changed, …). Date the section from the tag: `git log -1 --format=%as <tag>`. Insert it in version order — the file stays sorted newest-first.
   - A hole whose range yields nothing usable (empty range, history rewritten, tag predating the repository import) is written as a one-line section stating the version exists and its detail is not recoverable, with the range that was searched. **Never fabricate entries.**
4. **Pick what to condense.** By default, every major cycle strictly older than the current major. `1.x` and `2.x` collapse once `3.0.0` exists; the current major keeps all its sections expanded. Sections already condensed are left untouched — this action is idempotent and re-running it must not re-summarize a summary.
5. **Condense each closed major** into one section, replacing all its individual version sections:
   ```
   ## [2.x] — 2026-05-29 → 2026-06-13 (résumé)

   > Détail par version : `git log v1.9.0..v3.0.0` — sections d'origine dans l'historique du fichier.

   ### Changed (BREAKING)
   - ...
   ### Added
   - ...
   ```
   - **20 items maximum per summary**, all categories combined. This is a hard ceiling, not a target: a quiet major may summarize in four lines.
   - Keep the Keep a Changelog categories, in the usual order, dropping the empty ones.
   - The date range spans the first and last version of the cycle; the pointer line names the exact git range so nothing is truly lost.
6. **Choose the 20 items** by what a reader of *today's* version still needs. Priority order when cutting:
   1. breaking changes and the migration actions they require — never dropped, whatever the count;
   2. features and behaviours that still exist today;
   3. renames, moves, and anything that makes an old reference stale;
   4. fixes that changed observable behaviour.
   Dropped first: fixes to features that were themselves later removed, internal refactors, doc and tooling churn, and anything a later entry already supersedes. Merge sibling entries into one line rather than sacrificing a whole theme (`- Skills `foo`, `bar`, `baz` ajoutées` beats three lines).
7. **Rewrite the file** in one pass: header and any baseline note preserved verbatim, `## [Unreleased]` if any, then detailed sections newest-first, then the summaries. Never touch the wording of sections that are neither filled nor condensed.
8. **Report and commit.** Print what was filled, what was summarized (with the before/after item count per major), and every divergence left unresolved. Then commit `CHANGELOG.md` alone. If anything was flagged unrecoverable or as a versioning gap, show the report and ask before committing.

## Constraints

- **Never invent a version, a date, or an entry.** Everything comes from the existing file or from git; what neither provides is reported as unrecoverable.
- **Never delete a whole major.** A major cycle is condensed, never dropped — a reader must still see it happened, and when.
- **20 items is a ceiling per summary**, not per category and not per file.
- Condensation is lossy on purpose; the git-range pointer is what makes it acceptable, so a summary without its pointer line is invalid.
- No tag, no version bump, no release. Releasing is `01-generate`'s job.

## Test

Run on a real `CHANGELOG.md` that has at least one tagged-but-undocumented version and two closed major cycles. Verify: the hole is filled from real commits and dated from the tag; each older major became exactly one section of at most 20 items carrying a git-range pointer; the current major is untouched word for word; every breaking change of the condensed cycles survived. Run it a second time immediately — the file must come out byte-identical and the commit step must be skipped.
