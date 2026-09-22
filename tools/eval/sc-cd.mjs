#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProjectContract, validatePromotionTransition } from '../sc-cd/validate-project-contract.mjs';
import { compareManifests } from '../sc-cd/compare-manifests.mjs';
import { validateEvidenceFixture } from './validate-js-delivery-evidence.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const plugins = ['sc-css', 'sc-js', 'sc-php', 'sc-python', 'sc-rust'];
const contractOwners = [...plugins, 'overcode'];
const canonical = readFileSync(join(root, 'tools/sc-cd/contract.md'), 'utf8');
const schema = readFileSync(join(root, 'tools/sc-cd/project-contract.schema.json'), 'utf8');
const differentialSync = readFileSync(join(root, 'tools/sc-cd/differential-sync.md'), 'utf8');
const failures = [];

JSON.parse(schema);

for (const plugin of contractOwners) {
  const target = join(root, 'plugins', plugin, 'references/cd-contract.md');
  if (!existsSync(target)) failures.push(`${plugin}: missing cd-contract.md`);
  else if (readFileSync(target, 'utf8') !== canonical) failures.push(`${plugin}: cd-contract.md drifted`);
  const schemaTarget = join(root, 'plugins', plugin, 'references/cd-project-contract.schema.json');
  if (!existsSync(schemaTarget)) failures.push(`${plugin}: missing cd-project-contract.schema.json`);
  else if (readFileSync(schemaTarget, 'utf8') !== schema) failures.push(`${plugin}: project contract schema drifted`);
  const differentialTarget = join(root, 'plugins', plugin, 'references/cd-differential-sync.md');
  if (!existsSync(differentialTarget)) failures.push(`${plugin}: missing cd-differential-sync.md`);
  else if (readFileSync(differentialTarget, 'utf8') !== differentialSync) failures.push(`${plugin}: differential sync contract drifted`);

  if (plugin === 'overcode') continue;
  const skillRoot = join(root, 'plugins', plugin, 'skills/cd');
  const skill = join(skillRoot, 'SKILL.md');
  if (!existsSync(skill)) failures.push(`${plugin}: missing cd skill`);
  else {
    const router = readFileSync(skill, 'utf8');
    for (const [index, action] of ['local', 'server', 'automata'].entries()) {
      const actionPath = join(skillRoot, 'actions', `0${index + 1}-${action}.md`);
      if (!existsSync(actionPath)) failures.push(`${plugin}: missing ${action} action`);
      if (!new RegExp(`^\\|\\s*${action}\\s*\\|`, 'm').test(router)) failures.push(`${plugin}: ${action} is not routed`);
    }
  }
  const scenariosPath = join(skillRoot, 'evals/scenarios.json');
  if (!existsSync(scenariosPath)) failures.push(`${plugin}: missing cd routing scenarios`);
  else {
    const scenarios = JSON.parse(readFileSync(scenariosPath, 'utf8'));
    const routed = new Set(scenarios.map(({ expect_action: action }) => action));
    for (const action of ['local', 'server', 'automata', null]) {
      if (!routed.has(action)) failures.push(`${plugin}: scenarios do not cover ${action ?? 'a negative neighbor'}`);
    }
  }
}

for (const required of ['`staging`', '`production`', '`server`', '`automata`', '`code`', '`schema`', '`data`', '`media`', 'lifecycle revision']) {
  if (!canonical.includes(required)) failures.push(`canonical contract: missing ${required}`);
}
if (/allow(?:s|ed)?[^.]*?(?:production-to-local|target-to-target)/i.test(canonical)) failures.push('canonical contract: forbidden remote flow');

