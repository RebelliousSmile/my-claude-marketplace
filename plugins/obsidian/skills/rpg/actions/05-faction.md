# 05 - faction

Crée ou développe une faction (lore d'univers durable) **et** ses **fronts** (horloges actives, état de campagne).

Distinction clé : la **faction** est une donnée d'univers durable → sous-arbre `mj/` (création MJ) ou existante en `canon/` ; ses **fronts/horloges** sont l'**état d'une partie** → côté campagne.

## Inputs

- `campagne` (requis) — nom de la campagne (pour les fronts) ; son `config.yaml › univers` désigne l'univers.
- `faction` — nom ; sinon, proposer à partir du `synopsis.md` ou des `factions.md` (`canon/` et `mj/`).

## Process

1. **Lire le contexte** : `RPG/<jeu>/_univers/<univers>/canon/{factions,personnages}.md` ET `mj/{factions,personnages}.md`, `synopsis.md`, `config.yaml` (chaos, difficulté).
2. **Définir la faction (création MJ)** : nature, ressources, territoire / sphère d'influence, **agenda** (but à long terme), PNJ clés (`[[lier]]`).
   → Écrire/compléter dans `RPG/<jeu>/_univers/<univers>/mj/factions.md` (une info dans un seul fichier, ne pas écraser). **Ne jamais écrire dans `canon/`** ; si la faction est canon, créer une fiche `mj/` qui l'étend et la `[[lie]]`, sans contredire le canon en silence.
3. **Définir les fronts (campagne)** : 1–3 horloges concrètes (`◷ 0/4 → événement`), ce qui les fait avancer, ce qui se produit à échéance, et la **pression sur le PJ** (menace sur la ligne rouge / les enjeux). Ce sont les horloges que `solo-mc` fera progresser au jeu.
   → Écrire dans `RPG/<jeu>/_campagnes/<campagne>/fronts.md` (état de partie), en `[[liant]]` la faction.
4. Mettre à jour l'`index.md` de la campagne (section fronts en cours).

## Outputs

- Faction (création MJ) dans `RPG/<jeu>/_univers/<univers>/mj/factions.md` (nature, agenda, PNJ clés) ; `canon/` inchangé.
- Fronts/horloges actifs dans `RPG/<jeu>/_campagnes/<campagne>/fronts.md`, liés à la faction + à la pression sur le PJ.

## Test

La faction MJ est dans `mj/factions.md` (jamais dans `canon/`, non dupliquée), avec un agenda ; au moins une horloge chiffrée (état + déclencheur + échéance) existe dans `RPG/<jeu>/_campagnes/<campagne>/fronts.md` et référence la faction.
