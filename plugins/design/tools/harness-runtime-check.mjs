#!/usr/bin/env node
// harness-runtime-check.mjs — execute the JS of a generated maquette, do not grep it.
//
// The selftest asserts on the TEXT of the generated file. A generator that emits a
// syntactically dead <script> still satisfies every one of those assertions: measured on a
// copy carrying an unbalanced brace in setViewport, the selftest printed ALL GREEN / exit 0
// while the produced file answered `typeof setPage === "undefined"` in a browser. This file
// closes that: the two control scripts are evaluated, and the contract the fidelity oracle
// calls (window.setPage / window.setViewport) is exercised.
//
// stdlib only — the repo has no node_modules and `pnpm test` has no dependency.
// Exit space 0 / 1, like the selftest that calls it. Never 2: that space belongs to
// harness.py (references/harness-contract.md).
//
// It also checks the three-branch page-key invariant — the `pages` registry, the
// <option value> set and the oracle config's reference_page are one and the same set.
// The three are written by three different hands (generator, human filling the file,
// config-gen) and nothing else reconciles them: a key renamed in one branch alone
// yields a page unreachable from the selector, or a measurement of a void. That is why
// the check runs on ANY file, filled or scaffolded, not only on generator output.
//
// Usage: node harness-runtime-check.mjs <file.html> [--expect-pages home,contact]
//                                                   [--oracle-config path.json]

import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import vm from 'node:vm';

