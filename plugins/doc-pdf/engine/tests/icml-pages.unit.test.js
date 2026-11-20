/**
 * Textes des pages de couverture et de fin (engine/icml-pages.js) :
 * titre lu dans le chapitre, sommaire, sous-titre, contact et conseils de la fin.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  PagesError,
  firstHeading,
  coverParagraphs: coverWith,
  summaryPageParagraphs: summaryWith,
  loadPagesConfig,
  guideEntry,
  endParagraphs,
  endBannerParagraphs,
  endCardParagraphs,
  footerParagraphs,
  footerLeftParagraphs,
  typeDocumentParagraphs,
  headerTitleParagraphs,
  headerVersionParagraphs,
  chapterNumberParagraphs,
  chapterTitleParagraphs,
  mentionsParagraphs,
  commonEntry,
  mentionLines,
  guidePages: guidePagesWith,
  productVersion
} = require('../icml-pages');
const MAQUETTE = require('../maquette').loadMaquette(require('path').join(__dirname, '..', 'maquettes', 'squelette'));
const STYLES = MAQUETTE.styles;
/** Maquette sans « commun » : le projet doit alors tout fournir. */
const SANS_COMMUN = { ...MAQUETTE, commun: undefined };
const coverParagraphs = (args, textes = MAQUETTE.textes) => coverWith(args, textes);
const summaryPageParagraphs = (args, textes = MAQUETTE.textes) => summaryWith(args, textes);
const guidePages = (guide, options) => guidePagesWith(guide, { maquette: MAQUETTE, ...options });
const { loadConfig, readVersion } = require('../guide-config');

const FIXTURE_CONFIG = path.join(__dirname, 'fixtures', 'project', 'docs', 'documentation.config.json');

/** Configuration du dépôt : fichier des pages, dossiers des guides et version viennent d'elle. */
const REPO_CONFIG = loadConfig({ configPath: FIXTURE_CONFIG });

const tempDirs = [];

function writeConfig(content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cerascan-pages-'));
  tempDirs.push(dir);
  const file = path.join(dir, 'pages.json');
  fs.writeFileSync(file, typeof content === 'string' ? content : JSON.stringify(content), 'utf8');
  return file;
}

afterAll(() => {
  tempDirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true }));
});

const VALID_END = {
  titre: 'Une question ?',
  accroche: 'Écrivez-nous.',
  cartes: [
    { label: 'E-mail', valeur: 'a@b.fr', note: 'Sous 48 h' },
    { label: 'Téléphone', valeur: '01 02 03 04 05', note: 'En semaine' },
    { label: 'Nom', valeur: 'Alex', note: 'Contact' }
  ],
  colonnes: [
    { titre: 'Pour être aidé vite', lignes: ['1. Première ligne.', '2. Deuxième ligne.'] },
    { titre: 'Avant de nous écrire', lignes: ['1. Relisez le message.'] }
  ]
};
const VALID_MENTIONS = ['Phrase de marque.', 'Mentions légales.'];
const VALID_COMMON = { pied: 'Marque · Guide X', mentions: VALID_MENTIONS };
const VALID = { commun: VALID_COMMON, 'guide-x': { sousTitre: 'Un sous-titre.', fin: VALID_END } };
const withEnd = changes => ({
  commun: VALID_COMMON,
  'guide-x': { sousTitre: 'Un sous-titre.', fin: { ...VALID_END, ...changes } }
});
const withCommon = common => ({ commun: common, 'guide-x': VALID['guide-x'] });

describe('firstHeading', () => {
  test('rend le premier titre de niveau 1, sans le dièse', () => {
    expect(firstHeading('Intro\n\n## Section\n# Mon guide  \n# Autre\n', 'x')).toBe('Mon guide');
  });

  test('accepte les fins de ligne Windows', () => {
    expect(firstHeading('# Mon guide\r\nTexte\r\n', 'x')).toBe('Mon guide');
  });

  test('sans titre de niveau 1 : erreur qui nomme le chapitre', () => {
    expect(() => firstHeading('## Section\n', 'guide/01-a.md')).toThrow(/guide\/01-a\.md/);
  });
});

