/**
 * Transforme l'ICML produit par `pandoc -f gfm -t icml -s` en ICML aux styles
 * de la charte Scriptami (jeu court), prêt à être lié dans InDesign.
 *
 * Fonction pure : aucune lecture disque. L'existence des images est vérifiée
 * par l'appelant (export-icml.js).
 *
 * - chaque style Pandoc composé est ramené à un nom de la table des styles de la maquette, tout autre
 *   nom arrête la transformation ;
 * - légendes de tableau vides, liens et ancres sont retirés (sans objet sur papier) ;
 * - chaque image seule dans son paragraphe devient une capture ancrée : style de
 *   paragraphe et d'objet « Capture », URI absolue, largeur plafonnée à la colonne ;
 * - chaque tableau prend la largeur de la colonne, répartie selon le texte des
 *   colonnes (Pandoc n'en donne aucune : InDesign les écraserait au minimum) ;
 * - une citation `> **Bon à savoir** …` devient un encadré (Attention, À retenir,
 *   Renvoi de même), un mot en italique dans un titre prend le style Accent ;
 * - avec un numéro de chapitre : surtitre, numéro et chapeau, sommaire « Dans ce
 *   chapitre » et numéro « N.M » avant chaque Intertitre-1 ;
 * - les définitions de styles sont réécrites : exactement les styles utilisés.
 */

const path = require('path');
const url = require('url');


const CAPTURE_STYLE = 'Capture';

/** Préfixe de `Self`/`Applied*Style` et élément de déclaration, par famille. */
const FAMILIES = {
  paragraph: { prefix: 'ParagraphStyle/', element: 'ParagraphStyle', group: 'RootParagraphStyleGroup', groupSelf: 'pandoc_paragraph_styles', native: '$ID/NormalParagraphStyle' },
  character: { prefix: 'CharacterStyle/', element: 'CharacterStyle', group: 'RootCharacterStyleGroup', groupSelf: 'pandoc_character_styles', native: '$ID/NormalCharacterStyle' },
  table: { prefix: 'TableStyle/', element: 'TableStyle', group: 'RootTableStyleGroup', groupSelf: 'pandoc_table_styles', native: null },
  cell: { prefix: 'CellStyle/', element: 'CellStyle', group: 'RootCellStyleGroup', groupSelf: 'pandoc_cell_styles', native: null },
  object: { prefix: 'ObjectStyle/', element: 'ObjectStyle', group: 'RootObjectStyleGroup', groupSelf: 'cerascan_object_styles', native: null }
};

const APPLIED_ATTRIBUTE = { Paragraph: 'paragraph', Character: 'character', Table: 'table', Cell: 'cell' };

const FAMILY_LABEL = { paragraph: 'paragraphe', character: 'caractère', table: 'tableau', cell: 'cellule', object: 'objet' };

