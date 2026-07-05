# Manifest schema — `design/components.json`

`design/components.json` est la **2e couche** du contrat à 3 couches. C'est le vocabulaire fermé, machine-vérifiable, des composants du design system. Il est écrit par `adjust/02-freeze.md` et consommé par `enforce` pour dériver ses règles de lint.

## Position dans le contrat

| Couche | Fichier | Contenu | Mutabilité |
|--------|---------|---------|------------|
| 1 | `design/tokens.json` | Valeurs (couleurs, espacements, typographie…) | Figé à `adjust` |
| 2 | `design/components.json` | Vocabulaire composants (noms canoniques, BEM, variantes, contextes de fond) | Figé à `adjust` |
| 3 | `design-system.md` | Charte prose (fondations narratives, inventaire candidat, provenance) | `brouillon` → `figé` à `adjust` |

Règle absolue : **une valeur vit dans une seule couche.** Les valeurs vivent en couche 1 ; la nomenclature des composants vit en couche 2 ; la prose et la provenance vivent en couche 3. Le manifeste (couche 2) PROMEUT l'inventaire prose candidat de `design-system.md` — ce sont deux artefacts distincts ; le manifeste est la source fermée vérifiable.

## Structure de `design/components.json`

```json
{
  "$schema": "design/references/manifest-schema#",
  "$version": "1.0.0",
  "mode": "bem",
  "components": {
    "<canonical-name>": {
      "base": "<BEM-block>",
      "elements": {
        "<element-label>": "<BEM-element>"
      },
      "modifiers": {
        "<variant-label>": "<BEM-modifier>"
      },
      "backgrounds": ["<token.path>"],
      "a11y": {
        "role": "<ARIA-role>",
        "requires": ["<attribute>"]
      }
    }
  },
  "usage": {
    "rawHexForbidden": true,
    "colorUtilityPrefixes": ["<utility-prefix>"],
    "rules": [
      {
        "id": "<rule-id>",
        "description": "<prose>",
        "enforcement": "baseline | pivot-only"
      }
    ]
  }
}
```

### Champs

| Champ | Requis | Description |
|-------|--------|-------------|
| `$schema` | oui | Toujours `"design/references/manifest-schema#"` |
| `$version` | oui | Semver ; bump **minor** sur ajout, **major** sur renommage ou suppression |
| `$utilityPrefixes` | non | Liste de préfixes de classes utilitaires (ex. `["wf-", "u-"]`) à ignorer explicitement par le mode `--strict` de `lint-core.mjs` (cf. § Consommation par enforce) |
| `mode` | non (par A6) | `"bem"` ou `"utility-first"`. Explicite = source de vérité. Absent → auto-détection par `lint-core.mjs` : `components` vide/absent ⇒ `utility-first`, `components` non vide ⇒ `bem` (cf. § Mode utility-first ci-dessous). |
| `components` | oui en mode `bem` ; **optionnel** en mode `utility-first` (A5) | Map des composants canoniques |
| `components.<name>` | — | Clé = nom canonique en kebab-case (ex. `btn`, `card`, `hero`) |
| `.base` | oui | Classe BEM block (ex. `"btn"`, `"c-card"`) — source unique de la nomenclature |
| `.elements` | non | Map `label → BEM-element` (ex. `"body": "card__body"`) |
| `.modifiers` | non | Map `label → BEM-modifier` (ex. `"primary": "btn--primary"`) |
| `.backgrounds` | non | Liste de chemins de tokens autorisés comme fond pour ce composant (ex. `["color.semantic.background", "color.brand.primary"]`). Omis = pas de contrainte de fond. Si `tokens.json` déclare un overlay `themes` (§ Modes / themes de `token-schema.md`), un chemin de `.backgrounds` peut résoudre à une valeur différente par thème — la contrainte porte toujours sur le **chemin**, pas sur une valeur figée. |
| `.a11y.role` | non | Rôle ARIA attendu (ex. `"button"`, `"region"`) |
| `.a11y.requires` | non | Attributs ARIA requis (ex. `["aria-label"]`) |
| `usage` | non (par A5) | Bloc **additif** de règles de token-usage — coexiste avec `components`, ne le remplace jamais. Cf. § Bloc usage ci-dessous. |

