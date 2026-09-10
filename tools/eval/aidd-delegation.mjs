#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const CONTRACT = join(ROOT, 'plugins/overcode/references/aidd-delegation.md');
const TARGET_ROOTS = [
  join(ROOT, 'plugins/overcode/skills/foresee'),
  join(ROOT, 'plugins/overcode/skills/taste'),
];
const REQUIRED_SKILLS = new Set([
  'aidd-refine:03-shadow-areas',
  'aidd-refine:02-challenge',
  'aidd-refine:04-fact-check',
  'aidd-dev:04-audit',
  'aidd-dev:03-assert',
  'aidd-dev:01-plan',
  'aidd-dev:05-review',
]);
const REMOVED = [
  'plugins/overcode/skills/foresee/references/improvement-patterns.md',
  'plugins/overcode/skills/taste/assets/code-patterns.md',
  ...['javascript', 'php', 'python', 'rust', 'typescript', 'vue'].map(
    (lang) => `plugins/overcode/skills/taste/references/lang-${lang}.md`,
  ),
];

function markdownFiles(root) {
  const out = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'evals') out.push(...markdownFiles(path));
    } else if (entry.name.endsWith('.md')) out.push(path);
  }
  return out;
}

function parseContract(text) {
  const entries = [];
  for (const line of text.split(/\r?\n/)) {
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim().replaceAll('`', ''));
    if (cells.length !== 5 || !/^aidd-(dev|refine)$/.test(cells[0])) continue;
    entries.push({ package: cells[0], minimum: cells[1], capability: cells[2], skill: cells[3], output: cells[4] });
  }
  return entries;
}

function canonicalSkillFailureProblems(text) {
  const row = text.split(/\r?\n/).find((line) => /^\|\s*Canonical skill absent\s*\|/i.test(line));
  if (!row) return ['failure contract missing Canonical skill absent row'];
  const response = row.split('|')[2]?.trim() ?? '';
  const requirements = [
    ['missing skill', /\bskill\b/i],
    ['package', /\bpackage\b/i],
    ['minimum compatible version', /\bminimum\b[^|.]*\bversion\b/i],
    ['stop without fallback', /\bstop\b[^|.]*\bwithout fallback\b/i],
  ];
  return requirements
    .filter(([, pattern]) => !pattern.test(response))
    .map(([requirement]) => `Canonical skill absent response missing ${requirement}`);
}

function consentContractProblems(text) {
  const problems = [];
  for (const field of ['writes:', 'consent:']) {
    if (!text.includes(field)) problems.push(`delegation receipt missing ${field} field`);
  }
  if (!/runtime resolution without repair consent[^\n]*consent: required/i.test(text)) {
    problems.push('runnable-resolution route missing explicit consent gate');
  }
  if (!/Source, tests, configuration, and product data remain untouched/i.test(text)) {
    problems.push('contract missing assessed-product mutation boundary');
  }
  return problems;
}

function versionAtLeast(actual, minimum) {
  const numeric = (value) => String(value).split(/[+-]/, 1)[0].split('.').map((part) => Number(part));
  const a = numeric(actual);
  const b = numeric(minimum);
  if (a.some(Number.isNaN) || b.some(Number.isNaN) || a.length < 3 || b.length < 3) return false;
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const delta = (a[i] ?? 0) - (b[i] ?? 0);
    if (delta !== 0) return delta > 0;
  }
  return true;
}

function forbiddenFindings(text) {
  const checks = [
    ['host model', /\b(?:haiku|opus)\b/i],
    ['host background flag', /background\s*:\s*true/i],
    ['AIDD cache path', /(?:\.codex\/plugins\/cache|plugins\/cache\/aidd-framework|\/home\/[^\s]+\/\.codex\/plugins\/cache)/i],
    ['removed generic engine', /(?:improvement-patterns\.md|code-patterns\.md|lang-(?:javascript|php|python|rust|typescript|vue)\.md)/i],
    ['removed detector algorithm', /(?:Detector\s+[A-E]\b|spawn one .*agent per (?:file|language))/i],
  ];
  return checks.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
}

function unknownRoutes(text, known) {
  const ids = text.match(/aidd-(?:dev|refine):\d{2}-[a-z0-9-]+/g) ?? [];
  return [...new Set(ids)].filter((id) => !known.has(id));
}

