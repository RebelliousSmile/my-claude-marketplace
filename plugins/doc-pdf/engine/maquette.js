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

  const polices = block(raw, 'polices', file);
  requireKeys(polices, ['titre', 'texte', 'code', 'puce'], isText, 'polices', file);

  validateStyles(block(raw, 'styles', file), file);
  validateFormats(block(raw, 'formats', file), block(raw, 'charteSeule', file), file);
  validateTextes(block(raw, 'textes', file), file);
  validateNuances(block(raw, 'nuances', file), couleurs, tons, file);
  validateGabarits(raw.gabarits, file);
  validateCadres(block(raw, 'cadres', file), file);
  validateVariables(raw.variables, styleNames(raw.styles), file);
  validateComposition(block(raw, 'composition', file), file);
  if (raw.export !== undefined) validateExport(raw.export, file);
}

const COMPOSITION_SETTINGS = ['echelleTexteMin', 'pasReduction', 'reserveBas', 'ecartTitre', 'hauteurCapitales',
  'decalageCadreNumero', 'toleranceGeometrie', 'pasRemonteeMarge', 'lignesMinSousIntertitre'];

/** Composition InDesign : gabarit du corps, cadres d'ouverture et d'en-tête, cadres de marge, réglages numériques. */
function validateComposition(composition, file) {
  requireKeys(composition, ['gabaritCorps'], isText, 'composition', file);
  requireKeys(block(composition, 'reglages', file), COMPOSITION_SETTINGS, isNumber, 'composition.reglages', file);
  for (const list of ['ouverture', 'entetes']) {
    const entries = composition[list];
    if (!Array.isArray(entries) || entries.length === 0) {
      throw new MaquetteError(`Maquette : « composition.${list} » manquant ou invalide dans ${file}.`);
    }
    entries.forEach((entry, index) => {
      const label = `composition.${list}[${index}]`;
      if (!isObject(entry)) throw new MaquetteError(`Maquette : « ${label} » doit être un objet dans ${file}.`);
      requireKeys(entry, ['cadre', 'fichier'], isText, label, file);
      if (entry.facultatif !== undefined && typeof entry.facultatif !== 'boolean') {
        throw new MaquetteError(`Maquette : « ${label}.facultatif » doit être un booléen dans ${file}.`);
      }
    });
  }
  if (!Array.isArray(composition.satellites) || !composition.satellites.every(isText)) {
    throw new MaquetteError(`Maquette : « composition.satellites » doit être une liste de noms de cadres dans ${file}.`);
  }
}

/** Export PDF : préréglage InDesign facultatif, en second après celui du projet. */
function validateExport(exportBlock, file) {
  if (!isObject(exportBlock)) throw new MaquetteError(`Maquette : « export » doit être un objet dans ${file}.`);
  if (exportBlock.preset !== undefined && !isText(exportBlock.preset)) {
    throw new MaquetteError(`Maquette : « export.preset » doit être un texte dans ${file}.`);
  }
}

const MASTER_ROLES = ['courante', 'chapitre', 'couverture', 'fin'];

/** Gabarits : une entrée par rôle (courante, chapitre, couverture, fin), chacune { nom, prefixe, base, pages, role }. */
function validateGabarits(gabarits, file) {
  if (!Array.isArray(gabarits) || gabarits.length === 0) {
    throw new MaquetteError(`Maquette : « gabarits » manquant ou invalide dans ${file}.`);
  }
  gabarits.forEach((entry, index) => {
    const label = `gabarits[${index}]`;
    if (!isObject(entry)) throw new MaquetteError(`Maquette : « ${label} » doit être un objet dans ${file}.`);
    requireKeys(entry, ['nom', 'prefixe', 'base'], isText, label, file);
    requireKeys(entry, ['pages'], value => value === 1 || value === 2, label, file);
    if (!MASTER_ROLES.includes(entry.role)) {
      throw new MaquetteError(`Maquette : « ${label}.role » doit valoir ${MASTER_ROLES.join(', ')} dans ${file}.`);
    }
  });
  for (const role of MASTER_ROLES) {
    const count = gabarits.filter(entry => entry.role === role).length;
    if (count !== 1) throw new MaquetteError(`Maquette : « gabarits » doit porter exactement un gabarit de rôle « ${role} » (${count} trouvé) dans ${file}.`);
  }
  const names = gabarits.map(entry => entry.nom);
  if (new Set(names).size !== names.length) throw new MaquetteError(`Maquette : « gabarits » porte deux gabarits du même nom dans ${file}.`);
}

