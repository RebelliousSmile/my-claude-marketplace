const fs = require('fs');
const path = require('path');

const SCRIPT = fs.readFileSync(path.join(__dirname, '..', 'indesign', 'run-elevated.ps1'), 'utf8');
const BODY = SCRIPT.replace(/<#[\s\S]*?#>/, '')
  .split('\n')
  .filter((line) => !line.trim().startsWith('#'))
  .join('\n');

/** Lanceur PowerShell : le contrat se vérifie sur le texte, aucune tâche planifiée n'est créée par les tests. */
describe('run-elevated.ps1', () => {
  it("enregistre une tâche élevée de l'utilisateur de la session, sans invite", () => {
    expect(BODY).toMatch(/New-ScheduledTaskPrincipal[^\n]*-LogonType Interactive[^\n]*-RunLevel Highest/);
    expect(BODY).toMatch(/Register-ScheduledTask/);
    expect(BODY).toMatch(/Start-ScheduledTask/);
  });

  it("désenregistre la tâche et supprime le job dans un finally, jamais seulement sur le chemin heureux", () => {
    const finallyBlock = BODY.slice(BODY.lastIndexOf('} finally {'));
    expect(finallyBlock).toMatch(/Unregister-ScheduledTask/);
    expect(finallyBlock).toMatch(/Remove-Item -LiteralPath \$jobFile/);
  });

  it("ne teste jamais l'élévation du processus courant : la tâche est toujours utilisée", () => {
    expect(BODY).not.toMatch(/IsInRole|Test-Elevated/);
  });

  it('ne garde le journal que sur un échec', () => {
    const finallyBlock = BODY.slice(BODY.lastIndexOf('} finally {'));
    expect(finallyBlock).toMatch(/\$code -eq 0 -or \$code -eq 2/);
    expect(finallyBlock).toMatch(/Remove-Item -LiteralPath \$logFile/);
  });

  it("saute l'attente de la fin d'InDesign sur le code 2, que run-indesign.ps1 ne ferme pas", () => {
    const waits = BODY.split('\n').filter(line => /Wait-InDesignExit/.test(line) && !line.includes('function'));
    expect(waits.length).toBe(1);
    waits.forEach(line => expect(line).toMatch(/\$code -ne 2/));
  });

  it("n'attend jamais la fin d'InDesign en le tuant", () => {
    expect(BODY).not.toMatch(/Stop-Process/);
    expect(BODY).not.toMatch(/\.Kill\(/);
  });

  it('rend le code 5 au délai dépassé et donne le chemin du journal', () => {
    expect(BODY).toMatch(/Délai dépassé[^\n]*Journal : \$logFile/);
    expect(BODY).toMatch(/\$code = 5/);
    expect(BODY).toMatch(/Stop-ScheduledTask/);
  });

  it('fait passer le JSON par un fichier de job, jamais par la ligne de commande de la tâche', () => {
    expect(BODY).toMatch(/-Job "\{1\}"/);
    expect(BODY).not.toMatch(/New-ScheduledTaskAction[^\n]*\$ArgsJson/);
  });

  it('termine le journal par le marqueur lu par le mode externe', () => {
    expect(BODY).toMatch(/\$Marker = '=== FIN '/);
    expect(BODY).toMatch(/WriteLine\("\$Marker\$code ==="\)/);
  });

  it('nomme la tâche doc-pdf-<pid>-<horodatage>', () => {
    expect(BODY).toMatch(/\$taskName = "doc-pdf-\$id"/);
    expect(BODY).toMatch(/\$id = '\{0\}-\{1\}' -f \$PID, \(Get-Date -Format 'yyyyMMddHHmmss'\)/);
  });
});