function decodeXml(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Index Pandoc → nom du jeu court, par famille. */
function buildReverseIndex(table) {
  const index = {};
  for (const family of Object.keys(table)) {
    index[family] = new Map();
    for (const entry of table[family]) {
      for (const pandocName of entry.pandoc) {
        index[family].set(pandocName, entry.name);
      }
    }
  }
  return index;
}

/** URI de lien InDesign d'un fichier, seule forme écrite dans `LinkResourceURI`. */
function toLinkUri(absPath) {
  return url.pathToFileURL(absPath).href;
}

function formatNumber(value) {
  return String(Number(value.toFixed(4)));
}

function scaleNumbers(text, factor) {
  return text.trim().split(/\s+/).map((n) => formatNumber(Number(n) * factor)).join(' ');
}

function splitDocument(icml) {
  const start = icml.indexOf('<Story');
  const endTag = '</Story>';
  const end = icml.indexOf(endTag, start);
  if (start === -1 || end === -1) {
    throw new Error('ICML sans élément Story : sortie Pandoc inattendue.');
  }
  return {
    head: icml.slice(0, start),
    // Pandoc active l'alignement optique des marges : le texte déborderait du cadre à l'import,
    // alors que le modèle IDML le désactive. Les ICML le désactivent aussi.
    story: icml.slice(start, end + endTag.length).replace(/(<StoryPreference[^>]*OpticalMarginAlignment=")true"/, '$1false"'),
    tail: icml.slice(end + endTag.length)
  };
}

function removeLinks(story, tail) {
  const cleanStory = story
    .replace(/^[ \t]*<HyperlinkTextDestination\b[^>]*\/>[ \t]*\r?\n?/gm, '')
    .replace(/<HyperlinkTextDestination\b[^>]*\/>/g, '')
    .replace(/^[ \t]*<HyperlinkTextSource\b[^>]*>[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*<\/HyperlinkTextSource>[ \t]*\r?\n?/gm, '')
    .replace(/<\/?HyperlinkTextSource\b[^>]*>/g, '');
  const cleanTail = tail
    .replace(/^[ \t]*<HyperlinkURLDestination\b[^>]*\/>[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*<Hyperlink\b[^>]*\/>[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*<Hyperlink\b[^>]*>[\s\S]*?<\/Hyperlink>[ \t]*\r?\n?/gm, '');
  return { story: cleanStory, tail: cleanTail };
}

/**
 * Retire les légendes de tableau vides. Le `<Br />` qui suit est gardé : chez
 * Pandoc, tableau et légende forment un seul paragraphe que ce saut clôt ; le
 * retirer collerait le tableau au bloc suivant.
 */
function removeEmptyTableCaptions(story) {
  return story.replace(
    /<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle\/(?:[^"]*? &gt; )?TableCaption"[^>]*>\s*<\/ParagraphStyleRange>[ \t]*\r?\n?/g,
    ''
  );
}

function mapAppliedStyles(story, reverseIndex) {
  const unknown = [];
  const mapped = story.replace(/Applied(Paragraph|Character|Table|Cell)Style="([^"]*)"/g, (match, kind, value) => {
    const family = APPLIED_ATTRIBUTE[kind];
    const { prefix } = FAMILIES[family];
    const bare = value.startsWith(prefix) ? value.slice(prefix.length) : value;
    if (bare.startsWith('$ID/')) {
      return match;
    }
    const pandocName = decodeXml(bare);
    const shortName = reverseIndex[family].get(pandocName);
    if (!shortName) {
      unknown.push({ family, name: pandocName });
      return match;
    }
    return `Applied${kind}Style="${prefix}${escapeXml(shortName)}"`;
  });
  return { story: mapped, unknown };
}

function describeUnknown(unknown) {
  const seen = new Set();
  const labels = [];
  for (const { family, name } of unknown) {
    const label = `${FAMILY_LABEL[family]} « ${name} »`;
    if (!seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  }
  return labels;
}

function rectangleWidth(rectangle) {
  const xs = [...rectangle.matchAll(/Anchor="(-?[\d.]+) (-?[\d.]+)"/g)].map((m) => Number(m[1]));
  if (xs.length === 0) {
    return null;
  }
  return Math.max(...xs) - Math.min(...xs);
}

function scaleRectangle(rectangle, factor) {
  return rectangle
    .replace(/(<PathPointType\b[^>]*)/g, (point) => point.replace(
      /(Anchor|LeftDirection|RightDirection)="([^"]*)"/g,
      (m, attr, coords) => `${attr}="${scaleNumbers(coords, factor)}"`
    ))
    .replace(/(<Rectangle\b[^>]*ItemTransform=")([^"]*)(")/, (m, before, transform, after) => {
      const [a, b, c, d, tx, ty] = transform.trim().split(/\s+/).map(Number);
      return `${before}${[a, b, c, d, tx * factor, ty * factor].map(formatNumber).join(' ')}${after}`;
    })
    .replace(/(<Image\b[^>]*ItemTransform=")([^"]*)(")/, (m, before, transform, after) => (
      `${before}${scaleNumbers(transform, factor)}${after}`
    ));
}

function toCapture(rectangle, { chapterDir, columnWidth, images }) {
  let result = rectangle.replace(/<Rectangle\b(?![^>]*AppliedObjectStyle)/, `<Rectangle AppliedObjectStyle="${FAMILIES.object.prefix}${CAPTURE_STYLE}"`);
  result = result.replace(/LinkResourceURI="([^"]*)"/g, (m, uri) => {
    const relative = decodeURI(decodeXml(uri).replace(/^file:/, ''));
    const absolute = path.resolve(chapterDir, relative);
    if (!images.includes(absolute)) {
      images.push(absolute);
    }
    return `LinkResourceURI="${escapeXml(toLinkUri(absolute))}"`;
  });
  const width = rectangleWidth(result);
  if (width && width > columnWidth) {
    result = scaleRectangle(result, columnWidth / width);
  }
  return result;
}

