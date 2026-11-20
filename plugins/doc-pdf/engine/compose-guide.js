#!/usr/bin/env node
/**
 * Pilote InDesign pour un guide (plan `aidd_docs/tasks/2026_11/2026_11_19_moteur-documentation-pdf`).
 *
 *   node <racine du plugin>/engine/compose-guide.js [build] --guide <id> --chapitre 01-vue-ensemble [--config <chemin>]
 *   node <racine du plugin>/engine/compose-guide.js update --guide <id> [--force] [--config <chemin>]
 *   node <racine du plugin>/engine/compose-guide.js compose --guide <id> [--remplacer] [--maj-pages] [--sortie <fichier.indd>] [--config <chemin>]
 *
 * `build` (commande par défaut) compose un chapitre d'essai et écrit sous `<outputDir>/pdf-essai/` (non suivi).
 * `update` met à jour le .indd du guide (champ `document` de la configuration) : régénération des ICML
 * (arrêt sur un ICML corrigé à la main, sauf `--force`), copie de sauvegarde `<nom>.avant-<horodatage>.indd`,
 * rafraîchissement des liens, pages ajoutées ou retirées, PDF écrit sous `<outputDir>/pdf/<nom>-v<version>.pdf`.
 * `compose` place TOUS les chapitres du guide (ICML liés) dans une copie du modèle IDML et écrit le .indd (champ
 * `document`, ou `--sortie`) et son PDF (`<outputDir>/pdf/<nom>-v<version>.pdf` ; à côté du .indd avec `--sortie`). Un .indd existant n'est remplacé qu'avec `--remplacer` (copie de sauvegarde faite).
 * Le guide est désigné par son identifiant (ou son dossier) dans `documentation.config.json`.
 * `update` et `compose` finissent par un constat d'empreintes avant/après (ICML, IDML, .indd, PDF) : à lire avant
 * d'annoncer qu'un correctif est livré.
 * Refuse si InDesign est déjà ouvert : l'application ne se pilote que sur un poste où l'utilisateur
 * l'a fermée et a donné son accord.
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { spawnSync } = require('child_process');
const { ConfigError, loadConfig, extractConfigArg, findGuide, readVersion } = require('./guide-config');
const { outputPathFor } = require('./build-idml-template');

const LAUNCHER = path.join(__dirname, 'indesign', 'run-indesign.ps1');
const COMPOSE_SCRIPT = path.join(__dirname, 'indesign', 'compose-chapter.jsx');
const UPDATE_SCRIPT = path.join(__dirname, 'indesign', 'update-document.jsx');
const COMPOSE_GUIDE_SCRIPT = path.join(__dirname, 'indesign', 'compose-guide.jsx');
const COMMANDS = ['build', 'update', 'compose'];
const CHAPTER_PATTERN = /^\d{2}-[a-z0-9-]+$/;
const NAME_PATTERN = /^[a-z0-9-]+$/;
const TRIAL_DIR = 'pdf-essai';

class ComposeError extends Error {}

function parseArgs(argv) {
  const { configPath, rest } = extractConfigArg(argv);
  const options = { command: 'build', guide: null, chapitre: null, sortie: null, configPath };
  for (let index = 0; index < rest.length; index += 1) {
    const flag = rest[index];
    if (flag === '--') continue;
    if (COMMANDS.includes(flag)) {
      options.command = flag;
    } else if (flag === '--force') {
      options.force = true;
    } else if (flag === '--remplacer') {
      options.remplacer = true;
    } else if (flag === '--maj-pages') {
      options.majPages = true;
    } else if (flag === '--guide' || flag === '--chapitre' || flag === '--sortie') {
      const value = rest[index + 1];
      if (!value || value.startsWith('--')) throw new ComposeError(`${flag} attend une valeur.`);
      options[flag.slice(2)] = value;
      index += 1;
    } else {
      throw new ComposeError(`Option inconnue : ${flag}`);
    }
  }
  const wholeGuide = options.command !== 'build';
  if (wholeGuide ? !options.guide : (!options.guide || !options.chapitre)) {
    throw new ComposeError('Usage : pdf [build] --guide <guide> --chapitre <0N-nom> [--config <chemin>]\n'
      + '        pdf update --guide <guide> [--force] [--config <chemin>]\n'
      + '        pdf compose --guide <guide> [--remplacer] [--maj-pages] [--sortie <fichier.indd>] [--config <chemin>]');
  }
  if (options.force && options.command !== 'update') throw new ComposeError('--force ne vaut que pour la commande update.');
  if ((options.remplacer || options.sortie || options.majPages) && options.command !== 'compose') {
    throw new ComposeError('--remplacer, --sortie et --maj-pages ne valent que pour la commande compose.');
  }
  if (wholeGuide && options.chapitre) throw new ComposeError(`${options.command} traite le guide entier : --chapitre ne s'y applique pas.`);
  if (!NAME_PATTERN.test(options.guide) && !/^[A-Za-z0-9._-]+$/.test(options.guide)) {
    throw new ComposeError('Guide : identifiant ou dossier de la configuration.');
  }
  if (options.chapitre && !NAME_PATTERN.test(options.chapitre)) {
    throw new ComposeError('Chapitre : minuscules, chiffres et tirets seulement.');
  }
  return options;
}

/** Vrai si la sortie de `tasklist` (ou toute liste de processus) contient InDesign.exe. */
function isInDesignRunning(processListing) {
  return /(^|\s)InDesign(\.exe)?(\s|$)/im.test(String(processListing));
}

