# Mesures — Windows PowerShell 5.1 et PowerShell 7

Journal daté du 2026-10-28, appendice du plan `sc-pwsh` : jamais cité par un `SKILL.md`. Chaque ligne a été **exécutée** sur les deux hôtes ; aucune n'est une déduction. Ce qui ne s'est pas exécuté figure en [Non mesurable](#non-mesurable-sur-ce-poste).

## Hôtes

| Hôte                     | Version         | Édition | Binaire                                                       |
| ------------------------ | --------------- | ------- | ------------------------------------------------------------- |
| Windows PowerShell       | 5.1.22621.4249  | Desktop | `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`   |
| PowerShell               | 7.6.9           | Core    | `pwsh`                                                        |

Système : Windows 11 Famille 10.0.22621, interface en français. **Conséquence mesurée** : les messages d'erreur sont localisés ; toute règle qui s'appuie sur un texte de message est fausse sur un autre poste, seuls `ErrorId` et les types sont stables. Méthode : une sonde = un bloc exécuté dans l'hôte, fixtures dans le scratchpad de session, supprimées en fin de phase. Pour F6, le récepteur est toujours `powershell.exe` 5.1 (`-File echoargs.ps1`), seul l'appelant change.

Notation : `→` sépare une sonde de ce que l'hôte a rendu ; `≠` marque une divergence entre 5.1 et 7.

## F1 — Encodage

| #     | Sonde (contenu écrit : `aé`)                       | 5.1                                              | 7                                       | ≠ |
| ----- | -------------------------------------------------- | ------------------------------------------------ | --------------------------------------- | - |
| F1.1  | `Set-Content f`                                    | `61 E9 0D 0A` (ANSI cp1252, sans BOM)            | `61 C3 A9 0D 0A` (UTF-8 sans BOM)       | ≠ |
| F1.2  | `Out-File f`                                       | `FF FE 61 00 E9 00 0D 00 0A 00` (UTF-16 LE, BOM) | `61 C3 A9 0D 0A`                        | ≠ |
| F1.3  | `'aé' > f`                                         | identique à F1.2                                 | identique à F1.2 côté 7                 | ≠ |
| F1.4  | `Add-Content f` (même sonde exécutée deux fois sur un fichier neuf) | `61 E9 0D 0A 61 E9 0D 0A` (ANSI)  | `61 C3 A9 0D 0A 61 C3 A9 0D 0A` (UTF-8) | ≠ |
| F1.5  | `Set-Content f -Encoding UTF8`                     | `EF BB BF 61 C3 A9 0D 0A` (BOM)                  | `61 C3 A9 0D 0A` (sans BOM)             | ≠ |
| F1.6  | `Out-File f -Encoding utf8`                        | `EF BB BF 61 C3 A9 0D 0A` (BOM)                  | `61 C3 A9 0D 0A` (sans BOM)             | ≠ |
| F1.7  | `[IO.File]::WriteAllText(f, 'aé')`                 | `61 C3 A9`                                       | `61 C3 A9`                              |   |
| F1.8  | `Get-Content` d'un fichier UTF-8 sans BOM (`aé`)   | points de code `97,195,169` (3 caractères)       | `97,233` (2 caractères)                 | ≠ |
| F1.9  | `-File` d'un script accentué **avec** BOM          | `é` = 233                                        | `é` = 233                               |   |
| F1.10 | `-File` d'un script accentué **sans** BOM          | `é` lu comme `195,169` (2 caractères)            | `é` = 233                               | ≠ |
| F1.11 | `[Text.Encoding]::Default.WebName`                 | `Windows-1252`                                   | `utf-8`                                 | ≠ |
| F1.12 | `$OutputEncoding.WebName`                          | `us-ascii`                                       | `utf-8`                                 | ≠ |

Lecture : sous 5.1, l'écriture par défaut dépend de la cmdlet (ANSI ou UTF-16) et `-Encoding UTF8` ajoute un BOM ; sous 7 tout est UTF-8 sans BOM. Un script UTF-8 **sans BOM** contenant des accents est mal lu par 5.1, correctement par 7.

## F2 — Opérateurs et syntaxe

| #      | Sonde (évaluée comme bloc de script)                       | 5.1                                                | 7                              | ≠ |
| ------ | ---------------------------------------------------------- | -------------------------------------------------- | ------------------------------ | - |
| F2.1   | `$null ?? 'd'`                                             | erreur de syntaxe (jeton `??` inattendu)           | `d`                            | ≠ |
| F2.2   | `$a = $null; $a?.Length` (sans accolades)                  | s'analyse ; rend `0`                               | s'analyse ; rend `0`           |   |
| F2.8   | `$a = $null; $a?[0]` (sans accolades)                      | s'analyse ; erreur d'exécution (index sur null)    | idem                           |   |
| F2.10  | `$a = $null; ${a}?.Length` (avec accolades)                | erreur de syntaxe (`?.Length` inattendu)           | s'analyse ; ne rend rien       | ≠ |
| F2.11  | `$a = $null; ${a}?[0]` (avec accolades)                    | erreur de syntaxe                                  | s'analyse ; ne rend rien       | ≠ |
| F2.12  | `$a = 'abc'; ${a}?.Length` (avec accolades)                | erreur de syntaxe                                  | `3`                            | ≠ |
| F2.3   | `$true ? 'y' : 'n'`                                        | erreur de syntaxe (jeton `?`)                      | `y`                            | ≠ |
| F2.4   | `Get-Item . && 'second'`                                   | erreur de syntaxe (`&&` n'est pas un séparateur)   | `second` s'exécute             | ≠ |
| F2.5   | `Get-Item absent -ErrorAction SilentlyContinue \|\| 'fallback'` | erreur de syntaxe                             | `fallback`                     | ≠ |
| F2.6   | `1..3 \| ForEach-Object -Parallel { $_ * 2 }`              | s'analyse ; **erreur d'exécution** (jeu de paramètres non résolu) | `2 4 6`          | ≠ |
| F2.7   | `$z = $null; $z ??= 1; $z`                                 | erreur de syntaxe (`??=`)                          | `1`                            | ≠ |
| F2.9   | `if ($true) { 'a' }` (contrôle)                            | `a`                                                | `a`                            |   |
| F2.13  | `$o = [pscustomobject]@{A=$null}; $o.A?.B` (ajoutée en phase 5) | erreur de syntaxe (`UnexpectedToken`)         | s'analyse ; ne rend rien       | ≠ |
| F2.14  | `(Get-Item .)?.Name` (ajoutée en phase 5)                  | erreur de syntaxe (`UnexpectedToken`)              | `Marketplace` (nom du dossier) | ≠ |
| F2.15  | `$o = [pscustomobject]@{A=$null}; $o.A?[0]` (ajoutée en phase 5) | erreur de syntaxe (`UnexpectedToken`)         | s'analyse ; ne rend rien       | ≠ |
| F2.16  | `$a = $null; $a?.Length` (contrôle, rejoué en phase 5)     | `0`                                                | `0`                            |   |
| F2.17  | `$v = $null; if ($null -eq $v) { 'd' } else { $v }` (remplacement de `??`) | `d`                               | `d`                            |   |
| F2.18  | `1..3 \| ForEach-Object { $_ * 2 }` (remplacement de `-Parallel`) | `2 4 6`                                     | `2 4 6`                        |   |
| F2.19  | `cmd /c exit 1; if ($?) { 'ok' } else { 'ko' }` (et `exit 0` → `ok`) | `ko` / `ok`                              | `ko` / `ok`                    |   |

Lecture : `$a?.x` sans accolades sur une **variable nue** n'est **pas** un accès conditionnel (le résultat `0` n'est pas une absence) : l'opérateur se reconnaît après `${a}`, après un accès de propriété (`$o.A?.B`, `$o.A?[0]`) ou après une expression entre parenthèses (`(Get-Item .)?.Name`). Les remplacements de `??`, `-Parallel` et le test de `$?` sont mesurés (F2.17–F2.19) ; ceux de `?:`, `&&`, `\|\|` et `?.` **ne le sont pas** (`;` plus `$?` n'a pas la sémantique de `&&`). `-Parallel` n'échoue pas à l'analyse sous 5.1 : seul un hôte réel le révèle, le parseur ne le voit pas (voir F7.7).

