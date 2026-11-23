/**
 * Configuration d'un projet client du moteur de documentation : où sont les sources Markdown,
 * où écrire, quels guides existent et leur couleur d'accent. Le moteur ne contient aucune valeur de
 * client : tout ce qui varie d'un projet à l'autre est lu ici.
 *
 * Fichier `documentation.config.json` (chemins relatifs au dossier du fichier) :
 *
 *   {
 *     "sourceDir": ".",                      dossier qui contient un sous-dossier par guide
 *     "outputDir": "../../output",           facultatif, défaut : « output » à côté du dossier du fichier
 *     "pagesFile": "pages-gabarit.json",     sous-titres, pages de fin, pied et mentions communs
 *     "versionFile": "../../package.json",   facultatif, défaut : package.json le plus proche en remontant
 *     "pdfPreset": "Qualité optimale",       facultatif, préréglage d'export PDF d'InDesign (défaut : le premier « qualité »)
 *     "guides": [
 *       { "id": "utilisateur", "dir": "guide-utilisateur", "title": "Guide de l’utilisateur", "verb": "Maîtriser",
 *         "type": "Documentation utilisateur", "accent": "orange", "mergedFile": "…", "document": "guide.indd" }
 *     ]
 *   }
 *
 * `mergedFile` (facultatif) nomme la version fusionnée du guide (`build-merged-guides.js`).
 * `document` (facultatif) désigne le .indd du guide, relatif au fichier de configuration : la commande de
 * mise à jour (`compose-guide.js update`) le requiert (p. ex. `../../output/indd/guide.indd`) ; le PDF est écrit sous
 * `<outputDir>/pdf/<nom du .indd>-v<version de versionFile>.pdf` (sans version lisible : `<nom>.pdf`).
 * Un accent est l'un des trois tons de la charte ; plusieurs guides peuvent partager le même.
 *
 * `captures` (facultatif) déclare la commande du projet qui régénère les captures d'écran des guides
 * (commande `captures run`) : `{ "command": "pnpm run guides:captures", "cwd": "../..", "env": { "PORT": "3033" } }`.
 * `command` est lancée par le shell depuis `cwd` (relatif au fichier de configuration, défaut : son dossier) ;
 * `env` s'ajoute à l'environnement courant (valeurs textuelles). Le moteur ne sait rien de l'outil de capture.
 *
 * Recherche : `--config <chemin>` sinon `documentation.config.json` en remontant depuis le dossier courant.
 */

const fs = require('fs');
const path = require('path');
const { MaquetteError, loadMaquette } = require('./maquette');

const CONFIG_NAME = 'documentation.config.json';
const DEFAULT_TYPE = 'Documentation utilisateur';
const DEFAULT_OUTPUT_DIR = 'output';
const ID_PATTERN = /^[a-z0-9-]+$/;
const DIR_PATTERN = /^[A-Za-z0-9._-]+$/;

/** Erreur attendue : son message nomme le champ en cause. */
class ConfigError extends Error {}

const isText = value => typeof value === 'string' && value.trim() !== '';

function requireText(value, field) {
  if (!isText(value)) throw new ConfigError(`Configuration : « ${field} » doit être un texte non vide.`);
  return value;
}

function checkGuide(guide, index, seen, axes) {
  const where = `guides[${index}]`;
  if (!guide || typeof guide !== 'object' || Array.isArray(guide)) {
    throw new ConfigError(`Configuration : « ${where} » doit être un objet.`);
  }
  const id = requireText(guide.id, `${where}.id`);
  if (!ID_PATTERN.test(id)) {
    throw new ConfigError(`Configuration : « ${where}.id » : minuscules, chiffres et tirets seulement (reçu : ${id}).`);
  }
  if (seen.ids.has(id)) throw new ConfigError(`Configuration : « ${where}.id » en double : ${id}.`);
  const dir = requireText(guide.dir, `${where}.dir`);
  if (!DIR_PATTERN.test(dir) || dir === '.' || dir === '..') {
    throw new ConfigError(`Configuration : « ${where}.dir » doit être un nom de dossier, sans chemin (reçu : ${dir}).`);
  }
  if (seen.dirs.has(dir)) throw new ConfigError(`Configuration : « ${where}.dir » en double : ${dir}.`);
  seen.ids.add(id);
  seen.dirs.add(dir);
  const accent = requireText(guide.accent, `${where}.accent`);
  if (!axes.includes(accent)) {
    throw new ConfigError(`Configuration : « ${where}.accent » (guide ${id}) hors de la maquette : ${accent}. Valeurs acceptées : ${axes.join(', ')}.`);
  }
  if (guide.type !== undefined) requireText(guide.type, `${where}.type`);
  if (guide.mergedFile !== undefined) requireText(guide.mergedFile, `${where}.mergedFile`);
  if (guide.document !== undefined) {
    const document = requireText(guide.document, `${where}.document`);
    if (path.extname(document).toLowerCase() !== '.indd') {
      throw new ConfigError(`Configuration : « ${where}.document » doit être un fichier .indd (reçu : ${document}).`);
    }
  }
  return {
    id,
    dir,
    title: requireText(guide.title, `${where}.title`),
    verb: requireText(guide.verb, `${where}.verb`),
    type: guide.type ?? DEFAULT_TYPE,
    accent,
    mergedFile: guide.mergedFile ?? null,
    document: guide.document ?? null
  };
}

