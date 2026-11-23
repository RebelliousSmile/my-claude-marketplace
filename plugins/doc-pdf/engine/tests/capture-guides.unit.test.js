/**
 * Commande `captures` (engine/capture-guides.js) : images citées, contrôle, lancement de la commande du projet.
 * Le projet est un dossier temporaire : aucune capture réelle, la commande est simulée.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { main, citedImages, orphanImages, localTarget } = require('../capture-guides');
const { loadConfig } = require('../guide-config');

const SQUELETTE = path.join(__dirname, '..', 'maquettes', 'squelette');
const PNG = Buffer.from('89504e470d0a1a0a', 'hex');
const tempDirs = [];

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

/** Projet minimal : deux guides, une image citée manquante, une image orpheline. */
function project(extraConfig = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-pdf-captures-'));
  tempDirs.push(dir);
  const docs = path.join(dir, 'docs');
  write(path.join(docs, 'documentation.config.json'), JSON.stringify({
    maquette: SQUELETTE,
    sourceDir: '.',
    pagesFile: 'pages-gabarit.json',
    guides: [
      { id: 'vendeur', dir: 'guide-vendeur', title: 'Guide du vendeur', verb: 'Débloquer', accent: 'bleu', mergedFile: 'fusion.md' },
      { id: 'client', dir: 'guide-client', title: 'Guide du client', verb: 'Consolider', accent: 'gris' }
    ],
    ...extraConfig
  }));
  write(path.join(docs, 'guide-vendeur', '01-a.md'), [
    '# A', '', '![Fiche](images/fiche.png)', '', '![Même image](images/fiche.png "titre")',
    '![Espace](<images/avec espace.png>)', '![Distante](https://exemple.test/x.png)', '',
    '```md', '![Exemple de code](images/code.png)', '```', ''
  ].join('\r\n'));
  write(path.join(docs, 'guide-vendeur', '02-b.md'), '# B\n\n![Liste](images/liste.png#haut)\n');
  write(path.join(docs, 'guide-vendeur', 'fusion.md'), '![Dans la fusion](images/fusion-seule.png)\n');
  write(path.join(docs, 'guide-vendeur', 'images', 'fiche.png'), PNG);
  write(path.join(docs, 'guide-vendeur', 'images', 'avec espace.png'), PNG);
  write(path.join(docs, 'guide-vendeur', 'images', 'orpheline.png'), PNG);
  write(path.join(docs, 'guide-client', '01-a.md'), '# A\n\n![Écran](images/ecran.png)\n');
  write(path.join(docs, 'guide-client', 'images', 'ecran.png'), PNG);
  return { dir, docs, config: path.join(docs, 'documentation.config.json') };
}

function sink() {
  const lines = { log: [], err: [] };
  return { lines, out: { log: m => lines.log.push(m), err: m => lines.err.push(m) } };
}

afterAll(() => {
  tempDirs.forEach(dir => fs.rmSync(dir, { recursive: true, force: true }));
});

describe('localTarget', () => {
  test.each([
    ['images/a.png', 'images/a.png'],
    ['<images/a b.png>', 'images/a b.png'],
    ['images/a%20b.png', 'images/a b.png'],
    ['images/a.png#haut', 'images/a.png'],
    ['images/a.png?v=2', 'images/a.png'],
    ['https://exemple.test/a.png', null],
    ['data:image/png;base64,AAAA', null]
  ])('%s', (raw, expected) => {
    expect(localTarget(raw)).toBe(expected);
  });
});

describe('citedImages', () => {
  test('une entrée par fichier, fusion exclue, hors code et adresses distantes', () => {
    const { config: file } = project();
    const config = loadConfig({ configPath: file });
    const cited = citedImages(config, config.guides[0]);
    expect(cited.map(image => path.basename(image.file))).toEqual(['fiche.png', 'avec espace.png', 'liste.png']);
    expect(cited[0].sources).toEqual(['01-a.md']);
  });

  test('les images du dossier images que rien ne cite sont signalées', () => {
    const { config: file } = project();
    const config = loadConfig({ configPath: file });
    const guide = config.guides[0];
    expect(orphanImages(config, guide, citedImages(config, guide)).map(f => path.basename(f))).toEqual(['orpheline.png']);
  });
});

