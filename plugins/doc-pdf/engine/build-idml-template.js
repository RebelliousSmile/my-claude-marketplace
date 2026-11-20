#!/usr/bin/env node
/**
 * Génère un modèle IDML qui charge dans InDesign la charte « Scriptami — Charte de
 * mise en page des documentations PDF » : styles (paragraphe, caractère, tableau,
 * cellule, objet), nuances RVB, document A4 en vis-à-vis aux marges de la grille avec
 * 3 mm de fond perdu, et, avec --gabarits, les quatre gabarits de la charte :
 * A-Courante, B-Chapitre, C-Couverture, D-Fin.
 *
 *   node <racine du plugin>/engine/cli.js idml                       output/idml/scriptami-turquoise.idml
 *   node <racine du plugin>/engine/cli.js idml --axe orange          couleur d'axe : turquoise | orange | vert
 *   node <racine du plugin>/engine/cli.js idml --gabarits            + gabarits A à D (pages courantes, ouverture, couverture, fin)
 *   node <racine du plugin>/engine/cli.js idml --police-puce <nom>   police du triangle ▶ des puces (défaut : Segoe UI Symbol)
 *   node <racine du plugin>/engine/cli.js idml --sortie <dossier>    dossier de sortie (défaut : <outputDir>/idml de la configuration)
 *   node <racine du plugin>/engine/cli.js idml --guide <id>          gabarits remplis pour un guide de documentation.config.json
 *                                                                    (titre, verbe, type, accent) ; --config <chemin> désigne la configuration
 *
 * Les noms des styles du jeu court viennent de STYLE_TABLE (icml-transform.js) : le
 * modèle et les ICML exportés partagent leurs noms, InDesign n'a donc aucun doublon à
 * créer. Les mises en forme sont celles de la charte (section « Feuille de styles »).
 */

const fs = require('fs');
const path = require('path');
const { STYLE_TABLE } = require('./icml-transform');
const { writeZip } = require('./zip-store');
const { PagesError, guidePages, mentionLines } = require('./icml-pages');
const { ConfigError, DEFAULT_TYPE, loadConfig, extractConfigArg, findGuide, readVersion } = require('./guide-config');
const { pictoGradients, wordmarkShapes, pictoFacets } = require('./logo-scriptami');

/** Sous-dossier de la sortie du projet (`<outputDir>/idml`) ; sans configuration, `output/idml` sous le dossier courant. */
const IDML_DIR = 'idml';
const DOM_VERSION = '8.0';
const NS = 'xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"';
const MIMETYPE = 'application/vnd.adobe.indesign-idml-package';

/** Erreur attendue : son message suffit à l'utilisateur. */
class IdmlError extends Error {}

const mm = value => Math.round(value * 72 / 25.4 * 10000) / 10000;

/** Grille de la charte (mm). Largeur totale : 20,6 + 130,7 + 6,3 + 39,7 + 12,7 = 210. */
const PAGE = { width: mm(210), height: mm(297), bleed: mm(3) };
const MARGINS = { top: mm(12.7), bottom: mm(12.7), inner: mm(20.6), outer: mm(12.7) };
const COLUMNS = { text: mm(130.7), gutter: mm(6.3), margin: mm(39.7) };

/** Nuancier de la charte, en RVB. */
const COLORS = Object.freeze({
  'Turquoise vif': [52, 184, 154],
  'Turquoise texte': [27, 122, 101],
  'Turquoise fond': [227, 243, 238],
  'Orange vif': [232, 155, 60],
  'Orange texte': [165, 87, 21],
  'Orange fond': [251, 236, 216],
  'Vert vif': [144, 196, 114],
  'Vert texte': [78, 118, 56],
  'Vert fond': [234, 242, 224],
  'Anthracite foncé': [42, 42, 44],
  'Anthracite': [58, 58, 60],
  'Papier chaud': [243, 238, 226],
  // « Papier » seul serait confondu avec la nuance native de même nom.
  'Papier de page': [251, 248, 241],
  // Fond de l'encadré « Attention » (hors des trois tons d'axe).
  'Attention fond': [253, 243, 231]
});

/** Trois tons par axe : la nuance « Axe … » prend les valeurs de l'axe choisi. */
const AXES = Object.freeze({ turquoise: 'Turquoise', orange: 'Orange', vert: 'Vert' });
const AXIS_TONES = Object.freeze({ 'Axe vif': 'vif', 'Axe texte': 'texte', 'Axe fond': 'fond' });
const DEFAULT_AXIS = 'turquoise';

const NONE_SWATCH = 'Swatch/None';

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Identifiant de style ou de nuance, encodé comme le fait InDesign (%20, %C3%A9…). */
const ref = (prefix, name) => `${prefix}/${encodeURIComponent(name).replace(/%24ID/g, '$ID')}`;
const nativeRef = (prefix, name) => `${prefix}/$ID/${name}`;
const colorRef = name => ref('Color', name);

const NO_PARAGRAPH = nativeRef('ParagraphStyle', '[No paragraph style]');
const NO_CHARACTER = nativeRef('CharacterStyle', '[No character style]');
const NO_TABLE = nativeRef('TableStyle', '[No table style]');
const NO_CELL = nativeRef('CellStyle', '[None]');
const NO_OBJECT = nativeRef('ObjectStyle', '[None]');

const QUICKSAND = 'Quicksand';
const PROZA = 'Proza Libre';
const MONO = 'JetBrains Mono';
// Ni Quicksand ni Proza Libre n'ont le triangle ▶ : sans police qui le porte, InDesign affiche un carré.
const DEFAULT_BULLET_FONT = 'Segoe UI Symbol';
const DARK = 'Anthracite foncé';
const TEXT = 'Anthracite';
const BULLET_CODE = 9654; // ▶

/**
 * Mise en forme de la charte, par famille et par nom de style. Sert aussi aux sept
 * styles de la charte que les ICML n'emploient pas (couverture, numéro de chapitre,
 * surtitre, chapeau, légende, titre courant, folio) et aux styles d'appui de leurs
 * listes. `attrs` : attributs IDML bruts. Les STYLE_TABLE.attributes (retraits de
 * liste…) complètent ce qui n'y figure pas.
 */
/** Filet de 1,5 pt au-dessus d'un paragraphe, sur la largeur de la colonne. */
const ruleAbove = color => ({
  RuleAboveOn: 'true', RuleAboveColor: colorRef(color), RuleAboveLineWeight: '1.5',
  RuleAboveOffset: '0', RuleAboveWidth: 'ColumnWidth'
});

/** Retraits qui laissent le fond d'un encadré déborder le texte. */
const boxInsets = () => ({ LeftIndent: '8', RightIndent: '8' });

/** Filet sous un paragraphe, sur la largeur du cadre ; `offset` compté depuis la ligne de base. */
const ruleBelow = (color, weight, offset) => ({
  RuleBelowOn: 'true', RuleBelowColor: colorRef(color), RuleBelowLineWeight: String(weight),
  RuleBelowOffset: String(offset), RuleBelowWidth: 'ColumnWidth'
});

/** Largeur du cadre de la page de sommaire : la page moins ses deux marges. */
const SUMMARY_WIDTH = PAGE.width - MARGINS.inner - MARGINS.outer;
const SUMMARY_NUMBER_TAB = 44;

