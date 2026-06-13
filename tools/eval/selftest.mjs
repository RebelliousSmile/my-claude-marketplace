#!/usr/bin/env node
// Self-test des gardes — vérifie que les outils ne sont pas devenus permissifs :
//   - harness DOIT rejeter (exit≠0) chaque fixture sous fixtures-invalid/
//   - harness DOIT accepter (exit 0) les fixtures valides bundlées
//   - coverage DOIT passer (exit 0) — aucun vrai trou de routage
// Garde contre une régression silencieuse de harness.mjs / coverage.mjs.
//
//   node tools/eval/selftest.mjs   → exit 0 si tous les gardes se comportent comme attendu

import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync, statSync } from 'node:fs';

const HERE = dirname(fileURLToPath(import.meta.url));
const harness = join(HERE, 'harness.mjs');
const coverage = join(HERE, 'coverage.mjs');
const invalidDir = join(HERE, 'fixtures-invalid');

const run = (script, args = []) =>
  spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' }).status;

const results = [];
const expect = (label, cond) => results.push({ label, ok: cond });

// 1. chaque fixture invalide → harness DOIT échouer
for (const name of readdirSync(invalidDir)) {
  if (!statSync(join(invalidDir, name)).isDirectory()) continue;
  expect(`harness rejette fixtures-invalid/${name} (exit≠0)`, run(harness, [join(invalidDir, name)]) !== 0);
}
// 2. fixtures valides → harness DOIT passer
expect('harness accepte les fixtures valides (exit 0)', run(harness) === 0);
// 3. coverage → exit 0 (pas de vrai trou)
expect('coverage sans trou de routage (exit 0)', run(coverage) === 0);

let bad = 0;
for (const r of results) { console.log(`${r.ok ? '✓' : '✗'} ${r.label}`); if (!r.ok) bad++; }
console.log(`\n${bad ? '✗' : '✓'} selftest — ${results.length - bad}/${results.length} garde(s) OK`);
process.exit(bad ? 1 : 0);
