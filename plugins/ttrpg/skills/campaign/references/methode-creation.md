# Our method — Preparing a solo TTRPG campaign from canon

This method describes **our** way of producing play material for the `campaign` skill. It deals exclusively with the **craft of preparation** — relationships, situation, NPCs, scenes, clues — and **never** with mechanics. Any rule (reward, tag, challenge, roll) is deferred to the game's `R/_systeme/{canon,mj}/`: we invent no mechanics here.

Three principles govern it from start to finish:

1. **Start from canon.** Everything starts from the established lore (`R/_univers/<univers>/canon/`) and the PC's intention (`R/_pjs/<pj>/intention.md`). We don't create in a vacuum: we extend an existing setting and an existing character.
2. **Prepare a situation, not a plot.** We set up forces, desires and unstable tensions — not a scripted sequence of events. The story emerges from the choices made in play.
3. **Proceed through back-and-forth.** At each step, we **propose several directions**, the user **chooses** (or amends), then we **record** it in `mj/` or the campaign folder. Never a page written in one block without validation.

---

## The process in 7 steps

### Step 1 — Anchor on canon and the PC's intention

**What to do.** Before any creation, read the setting's canon (`canon/terminologie, factions, personnages, histoire, geographie`) and the PC's `intention.md`. Extract three things from it: (a) the campaign's **thematic tension**, framed as an open question whose outcome is not decided ("How far will he betray for his own?"); (b) the PC's **red line / visceral question**; (c) a **palette of signs** that recur (material, color, gesture, sound) that will signature the setting at the table. Propose 2–3 framings of the thematic tension, let the user choose, record it in the campaign synopsis (`R/_campagnes/<campagne>/`).

