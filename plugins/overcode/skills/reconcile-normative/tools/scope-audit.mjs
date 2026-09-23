#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function fail(message) {
  process.stderr.write(`scope-audit: ${message}\n`);
  process.exitCode = 2;
  return null;
}

function parseArgs(argv) {
  const out = { root: null, rule: null, symbols: [], json: false, selfTest: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--root') out.root = argv[++i];
    else if (arg === '--rule') out.rule = argv[++i];
    else if (arg === '--symbol') out.symbols.push(argv[++i]);
    else if (arg === '--json') out.json = true;
    else if (arg === '--self-test') out.selfTest = true;
    else return fail(`unknown argument: ${arg}`);
  }
  return out;
}

function unquote(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) return trimmed.slice(1, -1);
  return trimmed;
}

export function parsePaths(markdown) {
  const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) throw new Error('missing YAML frontmatter');
  const lines = frontmatter[1].split(/\r?\n/);
  const start = lines.findIndex((line) => /^paths\s*:/.test(line));
  if (start < 0) throw new Error('missing paths: entry');

  const first = lines[start].replace(/^paths\s*:\s*/, '').trim();
  if (first.startsWith('[') && first.endsWith(']')) {
    const values = first.slice(1, -1).split(',').map(unquote).filter(Boolean);
    if (!values.length) throw new Error('paths: is empty');
    return values;
  }

  const values = [];
  for (const line of lines.slice(start + 1)) {
    const item = line.match(/^\s+-\s+(.+?)\s*$/);
    if (item) values.push(unquote(item[1]));
    else if (line.trim() && !/^\s/.test(line)) break;
  }
  if (!values.length) throw new Error('paths: is empty or unsupported');
  return values;
}

function globRegex(glob) {
  let source = '^';
  for (let i = 0; i < glob.length; i += 1) {
    const char = glob[i];
    if (char === '*') {
      if (glob[i + 1] === '*') {
        i += 1;
        if (glob[i + 1] === '/') {
          i += 1;
          source += '(?:.*/)?';
        } else source += '.*';
      } else source += '[^/]*';
    } else if (char === '?') source += '[^/]';
    else source += char.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
  }
  return new RegExp(`${source}$`);
}

function walk(root, current = root) {
  const files = [];
  for (const entry of readdirSync(current).sort()) {
    if (entry === '.git' || entry === 'node_modules') continue;
    const path = resolve(current, entry);
    if (statSync(path).isDirectory()) files.push(...walk(root, path));
    else files.push(relative(root, path).replaceAll('\\', '/'));
  }
  return files;
}

export function auditScope({ root, rule, symbols }) {
  if (!root || !rule || !symbols.length || symbols.some((symbol) => !symbol)) {
    throw new Error('usage: --root <project> --rule <rule.md> --symbol <literal> [--symbol <literal>]');
  }
  const rootPath = resolve(root);
  const rulePath = resolve(rule);
  const paths = parsePaths(readFileSync(rulePath, 'utf8'));
  const files = walk(rootPath);
  const matchesByPath = Object.fromEntries(paths.map((pattern) => {
    const regex = globRegex(pattern);
    return [pattern, files.filter((file) => regex.test(file))];
  }));
  const unresolvedPaths = paths.filter((pattern) => matchesByPath[pattern].length === 0);
  if (unresolvedPaths.length) throw new Error(`paths matched no files: ${unresolvedPaths.join(', ')}`);

  const declaredFiles = [...new Set(Object.values(matchesByPath).flat())].sort();
  const symbolSites = files.filter((file) => {
    const content = readFileSync(resolve(rootPath, file), 'utf8');
    return symbols.some((symbol) => content.includes(symbol));
  });
  const declaredSet = new Set(declaredFiles);
  const siteSet = new Set(symbolSites);
  const coveredWithoutSite = declaredFiles.filter((file) => !siteSet.has(file));
  const sitesOutsideScope = symbolSites.filter((file) => !declaredSet.has(file));
  const redundantPaths = [];
  for (const child of paths) {
    const childFiles = matchesByPath[child];
    for (const parent of paths) {
      if (child === parent) continue;
      const parentSet = new Set(matchesByPath[parent]);
      if (childFiles.every((file) => parentSet.has(file))) {
        redundantPaths.push({ redundant: child, coveredBy: parent });
        break;
      }
    }
  }
  const ratio = symbolSites.length ? declaredFiles.length / symbolSites.length : null;
  const narrowScopeCandidate = symbolSites.length > 0 && coveredWithoutSite.length > 0 &&
    (coveredWithoutSite.length >= 3 || ratio >= 2);

  return {
    rule: relative(rootPath, rulePath).replaceAll('\\', '/'),
    symbols,
    paths,
    declaredFileCount: declaredFiles.length,
    symbolSiteCount: symbolSites.length,
    coverageRatio: ratio,
    narrowScopeCandidate,
    declaredFiles,
    symbolSites,
    coveredWithoutSite,
    sitesOutsideScope,
    redundantPaths,
  };
}