## Mode utility-first (A6) — l'invariant qui bascule

Sur un projet Tailwind/Vue/React, le code n'utilise jamais de classes BEM (`card__body`, `btn--primary`) : il compose des classes utilitaires (`flex`, `bg-brand-primary`, `rounded-lg`). Appliquer le vocabulaire fermé de `components.json` (Invariant 1) à ce code est vide de sens — aucune classe déclarée n'apparaît jamais dans le code, et *aucune classe du code n'est jamais déclarée* : le lint tourne, ne trouve jamais rien à signaler, et ressort vert sans avoir vérifié quoi que ce soit (finding #2 — 0 hit sur `class-vocab` mesuré sur du code réel).

`mode: "utility-first"` bascule où porte le vocabulaire fermé :

| | Mode `bem` (défaut) | Mode `utility-first` |
|---|---|---|
| Le vocabulaire fermé porte sur | les **noms de classe** (`.base`/`.elements`/`.modifiers`) | l'**usage des tokens** (namespaces de couleur autorisés, raw-hex interdit) |
| `components` (map BEM) | requis | optionnel — peut être absent, vide, ou partiel (composants legacy encore BEM à côté du gros du code utilitaire) |
| `usage` (bloc token-usage) | absent en général | requis pour que `lint-core.mjs` enforce quelque chose |
| Rule 1 (`class-vocab`) de `lint-core.mjs` | s'exécute | **ne s'exécute jamais** (gate explicite sur `mode`) |
| Rules 3/4 (`raw-hex`, `allowed colour namespaces`) | inertes si `usage` absent | s'exécutent |

**Auto-détection** (si `mode` absent du contrat) : `lint-core.mjs` regarde si `components` est vide ou absent. Vide/absent ⇒ `utility-first` ; non vide ⇒ `bem`. C'est une heuristique volontairement simple, bornée à ce qu'un scanner portable peut observer depuis le seul contrat (il n'a pas accès à l'arbre du projet pour détecter un `tailwind.config.js`) — un pivot avec accès au projet entier (ex. `sc-js:design-bridge`) peut affiner la détection (présence de config Tailwind, absence totale de classes `.base` dans le code source) mais le champ explicite reste toujours prioritaire.

### Bloc `usage`

```json
"usage": {
  "rawHexForbidden": true,
  "colorUtilityPrefixes": ["bg", "text", "border", "ring"],
  "rules": [
    {
      "id": "state-colour-icon",
      "description": "Un badge d'état (success/warning/error/info) doit porter à la fois un token couleur ET une icône — jamais la couleur seule.",
      "enforcement": "pivot-only"
    }
  ]
}
```

