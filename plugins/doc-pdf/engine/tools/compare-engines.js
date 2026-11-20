#!/usr/bin/env node
/**
 * Banc de comparaison de deux moteurs doc-pdf : mêmes sources, sorties comparées octet pour octet.
 *
 *   node tools/compare-engines.js --reference <moteur de référence> --config <documentation.config.json> [--garder] [--pdf]
 *
 * `--reference` désigne la racine d'un moteur (le dossier `engine/` ou la racine du plugin qui le contient).
 * Le moteur courant est celui qui porte ce script. Pour chacun, une configuration temporaire en chemins
 * absolus est écrite sous le dossier temporaire du système (seul `outputDir` diffère d'un moteur à l'autre),
 * puis tournent `icml`, `idml --gabarits --axe <axe>` pour chaque axe de la maquette courante et
 * `idml --guide <id>` pour chaque guide. Rien n'est écrit dans le dépôt client.
 *
 * Code de sortie : 0 si tous les fichiers et tous les codes de commande sont identiques, 1 sinon.
 * `--garder` conserve le dossier temporaire (configurations et sorties) pour inspection.
 * `--pdf` compose ensuite chaque guide avec InDesign, pour chaque moteur (`pdf compose --guide <id> --sortie <tmp>/<id>.indd`,
 * jamais `--maj-pages`), puis compare les PDF par `compare-pdfs`. InDesign doit être fermé, et l'utilisateur d'accord.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadConfig } = require('../guide-config');
const { comparePdfs } = require('./compare-pdfs');

class CompareError extends Error {}

const CURRENT_ENGINE = path.resolve(__dirname, '..');
const CONFIG_NAME = 'documentation.config.json';

function parseArgs(argv) {
  const options = { keep: false, pdf: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--garder') {
      options.keep = true;
    } else if (arg === '--pdf') {
      options.pdf = true;
    } else if (arg === '--reference' || arg === '--config') {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('--')) throw new CompareError(`${arg} attend une valeur.`);
      options[arg === '--reference' ? 'reference' : 'config'] = value;
      i += 1;
    } else {
      throw new CompareError(`Option inconnue : ${arg}. Options : --reference <moteur>, --config <chemin>, --garder, --pdf.`);
    }
  }
  if (!options.reference) throw new CompareError('--reference est obligatoire (racine du moteur de référence).');
  if (!options.config) throw new CompareError('--config est obligatoire (documentation.config.json du projet).');
  return options;
}

/** Dossier `engine/` d'un moteur : accepte le dossier lui-même ou la racine du plugin qui le contient. */
function resolveEngine(root) {
  const base = path.resolve(root);
  for (const candidate of [base, path.join(base, 'engine')]) {
    if (fs.existsSync(path.join(candidate, 'cli.js'))) return candidate;
  }
  throw new CompareError(`Moteur introuvable : ${base} ne contient pas de cli.js (ni engine/cli.js).`);
}

/** Remonte depuis `dir` jusqu'au premier fichier `name`, comme le moteur pour `versionFile`. */
function findUp(dir, name) {
  let current = path.resolve(dir);
  for (;;) {
    const candidate = path.join(current, name);
    if (fs.existsSync(candidate)) return candidate;
    if (path.dirname(current) === current) return null;
    current = path.dirname(current);
  }
}

/** Configuration temporaire : tous les chemins en absolu depuis le dossier d'origine, `outputDir` imposé. */
function buildTempConfig(raw, originalFile, outputDir) {
  const dir = path.dirname(path.resolve(originalFile));
  const absolute = value => path.resolve(dir, value);
  const config = { ...raw, outputDir };
  config.sourceDir = absolute(raw.sourceDir);
  config.pagesFile = absolute(raw.pagesFile);
  if (raw.maquette !== undefined) config.maquette = absolute(raw.maquette);
  const versionFile = raw.versionFile === undefined ? findUp(dir, 'package.json') : absolute(raw.versionFile);
  if (versionFile) config.versionFile = versionFile;
  config.guides = (raw.guides || []).map(guide => (
    typeof guide.document === 'string' ? { ...guide, document: absolute(guide.document) } : guide
  ));
  return config;
}

function listFiles(root) {
  const found = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else found.push(path.relative(root, full).split(path.sep).join('/'));
    }
  };
  if (fs.existsSync(root)) walk(root);
  return found.sort();
}

/** Compare deux arbres octet pour octet. */
function compareTrees(referenceDir, currentDir) {
  const reference = listFiles(referenceDir);
  const current = listFiles(currentDir);
  const currentSet = new Set(current);
  const referenceSet = new Set(reference);
  const identical = [];
  const different = [];
  for (const file of reference) {
    if (!currentSet.has(file)) continue;
    const same = fs.readFileSync(path.join(referenceDir, file)).equals(fs.readFileSync(path.join(currentDir, file)));
    (same ? identical : different).push(file);
  }
  return {
    identical,
    different,
    onlyReference: reference.filter(file => !currentSet.has(file)),
    onlyCurrent: current.filter(file => !referenceSet.has(file))
  };
}

/** Commandes jouées par chaque moteur, dans l'ordre. */
function commandsFor(axes, guideIds) {
  return [
    ['icml'],
    ...axes.map(axis => ['idml', '--gabarits', '--axe', axis]),
    ...guideIds.map(id => ['idml', '--guide', id])
  ];
}

function runEngine(engineDir, configFile, commands, run = spawnSync) {
  const cli = path.join(engineDir, 'cli.js');
  return commands.map((command) => {
    const result = run(process.execPath, [cli, ...command, '--config', configFile], { encoding: 'utf8', cwd: path.dirname(configFile) });
    return { command: command.join(' '), status: result.status, stderr: (result.stderr || '').trim() };
  });
}

