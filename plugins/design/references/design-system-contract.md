# Design system contract

The single source of truth for **where** the design system lives in a project and **what files** compose it. Every `design` skill reads and writes against this contract so that `define`, `destructure`, `adjust`, `enforce`, and `diffuse` stay interoperable.

## Les 3 couches du contrat

Le contrat est un empilement de 3 couches. Elles cristallisent à `adjust` ; avant ce point la matière est malléable.

| Couche | Fichier | Contenu | Autorité |
|--------|---------|---------|----------|
| **1** | `design/tokens.json` | Valeurs (couleurs, espacements, typographie, breakpoints…) au format W3C DTCG | Source des valeurs — `enforce` en dérive ses ensembles |
| **2** | `design/components.json` | Vocabulaire fermé des composants (noms canoniques, BEM, variantes, contextes de fond autorisés) | Source de nomenclature — `enforce` en dérive ses règles de classes |
| **3** | `design/design-system.md` | Charte prose (fondations narratives, inventaire candidat, provenance, version) | Lisibilité humaine — concordance vérifiée par `enforce` |

**Règle fondamentale : une valeur vit dans une seule couche.**
- Les valeurs numériques/couleurs/dimensions → couche 1 (`tokens.json`) exclusivement.
- La nomenclature des composants → couche 2 (`components.json`) exclusivement.
- La prose, la provenance, le narrative → couche 3 (`design-system.md`) exclusivement.

## Project layout

The design system home is `design/` at the project root (create it if absent).

```
design/
  design-system.md          # couche 3 — charte prose (statut brouillon → figé à adjust)
  tokens.json               # couche 1 — W3C DTCG tokens (valeurs canoniques)
  components.json           # couche 2 — manifeste composants (vocabulaire fermé, écrit par adjust)
  adapters/
    tokens.css              # generated — CSS custom properties (:root)
    theme.css               # generated — Tailwind v4 @theme block
  wireframes/
    <story-slug>.html       # living HTML preview, mobile-first, links ../adapters/tokens.css
```

- If a project already nests UI under a sub-package (monorepo), prefer that package root; record the chosen home at the top of `design-system.md`.
- Never scatter tokens across multiple sources. `tokens.json` is canonical; `adapters/*` are **generated** and must never be hand-edited (a header banner says so).
- `components.json` est absent avant `adjust` — c'est normal. `define` et `destructure` travaillent sur la matière malléable ; `adjust` est le seul verbe autorisé à l'écrire.

## `components.json` (couche 2)

Voir `adjust/references/manifest-schema.md` pour la structure complète et les exemples. Résumé des invariants :

- Vocabulaire fermé : toute classe CSS du design system doit correspondre à un `base`, `elements.*`, ou `modifiers.*` déclaré.
- Concordance avec la couche 3 : chaque composant de `design-system.md § Inventaire des composants` doit avoir une entrée, et vice-versa.
- `$version` en phase avec `design-system.md`.

## `design-system.md` required sections

1. **Provenance** — origin (reference URL/file, or brief summary), date, version, who/what generated it.
2. **Foundations** — narrative summary of color, typography, **iconography** (the single chosen icon library + style, `icon.library`/`icon.style`), spacing, radius, elevation, motion. Points to `tokens.json` for exact values; does not duplicate every number. The **core trio** (palette anchor · type · icon set) is settled and approved first, fast, before the rest. Never emoji as UI iconography.
3. **Responsive strategy** — the named breakpoints, the mobile-first stance, and the three-tier intent: what the **mobile core** must always deliver, what is **enriched** only at ≥ tablet/desktop, and which **mobile-only** UX patterns exist. (See the installed `.claude/rules/08-design/` rules for the binding conventions.)
4. **Component inventory** — table: component · purpose · key options/variants · responsive divergence (one line) · spec file.
5. **Open questions** — anything assumed or unresolved, so a human can close it.

## Consumption rules

- `define` écrit une matière malléable (tokens de travail + inventaire prose candidat). Elle N'ÉCRIT PAS `components.json`.
- `destructure` est lecture seule. En mode standalone sur projet figé : lit `components.json` + `design-system.md` pour situer les pistes par rapport au contrat existant.
- `adjust` est le seul verbe qui écrit `components.json`. Il canonise aussi `tokens.json` et marque `design-system.md` comme figé.
- `enforce` dérive ses règles de lint depuis `tokens.json` (valeurs) + `components.json` (vocabulaire). Il ne les invente pas.
- `diffuse` produit des éléments répétables sous le gate `enforce`. Tout élément produit doit n'utiliser que les classes et valeurs déclarées dans le manifeste.
- When tokens change, regenerate **both** adapters in the same step; never let `tokens.css` and `theme.css` drift from `tokens.json`.

## Versioning

- `design-system.md` carries a `version:` line (semver). Bump **minor** on additive token/component changes, **major** on a token rename/removal that breaks existing pages. Record the bump reason under Provenance.
