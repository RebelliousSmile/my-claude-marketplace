const fs = require('fs');
const os = require('os');
const path = require('path');
const { ComposeError, releasePdfPath, parseArgs, isInDesignRunning, pathsFor, updatePathsFor, composePathsFor, chapterNamesIn, backupDocument, diffPages, formatPagesReport, stamp, snapshotOutputs, diffSnapshots, formatChangeReport, main, EXIT_MESSAGES, launch } = require('../compose-guide');
const { resolveConfig } = require('../guide-config');

const FIXTURE_CONFIG = path.join(__dirname, 'fixtures', 'project', 'docs', 'documentation.config.json');

const REPO_CONFIG_FILE = FIXTURE_CONFIG;

/** Configuration synthétique : le moteur ne doit rien savoir des guides d'un projet. */
const CONFIG = resolveConfig({
  sourceDir: '.',
  outputDir: '../output',
  pagesFile: 'pages.json',
  versionFile: '../package.json',
  guides: [
    { id: 'vendeur', dir: 'guide-vendeur', title: 'Guide du vendeur', verb: 'Débloquer', accent: 'orange' },
    { id: 'client', dir: 'guide-client', title: 'Guide du client', verb: 'Consolider', accent: 'turquoise' }
  ]
}, path.resolve('/r/docs/documentation.config.json'));

/** Chemin normalisé en `/`, sans lettre de lecteur : stable d'un système à l'autre. */
const slash = file => file.replace(/\\/g, '/').replace(/^[A-Za-z]:/, '');

