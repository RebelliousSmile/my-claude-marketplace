#!/usr/bin/env node
/**
 * Exporte chaque chapitre numéroté (`0N-xxx.md`) des guides d'un projet
 * en ICML aux styles de la charte, à lier dans InDesign.
 *
 *   node <racine du plugin>/engine/cli.js icml                         écrit <outputDir>/icml/<guide>/<chapitre>/corps.icml
 *                                                              (corps du chapitre) et, à côté, les textes
 *                                                              de gabarit du même chapitre
 *   node <racine du plugin>/engine/cli.js icml --largeur-colonne 275   largeur de colonne InDesign (pt) :
 *                                                              plafond des captures, largeur des tableaux
 *   node <racine du plugin>/engine/cli.js icml --force                 écrit même si un ICML a été corrigé à la main
 *                                                              depuis le dernier export (cf. ci-dessous)
 *   node <racine du plugin>/engine/cli.js icml --config <chemin>       configuration du projet (guide-config.js) ;
 *                                                              défaut : documentation.config.json cherché
 *                                                              depuis le dossier courant
 *
 * Le corps du chapitre ne contient que le texte qui coule dans la colonne. Le texte que la mise en
 * page place dans ses propres cadres est rendu à part, un fichier par cadre, dans `<chapitre>/` :
 * `ouverture-surtitre|numero|titre|chapeau|sommaire.icml` (gabarit B-Chapitre), `marge-N.M-<titre>.icml`
 * (numéro et rubrique d'une section, colonne marginale), `renvoi-K-s<M>-<début du texte>.icml` (notes de renvoi, M = rang de la section).
 * Chaque cadre reste ainsi lié à son fichier et se met à jour à chaque export.
 *
 * Chaque guide reçoit aussi un dossier `00-pages/` : `couverture.icml` (titre, version, sommaire de
 * couverture), `sommaire.icml` (page 2 : une ligne par chapitre), `en-tete-titre.icml` (titre courant de
 * la page gauche), `fin-bandeau.icml`, `fin-carte-1` à `3.icml` (bandeau et cartes de contact) et
 * `fin-conseils.icml` (deux colonnes de conseils propres au lecteur du guide, lues dans le fichier
 * `pagesFile` de la configuration) : le texte des pages du modèle IDML, à lier chacun dans son cadre.
 * Le texte identique pour tous les guides n'est écrit qu'une fois, dans `<outputDir>/icml/common/` :
 * `pied.icml` et `pied-gauche.icml` (pieds de page), `en-tete-version.icml` (titre courant de la page gauche),
 * `fin-mentions.icml` (pied anthracite) et `type-document.icml` (pastille de la couverture).
 * Chaque dossier de chapitre reçoit aussi `en-tete-chapitre.icml` et `en-tete-titre-chapitre.icml` (titres courants
 * de la page droite).
 *
 * Chaque export enregistre l'empreinte de ses fichiers dans `<outputDir>/icml/.manifest.json` (non suivi) :
 * un ICML présent dont l'empreinte a changé a été corrigé à la main ; l'export le nomme et s'arrête sans
 * rien écrire, sauf `--force`.
 *
 * Pandoc (https://pandoc.org) doit être installé et dans le PATH. Tous les
 * chapitres sont convertis et vérifiés avant la première écriture : un échec
 * n'écrit aucun fichier. Les ICML restés sans chapitre sont signalés, jamais
 * supprimés (un bloc InDesign peut encore y être lié).
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { NUMBERED_FILE } = require('./build-merged-guides');
const { ConfigError, loadConfig, extractConfigArg, readVersion } = require('./guide-config');
const { transformIcml, buildPageIcml } = require('./icml-transform');
const pages = require('./icml-pages');
const manifest = require('./icml-manifest');

// Sous-dossier de `outputDir` qui reçoit les ICML.
const ICML_DIR = 'icml';
const PANDOC_MAX_BUFFER = 64 * 1024 * 1024;
// Un guide : 00-pages/ (couverture, sommaire, fin) puis un dossier par chapitre (corps + cadres).
const PAGES_DIR = '00-pages';
// Fichiers identiques pour les trois guides : un seul exemplaire, à côté des dossiers de guide.
const COMMON_DIR = 'common';
const COVER_FILE = 'couverture.icml';
const SUMMARY_FILE = 'sommaire.icml';
const FOOTER_FILE = 'pied.icml';
const FOOTER_LEFT_FILE = 'pied-gauche.icml';
const END_FILE = 'fin-conseils.icml';
const END_BANNER_FILE = 'fin-bandeau.icml';
const MENTIONS_FILE = 'fin-mentions.icml';
const TYPE_DOCUMENT_FILE = 'type-document.icml';
const HEADER_TITLE_FILE = 'en-tete-titre.icml';
const HEADER_VERSION_FILE = 'en-tete-version.icml';
// Par chapitre : en-tête de la page droite (numéro, titre).
const CHAPTER_NUMBER_FILE = 'en-tete-chapitre.icml';
const CHAPTER_TITLE_FILE = 'en-tete-titre-chapitre.icml';
const END_CARD_COUNT = 3;
const endCardFile = index => `fin-carte-${index + 1}.icml`;
const BODY_FILE = 'corps.icml';

/** Erreur attendue : son message suffit à l'utilisateur. */
class ExportError extends Error {}