## F3 — Erreurs

Sortie d'erreur redirigée (`2>$null`) là où le texte de l'erreur est sans intérêt. Résultats identiques sur les deux hôtes.

| #    | Sonde                                                                 | 5.1 et 7                                            |
| ---- | --------------------------------------------------------------------- | --------------------------------------------------- |
| F3.1 | `try { Get-Item absent 2>$null; 'after' } catch { 'caught' }`         | `after` : l'erreur non terminante n'est pas attrapée |
| F3.2 | `try { Get-Item absent -ErrorAction Stop; 'after' } catch { 'caught' }` | `caught`                                          |
| F3.3 | fonction `{ Write-Error 'x'; 'continued' }` dans `try`                | `continued` : pas attrapée                          |
| F3.4 | `$ErrorActionPreference='Stop'` puis `Get-Item absent` dans `try`     | `caught`                                            |
| F3.5 | `try { [IO.File]::ReadAllText('absent') } catch { 'caught' }`         | `caught` (exception .NET = terminante)              |
| F3.6 | `try { cmd /c exit 3; 'after lastexit=' + $LASTEXITCODE } catch { }`  | `after lastexit=3` : un code de sortie natif n'est pas une erreur |
| F3.7 | `try { throw 'boom' } catch { 'caught: ' + $_ }`                      | `caught: boom`                                      |
| F3.8 | `Get-Item absent -ErrorAction SilentlyContinue` puis `$Error.Count`   | `1` : l'erreur est tue mais enregistrée             |

