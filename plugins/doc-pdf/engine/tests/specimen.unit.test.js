/**
 * Spécimen de calage (engine/specimen) : il doit exercer chaque style que la transformation pose,
 * sinon une maquette « calée » sur lui laisserait des styles jamais vus.
 *
 * Fixture figée, régénérée par (Pandoc 3.7) depuis engine/specimen/guide-specimen :
 *   cat 01-structure.md 02-encadres.md 03-images.md | pandoc -f gfm -t icml -s > ../../tests/fixtures/specimen/specimen.pandoc.icml
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { transformIcml } = require('../icml-transform');
const { loadMaquette, initMaquette } = require('../maquette');

const SKELETON = loadMaquette(path.join(__dirname, '..', 'maquettes', 'squelette'));
const SPECIMEN_DIR = path.join(__dirname, '..', 'specimen');
const SOURCE = fs.readFileSync(path.join(__dirname, 'fixtures', 'specimen', 'specimen.pandoc.icml'), 'utf8');

// Styles que le spécimen doit faire apparaître (cf. la table de styles du squelette).
const EXPECTED = {
  paragraph: [
    'Titre-chapitre', 'Intertitre-1', 'Intertitre-2', 'Courant', 'Liste-num', 'Liste-num-suite',
    'Liste-puce', 'Liste-puce-2', 'Tableau texte', 'Tableau en-tête', 'Encadré-info',
    'Encadré-attention', 'Encadré-retenir', 'Note-renvoi', 'Capture'
  ],
  character: ['Gras', 'Italique', 'Code-inline', 'Renvoi', 'Encadré-libellé', 'Accent'],
  table: ['Tableau'],
  cell: ['Cellule']
};

function applied(icml, kind) {
  return new Set([...icml.matchAll(new RegExp(`Applied${kind}Style="${kind}Style/([^"]*)"`, 'g'))].map(m => m[1]));
}

describe('spécimen de calage', () => {
  const result = transformIcml(SOURCE, {
    chapterDir: path.join(SPECIMEN_DIR, 'guide-specimen'),
    chapterNumber: 2,
    maquette: SKELETON
  });
  // Le flux principal et ses cadres satellites (notes de renvoi) portent ensemble les styles du chapitre.
  const icml = [result.icml, ...result.satellites.map(satellite => satellite.icml)].join('\n');

  test.each(Object.entries(EXPECTED))('exerce chaque style %s de la transformation', (kind, names) => {
    const label = kind[0].toUpperCase() + kind.slice(1);
    const found = applied(icml, label);
    const missing = names.filter(name => !found.has(name));
    expect(missing).toEqual([]);
  });

  test('les styles posés existent tous dans la table de la maquette', () => {
    const known = new Set(SKELETON.styles.paragraph.map(entry => entry.name));
    const unknown = [...applied(icml, 'Paragraph')].filter(name => !known.has(name) && !name.startsWith('$ID/'));
    expect(unknown).toEqual([]);
  });

  test('copié par initMaquette, il se charge et produit l’IDML du guide sans Pandoc', () => {
    const dest = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'specimen-test-')), 'essai');
    initMaquette(dest);
    const specimen = path.join(dest, 'specimen');
    const run = spawnSync(process.execPath, [
      path.join(__dirname, '..', 'cli.js'), 'idml', '--guide', 'specimen',
      '--config', path.join(specimen, 'documentation.config.json')
    ], { encoding: 'utf8' });
    expect(run.stderr).toBe('');
    expect(run.status).toBe(0);
    expect(fs.existsSync(path.join(specimen, 'output', 'idml', 'essai-bleu-specimen.idml'))).toBe(true);
  });
});