const PANDOC_MISSING = 'Pandoc est introuvable. L\'installer (https://pandoc.org/installing.html) '
  + 'et vérifier que la commande pandoc est dans le PATH, puis relancer la commande icml.';

/** Dossier des ICML d'un projet : `<outputDir>/icml`. */
function icmlDirFor(config) {
  return path.join(config.outputDir, ICML_DIR);
}

/** Chapitres numérotés des guides de la configuration, dans l'ordre des guides puis des numéros. */
function listChapters(config) {
  return config.guides.flatMap(({ dir: guide }) => {
    const dir = path.join(config.sourceDir, guide);
    if (!fs.existsSync(dir)) {
      throw new ExportError(`Dossier de guide introuvable : ${dir}`);
    }
    return fs.readdirSync(dir)
      .filter(name => NUMBERED_FILE.test(name))
      .sort()
      .map(name => ({ guide, name, dir }));
  });
}

/** `<outDir>/<guide>/<chapitre>/corps.icml` */
function outputPathFor(outDir, chapter) {
  return path.join(outDir, chapter.guide, chapter.name.replace(/\.md$/, ''), BODY_FILE);
}

/** `<outDir>/<guide>/00-pages/` : `couverture.icml`, `sommaire.icml`, `en-tete-titre.icml`, `fin-bandeau.icml`, `fin-carte-1` à `3.icml`, `fin-conseils.icml` (propres au guide) */
function pagePathsFor(outDir, guide) {
  const dir = path.join(outDir, guide, PAGES_DIR);
  return {
    cover: path.join(dir, COVER_FILE),
    summary: path.join(dir, SUMMARY_FILE),
    headerTitle: path.join(dir, HEADER_TITLE_FILE),
    endBanner: path.join(dir, END_BANNER_FILE),
    endCards: Array.from({ length: END_CARD_COUNT }, (_, index) => path.join(dir, endCardFile(index))),
    end: path.join(dir, END_FILE)
  };
}

/**
 * `<outDir>/common/` : `pied.icml`, `pied-gauche.icml`, `en-tete-version.icml`, `fin-mentions.icml`,
 * `type-document.icml`, identiques pour les trois guides (un seul fichier à lier dans chaque document).
 */
function commonPathsFor(outDir) {
  const dir = path.join(outDir, COMMON_DIR);
  return {
    footer: path.join(dir, FOOTER_FILE),
    footerLeft: path.join(dir, FOOTER_LEFT_FILE),
    headerVersion: path.join(dir, HEADER_VERSION_FILE),
    mentions: path.join(dir, MENTIONS_FILE),
    typeDocument: path.join(dir, TYPE_DOCUMENT_FILE)
  };
}

/** `<outDir>/<guide>/<chapitre>/<nom>.icml` : texte d'un cadre de gabarit. */
function satellitePathFor(outDir, chapter, name) {
  return path.join(outDir, chapter.guide, chapter.name.replace(/\.md$/, ''), `${name}.icml`);
}

/** En-tête de la page droite d'un chapitre : `<chapitre>/en-tete-chapitre.icml` (numéro) et `en-tete-titre-chapitre.icml` (titre). */
function chapterHeaderPathsFor(outDir, chapter) {
  return {
    number: satellitePathFor(outDir, chapter, CHAPTER_NUMBER_FILE.replace(/\.icml$/, '')),
    title: satellitePathFor(outDir, chapter, CHAPTER_TITLE_FILE.replace(/\.icml$/, ''))
  };
}

