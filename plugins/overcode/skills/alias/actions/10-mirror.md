# Action 10 — mirror

Reçoit une image montrant deux navigateurs côte à côte (référence vs implémentation courante), identifie toutes les différences de texte et de style, puis les corrige en s'appuyant sur `design:copycat`.

## Context required

- **Image** — capture d'écran avec la référence (maquette ou navigateur de gauche) et l'implémentation (navigateur de droite), ou l'inverse. Fournir le chemin de fichier ou coller l'image directement.
- La référence est à gauche par défaut. Si l'ordre est inversé, l'indiquer en argument (`--ref right`).
- Accès au codebase de l'implémentation en lecture/écriture.

## Prompt

Execute the following workflow verbatim.

---

### Step 0 — Identifier les côtés

Lire l'image fournie en argument.

Déterminer : quel côté est la **référence** (maquette / attendu) et quel côté est l'**implémentation** (état actuel). Par défaut, gauche = référence, droite = implémentation. Si `--ref right` est passé, inverser.

Identifier le contexte de la page (titre, URL visible, section en cours) pour centrer l'analyse.

---

### Step 1 — Inventaire des différences

Parcourir l'image section par section (de haut en bas). Pour chaque bloc visible, produire un tableau de différences structuré :

```
| Section     | Propriété        | Référence              | Implémentation         | Type   |
|-------------|------------------|------------------------|------------------------|--------|
| Hero        | Titre H1         | "Construire ensemble"  | "Construire ensemble." | texte  |
| Hero        | Sous-titre       | absent                 | "Lorem ipsum…"         | texte  |
| Hero        | bg-color         | #1A1A2E                | #1B1C30                | style  |
| Offres      | font-size titre  | 32px                   | 28px                   | style  |
| Offres      | gap entre cartes | 24px                   | 16px                   | style  |
```

Types : `texte` (contenu ou hiérarchie), `style` (couleur, typographie, espacement, layout), `layout` (structure DOM ou ordre visuel).

**Ne pas corriger à cette étape — inventorier seulement.**

---

### Step 2 — Corrections texte

Pour chaque différence de type `texte` :

1. Localiser le fichier source (template, composant, import) contenant ce texte.
2. Appliquer la correction pour aligner sur la référence.
3. Afficher un résumé compact : `✅ Hero H1 — supprimé le point final`.

Si un texte présent dans l'implémentation est absent de la référence, le supprimer. Si absent de l'implémentation et présent dans la référence, l'ajouter à l'endroit logique.

---

### Step 3 — Analyse style via copycat

Pour les différences de type `style` et `layout`, invoquer `/design:copycat` en lui fournissant :
- L'image complète (ou le crop du côté référence si possible).
- La liste des propriétés divergentes issue du Step 1.

`copycat` produit le fragment de correspondance token/composant/charte. Lire sa sortie attentivement.

Si `design:copycat` n'est pas disponible (skill absent ou contexte insuffisant), faire l'analyse manuellement : pour chaque propriété divergente, identifier le token design ou la règle CSS à ajuster dans le codebase.

---

### Step 4 — Corrections style

Appliquer les corrections issues de `copycat` (ou de l'analyse manuelle) :

1. Pour un token divergent : mettre à jour la valeur du token dans le fichier de design tokens.
2. Pour une règle CSS locale : mettre à jour la règle dans le fichier de style du composant.
3. Pour un écart de spacing : ajuster la variable ou la classe utilitaire concernée.

Appliquer dans l'ordre : tokens globaux → composants → overrides locaux.

Résumé après chaque correction : `✅ Offres / font-size titre — 28px → 32px (--font-size-heading-md)`.

---

### Step 5 — Vérification (si MCP Playwright disponible)

Si le navigateur MCP est disponible et l'implémentation est servie localement :

1. Prendre une capture de la page courante à viewport identique.
2. Comparer visuellement avec le côté référence de l'image initiale.
3. Signaler tout écart résiduel non corrigé.

Si Playwright n'est pas disponible, lister les vérifications à faire manuellement.

---

### Step 6 — Rapport final

```
🪞 mirror — rapport

Page : <contexte identifié>
Côté référence : <gauche / droite>

Différences texte   : N trouvées — N corrigées
Différences style   : N trouvées — N corrigées
Différences layout  : N trouvées — N à corriger manuellement (trop invasif)

Corrections appliquées :
  ✅ <section> / <propriété> — <avant> → <après>
  …

Écarts résiduels (non corrigés) :
  ⚠ <raison> — action recommandée
  …
```