const FORMATS = Object.freeze({
  paragraph: {
    'Titre-couverture': { font: QUICKSAND, fontStyle: 'Bold', size: 45, leading: 45, tracking: -25, fill: DARK, hyphenate: false },
    'Titre-chapitre': { font: QUICKSAND, fontStyle: 'Bold', size: 34, leading: 36, tracking: -15, fill: DARK, hyphenate: false, keepNext: true,
      // Filet d'axe sous le titre, sur la largeur de la colonne.
      attrs: {
        RuleBelowOn: 'true', RuleBelowColor: colorRef('Axe vif'), RuleBelowLineWeight: '3',
        RuleBelowOffset: '10', RuleBelowWidth: 'ColumnWidth', SpaceAfter: '14'
      }
    },
    'Numéro-chapitre': { font: QUICKSAND, fontStyle: 'Bold', size: 150, leading: 120, skew: 12, fill: 'Axe vif', hyphenate: false },
    'Intertitre-1': { font: QUICKSAND, fontStyle: 'Bold', size: 22.5, leading: 25, tracking: -10, fill: DARK, hyphenate: false, keepNext: true, keepLines: true,
      attrs: { SpaceBefore: '20', SpaceAfter: '8' } },
    'Intertitre-2': {
      font: QUICKSAND, fontStyle: 'Bold', size: 15, leading: 18, fill: 'Axe texte', hyphenate: false, keepNext: true, keepLines: true,
      bullet: { char: BULLET_CODE, style: 'Puce' },
      attrs: { LeftIndent: '16', FirstLineIndent: '-16', SpaceBefore: '12', SpaceAfter: '5' }
    },
    'Surtitre': { font: QUICKSAND, fontStyle: 'Bold', size: 9, leading: 12, caps: true, tracking: 120, fill: 'Axe texte', hyphenate: false },
    'Chapeau': { font: PROZA, fontStyle: 'Regular', size: 13.5, leading: 20, fill: TEXT, attrs: { SpaceAfter: '14' } },
    // Sommaire général du guide (page de couverture) : libellé « Sommaire » puis une « Sommaire-ligne » par chapitre.
    'Sommaire-général': { font: QUICKSAND, fontStyle: 'Bold', size: 9, leading: 12, caps: true, tracking: 120, fill: 'Axe texte', hyphenate: false, keepNext: true,
      attrs: { ...ruleAbove(TEXT), SpaceBefore: '16', SpaceAfter: '6' } },
    // Sommaire partiel, propre à un chapitre : bloc « Dans ce chapitre », entre deux filets, une ligne par section.
    'Sommaire-titre': { font: QUICKSAND, fontStyle: 'Bold', size: 9, leading: 12, caps: true, tracking: 120, fill: 'Axe texte', hyphenate: false, keepNext: true,
      attrs: { ...ruleAbove(TEXT), SpaceBefore: '16', SpaceAfter: '6' } },
    'Sommaire-ligne': { font: PROZA, fontStyle: 'Regular', size: 11, leading: 17, fill: TEXT, hyphenate: false,
      attrs: { LeftIndent: '30', FirstLineIndent: '-30', SpaceAfter: '1' } },
    // Page de sommaire : une ligne par chapitre (numéro, tabulation, titre, tabulation à droite, page), filet fin dessous.
    'Sommaire-chapitre': { font: QUICKSAND, fontStyle: 'Bold', size: 11.5, leading: 30, fill: DARK, hyphenate: false,
      tabs: [{ align: 'LeftAlign', position: SUMMARY_NUMBER_TAB }, { align: 'RightAlign', position: SUMMARY_WIDTH }],
      attrs: ruleBelow(TEXT, 0.5, 9) },
    // Bloc « Dans ce chapitre » de l'ouverture de chapitre : une ligne par section (numéro, titre, page), filet fin dessous.
    'Sommaire-section': { font: QUICKSAND, fontStyle: 'Bold', size: 11, leading: 35, fill: DARK, hyphenate: false,
      tabs: [{ align: 'LeftAlign', position: 36 }, { align: 'RightAlign', position: 388 }],
      attrs: ruleBelow(TEXT, 0.5, 10) },
    // Numéro de section (N.M), à poser dans la colonne marginale en regard de l'intertitre.
    'Numéro-section': { font: QUICKSAND, fontStyle: 'Bold', size: 33, leading: 36, skew: 12, fill: 'Axe vif', hyphenate: false, keepNext: true,
      attrs: { SpaceBefore: '20' } },
    'Courant': {
      font: PROZA, fontStyle: 'Regular', size: 12, leading: 19, fill: TEXT, hyphenate: true,
      attrs: { Justification: 'LeftAlign', SpaceAfter: '7' }
    },
    // Encadrés : filet de 1,5 pt en tête, fond et retraits qui figurent le cadre ; la barre latérale se pose à la main.
    'Encadré-info': { font: PROZA, fontStyle: 'Regular', size: 11, leading: 17, fill: TEXT, hyphenate: false, shading: 'Paper',
      attrs: { ...ruleAbove('Axe vif'), ...boxInsets(), SpaceBefore: '10', SpaceAfter: '10' } },
    'Encadré-attention': { font: PROZA, fontStyle: 'Regular', size: 11, leading: 17, fill: TEXT, hyphenate: false, shading: 'Attention fond',
      attrs: { ...ruleAbove('Orange vif'), ...boxInsets(), SpaceBefore: '10', SpaceAfter: '10' } },
    'Encadré-retenir': { font: PROZA, fontStyle: 'Regular', size: 11, leading: 17, fill: TEXT, hyphenate: false, shading: 'Papier chaud',
      attrs: { ...ruleAbove(TEXT), ...boxInsets(), SpaceBefore: '10', SpaceAfter: '10' } },
    'Note-renvoi': { font: PROZA, fontStyle: 'Regular', size: 10.5, leading: 16, fill: TEXT, hyphenate: false,
      attrs: { ...ruleAbove('Axe vif'), SpaceBefore: '8', SpaceAfter: '8' } },
    'Liste-num': { font: PROZA, fontStyle: 'Regular', size: 12, leading: 18.5, fill: TEXT, numbering: { style: 'Numéro-liste' }, attrs: { SpaceAfter: '3' } },
    'Liste-num-suite': { font: PROZA, fontStyle: 'Regular', size: 12, leading: 18.5, fill: TEXT, attrs: { SpaceAfter: '3' } },
    'Liste-puce': { font: PROZA, fontStyle: 'Regular', size: 12, leading: 18.5, fill: TEXT, bullet: { char: BULLET_CODE, style: 'Puce' }, attrs: { SpaceAfter: '3' } },
    'Liste-puce-2': { font: PROZA, fontStyle: 'Regular', size: 12, leading: 18.5, fill: TEXT, bullet: { char: BULLET_CODE, style: 'Puce' }, attrs: { SpaceAfter: '3' } },
    // Hors charte : tableaux et captures, calés sur le corps du texte courant.
    'Tableau texte': { font: PROZA, fontStyle: 'Regular', size: 10, leading: 14, fill: TEXT },
    // Pastille « type de document » de la couverture : Surtitre en 8 pt anthracite, centré.
    'Type-document': { font: QUICKSAND, fontStyle: 'Bold', size: 8, leading: 12, caps: true, tracking: 120, fill: DARK, hyphenate: false,
      attrs: { Justification: 'CenterAlign' } },
    'Carte-valeur': { font: QUICKSAND, fontStyle: 'Bold', size: 10, leading: 14, fill: DARK, hyphenate: false },
    'Tableau en-tête': { font: QUICKSAND, fontStyle: 'Bold', size: 10, leading: 14, fill: DARK, hyphenate: false },
    'Capture': { font: PROZA, fontStyle: 'Regular', size: 12, leading: 'Auto', fill: TEXT, attrs: { SpaceBefore: '7', SpaceAfter: '7' } },
    'Légende': { font: QUICKSAND, fontStyle: 'Medium', size: 9, leading: 13.5, fill: TEXT },
    'Code': { font: MONO, fontStyle: 'Regular', size: 10, leading: 15, fill: TEXT, hyphenate: false, shading: 'Papier chaud' },
    'Titre-courant': { font: QUICKSAND, fontStyle: 'Bold', size: 9, leading: 12, caps: true, tracking: 100, fill: DARK, hyphenate: false },
    // Bandeau orange de la page de fin : mêmes corps que Intertitre-1 et Courant, couleur du papier ('Paper').
    'Bandeau-titre': { font: QUICKSAND, fontStyle: 'Bold', size: 22.5, leading: 25, tracking: -10, fill: 'Paper', hyphenate: false, keepNext: true,
      attrs: { SpaceAfter: '8' } },
    'Bandeau-texte': { font: PROZA, fontStyle: 'Regular', size: 12, leading: 19, fill: 'Paper', hyphenate: false },
    // Pied anthracite de la page de fin : couleur du papier.
    'Mentions-marque': { font: QUICKSAND, fontStyle: 'Bold', size: 16, leading: 21, fill: 'Paper', hyphenate: false, attrs: { SpaceAfter: '10' } },
    'Mentions': { font: QUICKSAND, fontStyle: 'Medium', size: 9, leading: 13.5, fill: 'Paper', hyphenate: false },
    // Numéro de chapitre de l'en-tête : même corps que Titre-courant, couleur d'accent.
    'En-tête-chapitre': { font: QUICKSAND, fontStyle: 'Bold', size: 9, leading: 12, caps: true, tracking: 100, fill: 'Axe texte', hyphenate: false },
    'Folio': { font: QUICKSAND, fontStyle: 'Bold', size: 11, leading: 12, caps: true, tracking: 100, fill: DARK, hyphenate: false }
  },
  character: {
    // Le gras et l'italique gardent la police du texte qu'ils habillent.
    'Gras': { fontStyle: 'Bold' },
    'Italique': { fontStyle: 'Italic' },
    'Code-inline': { font: MONO, fontStyle: 'Regular', size: 10.5 },
    'Renvoi': { fill: 'Axe texte' },
    // Mot mis en valeur d'un titre (écrit *mot* en Markdown) : penché de 12°.
    'Accent': { font: QUICKSAND, fontStyle: 'SemiBold', skew: 12, fill: 'Axe texte' },
    'Encadré-libellé': { font: QUICKSAND, fontStyle: 'Bold', caps: true, tracking: 80, fill: 'Axe texte' },
    'Légende-numéro': { font: QUICKSAND, fontStyle: 'Bold' },
    'Sommaire-numéro': { font: QUICKSAND, fontStyle: 'Bold', size: 17, skew: 12, fill: 'Axe texte' },
    'Sommaire-page': { font: QUICKSAND, fontStyle: 'Medium', size: 8, fill: TEXT },
    'Puce': { font: DEFAULT_BULLET_FONT, fontStyle: 'Regular', fill: 'Axe vif' },
    'Numéro-liste': { font: QUICKSAND, fontStyle: 'Bold', fill: 'Axe vif' }
  },
  table: {
    'Tableau': {
      attrs: {
        TopBorderStrokeWeight: '1.5', TopBorderStrokeColor: colorRef(TEXT),
        BottomBorderStrokeWeight: '1.5', BottomBorderStrokeColor: colorRef(TEXT),
        // Sans ces valeurs, InDesign trace le contour noir de 1 pt de ses réglages par défaut.
        LeftBorderStrokeWeight: '0', RightBorderStrokeWeight: '0',
        AlternatingFillsType: 'AlternatingRows',
        StartRowFillColor: NONE_SWATCH, StartRowFillCount: '1',
        EndRowFillColor: colorRef('Papier chaud'), EndRowFillCount: '1'
      }
    }
  },
  cell: {
    'Cellule': {
      attrs: {
        AppliedParagraphStyle: ref('ParagraphStyle', 'Tableau texte'),
        TopInset: '3', BottomInset: '3', LeftInset: '5', RightInset: '5',
        // Filets horizontaux fins entre les lignes, aucun filet vertical ; l'IDML ne porte pas les pointillés.
        TopEdgeStrokeWeight: '0.5', TopEdgeStrokeColor: colorRef('Axe vif'),
        BottomEdgeStrokeWeight: '0.5', BottomEdgeStrokeColor: colorRef('Axe vif'),
        LeftEdgeStrokeWeight: '0', RightEdgeStrokeWeight: '0'
      }
    }
  },
  object: {
    'Capture': {
      attrs: {
        FillColor: NONE_SWATCH, EnableFill: 'true',
        StrokeColor: colorRef(TEXT), StrokeWeight: '1.5', EnableStrokeAndCornerOptions: 'true'
      }
    }
  }
});

/** Styles de la charte absents de STYLE_TABLE, déclarés quand même. */
const CHARTER_ONLY = Object.freeze({
  paragraph: ['Titre-couverture', 'Légende', 'Code', 'Titre-courant', 'Folio'],
  character: ['Légende-numéro', 'Numéro-liste'],
  table: [],
  cell: [],
  object: []
});

const FAMILY_REFS = Object.freeze({
  paragraph: { prefix: 'ParagraphStyle', element: 'ParagraphStyle', root: 'RootParagraphStyleGroup', none: NO_PARAGRAPH },
  character: { prefix: 'CharacterStyle', element: 'CharacterStyle', root: 'RootCharacterStyleGroup', none: NO_CHARACTER },
  table: { prefix: 'TableStyle', element: 'TableStyle', root: 'RootTableStyleGroup', none: NO_TABLE },
  cell: { prefix: 'CellStyle', element: 'CellStyle', root: 'RootCellStyleGroup', none: NO_CELL },
  object: { prefix: 'ObjectStyle', element: 'ObjectStyle', root: 'RootObjectStyleGroup', none: NO_OBJECT }
});

function renderAttributes(attributes) {
  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => ` ${key}="${escapeXml(value)}"`)
    .join('');
}

function renderProperties(properties) {
  const lines = properties.filter(Boolean);
  return lines.length === 0 ? '' : `\n        <Properties>\n${lines.map(line => `          ${line}`).join('\n')}\n        </Properties>\n      `;
}

/** Définition d'un style : STYLE_TABLE complète la mise en forme de la charte. */
function renderStyle(family, name, tableAttributes, bulletFont) {
  const defined = FORMATS[family][name];
  const format = defined && family === 'character' && name === 'Puce' ? { ...defined, font: bulletFont } : defined;
  if (!format) {
    throw new IdmlError(`Le style ${family} « ${name} » n'a pas de mise en forme dans la charte : l'ajouter à FORMATS (engine/build-idml-template.js).`);
  }
  const { prefix, element, none } = FAMILY_REFS[family];
  const attributes = {
    Self: ref(prefix, name),
    Imported: 'false',
    KeyboardShortcut: '0 0',
    Name: name,
    ...tableAttributes
  };
  const properties = [];

  if (family === 'paragraph' || family === 'character') {
    if (format.fontStyle) attributes.FontStyle = format.fontStyle;
    if (format.size) attributes.PointSize = String(format.size);
    if (format.tracking !== undefined) attributes.Tracking = String(format.tracking);
    if (format.skew) attributes.Skew = String(format.skew);
    if (format.caps) attributes.Capitalization = 'AllCaps';
    if (format.fill) attributes.FillColor = colorRef(format.fill);
    properties.push(`<BasedOn type="object">${none}</BasedOn>`);
    if (format.font) properties.push(`<AppliedFont type="string">${escapeXml(format.font)}</AppliedFont>`);
  }
  if (family === 'paragraph') {
    attributes.NextStyle = ref(prefix, name);
    if (format.leading !== undefined) {
      properties.push(format.leading === 'Auto'
        ? '<Leading type="enumeration">Auto</Leading>'
        : `<Leading type="unit">${format.leading}</Leading>`);
    }
    if (format.hyphenate !== undefined) attributes.Hyphenation = String(format.hyphenate);
    if (format.hyphenate) properties.push('<AppliedLanguage type="string">$ID/French</AppliedLanguage>');
    if (format.keepNext) attributes.KeepWithNext = '1';
    if (format.keepLines) attributes.KeepLinesTogether = 'true';
    if (format.tabs) {
      const stops = format.tabs.map(({ align, position }) =>
        `<ListItem type="record"><Alignment type="enumeration">${align}</Alignment><AlignmentCharacter type="string"></AlignmentCharacter><Leader type="string"></Leader><Position type="unit">${position}</Position></ListItem>`);
      properties.push(`<TabList type="list">${stops.join('')}</TabList>`);
    }
    if (format.shading) {
      attributes.ParagraphShadingOn = 'true';
      attributes.ParagraphShadingColor = colorRef(format.shading);
    }
    if (format.bullet) {
      attributes.BulletsAndNumberingListType = 'BulletList';
      properties.push(`<BulletChar BulletCharacterType="UnicodeOnly" BulletCharacterValue="${format.bullet.char}"/>`);
      properties.push(`<BulletsCharacterStyle type="object">${ref('CharacterStyle', format.bullet.style)}</BulletsCharacterStyle>`);
    }
    if (format.numbering) {
      attributes.BulletsAndNumberingListType = 'NumberedList';
      properties.push('<NumberingFormat type="string">1, 2, 3, 4...</NumberingFormat>');
      properties.push(`<NumberingCharacterStyle type="object">${ref('CharacterStyle', format.numbering.style)}</NumberingCharacterStyle>`);
    }
  }
  if (family === 'table' || family === 'cell' || family === 'object') {
    properties.push(`<BasedOn type="object">${none}</BasedOn>`);
  }

  // STYLE_TABLE (retraits des listes…) est posé plus haut ; la charte l'emporte sur ses tailles provisoires d'ICML.
  Object.assign(attributes, format.attrs);
  const open = `      <${element}${renderAttributes(attributes)}>`;
  return `${open}${renderProperties(properties)}</${element}>`;
}

