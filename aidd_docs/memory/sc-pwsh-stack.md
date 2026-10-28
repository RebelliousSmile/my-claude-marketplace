# sc-pwsh — état de la stack

| Champ | Valeur |
|---|---|
| Version courante | 0.1.0 |
| Date | 2026-10-28 |
| Version du marketplace | 4.6.1, non bumpée par le plan : le dépôt bumpe dans un commit `chore(release)` séparé |
| Plan | `aidd_docs/tasks/2026_10/2026_10_28_sc-pwsh/` |

## Skills

`sniff`, `audit`, `legacy` (`scan` → `migrate`), `teach`. Pas de `cd` (aucun script PowerShell déployé), pas de `log-analysis`, pas d'`improve` (recouvre `audit` + `legacy` à ce volume). À rouvrir sur besoin distinct.

## Pivot et référence

- Capability pivot : `skills/sniff/references/capabilities/powershell/idioms.md`, chargé à l'audit, jamais installé sur disque.
- Référence de `legacy` : `skills/legacy/references/powershell-versions.md`.
- Absences déclarées, faute de mesure : pivots `testing` (Pester 3.4.0 seul, aucun `*.Tests.ps1` trouvé), `perf` et `data`. `pivot-providers.md` reste intact : aucun consommateur `*-optimize` ne vise PowerShell.

## Règle de rédaction des pivots

Chaque règle est mesurée sur les deux hôtes avant d'être écrite. Une forme portable n'est proposée que si elle a elle-même été mesurée ; sinon la construction est signalée et laissée à l'utilisateur (c'est le cas de `?:`, `&&`, `||`, `?.`, `??=`). Un hôte `undetermined`, ou un signal sans effet mesuré, donne `info`, jamais un verdict.

Hôtes mesurés : Windows PowerShell 5.1.22621.4249 et PowerShell 7.6.9, sous Windows, interface en français. Les messages d'erreur sont localisés : seuls `ErrorId` et les types d'exception sont stables d'un poste à l'autre. Autres versions et hôtes hors Windows : non mesurés.

## Tags de mesure

Les tags `[Fn.m]` des skills renvoient à `aidd_docs/tasks/2026_10/2026_10_28_sc-pwsh/measurements.md`, hors du plugin et jamais cité par un `SKILL.md`. Déplacer ou archiver ce dossier laisse ces renvois sans cible.

## Piège de vérification

`pnpm test` se lance depuis **Bash**. Sous PowerShell, `debrief-contract` (overcode, étranger à `sc-pwsh`) échoue sur deux « extractor fixture: missing … » ; il passe sous Bash. L'échec dépend de l'environnement, pas du diff.
