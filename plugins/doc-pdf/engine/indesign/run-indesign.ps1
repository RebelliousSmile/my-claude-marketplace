<#
 Lanceur COM d'InDesign : exécute un script JavaScript (ExtendScript) dans une instance NEUVE.

   pwsh -File run-indesign.ps1 -Script <fichier.jsx> [-ArgsJson <json>]

 Codes de sortie : 0 succès · 2 InDesign déjà ouvert (refus, rien n'est touché)
                   3 COM indisponible · 4 le script a échoué.

 `New-Object -ComObject InDesign.Application` se rattache à l'instance en cours : on refuse donc
 AVANT tout appel COM si le processus existe, pour ne jamais agir sur le document de l'utilisateur.
 Vérifié de bout en bout en phase 1 (InDesign 2025) : le COM exige un PowerShell lancé en administrateur.
#>
param(
  [Parameter(Mandatory = $true)][string]$Script,
  [string]$ArgsJson = ''
)

$ErrorActionPreference = 'Stop'
# idScriptLanguage.JAVASCRIPT
$JavaScript = 1246973031

if (Get-Process -Name InDesign -ErrorAction SilentlyContinue) {
  [Console]::Error.WriteLine("InDesign est déjà ouvert : fermer ses documents et l'application, puis relancer.")
  exit 2
}
if (-not (Test-Path -LiteralPath $Script)) {
  [Console]::Error.WriteLine("Script introuvable : $Script")
  exit 4
}

try {
  $app = New-Object -ComObject InDesign.Application
} catch {
  [Console]::Error.WriteLine("COM d'InDesign indisponible : $($_.Exception.Message)")
  exit 3
}

try {
  if ($ArgsJson) { $app.ScriptArgs.SetValue('paths', $ArgsJson) }
  $result = $app.DoScript((Resolve-Path -LiteralPath $Script).Path, $JavaScript)
  if ($null -ne $result) { Write-Output $result }
} catch {
  [Console]::Error.WriteLine("Le script InDesign a échoué : $($_.Exception.Message)")
  exit 4
} finally {
  # idSaveOptions.NO
  try { $app.Quit(1852776480) } catch { }
}
