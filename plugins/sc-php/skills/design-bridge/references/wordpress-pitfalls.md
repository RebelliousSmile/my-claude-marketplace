# WordPress FSE — pièges partagés

Track: WP-maquette exclusivement. Référencé uniquement depuis le track WP de `enforce` (§ Track:
WP-maquette de `enforce/actions/03-lint-instances.md`) et de `diffuse`. Un projet app-JS-modern
n'a jamais besoin d'ouvrir ce fichier — ces pièges sont spécifiques à WordPress FSE et n'ont pas
d'équivalent SPA/from-code.

Référence partagée entre `enforce` et `diffuse`. Ces pièges s'appliquent à tout projet WordPress FSE utilisant le design system.

---

## Piège 1 : Classes appariées `has-background` / `has-text-color`

**Symptôme** : Gutenberg génère automatiquement des classes en paires obligatoires lors de l'application d'une couleur via l'éditeur :
- Fond : `has-<slug>-background-color` + `has-background`
- Texte : `has-<slug>-color` + `has-text-color`

Si ces classes ne sont pas dans le manifeste, `lint-core.mjs` les signale comme violations.

**Solution recommandée** : déclarer les composants natifs WP (wp-block-*) dans `components.json` avec leurs modifiers has-*. Alternativement, configurer `lint-core.mjs` pour exclure les blocs natifs `wp-block-*` du lint de vocabulaire (ils ne font pas partie du design system custom).

**À ne pas faire** : ignorer les violations sans documenter la décision.

---

## Piège 2 : Block patterns = copies indépendantes

**Symptôme** : un block pattern corrigé dans sa source ne met pas à jour les pages qui l'utilisent — chaque insertion est une copie dans `wp_posts.post_content`.

**Règle** : après correction d'un block pattern, toujours réimporter via le script d'import du projet (`tools/import/`). Ne jamais corriger uniquement en DB ; la source fait foi.

**Lint** : linter le pattern source ET au moins une page qui l'utilise pour vérifier la propagation.

**Même mécanique sur les templates** : dès qu'un template est sauvegardé depuis l'éditeur de site,
WordPress en écrit une copie en base (`wp_template`) qui **prend le pas sur le fichier du thème** —
pattern inséré aplati compris. Le fichier corrigé ensuite ne change plus rien à l'écran, sans erreur ni
avertissement. Le diagnostic est une question, pas une inspection du fichier : ce template existe-t-il en
base ?

**En amont des deux** : un pattern qui n'a jamais été posé n'a rien à propager. Voir `02-render`
§ Étape 5 — la pose est une étape, et « non posé » un statut à déclarer.

---

## Piège 3 : `wp eval-file` deprecated en PHP 8.2

**Symptôme** : `wp eval-file script.php` émet un avertissement de dépréciation PHP 8.2 qui pollue ou supprime stdout.

**Solution** :

```bash
# ❌
wp eval-file tools/import/script.php

# ✅
pnpm wp eval \
  '$c = file_get_contents("/var/www/html/tools/import/script.php"); eval($c);'
```

---

## Piège 4 : CLI local vs CLI conteneur

**Symptôme** : `wp post get` retourne des données d'une DB distincte de ce que le navigateur affiche.

**Règle absolue** : toujours utiliser `pnpm wp`, le wrapper qui pose `COMPOSE_PROJECT_NAME` avant
d'appeler wp-env. Jamais `php wp-cli.phar`, `wp` local ni une commande wp-env nue.

---

## Piège 5 : NFC/NFD sur Windows (noms de fichiers accentués)

**Symptôme** : `existsSync('design/fondations.html')` retourne `false` sur Windows alors que le fichier existe, si le nom a été créé sur macOS (NFD).

**Solution** : dans les scripts Node.js qui vérifient l'existence de fichiers, normaliser le chemin en NFC :

```js
import { normalize } from 'path';
const normalizedPath = normalize(filePath).normalize('NFC');
```

Ou utiliser une fonction `resolveFile()` centralisée qui applique la normalisation.

---

## Piège 6 : Navigation FSE — `__unstableLocation` ignoré dans WP 7+

**Symptôme** : les menus de navigation ne s'affichent pas ; `__unstableLocation` est ignoré et le fallback `wp:page-list` prend le dessus.

**Solution** : créer les posts `wp_navigation` via un script PHP (`tools/import/12-nav-posts.php`) et les référencer par `ref:ID` dans les templates HTML. Les IDs changent entre local et prod — relancer le script après tout import DB en prod.

---

## Piège 7 : `theme.json` = source des tokens WP

**Pour `enforce`** : les tokens WP (palette, typographie) viennent de `theme.json`, pas de CSS inline. Le lint doit vérifier la cohérence entre `design/tokens.json` (source design) et `theme.json` (source WP). Toute divergence est une violation.

**Pour `diffuse`** : les block patterns et templates WP consomment les tokens via `theme.json` + les classes générées par Gutenberg (pas via `adapters/tokens.css` directement). L'adaptateur WP de `diffuse` doit en tenir compte.

