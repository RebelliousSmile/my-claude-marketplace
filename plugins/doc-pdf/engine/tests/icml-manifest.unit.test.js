/**
 * Empreintes des ICML générés (scripts/guides/icml-manifest.js) : enregistrement, détection d'un fichier
 * corrigé à la main, entrées sans source, et arrêt de l'export (scripts/guides/export-icml.js) sans écriture.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  MANIFEST_NAME,
  ManifestError,
  fingerprint,
  manifestPathFor,
  keyFor,
  readManifest,
  findModified,
  findStale,
  writeManifest
} = require('../icml-manifest');
const { exportGuides, parseArgs, ExportError, PANDOC_MISSING } = require('../export-icml');
const { loadConfig } = require('../guide-config');

const FIXTURE_CONFIG = path.join(__dirname, 'fixtures', 'project', 'docs', 'documentation.config.json');

const REPO_CONFIG = loadConfig({ configPath: FIXTURE_CONFIG });

const tempDirs = [];

function tempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cerascan-manifest-'));
  tempDirs.push(dir);
  return dir;
}

afterAll(() => {
  tempDirs.forEach(dir => fs.rmSync(dir, { recursive: true, force: true }));
});

/** Écrit les ICML et leur manifeste, comme un export. Rend la liste `outputs`. */
function exportFiles(dir, contents) {
  const outputs = Object.entries(contents).map(([relative, icml]) => ({ file: path.join(dir, ...relative.split('/')), icml }));
  outputs.forEach(({ file, icml }) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, icml, 'utf8');
  });
  writeManifest(dir, outputs);
  return outputs;
}

