<#
 Lanceur élevé d'InDesign : exécute run-indesign.ps1 en administrateur SANS terminal administrateur.

   pwsh -File run-elevated.ps1 -Script <fichier.jsx> [-ArgsJson <json>] [-TimeoutMinutes 60]

 Le COM d'InDesign exige un processus élevé. Depuis un processus ordinaire, ce script enregistre
 une tâche planifiée (RunLevel Highest, LogonType Interactive : l'utilisateur de la session, sans
 invite UAC), la démarre, relaie son journal à l'écran puis la désenregistre. Toujours par la tâche,
 même depuis un processus déjà élevé.

 Codes de sortie : ceux de run-indesign.ps1
                   0 succès · 2 InDesign déjà ouvert · 3 COM indisponible · 4 le script a échoué
                   (ou la tâche s'est arrêtée sans rendre de code)
                   5 délai dépassé : la tâche est arrêtée, le chemin du journal est donné.

 Le JSON des chemins passe par un fichier de job sous %TEMP%, jamais par la ligne de commande de
 la tâche (guillemets, longueur). Le journal (UTF-8) se termine par `=== FIN <code> ===`.
 -Job est le mode interne, lancé par la tâche : ne pas l'appeler à la main.
#>
param(
  [string]$Script = '',
  [string]$ArgsJson = '',
  [int]$TimeoutMinutes = 60,
  [string]$Job = ''
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

$Launcher = Join-Path $PSScriptRoot 'run-indesign.ps1'
$Marker = '=== FIN '
$InDesignExitWaitSeconds = 60

# Lance run-indesign.ps1 dans un pwsh enfant et rend son code ; chaque ligne passe par $OnLine.
function Invoke-Launcher([string]$ScriptPath, [string]$Json, [scriptblock]$OnLine) {
  $arguments = @('-NoProfile', '-File', $Launcher, '-Script', $ScriptPath)
  if ($Json) { $arguments += @('-ArgsJson', $Json) }
  & pwsh @arguments 2>&1 | ForEach-Object { & $OnLine "$_" }
  return $LASTEXITCODE
}

# Le COM d'InDesign rend la main avant que le processus ait disparu : sans cette attente, la
# commande suivante tombe sur le code 2. Jamais de Stop-Process : l'application n'est pas à nous.
function Wait-InDesignExit {
  $deadline = (Get-Date).AddSeconds($InDesignExitWaitSeconds)
  while ((Get-Process -Name InDesign -ErrorAction SilentlyContinue) -and (Get-Date) -lt $deadline) {
    Start-Sleep -Milliseconds 500
  }
}

# --- Mode interne : exécuté par la tâche planifiée, en administrateur --------------------------
if ($Job) {
  $spec = Get-Content -LiteralPath $Job -Raw -Encoding UTF8 | ConvertFrom-Json
  $stream = [System.IO.FileStream]::new($spec.log, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write, [System.IO.FileShare]::Read)
  $writer = [System.IO.StreamWriter]::new($stream, [System.Text.UTF8Encoding]::new($false))
  $writer.AutoFlush = $true
  $code = 4
  try {
    $code = Invoke-Launcher $spec.script $spec.argsJson { param($line) $writer.WriteLine($line) }
  } catch {
    $writer.WriteLine("Lanceur élevé : $($_.Exception.Message)")
    $code = 4
  } finally {
    $writer.WriteLine("$Marker$code ===")
    $writer.Dispose()
  }
  exit $code
}

if (-not $Script) {
  [Console]::Error.WriteLine('Paramètre -Script manquant.')
  exit 4
}

# --- Mode externe : job, tâche planifiée, relais du journal ------------------------------------
# Toujours par la tâche, même depuis un processus déjà élevé : un shell dont le jeton est élevé par
# un autre moyen (terminal lancé en administrateur, outil d'agent) reçoit quand même 0x800702E4 du
# COM d'InDesign, alors que la tâche (RunLevel Highest, session interactive) l'obtient (2026-11-20).
$id = '{0}-{1}' -f $PID, (Get-Date -Format 'yyyyMMddHHmmss')
$taskName = "doc-pdf-$id"
$jobFile = Join-Path $env:TEMP "$taskName.job.json"
$logFile = Join-Path $env:TEMP "$taskName.log"
$code = 4
$registered = $false

try {
  $spec = [ordered]@{ script = $Script; argsJson = $ArgsJson; log = $logFile }
  [System.IO.File]::WriteAllText($jobFile, ($spec | ConvertTo-Json), [System.Text.UTF8Encoding]::new($false))

  $arguments = '-NoProfile -WindowStyle Hidden -File "{0}" -Job "{1}"' -f $PSCommandPath, $jobFile
  $action = New-ScheduledTaskAction -Execute 'pwsh.exe' -Argument $arguments -WorkingDirectory (Get-Location).Path
  $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest
  Register-ScheduledTask -TaskName $taskName -Action $action -Principal $principal -Force | Out-Null
  $registered = $true
  Start-ScheduledTask -TaskName $taskName

  $deadline = (Get-Date).AddMinutes($TimeoutMinutes)
  $offset = 0
  $finished = $false
  $idleSince = $null

  while (-not $finished) {
    if ((Get-Date) -gt $deadline) {
      Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
      [Console]::Error.WriteLine("Délai dépassé ($TimeoutMinutes min) : la tâche est arrêtée, InDesign a pu rester ouvert. Journal : $logFile")
      $code = 5
      break
    }

    # Nouvelles lignes complètes du journal (jamais une ligne coupée au milieu d'un caractère UTF-8).
    if (Test-Path -LiteralPath $logFile) {
      $file = [System.IO.File]::Open($logFile, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
      try {
        $length = $file.Length
        if ($length -gt $offset) {
          $bytes = [byte[]]::new($length - $offset)
          $file.Seek($offset, [System.IO.SeekOrigin]::Begin) | Out-Null
          $read = $file.Read($bytes, 0, $bytes.Length)
          $lastNewline = [Array]::LastIndexOf($bytes, [byte]10, $read - 1)
          if ($lastNewline -ge 0) {
            $chunk = [System.Text.Encoding]::UTF8.GetString($bytes, 0, $lastNewline + 1)
            $offset += $lastNewline + 1
            foreach ($line in ($chunk -split "`r?`n")) {
              if ($line -eq '') { continue }
              if ($line.StartsWith($Marker)) {
                $code = [int](($line.Substring($Marker.Length) -split ' ')[0])
                $finished = $true
              } else {
                [Console]::Out.WriteLine($line)
              }
            }
          }
        }
      } finally { $file.Dispose() }
    }
    if ($finished) { break }

    # Tâche arrêtée sans marqueur (processus tué, pwsh introuvable) : ne pas attendre le délai entier.
    $state = (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue).State
    if ($state -eq 'Running' -or $state -eq 'Queued') {
      $idleSince = $null
    } elseif (-not $idleSince) {
      $idleSince = Get-Date
    } elseif (((Get-Date) - $idleSince).TotalSeconds -gt 20) {
      [Console]::Error.WriteLine("La tâche planifiée s'est arrêtée sans rendre de code. Journal : $logFile")
      $code = 4
      break
    }
    Start-Sleep -Milliseconds 400
  }

  if ($code -ne 2 -and $code -ne 5) { Wait-InDesignExit }
} finally {
  if ($registered) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
  }
  Remove-Item -LiteralPath $jobFile -Force -ErrorAction SilentlyContinue
  # Le journal ne reste que pour comprendre un échec : rien à garder sur un succès ou un refus net.
  if ($code -eq 0 -or $code -eq 2) {
    Remove-Item -LiteralPath $logFile -Force -ErrorAction SilentlyContinue
  }
}

exit $code