/**
 * ICML de `outDir/<guide>/` (et de ses dossiers de chapitre) sans correspondance : ni chapitre,
 * ni fichier de gabarit attendu (`expectedFiles`). Lecture seule.
 */
function findOrphans(outDir, chapters, expectedFiles = [], guideDirs = [...new Set(chapters.map(chapter => chapter.guide))]) {
  const expected = new Set([...chapters.map(chapter => outputPathFor(outDir, chapter)), ...expectedFiles]);
  guideDirs.forEach(guide => {
    Object.values(pagePathsFor(outDir, guide)).flat().forEach(file => expected.add(file));
  });
  Object.values(commonPathsFor(outDir)).forEach(file => expected.add(file));
  return [...guideDirs, COMMON_DIR].flatMap(guide => {
    const dir = path.join(outDir, guide);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true })
      .flatMap(entry => {
        if (entry.isDirectory()) {
          return fs.readdirSync(path.join(dir, entry.name)).map(name => path.join(dir, entry.name, name));
        }
        return [path.join(dir, entry.name)];
      })
      .filter(file => file.endsWith('.icml') && !expected.has(file));
  });
}

function chapterLabel(chapter) {
  return `${chapter.guide}/${chapter.name}`;
}

function runPandoc(pandoc, chapter) {
  const result = spawnSync(pandoc, ['-f', 'gfm', '-t', 'icml', '-s', chapter.name], {
    cwd: chapter.dir,
    encoding: 'utf8',
    maxBuffer: PANDOC_MAX_BUFFER
  });
  if (result.error) {
    if (result.error.code === 'ENOENT') throw new ExportError(PANDOC_MISSING);
    throw new ExportError(`${chapterLabel(chapter)} : Pandoc n'a pas pu être lancé (${result.error.message}).`);
  }
  if (result.status !== 0) {
    throw new ExportError(`${chapterLabel(chapter)} : Pandoc a échoué (code ${result.status}).\n${result.stderr.trim()}`);
  }
  return result.stdout;
}

/** Enveloppe ICML (déclarations de styles, histoire) d'un document Pandoc minimal. */
function runPandocStub(pandoc) {
  const result = spawnSync(pandoc, ['-f', 'gfm', '-t', 'icml', '-s'], {
    input: '# x\n',
    encoding: 'utf8',
    maxBuffer: PANDOC_MAX_BUFFER
  });
  if (result.error) {
    if (result.error.code === 'ENOENT') throw new ExportError(PANDOC_MISSING);
    throw new ExportError(`Pandoc n'a pas pu être lancé (${result.error.message}).`);
  }
  if (result.status !== 0) {
    throw new ExportError(`Pandoc a échoué (code ${result.status}).\n${result.stderr.trim()}`);
  }
  return result.stdout;
}

/**
 * `type-document.icml` est commun à tous les guides : leurs `type` doivent donc coïncider.
 * Rend le type partagé ; lève une ExportError sinon.
 */
function sharedDocumentType(guides) {
  const types = [...new Set(guides.map(guide => guide.type))];
  if (types.length > 1) {
    throw new ExportError(`Les guides déclarent des « type » différents (${types.join(' / ')}) : `
      + 'type-document.icml est commun, un seul type est possible par configuration.');
  }
  return types[0];
}

/** Fichiers communs à tous les guides (pied de page, version, mentions, type de document) : [{ file, icml }]. */
function convertCommon({ outDir, pandoc, config, version, documentType, maquette }) {
  const envelope = runPandocStub(pandoc);
  const paths = commonPathsFor(outDir);
  try {
    const entry = pages.commonEntry(config);
    return [
      { file: paths.footer, icml: buildPageIcml(envelope, pages.footerParagraphs(entry), { maquette }) },
      { file: paths.footerLeft, icml: buildPageIcml(envelope, pages.footerLeftParagraphs(entry), { maquette }) },
      { file: paths.headerVersion, icml: buildPageIcml(envelope, pages.headerVersionParagraphs({ version }), { maquette }) },
      { file: paths.mentions, icml: buildPageIcml(envelope, pages.mentionsParagraphs(entry), { maquette }) },
      { file: paths.typeDocument, icml: buildPageIcml(envelope, pages.typeDocumentParagraphs(documentType), { maquette }) }
    ];
  } catch (error) {
    throw new ExportError(`${COMMON_DIR} : ${error.message}`);
  }
}