/**
 * Paragraphe dont le seul contenu est un Rectangle (les espaces et tabulations
 * que Pandoc place devant une image d'item de liste ne comptent pas).
 */
function convertCaptures(story, options) {
  return story.replace(/<ParagraphStyleRange\b([^>]*)>([\s\S]*?)<\/ParagraphStyleRange>/g, (paragraph, attributes, body) => {
    const rectangles = body.match(/<Rectangle\b[\s\S]*?<\/Rectangle>/g);
    if (!rectangles || rectangles.length !== 1) {
      return paragraph;
    }
    const rest = body.replace(rectangles[0], '');
    const contents = [...rest.matchAll(/<Content>([\s\S]*?)<\/Content>/g)].map((m) => m[1]);
    const onlyWhitespace = contents.every((text) => text.trim() === '');
    const otherElements = rest
      .replace(/<\/?CharacterStyleRange\b[^>]*>/g, '')
      .replace(/<Content>[\s\S]*?<\/Content>/g, '')
      .trim();
    if (!onlyWhitespace || otherElements !== '') {
      return paragraph;
    }
    const cleanBody = body
      .replace(/[ \t]*<CharacterStyleRange\b[^>]*>\s*<Content>\s*<\/Content>\s*<\/CharacterStyleRange>[ \t]*\r?\n?/g, '')
      .replace(rectangles[0], toCapture(rectangles[0], options));
    const cleanAttributes = attributes.replace(
      /AppliedParagraphStyle="[^"]*"/,
      `AppliedParagraphStyle="${FAMILIES.paragraph.prefix}${CAPTURE_STYLE}"`
    );
    return `<ParagraphStyleRange${cleanAttributes}>${cleanBody}</ParagraphStyleRange>`;
  });
}

/** Approximation de la largeur d'un caractère (pt) pour un corps de texte de 9 à 11 pt. */
const CHAR_WIDTH = 5.2;
/** Marge intérieure d'une cellule, en caractères, ajoutée au plus long mot d'une colonne. */
const CELL_PADDING_CHARS = 2;
/** Bornes, en caractères, du texte le plus long retenu pour répartir le reste de la largeur. */
const MIN_COLUMN_WEIGHT = 8;
const MAX_COLUMN_WEIGHT = 60;

function cellText(body) {
  return [...body.matchAll(/<Content>([\s\S]*?)<\/Content>/g)].map((m) => decodeXml(m[1])).join('').trim();
}

const NBSP = '\u00A0';
const NNBSP = '\u202F';
const CHARACTER_RANGE = /(<CharacterStyleRange\b[^>]*AppliedCharacterStyle="([^"]*)"[^>]*>)([\s\S]*?)(<\/CharacterStyleRange>)/g;
const CONTENT_ELEMENT = /(<Content>)([^<]*)(<\/Content>)/g;

