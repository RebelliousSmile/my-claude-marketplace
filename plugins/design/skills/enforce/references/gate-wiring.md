# Gate wiring — les 4 points de câblage

`enforce` câble le linter à 4 endroits dans le projet. Chaque point est indépendant ; il est possible de n'en câbler qu'un sous-ensemble selon le workflow du projet.

---

## Gate 0 — Import de `tokens.css` dans l'app réelle

**Quand** : une fois, dès qu'`adjust` a figé le contrat et que `design/adapters/tokens.css` existe.

**Problème résolu** : sans ce point, `tokens.css` reste un artefact orphelin — l'app garde ses propres `:root` inline ou ses variables ad hoc, qui dérivent silencieusement de `tokens.json`. Aucun des gates 1-3 ne détecte cette dérive : ils lintent l'usage des classes/tokens *dans le HTML produit*, pas la présence de la source unique dans l'app.

**Câblage** : importer `design/adapters/tokens.css` (et `theme.css`/l'extend Tailwind si présent) comme **premier** stylesheet chargé par l'app — avant toute feuille de style applicative — et supprimer toute déclaration `:root` concurrente. Selon la stack :
- Statique/vanilla : `<link rel="stylesheet" href="design/adapters/tokens.css">` en tête de `<head>`.
- Build tool (Vite/Nuxt/Next…) : import au point d'entrée CSS global (ex. `main.css` avec `@import`).
- WordPress : enqueue en dépendance de tout autre style du thème (cf. `sc-php:design-bridge`).

**Qui pose ce câblage** : `adjust/02-freeze` (à la première écriture du contrat) ou `enforce/01-build-linter` (si le contrat existe déjà sans que l'import soit câblé) — signaler l'absence de câblage comme un finding si l'app a son propre `:root`/variables concurrentes.

---

## Gate 1 — Rules de génération

**Quand** : tout verbe qui produit du HTML ou du code consommant les classes du design system (`diffuse`, exports WordPress, génération de block patterns…).

**Câblage** : les rules Claude Code du projet ou les gabarits de génération incluent une instruction explicite :

```
Avant de générer tout élément HTML ou block pattern :
1. Lire design/components.json — n'utiliser que les classes et tokens déclarés.
2. Vérifier mentalement que chaque classe produite est dans le manifeste.
3. Si une classe manque dans le manifeste → STOP, ne pas générer ; signaler la violation.
```

**Artefact** : ajouter cette règle dans `.claude/rules/08-design/` du projet consommateur (si le projet utilise des rules Claude Code) ou dans le SKILL.md de `diffuse`.

---

## Gate 2 — `success_condition` des plans

**Quand** : tout plan aidd-dev qui touche du HTML, des templates, ou du CSS lié au design system.

**Câblage** : ajouter dans le frontmatter du plan :

```yaml
success_condition: >
  node design/lint/lint-core.mjs <cible>.html exits 0
```

**Exemple concret** :

```yaml
success_condition: >
  node design/lint/lint-core.mjs design/wireframes/hero.html exits 0
  AND node design/lint/lint-core.mjs design/wireframes/contact.html exits 0
```

Le plan est bloqué (statut `blocked`) tant que le gate est rouge. C'est la même mécanique que les tests unitaires dans un plan d'implémentation.

---

## Gate 3 — Hook pre-commit

**Quand** : tout commit dans le dépôt qui modifie des fichiers HTML, des templates, ou du CSS.

**Câblage en deux temps** :

### 3a — Créer le hook

Créer `scripts/hooks/pre-commit` à la racine du projet :

```bash
#!/bin/sh
# Lint design system — gate pre-commit
# Abort commit if any design violation found.

CHANGED_MARKUP=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(html|astro|vue|jsx|tsx|svelte)$')

if [ -z "$CHANGED_MARKUP" ]; then
  exit 0
fi

echo "[design lint] Checking staged component files..."
FAIL=0
for f in $CHANGED_MARKUP; do
  node design/lint/lint-core.mjs "$f" || FAIL=1
done

if [ "$FAIL" = "1" ]; then
  echo "[design lint] FAIL — fix violations before committing."
  exit 1
fi
```

Rendre exécutable : `chmod +x scripts/hooks/pre-commit`

### 3b — Auto-armer via `core.hooksPath` + postinstall

Pour que le hook soit partagé et s'installe automatiquement :

**Dans `.gitconfig` du projet (ou commande une fois par contributeur) :**

```bash
git config core.hooksPath scripts/hooks
```

**Pour automatiser à chaque `npm install` / `pnpm install`, dans `package.json` :**

```json
{
  "scripts": {
    "postinstall": "git config core.hooksPath scripts/hooks"
  }
}
```

Ainsi, tout contributeur qui installe les dépendances arme automatiquement le hook.

### 3c — Versionnement

`scripts/hooks/pre-commit` est versionné dans le dépôt (committer ce fichier). `core.hooksPath` est positionné via `postinstall` (aucune manipulation manuelle requise).

---

## Résumé des artefacts à créer

| Gate | Artefact | Emplacement |
|------|----------|-------------|
| 0 — Import | `<link>`/`@import`/enqueue de `tokens.css` en tête, `:root` concurrents supprimés | App consommatrice |
| 1 — Rules | Instruction dans `.claude/rules/08-design/` ou `diffuse/SKILL.md` | Projet consommateur |
| 2 — success_condition | Frontmatter des plans concernés | Plans aidd-dev |
| 3 — pre-commit | `scripts/hooks/pre-commit` | Racine projet (versionné) |
| 3 — auto-armer | `postinstall` dans `package.json` | Racine projet |
| 3 — config | `git config core.hooksPath scripts/hooks` | Une fois par poste |