/** Calque et noms des cadres de page d'exemple. */
function validateCadres(cadres, file) {
  requireKeys(block(cadres, 'calque', file), ['id', 'nom'], isText, 'cadres.calque', file);
  requireKeys(block(cadres, 'pages', file), ['couverture', 'sommaire', 'textePrefixe', 'fin'], isText, 'cadres.pages', file);
}

const styleNames = styles => new Set(Object.values(styles).flatMap(list => list.map(entry => entry.name)));

/** Variables de texte : « texte » (contenu fixe) ou « style » (reprend le premier paragraphe du style). */
function validateVariables(variables, styles, file) {
  if (!Array.isArray(variables) || variables.length === 0) {
    throw new MaquetteError(`Maquette : « variables » manquant ou invalide dans ${file}.`);
  }
  variables.forEach((entry, index) => {
    const label = `variables[${index}]`;
    if (!isObject(entry)) throw new MaquetteError(`Maquette : « ${label} » doit être un objet dans ${file}.`);
    requireKeys(entry, ['nom'], isText, label, file);
    if (entry.type === 'texte') {
      requireKeys(entry, ['contenu'], isText, label, file);
    } else if (entry.type === 'style') {
      requireKeys(entry, ['style'], isText, label, file);
      if (!styles.has(entry.style)) throw new MaquetteError(`Maquette : « ${label}.style » nomme « ${entry.style} », absent de « styles » dans ${file}.`);
    } else {
      throw new MaquetteError(`Maquette : « ${label}.type » doit valoir texte ou style dans ${file}.`);
    }
  });
}

const STYLE_FAMILIES = ['paragraph', 'character', 'table', 'cell', 'object'];

/** Table des styles ICML : cinq familles, chaque entrée { name, usage, pandoc[], attributes{} }. */
function validateStyles(styles, file) {
  for (const family of STYLE_FAMILIES) {
    const entries = styles[family];
    if (!Array.isArray(entries) || entries.length === 0) {
      throw new MaquetteError(`Maquette : « styles.${family} » manquant ou vide dans ${file}.`);
    }
    entries.forEach((entry, index) => {
      const label = `styles.${family}[${index}]`;
      if (!isObject(entry)) throw new MaquetteError(`Maquette : « ${label} » doit être un objet dans ${file}.`);
      requireKeys(entry, ['name', 'usage'], isText, label, file);
      if (!Array.isArray(entry.pandoc) || !entry.pandoc.every(isText)) {
        throw new MaquetteError(`Maquette : « ${label}.pandoc » doit être une liste de textes dans ${file}.`);
      }
      if (!isObject(entry.attributes)) {
        throw new MaquetteError(`Maquette : « ${label}.attributes » manquant ou invalide dans ${file}.`);
      }
    });
  }
}

const FONT_ROLES = ['@titre', '@texte', '@code', '@puce'];
const isTextList = value => Array.isArray(value) && value.length > 0 && value.every(isText);

/** Mise en forme de la charte par famille et par style ; `charteSeule` : styles déclarés sans entrée dans la table des styles. */
function validateFormats(formats, charteSeule, file) {
  for (const family of STYLE_FAMILIES) {
    if (!isObject(formats[family])) throw new MaquetteError(`Maquette : « formats.${family} » manquant ou invalide dans ${file}.`);
    if (!Array.isArray(charteSeule[family]) || !charteSeule[family].every(isText)) {
      throw new MaquetteError(`Maquette : « charteSeule.${family} » doit être une liste de noms de style dans ${file}.`);
    }
    for (const [name, format] of Object.entries(formats[family])) {
      if (!isObject(format)) throw new MaquetteError(`Maquette : « formats.${family}.${name} » doit être un objet dans ${file}.`);
      if (format.font !== undefined && !isText(format.font)) {
        throw new MaquetteError(`Maquette : « formats.${family}.${name}.font » doit être ${FONT_ROLES.join(', ')} ou un nom de police dans ${file}.`);
      }
    }
  }
}

