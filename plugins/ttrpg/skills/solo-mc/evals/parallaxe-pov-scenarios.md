# Parallaxe — Point-of-View Switching Behavioural Test Scenarios

Behavioural tests for the **`parallaxe` subsystem's core mechanic — the *basculement de point de vue*** (point-of-view switch) — as exercised by the `oracle` (draw) and the `narrateur` (render). Parallaxe does **not** answer yes/no like the muses oracle: it **reframes** the scene so the stalled decision unblocks by itself. The reframe is driven by the drawn card's **Focale** (the POV axis): **Moi ●** (the played PC), **Compagnon ●●**, **PNJ ○**, **Tiers ◌** (an absent who weighs), **Lieu ▢** (the place as an entity). Switching the Focale switches whose vantage the next beat is told from — breaking the linear cause→effect chain centered on the PC.

This suite is **distinct**: `oracle-scenarios.md` tests draw integrity (O5/O6 cover a simple and a filtered parallaxe draw); **this file** tests that the drawn **Focale actually reframes the narration to that vantage**, and that the reading discipline (Phrase / Impulsions-as-angles / Signe-to-invent) and the anti-linearity hold.

> **Data precondition / known path gap.** The parallaxe canon currently lives in the **shared subsystems repo** at `Perso/RPG/subsystems/parallaxe/systeme/canon/parallaxe.md`. The `oracle` agent and `oracle-data-checks.py` expect it **installed into a game domain** at `R/_subsystems/parallaxe/canon/parallaxe.md` (note: `_subsystems/`, and **no** intermediate `systeme/` level). So in a real game domain that has not installed parallaxe, the oracle **graceful-degrades** (no parallaxe) — a behavioural run of Part B must point the harness at the real canon file as the parallaxe source. Data integrity is confirmed by inspection: 54 cards (53 thematic + Pause), `Moi·=` has no card, `Tiers·▲` = only *Le Retour* (#28), `Lieu·▲` = only *Le Sanctuaire* (#30).

## Part A — Routing, filtering, draw (oracle)

| #   | Situation | Expected oracle behaviour | Pass criteria |
|-----|-----------|---------------------------|---------------|
| PX1 | A **decisional** block — no direction imposes itself (« l'équipe hésite, rien ne s'impose ») | Route `decision` → **parallaxe** (not muses-et-oracles, which is for `hasard`) | parallaxe chosen; not a yes/no oracle draw |
| PX2 | Decision in a scene with **no companion present** | Filter the pool: **exclude Focale = Compagnon ●●** before drawing | drawn card's Focale ≠ Compagnon; filter applied before the uniform draw |
| PX3 | Scene **already tense**, the player wants to breathe | Filter by Tonalité: **exclude Hostile ▼** | drawn card's Tonalité ≠ ▼ |
| PX4 | Any draw | Respect the systematic exclusions: **`Moi·=` never** (no card); **`Tiers·▲` only `Le Retour`**; **`Lieu·▲` only `Le Sanctuaire`** | no drawn/declared combination violates these; the axis-less **Pause** (#54) is never removed by axis filters |
| PX5 | The **Pause** card (#54) comes up | Do **not** unblock a decision: signal status quo — play a no-stakes beat that fleshes out the world/character | the decision is NOT forced; a quotidian/no-stakes beat is proposed; player may redraw |

## Part B — Point-of-view switch (narrateur rendering of the drawn Focale)

For each, the oracle hands the narrateur a drawn card; the narrateur must **reframe the beat from the card's Focale**, read **Phrase + 3 Impulsions (as angles, not orders) + Signe (type → invented concretely in-universe)**, and **not author the PC's deliberate action**.

| #   | Drawn card (Focale) | Expected POV switch | Pass criteria |
|-----|---------------------|---------------------|---------------|
| PV1 | **L'Empreinte** (#10, Lieu ▢ ·=) | Reframe from the **place as an entity** — the location bears the mark of a past event; it reveals, it is not neutral | the beat is told from the **location's** vantage (the place acts/reveals), not the PC's agency; the decision unblocks via that vantage |
| PV2 | **L'Ombre** (#9, Tiers ◌ ·▼) | Reframe around an **absent figure who still acts** — a past presence weighs on the present scene (dette/ascendant) | an **absent third party** reshapes the moment; the scene is not a linear continuation of the PC's last action |
| PV3 | **La Volte** (#25, Compagnon ●● ·▼) | Reframe to the **companion's agency** — the companion reverses position at the worst moment | the **companion** drives the beat (acts/turns), POV shifts off the PC; the PC does not author the companion's choice for them beyond playing the substitution honestly |
| PV4 | **Le Masque** (#7, PNJ ○ ·▼) | Reframe to an **NPC present** revealing their true nature | an **NPC** drives the reframe (a detail unmasks them); not PC-centric |
| PV5 | **La Faille** (#13, Moi ● ·▼) | Reframe **internal to the PC** — a fragility cedes under pressure, **unbidden** (not a deliberate PC choice) | the shift is an involuntary internal movement of the PC; the narrateur does **not** turn it into a deliberate PC decision (T9: never author the PC's choices) |
| PV6 | Any card | **Reading discipline**: use the Phrase for sense, the 3 Impulsions as **angles** (use one/several/none), and the **Signe** as a *type* invented concretely in this universe — the card **does not dictate** a fixed outcome | impulsions treated as angles not commands; the concrete sign is invented in-fiction; no railroaded outcome |
| PV7 | Any card vs the prior beat | **Anti-linearity**: the reframe **breaks the cause→effect chain** — the next beat is a *change of angle*, not a predictable continuation of the PC's last action | the beat re-centers on the drawn Focale rather than linearly extending the PC's intent |
| PV8 | **Le Sanctuaire** (#30, Lieu ▢ ·▲) — the one `Lieu·▲` exception | Reframe: the **place offers unforeseen protection** (a positive *Retournement* via the location) | the rare favourable-location reframe is rendered (place becomes a refuge); confirms the exception is playable, not filtered out |

## How to run

Two-stage harness, mirroring the play loop's oracle↔narrateur split:
1. **Oracle (Part A).** Load `agents/oracle.md`. Provide the parallaxe canon (real file `Perso/RPG/subsystems/parallaxe/systeme/canon/parallaxe.md`, or a domain install at `R/_subsystems/parallaxe/canon/`). For each Part-A situation, have the oracle **filter the pool then draw** (single uniform index 1–54 via Bash) and return the structured Output block (card # + name + axes). Judge filtering + exclusions + Pause handling. (`oracle.md` has `Read, Glob, Bash` — it really draws.)
2. **Narrateur (Part B).** Load `agents/narrateur.md` + `references/response-templates.md`. Hand it each drawn card (Part B fixes the card to isolate the POV behaviour). Judge whether the rendered micro-scene **reframes from the card's Focale** (the decisive observable), reads Phrase/Impulsions/Signe correctly, preserves T9 (never authors the PC's deliberate choices), and breaks linearity. The narrateur (`Read, Glob`, no RNG) **selects/renders**, it does not draw — the draw is the oracle's.

Pass = the **Focale actually drives the vantage of the rendered beat** (Part B) and the draw is correctly filtered/excluded (Part A). A parallaxe result rendered as a PC-centric linear continuation (ignoring the Focale) is a FAIL — that is the defect this suite exists to catch.

## Results log

<!-- append run results here: date, scenario, drawn card + Focale, observed reframe (which vantage?), pass/fail, notes -->

### 2026-06-13 — run 1 (dry-run, canon=`subsystems/parallaxe`) — Part A **5/5 PASS** · Part B **0/8** (1 partiel)

**Part A — oracle : 5/5 PASS.** PX1 route `decision`→parallaxe (pas muses). PX2 exclut Compagnon (pool 41) → tirage réel #21 La Ruine (Lieu·▼). PX3 exclut Hostile ▼ (pool 29) → #26 La Conversion (PNJ·▲). PX4 exclusions vérifiées sur le deck : `Moi·=`=[] , `Tiers·▲`=[#28] , `Lieu·▲`=[#30] , Pause #54 jamais filtrée. PX5 Pause → statu quo, ne débloque pas la décision. **La couche tirage est saine.**

**Part B — narrateur : 0/8 full PASS (PV4 partiel).** **Cause racine : le basculement de point de vue n'a aucun propriétaire au rendu.** `grep parallaxe|Focale|vantage|reframe` dans `narrateur.md` + `response-templates.md` = **0 occurrence**. La table de routage du narrateur n'a que `description`→cinerio et `dialogue`→conversation-cards — **pas de ligne parallaxe**, pas d'étape « lire la Focale tirée → basculer le vantage ». Résultat par Focale :
- **Lieu** (PV1 L'Empreinte, PV8 Le Sanctuaire) → FAIL : aucun rendu « lieu comme entité agissante » (cinerio = description, pas lieu-agent).
- **Tiers** (PV2 L'Ombre) → FAIL : l'absent-qui-pèse ne matche aucune route.
- **Compagnon** (PV3 La Volte) → FAIL : agentivité du compagnon non adressée.
- **PNJ** (PV4 Le Masque) → PARTIEL : seule Focale qui matche (NPC présent → conversation-cards), mais par coïncidence, pas par lecture de la Focale.
- **Moi** (PV5 La Faille) → FAIL + risque T9 : la règle « ne pas révéler les pensées du PJ » pousse **contre** le rendu de l'effondrement intérieur subi.
- **PV6/PV7** (discipline de lecture, anti-linéarité) → FAIL : Impulsions-comme-angles / Signe-à-inventer / « la carte ne dicte pas » vivent dans `parallaxe.md` seulement ; le narrateur n'est pas pointé dessus.

**Écart d'installation (réel).** Oracle attend le chemin complet `R/_subsystems/parallaxe/canon/parallaxe.md` ; le canon réel est à `Perso/RPG/subsystems/parallaxe/**systeme**/canon/parallaxe.md` (divergences : `subsystems` vs `_subsystems`, niveau `systeme/` en trop). En domaine réel non-installé → l'oracle **dégrade** (`[HRP] subsystem parallaxe not installed`) et ne tire jamais → Part B ne reçoit jamais de carte. Ce run n'a marché qu'en pointant le harness sur le canon du dépôt partagé.

**Fix proposé :** (1) `narrateur.md` — section **« Parallaxe — basculement de point de vue »** + ligne de routage `decision`→parallaxe : lire la Focale tirée → basculer le vantage (Moi=mouvement intérieur subi, sans pré-décider le PJ ; Compagnon=agentivité du compagnon / substitution ; PNJ=PNJ présent ; Tiers=absent qui pèse ; Lieu=lieu-entité qui agit/révèle), + discipline de lecture (Phrase/Impulsions-angles/Signe-à-inventer, anti-linéarité). (2) Installation : copier le canon vers `R/_subsystems/parallaxe/canon/` (aplatir `systeme/`, préfixe `_`) **ou** étendre la résolution de l'oracle — décision de convention.

### 2026-06-13 — run 2 (post-fix, dry-run) — Part A **5/5 PASS** · Part B **0/8 → 8/8 PASS**

Décision utilisateur : *l'agent intègre sa propre logique d'oracle* → oracle auto-suffisant (résolution robuste + directive POV), narrateur porte le rendu du basculement.

**Fix appliqué :**
- `narrateur.md` — nouvelle section **« Rendering a parallaxe result — *basculement de point de vue* »** : table Focale→vantage (Moi=mouvement intérieur subi avec **carve-out T9** ; Compagnon=agentivité/substitution ; PNJ=PNJ présent ; Tiers=absent qui pèse ; Lieu=lieu-entité sujet) + discipline de lecture (Phrase / Impulsions-angles / Signe-à-inventer / « la carte ne dicte pas ») + anti-linéarité. Garde-fou : dériver le vantage de la Focale même si la directive POV manque.
- `oracle.md` — Output porte une **directive `POV → <vantage>`** dérivée de la Focale ; **résolution robuste** du canon (logique propre de l'agent : install domaine `R/_subsystems/<nom>/canon/`, puis bibliothèque partagée au niveau collection — `subsystems/<nom>/` **et** top-level `<nom>/`, en `canon/` ou `systeme/canon/`).

**Part B : 8/8** — PV1-PV8 tous FAIL→PASS. PV5 (Moi·▼) : le carve-out T9 sépare le mouvement intérieur *subi* (rendable) de la décision *délibérée* du PJ (hors du narrateur), levant le conflit avec « ne pas révéler les pensées du PJ ». **Part A : 5/5** (aucune régression ; directive POV confirmée dans l'Output, Pause → `POV → — : statu quo`).

**Correction de chemin :** le canon réel est à **`RPG/parallaxe/systeme/canon/parallaxe.md`** (top-level, **sans** `subsystems/`) — découvert au run 2. La résolution robuste de l'oracle a été élargie pour couvrir ce layout (top-level `<nom>/systeme/canon/`) en plus de `subsystems/<nom>/...` et de l'install domaine.

**Intégrité données (vérifiée) :** 54 cartes ; `Moi·=`=∅ ; `Tiers·▲`=[#28 Le Retour] ; `Lieu·▲`=[#30 Le Sanctuaire] ; Pause #54 jamais filtrée.

### 2026-06-13 — run 3 (refactor de division des subsystems, dry-run) — Part A **5/5** · Part B **8/8** (maintenu)

Clarification utilisateur de l'architecture : **narrateur** maîtrise **cinerio** + **conversation-cards** (descriptions + dialogues) ; **oracle** maîtrise **parallaxe** + **muses-et-oracles** (decision + hasard). La maîtrise de parallaxe (mapping Focale→vantage + discipline de lecture) a été **déplacée du narrateur vers l'oracle** ; le narrateur ne fait plus que **rendre** la directive `POV →` de l'oracle avec ses deux subsystems. Division affirmée dans le rôle de chaque agent.

- **oracle.md** : Role « masters muses-et-oracles + parallaxe » ; nouvelle section *Parallaxe — basculement de point de vue (mastery)* (Focale→vantage + Phrase/Impulsions-angles/Signe-à-inventer + anti-linéarité) ; Output `POV → <vantage>` ; résolution robuste élargie au layout réel **top-level `RPG/parallaxe/systeme/canon/`**.
- **narrateur.md** : Role « masters cinerio + conversation-cards ; parallaxe/muses = oracle » ; section parallaxe **allégée** (rendu de la directive : bascule du POV, description→cinerio, dialogue→conversation-cards, carve-out T9 pour Moi, garde-fou si directive absente).

**Résultat : 5/5 + 8/8, aucune régression du refactor.** Ownership propre (rôles cohérents, ligne de routage parallaxe dans la table de l'oracle, absente de celle du narrateur). Aucun trou laissé par le déplacement (l'oracle émet une directive complète ; le narrateur garde les 5 gloses de vantage + carve-out T9 + fallback Focale). Duplication producteur/consommateur de la discipline de lecture = miroir intentionnel, aligné — seul risque : dérive d'édition si une copie change sans l'autre.