/** Couverture, sommaire et fin propres à un guide : [{ file, icml }]. */
function convertPages({ guide, title, chapters, outDir, pandoc, config, version, maquette }) {
  const label = `${guide}/pages`;
  const titled = chapters.map(chapter => {
    const markdown = fs.readFileSync(path.join(chapter.dir, chapter.name), 'utf8');
    return { number: chapterNumber(chapter), title: pages.firstHeading(markdown, chapterLabel(chapter)) };
  });
  const envelope = runPandocStub(pandoc);
  const paths = pagePathsFor(outDir, guide);
  const entry = pages.guideEntry(config, guide);
  try {
    return [
      { file: paths.cover, icml: buildPageIcml(envelope, pages.coverParagraphs({ title, chapters: titled, version }, maquette.textes), { maquette }) },
      { file: paths.summary, icml: buildPageIcml(envelope, pages.summaryPageParagraphs({ chapters: titled, pages: entry.pages }, maquette.textes), { maquette }) },
      { file: paths.headerTitle, icml: buildPageIcml(envelope, pages.headerTitleParagraphs({ title }), { maquette }) },
      { file: paths.endBanner, icml: buildPageIcml(envelope, pages.endBannerParagraphs(entry), { maquette }) },
      ...paths.endCards.map((file, index) => ({ file, icml: buildPageIcml(envelope, pages.endCardParagraphs(entry, index), { maquette }) })),
      { file: paths.end, icml: buildPageIcml(envelope, pages.endParagraphs(entry), { maquette }) },
      ...titled.flatMap(({ number, title }, index) => {
        const header = chapterHeaderPathsFor(outDir, chapters[index]);
        return [
          { file: header.number, icml: buildPageIcml(envelope, pages.chapterNumberParagraphs({ number }), { maquette }), satellite: true },
          { file: header.title, icml: buildPageIcml(envelope, pages.chapterTitleParagraphs({ title }), { maquette }), satellite: true }
        ];
      })
    ];
  } catch (error) {
    throw new ExportError(`${label} : ${error.message}`);
  }
}

/** Numéro du chapitre, lu dans le préfixe `0N-` du nom de fichier. */
function chapterNumber(chapter) {
  return Number.parseInt(chapter.name, 10);
}

function convertChapter(chapter, { pandoc, columnWidth, pageNumbers, maquette }) {
  const source = runPandoc(pandoc, chapter);
  let converted;
  try {
    converted = transformIcml(source, { chapterDir: chapter.dir, columnWidth, chapterNumber: chapterNumber(chapter), pageNumbers, maquette });
  } catch (error) {
    throw new ExportError(`${chapterLabel(chapter)} : ${error.message}`);
  }
  const missing = converted.images.filter(image => !fs.existsSync(image));
  if (missing.length > 0) {
    throw new ExportError(`${chapterLabel(chapter)} : image introuvable : ${missing.join(', ')}`);
  }
  return converted;
}

/**
 * Convertit tous les chapitres, puis écrit seulement si tous ont réussi.
 * Rend `{ written, orphans, overwritten }` (chemins absolus) ; lève une ExportError sinon.
 * Un ICML corrigé à la main depuis le dernier export (empreinte changée) arrête l'export, sauf `force` ;
 * `overwritten` liste alors les fichiers écrasés.
 */