/** Entrées de style d'une famille : STYLE_TABLE d'abord, puis les styles propres à la charte. */
function styleEntries(family) {
  const fromTable = STYLE_TABLE[family].map(entry => ({ name: entry.name, attributes: entry.attributes }));
  const known = new Set(fromTable.map(entry => entry.name));
  const extra = CHARTER_ONLY[family].filter(name => !known.has(name)).map(name => ({ name, attributes: {} }));
  return [...fromTable, ...extra];
}

function stylesXml(bulletFont) {
  const groups = Object.entries(FAMILY_REFS).map(([family, { prefix, element, root, none }]) => {
    const natives = [`      <${element} Self="${none}" Imported="false" KeyboardShortcut="0 0" Name="${none.slice(prefix.length + 1)}"/>`];
    if (family === 'paragraph') {
      natives.push(`      <ParagraphStyle Self="${nativeRef('ParagraphStyle', 'NormalParagraphStyle')}" Imported="false" KeyboardShortcut="0 0" Name="$ID/NormalParagraphStyle" NextStyle="${nativeRef('ParagraphStyle', 'NormalParagraphStyle')}"/>`);
    }
    const defined = styleEntries(family).map(({ name, attributes }) => renderStyle(family, name, attributes, bulletFont));
    return `  <${root} Self="${root}">\n${[...natives, ...defined].join('\n')}\n  </${root}>`;
  });
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<idPkg:Styles ${NS} DOMVersion="${DOM_VERSION}">\n${groups.join('\n')}\n</idPkg:Styles>\n`;
}

function graphicXml(axis) {
  if (!AXES[axis]) throw new IdmlError(`Axe inconnu : ${axis}. Valeurs acceptées : ${Object.keys(AXES).join(', ')}.`);
  const axisColors = Object.fromEntries(Object.entries(AXIS_TONES).map(([name, tone]) => [name, COLORS[`${AXES[axis]} ${tone}`]]));
  const swatch = (name, [r, g, b]) =>
    `  <Color Self="${colorRef(name)}" Model="Process" Space="RGB" ColorValue="${r} ${g} ${b}" ColorOverride="Normal" AlternateSpace="NoAlternateColor" AlternateColorValue="" Name="${escapeXml(name)}" ColorEditable="true" ColorRemovable="true" Visible="true" SwatchCreatorID="7937"/>`;
  const lines = [
    '  <Color Self="Color/Black" Model="Process" Space="CMYK" ColorValue="0 0 0 100" ColorOverride="Specialblack" AlternateSpace="NoAlternateColor" AlternateColorValue="" Name="Black" ColorEditable="false" ColorRemovable="false" Visible="true" SwatchCreatorID="7937"/>',
    '  <Color Self="Color/Paper" Model="Process" Space="CMYK" ColorValue="0 0 0 0" ColorOverride="Specialpaper" AlternateSpace="NoAlternateColor" AlternateColorValue="" Name="Paper" ColorEditable="true" ColorRemovable="false" Visible="true" SwatchCreatorID="7937"/>',
    '  <Color Self="Color/Registration" Model="Registration" Space="CMYK" ColorValue="100 100 100 100" ColorOverride="Specialregistration" AlternateSpace="NoAlternateColor" AlternateColorValue="" Name="Registration" ColorEditable="false" ColorRemovable="false" Visible="true" SwatchCreatorID="7937"/>',
    `  <Swatch Self="${NONE_SWATCH}" Name="None" ColorEditable="false" ColorRemovable="false" Visible="true" SwatchCreatorID="7937"/>`,
    ...Object.entries(COLORS).map(([name, rgb]) => swatch(name, rgb)),
    ...Object.entries(axisColors).map(([name, rgb]) => swatch(name, rgb)),
    ...pictoGradients().flatMap(({ name, stops }) => [
      ...stops.map(({ rgb }, index) => swatch(`${name} ${String(index + 1).padStart(2, '0')}`, rgb)),
      `  <Gradient Self="${ref('Gradient', name)}" Type="Linear" Name="${escapeXml(name)}" ColorEditable="true" ColorRemovable="true" Visible="true" SwatchCreatorID="7937">\n${stops.map(({ offset }, index) =>
        `    <GradientStop Self="${ref('GradientStop', `${name} ${index + 1}`)}" StopColor="${colorRef(`${name} ${String(index + 1).padStart(2, '0')}`)}" Location="${Math.round(offset * 10000) / 100}"/>`).join('\n')}\n  </Gradient>`
    ])
  ];
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<idPkg:Graphic ${NS} DOMVersion="${DOM_VERSION}">\n${lines.join('\n')}\n</idPkg:Graphic>\n`;
}

function preferencesXml() {
  const bleed = PAGE.bleed;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Preferences ${NS} DOMVersion="${DOM_VERSION}">
  <DocumentPreference PageHeight="${PAGE.height}" PageWidth="${PAGE.width}" PagesPerDocument="1" FacingPages="true" DocumentBleedTopOffset="${bleed}" DocumentBleedBottomOffset="${bleed}" DocumentBleedInsideOrLeftOffset="${bleed}" DocumentBleedOutsideOrRightOffset="${bleed}" DocumentBleedUniformSize="true" SlugTopOffset="0" SlugBottomOffset="0" SlugInsideOrLeftOffset="0" SlugRightOrOutsideOffset="0"/>
  <MarginPreference ColumnCount="1" ColumnGutter="${COLUMNS.gutter}" Top="${MARGINS.top}" Bottom="${MARGINS.bottom}" Left="${MARGINS.inner}" Right="${MARGINS.outer}" ColumnDirection="Horizontal"/>
  <ViewPreference HorizontalMeasurementUnits="Millimeters" VerticalMeasurementUnits="Millimeters" RulerOrigin="SpreadOrigin"/>
</idPkg:Preferences>
`;
}

/** Colonnes inégales (texte | gouttière | marginale) ; la marginale est côté extérieur. */
function columnsPositions(side) {
  const { text, gutter, margin } = COLUMNS;
  return side === 'left'
    ? `0 ${margin} ${margin + gutter} ${margin + gutter + text}`
    : `0 ${text} ${text + gutter} ${text + gutter + margin}`;
}

function pageMargins(side) {
  // InDesign lit « Left » comme marge intérieure et « Right » comme marge extérieure sur toutes les pages en vis-à-vis.
  return `<MarginPreference ColumnCount="2" ColumnGutter="${COLUMNS.gutter}" Top="${MARGINS.top}" Bottom="${MARGINS.bottom}" Left="${MARGINS.inner}" Right="${MARGINS.outer}" ColumnDirection="Horizontal" ColumnsPositions="${columnsPositions(side)}"/>`;
}

const LAYER_SELF = 'Layer/Calque1';
const HEADER_TOP = 14;
const HEADER_HEIGHT = 16;
const RULE_Y = 34;
const DASH_LENGTH = 1.5; // pointillé de pliage : trait
const DASH_GAP = 1.5; // pointillé de pliage : blanc
const RULE_WEIGHT = 0.75; // pointillé du titre courant et pointillé de pliage : même épaisseur
const FOOTER_HEIGHT = 16;
// Un seul texte de pied pour tous les gabarits (celui de `common/pied.icml` quand un guide est choisi), un seul style, une seule largeur.
const FOOTER_TEXT = 'François-Xavier Guillois · scriptami';
const FOOTER_WIDTH = 300;
const CORNER = mm(17); // coin plié des pages courantes
const FOLIO_WIDTH = 30; // largeur du cadre du folio, centré dans le rabat du coin
const FOOTER_BAND = mm(66); // pied anthracite de la dernière page
const PAPER = 'Paper';
const ORANGE = 'Orange vif';

/** Les quatre gabarits de la charte : A pages courantes (double), B ouverture, C couverture, D fin. */
const MASTERS = Object.freeze([
  { name: 'A-Courante', prefix: 'A', base: 'Courante', pages: 2 },
  { name: 'B-Chapitre', prefix: 'B', base: 'Chapitre', pages: 1 },
  { name: 'C-Couverture', prefix: 'C', base: 'Couverture', pages: 1 },
  { name: 'D-Fin', prefix: 'D', base: 'Fin', pages: 1 }
]);
const masterSelf = name => `Master_${name}`;

/** Variables de texte des titres courants : titre du document, version, chapitre. */
const TEXT_VARIABLES = Object.freeze([
  { name: 'Titre du document', type: 'CustomTextType', contents: 'Titre du document' },
  { name: 'Version', type: 'CustomTextType', contents: 'v1.0' },
  { name: 'Chapitre', type: 'CustomTextType', contents: 'Chapitre 00' },
  { name: 'Titre du chapitre', type: 'MatchParagraphStyleType', style: 'Titre-chapitre' }
]);

function variableXml({ name, type, contents, style }) {
  const inner = type === 'CustomTextType'
    ? `<CustomTextVariablePreference Contents="${escapeXml(contents)}"/>`
    : `<MatchParagraphStylePreference SearchStrategy="FirstOnPage" ChangeCase="None" DeleteEndPunctuation="false" AppliedParagraphStyle="${ref('ParagraphStyle', style)}" TextBefore="" TextAfter=""/>`;
  return `  <TextVariable Self="${ref('TextVariable', name)}" Name="${escapeXml(name)}" VariableType="${type}">\n    ${inner}\n  </TextVariable>`;
}

function variableInstance(selfId, name) {
  const variable = TEXT_VARIABLES.find(entry => entry.name === name);
  const result = variable.contents || variable.name;
  return `<TextVariableInstance Self="${selfId}" Name="${escapeXml(name)}" ResultText="${escapeXml(result)}" AssociatedTextVariable="${ref('TextVariable', name)}"/>`;
}

/**
 * Paragraphe d'une histoire de gabarit. `parts` : « text », « variable » ou « folio » ;
 * un « text » peut porter `character` (style de caractère appliqué à cette seule plage).
 */
const para = (style, parts, options = {}) => ({ style, parts, ...options });

/**
 * Histoire (contenu d'un bloc de texte), un ou plusieurs paragraphes.
 * Options d'un paragraphe : `fill` (nuance de la plage), `size` (corps local), `justification`,
 * `attrs` (attributs IDML locaux du paragraphe : filets, espacements).
 */
function storyXml(self, paragraphs) {
  const ranges = paragraphs.map((paragraph, p) => {
    const last = paragraph.parts.length - 1;
    const styled = paragraph.parts.map((part, index) => {
      let content;
      if (part.text !== undefined) content = `<Content>${escapeXml(part.text)}</Content>`;
      else if (part.folio) content = '<Content><?ACE 18?></Content>';
      else content = variableInstance(`${self}_p${p}v${index}`, part.variable);
      // Le saut de paragraphe termine la dernière plage.
      if (index === last && p < paragraphs.length - 1) content += '\n        <Br/>';
      const applied = part.character ? ref('CharacterStyle', part.character) : NO_CHARACTER;
      // Un style de caractère nommé porte sa propre mise en forme : pas de nuance ni de corps locaux.
      const local = part.character
        ? ''
        : `${paragraph.fill ? ` FillColor="${colorRef(paragraph.fill)}"` : ''}${paragraph.size ? ` PointSize="${paragraph.size}"` : ''}`;
      return `      <CharacterStyleRange AppliedCharacterStyle="${applied}"${local}>
        ${content}
      </CharacterStyleRange>`;
    });
    const attributes = `AppliedParagraphStyle="${ref('ParagraphStyle', paragraph.style)}"${paragraph.justification ? ` Justification="${paragraph.justification}"` : ''}${renderAttributes(paragraph.attrs || {})}`;
    return `    <ParagraphStyleRange ${attributes}>
${styled.join('\n')}
    </ParagraphStyleRange>`;
  });
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Story ${NS} DOMVersion="${DOM_VERSION}">
  <Story Self="${self}" AppliedTOCStyle="n" TrackChanges="false" StoryTitle="$ID/" AppliedNamedGrid="n">
    <StoryPreference OpticalMarginAlignment="false" OpticalMarginSize="12" FrameType="TextFrameType" StoryOrientation="Horizontal" StoryDirection="LeftToRightDirection"/>
    <InCopyExportOption IncludeGraphicProxies="true" IncludeAllResources="false"/>
${ranges.join('\n')}
  </Story>
</idPkg:Story>
`;
}

