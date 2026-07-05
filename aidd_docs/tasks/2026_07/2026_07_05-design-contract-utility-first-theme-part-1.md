---
name: plan
description: Part 1 — add a theme/mode dimension to the design token schema and make the adapters emit .dark / [data-theme]. Finding #3 (High).
objective: "design/tokens.json can contractually encode more than one value per token across modes/themes, and the adapters emit theme-scoped CSS (.dark / [data-theme]), with the baseline linter validating themed token references."
success_condition: "node plugins/design/skills/enforce/adapters/lint-core.mjs plugins/design/skills/enforce/fixtures/themed-clean.html plugins/design/skills/enforce/fixtures/themed exits 0 AND node plugins/design/skills/enforce/adapters/lint-core.mjs plugins/design/skills/enforce/fixtures/themed-dirty.html plugins/design/skills/enforce/fixtures/themed exits 1"
iteration: 0
created_at: "2026-07-05T16:59:56Z"
---

# Instruction: theme/mode dimension in the token schema + theme-aware adapters (#3)

## Feature

- **Summary**: `references/token-schema.md` currently defines every token as a single `$type`/`$value`. A project with a dark mode by class **and** a second thematic territory ("Grimoire") cannot be contractualized — the auditor could only model the default theme and dropped dark mode into Open questions with no contract support. Add a mode/theme dimension to the schema and specify adapter emission of `.dark` / `[data-theme]`.
- **Stack**: `Markdown contract` · `JSON (W3C DTCG tokens)` · `Node.js >= 18 (lint-core.mjs)` · `CSS (generated adapters)` · Tailwind v3/v4 (consumed downstream)
- **Branch name**: `design/contract-utility-first-theme`
- **Parent Plan**: `2026_07_05-design-contract-utility-first-theme-master.md`
- **Sequence**: `1 of 7`
- Confidence: 9/10 (structure); implementation detail gated by A1–A3
- Time to implement: L

## Phase 0 — Arbitration (resolve before editing any file)

- **A1 mode representation**: inline `$value`-per-mode (e.g. `$value` becomes a `{ default, dark }` map, or a DTCG-extension `$extensions.modes`) **vs** a top-level `themes` overlay that re-declares only the tokens that change per mode. Recommendation to put to the user: `themes` overlay — keeps the base tree DTCG-valid and mono-value by default (backward compatible), overlays are sparse (only overridden tokens), and it maps 1:1 to a CSS block per theme.
- **A2 emission mechanism**: `.dark` class vs `[data-theme="grimoire"]` attribute vs both; default theme in `:root`. This decides the linter impact:
  - If each theme **re-declares the same `--var` names** inside its own selector block → no new valid-var names → `flattenTokenPaths` unchanged, linter already correct.
  - If a theme introduces **suffixed vars** (`--color-…-dark`) → `validVars` must include them → linter change required.
  - Recommendation: re-declare same names per block (no suffix) — zero linter churn, standard dark-mode pattern.
- **A3 second thematic territory**: is "Grimoire" a peer of dark on one axis (flat theme list: `default`, `dark`, `grimoire`, `grimoire-dark`) or an orthogonal axis (mode ∈ {light,dark} × theme ∈ {default,grimoire})? Drives 1-D vs 2-D overlay. Recommendation: flat list of named themes for the contract (simplest to lint/emit); document the matrix as prose if the project needs it.

Record the three decisions in the plan Amendments before proceeding.

## Architecture projection

### Files to modify

