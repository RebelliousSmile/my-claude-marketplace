#!/usr/bin/env node
// Deterministic pre-flight for the design behavioural suites.
// The markdown suites remain the durable judge specs; this guard rejects missing structure,
// lost skill coverage, and the machine-verifiable P0/P1/P2 boundary before a judge run.

import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const skills = ['detail', 'define', 'destructure', 'adjust', 'enforce', 'diffuse', 'wireframes', 'harness'];
const failures = [];
const fail = (message) => failures.push(message);

for (const skill of skills) {
  const base = `plugins/design/skills/${skill}`;
  const suitePath = `${base}/evals/routing-autonomy-scenarios.md`;
  if (!existsSync(suitePath)) { fail(`${skill}: suite routing-autonomy absente`); continue; }
  const suite = readFileSync(suitePath, 'utf8');
  const spec = readFileSync(`${base}/SKILL.md`, 'utf8');
  const scenarioSection = suite.match(/## Scenarios\n([\s\S]*?)\n## How to run/)?.[1] ?? '';
  const scenarioIds = [...scenarioSection.matchAll(/^\| (S\d+) \|/gm)].map((match) => match[1]);

  for (const heading of ['## Scenarios', '## How to run', '## Results log'])
    if (!suite.includes(heading)) fail(`${skill}: section absente ${heading}`);
  if (!suite.includes('Fixture / preconditions')) fail(`${skill}: fixture non nommée`);
  if (scenarioIds.length < 4) fail(`${skill}: ${scenarioIds.length} scénarios, minimum 4`);
  if (!suite.includes('Authority:') || !suite.includes('§'))
    fail(`${skill}: autorité fichier + section absente`);
  const runHeaders = [...suite.matchAll(/^### (\d{4}-\d{2}-\d{2}) — run \d+ \((initial|post-fix|regression|generality), dry-run,[^\n]*\) — \*\*(\d+)\/(\d+) PASS\*\*$/gm)];
  if (!runHeaders.length) fail(`${skill}: run Behave structuré absent`);
  else {
    const latest = runHeaders.at(-1);
    const afterHeader = latest.index + latest[0].length;
    const nextHeader = suite.indexOf('\n### ', afterHeader);
    const latestBlock = suite.slice(latest.index, nextHeader === -1 ? suite.length : nextHeader);
    const verdictRows = [...latestBlock.matchAll(/^\| (S\d+) \|[^\n]*\| (PASS|FAIL|N\/A) \|/gm)];
    const verdictById = new Map();
    for (const [, id, verdict] of verdictRows) {
      if (verdictById.has(id)) fail(`${skill}: dernier run duplique ${id}`);
      verdictById.set(id, verdict);
    }
    for (const id of scenarioIds) {
      if (!verdictById.has(id)) fail(`${skill}: dernier run sans verdict individuel pour ${id}`);
      else if (verdictById.get(id) !== 'PASS') fail(`${skill}: dernier run non vert pour ${id}`);
    }
    for (const id of verdictById.keys())
      if (!scenarioIds.includes(id)) fail(`${skill}: dernier run contient un scénario inconnu ${id}`);
    const expected = scenarioIds.length;
    if (Number(latest[3]) !== expected || Number(latest[4]) !== expected
        || !latestBlock.includes(`**Tally:** ${expected}/${expected} PASS`))
      fail(`${skill}: tally du dernier run incohérent avec ${expected} scénarios`);
  }
  if (!suite.includes('Do not activate') && !suite.includes('Do not activate this skill'))
    fail(`${skill}: aucun NO-GO de déclenchement`);
  if (!/\| Action \| Does \|/.test(spec)) fail(`${skill}: table d'actions Codex absente`);
  if (!spec.includes('## Routing')) fail(`${skill}: routage explicite absent`);
  if (!spec.includes('host-portability.md')) fail(`${skill}: résolution de racine portable absente`);
}

const walkFiles = (directory) => readdirSync(directory).flatMap((name) => {
  const path = join(directory, name);
  return statSync(path).isDirectory() ? walkFiles(path) : [path];
});
for (const path of ['plugins/design/skills', 'plugins/design/agents', 'plugins/design/references',
  'plugins/design/docs'].flatMap(walkFiles).concat('plugins/design/README.md')) {
  if (readFileSync(path, 'utf8').includes('${CLAUDE_PLUGIN_ROOT}'))
    fail(`portabilité: variable hôte encore utilisée dans ${path}`);
}

const copycatFanout = readFileSync('plugins/design/skills/define/actions/05-copycat-fanout.md', 'utf8');
for (const hostSpecific of ['Sonnet', 'Haiku', 'Opus', '`Agent`', '`Workflow`'])
  if (copycatFanout.includes(hostSpecific)) fail(`copycat: primitive hôte encore imposée (${hostSpecific})`);
for (const required of ['hôte', 'modèle par défaut', 'séquentiellement', 'agents/copycat.md'])
  if (!copycatFanout.toLowerCase().includes(required.toLowerCase())) fail(`copycat: fallback portable absent (${required})`);
const copycatContract = readFileSync('plugins/design/agents/copycat.md', 'utf8');
for (const required of ['Greenfield bulk', 'not** run `config-gen.py`', 'Mode B', 'Drift mode only'])
  if (!copycatContract.includes(required)) fail(`copycat: séparation brouillon/contrat absente (${required})`);
for (const required of ['element_map:', 'mockup_url:', 'EVERY target of your config'])
  if (!copycatContract.includes(required)) fail(`copycat: carte des éléments absente des Outputs (${required})`);
const correspondence = readFileSync('plugins/design/references/correspondence-table-template.md', 'utf8');
for (const required of ['## Carte des éléments', 'Mockup URL', 'Carte des éléments revue', 'two different mockup selectors'])
  if (!correspondence.includes(required)) fail(`table de correspondance: carte des éléments absente (${required})`);
if (!copycatFanout.includes('element_map'))
  fail('define: agrégation de la carte des éléments absente');
const freeze = readFileSync('plugins/design/skills/adjust/actions/02-freeze.md', 'utf8');
for (const required of ['### Prouver le gate de fidélité', 'config-gen.py --components design/components.json --tokens design/tokens.json --oracle design/oracle.json --check', '--expect-pages', '--mode A --side mockup', 'UNPLACED', '**sans objet**', 'renvoi à `define`', 'confirmation de l\'utilisateur'])
  if (!freeze.includes(required)) fail(`adjust: gate de fidélité non prouvé au gel (${required})`);
if (freeze.indexOf('### Prouver le gate de fidélité') > freeze.indexOf('## Étape 2bis'))
  fail('adjust: la preuve du gate doit précéder l\'Étape 2bis');

const portability = readFileSync('plugins/design/references/host-portability.md', 'utf8');
if (!portability.includes('Path(SKILL_FILE).resolve().parent.parent.parent'))
  fail('portabilité: formule exécutable de résolution racine absente');
const material = readFileSync('plugins/design/skills/define/actions/04-write-material.md', 'utf8');
for (const required of ['AGENTS.md', '.claude/rules/08-design/', 'les deux'])
  if (!material.includes(required)) fail(`profil optionnel: routage hôte absent (${required})`);

const wireGates = readFileSync('plugins/design/skills/enforce/actions/02-wire-gates.md', 'utf8');
for (const required of ['AGENTS.md', '.claude/rules/', 'aucune surface persistante'])
  if (!wireGates.includes(required)) fail(`wire-gates: surface hôte absente (${required})`);
if (wireGates.includes('porter l\'instruction dans le `SKILL.md`'))
  fail('wire-gates: ne doit jamais modifier une skill installée pour persister une règle projet');
if (wireGates.includes('/design:')) fail('wire-gates: invocation slash Claude encore persistée');

const runGate = (config) => spawnSync('python3', [
  'plugins/design/tools/run-gates.py', '--config',
  `plugins/design/skills/enforce/fixtures/${config}`,
], { encoding: 'utf8' });

const clean = runGate('gates.clean.config.json');
if (clean.status !== 0 || !clean.stdout.includes('WARNING P2'))
  fail('P2: le workflow manquant doit avertir sans bloquer');

const dirty = runGate('gates.dirty.config.json');
if (dirty.status !== 1 || !dirty.stdout.includes('VIOLATION'))
  fail('P1: une violation contractuelle doit bloquer');

const missing = runGate('gates.missing-evidence.config.json');
if (missing.status !== 1 || !missing.stdout.includes('MISSING EVIDENCE'))
  fail('P0/P1: une preuve requise absente doit bloquer');

const maturity = runGate('gates.below-threshold.config.json');
if (maturity.status !== 4)
  fail('maturité: le code public 4 doit rester stable');

const dualHost = spawnSync('python3', [
  'plugins/design/skills/enforce/fixtures/dual-host/design/lint/run-gates.py', '--config',
  'plugins/design/skills/enforce/fixtures/dual-host/design/lint/gates.config.json',
], { encoding: 'utf8' });
if (dualHost.status !== 0)
  fail(`wire-gates: la fixture dual-host doit avoir un gate réellement vert (exit ${dualHost.status})`);
for (const [installed, source] of [
  ['plugins/design/skills/enforce/fixtures/dual-host/design/lint/run-gates.py',
    'plugins/design/tools/run-gates.py'],
  ['plugins/design/skills/enforce/fixtures/dual-host/design/lint/lint-core.mjs',
    'plugins/design/skills/enforce/adapters/lint-core.mjs'],
  ['plugins/design/skills/enforce/fixtures/dual-host/design/lint/status.py',
    'plugins/design/tools/status.py'],
]) {
  if (readFileSync(installed, 'utf8') !== readFileSync(source, 'utf8'))
    fail(`wire-gates: outil installé désynchronisé dans la fixture (${installed})`);
}

const pivotTmp = mkdtempSync(join(tmpdir(), 'design-pivot-evidence-'));
const pivotReport = join(pivotTmp, 'pivot.json');
const pivotConfig = join(pivotTmp, 'gates.config.json');
const pivotContract = join(pivotTmp, 'contract');
cpSync(resolve('plugins/design/skills/enforce/fixtures/utility'), pivotContract, { recursive: true });
const validPivot = {
  realizer: 'design-behave',
  rules: [{ id: 'state-colour-icon', status: 'pass', violations: [] }],
};
const writePivotConfig = (pivotReports) => writeFileSync(pivotConfig, JSON.stringify({
  contract: pivotContract,
  linter: resolve('plugins/design/skills/enforce/adapters/lint-core.mjs'),
  targets: [resolve('plugins/design/skills/enforce/fixtures/utility-clean.html')],
  pivotReports,
}), 'utf8');
const runTempGate = () => spawnSync('python3', [
  'plugins/design/tools/run-gates.py', '--config', pivotConfig,
], { encoding: 'utf8' });

try {
  writeFileSync(pivotReport, JSON.stringify({
    ...validPivot,
    rules: [{ id: 'state-colour-icon', status: 'typo', violations: [] }],
  }), 'utf8');
  writePivotConfig([pivotReport]);
  const invalidStatus = runTempGate();
  if (invalidStatus.status !== 2 || !invalidStatus.stderr.includes('unknown status'))
    fail('pivot: un statut hors enum doit sortir en 2, jamais réaliser une preuve P0');

  writeFileSync(pivotReport, JSON.stringify(validPivot), 'utf8');
  writePivotConfig([{
    path: pivotReport,
    command: [process.execPath, '-e', 'process.exit(2)'],
  }]);
  const staleAfterFailure = runTempGate();
  if (staleAfterFailure.status !== 2 || !staleAfterFailure.stderr.includes('realizer failed'))
    fail('pivot: une commande en échec ne doit jamais recycler un ancien rapport vert');

  writePivotConfig([{ path: pivotReport, command: [] }]);
  const emptyCommand = runTempGate();
  if (emptyCommand.status !== 2 || !emptyCommand.stderr.includes('one or more'))
    fail('pivot: command vide doit être un protocole invalide, pas un rapport nu');

  writeFileSync(pivotReport, JSON.stringify(validPivot), 'utf8');
  writePivotConfig([{
    path: pivotReport,
    command: [process.execPath, '-e', 'process.exit(0)'],
  }]);
  const noRefresh = runTempGate();
  if (noRefresh.status !== 2 || !noRefresh.stderr.includes('produced no report'))
    fail('pivot: exit 0 sans nouveau rapport doit sortir en 2');

  writeFileSync(pivotReport, JSON.stringify(validPivot), 'utf8');
  writePivotConfig([{
    path: pivotReport,
    command: [process.execPath, '-e',
      `require('node:fs').writeFileSync(process.argv[1], ${JSON.stringify(JSON.stringify(validPivot))}); process.exit(1)`,
      pivotReport],
  }]);
  const redButReported = runTempGate();
  if (redButReported.status !== 0)
    fail('pivot: exit 1 qui recrée un rapport valide doit être lu');

  writePivotConfig([{
    path: pivotReport,
    command: [process.execPath, '-e',
      `require('node:fs').writeFileSync(process.argv[1], ${JSON.stringify(JSON.stringify(validPivot))})`,
      pivotReport],
  }]);
  const refreshed = runTempGate();
  if (refreshed.status !== 0)
    fail('pivot: un réalisateur qui renouvelle un rapport valide doit rester vert');

  writeFileSync(pivotReport, JSON.stringify({
    ...validPivot, rules: [{ id: 'undeclared', status: 'pass', violations: [] }],
  }), 'utf8');
  writePivotConfig([pivotReport]);
  const undeclared = runTempGate();
  if (undeclared.status !== 2 || !undeclared.stderr.includes('undeclared rule'))
    fail('pivot: un id de rapport non déclaré doit sortir en 2');

  writeFileSync(pivotReport, JSON.stringify(validPivot), 'utf8');
  writePivotConfig([pivotReport, pivotReport]);
  const duplicateReport = runTempGate();
  if (duplicateReport.status !== 2 || !duplicateReport.stderr.includes('duplicate report'))
    fail('pivot: deux preuves pour la même règle doivent sortir en 2');

  writePivotConfig([join(pivotTmp, 'absent.json')]);
  const bareMissing = runTempGate();
  if (bareMissing.status !== 1 || !bareMissing.stdout.includes('MISSING EVIDENCE'))
    fail('pivot: un rapport nu absent doit laisser la P0 non réalisée, pas sortir en 2');

  writeFileSync(pivotReport, JSON.stringify({ rules: validPivot.rules }), 'utf8');
  writePivotConfig([pivotReport]);
  const legacyReport = runTempGate();
  if (legacyReport.status !== 0)
    fail('pivot: un rapport 2.x sans realizer doit rester compatible');

  const policiesPath = join(pivotContract, 'policies.json');
  const policies = JSON.parse(readFileSync(policiesPath, 'utf8'));
  policies.usage.rules.push({ ...policies.usage.rules[0], priority: 'P2' });
  writeFileSync(policiesPath, JSON.stringify(policies), 'utf8');
  writePivotConfig([]);
  const duplicateContract = runTempGate();
  if (duplicateContract.status !== 2 || !duplicateContract.stderr.includes('duplicate rule id'))
    fail('contrat: deux règles de même id doivent sortir en 2 avant agrégation');

  policies.usage.rules.pop();
  writeFileSync(policiesPath, JSON.stringify(policies), 'utf8');
  const badLinter = join(pivotTmp, 'bad-linter.mjs');
  writeFileSync(badLinter, 'process.stdout.write("not-json")', 'utf8');
  writeFileSync(pivotConfig, JSON.stringify({
    contract: pivotContract,
    linter: badLinter,
    targets: [resolve('plugins/design/skills/enforce/fixtures/utility-clean.html')],
  }), 'utf8');
  const malformedLinter = runTempGate();
  if (malformedLinter.status !== 2 || !malformedLinter.stderr.includes('invalid JSON'))
    fail('linter: JSON malformé doit sortir proprement en 2');

  writeFileSync(badLinter, 'process.exit(7)', 'utf8');
  const unexpectedLinterExit = runTempGate();
  if (unexpectedLinterExit.status !== 2 || !unexpectedLinterExit.stderr.includes('unsupported exit 7'))
    fail('linter: exit hors protocole doit sortir en 2');
} finally {
  rmSync(pivotTmp, { recursive: true, force: true });
}

const readme = readFileSync('README.md', 'utf8');
for (const plugin of ['aidd-context', 'aidd-dev', 'aidd-refine'])
  if (!readme.includes(`codex plugin add ${plugin}@aidd-framework`))
    fail(`prérequis Codex absent du README: ${plugin}`);
if (!readme.includes('codex plugin add design@my-marketplace'))
  fail('installation Codex du plugin design absente du README');

if (failures.length) {
  for (const failure of failures) console.error(`✗ design-behave — ${failure}`);
  process.exit(1);
}

console.log(`✓ design-behave — ${skills.length}/${skills.length} suites structurées, autonomie + P0/P1/P2 vérifiées`);
