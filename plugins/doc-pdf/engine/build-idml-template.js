#!/usr/bin/env node
/**
 * Génère un modèle IDML qui charge dans InDesign la charte de la maquette
 * externe (dossier `maquette.json`) : styles (paragraphe, caractère, tableau,
 * cellule, objet), nuances RVB, document A4 en vis-à-vis aux marges de la grille avec
 * 3 mm de fond perdu, et, avec --gabarits, les quatre gabarits de la charte :
 * A-Courante, B-Chapitre, C-Couverture, D-Fin.
 *
 *   node <racine du plugin>/engine/cli.js idml                       output/idml/<maquette>-<axe>.idml
 *   node <racine du plugin>/engine/cli.js idml --axe orange          couleur d'axe : turquoise | orange | vert
 *   node <racine du plugin>/engine/cli.js idml --gabarits            + gabarits A à D (pages courantes, ouverture, couverture, fin)
 *   node <racine du plugin>/engine/cli.js idml --police-puce <nom>   police du triangle ▶ des puces (défaut : Segoe UI Symbol)
 *   node <racine du plugin>/engine/cli.js idml --sortie <dossier>    dossier de sortie (défaut : <outputDir>/idml de la configuration)
 *   node <racine du plugin>/engine/cli.js idml --guide <id>          gabarits remplis pour un guide de documentation.config.json
 *                                                                    (titre, verbe, type, accent) ; --config <chemin> désigne la configuration
 *
 * Les noms des styles du jeu court viennent de la table « styles » de la maquette : le
 * modèle et les ICML exportés partagent leurs noms, InDesign n'a donc aucun doublon à
 * créer. Les mises en forme sont celles de la charte (section « Feuille de styles »).
 */

const fs = require('fs');
const path = require('path');
const { writeZip } = require('./zip-store');
const { PagesError, guidePages, mentionLines } = require('./icml-pages');
const { ConfigError, DEFAULT_TYPE, loadConfig, extractConfigArg, findGuide, readVersion } = require('./guide-config');
const { pictoGradients, wordmarkShapes, pictoFacets } = require('./logo');

/** Sous-dossier de la sortie du projet (`<outputDir>/idml`) ; sans configuration, `output/idml` sous le dossier courant. */
const IDML_DIR = 'idml';
const DOM_VERSION = '8.0';
const NS = 'xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"';
const MIMETYPE = 'application/vnd.adobe.indesign-idml-package';

/** Erreur attendue : son message suffit à l'utilisateur. */
class IdmlError extends Error {}

const mm = value => Math.round(value * 72 / 25.4 * 10000) / 10000;

// Grille, nuancier, axes et polices viennent de la maquette (engine/maquette.js) : `applyMaquette` les pose en fin de module
// et `buildIdmlEntries` les repose à chaque appel : le moteur n'embarque aucune maquette.
/** Grille de la maquette (points). */
/** Table des styles de la maquette (familles paragraph, character, table, cell, object). */
let STYLES;
let TXT;
let PAGE;
let MARGINS;
let COLUMNS;
/** Nuancier de la maquette, en RVB. */
let COLORS;
/** Trois tons par axe : la nuance « Axe … » prend les valeurs de l'axe choisi. */
let AXES;
let AXIS_TONES;
let DEFAULT_AXIS;
let LANGUAGE;

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

let QUICKSAND;
let PROZA;
let MONO;
// Ni Quicksand ni Proza Libre n'ont le triangle ▶ : sans police qui le porte, InDesign affiche un carré.
let DEFAULT_BULLET_FONT;
let DARK;
let TEXT;
let NU; // nuances nommées de la maquette
let LOGO_PATHS; // tracés du logo de la maquette
let PICTO; // picto facultatif de la maquette (null sans picto)

/**
 * Mise en forme de la charte, par famille et par nom de style. Sert aussi aux sept
 * styles de la charte que les ICML n'emploient pas (couverture, numéro de chapitre,
 * surtitre, chapeau, légende, titre courant, folio) et aux styles d'appui de leurs
 * listes. `attrs` : attributs IDML bruts. Les attributs de la table des styles (retraits de
 * liste…) complètent ce qui n'y figure pas.
 */
