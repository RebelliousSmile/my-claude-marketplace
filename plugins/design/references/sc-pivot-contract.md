# Contrat de pivot — design ↔ sc-\<techno\>

Interface partagée entre `design:enforce` / `design:diffuse` (émetteurs) et `sc-<techno>:design-bridge` (réceptacles). Fige le format du spec d'enforcement et du spec de rendu, et ce que le réceptacle doit renvoyer.

Réutilise l'idiome de relais existant du dépôt (cf `sc-tiers:setup help` et `sc-*:sniff` → `.claude/rules/07-quality`).

---

## Pourquoi un contrat de pivot

Le design garde le **QUOI** (le contrat : tokens + manifeste = autorité). Les `sc-<techno>` font le **COMMENT** (linter réel idiomatique + wiring natif + rendu). Ce contrat est l'interface qui les découple : `enforce` et `diffuse` n'ont pas besoin de connaître les détails de PHP_CodeSniffer ou ESLint ; `sc-<techno>:design-bridge` n'a pas besoin de savoir comment le manifeste a été produit.

---

## Spec d'enforcement (enforce → design-bridge)

`enforce/04-pivot.md` émet ce spec en contexte (pas dans un fichier) quand un `sc-<techno>` est détecté.

```
## Design enforcement spec

Source: design/tokens.json + design/components.json
Version: <$version du manifest>
Themes: [liste plate des thèmes nommés déclarés sous `tokens.json` § `themes`, ex. default, dark, grimoire — vide si aucun `themes` overlay]

### Valid class sets
Base classes: [liste des .base]
All valid classes: [union de tous .base + .elements.* + .modifiers.*]

### Token paths
All token paths: [liste des chemins de tokens.json aplatis]

### a11y requirements
[Par composant avec .a11y.requires non vide]
- <component>: role=<role>, requires=[<attr>, ...]

### Enforcement target
Language: <php | js | css | html>
Targets: [globs de fichiers à linter]

### Request
Réalise un linter natif idiomatique pour <techno> qui vérifie :
1. Toute classe appartenant au design system utilise un nom déclaré dans valid class sets.
2. Les références de tokens CSS (var(--...)) pointent vers un path existant.
3. Les composants déclarant .a11y.requires portent les attributs requis.
4. Si Themes n'est pas vide, le linter natif reste theme-agnostique (§ A2 : les thèmes re-déclarent les mêmes noms de `--var` dans leur bloc de sélecteur — aucune règle par thème à générer côté vocabulaire).

Retourne : le linter installé dans le projet + les instructions de câblage dans l'outillage natif.
```

---

## Spec de rendu (diffuse → design-bridge)

`diffuse/04-pivot.md` émet ce spec quand un `sc-<techno>` est détecté.

```
## Design render spec

Source: design/tokens.json + design/components.json
Version: <$version du manifest>
Themes: [liste plate des thèmes nommés déclarés sous `tokens.json` § `themes`, ex. default, dark, grimoire — vide si aucun `themes` overlay]

### Component to render
Name: <canonical-name>
Base: <.base>
Elements: <map>
Modifiers: <map>
Backgrounds: <liste>
a11y: <.a11y>

### Variants to produce
[Liste des variantes demandées ou "toutes"]

### Render target
Language: <php-fse-block | vue | react | html-css>
Output dir: <chemin souhaité dans le projet>

### Request
Produit le composant en code idiomatique <techno> :
- N'utilise que les classes et tokens du manifeste.
- Consomme design/adapters/tokens.css pour les valeurs.
- Satisfait les attributs .a11y.requires.
- Si Themes n'est pas vide, le composant natif doit rester compatible avec les blocs `.dark`/`[data-theme="…"]` émis par l'adaptateur (aucune valeur en dur qui court-circuiterait la cascade thème).
- Passe le gate enforce (lint-core.mjs sur la sortie générée = exit 0).

Retourne : le fichier composant + les instructions d'intégration dans le projet.
```

---

## Ce que le réceptacle doit renvoyer

`sc-<techno>:design-bridge` doit retourner :

| Pour enforcement | Pour rendu |
|-----------------|------------|
| Linter installé dans l'outillage natif du projet (ESLint config, PHP_CodeSniffer ruleset…) | Fichier composant créé à l'Output dir |
| Instructions de câblage dans le workflow existant (pre-commit, CI) | Instructions d'intégration (import, registration, usage) |
| Confirmation que les règles dérivent du spec (pas de listes codées en dur) | Confirmation que le composant passe `lint-core.mjs` (exit 0) |

---

## Dégradation gracieuse

Si aucun `sc-<techno>` ne couvre le langage du projet :
- `enforce` reste sur la baseline `lint-core.mjs` et le signale clairement.
- `diffuse` reste sur le rendu HTML+CSS baseline et le signale clairement.
- Aucune erreur bloquante — le contrat est toujours l'autorité, seule la réalisation idiomatique est absente.

---

## Stack mapping

| Stack projet détectée | sc-* à appeler |
|----------------------|---------------|
| PHP (WordPress FSE, Laravel Blade…) | `sc-php:design-bridge` |
| JavaScript/TypeScript (Vue, React, Vanilla) | `sc-js:design-bridge` |
| Python | `sc-python:design-bridge` (non encore implémenté) |
| Rust | `sc-rust:design-bridge` (non encore implémenté) |
| Autre / inconnu | Baseline uniquement |