- `plugins/design/references/token-schema.md` — add the "Modes/themes" section: overlay syntax, required-groups note (a theme overlay only overrides, never re-declares the full set), and the two adapter emission rules (`.dark` / `[data-theme]`). Fix the drift note at line 83 in the same pass if touched (#5 hygiene).
- `plugins/design/references/token-schema.md` (§ Adapter `tokens.css`) — specify how overridden tokens are emitted in a theme selector block, and that aliases resolve per theme.
- `plugins/design/skills/enforce/adapters/lint-core.mjs` — **conditional on A2**: if suffixed vars are chosen, extend `flattenTokenPaths` / `validVars` to enumerate theme-overlay var names; if same-name re-declaration is chosen, no code change (add only a comment documenting theme handling).
- `plugins/design/skills/adjust/references/manifest-schema.md` (§ token liaison) — note that a component's `.backgrounds` token may resolve to different values per theme, and dark-variant contrast (WCAG AA) is checked against the resolved value **in the relevant theme**.
- `plugins/design/skills/adjust/actions/02-freeze.md` — freeze step must audit theme overlays for completeness (every overlay path exists in the base tree) and bump `$version`.
- `plugins/design/references/sc-pivot-contract.md` — enforcement/render specs must carry the theme list so pivots emit theme-scoped CSS (`.dark`/`[data-theme]`) natively.
- `plugins/design/CHANGELOG.md` + `plugins/design/.claude-plugin/plugin.json` — minor bump, changelog entry.

### Files to create

- `plugins/design/skills/enforce/fixtures/themed/tokens.json` — a fixture tokens file exercising the chosen overlay shape (base + one `dark` + one `grimoire` overlay).
- `plugins/design/skills/enforce/fixtures/themed/components.json` — minimal manifest referencing themed backgrounds.
- `plugins/design/skills/enforce/fixtures/themed-clean.html` — references only valid themed vars → must lint exit 0.
- `plugins/design/skills/enforce/fixtures/themed-dirty.html` — references a non-existent themed var → must lint exit 1 (regression guard for A2).

### Files to delete

- none.

## Applicable rules

| Tool   | Name                     | Path                                             | Why it applies |
| ------ | ------------------------ | ------------------------------------------------ | -------------- |
| claude | plugins-marketplace      | `~/.claude/rules/plugins-marketplace.md`         | Edit source under `plugins/design/skills/…`, never the cache; re-install to activate. |
| claude | CLAUDE.md (RTK/pnpm)     | `~/.claude/CLAUDE.md`                             | Use `rtk` prefixes and `pnpm` for any tooling run during validation. |

## User Journey

```mermaid
flowchart TD
  A[adjust freezes tokens.json with a themes overlay] --> B[adapters emit :root + .dark/[data-theme] blocks]
  B --> C[enforce derives valid vars incl. themed]
  C --> D{lint themed HTML}
  D -->|valid themed var| E[exit 0]
  D -->|dead themed var| F[exit 1]
```

## Risk register

| Risk | Impact | Mitigation |
| ---- | ------ | ---------- |
| DTCG has no native mode primitive | Any encoding is a local convention; risk of picking a non-portable one | Prefer a `themes` overlay documented as a project convention; keep the base tree strictly DTCG-valid so external DTCG tools still parse it. |
| Emission model silently breaks the linter | Suffixed vars would make every themed `var()` a false "unknown token" | A2 gate forces the decision up-front; the `themed-dirty.html` fixture is a regression guard either way. |
| Contrast check ambiguity across themes | A dark-variant component may pass AA in one theme and fail in another | manifest-schema note: contrast is checked against the value resolved **in the theme the variant targets**. |
| 2-D matrix explosion (A3) | mode × theme combinatorics bloat the overlay | Default to a flat named-theme list; only go 2-D if the user explicitly needs it. |

## Implementation phases

### Phase 1: Schema — theme/mode model in token-schema.md

> Encode the chosen overlay in the contract, backward-compatible with mono-value tokens.

#### Tasks

1. Add a "Modes / themes" section documenting the overlay syntax (per A1) and the flat-vs-matrix choice (per A3).
2. State the invariant: a theme overlay MAY override any base token path; it MUST NOT introduce a path absent from the base tree; unspecified tokens inherit the base value.
3. Add a worked example (default + dark + grimoire) mirroring the existing Example block.

#### Acceptance criteria

- [x] token-schema.md documents overlay syntax and the backward-compat guarantee (mono-value still valid).
- [x] The example resolves aliases per theme and names no undefined path.

### Phase 2: Adapters — theme-scoped emission

> Specify how the two adapters render per-theme CSS.

#### Tasks

1. In `tokens.css` adapter spec: emit base tokens under `:root`, then one selector block per theme (`.dark` and/or `[data-theme="…"]` per A2) re-declaring only overridden vars.
2. In `theme.css` adapter spec (Tailwind): note how theme overlays map (defer the v3 artifact detail to Part 3/#6; here only state that themes must be emittable in both v3 and v4 targets).
3. Update the sc-pivot enforcement/render specs to include the theme list so native pivots emit the same theme blocks.

#### Acceptance criteria

- [x] Adapter spec shows a `:root` + `.dark`/`[data-theme]` example with overridden vars only.
- [x] sc-pivot-contract.md spec fields include the theme list.

### Phase 3: Baseline linter + fixtures

> Prove the linter validates themed token references (the runnable gate).

#### Tasks

1. Create the `themed/` fixture contract (tokens + components) using the chosen overlay.
2. Per A2: if same-name re-declaration → add only a documenting comment in `lint-core.mjs`; if suffixed vars → extend `flattenTokenPaths`/`validVars` to enumerate overlay var names.
3. Create `themed-clean.html` (valid) and `themed-dirty.html` (dead themed var).
4. Run the `success_condition` and the existing `clean.html`/`dirty.html` fixtures to confirm no regression.

#### Acceptance criteria

- [x] `themed-clean.html` → exit 0; `themed-dirty.html` → exit 1.
- [x] Existing `clean.html` (exit 0) and `dirty.html` (exit 1) unchanged.

### Phase 4: Freeze path + versioning + changelog

#### Tasks

1. Update `adjust/02-freeze.md` to audit overlay completeness and bump `$version`.
2. Update `manifest-schema.md` contrast note for per-theme resolution.
3. Bump `plugin.json` version; add CHANGELOG entry.

#### Acceptance criteria

- [x] 02-freeze.md audits overlays; manifest-schema.md states per-theme contrast.
- [x] plugin.json + CHANGELOG updated; versions in phase.

## Amendments

- **A1 (🤖 auto, recommandation retenue)** : `themes` overlay — un objet top-level `themes` qui ne re-déclare que les tokens surchargés par thème/mode. L'arbre de base reste mono-valeur et DTCG-valide (rétrocompatible).
- **A2 (🤖 auto, recommandation retenue)** : re-déclaration des mêmes noms de `--var` par bloc de sélecteur (`.dark` / `[data-theme="…"]`), pas de suffixe. Zéro churn sur `flattenTokenPaths`/`validVars` — seul un commentaire documentant la gestion des thèmes est ajouté à `lint-core.mjs`.
- **A3 (🤖 auto, recommandation retenue)** : liste plate de thèmes nommés (`default`, `dark`, `grimoire`, `grimoire-dark`) sur un seul axe — pas de matrice 2-D mode × thème.

<!-- Décisions enregistrées avant Phase 1, cf. réponse utilisateur "oui commence l'implémentation du master plan" (2026-07-05) : recommandations du plan retenues telles quelles. -->

## Log

<!-- APPEND ONLY. -->

- 2026-07-05 : Phase 1 — section "Modes / themes" ajoutée à `token-schema.md` (overlay `themes`, invariant chemin-existant, exemple default+dark+grimoire résolu). Dérive documentaire "ligne ~83" (hygiène #5) recherchée et non trouvée : déjà corrigée en 1.10.0 (bug mapping token→var) — aucune action nécessaire.
- 2026-07-05 : Phase 2 — `token-schema.md` § Adapter `tokens.css` : sous-section "Theme-scoped emission" (`:root` + `.dark`/`[data-theme]`, exemple travaillé). § Adapter `theme.css` : note v3/v4 (détail v3 renvoyé à Part 3/#6). `sc-pivot-contract.md` : champ `Themes:` ajouté aux specs d'enforcement et de rendu + note de compatibilité cascade thème.
- 2026-07-05 : Phase 3 — fixtures `fixtures/themed/{tokens.json,components.json}` + `fixtures/themed-clean.html` + `fixtures/themed-dirty.html` créées. Commentaire A2 ajouté près de `validVars` dans `lint-core.mjs` (aucun changement de logique). `success_condition` vérifié : themed-clean exit 0, themed-dirty exit 1. Non-régression confirmée : `clean.html` exit 0, `dirty.html` exit 1 (3 erreurs, inchangé).
- 2026-07-05 : Phase 4 — `02-freeze.md` : étape 1d (audit complétude overlays de thème) + lignes de bump version (thème). `manifest-schema.md` : invariant 6 (contraste WCAG AA résolu dans le thème du variant) + note `.backgrounds` par thème + § Consommation par enforce mise à jour. `plugin.json` bumpé 1.10.0 → 1.11.0 (minor). Entrée `## [1.11.0] — 2026-07-05` ajoutée en tête de `CHANGELOG.md`. Les 4 phases du plan Part 1 sont complètes.

## Validation flow demonstration

1. Freeze a `tokens.json` with a `dark` and `grimoire` overlay via the documented syntax.
2. Generate `tokens.css` per the adapter spec → confirm `:root` + `.dark`/`[data-theme]` blocks.
3. Run the `success_condition`: themed-clean → exit 0, themed-dirty → exit 1; existing fixtures unchanged.