## F4 — ShouldProcess, `-WhatIf`, `-Confirm`

| #    | Sonde                                                                                  | 5.1                         | 7                           | ≠ |
| ---- | -------------------------------------------------------------------------------------- | --------------------------- | --------------------------- | - |
| F4.1 | fonction `SupportsShouldProcess { Remove-Item $P }` appelée avec `-WhatIf` ; fichier ? | `exists=True` (rien supprimé) | `exists=True`             |   |
| F4.2 | même fonction avec `-Confirm:$false` ; fichier ?                                       | `exists=False`              | `exists=False`              |   |
| F4.3 | fonction `[CmdletBinding()]` **sans** `SupportsShouldProcess` appelée avec `-WhatIf`   | erreur : paramètre inconnu  | erreur : paramètre inconnu  |   |
| F4.4 | `if ($PSCmdlet.ShouldProcess($P,'del'))` avec `-WhatIf` puis sans                      | `skipped` puis `would-run`  | `skipped` puis `would-run`  |   |
| F4.5 | appel .NET `[IO.File]::Delete($P)` dans une fonction `SupportsShouldProcess` avec `-WhatIf` | `exists=False` : **supprimé malgré `-WhatIf`** | `exists=False` : idem |   |
| F4.6 | `$WhatIfPreference = $true` puis fonction `SupportsShouldProcess { Remove-Item }`      | `exists=True`               | `exists=True`               |   |

Lecture : `-WhatIf` se propage aux cmdlets appelées par la fonction, **pas** aux appels .NET (F4.5). Le libellé du message `What if` diffère entre hôtes (et selon la langue) : ne pas s'y fier.

## F5 — Mode strict, `$ErrorActionPreference`, commandes natives

| #    | Sonde                                                                                  | 5.1                                    | 7                                              | ≠ |
| ---- | -------------------------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------- | - |
| F5.1 | `Set-StrictMode -Version Latest; $undefinedVar`                                        | exception                              | exception                                      |   |
| F5.2 | `Set-StrictMode -Version Latest` puis propriété absente d'un objet                     | exception                              | exception                                      |   |
| F5.3 | sans mode strict : `$undefinedVar`                                                     | pas d'erreur                           | pas d'erreur                                   |   |
| F5.4 | valeur par défaut de `$ErrorActionPreference`                                          | `Continue`                             | `Continue`                                     |   |
| F5.5 | `$PSNativeCommandUseErrorActionPreference` (défaut)                                    | **variable inexistante**               | existe, `False`                                | ≠ |
| F5.6 | `$ErrorActionPreference='Stop'` ; `cmd /c exit 3`                                      | continue, `$LASTEXITCODE`=3            | continue, `$LASTEXITCODE`=3                    |   |
| F5.7 | `$ErrorActionPreference='Stop'` + `$PSNativeCommandUseErrorActionPreference=$true` ; `cmd /c exit 3` | continue (variable **ignorée**) | **exception** « code de sortie différent de zéro : 3 » | ≠ |

