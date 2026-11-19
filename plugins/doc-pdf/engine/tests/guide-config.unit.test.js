/**
 * Configuration d'un projet client du moteur de documentation (scripts/guides/guide-config.js) :
 * validation, résolution des chemins, découverte du fichier, désignation d'un guide, version.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  ConfigError,
  ACCENTS,
  CONFIG_NAME,
  DEFAULT_TYPE,
  resolveConfig,
  readConfig,
  locateConfig,
  loadConfig,
  extractConfigArg,
  findGuide,
  readVersion
} = require('../guide-config');
const { AXES } = require('../build-idml-template');

const REPO_CONFIG_FILE = path.join(__dirname, 'fixtures', 'project', 'docs', CONFIG_NAME);

const tempDirs = [];

function tempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cerascan-config-'));
  tempDirs.push(dir);
  return dir;
}

afterAll(() => {
  tempDirs.forEach(dir => fs.rmSync(dir, { recursive: true, force: true }));
});

const GUIDE = { id: 'vendeur', dir: 'guide-vendeur', title: 'Guide du vendeur', verb: 'Débloquer', accent: 'orange' };

function valid(overrides = {}) {
  return {
    sourceDir: '.',
    pagesFile: 'pages.json',
    guides: [{ ...GUIDE }, { id: 'client', dir: 'guide-client', title: 'Guide du client', verb: 'Consolider', accent: 'turquoise' }],
    ...overrides
  };
}

const FILE = path.resolve('/projet/docs', CONFIG_NAME);

describe('resolveConfig', () => {
  test('résout les chemins relatifs au dossier du fichier de configuration', () => {
    const config = resolveConfig(valid({ outputDir: '../sortie', versionFile: '../package.json' }), FILE);
    expect(config.dir).toBe(path.dirname(FILE));
    expect(config.sourceDir).toBe(path.resolve('/projet/docs'));
    expect(config.outputDir).toBe(path.resolve('/projet/sortie'));
    expect(config.pagesFile).toBe(path.resolve('/projet/docs/pages.json'));
    expect(config.versionFile).toBe(path.resolve('/projet/package.json'));
  });

  test('sortie par défaut : « output » à côté du fichier', () => {
    expect(resolveConfig(valid(), FILE).outputDir).toBe(path.resolve('/projet/docs/output'));
  });

  test('complète type et fichier fusionné des guides, dans l’ordre de la configuration', () => {
    const { guides } = resolveConfig(valid(), FILE);
    expect(guides.map(guide => guide.id)).toEqual(['vendeur', 'client']);
    expect(guides[0].type).toBe(DEFAULT_TYPE);
    expect(guides[0].mergedFile).toBeNull();
    const custom = resolveConfig(valid({ guides: [{ ...GUIDE, type: 'Manuel', mergedFile: 'm.md' }] }), FILE).guides[0];
    expect(custom.type).toBe('Manuel');
    expect(custom.mergedFile).toBe('m.md');
  });

  test('document : chemin du .indd résolu par rapport au fichier de configuration, absent par défaut', () => {
    expect(resolveConfig(valid(), FILE).guides[0].document).toBeNull();
    const { guides } = resolveConfig(valid({ guides: [{ ...GUIDE, document: 'indd/guide.indd' }] }), FILE);
    expect(guides[0].document).toBe(path.resolve('/projet/docs', 'indd', 'guide.indd'));
  });

  test('pdfPreset : nul par défaut, repris tel quel sinon', () => {
    expect(resolveConfig(valid(), FILE).pdfPreset).toBeNull();
    expect(resolveConfig(valid({ pdfPreset: 'Qualité optimale' }), FILE).pdfPreset).toBe('Qualité optimale');
  });

  test('plusieurs guides peuvent partager le même accent', () => {
    const config = resolveConfig(valid({ guides: [GUIDE, { ...GUIDE, id: 'autre', dir: 'guide-autre' }] }), FILE);
    expect(config.guides).toHaveLength(2);
  });

  test.each([
    ['sourceDir', { sourceDir: undefined }, /« sourceDir »/],
    ['pagesFile', { pagesFile: '  ' }, /« pagesFile »/],
    ['outputDir', { outputDir: 3 }, /« outputDir »/],
    ['versionFile', { versionFile: '' }, /« versionFile »/],
    ['guides absent', { guides: undefined }, /« guides »/],
    ['guides vide', { guides: [] }, /« guides »/],
    ['guide non objet', { guides: ['x'] }, /« guides\[0\] » doit être un objet/],
    ['id manquant', { guides: [{ ...GUIDE, id: undefined }] }, /« guides\[0\]\.id »/],
    ['id hors format', { guides: [{ ...GUIDE, id: 'Vendeur' }] }, /« guides\[0\]\.id ».*minuscules/],
    ['dir manquant', { guides: [{ ...GUIDE, dir: undefined }] }, /« guides\[0\]\.dir »/],
    ['dir avec chemin', { guides: [{ ...GUIDE, dir: '../autre' }] }, /« guides\[0\]\.dir »/],
    ['dir « .. »', { guides: [{ ...GUIDE, dir: '..' }] }, /« guides\[0\]\.dir »/],
    ['title manquant', { guides: [{ ...GUIDE, title: '' }] }, /« guides\[0\]\.title »/],
    ['verb manquant', { guides: [{ ...GUIDE, verb: undefined }] }, /« guides\[0\]\.verb »/],
    ['accent manquant', { guides: [{ ...GUIDE, accent: undefined }] }, /« guides\[0\]\.accent »/],
    ['type vide', { guides: [{ ...GUIDE, type: ' ' }] }, /« guides\[0\]\.type »/],
    ['mergedFile vide', { guides: [{ ...GUIDE, mergedFile: '' }] }, /« guides\[0\]\.mergedFile »/],
    ['document vide', { guides: [{ ...GUIDE, document: '' }] }, /« guides\[0\]\.document »/],
    ['document sans extension .indd', { guides: [{ ...GUIDE, document: 'guide.pdf' }] }, /« guides\[0\]\.document » doit être un fichier \.indd/],
    ['pdfPreset vide', { pdfPreset: ' ' }, /« pdfPreset »/]
  ])('refuse %s en nommant le champ', (_name, overrides, message) => {
    expect(() => resolveConfig(valid(overrides), FILE)).toThrow(ConfigError);
    expect(() => resolveConfig(valid(overrides), FILE)).toThrow(message);
  });

  test('refuse un accent hors charte et cite les valeurs acceptées', () => {
    const raw = valid({ guides: [{ ...GUIDE, accent: 'rose' }] });
    expect(() => resolveConfig(raw, FILE)).toThrow(/« guides\[0\]\.accent » hors charte : rose/);
    expect(() => resolveConfig(raw, FILE)).toThrow(/turquoise, orange, vert/);
  });

  test('refuse un identifiant ou un dossier en double, en désignant le second guide', () => {
    expect(() => resolveConfig(valid({ guides: [GUIDE, { ...GUIDE, dir: 'autre' }] }), FILE))
      .toThrow(/« guides\[1\]\.id » en double : vendeur/);
    expect(() => resolveConfig(valid({ guides: [GUIDE, { ...GUIDE, id: 'autre' }] }), FILE))
      .toThrow(/« guides\[1\]\.dir » en double : guide-vendeur/);
  });

  test.each([[null], [[]], ['texte']])('refuse un contenu qui n’est pas un objet : %j', (raw) => {
    expect(() => resolveConfig(raw, FILE)).toThrow(/doit contenir un objet/);
  });

  test('les accents de la charte sont exactement les axes du modèle IDML', () => {
    expect([...ACCENTS].sort()).toEqual(Object.keys(AXES).sort());
  });
});

describe('lecture et découverte', () => {
  test('readConfig lit un fichier JSON valide', () => {
    const dir = tempDir();
    const file = path.join(dir, CONFIG_NAME);
    fs.writeFileSync(file, JSON.stringify(valid()), 'utf8');
    const config = readConfig(file);
    expect(config.file).toBe(file);
    expect(config.guides).toHaveLength(2);
  });

  test('readConfig refuse un JSON illisible en nommant le fichier', () => {
    const dir = tempDir();
    const file = path.join(dir, CONFIG_NAME);
    fs.writeFileSync(file, '{ pas du json', 'utf8');
    expect(() => readConfig(file)).toThrow(ConfigError);
    expect(() => readConfig(file)).toThrow(/illisible/);
  });

  test('locateConfig : un chemin explicite doit exister', () => {
    const dir = tempDir();
    expect(() => locateConfig({ configPath: 'absent.json', cwd: dir })).toThrow(/introuvable/);
    const file = path.join(dir, 'autre.json');
    fs.writeFileSync(file, '{}', 'utf8');
    expect(locateConfig({ configPath: 'autre.json', cwd: dir })).toBe(file);
  });

  test('locateConfig remonte les dossiers parents depuis le dossier courant', () => {
    const root = tempDir();
    const file = path.join(root, CONFIG_NAME);
    fs.writeFileSync(file, '{}', 'utf8');
    const deep = path.join(root, 'a', 'b');
    fs.mkdirSync(deep, { recursive: true });
    expect(locateConfig({ cwd: deep })).toBe(file);
  });

  test('locateConfig sans fichier : message qui propose --config', () => {
    // Sous le dossier temporaire du système, aucun documentation.config.json n'existe plus haut.
    const dir = tempDir();
    expect(() => locateConfig({ cwd: dir })).toThrow(/Passer --config/);
  });

  test('loadConfig enchaîne la découverte et la lecture', () => {
    const config = loadConfig({ configPath: REPO_CONFIG_FILE });
    expect(config.guides.map(guide => guide.id)).toEqual(['administrateur', 'partenaire', 'vendeur']);
    expect(config.guides.every(guide => ACCENTS.includes(guide.accent))).toBe(true);
  });
});

describe('extractConfigArg', () => {
  test('sépare --config du reste, sans toucher au -- de pnpm', () => {
    expect(extractConfigArg(['--', '--config', 'c.json', '--guide', 'x']))
      .toEqual({ configPath: 'c.json', rest: ['--', '--guide', 'x'] });
  });

  test('sans --config : chemin nul, arguments inchangés', () => {
    expect(extractConfigArg(['--guide', 'x'])).toEqual({ configPath: null, rest: ['--guide', 'x'] });
  });

  test.each([[['--config']], [['--config', '--guide']]])('refuse --config sans chemin : %j', (argv) => {
    expect(() => extractConfigArg(argv)).toThrow(/--config attend/);
  });
});

describe('findGuide', () => {
  const config = resolveConfig(valid(), FILE);

  test('désigne un guide par son identifiant ou par son dossier', () => {
    expect(findGuide(config, 'vendeur').dir).toBe('guide-vendeur');
    expect(findGuide(config, 'guide-client').id).toBe('client');
  });

  test('un guide inconnu liste les identifiants acceptés', () => {
    expect(() => findGuide(config, 'autre')).toThrow(ConfigError);
    expect(() => findGuide(config, 'autre')).toThrow(/Guide inconnu : autre\. Valeurs acceptées : vendeur, client\./);
  });
});

describe('readVersion', () => {
  test('lit la version du fichier indiqué par la configuration', () => {
    const dir = tempDir();
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ version: '3.4.5' }), 'utf8');
    const config = resolveConfig(valid({ versionFile: 'package.json' }), path.join(dir, CONFIG_NAME));
    expect(readVersion(config)).toBe('3.4.5');
  });

  test('versionFile absent de la configuration : package.json le plus proche en remontant', () => {
    const dir = tempDir();
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ version: '1.0.0' }), 'utf8');
    const nested = path.join(dir, 'docs');
    fs.mkdirSync(nested);
    expect(readVersion(resolveConfig(valid(), path.join(nested, CONFIG_NAME)))).toBe('1.0.0');
  });

  test('fichier de version introuvable : erreur de configuration', () => {
    const config = resolveConfig(valid({ versionFile: 'absent.json' }), path.join(tempDir(), CONFIG_NAME));
    expect(() => readVersion(config)).toThrow(ConfigError);
    expect(() => readVersion(config)).toThrow(/versionFile/);
  });

  test('la version du dépôt est celle de package.json', () => {
    const expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'project', 'package.json'), 'utf8')).version;
    expect(readVersion(loadConfig({ configPath: REPO_CONFIG_FILE }))).toBe(expected);
  });
});
