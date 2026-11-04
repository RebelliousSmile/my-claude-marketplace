# Changelog — sc-pwsh

## [0.1.1] — 2026-10-31

### Changed

- `sniff` et le README ne déclarent plus l'absence d'un pivot `testing` : son seul consommateur, l'ancienne skill `overcode:control`, a été retiré (overcode 6.0.0).

## [0.1.0] — 2026-10-28

### Added

- Skill `sniff` : détecte les scripts PowerShell dans une borne de 3 dossiers et l'hôte que chacun déclare, sans l'additionner en verdict de projet.
- Skill `audit` : délègue à `aidd-dev:04-audit` (`code-quality`) avec le pivot `powershell/idioms.md` ; chaque verdict est conditionné à l'hôte déclaré ou mesuré.
- Skill `legacy` (`scan` → `migrate`) : constructions rejetées par l'hôte déclaré, formes portables lorsqu'elles ont été mesurées (sinon laissées à l'utilisateur), migration confirmée fichier par fichier avec re-parse.
- Skill `teach` : explication et exercices, sortie exécutée sur l'hôte visé plutôt que citée de mémoire.
- Absences déclarées : pas de pivot testing, perf ni data, pas de `cd` ni de `log-analysis`.