/** Typographie française d'un texte : apostrophe courbe, insécables avant « : » « ; » « ! » « ? » « % » « » », après « «  ». */
function frenchTypography(text) {
  return text
    .replace(/(\p{L})'(?=\p{L})/gu, '$1’')
    .replace(/ +([:»%])/g, `${NBSP}$1`)
    .replace(/ +([;!?])/g, `${NNBSP}$1`)
    .replace(/«  */g, `«${NBSP}`)
    .replace(/(\d) (?=%)/g, `$1${NBSP}`);
}

/**
 * Applique la typographie française au texte de l'histoire, sauf dans le style « Code-inline »
 * (noms de champ et valeurs saisies, à garder tels quels).
 */
function applyFrenchTypography(story) {
  return story.replace(CHARACTER_RANGE, (range, open, style, inner, close) => {
    if (style.endsWith('/Code-inline')) return range;
    return open + inner.replace(CONTENT_ELEMENT, (_, a, text, b) => a + frenchTypography(text) + b) + close;
  });
}

/**
 * Donne à chaque colonne de tableau une largeur (`SingleColumnWidth`) dont la
 * somme est la largeur de la colonne de texte : d'abord de quoi tenir le plus
 * long mot de la colonne (aucun mot coupé), puis le reste au prorata du texte
 * le plus long. Si les plus longs mots ne tiennent pas, ils se partagent la
 * largeur au prorata.
 */
function sizeTables(story, columnWidth) {
  return story.replace(/<Table [^>]*>[\s\S]*?<\/Table>/g, (table) => {
    const stats = new Map();
    for (const [, column, body] of table.matchAll(/<Cell Name="(\d+):\d+"[^>]*>([\s\S]*?)<\/Cell>/g)) {
      const text = cellText(body);
      const current = stats.get(column) || { length: 0, word: 0 };
      current.length = Math.max(current.length, text.length);
      current.word = Math.max(current.word, ...text.split(/\s+/).map((word) => word.length));
      stats.set(column, current);
    }
    const columns = [...table.matchAll(/<Column Name="(\d+)"/g)].map((m) => m[1]);
    const minimums = columns.map((column) => (((stats.get(column) || {}).word || 0) + CELL_PADDING_CHARS) * CHAR_WIDTH);
    const weights = columns.map((column) => Math.min(MAX_COLUMN_WEIGHT, Math.max(MIN_COLUMN_WEIGHT, (stats.get(column) || {}).length || 0)));
    const minimumTotal = minimums.reduce((sum, value) => sum + value, 0);
    const weightTotal = weights.reduce((sum, value) => sum + value, 0);
    const spare = Math.max(0, columnWidth - minimumTotal);
    const shrink = minimumTotal > columnWidth ? columnWidth / minimumTotal : 1;
    const widths = new Map(columns.map((column, index) => [
      column,
      minimums[index] * shrink + spare * weights[index] / weightTotal
    ]));
    return table.replace(/<Column Name="(\d+)"[^>]*\/>/g, (m, column) => (
      `<Column Name="${column}" SingleColumnWidth="${formatNumber(widths.get(column))}" />`
    ));
  });
}

/** Paragraphe posé par l'export ; une tabulation du texte devient `&#x9;`. */
/**
 * Un paragraphe posé par l'export. `content` : un texte, ou une suite de segments
 * `{ text, character? }` dont `character` nomme un style de caractère du jeu court.
 */
function chapterParagraph(style, content, { columnBreak = false, justification, noHyphenation = false } = {}) {
  const start = (columnBreak ? ' StartParagraph="NextColumn"' : '') + (justification ? ` Justification="${justification}"` : '') + (noHyphenation ? ' Hyphenation="false"' : '');
  const runs = typeof content === 'string' ? [{ text: content }] : content;
  const ranges = runs.map(({ text, character }) => {
    const applied = character ? `${FAMILIES.character.prefix}${character}` : '$ID/NormalCharacterStyle';
    return `  <CharacterStyleRange AppliedCharacterStyle="${applied}">\n`
      + `    <Content>${escapeXml(text).replace(/\t/g, '&#x9;')}</Content>\n`
      + '  </CharacterStyleRange>\n';
  }).join('');
  return `<ParagraphStyleRange AppliedParagraphStyle="${FAMILIES.paragraph.prefix}${style}"${start}>\n`
    + ranges
    + '</ParagraphStyleRange>\n<Br />\n';
}

const PARAGRAPH_RANGE = /<ParagraphStyleRange\b([^>]*)>([\s\S]*?)<\/ParagraphStyleRange>/g;

/** « p. N » si `pageNumbers` (clé « N.M ») porte la page, sinon le libellé à remplacer. */
function pageLabelFor(pageNumbers, key, textes) {
  const page = pageNumbers ? pageNumbers[key] : undefined;
  return page === undefined ? textes.pageSommaire : `${textes.pageSommairePrefixe}${page}`;
}
/** Un sommaire n'a de sens qu'à partir de ce nombre de sections. */
const MIN_SUMMARY_SECTIONS = 2;
const TITLE_STYLES = ['Titre-chapitre', 'Intertitre-1', 'Intertitre-2'];
const CALLOUT_DEFAULT = 'Encadré-info';
/** Libellé en gras (sans accent, casse ni ponctuation finale) → style de l'encadré. */
const CALLOUT_LABELS = new Map([
  ['bon a savoir', 'Encadré-info'],
  ['attention', 'Encadré-attention'],
  ['a retenir', 'Encadré-retenir'],
  ['renvoi', 'Note-renvoi']
]);

function paragraphStyleAttribute(name) {
  return `AppliedParagraphStyle="${FAMILIES.paragraph.prefix}${name}"`;
}

function contentText(body) {
  return [...body.matchAll(/<Content>([\s\S]*?)<\/Content>/g)].map((m) => decodeXml(m[1])).join('').replace(/\s+/g, ' ').trim();
}

const SLUG_MAX_LENGTH = 40;

/** Texte en minuscules ASCII séparé par des tirets, borné : suffixe lisible du nom d'un fichier. */
function slugify(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH).replace(/-+$/, '');
}

