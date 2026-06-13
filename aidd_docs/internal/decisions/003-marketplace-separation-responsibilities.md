# Decision: Séparation des responsabilités marketplace + domaines JDR locaux autonomes

| Field | Value |
|---|---|
| ID | DEC-003 |
| Date | 2026-06-13 |
| Feature | Marketplace v3.0.0 — obsidian, writing, JDR |
| Status | Accepted |

## Context

Le marketplace avait des responsabilités croisées : `rpg-writer` et `doc-writer` produisaient du contenu ET assemblaient les intrants ; `obsidian` gérait les notes ET le JDR via un coffre séparé `tnn-jdr` avec configuration globale `~/.jdr.yaml`. Cette superposition rendait les skills non portables et le vault JDR dépendant d'une machine spécifique.

## Decision

Séparation stricte : **`obsidian` assemble les intrants** (brief, lore, données, init projet) ; **`writing` produit** à partir du brief. Les skills JDR migrent vers un **modèle de domaine local autonome** : `R = <jeu>` (sous `Perso/RPG/<jeu>/`), résolu localement via le marqueur `_savoir/`, zéro configuration globale. `tnn-jdr` et `~/.jdr.yaml` abandonnés.

## Alternatives Considered

| Alternative | Pros | Cons | Rejected because |
|---|---|---|---|
| Garder vault JDR séparé + ~/.jdr.yaml | Isolation forte | Dépendance machine, non portable | Contraire au principe "portabilité totale" de la v3 |
| Domaine R partagé inter-jeux | Moins de duplication | Mélange lore/règles entre jeux | Chaque R doit être autonome |

## Consequences

- Portabilité totale : déplacer un répertoire de jeu ne casse aucun skill.
- Chaque `R` contient tout ce dont il a besoin (`_savoir/`, `_campagnes/`, `_pjs/`).
- `writing` est autosuffisant via `_brief/summary.md` (lore/règles consolidés inline).
- `bank.yml` reste un cache de ressources (maintenu par `tree`, lu par `brief`) — n'est plus un input de résolution de chemin.
- `narrateur` et `oracle` sont conservés (load-bearing pour `solo-mc` — 24 invocations).
