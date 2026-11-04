# sc-pwsh

*Knowledge provider pour les scripts PowerShell : détection de l'hôte visé, audit, compatibilité entre versions et enseignement.*

PowerShell n'a pas de manifeste de projet. `sniff` part du dossier courant, s'arrête à 3 niveaux et lit, **fichier par fichier**, l'hôte que chaque script déclare : Windows PowerShell 5.1 ou PowerShell 7. Les deux divergent sur l'encodage, la syntaxe, les arguments des exécutables natifs et plusieurs valeurs par défaut ; chaque règle du plugin a été mesurée sur les deux hôtes et renvoie à sa ligne de mesure.

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `sniff` | `/sc-pwsh:sniff` | Cherche les `*.ps1` / `*.psm1` dans la borne, rapporte l'hôte déclaré par fichier (`7 only`, `5.1 only`, `both`, `undetermined`), les outils présents (Pester, PSScriptAnalyzer) et les lacunes. Lecture seule |
| `audit` | `/sc-pwsh:audit` | Détecte via `sniff` puis invoque `aidd-dev:04-audit` (`code-quality`) avec le pivot `powershell/idioms.md` ; le rapport AIDD reste autoritatif. Un hôte `undetermined`, ou un signal dont l'effet n'a pas été mesuré, donne `info`, jamais un verdict |
| `legacy` | `/sc-pwsh:legacy` | `scan` liste les constructions que l'hôte déclaré rejette (avec l'hôte qui la rejette) ; une erreur de parse sans ligne correspondante est rapportée à part. `migrate` applique la forme portable mesurée fichier par fichier, après confirmation, en conservant encodage et BOM ; sans forme mesurée, la construction est signalée et laissée à l'utilisateur |
| `teach` | `/sc-pwsh:teach` | Enseigne erreurs, encodage, pipeline, portée et commandes natives, avec la sortie réellement exécutée sur l'hôte visé |

## Pivot

### Capability pivot — chargé à l'audit, non installé sur disque

| Signal de détection | Pivot |
|---|---|
| Au moins un `*.ps1` ou `*.psm1` | `powershell/idioms.md` |

### Référence de `legacy`

`skills/legacy/references/powershell-versions.md` : les écarts entre hôtes mesurés, chacun tenu à une ligne de mesure.

## Absences déclarées

Le plugin ne couvre pas, faute de mesure, et le dit plutôt que de livrer un fichier vide :

- pivots `perf` et `data` ;
- skill `cd` ;
- skill `log-analysis`.

`sniff` signale Pester et PSScriptAnalyzer comme des **faits** détectés et nomme l'absence de pivot comme une lacune.

## Périmètre mesuré

Hôtes mesurés : Windows PowerShell 5.1.22621.4249 et PowerShell 7.6.9, sous Windows. Les autres versions et les hôtes hors Windows ne l'ont pas été : le plugin le dit plutôt que d'extrapoler.

## Licence

MIT — voir [LICENSE](../../LICENSE).