| Champ | Requis | Description |
|-------|--------|-------------|
| `usage.rawHexForbidden` | non | `true` ⇒ `lint-core.mjs` interdit toute couleur hexadécimale brute (`#[0-9a-fA-F]{3,8}`) dans un attribut `style="…"` ou un bloc `<style>` inline. Absent/`false` = règle inactive. |
| `usage.colorUtilityPrefixes` | non | Liste des préfixes de classe utilitaire porteurs de couleur à vérifier (ex. `["bg", "text", "border", "ring"]` pour Tailwind — la liste elle-même n'est **jamais** codée en dur dans le linter, elle vient du contrat, par projet). Pour chaque classe `<prefix>-<segment>…`, le segment de tête doit correspondre à un groupe top-level déclaré sous `tokens.json § color.*` (ex. `brand`, `neutral`, `semantic`) — sinon violation. Actif uniquement en mode `utility-first`. |
| `usage.rules[]` | non | Règles **déclarées** dans le contrat mais dont l'enforcement n'est pas garanti par le string-scanner baseline (A4). Chaque entrée : `id`, `description`, `enforcement` (`"baseline"` si `lint-core.mjs` la porte réellement — `rawHexForbidden`/`colorUtilityPrefixes` en sont l'implémentation — ou `"pivot-only"` si elle nécessite un AST, ex. `state-colour-icon` : un statut doit apparier un token couleur ET une icône, co-occurrence sémantique hors de portée d'un scanner de chaînes). Le pivot (`sc-js:design-bridge`) lit ces entrées pour réaliser les règles `pivot-only` de façon idiomatique (ESLint) au lieu de les réinventer. |

**Namespaces de couleur** : jamais une liste écrite en dur dans `usage` — ils se dérivent à l'exécution des clés top-level de `tokens.json § color.*` (même principe "aucune valeur en dur" que le reste de `lint-core.mjs`). Ajouter un groupe de couleur au contrat (`color.accent`, par exemple) l'autorise immédiatement comme namespace utilitaire, sans toucher `usage`.

### Rétrocompatibilité

- Un manifeste BEM existant, sans `mode` ni `usage`, est **inchangé** : `lint-core.mjs` auto-détecte `bem` (composants non vides) et les Rules 3/4 restent inertes (`usage` absent). Aucune migration requise.
- Mode par défaut = `bem` ou auto-détecté selon la présence de `components` — jamais `utility-first` par surprise sur un contrat qui déclare des composants.

### Exemple de manifeste utility-first travaillé

```json
{
  "$schema": "design/references/manifest-schema#",
  "$version": "1.0.0",
  "mode": "utility-first",
  "usage": {
    "rawHexForbidden": true,
    "colorUtilityPrefixes": ["bg", "text", "border", "ring"],
    "rules": [
      {
        "id": "state-colour-icon",
        "description": "Un badge d'état doit porter un token couleur ET une icône — jamais la couleur seule.",
        "enforcement": "pivot-only"
      }
    ]
  }
}
```

Ici `components` est totalement absent (A5 : optionnel en utility-first) — le vocabulaire fermé du projet porte entièrement sur `usage`. Un projet en transition BEM → utility-first peut garder un `components` partiel (composants legacy) à côté de `usage` : les deux blocs sont additifs, jamais exclusifs.

## Invariants du manifeste

1. **Vocabulaire fermé** : toute classe CSS dérivée du design system doit correspondre à un `.base`, `.elements.*`, ou `.modifiers.*` dans le manifeste. Une classe non déclarée est une violation lint.
2. **Pas de doublons** : deux composants ne peuvent pas partager le même `.base`.
3. **Concordance couche 2 ↔ couche 3** : chaque composant listé dans `design-system.md § Inventaire des composants` doit avoir une entrée dans `components.json`, et vice-versa. `enforce` signale toute divergence.
4. **Backgrounds token-référencés** : les chemins dans `.backgrounds` doivent exister dans `design/tokens.json`. Un chemin mort est une violation lint.
5. **$version en phase avec design-system.md** : la version de `components.json` et la version de `design-system.md` doivent correspondre après chaque `adjust`.
6. **Contraste par thème** : pour une variante sombre (ex. `hero--dark`) dont `.backgrounds` liste un token qui a une valeur surchargée dans un thème (§ Modes / themes de `token-schema.md`), le contraste WCAG AA texte/fond est vérifié contre la valeur **résolue dans le thème concerné** — jamais contre la valeur `default` si le variant cible explicitement un autre thème (ex. `hero--dark` sous `[data-theme="grimoire"]` doit être vérifié avec `color.semantic.text`/`color.semantic.background` résolus dans `grimoire`, pas dans `default`). Cette vérification fait partie du processus `enforce` (lecture des valeurs de tokens résolues) — `lint-core.mjs` ne la porte pas : le scanner de chaînes vérifie uniquement le vocabulaire de classes et l'existence des références `var()`, il ne calcule aucun ratio de contraste.
7. **Concordance couche 2 ↔ code réel (retrofit)** : sur un projet dont du code (markup/composants) préexiste au figeage, `components.json` doit aussi concorder avec les classes/utilitaires **réellement présents** dans ce code — pas seulement avec la prose de `design-system.md` (Invariant 3, couche 2 ↔ couche 3, une concordance distincte). C'est une **précondition de figeage**, vérifiée par `adjust/02-freeze.md § Étape 2bis — Réconciliation avec le code réel (retrofit)`, mode-aware (dérivée de `mode` : vocabulaire BEM en `bem`, namespaces `usage` en `utility-first` — jamais un glob ou un jeu de règles codé en dur) et **toujours active** (always-on, auto-neutralisante sur greenfield : aucun code préexistant ⇒ scan vide ⇒ rien à réconcilier). Une divergence **code → manifeste** (classe/utility en code, absente du manifeste) est **bloquante** pour le figeage ; une divergence **manifeste → code** (entrée du manifeste jamais rencontrée dans le code) est un **warning + ledger optionnel**, jamais bloquante.

## Exemple complet

```json
{
  "$schema": "design/references/manifest-schema#",
  "$version": "1.2.0",
  "components": {
    "btn": {
      "base": "btn",
      "elements": {
        "icon": "btn__icon",
        "label": "btn__label"
      },
      "modifiers": {
        "primary":   "btn--primary",
        "secondary": "btn--secondary",
        "ghost":     "btn--ghost",
        "sm":        "btn--sm",
        "lg":        "btn--lg"
      },
      "backgrounds": [
        "color.semantic.background",
        "color.semantic.surface",
        "color.brand.primary"
      ],
      "a11y": {
        "role": "button",
        "requires": []
      }
    },
    "card": {
      "base": "card",
      "elements": {
        "media":   "card__media",
        "body":    "card__body",
        "title":   "card__title",
        "actions": "card__actions"
      },
      "modifiers": {
        "featured":  "card--featured",
        "horizontal":"card--horizontal"
      },
      "backgrounds": [
        "color.semantic.surface"
      ],
      "a11y": {
        "role": "article",
        "requires": ["aria-label"]
      }
    },
    "hero": {
      "base": "hero",
      "elements": {
        "eyebrow": "hero__eyebrow",
        "headline":"hero__headline",
        "body":    "hero__body",
        "cta":     "hero__cta",
        "media":   "hero__media"
      },
      "modifiers": {
        "dark":     "hero--dark",
        "centered": "hero--centered"
      },
      "backgrounds": [
        "color.semantic.background",
        "color.brand.primary",
        "color.neutral.900"
      ],
      "a11y": {
        "role": "banner",
        "requires": []
      }
    }
  }
}
```

## Hints oracle — champ `oracle` (optionnel)

Le champ `oracle` encode des métadonnées de mesure directement dans le manifeste. Il est **inerte pour `enforce`** (le linter l'ignore) et **lu uniquement par `adapters/measure/config-gen.py`** pour enrichir le config oracle généré.

| Champ | Description |
|-------|-------------|
| `oracle.elements.<elem>.check_text` | `true` sur les éléments dont le `textContent` doit correspondre à la maquette (eyebrow, CTA, libellé de stat, badge). Interdit sur les cibles en prose. |
| `oracle.elements.<elem>.props` | Surcharge la liste globale de props pour cet élément (ex. `["fontSize","color","letterSpacing"]`). Utile quand les props pertinentes diffèrent de la liste token-dérivée. |
| `oracle.collections[]` | Structures répétées à mesurer en séquence (P8/P12). Une entrée par structure répétitive : `{ "name": "…", "item_selector": "bem__elem" }`. |
| `oracle.collections[].ack` | Pré-sanction d'une divergence de contenu/métier attendue sur cette collection (P13) : `{ "id": "DEV-xxx", "reason": "…" }`. |

```json
"hero": {
  "base": "hero",
  "elements": {
    "eyebrow": "hero__eyebrow",
    "headline": "hero__headline",
    "cta":     "hero__cta"
  },
  "oracle": {
    "elements": {
      "eyebrow":  { "check_text": true, "props": ["fontSize", "color", "letterSpacing"] },
      "headline": { "check_text": true },
      "cta":      { "check_text": true }
    },
    "collections": [
      { "name": "Hero · stats", "item_selector": "hero__stat" }
    ]
  }
}
```

Les hints `oracle` évitent de décrire ces exigences à la main dans chaque config par page — `config-gen.py` les propage automatiquement. Si un élément n'a pas de hint, `config-gen` génère quand même un target pour lui, sans `check_text` et avec les props token-dérivées par défaut.

## Consommation par `enforce`

`enforce/adapters/lint-core.mjs` lit `design/components.json` et dérive, **en mode `bem`** (défaut, ou auto-détecté quand `components` est non vide) :

- **Ensemble de classes autorisées** : union de tous les `.base` + `.elements.*` + `.modifiers.*` → toute classe hors de cet ensemble est une violation `error`.
- **Règles de fond** : pour chaque composant avec `.backgrounds`, si ce composant apparaît dans un conteneur dont la couleur de fond ne correspond pas à un des tokens listés → violation `warning`. Le contraste WCAG AA d'une variante sombre est vérifié contre la valeur résolue **dans le thème du variant** (§ Invariant 6 ci-dessus), pas contre la valeur `default`.
- **Règles a11y** : si un composant avec `.a11y.role` est rendu sans l'attribut `role` correspondant ou sans les attributs `.a11y.requires` → violation `warning`.

Par défaut, une classe dont le bloc n'est pas déclaré est traitée comme utilitaire et ignorée silencieusement (angle mort documenté). Avec `node lint-core.mjs <file> [<dir>] --strict` : toute classe **de forme BEM** (contient `__` ou `--`) dont le bloc n'est pas déclaré devient un `warning` — sauf si elle matche un préfixe de `$utilityPrefixes` — pour attraper les typos de composant (`heor__title`) sans faux positif sur les classes utilitaires ordinaires (`flex`, `mt-4`).

**En mode `utility-first`** (explicite via `mode`, ou auto-détecté quand `components` est vide/absent), le vocabulaire de classes BEM ci-dessus ne s'exécute **jamais** (A6) ; `lint-core.mjs` dérive à la place du bloc `usage` :

- **Raw-hex interdit** : si `usage.rawHexForbidden` est `true`, toute couleur hexadécimale brute dans un `style="…"` ou un bloc `<style>` inline → violation `error`.
- **Namespaces de couleur autorisés** : pour chaque préfixe de `usage.colorUtilityPrefixes`, le segment de couleur de la classe doit correspondre à une clé top-level de `tokens.json § color.*` → violation `error` sinon.
- **`usage.rules[]` `pivot-only`** (ex. `state-colour-icon`) : non vérifiées par `lint-core.mjs` (hors de portée d'un string-scanner sans AST) — déclarées pour que le pivot (`sc-js:design-bridge`) les réalise nativement, cf. `references/sc-pivot-contract.md`.

## Déclenchement d'un re-figeage

Si `destructure` (rejouable à tout moment) identifie une direction incompatible avec le manifeste actuel (`coût contrat: demande un re-figeage`), le flux est :

1. `/design:adjust` rejoue l'arbitrage sur le delta (nouvelles pistes uniquement).
2. `02-freeze.md` met à jour `components.json` + bump version.
3. `enforce` propage et re-lint (réconciliation, absorbée dans l'entonnoir).