function assertFixture(name, text, expectedFinding) {
  const findings = forbiddenFindings(text);
  if (expectedFinding === null && findings.length) throw new Error(`${name}: false positive (${findings.join(', ')})`);
  if (expectedFinding !== null && !findings.includes(expectedFinding)) throw new Error(`${name}: expected ${expectedFinding}`);
}

function validateFixtures() {
  assertFixture('positive-router', 'Resolve aidd-dev:04-audit through the host catalogue.', null);
  assertFixture('negative-model', 'Spawn one opus worker.', 'host model');
  assertFixture('negative-background', 'Run with background: true.', 'host background flag');
  assertFixture('negative-cache', 'Read .codex/plugins/cache/aidd-framework/aidd-dev.', 'AIDD cache path');
  assertFixture('negative-resource', 'Load code-patterns.md.', 'removed generic engine');
  assertFixture('negative-detector', 'Run Detector E against imports.', 'removed detector algorithm');
  const fixtureKnown = new Set(['aidd-dev:04-audit']);
  if (unknownRoutes('Delegate to aidd-dev:99-retired.', fixtureKnown)[0] !== 'aidd-dev:99-retired') {
    throw new Error('negative-unknown-route: expected an unknown canonical route');
  }
  if (unknownRoutes('Delegate to aidd-dev:04-audit.', fixtureKnown).length) {
    throw new Error('positive-known-route: false unknown route');
  }

  const positiveConsent = [
    'writes: aidd_docs/tasks/audit/report.md',
    'consent: required',
    'Imports, compilation, typing, build, or runtime resolution without repair consent | Return with consent: required',
    'Source, tests, configuration, and product data remain untouched',
  ].join('\n');
  if (consentContractProblems(positiveConsent).length) {
    throw new Error('positive-consent-contract: false contract problem');
  }
  const negativeConsent = positiveConsent.replaceAll('consent: required', 'consent: not-required');
  if (!consentContractProblems(negativeConsent).length) {
    throw new Error('negative-consent-contract: bypass was accepted');
  }

  const positiveFailure = '| Canonical skill absent | Name the missing skill, package, and minimum compatible version; stop without fallback. |';
  if (canonicalSkillFailureProblems(positiveFailure).length) {
    throw new Error('positive-canonical-skill-failure: false contract problem');
  }
  const negativeFailures = [
    ['skill', '| Canonical skill absent | Name the package and minimum compatible version; stop without fallback. |'],
    ['package', '| Canonical skill absent | Name the missing skill and minimum compatible version; stop without fallback. |'],
    ['minimum version', '| Canonical skill absent | Name the missing skill and package; stop without fallback. |'],
    ['stop', '| Canonical skill absent | Name the missing skill, package, and minimum compatible version. |'],
  ];
  for (const [omission, fixture] of negativeFailures) {
    if (!canonicalSkillFailureProblems(fixture).length) {
      throw new Error(`negative-canonical-skill-failure-${omission}: omission was accepted`);
    }
  }
}

function validateContract(entries, problems) {
  const skills = new Set(entries.map((entry) => entry.skill));
  for (const skill of REQUIRED_SKILLS) if (!skills.has(skill)) problems.push(`contract missing canonical skill ${skill}`);
  for (const entry of entries) {
    if (!/^\d+\.\d+\.\d+$/.test(entry.minimum)) problems.push(`invalid minimum version for ${entry.skill}: ${entry.minimum}`);
    if (!entry.capability || !entry.output) problems.push(`incomplete contract row for ${entry.skill}`);
  }
  if (new Set(entries.map((entry) => entry.skill)).size !== entries.length) problems.push('duplicate canonical skill in contract');
}

function validateRoutes(problems) {
  const routes = new Map([
    ['plugins/overcode/skills/foresee/actions/01-analyze-doc.md', ['aidd-refine:03-shadow-areas', 'aidd-refine:02-challenge']],
    ['plugins/overcode/skills/foresee/actions/02-analyze-code.md', ['aidd-dev:04-audit', 'architecture', 'code-quality', 'tests']],
    ['plugins/overcode/skills/foresee/actions/03-analyze-dep.md', ['aidd-dev:04-audit', 'dependencies', 'five dependencies']],
    ['plugins/overcode/skills/taste/actions/01-assess-doc.md', ['aidd-refine:04-fact-check', '--limit 25']],
    ['plugins/overcode/skills/taste/actions/02-assess-code.md', ['aidd-dev:04-audit', 'aidd-dev:03-assert', 'consent: required']],
  ]);
  for (const [path, tokens] of routes) {
    const text = readFileSync(join(ROOT, path), 'utf8');
    if (!text.includes('aidd-delegation.md')) problems.push(`${path}: delegation contract not loaded`);
    for (const token of tokens) if (!text.includes(token)) problems.push(`${path}: missing route token ${token}`);
  }
}