/** `<prefixe>-<slug>`, ou le préfixe seul quand le texte ne donne aucun slug. */
function labelledName(prefix, text) {
  const slug = slugify(text);
  return slug ? `${prefix}-${slug}` : prefix;
}

function normalizeLabel(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\s:.]+$/, '').trim().toLowerCase();
}

/**
 * Une citation Markdown (`> **Bon à savoir** …`) devient un encadré : le libellé
 * en gras choisit le style de paragraphe et prend le style « Encadré-libellé ».
 * Un paragraphe de citation sans libellé prolonge l'encadré qui le précède
 * immédiatement. Un libellé inconnu, ou une citation sans libellé, arrête l'export :
 * le style d'un encadré ne se devine pas.
 */
function convertCallouts(story) {
  let previous = null;
  return story.replace(PARAGRAPH_RANGE, (paragraph, attributes, body) => {
    if (!attributes.includes(paragraphStyleAttribute(CALLOUT_DEFAULT))) {
      previous = null;
      return paragraph;
    }
    const label = body.match(/^\s*<CharacterStyleRange\b[^>]*AppliedCharacterStyle="CharacterStyle\/Gras"[^>]*>\s*<Content>([\s\S]*?)<\/Content>/);
    let style = previous;
    let newBody = body;
    if (label) {
      const text = decodeXml(label[1]).trim();
      style = CALLOUT_LABELS.get(normalizeLabel(text));
      if (!style) {
        throw new Error(`Citation dont le libellé « ${text} » n'est pas reconnu (attendu : Bon à savoir, Attention, À retenir, Renvoi).`);
      }
      newBody = body.replace('CharacterStyle/Gras', 'CharacterStyle/Encadré-libellé');
    } else if (!style) {
      throw new Error(`Citation sans libellé en gras : « ${contentText(body).slice(0, 40)} » (commencer par **Bon à savoir**, **Attention**, **À retenir** ou **Renvoi**).`);
    }
    previous = style;
    return `<ParagraphStyleRange${attributes.replace(paragraphStyleAttribute(CALLOUT_DEFAULT), paragraphStyleAttribute(style))}>${newBody}</ParagraphStyleRange>`;
  });
}

/** Un mot en italique dans un titre devient « Accent » : seul l'italique des titres change de style. */
function applyTitleAccent(story) {
  return story.replace(PARAGRAPH_RANGE, (paragraph, attributes) => (
    TITLE_STYLES.some((style) => attributes.includes(paragraphStyleAttribute(style)))
      ? paragraph.replace(/CharacterStyle\/Italique/g, 'CharacterStyle/Accent')
      : paragraph
  ));
}

/**
 * Titre de chapitre sans mot en italique : le dernier mot prend le style Accent, comme dans la
 * maquette et sur la couverture. Un titre qui porte déjà un Accent (*mot*) est laissé tel quel.
 */
function accentLastWord(titleParagraph) {
  if (titleParagraph.includes('CharacterStyle/Accent')) return titleParagraph;
  const parts = contentText(titleParagraph).split(' ');
  const last = parts.pop();
  const segments = parts.length === 0
    ? [{ text: last, character: 'Accent' }]
    : [{ text: `${parts.join(' ')} ` }, { text: last, character: 'Accent' }];
  return chapterParagraph('Titre-chapitre', segments);
}

function sectionTitles(story) {
  return [...story.matchAll(PARAGRAPH_RANGE)]
    .filter((m) => m[1].includes(paragraphStyleAttribute('Intertitre-1')))
    .map((m) => contentText(m[2]));
}