/** Filet sous un paragraphe, sur la largeur du cadre ; `offset` compté depuis la ligne de base. */
const ruleBelow = (color, weight, offset) => ({
  RuleBelowOn: 'true', RuleBelowColor: colorRef(color), RuleBelowLineWeight: String(weight),
  RuleBelowOffset: String(offset), RuleBelowWidth: 'ColumnWidth'
});

/** Mise en forme de la charte et styles déclarés sans entrée de table : lues dans la maquette (formats, charteSeule). */
let FORMATS;
let CHARTER_ONLY;

/** Remplace les jetons de la maquette : rôle de police (@titre, @texte, @code, @puce) et largeur utile de la page (@largeurUtile). */
function resolveFormats(formats, polices, usableWidth) {
  const tokens = { '@titre': polices.titre, '@texte': polices.texte, '@code': polices.code, '@puce': polices.puce, '@largeurUtile': usableWidth };
  const walk = value => {
    if (typeof value === 'string' && Object.prototype.hasOwnProperty.call(tokens, value)) return tokens[value];
    if (Array.isArray(value)) return value.map(walk);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, walk(item)]));
    return value;
  };
  return Object.freeze(walk(formats));
}

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

/** Définition d'un style : la table des styles complète la mise en forme de la charte. */
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
    if (format.hyphenate) properties.push(`<AppliedLanguage type="string">$ID/${LANGUAGE}</AppliedLanguage>`);
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

  // La table des styles (retraits des listes…) est posé plus haut ; la charte l'emporte sur ses tailles provisoires d'ICML.
  Object.assign(attributes, format.attrs);
  const open = `      <${element}${renderAttributes(attributes)}>`;
  return `${open}${renderProperties(properties)}</${element}>`;
}

