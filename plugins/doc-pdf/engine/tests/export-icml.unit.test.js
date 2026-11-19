/**
 * Commande d'export ICML des guides (scripts/guides/export-icml.js) : sélection
 * des chapitres, chemins de sortie, ICML orphelins, échecs sans écriture.
 * La conversion elle-même est couverte par icml-transform.unit.test.js ; les
 * exécutions avec Pandoc se font par pnpm run guides:icml.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  listChapters,
  outputPathFor,
  satellitePathFor,
  chapterHeaderPathsFor,
  findOrphans,
  pagePathsFor,
  commonPathsFor,
  exportGuides,
  sharedDocumentType,
  parseArgs,
  ExportError,
  PANDOC_MISSING
} = require('../export-icml');
const { loadConfig } = require('../guide-config');

const FIXTURE_CONFIG = path.join(__dirname, 'fixtures', 'project', 'docs', 'documentation.config.json');

/** Configuration du dépôt : les guides, leurs dossiers et les fichiers de pages viennent d'elle, pas du test. */
const REPO_CONFIG = loadConfig({ configPath: FIXTURE_CONFIG });
const GUIDE_DIRS = REPO_CONFIG.guides.map(guide => guide.dir);

const tempDirs = [];

function tempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cerascan-icml-'));
  tempDirs.push(dir);
  return dir;
}