/** Géométrie IDML d'un chemin ; `points` : [[x, y], …] dans le repère du dos. */
function pathGeometry(points, open = false) {
  const point = ([x, y]) => `<PathPointType Anchor="${x} ${y}" LeftDirection="${x} ${y}" RightDirection="${x} ${y}"/>`;
  return `<Properties><PathGeometry><GeometryPathType PathOpen="${open}"><PathPointArray>${points.map(point).join('')}</PathPointArray></GeometryPathType></PathGeometry></Properties>`;
}

/** Tracé composé de segments ouverts : un `GeometryPathType` par segment `[[x1, y1], [x2, y2]]`. */
function segmentsGeometry(segments) {
  const point = ([x, y]) => `<PathPointType Anchor="${x} ${y}" LeftDirection="${x} ${y}" RightDirection="${x} ${y}"/>`;
  const paths = segments.map(points => `<GeometryPathType PathOpen="true"><PathPointArray>${points.map(point).join('')}</PathPointArray></GeometryPathType>`);
  return `<Properties><PathGeometry>${paths.join('')}</PathGeometry></Properties>`;
}

const boxPoints = ({ left, top, right, bottom }) => [[left, top], [left, bottom], [right, bottom], [right, top]];
const NO_STROKE = `StrokeColor="${NONE_SWATCH}" StrokeWeight="0"`;

/**
 * Constructeur d'un gabarit. Les abscisses sont celles du dos (x = 0 à la reliure) ;
 * les ordonnées sont comptées depuis le haut de la page (0 à la hauteur), converties
 * ici dans le repère du dos (y = 0 à mi-hauteur). L'ordre d'ajout est l'ordre d'empilement.
 */
function masterBuilder(name) {
  const half = PAGE.height / 2;
  const stories = [];
  const items = [];
  const guides = [];
  const toSpread = ([x, y]) => [x, y - half];
  const box = b => ({ left: b.left, right: b.right, top: b.top - half, bottom: b.bottom - half });
  const selfOf = (kind, label) => `${kind}_${name}_${label}`;

  return {
    stories,
    items,
    guides,
    /**
     * Repère de règle. `location` : abscisse du dos (vertical) ou ordonnée comptée depuis le haut de
     * la page (horizontal). Les repères horizontaux filent sur toute la planche (`FitToPage="false"`),
     * ce qui évite de dépendre de la page qui les porte.
     */
    guide(orientation, location) {
      const value = Math.round((orientation === 'Horizontal' ? location - half : location) * 1000) / 1000;
      guides.push(`    <Guide Self="${selfOf('Guide', `${orientation}_${guides.length + 1}`)}" Orientation="${orientation}" Location="${value}" ViewThreshold="5" GuideColor="Cyan" Locked="false" FitToPage="false"/>`);
    },
    /**
     * Bloc de texte de `box` ({ left, right, top, bottom }), rempli de `paragraphs`. `firstBaseline` :
     * décalage de la première ligne de base d'InDesign (« LeadingOffset » pour un corps plus haut que le cadre).
     */
    frame(label, frameBox, paragraphs, { columns = 1, firstBaseline = null } = {}) {
      const baseline = firstBaseline ? ` FirstBaselineOffset="${firstBaseline}"` : '';
      const story = selfOf('Story', label);
      stories.push({ self: story, xml: storyXml(story, paragraphs) });
      items.push(`    <TextFrame Self="${selfOf('Frame', label)}" ParentStory="${story}" PreviousTextFrame="n" NextTextFrame="n" ContentType="TextType" ItemLayer="${LAYER_SELF}" Name="${escapeXml(label)}" ItemTransform="1 0 0 1 0 0">
      ${pathGeometry(boxPoints(box(frameBox)))}
      <TextFramePreference TextColumnCount="${columns}" TextColumnGutter="${COLUMNS.gutter}" VerticalJustification="TopAlign"${baseline}/>
    </TextFrame>`);
    },
    /** Polygone plein : triangles, pli en diagonale, coin coupé… `tint` (0-100) éclaircit la nuance. */
    polygon(label, points, fill, tint = null) {
      const tinted = tint === null ? '' : ` FillTint="${tint}"`;
      items.push(`    <Polygon Self="${selfOf('Polygon', label)}" ContentType="Unassigned" ItemLayer="${LAYER_SELF}" Name="${escapeXml(label)}" FillColor="${colorRef(fill)}"${tinted} ${NO_STROKE} ItemTransform="1 0 0 1 0 0">
      ${pathGeometry(points.map(toSpread))}
    </Polygon>`);
    },
    /**
     * Polygone à dégradé linéaire : `gradient` ({ name, start, length, angle }, repère de la page) et
     * `opacity` (0-100) de l'objet.
     */
    gradientPolygon(label, points, { gradient, opacity = 100 }) {
      const [startX, startY] = toSpread(gradient.start);
      const attributes = `FillColor="${ref('Gradient', gradient.name)}" GradientFillStart="${Math.round(startX * 1000) / 1000} ${Math.round(startY * 1000) / 1000}" GradientFillLength="${Math.round(gradient.length * 1000) / 1000}" GradientFillAngle="${gradient.angle}"`;
      const blending = opacity === 100 ? '' : `<TransparencySetting><BlendingSetting Opacity="${opacity}"/></TransparencySetting>`;
      items.push(`    <Polygon Self="${selfOf('Polygon', label)}" ContentType="Unassigned" ItemLayer="${LAYER_SELF}" Name="${escapeXml(label)}" ${attributes} ${NO_STROKE} ItemTransform="1 0 0 1 0 0">
      ${pathGeometry(points.map(toSpread))}${blending}
    </Polygon>`);
    },
    /**
     * Forme vectorielle pleine à courbes de Bézier : `subpaths` [{ points: [{ anchor, left, right }], open }]
     * dans le repère de la page ; plusieurs sous-tracés forment un tracé composé (trous des lettres).
     */
    vector(label, subpaths, fill) {
      const spread = ([x, y]) => `${Math.round(x * 1000) / 1000} ${Math.round((y - half) * 1000) / 1000}`;
      const paths = subpaths.map(({ points, open }) =>
        `<GeometryPathType PathOpen="${open}"><PathPointArray>${points.map(({ anchor, left, right }) =>
          `<PathPointType Anchor="${spread(anchor)}" LeftDirection="${spread(left)}" RightDirection="${spread(right)}"/>`).join('')}</PathPointArray></GeometryPathType>`);
      items.push(`    <Polygon Self="${selfOf('Polygon', label)}" ContentType="Unassigned" ItemLayer="${LAYER_SELF}" Name="${escapeXml(label)}" FillColor="${colorRef(fill)}" ${NO_STROKE} ItemTransform="1 0 0 1 0 0">
      <Properties><PathGeometry>${paths.join('')}</PathGeometry></Properties>
    </Polygon>`);
    },
    /** Rectangle plein ; `stroke` ({ color, weight }) ajoute un contour, `fill` nul laisse l'intérieur vide. */
    rectangle(label, rectBox, fill, stroke = null) {
      const strokeAttributes = stroke ? `StrokeColor="${colorRef(stroke.color)}" StrokeWeight="${stroke.weight}"` : NO_STROKE;
      const fillColor = fill ? colorRef(fill) : NONE_SWATCH;
      items.push(`    <Rectangle Self="${selfOf('Rectangle', label)}" ContentType="Unassigned" ItemLayer="${LAYER_SELF}" Name="${escapeXml(label)}" FillColor="${fillColor}" ${strokeAttributes} ItemTransform="1 0 0 1 0 0">
      ${pathGeometry(boxPoints(box(rectBox)))}
    </Rectangle>`);
    },
    /**
     * Filet horizontal de `RULE_WEIGHT` pt (même trait pointillé orange sous le titre courant et au pli du pied). `dotted` le
     * trace en tirets (`DASH_LENGTH` pt de trait, `DASH_GAP` pt de blanc) dessinés comme segments d'un même
     * tracé composé : InDesign ignore les styles de contour lus dans un IDML (« Canned Dotted », « Canned
     * Dashed 3x2 » puis `$ID/Dashed` avec `StrokeDashAndGap` rendaient tous un trait plein ; `$ID/Dotted`
     * n'existe pas). Le pli n'est donc pas un contour pointillé modifiable, mais de la géométrie.
     */
    line(label, left, right, y, color = TEXT, { dotted = false } = {}) {
      const attributes = `FillColor="${NONE_SWATCH}" StrokeColor="${colorRef(color)}" StrokeWeight="${RULE_WEIGHT}" ItemTransform="1 0 0 1 0 0"`;
      if (dotted) {
        const segments = [];
        for (let x = left; x < right; x += DASH_LENGTH + DASH_GAP) {
          segments.push([toSpread([x, y]), toSpread([Math.min(x + DASH_LENGTH, right), y])]);
        }
        items.push(`    <Polygon Self="${selfOf('Line', label)}" ContentType="Unassigned" ItemLayer="${LAYER_SELF}" Name="${escapeXml(label)}" ${attributes}>
      ${segmentsGeometry(segments)}
    </Polygon>`);
        return;
      }
      items.push(`    <GraphicLine Self="${selfOf('Line', label)}" ContentType="GraphicType" ItemLayer="${LAYER_SELF}" Name="${escapeXml(label)}" ${attributes}>
      ${pathGeometry([toSpread([left, y]), toSpread([right, y])], true)}
    </GraphicLine>`);
    }
  };
}

const pageEdges = {
  left: { outer: -PAGE.width + MARGINS.outer, inner: -MARGINS.inner },
  right: { inner: MARGINS.inner, outer: PAGE.width - MARGINS.outer }
};
const headerBox = { top: HEADER_TOP, bottom: HEADER_TOP + HEADER_HEIGHT };
const footerBox = { top: PAGE.height - 14 - FOOTER_HEIGHT, bottom: PAGE.height - 14 };

/**
 * Ordonnée du pointillé de pliage : le contour est centré sur le tracé, donc le trait descend d'une
 * demi-épaisseur pour que son bord haut coïncide avec le bord haut du rabat (sinon il le dépasse
 * et casse l'impression de continuité).
 */
const foldRuleY = () => PAGE.height - CORNER + RULE_WEIGHT / 2;

/** Coin plié : coin de page blanchi par un triangle, rabat en couleur d'axe, débordant dans le fond perdu. */
function foldedCorner(builder, side) {
  const { width, height, bleed } = PAGE;
  const x = side === 'left' ? -width : width; // bord extérieur
  const dir = side === 'left' ? 1 : -1; // vers l'intérieur de la page
  const bottom = height + bleed;
  builder.polygon(`coin-${side}`, [[x - dir * bleed, height - CORNER], [x + dir * CORNER, bottom], [x - dir * bleed, bottom]], PAPER);
  builder.polygon(`pli-${side}`, [[x, height - CORNER], [x + dir * CORNER, height], [x + dir * CORNER, height - CORNER]], 'Axe vif');
  // Pointillé de pliage : prolonge le bord haut du rabat, de la marge intérieure au rabat, et sépare le pied de page du corps.
  const edges = [pageEdges[side].inner, x + dir * CORNER].sort((a, b) => a - b);
  builder.line(`pli-pointille-${side}`, edges[0], edges[1], foldRuleY(), 'Axe vif', { dotted: true });
}