const NUANCE_ROLES = ['sombre', 'texte', 'papier', 'papierPage', 'orange', 'turquoise', 'vert', 'axeVif', 'axeFond', 'axeTexte'];

/** Nuances nommées que les gabarits emploient ; chacune est une couleur du nuancier, un ton d'axe ou le papier d'InDesign. */
function validateNuances(nuances, couleurs, tons, file) {
  requireKeys(nuances, NUANCE_ROLES, isText, 'nuances', file);
  const known = name => name === nuances.papier || couleurs[name] !== undefined || Object.prototype.hasOwnProperty.call(tons, name);
  for (const role of NUANCE_ROLES) {
    if (!known(nuances[role])) {
      throw new MaquetteError(`Maquette : « nuances.${role} » nomme « ${nuances[role]} », absente de « couleurs » et des tons d'axe dans ${file}.`);
    }
  }
  if (!Array.isArray(nuances.flanc) || nuances.flanc.length === 0) {
    throw new MaquetteError(`Maquette : « nuances.flanc » doit être une liste de [nuance, teinte] dans ${file}.`);
  }
  nuances.flanc.forEach(([name, tint], index) => {
    if (!known(name) || !Number.isFinite(tint) || tint < 0 || tint > 100) {
      throw new MaquetteError(`Maquette : « nuances.flanc[${index}] » doit être [nuance connue, teinte 0 à 100] dans ${file}.`);
    }
  });
}

/** Textes fixes de la maquette : libellés, valeurs par défaut, marque et pages d'exemple. */
function validateTextes(textes, file) {
  requireKeys(textes, ['sousTitreDefaut', 'sommaire', 'pageSommaire', 'pageSommairePrefixe', 'verbeDefaut', 'libelleGuideDefaut',
    'signature', 'noteRenvoi'], isText, 'textes', file);
  if (!isTextList(textes.mentionsDefaut)) {
    throw new MaquetteError(`Maquette : « textes.mentionsDefaut » doit être une liste de textes dans ${file}.`);
  }
  const contact = block(textes, 'contactDefaut', file);
  requireKeys(contact, ['titre', 'accroche'], isText, 'textes.contactDefaut', file);
  if (!Array.isArray(contact.cartes) || contact.cartes.length === 0) {
    throw new MaquetteError(`Maquette : « textes.contactDefaut.cartes » manquant ou vide dans ${file}.`);
  }
  contact.cartes.forEach((card, index) => {
    if (!isObject(card)) throw new MaquetteError(`Maquette : « textes.contactDefaut.cartes[${index}] » doit être un objet dans ${file}.`);
    requireKeys(card, ['label', 'valeur', 'note'], isText, `textes.contactDefaut.cartes[${index}]`, file);
  });
  if (!Array.isArray(textes.marque) || textes.marque.length === 0) {
    throw new MaquetteError(`Maquette : « textes.marque » manquant ou vide dans ${file}.`);
  }
  textes.marque.forEach((line, index) => {
    if (!isObject(line)) throw new MaquetteError(`Maquette : « textes.marque[${index}] » doit être un objet dans ${file}.`);
    requireKeys(line, ['mot', 'suite'], isText, `textes.marque[${index}]`, file);
  });
  const chapitre = block(textes, 'chapitre', file);
  requireKeys(chapitre, ['surtitre', 'numeroDefaut', 'titreDefaut', 'chapeau', 'dansCeChapitre'], isText, 'textes.chapitre', file);
  if (!isTextList(chapitre.sections)) {
    throw new MaquetteError(`Maquette : « textes.chapitre.sections » doit être une liste de textes dans ${file}.`);
  }
  requireKeys(block(textes, 'reperes', file), ['couvertureSommaire', 'conseilsTitre', 'conseilsCorps'], isText, 'textes.reperes', file);
  if (!Array.isArray(textes.pagesExemple) || textes.pagesExemple.length === 0) {
    throw new MaquetteError(`Maquette : « textes.pagesExemple » manquant ou vide dans ${file}.`);
  }
  textes.pagesExemple.forEach((page, index) => {
    const label = `textes.pagesExemple[${index}]`;
    if (!isObject(page)) throw new MaquetteError(`Maquette : « ${label} » doit être un objet dans ${file}.`);
    requireKeys(page, ['section', 'rubrique'], isText, label, file);
    if (page.renvoi !== undefined && !isText(page.renvoi)) throw new MaquetteError(`Maquette : « ${label}.renvoi » doit être un texte dans ${file}.`);
    if (!Array.isArray(page.blocs) || page.blocs.length === 0) throw new MaquetteError(`Maquette : « ${label}.blocs » manquant ou vide dans ${file}.`);
    page.blocs.forEach((bloc, position) => {
      const blocLabel = `${label}.blocs[${position}]`;
      if (!isObject(bloc)) throw new MaquetteError(`Maquette : « ${blocLabel} » doit être un objet dans ${file}.`);
      requireKeys(bloc, ['style', 'texte'], isText, blocLabel, file);
      if (bloc.libelle !== undefined && !isText(bloc.libelle)) throw new MaquetteError(`Maquette : « ${blocLabel}.libelle » doit être un texte dans ${file}.`);
    });
  });
}

