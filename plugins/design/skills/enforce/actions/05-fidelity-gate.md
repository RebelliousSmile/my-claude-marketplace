# 05-fidelity-gate

Track: WP-maquette (profil pleine forme — l'oracle mesure un rendu contre une maquette résolue,
par nature un scénario maquette-vs-rendu). Note app-JS-modern / from-code courte : l'oracle
**s'applique identiquement, quelle que soit la stack**, dès qu'une maquette de référence externe
existe (SPA incluse) — il n'est WP-flavoured que dans ses exemples. **Sans maquette externe**
(construction depuis un brief, `define/03-construct`), l'oracle ne s'applique pas *par nature* —
voir `## Chemin construction-depuis-brief — pas de gate de fidélité` plus bas.

## Rôle

Vérifier la **fidélité du rendu** à la référence visuelle résolue (l'intention design figée
par `adjust`), pas seulement la conformité au vocabulaire. On MESURE les styles calculés via
l'oracle déterministe (`adapters/measure/`) **par breakpoint**, on lit le registre d'écarts
pour distinguer un écart sanctionné d'une dérive, puis on déroule la boucle
**mesurer → corriger à la source → re-mesurer** jusqu'à delta 0 (ou écart ledgeré).

C'est le **second gate**, de nature différente du lint vocabulaire.

## Pourquoi c'est nécessaire — deux natures de gate

Le lint vocabulaire (`lint-core.mjs`, Gates 1-3) vérifie que le **vocabulaire fermé** est
respecté (chaque valeur = un token, chaque classe ∈ `components.json`). Il est **aveugle au
rendu calculé** : on peut être **lint-vert et visuellement faux** —
- le bon token existe et est « utilisé », mais le markup applique le **mauvais** token ;
- une cascade / spécificité fait diverger la valeur **calculée** de l'intention ;
- aucune réduction mobile alors que la maquette en prévoit une.

D'où **deux références complémentaires**, deux gates qui doivent être verts ensemble :

| Gate | Oracle | Référence | Question |
|------|--------|-----------|----------|
| Vocabulaire (Gates 1-3) | `lint-core.mjs` (Node) | `components.json` / `tokens.json` | le vocabulaire fermé est-il respecté ? |
| **Fidélité (ce gate)** | `measure.py` getComputedStyle (Python) | l'intention visuelle résolue (maquette arbitrée par `adjust`) | le rendu calculé colle-t-il à la cible ? |

