# 05 - faction

Crée ou développe une faction (lore d'univers durable) **et** ses **fronts** (horloges actives, état de campagne).

Distinction clé : la **faction** est une donnée d'univers (durable, transverse) → arborescence partagée ; ses **fronts/horloges** sont l'**état d'une partie** → côté campagne.

## Inputs

- `campagne` (requis) — nom de la campagne (pour les fronts) ; son `config.yaml › universe` désigne l'univers.
- `faction` — nom ; sinon, proposer à partir du `synopsis.md` ou des `factions.md` de l'univers.

## Process

1. **Lire le contexte** : `JDR/univers/<univers>/.docs/factions.md` et `personnages.md`, `synopsis.md`, `config.yaml` (chaos, difficulté).
2. **Définir la faction (durable)** : nature, ressources, territoire / sphère d'influence, **agenda** (but à long terme), PNJ clés (`[[lier]]` vers `personnages.md`).
   → Écrire/compléter dans `JDR/univers/<univers>/.docs/factions.md` (arborescence partagée avec `lore-extract` : une info dans un seul fichier, ne pas écraser).
3. **Définir les fronts (campagne)** : 1–3 horloges concrètes (`◷ 0/4 → événement`), ce qui les fait avancer, ce qui se produit à échéance, et la **pression sur le PJ** (menace sur la ligne rouge / les enjeux). Ce sont les horloges que `solo-mc` fera progresser au jeu.
   → Écrire dans `JDR/<campagne>/fronts.md` (état de partie), en `[[liant]]` la faction d'univers.
4. Mettre à jour l'`index.md` de la campagne (section fronts en cours).

## Outputs

- Faction durable dans `JDR/univers/<univers>/.docs/factions.md` (nature, agenda, PNJ clés).
- Fronts/horloges actifs dans `JDR/<campagne>/fronts.md`, liés à la faction + à la pression sur le PJ.

## Test

La faction durable est dans `factions.md` de l'univers (non dupliquée), avec un agenda ; au moins une horloge chiffrée (état + déclencheur + échéance) existe dans `JDR/<campagne>/fronts.md` et référence la faction.