const fixtures = join(root, 'tools/eval/fixtures-sc-cd');
const jsEvidenceFixtures = join(fixtures, 'js-delivery-evidence');
const jsEvidenceNames = readdirSync(jsEvidenceFixtures).filter((name) => name.endsWith('.json')).sort();
for (const name of jsEvidenceNames) {
  const fixture = JSON.parse(readFileSync(join(jsEvidenceFixtures, name), 'utf8'));
  const result = validateEvidenceFixture(fixture);
  const valid = result.length === 0;
  if (valid !== fixture.expected?.valid) failures.push(`sc-js evidence ${name}: expected ${fixture.expected?.valid ? 'valid' : 'invalid'} (${result.join('; ')})`);
  for (const fragment of fixture.expected?.errorIncludes ?? []) {
    if (!result.some((error) => error.includes(fragment))) failures.push(`sc-js evidence ${name}: missing expected error ${fragment}`);
  }
}
const cases = [
  ['valid-language-owner', true],
  ['valid-composite', true],
  ['valid-automata', true],
  ['valid-multi-target', true],
  ['valid-staging', true],
  ['valid-production', true],
  ['valid-promotion', true],
  ['legacy-v1', false],
  ['invalid-two-owners', false],
  ['invalid-secret', false],
  ['invalid-duplicate-target', false],
  ['invalid-dirty-automata', false],
  ['invalid-remote-flow', false],
];
for (const [name, expected] of cases) {
  const contract = JSON.parse(readFileSync(join(fixtures, name, 'deploy/contract.json'), 'utf8'));
  const result = validateProjectContract(contract);
  if ((result.length === 0) !== expected) failures.push(`${name}: expected ${expected ? 'valid' : 'invalid'} contract (${result.join('; ')})`);
  if (name === 'invalid-secret' && result.join('\n').includes('must-never-appear')) failures.push('invalid-secret: validator leaked a secret value');
}

const stale = JSON.parse(readFileSync(join(fixtures, 'invalid-stale-lifecycle/deploy/contract.json'), 'utf8'));
const staleResult = validateProjectContract(stale, { guards: { 'client-site': { phase: 'production', lifecycleRevision: 2 } } });
if (!staleResult.some((message) => message.includes('lifecycle guard is stale'))) failures.push('stale lifecycle guard was accepted');

const producer = JSON.parse(readFileSync(join(fixtures, 'valid-automata/deploy/contract.json'), 'utf8'));
if (validateProjectContract(producer, { command: producer.command, workingDirectory: producer.workingDirectory }).length) {
  failures.push('automata: exact producer facade rejected');
}
if (!validateProjectContract(producer, { command: 'cargo run deploy', workingDirectory: producer.workingDirectory }).some((message) => message.includes('stale'))) {
  failures.push('automata: divergent facade accepted');
}
if ((producer.targets[0].trigger || 'manual') !== 'push') failures.push('automata: explicit push trigger was not preserved');

const manualDefault = JSON.parse(readFileSync(join(fixtures, 'valid-language-owner/deploy/contract.json'), 'utf8'));
if ((manualDefault.targets[0].trigger || 'manual') !== 'manual') failures.push('language owner: trigger does not default to manual');
const composite = JSON.parse(readFileSync(join(fixtures, 'valid-composite/deploy/contract.json'), 'utf8'));
if (composite.owner.scope !== 'root' || composite.contributors.some(({ scope }) => scope === 'root')) failures.push('composite: contributor escaped its bounded scope');

const before = JSON.parse(readFileSync(join(fixtures, 'promotion-failpoints/before.json'), 'utf8'));
const after = JSON.parse(readFileSync(join(fixtures, 'promotion-failpoints/after.json'), 'utf8'));
const checkpoints = JSON.parse(readFileSync(join(fixtures, 'promotion-failpoints/checkpoints.json'), 'utf8'));
if (validatePromotionTransition(before, after, checkpoints['after-guard']).length) failures.push('promotion: valid fail-closed transition rejected');
if (!validatePromotionTransition(before, after, checkpoints['before-guard']).some((message) => message.includes('not fail-closed'))) {
  failures.push('promotion: pre-guard checkpoint accepted as production');
}
if (Object.values(checkpoints).some(({ lifecycleRevision }) => lifecycleRevision < before.lifecycleRevision)) failures.push('promotion: lifecycle revision decreased');