function exportGuides({ config, outDir: outDirOverride, pandoc = 'pandoc', columnWidth, version, force = false } = {}) {
  if (!config) throw new ExportError('exportGuides : la configuration du projet est obligatoire.');
  const outDir = outDirOverride ?? icmlDirFor(config);
  const chapters = listChapters(config);
  const documentType = sharedDocumentType(config.guides);
  let pagesConfig;
  let productVersion;
  try {
    pagesConfig = pages.loadPagesConfig(config.pagesFile, config.maquette);
    productVersion = version ?? readVersion(config);
  } catch (error) {
    throw new ExportError(error.message);
  }
  let modified;
  try {
    modified = manifest.findModified(outDir);
  } catch (error) {
    throw new ExportError(error.message);
  }
  if (modified.length > 0 && !force) {
    const names = modified.map(file => `  ${path.relative(process.cwd(), file)}`).join('\n');
    throw new ExportError(
      `ICML modifiés à la main depuis le dernier export, la régénération les écraserait :\n${names}\n`
      + 'Reporter la correction dans le Markdown, ou relancer avec --force pour les écraser.'
    );
  }
  const outputs = chapters.flatMap(chapter => {
    const pageNumbers = pagesConfig[chapter.guide] ? pagesConfig[chapter.guide].pages : undefined;
    const converted = convertChapter(chapter, { pandoc, columnWidth, pageNumbers, maquette: config.maquette });
    return [
      { file: outputPathFor(outDir, chapter), icml: converted.icml },
      ...converted.satellites.map(({ name, icml }) => ({ file: satellitePathFor(outDir, chapter, name), icml, satellite: true }))
    ];
  });
  const guideDirs = config.guides.map(guide => guide.dir);
  config.guides.forEach(({ dir: guide, title }) => {
    const own = chapters.filter(chapter => chapter.guide === guide);
    outputs.push(...convertPages({ guide, title, chapters: own, outDir, pandoc, config: pagesConfig, version: productVersion, maquette: config.maquette }));
  });
  outputs.push(...convertCommon({ outDir, pandoc, config: pagesConfig, version: productVersion, documentType, maquette: config.maquette }));
  outputs.forEach(({ file, icml }) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, icml, 'utf8');
  });
  manifest.writeManifest(outDir, outputs);
  const satellites = outputs.filter(output => output.satellite).map(output => output.file);
  return {
    written: outputs.map(output => output.file),
    orphans: findOrphans(outDir, chapters, satellites, guideDirs),
    overwritten: modified
  };
}

/** Options de la ligne de commande ; lève une ExportError sur une valeur refusée. */
function parseArgs(argv) {
  const options = {};
  let split;
  try {
    split = extractConfigArg(argv);
  } catch (error) {
    if (error instanceof ConfigError) throw new ExportError(error.message);
    throw error;
  }
  if (split.configPath) options.configPath = split.configPath;
  const rest = split.rest;
  for (let i = 0; i < rest.length; i += 1) {
    // Un `--` isolé (séparateur transmis tel quel par un gestionnaire de paquets) est ignoré.
    if (rest[i] === '--') continue;
    if (rest[i] === '--force') {
      options.force = true;
      continue;
    }
    if (rest[i] !== '--largeur-colonne') {
      throw new ExportError(`Option inconnue : ${rest[i]}. Options acceptées : --largeur-colonne <pt>, --force, --config <chemin>.`);
    }
    const raw = rest[i + 1];
    const width = Number(raw);
    if (raw === undefined || raw.trim() === '' || !Number.isFinite(width) || width <= 0) {
      throw new ExportError(`--largeur-colonne attend une largeur en points supérieure à 0 (reçu : ${raw ?? 'rien'}).`);
    }
    options.columnWidth = width;
    i += 1;
  }
  return options;
}

function main(argv) {
  try {
    const { configPath, ...options } = parseArgs(argv);
    const config = loadConfig({ configPath });
    const { written, orphans, overwritten } = exportGuides({ ...options, config });
    if (overwritten.length > 0) {
      console.log('ICML modifiés à la main, écrasés (--force) :');
      overwritten.forEach(file => console.log(`  ${path.relative(process.cwd(), file)}`));
    }
    written.forEach(file => console.log(`Écrit : ${path.relative(process.cwd(), file)}`));
    console.log(`${written.length} fichiers ICML écrits.`);
    if (orphans.length > 0) {
      console.log('ICML sans chapitre correspondant, conservés (relier les blocs InDesign au nouveau fichier avant de les supprimer) :');
      orphans.forEach(file => console.log(`  ${path.relative(process.cwd(), file)}`));
    }
    return 0;
  } catch (error) {
    if (!(error instanceof ExportError || error instanceof ConfigError)) throw error;
    console.error(error.message);
    console.error('Aucun fichier écrit.');
    return 1;
  }
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = {
  icmlDirFor,
  sharedDocumentType,
  listChapters,
  outputPathFor,
  satellitePathFor,
  chapterHeaderPathsFor,
  findOrphans,
  pagePathsFor,
  commonPathsFor,
  exportGuides,
  parseArgs,
  ExportError,
  PANDOC_MISSING
};
