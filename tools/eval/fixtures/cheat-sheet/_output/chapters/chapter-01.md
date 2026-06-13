# Aide-mémoire — Git rebase

| Commande | Effet |
|----------|-------|
| `git rebase <base>` | Rejoue la branche courante sur `<base>`. |
| `git rebase -i <base>` | Rebase interactif (réécrire l'historique). |
| `git rebase --continue` | Reprend après résolution d'un conflit. |
| `git rebase --abort` | Annule le rebase, revient à l'état initial. |

## Rebase interactif — verbes
- `pick` — garder le commit tel quel.
- `reword` — garder, modifier le message.
- `squash` — fusionner dans le commit précédent.
- `drop` — supprimer le commit.

## Conflit
```
# résoudre les fichiers en conflit, puis
git add <fichiers>
git rebase --continue
```