## F6 — Arguments vers un exécutable natif

Récepteur : `powershell.exe` 5.1 `-File echoargs.ps1`, qui affiche `$args.Count` puis chaque argument.

| #    | Sonde                                              | 5.1 (appelant)                           | 7 (appelant)                       | ≠ |
| ---- | -------------------------------------------------- | ---------------------------------------- | ---------------------------------- | - |
| F6.1 | `$PSNativeCommandArgumentPassing`                  | variable inexistante                     | `Windows`                          | ≠ |
| F6.2 | argument `say "hi"`                                | reçu `say hi` (guillemets perdus)        | reçu `say "hi"`                    | ≠ |
| F6.3 | arguments `''` puis `x`                            | `count=1`, `[x]` (**vide supprimé**)     | `count=2`, `[]`, `[x]`             | ≠ |
| F6.4 | argument `two words`                               | un argument                              | un argument                        |   |
| F6.5 | argument `C:\dir with space\` puis `after`         | `count=1`, `C:\dir with space" after` (fusionné) | `count=2`, correct          | ≠ |
| F6.6 | argument `a"b`                                     | reçu `ab`                                | reçu `a"b`                         | ≠ |

## F7 — Parseur natif `[System.Management.Automation.Language.Parser]`

| #     | Sonde                                                         | 5.1                                              | 7                         | ≠ |
| ----- | ------------------------------------------------------------- | ------------------------------------------------ | ------------------------- | - |
| F7.1  | type disponible sans `Import-Module`                          | oui (assembly `System.Management.Automation`)    | oui                       |   |
| F7.2  | `ParseFile` d'un `function f {` non fermé                     | 1 erreur, `MissingEndCurlyBrace`, ligne 1        | idem                      |   |
| F7.3  | `ParseFile` d'un fichier avec `??`                            | 1 erreur `UnexpectedToken`                       | 0 erreur                  | ≠ |
| F7.4  | `ParseFile` d'un fichier avec `${a}?.Length`                  | 1 erreur `UnexpectedToken` (ligne 2)             | 0 erreur                  | ≠ |
| F7.4b | `ParseFile` d'un fichier avec `$a?.Length` (sans accolades)   | 0 erreur                                         | 0 erreur                  |   |
| F7.5  | `ParseFile` d'un fichier avec ternaire                        | 1 erreur `UnexpectedToken`                       | 0 erreur                  | ≠ |
| F7.6  | `ParseFile` d'un fichier avec `&&`                            | 2 erreurs, première `InvalidEndOfLine`           | 0 erreur                  | ≠ |
| F7.7  | `ParseFile` d'un fichier avec `ForEach-Object -Parallel`      | 0 erreur                                         | 0 erreur                  |   |
| F7.8  | `ParseFile` d'un fichier avec `??=`                           | 1 erreur `UnexpectedToken`                       | 0 erreur                  | ≠ |
| F7.9  | `CommandAst.GetCommandName()` sur `ls`, `iex`, `Invoke-Expression`, `gci`, `%` | rend les noms **tels qu'écrits** (`ls`, `iex`, `gci`, `%`) | idem |   |
| F7.10 | résolution par `Get-Command` (sans profil)                    | `ls`→`Get-ChildItem`, `iex`→`Invoke-Expression`, `gci`→`Get-ChildItem`, `%`→`ForEach-Object` | idem |   |
| F7.11 | `ParseFile` d'un script qui écrirait un fichier-marqueur      | marqueur absent : le parseur n'exécute pas       | idem                      |   |

