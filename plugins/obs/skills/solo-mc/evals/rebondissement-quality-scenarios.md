# Rebondissement Quality — Behavioural Test Scenarios (oracle applies the GO/NO-GO)

Behavioural tests verifying the `oracle` **applies the rebondissement GO/NO-GO** (`references/rebondissement-go-no-go.md`) when injecting a twist/relance — that the checklist (craft of a good twist), not the `cartes-rebondissements` deck, is the standard. A drawn element is **raw matter**: the oracle must **ground it in the established fiction** and keep it only if it passes GO; otherwise re-draw or discard.

Run via an agent loading `agents/oracle.md` + `references/rebondissement-go-no-go.md`, against a populated domain with **some established fiction** (a campaign with threads/secrets/fronts/NPCs in play — e.g. an active `_campagnes/<c>/` + its session logs). The oracle draws from muses Rebondissements (`R/<…>/muses-et-oracles/…/cartes-rebondissements.md`), then grounds. Judge the **handed-over twist** against GO/NO-GO.

| #   | Situation | Expected (GO applied) | Pass criteria |
|-----|-----------|------------------------|---------------|
| RB1 | A scene stalls; the oracle injects a relance | Draw a Rebondissement element, then **ground it on an established thread/secret/front** — *surprising yet inevitable* | the twist attaches to something already in play and reads as logical-in-hindsight; not free-floating |
| RB2 | The drawn element is a **from-nowhere** item (e.g. « un sosie / a double ») with no setup | **Ground or re-draw** — bind it to an existing NPC/thread, or discard | NO-GO avoided: no brand-new pivotal element with zero prior influence dropped raw |
| RB3 | A drawn element amounts to « it was all a dream » / undoing | **Reject** — it negates player agency / erases events | NO-GO avoided: the oracle does not hand over an agency-erasing twist |
| RB4 | A clue was planted earlier (rule of three) | **Foreshadowed payoff** — the twist recontextualizes the planted clue | the twist pays off existing setup; the player can look back and see it |
| RB5 | The campaign needs forward motion | **Consequential** — the twist raises stakes / forces a hard choice / opens a direction | the result gives the player something to DO; not inert shock |
| RB6 | A tempting sudden "rescue/resolution" surfaces | **Reject deus ex machina** — unprepared solution that resolves arbitrarily | NO-GO avoided: no unforeshadowed convenient fix handed over |
| RB7 | A drawn twist would contradict an established fact | **Continuity-safe** — reconcile, or discard; never contradict in silence | the twist doesn't silently break canon/continuity |
| RB8 | Routing: entropy/relance vs decisional block | **Route correctly** — twist/entropy → muses **Rebondissements**; "no direction imposes itself" → **parallaxe** | the oracle picks Rebondissements for a relance, not parallaxe (and vice-versa) |
| RB9 | Any draw | **Deck as tool, not verdict** — the raw element is matter; grounding + GO is the gate | the oracle treats the draw as a seed it grounds/filters, never narrates it raw as fate |

## How to run

Agent-as-oracle: load `agents/oracle.md` + `references/rebondissement-go-no-go.md`, against a domain with **established fiction** to ground onto (active campaign threads/secrets/fronts; read the session logs + `mj/`). The oracle has `Read, Glob, Bash` — it really draws from `cartes-rebondissements.md` (resolve the subsystem via its own robust logic). For each scenario, have it draw (where applicable), then **ground per `rebondissement-go-no-go.md`** and decide keep / re-draw / discard. Judge the handed-over twist against the GO/NO-GO the scenario targets.

Decisive observables: RB1/RB4 (grounded + foreshadowed, surprising-yet-inevitable), RB2/RB3/RB6 (NO-GO rejected or grounded, not dropped raw), RB5 (consequential/playable), RB8 (correct routing), RB9 (draw treated as seed, not verdict).

> Note on data: muses Rebondissements is a subsystem; if absent in the domain, the oracle graceful-degrades. The **grounding logic** (GO/NO-GO) is testable even with a hand-fed drawn element — the decisive observable is whether the oracle *grounds and filters* rather than handing over raw matter.

## Results log

<!-- append run results here: date, scenario, drawn element + grounding (or reject), GO satisfied / NO-GO avoided, pass/fail -->

### 2026-06-13 — run 1 (rebondissement quality, dry-run, domain=`monsterhearts`/les-fantomes-de-snake-high) — **9/9 PASS**

L'oracle traite `rebondissement-go-no-go.md` comme **la norme** (pointeur « Quality bar » dans la note Rebondissements de `oracle.md`), pas le deck. Tirages réels ancrés sur la fiction établie (Thomas/Fantôme, réseau Jefferson→Nathan→Damon, le bunker, la clé USB, les fronts) :
- **Ancrage GO** : RB1 (Soudain « PNJ mort depuis longtemps » → ancré sur Warren = victime-fantôme de Jefferson, surprenant-mais-inévitable), RB4 (« certains PNJ ne sont pas réels » → paie le foreshadowing des nécrovisions), RB5 (« un incendie » → bunker, force un choix preuve vs Kate), RB7 (« sacrifice » → réconcilié avec la continuité).
- **Preuve que la norme est la checklist, pas le deck** : la suite a tiré du **vrai contenu NO-GO** du deck et l'oracle l'a **attrapé** — RB3 « tout n'était qu'une illusion/rêve » → **rejeté** (NO-GO annulation), RB6 « un deus ex machina » → **rejeté** (NO-GO non semé), RB2 « un sosie » venu de rien → **re-lié** au réseau de Damon ou écarté. RB9 (« la scène était un rêve » Hors-sentiers) → traité comme **graine** (relecture Rétrocognition), pas narré tel quel.
- RB8 routage correct : relance/entropie → Rebondissements ; blocage décisionnel → parallaxe.

**Caveat honnête** (non bloquant) : RB1/RB4 reposent sur un **retro-plant** de cohérence sur des beats de nécrovision établis — explicitement permis par la checklist (« ou plante-le rétroactivement de façon cohérente »), reste dans le canon. Note domaine : la fiction de cette campagne vit dans `scenes/ACTE_*.md` (pas de logs datés ; `Histoire.md` = stub).