Le lint reste la référence **interne** (cohérence vocabulaire) ; la fidélité est la référence
**externe** (fidélité à l'intention). Aucun des deux ne remplace l'autre.

## Prérequis

- Contrat figé (`tokens.json` + `components.json`) — produit par `adjust`.
- La référence visuelle résolue servie en HTTP (la maquette arbitrée).
- L'oracle installé : `${CLAUDE_PLUGIN_ROOT}/adapters/measure/` (voir son README ; `python -m playwright install chromium`).
  Sous OD-1 le chemin Python est validé ; à défaut, mesure MCP en interactif — mais **le gate
  CI reste Python** (un gate automatisable ne peut pas dépendre d'un agent).
- Le registre d'écarts : `ds-deviation-ledger.md` (cf. `${CLAUDE_PLUGIN_ROOT}/references/deviation-ledger-template.md`).

## Approche

1. **Mesurer** par breakpoint (mobile / tablette / desktop), à viewport identique de chaque côté :
   ```bash
   # --out pointe TOUJOURS vers l'arbre QA du projet consommateur (chemin absolu), jamais le plugin
   python adapters/measure/measure.py --config <config-projet> \
       --out <projet>/<qa-dir>/fidelity/<page>-B.json   # Mode B (rendu vs référence)
   ```
   Le mapping de sélecteurs et les cibles viennent de la table de correspondance (P2). Le
   rapport et la config sont des **données projet** (gitignored), pas des assets du plugin —
   le `out/` du plugin ne sert qu'à ses propres fixtures de self-test.
2. **Classer chaque delta** à sa couche (token / markup / composant / contenu) — déléguer ce
   jugement à l'agent `copycat` (par page/unité) ; la mesure, elle, reste dans le script.
3. **Lire le registre** : un delta couvert par une entrée `DEV-NNN` (avec `deviation_refs` sur le
   composant dans `components.json`) est **sanctionné** → ne fait pas échouer le gate. **Sans
   entrée → dérive → corriger** (défaut : rendu strictement identique).
4. **Corriger à la bonne couche**, jamais en patch local : valeur → token ; mauvais token → markup ;
   règle de composant → CSS `mau-*`/composant + manifeste. La **réalisation stack-spécifique** passe
   par le pivot (`sc-php:design-bridge` / `sc-js:design-bridge`, cf. `${CLAUDE_PLUGIN_ROOT}/references/sc-pivot-contract.md`) —
   pour WordPress : patterns, `render.php`/markup FSE, presets `theme.json`, lint DB via le CLI conteneur.
   **Corriger la source + réimporter, jamais la DB seule** — et pas seulement pour les patterns : tout
   contenu généré/seedé (`post_content`, menus, nav, options produits par `tools/import/`) s'édite à sa
   **source** ; une édition DB directe est une violation P1 (écrasée au prochain import, absente de git).
5. **Réconcilier le config si le markup change** : modifier une classe/un sélecteur désynchronise la
   table de correspondance → l'oracle ressort `missing` (= non vérifié), ce qui *masque* le correctif au
   lieu de le confirmer. Mettre à jour les sélecteurs (ou cibler des classes DS stables) dans le même geste.
6. **Re-mesurer pour clore** : la clôture est le **verdict du script** `summary.verdict == "CLOSED"`
   (calculé : 0 diff ET 0 missing ET aucune `missing_in_wp` ET `coverage.ok`), **pas** une affirmation
   de l'opérateur. Coller le bloc `summary`/`completeness`/`coverage` comme preuve. Un `coverage.ok=false`
   = sous-mesure (tunnel vision hero-only) → ajouter une cible par section. Un écart toléré n'est exclu
   que par une entrée ledger référencée, jamais par omission. « Vérifié en relisant ma source » ≠ clôture.
7. **Tablette sans source maquette** : valider en best-practice (pas de diff maquette) — capture +
   inspection (overflow/reflow) ; ledgeré si règle tablette délibérée.

## La boucle mesurer → corriger → re-mesurer

```
mesurer (oracle, par breakpoint)
    │
    ├── delta 0 (ou couvert par le ledger) → gate fidélité vert ✓
    │
    └── delta non sanctionné
          │
          ├── classer la couche (copycat) → corriger à la source (token/markup/composant)
          │
          ├── si toléré pour DRY/SOLID → entrée ds-deviation-ledger + deviation_refs au manifeste
          │
          └── re-mesurer → recommencer
```

Terminée quand chaque unité touchée sort à delta 0 **ou** porte un écart ledgeré, à tous les breakpoints.

## Câblage

Le gate de fidélité s'arme **à côté** du lint vocabulaire (cf. `${CLAUDE_PLUGIN_ROOT}/skills/enforce/references/gate-wiring.md`) :
- **diffuse / génération** : refuser de livrer si la fidélité n'est pas verte (en plus du lint).
- **success_condition des plans** : ajouter la fidélité aux conditions de sortie.
- **pre-commit** (optionnel) : la mesure est plus lente que le lint ; la réserver aux composants
  touchés ou à un run CI dédié, pas à chaque commit.

## Pièges à éviter

- Viewport **identique par breakpoint** : sinon les `clamp()`/`vw` faussent la comparaison.
- NFC/NFD sur Windows pour les noms de fichiers (cf. `${CLAUDE_PLUGIN_ROOT}/references/wordpress-pitfalls.md`).
- Ne pas confondre les deux gates : un lint vert ne dispense pas du gate de fidélité.
- Un `missing` au rapport n'est **pas** un pass : c'est un sélecteur qui ne résout pas (souvent
  un config désynchronisé après une modif de markup). Le résoudre avant de clore — jamais le lire
  comme « rien à corriger ».
- Ne jamais revendiquer une clôture sur la foi d'une édition non re-mesurée (cf. étape 6).

## Chemin construction-depuis-brief — pas de gate de fidélité

**Limite assumée et nommée (2nd-audit #3 / A9), pas un gap silencieux.** Ce gate mesure la
fidélité d'un rendu à une **référence visuelle externe** (une maquette résolue par `adjust`).
Un projet construit **depuis un brief** (`${CLAUDE_PLUGIN_ROOT}/skills/define/actions/03-construct.md` —
pas de visuel, un système de tokens dérivé de l'intention écrite) n'a, par construction, **aucune
référence externe à comparer** : il n'y a rien à mesurer, donc l'oracle de fidélité **ne
s'applique pas par nature** à ce chemin.

- **Profil de gate pour ce cas** : vocabulaire seul (`lint-core.mjs`, Gates 1-3) + bonnes
  pratiques visuelles (contraste WCAG, réduction mobile, cohérence des échelles — jugées en
  revue humaine, pas par un oracle automatisable). Pas de second gate mesuré.
- Ceci n'est **pas** un oubli du contrat : c'est la même règle que la note app-JS-modern
  ci-dessus, vue de l'autre côté — *la fidélité exige une référence ; un projet brief-only n'en
  a aucune*. Dès qu'une référence apparaît ultérieurement (ex. une maquette est produite après
  coup pour valider le résultat du brief), ce gate redevient applicable normalement.
- **Option de suivi non construite ici** (A9, option 2) : un gate de substitution/auto-cohérence
  (checklist de bonnes pratiques formalisée : paires de contraste, réductions responsive,
  couverture d'états) pourrait servir de proxy de fidélité *soft* pour ce chemin — non implémenté
  dans cette part, noté comme piste possible seulement.
- Renvoi croisé : `${CLAUDE_PLUGIN_ROOT}/skills/define/actions/03-construct.md` porte la note
  réciproque en aval.

## Sortie attendue

> Gate fidélité : N unités mesurées sur B breakpoints, M deltas résolus, K écarts ledgerés.
> [vert : tous à delta 0 ou ledgerés / rouge : liste des dérives non sanctionnées].