**Techniques from the corpus that feed it.**
- *Drawing on a theme to generate the prep (theme-driven prep)* — set the theme first, make it a guiding filter; draw it from what the player has signaled they want to explore. (Ron Edwards' Premise, after Egri — [Narrativism: Story Now](http://www.indie-rpgs.com/_articles/narr_essay.html))
- *Describing the setting as a set of signs* — build a bank of detail-signs rather than an exhaustive bible; each detail is a hook that poses a question. (Color in the Forge — [De-signing the Design](https://www.gamedeveloper.com/design/de-signing-the-design-the-semiotics-of-choice))
- *Adapting a work* — when the canon contains a strong narrative, we extract the **situation** from it (who wants what, who opposes whom) and not the sequence of scenes. ([Don't Prep Plots](https://thealexandrian.net/wordpress/4147/roleplaying-games/dont-prep-plots))

### Step 2 — Gather the PC's personal kicker

**What to do.** Ask the user for **one upheaving event** that happened just before play begins, which forces the PC to act and that they cannot ignore. It's the user who writes it (or validates it among our proposals), not us. This event is not resolved in advance: it opens up a range of actions. We then map out what it implies (who, where, what stake) to build the situation **around** it. Record it as the campaign hook.

**Techniques from the corpus that feed it.**
- *Kicker (triggering event authored by the player)* — the kicker comes from the player; the preparer exploits it, doesn't fabricate it, and builds the situation afterward. (Sorcerer, Ron Edwards — [Here's the Kicker](https://stepintorpgs.wordpress.com/2015/04/25/heres-the-kicker-character-creation-and-plot-hooks/))
- *Flags (player signals)* — collect the explicit declarations of intent (goal, relationship, ideal, fear) that the prep will have to target. (Chris Chinn — [Flag Framing](https://bankuei.wordpress.com/2015/01/07/flag-framing-1-setting-up-a-campaign/))
- In solo play, the kicker is co-written with the user: we propose directions drawn from canon, they decide.

### Step 3 — Build the situation: relationship map

**What to do.** List 6 to 10 actors (canon NPCs + NPCs to create + factions), set them as nodes, then draw between them **doubly-charged links**: what unites them AND what gnaws at them ("his sister, whom he protects and whose inheritance he covets"). Density rule: aim for **2–3 links per node**; any node with a single link is weakly integrated (to be reconnected or cut). **Plug the PC into the map** through at least one thread (debt, secret, blood tie). Propose the map, have the links validated, record it in `mj/personnages.md` / `mj/factions.md` (by `[[liant]]` the canon entries without duplicating them).

**Techniques from the corpus that feed it.**
- *Mapping relationships between characters (R-map)* — nodes + directed and asymmetric edges, coded by type and intensity; the map makes the situation unstable and ready to explode without dictating the action. (Ron Edwards, Sorcerer's Soul — [Relationship Maps](http://sgcodex.wikidot.com/relationship-maps))
- *Generating complex relationships between NPCs (ambivalent links)* — each NPC carries a desire of their own + a vector of opposition; the dramatic pressure pre-exists the PC's arrival. ([Relationship Mapping, Gnome Stew](https://gnomestew.com/relationship-mapping/))
- *Imagining a mirror NPC* — place in the map at least one NPC that reflects or inverts the PC ("like him, but who chose the opposite"), plugged in by a need that guarantees the collision. ([Foil — Wikipedia](https://en.wikipedia.org/wiki/Foil_(narrative)))

### Step 4 — Set the situation in motion: fronts, clocks, secrets

**What to do.** The relationship map is static; it needs a **trajectory**. Limit to **≈3 antagonistic forces** (factions, threats, setting dynamics). For each: a name, its **own motivation** (what pushes it to act on its own), a **chain of visible steps** (from bad to worse) if no one intervenes, and the targeted **final catastrophe**. Calibrate the speeds: one slow background one, one or two immediate ones. In parallel, **seed redundant secrets and clues**: for each hidden truth the PC could discover, provide **at least three clues** of different kinds (witness, physical trace, document/deduction), spread across distinct places and NPCs. Propose the forces + their steps, have the user choose which to activate, record the state in `R/_campagnes/<campagne>/`.

> The mechanical formalism of advancement (rolls, ticked segments) does not belong to `campaign`: to advance a force via a rule, defer to `R/_systeme/{canon,mj}/`. Here we prepare **fictional steps** and **deadlines**.

**Techniques from the corpus that feed it.**
- *Fronts and clocks as a preparation tool* — forces endowed with an impulse and visible steps, played "to discover"; ~3 fronts at varied speeds. ([Fronts — Dungeon World SRD](https://www.dungeonworldsrd.com/gamemastering/fronts/), [SlyFlourish](https://slyflourish.com/looking_back_on_fronts.html)) — *Adapted system-agnostic: we keep the idea of forces with a trajectory, we remove the system-specific mechanical vocabulary.*
- *Letting clues and secrets float* — a layer of redundant clues; the three-clue rule; dormant threats that escalate. (Justin Alexander — [Three Clue Rule](https://thealexandrian.net/wordpress/1118/roleplaying-games/three-clue-rule))
- *Moving from scenario to campaign* — keep a state document (forces, dangling threads, hot spots) updated from session to session. ([Scenario Timelines](https://thealexandrian.net/wordpress/4154/roleplaying-games/dont-prep-plots-prepping-scenario-timelines))

### Step 5 — Create and connect the NPCs

**What to do.** For each NPC the situation calls for, set the strict minimum: **one dominant trait + one signature (voice, gesture or object) + one memorable detail**, and above all **what they want** + **what stands in their way**. No long biography: activable bricks. Check that each NPC is **well plugged into the map** (step 3) and, if relevant, give them the role of **mirror** to a PC. Designate at least one NPC as a **bearer of a poisoned gift** (see step 6). Propose a handful of NPCs, have them validated, write the sheets in `mj/personnages.md` (never in `canon/`; `[[lier]]` the canon if you extend it).

> For an NPC's tags/stats (capabilities, threat level), consult `R/_systeme/{canon,mj}/` — do not invent.

**Techniques from the corpus that feed it.**
- *Distinguishing NPCs and making them endearing* — 1–2 salient markers (trait + voice + detail) are enough; keep a register for recurrence and evolution. ([Quick & Dirty Memorable NPCs](http://ragingowlbear.blogspot.com/2018/05/gm-101-quick-dirty-memorable-npcs.html))
- *Creating a memorable antagonist (goal / method / flaw)* — for the central adversary: motivation deepened by repeated "Why?", method in resilient steps, exploitable flaw, hooked to the PC's past. ([The Villain AS Plot](https://theangrygm.com/villains-and-plots-the-villain-as-plot/))
- *Imagining a mirror NPC* (reminder) — an NPC can reflect one PC and invert another.

### Step 6 — Design a playable scenario

**What to do.** First choose the **form** suited to the intention (nodal for investigation/exploration, more directed for a cinematic one-shot) rather than a linear chain by default. Then build the playable material:

- **Scenes that matter.** For each anticipated scene, note the frame (where, who), the **dramatic question** it poses and the **stakes** (what can be won/lost), ready to be stated in one sentence. Frame as close as possible to the decision point.
- **A reserve of trigger-situations.** Prepare 4–8 prompts of one or two sentences each — an event that places the PC before a **choice** that matters, without dictating its outcome ("learn that the princess is a prisoner", not "save the princess"). These are disposable ammunition, not an order of scenes.
- **Contradictory objectives.** Check that the actors' desires overlap and rub against each other: triangulation (an NPC ally of one, threat to the other), single rival resource, incompatible values. The engine is the friction between agendas, not the external obstacle.
- **Poisoned gifts.** For each thing the PC wants, pre-write a **cost anchored in the fiction** (debt, compromising secret, threat that starts, loss of something else) and designate who bears it and when the price will resurface.

Propose the prompts + the frictions, let the user choose which to keep, record the scenario in `R/_campagnes/<campagne>/`.

> **Craft guardrail (Czege Principle).** Never be the sole author **of both the problem and its resolution**. We prepare open problems, not their denouements. In solo play, the resolution is delegated to the host system and to the oracles consumed by `solo-mc` — it's that external source that decides the outcome, not the prep.

**Techniques from the corpus that feed it.**
- *Choosing a suitable narrative structure* — diagnose the intention and choose linear / branched / nodal according to the goal, not by reflex. ([The Shape of Adventure](https://theangrygm.com/the-shape-of-adventure/))
- *Creating a scenario as a situation rather than a plot / Story Now* — fill a toolbox (NPCs, places, objectives, untenable situation), not a synopsis. ([Don't Prep Plots](https://thealexandrian.net/wordpress/4147/roleplaying-games/dont-prep-plots))
- *Bangs (provocative situations forcing a choice)* — frame triggers of choice, not imposed results; even inaction has consequences. (Ron Edwards — [Prepping Bangs](https://thealexandrian.net/wordpress/36768/roleplaying-games/the-art-of-pacing-prepping-bangs))
- *Proposing scenes that matter — framing & stakes* — point of view + dramatic question + stakes; cut early. ([The Art of Pacing: Scene-Framing](https://thealexandrian.net/wordpress/31520/roleplaying-games/the-art-of-pacing-part-2-scene-framing))
- *Diversifying and opposing objectives* — triangulation, rival resource, incompatible ideologies; keep the conflict within the cooperation. ([lumpley games](https://lumpley.games/2021/06/30/powered-by-the-apocalypse-part-7-qa-round-4/))
- *Making poisoned gifts* — offer what the PC wants with an anchored and deferred cost; a credible bearer with their own motivations. ([A Mad Lib For Your Devil's Bargains](https://www.roleplayingtips.com/adventure-building-campaigns/a-mad-lib-for-your-devils-bargains/))
- *Czege Principle* — separate the author of the adversity from the author of the resolution; in solo play, delegate the resolution to the system/oracle. ([Czege Principle](https://rpgmuseum.fandom.com/wiki/Czege_Principle))

### Step 7 — Interweave the threads and trace the arc

**What to do.** At the campaign scale, keep **3 to 5 active threads** (one major, some minor, sometimes one episodic) and organize their **alternation**: who is under the spotlight, when, and where the threads **cross** (an NPC, an object or a place shared by two threads). For the PC, frame an **arc sentence** ("initial state → tension → possible outcome") and the **type** (change / growth / fall / flat arc), without deciding the outcome: it's the player's choice that closes the arc. Lay out the triggers as modifiable hook points. Propose the braiding and the arc, validate, record it in the campaign state document.

**Techniques from the corpus that feed it.**
- *Interweaving plots* — braiding grid (columns = threads, rows = beats), crossing points, balance of spotlight time. ([The Braiding of Plot Threads](https://www.campaignmastery.com/blog/the-braiding-of-plot-threads/))
- *Designing a character arc* — arc sentence, arc type, premise as an open question, triggers as disposable hooks. ([Character Arcs, Gnome Stew](https://gnomestew.com/character-arcs/))
- *Moving from scenario to campaign* — evolving situation + updated state document. ([Scenario Timelines](https://thealexandrian.net/wordpress/4154/roleplaying-games/dont-prep-plots-prepping-scenario-timelines))

### Step 8 — Prepare a session

**What to do.** Before each session: (a) reread the state of the forces/fronts and the hot threads; (b) pull out 4–8 **probable trigger-scenes** anchored on the PC's intention and the most pressing thread, each with its question and stakes in one line; (c) note **a dozen short secrets/clues**, unlocated, ready to be placed wherever the PC will go; (d) advance by one notch the forces whose deadline is due, **descriptively** (we saw the change) or via a fictional trigger; (e) keep all of this **disposable**. Propose the selection, have it validated, write the prep in `R/_campagnes/<campagne>/prep/`. The material is then **consumed by `solo-mc`** at play time — we never play live here.

**Techniques from the corpus that feed it.**
- *Bangs / bandolier of bangs* — stock of triggers per session, modulable and disposable. ([Prepping Bangs](https://thealexandrian.net/wordpress/36768/roleplaying-games/the-art-of-pacing-prepping-bangs))
- *Letting clues float (pre-session secrets)* — a list of about 10 unlocated secrets, distributed over the course of play. ([Three Clue Rule](https://thealexandrian.net/wordpress/1118/roleplaying-games/three-clue-rule))
- *Fronts and clocks* — descriptive vs triggered advancement; the threat's pacing. ([Fronts — DW SRD](https://www.dungeonworldsrd.com/gamemastering/fronts/))

---

## Transversal guardrail: safety and contract (upstream)

Before producing a campaign's sensitive material, check the **social contract** already established (if the `R` domain contains a `CONTRAT_SOCIAL.md`): excluded themes (**lines**) never to make appear, veiled themes (**veils**) to be handled off-screen. The prep must be reworked so that no line is **structurally necessary** to the scenario. Inspired by *Session zero, social contract and guardrails (lines & veils)* — Ron Edwards / John Stavropoulos ([Lines and veils](https://rpgmuseum.fandom.com/wiki/Lines_and_veils)). In solo play, it's the user who sets their own limits; we respect them in everything we record.

---

## End-of-preparation checklist

- [ ] **Canon first**: the prep flows from the setting's `canon/` and the PC's `intention.md` — nothing invented that silently contradicts the canon.
- [ ] **Thematic tension** framed as an open question, not resolved in advance.
- [ ] **PC's kicker** gathered/validated by the user; the situation is built around it.
- [ ] **Relationship map**: 6–10 actors, ≥2–3 links per node, no isolated node, **PC plugged in** through at least one thread.
- [ ] **Ambivalent links** (double charge) and at least one **mirror NPC** of the PC.
- [ ] **≈3 forces** with their own motivation, each with its visible steps and its catastrophe; varied speeds.
- [ ] **Secrets/clues**: ≥3 clues of different kinds per hidden truth, spread out.
- [ ] **NPCs**: trait + signature + detail + desire + opposition; central antagonist with goal/method/flaw.
- [ ] **Scenario as a situation**, not a plot; **structure** chosen according to the intention.
- [ ] **Contradictory objectives** checked (triangulation / rival resource / values).
- [ ] **Poisoned gifts** pre-written: anchored cost, designated bearer, deadline noted.
- [ ] **Czege Principle** respected: open problems, resolution delegated to the system/oracle (never author of both).
- [ ] **Interwoven threads** (3–5), crossing points identified, spotlight time balanced.
- [ ] **PC's arc** framed (sentence + type), outcome left to the player.
- [ ] **Session** ready: 4–8 triggers + ~10 secrets, due forces advanced, disposable material.
- [ ] **No invented mechanics**: every rule reference points to `R/_systeme/{canon,mj}/`.
- [ ] **Lines & veils** respected; no line structurally necessary.
- [ ] **Back-and-forth**: each deliverable was proposed, chosen by the user, then recorded (`mj/` or campaign folder) — never overwritten, but completed.