/** Chemins de l'essai pour un guide de la configuration et un chapitre. */
function pathsFor({ guide, chapitre }, config) {
  const entry = findGuide(config, guide);
  const icmlRoot = path.join(config.outputDir, 'icml');
  const icmlDir = path.join(icmlRoot, entry.dir);
  const trialDir = path.join(config.outputDir, TRIAL_DIR);
  return {
    icmlDir,
    chapterDir: path.join(icmlDir, chapitre),
    pagesDir: path.join(icmlDir, '00-pages'),
    commonDir: path.join(icmlRoot, 'common'),
    template: outputPathFor(trialDir, entry.accent, entry.id),
    document: path.join(trialDir, `${entry.dir}-${chapitre}.indd`),
    pdf: path.join(trialDir, `${entry.dir}-${chapitre}.pdf`)
  };
}

/** Noms des ICML communs, lus sur disque (après la régénération). */
function commonNamesIn(commonDir) {
  return fs.existsSync(commonDir) ? fs.readdirSync(commonDir).filter(name => name.toLowerCase().endsWith('.icml')).sort() : [];
}

/**
 * Chemin du PDF livré : `<outputDir>/pdf/<nom du .indd>-v<version>.pdf`. La version est celle de `versionFile`
 * (package.json du projet) ; sans fichier lisible, le nom n'en porte pas.
 */
function releasePdfPath(document, config) {
  let version = null;
  try {
    version = readVersion(config) || null;
  } catch (error) {
    if (!(error instanceof ConfigError)) throw error;
  }
  const name = path.basename(document).replace(/\.indd$/i, '');
  return path.join(config.outputDir, 'pdf', `${name}${version ? `-v${version}` : ''}.pdf`);
}

/** Crée les dossiers parents du .indd et du PDF avant de lancer InDesign. */
function ensureOutputDirs(paths) {
  [paths.document, paths.pdf].forEach(file => fs.mkdirSync(path.dirname(file), { recursive: true }));
}

/** Chemins de la mise à jour : le .indd du guide, son PDF versionné sous <outputDir>/pdf, le préréglage de la configuration. */
function updatePathsFor({ guide }, config) {
  const entry = findGuide(config, guide);
  if (!entry.document) {
    throw new ComposeError(`Le guide « ${entry.id} » n'a pas de champ « document » (chemin du .indd) dans ${path.basename(config.file)}.`);
  }
  const icmlRoot = path.join(config.outputDir, 'icml');
  const commonDir = path.join(icmlRoot, 'common');
  return {
    document: entry.document,
    pdf: releasePdfPath(entry.document, config),
    preset: config.pdfPreset,
    icmlDir: path.join(icmlRoot, entry.dir),
    commonDir,
    commonNames: commonNamesIn(commonDir)
  };
}

