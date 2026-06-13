---
type: cheat-sheet
language: fr
---

# Brief — Aide-mémoire Git rebase

Texte **court** : une seule page, pas de table des matières.

## Concept
Aide-mémoire des commandes de `git rebase` pour développeur intermédiaire :
rebase simple, interactif, abandon, résolution de conflit. Format dense,
scannable, prêt à imprimer.

## Données consolidées (inline)
- `git rebase <base>` — rejoue la branche courante sur `<base>`.
- `git rebase -i <base>` — interactif : `pick`, `squash`, `reword`, `drop`.
- Conflit : résoudre → `git add` → `git rebase --continue`.
- Sortie de secours : `git rebase --abort`.

## Contraintes
- Pas de TOC (document court).
- Un seul chapitre.
