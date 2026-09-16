#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const plugins = ['overcode', 'sc-css', 'sc-js', 'sc-php', 'sc-python', 'sc-rust'];
const check = process.argv.includes('--check');
const sources = [
  ['contract.md', 'cd-contract.md'],
  ['project-contract.schema.json', 'cd-project-contract.schema.json'],
  ['differential-sync.md', 'cd-differential-sync.md'],
].filter(([source]) => existsSync(join(root, 'tools/sc-cd', source)));

let failed = false;
for (const plugin of plugins) {
  for (const [sourceName, targetName] of sources) {
    const source = readFileSync(join(root, 'tools/sc-cd', sourceName), 'utf8');
    const target = join(root, 'plugins', plugin, 'references', targetName);
    if (check) {
      if (!existsSync(target) || readFileSync(target, 'utf8') !== source) {
        console.error(`SC-CD drift: ${target}`);
        failed = true;
      }
      continue;
    }
    mkdirSync(dirname(target), { recursive: true });
    if (!existsSync(target) || readFileSync(target, 'utf8') !== source) {
      writeFileSync(target, source);
      console.log(`SC-CD wrote ${target}`);
    }
  }
}

if (failed) process.exit(1);
if (check) console.log(`SC-CD contract copies: ${plugins.length * sources.length} valid`);
