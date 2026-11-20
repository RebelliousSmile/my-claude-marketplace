/**
 * Transformation ICML Pandoc → styles CERASCAN (engine/icml-transform.js).
 *
 * Fixture figée, régénérée par (Pandoc 3.7) :
 *   cd tests/fixtures/icml && pandoc -f gfm -t icml -s echantillon.md -o echantillon.pandoc.icml
 */

const fs = require('fs');
const path = require('path');
const icmlTransform = require('../icml-transform');
const MAQUETTE = require('../maquette').loadMaquette(require('path').join(__dirname, '..', 'maquettes', 'squelette'));
const STYLES = MAQUETTE.styles;
const { toLinkUri } = icmlTransform;
const transformIcml = (icml, options = {}) => icmlTransform.transformIcml(icml, { maquette: MAQUETTE, ...options });
const buildPageIcml = (icml, paragraphs, options = {}) => icmlTransform.buildPageIcml(icml, paragraphs, { maquette: MAQUETTE, ...options });

const FIXTURE_DIR = path.join(__dirname, 'fixtures', 'icml');
const SOURCE = fs.readFileSync(path.join(FIXTURE_DIR, 'echantillon.pandoc.icml'), 'utf8');
const MARKDOWN = fs.readFileSync(path.join(FIXTURE_DIR, 'echantillon.md'), 'utf8');

function storyOf(icml) {
  return icml.slice(icml.indexOf('<Story'), icml.indexOf('</Story>'));
}

function headOf(icml) {
  return icml.slice(0, icml.indexOf('<Story'));
}

function appliedStyles(story) {
  return new Set([...story.matchAll(/Applied(?:Paragraph|Character|Table|Cell|Object)Style="([^"]*)"/g)].map((m) => m[1]));
}

function rectangles(icml) {
  return icml.match(/<Rectangle\b[\s\S]*?<\/Rectangle>/g) || [];
}

function frameSize(rectangle) {
  const points = [...rectangle.matchAll(/Anchor="(-?[\d.]+) (-?[\d.]+)"/g)].map((m) => [Number(m[1]), Number(m[2])]);
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
}

function imageScale(rectangle) {
  return Number(rectangle.match(/<Image\b[^>]*ItemTransform="([^ "]+)/)[1]);
}

function minimalIcml(storyBody) {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    + '<Document DOMVersion="8.0" Self="pandoc_doc">\n'
    + '  <RootCharacterStyleGroup Self="pandoc_character_styles">\n'
    + '    <CharacterStyle Self="$ID/NormalCharacterStyle" Name="Default" />\n'
    + '  </RootCharacterStyleGroup>\n'
    + '  <RootParagraphStyleGroup Self="pandoc_paragraph_styles">\n'
    + '    <ParagraphStyle Self="$ID/NormalParagraphStyle" Name="$ID/NormalParagraphStyle" />\n'
    + '  </RootParagraphStyleGroup>\n'
    + '  <Story Self="pandoc_story">\n'
    + storyBody
    + '\n  </Story>\n</Document>\n';
}

function paragraph(style, text, characterStyle = '$ID/NormalCharacterStyle') {
  return `<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/${style}">\n`
    + `  <CharacterStyleRange AppliedCharacterStyle="${characterStyle}">\n`
    + `    <Content>${text}</Content>\n`
    + '  </CharacterStyleRange>\n'
    + '</ParagraphStyleRange>\n';
}

function transformError(icml) {
  try {
    transformIcml(icml, { chapterDir: FIXTURE_DIR });
  } catch (error) {
    return error;
  }
  throw new Error('transformIcml aurait dû lever une erreur');
}