/** Chapitres d'un guide : dossiers `0N-nom` de ses ICML, triés ; `00-pages` n'en est pas un. */
function chapterNamesIn(icmlDir) {
  if (!fs.existsSync(icmlDir)) return [];
  return fs.readdirSync(icmlDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && CHAPTER_PATTERN.test(entry.name) && !entry.name.startsWith('00-'))
    .map(entry => entry.name)
    .sort();
}

/** Chemins de la composition du guide entier : modèle IDML, .indd écrit (champ `document` ou `--sortie`), PDF versionné sous <outputDir>/pdf. */
function composePathsFor({ guide, sortie }, config) {
  const entry = findGuide(config, guide);
  const document = sortie ? path.resolve(sortie) : entry.document;
  if (!document) {
    throw new ComposeError(`Le guide « ${entry.id} » n'a pas de champ « document » dans ${path.basename(config.file)} : indiquer --sortie <fichier.indd>.`);
  }
  if (!/\.indd$/i.test(document)) throw new ComposeError(`Le document doit porter l'extension .indd : ${document}`);
  const icmlDir = path.join(config.outputDir, 'icml', entry.dir);
  return {
    template: outputPathFor(path.join(config.outputDir, TRIAL_DIR), entry.accent, entry.id),
    document,
    pdf: sortie ? document.replace(/\.indd$/i, '.pdf') : releasePdfPath(document, config),
    preset: config.pdfPreset,
    icmlDir,
    commonDir: path.join(config.outputDir, 'icml', 'common'),
    pagesDir: path.join(icmlDir, '00-pages'),
    measuredPages: path.join(config.outputDir, 'pages-mesurees', `${entry.dir}.json`),
    chapters: chapterNamesIn(icmlDir)
  };
}

/** Écarts entre deux tables de pages { "N" | "N.M": page } : { key, declared, measured }, triés par numéro. */
function diffPages(declared, measured) {
  const known = declared || {};
  const rank = key => key.split('.').map(Number);
  const keys = [...new Set([...Object.keys(known), ...Object.keys(measured)])].sort((a, b) => {
    const [chapterA, sectionA = 0] = rank(a);
    const [chapterB, sectionB = 0] = rank(b);
    return chapterA - chapterB || sectionA - sectionB;
  });
  return keys.filter(key => known[key] !== measured[key]).map(key => ({ key, declared: known[key], measured: measured[key] }));
}

/** Constat sur les numéros de page des sommaires : écarts entre pages-gabarit.json et le document composé. */
function formatPagesReport(differences) {
  if (differences.length === 0) return 'Numéros de page des sommaires : conformes au document composé.';
  const lines = differences.map(({ key, declared, measured }) => {
    const was = declared === undefined ? 'absent' : `p. ${declared}`;
    const now = measured === undefined ? 'absente du document' : `p. ${measured}`;
    return `  ${key} : ${was} -> ${now}`;
  });
  return [`A CONTROLER : numéros de page des sommaires différents du document composé (${differences.length}) :`, ...lines].join('\n');
}

/**
 * Confronte les pages relevées par la composition à `pages` de pages-gabarit.json. Avec `--maj-pages`, réécrit cette table :
 * les sommaires (ICML, écrits avant la composition) ne la reprennent qu'à la composition suivante.
 */
function reportMeasuredPages(options, paths, config) {
  if (!fs.existsSync(paths.measuredPages)) return;
  const entry = findGuide(config, options.guide);
  const measured = JSON.parse(fs.readFileSync(paths.measuredPages, 'utf8'));
  const pagesFile = JSON.parse(fs.readFileSync(config.pagesFile, 'utf8'));
  const section = pagesFile[entry.dir];
  const differences = diffPages(section && section.pages, measured);
  process.stdout.write(`${formatPagesReport(differences)}\n`);
  if (differences.length === 0) return;
  if (options.majPages && section) {
    section.pages = measured;
    fs.writeFileSync(config.pagesFile, `${JSON.stringify(pagesFile, null, 2)}\n`);
    process.stdout.write(`pages-gabarit.json mis à jour (${entry.dir}) : relancer pdf compose --remplacer pour que les sommaires reprennent ces numéros.\n`);
  } else {
    process.stdout.write('Pour les reprendre : pdf compose --remplacer --maj-pages, puis relancer pdf compose --remplacer (les sommaires sont écrits avant la composition).\n');
  }
}