/** Entrées de style d'une famille : la table des styles d'abord, puis les styles propres à la charte. */
function styleEntries(family) {
  const fromTable = STYLES[family].map(entry => ({ name: entry.name, attributes: entry.attributes }));
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
    ...pictoGradients(PICTO).flatMap(({ name, stops }) => [
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

let LAYER;
let LAYER_SELF;
let FRAME_PAGES; // noms des cadres de page d'exemple
let MASTER_NAMES; // nom de gabarit par rôle
let HEADER_TOP;
let HEADER_HEIGHT;
let RULE_Y;
let DASH_LENGTH; // pointillé de pliage : trait
let DASH_GAP; // pointillé de pliage : blanc
let RULE_WEIGHT; // pointillé du titre courant et pointillé de pliage : même épaisseur
let FOOTER_HEIGHT;
// Un seul texte de pied pour tous les gabarits (celui de `common/pied.icml` quand un guide est choisi), un seul style, une seule largeur.
let FOOTER_TEXT;
let FOOTER_WIDTH;
let CORNER; // coin plié des pages courantes
let FOLIO_WIDTH; // largeur du cadre du folio, centré dans le rabat du coin
let FOOTER_BAND; // pied anthracite de la dernière page
let PAPER;
let ORANGE;

/** Gabarits de la maquette : courante (double), chapitre, couverture, fin. */
let MASTERS;
const masterSelf = name => `Master_${name}`;

/** Variables de texte des titres courants (maquette.variables). */
let TEXT_VARIABLES;

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

let pageEdges;
let headerBox;
let footerBox;

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
  builder.polygon(`pli-${side}`, [[x, height - CORNER], [x + dir * CORNER, height], [x + dir * CORNER, height - CORNER]], NU.axeVif);
  // Pointillé de pliage : prolonge le bord haut du rabat, de la marge intérieure au rabat, et sépare le pied de page du corps.
  const edges = [pageEdges[side].inner, x + dir * CORNER].sort((a, b) => a - b);
  builder.line(`pli-pointille-${side}`, edges[0], edges[1], foldRuleY(), NU.axeVif, { dotted: true });
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
 * texte, pointillé orange, folio et coin plié du côté extérieur, pied de page de la maquette côté
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
  builder.line('en-tete-gauche', left.outer, left.inner, RULE_Y, NU.axeVif, { dotted: true });
  builder.frame('folio-gauche', foldFolioBox('left'), [para('Folio', [{ folio: true }], { justification: 'CenterAlign', fill: PAPER })]);
  builder.frame('pied-gauche', { left: left.inner - FOOTER_WIDTH, right: left.inner, ...footerBox },
    [para('Titre-courant', [{ text: footer }], { justification: 'RightAlign' })]);

  builder.frame('en-tete-droite-chapitre', { left: right.inner, right: rightMid, ...headerBox },
    [para('En-tête-chapitre', [{ text: 'Chapitre 00' }])]);
  builder.frame('en-tete-droite-titre', { left: rightMid, right: right.outer, ...headerBox },
    [para('Titre-courant', [{ text: 'Titre du chapitre ' }, { text: '▶', character: 'Puce' }], { justification: 'RightAlign' })]);
  builder.line('en-tete-droite', right.inner, right.outer, RULE_Y, NU.axeVif, { dotted: true });
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
let FLANK_TONES;

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

  builder.rectangle('fond', { left: 0, right, top: -bleed, bottom }, NU.papierPage);
  builder.polygon('fond-haut', [[0, -bleed], [right, -bleed], [right, diagonal(right)], [0, diagonal(0)]], NU.axeFond);

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
  builder.polygon('coin-bas', [[right - mm(26), bottom], [right, bottom], [right, bottom - mm(26)]], NU.axeVif);

  // Même pointillé de pliage que sur A-Courante, sur la largeur de la colonne de texte, au-dessus du pied.
  builder.line('pli-pointille', inner, inner + CHAPTER_WIDTH, foldRuleY(), NU.axeVif, { dotted: true });
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

// Contour du cadre du type de document : 1,25 pt sur la maquette, 2 pt ici pour qu'il ressorte à l'écran sur l'aplat.
const TAG_STROKE = 2;

/**
 * Textes de la couverture portés par des cadres : gabarit C (repères, sans titre) ou page
 * remplie (`title` et `version` renseignés).
 */
function coverTexts(builder, { tag = DEFAULT_TYPE, verb = `${TXT.verbeDefaut} · ${TXT.libelleGuideDefaut}`, title = null, subtitle = TXT.sousTitreDefaut, version = null } = {}) {
  const boxes = coverBoxes();
  builder.frame('type-document', boxes.tagText, [para('Type-document', [{ text: tag }], { justification: 'CenterAlign' })]);
  builder.frame('verbe', boxes.verb, [para('Surtitre', [{ text: verb }], { fill: NU.axeTexte })]);
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
  builder.rectangle('fond', { left: 0, right, top: -bleed, bottom: height + bleed }, NU.papierPage);
  builder.polygon('bandeau', [[0, -bleed], [topSplit, -bleed], orangeBottomRight, [0, 0.543 * height]], NU.orange);
  builder.polygon('bandeau-turquoise', [[topSplit, -bleed], [right, -bleed], [right, rightSplit], meeting, orangeBottomRight], NU.turquoise);
  builder.polygon('bandeau-vert', [meeting, [right, rightSplit], [right, 0.493 * height]], NU.vert);

  builder.vector('logo', wordmarkShapes(LOGO_PATHS, { left: inner, top: boxes.logo.top, width: boxes.logo.right - boxes.logo.left }).subpaths, DARK);
  builder.rectangle('type-document-cadre', boxes.tagRectangle, NU.papierPage, { color: DARK, weight: TAG_STROKE });
  builder.frame('signature-marque', boxes.tagline,
    TXT.marque
      // Les trois lignes présentent les trois guides, sans en mettre un en avant : le verbe du document est sur la ligne de surtitre.
      .map(({ mot: word, suite: rest }) => para('Légende', [{ text: word, character: 'Gras' }, { text: rest }], { fill: DARK })));
  const { left, top, size } = boxes.verbTriangle;
  builder.polygon('verbe-triangle', [[left, top], [left + size, top + size / 2], [left, top + size]], NU.axeVif);
  // Même pointillé orange que le pli des pages courantes (plus un filet plein sombre).
  builder.line('pied-filet', inner, outer, boxes.rule.y, NU.axeVif, { dotted: true });
  builder.frame('signature', boxes.signature,
    [para('Légende', [{ text: TXT.signature }], { fill: DARK, justification: 'RightAlign' })]);

  // Page remplie : le texte vit dans des cadres de la page, le gabarit n'en porte pas (pas de doublon).
  if (filled) return;
  coverTexts(builder);
  // Un seul cadre pour titre, version et sommaire : l'ICML 00-pages/couverture.icml s'y place d'un bloc.
  builder.frame('texte-couverture', coverTextBox(),
    [
      para('Titre-couverture', [{ variable: 'Titre du document' }]),
      para('Surtitre', [{ variable: 'Version' }]),
      para('Sommaire-général', [{ text: TXT.sommaire }]),
      para('Sommaire-ligne', [{ text: TXT.reperes.couvertureSommaire }])
    ]);
}

/**
 * D-Fin : fond papier, bloc contact inséré entre les marges (coin bas gauche coupé), trois
 * cartes de la couleur du papier à bordure sombre, deux colonnes de conseils côte à côte sous un filet,
 * pied anthracite à filet orange. Le contact (titre, accroche, trois cartes) est propre au guide.
 */
function masterD(builder, { filled = false, contact = null, mentions = TXT.mentionsDefaut } = {}) {
  const { titre, accroche, cartes } = contact || TXT.contactDefaut;
  const { width, height, bleed } = PAGE;
  const right = width + bleed;
  const inner = pageEdges.right.inner;
  const outer = pageEdges.right.outer;
  const bannerBottom = endBannerBottom();
  const { top: bannerTop, cut } = END_BANNER;
  const padding = 20;
  builder.rectangle('fond', { left: 0, right, top: -bleed, bottom: height + bleed }, NU.papierPage);
  builder.polygon('bandeau-contact', [[inner, bannerTop], [outer, bannerTop], [outer, bannerBottom], [inner + cut, bannerBottom], [inner, bannerBottom - cut]], NU.axeVif);
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
    builder.rectangle(`carte-${index + 1}`, { left, right: left + cardWidth, top: cardsTop, bottom: cardsTop + END_CARD_HEIGHT }, NU.papierPage, { color: DARK, weight: 1 });
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
        para('Surtitre', [{ text: TXT.reperes.conseilsTitre }]),
        para('Courant', [{ text: TXT.reperes.conseilsCorps }])
      ], { columns: 2 });
  }

  const footerTop = height - FOOTER_BAND;
  builder.rectangle('pied-anthracite', { left: 0, right, top: footerTop, bottom: height + bleed }, DARK);
  builder.rectangle('pied-filet', { left: 0, right, top: footerTop, bottom: footerTop + 4.5 }, ORANGE);
  // Picto seul (sans le mot) sur la zone noire ; le texte de pied s'aligne à sa droite.
  const picto = PICTO ? pictoFacets(PICTO, { left: inner, top: footerTop + 22, height: PICTO_HEIGHT }) : null;
  if (picto) picto.facets.forEach(({ name, points, gradient, opacity }) => builder.gradientPolygon(`picto-${name}`, points, { gradient, opacity }));
  builder.frame('pied-texte', { left: inner + (picto ? picto.width + 18 : 0), right: outer, top: footerTop + 22, bottom: height - 8 },
    mentionLines(mentions).map(({ style, text }) => para(style, [{ text }])));
}

