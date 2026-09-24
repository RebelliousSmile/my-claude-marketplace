# Fidelity-gate

Applicable **dès qu'une référence visuelle externe existe**, quelle que soit la stack : l'oracle
mesure un rendu contre une maquette résolue, propriété par propriété, et cette comparaison ne
dépend d'aucune plateforme. **Sans référence externe** (construction depuis un brief,
`define/03-construct`), l'oracle ne s'applique pas *par nature* — voir
`## Chemin construction-depuis-brief` plus bas.

## Rôle

Vérifier la **fidélité du rendu** à la référence visuelle résolue (l'intention figée par
`adjust`), pas seulement la conformité au vocabulaire. La preuve de conformité vient de l'oracle
**par propriété** (`adapters/measure/measure.py`, styles calculés par breakpoint) et de lui seul.
Pour une cible FSE, cette même preuve inclut la **propriété de cascade** : valeur calculée, feuille et
sélecteur gagnants sur le front et dans le canvas éditeur. Elle étend le verdict de fidélité ; ce n'est
pas une règle `pivotReports` supplémentaire.
Il lit `deviations.json` pour distinguer un écart sanctionné d'une dérive, puis on déroule la
boucle **mesurer → corriger à la source → re-mesurer** jusqu'à delta 0 (ou écart couvert).

C'est le **second gate**, de nature différente du lint vocabulaire : ce que chacun établit et
n'établit pas est énoncé une seule fois dans `${DESIGN_PLUGIN_ROOT}/references/gate-natures.md`.

## Prérequis

