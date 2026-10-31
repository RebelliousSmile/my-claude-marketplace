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
//   W8  les erreurs d'outils du transcript sont comptées, avec la plage de lignes
//   W9  la liste des fichiers déjà modifiés à la base survit aux ticks suivants
//   W10 au-delà de 10 entrées, un dossier est résumé en une seule entrée
//   W11 un changement de branche est nommé, pas pris pour une réécriture
//   W12 un HEAD reculé est un retour en arrière, un --amend une réécriture
//   W13 un renommage indexé garde son ancien chemin
//   W14 un fichier visé par le transcript hors de la racine est compté et cité

import { mkdtempSync, mkdirSync, writeFileSync, appendFileSync, readFileSync, rmSync } from 'node:fs';
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
  git('init', '-q', '-b', 'feat');
  git('config', 'user.email', 't@t'); git('config', 'user.name', 't');
  writeFileSync(join(repo, 'a.txt'), 'a\n');
  git('add', '-A'); git('commit', '-qm', 'init');
  writeFileSync(transcript, '{"type":"user"}\n');
  writeFileSync(join(repo, 'pre.txt'), 'déjà là\n');

  const base = tick();
  check('W1', /baseline \| 1 fichier/.test(base) && base.split('\n').length === 1, `ligne de base attendue, reçu: ${base}`);
  check('W2', tick() === '', 'un tick sans changement doit être muet');

  writeFileSync(join(repo, 'b.txt'), 'b\n');
  appendFileSync(join(repo, 'a.txt'), 'x\n');
  appendFileSync(transcript, JSON.stringify({ type: 'assistant', message: { content: [
    { type: 'tool_use', id: '1', name: 'Edit', input: {} },
    { type: 'tool_use', id: '2', name: 'Edit', input: {} },
    { type: 'tool_use', id: '3', name: 'Bash', input: {} },
  ] } }) + '\n');
  appendFileSync(transcript, JSON.stringify({ type: 'user', message: { content: [
    { type: 'tool_result', tool_use_id: '3', is_error: true, content: 'ReferenceError' },
  ] } }) + '\n');
  const before = git('status', '--porcelain');
  const b1 = tick();
  check('W3', /^\[\d\d:\d\d:\d\d\] batch #1 \| files: /.test(b1) && b1.includes('?? b.txt') && b1.includes('M a.txt') && !/, ,|clean  /.test(b1), `lot #1 attendu, reçu: ${b1}`);
  check('W5', b1.includes('(Edit×2 Bash×1'), `outils du transcript, reçu: ${b1}`);
  check('W8', b1.includes('transcript: +2 lines 2-3 (Edit×2 Bash×1 errors×1)'), `erreurs et plage du transcript, reçu: ${b1}`);
  check('W7', git('status', '--porcelain') === before, 'la sonde a modifié le dépôt observé');

  git('add', '-A'); git('commit', '-qm', 'feat: ajoute b');
  const b2 = tick();
  const baseSnap = readFileSync(join(state, 'baseline_snapshot'), 'utf8');
  check('W9', baseSnap.includes('pre.txt') && !baseSnap.includes('b.txt'), `baseline_snapshot réécrit: ${baseSnap}`);
  check('W4', b2.includes('batch #2') && b2.includes('feat: ajoute b'), `commit attendu dans le lot #2, reçu: ${b2}`);

  const i1 = tick('--idle', '0');
  check('W6', i1 === '', `--idle 0 ne doit rien émettre, reçu: ${i1}`);
  spawnSync('sleep', ['1.1']);
  const i2 = tick('--idle', '1');
  const i3 = tick('--idle', '1');
  check('W6', /idle \d+s/.test(i2) && i3 === '', `idle attendu une seule fois, reçu: "${i2}" puis "${i3}"`);

  mkdirSync(join(repo, 'dist'));
  for (let i = 1; i <= 12; i++) writeFileSync(join(repo, 'dist', `f${i}.js`), `${i}\n`);
  const bulk = tick();
  check('W10', bulk.includes('?? dist/ (12 entries)') && !bulk.includes('dist/f1.js'), `dossier résumé attendu, reçu: ${bulk}`);
  rmSync(join(repo, 'dist'), { recursive: true, force: true });
  tick();

  git('branch', 'main', 'HEAD~1');
  git('switch', '-q', 'main');
  const sw = tick();
  check('W11', /branch: feat → main \(HEAD \w+ → \w+\)/.test(sw) && !sw.includes('réécriture'), `changement de branche attendu, reçu: ${sw}`);
  git('switch', '-q', 'feat');
  tick();

  git('reset', '-q', '--hard', 'HEAD~1');
  const back = tick();
  check('W12', back.includes('retour en arrière sur feat') && !back.includes('réécriture'), `retour en arrière attendu, reçu: ${back}`);
  git('commit', '-q', '--amend', '-m', 'init-bis');
  const amend = tick();
  check('W12', amend.includes("réécriture d'historique ?") && amend.includes('init-bis'), `réécriture attendue, reçu: ${amend}`);

  git('mv', 'a.txt', 'renamed.txt');
  const mv = tick();
  check('W13', mv.includes('R a.txt -> renamed.txt'), `renommage avec ancien chemin attendu, reçu: ${mv}`);

  appendFileSync(transcript, JSON.stringify({ type: 'assistant', message: { content: [
    { type: 'tool_use', id: '9', name: 'Edit', input: { file_path: '/elsewhere/shop-coupon/total.ts' } },
    { type: 'tool_use', id: '10', name: 'Edit', input: { file_path: join(repo, 'inside.txt') } },
  ] } }) + '\n');
  const out = tick();
  check('W14', out.includes('outside×1: /elsewhere/shop-coupon/total.ts'), `travail hors racine attendu, reçu: ${out}`);
} finally {
  rmSync(repo, { recursive: true, force: true });
  rmSync(state, { recursive: true, force: true });
  rmSync(transcript, { force: true });
}

for (const f of failures) console.log(`✗ ${f}`);
console.log(failures.length ? `control-watch — ${failures.length} échec(s)` : '✓ control-watch — contrat de la sonde tenu');
process.exit(failures.length ? 1 : 0);