const USAGE = 'usage: harness-runtime-check.mjs <file.html> [--expect-pages a,b] [--oracle-config c.json]';
// A flag consumes its value, wherever the positional sits: `--expect-pages home f.html`
// checks f.html, never a file named `home`.
let parsed;
try {
  parsed = parseArgs({
    options: { 'expect-pages': { type: 'string' }, 'oracle-config': { type: 'string' } },
    allowPositionals: true,
  });
} catch (e) {
  console.error(`${e.message}
${USAGE}`);
  process.exit(1);
}
const { values, positionals } = parsed;
if (positionals.length !== 1) {
  console.error(USAGE);
  process.exit(1);
}
const [file] = positionals;
const expectPages = (values['expect-pages'] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const oracleConfig = values['oracle-config'] ?? null;

const fail = (msg) => {
  console.error(`FAIL runtime ${file}: ${msg}`);
  process.exit(1);
};

let html;
try {
  html = readFileSync(file, 'utf8');
} catch (e) {
  fail(`unreadable: ${e.message}`);
}

// ─── Extract the control scripts ─────────────────────────────────────────────
// Comments FIRST. The template's LLM framing block quotes `<script>` literally inside a
// <!-- … --> (harness.py, RESPONSIVE note): a naive match opens there and reports a
// SyntaxError on a perfectly healthy file.
const stripped = html.replace(/<!--[\s\S]*?-->/g, '');

// A <script> carrying attributes is a script this checker does not evaluate. Passing it
// silently would rebuild the very blind spot this file exists to close.
const attributed = stripped.match(/<script\s[^>]*>/i);
if (attributed) fail(`a <script> with attributes is not covered by this check: ${attributed[0]}`);

const bodies = [...stripped.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
if (bodies.length < 2) {
  fail(`${bodies.length} <script> body/bodies found, the harness declares 2`);
}

// ─── DOM stub ────────────────────────────────────────────────────────────────
// Exactly what the harness JS touches, and nothing more: an unstubbed API must throw so a
// future addition to the control scripts fails loudly instead of passing unmeasured.
const classList = () => {
  const set = new Set();
  return {
    _set: set,
    add: (...c) => c.forEach((x) => set.add(x)),
    remove: (...c) => c.forEach((x) => set.delete(x)),
    contains: (c) => set.has(c),
    toggle: (c, on) => (on === undefined ? (set.has(c) ? set.delete(c) : set.add(c)) : on ? set.add(c) : set.delete(c)),
  };
};
const el = (extra = {}) => ({
  innerHTML: '',
  textContent: '',
  scrollTop: 0,
  dataset: {},
  classList: classList(),
  attributes: {},
  setAttribute(n, v) { this.attributes[n] = v; },
  getAttribute(n) { return this.attributes[n]; },
  removeAttribute(n) { delete this.attributes[n]; },
  addEventListener() {},
  querySelector() { return null; },
  querySelectorAll() { return []; },
  ...extra,
});

const container = el();
const frame = el();
const stage = el();
const select = el({ value: '' });
const buttons = ['desktop', 'tablet', 'mobile'].map((v) => el({ dataset: { viewport: v } }));

const document_ = {
  getElementById(id) {
    if (id === 'page-container') return container;
    if (id === 'preview-frame') return frame;
    if (id === 'page-select') return select;
    throw new Error(`unstubbed getElementById(${JSON.stringify(id)})`);
  },
  querySelector(sel) {
    if (sel === '.preview-stage') return stage;
    throw new Error(`unstubbed querySelector(${JSON.stringify(sel)})`);
  },
  querySelectorAll(sel) {
    if (sel === '.viewport-btn') return buttons;
    throw new Error(`unstubbed querySelectorAll(${JSON.stringify(sel)})`);
  },
};

const sandbox = {
  document: document_,
  location: { hash: '' },
  history: { replaceState() {} },
  console: { error() {}, warn() {}, log() {} },
  encodeURIComponent,
  decodeURIComponent,
  String, Object, Array, JSON, Error, RegExp, Math, Set, Map,
};
sandbox.window = sandbox;         // window === the sandbox global, as in a browser
sandbox.globalThis = sandbox;

const ctx = vm.createContext(sandbox);

bodies.forEach((body, i) => {
  try {
    vm.runInContext(body, ctx, { filename: `${file}#script${i + 1}`, timeout: 1000 });
  } catch (e) {
    // An unbalanced brace reports at end of input, with no useful position — the script
    // index is the locator that actually helps.
    fail(`script ${i + 1} did not evaluate: ${e.name}: ${e.message}`);
  }
});

// ─── The contract the fidelity oracle calls ──────────────────────────────────
const check = (label, cond, detail = '') => {
  if (!cond) fail(`${label}${detail ? ` — ${detail}` : ''}`);
};

check('window.setPage is not a function', typeof sandbox.window.setPage === 'function');
check('window.setViewport is not a function', typeof sandbox.window.setViewport === 'function');
check('#page-container is empty after init()', container.innerHTML.length > 0);

try {
  sandbox.window.setViewport('mobile');
} catch (e) {
  fail(`setViewport('mobile') threw: ${e.name}: ${e.message}`);
}
check("setViewport('mobile') did not set the mobile class", frame.classList.contains('mobile'));
check(
  "setViewport('mobile') left an aria-pressed unset",
  buttons.every((b) => b.getAttribute('aria-pressed') !== undefined),
);
sandbox.window.setViewport('desktop');
check("setViewport('desktop') left the mobile class on the frame", !frame.classList.contains('mobile'));

// An unknown key renders a state, never propagates an exception: measure.py calls
// window.setPage(key) unguarded and must get a DOM back.
try {
  sandbox.window.setPage('a-key-no-page-declares');
} catch (e) {
  fail(`setPage(unknown) threw instead of rendering: ${e.name}: ${e.message}`);
}
check(
  'an unknown page key does not render the not-found state',
  container.innerHTML.includes('Page introuvable'),
  container.innerHTML.slice(0, 120),
);

for (const key of expectPages) {
  sandbox.window.setPage(key);
  check(`page "${key}" renders nothing`, container.innerHTML.length > 0);
  check(`page "${key}" did not sync the selector`, select.value === key, `select.value = ${select.value}`);
}

// ─── The three-branch page-key invariant ─────────────────────────────────────
// Branch 1 — the registry, read from the LEXICAL scope: `const pages` at a script's top
// level lands in the context's global declarative record, shared across runInContext
// calls (which is how script 2 reads it), but it is never a property of the global
// object — sandbox.pages is undefined. Evaluating in the context is the only reading.
let registryKeys;
try {
  registryKeys = vm.runInContext('Object.keys(pages)', ctx, { timeout: 1000 });
} catch (e) {
  fail(`the pages registry is not readable: ${e.name}: ${e.message}`);
}
check('the pages registry is empty', registryKeys.length > 0);

// Page grounding is a registry too: every rendered page must have exactly one metadata
// entry so a renamed key cannot silently keep the source or theme of another page.
let metadata;
try {
  metadata = vm.runInContext('pageMetadata', ctx, { timeout: 1000 });
} catch (e) {
  fail(`the pageMetadata registry is not readable: ${e.name}: ${e.message}`);
}
const metadataKeys = Object.keys(metadata);
const missingMetadata = registryKeys.filter((k) => !metadataKeys.includes(k));
const orphanMetadata = metadataKeys.filter((k) => !registryKeys.includes(k));
check('page key(s) with no metadata entry', missingMetadata.length === 0, missingMetadata.join(', '));
check('metadata key(s) with no page', orphanMetadata.length === 0, orphanMetadata.join(', '));

const themedKey = registryKeys.find((k) => metadata[k] && metadata[k].theme);
if (themedKey) {
  sandbox.window.setPage(themedKey);
  check(
    `page "${themedKey}" did not apply its contract theme`,
    container.getAttribute('data-theme') === metadata[themedKey].theme,
    `data-theme = ${container.getAttribute('data-theme')}`,
  );
  const unthemedKey = registryKeys.find((k) => !metadata[k] || !metadata[k].theme);
  if (unthemedKey) {
    sandbox.window.setPage(unthemedKey);
    check(
      `page "${unthemedKey}" retained the prior page theme`,
      container.getAttribute('data-theme') === undefined,
    );
  }
}

// Branch 2 — the <option value> set, taken from the page selector only, on the
// comment-stripped HTML: the template's LLM framing quotes markup inside <!-- … -->,
// and a scan that reads it would go red on every conformant file.
const unescape = (s) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
   .replace(/&#x27;/g, "'").replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const selectBlock = stripped.match(/<select\b[^>]*id="page-select"[^>]*>([\s\S]*?)<\/select>/i);
if (!selectBlock) fail('no <select id="page-select"> found — the page selector is the option branch');
const optionKeys = [...selectBlock[1].matchAll(/<option\b[^>]*\bvalue="([^"]*)"/gi)].map((m) => unescape(m[1]));

const missingOption = registryKeys.filter((k) => !optionKeys.includes(k));
const orphanOption = optionKeys.filter((k) => !registryKeys.includes(k));
check(
  'page key(s) in the registry with no <option>',
  missingOption.length === 0,
  `${missingOption.join(', ')} — unreachable from the selector`,
);
check(
  '<option> value(s) no registry entry declares',
  orphanOption.length === 0,
  `${orphanOption.join(', ')} — selecting one renders the not-found state`,
);

// Branch 3 — the oracle config. Optional: not every caller holds one. When it is given,
// its reference_page must name a page the file declares, or the oracle measures a void.
let oracleNote = '';
if (oracleConfig) {
  let cfg;
  try {
    cfg = JSON.parse(readFileSync(oracleConfig, 'utf8'));
  } catch (e) {
    fail(`--oracle-config unreadable or not JSON: ${oracleConfig}: ${e.message}`);
  }
  const refPage = cfg.reference_page;
  if (refPage === undefined || refPage === null) {
    // null is the declared "no SPA key" value of the config schema, not a defect.
    oracleNote = ', oracle reference_page null';
  } else {
    check(
      `oracle reference_page "${refPage}" is not a page of this file`,
      registryKeys.includes(refPage),
      `declared: ${registryKeys.join(', ')}`,
    );
    oracleNote = `, oracle reference_page ${refPage}`;
  }
}

const pagesNote = expectPages.length ? `, pages ${expectPages.join('/')}` : '';
console.log(
  `ok   runtime: ${bodies.length} scripts, setPage/setViewport live${pagesNote}` +
  `, ${registryKeys.length} page key(s) consistent registry/options${oracleNote}`,
);
process.exit(0);
