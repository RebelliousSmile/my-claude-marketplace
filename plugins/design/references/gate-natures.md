# Les deux natures de gate

Énoncé canonique. Toute affirmation sur ce que les gates garantissent renvoie ici et ne le réécrit pas.

Un contrat figé se vérifie contre deux références de natures différentes. Aucune ne remplace l'autre : elles ne répondent pas à la même question et ne peuvent pas se déduire l'une de l'autre.

Leur poids suit `control-priorities.md` : la fidélité rendue et les comportements utilisateur sont P0, la cohérence contractuelle est P1, et le câblage dans le workflow de développement est P2. P0/P1 échoués ou requis mais non mesurés bloquent ; P2 avertit seulement.

| Gate | Oracle | Référence | Établit | N'établit pas |
|---|---|---|---|---|
| **Vocabulaire** | `lint-core.mjs` (Node, 5 règles dérivées du contrat) + import de la feuille de tokens | `tokens.json` · `components.json` · `policies.json` — **interne** | aucune classe ni référence de token hors contrat, **dans le markup effectivement passé au linter** | CSS, liaisons dynamiques, contenu stocké, fichiers de thème de plateforme, couverture des fichiers, rendu calculé |
| **Fidélité** | `measure.py` (`getComputedStyle` + provenance de cascade, par breakpoint/surface) | la référence visuelle résolue par `adjust` — **externe** ; feuilles DS attendues pour la provenance | style calculé conforme **sur chaque élément du gate figé** (`oracle.json § pages`, complet par construction : un élément non mappé est un défaut refusé au gel par `adjust`) ; en FSE, déclaration gagnante issue d'une feuille DS/binding et d'un sélecteur portant la classe DS, sur front + éditeur | les exclusions `skip` du contrat, nommées avec leur raison ; tout breakpoint ou surface non mesuré |

Le gate de vocabulaire est **aveugle au rendu calculé**. On peut être lint-vert et visuellement faux :

- le bon token existe et est « utilisé », mais le markup applique le **mauvais** ;
- une cascade ou une spécificité fait diverger la valeur **calculée** de l'intention ;
- aucune réduction responsive là où la référence en prévoit une.

Symétriquement, un rendu fidèle peut reposer sur un vocabulaire hors contrat, indétectable à la mesure.

**Ce que ni l'un ni l'autre ne couvre** : rôles ARIA, fond réellement appliqué, contraste **du rendu**, et tout fichier hors des cibles déclarées. Ce sont des **gaps déclarés**, pas des vérifications silencieuses.

Le contraste mérite une précision, parce qu'il est le seul point a11y à être coupé en deux. Le contraste **des paires déclarées** est mesuré en amont, au figeage, par `adapters/a11y/contrast.py` sur les valeurs de tokens résolues par thème — il n'est donc pas un gap, il est enregistré dans `release.json § checks.contrast` et pèse sur la maturité (`maturity-status.md`). Ce qui reste hors de portée ici, c'est le contraste **tel qu'il est peint** : `opacity`, `color-mix`, un voile, un dégradé recomposent la couleur après le token, et aucun des deux gates ne les voit. Ce résidu-là est assigné à G6.

Le gate de fidélité lit le registre d'écarts (`references/deviation-ledger-template.md`) pour distinguer un écart sanctionné d'une dérive.

La provenance de cascade n'est pas sanctionnable par ce registre : deux règles peuvent produire la
même valeur aujourd'hui tout en donnant des verdicts opposés. Si WordPress gagne, le composant n'est
pas gouverné par le DS. Une surface authentifiée inaccessible ou une classe DS sans déclaration
inspectable vaut `ownership_unrealized` et maintient le verdict `OPEN`.

## Quand la fidélité ne s'applique pas

Limite assumée, pas un gap silencieux. Le gate de fidélité mesure un rendu contre une **référence visuelle externe**. Un projet construit depuis un brief (`skills/define/actions/03-construct.md`) n'en a aucune : l'oracle n'a rien à mesurer et ne s'applique pas, par nature. C'est distinct d'un oracle non câblé, où une référence existe mais la mesure manque, qui est un refus.

- **Profil de gate** : vocabulaire seul (`lint-core.mjs`), plus les bonnes pratiques visuelles (réduction mobile, cohérence des échelles) jugées en revue humaine. Pas de second gate mesuré.
- **Contraste** : hors de cette revue. Il est mesuré au figeage sur les paires déclarées (`adapters/a11y/contrast.py`) et vit dans `release.json § checks.contrast`.
- **Retour de la fidélité** : dès qu'une référence apparaît (une maquette produite après coup), le gate de fidélité redevient applicable.
- **Non construit** : un gate de substitution (checklist formalisée de réductions responsive et de couverture d'états) servirait de proxy *soft* ; noté comme piste seulement.
