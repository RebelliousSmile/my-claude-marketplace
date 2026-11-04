#!/usr/bin/env node
// Couverture de routage — déterministe, zéro dépendance.
//
// Pour chaque skill de chaque plugin, à partir de SKILL.md + evals/scenarios.json :
// chaque action ROUTABLE — celle qu'un énoncé d'utilisateur peut atteindre
// directement — a ≥1 scénario dont expect_action la cible.
//
// Le dépôt documente le routage sous SEPT formes. Les modéliser toutes est le
// travail du détecteur : imposer une forme unique reviendrait à réécrire trente
// SKILL.md pour satisfaire un linter, alors que chaque forme est adaptée à sa
// skill (table de dispatch pour readme, chaîne séquentielle pour legacy).
//
//   (a) table de déclencheurs — une phrase "entre guillemets" puis → `action`
//   (b) colonne « Déclencheur » / « Trigger » dans la table d'actions
//   (c) table de dispatch — | situation | `action` |
//   (d) puce de dispatch — condition → `action`   (une seule action sur la ligne)
//   (e) chaîne séquentielle — `scan` → `migrate`  (≥2 actions : seule la TÊTE
//       est routable, la suite sont des étapes internes du pipeline)
//   (f) action unique déclarée — routable par défaut, faute d'alternative
//   (g) flowchart Mermaid AIDD — les nœuds portant un slug d'action sont routables
//
// (a) et (b) sont des déclarations explicites de déclencheur et l'emportent.
// À défaut, (c)(d)(e) sont lues dans la section de flux. À défaut, (f).
//
// Les préfixes numériques sont retirés partout (`01-scan` ≡ `scan`) : le numéro
// identifie un fichier, il ne fait pas partie de l'identité de l'action.
//
//   node tools/eval/coverage.mjs
//
// Exit 0 si toute action routable d'une skill DOTÉE de scénarios est couverte.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ID = '[a-z0-9][a-z0-9+._-]*';
const norm = (s) => s.replace(/^\d+[-.]/, '');

const FLOW_HEADING_RE = /^##+\s+(default flow|flux(\s+par\s+défaut)?|routing|dispatch)/i;
const ACTIONS_HEADING_RE = /^##+\s+(available actions|actions disponibles|actions)/i;
const TRIGGER_COL_RE = /^(d[ée]clencheur|trigger)s?$/i;
const EMPTY_CELL_RE = /^[-—–:\s]*$/;

function walk(dir, hits) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    if (['EACCES', 'EPERM'].includes(error.code)) return;
    throw error;
  }
  for (const e of entries) {
    if (e.isDirectory() && ['.git', '.pytest_cache', 'node_modules'].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, hits);
    else if (e.name === 'SKILL.md') hits.push(p);
  }
}

const cellsOf = (line) => line.split('|').slice(1, -1).map((c) => c.trim());
const isSeparator = (cells) => cells.every((c) => /^:?-{2,}:?$/.test(c));