describe('fingerprint', () => {
  test('SHA-256 hexadécimal, identique pour un texte et ses octets UTF-8', () => {
    expect(fingerprint('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(fingerprint(Buffer.from('é', 'utf8'))).toBe(fingerprint('é'));
  });

  test('un caractère de plus change l\'empreinte', () => {
    expect(fingerprint('a')).not.toBe(fingerprint('a '));
  });
});

describe('writeManifest et readManifest', () => {
  test('enregistre une empreinte par fichier, chemins relatifs en « / », triés', () => {
    const dir = tempDir();
    exportFiles(dir, { 'guide-b/corps.icml': 'b', 'common/pied.icml': 'a' });
    const files = readManifest(dir);
    expect(Object.keys(files)).toEqual(['common/pied.icml', 'guide-b/corps.icml']);
    expect(files['common/pied.icml']).toBe(fingerprint('a'));
    expect(path.basename(manifestPathFor(dir))).toBe(MANIFEST_NAME);
  });

  test('le contenu accentué est empreint tel qu\'écrit sur le disque', () => {
    const dir = tempDir();
    exportFiles(dir, { 'a.icml': 'Écrit — « été »' });
    expect(findModified(dir)).toEqual([]);
  });

  test('un second export remplace les empreintes du premier', () => {
    const dir = tempDir();
    exportFiles(dir, { 'a.icml': '1', 'b.icml': '2' });
    exportFiles(dir, { 'a.icml': '1' });
    expect(Object.keys(readManifest(dir))).toEqual(['a.icml']);
  });

  test('sans manifeste : objet vide', () => {
    expect(readManifest(tempDir())).toEqual({});
  });

  test.each([
    ['JSON illisible', '{ pas du json'],
    ['clé « files » absente', '{"version":1}'],
    ['« files » en tableau', '{"files":[]}']
  ])('manifeste invalide (%s) : erreur qui explique comment repartir', (_name, content) => {
    const dir = tempDir();
    fs.writeFileSync(manifestPathFor(dir), content, 'utf8');
    expect(() => readManifest(dir)).toThrow(ManifestError);
    expect(() => readManifest(dir)).toThrow(/supprimer/);
  });
});

describe('findModified', () => {
  test('aucun écart juste après un export', () => {
    const dir = tempDir();
    exportFiles(dir, { 'a.icml': '1', 'g/b.icml': '2' });
    expect(findModified(dir)).toEqual([]);
  });

  test('un ICML corrigé à la main est nommé, les autres non', () => {
    const dir = tempDir();
    exportFiles(dir, { 'a.icml': '1', 'g/b.icml': '2' });
    fs.writeFileSync(path.join(dir, 'g', 'b.icml'), '2 corrigé', 'utf8');
    expect(findModified(dir)).toEqual([path.join(dir, 'g', 'b.icml')]);
  });

  test('un fichier supprimé n\'est pas « modifié » : la régénération le recrée', () => {
    const dir = tempDir();
    exportFiles(dir, { 'a.icml': '1' });
    fs.rmSync(path.join(dir, 'a.icml'));
    expect(findModified(dir)).toEqual([]);
  });

  test('un fichier absent du manifeste n\'est pas contrôlé', () => {
    const dir = tempDir();
    exportFiles(dir, { 'a.icml': '1' });
    fs.writeFileSync(path.join(dir, 'autre.icml'), 'x', 'utf8');
    expect(findModified(dir)).toEqual([]);
  });

  test('sans manifeste, rien n\'est jugé modifié (premier export)', () => {
    const dir = tempDir();
    fs.writeFileSync(path.join(dir, 'a.icml'), 'x', 'utf8');
    expect(findModified(dir)).toEqual([]);
  });
});

describe('findStale (ICML sans source)', () => {
  test('rend les entrées que le nouvel export ne produit plus', () => {
    const dir = tempDir();
    exportFiles(dir, { 'a.icml': '1', 'g/b.icml': '2', 'g/c.icml': '3' });
    const next = [{ file: path.join(dir, 'a.icml'), icml: '1' }, { file: path.join(dir, 'g', 'c.icml'), icml: '3' }];
    expect(findStale(dir, next)).toEqual([path.join(dir, 'g', 'b.icml')]);
  });

  test('rien quand tout est reproduit', () => {
    const dir = tempDir();
    const outputs = exportFiles(dir, { 'a.icml': '1' });
    expect(findStale(dir, outputs)).toEqual([]);
  });
});

describe('keyFor', () => {
  test('chemin relatif avec « / », quel que soit le système', () => {
    const dir = path.join(os.tmpdir(), 'x');
    expect(keyFor(dir, path.join(dir, 'g', 'c', 'corps.icml'))).toBe('g/c/corps.icml');
  });
});

describe('export : arrêt sur un ICML modifié à la main', () => {
  /** Dossier d'ICML déjà exporté, dont un fichier a été corrigé à la main ; sources inexistantes. */
  function seeded() {
    const outDir = tempDir();
    exportFiles(outDir, { 'guide-vendeur/00-pages/couverture.icml': 'original', 'common/pied.icml': 'pied' });
    const edited = path.join(outDir, 'guide-vendeur', '00-pages', 'couverture.icml');
    fs.writeFileSync(edited, 'corrigé à la main', 'utf8');
    return { outDir, edited };
  }

  const config = () => {
    const sourceDir = tempDir();
    REPO_CONFIG.guides.forEach(guide => fs.mkdirSync(path.join(sourceDir, guide.dir)));
    return { ...REPO_CONFIG, sourceDir };
  };

  test('nomme le fichier et s\'arrête avant toute conversion ou écriture', () => {
    const { outDir, edited } = seeded();
    const before = fs.readFileSync(edited, 'utf8');
    expect(() => exportGuides({ config: config(), outDir, pandoc: 'pandoc-introuvable-cerascan' }))
      .toThrow(/couverture\.icml/);
    expect(() => exportGuides({ config: config(), outDir, pandoc: 'pandoc-introuvable-cerascan' }))
      .toThrow(/--force/);
    expect(fs.readFileSync(edited, 'utf8')).toBe(before);
  });

  test('le message d\'arrêt n\'est pas celui de Pandoc : le contrôle passe avant la conversion', () => {
    const { outDir } = seeded();
    expect(() => exportGuides({ config: config(), outDir, pandoc: 'pandoc-introuvable-cerascan' }))
      .not.toThrow(new ExportError(PANDOC_MISSING));
  });

  test('--force lève l\'arrêt (l\'export va jusqu\'à Pandoc)', () => {
    const { outDir } = seeded();
    expect(() => exportGuides({ config: config(), outDir, pandoc: 'pandoc-introuvable-cerascan', force: true }))
      .toThrow(new ExportError(PANDOC_MISSING));
  });

  test('un manifeste illisible arrête l\'export avec une ExportError', () => {
    const outDir = tempDir();
    fs.writeFileSync(manifestPathFor(outDir), '{ pas du json', 'utf8');
    expect(() => exportGuides({ config: config(), outDir, pandoc: 'pandoc-introuvable-cerascan' }))
      .toThrow(ExportError);
  });

  test('--force est reconnu par la ligne de commande', () => {
    expect(parseArgs(['--force'])).toEqual({ force: true });
    expect(parseArgs(['--', '--force', '--largeur-colonne', '300'])).toEqual({ force: true, columnWidth: 300 });
  });
});
