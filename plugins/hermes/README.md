# hermes

*Plugin **source** des skills **natives Hermes Agent** (Nous Research) : `solo-mc` y est écrite au format agentskills.io et **déployée** vers le runtime Hermes (`~/.hermes/skills/`, voir § 4) — elle n'est pas exécutée par Claude Code.*

> **Deux runtimes, deux portages.** Cette version cible **Hermes Agent** : **agent unique** (pas de sous-agents), déploiement `~/.hermes/skills/`. La version **Claude Code** (sous-agents, marketplace) vit dans **`obsidian:solo-mc`**. Les deux partagent le coffre `~/JDR/`.

Le reste de ce README documente l'architecture Hermes que la skill respecte.

---

## 1. L'architecture Hermes Agent (Nous Research)

Hermes Agent est le framework d'agent auto-améliorant de Nous Research, bâti autour d'une **boucle de conversation unique** (`AIAgent`) dotée d'appels d'outils, d'une mémoire persistante et de skills toujours disponibles. Trois piliers la définissent.

### 1.1 La boucle de conversation

Tout passe par une boucle unique et observable (`run_conversation()`) :

1. **Prompt Construction** — assemblage du prompt système en tiers ordonnés.
2. **Provider Resolution** — résolution du backend `(provider, model)`.
3. **API Call** — appel du modèle.
4. **Tool Dispatch** — si des appels d'outils apparaissent, ils sont exécutés (`handle_function_call()`).
5. **Loop** — répétition tant qu'il reste des appels d'outils.
6. **Persistence** — sauvegarde de l'état de session.

### 1.2 L'assemblage de prompt à trois tiers

Le prompt système est **strictement ordonné** `stable → context → volatile`, pour préserver le préfixe mis en cache :

| Tier | Rôle | Contenu |
|---|---|---|
| **Stable** | Identité & garde-fous d'outils | identité de l'agent (`SOUL.md`), guidage des outils, skills, environnement |
| **Context** | Faits externes | messages système appelants, fichiers projet (`.hermes.md`, `AGENTS.md`, `CLAUDE.md`…) |
| **Volatile** | État courant | instantanés mémoire (`MEMORY.md`), profil utilisateur, horodatage, infos de session |

La mémoire est injectée comme un **instantané figé** par tour : les écritures en cours de session touchent le disque mais **ne mutent pas** le prompt déjà mis en cache, jusqu'à une reconstruction explicite.

### 1.3 Le registre d'outils et le format d'appel

Les outils s'auto-enregistrent dans un **registre central** qui collecte leurs schémas. Au niveau modèle, le format de function-calling Hermes est explicite et tagué :

- Les schémas d'outils sont déclarés dans des balises `<tools>…</tools>`.
- Le modèle émet ses appels dans `<tool_call>{"name": …, "arguments": …}</tool_call>`.
- Les résultats reviennent dans `<tool_response>…</tool_response>` (rôle `tool`).

### 1.4 Les six principes architecturaux (contrat)

| Principe | Implication — obligatoire pour ce plugin |
|---|---|
| **Prompt Stability** | Le prompt système ne change pas en cours de conversation, sauf action explicite. |
| **Observable Execution** | Chaque appel d'outil est visible ; la progression est rapportée. |
| **Interruptible** | L'appel modèle et l'exécution d'outil sont annulables par l'utilisateur. |
| **Platform-Agnostic Core** | Un cœur unique sert toutes les interfaces (CLI, gateway, API…). |
| **Loose Coupling** | Les sous-systèmes optionnels passent par le registre, sans dépendance dure. |
| **Profile Isolation** | Chaque profil a config, mémoire et sessions séparées. |

> Sources : [Hermes Agent — Architecture](https://hermes-agent.nousresearch.com/docs/developer-guide/architecture), [Hermes Agent — Prompt Assembly](https://hermes-agent.nousresearch.com/docs/developer-guide/prompt-assembly), [Hermes 3 Technical Report](https://arxiv.org/pdf/2408.11857), [NousResearch/Hermes-Function-Calling](https://github.com/NousResearch/Hermes-Function-Calling).

---

## 2. Transposition à un plugin Claude Code

Un plugin Claude Code tourne sur Claude, pas sur un modèle Hermes : on n'hérite donc pas du runtime Python de Hermes Agent, mais on **adopte son architecture comme convention de conception**. Le mapping est normatif (un composant non conforme n'a pas sa place ici) :

