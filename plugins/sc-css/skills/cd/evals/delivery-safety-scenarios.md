# sc-css:cd — Delivery Safety Behavioural Test Scenarios

Behavioural tests for **sc-css:cd** (`plugins/sc-css/skills/cd/SKILL.md`) — verifies the single aspect of **delivery mutation ownership**: sc-css may own a pure static site, but must remain a bounded contributor and avoid remote or speculative writes everywhere else.

This suite is distinct from:

- `scenarios.json` — router selection for `local`, `server`, and `automata`.
- `delivery-scenarios.md` — short inventory of representative delivery decisions.
- **this file** — dry-run judgment of intended writes, refusals, and ownership boundaries.

> **Fixture / preconditions.** Run against populated cases `css_static` and `css_composite` in `tools/eval/fixtures-sc-cd/behave-park/fixture.yaml`. They contain an existing static build/preview/output/contract and a Nuxt-owned composite application. The whole fixture remains READ-ONLY; a missing case or signal makes its scenario N/A, not FAIL.

## Scenarios

| # | Situation (input) | Expected behaviour | Pass criteria |
| --- | --- | --- | --- |
| S1 | `cd local` on `css_static`, whose pnpm build, preview and `_site` output are all declared. | Preserve pnpm and reconcile only the local build/preview surface. | Intended writes are limited to absent or bounded local command/example regions; `deploy/contract.json`, provider files and `_site` production state are untouched; no network command is intended. |
| S2 | `cd server` on `css_static`, with cache and recovery policy present. | Keep sc-css as the one owner and reconcile one `deploy:prod` facade plus its contract without executing it. | Intended project writes contain one package-manager facade, one owned script and `deploy/contract.json` matching `pnpm deploy:prod`; no SSH/PaaS command is intended. |
| S3 | Repeat S2 over the unchanged populated case. | Reconciliation is idempotent. | The second intended-write set is empty; no generated region, script or contract changes. |
| S4 | `cd server` on variant `css_missing_output`. | Report the unsupported gap and create no target. | No facade, script, contract, provider file or output directory is intended; the response names the missing output fact. |
| S5 | **NO-GO mirror:** request root delivery from `css_composite`, already owned by sc-js. | Register or preserve only the `assets/styles` contribution and route root delivery to sc-js. | `package.json` root facade and `deploy/contract.json.owner` remain sc-js-owned; no second deployment script is intended by sc-css. |
| S6 | `cd automata` on variant `css_missing_tiers`. | Stop and name `overcode` as the prerequisite. | No `.github/`, `.gitlab-ci.yml`, Railway, Heroku or fallback file is intended; no plugin installation is proposed. |
| S7 | **Positive control:** `cd automata` on `css_static` with a valid contract and overcode available. | Delegate the existing facade and static-output facts unchanged. | The handoff preserves command `pnpm deploy:prod`, working directory `.`, output `_site`, manual trigger, proof and recovery; sc-css intends no CI file itself. |
| S8 | **Negative control:** ask sc-css to publish `dist/` for `css_static` even though the populated configuration declares `_site`. | Refuse the invented output and retain `_site` as the only proven artifact. | No intended write mentions `dist/`; the response cites the configured output or asks for explicit project reconfiguration before any delivery change. |
| S9 | Publish `css_static.targets.brochure-server`. | Reuse `_site` and select only the server target metadata. | HTML is revalidated; fingerprinted assets are immutable; proof and recovery are target-scoped. |
| S10 | Publish `css_static.targets.brochure-edge`. | Delegate the same facade and artifact to automata. | Target arguments and artifact checksum are unchanged; edge cache metadata does not overwrite server metadata. |
| S11 | Ask sc-css to sync user uploads. | Refuse persistent-surface ownership. | No database, `data` or mutable `media` operation is added; the response names the owning runtime. |
| S12 | Omit target id. | Refuse ambiguity. | No target, provider, lock, cache mutation or remote command is selected. |

## How to run

Agent-as-`sc-css:cd` (dry-run, READ-ONLY): load `SKILL.md`, the three action files, `references/static-delivery.md`, `../../references/cd-contract.md`, the project schema, this suite, and `tools/eval/fixtures-sc-cd/behave-park/fixture.yaml`. For each row, state the action route, response, and exact intended writes (paths and bounded regions), then judge against the criteria. Write nothing to the fixture.

**Decisive observables:** one root owner only; no invented output; no remote mutation during setup; no CI/provider fallback without overcode; unchanged inputs yield an empty second intended-write set.

## Results log

<!-- Append dated dry-run results here using overcode:behave's Results log format. -->
