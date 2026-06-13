#!/usr/bin/env node
// Couverture de routage — déterministe, zéro dépendance.
// Pour chaque skill de chaque plugin, à partir de SKILL.md + evals/scenarios.json :
//   - (DUR) chaque action ROUTABLE — celle qui apparaît dans une ligne de
//     mapping trigger→action (une phrase entre "guillemets" suivie de → `action`)
//     — a ≥1 scénario dont expect_action la cible. Sinon : NON COUVERTE (échec).
//   - (INFO) expect_action qui n'est pas un id d'action déclaré : signalé sans
//     échec — le dépôt admet des labels sémantiques (ex. `build+wire`) ; à l'œil.
//
// Les flèches de FLUX (`analyze → plan`, sans guillemets) ne sont PAS des
// déclencheurs et sont ignorées. Les actions purement internes (pipelines) n'ont
// pas de déclencheur → hors périmètre par construction.
//
//   node tools/eval/coverage.mjs
//
// Exit 0 si toute action routable est couverte ; 1 sinon.

import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ACTION_ROW_RE = /^\|\s*\d+\s*\|\s*`([a-z0-9+-]+)`/;     // | 01 | `assemble` | …
const TRIGGER_RE = /→\s*`([a-z0-9+-]+)`/g;                    // … → `assemble`

function walk(dir, hits) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, hits);
    else if (e.name === 'SKILL.md') hits.push(p);
  }
}

function parseSkill(skillPath) {
  const txt = readFileSync(skillPath, 'utf8');
  const actions = new Set();
  const triggerActions = new Set();
  for (const line of txt.split(/\r?\n/)) {
    const m = ACTION_ROW_RE.exec(line);
    if (m) actions.add(m[1]);
    // une ligne de mapping trigger→action contient une phrase "entre guillemets"
    // avant la flèche ; les flèches de flux (`analyze → plan`) sont exclues. Sur
    // une ligne qui CHAÎNE un flux (`"…" → `intake` → `extract``), seule la
    // PREMIÈRE flèche est la cible routée ; les suivantes sont des étapes internes.
    if (line.includes('"')) { const m2 = TRIGGER_RE.exec(line); if (m2) triggerActions.add(m2[1]); TRIGGER_RE.lastIndex = 0; }
  }
  // ne garder en "routable" que ce qui est aussi une action déclarée
  const routable = [...triggerActions].filter((a) => actions.has(a));
  return { actions, routable };
}

function scenarioActions(scenarioPath) {
  if (!existsSync(scenarioPath)) return null;
  const arr = JSON.parse(readFileSync(scenarioPath, 'utf8'));
  return arr.map((c) => c.expect_action);
}

const skills = [];
walk('plugins', skills);
skills.sort();

let failed = 0;
let unverifiable = 0;
const report = [];
for (const skillPath of skills) {
  const dir = dirname(skillPath);
  const id = dir.replace(/\\/g, '/').replace(/^plugins\//, '');
  const { actions, routable } = parseSkill(skillPath);
  const scen = scenarioActions(join(dir, 'evals', 'scenarios.json'));
  const problems = [];

  const notes = [];
  let nonNull = 0;
  if (scen === null) {
    if (routable.length) { problems.push(`pas de scenarios.json (mais ${routable.length} action(s) routable(s))`); failed++; }
    else { report.push(`  ·  ${id} — pas de scenarios.json (aucune action routable, OK)`); continue; }
  } else {
    const covered = new Set(scen.filter((a) => a !== null));
    nonNull = covered.size;
    for (const a of covered) if (!actions.has(a)) notes.push(`label hors table (sémantique ?) : '${a}'`);
    for (const a of routable) if (!covered.has(a)) { problems.push(`action routable non couverte : '${a}'`); failed++; }
  }

  // ⚠ non vérifiable : des scénarios ciblent des actions, mais AUCUNE action
  // routable n'a été détectée dans SKILL.md (déclencheurs en frontmatter YAML
  // `triggers:` ou format non reconnu) → le ✓ serait trompeur, on ne peut rien certifier.
  const unverif = !problems.length && routable.length === 0 && nonNull > 0;
  if (problems.length) { report.push(`✗ ${id}`); for (const p of problems) report.push(`      ✗ ${p}`); }
  else if (unverif) { report.push(`⚠ ${id} — couverture NON vérifiable (0 action routable détectée, ${nonNull} scénario(s) présents)`); unverifiable++; }
  else report.push(`✓ ${id} — ${routable.length} action(s) routable(s) couverte(s)`);
  for (const n of notes) report.push(`      · ${n}`);
}

console.log(report.join('\n'));
const warn = unverifiable ? ` · ${unverifiable} non vérifiable(s) ⚠` : '';
console.log(`\n${failed ? '✗' : '✓'} ${skills.length} skills analysés — ${failed} problème(s)${warn}`);
process.exit(failed ? 1 : 0);