const PARAGRAPH_WITH_BREAK = /<ParagraphStyleRange\b([^>]*)>([\s\S]*?)<\/ParagraphStyleRange>\s*(?:<Br \/>\s*)?/g;

/**
 * Textes que la mise en page place hors du flux du chapitre. Retirés du corps et rendus à part
 * (un fichier ICML par cadre du modèle, pour que chaque cadre reste lié et se mette à jour) :
 *   - ouverture (gabarit B-Chapitre) : numéro, titre du chapitre, chapeau (le premier paragraphe
 *     courant qui suit le titre) et sommaire « Dans ce chapitre » (« N.M », tabulation, titre,
 *     par section ; au moins deux sections ; les numéros de page relèvent d'une table des matières
 *     InDesign) ;
 *   - colonne marginale : par Intertitre-1, numéro « N.M » et rubrique (le titre de la section,
 *     qui reste aussi dans le corps) ;
 *   - notes de renvoi (« > **Renvoi** … »), une par suite de paragraphes de renvoi.
 * Sans numéro de chapitre, rien n'est extrait.
 *
 * @returns {{ story: string, parts: { name: string, xml: string }[] }}
 */
function takeSatellites(story, number, pageNumbers, textes) {
  if (number === undefined || number === null) {
    return { story, parts: [] };
  }
  const titles = sectionTitles(story);
  const found = { title: null, lead: null };
  const sections = [];
  const notes = [];
  let afterTitle = false;
  let afterNote = false;
  const body = story.replace(PARAGRAPH_WITH_BREAK, (paragraph, attributes, inner) => {
    const isTitle = !found.title && attributes.includes(paragraphStyleAttribute('Titre-chapitre'));
    const wasAfterTitle = afterTitle;
    const wasAfterNote = afterNote;
    afterTitle = isTitle;
    afterNote = false;
    if (isTitle) {
      found.title = paragraph;
      return '';
    }
    if (wasAfterTitle && !found.lead && attributes.includes(paragraphStyleAttribute('Courant'))) {
      found.lead = paragraph.replace(paragraphStyleAttribute('Courant'), paragraphStyleAttribute('Chapeau'));
      return '';
    }
    if (attributes.includes(paragraphStyleAttribute('Note-renvoi'))) {
      afterNote = true;
      if (wasAfterNote) {
        notes[notes.length - 1].xml += paragraph;
      } else {
        notes.push({ xml: paragraph, section: sections.length, text: contentText(inner).replace(/^renvois*/i, '') });
      }
      return '';
    }
    if (attributes.includes(paragraphStyleAttribute('Intertitre-1'))) {
      const key = `${number}.${sections.length + 1}`;
      const title = contentText(inner);
      sections.push({ key, title, xml: chapterParagraph('Numéro-section', key) + chapterParagraph('Surtitre', title) });
    }
    return paragraph;
  });
  const parts = [
    { name: 'ouverture-surtitre', xml: chapterParagraph('Surtitre', textes.chapitre.surtitre) },
    { name: 'ouverture-numero', xml: chapterParagraph('Numéro-chapitre', String(number).padStart(2, '0')) }
  ];
  if (found.title) parts.push({ name: 'ouverture-titre', xml: accentLastWord(found.title) });
  if (found.lead) parts.push({ name: 'ouverture-chapeau', xml: found.lead });
  if (titles.length >= MIN_SUMMARY_SECTIONS) {
    const lines = titles.map((title, index) => chapterParagraph('Sommaire-section', [
      { text: `${number}.${index + 1}`, character: 'Sommaire-numéro' },
      { text: `\t${title}\t` },
      { text: pageLabelFor(pageNumbers, `${number}.${index + 1}`, textes), character: 'Sommaire-page' }
    ]));
    const heading = chapterParagraph('Sommaire-titre', [{ text: '▶', character: 'Puce' }, { text: ` ${textes.chapitre.dansCeChapitre}` }]);
    parts.push({ name: 'ouverture-sommaire', xml: heading + lines.join('') });
  }
  sections.forEach(({ key, title, xml }) => parts.push({ name: labelledName(`marge-${key}`, title), xml }));
  // `sN` : rang de la section (Intertitre-1) sous laquelle la note apparaît (0 : avant la première) ; la mise
  // en page s'en sert pour placer la note en face de cette section.
  notes.forEach(({ xml, text, section }, index) => parts.push({ name: labelledName(`renvoi-${index + 1}-s${section}`, text), xml }));
  return { story: body, parts };
}

