# design

*Plugin de design system mobile-first et responsive : de la référence ou du brief jusqu'à des pages vérifiées, sans réinventer un système à chaque écran.*

Inspiré de la philosophie « ne jamais livrer de l'UI générique par défaut, établir d'abord un design system puis vérifier que le rendu le respecte » — condensé en 6 skills au lieu de plusieurs dizaines.

## Philosophie

- **Mobile-first, vraiment** : la base cible le plus petit écran et le parcours s'y termine seul.
- **Oser l'enrichissement** : contenu enrichi réservé aux grands écrans, toujours *additif*, jamais bloquant.
- **UX mobile-only assumée** : certains patterns (bottom sheet, CTA au pouce) n'existent qu'en mobile, chacun avec son équivalent desktop.
- **Tokens comme source de vérité** : `design/tokens.json` (W3C DTCG) → adaptateurs CSS et Tailwind générés. Aucune valeur en dur.
- **Composants à options** : on étend par variantes, on ne duplique pas.
- **Contrôle** : un audit vérifie wireframes, pages et composants contre le système.

## Workflow

```
référence (collègue) ──▶ /design:from-reference ┐
                                                 ├─▶ design/tokens.json + design-system.md (+ adapters)
brief / user story  ──▶ /design:from-brief      ┘
                                                       │
        /design:setup  (règles 08-design, une fois)    │
                                                       ▼
   /design:wireframe <story>  ──▶  HTML preview vivant (3 breakpoints)
   /design:component <name>   ──▶  spec + implémentation (Vue/React/…)
                                                       │
                                                       ▼
                              /design:audit <cible>  ──▶  rapport conformité
```

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `setup` | `/design:setup` | Installe les règles mobile-first/responsive/a11y dans `.claude/rules/08-design/` |
| `from-reference` | `/design:from-reference` | Établit le design system depuis une référence (screenshot, URL, Figma, CSS) — capture → extract → write-system |
| `from-brief` | `/design:from-brief` | Établit le design system depuis un besoin/user story — clarify → derive → write-system |
| `wireframe` | `/design:wireframe` | User story → preview HTML mobile-first annoté (enrichi / mobile-only) — layout → render |
| `component` | `/design:component` | Composant réutilisable à options — spec → implement |
| `audit` | `/design:audit` | Vérifie wireframe/page/composant contre le système — rapport par sévérité (+ `--fix`) |

## Artefacts produits dans le projet

```
design/
  tokens.json            # source de vérité W3C DTCG
  design-system.md       # foundations + stratégie responsive + inventaire composants
  adapters/tokens.css    # généré — variables CSS
  adapters/theme.css     # généré — @theme Tailwind
  components/<name>.md    # specs composants
  wireframes/<story>.html # previews vivantes
```

Les règles s'installent dans `.claude/rules/08-design/` et s'auto-chargent à l'édition de fichiers UI (`*.vue`, `*.tsx`, `*.css`, `design/**`…).

## Démarrage rapide

```
/design:setup
/design:from-brief        # ou /design:from-reference <référence>
/design:wireframe "en tant que client, je veux régler ma commande"
/design:audit design/wireframes/*.html
```

## Licence

MIT — voir [LICENSE](LICENSE).