function validateSuites(problems) {
  for (const skill of ['foresee', 'taste']) {
    const path = join(ROOT, `plugins/overcode/skills/${skill}/evals/delegation-scenarios.md`);
    const text = readFileSync(path, 'utf8');
    for (const heading of ['Situation', 'Expected behavior', 'Pass criteria']) {
      if (!text.includes(heading)) problems.push(`${relative(ROOT, path)}: missing ${heading}`);
    }
    if (!/\|\s*[FT]\d+\s*\|/.test(text)) problems.push(`${relative(ROOT, path)}: no behavioral scenario rows`);
  }
}

function validateStatic() {
  validateFixtures();
  const problems = [];
  if (!existsSync(CONTRACT)) return ['delegation contract is absent'];
  const contractText = readFileSync(CONTRACT, 'utf8');
  const entries = parseContract(contractText);
  validateContract(entries, problems);
  problems.push(...canonicalSkillFailureProblems(contractText));
  problems.push(...consentContractProblems(contractText));
  validateRoutes(problems);
  validateSuites(problems);

  const canonical = new Set(entries.map((entry) => entry.skill));
  for (const path of TARGET_ROOTS.flatMap(markdownFiles)) {
    const text = readFileSync(path, 'utf8');
    const findings = forbiddenFindings(text);
    for (const finding of findings) problems.push(`${relative(ROOT, path)}: ${finding}`);
    for (const route of unknownRoutes(text, canonical)) problems.push(`${relative(ROOT, path)}: unknown AIDD route ${route}`);
    if (path.includes('/actions/') && /\b(?:2\.4\.1|2\.2\.4)\b/.test(text)) {
      problems.push(`${relative(ROOT, path)}: package version hardcoded in action`);
    }
  }
  for (const path of REMOVED) if (existsSync(join(ROOT, path))) problems.push(`${path}: removed resource restored`);
  return { entries, problems };
}

function loadCatalog(path) {
  let catalog;
  try {
    catalog = JSON.parse(readFileSync(resolve(path), 'utf8'));
  } catch (error) {
    throw new Error(`catalog unreadable or invalid: ${path} (${error.message})`);
  }
  if (!catalog || Array.isArray(catalog) || typeof catalog.packages !== 'object' || Array.isArray(catalog.packages) || !Array.isArray(catalog.skills)) {
    throw new Error('catalog must match { packages: { name: version }, skills: [canonical-id] }');
  }
  return catalog;
}

function validateCatalog(entries, catalog) {
  const problems = [];
  const skills = new Set(catalog.skills);
  for (const entry of entries) {
    const actual = catalog.packages[entry.package];
    if (!actual) problems.push(`catalog missing package ${entry.package}`);
    else if (!versionAtLeast(actual, entry.minimum)) problems.push(`${entry.package} ${actual} is below ${entry.minimum}`);
    if (!skills.has(entry.skill)) problems.push(`catalog missing skill ${entry.skill}`);
  }
  return problems;
}

const args = process.argv.slice(2);
let catalogPath = null;
if (args.length) {
  if (args.length !== 2 || args[0] !== '--require-catalog') {
    console.error('usage: node tools/eval/aidd-delegation.mjs [--require-catalog <catalog.json>]');
    process.exit(2);
  }
  catalogPath = args[1];
}

try {
  const { entries, problems } = validateStatic();
  if (catalogPath) problems.push(...validateCatalog(entries, loadCatalog(catalogPath)));
  if (problems.length) {
    console.error(`✗ aidd-delegation — ${problems.length} problem(s)`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  const live = catalogPath ? `; live catalog ${catalogPath} resolved` : '; static contract only';
  console.log(`✓ aidd-delegation — ${entries.length} canonical skills${live}; negative fixtures discriminant`);
} catch (error) {
  console.error(`✗ aidd-delegation — ${error.message}`);
  process.exit(1);
}