function collectUsed(story) {
  const used = { paragraph: new Set(), character: new Set(), table: new Set(), cell: new Set(), object: new Set() };
  for (const [, kind, value] of story.matchAll(/Applied(Paragraph|Character|Table|Cell|Object)Style="([^"]*)"/g)) {
    const family = kind === 'Object' ? 'object' : APPLIED_ATTRIBUTE[kind];
    used[family].add(value);
  }
  return used;
}

/** Déclaration d'origine d'un style natif `$ID/…`, recopiée telle quelle. */
function findNativeDeclaration(head, element, self) {
  const escaped = self.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`[ \\t]*<${element} Self="${escaped}"[^>]*?(?:/>|>[\\s\\S]*?</${element}>)`);
  const match = head.match(pattern);
  return match ? match[0].trim() : null;
}

function renderAttributes(attributes) {
  return Object.entries(attributes).map(([key, value]) => ` ${key}="${escapeXml(value)}"`).join('');
}

function renderDeclaration(family, entry) {
  const { prefix, element, native } = FAMILIES[family];
  const name = escapeXml(entry.name);
  const open = `<${element} Self="${prefix}${name}" Name="${name}"${renderAttributes(entry.attributes)}`;
  if (family === 'cell') {
    return `${open} AppliedParagraphStyle="ParagraphStyle/$ID/[No paragraph style]" />`;
  }
  const properties = [];
  if (native) {
    properties.push(`<BasedOn type="object">${native}</BasedOn>`);
  }
  if (properties.length === 0) {
    return `${open} />`;
  }
  return `${open}>\n        <Properties>\n          ${properties.join('\n          ')}\n        </Properties>\n      </${element}>`;
}

function renderGroups(head, used, table) {
  const groups = [];
  for (const family of ['character', 'paragraph', 'table', 'cell', 'object']) {
    const { prefix, element, group, groupSelf, native } = FAMILIES[family];
    const declarations = [];
    const entries = table[family].filter((entry) => used[family].has(`${prefix}${escapeXml(entry.name)}`));
    const nativeNeeded = native && (used[family].has(native) || entries.length > 0);
    if (nativeNeeded) {
      const declaration = findNativeDeclaration(head, element, native);
      if (declaration) {
        declarations.push(declaration);
      }
    }
    for (const entry of entries) {
      declarations.push(renderDeclaration(family, entry));
    }
    groups.push(`    <${group} Self="${groupSelf}">\n${declarations.map((d) => `      ${d}`).join('\n')}\n    </${group}>`);
  }
  return groups.join('\n');
}

function replaceStyleGroups(head, groupsXml) {
  const stripped = Object.values(FAMILIES).reduce(
    (text, { group }) => text.replace(new RegExp(`[ \\t]*<${group}\\b[\\s\\S]*?</${group}>[ \\t]*\\r?\\n?`, 'g'), ''),
    head
  );
  return `${stripped.replace(/\s*$/, '')}\n${groupsXml}\n  `;
}

/**
 * @param {string} icml sortie de `pandoc -f gfm -t icml -s`
 * @param {{ chapterDir: string, columnWidth?: number }} options
 *   chapterDir : dossier du chapitre Markdown, base des chemins d'images ;
 *   columnWidth : largeur de la colonne de texte InDesign, en points : plafond
 *   des captures, largeur des tableaux ;
 *   chapterNumber : numéro du chapitre dans son guide ; s'il est donné, le texte propre aux
 *   gabarits est retiré du corps et rendu à part (voir takeSatellites).
 * @returns {{ icml: string, images: string[], satellites: { name: string, icml: string }[] }}
 *   ICML du corps, chemins absolus des captures, et un ICML par cadre pour le texte que la mise
 *   en page place hors du flux (ouverture de chapitre, colonne marginale, notes de renvoi)
 */