const MASTER_BUILDERS = { courante: masterA, chapitre: masterB, couverture: masterC, fin: masterD };

function marginsXml(master, side) {
  if (master.role === 'courante' || master.role === 'chapitre') return pageMargins(side);
  return `<MarginPreference ColumnCount="1" ColumnGutter="${COLUMNS.gutter}" Top="${MARGINS.top}" Bottom="${MARGINS.bottom}" Left="${MARGINS.inner}" Right="${MARGINS.outer}" ColumnDirection="Horizontal"/>`;
}

/** Gabarit complet : `{ master, xml, stories }`. Les pages simples sont des pages de droite. */
function buildMaster(master, { filled = false, contact = null, footer = FOOTER_TEXT, mentions = TXT.mentionsDefaut } = {}) {
  const { width, height } = PAGE;
  const half = height / 2;
  const builder = masterBuilder(master.name);
  MASTER_BUILDERS[master.role](builder, { filled, contact, footer, mentions });
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

/** « p. N » si la configuration du guide donne la page du chapitre (clé « N » sans zéro initial), sinon le libellé à remplacer. */
function summaryPageLabel(pageNumbers, number) {
  const page = pageNumbers ? pageNumbers[String(Number.parseInt(number, 10))] : undefined;
  return page === undefined ? TXT.pageSommaire : `${TXT.pageSommairePrefixe}${page}`;
}
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
    para('Surtitre', [{ text: TXT.sommaire }], { attrs: { ...heavy, SpaceAfter: '6' } }),
    ...rows
  ];
}