/** Chemin d'une ressource de la maquette : relatif au dossier, jamais en dehors. */
function resourcePath(relative, folder, label) {
  if (!isText(relative)) throw new MaquetteError(`Maquette : « ${label} » doit être un chemin relatif dans ${path.join(folder, MAQUETTE_FILE)}.`);
  const full = path.resolve(folder, relative);
  const outside = path.relative(folder, full);
  if (outside.startsWith('..') || path.isAbsolute(outside)) {
    throw new MaquetteError(`Maquette : « ${label} » sort du dossier de la maquette : ${relative}.`);
  }
  if (!fs.existsSync(full)) throw new MaquetteError(`Maquette : ${label} introuvable, fichier attendu : ${full}.`);
  return full;
}

/** Logo : les attributs « d » des tracés du SVG désigné par « logo ». */
function readLogo(relative, folder) {
  const full = resourcePath(relative, folder, 'logo');
  const paths = [...fs.readFileSync(full, 'utf8').matchAll(/<path\b[^>]*?\sd="([^"]+)"/g)].map(match => match[1]);
  if (paths.length === 0) throw new MaquetteError(`Maquette : aucun tracé <path d="…"> dans le logo ${full}.`);
  return { fichier: full, chemins: paths };
}

/** Picto facultatif : facettes et dégradés du JSON désigné par « picto ». */
function readPicto(relative, folder) {
  const full = resourcePath(relative, folder, 'picto');
  let picto;
  try {
    picto = JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (error) {
    throw new MaquetteError(`Maquette : picto ${full} illisible (${error.message}).`);
  }
  if (!isObject(picto) || !isNumber(picto.opacite) || !Array.isArray(picto.facettes) || picto.facettes.length === 0) {
    throw new MaquetteError(`Maquette : picto ${full} : « opacite » et « facettes » sont requis.`);
  }
  picto.facettes.forEach((facet, index) => {
    if (!isObject(facet) || !isText(facet.nom) || !Array.isArray(facet.points) || !isObject(facet.degrade) || !Array.isArray(facet.degrade.arrets)) {
      throw new MaquetteError(`Maquette : picto ${full} : « facettes[${index}] » doit porter nom, points et degrade.arrets.`);
    }
  });
  return { fichier: full, opacite: picto.opacite, facettes: picto.facettes };
}

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
  return deepFreeze({ ...raw, logo: readLogo(raw.logo, folder), picto: raw.picto === undefined ? null : readPicto(raw.picto, folder), dir: folder, file });
}

module.exports = { MaquetteError, loadMaquette, DEFAULT_MAQUETTE_DIR, MAQUETTE_FILE, SUPPORTED_FORMAT };