Lecture : le parseur détecte les erreurs de syntaxe (et lui seul sait dire si un `.ps1` est 7-only pour 5.1, en utilisant le parseur **de 5.1**), pas les `-Parallel` ni toute erreur de liaison de paramètres (F7.7 / F2.6) ; l'arbre rend les alias comme écrits, la résolution demande `Get-Command` (dépend des alias définis sur l'hôte) ; `Invoke-Expression` et `iex` se repèrent par nom de commande. Les messages sont localisés : se fier à `ErrorId`.

## F8 — Déclaration d'hôte

| #    | Sonde                                                         | 5.1                                              | 7                                     | ≠ |
| ---- | ------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------- | - |
| F8.1 | `-File` d'un script `#Requires -Version 7`                    | **refusé**, script non exécuté                   | s'exécute                             | ≠ |
| F8.2 | `-File` d'un script `#Requires -Version 5.1`                  | s'exécute                                        | s'exécute                             |   |
| F8.3 | `-File` d'un script `#Requires -PSEdition Core`               | **refusé**                                       | s'exécute                             | ≠ |
| F8.4 | `-File` d'un script `#Requires -PSEdition Desktop`            | s'exécute                                        | **refusé** (édition non concordante)  | ≠ |
| F8.5 | `-File` d'un script dont la ligne 1 est `#!/usr/bin/env pwsh` | s'exécute (commentaire)                          | s'exécute (commentaire)               |   |
| F8.6 | `Import-PowerShellDataFile mod.psd1`                          | lit `PowerShellVersion=7.0`, `CompatiblePSEditions=Core`, sans contrôle | idem          |   |
| F8.7 | `Test-ModuleManifest mod.psd1` (`PowerShellVersion = '7.0'`)  | **erreur** : version minimale 7.0 requise        | ok                                    | ≠ |
| F8.8 | `Import-Module mod.psd1`                                      | **erreur** : version minimale 7.0 requise        | importé                               | ≠ |
| F8.9 | `$PSEdition` / `$IsWindows`                                   | `Desktop` / variable **inexistante**             | `Core` / `True`                       | ≠ |

Lecture : `#Requires -Version` et `-PSEdition` sont **appliqués** par l'hôte au lancement et lisibles par `sniff` comme déclaration d'hôte ; un `.psd1` est lu sans contrôle par `Import-PowerShellDataFile` mais **appliqué** à l'import ; le shebang est un simple commentaire sous Windows (effet hors Windows non mesurable).

## F9 — Écarts de cmdlets et de défauts

