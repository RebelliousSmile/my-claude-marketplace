# Normalize

## Input

- A readable existing HTML file and a distinct explicit output path.
- Page keys or pages JSON when the source contains more than one page candidate.
- An optional frozen contract directory.
- A normalization mode: `snapshot` by default, or explicit `interactive`.

## Output

A canonical standalone harness plus a migration report in the response. The source HTML and any contract artifacts remain unchanged.

## Process

1. **Analyze.** Read [harness-normalization.md](../../../references/harness-normalization.md), then run `${DESIGN_PLUGIN_ROOT}/tools/harness-analyze.mjs <input>` and inventory author markup, styles, dependencies, page candidates, visible interactions, and provenance gaps.
2. **Choose the mode.** Use `snapshot` unless the request explicitly requires live behaviour. When visible JavaScript exists, snapshot mode requires explicit acceptance that interactions will be frozen; interactive mode requires an interaction-by-interaction migration decision.
3. **Gate.** Stop before writing when page ownership is ambiguous, an interaction has no safe mapping, an external dependency is unresolved, or provenance is insufficient. Never copy external or inline application scripts into harness control regions.
4. **Rebuild.** Generate a fresh temporary shell with `${DESIGN_PLUGIN_ROOT}/adapters/harness/harness.py`, passing the validated page metadata and optional `--contract`. Write the reviewed migration inventory as JSON (`pages` for rendered HTML or `pageBodies` for reusable function bodies, `styles`, optional `sharedHelpers`, optional `afterRender`), then apply it with `${DESIGN_PLUGIN_ROOT}/tools/harness-apply.py --harness <fresh> --payload <inventory.json> --out <output>`. Prefer `pageBodies` when flattening would duplicate shared layout or assets. This applicator owns safe JavaScript serialization (`</script>`, newlines, U+2028 and U+2029 included), raw-script boundary refusal, and the atomic final write. Do not patch the source shell in place.
5. **Migrate.** Move page markup into matching `pageXxx()` bodies and page CSS into `AUTHOR PAGE STYLES`. Put repeated pure builders in `AUTHOR SHARED HELPERS`; never duplicate shared icons or chrome across every page. In interactive mode only, bind declared page-local behaviour inside `AUTHOR AFTER RENDER`.
6. **Reconcile.** Translate viewport rules to `.preview-frame.mobile` or `.preview-frame.tablet` only when their intent is explicit. Preserve accessibility preference media queries. Record unresolved assets, behaviours, dependency or breakpoint semantics instead of inventing replacements.
7. **Verify.** Re-run the analyzer with `--baseline <input>` and `${DESIGN_PLUGIN_ROOT}/tools/harness-runtime-check.mjs` on the output, then compare before/after screenshots for every page and viewport. Return the four independent outcomes—format, runtime, migration completeness, visual delta—plus preserved, transformed, omitted, and unresolved items. Do not claim visual contract conformity; that remains `design:enforce`.

## Test

| Case | Pass |
| --- | --- |
| a conventional single-page HTML file has no application script | its body and page CSS move into a fresh runtime-valid harness while the source stays unchanged |
| a damaged harness has author regions that remain identifiable | canonical chrome and controls are regenerated and only author-owned content is retained |
| the input is already canonical | normalization is idempotent for page content, metadata, and author styles |
| page mapping is ambiguous | the action exits 2 before writing and names the missing mapping |
| an application script controls visible content | the action exits 2 before writing or records an explicit user-approved replacement; the script is never copied silently |
| a frozen contract is supplied | its generated stylesheet is inlined without changing the contract, but no visual-conformity claim is made |
| snapshot mode freezes visible interactions | explicit acceptance and the frozen interaction inventory appear in the report |
| interactive mode is requested | every retained interaction is bound in `AUTHOR AFTER RENDER` and passes browser smoke tests |
| output grows beyond 2× the input | shared content is deduplicated or the growth is explicitly accepted and reported |
| accessible preference CSS is present | it is preserved; only viewport-dependent media queries are converted to frame classes |