describe('summaryPageParagraphs', () => {
  test('libellé, puis une ligne par chapitre : numéro, titre, page à renseigner', () => {
    const lines = summaryPageParagraphs({ chapters: [{ number: 1, title: 'Vue' }, { number: 12, title: 'Fin' }] });
    expect(lines[0]).toEqual({ style: 'Surtitre', text: 'Sommaire' });
    expect(lines.slice(1).map(line => line.style)).toEqual(['Sommaire-chapitre', 'Sommaire-chapitre']);
    expect(lines[2].text).toEqual([
      { text: '12', character: 'Sommaire-numéro' },
      { text: '\t' },
      { text: 'Fin' },
      { text: '\t' },
      { text: 'p. …', character: 'Sommaire-page' }
    ]);
  });

  test('sans chapitre : PagesError', () => {
    expect(() => summaryPageParagraphs({ chapters: [] })).toThrow(PagesError);
  });

  test('numéros de page connus : « p. N » ; chapitre absent de la table : « p. … »', () => {
    const lines = summaryPageParagraphs({ chapters: [{ number: 1, title: 'Vue' }, { number: 2, title: 'Fin' }], pages: { 1: 3 } });
    const pageOf = line => line.text[4];
    expect(pageOf(lines[1])).toEqual({ text: 'p. 3', character: 'Sommaire-page' });
    expect(pageOf(lines[2]).text).toBe('p. …');
  });
});

describe('bandeau et cartes de la page de fin', () => {
  const entry = VALID['guide-x'];

  test('bandeau : le titre puis l’accroche, en styles de couleur papier', () => {
    expect(endBannerParagraphs(entry)).toEqual([
      { style: 'Bandeau-titre', text: entry.fin.titre },
      { style: 'Bandeau-texte', text: entry.fin.accroche }
    ]);
  });

  test.each([0, 1, 2])('carte %i : libellé, valeur et note de la carte', index => {
    const card = entry.fin.cartes[index];
    expect(endCardParagraphs(entry, index)).toEqual([
      { style: 'Surtitre', text: card.label },
      { style: 'Carte-valeur', text: card.valeur },
      { style: 'Légende', text: card.note }
    ]);
  });
});

describe('footerParagraphs', () => {
  test('un seul paragraphe de titre courant portant le texte du pied', () => {
    expect(footerParagraphs({ pied: 'Marque · Guide X' })).toEqual([
      { style: 'Titre-courant', text: 'Marque · Guide X' }
    ]);
  });
});

describe('footerLeftParagraphs', () => {
  test('même texte que le pied courant, aligné à droite', () => {
    expect(footerLeftParagraphs({ pied: 'Marque · Guide X' })).toEqual([
      { style: 'Titre-courant', text: 'Marque · Guide X', justification: 'RightAlign' }
    ]);
  });
});

describe('typeDocumentParagraphs', () => {
  test('texte fixe de la pastille, en style Type-document centré', () => {
    expect(typeDocumentParagraphs()).toEqual([
      { style: 'Type-document', text: 'Documentation utilisateur', justification: 'CenterAlign' }
    ]);
  });
});

describe('mentionsParagraphs', () => {
  test('phrase de marque en Mentions-marque, puis une ligne Mentions par donnée', () => {
    expect(mentionsParagraphs({ ...VALID_COMMON })).toEqual([
      { style: 'Mentions-marque', text: 'Phrase de marque.' },
      { style: 'Mentions', text: 'Mentions légales.' }
    ]);
    expect(mentionLines(['Marque.', 'Nom · SIRET 1 · Adresse'])).toEqual([
      { style: 'Mentions-marque', text: 'Marque.' },
      { style: 'Mentions', text: 'Nom' },
      { style: 'Mentions', text: 'SIRET 1' },
      { style: 'Mentions', text: 'Adresse' }
    ]);
  });
});

describe('titres courants d’en-tête', () => {
  test('page gauche : flèche vers l’extérieur et titre du document sans accent Markdown, puis version alignée à droite', () => {
    expect(headerTitleParagraphs({ title: 'Le guide du *partenaire*' })).toEqual([
      { style: 'Titre-courant', text: [{ text: '◀', character: 'Puce' }, { text: ' Le guide du partenaire' }] }
    ]);
    expect(headerVersionParagraphs({ version: '2.20.0' })).toEqual([
      { style: 'Titre-courant', text: 'v2.20.0', justification: 'RightAlign' }
    ]);
  });

  test('page droite : numéro sur deux chiffres en En-tête-chapitre, titre suivi de la puce, à droite', () => {
    expect(chapterNumberParagraphs({ number: 3 })).toEqual([{ style: 'En-tête-chapitre', text: 'Chapitre 03' }]);
    expect(chapterTitleParagraphs({ title: 'Importer *un* CSV' })).toEqual([
      {
        style: 'Titre-courant',
        text: [{ text: 'Importer un CSV ' }, { text: '▶', character: 'Puce' }],
        justification: 'RightAlign'
      }
    ]);
  });
});