/** Compose chaque guide avec un moteur (InDesign, un guide après l'autre) ; renvoie le PDF écrit à côté du .indd. */
function composeGuides(engineDir, configFile, side, guideIds, run) {
  const cli = path.join(engineDir, 'cli.js');
  return guideIds.map((id) => {
    const indd = path.join(side, 'pdf', `${id}.indd`);
    fs.mkdirSync(path.dirname(indd), { recursive: true });
    const result = run(process.execPath, [cli, 'pdf', 'compose', '--guide', id, '--sortie', indd, '--config', configFile], { encoding: 'utf8', cwd: path.dirname(configFile) });
    return { id, status: result.status, stderr: (result.stderr || '').trim(), pdf: indd.replace(/.indd$/i, '.pdf') };
  });
}

function compare({ referenceEngine, currentEngine = CURRENT_ENGINE, configPath, keep = false, pdf = false, run = spawnSync, compareFn = comparePdfs, log = console.log }) {
  const originalFile = path.resolve(configPath);
  const raw = JSON.parse(fs.readFileSync(originalFile, 'utf8'));
  const config = loadConfig({ configPath: originalFile });
  const axes = Object.keys(config.maquette.axes.noms);
  const commands = commandsFor(axes, config.guides.map(guide => guide.id));

  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-pdf-compare-'));
  try {
    const sides = {};
    for (const [name, engine] of [['reference', referenceEngine], ['current', currentEngine]]) {
      const side = path.join(work, name);
      const outputDir = path.join(side, 'output');
      fs.mkdirSync(side, { recursive: true });
      const file = path.join(side, CONFIG_NAME);
      fs.writeFileSync(file, `${JSON.stringify(buildTempConfig(raw, originalFile, outputDir), null, 2)}\n`);
      sides[name] = { outputDir, file, side, engine, runs: runEngine(engine, file, commands, run) };
    }

    const tree = compareTrees(sides.reference.outputDir, sides.current.outputDir);
    const commandGaps = commands.flatMap((_, index) => {
      const a = sides.reference.runs[index];
      const b = sides.current.runs[index];
      return a.status === b.status ? [] : [`${a.command} : référence ${a.status}, courant ${b.status}`];
    });
    const failed = ['reference', 'current'].flatMap(name => sides[name].runs
      .filter(entry => entry.status !== 0)
      .map(entry => `${name} : ${entry.command} → code ${entry.status}${entry.stderr ? ` (${entry.stderr.split('\n')[0]})` : ''}`));

    const pdfResults = [];
    if (pdf) {
      const ids = config.guides.map(guide => guide.id);
      const composed = {};
      for (const name of ['reference', 'current']) {
        composed[name] = composeGuides(sides[name].engine, sides[name].file, sides[name].side, ids, run);
      }
      ids.forEach((id, index) => {
        const a = composed.reference[index];
        const b = composed.current[index];
        if (a.status !== 0 || b.status !== 0) {
          pdfResults.push({ id, ok: false, reason: `composition en échec (référence ${a.status}, courant ${b.status})` });
          return;
        }
        const result = compareFn(a.pdf, b.pdf);
        pdfResults.push({ id, ok: result.ok, ...result });
      });
    }

    const ok = tree.different.length === 0 && tree.onlyReference.length === 0 && tree.onlyCurrent.length === 0
      && commandGaps.length === 0 && failed.length === 0 && tree.identical.length > 0
      && pdfResults.every(entry => entry.ok);

    log(`Fichiers identiques : ${tree.identical.length}`);
    tree.different.forEach(file => log(`DIFFÈRE : ${file}`));
    tree.onlyReference.forEach(file => log(`ABSENT du moteur courant : ${file}`));
    tree.onlyCurrent.forEach(file => log(`EN TROP dans le moteur courant : ${file}`));
    commandGaps.forEach(gap => log(`CODE DIFFÉRENT : ${gap}`));
    failed.forEach(entry => log(`COMMANDE EN ÉCHEC : ${entry}`));
    pdfResults.forEach((entry) => {
      if (entry.reason) log(`PDF ${entry.id} : ${entry.reason}`);
      else log(`PDF ${entry.id} : ${entry.ok ? 'identique' : `écarts (pages ${entry.pages.join('/')}, texte ${entry.textDifferent.join(',') || '-'}, rendu ${entry.renderDifferent.join(',') || '-'})`}`);
    });
    if (tree.identical.length === 0) log('Aucun fichier comparé : les deux moteurs n’ont rien produit.');
    log(ok ? 'Sorties identiques octet pour octet.' : 'Écarts constatés.');
    if (keep) log(`Sorties conservées : ${work}`);
    return { ok, ...tree, commandGaps, failed, pdfResults, work };
  } finally {
    if (!keep) fs.rmSync(work, { recursive: true, force: true });
  }
}

function main(argv) {
  try {
    const options = parseArgs(argv);
    const result = compare({
      referenceEngine: resolveEngine(options.reference),
      configPath: options.config,
      keep: options.keep,
      pdf: options.pdf
    });
    return result.ok ? 0 : 1;
  } catch (error) {
    if (!(error instanceof CompareError) && error.name !== 'ConfigError') throw error;
    console.error(error.message);
    return 1;
  }
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = { CompareError, parseArgs, resolveEngine, findUp, buildTempConfig, listFiles, compareTrees, commandsFor, composeGuides, compare, main };