describe('transformIcml sur l\'échantillon Pandoc', () => {
  let result;
  let story;

  beforeAll(() => {
    result = transformIcml(SOURCE, { chapterDir: FIXTURE_DIR });
    story = storyOf(result.icml);
  });

  test('seuls les noms du jeu court et les styles natifs $ID apparaissent dans le flux', () => {
    expect([...appliedStyles(story)].sort()).toEqual([
      '$ID/NormalCharacterStyle',
      'CellStyle/Cellule',
      'CharacterStyle/Code-inline',
      'CharacterStyle/Gras',
      'CharacterStyle/Italique',
      'CharacterStyle/Renvoi',
      'ObjectStyle/Capture',
      'ParagraphStyle/Capture',
      'ParagraphStyle/Courant',
      'ParagraphStyle/Liste-num',
      'ParagraphStyle/Liste-num-suite',
      'ParagraphStyle/Liste-puce',
      'ParagraphStyle/Liste-puce-2',
      'ParagraphStyle/Tableau en-tête',
      'ParagraphStyle/Tableau texte',
      'ParagraphStyle/Titre-chapitre',
      'ParagraphStyle/Intertitre-1',
      'ParagraphStyle/Intertitre-2',
      'TableStyle/Tableau'
    ].sort());
  });

  test('les items d\'une liste lâche restent numérotés', () => {
    const sourceNumbered = (storyOf(SOURCE).match(/ParagraphStyle\/NumList(?: &gt; first)?(?: &gt; Paragraph)?"/g) || []).length;
    expect(sourceNumbered).toBeGreaterThanOrEqual(4);
    expect((story.match(/ParagraphStyle\/Liste-num"/g) || []).length).toBe(sourceNumbered);
  });

  test('chaque premier item de liste garde NumberingContinue="false"', () => {
    const sourceRestarts = (storyOf(SOURCE).match(/NumberingContinue="false"/g) || []).length;
    expect(sourceRestarts).toBeGreaterThanOrEqual(2);
    expect((story.match(/NumberingContinue="false"/g) || []).length).toBe(sourceRestarts);
  });

  test('le texte des liens reste, en style Renvoi, sans Hyperlink ni HyperlinkTextSource', () => {
    const linkTexts = [...MARKDOWN.matchAll(/\[([^\]]+)\]\((?!images\/)[^)]+\)/g)].map((m) => m[1].replace(/'/g, '’'));
    expect(linkTexts.length).toBeGreaterThanOrEqual(2);
    const renvois = [...story.matchAll(/AppliedCharacterStyle="CharacterStyle\/Renvoi">\s*<Content>([^<]*)<\/Content>/g)]
      .map((m) => m[1].replace(/&apos;/g, "'"));
    expect(renvois).toEqual(linkTexts);
    expect(result.icml).not.toMatch(/Hyperlink/);
  });

  test('aucune légende de tableau ni paragraphe vide ne reste', () => {
    expect(storyOf(SOURCE)).toMatch(/TableCaption/);
    expect(result.icml).not.toMatch(/TableCaption/);
    const paragraphs = story.match(/<ParagraphStyleRange\b[\s\S]*?<\/ParagraphStyleRange>/g);
    expect(paragraphs.length).toBeGreaterThan(10);
    const empty = paragraphs.filter((p) => !/<Rectangle\b/.test(p)
      && ![...p.matchAll(/<Content>([\s\S]*?)<\/Content>/g)].some((m) => m[1].trim() !== ''));
    expect(empty).toEqual([]);
  });

  test('chaque tableau reste suivi du saut de paragraphe qui le sépare du bloc suivant', () => {
    const tables = story.match(/<\/Table>\s*(<Br \/>)?/g);
    expect(tables).toHaveLength(2);
    tables.forEach((closing) => expect(closing).toMatch(/<Br \/>$/));
  });

  test('chaque colonne de tableau reçoit une largeur, la somme remplit la colonne de texte', () => {
    const tables = story.match(/<Table [^>]*>[\s\S]*?<\/Table>/g);
    expect(tables).toHaveLength(2);
    tables.forEach((table) => {
      const columnCount = Number(table.match(/ColumnCount="(\d+)"/)[1]);
      const widths = [...table.matchAll(/<Column Name="\d+" SingleColumnWidth="([\d.]+)" \/>/g)].map((m) => Number(m[1]));
      expect(widths).toHaveLength(columnCount);
      widths.forEach((width) => expect(width).toBeGreaterThan(0));
      expect(widths.reduce((sum, width) => sum + width, 0)).toBeCloseTo(360, 1);
    });
  });

  test('chaque colonne est assez large pour son plus long mot, même face à une colonne très bavarde', () => {
    const longWord = 'Anticonstitutionnellement';
    const longSentence = 'le fichier peut être envoyé ' + 'dès que toutes les vérifications sont passées '.repeat(2);
    const source = SOURCE.replace('<Content>Prêt</Content>', `<Content>${longWord}</Content>`)
      .replace('<Content>le fichier peut être envoyé</Content>', `<Content>${longSentence}</Content>`);
    expect(source).not.toBe(SOURCE);
    const table = storyOf(transformIcml(source, { chapterDir: FIXTURE_DIR, columnWidth: 275 }).icml).match(/<Table [^>]*>[\s\S]*?<\/Table>/)[0];
    const [first, second] = [...table.matchAll(/SingleColumnWidth="([\d.]+)"/g)].map((m) => Number(m[1]));
    expect(first).toBeGreaterThanOrEqual(longWord.length * 5);
    expect(first + second).toBeCloseTo(275, 1);
  });

  test('un mot trop long pour la colonne réduit toutes les colonnes sans dépasser la largeur', () => {
    const tiny = transformIcml(SOURCE, { chapterDir: FIXTURE_DIR, columnWidth: 60 });
    const widths = [...storyOf(tiny.icml).matchAll(/SingleColumnWidth="([\d.]+)"/g)].map((m) => Number(m[1]));
    expect(widths.reduce((sum, width) => sum + width, 0)).toBeCloseTo(60 * 2, 1);
  });

  test('les listes ont un retrait suspendu : la tabulation après le numéro ou la puce suit le texte', () => {
    const head = headOf(transformIcml(SOURCE, { chapterDir: FIXTURE_DIR }).icml);
    for (const name of ['Liste-num', 'Liste-puce', 'Liste-puce-2']) {
      const declaration = head.match(new RegExp(`<ParagraphStyle Self="ParagraphStyle/${name}"[^>]*>`))[0];
      const left = Number(declaration.match(/LeftIndent="(-?[\d.]+)"/)[1]);
      const first = Number(declaration.match(/FirstLineIndent="(-?[\d.]+)"/)[1]);
      expect(left).toBeGreaterThan(0);
      expect(first).toBeLessThan(0);
      expect(left + first).toBeGreaterThanOrEqual(0);
    }
    const suite = head.match(/<ParagraphStyle Self="ParagraphStyle\/Liste-num-suite"[^>]*>/)[0];
    const numbered = head.match(/<ParagraphStyle Self="ParagraphStyle\/Liste-num"[^>]*>/)[0];
    expect(suite.match(/LeftIndent="([\d.]+)"/)[1]).toBe(numbered.match(/LeftIndent="([\d.]+)"/)[1]);
  });

  test('les définitions de styles ne fixent aucune police', () => {
    const { icml } = transformIcml(SOURCE, { chapterDir: FIXTURE_DIR });
    expect(headOf(icml)).not.toMatch(/AppliedFont|FontStyle/);
  });

  test('la largeur des tableaux suit columnWidth', () => {
    const narrow = transformIcml(SOURCE, { chapterDir: FIXTURE_DIR, columnWidth: 200 });
    const widths = [...storyOf(narrow.icml).matchAll(/SingleColumnWidth="([\d.]+)"/g)].map((m) => Number(m[1]));
    expect(widths.length).toBeGreaterThanOrEqual(4);
    expect(widths.reduce((sum, width) => sum + width, 0)).toBeCloseTo(400, 1);
  });

  test('chaque Rectangle porte l\'objet Capture, une URI absolue et un paragraphe Capture', () => {
    const frames = rectangles(story);
    expect(frames).toHaveLength(2);
    const expectedUris = ['capture-large.png', 'capture-petite.png']
      .map((name) => toLinkUri(path.join(FIXTURE_DIR, 'images', name)));
    expect(frames.map((r) => r.match(/LinkResourceURI="([^"]*)"/)[1])).toEqual(expectedUris);
    frames.forEach((r) => expect(r).toMatch(/^<Rectangle AppliedObjectStyle="ObjectStyle\/Capture"/));
    const captureParagraphs = story.match(/<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle\/Capture">[\s\S]*?<\/ParagraphStyleRange>/g);
    expect(captureParagraphs).toHaveLength(2);
    captureParagraphs.forEach((p) => expect(p).not.toMatch(/<Content>/));
  });

  test('la grande capture est ramenée au plafond, la petite garde sa taille, proportions gardées', () => {
    const [sourceLarge, sourceSmall] = rectangles(SOURCE).map(frameSize);
    expect(sourceLarge.width).toBeGreaterThan(360);
    expect(sourceSmall.width).toBeLessThan(360);
    const [large, small] = rectangles(story);
    expect(frameSize(large).width).toBe(360);
    expect(frameSize(large).height / frameSize(large).width).toBeCloseTo(sourceLarge.height / sourceLarge.width, 6);
    expect(imageScale(large)).toBeCloseTo(360 / sourceLarge.width, 6);
    expect(frameSize(small)).toEqual(sourceSmall);
    expect(imageScale(small)).toBe(1);
  });

  test('le plafond se règle par columnWidth', () => {
    const narrow = transformIcml(SOURCE, { chapterDir: FIXTURE_DIR, columnWidth: 100 });
    expect(rectangles(storyOf(narrow.icml)).map((r) => frameSize(r).width)).toEqual([100, 100]);
  });

  test('la liste des images renvoyée donne leurs chemins absolus', () => {
    expect(result.images).toEqual([
      path.join(FIXTURE_DIR, 'images', 'capture-large.png'),
      path.join(FIXTURE_DIR, 'images', 'capture-petite.png')
    ]);
  });

  test('chaque style appliqué est déclaré une fois, aucun style déclaré n\'est inutilisé', () => {
    const head = headOf(result.icml);
    const declared = [...head.matchAll(/<(?:Paragraph|Character|Table|Cell|Object)Style Self="([^"]*)"/g)].map((m) => m[1]);
    expect(new Set(declared).size).toBe(declared.length);
    const basedOn = [...head.matchAll(/<BasedOn type="object">([^<]*)<\/BasedOn>/g)].map((m) => m[1]);
    const used = new Set([...appliedStyles(story), ...basedOn]);
    expect([...declared].sort()).toEqual([...used].sort());
  });
});

describe('transformIcml sur des cas limites', () => {
  test('un style Pandoc inconnu arrête la transformation et le nomme', () => {
    const error = transformError(minimalIcml(paragraph('Definition', 'Terme')));
    expect(error.message).toContain('Definition');
    expect(error.unknownStyles).toEqual([{ family: 'paragraph', name: 'Definition' }]);
  });

  describe('encadrés', () => {
    const labelled = (label, text) => '<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/Blockquote &gt; Paragraph">\n'
      + '  <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/Bold">\n'
      + `    <Content>${label}</Content>\n  </CharacterStyleRange>\n`
      + '  <CharacterStyleRange AppliedCharacterStyle="$ID/NormalCharacterStyle">\n'
      + `    <Content> ${text}</Content>\n  </CharacterStyleRange>\n</ParagraphStyleRange>\n`;
    const run = (body) => storyOf(transformIcml(minimalIcml(body), { chapterDir: FIXTURE_DIR }).icml);

    test('chaque libellé choisit le style de l\'encadré et prend le style de libellé', () => {
      [
        ['Bon à savoir', 'Encadré-info'],
        ['Attention', 'Encadré-attention'],
        ['À retenir', 'Encadré-retenir'],
        ['Renvoi', 'Note-renvoi']
      ].forEach(([label, style]) => {
        const story = run(labelled(label, 'texte'));
        expect(story).toContain(`ParagraphStyle/${style}"`);
        expect(story).toContain('CharacterStyle/Encadré-libellé');
        expect(story).not.toContain('CharacterStyle/Gras');
      });
    });

    test('un paragraphe de citation sans libellé prolonge l\'encadré précédent', () => {
      const story = run(labelled('Attention', 'un') + paragraph('Blockquote &gt; Paragraph', 'deux'));
      expect(story.match(/ParagraphStyle\/Encadré-attention"/g)).toHaveLength(2);
    });

    test('un libellé inconnu arrête la transformation', () => {
      expect(() => run(labelled('Astuce', 'texte'))).toThrow(/Astuce/);
    });

    test('une citation sans libellé et sans encadré précédent arrête la transformation', () => {
      expect(() => run(paragraph('Blockquote &gt; Paragraph', 'texte'))).toThrow(/sans libellé/);
    });

    test('la citation n\'hérite pas d\'un encadré séparé par un autre paragraphe', () => {
      expect(() => run(labelled('Attention', 'un') + paragraph('Paragraph', 'milieu') + paragraph('Blockquote &gt; Paragraph', 'deux'))).toThrow(/sans libellé/);
    });
  });

  describe('accent des titres, sommaire et numéros de section', () => {
    const italic = (style, text) => paragraph(style, text, 'CharacterStyle/Italic');
    const sections = (count) => Array.from({ length: count }, (_, i) => paragraph('Header2', `Section ${i + 1}`)).join('');
    const full = (count) => paragraph('Header1', 'Titre') + paragraph('Paragraph', 'Chapeau') + sections(count) + paragraph('Paragraph', 'Fin');
    const run = (body, options = {}) => storyOf(transformIcml(minimalIcml(body), { chapterDir: FIXTURE_DIR, ...options }).icml);
    const satellitesOf = (body, options = {}) => transformIcml(minimalIcml(body), { chapterDir: FIXTURE_DIR, ...options })
      .satellites.map((satellite) => satellite.name);
    const satelliteOf = (body, name, options = {}) => {
      const found = transformIcml(minimalIcml(body), { chapterDir: FIXTURE_DIR, ...options })
        .satellites.find((satellite) => satellite.name === name);
      return found ? storyOf(found.icml) : '';
    };

    test('l\'italique d\'un titre devient Accent, celui du corps reste Italique', () => {
      const story = run(italic('Header1', 'mot') + italic('Paragraph', 'mot'));
      expect(story.match(/CharacterStyle\/Accent"/g)).toHaveLength(1);
      expect(story.match(/CharacterStyle\/Italique"/g)).toHaveLength(1);
    });

    test('le titre d’ouverture sans italique met son dernier mot en Accent, un Accent posé est conservé', () => {
      const plain = satelliteOf(paragraph('Header1', 'Guide vendeur — CERASCAN') + paragraph('Paragraph', 'Chapeau'), 'ouverture-titre', { chapterNumber: 1 });
      expect(plain).toContain('<Content>Guide vendeur — </Content>');
      expect(plain).toMatch(/CharacterStyle\/Accent"[^>]*>\s*<Content>CERASCAN<\/Content>/);
      const marked = satelliteOf(italic('Header1', 'Titre') + paragraph('Paragraph', 'Chapeau'), 'ouverture-titre', { chapterNumber: 1 });
      expect(marked.match(/CharacterStyle\/Accent"/g)).toHaveLength(1);
    });

    test('un chapitre de deux sections rend un sommaire numéroté dans son propre fichier', () => {
      const satellite = satelliteOf(full(2), 'ouverture-sommaire', { chapterNumber: 3 });
      expect(satellite).toContain('ParagraphStyle/Sommaire-titre"');
      expect(satellite).toMatch(/CharacterStyle\/Puce"[^>]*>\s*<Content>▶<\/Content>/);
      expect(satellite.match(/ParagraphStyle\/Sommaire-section"/g)).toHaveLength(2);
      expect(satellite).toMatch(/CharacterStyle\/Sommaire-numéro"[^>]*>\s*<Content>3\.1<\/Content>/);
      expect(satellite).toMatch(/CharacterStyle\/Sommaire-numéro"[^>]*>\s*<Content>3\.2<\/Content>/);
      expect(satellite).toContain('<Content>&#x9;Section 1&#x9;</Content>');
      expect(satellite).toContain('<Content>&#x9;Section 2&#x9;</Content>');
      expect(satellite.match(/CharacterStyle\/Sommaire-page"[^>]*>\s*<Content>p\. …<\/Content>/g)).toHaveLength(2);
      expect(run(full(2), { chapterNumber: 3 })).not.toContain('Sommaire-');
    });

    test('typographie française : apostrophe courbe, insécables avant « : » et « % », code laissé tel quel', () => {
      const code = paragraph('Paragraph', "l'id : x", 'CharacterStyle/Code');
      const out = run(paragraph('Paragraph', "L'écran : 20 % de l'espace « libre » ?") + code);
      expect(out).toContain('<Content>L’écran : 20 % de l’espace « libre » ?</Content>');
      expect(out).toContain("<Content>l'id : x</Content>");
    });

    test('numéros de page fournis : posés sur les sections, « p. … » pour les absentes', () => {
      const satellite = satelliteOf(full(2), 'ouverture-sommaire', { chapterNumber: 3, pageNumbers: { '3.1': 7 } });
      expect(satellite).toMatch(/CharacterStyle\/Sommaire-page"[^>]*>\s*<Content>p\. 7<\/Content>/);
      expect(satellite.match(/<Content>p\. …<\/Content>/g)).toHaveLength(1);
    });

    test('une seule section, ou aucun numéro de chapitre : pas de sommaire ni de numéro de section', () => {
      expect(satellitesOf(full(1), { chapterNumber: 3 })).not.toContain('ouverture-sommaire');
      const sans = transformIcml(minimalIcml(full(2)), { chapterDir: FIXTURE_DIR });
      expect(sans.satellites).toEqual([]);
      expect(storyOf(sans.icml)).not.toContain('Numéro-section');
    });

    test('le numéro et la rubrique de chaque section sont rendus à part, hors du corps', () => {
      const options = { chapterNumber: 3 };
      const first = satelliteOf(full(2), 'marge-3.1-section-1', options);
      expect(first).toContain('ParagraphStyle/Numéro-section"');
      expect(first).toContain('<Content>3.1</Content>');
      expect(first).toContain('<Content>Section 1</Content>');
      expect(satelliteOf(full(2), 'marge-3.2-section-2', options)).toContain('<Content>3.2</Content>');
      expect(run(full(2), options)).not.toContain('Numéro-section');
    });
  });

  test('un style de caractère combiné arrête la transformation et le nomme', () => {
    const error = transformError(minimalIcml(paragraph('Paragraph', 'Lien gras', 'CharacterStyle/Bold Link')));
    expect(error.message).toContain('Bold Link');
    expect(error.unknownStyles).toEqual([{ family: 'character', name: 'Bold Link' }]);
  });

  test('une légende de tableau non vide arrête la transformation et la nomme', () => {
    const error = transformError(minimalIcml(paragraph('TableCaption', 'Légende')));
    expect(error.message).toContain('TableCaption');
  });

  test('une légende de tableau vide est supprimée sans laisser de paragraphe vide', () => {
    const icml = minimalIcml(
      paragraph('Paragraph', 'Avant')
      + '<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/TableCaption">\n</ParagraphStyleRange>\n<Br />\n'
      + paragraph('Paragraph', 'Après')
    );
    const story = storyOf(transformIcml(icml, { chapterDir: FIXTURE_DIR }).icml);
    expect(story).not.toMatch(/TableCaption/);
    expect(story.match(/<ParagraphStyleRange\b/g)).toHaveLength(2);
  });

  test('un paragraphe ne contenant qu\'un Rectangle prend le style Capture', () => {
    const frame = rectangles(SOURCE)[1];
    const icml = minimalIcml(
      '<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/Paragraph">\n'
      + '  <CharacterStyleRange AppliedCharacterStyle="$ID/NormalCharacterStyle">\n'
      + `    ${frame}\n`
      + '  </CharacterStyleRange>\n'
      + '</ParagraphStyleRange>\n'
    );
    const story = storyOf(transformIcml(icml, { chapterDir: FIXTURE_DIR }).icml);
    expect(story).toMatch(/AppliedParagraphStyle="ParagraphStyle\/Capture"/);
    expect(story).not.toMatch(/ParagraphStyle\/Courant/);
  });

  test('un Rectangle accompagné de texte reste dans son paragraphe d\'origine', () => {
    const frame = rectangles(SOURCE)[1];
    const icml = minimalIcml(
      '<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/Paragraph">\n'
      + '  <CharacterStyleRange AppliedCharacterStyle="$ID/NormalCharacterStyle">\n'
      + '    <Content>Voir </Content>\n'
      + `    ${frame}\n`
      + '  </CharacterStyleRange>\n'
      + '</ParagraphStyleRange>\n'
    );
    const story = storyOf(transformIcml(icml, { chapterDir: FIXTURE_DIR }).icml);
    expect(story).toMatch(/AppliedParagraphStyle="ParagraphStyle\/Courant"/);
    expect(story).not.toMatch(/ParagraphStyle\/Capture/);
  });

  test('chapterDir est obligatoire', () => {
    expect(() => transformIcml(SOURCE)).toThrow(/chapterDir/);
  });
});

describe('ouverture de chapitre', () => {
  const convert = (body, chapterNumber) => transformIcml(minimalIcml(body), { chapterDir: FIXTURE_DIR, chapterNumber });
  const styles = (xml) => [...xml.matchAll(/AppliedParagraphStyle="ParagraphStyle\/([^"]*)"/g)].map((m) => m[1]);
  const BR = '<Br />\n';
  const body = paragraph('Header1', 'Titre') + BR + paragraph('Paragraph', 'Intro') + BR + paragraph('Paragraph', 'Suite');

  test("retire du corps le titre et le chapeau, qui vont dans le cadre d'ouverture", () => {
    const story = storyOf(convert(body, 3).icml);
    expect(styles(story)).toEqual(['Courant']);
    expect(story).toContain('<Content>Suite</Content>');
    expect(story).not.toMatch(/<Content>(Titre|Intro|Chapitre|03)<\/Content>/);
  });

  test("rend l'ouverture en un fichier par cadre, dans l'ordre de la page", () => {
    const { satellites } = convert(body, 3);
    expect(satellites.map((satellite) => satellite.name)).toEqual([
      'ouverture-surtitre', 'ouverture-numero', 'ouverture-titre', 'ouverture-chapeau'
    ]);
    const stories = Object.fromEntries(satellites.map((satellite) => [satellite.name, storyOf(satellite.icml)]));
    expect(styles(stories['ouverture-surtitre'])).toEqual(['Surtitre']);
    expect(stories['ouverture-surtitre']).toContain('<Content>Chapitre</Content>');
    expect(styles(stories['ouverture-numero'])).toEqual(['Numéro-chapitre']);
    expect(stories['ouverture-numero']).toContain('<Content>03</Content>');
    expect(styles(stories['ouverture-titre'])).toEqual(['Titre-chapitre']);
    expect(stories['ouverture-titre']).toContain('<Content>Titre</Content>');
    expect(styles(stories['ouverture-chapeau'])).toEqual(['Chapeau']);
    expect(stories['ouverture-chapeau']).toContain('<Content>Intro</Content>');
  });

  test("chaque fichier ne déclare que les styles qu'il utilise", () => {
    const { satellites } = convert(body, 1);
    const numero = satellites.find((satellite) => satellite.name === 'ouverture-numero').icml;
    expect(headOf(numero)).toContain('Self="ParagraphStyle/Numéro-chapitre"');
    expect(headOf(numero)).not.toContain('Self="ParagraphStyle/Chapeau"');
    const chapeau = satellites.find((satellite) => satellite.name === 'ouverture-chapeau').icml;
    expect(headOf(chapeau)).toContain('Self="ParagraphStyle/Chapeau"');
    expect(chapeau).toContain('</Document>');
  });

  test('sans numéro de chapitre, rien n\'est retiré et aucun fichier n\'est rendu', () => {
    const converted = convert(body);
    expect(converted.satellites).toEqual([]);
    expect(styles(storyOf(converted.icml))).toEqual(['Titre-chapitre', 'Courant', 'Courant']);
  });

  test("ne fait pas un chapeau d'un paragraphe qui n'est pas courant", () => {
    const { satellites } = convert(paragraph('Header1', 'Titre') + BR + paragraph('Header2', 'Section'), 1);
    expect(satellites.map((satellite) => satellite.name)).not.toContain('ouverture-chapeau');
  });

  test('les notes de renvoi quittent le corps, une par fichier, les consécutives réunies', () => {
    const note = (text) => '<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/Blockquote &gt; Paragraph">\n'
      + '  <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/Bold">\n'
      + '    <Content>Renvoi</Content>\n  </CharacterStyleRange>\n'
      + '  <CharacterStyleRange AppliedCharacterStyle="$ID/NormalCharacterStyle">\n'
      + `    <Content> ${text}</Content>\n  </CharacterStyleRange>\n</ParagraphStyleRange>\n${BR}`;
    const converted = convert(body + note('un') + note('deux') + paragraph('Paragraph', 'milieu') + BR + note('trois'), 1);
    expect(storyOf(converted.icml)).not.toContain('Note-renvoi');
    const renvois = converted.satellites.filter((satellite) => satellite.name.startsWith('renvoi-'));
    expect(renvois.map((satellite) => satellite.name)).toEqual(['renvoi-1-s0-un', 'renvoi-2-s0-trois']);
    expect(styles(storyOf(renvois[0].icml))).toEqual(['Note-renvoi', 'Note-renvoi']);
    expect(storyOf(renvois[1].icml)).toContain('trois');
  });

  test('le nom d\'une note de renvoi porte le rang de la section sous laquelle elle apparaît', () => {
    const note = (text) => '<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/Blockquote &gt; Paragraph">\n'
      + '  <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/Bold">\n'
      + '    <Content>Renvoi</Content>\n  </CharacterStyleRange>\n'
      + '  <CharacterStyleRange AppliedCharacterStyle="$ID/NormalCharacterStyle">\n'
      + `    <Content> ${text}</Content>\n  </CharacterStyleRange>\n</ParagraphStyleRange>\n${BR}`;
    const section = (title) => paragraph('Header2', title) + BR;
    const converted = convert(body + section('Premier') + note('alpha') + section('Second') + paragraph('Paragraph', 'texte') + BR + note('beta'), 1);
    const names = converted.satellites.map((satellite) => satellite.name);
    expect(names).toContain('renvoi-1-s1-alpha');
    expect(names).toContain('renvoi-2-s2-beta');
    expect(names).toContain('marge-1.2-second');
  });
});

describe('buildPageIcml', () => {
  const paragraphs = [
    { style: 'Titre-couverture', text: 'Guide partenaire' },
    { style: 'Surtitre', text: 'Version 2.20.0' },
    { style: 'Sommaire-ligne', text: '01\tImporter' }
  ];

  test('écrit un paragraphe par entrée, avec son style et sa tabulation encodée', () => {
    const icml = buildPageIcml(SOURCE, paragraphs);
    const paragraphStyles = [...storyOf(icml).matchAll(/AppliedParagraphStyle="([^"]*)"/g)].map((m) => m[1]);
    expect(paragraphStyles).toEqual([
      'ParagraphStyle/Titre-couverture',
      'ParagraphStyle/Surtitre',
      'ParagraphStyle/Sommaire-ligne'
    ]);
    expect(icml).toContain('<Content>Guide partenaire</Content>');
    expect(icml).toContain('<Content>01&#x9;Importer</Content>');
  });

  test('un alignement propre au paragraphe est posé sur son bloc, sans effet pour les autres', () => {
    const icml = buildPageIcml(SOURCE, [
      { style: 'Titre-courant', text: 'Pied', justification: 'RightAlign' },
      { style: 'Titre-courant', text: 'Autre' }
    ]);
    const ranges = [...storyOf(icml).matchAll(/<ParagraphStyleRange\b([^>]*)>/g)].map((m) => m[1]);
    expect(ranges[0]).toContain('Justification="RightAlign"');
    expect(ranges[1]).not.toContain('Justification');
  });

  test('noHyphenation coupe les césures du seul paragraphe concerné', () => {
    const icml = buildPageIcml(SOURCE, [
      { style: 'Titre-courant', text: 'Sans césure', noHyphenation: true },
      { style: 'Titre-courant', text: 'Autre' }
    ]);
    const ranges = [...storyOf(icml).matchAll(/<ParagraphStyleRange\b([^>]*)>/g)].map((m) => m[1]);
    expect(ranges[0]).toContain('Hyphenation="false"');
    expect(ranges[1]).not.toContain('Hyphenation');
  });

  test('désactive l’alignement optique des marges, comme le modèle IDML', () => {
    expect(SOURCE).toContain('OpticalMarginAlignment="true"');
    const icml = buildPageIcml(SOURCE, paragraphs);
    expect(icml).toContain('OpticalMarginAlignment="false"');
    expect(icml).not.toContain('OpticalMarginAlignment="true"');
    const body = transformIcml(SOURCE, { chapterDir: FIXTURE_DIR });
    for (const { icml: xml } of [body, ...body.satellites]) {
      expect(xml).not.toContain('OpticalMarginAlignment="true"');
    }
  });

  test('ne garde rien du contenu du document Pandoc fourni', () => {
    const icml = buildPageIcml(SOURCE, paragraphs);
    expect(icml.match(/<Story\b/g)).toHaveLength(1);
    expect(icml.match(/<\/Story>/g)).toHaveLength(1);
    expect(icml).toContain('<StoryPreference');
    expect(icml).not.toContain('<Table');
  });

  test('déclare les styles employés, et eux seuls', () => {
    const head = headOf(buildPageIcml(SOURCE, paragraphs));
    ['Titre-couverture', 'Surtitre', 'Sommaire-ligne'].forEach((name) => {
      expect(head).toContain(`Self="ParagraphStyle/${name}"`);
    });
    expect(head).not.toContain('Self="ParagraphStyle/Chapeau"');
  });

  test('refuse un style absent du jeu court, en le nommant', () => {
    expect(() => buildPageIcml(SOURCE, [{ style: 'Inconnu', text: 'x' }])).toThrow(/Inconnu/);
  });

  test('refuse une enveloppe sans histoire', () => {
    expect(() => buildPageIcml('<Document></Document>', paragraphs)).toThrow();
  });
});

describe('styles de la maquette', () => {
  test('chaque nom Pandoc ne mène qu\'à un style, et chaque nom est unique dans sa famille', () => {
    for (const entries of Object.values(STYLES)) {
      const names = entries.map((e) => e.name);
      expect(new Set(names).size).toBe(names.length);
      const pandocNames = entries.flatMap((e) => e.pandoc);
      expect(new Set(pandocNames).size).toBe(pandocNames.length);
    }
  });

  test('les styles posés par la transformation figurent dans leur famille', () => {
    expect(STYLES.paragraph.map((e) => e.name)).toContain('Capture');
    expect(STYLES.object.map((e) => e.name)).toEqual(['Capture']);
  });

  test('le runbook InDesign liste exactement les styles de la table', () => {
    const runbook = fs.readFileSync(
      path.join(__dirname, '..', '..', 'references', 'runbook-export-indesign.md'),
      'utf8'
    );
    const section = runbook.split(/^## /m).find((part) => /^\d+\. Styles à créer/.test(part));
    expect(section).toBeDefined();

    const familyKey = { paragraphe: 'paragraph', caractère: 'character', tableau: 'table', cellule: 'cell', objet: 'object' };
    const documented = [...section.matchAll(/^\| « ([^»]+) » \| ([^|]+?) \|/gm)]
      .map(([, name, family]) => `${familyKey[family.trim()] || family.trim()}/${name}`);
    const expected = Object.entries(STYLES)
      .flatMap(([family, entries]) => entries.map((e) => `${family}/${e.name}`));

    expect(documented.length).toBeGreaterThanOrEqual(15);
    expect(new Set(documented).size).toBe(documented.length);
    expect(new Set(documented)).toEqual(new Set(expected));
  });
});