/** Cadre du folio, centré sur le centre de gravité du rabat (le triangle rectangle du coin plié). */
function foldFolioBox(side) {
  const { width, height } = PAGE;
  const x = side === 'left' ? -width : width;
  const dir = side === 'left' ? 1 : -1;
  const cx = x + dir * (2 * CORNER) / 3;
  const cy = height - (2 * CORNER) / 3;
  return { left: cx - FOLIO_WIDTH / 2, right: cx + FOLIO_WIDTH / 2, top: cy - 7, bottom: cy + 7 };
}

/**
 * A-Courante : page gauche (paire) puis droite (impaire). Titres courants en variables de
 * texte, pointillé orange, folio et coin plié du côté extérieur, pied « scriptami.com » côté
 * intérieur.
 */
function masterA(builder, { footer = FOOTER_TEXT } = {}) {
  const { left, right } = pageEdges;
  const leftMid = (left.outer + left.inner) / 2;
  const rightMid = (right.inner + right.outer) / 2;

  // Coins pliés d'abord : le folio, dessiné après, reste lisible par-dessus.
  foldedCorner(builder, 'left');
  foldedCorner(builder, 'right');
  builder.frame('en-tete-gauche-titre', { left: left.outer, right: leftMid, ...headerBox },
    [para('Titre-courant', [{ text: '◀', character: 'Puce' }, { text: ' Titre du document' }])]);
  builder.frame('en-tete-gauche-version', { left: leftMid, right: left.inner, ...headerBox },
    [para('Titre-courant', [{ text: 'v1.0' }], { justification: 'RightAlign' })]);
  builder.line('en-tete-gauche', left.outer, left.inner, RULE_Y, 'Axe vif', { dotted: true });
  builder.frame('folio-gauche', foldFolioBox('left'), [para('Folio', [{ folio: true }], { justification: 'CenterAlign', fill: PAPER })]);
  builder.frame('pied-gauche', { left: left.inner - FOOTER_WIDTH, right: left.inner, ...footerBox },
    [para('Titre-courant', [{ text: footer }], { justification: 'RightAlign' })]);

  builder.frame('en-tete-droite-chapitre', { left: right.inner, right: rightMid, ...headerBox },
    [para('En-tête-chapitre', [{ text: 'Chapitre 00' }])]);
  builder.frame('en-tete-droite-titre', { left: rightMid, right: right.outer, ...headerBox },
    [para('Titre-courant', [{ text: 'Titre du chapitre ' }, { text: '▶', character: 'Puce' }], { justification: 'RightAlign' })]);
  builder.line('en-tete-droite', right.inner, right.outer, RULE_Y, 'Axe vif', { dotted: true });
  builder.frame('folio-droite', foldFolioBox('right'),
    [para('Folio', [{ folio: true }], { justification: 'CenterAlign', fill: PAPER })]);
  builder.frame('pied-droite', { left: right.inner, right: right.inner + FOOTER_WIDTH, ...footerBox },
    [para('Titre-courant', [{ text: footer }])]);

  // Repères des cadres de la colonne marginale et du texte (les colonnes du gabarit donnent les côtés) :
  // haut du corps, bas du bloc « numéro de section + rubrique », bas du corps. Une note de renvoi se
  // glisse sous le deuxième repère, en regard du paragraphe commenté.
  [BODY_TOP, BODY_TOP + SECTION_HEIGHT, BODY_BOTTOM].forEach(y => builder.guide('Horizontal', y));
}

const CHAPTER_WIDTH = 388; // largeur de la colonne de texte de l'ouverture de chapitre
const CHAPTER_DIAGONAL = { left: 420, right: 385 }; // ordonnées de la diagonale au dos puis au bord extérieur
const CHAPTER_FLANK_LEFT = 503; // le flanc triangulé commence ici, jusqu'au bord extérieur
// Nuances du flanc (nuance, teinte en %) : aplats vifs, fond clair et touches sombres.
const FLANK_TONES = Object.freeze([
  ['Axe vif', 100], ['Axe fond', 100], ['Axe vif', 55], ['Axe texte', 100], ['Axe fond', 100], ['Axe vif', 30], ['Axe fond', 60]
]);

/**
 * B-Chapitre : décor seul. Demi-page haute en teinte de fond dont le bord bas suit une
 * diagonale, mosaïque de triangles teintés (`flanc-N`) sur le bord extérieur, coin coupé en
 * bas à droite, pied de page et folio. Le texte (surtitre, numéro, titre, chapeau, « Dans ce
 * chapitre ») vient de l'ICML, à placer sur la page (cadres d'exemple : `chapterBoxes`).
 */
function masterB(builder, { footer = FOOTER_TEXT } = {}) {
  const { width, height, bleed } = PAGE;
  const right = width + bleed;
  const bottom = height + bleed;
  const { inner } = pageEdges.right;
  // Le haut de page (teinte de fond) s'arrête sur une légère diagonale, de gauche à droite.
  const diagonal = x => CHAPTER_DIAGONAL.left - ((CHAPTER_DIAGONAL.left - CHAPTER_DIAGONAL.right) * x) / width;

  builder.rectangle('fond', { left: 0, right, top: -bleed, bottom }, 'Papier de page');
  builder.polygon('fond-haut', [[0, -bleed], [right, -bleed], [right, diagonal(right)], [0, diagonal(0)]], 'Axe fond');

  // Flanc triangulé : une grille de points légèrement décalés, chaque case coupée en deux triangles
  // aux nuances de l'axe. Le décalage est déterministe : le gabarit se régénère à l'identique.
  const columns = [CHAPTER_FLANK_LEFT, (CHAPTER_FLANK_LEFT + right) / 2, right];
  const rows = 9;
  const vertex = (column, row) => {
    const x = columns[column];
    const top = diagonal(x);
    const y = top + ((bottom - top) * row) / rows;
    const inside = column < columns.length - 1 && row > 0 && row < rows;
    return inside
      ? [x + (((column * 7 + row * 11) % 5) - 2) * 6, y + (((column * 13 + row * 5) % 5) - 2) * 7]
      : [x, y];
  };
  let triangle = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns.length - 1; column += 1) {
      const a = vertex(column, row);
      const b = vertex(column + 1, row);
      const c = vertex(column + 1, row + 1);
      const d = vertex(column, row + 1);
      [[a, b, c], [a, c, d]].forEach(points => {
        const [fill, tint] = FLANK_TONES[(triangle * 5 + row * 3) % FLANK_TONES.length];
        triangle += 1;
        builder.polygon(`flanc-${triangle}`, points, fill, tint);
      });
    }
  }
  // Triangle vif dans l'angle du bas, par-dessus la mosaïque.
  builder.polygon('coin-bas', [[right - mm(26), bottom], [right, bottom], [right, bottom - mm(26)]], 'Axe vif');

  // Même pointillé de pliage que sur A-Courante, sur la largeur de la colonne de texte, au-dessus du pied.
  builder.line('pli-pointille', inner, inner + CHAPTER_WIDTH, foldRuleY(), 'Axe vif', { dotted: true });
  builder.frame('pied-titre', { left: inner, right: inner + FOOTER_WIDTH, ...footerBox },
    [para('Titre-courant', [{ text: footer }])]);
  builder.frame('folio-droite', { left: inner + CHAPTER_WIDTH - 60, right: inner + CHAPTER_WIDTH, ...footerBox },
    [para('Folio', [{ folio: true }], { justification: 'RightAlign' })]);

  // Repères des cinq zones de texte (surtitre, numéro, titre, chapeau, « Dans ce chapitre »), qui
  // sont ceux de `chapterBoxes` : les cadres glissés sur ces repères coïncident avec la page d'exemple.
  const zones = Object.values(chapterBoxes());
  [...new Set(zones.flatMap(zone => [zone.top, zone.bottom]))].forEach(y => builder.guide('Horizontal', y));
  [...new Set(zones.flatMap(zone => [zone.left, zone.right]))].forEach(x => builder.guide('Vertical', x));
}

/**
 * Cadres de la couverture, d'après la maquette (mêmes proportions que sa page A4) :
 * logo et type de document en haut, trois lignes de marque dans l'aplat orange, surtitre,
 * titre, filet puis pied de page (version à gauche, signature à droite).
 */
function coverBoxes() {
  const { height } = PAGE;
  const { inner, outer } = pageEdges.right;
  const horizontal = { left: inner, right: outer };
  return {
    logo: { left: inner, right: inner + 120, top: 50, bottom: 62 },
    tagRectangle: { left: outer - 172, right: outer, top: 44, bottom: 69 },
    tagText: { left: outer - 172, right: outer, top: 51, bottom: 67 },
    tagline: { ...horizontal, top: height * 0.37, bottom: height * 0.37 + 60 },
    verbTriangle: { left: inner, top: height * 0.5785, size: 10 },
    verb: { left: inner + 18, right: outer, top: height * 0.5755, bottom: height * 0.5755 + 18 },
    title: { ...horizontal, top: height * 0.612, bottom: height * 0.612 + 110 },
    subtitle: { ...horizontal, top: height * 0.748, bottom: height * 0.748 + 60 },
    rule: { y: height - 66 },
    versionText: { left: inner, right: inner + 220, top: height - 56, bottom: height - 40 },
    signature: { left: outer - 260, right: outer, top: height - 56, bottom: height - 40 }
  };
}

/** Cadre du titre, de la version et du sommaire du gabarit C, destiné à l'ICML de couverture. */
function coverTextBox() {
  const { title } = coverBoxes();
  return { ...title, bottom: PAGE.height - 84 };
}

const DEFAULT_SUBTITLE = 'Sous-titre du document à renseigner.';
// Contour du cadre du type de document : 1,25 pt sur la maquette, 2 pt ici pour qu'il ressorte à l'écran sur l'aplat.
const TAG_STROKE = 2;

/**
 * Textes de la couverture portés par des cadres : gabarit C (repères, sans titre) ou page
 * remplie (`title` et `version` renseignés).
 */
function coverTexts(builder, { tag = DEFAULT_TYPE, verb = `${DEFAULT_VERB} · Guide`, title = null, subtitle = DEFAULT_SUBTITLE, version = null } = {}) {
  const boxes = coverBoxes();
  builder.frame('type-document', boxes.tagText, [para('Type-document', [{ text: tag }], { justification: 'CenterAlign' })]);
  builder.frame('verbe', boxes.verb, [para('Surtitre', [{ text: verb }], { fill: 'Axe texte' })]);
  if (title !== null) {
    builder.frame('titre-couverture', boxes.title, [para('Titre-couverture', accentedTitle(title))]);
    builder.frame('sous-titre', boxes.subtitle, [para('Chapeau', [{ text: subtitle }])]);
  }
  if (version !== null) {
    builder.frame('version', boxes.versionText, [para('Légende', [{ text: version }], { fill: DARK })]);
  }
}

/** Plages d'un titre dont le dernier mot est en « Accent », comme dans la maquette. */
function accentedTitle(title) {
  const words = title.split(' ');
  const last = words.pop();
  return words.length === 0
    ? [{ text: last, character: 'Accent' }]
    : [{ text: `${words.join(' ')} ` }, { text: last, character: 'Accent' }];
}

/** Deux lignes du pied de la page de fin, quand le guide n'en fournit pas. */
const DEFAULT_MENTIONS = Object.freeze([
  'Phrase de marque à renseigner.',
  'Mentions légales de la micro-entreprise à renseigner.'
]);

// Contact du gabarit D tant qu'aucun guide ne le renseigne.
const DEFAULT_CONTACT = Object.freeze({
  titre: 'Une question sur ce document ?',
  accroche: 'Une phrase d’invitation à renseigner.',
  cartes: Object.freeze([
    { label: 'E-mail', valeur: 'À renseigner', note: 'Adresse du contact' },
    { label: 'Téléphone', valeur: 'À renseigner', note: 'Jours et horaires de réponse' },
    { label: 'Nom', valeur: 'À renseigner', note: 'Interlocuteur du lecteur' }
  ])
});

