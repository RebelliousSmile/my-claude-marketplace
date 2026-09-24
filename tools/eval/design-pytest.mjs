#!/usr/bin/env node
// Runs the Python adapter tests of the design plugin. Interpreter: DESIGN_PYTHON, otherwise
// `python` on win32 and `python3` elsewhere. Any non-zero pytest exit fails the suite.

import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const python = process.env.DESIGN_PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
const suites = ['plugins/design/adapters/measure/tests', 'plugins/design/adapters/wireframes/tests'];

const tempRoot = resolve('.tmp');
mkdirSync(tempRoot, { recursive: true });
const basetemp = mkdtempSync(join(tempRoot, 'design-pytest-'));
let tested;
try {
  tested = spawnSync(python, ['-m', 'pytest', ...suites, '-q', '--basetemp', basetemp],
    { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } });
} finally {
  rmSync(basetemp, { recursive: true, force: true });
}
if (tested.stdout) process.stdout.write(tested.stdout);
if (tested.stderr) process.stderr.write(tested.stderr);
if (tested.status !== 0) {
  console.error(`✗ design-pytest — ${python} -m pytest exit ${tested.status ?? tested.error?.message}`);
  process.exit(1);
}
console.log('✓ design-pytest — adapters measure + wireframes');