describe('compose-guide', () => {
  describe('parseArgs', () => {
    it('lit le guide et le chapitre', () => {
      expect(parseArgs(['--guide', 'guide-vendeur', '--chapitre', '01-vue-ensemble']))
        .toEqual({ command: 'build', guide: 'guide-vendeur', chapitre: '01-vue-ensemble', sortie: null, configPath: null });
    });

    it("lit --config, où qu'il soit placé", () => {
      expect(parseArgs(['--config', 'x/doc.json', '--guide', 'vendeur', '--chapitre', '01-a']))
        .toEqual({ command: 'build', guide: 'vendeur', chapitre: '01-a', sortie: null, configPath: 'x/doc.json' });
    });

    it('ignore le -- transmis par pnpm', () => {
      expect(parseArgs(['--', '--guide', 'vendeur', '--chapitre', '01-a']).guide).toBe('vendeur');
    });

    it('lit la commande update, qui ne veut pas de chapitre', () => {
      expect(parseArgs(['update', '--guide', 'vendeur']))
        .toEqual({ command: 'update', guide: 'vendeur', chapitre: null, sortie: null, configPath: null });
      expect(parseArgs(['--', 'update', '--guide', 'vendeur', '--force']).force).toBe(true);
    });

    it('la commande build explicite vaut la commande par défaut', () => {
      expect(parseArgs(['build', '--guide', 'vendeur', '--chapitre', '01-a']))
        .toEqual(parseArgs(['--guide', 'vendeur', '--chapitre', '01-a']));
    });

    it.each([
      [['update'], /Usage/],
      [['update', '--guide', 'vendeur', '--chapitre', '01-a'], /entier/],
      [['--guide', 'vendeur', '--chapitre', '01-a', '--force'], /--force ne vaut que pour/]
    ])('refuse %j', (argv, message) => {
      expect(() => parseArgs(argv)).toThrow(message);
    });

    it.each([
      [[], /Usage/],
      [['--guide', 'guide-vendeur'], /Usage/],
      [['--guide'], /attend une valeur/],
      [['--guide', '--chapitre', 'x'], /attend une valeur/],
      [['--autre', 'x'], /Option inconnue/],
      [['--guide', '../etc', '--chapitre', '01-x'], /Guide : identifiant/],
      [['--guide', 'vendeur', '--chapitre', '../etc'], /minuscules/]
    ])('refuse %j', (argv, message) => {
      expect(() => parseArgs(argv)).toThrow(ComposeError);
      expect(() => parseArgs(argv)).toThrow(message);
    });

    it('refuse --config sans chemin', () => {
      expect(() => parseArgs(['--config'])).toThrow(/--config attend/);
    });
  });

  describe('isInDesignRunning', () => {
    it('reconnaît le processus dans la sortie de tasklist', () => {
      expect(isInDesignRunning('InDesign.exe                 15460 Console')).toBe(true);
    });

    it('ne confond pas avec un autre programme', () => {
      expect(isInDesignRunning('Aucune tâche en cours ne correspond aux critères spécifiés.')).toBe(false);
      expect(isInDesignRunning('InDesignServer.exe 12 Console')).toBe(false);
      expect(isInDesignRunning('')).toBe(false);
    });
  });

  describe('pathsFor', () => {
    it("range les sorties de l'essai sous <outputDir>/pdf-essai", () => {
      const paths = pathsFor({ guide: 'vendeur', chapitre: '01-vue-ensemble' }, CONFIG);
      expect(slash(paths.pdf)).toBe('/r/output/pdf-essai/guide-vendeur-01-vue-ensemble.pdf');
      expect(slash(paths.document)).toBe('/r/output/pdf-essai/guide-vendeur-01-vue-ensemble.indd');
      expect(slash(paths.chapterDir)).toBe('/r/output/icml/guide-vendeur/01-vue-ensemble');
      expect(slash(paths.pagesDir)).toBe('/r/output/icml/guide-vendeur/00-pages');
      expect(slash(paths.commonDir)).toBe('/r/output/icml/common');
    });

    it("le modèle IDML porte l'accent du guide, tiré de la configuration, désigné par id ou par dossier", () => {
      expect(path.basename(pathsFor({ guide: 'vendeur', chapitre: '01-a' }, CONFIG).template)).toBe('scriptami-orange-vendeur.idml');
      expect(path.basename(pathsFor({ guide: 'guide-client', chapitre: '01-a' }, CONFIG).template)).toBe('scriptami-turquoise-client.idml');
    });

    it('refuse un guide absent de la configuration', () => {
      expect(() => pathsFor({ guide: 'inconnu', chapitre: '01-a' }, CONFIG)).toThrow(/Guide inconnu/);
    });
  });

  describe('updatePathsFor', () => {
    const withDocument = (document) => resolveConfig({
      sourceDir: '.',
      outputDir: '../output',
      pagesFile: 'pages.json',
      versionFile: '../package.json',
      pdfPreset: 'Qualité optimale',
      guides: [{ id: 'vendeur', dir: 'guide-vendeur', title: 'Guide du vendeur', verb: 'Débloquer', accent: 'orange', ...(document ? { document } : {}) }]
    }, path.resolve('/r/docs/documentation.config.json'));

    it('écrit le PDF sous <outputDir>/pdf (sans version lisible : sans suffixe), avec le préréglage de la configuration', () => {
      const paths = updatePathsFor({ guide: 'vendeur' }, withDocument('guides/vendeur.indd'));
      expect(slash(paths.document)).toBe('/r/docs/guides/vendeur.indd');
      expect(slash(paths.pdf)).toBe('/r/output/pdf/vendeur.pdf');
      expect(paths.preset).toBe('Qualité optimale');
      expect(slash(paths.icmlDir)).toBe('/r/output/icml/guide-vendeur');
      expect(slash(paths.commonDir)).toBe('/r/output/icml/common');
    });

    it("refuse un guide sans champ « document », en nommant le guide", () => {
      expect(() => updatePathsFor({ guide: 'vendeur' }, withDocument(null))).toThrow(ComposeError);
      expect(() => updatePathsFor({ guide: 'vendeur' }, withDocument(null))).toThrow(/vendeur.*« document »/);
    });
  });

  describe('compose', () => {
    it('lit --remplacer et --sortie, sans chapitre', () => {
      expect(parseArgs(['compose', '--guide', 'vendeur', '--remplacer', '--sortie', 'x/copie.indd']))
        .toEqual({ command: 'compose', guide: 'vendeur', chapitre: null, sortie: 'x/copie.indd', remplacer: true, configPath: null });
    });

    it('lit --maj-pages pour la seule commande compose', () => {
      expect(parseArgs(['compose', '--guide', 'vendeur', '--maj-pages']).majPages).toBe(true);
      expect(() => parseArgs(['update', '--guide', 'vendeur', '--maj-pages'])).toThrow(/ne valent que pour la commande compose/);
    });

    it.each([
      [['compose'], /Usage/],
      [['compose', '--guide', 'vendeur', '--chapitre', '01-a'], /entier/],
      [['compose', '--guide', 'vendeur', '--force'], /--force ne vaut que pour/],
      [['update', '--guide', 'vendeur', '--remplacer'], /ne valent que pour la commande compose/],
      [['--guide', 'vendeur', '--chapitre', '01-a', '--sortie', 'x.indd'], /ne valent que pour la commande compose/]
    ])('refuse %j', (argv, message) => {
      expect(() => parseArgs(argv)).toThrow(message);
    });

    const withDocument = (document) => resolveConfig({
      sourceDir: '.',
      outputDir: '../output',
      pagesFile: 'pages.json',
      versionFile: '../package.json',
      pdfPreset: 'Qualité optimale',
      guides: [{ id: 'vendeur', dir: 'guide-vendeur', title: 'Guide du vendeur', verb: 'Débloquer', accent: 'orange', ...(document ? { document } : {}) }]
    }, path.resolve('/r/docs/documentation.config.json'));

    it('compose dans le .indd de la configuration, PDF sous <outputDir>/pdf, modèle sous pdf-essai', () => {
      const paths = composePathsFor({ guide: 'vendeur', sortie: null }, withDocument('guides/vendeur.indd'));
      expect(slash(paths.document)).toBe('/r/docs/guides/vendeur.indd');
      expect(slash(paths.pdf)).toBe('/r/output/pdf/vendeur.pdf');
      expect(slash(paths.template)).toBe('/r/output/pdf-essai/scriptami-orange-vendeur.idml');
      expect(slash(paths.icmlDir)).toBe('/r/output/icml/guide-vendeur');
      expect(slash(paths.commonDir)).toBe('/r/output/icml/common');
      expect(slash(paths.pagesDir)).toBe('/r/output/icml/guide-vendeur/00-pages');
      expect(slash(paths.measuredPages)).toBe('/r/output/pages-mesurees/guide-vendeur.json');
      expect(paths.preset).toBe('Qualité optimale');
    });

    it('--sortie remplace le champ document et peut en tenir lieu', () => {
      const paths = composePathsFor({ guide: 'vendeur', sortie: 'copie/essai.indd' }, withDocument(null));
      expect(path.basename(paths.document)).toBe('essai.indd');
      expect(path.basename(paths.pdf)).toBe('essai.pdf');
    });

    it('le PDF porte la version de versionFile dans son nom', () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-pdf-version-'));
      try {
        fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ version: '2.20.0' }));
        const config = resolveConfig({
          sourceDir: '.', outputDir: 'out', pagesFile: 'pages.json', versionFile: 'package.json',
          guides: [{ id: 'vendeur', dir: 'guide-vendeur', title: 'Guide du vendeur', verb: 'Débloquer', accent: 'orange', document: 'out/indd/cerascan-guide-du-vendeur.indd' }]
        }, path.join(dir, 'documentation.config.json'));
        expect(path.relative(dir, releasePdfPath(config.guides[0].document, config)).split(path.sep).join('/')).toBe('out/pdf/cerascan-guide-du-vendeur-v2.20.0.pdf');
        expect(path.relative(dir, composePathsFor({ guide: 'vendeur', sortie: null }, config).pdf).split(path.sep).join('/')).toBe('out/pdf/cerascan-guide-du-vendeur-v2.20.0.pdf');
        expect(path.relative(dir, updatePathsFor({ guide: 'vendeur' }, config).pdf).split(path.sep).join('/')).toBe('out/pdf/cerascan-guide-du-vendeur-v2.20.0.pdf');
      } finally {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });

    it('refuse sans document ni --sortie, ou une extension autre que .indd', () => {
      expect(() => composePathsFor({ guide: 'vendeur', sortie: null }, withDocument(null))).toThrow(/--sortie/);
      expect(() => composePathsFor({ guide: 'vendeur', sortie: 'x.pdf' }, withDocument(null))).toThrow(/\.indd/);
    });

    describe('chapterNamesIn', () => {
      let dir;
      beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-pdf-chapters-')); });
      afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

      it('liste les dossiers 0N-nom triés, hors 00-pages et fichiers', () => {
        ['02-b', '01-a', '00-pages', 'common', 'autre'].forEach(name => fs.mkdirSync(path.join(dir, name)));
        fs.writeFileSync(path.join(dir, '03-fichier'), '');
        expect(chapterNamesIn(dir)).toEqual(['01-a', '02-b']);
      });

      it('rend une liste vide si le dossier manque', () => {
        expect(chapterNamesIn(path.join(dir, 'absent'))).toEqual([]);
      });
    });
  });

  describe('numéros de page des sommaires', () => {
    it('ne rend aucun écart quand la table saisie égale le relevé', () => {
      expect(diffPages({ 1: 3, '1.1': 4 }, { 1: 3, '1.1': 4 })).toEqual([]);
      expect(formatPagesReport([])).toMatch(/conformes/);
    });

    it('relève valeur changée, rubrique absente de la table et rubrique disparue, triées par numéro', () => {
      const differences = diffPages({ 1: 3, '1.10': 8, '1.2': 4, 2: 11 }, { 1: 3, '1.2': 5, '1.3': 6, '1.10': 8 });
      expect(differences).toEqual([
        { key: '1.2', declared: 4, measured: 5 },
        { key: '1.3', declared: undefined, measured: 6 },
        { key: '2', declared: 11, measured: undefined }
      ]);
    });

    it('traite une table saisie absente comme vide', () => {
      expect(diffPages(undefined, { 1: 3 })).toEqual([{ key: '1', declared: undefined, measured: 3 }]);
    });

    it('nomme chaque écart dans le constat', () => {
      const report = formatPagesReport(diffPages({ '1.2': 4, 2: 11 }, { '1.2': 5, '1.3': 6 }));
      expect(report).toMatch(/^A CONTROLER.*(3)/);
      expect(report).toContain('1.2 : p. 4 -> p. 5');
      expect(report).toContain('1.3 : absent -> p. 6');
      expect(report).toContain('2 : p. 11 -> absente du document');
    });
  });

  describe('backupDocument', () => {
    let dir;
    beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cerascan-backup-')); });
    afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

    it("copie le .indd à côté sous <nom>.avant-<horodatage>.indd, l'original intact", () => {
      const document = path.join(dir, 'guide.indd');
      fs.writeFileSync(document, 'octets');
      const copy = backupDocument(document, new Date(2026, 10, 20, 14, 30, 5));
      expect(path.basename(copy)).toBe('guide.avant-20261120-143005.indd');
      expect(fs.readFileSync(copy, 'utf8')).toBe('octets');
      expect(fs.readFileSync(document, 'utf8')).toBe('octets');
    });

    it("n'écrase jamais une copie existante", () => {
      const document = path.join(dir, 'guide.indd');
      fs.writeFileSync(document, 'octets');
      const now = new Date(2026, 10, 20, 14, 30, 5);
      backupDocument(document, now);
      expect(() => backupDocument(document, now)).toThrow(/EEXIST/);
    });

    it('document introuvable : erreur de composition, rien écrit', () => {
      expect(() => backupDocument(path.join(dir, 'absent.indd'))).toThrow(ComposeError);
      expect(fs.readdirSync(dir)).toEqual([]);
    });

    it("l'horodatage est sur deux chiffres partout", () => {
      expect(stamp(new Date(2026, 0, 2, 3, 4, 5))).toBe('20260102-030405');
    });
  });

  describe('constat des fichiers avant/après', () => {
    let dir;
    beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cerascan-diff-')); });
    afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

    const write = (name, content) => {
      const file = path.join(dir, name);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content);
      return file;
    };
    const pathsIn = () => ({
      icmlDir: path.join(dir, 'icml', 'guide'),
      commonDir: path.join(dir, 'icml', 'common'),
      template: path.join(dir, 'guide.idml'),
      document: path.join(dir, 'guide.indd'),
      pdf: path.join(dir, 'guide.pdf')
    });

    it("relève les ICML du guide et communs, l'IDML, le .indd et le PDF ; un fichier absent vaut null", () => {
      write('icml/guide/01-a/a.icml', 'a');
      write('icml/common/c.icml', 'c');
      write('guide.idml', 'i');
      const snapshot = snapshotOutputs(pathsIn());
      expect(Object.keys(snapshot.icml)).toHaveLength(2);
      expect(Object.values(snapshot.idml)).toHaveLength(1);
      expect(Object.values(snapshot.indd)).toEqual([null]);
      expect(Object.values(snapshot.pdf)).toEqual([null]);
    });

    it('contenu identique : rien de modifié ni de créé', () => {
      write('icml/guide/01-a/a.icml', 'a');
      const before = snapshotOutputs(pathsIn());
      const diff = diffSnapshots(before, snapshotOutputs(pathsIn()));
      expect(diff.icml).toEqual({ total: 1, created: 0, changed: 0 });
    });

    it('contenu modifié ou fichier apparu : compté en modifié ou en créé', () => {
      const a = write('icml/guide/01-a/a.icml', 'a');
      const before = snapshotOutputs(pathsIn());
      fs.writeFileSync(a, 'a2');
      write('guide.pdf', 'pdf');
      const diff = diffSnapshots(before, snapshotOutputs(pathsIn()));
      expect(diff.icml).toEqual({ total: 1, created: 0, changed: 1 });
      expect(diff.pdf).toEqual({ total: 1, created: 1, changed: 0 });
      expect(diff.indd).toEqual({ total: 0, created: 0, changed: 0 });
    });

    it("le constat nomme chaque famille et alerte quand aucun ICML n'a changé", () => {
      write('icml/guide/01-a/a.icml', 'a');
      const before = snapshotOutputs(pathsIn());
      const report = formatChangeReport(diffSnapshots(before, snapshotOutputs(pathsIn())));
      expect(report).toMatch(/ICML : 0 modifié sur 1/);
      expect(report).toMatch(/PDF : 0 modifié sur 0/);
      expect(report).toMatch(/Aucun ICML n'a changé/);
    });

    it("pas d'alerte quand un ICML a changé", () => {
      const a = write('icml/guide/01-a/a.icml', 'a');
      const before = snapshotOutputs(pathsIn());
      fs.writeFileSync(a, 'b');
      const report = formatChangeReport(diffSnapshots(before, snapshotOutputs(pathsIn())));
      expect(report).toMatch(/ICML : 1 modifié sur 1/);
      expect(report).not.toMatch(/Aucun ICML/);
    });
  });

  describe('launch', () => {
    let write;
    beforeEach(() => {
      write = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
    });
    afterEach(() => write.mockRestore());

    const messageFor = code => {
      write.mockClear();
      expect(launch('compose.jsx', { document: 'a.indd' }, () => code)).toBe(code);
      return write.mock.calls.map(call => call[0]).join('');
    };

    it('passe le script et les chemins au lanceur et rend le code 0 sans rien écrire', () => {
      const launcher = jest.fn(() => 0);
      expect(launch('compose.jsx', { document: 'a.indd' }, launcher)).toBe(0);
      expect(launcher).toHaveBeenCalledWith('compose.jsx', { document: 'a.indd' });
      expect(write).not.toHaveBeenCalled();
    });

    it("rend chaque code 2 à 5 tel quel, avec un message distinct qui n'annonce aucun PDF", () => {
      const messages = [2, 3, 4, 5].map(messageFor);
      expect(new Set(messages).size).toBe(4);
      messages.forEach(message => {
        expect(message).toMatch(/Aucun PDF produit/);
        expect(message).not.toMatch(/PDF :/);
      });
      expect(messages[0]).toMatch(/déjà ouvert/);
      expect(messages[1]).toMatch(/COM/);
      expect(messages[2]).toMatch(/journal/);
      expect(messages[3]).toMatch(/Délai dépassé/);
    });

    it('nomme le code quand il est inattendu', () => {
      expect(messageFor(9)).toMatch(/code 9/);
    });

    it('couvre exactement les codes 2 à 5', () => {
      expect(Object.keys(EXIT_MESSAGES).sort()).toEqual(['2', '3', '4', '5']);
    });
  });

  describe('main', () => {
    let write;
    beforeEach(() => {
      write = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
    });
    afterEach(() => write.mockRestore());

    it('refuse sans rien lancer quand InDesign tourne', () => {
      const code = main(['--guide', 'vendeur', '--chapitre', '01-vue-ensemble', '--config', REPO_CONFIG_FILE],
        { processListing: () => 'InDesign.exe 15460 Console' });
      expect(code).toBe(1);
      expect(write.mock.calls[0][0]).toMatch(/déjà ouvert/);
    });

    it('refuse un guide inconnu de la configuration, avant de regarder InDesign', () => {
      const code = main(['--guide', 'inconnu', '--chapitre', '01-vue-ensemble', '--config', REPO_CONFIG_FILE],
        { processListing: () => 'InDesign.exe 15460 Console' });
      expect(code).toBe(1);
      expect(write.mock.calls[0][0]).toMatch(/Guide inconnu/);
    });

    it("update : refuse sans rien copier quand InDesign tourne", () => {
      const code = main(['update', '--guide', 'vendeur', '--config', REPO_CONFIG_FILE], { processListing: () => 'InDesign.exe 15460 Console' });
      expect(code).toBe(1);
      expect(write.mock.calls[0][0]).toMatch(/déjà ouvert/);
    });

    it('refuse un fichier de configuration introuvable', () => {
      const code = main(['--guide', 'vendeur', '--chapitre', '01-a', '--config', path.join(__dirname, 'absent.json')],
        { processListing: () => '' });
      expect(code).toBe(1);
      expect(write.mock.calls[0][0]).toMatch(/introuvable/);
    });
  });
});
