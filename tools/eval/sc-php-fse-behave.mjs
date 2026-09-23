#!/usr/bin/env node
// Fast, Docker-free regression gate for the design -> sc-css + sc-php FSE contract.

import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { mergeThemeJson, presetsFromTokens } from '../../plugins/sc-php/skills/design-bridge/tools/theme-json-adapter.mjs';

const failures = [];
const fail = (message) => failures.push(message);
const read = (path) => readFileSync(path, 'utf8');
const fixture = 'plugins/sc-php/skills/design-bridge/evals/fixtures/fse-cascade';

const required = {
  'plugins/design/skills/diffuse/actions/03-pivot.md': ['sc-php', 'sc-css', 'sans chevauchement'],
  'plugins/sc-php/skills/design-bridge/actions/02-render.md': [
    'patterns/<canonical-name>.php', 'Inserter: yes', 'fse-bindings.css',
    '--ownership-stylesheet', 'WP_EDITOR_STORAGE_STATE', 'theme-json-adapter.mjs',
    'designTokenPresets', '--token-theme'],
  'plugins/sc-php/skills/design-bridge/actions/01-realize-lint.md': [
    'Token scales', 'design-enforce-v2', 'sans marqueur d\'extension est ambigu'],
  'plugins/design/skills/enforce/actions/01-build-linter.md': [
    'mode **`extend`**', 'generatedBlock', 'système parallèle'],
  'plugins/design/references/sc-pivot-contract.md': ['Canonical values:', 'Theme overlays:', '2-bis.'],
  'plugins/sc-css/skills/design-bridge/actions/03-realize-lint.md': [
    'preuve **statique**', 'sans nouvelle règle `pivotReports`'],
  'plugins/design/adapters/measure/measure.py': [
    'ownership_failures', 'ownership_unrealized', '_owner_is_expected'],
};
for (const [path, needles] of Object.entries(required)) {
  const body = read(path);
  for (const needle of needles) if (!body.includes(needle)) fail(`${path}: invariant absent (${needle})`);
}

const scenarios = JSON.parse(read('plugins/sc-php/skills/design-bridge/evals/scenarios.json'));
if (!Array.isArray(scenarios) || scenarios.length < 9)
  fail('scénarios FSE: au moins neuf décisions doivent rester couvertes');

const themeFixture = 'plugins/sc-php/skills/design-bridge/evals/fixtures/theme-json';
const tokens = JSON.parse(read(`${themeFixture}/tokens.json`));
const themeInput = JSON.parse(read(`${themeFixture}/theme.input.json`));
const themeExpected = JSON.parse(read(`${themeFixture}/theme.expected.json`));
const mergedTheme = mergeThemeJson(themeInput, tokens);
if (JSON.stringify(mergedTheme) !== JSON.stringify(themeExpected))
  fail('theme.json: la fusion ne correspond pas à la fixture attendue');
if (JSON.stringify(mergeThemeJson(mergedTheme, tokens)) !== JSON.stringify(mergedTheme))
  fail('theme.json: une seconde fusion n’est pas idempotente');
if (mergedTheme.settings.custom.project.density !== 'compact' || !mergedTheme.styles.elements.link)
  fail('theme.json: une section humaine non gouvernée a été perdue');
const darkPresets = presetsFromTokens(tokens, 'dark');
if (!darkPresets.groups.color.every((preset) => preset.color === '#93c5fd'))
  fail('theme.json: l’overlay sombre ou ses alias ne sont pas résolus après fusion');
const conflicting = structuredClone(themeInput);
conflicting.settings.color.palette.push({ name: 'Human Brand', slug: 'brand-primary', color: '#000' });
let conflictClosed = false;
try { mergeThemeJson(conflicting, tokens); } catch (error) {
  conflictClosed = /slug conflict outside generated boundary/.test(error.message);
}
if (!conflictClosed) fail('theme.json: une collision avec un slug humain n’a pas fermé l’adaptation');

const validatePattern = (path, body) => path.endsWith('.php')
  && ['Title:', 'Slug:', 'Categories:', 'Inserter: yes'].every((header) => body.includes(header))
  && body.includes('<!-- wp:') && body.includes('<!-- /wp:');
const validPattern = read(`${fixture}/pattern-pass.php`);
if (!validatePattern(`${fixture}/pattern-pass.php`, validPattern)) fail('fixture: pattern PHP valide rejeté');
if (validatePattern(`${fixture}/pattern-fail.html`, read(`${fixture}/pattern-fail.html`)))
  fail('mutation: un pattern .html sans en-tête a été accepté');

const requiredFixtureFiles = ['design.css', 'core.css', 'front-pass.html', 'front-fail.html',
  'editor-pass.html', 'editor-fail.html'];
for (const name of requiredFixtureFiles)
  if (!existsSync(`${fixture}/${name}`)) fail(`fixture absente: ${name}`);
const validatesEntrypoint = (body) => /<link[^>]+design\.css/.test(body);
const passingFront = read(`${fixture}/front-pass.html`);
if (!validatesEntrypoint(passingFront)) fail('binding: feuille DS absente du cas conforme');
if (validatesEntrypoint(passingFront.replace(/<link[^>]+design\.css[^>]*>\s*/i, '')))
  fail('mutation binding: suppression simulée non détectée');

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
for (const path of walk('plugins/sc-php/skills')) {
  if (!/\.(md|ps1|json)$/.test(path)) continue;
  const body = read(path);
  if (/^\s*(?:npx|pnpm\s+exec)\s+wp-env\s+run\s+cli\b/m.test(body))
    fail(`${path}: accès WP-CLI nu; utiliser exclusivement pnpm wp`);
}

const tempRoot = resolve('.tmp');
mkdirSync(tempRoot, { recursive: true });
const pytestTmp = mkdtempSync(join(tempRoot, 'fse-ownership-'));
const python = process.platform === 'win32' ? 'python' : 'python3';
try {
  const tested = spawnSync(python, ['-m', 'pytest',
    'plugins/design/adapters/measure/tests/test_cascade_ownership.py', '-q', '--basetemp', pytestTmp],
  { encoding: 'utf8' });
  if (tested.stdout) process.stdout.write(tested.stdout);
  if (tested.stderr) process.stderr.write(tested.stderr);
  if (tested.status !== 0) fail(`oracle ownership: pytest exit ${tested.status}`);
} finally {
  rmSync(pytestTmp, { recursive: true, force: true });
}

if (failures.length) {
  for (const message of failures) console.error(`✗ sc-php-fse — ${message}`);
  process.exit(1);
}
console.log('✓ sc-php-fse — routage, pattern PHP, binding, wrapper CLI et ownership front/éditeur');