- Contrat figé (`release.json` et les artefacts qu'il déclare) — produit par `adjust`.
- La référence visuelle résolue servie en HTTP (la maquette arbitrée).
- L'oracle installé : `${DESIGN_PLUGIN_ROOT}/adapters/measure/` (voir son README ; `python -m playwright install chromium`).
  Sous OD-1 le chemin Python est validé ; à défaut, mesure MCP en interactif — mais **le gate
  CI reste Python** (un gate automatisable ne peut pas dépendre d'un agent).
- **L'oracle par propriété câblé** : un config de mesure par page, généré depuis le contrat figé —
  `config-gen.py --components … --tokens … --oracle design/oracle.json --page <clé>
  --reference-url <maquette> --implementation-url <rendu>` — *et* le registre `deviations.json`,
  passé en argument requis `--ledger-registry`. Schéma du registre :
  `${DESIGN_PLUGIN_ROOT}/references/deviations-schema.md`.
- **Le config généré ne s'édite pas** : cibles, sélecteurs et props viennent de
  `oracle.json § pages`, figé et prouvé par `adjust`. Seuls ajouts permis, liste fermée : les URLs,
  l'authentification `ownership` (environnement), les `ledger` (ids de `deviations.json`) et
  `coverage_ack`. Un défaut de cible se corrige dans le contrat, via `adjust`, jamais dans ce fichier.
- Pour FSE, `config-gen.py --ownership-stylesheet <component.css> --ownership-stylesheet
  <fse-bindings.css>` dérive les propriétés des déclarations réelles. La session éditeur vient de
  `WP_EDITOR_STORAGE_STATE` ou du hook `WP_EDITOR_AUTH_HOOK`, jamais du config ni du dépôt.

## Refus d'affirmer la conformité

Quand une référence externe existe mais que l'oracle par propriété **n'est pas câblé** (pas de
config de mesure, ou pas de `deviations.json` à valider), le gate **n'affirme pas la conformité** —
il **refuse** et nomme l'étape de câblage : générer le config (`config-gen.py --page`), écrire
`deviations.json`, puis mesurer avec `measure.py --ledger-registry`. Une référence mesurable avec
un `oracle.json` sans `pages` (contrat figé avant le gate de fidélité) est un **refus** qui renvoie à
`adjust` : le gate n'est pas figé, `enforce` ne l'invente pas. Un rendu non mesuré
par propriété n'est jamais déclaré conforme, et **aucun diff pixel global ne tient lieu de preuve**
à sa place (cf. `## Le diff pixel est un détecteur`). Le refus est un état distinct du vert et du
rouge : rien n'est prouvé tant que l'oracle n'est pas câblé.

## Approche

1. **Mesurer** par breakpoint (mobile / tablette / desktop), à viewport identique de chaque côté :
   ```bash
   # --out pointe TOUJOURS vers l'arbre QA du projet consommateur (chemin absolu), jamais le plugin
   python adapters/measure/measure.py --config <config-projet> \
       --ledger-registry <projet>/<contrat>/deviations.json \
       --out <projet>/<qa-dir>/fidelity/<page>-B.json   # Mode B (rendu vs référence)
   ```
   Le mapping de sélecteurs et les cibles viennent de `oracle.json § pages` (via `config-gen.py
   --page`), jamais d'une saisie à la main. Le rapport
   et la config sont des **données projet** (gitignored), pas des assets du plugin — le `out/` du
   plugin ne sert qu'à ses propres fixtures de self-test.
2. **Classer chaque delta** à sa couche (token / markup / composant / contenu) — déléguer ce
   jugement à l'agent `copycat` (par page/unité) ; la mesure, elle, reste dans le script.
3. **Le registre sanctionne, l'oracle le valide** : un delta n'est toléré que s'il référence une
   entrée **active** de `deviations.json` portant sa **valeur attendue** et non expirée. `measure.py`
   valide chaque référence via `--ledger-registry` : entrée absente, sans `expected`, ou expirée →
   verdict `OPEN`. **Sans entrée → dérive → corriger** (défaut : rendu strictement identique). Les
   cas exacts de bascule `OPEN` : `${DESIGN_PLUGIN_ROOT}/references/deviations-schema.md`.
4. **Corriger à la bonne couche**, jamais en patch local : valeur → token ; mauvais token → markup ;
   règle de composant → CSS du composant + `components.json`. La **réalisation dans le langage de la
   cible** passe par le pivot (`sc-<langage>:design-bridge`, cf. `${DESIGN_PLUGIN_ROOT}/references/sc-pivot-contract.md`).
   **Corriger la source, jamais le magasin de contenu seul** : tout contenu généré ou seedé s'édite à
   sa **source**, puis se réécrit depuis elle. Une édition directe du magasin est écrasée à la
   prochaine génération et n'existe pas dans l'historique — le correctif disparaît sans rien signaler.
5. **Un `missing` se corrige, il ne se retire pas** : côté implémentation, c'est une dérive — le
   markup ne porte pas la classe de `components.json` ; corriger le markup, jamais retirer la cible ni
   réécrire son sélecteur. Côté maquette, c'est un défaut du contrat : renvoi à `adjust`. Le config
   n'est régénéré que depuis le contrat.
6. **Re-mesurer pour clore** : la clôture est le **verdict par propriété du script**
   `summary.verdict == "CLOSED"` (calculé : 0 diff ET 0 missing ET aucune section absente de la cible
   ET `coverage.ok` ET toute exception validée contre `deviations.json` ET, lorsqu'elle est configurée,
   `ownership_failures == 0` ET `ownership_unrealized == 0`), **pas** une affirmation de
   l'opérateur ni un diff pixel vert. Coller le bloc `summary`/`completeness`/`coverage` comme preuve.
   Un `coverage.ok=false` = sous-mesure (tunnel vision hero-only) → ajouter une cible par section. Un
   écart toléré n'est exclu que par une entrée `active` référencée, jamais par omission. « Vérifié en
   relisant ma source » ≠ clôture.
7. **Tablette sans source maquette** : valider en best-practice (pas de diff maquette) — capture +
   inspection (overflow/reflow) ; couvert par une entrée `active` si règle tablette délibérée.

## Le diff pixel est un détecteur

La comparaison pixel globale (`screenshot.py` + `pixeldiff.py`) **pointe** des zones divergentes que
les styles calculés ne couvrent pas (layout, effets composites, éléments hors du gate figé). Elle n'est
**jamais** une preuve de conformité : un diff pixel à zéro ne clôt pas le gate, et un diff non nul ne
le fait pas échouer par lui-même — il alimente le classement (§2). La clôture vient du verdict par
propriété (§6). Protocole d'analyse des zones : `${DESIGN_PLUGIN_ROOT}/references/visual-diff-procedure.md`.

## La boucle mesurer → corriger → re-mesurer

```
mesurer (oracle par propriété, par breakpoint)
    │
    ├── delta 0 (ou couvert par une entrée active) → gate fidélité vert ✓
    │
    └── delta non sanctionné
          │
          ├── classer la couche (copycat) → corriger à la source (token/markup/composant)
          │
          ├── si toléré pour DRY/SOLID → entrée active dans deviations.json + deviation_refs au manifeste
          │
          └── re-mesurer → recommencer
```

Terminée quand chaque unité touchée sort à delta 0 **ou** porte un écart couvert, à tous les breakpoints.

## Câblage

Le gate de fidélité s'arme **à côté** du lint vocabulaire (cf. `${DESIGN_PLUGIN_ROOT}/skills/enforce/references/gate-wiring.md`) :
- **diffuse / génération** : refuser de livrer si la fidélité n'est pas verte (en plus du lint).
- **success_condition des plans** : ajouter la fidélité aux conditions de sortie.
- **pre-commit** (optionnel) : la mesure est plus lente que le lint ; la réserver aux composants
  touchés ou à un run CI dédié, pas à chaque commit.

## Pièges à éviter

- Viewport **identique par breakpoint** : sinon les `clamp()`/`vw` faussent la comparaison.
- Normalisation Unicode des noms de fichiers (NFC/NFD) : deux graphies d'un même nom accentué ne
  résolvent pas au même fichier selon le système. Comparer sur la forme normalisée, pas sur l'octet.
- Ne pas confondre les deux gates : un lint vert ne dispense pas du gate de fidélité.
- Un diff pixel vert n'est pas une clôture ; un oracle non câblé ne se rabat jamais sur le diff pixel
  comme preuve — il refuse (cf. `## Refus d'affirmer la conformité`).
- Un `missing` au rapport n'est **pas** un pass : c'est un sélecteur qui ne résout pas. Le résoudre
  avant de clore (§5) — jamais le lire comme « rien à corriger », jamais retirer la cible.
- Ne jamais revendiquer une clôture sur la foi d'une édition non re-mesurée (cf. étape 6).

## Chemin construction-depuis-brief — pas de gate de fidélité

**Limite assumée et nommée (2nd-audit #3 / A9), pas un gap silencieux.** Ce gate mesure la
fidélité d'un rendu à une **référence visuelle externe** (une maquette résolue par `adjust`).
Un projet construit **depuis un brief** (`${DESIGN_PLUGIN_ROOT}/skills/define/actions/03-construct.md` —
pas de visuel, un système de tokens dérivé de l'intention écrite) n'a, par construction, **aucune
référence externe à comparer** : il n'y a rien à mesurer, donc l'oracle de fidélité **ne
s'applique pas par nature** à ce chemin. C'est distinct du refus ci-dessus : là, aucune référence
n'existe ; ici, une référence existe mais l'oracle n'est pas encore câblé.

- **Profil de gate pour ce cas** : vocabulaire seul (`lint-core.mjs`) + bonnes
  pratiques visuelles (réduction mobile, cohérence des échelles — jugées en
  revue humaine, pas par un oracle automatisable). Pas de second gate mesuré.
  Le contraste, lui, ne relève **pas** de cette revue humaine : il a été mesuré en amont, au
  figeage, sur les paires déclarées (`${DESIGN_PLUGIN_ROOT}/adapters/a11y/contrast.py`), et son
  résultat vit dans `release.json § checks.contrast`. Ce chemin n'a pas de référence externe ;
  il a quand même un contrôle de contraste, et il n'y a donc rien à rejuger à l'œil ici.
- Ceci n'est **pas** un oubli du contrat : c'est la même règle que la note d'applicabilité
  ci-dessus, vue de l'autre côté — *la fidélité exige une référence ; un projet brief-only n'en
  a aucune*. Dès qu'une référence apparaît ultérieurement (ex. une maquette est produite après
  coup pour valider le résultat du brief), ce gate redevient applicable normalement.
- **Option de suivi non construite ici** (A9, option 2) : un gate de substitution/auto-cohérence
  (checklist de bonnes pratiques formalisée : réductions responsive, couverture d'états)
  pourrait servir de proxy de fidélité *soft* pour ce chemin — non implémenté
  dans cette part, noté comme piste possible seulement. Les paires de contraste en sont
  sorties : elles ne sont plus une checklist à formaliser, elles sont calculées au figeage.
- Renvoi croisé : `${DESIGN_PLUGIN_ROOT}/skills/define/actions/03-construct.md` porte la note
  réciproque en aval.

## Sortie attendue

> Gate fidélité : N unités mesurées sur B breakpoints, M deltas résolus, K écarts couverts.
> [vert : tous à delta 0 ou couverts / rouge : liste des dérives non sanctionnées /
> refus : oracle non câblé ou `oracle.json` sans `pages`, étape nommée / sans objet : pas de
> référence mesurable].
> Exclusions `skip` du contrat : listées par nom et raison.