/** Texte du premier paragraphe d'un style dans une liste `{ style, text }`. */
const textOfStyle = (list, style) => (list.find(item => item.style === style) || {}).text;

const BODY_TOP = 56; // sous le filet de l'en-tête (34 pt), comme la maquette
let BODY_BOTTOM;
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
  const note = value => para('Note-renvoi', [{ text: TXT.noteRenvoi, character: 'Encadré-libellé' }, { text: ` ${value}` }]);
  const paragraph = ({ style, libelle, texte }) => (libelle ? boxPara(style, libelle, texte) : para(style, [{ text: texte }]));
  return TXT.pagesExemple.map(({ section, rubrique, renvoi, blocs }) => ({
    paragraphs: blocs.map(paragraph),
    margin: [para('Numéro-section', [{ text: section }]), para('Surtitre', [{ text: rubrique }])],
    note: renvoi ? [note(renvoi)] : null
  }));
}


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
  const [, number = TXT.chapitre.numeroDefaut, title = TXT.chapitre.titreDefaut] = lines[1] || lines[0] || [];
  const titleParts = accentedTitle(title);
  const heavy = { RuleAboveLineWeight: '3', RuleAboveColor: colorRef(DARK), SpaceBefore: '0', SpaceAfter: '4' };
  const sections = TXT.chapitre.sections.map((section, index) => para('Sommaire-section',
    [
      { text: `${Number.parseInt(number, 10)}.${index + 1}`, character: 'Sommaire-numéro' },
      { text: '\t' },
      { text: section },
      { text: '\t' },
      { text: TXT.pageSommaire, character: 'Sommaire-page' }
    ],
    index === TXT.chapitre.sections.length - 1 ? { attrs: ruleBelow(DARK, 3, 10) } : {}));
  return {
    kicker: [para('Surtitre', [{ text: TXT.chapitre.surtitre }])],
    number: [para('Numéro-chapitre', [{ text: number }])],
    title: [para('Titre-chapitre', titleParts)],
    lead: [para('Chapeau', [{ text: TXT.chapitre.chapeau }])],
    contents: [para('Sommaire-titre', [{ text: '▶', character: 'Puce' }, { text: ` ${TXT.chapitre.dansCeChapitre}` }], { attrs: heavy }), ...sections]
  };
}

/**
 * Pages d'exemple remplies : couverture (gabarit C), double page 2-3 (sommaire sur A-Courante,
 * ouverture de chapitre sur B-Chapitre), deux doubles pages de texte courant sur A-Courante
 * (pages 4 à 7, pour juger titres courants, folio et pied), puis fin (gabarit D). Les cadres
 * sont libres, posés sur la page, donc modifiables sans surcharge d'élément de gabarit.
 * @returns {{ spreads: object[], stories: { self: string, xml: string }[] }}
 */