/** Plus proche `package.json` en remontant depuis `dir`, ou null. */
function findUp(dir, name) {
  for (let current = path.resolve(dir); ; current = path.dirname(current)) {
    const candidate = path.join(current, name);
    if (fs.existsSync(candidate)) return candidate;
    if (path.dirname(current) === current) return null;
  }
}

/** Maquette désignée par la configuration (chemin relatif à son dossier) : le champ est obligatoire. */
function loadMaquetteField(value, dir) {
  try {
    return loadMaquette(path.resolve(dir, requireText(value, 'maquette')));
  } catch (error) {
    if (error instanceof MaquetteError) throw new ConfigError(error.message);
    throw error;
  }
}

/** Champ `captures` : commande du projet, dossier de lancement résolu et environnement ; null si absent. */
function checkCaptures(value, dir) {
  if (value === undefined) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ConfigError('Configuration : « captures » doit être un objet.');
  }
  const command = requireText(value.command, 'captures.command');
  const cwd = path.resolve(dir, value.cwd === undefined ? '.' : requireText(value.cwd, 'captures.cwd'));
  const env = value.env === undefined ? {} : value.env;
  if (!env || typeof env !== 'object' || Array.isArray(env)
    || Object.values(env).some(entry => typeof entry !== 'string')) {
    throw new ConfigError('Configuration : « captures.env » doit associer des noms à des valeurs textuelles.');
  }
  return { command, cwd, env: { ...env } };
}

/** Valide un objet de configuration lu depuis `file` ; rend la configuration résolue (chemins absolus). */
function resolveConfig(raw, file) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ConfigError('Configuration : le fichier doit contenir un objet.');
  }
  const dir = path.dirname(path.resolve(file));
  const sourceDir = path.resolve(dir, requireText(raw.sourceDir, 'sourceDir'));
  const outputDir = path.resolve(dir, raw.outputDir === undefined ? DEFAULT_OUTPUT_DIR : requireText(raw.outputDir, 'outputDir'));
  const pagesFile = path.resolve(dir, requireText(raw.pagesFile, 'pagesFile'));
  let versionFile;
  if (raw.versionFile === undefined) {
    versionFile = findUp(dir, 'package.json');
  } else {
    versionFile = path.resolve(dir, requireText(raw.versionFile, 'versionFile'));
  }
  if (!Array.isArray(raw.guides) || raw.guides.length === 0) {
    throw new ConfigError('Configuration : « guides » doit lister au moins un guide.');
  }
  const seen = { ids: new Set(), dirs: new Set() };
  const maquette = loadMaquetteField(raw.maquette, dir);
  const axes = Object.keys(maquette.axes.noms);
  const guides = raw.guides.map((guide, index) => checkGuide(guide, index, seen, axes))
    .map(guide => ({ ...guide, document: guide.document === null ? null : path.resolve(dir, guide.document) }));
  const pdfPreset = raw.pdfPreset === undefined ? null : requireText(raw.pdfPreset, 'pdfPreset');
  const captures = checkCaptures(raw.captures, dir);
  return { file: path.resolve(file), dir, sourceDir, outputDir, pagesFile, versionFile, pdfPreset, maquette, guides, captures };
}

/** Lit et valide le fichier de configuration `file`. */
function readConfig(file) {
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new ConfigError(`Configuration : ${file} illisible (${error.message}).`);
  }
  return resolveConfig(raw, file);
}

/** Chemin explicite, sinon `documentation.config.json` en remontant depuis `cwd`. */
function locateConfig({ configPath, cwd = process.cwd() } = {}) {
  if (configPath) {
    const file = path.resolve(cwd, configPath);
    if (!fs.existsSync(file)) throw new ConfigError(`Configuration : fichier introuvable : ${file}`);
    return file;
  }
  const found = findUp(cwd, CONFIG_NAME);
  if (!found) {
    throw new ConfigError(`Configuration : aucun ${CONFIG_NAME} trouvé depuis ${cwd}. Passer --config <chemin>.`);
  }
  return found;
}

function loadConfig(options = {}) {
  return readConfig(locateConfig(options));
}

/**
 * Sépare `--config <chemin>` du reste des arguments (le `--` transmis par pnpm est conservé tel quel).
 * Rend `{ configPath, rest }`.
 */
function extractConfigArg(argv) {
  const rest = [];
  let configPath = null;
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--config') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new ConfigError('--config attend le chemin du fichier de configuration.');
      configPath = value;
      index += 1;
    } else {
      rest.push(argv[index]);
    }
  }
  return { configPath, rest };
}

/** Guide de la configuration désigné par son identifiant ou son dossier ; lève une ConfigError sinon. */
function findGuide(config, name) {
  const guide = config.guides.find(candidate => candidate.id === name || candidate.dir === name);
  if (!guide) {
    const known = config.guides.map(candidate => candidate.id).join(', ');
    throw new ConfigError(`Guide inconnu : ${name}. Valeurs acceptées : ${known}.`);
  }
  return guide;
}

/** Version du produit lue dans `versionFile` ; lève une ConfigError si le fichier manque. */
function readVersion(config) {
  if (!config.versionFile || !fs.existsSync(config.versionFile)) {
    throw new ConfigError('Configuration : aucun package.json trouvé pour la version ; renseigner « versionFile ».');
  }
  return JSON.parse(fs.readFileSync(config.versionFile, 'utf8')).version;
}

module.exports = {
  ConfigError,
  CONFIG_NAME,
  DEFAULT_TYPE,
  resolveConfig,
  readConfig,
  locateConfig,
  loadConfig,
  extractConfigArg,
  findGuide,
  readVersion
};
