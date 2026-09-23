#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const failures = [];
const requireText = (path, needles) => {
  const body = readFileSync(path, 'utf8');
  for (const needle of needles) {
    if (!body.includes(needle)) failures.push(`${path}: missing ${JSON.stringify(needle)}`);
  }
  return body;
};

const skill = requireText('plugins/overcode/skills/control/SKILL.md', [
  'ownership contract, not an automatic invocation contract',
  '01-write` reaches it when the selected proof form has no installed mechanism',
  'The conventional strategy path is exact-case',
]);
const write = requireText('plugins/overcode/skills/control/actions/01-write.md', [
  'tooling: { required:',
  '3-ter. **Verify that the selected proof can be produced before delegating it.**',
  'A non-empty cell requiring anchored proof maps to `e2e`',
  'set `delegated_to: none`, and route the configuration case to `03-configure`',
]);
const matrix = requireText('plugins/overcode/skills/control/references/decision-matrix.md', [
  'When the cell names a required proof, map **that proof** to the output',
  'Intrinsic provability cannot turn an anchored cell into `contract`',
]);
const stats = requireText('plugins/overcode/skills/control/actions/05-stats.md', [
  'none (measured, no outlier)',
  'outliers: not measurable - <same cause>',
  '**Independent flags accumulate.**',
  'differently-cased sibling such as `TESTING.md`',
]);
const audit = requireText('plugins/overcode/skills/control/actions/02-audit.md', [
  'one line per configured or inferred pattern',
  'measure **each pattern separately before unioning**',
  'A zero-match constituent with a non-empty union is also a finding',
]);
requireText('plugins/overcode/skills/control/actions/03-configure.md', [
  '`01-write` routes into it when the selected cell requires a proof mechanism',
]);

if (matrix.includes('the order says which proof the behavior needs')) {
  failures.push('decision-matrix still lets intrinsic order choose the required proof');
}
if (!skill.includes('05-stats` always follows its own stricter output contract')) {
  failures.push('stats handoff semantics are not explicit');
}
if (!write.includes('**and `tooling.status = available`**')) {
  failures.push('delegation is not guarded by tooling availability');
}
if (!stats.includes('Neither has precedence and naming only one loses a distinct correction')) {
  failures.push('dual strategy flags can still collapse to one');
}
if (!audit.includes('including every zero-match pattern')) {
  failures.push('per-pattern zero matches are not mandatory');
}

if (failures.length) {
  for (const failure of failures) process.stderr.write(`✗ control-contract — ${failure}\n`);
  process.exit(1);
}
process.stdout.write('✓ control-contract — authority, tooling, absence and enumeration contracts pinned\n');
