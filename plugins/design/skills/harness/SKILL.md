---
name: harness
description: >
  Génère un fichier HTML autonome (harness de maquette) exposant window.setPage(key) /
  window.setViewport(mode). Piloté par l'oracle de fidélité (measure.py) et le fan-out copycat.
  Par défaut : une page placeholder "page-1". Pages configurables via --pages / --pages-json.
triggers:
  - "génère le harness"
  - "crée la maquette de référence"
  - "exporte le harness"
  - "prépare le fichier de maquette"
  - "initialise le harness"
requires:
  - "un chemin de sortie (--out)"
references:
  - adapters/harness/harness.py
---

# harness

## Rôle dans l'entonnoir

```
define → destructure → adjust (figé) → enforce → diffuse
                                            ↓
                                         harness  ← point d'entrée de la maquette de référence
                                            ↓
                                       copycat / measure
```

`harness` est le point d'entrée de la maquette. Il génère le fichier HTML que `measure.py` et l'agent `copycat` vont piloter pour la comparaison de fidélité.

## Ce que harness produit

Un fichier HTML **autonome** (aucun serveur requis pour l'aperçu) exposant :

| Export JS | Rôle |
|-----------|------|
| `window.setPage(key)` | Charger une page dans `#page-container` |
| `window.setViewport(mode)` | Basculer le cadre device (`desktop` / `tablet` / `mobile`) |

Et une barre `.preview-bar` (masquée par l'oracle avant la mesure) avec :
- Sélecteur de pages (dropdown, optgroups supportés)
- Boutons device : **Desktop** (fluide) · **Tablette** (834 px) · **Mobile** (390 px)

## Paramètres

| Paramètre | Défaut | Description |
|-----------|--------|-------------|
| `--out` | *(requis)* | Chemin du fichier HTML de sortie |
| `--title` | `"Maquette"` | Titre du projet (affiché dans la barre et le `<title>`) |
| `--pages` | `"page-1:Page 1"` | Pages au format `"key:Label, key2:Label 2"` |
| `--pages-json` | — | Chemin vers un JSON `[{key, label, group?}]` ou `{pages:[...]}` |

### Exemple — invocation minimale

```bash
python "${CLAUDE_PLUGIN_ROOT}/adapters/harness/harness.py" --out maquette.html
```

### Exemple — pages multiples

```bash
python "${CLAUDE_PLUGIN_ROOT}/adapters/harness/harness.py" \
  --out maquette.html \
  --title "Mon Projet" \
  --pages "accueil:Accueil, services:Services, contact:Contact"
```

### Exemple — via fichier JSON (avec optgroups)

```bash
python "${CLAUDE_PLUGIN_ROOT}/adapters/harness/harness.py" \
  --out maquette.html \
  --title "Mon Projet" \
  --pages-json pages.json
```

Format `pages.json` :

```json
[
  {"key": "accueil", "label": "Accueil"},
  {"key": "services", "label": "Services", "group": "Offres"},
  {"key": "contact", "label": "Contact"}
]
```

## Flux d'exécution

1. Résoudre les pages (--pages, --pages-json, ou défaut `page-1`).
2. Générer le HTML depuis le template (`adapters/harness/harness.py`).
3. Écrire le fichier `--out` (crée les dossiers parents si nécessaire).
4. Optionnel : ouvrir dans un navigateur pour vérifier le sélecteur et les boutons device.

## Contrat du fichier généré

### Responsive

Les variations de rendu device s'écrivent **en classe** dans le `<style>` du `<head>` :

```css
.preview-frame.mobile .hero__title  { font-size: 28px; }
.preview-frame.tablet .hero__inner  { grid-template-columns: 1fr; }
```

Les classes basculent au clic des boutons device (aperçu manuel) **et** sous l'oracle (qui appelle `setViewport` après avoir mis la fenêtre au breakpoint réel). `@media` fonctionne aussi pour la mesure oracle mais pas pour l'aperçu manuel (le cadre est plus petit que la fenêtre).

### Pages (registre JS)

Chaque page est une **fonction** retournant le HTML de la page :

```js
function pageAccueil() {
  return `
    <header class="site-header">…</header>
    <main>…</main>
    <footer class="site-footer">…</footer>
  `;
}
```

Le HTML retourné est injecté dans `#page-container`. **Ne pas** inclure `<html>/<head>/<body>` ni `<style>` global dans la fonction — les styles vont dans le `<style>` du `<head>`.

### Invariants oracle

- Sélecteurs **stables et sémantiques** (BEM : `.hero__title`, `.card__price`) — l'oracle mesure par sélecteur CSS. Ne pas renommer entre pages.
- **Un seul `h1`** par page + hiérarchie `h2/h3` par section (scan de complétude oracle).
- **Ne pas modifier** `.preview-bar` ni les `<script>` de contrôle.
- URLs **absolues** ou `data:` (ressources : images, fonts — fichier servi en statique).

## Ce que harness NE fait PAS

- Harness ne remplit pas les pages (→ LLM guidé par le prompt en tête du fichier généré).
- Harness ne mesure pas la fidélité (→ `enforce/05-fidelity-gate` + `adapters/measure/measure.py`).
- Harness ne modifie pas le contrat tokens/components (→ `adjust`).

## Références

- `adapters/harness/harness.py` — générateur (stdlib Python uniquement, aucune dépendance)
- `adapters/measure/measure.py` — oracle de fidélité (pilote `setPage` / `setViewport`)
- `agents/copycat.md` — agent de réconciliation maquette→contrat
- `enforce/05-fidelity-gate` — gate de fidélité (mesure vs maquette résolue)