const END_BANNER ={ top: 40, cut: 36 }; // bloc contact inséré entre les marges, coin bas gauche coupé
const END_CARD_HEIGHT = 92;
const PICTO_HEIGHT = 56; // picto de la zone noire de la page de fin

/** Ordonnée du bas du bloc contact de la page de fin. */
const endBannerBottom = () => PAGE.height * 0.3;

/**
 * Cadre des conseils de la page de fin (gabarit D et page remplie), sur deux colonnes : la
 * première à gauche, la seconde à droite (saut de colonne posé par l'ICML).
 */
function endTextBox() {
  const cardsTop = endBannerBottom() + 24;
  return { left: pageEdges.right.inner, right: pageEdges.right.outer, top: cardsTop + END_CARD_HEIGHT + 46, bottom: PAGE.height - FOOTER_BAND - 14 };
}

/** Paragraphes `{ style, text }` des pages remplies, en paragraphes d'histoire. */
const filledParagraphs = list => list.map(({ style, text, columnBreak, noHyphenation }) =>
  para(style, [{ text }], { attrs: { ...(columnBreak ? { StartParagraph: 'NextColumn' } : {}), ...(noHyphenation ? { Hyphenation: 'false' } : {}) } }));

/**
 * C-Couverture : fond papier, trois aplats d'angle (orange, turquoise, vert) dont le bas suit
 * une légère diagonale, logo, rectangle du type de document, trois lignes de marque, triangle
 * du surtitre, filet et signature de pied. Les repères de texte (type, surtitre, titre) y sont
 * posés tant que la page n'est pas remplie.
 */
function masterC(builder, { filled = false } = {}) {
  const { width, height, bleed } = PAGE;
  const right = width + bleed;
  const boxes = coverBoxes();
  const { inner, outer } = pageEdges.right;

  // Proportions relevées sur la maquette (596 × 842) ; le bas des aplats descend de 0,493 à 0,543 de la hauteur.
  const orangeBottomRight = [0.31 * width, 0.526 * height];
  const meeting = [0.336 * width, 0.526 * height]; // jonction des trois aplats sur la diagonale
  const topSplit = 0.617 * width + 0.413 * bleed; // pied de la frontière orange / turquoise, fond perdu compris
  const rightSplit = 0.2375 * height - 5; // frontière turquoise / vert au bord extérieur
  builder.rectangle('fond', { left: 0, right, top: -bleed, bottom: height + bleed }, 'Papier de page');
  builder.polygon('bandeau', [[0, -bleed], [topSplit, -bleed], orangeBottomRight, [0, 0.543 * height]], 'Orange vif');
  builder.polygon('bandeau-turquoise', [[topSplit, -bleed], [right, -bleed], [right, rightSplit], meeting, orangeBottomRight], 'Turquoise vif');
  builder.polygon('bandeau-vert', [meeting, [right, rightSplit], [right, 0.493 * height]], 'Vert vif');

  builder.vector('logo', wordmarkShapes({ left: inner, top: boxes.logo.top, width: boxes.logo.right - boxes.logo.left }).subpaths, DARK);
  builder.rectangle('type-document-cadre', boxes.tagRectangle, 'Papier de page', { color: DARK, weight: TAG_STROKE });
  builder.frame('signature-marque', boxes.tagline,
    [['consolider', ' · guide du client'], ['débloquer', ' · guide du vendeur'], ['maîtriser', ' · guide de l’administrateur']]
      // Les trois lignes présentent les trois guides, sans en mettre un en avant : le verbe du document est sur la ligne de surtitre.
      .map(([word, rest]) => para('Légende', [{ text: word, character: 'Gras' }, { text: rest }], { fill: DARK })));
  const { left, top, size } = boxes.verbTriangle;
  builder.polygon('verbe-triangle', [[left, top], [left + size, top + size / 2], [left, top + size]], 'Axe vif');
  // Même pointillé orange que le pli des pages courantes (plus un filet plein sombre).
  builder.line('pied-filet', inner, outer, boxes.rule.y, 'Axe vif', { dotted: true });
  builder.frame('signature', boxes.signature,
    [para('Légende', [{ text: 'François-Xavier Guillois · scriptami.com' }], { fill: DARK, justification: 'RightAlign' })]);

  // Page remplie : le texte vit dans des cadres de la page, le gabarit n'en porte pas (pas de doublon).
  if (filled) return;
  coverTexts(builder);
  // Un seul cadre pour titre, version et sommaire : l'ICML 00-pages/couverture.icml s'y place d'un bloc.
  builder.frame('texte-couverture', coverTextBox(),
    [
      para('Titre-couverture', [{ variable: 'Titre du document' }]),
      para('Surtitre', [{ variable: 'Version' }]),
      para('Sommaire-général', [{ text: 'Sommaire' }]),
      para('Sommaire-ligne', [{ text: '01 Placer ici 00-pages/couverture.icml' }])
    ]);
}

/**
 * D-Fin : fond papier, bloc contact inséré entre les marges (coin bas gauche coupé), trois
 * cartes de la couleur du papier à bordure sombre, deux colonnes de conseils côte à côte sous un filet,
 * pied anthracite à filet orange. Le contact (titre, accroche, trois cartes) est propre au guide.
 */
function masterD(builder, { filled = false, contact = null, mentions = DEFAULT_MENTIONS } = {}) {
  const { titre, accroche, cartes } = contact || DEFAULT_CONTACT;
  const { width, height, bleed } = PAGE;
  const right = width + bleed;
  const inner = pageEdges.right.inner;
  const outer = pageEdges.right.outer;
  const bannerBottom = endBannerBottom();
  const { top: bannerTop, cut } = END_BANNER;
  const padding = 20;
  builder.rectangle('fond', { left: 0, right, top: -bleed, bottom: height + bleed }, 'Papier de page');
  builder.polygon('bandeau-contact', [[inner, bannerTop], [outer, bannerTop], [outer, bannerBottom], [inner + cut, bannerBottom], [inner, bannerBottom - cut]], 'Axe vif');
  // Un seul cadre pour le titre et l'accroche : l'ICML 00-pages/fin-bandeau.icml s'y place d'un bloc.
  builder.frame('bandeau-texte', { left: inner + padding, right: outer - padding, top: bannerTop + 26, bottom: bannerBottom - cut + 10 },
    [
      para('Bandeau-titre', [{ text: titre }]),
      para('Bandeau-texte', [{ text: accroche }])
    ]);

  const gap = 12;
  const cardWidth = (outer - inner - 2 * gap) / 3;
  const cardsTop = bannerBottom + 24;
  cartes.forEach((card, index) => {
    const left = inner + index * (cardWidth + gap);
    builder.rectangle(`carte-${index + 1}`, { left, right: left + cardWidth, top: cardsTop, bottom: cardsTop + END_CARD_HEIGHT }, 'Papier de page', { color: DARK, weight: 1 });
    // Un cadre par carte : l'ICML 00-pages/fin-carte-N.icml s'y place d'un bloc.
    builder.frame(`carte-${index + 1}-texte`, { left: left + 10, right: left + cardWidth - 10, top: cardsTop + 10, bottom: cardsTop + END_CARD_HEIGHT - 8 },
      [
        para('Surtitre', [{ text: card.label }]),
        para('Carte-valeur', [{ text: card.valeur }]),
        para('Légende', [{ text: card.note }])
      ]);
  });

  // Filet au-dessus des deux colonnes de conseils, posées dans un même cadre.
  builder.line('conseils-filet', inner, outer, cardsTop + END_CARD_HEIGHT + 16, DARK);
  // Un seul cadre pour les deux colonnes : l’ICML 00-pages/fin-conseils.icml s’y place d’un bloc.
  if (!filled) {
    builder.frame('conseils-fin', endTextBox(),
      [
        para('Surtitre', [{ text: 'Conseils' }]),
        para('Courant', [{ text: 'Placer ici 00-pages/fin-conseils.icml (deux colonnes de conseils).' }])
      ], { columns: 2 });
  }

  const footerTop = height - FOOTER_BAND;
  builder.rectangle('pied-anthracite', { left: 0, right, top: footerTop, bottom: height + bleed }, DARK);
  builder.rectangle('pied-filet', { left: 0, right, top: footerTop, bottom: footerTop + 4.5 }, ORANGE);
  // Picto seul (sans le mot) sur la zone noire ; le texte de pied s'aligne à sa droite.
  const picto = pictoFacets({ left: inner, top: footerTop + 22, height: PICTO_HEIGHT });
  picto.facets.forEach(({ name, points, gradient, opacity }) => builder.gradientPolygon(`picto-${name}`, points, { gradient, opacity }));
  builder.frame('pied-texte', { left: inner + picto.width + 18, right: outer, top: footerTop + 22, bottom: height - 8 },
    mentionLines(mentions).map(({ style, text }) => para(style, [{ text }])));
}

const MASTER_BUILDERS = { 'A-Courante': masterA, 'B-Chapitre': masterB, 'C-Couverture': masterC, 'D-Fin': masterD };

function marginsXml(master, side) {
  if (master.name === 'A-Courante' || master.name === 'B-Chapitre') return pageMargins(side);
  return `<MarginPreference ColumnCount="1" ColumnGutter="${COLUMNS.gutter}" Top="${MARGINS.top}" Bottom="${MARGINS.bottom}" Left="${MARGINS.inner}" Right="${MARGINS.outer}" ColumnDirection="Horizontal"/>`;
}

/** Gabarit complet : `{ master, xml, stories }`. Les pages simples sont des pages de droite. */
function buildMaster(master, { filled = false, contact = null, footer = FOOTER_TEXT, mentions = DEFAULT_MENTIONS } = {}) {
  const { width, height } = PAGE;
  const half = height / 2;
  const builder = masterBuilder(master.name);
  MASTER_BUILDERS[master.name](builder, { filled, contact, footer, mentions });
  const self = masterSelf(master.name);
  const page = (id, side, offsetX) => `    <Page Self="${self}_${id}" GeometricBounds="0 0 ${height} ${width}" ItemTransform="1 0 0 1 ${offsetX} ${-half}" Name="${master.prefix}" AppliedMaster="n" OverrideList="" TabOrder="" GridStartingPoint="TopOutside" UseMasterGrid="true">
      ${marginsXml(master, side)}
    </Page>`;
  const pages = master.pages === 2 ? [page('gauche', 'left', -width), page('droite', 'right', 0)] : [page('droite', 'right', 0)];
  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:MasterSpread ${NS} DOMVersion="${DOM_VERSION}">
  <MasterSpread Self="${self}" Name="${master.name}" NamePrefix="${master.prefix}" BaseName="${master.base}" PageCount="${master.pages}" BindingLocation="1" AllowPageShuffle="true" ShowMasterItems="true" ItemTransform="1 0 0 1 0 0">
${pages.join('\n')}
${builder.guides.join('\n')}
${builder.items.join('\n')}
  </MasterSpread>
</idPkg:MasterSpread>
`;
  return { master, xml, stories: builder.stories };
}

const masterFile = master => `MasterSpreads/MasterSpread_${master.name}.xml`;

/**
 * Planche. `master` : nom du gabarit appliqué à la page unique (ou aucun) ; `items` : blocs
 * libres posés sur la planche (abscisses du dos : une page de droite de 0 à la largeur, une
 * page de gauche de moins la largeur à 0). `pages` (facultatif) décrit une double page :
 * `[{ master, side: 'left'|'right', name }]`, chaque page gardant son propre gabarit.
 */
function spreadXml({ index = 1, master = null, items = [], pages = null, name = null } = {}) {
  const { width, height } = PAGE;
  const list = pages || [{ master, side: 'right', name: name || String(index) }];
  const pageXml = (page, position) => {
    const left = page.side === 'left';
    const margins = { Left: MARGINS.inner, Right: MARGINS.outer }; // intérieure / extérieure, quel que soit le côté
    const id = list.length > 1 ? `Page_${index}_${position + 1}` : `Page_${index}`;
    return `    <Page Self="${id}" GeometricBounds="0 0 ${height} ${width}" ItemTransform="1 0 0 1 ${left ? -width : 0} ${-height / 2}" Name="${escapeXml(page.name)}" AppliedMaster="${page.master ? masterSelf(page.master) : 'n'}" OverrideList="" TabOrder="" GridStartingPoint="TopOutside" UseMasterGrid="true">
      <MarginPreference ColumnCount="1" ColumnGutter="${COLUMNS.gutter}" Top="${MARGINS.top}" Bottom="${MARGINS.bottom}" Left="${margins.Left}" Right="${margins.Right}" ColumnDirection="Horizontal"/>
    </Page>`;
  };
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Spread ${NS} DOMVersion="${DOM_VERSION}">
  <Spread Self="Spread_${index}" PageCount="${list.length}" BindingLocation="1" AllowPageShuffle="true" ShowMasterItems="true" ItemTransform="1 0 0 1 0 0">
${list.map(pageXml).join('\n')}
${items.join('\n')}
  </Spread>
</idPkg:Spread>
`;
}

