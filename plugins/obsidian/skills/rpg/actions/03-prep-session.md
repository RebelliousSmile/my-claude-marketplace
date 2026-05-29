# 03 - prep-session

Prépare la prochaine session : la feuille de route légère que `solo-mc` consommera au jeu.

## Inputs

- `campagne` (requis) — nom de la campagne.
- `session` — numéro de session (défaut : dernière + 1, déduite de `sessions/`).

## Process

1. **Lire l'état** : `sessions/.session-state.yaml` (lieu courant, PNJ actifs, statuts, comptes à rebours), `config.yaml` (rythme/ton), le scénario actif (`scenarios/`), les fronts actifs (`JDR/<campagne>/fronts.md`), les données d'univers liées (`JDR/univers/<univers>/.docs/canon/` et `.docs/mj/`), et le `journal.md`/backlog du PJ via `pc` si pertinent.
2. **Définir un objectif de session** : la question dramatique probable de la séance (1 phrase).
3. **Lister 3–5 scènes probables** : déclencheur + enjeu + PNJ/lieu concernés (germes, pas script).
4. **Pré-armer l'oracle** : 3–6 questions oui/non ou de destin susceptibles d'être posées, avec leur probabilité — pour fluidifier le jeu avec `solo-mc`.
5. **Avancer les fronts** : quelles horloges progressent si le PJ n'intervient pas.
6. **Tables aléatoires ciblées** (optionnel) : rencontres, complications, butin — adaptées au niveau de chaos du `config.yaml`.
7. **Accroches PJ** : 1–2 hameçons reliés à la ligne rouge / question viscérale.
8. **Écrire** `JDR/<campagne>/prep/session-<n>.md`.

## Outputs

`JDR/<campagne>/prep/session-<n>.md` (objectif, scènes probables, questions oracle pré-armées, fronts à avancer, tables, accroches PJ). Ne modifie pas `.session-state.yaml` (c'est `solo-mc` qui l'écrit au jeu).

## Test

Le fichier de prep liste un objectif de session, ≥ 3 scènes probables et ≥ 3 questions oracle pré-armées, référence le scénario/les fronts actifs, et n'écrit pas dans `.session-state.yaml`.
