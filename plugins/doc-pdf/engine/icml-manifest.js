/**
 * Empreintes des ICML générés : repérer un fichier corrigé à la main avant qu'une régénération l'écrase.
 *
 * Le manifeste `<dossier icml>/.manifest.json` associe chaque ICML écrit (chemin relatif, séparateur `/`)
 * à l'empreinte SHA-256 de son contenu. Il n'est pas suivi par git (comme `output/icml/`).
 * Sans manifeste (premier export), rien n'est jugé modifié.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const MANIFEST_NAME = '.manifest.json';
const MANIFEST_VERSION = 1;

class ManifestError extends Error {}

/** Empreinte SHA-256 (hexadécimal) d'un contenu : texte écrit en UTF-8 ou octets lus sur disque. */
function fingerprint(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function manifestPathFor(dir) {
  return path.join(dir, MANIFEST_NAME);
}

/** Clé de manifeste d'un fichier : chemin relatif au dossier des ICML, séparateur `/`. */
function keyFor(dir, file) {
  return path.relative(dir, file).split(path.sep).join('/');
}

/** Empreintes enregistrées (`{ <chemin relatif>: <sha256> }`) ; `{}` sans manifeste ; ManifestError si illisible. */
function readManifest(dir) {
  const file = manifestPathFor(dir);
  if (!fs.existsSync(file)) return {};
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new ManifestError(`Manifeste des empreintes illisible (${file}) : ${error.message}. Le supprimer pour repartir sans contrôle.`);
  }
  if (!parsed || typeof parsed.files !== 'object' || parsed.files === null || Array.isArray(parsed.files)) {
    throw new ManifestError(`Manifeste des empreintes invalide (${file}) : la clé « files » doit être un objet. Le supprimer pour repartir sans contrôle.`);
  }
  return parsed.files;
}

/**
 * ICML présents sur disque dont l'empreinte diffère de celle du dernier export (corrigés à la main).
 * Un fichier absent n'est pas « modifié » : la régénération le recrée. Rend des chemins absolus, triés.
 */
function findModified(dir, manifest = readManifest(dir)) {
  return Object.keys(manifest)
    .map(key => path.join(dir, ...key.split('/')))
    .filter(file => fs.existsSync(file))
    .filter(file => fingerprint(fs.readFileSync(file)) !== manifest[keyFor(dir, file)])
    .sort();
}

/** Entrées du manifeste dont le fichier n'est plus produit par l'export (ICML sans source). Chemins absolus, triés. */
function findStale(dir, outputs, manifest = readManifest(dir)) {
  const produced = new Set(outputs.map(output => keyFor(dir, output.file)));
  return Object.keys(manifest)
    .filter(key => !produced.has(key))
    .map(key => path.join(dir, ...key.split('/')))
    .sort();
}

/** Enregistre les empreintes des fichiers écrits (`outputs: [{ file, icml }]`), à la place des précédentes. */
function writeManifest(dir, outputs) {
  const files = {};
  [...outputs]
    .sort((a, b) => keyFor(dir, a.file).localeCompare(keyFor(dir, b.file)))
    .forEach(output => {
      files[keyFor(dir, output.file)] = fingerprint(Buffer.from(output.icml, 'utf8'));
    });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(manifestPathFor(dir), `${JSON.stringify({ version: MANIFEST_VERSION, files }, null, 2)}\n`, 'utf8');
  return files;
}

module.exports = {
  MANIFEST_NAME,
  ManifestError,
  fingerprint,
  manifestPathFor,
  keyFor,
  readManifest,
  findModified,
  findStale,
  writeManifest
};