const SUMMARY_PAGE_LABEL = 'p. …';
/** « p. N » si la configuration du guide donne la page du chapitre (clé « N » sans zéro initial), sinon le libellé à remplacer. */
function summaryPageLabel(pageNumbers, number) {
  const page = pageNumbers ? pageNumbers[String(Number.parseInt(number, 10))] : undefined;
  return page === undefined ? SUMMARY_PAGE_LABEL : `p. ${page}`;
}
const SUMMARY_LABEL = 'Sommaire';
const SUMMARY_LINE = /^(\d+)\t(.+)$/;

/** Cadre du sommaire : toute la page de gauche entre ses marges, sous l'en-tête courant. */
function summaryBox() {
  const { outer, inner } = pageEdges.left;
  return { left: outer, right: inner, top: 118, bottom: PAGE.height - 80 };
}

/**
 * Paragraphes de la page de sommaire d'après les lignes « NN, tabulation, titre » de la
 * couverture : surtitre sous filet épais, une ligne par chapitre, filet épais final.
 * Les numéros de page sont à renseigner (ou à remplacer par une table des matières InDesign).
 */
function summaryParagraphs(cover, pageNumbers) {
  const lines = cover.filter(item => item.style === 'Sommaire-ligne')
    .map(item => SUMMARY_LINE.exec(item.text))
    .filter(Boolean);
  const heavy = ruleBelow(DARK, 3, 8);
  const rows = lines.map(([, number, title], index) => para('Sommaire-chapitre',
    [
      { text: number, character: 'Sommaire-numéro' },
      { text: '\t' },
      { text: title },
      { text: '\t' },
      { text: summaryPageLabel(pageNumbers, number), character: 'Sommaire-page' }
    ],
    index === lines.length - 1 ? { attrs: ruleBelow(DARK, 3, 9) } : {}));
  return [
    para('Surtitre', [{ text: SUMMARY_LABEL }], { attrs: { ...heavy, SpaceAfter: '6' } }),
    ...rows
  ];
}

/** Texte du premier paragraphe d'un style dans une liste `{ style, text }`. */
const textOfStyle = (list, style) => (list.find(item => item.style === style) || {}).text;

const BODY_TOP = 56; // sous le filet de l'en-tête (34 pt), comme la maquette
const BODY_BOTTOM = PAGE.height - 70;
// Colonne marginale : un cadre par élément, de la hauteur de son contenu, à glisser en regard du
// texte qu'il commente (numéro de section et rubrique en tête, note de renvoi en face d'un paragraphe).
const SECTION_HEIGHT = 64;
const NOTE_TOP = BODY_TOP + 110; // position d'exemple : en face du deuxième paragraphe
const NOTE_HEIGHT = 76;

/**
 * Cadres d'une page courante : colonne de texte et colonne marginale, côté extérieur
 * (à gauche d'une page de gauche, à droite d'une page de droite).
 */
function bodyBoxes(side) {
  const { text, gutter, margin } = COLUMNS;
  const { outer, inner } = pageEdges[side];
  const vertical = { top: BODY_TOP, bottom: BODY_BOTTOM };
  return side === 'left'
    ? {
      text: { left: outer + margin + gutter, right: inner, ...vertical },
      margin: { left: outer, right: outer + margin, ...vertical }
    }
    : {
      text: { left: inner, right: inner + text, ...vertical },
      margin: { left: outer - margin, right: outer, ...vertical }
    };
}

/** Paragraphe d'encadré : libellé en style de caractère, puis texte. */
const boxPara = (style, label, text) => para(style, [{ text: label, character: 'Encadré-libellé' }, { text: ` ${text}` }]);

/**
 * Textes d'exemple des pages courantes (quatre pages, de gauche à droite) : de quoi juger les
 * titres courants, le folio et le pied, avec les styles les plus fréquents du jeu court.
 */
function sampleBodyPages() {
  const note = value => para('Note-renvoi', [{ text: 'Renvoi', character: 'Encadré-libellé' }, { text: ` ${value}` }]);
  const side = (section, label, renvoi) => ({
    margin: [para('Numéro-section', [{ text: section }]), para('Surtitre', [{ text: label }])],
    note: renvoi ? [note(renvoi)] : null
  });
  const text = value => para('Courant', [{ text: value }]);
  const bullet = value => para('Liste-puce', [{ text: value }]);
  const numbered = value => para('Liste-num', [{ text: value }]);
  const pages = [
    [
      para('Intertitre-1', [{ text: 'Préparer le fichier' }]),
      text('Le fichier du catalogue est un tableur enregistré au format CSV. Chaque ligne décrit une référence, chaque colonne porte un titre fixe : l’ordre des colonnes est libre, leurs titres ne le sont pas.'),
      text('Avant l’envoi, ouvrez le fichier et vérifiez que les prix et les dimensions sont renseignés.'),
      bullet('Enregistrer le tableur en CSV, séparateur point-virgule.'),
      bullet('Conserver les 23 titres de colonne, sans en ajouter ni en retirer.'),
      bullet('Laisser vide une cellule sans valeur plutôt que d’y écrire un zéro.'),
      boxPara('Encadré-info', 'Bon à savoir', 'un fichier refusé n’efface jamais le catalogue en ligne : rien n’est modifié tant que l’import n’a pas réussi.')
    ],
    [
      para('Intertitre-1', [{ text: 'Envoyer le fichier' }]),
      text('Depuis l’espace partenaire, déposez le fichier dans la zone d’import. La validation démarre aussitôt et affiche le résultat ligne par ligne.'),
      numbered('Cliquer sur « Choisir un fichier » et sélectionner le CSV.'),
      numbered('Attendre la fin de la validation.'),
      numbered('Lire les avertissements, puis cliquer sur « Importer ».'),
      text('L’import remplace le catalogue précédent : les références absentes du nouveau fichier sont retirées.'),
      boxPara('Encadré-attention', 'Attention', 'un fichier partiel vide la partie manquante du catalogue. Importez toujours le tarif complet.')
    ],
    [
      para('Intertitre-1', [{ text: 'Lire le résultat' }]),
      para('Intertitre-2', [{ text: 'Les avertissements' }]),
      text('Un avertissement signale un point à corriger sans bloquer l’import. Le message nomme la colonne concernée et indique la correction à faire dans le fichier.'),
      para('Intertitre-2', [{ text: 'Les erreurs' }]),
      text('Une erreur bloque l’import : le fichier doit être corrigé puis envoyé de nouveau.'),
      boxPara('Encadré-retenir', 'À retenir', 'le partenaire corrige seul son fichier ; rien n’est nettoyé automatiquement.'),
    ],
    [
      para('Intertitre-1', [{ text: 'Vérifier le catalogue' }]),
      text('Une fois l’import terminé, ouvrez la page du catalogue et contrôlez quelques références : le prix, les dimensions et la photo doivent correspondre au tarif.'),
      bullet('Rechercher une référence par son code.'),
      bullet('Ouvrir sa fiche et comparer avec le tableur.'),
      text('Si un écart persiste, corrigez le fichier et relancez l’import.'),
      boxPara('Encadré-info', 'Bon à savoir', 'le catalogue affiché peut mettre quelques minutes à suivre l’import.')
    ]
  ];
  const sides = [
    side('1.1', 'Mise en route', 'Les 23 titres de colonne sont listés dans le chapitre sur le format du fichier.'),
    side('1.2', 'Import'),
    side('1.3', 'Résultat', 'Voir aussi le chapitre suivant pour générer les QR codes.'),
    side('1.4', 'Contrôle')
  ];
  return pages.map((paragraphs, index) => ({ paragraphs, ...sides[index] }));
}

// Sections d'exemple du bloc « Dans ce chapitre » (celles des pages courantes d'exemple).
const SAMPLE_SECTIONS = Object.freeze(['Préparer le fichier', 'Envoyer le fichier', 'Lire le résultat', 'Vérifier le catalogue']);

/** Cadres de l'ouverture de chapitre, d'après la maquette (colonne de 388 pt à la marge intérieure). */
function chapterBoxes() {
  const { inner } = pageEdges.right;
  const column = { left: inner, right: inner + CHAPTER_WIDTH };
  return {
    kicker: { ...column, top: 50, bottom: 68 },
    number: { ...column, top: 68, bottom: 190 },
    title: { ...column, top: 196, bottom: 278 },
    // 88 pt = quatre lignes de chapeau (13,5 / 20), le maximum des guides (250 caractères) ; le bas reste
    // au-dessus de la diagonale du fond (≈ 394 pt au bord droit de la colonne) pour ne pas la toucher.
    lead: { ...column, top: 290, bottom: 378 },
    contents: { ...column, top: 478, bottom: 672 }
  };
}

/**
 * Page d'ouverture de chapitre : surtitre, numéro, titre (dernier mot en « Accent »), chapeau et
 * bloc « Dans ce chapitre » (titre pris au sommaire du guide). Un paragraphe par cadre.
 */
function chapterOpening(cover) {
  const lines = cover.filter(item => item.style === 'Sommaire-ligne').map(item => SUMMARY_LINE.exec(item.text)).filter(Boolean);
  const [, number = '01', title = 'Titre du chapitre'] = lines[1] || lines[0] || [];
  const titleParts = accentedTitle(title);
  const heavy = { RuleAboveLineWeight: '3', RuleAboveColor: colorRef(DARK), SpaceBefore: '0', SpaceAfter: '4' };
  const sections = SAMPLE_SECTIONS.map((section, index) => para('Sommaire-section',
    [
      { text: `${Number.parseInt(number, 10)}.${index + 1}`, character: 'Sommaire-numéro' },
      { text: '\t' },
      { text: section },
      { text: '\t' },
      { text: SUMMARY_PAGE_LABEL, character: 'Sommaire-page' }
    ],
    index === SAMPLE_SECTIONS.length - 1 ? { attrs: ruleBelow(DARK, 3, 10) } : {}));
  return {
    kicker: [para('Surtitre', [{ text: 'Chapitre' }])],
    number: [para('Numéro-chapitre', [{ text: number }])],
    title: [para('Titre-chapitre', titleParts)],
    lead: [para('Chapeau', [{ text: 'Chapeau du chapitre : deux ou trois phrases qui disent ce que le lecteur saura faire à la fin.' }])],
    contents: [para('Sommaire-titre', [{ text: '▶', character: 'Puce' }, { text: ' Dans ce chapitre' }], { attrs: heavy }), ...sections]
  };
}

/**
 * Pages d'exemple remplies : couverture (gabarit C), double page 2-3 (sommaire sur A-Courante,
 * ouverture de chapitre sur B-Chapitre), deux doubles pages de texte courant sur A-Courante
 * (pages 4 à 7, pour juger titres courants, folio et pied), puis fin (gabarit D). Les cadres
 * sont libres, posés sur la page, donc modifiables sans surcharge d'élément de gabarit.
 * @returns {{ spreads: object[], stories: { self: string, xml: string }[] }}
 */