function render(result) {
  const ratio = result.coverageRatio === null ? 'n/a' : result.coverageRatio.toFixed(2);
  return [
    `rule: ${result.rule}`,
    `declared: ${result.declaredFileCount} file(s)`,
    `symbol sites: ${result.symbolSiteCount} file(s)`,
    `coverage ratio: ${ratio}`,
    `narrow scope candidate: ${result.narrowScopeCandidate ? 'yes' : 'no'}`,
    `covered without symbol: ${result.coveredWithoutSite.join(', ') || 'none'}`,
    `sites outside scope: ${result.sitesOutsideScope.join(', ') || 'none'}`,
    `redundant paths: ${result.redundantPaths.map(({ redundant, coveredBy }) => `${redundant} <= ${coveredBy}`).join(', ') || 'none'}`,
  ].join('\n');
}

function selfTest() {
  const here = dirname(fileURLToPath(import.meta.url));
  const fixture = resolve(here, '../evals/fixtures/scope-audit');
  const skill = readFileSync(resolve(here, '../SKILL.md'), 'utf8');
  for (const needle of ['| **Narrow scope** |', 'future legitimate call site', 'redundant']) {
    if (!skill.includes(needle)) throw new Error(`self-test SKILL invariant missing: ${needle}`);
  }
  let malformedRejected = false;
  try {
    parsePaths('# no frontmatter');
  } catch {
    malformedRejected = true;
  }
  if (!malformedRejected) throw new Error('self-test malformed frontmatter was accepted');
  const result = auditScope({
    root: resolve(fixture, 'project'),
    rule: resolve(fixture, 'broad-rule.md'),
    symbols: ['svgIcon'],
  });
  const expected = {
    declaredFileCount: 6,
    symbolSiteCount: 2,
    coveredWithoutSite: [
      'lib/content-manager.js',
      'lib/init.js',
      'lib/views/list.js',
      'lib/views/modal.js',
    ],
    redundantPaths: [{ redundant: 'lib/views/**/*.js', coveredBy: 'lib/**/*.js' }],
  };
  for (const [key, value] of Object.entries(expected)) {
    if (JSON.stringify(result[key]) !== JSON.stringify(value)) {
      throw new Error(`self-test ${key}: expected ${JSON.stringify(value)}, got ${JSON.stringify(result[key])}`);
    }
  }
  if (!result.narrowScopeCandidate || result.sitesOutsideScope.length) {
    throw new Error('self-test classification mismatch');
  }
  process.stdout.write('✓ reconcile-normative scope audit — broad scope and redundant path detected\n');
}

const args = parseArgs(process.argv.slice(2));
if (args) {
  try {
    if (args.selfTest) selfTest();
    else {
      const result = auditScope(args);
      process.stdout.write(`${args.json ? JSON.stringify(result, null, 2) : render(result)}\n`);
    }
  } catch (error) {
    fail(error.message);
  }
}
