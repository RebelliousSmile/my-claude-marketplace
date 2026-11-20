/**
 * Chargeur de maquette : une maquette est un dossier de DONNÉES (`maquette.json` et ses ressources),
 * jamais du code. Le moteur ne connaît que le format 1 et refuse le reste ; le résultat est figé.
 */

const fs = require('fs');
const path = require('path');

const MAQUETTE_FILE = 'maquette.json';
const SUPPORTED_FORMAT = 1;
/** Maquette embarquée, défaut transitoire jusqu'au départ de Scriptami (phase 4). */
const DEFAULT_MAQUETTE_DIR = path.join(__dirname, 'maquettes', 'scriptami');

/** Erreur attendue : son message nomme le champ et le fichier. */
class MaquetteError extends Error {}

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = value => typeof value === 'string' && value.trim() !== '';
const isNumber = value => typeof value === 'number' && Number.isFinite(value);

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

function block(raw, field, file) {
  if (!isObject(raw[field])) throw new MaquetteError(`Maquette : « ${field} » manquant ou invalide dans ${file}.`);
  return raw[field];
}

function requireKeys(object, keys, check, label, file) {
  for (const key of keys) {
    if (!check(object[key])) throw new MaquetteError(`Maquette : « ${label}.${key} » manquant ou invalide dans ${file}.`);
  }
}

function validate(raw, file) {
  if (!isObject(raw)) throw new MaquetteError(`Maquette : ${file} doit contenir un objet.`);
  if (raw.format !== SUPPORTED_FORMAT) {
    throw new MaquetteError(`Maquette : format ${JSON.stringify(raw.format)} inconnu dans ${file} (le moteur lit le format ${SUPPORTED_FORMAT}).`);
  }
  if (!isText(raw.nom)) throw new MaquetteError(`Maquette : « nom » manquant dans ${file}.`);
  if (!isText(raw.langue)) throw new MaquetteError(`Maquette : « langue » manquant dans ${file}.`);

  const page = block(raw, 'page', file);
  requireKeys(page, ['largeurMm', 'hauteurMm', 'fondPerduMm'], isNumber, 'page', file);
  requireKeys(block(page, 'marges', file), ['hautMm', 'basMm', 'interieureMm', 'exterieureMm'], isNumber, 'page.marges', file);
  requireKeys(block(page, 'colonnes', file), ['texteMm', 'gouttiereMm', 'marginaleMm'], isNumber, 'page.colonnes', file);

  const entetePied = block(raw, 'entetePied', file);
  requireKeys(entetePied, ['enteteHaut', 'enteteHauteur', 'filetY', 'pointilleTrait', 'pointilleBlanc', 'filetEpaisseur',
    'piedHauteur', 'piedLargeur', 'coinMm', 'folioLargeur', 'bandePiedMm'], isNumber, 'entetePied', file);
  requireKeys(entetePied, ['piedTexte'], isText, 'entetePied', file);

  const couleurs = block(raw, 'couleurs', file);
  for (const [name, rgb] of Object.entries(couleurs)) {
    if (!Array.isArray(rgb) || rgb.length !== 3 || !rgb.every(channel => Number.isInteger(channel) && channel >= 0 && channel <= 255)) {
      throw new MaquetteError(`Maquette : « couleurs.${name} » doit être [r, g, b] (0 à 255) dans ${file}.`);
    }
  }

  const axes = block(raw, 'axes', file);
  const noms = block(axes, 'noms', file);
  const tons = block(axes, 'tons', file);
  if (Object.keys(noms).length === 0) throw new MaquetteError(`Maquette : « axes.noms » est vide dans ${file}.`);
  if (!isText(axes.defaut) || !noms[axes.defaut]) {
    throw new MaquetteError(`Maquette : « axes.defaut » doit nommer un axe de « axes.noms » dans ${file}.`);
  }
  for (const [axis, label] of Object.entries(noms)) {
    for (const tone of Object.values(tons)) {
      if (!couleurs[`${label} ${tone}`]) {
        throw new MaquetteError(`Maquette : la couleur « ${label} ${tone} » (axe ${axis}) manque dans « couleurs » de ${file}.`);
      }
    }
  }

  requireKeys(block(raw, 'polices', file), ['titre', 'texte', 'code', 'puce'], isText, 'polices', file);
}

/** Lit la maquette du dossier `dir` ; lève une MaquetteError sans rien écrire. */
function loadMaquette(dir = DEFAULT_MAQUETTE_DIR) {
  const folder = path.resolve(dir);
  const file = path.join(folder, MAQUETTE_FILE);
  if (!fs.existsSync(file)) throw new MaquetteError(`Maquette : fichier introuvable : ${file}`);
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new MaquetteError(`Maquette : ${file} illisible (${error.message}).`);
  }
  validate(raw, file);
  return deepFreeze({ ...raw, dir: folder, file });
}

module.exports = { MaquetteError, loadMaquette, DEFAULT_MAQUETTE_DIR, MAQUETTE_FILE, SUPPORTED_FORMAT };
