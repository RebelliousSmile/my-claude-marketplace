#!/usr/bin/env node
/**
 * Pilote InDesign pour un guide (plan `aidd_docs/tasks/2026_11/2026_11_19_moteur-documentation-pdf`).
 *
 *   node scripts/guides/compose-guide.js [build] --guide <id> --chapitre 01-vue-ensemble [--config <chemin>]
 *   node scripts/guides/compose-guide.js update --guide <id> [--force] [--config <chemin>]
 *
 * `build` (commande par défaut) compose un chapitre d'essai et écrit sous `<outputDir>/pdf-essai/` (non suivi).
 * `update` met à jour le .indd du guide (champ `document` de la configuration) : régénération des ICML
 * (arrêt sur un ICML corrigé à la main, sauf `--force`), copie de sauvegarde `<nom>.avant-<horodatage>.indd`,
 * rafraîchissement des liens, pages ajoutées ou retirées, PDF écrit à côté du .indd.
 * Le guide est désigné par son identifiant (ou son dossier) dans `documentation.config.json`.
 * Refuse si InDesign est déjà ouvert : l'application ne se pilote que sur un poste où l'utilisateur
 * l'a fermée et a donné son accord.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { ConfigError, loadConfig, extractConfigArg, findGuide } = require('./guide-config');
const { outputPathFor } = require('./build-idml-template');

const LAUNCHER = path.join(__dirname, 'indesign', 'run-indesign.ps1');
const COMPOSE_SCRIPT = path.join(__dirname, 'indesign', 'compose-chapter.jsx');
const UPDATE_SCRIPT = path.join(__dirname, 'indesign', 'update-document.jsx');
const COMMANDS = ['build', 'update'];
const NAME_PATTERN = /^[a-z0-9-]+$/;
const TRIAL_DIR = 'pdf-essai';

class ComposeError extends Error {}

function parseArgs(argv) {
  const { configPath, rest } = extractConfigArg(argv);
  const options = { command: 'build', guide: null, chapitre: null, configPath };
  for (let index = 0; index < rest.length; index += 1) {
    const flag = rest[index];
    if (flag === '--') continue;
    if (COMMANDS.includes(flag)) {
      options.command = flag;
    } else if (flag === '--force') {
      options.force = true;
    } else if (flag === '--guide' || flag === '--chapitre') {
      const value = rest[index + 1];
      if (!value || value.startsWith('--')) throw new ComposeError(`${flag} attend une valeur.`);
      options[flag.slice(2)] = value;
      index += 1;
    } else {
      throw new ComposeError(`Option inconnue : ${flag}`);
    }
  }
  if (options.command === 'update' ? !options.guide : (!options.guide || !options.chapitre)) {
    throw new ComposeError('Usage : pnpm run guides:pdf [build] --guide <guide> --chapitre <0N-nom> [--config <chemin>]\n'
      + '        pnpm run guides:pdf update --guide <guide> [--force] [--config <chemin>]');
  }
  if (options.force && options.command !== 'update') throw new ComposeError('--force ne vaut que pour la commande update.');
  if (options.command === 'update' && options.chapitre) throw new ComposeError("update traite le guide entier : --chapitre ne s'y applique pas.");
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

/** Chemins de la mise à jour : le .indd du guide, son PDF à côté sous le même nom, le préréglage de la configuration. */
function updatePathsFor({ guide }, config) {
  const entry = findGuide(config, guide);
  if (!entry.document) {
    throw new ComposeError(`Le guide « ${entry.id} » n'a pas de champ « document » (chemin du .indd) dans ${path.basename(config.file)}.`);
  }
  const icmlRoot = path.join(config.outputDir, 'icml');
  const commonDir = path.join(icmlRoot, 'common');
  return {
    document: entry.document,
    pdf: entry.document.replace(/\.indd$/i, '.pdf'),
    preset: config.pdfPreset,
    icmlDir: path.join(icmlRoot, entry.dir),
    commonDir,
    commonNames: commonNamesIn(commonDir)
  };
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
  const exported = spawnSync(process.execPath, exportArgs, { stdio: 'inherit', cwd: config.dir });
  if (exported.status !== 0) throw new ComposeError("Régénération des ICML échouée ou interrompue : le .indd de " + entry.id + " n'a pas été touché.");
  const paths = updatePathsFor(options, config);
  const copy = backupDocument(paths.document);
  process.stdout.write(`Copie de sauvegarde : ${copy}\n`);
  return launch(UPDATE_SCRIPT, paths);
}

function main(argv, { processListing = listProcesses } = {}) {
  try {
    const options = parseArgs(argv);
    const config = loadConfig({ configPath: options.configPath });
    findGuide(config, options.guide);
    if (isInDesignRunning(processListing())) {
      throw new ComposeError("InDesign est déjà ouvert : fermer ses documents et l'application, puis relancer. Aucun fichier écrit.");
    }
    if (options.command === 'update') return runUpdate(options, config);
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

module.exports = { ComposeError, parseArgs, isInDesignRunning, pathsFor, updatePathsFor, backupDocument, stamp, main };