describe('captures list / check', () => {
  test('list : état de chaque image, exit 0 même avec une image manquante', () => {
    const { config } = project();
    const s = sink();
    expect(main(['list', '--config', config], { out: s.out })).toBe(0);
    const text = s.lines.log.join('\n');
    expect(text).toMatch(/vendeur : 3 image\(s\) citée\(s\), 1 manquante\(s\)/);
    expect(text).toMatch(/MANQUANTE\s+guide-vendeur\/images\/liste\.png/);
    expect(text).toMatch(/non citée\(s\) : orpheline\.png/);
    expect(text).toMatch(/client : 1 image\(s\) citée\(s\), 0 manquante\(s\)/);
  });

  test('check : sort en 1 et nomme l’image manquante', () => {
    const { config } = project();
    const s = sink();
    expect(main(['check', '--config', config], { out: s.out })).toBe(1);
    expect(s.lines.log.join('\n')).toMatch(/MANQUANTE\s+guide-vendeur\/images\/liste\.png/);
    expect(s.lines.err[0]).toMatch(/1 image\(s\) citée\(s\) absente\(s\)/);
  });

  test('check : exit 0 pour un guide complet, puis pour tous une fois l’image créée', () => {
    const { docs, config } = project();
    expect(main(['check', '--guide', 'client', '--config', config], { out: sink().out })).toBe(0);
    write(path.join(docs, 'guide-vendeur', 'images', 'liste.png'), PNG);
    const s = sink();
    expect(main(['check', '--config', config], { out: s.out })).toBe(0);
    expect(s.lines.log[s.lines.log.length - 1]).toBe('Toutes les images citées existent.');
  });

  test.each([
    [['zzz'], /inconnue ou manquante/],
    [[], /inconnue ou manquante/],
    [['check', '--guide'], /--guide attend/],
    [['check', '--guide', 'rien'], /Guide inconnu : rien/]
  ])('refuse %j', (args, message) => {
    const { config } = project();
    const s = sink();
    expect(main([...args, '--config', config], { out: s.out })).toBe(1);
    expect(s.lines.err.join('\n')).toMatch(message);
  });
});

describe('captures run', () => {
  const captures = { command: 'pnpm run guides:captures', cwd: '..', env: { PORT: '3033' } };

  test('sans champ « captures » : rien n’est lancé', () => {
    const { config } = project();
    const run = jest.fn();
    const s = sink();
    expect(main(['run', '--config', config], { out: s.out, run })).toBe(1);
    expect(run).not.toHaveBeenCalled();
    expect(s.lines.err[0]).toMatch(/aucun champ « captures »/);
  });

  test('lance la commande dans son dossier avec l’environnement déclaré, puis distingue réécrites et inchangées', () => {
    const { dir, docs, config } = project({ captures });
    const old = new Date('2020-01-01T00:00:00Z');
    fs.utimesSync(path.join(docs, 'guide-vendeur', 'images', 'fiche.png'), old, old);
    fs.utimesSync(path.join(docs, 'guide-vendeur', 'images', 'avec espace.png'), old, old);
    const run = jest.fn(() => {
      write(path.join(docs, 'guide-vendeur', 'images', 'liste.png'), PNG);
      write(path.join(docs, 'guide-vendeur', 'images', 'fiche.png'), PNG);
      return { status: 0 };
    });
    const s = sink();
    expect(main(['run', '--guide', 'vendeur', '--config', config], { out: s.out, run })).toBe(0);

    const [command, options] = run.mock.calls[0];
    expect(command).toBe('pnpm run guides:captures');
    expect(options).toEqual(expect.objectContaining({ shell: true, cwd: dir, stdio: 'inherit' }));
    expect(options.env).toEqual(expect.objectContaining({
      PORT: '3033', DOC_PDF_SOURCE_DIR: docs, DOC_PDF_GUIDE: 'vendeur'
    }));
    const text = s.lines.log.join('\n');
    expect(text).toMatch(/vendeur : 2 réécrite\(s\), 1 inchangée\(s\), 0 manquante\(s\)/);
    expect(text).toMatch(/inchangée\s+guide-vendeur\/images\/avec espace\.png/);
    expect(text).not.toMatch(/client : /);
  });

  test('sans --guide : tous les guides sont contrôlés et DOC_PDF_GUIDE n’est pas posé', () => {
    const { config } = project({ captures });
    const run = jest.fn(() => ({ status: 0 }));
    const s = sink();
    main(['run', '--config', config], { out: s.out, run });
    expect(run.mock.calls[0][1].env.DOC_PDF_GUIDE).toBeUndefined();
    expect(s.lines.log.join('\n')).toMatch(/client : /);
  });

  test('image toujours absente après la commande : exit 1', () => {
    const { config } = project({ captures });
    const s = sink();
    expect(main(['run', '--config', config], { out: s.out, run: () => ({ status: 0 }) })).toBe(1);
    expect(s.lines.err.join('\n')).toMatch(/1 image\(s\) citée\(s\) toujours absente\(s\)/);
  });

  test.each([
    [{ status: 3 }, /code 3/],
    [{ status: null, error: new Error('ENOENT') }, /ENOENT/]
  ])('échec de la commande %j : exit 1, images non contrôlées', (result, message) => {
    const { config } = project({ captures });
    const s = sink();
    expect(main(['run', '--config', config], { out: s.out, run: () => result })).toBe(1);
    expect(s.lines.err[0]).toMatch(message);
    expect(s.lines.log.join('\n')).not.toMatch(/réécrite/);
  });
});
