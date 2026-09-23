#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const action = readFileSync('plugins/overcode/skills/alias/actions/02-endtask.md', 'utf8');
const scenarios = readFileSync(
  'plugins/overcode/skills/alias/evals/endtask-worktree-scenarios.md', 'utf8');
const failures = [];
const requireText = (body, needle, source) => {
  if (!body.includes(needle)) failures.push(`${source}: missing ${needle}`);
};

for (const needle of [
  '### Step 11 — Offer a fresh context',
  'only when every applicable operation in Steps 1–9 succeeded',
  'Never invoke `/clear`, a reset command, or a new-session action',
  'option on a failure or partial-success path',
  'do not invoke another skill or begin another work item',
  'without any guard, marker, or',
]) requireText(action, needle, 'action');

if (action.indexOf('### Step 11 — Offer a fresh context') < action.indexOf('### Step 10 — Report'))
  failures.push('action: fresh-context option must follow the final report');
for (const needle of ['| S19 |', '| S20 |', '**Tally:** 20/20 PASS'])
  requireText(scenarios, needle, 'scenarios');

if (failures.length) {
  failures.forEach((failure) => console.error(`✗ endtask-contract — ${failure}`));
  process.exit(1);
}
console.log('✓ endtask-contract — fresh context is optional, terminal, success-only and never automatic');