function filledPages({ cover, end, pages: pageNumbers, subtitle = TXT.sousTitreDefaut, label = TXT.libelleGuideDefaut, verb = TXT.verbeDefaut, tag = DEFAULT_TYPE }) {
  const coverBuilder = masterBuilder(FRAME_PAGES.couverture);
  coverTexts(coverBuilder, {
    tag,
    verb: `${verb} · ${label}`,
    title: textOfStyle(cover, 'Titre-couverture') || '',
    subtitle,
    version: textOfStyle(cover, 'Surtitre') || ''
  });
  const summaryBuilder = masterBuilder(FRAME_PAGES.sommaire);
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
    const builder = masterBuilder(`${FRAME_PAGES.textePrefixe}${index + 1}`);
    const [leftPage, rightPage] = sampleBodyPages().slice(index * 2, index * 2 + 2);
    const placed = [['gauche', 'left', leftPage], ['droite', 'right', rightPage]].map(([label, side, page]) => ({ label, boxes: bodyBoxes(side), page }));
    placed.forEach(({ label, boxes, page }) => builder.frame(`corps-${label}`, boxes.text, page.paragraphs));
    placed.forEach(({ label, boxes, page }) => builder.frame(`marginale-${label}`, { ...boxes.margin, bottom: BODY_TOP + SECTION_HEIGHT }, page.margin));
    placed.filter(({ page }) => page.note).forEach(({ label, boxes, page }) => builder.frame(`renvoi-${label}`, { ...boxes.margin, top: NOTE_TOP, bottom: NOTE_TOP + NOTE_HEIGHT }, page.note));
    return builder;
  });
  const endBuilder = masterBuilder(FRAME_PAGES.fin);
  endBuilder.frame('conseils-fin', endTextBox(), filledParagraphs(end), { columns: 2 });
  const textSpread = (index, first, builder) => ({
    index,
    pages: [{ master: MASTER_NAMES.courante, side: 'left', name: String(first) }, { master: MASTER_NAMES.courante, side: 'right', name: String(first + 1) }],
    items: builder.items
  });
  return {
    spreads: [
      { index: 1, master: MASTER_NAMES.couverture, items: coverBuilder.items },
      {
        index: 2,
        pages: [{ master: MASTER_NAMES.courante, side: 'left', name: '2' }, { master: MASTER_NAMES.chapitre, side: 'right', name: '3' }],
        items: summaryBuilder.items
      },
      textSpread(3, 4, textBuilders[0]),
      textSpread(4, 6, textBuilders[1]),
      { index: 5, master: MASTER_NAMES.fin, items: endBuilder.items, name: '8' }
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
  const layer = `  <Layer Self="${LAYER_SELF}" Name="${escapeXml(LAYER.nom)}" Visible="true" Locked="false" IgnoreWrap="false" ShowGuides="true" LockGuides="false" UI="true" Expendable="true" Printable="true">\n    <Properties><LayerColor type="enumeration">LightBlue</LayerColor></Properties>\n  </Layer>`;
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
/** Pose la maquette : grille, nuancier, polices, entête et pied, puis les valeurs qui en dérivent. */
function applyMaquette(maquette) {
  const { page, entetePied: header, polices } = maquette;
  PAGE = { width: mm(page.largeurMm), height: mm(page.hauteurMm), bleed: mm(page.fondPerduMm) };
  MARGINS = { top: mm(page.marges.hautMm), bottom: mm(page.marges.basMm), inner: mm(page.marges.interieureMm), outer: mm(page.marges.exterieureMm) };
  COLUMNS = { text: mm(page.colonnes.texteMm), gutter: mm(page.colonnes.gouttiereMm), margin: mm(page.colonnes.marginaleMm) };
  STYLES = maquette.styles;
  TXT = maquette.textes;
  NU = maquette.nuances;
  LOGO_PATHS = maquette.logo.chemins;
  PICTO = maquette.picto;
  DARK = NU.sombre;
  TEXT = NU.texte;
  PAPER = NU.papier;
  ORANGE = NU.orange;
  FLANK_TONES = Object.freeze(NU.flanc.map(pair => Object.freeze([...pair])));
  COLORS = maquette.couleurs;
  AXES = maquette.axes.noms;
  AXIS_TONES = maquette.axes.tons;
  DEFAULT_AXIS = maquette.axes.defaut;
  LANGUAGE = maquette.langue;
  QUICKSAND = polices.titre;
  PROZA = polices.texte;
  MONO = polices.code;
  DEFAULT_BULLET_FONT = polices.puce;
  HEADER_TOP = header.enteteHaut;
  HEADER_HEIGHT = header.enteteHauteur;
  RULE_Y = header.filetY;
  DASH_LENGTH = header.pointilleTrait;
  DASH_GAP = header.pointilleBlanc;
  RULE_WEIGHT = header.filetEpaisseur;
  FOOTER_HEIGHT = header.piedHauteur;
  FOOTER_TEXT = header.piedTexte;
  FOOTER_WIDTH = header.piedLargeur;
  CORNER = mm(header.coinMm);
  FOLIO_WIDTH = header.folioLargeur;
  FOOTER_BAND = mm(header.bandePiedMm);
  pageEdges = {
    left: { outer: -PAGE.width + MARGINS.outer, inner: -MARGINS.inner },
    right: { inner: MARGINS.inner, outer: PAGE.width - MARGINS.outer }
  };
  headerBox = { top: HEADER_TOP, bottom: HEADER_TOP + HEADER_HEIGHT };
  footerBox = { top: PAGE.height - 14 - FOOTER_HEIGHT, bottom: PAGE.height - 14 };
  BODY_BOTTOM = PAGE.height - 70;
  FORMATS = resolveFormats(maquette.formats, polices, PAGE.width - MARGINS.inner - MARGINS.outer);
  CHARTER_ONLY = maquette.charteSeule;
  LAYER = maquette.cadres.calque;
  LAYER_SELF = LAYER.id;
  FRAME_PAGES = maquette.cadres.pages;
  MASTERS = maquette.gabarits.map(({ nom, prefixe, base, pages, role }) => Object.freeze({ name: nom, prefix: prefixe, base, pages, role }));
  MASTER_NAMES = Object.fromEntries(MASTERS.map(master => [master.role, master.name]));
  TEXT_VARIABLES = maquette.variables.map(({ nom, type, contenu, style }) => (type === 'texte'
    ? { name: nom, type: 'CustomTextType', contents: contenu }
    : { name: nom, type: 'MatchParagraphStyleType', style }));
}

function buildIdmlEntries({ axis, masters = false, bulletFont, pages = null, maquette } = {}) {
  if (!maquette) throw new IdmlError('Une maquette est requise (champ « maquette » de la configuration).');
  applyMaquette(maquette);
  axis = axis || DEFAULT_AXIS;
  bulletFont = bulletFont || DEFAULT_BULLET_FONT;
  if (pages && !masters) throw new IdmlError('Les pages remplies exigent les gabarits (--gabarits).');
  const filled = pages ? filledPages(pages) : null;
  const built = masters ? MASTERS.map(master => buildMaster(master, { filled: Boolean(filled), contact: pages ? pages.contact : null, footer: pages ? pages.footer : undefined, mentions: pages ? pages.mentions : undefined })) : [];
  const storyFiles = [...built.flatMap(item => item.stories), ...(filled ? filled.stories : [])];
  // Sans pages remplies : une page courante sur le gabarit A (ou sans gabarit).
  const spreads = filled ? filled.spreads : [{ index: 1, master: masters ? MASTER_NAMES.courante : null, items: [] }];
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

function outputPathFor(outDir, axis, guide, maquette) {
  return path.join(outDir, `${maquette.nom}-${axis}${guide ? `-${guide}` : ''}.idml`);
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
        // Validé par main() contre les axes de la maquette.
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
      throw new IdmlError(`Option inconnue : ${arg}. Options : --axe <axe de la maquette>, --gabarits, --guide <identifiant de la configuration>, --config <chemin>, --police-puce <police>, --sortie <dossier>.`);
    }
  }
  return options;
}

function main(argv) {
  try {
    const { configPath, rest } = extractConfigArg(argv);
    const { axis: requestedAxis, masters = false, bulletFont, outDir: requestedOutDir, guide: guideName } = parseArgs(rest);
    // La maquette vient de la configuration : elle est toujours lue.
    const config = loadConfig({ configPath });
    const guide = guideName ? findGuide(config, guideName) : null;
    const outDir = requestedOutDir ?? path.join(config.outputDir, IDML_DIR);
    const { maquette } = config;
    const axes = Object.keys(maquette.axes.noms);
    if (requestedAxis !== undefined && !axes.includes(requestedAxis)) {
      throw new IdmlError(`Axe inconnu : ${requestedAxis}. Valeurs acceptées : ${axes.join(', ')}.`);
    }
    const axis = requestedAxis || (guide ? guide.accent : maquette.axes.defaut);
    // Couverture et fin remplies d'après le guide : titre, sous-titre, version, sommaire, contact et conseils de chaque guide.
    const pages = guide
      ? {
        ...guidePages(guide.dir, { title: guide.title, guidesDir: config.sourceDir, pagesConfig: config.pagesFile, version: readVersion(config), maquette }),
        label: guide.title,
        verb: guide.verb,
        tag: guide.type
      }
      : null;
    const file = outputPathFor(outDir, axis, guide ? guide.id : null, maquette);
    const data = buildIdml({ axis, masters, bulletFont, pages, maquette });
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
  main,
  buildIdml,
  buildIdmlEntries,
  outputPathFor,
  parseArgs,
  IdmlError,
  applyMaquette,
  chapterBoxes,
  IDML_DIR,
  MIMETYPE
};
