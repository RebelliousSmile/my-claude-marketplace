# Dialogue Quality — Behavioural Test Scenarios (narrateur applies the GO/NO-GO)

Behavioural tests verifying the `narrateur` **applies the dialogue GO/NO-GO** (`references/dialogue-go-no-go.md`) when voicing NPCs — that the checklist (craft of good dialogue), not the `conversation-cards` deck, is the standard. The deck only *amorces* attitude + tempo; a line must still pass GO.

Run via an agent loading `agents/narrateur.md` + `references/response-templates.md` + `references/dialogue-go-no-go.md`, against a populated domain (system + a scene + an NPC). Judge the **rendered line** against the GO list and against the NO-GO failure modes. Pass = the line meets the GO criteria the scenario targets AND avoids the NO-GO ones.

| #   | Situation (NPC voicing) | Expected (GO applied) | Pass criteria |
|-----|-------------------------|------------------------|---------------|
| D1  | A reluctant informant who knows where the missing girl was last seen | Distinct **voice** + serves **motivation** (wants to stay out of it) + **partial info + hook** | the line reveals *something* useful but withholds the rest, in a recognizable voice; **not** an info-dump |
| D2  | The PC asks a direct question the NPC won't answer | **Subtext / deflection** (the unsaid carries weight) — may seed from conversation-cards Passive·Subtle | answer dodges/withholds with a tell (pause, gesture); not a flat "I won't tell you", not a lore dump |
| D3  | One pivotal NPC and one background NPC in the same scene | **Effort-scaled**: the pivotal NPC gets nuance (maybe 2 attitudes); the figurant lands on 1–2 traits | the two are differentiated; the figurant isn't over-written; the pivotal isn't flattened |
| D4  | An NPC in a period/genre setting comments on events | **In-world consistency** — vocabulary/references fit the setting/era | no anachronism; register matches the world |
| D5  | The PC asks the NPC about something the NPC couldn't plausibly know | **Knowledge-bounded** — the NPC only speaks to what it could know | the NPC does not reveal off-screen facts; it speculates/denies within its position |
| D6  | Render an NPC's emotional state | **Reveal through action** — line paired with a physical cue/gesture | a gesture/tell shows the emotion; not stated flatly ("he was angry") |
| D7  | Tempting moment to deliver backstory/lore via the NPC | **Compression** — short, naturalistic, no monologue; lore comes in fragments with a hook | NO-GO avoided: no on-the-nose exposition dump; the info is rationed |
| D8  | The PC has just spoken; continue the NPC beat | **Respect the player** — never author the PC's words/feelings/decision; end on an opening | NO-GO avoided: the narrateur does not narrate the PC's reply; the beat invites the player |
| D9  | A rules/mechanical detail is relevant during the exchange | **HRP/RP separation** — mechanics in `[HRP]`, never in the NPC's mouth | NO-GO avoided: no dice/jauge/rule inside the NPC line (T8/T9) |
| D10 | The oracle/MC has drawn conversation-cards **#2 "What'll you pay?" (Aggressive·Casual)** for a merchant | **Translate the card** (attitude + tempo) into a line that passes GO — not recite the card title | the merchant demands compensation *in its own voice* with subtext/hook; the card is a seed, not the output |

## How to run

Agent-as-narrateur: load `agents/narrateur.md` + `references/response-templates.md` + `references/dialogue-go-no-go.md`, with a minimal real domain (a system from `_systeme/canon/` for tone, a scene, one or two NPCs). For each scenario, render the NPC beat and **score it against `dialogue-go-no-go.md`**: which GO items does it satisfy, which NO-GO does it avoid? A scenario passes only if the targeted GO holds AND no NO-GO is triggered. For D10, verify the conversation-cards draw is used as a *seed* (attitude/tempo) and the line still meets GO — the deck is the tool, the checklist is the bar.

Decisive observables: D1/D7 (info rationed, not dumped), D2 (subtext present), D8 (PC not authored), D9 (mechanics out of the prose), D10 (card translated, not recited).

## Results log

<!-- append run results here: date, scenario, rendered line summary, GO satisfied / NO-GO avoided, pass/fail -->

### 2026-06-13 — run 1 (dialogue quality, dry-run, domain=`monsterhearts`/Snake Bay) — **10/10 PASS**

Le narrateur traite `dialogue-go-no-go.md` comme **la norme** (pointeur « Dialogue quality bar » dans `narrateur.md`), pas le deck conversation-cards. D1-D10 tous PASS, sur PNJ réels de Snake Bay (Delilah, George Cole, Marzoni, Cooper, Nate, Luna, Edenfield, Ian). D7 (anti info-dump : Edenfield lâche un fragment + hameçon, pas le réseau), D8 (ne narre pas le PJ, finit sur ouverture), D9 (mécanique en `[HRP]`, hors réplique), D10 (carte #2 « What'll you pay? » **traduite** en voix de Marzoni, pas récitée).

**Gaps honnêtes (portés par la checklist, pas par les templates de l'agent — premiers à régresser si la checklist est retirée) :** GO 6 *révéler par l'action* (le geste/tell n'est pas nommé dans `narrateur.md` ; Template 4 le marque optionnel) ; GO 11 *effort dosé pivot/figurant* (seulement implicite). Non bloquants (la checklist est référence obligatoire), à durcir éventuellement dans les templates.