const differentialFixtures = join(fixtures, 'differential-sync');
const localManifest = JSON.parse(readFileSync(join(differentialFixtures, 'local-manifest.json'), 'utf8'));
const remoteManifest = JSON.parse(readFileSync(join(differentialFixtures, 'remote-manifest.json'), 'utf8'));
const expectedStaging = JSON.parse(readFileSync(join(differentialFixtures, 'expected-staging-diff.json'), 'utf8'));
const expectedProduction = JSON.parse(readFileSync(join(differentialFixtures, 'expected-production-refusal.json'), 'utf8'));
const resumeManifest = JSON.parse(readFileSync(join(differentialFixtures, 'resume-manifest.json'), 'utf8'));
const stagingDiff = compareManifests(localManifest, remoteManifest, { phase: 'staging', surface: 'media', deletions: 'mirror' });
if (JSON.stringify(stagingDiff) !== JSON.stringify(expectedStaging)) failures.push('differential sync: staging diff does not match its oracle');
if (stagingDiff.transferableBytes >= stagingDiff.totalLocalBytes) failures.push('differential sync: unchanged large media would be retransferred');
const productionDiff = compareManifests(localManifest, remoteManifest, { phase: 'production', surface: 'media', deletions: 'mirror' });
if (JSON.stringify(productionDiff) !== JSON.stringify(expectedProduction)) failures.push('differential sync: production mutable media was not refused');
const noChangeDiff = compareManifests(localManifest, localManifest, { phase: 'staging', surface: 'media', deletions: 'mirror' });
if (!noChangeDiff.allowed || noChangeDiff.transferableBytes !== 0 || noChangeDiff.changes.added.length || noChangeDiff.changes.modified.length || noChangeDiff.changes.deleted.length) {
  failures.push('differential sync: identical manifests are not a zero-byte operation');
}
const forbiddenDeletion = compareManifests(localManifest, remoteManifest, { phase: 'staging', surface: 'media', deletions: 'forbid' });
if (forbiddenDeletion.allowed || forbiddenDeletion.transferableBytes !== 0) failures.push('differential sync: forbidden deletion did not fail closed');
const resumedDiff = compareManifests(localManifest, resumeManifest, { phase: 'staging', surface: 'media', deletions: 'preserve' });
if (resumedDiff.transferableBytes !== 5000000 || !resumedDiff.changes.unchanged.includes('uploads/new.jpg')) {
  failures.push('differential sync: resume would retransmit an already verified file');
}
const unsafeManifest = { ...localManifest, entries: [{ type: 'file', path: '../escape.jpg', size: 1, hash: 'bad' }] };
try {
  compareManifests(unsafeManifest, remoteManifest);
  failures.push('differential sync: unsafe path accepted');
} catch (error) {
  if (!error.message.includes('unsafe path')) failures.push(`differential sync: unexpected unsafe-path error (${error.message})`);
}

const pythonCd = join(root, 'plugins/sc-python/skills/cd');
const pythonTexts = [
  'SKILL.md',
  'actions/02-server.md',
  'actions/03-automata.md',
  'references/command-facade.md',
  'references/python-frameworks.md',
  'references/sql-delivery.md',
  'evals/delivery-scenarios.md',
  'evals/delivery-safety-scenarios.md',
].map((path) => readFileSync(join(pythonCd, path), 'utf8')).join('\n');
for (const required of ['target id', 'lifecycle', 'staging', 'production', 'media', 'target-to-target', 'manifest']) {
  if (!pythonTexts.toLocaleLowerCase('en-US').includes(required)) failures.push(`sc-python: missing multi-target rule ${required}`);
}
const pythonScenarios = JSON.parse(readFileSync(join(pythonCd, 'evals/scenarios.json'), 'utf8'));
for (const target of ['railway-main', 'alwaysdata-federated', 'staging-demo']) {
  if (!pythonScenarios.some(({ prompt }) => prompt.includes(target))) failures.push(`sc-python: routing misses named target ${target}`);
}
const behavePark = readFileSync(join(fixtures, 'behave-park/fixture.yaml'), 'utf8');
for (const required of ['suddenly_like:', 'railway-main:', 'alwaysdata-federated:', 'staging-demo:', 'forbiddenFlows:', 'manifest-delta-resumable']) {
  if (!behavePark.includes(required)) failures.push(`sc-python fixture: missing ${required}`);
}

