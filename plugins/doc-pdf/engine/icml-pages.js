/**
 * Textes des pages de gabarit (couverture, sommaire, fin) d'un guide, en paragraphes à
 * styles du jeu court, prêts pour `buildPageIcml` (engine/icml-transform.js).
 *
 * - couverture : titre du document (premier titre du chapitre 01), version du
 *   produit (`versionFile` de la configuration), sommaire « NN, tabulation, titre » de tous les chapitres ;
 * - fin : deux colonnes de conseils (cadre de texte) et, pour le gabarit, le contact
 *   du bandeau et des trois cartes, adaptés au lecteur du guide ;
 * - sous-titre de la couverture. Tout vient du fichier de pages (`pagesFile` de la configuration,
 *   cf. guide-config.js), une entrée par dossier de guide, à tenir à jour à la main ;
 * - pied de page et mentions (les deux lignes du pied anthracite de la page de fin : phrase de marque,
 *   mentions légales) : identiques pour tous les guides, clés `pied` et `mentions` de l'entrée
 *   `commun` du même fichier ;
 * - titres courants d'en-tête de la page A-Courante : titre du document et version (page gauche),
 *   numéro et titre du chapitre (page droite).
 */

const fs = require('fs');
const path = require('path');
const { DEFAULT_TYPE } = require('./guide-config');

class PagesError extends Error {}