function write(file, content = '# Titre\n') {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

/**
 * Configuration au nom des guides du dépôt, mais sources dans un dossier temporaire :
 * seul guide-administrateur porte chapitres et leurres.
 */
function fakeGuides() {
  const guidesDir = tempDir();
  GUIDE_DIRS.forEach(guide => fs.mkdirSync(path.join(guidesDir, guide)));
  const admin = path.join(guidesDir, 'guide-administrateur');
  write(path.join(admin, '02-b.md'));
  write(path.join(admin, '01-a.md'));
  write(path.join(admin, 'guide client.md'));
  write(path.join(admin, 'images', 'capture.png'), 'png');
  write(path.join(guidesDir, 'runbook-x.md'));
  return { ...REPO_CONFIG, sourceDir: guidesDir };
}

afterAll(() => {
  tempDirs.forEach(dir => fs.rmSync(dir, { recursive: true, force: true }));
});

describe('listChapters', () => {
  test('retient les chapitres numérotés, dans l\'ordre, et écarte les leurres', () => {
    const chapters = listChapters(fakeGuides());
    expect(chapters.map(c => `${c.guide}/${c.name}`)).toEqual([
      'guide-administrateur/01-a.md',
      'guide-administrateur/02-b.md'
    ]);
  });

  test('un dossier de guide absent arrête l\'export en le nommant', () => {
    const config = fakeGuides();
    fs.rmSync(path.join(config.sourceDir, 'guide-vendeur'), { recursive: true });
    expect(() => listChapters(config)).toThrow(/guide-vendeur/);
  });

  test('projet de fixture : chaque chapitre numéroté des trois guides a son chemin de sortie', () => {
    const outDir = path.join(os.tmpdir(), 'sortie');
    const chapters = listChapters(REPO_CONFIG);
    const outputs = chapters.map(chapter => outputPathFor(outDir, chapter));

    GUIDE_DIRS.forEach(guide => {
      // Témoin indépendant du filtre du script.
      const expected = fs.readdirSync(path.join(REPO_CONFIG.sourceDir, guide))
        .filter(name => /^0[0-9]-.*\.md$/.test(name))
        .map(name => path.join(outDir, guide, name.replace(/\.md$/, ''), 'corps.icml'));
      expect(expected.length).toBeGreaterThan(0);
      expect(outputs.filter(file => file.startsWith(path.join(outDir, guide) + path.sep)).sort())
        .toEqual(expected.sort());
    });
  });
});

describe('outputPathFor', () => {
  test('<outDir>/<guide>/<chapitre>/corps.icml', () => {
    const chapter = { guide: 'guide-partenaire', name: '03-generer-qrcodes.md', dir: '/x' };
    expect(outputPathFor('/sortie', chapter))
      .toBe(path.join('/sortie', 'guide-partenaire', '03-generer-qrcodes', 'corps.icml'));
  });
});

describe('findOrphans', () => {
  test('signale un ICML sans chapitre, ignore ceux qui en ont un, ne supprime rien', () => {
    const outDir = tempDir();
    const chapters = listChapters(fakeGuides());
    chapters.forEach(chapter => write(outputPathFor(outDir, chapter), '<icml/>'));
    const orphan = path.join(outDir, 'guide-administrateur', '00-ancien-nom.icml');
    write(orphan, '<icml/>');
    write(path.join(outDir, 'guide-vendeur', 'notes.txt'), 'texte');

    expect(findOrphans(outDir, chapters)).toEqual([orphan]);
    expect(fs.existsSync(orphan)).toBe(true);
  });

  test('aucun dossier de sortie : aucun orphelin', () => {
    expect(findOrphans(path.join(tempDir(), 'absent'), [])).toEqual([]);
  });
});

describe('textes de gabarit par cadre', () => {
  const chapter = { guide: 'guide-partenaire', name: '03-generer-qrcodes.md', dir: '/x' };

  test('<outDir>/<guide>/<chapitre>/<nom>.icml, à côté du corps du chapitre', () => {
    expect(satellitePathFor('/sortie', chapter, 'marge-3.1'))
      .toBe(path.join('/sortie', 'guide-partenaire', '03-generer-qrcodes', 'marge-3.1.icml'));
  });

  test('en-tête de la page droite : numéro et titre du chapitre, à côté du corps', () => {
    expect(chapterHeaderPathsFor('/sortie', chapter)).toEqual({
      number: path.join('/sortie', 'guide-partenaire', '03-generer-qrcodes', 'en-tete-chapitre.icml'),
      title: path.join('/sortie', 'guide-partenaire', '03-generer-qrcodes', 'en-tete-titre-chapitre.icml')
    });
  });

  test('les fichiers attendus ne sont pas des orphelins, un fichier périmé du dossier en est un', () => {
    const outDir = tempDir();
    const chapters = listChapters(fakeGuides());
    const own = chapters[0];
    const kept = satellitePathFor(outDir, own, 'ouverture-titre');
    const stale = satellitePathFor(outDir, own, 'renvoi-9');
    [kept, stale].forEach(file => write(file, '<icml/>'));
    write(path.join(path.dirname(kept), 'notes.txt'), 'texte');

    expect(findOrphans(outDir, chapters, [kept])).toEqual([stale]);
    expect(fs.existsSync(stale)).toBe(true);
  });

  test('sans la liste des fichiers attendus, les textes de gabarit déjà écrits sont signalés', () => {
    const outDir = tempDir();
    const chapters = listChapters(fakeGuides());
    const file = satellitePathFor(outDir, chapters[0], 'ouverture-titre');
    write(file, '<icml/>');
    expect(findOrphans(outDir, chapters)).toEqual([file]);
  });
});

describe('pages de couverture, de sommaire, de pied et de fin', () => {
  test('couverture, sommaire, titre courant, bandeau, cartes et conseils de fin dans 00-pages/ du guide', () => {
    const dir = path.join('/sortie', 'guide-partenaire', '00-pages');
    expect(pagePathsFor('/sortie', 'guide-partenaire')).toEqual({
      cover: path.join(dir, 'couverture.icml'),
      summary: path.join(dir, 'sommaire.icml'),
      headerTitle: path.join(dir, 'en-tete-titre.icml'),
      endBanner: path.join(dir, 'fin-bandeau.icml'),
      endCards: [1, 2, 3].map(n => path.join(dir, `fin-carte-${n}.icml`)),
      end: path.join(dir, 'fin-conseils.icml')
    });
  });

  test('pieds, version, mentions et type de document : un seul exemplaire dans common/', () => {
    const dir = path.join('/sortie', 'common');
    expect(commonPathsFor('/sortie')).toEqual({
      footer: path.join(dir, 'pied.icml'),
      footerLeft: path.join(dir, 'pied-gauche.icml'),
      headerVersion: path.join(dir, 'en-tete-version.icml'),
      mentions: path.join(dir, 'fin-mentions.icml'),
      typeDocument: path.join(dir, 'type-document.icml')
    });
  });

  test('ne sont pas des orphelins, contrairement à un autre ICML sans chapitre', () => {
    const outDir = tempDir();
    const chapters = listChapters(fakeGuides());
    GUIDE_DIRS.forEach((guide) => {
      Object.values(pagePathsFor(outDir, guide)).flat().forEach(file => write(file, '<icml/>'));
    });
    Object.values(commonPathsFor(outDir)).forEach(file => write(file, '<icml/>'));
    const orphan = path.join(outDir, 'guide-vendeur', '00-pages', 'autre.icml');
    write(orphan, '<icml/>');

    expect(findOrphans(outDir, chapters, [], GUIDE_DIRS)).toEqual([orphan]);
  });

  test('un ICML d\'avant common/, resté dans 00-pages/ d\'un guide, est signalé ; un intrus de common/ aussi', () => {
    const outDir = tempDir();
    const chapters = listChapters(fakeGuides());
    Object.values(commonPathsFor(outDir)).forEach(file => write(file, '<icml/>'));
    const old = path.join(outDir, 'guide-vendeur', '00-pages', 'pied.icml');
    const stray = path.join(outDir, 'common', 'autre.icml');
    write(old, '<icml/>');
    write(stray, '<icml/>');

    expect(findOrphans(outDir, chapters, [], GUIDE_DIRS).sort()).toEqual([stray, old].sort());
  });
});

describe('exportGuides', () => {
  test('Pandoc introuvable : message d\'installation, aucun fichier écrit', () => {
    const outDir = tempDir();
    expect(() => exportGuides({ config: fakeGuides(), outDir, pandoc: 'pandoc-introuvable-cerascan' }))
      .toThrow(new ExportError(PANDOC_MISSING));
    expect(fs.readdirSync(outDir)).toEqual([]);
  });

  test('Pandoc en échec : chapitre nommé, aucun fichier écrit', () => {
    const outDir = tempDir();
    // Node refuse l'option -f et sort en erreur : tient lieu de Pandoc défaillant.
    expect(() => exportGuides({ config: fakeGuides(), outDir, pandoc: process.execPath }))
      .toThrow(/^guide-administrateur\/01-a\.md : Pandoc a échoué/);
    expect(fs.readdirSync(outDir)).toEqual([]);
  });
});

describe('exportGuides sans configuration', () => {
  test('la configuration est obligatoire', () => {
    expect(() => exportGuides({ outDir: tempDir() })).toThrow(/configuration/);
  });

  test('les guides aux « type » différents sont refusés : type-document.icml est commun', () => {
    const config = fakeGuides();
    config.guides = config.guides.map((guide, index) => (index === 0 ? { ...guide, type: 'Autre type' } : guide));
    expect(() => exportGuides({ config, outDir: tempDir() })).toThrow(/« type » différents/);
  });

  test('sharedDocumentType rend le type commun', () => {
    expect(sharedDocumentType(REPO_CONFIG.guides)).toBe(REPO_CONFIG.guides[0].type);
  });
});

describe('parseArgs', () => {
  test('sans option : largeur par défaut de la transformation', () => {
    expect(parseArgs([])).toEqual({});
  });

  test('--largeur-colonne transmet la largeur', () => {
    expect(parseArgs(['--largeur-colonne', '300'])).toEqual({ columnWidth: 300 });
  });

  test('le séparateur -- transmis par pnpm est ignoré', () => {
    expect(parseArgs(['--', '--largeur-colonne', '300'])).toEqual({ columnWidth: 300 });
  });

  test.each([['abc'], ['0'], ['-5'], [''], [undefined]])('--largeur-colonne %p refusé', value => {
    const argv = value === undefined ? ['--largeur-colonne'] : ['--largeur-colonne', value];
    expect(() => parseArgs(argv)).toThrow(ExportError);
  });

  test('--config transmet le chemin, avec ou sans autre option', () => {
    expect(parseArgs(['--config', 'x/doc.json'])).toEqual({ configPath: 'x/doc.json' });
    expect(parseArgs(['--largeur-colonne', '300', '--config', 'x/doc.json'])).toEqual({ columnWidth: 300, configPath: 'x/doc.json' });
  });

  test('--config sans chemin refusé', () => {
    expect(() => parseArgs(['--config'])).toThrow(ExportError);
  });

  test('option inconnue refusée', () => {
    expect(() => parseArgs(['--largeur', '300'])).toThrow(/Option inconnue/);
  });
});
