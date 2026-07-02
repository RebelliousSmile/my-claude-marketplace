# 08 - Sessions

List **all** play sessions of a PJ, aggregated across **all its campaigns** and the **PJ axis** (read-only — never modifies anything).

## Inputs

- `pj` (optional) - the target PJ folder under `R/_pjs/<pj>/`. If omitted: resolve from `.current-session` (active campaign's `pj_campagne`); if still unknown, list `R/_pjs/` and ask.
- `R` (resolved) - the game domain discovered locally.

## Outputs

A **read-only** chronological listing of every session of the PJ, grouped by source:
- one block **per campaign** the PJ played in (axe campagne, `R/<AAAA>/<MM>/<campagne>/`);
- one block for the **PJ journal** (axe PJ, `R/<AAAA>/<MM>/<pj>/`), if any.

Per session: `<N>`, date, relative file path, and a one-line title/summary if the file header carries one. Per-source subtotal + grand total. Nothing is written.

## Process

1. **Resolve the PJ.** Argument if supplied; else `.current-session` → the active campaign's `pj_campagne`; else list `R/_pjs/` and ask. (A PJ can be present in several campaigns — see step 2.)
2. **Discover the PJ's campaigns.** Scan every `R/_campagnes/*/config.yaml`; collect the campaign slugs whose `pjs:` list or `pj_campagne:` path references this PJ. **Match tolerantly** — the reference may be a bare slug (`<pj>`), or a path with or without the `_` prefix (`_pjs/<pj>/…`, `pjs/<pj>/…`, `campagnes/<c>/pj/<pj>.md`): normalize (strip leading `_`, take the `<pj>` path segment) before comparing, so a config using legacy non-`_` paths is not missed. This is the set of campaign axes to aggregate — a PJ in two campaigns yields two campaign blocks.
3. **Per campaign axis.** Scan `R/<AAAA>/<MM>/<campagne>/session-*.md` across **all** year/month folders and order them with the **canonical session ordering** (`${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md › Ordre canonique des séances`): exclude `-prep-`, extract `<N>` by suffix form, sort by `<N>`. `<N>` is **per campaign** (independent sequences across campaigns).
4. **PJ axis.** Scan `R/<AAAA>/<MM>/<pj>/session-*.md` likewise (its own `<N>` sequence).
5. **Render** a read-only timeline: one block per source (each campaign, then the PJ axis), each ordered by `<N>`; show `<N>`, date (from filename, else frontmatter), relative path, and a one-line summary if the header has one. A discovered campaign with **zero** session files is still shown as a block with an explicit "aucune séance" line (never silently dropped — it signals the PJ is enrolled but unplayed there). Mark `-prep-`/auxiliary files separately if surfaced, never counted in `<N>`. Modify no file.

## Test

Lists every `session-*.md` of the PJ across all its campaigns (discovered via `_campagnes/*/config.yaml`) and the PJ axis, each source ordered per the canonical session ordering, grouped with subtotals, with **nothing written to disk**.
