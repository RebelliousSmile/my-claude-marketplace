# 05-fidelity-gate

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
- L'oracle installé : `adapters/measure/` (voir son README ; `python -m playwright install chromium`).
  Sous OD-1 le chemin Python est validé ; à défaut, mesure MCP en interactif — mais **le gate
  CI reste Python** (un gate automatisable ne peut pas dépendre d'un agent).
- Le registre d'écarts : `ds-deviation-ledger.md` (cf. `references/deviation-ledger-template.md`).

## Approche

1. **Mesurer** par breakpoint (mobile / tablette / desktop), à viewport identique de chaque côté :
   ```bash
   python adapters/measure/measure.py --config <page>.json --out out/<page>.json   # Mode B (rendu vs référence)
   ```
   Le mapping de sélecteurs et les cibles viennent de la table de correspondance (P2).
2. **Classer chaque delta** à sa couche (token / markup / composant / contenu) — déléguer ce
   jugement à l'agent `copycat` (par page/unité) ; la mesure, elle, reste dans le script.
3. **Lire le registre** : un delta couvert par une entrée `DEV-NNN` (avec `deviation_refs` sur le
   composant dans `components.json`) est **sanctionné** → ne fait pas échouer le gate. **Sans
   entrée → dérive → corriger** (défaut : rendu strictement identique).
4. **Corriger à la bonne couche**, jamais en patch local : valeur → token ; mauvais token → markup ;
   règle de composant → CSS `mau-*`/composant + manifeste. **Re-mesurer** jusqu'à delta 0.
5. **Tablette sans source maquette** : valider en best-practice (pas de diff maquette) — capture +
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

Le gate de fidélité s'arme **à côté** du lint vocabulaire (cf. `references/gate-wiring.md`) :
- **diffuse / génération** : refuser de livrer si la fidélité n'est pas verte (en plus du lint).
- **success_condition des plans** : ajouter la fidélité aux conditions de sortie.
- **pre-commit** (optionnel) : la mesure est plus lente que le lint ; la réserver aux composants
  touchés ou à un run CI dédié, pas à chaque commit.

## Pièges à éviter

- Viewport **identique par breakpoint** : sinon les `clamp()`/`vw` faussent la comparaison.
- NFC/NFD sur Windows pour les noms de fichiers (cf. `design/references/wordpress-pitfalls.md`).
- Ne pas confondre les deux gates : un lint vert ne dispense pas du gate de fidélité.

## Sortie attendue

> Gate fidélité : N unités mesurées sur B breakpoints, M deltas résolus, K écarts ledgerés.
> [vert : tous à delta 0 ou ledgerés / rouge : liste des dérives non sanctionnées].