function filledPages({ cover, end, pages: pageNumbers, subtitle = DEFAULT_SUBTITLE, label = 'Guide', verb = DEFAULT_VERB, tag = DEFAULT_TYPE }) {
  const coverBuilder = masterBuilder('Page-C');
  coverTexts(coverBuilder, {
    tag,
    verb: `${verb} · ${label}`,
    title: textOfStyle(cover, 'Titre-couverture') || '',
    subtitle,
    version: textOfStyle(cover, 'Surtitre') || ''
  });
  const summaryBuilder = masterBuilder('Page-Sommaire');
  summaryBuilder.frame('sommaire', summaryBox(), summaryParagraphs(cover, pageNumbers));
  const opening = chapterOpening(cover);
  const boxes = chapterBoxes();
  summaryBuilder.frame('chapitre-surtitre', boxes.kicker, opening.kicker);
  // Corps de 150 pt dans un cadre de 130 pt : l'ascendante par défaut dépasse le cadre et le numéro disparaît en texte en excès.
  summaryBuilder.frame('chapitre-numero', boxes.number, opening.number, { firstBaseline: 'LeadingOffset' });
  summaryBuilder.frame('chapitre-titre', boxes.title, opening.title);
  summaryBuilder.frame('chapitre-chapeau', boxes.lead, opening.lead);
  summaryBuilder.frame('chapitre-sommaire', boxes.contents, opening.contents);
  const textBuilders = [0, 1].map(index => {
    const builder = masterBuilder(`Page-Texte-${index + 1}`);
    const [leftPage, rightPage] = sampleBodyPages().slice(index * 2, index * 2 + 2);
    const placed = [['gauche', 'left', leftPage], ['droite', 'right', rightPage]].map(([label, side, page]) => ({ label, boxes: bodyBoxes(side), page }));
    placed.forEach(({ label, boxes, page }) => builder.frame(`corps-${label}`, boxes.text, page.paragraphs));
    placed.forEach(({ label, boxes, page }) => builder.frame(`marginale-${label}`, { ...boxes.margin, bottom: BODY_TOP + SECTION_HEIGHT }, page.margin));
    placed.filter(({ page }) => page.note).forEach(({ label, boxes, page }) => builder.frame(`renvoi-${label}`, { ...boxes.margin, top: NOTE_TOP, bottom: NOTE_TOP + NOTE_HEIGHT }, page.note));
    return builder;
  });
  const endBuilder = masterBuilder('Page-D');
  endBuilder.frame('conseils-fin', endTextBox(), filledParagraphs(end), { columns: 2 });
  const textSpread = (index, first, builder) => ({
    index,
    pages: [{ master: 'A-Courante', side: 'left', name: String(first) }, { master: 'A-Courante', side: 'right', name: String(first + 1) }],
    items: builder.items
  });
  return {
    spreads: [
      { index: 1, master: 'C-Couverture', items: coverBuilder.items },
      {
        index: 2,
        pages: [{ master: 'A-Courante', side: 'left', name: '2' }, { master: 'B-Chapitre', side: 'right', name: '3' }],
        items: summaryBuilder.items
      },
      textSpread(3, 4, textBuilders[0]),
      textSpread(4, 6, textBuilders[1]),
      { index: 5, master: 'D-Fin', items: endBuilder.items, name: '8' }
    ],
    stories: [...coverBuilder.stories, ...summaryBuilder.stories, ...textBuilders.flatMap(builder => builder.stories), ...endBuilder.stories]
  };
}

function designmapXml({ masters, storyFiles, spreadCount = 1 }) {
  const storyList = storyFiles.map(file => file.self).join(' ');
  const lines = [
    '  <idPkg:Graphic src="Resources/Graphic.xml"/>',
    '  <idPkg:Styles src="Resources/Styles.xml"/>',
    '  <idPkg:Preferences src="Resources/Preferences.xml"/>',
    '  <idPkg:Tags src="XML/Tags.xml"/>',
    ...(masters ? MASTERS.map(master => `  <idPkg:MasterSpread src="${masterFile(master)}"/>`) : []),
    ...Array.from({ length: spreadCount }, (_, i) => `  <idPkg:Spread src="Spreads/Spread_${i + 1}.xml"/>`),
    '  <idPkg:BackingStory src="XML/BackingStory.xml"/>',
    ...storyFiles.map(file => `  <idPkg:Story src="Stories/${file.self}.xml"/>`)
  ];
  const layer = `  <Layer Self="${LAYER_SELF}" Name="Calque 1" Visible="true" Locked="false" IgnoreWrap="false" ShowGuides="true" LockGuides="false" UI="true" Expendable="true" Printable="true">\n    <Properties><LayerColor type="enumeration">LightBlue</LayerColor></Properties>\n  </Layer>`;
  const variables = masters ? TEXT_VARIABLES.map(variableXml) : [];
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?aid style="50" type="document" readerVersion="6.0" featureSet="257" product="8.0(370)" ?>
<Document ${NS} DOMVersion="${DOM_VERSION}" Self="d" StoryList="${storyList}" ActiveLayer="${LAYER_SELF}">
${lines.join('\n')}
${layer}
${variables.join('\n')}
</Document>
`;
}

const TAGS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Tags ${NS} DOMVersion="${DOM_VERSION}">
  <XMLTag Self="XMLTag/Root" Name="Root">
    <Properties><TagColor type="enumeration">LightBlue</TagColor></Properties>
  </XMLTag>
</idPkg:Tags>
`;

const BACKING_STORY_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:BackingStory ${NS} DOMVersion="${DOM_VERSION}">
  <XmlStory Self="BackingStory_1" AppliedTOCStyle="n" TrackChanges="false" StoryTitle="$ID/" AppliedNamedGrid="n">
    <StoryPreference OpticalMarginAlignment="false" OpticalMarginSize="12" FrameType="TextFrameType" StoryOrientation="Horizontal" StoryDirection="LeftToRightDirection"/>
    <InCopyExportOption IncludeGraphicProxies="true" IncludeAllResources="false"/>
    <XMLElement Self="XMLElement/Root" MarkupTag="XMLTag/Root" XMLContent="BackingStory_1"/>
  </XmlStory>
</idPkg:BackingStory>
`;

const CONTAINER_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="designmap.xml" media-type="text/xml"/>
  </rootfiles>
</container>
`;

/**
 * Fichiers du paquet IDML, dans l'ordre d'écriture : `mimetype` en premier, stocké.
 * @returns {{ name: string, data: string, store?: boolean }[]}
 */
function buildIdmlEntries({ axis = DEFAULT_AXIS, masters = false, bulletFont = DEFAULT_BULLET_FONT, pages = null } = {}) {
  if (pages && !masters) throw new IdmlError('Les pages remplies exigent les gabarits (--gabarits).');
  const filled = pages ? filledPages(pages) : null;
  const built = masters ? MASTERS.map(master => buildMaster(master, { filled: Boolean(filled), contact: pages ? pages.contact : null, footer: pages ? pages.footer : undefined, mentions: pages ? pages.mentions : undefined })) : [];
  const storyFiles = [...built.flatMap(item => item.stories), ...(filled ? filled.stories : [])];
  // Sans pages remplies : une page courante sur le gabarit A (ou sans gabarit).
  const spreads = filled ? filled.spreads : [{ index: 1, master: masters ? 'A-Courante' : null, items: [] }];
  return [
    { name: 'mimetype', data: MIMETYPE, store: true },
    { name: 'META-INF/container.xml', data: CONTAINER_XML },
    { name: 'designmap.xml', data: designmapXml({ masters, storyFiles, spreadCount: spreads.length }) },
    { name: 'Resources/Graphic.xml', data: graphicXml(axis) },
    { name: 'Resources/Styles.xml', data: stylesXml(bulletFont) },
    { name: 'Resources/Preferences.xml', data: preferencesXml() },
    { name: 'XML/Tags.xml', data: TAGS_XML },
    { name: 'XML/BackingStory.xml', data: BACKING_STORY_XML },
    ...built.map(item => ({ name: masterFile(item.master), data: item.xml })),
    ...spreads.map(spread => ({ name: `Spreads/Spread_${spread.index}.xml`, data: spreadXml(spread) })),
    ...storyFiles.map(file => ({ name: `Stories/${file.self}.xml`, data: file.xml }))
  ];
}

/** Paquet IDML (zip) du modèle. */
function buildIdml(options) {
  return writeZip(buildIdmlEntries(options));
}

// Verbe d'ordre de la couverture quand aucun guide n'est désigné ; avec --guide, il vient de la configuration.
const DEFAULT_VERB = 'Maîtriser';

function outputPathFor(outDir, axis, guide) {
  return path.join(outDir, `scriptami-${axis}${guide ? `-${guide}` : ''}.idml`);
}

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    // Un `--` isolé (séparateur transmis tel quel par un gestionnaire de paquets) est ignoré.
    if (arg === '--') continue;
    if (arg === '--gabarits') {
      options.masters = true;
    } else if (arg === '--axe' || arg === '--sortie' || arg === '--police-puce' || arg === '--guide') {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('--')) throw new IdmlError(`${arg} attend une valeur.`);
      if (arg === '--axe') {
        if (!AXES[value]) throw new IdmlError(`Axe inconnu : ${value}. Valeurs acceptées : ${Object.keys(AXES).join(', ')}.`);
        options.axis = value;
      } else if (arg === '--guide') {
        // Validé par main() contre les guides de la configuration.
        options.guide = value;
        options.masters = true;
      } else if (arg === '--police-puce') {
        options.bulletFont = value;
      } else {
        options.outDir = path.resolve(value);
      }
      i += 1;
    } else {
      throw new IdmlError(`Option inconnue : ${arg}. Options : --axe <turquoise|orange|vert>, --gabarits, --guide <identifiant de la configuration>, --config <chemin>, --police-puce <police>, --sortie <dossier>.`);
    }
  }
  return options;
}

function main(argv) {
  try {
    const { configPath, rest } = extractConfigArg(argv);
    const { axis: requestedAxis, masters = false, bulletFont, outDir: requestedOutDir, guide: guideName } = parseArgs(rest);
    // La configuration n'est lue que pour un guide ou un chemin explicite : le modèle seul n'en dépend pas.
    const config = guideName || configPath ? loadConfig({ configPath }) : null;
    const guide = guideName ? findGuide(config, guideName) : null;
    const outDir = requestedOutDir ?? path.join(config ? config.outputDir : path.resolve('output'), IDML_DIR);
    const axis = requestedAxis || (guide ? guide.accent : DEFAULT_AXIS);
    // Couverture et fin remplies d'après le guide : titre, sous-titre, version, sommaire, contact et conseils de chaque guide.
    const pages = guide
      ? {
        ...guidePages(guide.dir, { guidesDir: config.sourceDir, pagesConfig: config.pagesFile, version: readVersion(config) }),
        label: guide.title,
        verb: guide.verb,
        tag: guide.type
      }
      : null;
    const file = outputPathFor(outDir, axis, guide ? guide.id : null);
    const data = buildIdml({ axis, masters, bulletFont, pages });
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(file, data);
    const detail = guide ? ` (gabarits A à D, couverture, sommaire et fin du guide ${guide.id} remplis)` : masters ? ' (avec les gabarits A à D)' : '';
    console.log(`Écrit : ${path.relative(process.cwd(), file)}${detail}`);
    return 0;
  } catch (error) {
    if (error instanceof PagesError) {
      console.error(error.message);
      console.error('Aucun fichier écrit.');
      return 1;
    }
    if (!(error instanceof IdmlError) && !(error instanceof ConfigError)) throw error;
    console.error(error.message);
    console.error('Aucun fichier écrit.');
    return 1;
  }
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = {
  buildIdml,
  buildIdmlEntries,
  outputPathFor,
  parseArgs,
  IdmlError,
  AXES,
  COLORS,
  FORMATS,
  CHARTER_ONLY,
  PAGE,
  MARGINS,
  COLUMNS,
  chapterBoxes,
  IDML_DIR,
  MIMETYPE
};