const phpCd = join(root, 'plugins/sc-php/skills/cd');
const phpTexts = [
  'SKILL.md', 'actions/02-server.md', 'actions/03-automata.md', 'references/command-facade.md',
  'references/php-frameworks.md', 'references/wordpress-sync.md', 'evals/delivery-scenarios.md', 'evals/delivery-safety-scenarios.md',
].map((path) => readFileSync(join(phpCd, path), 'utf8')).join('\n').toLocaleLowerCase('en-US');
for (const required of ['target id', 'staging', 'production', 'manifest', 'transferable bytes', 'target-to-target', 'tar | ssh']) {
  if (!phpTexts.includes(required)) failures.push(`sc-php: missing phase-aware WordPress rule ${required}`);
}
const phpScenarios = JSON.parse(readFileSync(join(phpCd, 'evals/scenarios.json'), 'utf8'));
for (const target of ['demo-staging', 'client-prod']) {
  if (!phpScenarios.some(({ prompt }) => prompt.includes(target))) failures.push(`sc-php: routing misses named target ${target}`);
}
for (const required of ['demo-staging:', 'client-prod:', 'unchangedLargeUpload: 500000000', 'forbiddenOperations: [deploy:data, deploy:media]']) {
  if (!behavePark.includes(required)) failures.push(`sc-php fixture: missing ${required}`);
}

const jsCd = join(root, 'plugins/sc-js/skills/cd');
const jsTexts = [
  'SKILL.md', 'actions/02-server.md', 'actions/03-automata.md', 'references/command-facade.md',
  'references/data-layers.md', 'evals/delivery-scenarios.md', 'evals/delivery-safety-scenarios.md',
].map((path) => readFileSync(join(jsCd, path), 'utf8')).join('\n').toLocaleLowerCase('en-US');
for (const required of ['target id', 'staging', 'production', 'indexeddb', 'manifest', 'target-to-target', 'transferable bytes']) {
  if (!jsTexts.includes(required)) failures.push(`sc-js: missing v2 data rule ${required}`);
}
const jsScenarios = JSON.parse(readFileSync(join(jsCd, 'evals/scenarios.json'), 'utf8'));
for (const target of ['demo-node', 'railway-prod']) {
  if (!jsScenarios.some(({ prompt }) => prompt.includes(target))) failures.push(`sc-js: routing misses named target ${target}`);
}
for (const required of [
  'demo-node:', 'railway-prod:', 'dataStrategy: deterministic-export-import', 'indexeddb: migration-code-only',
  'js_drvfs_archive:', 'js_drvfs_normalized:', 'js_linux_native_artifact:',
  'js_recovery_early_delete:', 'js_proof_unbound:', 'js_recovery_window_valid:',
]) {
  if (!behavePark.includes(required)) failures.push(`sc-js fixture: missing ${required}`);
}

const rustCd = join(root, 'plugins/sc-rust/skills/cd');
const rustTexts = [
  'SKILL.md', 'actions/02-server.md', 'actions/03-automata.md', 'references/command-facade.md',
  'references/releases.md', 'references/sql-delivery.md', 'evals/delivery-scenarios.md', 'evals/delivery-safety-scenarios.md',
].map((path) => readFileSync(join(rustCd, path), 'utf8')).join('\n').toLocaleLowerCase('en-US');
for (const required of ['target id', 'lifecycle', 'current', 'previous', 'target-to-target', 'manifest', 'same xtask']) {
  if (!rustTexts.includes(required)) failures.push(`sc-rust: missing independent-release rule ${required}`);
}
const rustScenarios = JSON.parse(readFileSync(join(rustCd, 'evals/scenarios.json'), 'utf8'));
for (const target of ['rust-east', 'rust-west']) {
  if (!rustScenarios.some(({ prompt }) => prompt.includes(target))) failures.push(`sc-rust: routing misses named target ${target}`);
}
for (const required of ['rust-east:', 'rust-west:', 'releaseRoot: releases/rust-east', 'releaseRoot: releases/rust-west']) {
  if (!behavePark.includes(required)) failures.push(`sc-rust fixture: missing ${required}`);
}

const cssCd = join(root, 'plugins/sc-css/skills/cd');
const cssTexts = [
  'SKILL.md', 'actions/02-server.md', 'actions/03-automata.md', 'references/static-delivery.md',
  'evals/delivery-scenarios.md', 'evals/delivery-safety-scenarios.md',
].map((path) => readFileSync(join(cssCd, path), 'utf8')).join('\n').toLocaleLowerCase('en-US');
for (const required of ['target id', 'deterministic artifact', 'fingerprinted', 'user media', 'bounded contributor', 'independent']) {
  if (!cssTexts.includes(required)) failures.push(`sc-css: missing multi-target static rule ${required}`);
}
const cssScenarios = JSON.parse(readFileSync(join(cssCd, 'evals/scenarios.json'), 'utf8'));
for (const target of ['brochure-server', 'brochure-edge']) {
  if (!cssScenarios.some(({ prompt }) => prompt.includes(target))) failures.push(`sc-css: routing misses named target ${target}`);
}
for (const required of ['brochure-server:', 'brochure-edge:', 'repository-fonts', 'media: none']) {
  if (!behavePark.includes(required)) failures.push(`sc-css fixture: missing ${required}`);
}

