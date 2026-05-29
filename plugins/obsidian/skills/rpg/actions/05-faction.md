# 05 - faction

Crée ou développe une faction et ses **fronts** (horloges/comptes à rebours), moteur de la pression de campagne.

## Inputs

- `campagne` (requis) — nom de la campagne.
- `faction` — nom ; sinon, proposer à partir du `synopsis.md`.

## Process

1. **Lire le contexte** : `synopsis.md`, `config.yaml` (chaos, difficulté), PNJ existants.
2. **Définir la faction** :
   - Nature, ressources, territoire / sphère d'influence.
   - **Agenda** : le but à long terme.
   - **Fronts (horloges)** : 1–3 comptes à rebours concrets (`◷ 0/4 → événement`), avec ce qui les fait avancer et ce qui se produit à échéance. Ce sont les horloges que `solo-mc` fera progresser au jeu.
   - **PNJ clés** : `[[lier]]` vers `pnjs/` (en proposer via `npc`).
   - **Pression sur le PJ** : comment l'agenda menace la ligne rouge / les enjeux du PJ.
3. **Lier** scénarios concernés ; mettre à jour `index.md` (section fronts en cours).
4. **Écrire** `JDR/<campagne>/factions/<slug>.md` (compléter sans écraser).

## Outputs

`JDR/<campagne>/factions/<slug>.md` (nature, agenda, fronts/horloges, PNJ clés, pression sur le PJ) + `index.md` à jour.

## Test

La faction a un agenda et au moins une horloge chiffrée (état actuel + déclencheur + échéance), et au moins un lien vers un PNJ ou un scénario de la campagne.
