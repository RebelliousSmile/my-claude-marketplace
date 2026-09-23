#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const path = 'plugins/overcode/skills/control/evals/authority-scenarios.md';
const source = readFileSync(path, 'utf8');
const marker = '\n## Results log\n';
const split = source.indexOf(marker);
if (split < 0) {
  process.stderr.write('control-authority-criteria: Results log marker missing\n');
  process.exit(1);
}
const criteria = source.slice(0, split).trimEnd() + '\n';
const required = ['## Scenarios', '| S17 |', '## How to run'];
const forbidden = ['### 2026-', '**Tally :**', '**Tally:**'];
const failures = [
  ...required.filter((needle) => !criteria.includes(needle)).map((needle) => `missing ${needle}`),
  ...forbidden.filter((needle) => criteria.includes(needle)).map((needle) => `leaked result ${needle}`),
];
if (failures.length) {
  for (const failure of failures) process.stderr.write(`✗ control-authority-criteria — ${failure}\n`);
  process.exit(1);
}
if (process.argv.includes('--print')) process.stdout.write(criteria);
else process.stdout.write('✓ control-authority-criteria — criteria load excludes historical verdicts\n');