/** Premier titre de niveau 1 d'un chapitre Markdown. */
function firstHeading(markdown, label) {
  const line = markdown.split(/\r?\n/).find((text) => /^# \S/.test(text));
  if (!line) {
    throw new PagesError(`${label} : aucun titre de niveau 1 (« # … ») pour la couverture.`);
  }
  return line.replace(/^# /, '').trim();
}

/**
 * Titre sans marque d'accent : le Markdown d'un titre peut porter `*mot*` (accent, rendu à
 * l'ouverture du chapitre), jamais dans un titre courant, la couverture ni le sommaire.
 */
const plainTitle = title => title.replace(/\*/g, '');

/** Les textes fixes viennent de la maquette : aucun repli sur une maquette embarquée. */
function requireTextes(textes, caller) {
  if (!textes) throw new PagesError(`${caller} : les textes de la maquette sont obligatoires.`);
}

/**
 * Couverture : titre du guide, version, sommaire. `title` : titre du guide (champ `title` de la
 * configuration), jamais celui d'un chapitre ; `chapters` : [{ number, title }] dans l'ordre du guide.
 */
function coverParagraphs({ title, chapters, version }, textes) {
  requireTextes(textes, 'coverParagraphs');
  if (!title) {
    throw new PagesError('Couverture impossible : le titre du guide est obligatoire.');
  }
  if (chapters.length === 0) {
    throw new PagesError('Couverture impossible : le guide ne contient aucun chapitre.');
  }
  return [
    { style: 'Titre-couverture', text: plainTitle(title) },
    { style: 'Surtitre', text: `Version ${version}` },
    { style: 'Sommaire-général', text: textes.sommaire },
    ...chapters.map(({ number, title }) => ({
      style: 'Sommaire-ligne',
      text: `${String(number).padStart(2, '0')}\t${plainTitle(title)}`
    }))
  ];
}

/**
 * Page de sommaire (page 2) : libellé « Sommaire » puis une ligne par chapitre
 * (numéro, tabulation, titre, tabulation, « p. … » à remplacer par la page).
 * Distincte du sommaire de la couverture, qui a ses propres styles.
 */
function summaryPageParagraphs({ chapters, pages }, textes) {
  requireTextes(textes, 'summaryPageParagraphs');
  if (chapters.length === 0) {
    throw new PagesError('Sommaire impossible : le guide ne contient aucun chapitre.');
  }
  return [
    { style: 'Surtitre', text: textes.sommaire },
    ...chapters.map(({ number, title }) => ({
      style: 'Sommaire-chapitre',
      text: [
        { text: String(number).padStart(2, '0'), character: 'Sommaire-numéro' },
        { text: '\t' },
        { text: plainTitle(title) },
        { text: '\t' },
        { text: pageLabel(pages, String(number), textes), character: 'Sommaire-page' }
      ]
    }))
  ];
}

/**
 * Libellé de page d'une entrée de sommaire : « p. N » si `pages` (clé du guide dans le fichier
 * de configuration) porte le numéro, « p. … » sinon, à remplacer par celui d'InDesign.
 */
function pageLabel(pages, key, textes) {
  requireTextes(textes, 'pageLabel');
  const page = pages ? pages[key] : undefined;
  return page === undefined ? textes.pageSommaire : `${textes.pageSommairePrefixe}${page}`;
}

/**
 * Pied de page : un seul paragraphe, le texte que tous les gabarits (courante, chapitre) répètent
 * en bas de page, dans le style des titres courants.
 */
function footerParagraphs(entry) {
  return [{ style: 'Titre-courant', text: entry.pied }];
}

/** Pied de la page gauche : même texte, aligné à droite contre la marge intérieure (l'import écrase l'alignement du cadre). */
function footerLeftParagraphs(entry) {
  return [{ style: 'Titre-courant', text: entry.pied, justification: 'RightAlign' }];
}

/** En-tête de la page gauche : flèche ◀ vers le bord extérieur (comme le ▶ de la page droite), titre du document (celui de la couverture). */
function headerTitleParagraphs({ title }) {
  return [{ style: 'Titre-courant', text: [{ text: '◀', character: 'Puce' }, { text: ` ${plainTitle(title)}` }] }];
}

/** En-tête de la page gauche : version du produit, alignée à droite contre la marge intérieure. */
function headerVersionParagraphs({ version }) {
  return [{ style: 'Titre-courant', text: `v${version}`, justification: 'RightAlign' }];
}

/** En-tête de la page droite : « Chapitre NN », en couleur d'accent. */
function chapterNumberParagraphs({ number }) {
  return [{ style: 'En-tête-chapitre', text: `Chapitre ${String(number).padStart(2, '0')}` }];
}

/** En-tête de la page droite : titre du chapitre puis puce, aligné à droite. */
function chapterTitleParagraphs({ title }) {
  return [{
    style: 'Titre-courant',
    text: [{ text: `${plainTitle(title)} ` }, { text: '▶', character: 'Puce' }],
    justification: 'RightAlign'
  }];
}

const CARD_COUNT = 3;
const MENTION_COUNT = 2;
const COLUMN_COUNT = 2;

const isText = value => typeof value === 'string' && value.trim() !== '';

/** `pages` (facultatif) : { "<chapitre>" ou "<chapitre>.<section>": numéro de page entier ≥ 1 }. */
function checkPages(pages, guide) {
  if (pages === undefined) return;
  const isMap = pages && typeof pages === 'object' && !Array.isArray(pages);
  const valid = isMap && Object.entries(pages).every(([key, page]) => /^\d+(\.\d+)?$/.test(key) && Number.isInteger(page) && page >= 1);
  if (!valid) {
    throw new PagesError(`Numéros de page (${guide}) : « pages » doit associer « N » ou « N.M » à un numéro de page entier.`);
  }
}

/** Vérifie la fin d'un guide ; `where` nomme le guide dans les messages. */
function checkEnd(end, where) {
  const fail = detail => { throw new PagesError(`Page de fin (${where}) : ${detail}`); };
  if (!end || typeof end !== 'object') fail('« fin » est absente.');
  if (!isText(end.titre) || !isText(end.accroche)) fail('« titre » et « accroche » doivent être des textes non vides.');
  const cards = end.cartes;
  const validCards = Array.isArray(cards) && cards.length === CARD_COUNT
    && cards.every(card => card && ['label', 'valeur', 'note'].every(key => isText(card[key])));
  if (!validCards) fail(`« cartes » doit lister ${CARD_COUNT} cartes { label, valeur, note }, toutes renseignées.`);
  const columns = end.colonnes;
  const validColumns = Array.isArray(columns) && columns.length === COLUMN_COUNT
    && columns.every(column => column && isText(column.titre) && Array.isArray(column.lignes)
      && column.lignes.length > 0 && column.lignes.every(isText));
  if (!validColumns) fail(`« colonnes » doit lister ${COLUMN_COUNT} colonnes { titre, lignes } aux lignes renseignées.`);
}

/** Vérifie les deux lignes du pied de la page de fin. */
function checkMentions(mentions, where) {
  const valid = Array.isArray(mentions) && mentions.length === MENTION_COUNT && mentions.every(isText);
  if (!valid) {
    throw new PagesError(`Mentions de fin (${where}) : « mentions » doit lister ${MENTION_COUNT} textes non vides.`);
  }
}

/** Clé du texte partagé par les trois guides (pied de page, mentions de fin) : `output/icml/common/`. */
const COMMON_KEY = 'commun';

/**
 * Lit et vérifie le fichier de configuration : une entrée `commun` (`pied` : texte unique des pieds
 * de page, `mentions` : pied de la page de fin) et une entrée par dossier de guide
 * (clé = `dir` du guide dans la configuration), avec `sousTitre` (couverture), `fin` (page de fin) et `pages` (facultatif).
 * Le `commun` de la maquette sert de base, complété clé par clé par celui du projet (une clé du projet l'emporte) ;
 * `miseAJour` (date, projet) s'ajoute à la dernière mention, après le libellé `textes.miseAJour` de la maquette.
 */
function loadPagesConfig(file, maquette) {
  if (!maquette) throw new PagesError('Pages de couverture et de fin : la maquette est obligatoire.');
  let config;
  try {
    config = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new PagesError(`Pages de couverture et de fin : ${file} illisible (${error.message}).`);
  }
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new PagesError('Pages de couverture et de fin : le fichier doit contenir un objet par guide.');
  }
  const common = mergeCommon(config[COMMON_KEY], maquette, file);
  config[COMMON_KEY] = common;
  Object.entries(config).filter(([guide]) => guide !== COMMON_KEY).forEach(([guide, entry]) => {
    if (!entry || !isText(entry.sousTitre)) {
      throw new PagesError(`Couverture (${guide}) : « sousTitre » doit être un texte non vide.`);
    }
    checkEnd(entry.fin, guide);
    checkPages(entry.pages, guide);
  });
  return config;
}

/** `commun` du projet complété de celui de la maquette, date de mise à jour ajoutée ; vérifie le résultat. */
function mergeCommon(project, maquette, file) {
  const merged = { ...(maquette.commun ?? {}), ...(project ?? {}) };
  const where = `${maquette.file} et ${file}`;
  if (!isText(merged.pied)) {
    throw new PagesError(`Pied de page (${COMMON_KEY}) : « pied » doit être un texte non vide, ni la maquette ni le projet ne le donne (${where}).`);
  }
  if (!Array.isArray(merged.mentions)) {
    throw new PagesError(`Mentions de fin (${COMMON_KEY}) : « mentions » absent, ni la maquette ni le projet ne le donne (${where}).`);
  }
  checkMentions(merged.mentions, COMMON_KEY);
  if (merged.miseAJour !== undefined) {
    if (!isText(merged.miseAJour)) throw new PagesError(`Mentions de fin (${COMMON_KEY}) : « miseAJour » doit être un texte non vide.`);
    const last = merged.mentions.length - 1;
    merged.mentions = merged.mentions.map((text, index) => (index === last ? `${text} · ${maquette.textes.miseAJour} ${merged.miseAJour}` : text));
  }
  return merged;
}

/** Texte commun aux trois guides (`pied`, `mentions`) de la configuration lue. */
function commonEntry(config) {
  return config[COMMON_KEY];
}

/** Entrée d'un guide dans la configuration lue, complétée du texte commun ; lève une PagesError si le guide n'y figure pas. */
function guideEntry(config, guide) {
  if (guide === COMMON_KEY || !config[guide]) {
    throw new PagesError(`Pages de couverture et de fin : aucune entrée pour « ${guide} » dans le fichier de configuration.`);
  }
  return { ...commonEntry(config), ...config[guide] };
}

/** Bandeau de contact de la page de fin : le titre puis l'accroche, en couleur papier sur le fond orange. */
function endBannerParagraphs(entry) {
  return [
    { style: 'Bandeau-titre', text: entry.fin.titre },
    { style: 'Bandeau-texte', text: entry.fin.accroche }
  ];
}

/** Une carte de contact de la page de fin (`index` de 0 à 2) : libellé, valeur, note. */
function endCardParagraphs(entry, index) {
  const card = entry.fin.cartes[index];
  return [
    { style: 'Surtitre', text: card.label },
    { style: 'Carte-valeur', text: card.valeur },
    { style: 'Légende', text: card.note }
  ];
}

/**
 * Pastille « type de document » de la couverture, lue du champ `type` du guide dans la configuration
 * (l'import écrase l'alignement du cadre : il est donc porté par le paragraphe).
 */
function typeDocumentParagraphs(type = DEFAULT_TYPE) {
  return [{ style: 'Type-document', text: type, justification: 'CenterAlign' }];
}

/**
 * Pied anthracite de la page de fin, en couleur papier : la phrase de marque (première mention) en
 * « Mentions-marque », puis chaque donnée des mentions légales (séparées par « · ») sur sa propre ligne
 * en « Mentions ». Partagé par l'ICML et le modèle IDML.
 */
function mentionLines(mentions) {
  const [brand, ...legal] = mentions;
  const lines = legal.flatMap(text => text.split(/\s+·\s+/)).filter(line => line.trim() !== '');
  return [{ style: 'Mentions-marque', text: brand }, ...lines.map(text => ({ style: 'Mentions', text }))];
}

/** Pied anthracite de la page de fin (cf. `mentionLines`). */
function mentionsParagraphs(entry) {
  return mentionLines(entry.mentions);
}

/** Fin : deux colonnes (titre, lignes), la seconde s'ouvrant en colonne suivante du cadre. */
function endParagraphs(entry) {
  return entry.fin.colonnes.flatMap((column, index) => [
    { style: 'Surtitre', text: column.titre, ...(index > 0 ? { columnBreak: true } : {}) },
    // Lignes courtes en colonne étroite : une césure y coupe un mot sur deux (« concer-né »).
    ...column.lignes.map(text => ({ style: 'Courant', text, noHyphenation: true }))
  ]);
}

function productVersion(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8')).version;
}

const NUMBERED_CHAPTER = /^\d{2}-[^/\\]+\.md$/;

/** Chapitres numérotés d'un dossier de guide : [{ number, title }] (numéro du préfixe, premier titre). */
function guideChapters(guide, guidesDir) {
  const dir = path.join(guidesDir, guide);
  if (!fs.existsSync(dir)) {
    throw new PagesError(`Dossier de guide introuvable : ${dir}`);
  }
  return fs.readdirSync(dir)
    .filter((name) => NUMBERED_CHAPTER.test(name))
    .sort()
    .map((name) => ({
      number: Number.parseInt(name, 10),
      title: firstHeading(fs.readFileSync(path.join(dir, name), 'utf8'), `${guide}/${name}`)
    }));
}

/**
 * Couverture et fin d'un guide : paragraphes tels que les écrit l'ICML, plus le sous-titre
 * de la couverture et le contact (bandeau et cartes) de la page de fin.
 */
function guidePages(guide, { title, guidesDir, pagesConfig, version, maquette }) {
  const { textes } = maquette;
  const entry = guideEntry(loadPagesConfig(pagesConfig, maquette), guide);
  return {
    cover: coverParagraphs({ title, chapters: guideChapters(guide, guidesDir), version }, textes),
    subtitle: entry.sousTitre,
    pages: entry.pages,
    footer: entry.pied,
    mentions: entry.mentions,
    end: endParagraphs(entry),
    contact: { titre: entry.fin.titre, accroche: entry.fin.accroche, cartes: entry.fin.cartes }
  };
}

module.exports = {
  PagesError,
  firstHeading,
  coverParagraphs,
  summaryPageParagraphs,
  pageLabel,
  footerParagraphs,
  footerLeftParagraphs,
  typeDocumentParagraphs,
  headerTitleParagraphs,
  headerVersionParagraphs,
  chapterNumberParagraphs,
  chapterTitleParagraphs,
  mentionsParagraphs,
  mentionLines,
  loadPagesConfig,
  COMMON_KEY,
  commonEntry,
  guideEntry,
  endParagraphs,
  endBannerParagraphs,
  endCardParagraphs,
  productVersion,
  guideChapters,
  guidePages
};