/** Horodatage de nom de fichier : 20261120-143005. */
function stamp(date) {
  const two = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}${two(date.getMonth() + 1)}${two(date.getDate())}-${two(date.getHours())}${two(date.getMinutes())}${two(date.getSeconds())}`;
}

/** Copie le .indd en `<nom>.avant-<horodatage>.indd` à côté de l'original, sans jamais écraser. Rend le chemin de la copie. */
function backupDocument(document, now = new Date()) {
  if (!fs.existsSync(document)) throw new ComposeError(`Document introuvable : ${document}. Aucun fichier écrit.`);
  const parsed = path.parse(document);
  const copy = path.join(parsed.dir, `${parsed.name}.avant-${stamp(now)}${parsed.ext}`);
  fs.copyFileSync(document, copy, fs.constants.COPYFILE_EXCL);
  return copy;
}

/** Fichiers .icml d'un dossier et de ses sous-dossiers (liste vide si le dossier manque). */
function icmlFilesIn(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return icmlFilesIn(full);
    return entry.name.toLowerCase().endsWith('.icml') ? [full] : [];
  });
}

/** Empreinte (SHA-256 tronquée) d'un fichier, ou null s'il manque. */
function fingerprint(file) {
  if (!fs.existsSync(file)) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 12);
}

/** Relevé avant/après : empreintes des ICML du guide et communs, du modèle IDML, du .indd et du PDF. */
function snapshotOutputs(paths) {
  const icml = [...icmlFilesIn(paths.icmlDir), ...icmlFilesIn(paths.commonDir)];
  const files = { icml, idml: paths.template ? [paths.template] : [], indd: [paths.document], pdf: [paths.pdf] };
  const snapshot = {};
  Object.keys(files).forEach((kind) => {
    snapshot[kind] = Object.fromEntries(files[kind].map(file => [file, fingerprint(file)]));
  });
  return snapshot;
}

/** Compare deux relevés : par famille, nombre de fichiers modifiés, créés (absents avant) et total présent après. */
function diffSnapshots(before, after) {
  const result = {};
  Object.keys(after).forEach((kind) => {
    const now = after[kind];
    const was = before[kind] || {};
    const files = Object.keys(now).filter(file => now[file] !== null);
    result[kind] = {
      total: files.length,
      created: files.filter(file => !was[file]).length,
      changed: files.filter(file => was[file] && was[file] !== now[file]).length
    };
  });
  return result;
}

/** Texte du constat « qu'est-ce qui a vraiment changé » : à lire avant d'annoncer qu'un correctif est livré. */
function formatChangeReport(diff) {
  const labels = { icml: 'ICML', idml: 'IDML', indd: '.indd', pdf: 'PDF' };
  const lines = Object.keys(labels).filter(kind => diff[kind]).map((kind) => {
    const { total, created, changed } = diff[kind];
    const touched = created + changed;
    const detail = created ? ` (dont ${created} créé${created > 1 ? 's' : ''})` : '';
    return `  ${labels[kind]} : ${touched} modifié${touched > 1 ? 's' : ''}${detail} sur ${total}`;
  });
  const out = ['Constat des fichiers (empreintes avant/après) :', ...lines];
  const icml = diff.icml;
  if (icml && icml.total > 0 && icml.created + icml.changed === 0) {
    out.push("  Aucun ICML n'a changé : si un correctif de contenu était attendu, il n'a pas atteint les sources Markdown ; ne pas l'annoncer comme livré.");
  }
  return out.join('\n');
}

function listProcesses() {
  const result = spawnSync('tasklist', ['/FI', 'IMAGENAME eq InDesign.exe'], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout : '';
}

/** Régénère les ICML puis l'IDML du guide, dans le dossier de sortie du projet (non suivi). */
function prepare(options, paths, config) {
  const entry = findGuide(config, options.guide);
  const steps = [
    [path.join(__dirname, 'export-icml.js'), '--config', config.file],
    [path.join(__dirname, 'build-idml-template.js'), '--config', config.file, '--guide', entry.id, '--sortie', path.dirname(paths.template)]
  ];
  steps.forEach((args) => {
    const result = spawnSync(process.execPath, args, { stdio: 'inherit', cwd: config.dir });
    if (result.status !== 0) throw new ComposeError('Préparation échouée : ' + path.basename(args[0]) + '. Aucun fichier InDesign écrit.');
  });
}

function launch(script, paths) {
  const result = spawnSync('pwsh', ['-NoProfile', '-File', LAUNCHER, '-Script', script, '-ArgsJson', JSON.stringify(paths)], { stdio: 'inherit' });
  return result.status === 0 ? 0 : 1;
}

/** Mise à jour du .indd : contrôles et régénération des ICML avant toute copie ou ouverture d'InDesign. */
function runUpdate(options, config) {
  const entry = findGuide(config, options.guide);
  updatePathsFor(options, config);
  const exportArgs = [path.join(__dirname, 'export-icml.js'), '--config', config.file, ...(options.force ? ['--force'] : [])];
  const before = snapshotOutputs(updatePathsFor(options, config));
  const exported = spawnSync(process.execPath, exportArgs, { stdio: 'inherit', cwd: config.dir });
  if (exported.status !== 0) throw new ComposeError("Régénération des ICML échouée ou interrompue : le .indd de " + entry.id + " n'a pas été touché.");
  const paths = updatePathsFor(options, config);
  const copy = backupDocument(paths.document);
  process.stdout.write(`Copie de sauvegarde : ${copy}\n`);
  ensureOutputDirs(paths);
  const status = launch(UPDATE_SCRIPT, paths);
  process.stdout.write(`${formatChangeReport(diffSnapshots(before, snapshotOutputs(paths)))}\n`);
  return status;
}

/** Composition du guide entier : un .indd existant n'est remplacé qu'avec --remplacer, après copie de sauvegarde. */
function runCompose(options, config) {
  const entry = findGuide(config, options.guide);
  const target = composePathsFor(options, config).document;
  if (fs.existsSync(target) && !options.remplacer) {
    throw new ComposeError(`${target} existe déjà : relancer avec --remplacer (copie de sauvegarde faite) ou choisir --sortie. Aucun fichier écrit.`);
  }
  const before = snapshotOutputs(composePathsFor(options, config));
  prepare(options, composePathsFor(options, config), config); // régénère ICML puis IDML ; les chapitres se lisent après
  const paths = composePathsFor(options, config);
  if (paths.chapters.length === 0) throw new ComposeError(`Aucun chapitre (dossier 0N-nom) dans ${paths.icmlDir} pour le guide « ${entry.id} ».`);
  if (fs.existsSync(paths.document)) process.stdout.write(`Copie de sauvegarde : ${backupDocument(paths.document)}\n`);
  fs.mkdirSync(path.dirname(paths.measuredPages), { recursive: true });
  fs.rmSync(paths.measuredPages, { force: true });
  ensureOutputDirs(paths);
  const status = launch(COMPOSE_GUIDE_SCRIPT, paths);
  process.stdout.write(`${formatChangeReport(diffSnapshots(before, snapshotOutputs(paths)))}\n`);
  if (status === 0) reportMeasuredPages(options, paths, config);
  return status;
}

function main(argv,{ processListing = listProcesses } = {}) {
  try {
    const options = parseArgs(argv);
    const config = loadConfig({ configPath: options.configPath });
    findGuide(config, options.guide);
    if (isInDesignRunning(processListing())) {
      throw new ComposeError("InDesign est déjà ouvert : fermer ses documents et l'application, puis relancer. Aucun fichier écrit.");
    }
    if (options.command === 'update') return runUpdate(options, config);
    if (options.command === 'compose') return runCompose(options, config);
    const paths = pathsFor(options, config);
    prepare(options, paths, config);
    return launch(COMPOSE_SCRIPT, paths);
  } catch (error) {
    if (!(error instanceof ComposeError) && !(error instanceof ConfigError)) throw error;
    process.stderr.write(`${error.message}\n`);
    return 1;
  }
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = { ComposeError, releasePdfPath, parseArgs, isInDesignRunning, pathsFor, updatePathsFor, composePathsFor, chapterNamesIn, backupDocument, diffPages, formatPagesReport, stamp, snapshotOutputs, diffSnapshots, formatChangeReport, main };
