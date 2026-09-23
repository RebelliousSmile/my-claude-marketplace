#!/usr/bin/env node

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const actionPath = 'plugins/overcode/skills/alias/actions/07-debrief.md';
const templatePath = 'plugins/overcode/skills/alias/assets/debrief.md';
const routerPath = 'plugins/overcode/skills/alias/SKILL.md';
const scenariosPath = 'plugins/overcode/skills/alias/evals/scenarios.json';
const tokenScenariosPath = 'plugins/overcode/skills/alias/evals/debrief-token-scenarios.md';
const read = (path) => readFileSync(path, 'utf8');
const action = read(actionPath);
const template = read(templatePath);
const router = read(routerPath);
const scenarios = JSON.parse(read(scenariosPath));
const tokenScenarios = read(tokenScenariosPath);
const failures = [];
const requireText = (body, needle, label) => {
  if (!body.includes(needle)) failures.push(`${label}: missing ${needle}`);
};

for (const needle of [
  '--focus frictions|skills|skill-quality|prompts|plugins|tokens',
  '--skill <plugin:skill>',
  'at most three candidates',
  'plugin id ending in `@my-marketplace`',
  'potentially editable in its canonical source repository',
  'every other marketplace, built-in or unresolved skill → `external`',
  'never recommend changing its wording, action files, or implementation in this repository',
  'installed cache path is always an inspection source, never an edit target',
  'telemetry only`, `contract inspected`, and `reproduced',
  'absence of correction means `no correction observed`, never `successful execution`',
  '`aidd-telemetry:01-cost` must be present',
  'Only `telemetry.enabled: true` authorizes collection',
  'timeout 10 aidd telemetry read',
  'timeout 10 aidd telemetry report --from <yyyy-mm-dd> --to <yyyy-mm-dd> --json',
  'cost_report_version` is `15`',
  'The CLI is the only source of exact token figures',
  '`aidd-context:12-cook` `token-optimization` recipe',
  'Cache volume is a distribution, not waste by itself',
]) requireText(action, needle, 'action');

for (const needle of [
  '## Skill quality',
  '| Skill | Ownership | Evidence | Contract finding | Allowed action |',
  '## Token use',
  '`exact via aidd-telemetry` / `partial via aidd-telemetry` / `contextual proxies only',
])
  requireText(template, needle, 'template');
for (const needle of ['qualité', '`--skill`', 'usage des tokens']) requireText(router, needle, 'router');

const qualityScenario = scenarios.find((row) => row.prompt
  === 'debrief --focus skill-quality --skill overcode:alias');
if (qualityScenario?.expect_action !== 'debrief')
  failures.push('scenarios: targeted skill-quality route is absent');
const tokensScenario = scenarios.find((row) => row.prompt === 'debrief --focus tokens');
if (tokensScenario?.expect_action !== 'debrief')
  failures.push('scenarios: targeted tokens route is absent');
for (const needle of [
  'aidd-telemetry unavailable',
  'measurement disabled',
  'aidd CLI unavailable',
  'report version 15',
  'unsupported `cost_report_version`',
  'Do not probe telemetry',
  'never zero',
  'contextual proxies',
  'external AIDD skill',
]) requireText(tokenScenarios, needle, 'token scenarios');

const python = action.match(/<<'PY'\n([\s\S]*?)\nPY\n```/)?.[1];
if (!python) failures.push('action: embedded digest extractor not found');
else {
  const syntax = spawnSync('python3', [
    '-c', 'import sys; compile(sys.argv[1], "debrief", "exec")', python,
  ], {
    encoding: 'utf8',
    timeout: 5000,
  });
  if (syntax.status !== 0) failures.push(`extractor: invalid Python (${syntax.stderr.trim()})`);
  for (const needle of [
    '"correction": None', '"reads": []', 'print("skill episodes:")',
    'active_episode = None',
  ])
    requireText(python, needle, 'extractor');

  const temp = mkdtempSync(join(tmpdir(), 'debrief-contract-'));
  try {
    const scriptPath = join(temp, 'debrief-digest.py');
    writeFileSync(scriptPath, python);
    const transcriptDir = join(temp, '.claude/projects/-work-project');
    mkdirSync(transcriptDir, { recursive: true });
    const rows = [
      { type: 'user', timestamp: '2026-09-23T08:00:00Z', message: { content: 'analyse la qualité de cette skill' } },
      { type: 'assistant', timestamp: '2026-09-23T08:00:01Z', message: { content: [{
        type: 'tool_use', id: 'skill-1', name: 'Skill', input: { skill: 'overcode:alias' },
      }] } },
      { type: 'assistant', timestamp: '2026-09-23T08:00:02Z', message: { content: [{
        type: 'tool_use', id: 'read-1', name: 'Read',
        input: { file_path: '/repo/plugins/overcode/skills/alias/actions/07-debrief.md' },
      }] } },
      { type: 'user', timestamp: '2026-09-23T08:00:03Z', message: { content: [{
        type: 'tool_result', tool_use_id: 'read-1', is_error: true, content: 'temporary read error',
      }] } },
      { type: 'user', timestamp: '2026-09-23T08:00:04Z', message: { content: 'non, analyse aussi sa rédaction' } },
    ];
    writeFileSync(join(transcriptDir, 'session.jsonl'), `${rows.map(JSON.stringify).join('\n')}\n`);
    const run = spawnSync('python3', [scriptPath, '/work/project', '30', '8', 'project'], {
      encoding: 'utf8',
      env: { ...process.env, HOME: temp },
      timeout: 5000,
    });
    if (run.status !== 0) failures.push(`extractor: fixture exit ${run.status} (${run.stderr.trim()})`);
    for (const needle of [
      'overcode:alias | prompt=analyse la qualité de cette skill',
      'errors=1',
      'correction=non, analyse aussi sa rédaction',
      'reads=alias/actions/07-debrief.md',
    ]) requireText(run.stdout, needle, 'extractor fixture');
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

if (failures.length) {
  failures.forEach((failure) => console.error(`✗ debrief-contract — ${failure}`));
  process.exit(1);
}
console.log('✓ debrief-contract — provenance, bounded quality evidence, telemetry tokens and extractor syntax');