| #     | Sonde                                                        | 5.1                                              | 7                                                          | ≠ |
| ----- | ------------------------------------------------------------ | ------------------------------------------------ | ---------------------------------------------------------- | - |
| F9.1  | `Get-Command Get-WmiObject`                                  | `Cmdlet`, `Microsoft.PowerShell.Management`      | présent, type **`Function`** (module `Microsoft.PowerShell.Management`) | ≠ |
| F9.13 | `(Get-WmiObject Win32_OperatingSystem).Caption`              | `Microsoft Windows 11 Famille`                   | idem : **fonctionne**                                      |   |
| F9.2  | `Get-Command Get-EventLog`                                   | `Cmdlet`                                         | présent, type **`Function`**                               | ≠ |
| F9.14 | `Get-EventLog -LogName Application -Newest 1`                | fonctionne                                       | fonctionne                                                 |   |
| F9.3  | `Get-Command Get-Counter`                                    | `Cmdlet`, `Microsoft.PowerShell.Diagnostics`     | `Cmdlet`, `Microsoft.PowerShell.Diagnostics`               |   |
| F9.15 | `Get-Counter '\Memory\Available MBytes'`                     | erreur « objet introuvable »                     | idem                                                       |   |
| F9.4  | `Get-Content f -Encoding Byte -TotalCount 2`                 | fonctionne (`97`, `195`)                         | **erreur** : `Byte` n'est pas un encodage                  | ≠ |
| F9.10 | `Set-Content f -Value ([byte[]](65,66)) -Encoding Byte`      | fonctionne (`41 42`)                             | **erreur** : `Byte` n'est pas un encodage                  | ≠ |
| F9.5  | `Invoke-WebRequest` possède `-UseBasicParsing`               | oui                                              | oui                                                        |   |
| F9.6  | `ConvertTo-Json` d'un objet imbriqué sur 4 niveaux           | tronqué **en silence** à `"System.Collections.Hashtable"` | même troncature **avec avertissement** (profondeur 2) | ≠ |
| F9.7  | `Join-Path a b c`                                            | **erreur** : paramètre positionnel                | `a\b\c`                                                    | ≠ |
| F9.8  | `Get-Date -AsUTC`                                            | **erreur** : paramètre inconnu                   | `Utc`                                                      | ≠ |
| F9.9  | `'{"a":1}' \| ConvertFrom-Json -AsHashtable`                 | **erreur** : paramètre inconnu                   | hashtable ordonnée                                         | ≠ |
| F9.11 | `Get-ChildItem` possède `-Depth`                             | oui                                              | oui                                                        |   |
| F9.12 | `Test-Connection` possède `-Quiet`                           | oui                                              | oui                                                        |   |
| F9.16 | `Get-Content f -AsByteStream -TotalCount 2` (ajoutée en phase 3) | **erreur** : paramètre inconnu               | `65,66`                                                    | ≠ |
| F9.17 | `Set-Content f -Value ([byte[]](65,66)) -AsByteStream`       | **erreur** : paramètre inconnu                   | écrit `65,66`                                              | ≠ |
| F9.18 | `Join-Path (Join-Path a b) c` (imbriqué)                     | `a\b\c`                                          | `a\b\c`                                                    |   |
| F9.19 | `(Get-Date).ToUniversalTime().Kind`                          | `Utc`                                            | `Utc`                                                      |   |
| F9.20 | `ConvertTo-Json -Depth 5 -Compress` sur 4 niveaux            | complet : `{"a":{"b":{"c":{"d":1}}}}`            | complet, identique                                         |   |
| F9.21 | type de `'{"a":1}' \| ConvertFrom-Json` (sans `-AsHashtable`) | `PSCustomObject`                                | `PSCustomObject`                                           |   |

Lecture : **`Get-WmiObject` et `Get-EventLog` ne sont pas rejetés par 7 sur ce poste Windows** : ils y existent comme fonctions (couche de compatibilité) et répondent. L'idée « cmdlets retirées » ne tient donc pas ici ; la formulation mesurée est « fonction de compatibilité, pas cmdlet native ». Les divergences établies sont : `-Encoding Byte` (rejeté par 7), `Join-Path` à trois segments, `-AsUTC`, `-AsHashtable` (rejetés par 5.1), troncature JSON silencieuse sous 5.1.

## Inventaire du poste (lecture seule)

Date : 2026-10-28. Racines comptées : `my-scripts`, `Perso`, `Code`, `LLM`. Les autres dossiers de `Documents/` n'ont pas été balayés (règle de l'arborescence). Exclus du décompte : `.git`, `node_modules`.

| Racine                       | `.ps1` | Nature                                                                                       |
| ---------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| `my-scripts`                 | 42     | un projet PowerShell (`windows/perso-filing/`)                                               |
| `Perso`                      | 10     | épars : 2 à la racine, 2 à 1 niveau, 4 à 2 niveaux, 2 à 5 niveaux                            |
| `Code`                       | 33     | dans des projets tiers (`obsidian`, `arbre-de-jade`, `scriptami`, `email-to-markdown`, …)    |
| `LLM`                        | 8      | **vendorisés** : `plugins/design/adapters/measure/.venv/…` (paquet Python `playwright`)      |
| **Total**                    | **93** |                                                                                              |

> **Écart avec le plan** : le plan et la session parlent de 87 `.ps1`. Cet inventaire en compte 93 sur quatre racines, dont 8 vendorisés dans un `.venv`. Le chiffre 87 n'est pas reproduit ; il n'est pas utilisé ci-dessous. Les mesures de borne portent sur les 42 de `my-scripts` et les 10 de `Perso`.