L'adaptation couvre `color.*`, `font.size.*` et `space.*` via
`tools/theme-json-adapter.mjs`. Son marqueur `settings.custom.design.designTokenPresets` est la seule
frontière qu'il peut remplacer : les presets et les sections humaines restent intacts. Un slug humain en
collision est une erreur, pas une autorisation implicite d'écraser. Un overlay nommé est appliqué avec
`--token-theme` et ses alias sont résolus après fusion avec la base. Toujours prévisualiser sans
`--write`, puis rejouer après écriture pour prouver l'idempotence.

## Piège 8 : reset global sur sélecteur d'élément — il bat toutes les classes simples

Symptôme : une couleur (ou `text-decoration`) déclarée sur une classe de composant n'est jamais rendue,
alors que la règle est bien présente, bien écrite, et déclarée **après**. L'ordre ne corrige pas un écart
de spécificité.

Cas typique en thème FSE, parce que `theme.json` ne suffit pas :

| Sélecteur | Spécificité | Effet |
|---|---|---|
| `a:where(:not(.wp-element-button))` (généré par `theme.json § styles.elements.link`) | **(0,0,1)** | perd contre toute classe |
| `.mon-composant__btn` | **(0,1,0)** | l'auteur croit que c'est la règle gagnante |
| `.wp-site-blocks a` (reset porté à la main pour compenser le point précédent) | **(0,1,1)** | **écrase silencieusement toutes les règles de classe simple sur les `<a>`** |

Le piège se referme quand le reset est ajouté pour réparer *un* cas (un lien de carte dont la couleur ne
prenait pas) : il répare ce cas et casse tous les autres, sans erreur, sans warning, souvent des semaines
plus tard et dans un fichier différent.

**Règles :**

1. Ne jamais porter un reset de maquette sur un sélecteur descendant d'élément (`.wp-site-blocks a`,
   `.site a`, `main p`). Porter le reset **au même poids que sa source** — via `theme.json §
   styles.elements.link` — et régler les exceptions au niveau du composant.
2. Si un reset descendant est malgré tout retenu, toute règle de composant qui doit le contredire doit
   monter au même poids : `a.mon-composant__btn` (0,1,1), pas `.mon-composant__btn`.
3. Contrôle exécutable, à câbler dans le lint du projet : lister les sélecteurs de la forme
   `<classe-racine> <élément>` dans le CSS composants et, pour chacun, énumérer les classes simples du
   manifeste qui déclarent une propriété homonyme sur ce même élément. Toute intersection est une erreur
   de lint, pas une remarque de revue.

## Piège 9 : un oracle de fidélité est **relatif** — il ne voit pas les défauts de la maquette

`measure.py` compare le rendu WP au rendu de la maquette, propriété par propriété. Un défaut **identique
des deux côtés est un match**, donc un verdict conforme. Une maquette qui porte déjà un contraste
illisible, un focus invisible ou une cible tactile trop petite fait donc *passer* le port fidèle de ce
défaut — c'est le comportement correct de l'outil, pas un bug.

**Conséquence de méthode :** un oracle de fidélité ne peut jamais être le gate le plus haut. Il faut, au
dessus, au moins un **gate absolu** que la maquette elle-même doit satisfaire :

- contraste WCAG mesuré par `getComputedStyle` sur la **page rendue** (jamais sur les valeurs déclarées :
  une paire déclarée excellente peut être écrasée par le piège 8 et rendre 1,06:1) ;
- visibilité du focus clavier, taille de cible, ordre de tabulation.

Quand le gate absolu échoue et que la maquette est la source du défaut, le défaut se corrige **des deux
côtés** — sinon l'oracle relatif repassera en rouge à la mesure suivante.

## Piège 10 : le périmètre de l'oracle n'est pas le périmètre du site

Une campagne d'intégration cadre naturellement son oracle sur les pages du manifeste de maquette (les
hubs). Les vues qui n'existent pas comme fichier de maquette — `single.html`, `single-<cpt>.html`,
`archive*.html`, `404.html`, les pages de taxonomie — n'ont alors **aucune config**, donc aucune mesure,
à aucun moment.

Le risque n'est pas d'avoir cadré : c'est que « tous les gates verts » se lise ensuite « le site est
intégré ». Deux règles :

1. Le périmètre de rendu **énumère tous les templates du thème**. Un template sans config d'oracle est
   un **manque déclaré** (avec sa raison), jamais un `extra` implicite.
2. Tout bilan de gates publie sa **couverture** — ce qui est mesuré *et* ce qui ne l'est pas — avant son
   verdict. Un verdict sans couverture n'est pas recevable comme preuve de complétude.

Cran au-dessus, et c'est le cas le plus dur à voir : un template **qui n'existe pas** ne manque même pas à
l'énumération. Un thème scaffoldé porte trois templates génériques ; si les types de contenu que la
référence implique n'ont jamais été enregistrés, l'énumération est exacte, complète, verte — sur un
dénominateur amputé. Ce n'est pas un manque de mesure, c'est un manque de production : il se ferme par la
phase *Établir le modèle de contenu* (`content-model-fse.md`), jamais par une config d'oracle
supplémentaire.