| Concept Hermes | Réalisation dans ce plugin |
|---|---|
| Boucle `AIAgent` / dispatch d'intentions | La **skill routeur** (`SKILL.md`) : table d'actions + dispatch par intention |
| Registre d'outils auto-enregistrés (schéma) | Le dossier **`actions/`** : un fichier numéroté par action, chacun avec `Inputs` (schéma), `Outputs`, `Process`, `Test` |
| Format `<tools>` / `<tool_call>` / `<tool_response>` | Le contrat `Inputs → invocation → Outputs` de chaque action (entrées typées, sortie structurée) |
| (Hermes = **agent unique**, pas de sous-agents) | Les **modules** `references/oracle.md` (décision) et `references/narrateur.md` (voix), **lus et appliqués par l'agent unique** — jamais des sous-agents |
| Mémoire persistante (sessions SQLite) | L'état de jeu sur disque : `.session-state.yaml`, `.current-session`, journaux de session |
| Prompt à trois tiers (stable/context/volatile) | **Stable** = règles transversales (identité, garde-fous) · **Context** = `config.yaml` + règles `canon/mj` · **Volatile** = `.session-state.yaml` lu à chaque action |
| Prompt Stability / écritures atomiques | L'état est **lu à chaque action, écrit uniquement à `play-end`** — jamais muté en silence en cours de tour |
| Profile Isolation | Isolation **par campagne / par jeu** (`JDR/<jeu>/campagnes/<campagne>/`) |

---

## 3. Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `solo-mc` | `/hermes:solo-mc` | Maître de jeu du JDR solo en direct : play, play-resume, play-end, scene, oracle, roll, pj, status, previously, setup, create-character, journal-pdf |

### `solo-mc` — skill native Hermes

`SKILL.md` est au format **agentskills.io** (When to Use / Quick Reference / Procedure / Pitfalls / Verification). L'**agent unique** Hermes exécute tout : il dispatche l'intention vers l'une des 12 actions (`actions/01-play.md` … `12-journal-pdf.md`, chargées à la demande) et applique ses **modules** :

| Module (`references/`) | Rôle |
|---|---|
| `oracle.md` | Moteur de **décision invisible** : tirage de carte (muses-et-oracles), recadrage (parallaxe), Facteur Chaos, vrais dés via `terminal` |
| `narrateur.md` | **Voix du MJ** : narration (cinerio), dialogue (conversation-cards), conventions HRP/RP, boucle micro-scène |
| `response-templates.md` | Templates de sortie (Scene / HRP-RP / Mechanical Q / Dialogue) |

Ce ne sont **pas des sous-agents** (Hermes est mono-agent) : l'agent unique les lit à la demande et les applique lui-même.

La mémoire persistante vit dans le coffre : `<vault>/.current-session`, `…/sessions/.session-state.yaml` (lu à chaque action, écrit à `play-end`), journaux de session. Les règles (système + sous-systèmes `canon/mj`) sont la couche **context**, produites par `rpg-writer:rules-keeper`. `<vault>` est résolu par machine via `~/.jdr.yaml`.

> `solo-mc` consomme la prep produite par `obsidian:rpg` et la fiche de PJ gérée par `obsidian:pc`.

---

## 4. Déploiement vers Hermes Agent

Hermes charge les skills depuis `~/.hermes/skills/<catégorie>/<nom>/SKILL.md` — **pas** depuis le marketplace Claude Code. Sur la machine qui exécute Hermes (le serveur Linux) :

```bash
./deploy-to-hermes.sh   # copie skills/solo-mc → ~/.hermes/skills/rpg/solo-mc/
```

Prérequis sur cette machine : `~/.jdr.yaml` avec `vault:` (ex. `~/JDR`) et `git:`, et les sous-systèmes peuplés dans le coffre (`subsystems/<nom>/systeme/canon/`).

---

## 5. Ajouter un composant

Avant d'ajouter une skill ici, vérifier qu'elle respecte le contrat de la section 1.4 et le format Hermes (agentskills.io, agent unique, modules en `references/`) : les actions exposent un schéma entrée/sortie explicite, l'état persistant est lu en début et écrit atomiquement, et aucune mécanique n'est inventée hors des références `context`. Un composant qui ne tient pas ce contrat appartient à un autre plugin.

## Licence

MIT — voir [LICENSE](../../LICENSE).
