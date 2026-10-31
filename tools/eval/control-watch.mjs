#!/usr/bin/env node
// Contrat de la sonde de `overcode:control` (scripts/watch.sh).
//
// Joue la sonde tick par tick (`--once`) contre un dépôt Git jetable et vérifie :
//   W1  le premier tick pose une ligne de base, et une seule
//   W2  un tick sans changement n'écrit rien
//   W3  un fichier ajouté et un fichier modifié sortent dans UN lot numéroté
//   W4  un commit apparaît dans le lot avec son sujet
//   W5  les appels d'outils du transcript sont comptés par nom
//   W6  la ligne `idle` sort une fois, pas à chaque tick
//   W7  la sonde n'écrit rien dans le dépôt observé

import { mkdtempSync, writeFileSync, appendFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = join(ROOT, 'plugins/overcode/skills/control/scripts/watch.sh');
const repo = mkdtempSync(join(tmpdir(), 'control-repo-'));
const state = mkdtempSync(join(tmpdir(), 'control-state-'));
const transcript = join(state, '..', `control-${process.pid}.jsonl`);
const failures = [];
const check = (code, ok, msg) => { if (!ok) failures.push(`${code} ${msg}`); };

const git = (...args) => spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).stdout.trim();
const tick = (...extra) => {
  const r = spawnSync('bash', [SCRIPT, '--root', repo, '--state', state, '--transcript', transcript, '--once', ...extra], { encoding: 'utf8' });
  if (r.status !== 0) failures.push(`exit ${r.status}: ${r.stderr}`);
  return r.stdout.trim();
};

try {
  git('init', '-q');
  git('config', 'user.email', 't@t'); git('config', 'user.name', 't');
  writeFileSync(join(repo, 'a.txt'), 'a\n');
  git('add', '-A'); git('commit', '-qm', 'init');
  writeFileSync(transcript, '{"type":"user"}\n');

  const base = tick();
  check('W1', /baseline \| 0 fichier/.test(base) && base.split('\n').length === 1, `ligne de base attendue, reçu: ${base}`);
  check('W2', tick() === '', 'un tick sans changement doit être muet');

  writeFileSync(join(repo, 'b.txt'), 'b\n');
  appendFileSync(join(repo, 'a.txt'), 'x\n');
  appendFileSync(transcript, JSON.stringify({ type: 'assistant', message: { content: [
    { type: 'tool_use', id: '1', name: 'Edit', input: {} },
    { type: 'tool_use', id: '2', name: 'Edit', input: {} },
    { type: 'tool_use', id: '3', name: 'Bash', input: {} },
  ] } }) + '\n');
  const before = git('status', '--porcelain');
  const b1 = tick();
  check('W3', /^\[\d\d:\d\d:\d\d\] batch #1 \| files: /.test(b1) && b1.includes('?? b.txt') && b1.includes('M a.txt') && !/, ,|clean  /.test(b1), `lot #1 attendu, reçu: ${b1}`);
  check('W5', b1.includes('transcript: +1 (Edit×2 Bash×1)'), `outils du transcript, reçu: ${b1}`);
  check('W7', git('status', '--porcelain') === before, 'la sonde a modifié le dépôt observé');

  git('add', '-A'); git('commit', '-qm', 'feat: ajoute b');
  const b2 = tick();
  check('W4', b2.includes('batch #2') && b2.includes('feat: ajoute b'), `commit attendu dans le lot #2, reçu: ${b2}`);

  const i1 = tick('--idle', '0');
  check('W6', i1 === '', `--idle 0 ne doit rien émettre, reçu: ${i1}`);
  spawnSync('sleep', ['1.1']);
  const i2 = tick('--idle', '1');
  const i3 = tick('--idle', '1');
  check('W6', /idle \d+s/.test(i2) && i3 === '', `idle attendu une seule fois, reçu: "${i2}" puis "${i3}"`);
} finally {
  rmSync(repo, { recursive: true, force: true });
  rmSync(state, { recursive: true, force: true });
  rmSync(transcript, { force: true });
}

for (const f of failures) console.log(`✗ ${f}`);
console.log(failures.length ? `control-watch — ${failures.length} échec(s)` : '✓ control-watch — contrat de la sonde tenu');
process.exit(failures.length ? 1 : 0);
