# Pivot

## Rôle

Assigner à un réceptacle chaque règle que le cœur portable ne réalise pas, puis brancher son rapport dans le gate. Ce qu'aucun réceptacle ne prend reste **déclaré non réalisé** — visible dans chaque rapport, jamais silencieux.

## Prérequis

- Contrat figé, `usage.rules[]` typé (`${DESIGN_PLUGIN_ROOT}/references/enforcement-registry.md`).
- `01-build-linter` terminé : `run-gates.py` et `gates.config.json` installés.

## Étape 1 — Router chaque règle vers son réalisateur

Le routage part de la **preuve** que la règle doit lire, pas de la stack du projet. Le type d'`enforcement` la nomme ; le registre en déduit le réceptacle.

| `enforcement` | Réceptacle |
|---|---|
| `markup` | aucun — réalisé par le cœur portable, rien à assigner |
| `stylesheet` | `sc-css:design-bridge` |
| `source-graph` | `sc-<langage de la source>:design-bridge` |
| `stored-content`, `platform-config` | `sc-<langage du runtime>:design-bridge` |
| `unrealized` | aucun — déclaré sans réalisateur |

Un même contrat peut ainsi désigner deux réceptacles : le langage des feuilles de style et celui du runtime ne coïncident pas nécessairement.

## Étape 2 — Vérifier la disponibilité de chaque réceptacle désigné

Réceptacle absent de la session ⇒ ses règles restent assignées mais non réalisées. Le gate applique leur priorité : P0/P1 bloque pour preuve manquante, P2 avertit.

## Étape 3 — Émettre le spec, une fois par réceptacle

Format complet : `${DESIGN_PLUGIN_ROOT}/references/sc-pivot-contract.md § Spec d'enforcement`. Deux champs portent le contrat de cette action :

- **Declared rules** — uniquement les règles routées vers ce réceptacle, id et description repris verbatim du contrat. Un réceptacle ne reçoit jamais une règle qu'un autre réalise.
- **Report path** — le fichier où le réceptacle écrit son rapport.
- **Token paths + Token scales** — aplatir les mêmes feuilles de `tokens.json`, résoudre les alias pour
  les valeurs, puis émettre la map canonique de base et une map par overlay sous `themes`. Les paths
  prouvent l'existence d'un nom ; les scales rendent l'appartenance d'une valeur vérifiable sans lecture
  cachée du fichier source.

Puis appeler `/sc-<langage>:design-bridge` avec ce spec en contexte.

## Étape 4 — Consommer le rapport

Déclarer chaque Report path dans `gates.config.json § pivotReports`. Sans cette ligne, le réceptacle peut réaliser toutes ses règles sans que le gate en sache rien : elles resteront listées non réalisées.

Re-jouer le gate et lire le rapport :

Les sept lignes du gate, dans l'ordre où il les imprime — les lignes de règle d'abord, les `VIOLATION` en bloc ensuite :

| Ligne | Lecture |
|---|---|
| `REALIZED <id> (<type>) by <realizer>` | assignée, réalisée, sans violation |
| `REALIZED <id> (unrealized) by <realizer> - the contract declares no realizer for it` | un réceptacle a couvert une règle que le contrat route vers personne — réalisée, et le contrat est périmé sur ce point |
| `UNREALIZED <id> (<type>, <priority>) - <realizer> reports it unrealized` | le réceptacle a lu la règle et dit ne pas la couvrir |
| `UNREALIZED <id> (<priority>) - declared with no realizer` | typée `unrealized` par le contrat, et personne ne l'a couverte |
| `UNREALIZED <id> (<type>, <priority>) - no report from its realizer` | aucun rapport : réceptacle absent, ou non lancé |
| `VIOLATION <target>: <message>` | non conforme, trouvée par le cœur portable — `<target>` est un **chemin de fichier**, exit 1 |
| `VIOLATION <realizer>: <message>` | non conforme, trouvée par un réceptacle — exit 1 |

Le préfixe de `VIOLATION` n'est donc pas toujours un réalisateur : les deux formes viennent de deux producteurs, et rien dans la ligne ne les distingue hors ce que la cible ressemble à un chemin.

Les trois lignes `UNREALIZED` suivent la priorité contractuelle : P0/P1 bloque, P2 avertit. Elles ne se ferment pas en les masquant, mais en installant le réceptacle manquant ou en re-typant la règle.

## Sortie attendue

> Règles routées : N vers `sc-<langage>` (\<ids\>), M réalisées par le cœur portable, P déclarées `unrealized`.
> Rapports branchés dans `gates.config.json § pivotReports` : \<chemins\>.
> Gate : `python design/lint/run-gates.py --config design/lint/gates.config.json` → exit \<0|1\>.
> Non réalisées après ce passage : \<liste, avec pour chacune le réceptacle attendu\>.
