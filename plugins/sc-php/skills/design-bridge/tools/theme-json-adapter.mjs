#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';

const MARKER_KEY = 'designTokenPresets';

function isLeaf(value) {
  return value && typeof value === 'object' && Object.hasOwn(value, '$value');
}

export function flattenTokens(tokens, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(tokens)) {
    if (key === 'themes') continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (isLeaf(value)) out[path] = { type: value.$type ?? null, value: value.$value };
    else if (value && typeof value === 'object' && !Array.isArray(value)) flattenTokens(value, path, out);
  }
  return out;
}

function resolveValue(path, flat, seen = new Set()) {
  if (seen.has(path)) throw new Error(`token alias cycle at ${path}`);
  const token = flat[path];
  if (!token) throw new Error(`unknown token alias: ${path}`);
  const match = typeof token.value === 'string' && token.value.match(/^\{([^}]+)\}$/);
  if (!match) return token.value;
  return resolveValue(match[1], flat, new Set([...seen, path]));
}

function title(path, prefixLength) {
  return path.split('.').slice(prefixLength).map((part) => part.replace(/[-_]/g, ' '))
    .map((part) => part.replace(/^./, (char) => char.toUpperCase())).join(' ');
}

function slug(path, prefixLength) {
  return path.split('.').slice(prefixLength).join('-').replace(/[^a-zA-Z0-9-]+/g, '-').toLowerCase();
}

function tokensForTheme(tokens, themeName) {
  const flat = flattenTokens(tokens);
  if (!themeName) return flat;
  const overlay = tokens.themes?.[themeName];
  if (!overlay) throw new Error(`unknown token theme: ${themeName}`);
  const overrides = flattenTokens(overlay);
  for (const [path, token] of Object.entries(overrides)) {
    if (!flat[path]) throw new Error(`theme ${themeName} introduces unknown token: ${path}`);
    flat[path] = { ...flat[path], value: token.value };
  }
  return flat;
}

export function presetsFromTokens(tokens, themeName = null) {
  const flat = tokensForTheme(tokens, themeName);
  const groups = { color: [], fontSize: [], spacing: [] };
  const generated = { color: [], fontSize: [], spacing: [] };
  for (const path of Object.keys(flat).sort()) {
    const value = resolveValue(path, flat);
    if (path.startsWith('color.')) {
      const entry = { name: title(path, 1), slug: slug(path, 1) };
      groups.color.push({ ...entry, color: value });
      generated.color.push(entry.slug);
    } else if (path.startsWith('font.size.')) {
      const entry = { name: title(path, 2), slug: slug(path, 2) };
      groups.fontSize.push({ ...entry, size: value });
      generated.fontSize.push(entry.slug);
    } else if (path.startsWith('space.')) {
      const entry = { name: title(path, 1), slug: slug(path, 1) };
      groups.spacing.push({ ...entry, size: value });
      generated.spacing.push(entry.slug);
    }
  }
  return { groups, generated };
}

function mergePresetArray(existing, next, previousGenerated, kind) {
  const generatedBefore = new Set(previousGenerated ?? []);
  const nextBySlug = new Map(next.map((entry) => [entry.slug, entry]));
  const kept = [];
  for (const entry of existing ?? []) {
    if (!entry || typeof entry !== 'object' || typeof entry.slug !== 'string') {
      kept.push(entry);
      continue;
    }
    if (generatedBefore.has(entry.slug)) continue;
    if (nextBySlug.has(entry.slug)) {
      throw new Error(`${kind} preset slug conflict outside generated boundary: ${entry.slug}`);
    }
    kept.push(entry);
  }
  return [...kept, ...[...nextBySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug))];
}

export function mergeThemeJson(theme, tokens, themeName = null) {
  const output = structuredClone(theme);
  output.settings ??= {};
  output.settings.color ??= {};
  output.settings.typography ??= {};
  output.settings.spacing ??= {};
  output.settings.custom ??= {};
  output.settings.custom.design ??= {};
  const previous = output.settings.custom.design[MARKER_KEY] ?? {};
  const { groups, generated } = presetsFromTokens(tokens, themeName);
  output.settings.color.palette = mergePresetArray(output.settings.color.palette, groups.color, previous.color, 'color');
  output.settings.typography.fontSizes = mergePresetArray(output.settings.typography.fontSizes, groups.fontSize, previous.fontSize, 'fontSize');
  output.settings.spacing.spacingSizes = mergePresetArray(output.settings.spacing.spacingSizes, groups.spacing, previous.spacing, 'spacing');
  output.settings.custom.design[MARKER_KEY] = {
    version: 1,
    tokenTheme: themeName ?? 'default',
    color: generated.color,
    fontSize: generated.fontSize,
    spacing: generated.spacing,
  };
  return output;
}

function parseArgs(argv) {
  const out = { tokens: null, theme: null, tokenTheme: null, write: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--tokens') out.tokens = argv[++i];
    else if (argv[i] === '--theme') out.theme = argv[++i];
    else if (argv[i] === '--token-theme') out.tokenTheme = argv[++i];
    else if (argv[i] === '--write') out.write = true;
    else throw new Error(`unknown argument: ${argv[i]}`);
  }
  if (!out.tokens || !out.theme) throw new Error('usage: --tokens <tokens.json> --theme <theme.json> [--token-theme <name>] [--write]');
  return out;
}

if (process.argv[1]?.endsWith('theme-json-adapter.mjs')) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const tokens = JSON.parse(readFileSync(args.tokens, 'utf8'));
    const theme = JSON.parse(readFileSync(args.theme, 'utf8'));
    const merged = `${JSON.stringify(mergeThemeJson(theme, tokens, args.tokenTheme), null, 2)}\n`;
    if (args.write) writeFileSync(args.theme, merged);
    else process.stdout.write(merged);
  } catch (error) {
    process.stderr.write(`theme-json-adapter: ${error.message}\n`);
    process.exit(2);
  }
}
