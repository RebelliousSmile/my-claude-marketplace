# Oracle — Functional Test Scenarios

Functional tests for the `oracle` agent (`plugins/obsidian/agents/oracle.md`). Each scenario gives an in-play situation; the oracle must route to the right subsystem, **read the real domain data**, **roll a real die**, and return the structured Output block. Pass = correct routing + a real draw grounded in the subsystem tables + structured (non-prose) output.

Game domain `R` resolved **locally** (walk up to the `_savoir/` marker — no global config). Subsystems at `R/_savoir/subsystems/<nom>/canon/`. See `../../../references/jdr-layout.md`.

| # | Situation (input) | Expected route | Expected draw | Pass criteria |
|---|-------------------|----------------|---------------|---------------|
| O1 | « Le garde accepte-t-il de laisser passer le PJ ? » (probabilité 50/50) | muses-et-oracles → Réponse d'oracle | **d6** → 1 `Non, et…` … 6 `Oui, et…` | Roll shown, answer is one of the 6 tiers, Facteur Chaos stated |
| O2 | « Un inconnu aborde le PJ — quelle est son attitude ? » | muses-et-oracles → Attitude | **d20** over the 20 attitudes | Drawn attitude is an actual row of the Attitude table |
| O3 | « Panne d'idée : donne-moi une amorce. » | muses-et-oracles → Mot-oracle / Verbe | pioche libre over the pool | Drawn token exists in the muses Standard tables |
| O4 | « Un PNJ inconnu surgit — génère-le. » | muses-et-oracles → Générateur de PNJ | 5 draws (Apparence/Motivation/Traits/Secret/Relation) | 5 fields, each an actual table entry |
| O5 | « L'équipe hésite ; rien ne s'impose narrativement. » | parallaxe → tirage simple | filter pool, draw 1 of 54 | Returns a real card (name + axes + phrase/impulsions/signe) |
| O6 | « Le PJ est seul (aucun compagnon), scène en huis clos. » | parallaxe → tirage filtré | exclude `Focale=Compagnon` (and Moi·= etc.), then draw | Drawn card is NOT a Compagnon-focale card |
| O7 | « La scène stagne, il faut une relance. » | muses-et-oracles → deck Rebondissements | carte-titre + (Focus/Soudain…/Coup de théâtre, ligne + d3) | Returns a real twist from the Rebondissements tables |

## How to run

**Two test artifacts:**

1. **`oracle-data-checks.py`** (this dir) — reproducible data-integrity checks on the subsystems the oracle draws from (resolves `R` locally via the `_savoir/` marker; pass the domain path as an argument or run from inside `R`). Run: `python oracle-data-checks.py [chemin-vers-R]`. Asserts: muses master table 200×17, the `[d10] → réponse d'oracle` invariant (200/200), the weighted distribution 40/40/40/40/20/20, parallaxe 54 cards, filter correctness, and the systematic-exclusion exceptions (Le Retour, Le Sanctuaire). 11/11 PASS at 2026-06-01.
2. **The scenario table above** — behavioural test of the agent itself: run an agent that loads `plugins/obsidian/agents/oracle.md` as its instructions, against a real domain `R`, one scenario at a time, and capture the Output block. The oracle **draws a card** (single `random.randint(1,N)`); a game-system die is **read off** the card's `[dX]`, not rolled.

## Results log

<!-- append run results here: date, scenario, roll, drawn result, pass/fail -->

### 2026-06-01 — run 1 (harness agent-as-oracle, real dice, real domain) — **7/7 PASS**

| # | Roll | Drawn (domain-verified) |
|---|------|------------------------|
| O1 | d6=2 | `Non, mais…` |
| O2 | d20=9 | attitude `imperturbable` |
| O3 | pioche=281 | mot-oracle `fracas` |
| O4 | 31/53/153/18/7 | PNJ : tatouage•mohawk / tenir ses engagements / manque d'assurance•soigneux•énergique / extrêmement riche / employé-patron |
| O5 | d54=4 | `Le Doute` (Révélation·Compagnon·=) |
| O6 | filtré (41) → 52 | `La Métamorphose` (Lieu, non-Compagnon ✓) |
| O7 | titre d13=10, ligne d19=16, d3=2 | « Coup de théâtre » → « Les PJ ne peuvent pas révéler la vérité » |

**Frictions relevées** (à traiter) :
1. **d6 « Réponse d'oracle » incohérent entre 3 fichiers** : index (5 Oui / 6 Oui,et) vs pool cartes-standard (5 Oui,et / 6 Oui) vs colonne par-carte. → réconcilier sur l'échelle ascendante 1 `Non,et…` → 6 `Oui,et…`. [données R]
2. **Relation 1–51 (index) vs 1–50 (pool)** — borne haute divergente. [données R]
3. **Carte Pause (#54)** : pas explicitement traitée au filtrage parallaxe (conservée, ~2 %). [parallaxe.md + oracle.md] — corrigé côté agent.
4. **Rebondissements** : lien carte-titre ↔ table de sous-options non spécifié dans oracle.md. — corrigé côté agent.
5. **`validated: false`** sur cartes-standard & parallaxe ; fragments ambigus dans rebondissements. [qualité des données R]

### 2026-06-01 — run 2 (programmatique `oracle-data-checks.py` + harnais qualitatif) — **23/23 + 9/9 PASS**

- **Programmatique (23/23)** : table maître 200×17, invariant [d10]→oracle, distribution 40/40/40/40/20/20, parallaxe 54 + filtres + exclusions/exceptions, **couverture dés d4..d20** (toutes faces atteignables ; X hors-plage d6=2, d12=8), **conversation-cards 9 combos × 3 = 27**, Rebondissements (Focus 28 / Soudain 19 / Hors-sentiers 39 / Coup-de-théâtre 33).
- **Harnais qualitatif (9/9)** : G1a résolution du subsystem dans `R/_savoir/subsystems/` (muses présent) ; G1b subsystem absent (tarot) → `[HRP]` + dés système 2d6 ; R1-R4 routage (Oui/Non, génération objet, parallaxe filtré, Rebondissements) ; B1 bundle cohérent (1 carte #166 → attitude+émotion+météo) ; RB1/RB2 Rebondissements + Bonus.

**Frictions → corrigées dans oracle.md** : (1) résolution chemin = tester le **chemin canon complet** `R/_savoir/subsystems/<nom>/canon/` (un `subsystems/<nom>/` vide ne compte pas) ; (2) `[HRP]` de dégradation **nomme la formule** ; (3) note de routage « relance » (entropie→Rebondissements / blocage→parallaxe).

> **Note historique** : ce run datait du modèle à coffre global (`~/.jdr.yaml`, repli game-local→partagé), désormais abandonné. Le modèle courant résout `R` **localement** via le marqueur `_savoir/` ; les subsystems vivent uniquement sous `R/_savoir/subsystems/<nom>/canon/` (plus de repli partagé). Les résultats de données ci-dessus restent valides ; seule la résolution de chemin a changé.
