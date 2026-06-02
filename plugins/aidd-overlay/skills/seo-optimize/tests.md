# seo-optimize — smoke tests

> Run these before trusting `seo-optimize` on a new site type or after editing `SKILL.md` / `seo-geo-pivots.md`.
> Purpose: verify the **detection step** produces the expected site type and loads the right pivot section.

## How to use

For each case below:
1. `cd` into a project matching the description (or a minimal fixture).
2. Run the Quick Start detection commands from `SKILL.md`.
3. Compare the detected site type + chosen pivot against the **Expected** column.
4. If mismatch → fix `SKILL.md` Step 1 detection logic OR `seo-geo-pivots.md` pivots.

## Test matrix

| # | Project shape (signals present)                                                | Expected site type        | Expected pivot source                                                       |
|---|---------------------------------------------------------------------------------|---------------------------|-----------------------------------------------------------------------------|
| 1 | NAP + GBP listing(s) + opening hours + geo-named pages                          | `local-business`          | `seo-geo-pivots.md` § local-business (§6 GBP critical)                       |
| 2 | Pricing page + signup/login + `/features/*` + no physical address              | `saas`                    | § saas (§6 N/A)                                                             |
| 3 | `posts/` + author pages + RSS + `Article` schema                                | `blog`                    | § blog (§9 E-E-A-T author critical)                                          |
| 4 | Product grid + cart + `Product`/`Offer` schema                                  | `e-commerce`              | § e-commerce                                                                |
| 5 | API ref + guides + versioned docs + no commerce                                 | `docs`                    | § docs (llm.txt = lever #1)                                                  |
| 6 | local-business NAP **+** active `posts/` blog                                   | `local-business` + `blog` (hybrid) | Concatenate both sections                                          |
| 7 | Marketing one-pager, no NAP, no blog, no commerce, no pricing                   | `portfolio` / `other`     | § docs/portfolio, else fallback (ask 3 infos)                               |
| 8 | None of the above clearly                                                       | `other` (fallback)        | Trigger fallback flow — ask 3 infos, build from 12 generic sections         |

## Failure modes to catch

- **Missed local-business**: a cabinet/clinic site audited as generic `other`, GBP §6 (the #1 local lever) skipped — Step 1.3 must trigger on NAP + GBP signals
- **Missed hybrid**: local-business with a blog audited as pure local-business (topical-authority pivots skipped) — Step 1.4 must load BOTH sections
- **Folklore leak**: skill recommends `meta keywords` / keyword density without checking `serp-signals.md` — every finding must be grounded
- **Single-day baseline**: skill quotes a single GSC position or one ChatGPT query as baseline (unfalsifiable) — Step 3 requires ≥7-day GSC window + ≥2 AI grid re-tests
- **§8 recompute**: skill recomputes CWV instead of reading the latest `web-optimize` report — §8 must consume, never produce
- **Truthfulness leak**: generated copy invents a price/distance not in the site — Step 5.4 truthfulness guard must emit `[placeholder]` instead
- **Encoding leak**: paste-ready copy delivered with em-dash/smart quotes for a non-UTF-8 store — Step 5.4 encoding guard must sanitize to ASCII

## When to update

- After adding a new pivot in `seo-geo-pivots.md` → add a row here covering the new site type
- After fixing a detection bug → add the failing project shape as a regression case
- After a new folklore item is caught in the wild → add it to `serp-signals.md` and a failure-mode line here