Motifs dans `my-scripts` (42 fichiers). **Conventions de projet : elles restent dans la mémoire du projet, pas dans le pivot.**

| Motif                                 | Fichiers |
| ------------------------------------- | -------- |
| `#Requires`                           | 7        |
| `Set-StrictMode`                      | 1        |
| `SupportsShouldProcess`               | 0        |
| `-WhatIf` / `$Apply` / `DryRun`       | 30       |
| `$ErrorActionPreference`              | 22       |
| `Invoke-Expression` / `iex`           | 0        |
| Pester (`Describe` / `It`)            | 0        |
| `*.Tests.ps1`                         | 0        |
| `.psm1` / `.psd1`                     | 1 / 0    |
| Avec BOM                              | 0        |
| Sans BOM dont octets non ASCII        | 42 / 42  |

Observation croisée avec F1.10 : les 42 scripts sont UTF-8 sans BOM et contiennent des accents ; sous 5.1 leurs littéraux accentués seraient lus de travers. C'est un fait de ce projet (hôte visé de fait : 7), pas une règle de pivot.

`git status --porcelain` de `my-scripts` : 5 lignes avant, **identiques** après (HEAD `b07ce5f` inchangé).

## Borne de profondeur de `sniff`

Sans manifeste, `sniff` part du dossier courant : la borne se compte en **dossiers sous le dossier courant**.

| Point de départ simulé                 | Fichiers vus avec une borne de 2 | Avec 3 | Avec 5 |
| -------------------------------------- | -------------------------------- | ------ | ------ |
| `my-scripts` (racine)                  | 14 / 42                          | 42 / 42 | 42 / 42 |
| `my-scripts/windows`                   | 42 / 42                          | 42 / 42 | 42 / 42 |
| `my-scripts/windows/perso-filing`      | 42 / 42                          | 42 / 42 | 42 / 42 |
| `Perso` (épars)                        | 8 / 10                           | 8 / 10  | 10 / 10 |
| `Marketplace` (non-PowerShell)         | 0 / 8 (+ vendorisés exclus)      | 0 / 8   | 0 / 8   |

Simulation : sous `my-scripts`, les fichiers ont 2 (14) ou 3 (28) dossiers sous la racine ; sous `Perso`, les profondeurs sont 0 (2), 1 (2), 2 (4) et 5 (2) ; dans `Marketplace`, les `.ps1` vendorisés sont à 6 et 11 dossiers.

**Borne retenue : 3 dossiers sous le dossier courant**, avec une liste d'exclusion (`.git`, `node_modules`, `.venv`, `venv`, `site-packages`). Raison : 3 est la plus petite borne qui voit tous les `.ps1` du seul projet PowerShell depuis sa racine ; 5 ramènerait deux scripts de `Perso` mais aussi, sans exclusion, des arbres vendorisés. Les fichiers au-delà de la borne sont **signalés comme non scannés**, jamais comme absents.

## Non mesurable sur ce poste

- **PSScriptAnalyzer** : absent ; ses règles et sa sortie ne sont pas mesurées.
- **Pester 5** : absent (3.4.0 seul) ; aucune mesure de syntaxe Pester 5, aucun `*.Tests.ps1`.
- **Hôtes non Windows** (Linux, macOS) : effet du shebang, absence ou présence de `Get-WmiObject` / `Get-EventLog` hors Windows, `$IsLinux` / `$IsMacOS`.
- **Autres versions** : seules 5.1.22621.4249 et 7.6.9 ont été exécutées ; aucune affirmation sur 7.0 à 7.5.
- **Compteurs de performance** : le chemin `\Memory\Available MBytes` est localisé ; F9.15 échoue identiquement sur les deux hôtes et ne conclut rien sur `Get-Counter`.
- **`$PSNativeCommandArgumentPassing` par exécutable** : seul le récepteur `powershell.exe` a été testé ; le mode `Windows` traite à part certains exécutables (scripts batch, `cmd`) : non mesuré.
- **Messages localisés** : mesurés en français uniquement.
