# 02-wire-gates

## Rôle

Câbler les 3 gates du linter dans le projet : rules de génération, success_condition des plans, hook pre-commit auto-armé. Voir `enforce/references/gate-wiring.md` pour la spécification complète de chaque gate.

## Prérequis

`lint-core.mjs` installé dans le projet (`01-build-linter` terminé, gate vert ou violations documentées).

## Processus

### Étape 1 — Identifier le périmètre

Déterminer quels fichiers et templates sont concernés par le design system dans ce projet :
- Fichiers HTML (wireframes, templates, pages)
- Templates PHP/Twig/Blade/Nunjucks qui émettent du HTML
- Block patterns WordPress (HTML stocké en DB)

Documenter la liste dans le compte-rendu (utilisée par les gates 2 et 3).

### Étape 2 — Câbler Gate 1 (Rules de génération)

Selon le contexte du projet :

**Projet avec rules Claude Code** : créer ou compléter `.claude/rules/08-design/01-enforce.md` :

```markdown
## Design system gate

Avant de générer du HTML ou des classes CSS :
- Lire `design/components.json` — n'utiliser QUE les classes et tokens déclarés.
- Toute classe non déclarée dans le manifeste est une violation ; STOP avant de générer.
- Pour ajouter une classe : d'abord re-figer via `/design:adjust`, puis re-jouer `/design:enforce`.
```

**Projet sans rules Claude Code** : noter l'instruction dans le SKILL.md de `diffuse` (partie `requires:`).

### Étape 3 — Câbler Gate 2 (success_condition)

Pour chaque plan aidd-dev actif ou à créer qui touche du HTML, ajouter dans son frontmatter :

```yaml
success_condition: >
  node design/lint/lint-core.mjs <cibles>.html exits 0
```

Pour un plan multi-cibles :

```yaml
success_condition: >
  node design/lint/lint-core.mjs design/wireframes/hero.html exits 0
  AND node design/lint/lint-core.mjs design/wireframes/contact.html exits 0
```

### Étape 4 — Câbler Gate 3 (pre-commit)

Créer `scripts/hooks/pre-commit` avec le contenu de `enforce/references/gate-wiring.md § Gate 3`.

Rendre exécutable :
```bash
chmod +x scripts/hooks/pre-commit
```

Ajouter le `postinstall` dans `package.json` pour l'auto-armement.

Valider : modifier un fichier HTML avec une violation et vérifier que `git commit` est bloqué.

### Étape 5 — Versionner et documenter

1. Committer `scripts/hooks/pre-commit` et la mise à jour de `package.json`.
2. Documenter dans `design-system.md § Provenance` : "Gates enforce câblés le [date]".

## Sortie attendue

> Gates câblés :
> - Gate 1 (rules) : `.claude/rules/08-design/01-enforce.md` créé
> - Gate 2 (success_condition) : N plans mis à jour
> - Gate 3 (pre-commit) : `scripts/hooks/pre-commit` créé, `postinstall` ajouté
>
> Test Gate 3 : commit avec violation → bloqué ✓