function transformIcml(icml, { chapterDir, columnWidth = 360, chapterNumber, pageNumbers, maquette } = {}) {
  if (!maquette) throw new Error('transformIcml : maquette est obligatoire.');
  const styleTable = maquette.styles;
  if (!chapterDir) {
    throw new Error('transformIcml : chapterDir est obligatoire.');
  }
  const parts = splitDocument(icml);
  const withoutLinks = removeLinks(parts.story, parts.tail);
  const withoutCaptions = removeEmptyTableCaptions(withoutLinks.story);
  const { story: mappedStory, unknown } = mapAppliedStyles(withoutCaptions, buildReverseIndex(styleTable));
  if (unknown.length > 0) {
    const error = new Error(`Styles Pandoc sans correspondance dans le jeu court : ${describeUnknown(unknown).join(', ')}.`);
    error.unknownStyles = unknown;
    throw error;
  }
  const images = [];
  const titled = applyFrenchTypography(applyTitleAccent(convertCallouts(mappedStory)));
  const taken = takeSatellites(titled, chapterNumber, pageNumbers, maquette.textes);
  const story = sizeTables(convertCaptures(taken.story, { chapterDir, columnWidth, images }), columnWidth);
  const head = replaceStyleGroups(parts.head, renderGroups(parts.head, collectUsed(story), styleTable));
  const satellites = taken.parts.map(({ name, xml }) => ({ name, icml: satelliteIcml(parts, withoutLinks.tail, xml, styleTable) }));
  return { icml: `${head}${story}${withoutLinks.tail}`, images, satellites };
}

/** Balise `<Story>` et préférences de l'enveloppe Pandoc, sans le contenu. */
function storyOpening(story) {
  const opening = story.match(/^<Story\b[^>]*>\s*(?:<StoryPreference\b[^>]*\/>)?/);
  if (!opening) {
    throw new Error('Enveloppe Pandoc inattendue : ouverture de <Story> introuvable.');
  }
  return opening[0];
}

/** ICML d'un seul cadre : l'enveloppe du chapitre, dont le flux est remplacé par `xml`. */
function satelliteIcml(parts, tail, xml, styleTable) {
  const story = `${storyOpening(parts.story)}\n${xml}</Story>`;
  const head = replaceStyleGroups(parts.head, renderGroups(parts.head, collectUsed(story), styleTable));
  return `${head}${story}${tail}`;
}

/**
 * ICML d'une page de gabarit (couverture, fin) : un seul flux de paragraphes
 * posés par l'export, sans Pandoc pour le contenu. L'enveloppe (en-tête, histoire,
 * pied) vient d'une sortie Pandoc quelconque, `rawIcml`, dont le corps est jeté.
 * Chaque style doit appartenir à la table des styles de la maquette.
 *
 * @param {string} rawIcml sortie de `pandoc -f gfm -t icml -s`
 * @param {{ style: string, text: string, columnBreak?: boolean, justification?: string }[]} paragraphs
 *   `justification` : alignement propre au paragraphe (`RightAlign`), conservé à l'import dans InDesign
 *   `columnBreak` : le paragraphe commence en colonne suivante (colophon de la page de fin)
 *   `noHyphenation` : coupe les césures de ce paragraphe seul, sans toucher au style (conseils de la page de fin)
 */
function buildPageIcml(rawIcml, paragraphs, { maquette } = {}) {
  if (!maquette) throw new Error('buildPageIcml : maquette est obligatoire.');
  const styleTable = maquette.styles;
  const parts = splitDocument(rawIcml);
  const known = new Set(styleTable.paragraph.map((entry) => entry.name));
  const unknown = paragraphs.filter((paragraph) => !known.has(paragraph.style));
  if (unknown.length > 0) {
    throw new Error(`Styles de page sans correspondance dans le jeu court : ${[...new Set(unknown.map((p) => p.style))].join(', ')}.`);
  }
  const opening = [storyOpening(parts.story)];
  const body = paragraphs.map((paragraph) => chapterParagraph(paragraph.style, paragraph.text, { columnBreak: paragraph.columnBreak, justification: paragraph.justification, noHyphenation: paragraph.noHyphenation })).join('');
  const story = `${opening[0]}\n${body}</Story>`;
  const head = replaceStyleGroups(parts.head, renderGroups(parts.head, collectUsed(story), styleTable));
  return `${head}${story}${parts.tail}`;
}

module.exports = { transformIcml, buildPageIcml, toLinkUri };
