# Action 10 — mirror

Reçoit une image montrant deux navigateurs côte à côte (référence vs implémentation courante), identifie toutes les différences de texte et de style, puis les corrige en s'appuyant sur `design:copycat`.

Avec `--page`, enchaîne automatiquement plusieurs screenshots page par page.

## Context required

- **Image** — capture d'écran avec la référence (maquette ou navigateur de gauche) et l'implémentation (navigateur de droite), ou l'inverse. Fournir le chemin de fichier ou coller l'image directement.
- La référence est à gauche par défaut. Si l'ordre est inversé, l'indiquer en argument (`--ref right`).
- `--page <chemin>` — répétable. Fournir un screenshot par page à comparer. Les pages sont traitées dans l'ordre fourni.
- Accès au codebase de l'implémentation en lecture/écriture.

## Prompt

Execute the following workflow verbatim.

---

### Step -2 — Détection multi-page

Vérifier si `--page` est présent dans les arguments.

**Mode single (défaut)** : pas de `--page`. Continuer au Step -1 avec l'image fournie.

**Mode multi-page** : un ou plusieurs `--page <chemin>` fournis. `--page` force le **mode A** (analyse via copycat) — le routing mode B (Step 0) ne s'applique pas. Si des corrections verbales sont aussi décrites, les ignorer pour cette passe et le signaler. Dans ce cas :

1. Construire la file de pages dans l'ordre des arguments :
   ```
   Page 1 : <chemin1>
   Page 2 : <chemin2>
   …
   ```
2. Afficher la file et confirmer avant de démarrer :
   ```
   🪞 mirror — file multi-page
   N pages à traiter (traitement séquentiel, peut être long) : <liste>
   Côté référence : <gauche / droite>
   → Démarrage page 1…
   ```
3. Pour chaque page de la file, exécuter **les Steps -1, 1, 2, 3, 4, 4b, 5** (mode A, sans le branchement mode B du Step 0). Accumuler les résultats dans un registre global ; **chaque entrée du registre porte son numéro de page** (pour le préfixe `[Page X]` du rapport).
4. Ne passer à la page suivante qu'après avoir terminé et rapporté les corrections de la page courante (Step 6 abrégé par page).
5. Après la dernière page, émettre le **rapport global** (Step 6 étendu, voir format ci-dessous).

---

### Step -1 — Ancrage (gate obligatoire)

Avant toute analyse de la page courante, afficher un bloc de confirmation :

```
🪞 mirror — ancrage [page N/N si multi-page]

Référence      : <URL ou chemin identifié>
Implémentation : <URL ou chemin identifié>
Côté référence : <gauche / droite>
```

**Si l'une des deux sources n'est pas identifiable avec certitude depuis le contexte ou l'image :**
Arrêter et demander :
> "Quelles sont les deux sources à comparer ? (URL locale ou chemin de fichier pour chacune)"

En mode multi-page, distinguer deux niveaux :
- **Origine** (base de l'implémentation, ex. `http://localhost:3000`) — stable d'une page à l'autre, réutilisable sans re-demander.
- **URL/chemin de page** (ex. `/offres`, le screenshot de la page courante) — **ré-identifié à chaque itération**. Ne jamais réutiliser l'URL de page précédente comme ancrage de la page courante.

Ne pas continuer au Step 0 tant que les deux sources ne sont pas confirmées.

---

### Step 0 — Mode de déclenchement

Déterminer dans quel mode mirror est invoqué pour la page courante :

**Mode A — analyse initiale** : l'utilisateur fournit une image, aucun écart précis n'est encore décrit. Continuer au Step 1.

**Mode B — correction directe** : l'utilisateur décrit explicitement des écarts précis (texte ou propriétés CSS nommées, ex. "le fond de section est blanc crème", "les puces ont un fond bleu incorrect"). Dans ce cas :
- **Ne pas prendre de capture. Ne pas relancer d'analyse visuelle. Ne pas revisiter ce qui a déjà été analysé.**
- Traiter chaque écart décrit comme une entrée directe — les enregistrer avec `Type = correction-directe`.
- Si corrections texte uniquement → sauter au Step 2.
- Si corrections style uniquement → sauter au Step 4.
- Si corrections texte ET style → exécuter Step 2 puis Step 4 (les deux, dans l'ordre).

> **Règle absolue mode B** : si l'utilisateur a fourni l'information, elle fait autorité. Ne pas la re-vérifier visuellement ni relancer un outil pour confirmer ce qui a déjà été dit. Appliquer, puis rapporter.

---

### Step 1 — Inventaire de surface *(mode A uniquement)*

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

### Step 2 — Corrections texte *(mode A + mode B texte)*

Pour chaque différence de type `texte` ou `correction-directe` textuelle :

1. Localiser le fichier source (template, composant, import) contenant ce texte.
2. Appliquer la correction pour aligner sur la référence.
3. Afficher un résumé compact : `✅ Hero H1 — supprimé le point final`.

Si un texte présent dans l'implémentation est absent de la référence, le supprimer. Si absent de l'implémentation et présent dans la référence, l'ajouter à l'endroit logique.

---

### Step 3 — Invocation de design:copycat *(mode A)*

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

### Step 4b — Écarts layout *(mode A)*

Pour chaque finding de type `layout` inventorié au Step 1 (bloc absent, carte en trop, ordre visuel incorrect) :

1. **Écart simple** (bloc/élément manquant ou en surplus dans un template ou une boucle) → corriger directement la source (ajouter/retirer l'item, réordonner). Résumé : `✅ Offres / Carte 3 absente — ajoutée au template`.
2. **Écart structurel invasif** (refonte DOM, changement de composant) → ne pas tenter ; flaguer en écart résiduel avec la raison précise. Résumé : `⚠ Hero / structure 2 colonnes vs 1 — refonte manuelle requise`.

---

### Step 5 — Vérification (optionnelle, best-effort)

**Skippée immédiatement si** : Playwright MCP est indisponible, le navigateur est déjà ouvert et ne répond pas à la première tentative de navigation, ou l'utilisateur n'a pas demandé de vérification visuelle.

Ne pas reprendre de capture pour confirmer un écart que l'utilisateur a déjà décrit explicitement.

Si les conditions sont réunies (URL locale servie, Playwright disponible, navigateur répond) :
1. Tenter une seule navigation vers l'URL de l'implémentation. En cas d'échec ou de blocage → passer au Step 6 sans retry.
2. Prendre une capture à viewport identique.
3. Signaler uniquement les écarts résiduels non encore traités.

---

### Step 6 — Rapport

**Par page (mode multi-page)** — afficher après chaque page avant de passer à la suivante :

```
🪞 mirror — page N/N : <nom de la page>

Différences texte   : N trouvées — N corrigées
Différences style   : N trouvées — N corrigées
Différences layout  : N trouvées — N corrigées, N manuelles (invasives)

Corrections : <liste compacte ✅>
Résiduels   : <liste compacte ⚠ ou "aucun">

→ Passage à la page suivante…
```

**Rapport global (fin du mode multi-page ou mode single)** :

```
🪞 mirror — rapport [global si multi-page]

Pages traitées  : N  (liste des noms)
Côté référence  : <gauche / droite>
Mode            : <analyse initiale / correction directe>

Différences texte   : N total — N corrigées
Différences style   : N total — N corrigées
Différences layout  : N total — N corrigées, N manuelles (invasives)

Corrections appliquées :
  ✅ [Page X] <section> / <propriété> — <avant> → <après>
  …

Écarts résiduels (non corrigés) :
  ⚠ [Page X] <raison> — action recommandée
  …
```
