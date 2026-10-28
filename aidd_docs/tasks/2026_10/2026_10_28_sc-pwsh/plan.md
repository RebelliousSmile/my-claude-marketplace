---
objective: "Un plugin `sc-pwsh` 0.1.0 installable, enregistré dans les trois manifestes, avec sniff, audit, legacy et teach, dont chaque affirmation de pivot a été mesurée sur Windows PowerShell 5.1 et PowerShell 7."
status: implemented
---

# Plan: sc-pwsh — plugin réduit (sniff, audit, legacy, teach)

## Overview

| Field      | Value                                                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Goal**   | Donner à PowerShell un plugin de stack sur le modèle des `sc-*`, limité aux skills dont la valeur est établie.               |
| **Source** | Brainstorm de la session du 2026-10-28 (texte), mesures du poste : 87 `.ps1`, `pwsh` 7.6.9 + `powershell.exe` 5.1, Pester 3.4.0, pas de PSScriptAnalyzer. |

## Phases

| #   | Phase                                              | File                         |
| --- | -------------------------------------------------- | ---------------------------- |
| 1   | Mesures sur les deux hôtes                         | [`phase-1.md`](./phase-1.md) |
| 2   | Coquille, enregistrement et sniff                  | [`phase-2.md`](./phase-2.md) |
| 3   | audit et legacy                                    | [`phase-3.md`](./phase-3.md) |
| 4   | teach                                              | [`phase-4.md`](./phase-4.md) |
| 5   | Documentation, vérification et challenge           | [`phase-5.md`](./phase-5.md) |

## Decisions

| Decision                                                                                                                  | Why                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Quatre skills seulement : pas de `cd`, `log-analysis`, `improve`.                                                         | Aucun script PowerShell n'est déployé, aucun log applicatif à analyser ; `improve` recouvre `audit` + `legacy` à ce volume. À rouvrir sur besoin distinct.                       |
| Pas de pivot `testing`, `perf` ni `data` ; l'absence est déclarée.                                                        | Pester 3.4.0 seul et aucun `*.Tests.ps1` trouvé : rien à mesurer. Aucun consommateur `*-optimize` ne vise PowerShell, donc `pivot-providers.md` reste intact. « L'absence déclarée vaut mieux qu'un pivot creux. » |
| Détection par signaux de fichiers (pas de manifeste) avec borne de profondeur écrite dans l'instruction, hôte visé rendu. | PowerShell n'a pas de `Cargo.toml`. La borne se simule contre les chemins réels (depuis les pivots #13). 5.1 et 7 sont installés et divergent : `legacy` et `teach` en dépendent. |
| Chaque affirmation de `idioms.md` et de `powershell-versions.md` est mesurée avant d'être écrite.                          | Méthode des pivots du dépôt : mesurer, jamais déduire ; ce qui ne se mesure pas ici est signalé là où il apparaît.                                                              |
| La version du marketplace n'est pas bumpée par ce plan.                                                                    | Le dépôt bumpe dans un commit `chore(release)` séparé ; le plan n'écrit que `[Unreleased]` du `CHANGELOG.md` racine.                                                             |