// Découpe le document en sections repérées par leur titre `##`.
function sections(lines) {
  const out = [{ heading: '', lines: [] }];
  for (const line of lines) {
    if (/^##+\s/.test(line)) out.push({ heading: line, lines: [] });
    else out[out.length - 1].lines.push(line);
  }
  return out;
}

// Table d'actions : identifiants déclarés + ceux dont la colonne « Déclencheur »
// est renseignée (forme b).
function parseActionTable(lines) {
  const declared = new Set();
  const columnTriggered = new Set();
  let trigCol = -1;
  for (const line of lines) {
    if (!line.trimStart().startsWith('|')) continue;
    const cells = cellsOf(line);
    if (cells.length < 2 || isSeparator(cells)) continue;

    const actIdx = cells.findIndex((c) => /^actions?$/i.test(c));
    if (actIdx !== -1) {
      trigCol = cells.findIndex((c) => TRIGGER_COL_RE.test(c));
      continue;
    }
    const numbered = /^\d+$/.test(cells[0]);
    const actionCell = numbered ? cells[1] : cells[0];
    const m = new RegExp('^`?(' + ID + ')`?$').exec(actionCell ?? '');
    if (!m) continue;
    const id = norm(m[1]);
    declared.add(id);
    if (trigCol > -1 && !EMPTY_CELL_RE.test(cells[trigCol] ?? '')) columnTriggered.add(id);
  }
  return { declared, columnTriggered };
}

// Forme (a) — la phrase entre guillemets est le déclencheur, la PREMIÈRE flèche
// désigne la cible ; les suivantes sont des étapes internes.
function quotedTriggers(lines, declared) {
  const out = new Set();
  const re = new RegExp('→\\s*`(' + ID + ')`');
  for (const line of lines) {
    if (!line.includes('"')) continue;
    const m = re.exec(line);
    if (m && declared.has(norm(m[1]))) out.add(norm(m[1]));
  }
  return out;
}

// Formes (c)(d)(e), lues dans la section de flux uniquement.
function flowTriggers(flowLines, declared) {
  const out = new Set();
  const tokenRe = new RegExp('`?(' + ID + ')`?', 'g');

  for (const line of flowLines) {
    // (c) table de dispatch : la dernière cellule porte l'action cible.
    if (line.trimStart().startsWith('|')) {
      const cells = cellsOf(line);
      if (cells.length < 2 || isSeparator(cells)) continue;
      if (/^\d+$/.test(cells[0])) continue; // table d'actions, pas de dispatch
      const m = new RegExp('^`?(' + ID + ')`?').exec(cells[cells.length - 1]);
      if (m && declared.has(norm(m[1]))) out.add(norm(m[1]));
      continue;
    }

    // (d) et (e) se distinguent par le NOMBRE d'actions déclarées sur la ligne.
    if (!line.includes('→') && !line.includes('->')) continue;
    const hits = [];
    for (const m of line.matchAll(tokenRe)) {
      const id = norm(m[1]);
      if (declared.has(id)) hits.push(id);
    }
    if (hits.length === 1) out.add(hits[0]);       // (d) dispatch
    else if (hits.length > 1) out.add(hits[0]);    // (e) tête de chaîne
  }
  return out;
}

// Forme (g) — routeur généré par aidd-context:skill-generate. Le flowchart est
// la source de dispatch et la table Action | Does reste volontairement minimale.
function mermaidTriggers(lines, declared) {
  const out = new Set();
  let inMermaid = false;
  for (const line of lines) {
    if (line.trim() === '```mermaid') { inMermaid = true; continue; }
    if (inMermaid && line.trim() === '```') { inMermaid = false; continue; }
    if (!inMermaid || (!line.includes('-->') && !line.includes('-.->'))) continue;
    for (const action of declared) {
      if (new RegExp(`(^|[^a-z0-9+._-])${action}([^a-z0-9+._-]|$)`).test(line)) out.add(action);
    }
  }
  return out;
}

function parseSkill(skillPath) {
  const txt = readFileSync(skillPath, 'utf8');
  const lines = txt.split(/\r?\n/);
  const secs = sections(lines);

  const actionSecs = secs.filter((s) => ACTIONS_HEADING_RE.test(s.heading));
  const tableLines = actionSecs.length ? actionSecs.flatMap((s) => s.lines) : lines;
  const { declared, columnTriggered } = parseActionTable(tableLines);

  const flowLines = secs.filter((s) => FLOW_HEADING_RE.test(s.heading)).flatMap((s) => s.lines);

  // Déclarations explicites d'abord.
  let routable = new Set([...quotedTriggers(lines, declared), ...columnTriggered]);
  let shape = routable.size ? 'déclencheur explicite' : null;

  if (!routable.size && flowLines.length) {
    routable = flowTriggers(flowLines, declared);
    if (routable.size) shape = 'flux';
  }
  if (!routable.size) {
    routable = mermaidTriggers(lines, declared);
    if (routable.size) shape = 'mermaid';
  }
  if (!routable.size && declared.size === 1) {
    routable = new Set(declared);
    shape = 'action unique';
  }
  return { declared, routable: [...routable], shape };
}

function scenarioActions(scenarioPath) {
  if (!existsSync(scenarioPath)) return null;
  return JSON.parse(readFileSync(scenarioPath, 'utf8')).map((c) => c.expect_action);
}

// Politique de verdict pour une skill routable SANS scenarios.json.
//
// Ce cas ne se déclenchait jamais tant que le détecteur ne voyait aucune action
// routable dans ces skills. Le corriger le rend atteignable pour une vingtaine
// d'entre elles, qui n'ont jamais eu de suite de routage. Les traiter toutes en
// échec est littéralement vrai et pratiquement inutile : les régressions réelles
// disparaîtraient dans le bruit.
//
// La dette est donc comptée, pas sanctionnée — `○`, sans échec. Le compteur est
// là pour qu'elle reste visible : s'il cesse de décroître, c'est la politique
// qu'il faut durcir, pas le compteur qu'il faut masquer.
//
// Un discriminant « `evals/` existe mais pas `scenarios.json` = travail commencé
// et non tenu » a été essayé et retiré : il ne séparait rien dans ce dépôt (la
// seule skill qui le déclenchait portait dans `evals/` des suites comportementales
// `behave` — un autre harnais, pas un routage abandonné).
// Ce cas mérite une mention distincte, pas un échec.
function missingSuitePolicy() {
  return 'todo';
}

// Une skill peut porter un harnais comportemental (`overcode:behave`) sans suite
// de routage : le dire évite de lire l'absence de `scenarios.json` comme un vide.
function otherHarness(dir) {
  const d = join(dir, 'evals');
  if (!existsSync(d)) return null;
  const n = readdirSync(d).filter((f) => f.endsWith('-scenarios.md')).length;
  return n ? `${n} suite(s) behave` : null;
}

const skills = [];
walk('plugins', skills);
skills.sort();

let failed = 0;
let unverifiable = 0;
let todo = 0;
const report = [];

for (const skillPath of skills) {
  const dir = dirname(skillPath);
  const id = dir.replace(/\\/g, '/').replace(/^plugins\//, '');
  const { declared, routable, shape } = parseSkill(skillPath);
  const scen = scenarioActions(join(dir, 'evals', 'scenarios.json'));
  const problems = [];
  const notes = [];
  let nonNull = 0;

  if (scen === null) {
    if (!routable.length) { report.push(`  ·  ${id} — pas de scenarios.json (aucune action routable, OK)`); continue; }
    const verdict = missingSuitePolicy(dir);
    const other = otherHarness(dir);
    if (verdict === 'fail') { problems.push(`pas de scenarios.json (${routable.length} action(s) routable(s))`); failed++; }
    else if (verdict === 'todo') { report.push(`○ ${id} — suite de routage absente (${routable.length} action(s) routable(s) : ${routable.join(', ')})${other ? ` — porte ${other}` : ''}`); todo++; continue; }
    else continue;
  } else {
    const covered = new Set(scen.filter((a) => a !== null).map(norm));
    nonNull = covered.size;
    for (const a of covered) if (!declared.has(a)) notes.push(`label hors table (sémantique ?) : '${a}'`);
    for (const a of routable) if (!covered.has(a)) { problems.push(`action routable non couverte : '${a}'`); failed++; }
  }

  // ⚠ non vérifiable : des scénarios ciblent des actions, mais aucune action
  // routable n'a pu être établie — le ✓ serait trompeur.
  const unverif = !problems.length && routable.length === 0 && nonNull > 0;
  if (problems.length) { report.push(`✗ ${id}`); for (const p of problems) report.push(`      ✗ ${p}`); }
  else if (unverif) {
    const cause = declared.size ? `${declared.size} action(s) déclarée(s), aucun déclencheur lisible` : 'aucune action déclarée dans SKILL.md';
    report.push(`⚠ ${id} — couverture NON vérifiable (${cause}, ${nonNull} scénario(s) présents)`);
    unverifiable++;
  } else report.push(`✓ ${id} — ${routable.length} action(s) routable(s) couverte(s) [${shape}]`);
  for (const n of notes) report.push(`      · ${n}`);
}

console.log(report.join('\n'));
const warn = unverifiable ? ` · ${unverifiable} non vérifiable(s) ⚠` : '';
const suites = todo ? ` · ${todo} suite(s) de routage absente(s) ○` : '';
console.log(`\n${failed ? '✗' : '✓'} ${skills.length} skills analysés — ${failed} problème(s)${warn}${suites}`);
process.exit(failed ? 1 : 0);