describe('coverParagraphs', () => {
  const chapters = [{ number: 1, title: 'Guide' }, { number: 2, title: 'Importer' }];

  test('titre du premier chapitre, version, puis une ligne de sommaire par chapitre', () => {
    expect(coverParagraphs({ chapters, version: '2.20.0' })).toEqual([
      { style: 'Titre-couverture', text: 'Guide' },
      { style: 'Surtitre', text: 'Version 2.20.0' },
      { style: 'Sommaire-général', text: 'Sommaire' },
      { style: 'Sommaire-ligne', text: '01\tGuide' },
      { style: 'Sommaire-ligne', text: '02\tImporter' }
    ]);
  });

  test('un guide sans chapitre est refusé', () => {
    expect(() => coverParagraphs({ chapters: [], version: '1' })).toThrow(PagesError);
  });
});

describe('loadPagesConfig et endParagraphs', () => {
  test('une configuration valide donne les deux colonnes de conseils', () => {
    const entry = guideEntry(loadPagesConfig(writeConfig(VALID), MAQUETTE), 'guide-x');
    expect(endParagraphs(entry)).toEqual([
      { style: 'Surtitre', text: 'Pour être aidé vite' },
      { style: 'Courant', text: '1. Première ligne.', noHyphenation: true },
      { style: 'Courant', text: '2. Deuxième ligne.', noHyphenation: true },
      { style: 'Surtitre', text: 'Avant de nous écrire', columnBreak: true },
      { style: 'Courant', text: '1. Relisez le message.', noHyphenation: true }
    ]);
  });

  test.each([
    ['JSON invalide', '{ pas du json'],
    ['tableau au lieu d’un objet', []],
    ['sous-titre vide', { commun: VALID_COMMON, 'guide-x': { sousTitre: ' ', fin: VALID_END } }],
    ['entrée commune absente', { 'guide-x': VALID['guide-x'] }],
    ['pied de page absent', withCommon({ mentions: VALID_MENTIONS })],
    ['pied de page vide', withCommon({ pied: ' ', mentions: VALID_MENTIONS })],
    ['mentions absentes', withCommon({ pied: 'p' })],
    ['une mention seulement', withCommon({ pied: 'p', mentions: VALID_MENTIONS.slice(0, 1) })],
    ['mention vide', withCommon({ pied: 'p', mentions: ['a', ' '] })],
    ['fin absente', { commun: VALID_COMMON, 'guide-x': { sousTitre: 'a' } }],
    ['titre de fin vide', withEnd({ titre: '' })],
    ['accroche absente', withEnd({ accroche: undefined })],
    ['deux cartes seulement', withEnd({ cartes: VALID_END.cartes.slice(0, 2) })],
    ['carte sans note', withEnd({ cartes: [{ ...VALID_END.cartes[0], note: ' ' }, ...VALID_END.cartes.slice(1)] })],
    ['une seule colonne', withEnd({ colonnes: VALID_END.colonnes.slice(0, 1) })],
    ['colonne sans ligne', withEnd({ colonnes: [{ titre: 't', lignes: [] }, VALID_END.colonnes[1]] })],
    ['ligne de colonne vide', withEnd({ colonnes: [{ titre: 't', lignes: [' '] }, VALID_END.colonnes[1]] })],
    ['pages en tableau', { ...VALID, 'guide-x': { ...VALID['guide-x'], pages: [3] } }],
    ['clé de page illisible', { ...VALID, 'guide-x': { ...VALID['guide-x'], pages: { 'un': 3 } } }],
    ['numéro de page non entier', { ...VALID, 'guide-x': { ...VALID['guide-x'], pages: { '1.1': '4' } } }],
    ['numéro de page nul', { ...VALID, 'guide-x': { ...VALID['guide-x'], pages: { '1': 0 } } }]
  ])('%s : refusé', (_label, content) => {
    expect(() => loadPagesConfig(writeConfig(content), SANS_COMMUN)).toThrow(PagesError);
  });

  test('pages valides : conservées dans l’entrée du guide', () => {
    const config = loadPagesConfig(writeConfig({ ...VALID, 'guide-x': { ...VALID['guide-x'], pages: { 1: 3, '1.1': 4 } } }), MAQUETTE);
    expect(guideEntry(config, 'guide-x').pages).toEqual({ 1: 3, '1.1': 4 });
  });

  test('l’entrée d’un guide reprend le pied et les mentions communs', () => {
    const entry = guideEntry(loadPagesConfig(writeConfig(VALID), MAQUETTE), 'guide-x');
    expect(entry.pied).toBe(VALID_COMMON.pied);
    expect(entry.mentions).toEqual(VALID_MENTIONS);
    expect(commonEntry(loadPagesConfig(writeConfig(VALID), MAQUETTE))).toEqual(VALID_COMMON);
  });

  test('« commun » n’est pas un guide', () => {
    expect(() => guideEntry(loadPagesConfig(writeConfig(VALID), MAQUETTE), 'commun')).toThrow(/commun/);
  });

  test('fichier absent : refusé', () => {
    expect(() => loadPagesConfig(path.join(os.tmpdir(), 'absent-cerascan-pages.json'))).toThrow(PagesError);
  });

  test('guide absent de la configuration : refusé', () => {
    expect(() => guideEntry(loadPagesConfig(writeConfig(VALID), MAQUETTE), 'guide-inconnu')).toThrow(/guide-inconnu/);
  });

  test('la configuration du dépôt est valide et couvre les trois guides', () => {
    const config = loadPagesConfig(REPO_CONFIG.pagesFile, MAQUETTE);
    expect(Object.keys(config).sort()).toEqual(['commun', ...REPO_CONFIG.guides.map(guide => guide.dir)].sort());
  });
});

