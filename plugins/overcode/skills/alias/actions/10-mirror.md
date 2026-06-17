# Action 10 — mirror

Reçoit une image montrant deux navigateurs côte à côte (référence vs implémentation courante), identifie toutes les différences de texte et de style, puis les corrige en s'appuyant sur `design:copycat`.

## Context required

- **Image** — capture d'écran avec la référence (maquette ou navigateur de gauche) et l'implémentation (navigateur de droite), ou l'inverse. Fournir le chemin de fichier ou coller l'image directement.
- La référence est à gauche par défaut. Si l'ordre est inversé, l'indiquer en argument (`--ref right`).
- Accès au codebase de l'implémentation en lecture/écriture.

## Prompt

Execute the following workflow verbatim.

---

### Step -1 — Ancrage (gate obligatoire)

Avant toute analyse, afficher un bloc de confirmation :

```
🪞 mirror — ancrage

Référence      : <URL ou chemin identifié — ex. http://localhost:8080/page, /maquettes/home.png>
Implémentation : <URL ou chemin identifié — ex. http://localhost:3000/page>
Côté référence : <gauche / droite>
```

**Si l'une des deux sources n'est pas identifiable avec certitude depuis le contexte ou l'image :**
Arrêter immédiatement et demander :
> "Quelles sont les deux sources à comparer ? (URL locale ou chemin de fichier pour chacune)"

Ne pas continuer au Step 0 tant que les deux sources ne sont pas confirmées.

---

### Step 0 — Mode de déclenchement

Déterminer dans quel mode mirror est invoqué :

**Mode A — analyse initiale** : l'utilisateur fournit une image, aucun écart précis n'est encore décrit. Continuer au Step 1.

**Mode B — correction directe** : l'utilisateur décrit explicitement des écarts précis (texte ou propriétés CSS nommées, ex. "le fond de section est blanc crème", "les puces ont un fond bleu incorrect"). Dans ce cas :
- **Ne pas prendre de capture. Ne pas relancer d'analyse visuelle. Ne pas revisiter ce qui a déjà été analysé.**
- Traiter chaque écart décrit comme une entrée directe — les enregistrer avec `Type = correction-directe`.
- Si corrections texte uniquement → sauter au Step 2.
- Si corrections style uniquement → sauter au Step 4.
- Si corrections texte ET style → exécuter Step 2 puis Step 4 (les deux, dans l'ordre).

> **Règle absolue mode B** : si l'utilisateur a fourni l'information, elle fait autorité. Ne pas la re-vérifier visuellement ni relancer un outil pour confirmer ce qui a déjà été dit. Appliquer, puis rapporter.

---

### Step 1 — Inventaire de surface (mode A uniquement)

Parcourir l'image section par section pour repérer les différences évidentes : texte manquant ou erroné, blocs absents, ordre visuel incorrect.

```
| Section | Propriété         | Référence       | Implémentation  | Type   |
|---------|-------------------|-----------------|-----------------|--------|
| Hero    | Titre H1          | "Titre exact"   | "Titre erroné"  | texte  |
| Offres  | Carte 3           | présente        | absente         | layout |
```

Types : `texte` (contenu), `layout` (structure visible). **Ne pas analyser les styles ici — c'est le rôle de `copycat` au Step 3.**

**Ne pas corriger à cette étape — inventorier seulement.**

---

### Step 2 — Corrections texte

Pour chaque différence de type `texte` ou `correction-directe` textuelle :

1. Localiser le fichier source (template, composant, import) contenant ce texte.
2. Appliquer la correction pour aligner sur la référence.
3. Afficher un résumé compact : `✅ Hero H1 — supprimé le point final`.

Si un texte présent dans l'implémentation est absent de la référence, le supprimer. Si absent de l'implémentation et présent dans la référence, l'ajouter à l'endroit logique.

---

### Step 3 — Invocation de design:copycat

Invoquer `/design:copycat` avec le prompt structuré suivant, en substituant les variables contextuelles :

---

> **Page analysée** : `<nom de la page / URL référence>`
> **Image fournie** : `<chemin ou image collée>` — côté gauche = référence, côté droit = implémentation (ou inverse si `--ref right`).
>
> Analyser la page section par section. Pour chaque section, relever **toute propriété visuellement perceptible qui diffère** entre la référence et l'implémentation — sans se limiter à une liste prédéfinie.
>
> Points fréquemment manqués à vérifier explicitement (non exhaustifs) :
> - Fond appliqué sur la **section entière** vs fond sur un composant ou un élément enfant (ne pas les confondre)
> - Fond des éléments inline souvent ignorés : puces, badges, chips, tags, icônes cerclées
> - Couleur d'emphase / accent sur un mot, une stat, un CTA
> - Espacement à l'échelle section (padding-block) vs espacement interne entre composants
>
> Pour chaque propriété divergente, retourner le tableau de correspondance token/composant/charte avec :
> - valeur dans la référence
> - valeur dans l'implémentation
> - token ou règle CSS candidate
> - statut : conforme / divergent / à créer

---

Lire la sortie de `copycat` attentivement avant de passer au Step 4.

Si `/design:copycat` est indisponible : pour chaque propriété divergente du tableau Step 1, identifier manuellement le token ou la règle CSS dans le codebase et noter la correction à appliquer en Step 4.

---

### Step 4 — Corrections style *(mode A + mode B style)*

Appliquer chaque correction issue de la sortie `copycat` (ou des écarts décrits explicitement en mode B) :

1. Token divergent → mettre à jour la valeur dans le fichier de design tokens.
2. Règle CSS locale → mettre à jour le sélecteur ou la valeur dans le fichier du composant.
3. Écart de spacing → ajuster la variable ou la classe utilitaire concernée.

Appliquer dans l'ordre : tokens globaux → composants → overrides locaux.

Résumé après chaque correction : `✅ Offres / section background-color — #FFFFFF → #F5F0EB (--color-surface-soft)`.

---

### Step 5 — Vérification (si MCP Playwright disponible)

**Seulement si les sources sont des URLs servies localement et que l'analyse n'a pas déjà été faite dans cette session.**

Ne pas reprendre de capture pour confirmer un écart que l'utilisateur a déjà décrit explicitement.

Si le navigateur MCP est disponible :
1. Prendre une capture de l'implémentation après corrections, à viewport identique.
2. Comparer avec le côté référence de l'image initiale.
3. Signaler uniquement les écarts résiduels non encore traités.

Si Playwright n'est pas disponible, lister les vérifications à faire manuellement.

---

### Step 6 — Rapport final

```
🪞 mirror — rapport

Page : <contexte identifié>
Côté référence : <gauche / droite>
Mode : <analyse initiale / correction directe>

Différences texte   : N trouvées — N corrigées
Différences style   : N trouvées — N corrigées
Différences layout  : N trouvées — N à corriger manuellement (trop invasif)

Corrections appliquées :
  ✅ <section> / <niveau> / <propriété> — <avant> → <après>
  …

Écarts résiduels (non corrigés) :
  ⚠ <raison> — action recommandée
  …
```
