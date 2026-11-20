const { writeZip, readZip, METHOD_STORE } = require('../zip-store');
const path = require('path');
const { STYLE_TABLE } = require('../icml-transform');
const { loadConfig, ACCENTS } = require('../guide-config');
const {
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
  chapterBoxes,
  MIMETYPE
} = require('../build-idml-template');

const FIXTURE_CONFIG = path.join(__dirname, 'fixtures', 'project', 'docs', 'documentation.config.json');

/** Les guides, leurs titres, verbes et accents viennent de la configuration du dépôt, pas du moteur. */
const CONFIG = loadConfig({ configPath: FIXTURE_CONFIG });
const GUIDE = Object.fromEntries(CONFIG.guides.map(guide => [guide.id, guide]));

/** Contrôle minimal de bonne formation : balises appariées, attributs entre guillemets. */
function assertWellFormed(xml, name) {
  const body = xml.replace(/<\?[\s\S]*?\?>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const stack = [];
  const tag = /<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[\w:.-]+="[^"<]*")*)\s*(\/?)>/g;
  let rest = body;
  let match;
  let last = 0;
  while ((match = tag.exec(body)) !== null) {
    const between = body.slice(last, match.index);
    if (/[<>]/.test(between)) throw new Error(`${name} : chevron isolé près de « ${between.slice(0, 40)} »`);
    last = tag.lastIndex;
    const [, closing, element, , selfClosing] = match;
    if (closing) {
      const open = stack.pop();
      if (open !== element) throw new Error(`${name} : </${element}> ferme <${open}>`);
    } else if (!selfClosing) {
      stack.push(element);
    }
  }
  rest = body.slice(last);
  if (/[<>]/.test(rest)) throw new Error(`${name} : chevron isolé en fin de fichier`);
  if (stack.length) throw new Error(`${name} : balise non fermée <${stack.pop()}>`);
}

const files = options => buildIdmlEntries(options).map(entry => ({ ...entry, text: String(entry.data) }));
const byName = (list, name) => list.find(entry => entry.name === name).text;
const selfIds = xml => [...xml.matchAll(/\sSelf="([^"]+)"/g)].map(m => m[1]);

describe('zip-store', () => {
  it('relit à l’identique les entrées écrites, stockées ou compressées', () => {
    const archive = writeZip([
      { name: 'mimetype', data: 'application/x', store: true },
      { name: 'dossier/é.xml', data: '<a>'.repeat(200) }
    ]);
    const read = readZip(archive);
    expect(read.map(f => f.name)).toEqual(['mimetype', 'dossier/é.xml']);
    expect(read[0].method).toBe(METHOD_STORE);
    expect(read[0].data.toString()).toBe('application/x');
    expect(read[1].data.toString()).toBe('<a>'.repeat(200));
    expect(read[1].method).not.toBe(METHOD_STORE);
  });

  it('donne les mêmes octets à deux écritures', () => {
    const entries = [{ name: 'a.txt', data: 'bonjour' }];
    expect(writeZip(entries).equals(writeZip(entries))).toBe(true);
  });

  it('refuse une archive tronquée', () => {
    expect(() => readZip(Buffer.from('pas un zip'))).toThrow(/zip invalide/);
  });
});