describe('guidePages', () => {
  test('rend couverture, sous-titre, fin et contact du guide demandé', () => {
    const guidesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cerascan-guides-'));
    tempDirs.push(guidesDir);
    fs.mkdirSync(path.join(guidesDir, 'guide-x'));
    fs.writeFileSync(path.join(guidesDir, 'guide-x', '01-intro.md'), '# Mon guide\n', 'utf8');
    const pages = guidePages('guide-x', { guidesDir, pagesConfig: writeConfig(VALID), version: '9.9.9' });
    expect(pages.cover[0]).toEqual({ style: 'Titre-couverture', text: 'Mon guide' });
    expect(pages.subtitle).toBe('Un sous-titre.');
    expect(pages.footer).toBe('Marque · Guide X');
    expect(pages.mentions).toEqual(VALID_MENTIONS);
    expect(pages.contact).toEqual({ titre: VALID_END.titre, accroche: VALID_END.accroche, cartes: VALID_END.cartes });
    expect(pages.end).toEqual(endParagraphs(VALID['guide-x']));
  });

  test('chaque guide du dépôt a un contact, un sous-titre et des conseils qui lui sont propres (le pied est commun)', () => {
    const config = loadPagesConfig(REPO_CONFIG.pagesFile, MAQUETTE);
    const entries = Object.entries(config).filter(([key]) => key !== 'commun').map(([, entry]) => entry);
    expect(new Set(entries.map(entry => entry.sousTitre)).size).toBe(entries.length);
    expect(new Set(entries.map(entry => entry.fin.titre)).size).toBe(entries.length);
    expect(new Set(entries.map(entry => JSON.stringify(entry.fin.colonnes))).size).toBe(entries.length);
  });
});

describe('styles des pages', () => {
  test('chaque style employé existe dans le jeu court', () => {
    const known = new Set(STYLES.paragraph.map((entry) => entry.name));
    const used = [
      ...coverParagraphs({ chapters: [{ number: 1, title: 'a' }], version: '1' }),
      ...footerParagraphs(VALID_COMMON),
      ...headerTitleParagraphs({ title: 'a' }),
      ...headerVersionParagraphs({ version: '1' }),
      ...chapterNumberParagraphs({ number: 1 }),
      ...chapterTitleParagraphs({ title: 'a' }),
      ...mentionsParagraphs(VALID_COMMON),
      ...endBannerParagraphs(VALID['guide-x']),
      ...[0, 1, 2].flatMap(index => endCardParagraphs(VALID['guide-x'], index)),
      ...endParagraphs(VALID['guide-x'])
    ].map((paragraph) => paragraph.style);
    used.forEach((style) => expect(known.has(style)).toBe(true));
  });

  test('la version du produit est celle de package.json', () => {
    expect(productVersion(REPO_CONFIG.versionFile)).toMatch(/^\d+\.\d+\.\d+/);
    expect(productVersion(REPO_CONFIG.versionFile)).toBe(readVersion(REPO_CONFIG));
  });
});

describe('commun de la maquette', () => {
  test('sans commun dans le projet : repris de la maquette', () => {
    const config = loadPagesConfig(writeConfig({ 'guide-x': VALID['guide-x'] }), MAQUETTE);
    expect(commonEntry(config)).toEqual(MAQUETTE.commun);
  });

  test('une clé du projet l’emporte sur celle de la maquette', () => {
    const config = loadPagesConfig(writeConfig({ commun: { pied: 'Pied projet' }, 'guide-x': VALID['guide-x'] }), MAQUETTE);
    expect(commonEntry(config).pied).toBe('Pied projet');
    expect(commonEntry(config).mentions).toEqual(MAQUETTE.commun.mentions);
  });

  test('miseAJour du projet : ajoutée à la dernière mention', () => {
    const config = loadPagesConfig(writeConfig({ commun: { miseAJour: '1 janvier 2027' }, 'guide-x': VALID['guide-x'] }), MAQUETTE);
    const mentions = commonEntry(config).mentions;
    expect(mentions[mentions.length - 1]).toBe(`${MAQUETTE.commun.mentions[mentions.length - 1]} · ${MAQUETTE.textes.miseAJour} 1 janvier 2027`);
  });
});