const tiersCd = join(root, 'plugins/overcode/skills/deploy');
const serviceRoot = join(root, 'plugins/overcode/skills/service');
const tiersTexts = [
  'SKILL.md', 'actions/03-automata.md', 'references/providers.md',
  'references/ci-adapters.md', 'evals/delivery-scenarios.md', 'evals/delivery-safety-scenarios.md',
].map((path) => readFileSync(join(tiersCd, path), 'utf8')).concat([
  readFileSync(join(serviceRoot, 'actions/05-server.md'), 'utf8'),
]).join('\n').toLocaleLowerCase('en-US');
for (const required of ['target id', 'alwaysdata', 'host-key', 'lifecycle revision', 'concurrency group', 'target-to-target', 'stale guard']) {
  if (!tiersTexts.includes(required)) failures.push(`overcode: missing target provider rule ${required}`);
}
const tiersScenarios = JSON.parse(readFileSync(join(tiersCd, 'evals/scenarios.json'), 'utf8'));
for (const target of ['alwaysdata-federated', 'railway-main']) {
  if (!tiersScenarios.some(({ prompt }) => prompt.includes(target))) failures.push(`overcode: routing misses named target ${target}`);
}
for (const required of ['tiers_federated:', 'provider: alwaysdata', 'remoteGuard: deploy/guard.json', 'concurrencyGroup: suddenly-railway-main']) {
  if (!behavePark.includes(required)) failures.push(`overcode fixture: missing ${required}`);
}

for (const plugin of plugins) {
  const scenarios = JSON.parse(readFileSync(join(root, 'plugins', plugin, 'skills/cd/evals/scenarios.json'), 'utf8'));
  const prompts = scenarios.map(({ prompt }) => prompt.toLocaleLowerCase('en-US'));
  for (const phase of ['staging', 'production']) {
    if (!prompts.some((prompt) => prompt.includes(phase))) failures.push(`${plugin}: routing scenarios miss ${phase}`);
  }
  for (const action of ['server', 'automata']) {
    if (!scenarios.some(({ expect_action: expected }) => expected === action)) failures.push(`${plugin}: routing scenarios miss ${action}`);
  }
}

const marketplace = JSON.parse(readFileSync(join(root, '.claude-plugin/marketplace.json'), 'utf8'));
for (const plugin of contractOwners) {
  const claudeManifest = JSON.parse(readFileSync(join(root, 'plugins', plugin, '.claude-plugin/plugin.json'), 'utf8'));
  const codexManifest = JSON.parse(readFileSync(join(root, 'plugins', plugin, '.codex-plugin/plugin.json'), 'utf8'));
  const listing = marketplace.plugins.find(({ name }) => name === plugin);
  const version = claudeManifest.version;
  if (listing?.version !== version) failures.push(`${plugin}: Claude/catalog version mismatch`);
  if (!codexManifest.version.startsWith(`${version}+codex.`)) failures.push(`${plugin}: Codex version mismatch`);
  if (plugin === 'overcode') continue;
  const readme = readFileSync(join(root, 'plugins', plugin, 'README.md'), 'utf8');
  const changelog = readFileSync(join(root, 'plugins', plugin, 'CHANGELOG.md'), 'utf8');
  if (!readme.includes('CD multi-cibles') && !readme.includes('CD par cible')) failures.push(`${plugin}: README misses v2 capabilities`);
  if (!changelog.includes(`## [${version}]`)) failures.push(`${plugin}: changelog misses ${version}`);
}

if (failures.length) {
  for (const failure of failures) console.error(`SC-CD FAIL: ${failure}`);
  process.exit(1);
}
console.log(`SC-CD PASS: v2 contract, schema, differential oracle, ${contractOwners.length} portable copies, ${cases.length} project fixtures and fail-closed promotion`);