describe('build-idml-template', () => {
  it('place mimetype en premier, stocké, avec le type IDML', () => {
    const read = readZip(buildIdml());
    expect(read[0].name).toBe('mimetype');
    expect(read[0].method).toBe(METHOD_STORE);
    expect(read[0].data.toString()).toBe(MIMETYPE);
  });

  it('produit des fichiers XML bien formés, gabarits compris', () => {
    [false, true].forEach(masters => {
      files({ masters }).filter(f => f.name !== 'mimetype').forEach(f => assertWellFormed(f.text, f.name));
    });
  });

  it('déclare dans designmap chaque fichier du paquet', () => {
    const list = files({ masters: true });
    const designmap = byName(list, 'designmap.xml');
    const declared = [...designmap.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
    const present = list.map(f => f.name);
    declared.forEach(src => expect(present).toContain(src));
    present
      .filter(name => /^(Resources|Spreads|MasterSpreads|Stories|XML)\//.test(name))
      .forEach(name => expect(declared).toContain(name));
  });

  it('définit tous les styles de STYLE_TABLE et ceux de la charte, sous leurs noms exacts', () => {
    const styles = byName(files(), 'Resources/Styles.xml');
    const elements = { paragraph: 'ParagraphStyle', character: 'CharacterStyle', table: 'TableStyle', cell: 'CellStyle', object: 'ObjectStyle' };
    Object.entries(elements).forEach(([family, element]) => {
      const expected = [...STYLE_TABLE[family].map(s => s.name), ...CHARTER_ONLY[family]];
      const defined = [...styles.matchAll(new RegExp(`<${element} [^>]*\\sName="([^"]+)"`, 'g'))].map(m => m[1]);
      expected.forEach(name => expect(defined).toContain(name));
    });
  });

  it('donne une mise en forme à chaque style déclaré', () => {
    Object.keys(FORMATS).forEach(family => {
      [...STYLE_TABLE[family].map(s => s.name), ...CHARTER_ONLY[family]].forEach(name => {
        expect(FORMATS[family][name]).toBeDefined();
      });
    });
  });

  it('garde les lignes d\'un intertitre ensemble, pour ne pas le couper entre deux pages', () => {
    const styles = byName(files(), 'Resources/Styles.xml');
    const style = name => styles.match(new RegExp(`<ParagraphStyle [^>]*Name="${name}"[^>]*>`))[0];
    ['Intertitre-1', 'Intertitre-2'].forEach(name => {
      expect(style(name)).toContain('KeepLinesTogether="true"');
      expect(style(name)).toContain('KeepWithNext="1"');
    });
  });

  it('garde les retraits suspendus de STYLE_TABLE sur les listes', () => {
    const styles = byName(files(), 'Resources/Styles.xml');
    const style = name => styles.match(new RegExp(`<ParagraphStyle [^>]*Name="${name}"[^>]*>`))[0];
    expect(style('Liste-num')).toContain('LeftIndent="18"');
    expect(style('Liste-num')).toContain('FirstLineIndent="-18"');
    expect(style('Liste-puce')).toContain('LeftIndent="14"');
    expect(style('Liste-puce-2')).toContain('LeftIndent="32"');
    expect(style('Liste-puce-2')).toContain('FirstLineIndent="-14"');
  });

  it('applique les corps de la charte, pas ceux provisoires de STYLE_TABLE', () => {
    const styles = byName(files(), 'Resources/Styles.xml');
    const style = name => styles.match(new RegExp(`<ParagraphStyle [^>]*Name="${name}"[^>]*>`))[0];
    Object.entries(FORMATS.paragraph).forEach(([name, format]) => {
      if (format.size) expect(style(name)).toContain(`PointSize="${format.size}"`);
    });
  });

  it('pose un filet d’axe sous Titre-chapitre', () => {
    const styles = byName(files(), 'Resources/Styles.xml');
    const style = styles.match(/<ParagraphStyle [^>]*Name="Titre-chapitre"[^>]*>/)[0];
    expect(style).toContain('RuleBelowOn="true"');
    expect(style).toContain('RuleBelowColor="Color/Axe%20vif"');
  });

  it('neutralise les contours par défaut d’InDesign sur les tableaux : filets horizontaux seuls, aucun filet vertical', () => {
    const styles = byName(files(), 'Resources/Styles.xml');
    const table = styles.match(/<TableStyle [^>]*Name="Tableau"[^>]*>/)[0];
    expect(table).toContain('LeftBorderStrokeWeight="0"');
    expect(table).toContain('RightBorderStrokeWeight="0"');
    const cell = styles.match(/<CellStyle [^>]*Name="Cellule"[^>]*>/)[0];
    expect(cell).toContain('LeftEdgeStrokeWeight="0"');
    expect(cell).toContain('RightEdgeStrokeWeight="0"');
    expect(cell).toContain('TopEdgeStrokeWeight="0.5"');
    expect(cell).toContain('BottomEdgeStrokeWeight="0.5"');
  });

  it('rend chaque référence de style et de nuance résolvable', () => {
    const list = files({ masters: true });
    const known = new Set([...selfIds(byName(list, 'Resources/Styles.xml')), ...selfIds(byName(list, 'Resources/Graphic.xml'))]);
    const checked = ['Resources/Styles.xml', 'Spreads/Spread_1.xml', ...list.filter(f => /^(Stories|MasterSpreads)\//.test(f.name)).map(f => f.name)];
    checked.forEach(name => {
      const text = byName(list, name);
      const refs = [
        ...text.matchAll(/(?:Applied\w*Style|NextStyle|FillColor|StrokeColor|RuleAboveColor|RuleBelowColor|ParagraphShadingColor|\w+BorderStrokeColor|\w+RowFillColor)="([^"]+)"/g),
        ...text.matchAll(/<(?:BasedOn|BulletsCharacterStyle|NumberingCharacterStyle)[^>]*>([^<]+)</g)
      ].map(m => m[1]);
      refs.filter(r => r !== 'n' && r !== 'Swatch/None').forEach(r => {
        if (!known.has(r)) throw new Error(`${name} : référence introuvable « ${r} »`);
      });
    });
  });

  it('a des identifiants Self uniques dans chaque fichier', () => {
    files({ masters: true }).filter(f => f.name.endsWith('.xml')).forEach(f => {
      const ids = selfIds(f.text);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  it('applique les couleurs de l’axe choisi à Axe vif, texte et fond', () => {
    Object.entries(AXES).forEach(([axis, label]) => {
      const graphic = byName(files({ axis }), 'Resources/Graphic.xml');
      ['vif', 'texte', 'fond'].forEach(tone => {
        const [r, g, b] = COLORS[`${label} ${tone}`];
        const re = new RegExp(`Name="Axe ${tone}"`);
        const line = graphic.split('\n').find(l => re.test(l));
        expect(line).toContain(`ColorValue="${r} ${g} ${b}"`);
      });
    });
  });

  it('écrit les titres courants de A-Courante en texte brut et pose les coins pliés sous les folios', () => {
    const list = files({ masters: true });
    const headTitle = byName(list, 'Stories/Story_A-Courante_en-tete-gauche-titre.xml');
    // Quicksand n'a pas le triangle : il porte le style de caractère Puce (police qui l'a), sinon marqueur rouge.
    expect(headTitle).toMatch(/CharacterStyle\/Puce"[^>]*>\s*<Content>▶<\/Content>/);
    expect(headTitle).toContain('<Content> Titre du document</Content>');
    expect(byName(list, 'Stories/Story_A-Courante_en-tete-droite-titre.xml')).toMatch(/CharacterStyle\/Puce"[^>]*>\s*<Content>▶<\/Content>/);
    expect(byName(list, 'Stories/Story_A-Courante_en-tete-gauche-version.xml')).toContain('<Content>v1.0</Content>');
    const master = byName(list, 'MasterSpreads/MasterSpread_A-Courante.xml');
    expect(master.indexOf('Polygon_A-Courante_coin-left')).toBeLessThan(master.indexOf('Frame_A-Courante_folio-gauche'));
    expect(master.indexOf('Polygon_A-Courante_coin-right')).toBeLessThan(master.indexOf('Frame_A-Courante_folio-droite'));
  });

  it('trace un pointillé de pliage orange sur chaque coin plié et centre un folio blanc dans le rabat', () => {
    const list = files({ masters: true });
    const master = byName(list, 'MasterSpreads/MasterSpread_A-Courante.xml');
    ['left', 'right'].forEach(side => {
      const line = master.split('\n').find(l => l.includes(`Line_A-Courante_pli-pointille-${side}`));
      // Géométrie, pas style de contour : InDesign ignore ceux d'un IDML et traçait un trait plein.
      expect(line).not.toContain('StrokeType');
      const block = master.slice(master.indexOf(`Line_A-Courante_pli-pointille-${side}`)).split('</Polygon>')[0];
      const segments = [...block.matchAll(/<PathPointArray>(.*?)<\/PathPointArray>/g)].map(m => [...m[1].matchAll(/Anchor="([-\d.]+) /g)].map(p => Number(p[1])));
      expect(segments.length).toBeGreaterThan(20);
      expect(segments.every(([a, b]) => b > a && b - a <= 1.5 + 1e-6)).toBe(true);
      expect(segments.slice(0, -1).every(([a], i) => Math.abs(segments[i + 1][0] - a - 3) < 1e-6)).toBe(true);
      expect(line).toContain('Axe%20vif');
      const header = master.split('\n').find(l => l.includes(`Line_A-Courante_en-tete-${side === 'left' ? 'gauche' : 'droite'}`));
      const weight = text => text.match(/StrokeWeight="([\d.]+)"/)[1];
      expect(weight(line)).toBe(weight(header));
      // Même trait orange pointillé sous le titre courant : un tracé composé, plus un filet noir plein.
      expect(header).toContain('Axe%20vif');
      expect(header).toContain('<Polygon ');
      expect(master.slice(master.indexOf(header)).split('</Polygon>')[0].match(/<GeometryPathType/g).length).toBeGreaterThan(20);
    });
    const folio = byName(list, 'Stories/Story_A-Courante_folio-droite.xml');
    expect(folio).toContain('Justification="CenterAlign"');
    expect(folio).toContain('FillColor="Color/Paper"');
  });

  it('pose le même pointillé orange sur chaque gabarit à pied de page, et aligne celui du pli sur le haut du rabat', () => {
    const list = files({ masters: true });
    const dotted = (name, label) => {
      const master = byName(list, `MasterSpreads/MasterSpread_${name}.xml`);
      const start = master.indexOf(`Line_${name}_${label}`);
      expect(start).toBeGreaterThan(-1);
      const block = master.slice(start).split('</Polygon>')[0];
      expect(block).toContain('Axe%20vif');
      expect(block).not.toContain('<GraphicLine');
      expect(block.match(/<GeometryPathType/g).length).toBeGreaterThan(20);
      return { master, block };
    };
    dotted('B-Chapitre', 'pli-pointille');
    dotted('C-Couverture', 'pied-filet');
    // Le contour est centré sur le tracé : le trait descend d'une demi-épaisseur, son bord haut est celui du rabat.
    const { master, block } = dotted('A-Courante', 'pli-pointille-left');
    const cornerTop = Number(master.slice(master.indexOf('Polygon_A-Courante_pli-left')).match(/Anchor="[-\d.]+ ([-\d.]+)"/)[1]);
    const weight = Number(block.match(/StrokeWeight="([\d.]+)"/)[1]);
    const lineY = Number(block.match(/Anchor="[-\d.]+ ([-\d.]+)"/)[1]);
    expect(lineY - weight / 2).toBeCloseTo(cornerTop, 6);
  });

  it('met le même texte de pied, dans le même style, sur les trois cadres de pied', () => {
    const list = files({ masters: true });
    const footers = [['A-Courante', 'pied-gauche'], ['A-Courante', 'pied-droite'], ['B-Chapitre', 'pied-titre']]
      .map(([master, frame]) => byName(list, `Stories/Story_${master}_${frame}.xml`));
    footers.forEach(text => {
      expect(text).toContain('<Content>François-Xavier Guillois · scriptami</Content>');
      expect(text).toContain('ParagraphStyle/Titre-courant');
      expect(text).not.toContain('scriptami.com');
    });
  });

  it('reprend le texte de pied du guide quand un guide est choisi', () => {
    const list = files({ masters: true, pages: {
      label: GUIDE.partenaire.title,
      verb: 'Consolider',
      cover: [{ style: 'Titre-couverture', text: 'Guide' }, { style: 'Surtitre', text: 'Version 1' }, { style: 'Sommaire-titre', text: 'Sommaire' }, { style: 'Sommaire-ligne', text: '01	A' }],
      subtitle: 's',
      footer: 'Scriptami · Guide de test',
      contact: { titre: 't', accroche: 'a', cartes: [{ label: 'l', valeur: 'v', note: 'n' }, { label: 'l', valeur: 'v', note: 'n' }, { label: 'l', valeur: 'v', note: 'n' }] },
      end: [{ style: 'Surtitre', text: 'x' }, { style: 'Courant', text: 'y' }]
    } });
    ['A-Courante_pied-gauche', 'A-Courante_pied-droite', 'B-Chapitre_pied-titre'].forEach(name => {
      expect(byName(list, `Stories/Story_${name}.xml`)).toContain('<Content>Scriptami · Guide de test</Content>');
    });
  });

  it('règle A4 en vis-à-vis, marges de la charte et 3 mm de fond perdu', () => {
    const prefs = byName(files(), 'Resources/Preferences.xml');
    expect(prefs).toContain('FacingPages="true"');
    expect(prefs).toContain('PageWidth="595.2756"');
    expect(prefs).toContain('PageHeight="841.8898"');
    expect(prefs).toContain('DocumentBleedTopOffset="8.5039"');
    expect(prefs).toContain('Top="36"');
    expect(prefs).toContain('Left="58.3937"');
  });

  it('n’ajoute les quatre gabarits qu’avec l’option', () => {
    expect(files().map(f => f.name).filter(n => n.startsWith('MasterSpreads/'))).toEqual([]);
    const withMasters = files({ masters: true });
    ['A-Courante', 'B-Chapitre', 'C-Couverture', 'D-Fin'].forEach(name => {
      expect(withMasters.map(f => f.name)).toContain(`MasterSpreads/MasterSpread_${name}.xml`);
      expect(byName(withMasters, 'designmap.xml')).toContain(`MasterSpreads/MasterSpread_${name}.xml`);
    });
    expect(byName(withMasters, 'Spreads/Spread_1.xml')).toContain('AppliedMaster="Master_A-Courante"');
    expect(byName(withMasters, 'designmap.xml')).toContain('VariableType="MatchParagraphStyleType"');
  });

  it('a des identifiants Self uniques dans tout le paquet, gabarits compris', () => {
    const all = files({ masters: true }).filter(f => f.name.endsWith('.xml')).flatMap(f => selfIds(f.text));
    expect(new Set(all).size).toBe(all.length);
  });

  it('dessine les décors des gabarits en polygones', () => {
    const list = files({ masters: true });
    expect(byName(list, 'MasterSpreads/MasterSpread_A-Courante.xml')).toContain('Name="coin-left"');
    expect(byName(list, 'MasterSpreads/MasterSpread_B-Chapitre.xml')).toContain('Name="fond-haut"');
    expect(byName(list, 'MasterSpreads/MasterSpread_C-Couverture.xml')).toContain('Name="bandeau"');
    const fin = byName(list, 'MasterSpreads/MasterSpread_D-Fin.xml');
    expect(fin).toContain('Name="bandeau-contact"');
    expect(fin).toContain('Name="pied-anthracite"');
  });

  it('réserve à la couverture et à la fin un cadre de texte pour leur ICML', () => {
    const list = files({ masters: true });
    const story = label => list.filter(f => f.name.startsWith('Stories/') && f.name.includes(label)).map(f => f.text).join('');
    expect(byName(list, 'MasterSpreads/MasterSpread_C-Couverture.xml')).toContain('Name="texte-couverture"');
    expect(story('C-Couverture_texte-couverture')).toContain('00-pages/couverture.icml');
    const fin = byName(list, 'MasterSpreads/MasterSpread_D-Fin.xml');
    expect(fin).toContain('Name="conseils-fin"');
    expect(story('D-Fin_conseils-fin')).toContain('00-pages/fin-conseils.icml');
    expect(fin).toContain('TextColumnCount="2"');
    expect(fin).toContain('Name="conseils-filet"');
  });

  it('remplace le texte « SCRIPTAMI » par le mot vectoriel sur la couverture et par le picto seul sur la fin', () => {
    const list = files({ masters: true });
    const cover = byName(list, 'MasterSpreads/MasterSpread_C-Couverture.xml');
    const fin = byName(list, 'MasterSpreads/MasterSpread_D-Fin.xml');
    const stories = prefix => list.filter(f => f.name.startsWith('Stories/') && f.name.includes(prefix)).map(f => f.text).join('');
    // Mot : un seul tracé composé de neuf lettres, dont les contreformes (S, C, R, P, A) sont des sous-tracés.
    const word = cover.match(/<Polygon Self="Polygon_C-Couverture_logo"[\s\S]*?<\/Polygon>/)[0];
    expect((word.match(/<GeometryPathType /g) || []).length).toBeGreaterThanOrEqual(12);
    expect(word).toContain('FillColor="Color/Anthracite%20fonc%C3%A9"');
    expect(word).toMatch(/LeftDirection="[^"]+" RightDirection="[^"]+"/);
    expect(stories('C-Couverture_logo')).toBe('');
    // Picto : trois facettes, sans texte « SCRIPTAMI » dans le pied.
    for (const name of ['orange', 'jaune', 'turquoise']) expect(fin).toContain(`Name="picto-${name}"`);
    expect(stories('D-Fin_pied-texte')).not.toContain('SCRIPTAMI');
    expect(cover).not.toContain('Name="picto-');
  });

  it('peint le picto de dégradés déclarés au nuancier, à 88 % d’opacité', () => {
    const list = files({ masters: true });
    const graphic = byName(list, 'Resources/Graphic.xml');
    const fin = byName(list, 'MasterSpreads/MasterSpread_D-Fin.xml');
    for (const name of ['orange', 'jaune', 'turquoise']) {
      const gradient = graphic.match(new RegExp(`<Gradient Self="Gradient/Picto%20${name}"[\\s\\S]*?</Gradient>`))[0];
      const stops = [...gradient.matchAll(/<GradientStop [^>]*StopColor="([^"]+)" Location="([^"]+)"/g)];
      expect(stops.length).toBeGreaterThanOrEqual(5);
      expect(stops[0][2]).toBe('0');
      expect(stops[stops.length - 1][2]).toBe('100');
      // Chaque point d’arrêt pointe une nuance du nuancier.
      for (const [, color] of stops) expect(graphic).toContain(`<Color Self="${color}"`);
      const polygon = fin.match(new RegExp(`<Polygon Self="Polygon_D-Fin_picto-${name}"[\\s\\S]*?</Polygon>`))[0];
      expect(polygon).toContain(`FillColor="Gradient/Picto%20${name}"`);
      expect(polygon).toMatch(/GradientFillStart="[-\d.]+ [-\d.]+" GradientFillLength="[\d.]+" GradientFillAngle="-?\d+"/);
      expect(polygon).toContain('<BlendingSetting Opacity="88"/>');
    }
    expect(graphic).not.toContain('Logo orange');
  });

  it('pose des repères de règle sur A (colonne marginale) et B (zones de l’ouverture de chapitre), pas sur C ni D', () => {
    const list = files({ masters: true });
    const guidesOf = name => [...byName(list, `MasterSpreads/MasterSpread_${name}.xml`).matchAll(/<Guide [^>]*>/g)].map(match => match[0]);
    const attr = (guide, key) => guide.match(new RegExp(`${key}="([^"]+)"`))[1];
    const half = PAGE.height / 2;

    // A : haut du corps, bas du bloc numéro + rubrique, bas du corps (ordonnées du dos : y - mi-hauteur).
    const a = guidesOf('A-Courante');
    expect(a.map(guide => attr(guide, 'Orientation'))).toEqual(['Horizontal', 'Horizontal', 'Horizontal']);
    const expectedA = [56 - half, 120 - half, PAGE.height - 70 - half];
    a.forEach((guide, index) => expect(Number(attr(guide, 'Location'))).toBeCloseTo(expectedA[index], 2));

    // B : un repère par bord de zone, sans doublon, alignés sur les cadres d’exemple.
    const b = guidesOf('B-Chapitre');
    const horizontal = b.filter(guide => attr(guide, 'Orientation') === 'Horizontal').map(guide => Number(attr(guide, 'Location')));
    const vertical = b.filter(guide => attr(guide, 'Orientation') === 'Vertical').map(guide => Number(attr(guide, 'Location')));
    const zones = Object.values(chapterBoxes());
    const expectedH = [...new Set(zones.flatMap(zone => [zone.top, zone.bottom]))].map(y => y - half).sort((x, y) => x - y);
    const expectedV = [...new Set(zones.flatMap(zone => [zone.left, zone.right]))].sort((x, y) => x - y);
    horizontal.sort((x, y) => x - y).forEach((value, index) => expect(value).toBeCloseTo(expectedH[index], 2));
    vertical.sort((x, y) => x - y).forEach((value, index) => expect(value).toBeCloseTo(expectedV[index], 2));
    expect(horizontal).toHaveLength(expectedH.length);
    expect(vertical).toHaveLength(2);

    expect(guidesOf('C-Couverture')).toEqual([]);
    expect(guidesOf('D-Fin')).toEqual([]);
    // Chaque repère a son identifiant propre et ne verrouille rien.
    const selves = [...a, ...b].map(guide => attr(guide, 'Self'));
    expect(new Set(selves).size).toBe(selves.length);
    expect([...a, ...b].every(guide => attr(guide, 'Locked') === 'false')).toBe(true);
  });

  it('fait de A un gabarit double et de B, C et D des pages simples', () => {
    const list = files({ masters: true });
    const pages = name => (byName(list, `MasterSpreads/MasterSpread_${name}.xml`).match(/<Page /g) || []).length;
    expect(pages('A-Courante')).toBe(2);
    ['B-Chapitre', 'C-Couverture', 'D-Fin'].forEach(name => expect(pages(name)).toBe(1));
  });

  it('donne au style Puce une police qui porte le triangle, modifiable', () => {
    const puce = options => byName(files(options), 'Resources/Styles.xml').match(/<CharacterStyle [^>]*Name="Puce"[\s\S]*?<\/CharacterStyle>/)[0];
    expect(puce()).toContain('<AppliedFont type="string">Segoe UI Symbol</AppliedFont>');
    expect(puce({ bulletFont: 'Apple Symbols' })).toContain('<AppliedFont type="string">Apple Symbols</AppliedFont>');
  });

  it('refuse un axe inconnu', () => {
    expect(() => buildIdmlEntries({ axis: 'rose' })).toThrow(IdmlError);
  });

  it('est déterministe', () => {
    expect(buildIdml({ masters: true }).equals(buildIdml({ masters: true }))).toBe(true);
  });
});

describe('build-idml-template : pages remplies', () => {
  const pages = {
    label: GUIDE.partenaire.title,
    verb: 'Consolider',
    cover: [
      { style: 'Titre-couverture', text: 'Guide du partenaire' },
      { style: 'Surtitre', text: 'Version 9.9.9' },
      { style: 'Sommaire-titre', text: 'Sommaire' },
      { style: 'Sommaire-ligne', text: '01\tPrendre en main' },
      { style: 'Sommaire-ligne', text: '02\tImporter le tarif' }
    ],
    subtitle: 'Un sous-titre propre au guide de test.',
    footer: 'Scriptami · Guide de test',
    contact: {
      titre: 'Un blocage technique de test ?',
      accroche: 'Votre interlocuteur de test vous répond.',
      cartes: [
        { label: 'E-mail', valeur: 'test@exemple.fr', note: 'Réponse sous 48 h' },
        { label: 'Téléphone', valeur: '01 02 03 04 05', note: 'En semaine' },
        { label: 'Nom', valeur: 'Alex Test', note: 'Interlocuteur technique' }
      ]
    },
    end: [
      { style: 'Surtitre', text: 'Pour être aidé vite' },
      { style: 'Courant', text: '1. Première ligne de conseil.' },
      { style: 'Surtitre', text: 'Avant de nous écrire', columnBreak: true },
      { style: 'Courant', text: '1. Relisez le message.' }
    ]
  };
  const built = () => files({ masters: true, pages });
  const storyTexts = list => list.filter(entry => entry.name.startsWith('Stories/Story_Page-')).map(entry => entry.text);

  it('exige les gabarits', () => {
    expect(() => buildIdmlEntries({ pages })).toThrow(IdmlError);
  });

  it('compose cinq planches : couverture, sommaire, deux doubles pages de texte, fin', () => {
    const list = built();
    expect(list.filter(entry => entry.name.startsWith('Spreads/')).map(entry => entry.name))
      .toEqual([1, 2, 3, 4, 5].map(n => `Spreads/Spread_${n}.xml`));
    expect(byName(list, 'designmap.xml')).toContain('Spreads/Spread_5.xml');
    for (const n of [3, 4]) {
      const text = byName(list, `Spreads/Spread_${n}.xml`);
      expect(text.match(/AppliedMaster="Master_A-Courante"/g)).toHaveLength(2);
      expect(text.match(/<TextFrame /g)).toHaveLength(5); // texte et marginale par page, plus une note de côté
    }
    const names = byName(list, 'Spreads/Spread_3.xml').match(/ Name="(\d+)" AppliedMaster/g);
    expect(names).toEqual([' Name="4" AppliedMaster', ' Name="5" AppliedMaster']);
    expect(byName(list, 'Spreads/Spread_5.xml')).toContain('Name="8"');
    const double = byName(list, 'Spreads/Spread_2.xml');
    expect(double).toContain('PageCount="2"');
    expect(double).toContain('AppliedMaster="Master_A-Courante"');
    expect(double).toContain('AppliedMaster="Master_B-Chapitre"');
    expect(double.indexOf('A-Courante')).toBeLessThan(double.indexOf('B-Chapitre'));
    const left = double.split('<Page ')[1];
    expect(left).toMatch(/ItemTransform="1 0 0 1 -595\.\d+ /);
    expect(left).toContain('Left="58.3937"');
    expect(left).toContain('Right="36"');
  });

  it('ouvre le chapitre sur la page B avec un titre qui alimente le titre courant', () => {
    const list = built();
    const frames = byName(list, 'Spreads/Spread_2.xml').match(/<TextFrame [\s\S]*?<\/TextFrame>/g);
    const rightXs = frames.slice(1).flatMap(frame => [...frame.matchAll(/Anchor="(-?[\d.]+) /g)].map(m => Number(m[1])));
    expect(frames).toHaveLength(6);
    expect(Math.min(...rightXs)).toBeGreaterThanOrEqual(0);
    const contentOf = story => [...story.matchAll(/<Content>([^<]*)<\/Content>/g)].map(m => m[1]).join('');
    const stories = storyTexts(list);
    const title = stories.find(text => text.includes('ParagraphStyle/Titre-chapitre'));
    expect(contentOf(title)).toBe('Importer le tarif');
    expect(title).toContain('CharacterStyle/Accent');
    expect(stories.find(text => text.includes(`ParagraphStyle/${encodeURIComponent('Numéro-chapitre')}`))).toBeDefined();
    expect(stories.find(text => text.includes('ParagraphStyle/Chapeau'))).toBeDefined();
  });

  it('cale la première ligne du numéro de chapitre sur l’interlignage, sans quoi le corps de 150 pt déborde du cadre', () => {
    const frames = byName(built(), 'Spreads/Spread_2.xml').match(/<TextFrame [\s\S]*?<\/TextFrame>/g);
    const withBaseline = frames.filter(frame => frame.includes('FirstBaselineOffset="LeadingOffset"'));
    expect(withBaseline).toHaveLength(1);
    expect(withBaseline[0]).toContain('Name="chapitre-numero"');
  });

  it('compose le bloc « Dans ce chapitre » avec quatre sections numérotées et des filets épais', () => {
    const list = built();
    const block = storyTexts(list).find(text => text.includes('Dans ce chapitre'));
    expect(block).toContain('RuleAboveLineWeight="3"');
    expect(block).toContain('RuleBelowLineWeight="3"');
    expect(block.match(/ParagraphStyle\/Sommaire-section/g)).toHaveLength(4);
    expect(block.match(/CharacterStyle\/Sommaire-page/g)).toHaveLength(4);
    expect(block).toContain('<Content>\t</Content>');
  });

  it('remplit les pages courantes de styles variés, sans texte hors de leur page', () => {
    const list = built();
    const stories = list.filter(entry => entry.name.startsWith('Stories/Story_Page-Texte') && entry.text.includes('ParagraphStyle/Courant'));
    expect(stories).toHaveLength(4);
    const all = storyTexts(list).join('');
    for (const style of ['Numéro-section', 'Intertitre-1', 'Liste-puce', 'Liste-num', 'Encadré-info', 'Encadré-attention', 'Encadré-retenir', 'Note-renvoi']) {
      expect(all).toContain(`ParagraphStyle/${encodeURIComponent(style)}`);
    }
    expect(all).toContain(`CharacterStyle/${encodeURIComponent('Encadré-libellé')}`);
    for (const n of [3, 4]) {
      const frames = byName(list, `Spreads/Spread_${n}.xml`).match(/<TextFrame [\s\S]*?<\/TextFrame>/g);
      const xs = frames.map(frame => [...frame.matchAll(/Anchor="(-?[\d.]+) /g)].map(m => Number(m[1])));
      // Les deux premiers cadres sont les textes de gauche et de droite ; la marginale est du côté extérieur.
      expect(Math.max(...xs[0])).toBeLessThanOrEqual(0);
      expect(Math.min(...xs[1])).toBeGreaterThanOrEqual(0);
      expect(Math.min(...xs[2])).toBeLessThan(Math.min(...xs[0]) + 1);
      expect(Math.max(...xs[3])).toBeGreaterThan(Math.max(...xs[1]) - 1);
    }
  });

  it('pose le sommaire sur la page de gauche, avec numéros, tabulations et filets', () => {
    const list = built();
    const frame = byName(list, 'Spreads/Spread_2.xml').match(/<TextFrame [\s\S]*?<\/TextFrame>/)[0];
    const xs = [...frame.matchAll(/Anchor="(-?[\d.]+) /g)].map(m => Number(m[1]));
    expect(Math.max(...xs)).toBeLessThanOrEqual(0);
    const story = storyTexts(list).find(text => text.includes('Prendre en main'));
    expect(story).toContain('Sommaire');
    expect(story).toContain('Importer le tarif');
    expect(story).toContain('CharacterStyle/Sommaire-num');
    expect(story).toContain('CharacterStyle/Sommaire-page');
    expect(story).toContain('<Content>\t</Content>');
    expect(story).toContain('RuleBelowOn="true"');
    expect(story).toContain('RuleBelowLineWeight="3"');
  });

  it('numérote le sommaire d’après les pages du guide, « p. … » en l’absence de numéro', () => {
    const summaryOf = withPages => {
      const list = files({ masters: true, pages: withPages });
      const story = storyTexts(list).find(text => text.includes('Prendre en main'));
      return [...story.matchAll(/CharacterStyle\/Sommaire-page[^>]*>\s*<Content>([^<]*)<\/Content>/g)].map(m => m[1]);
    };
    expect(summaryOf({ ...pages, pages: { 1: 3, 2: 11 } })).toEqual(['p. 3', 'p. 11']);
    expect(summaryOf({ ...pages, pages: { 1: 3 } })).toEqual(['p. 3', 'p. …']);
    expect(summaryOf(pages)).toEqual(['p. …', 'p. …']);
  });

  it('définit la ligne de sommaire avec une tabulation à gauche et une à droite', () => {
    const styles = byName(built(), 'Resources/Styles.xml');
    const style = styles.match(/<ParagraphStyle [^>]*Name="Sommaire-chapitre"[\s\S]*?<\/ParagraphStyle>/)[0];
    expect(style).toContain('<TabList type="list">');
    expect(style).toContain('LeftAlign');
    expect(style).toContain('RightAlign');
  });

  it('donne à chaque guide l’accent de la configuration, parmi les axes connus', () => {
    expect(Object.fromEntries(CONFIG.guides.map(guide => [guide.id, guide.accent])))
      .toEqual({ administrateur: 'vert', partenaire: 'turquoise', vendeur: 'orange' });
    CONFIG.guides.forEach(guide => expect(Object.keys(AXES)).toContain(guide.accent));
  });

  it('les accents acceptés par la configuration sont exactement les axes du modèle', () => {
    expect([...ACCENTS].sort()).toEqual(Object.keys(AXES).sort());
  });

  it('présente les trois guides sur trois lignes identiques, sans mettre en avant celui du document', () => {
    const signature = verb => {
      const list = files({ masters: true, pages: { ...pages, verb } });
      return list.find(entry => entry.name === 'Stories/Story_C-Couverture_signature-marque.xml').text;
    };
    const reference = signature('Consolider');
    for (const verb of ['Consolider', 'Débloquer', 'Maîtriser']) {
      const story = signature(verb);
      expect(story).toBe(reference);
      expect(story).not.toContain('PointSize="12"');
      for (const [word, guide] of [['consolider', 'guide du client'], ['débloquer', 'guide du vendeur'], ['maîtriser', 'guide de l’administrateur']]) {
        expect(story).toMatch(new RegExp(`CharacterStyle/Gras"[^>]*>\\s*<Content>${word}</Content>`));
        expect(story).toContain(`<Content> · ${guide}</Content>`);
      }
    }
  });

  it('associe un verbe à chaque guide, celui de la couverture', () => {
    expect(Object.fromEntries(CONFIG.guides.map(guide => [guide.id, guide.verb])))
      .toEqual({ partenaire: 'Consolider', vendeur: 'Débloquer', administrateur: 'Maîtriser' });
    expect(Object.fromEntries(CONFIG.guides.map(guide => [guide.id, guide.title])))
      .toEqual({ partenaire: 'Guide du client', vendeur: 'Guide du vendeur', administrateur: 'Guide de l’administrateur' });
    const vendeur = files({ masters: true, pages: { ...pages, label: GUIDE.vendeur.title, verb: GUIDE.vendeur.verb } });
    expect(vendeur.map(entry => entry.text).join(' ')).toContain('Débloquer · Guide du vendeur');
    const sansVerbe = { ...pages };
    delete sansVerbe.verb;
    expect(files({ masters: true, pages: sansVerbe }).map(entry => entry.text).join(' ')).toContain('Maîtriser · Guide du client');
  });

  it('peint le triangle et le texte du verbe aux couleurs de l’axe', () => {
    const list = built();
    const cover = byName(list, 'MasterSpreads/MasterSpread_C-Couverture.xml');
    expect(cover).toMatch(/Polygon_C-Couverture_verbe-triangle"[^>]*FillColor="Color\/Axe%20vif"/);
    const verbe = list.find(entry => entry.name.startsWith('Stories/Story_Page-C') && entry.text.includes('Consolider · Guide du client'));
    expect(verbe.text).toContain('FillColor="Color/Axe%20texte"');
    expect(verbe.text).not.toContain('Vert%20texte');
  });

  it('remplit la couverture sans repère ni doublon dans le gabarit', () => {
    const list = built();
    const all = list.map(entry => entry.text).join('\n');
    expect(all).not.toContain('Placer ici');
    expect(all).toContain('<Content>Guide du </Content>');
    expect(all).toMatch(/CharacterStyle\/Accent"[^>]*>\s*<Content>partenaire<\/Content>/);
    expect(all).toContain('Un sous-titre propre au guide de test.');
    expect(all).not.toContain('Sous-titre du document à renseigner');
    expect(all).toMatch(/CharacterStyle\/Gras"[^>]*>\s*<Content>consolider<\/Content>/);
    expect(all).toContain('Version 9.9.9');
    expect(all).toContain('Consolider · Guide du client');
    const cover = byName(list, 'MasterSpreads/MasterSpread_C-Couverture.xml');
    expect(cover.match(/<Polygon /g).length).toBeGreaterThanOrEqual(4);
    expect(cover).toContain('type-document-cadre');
    // Le cadre du type de document est de la couleur du papier de la maquette, pas du blanc natif d'InDesign.
    expect(cover).toMatch(/Name="type-document-cadre" FillColor="Color\/Papier%20de%20page"/);
    expect(cover).toMatch(/Name="type-document-cadre"[^>]*StrokeWeight="2"/);
  });

  it('peint les trois cartes de la page de fin de la couleur du papier', () => {
    const end = byName(built(), 'MasterSpreads/MasterSpread_D-Fin.xml');
    const cards = end.match(/<Rectangle Self="Rectangle_D-Fin_carte-[^>]*>/g);
    expect(cards).toHaveLength(3);
    cards.forEach(card => expect(card).toContain('FillColor="Color/Papier%20de%20page"'));
  });

  it('pose le contact du guide dans le bandeau et les cartes de la page de fin', () => {
    const fin = byName(built(), 'MasterSpreads/MasterSpread_D-Fin.xml');
    const text = [...built().filter(f => f.name.startsWith('Stories/') && f.name.includes('D-Fin_')).map(f => f.text)].join('');
    expect(fin).toContain('Name="bandeau-contact"');
    for (const value of [pages.contact.titre, pages.contact.accroche, ...pages.contact.cartes.flatMap(card => [card.label, card.valeur, card.note])]) {
      expect(text).toContain(value);
    }
    expect(text).not.toContain('Une question sur ce document ?');
    expect(text).not.toContain('Historique des versions');
  });

  it('garde un contact à renseigner dans le gabarit D sans guide', () => {
    const text = files({ masters: true }).filter(f => f.name.startsWith('Stories/') && f.name.includes('D-Fin_')).map(f => f.text).join('');
    expect(text).toContain('Une question sur ce document ?');
    expect(text).toContain('À renseigner');
  });

  it('numérote la page de fin 4 et reste déterministe', () => {
    expect(byName(built(), 'Spreads/Spread_3.xml')).toContain('Name="4"');
    expect(buildIdml({ masters: true, pages }).equals(buildIdml({ masters: true, pages }))).toBe(true);
  });

  it('garde des identifiants Self uniques et des fichiers bien formés', () => {
    const list = built();
    list.filter(entry => entry.name.endsWith('.xml')).forEach(entry => assertWellFormed(entry.text, entry.name));
    const ids = list.filter(entry => /^(Spreads|Stories)\//.test(entry.name)).flatMap(entry => selfIds(entry.text));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('build-idml-template : ligne de commande', () => {
  it('lit les options et ignore le -- de pnpm', () => {
    expect(parseArgs(['--', '--axe', 'orange', '--gabarits', '--police-puce', 'Apple Symbols']))
      .toEqual({ axis: 'orange', masters: true, bulletFont: 'Apple Symbols' });
  });

  it('rejette une option inconnue, un axe inconnu et une valeur manquante', () => {
    expect(() => parseArgs(['--x'])).toThrow(IdmlError);
    expect(() => parseArgs(['--axe', 'rose'])).toThrow(/Axe inconnu/);
    expect(() => parseArgs(['--axe'])).toThrow(/valeur/);
  });

  it('nomme le fichier d’après l’axe', () => {
    expect(outputPathFor('/tmp/x', 'vert')).toMatch(/scriptami-vert\.idml$/);
  });
});
