const fs = require('fs');
const os = require('os');
const path = require('path');
const { main, hasPandoc, PANDOC_MISSING, SCRIPTS, pluginVersion } = require('../cli');

const sink = () => {
  const lines = { log: [], err: [] };
  return { lines, out: { log: m => lines.log.push(m), err: m => lines.err.push(m) } };
};

describe('cli', () => {
  it('lit la version du plugin dans son manifeste', () => {
    expect(pluginVersion()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('sans commande : aide et code 1 ; avec help : code 0', () => {
    const a = sink();
    expect(main([], { out: a.out })).toBe(1);
    expect(a.lines.log[0]).toMatch(/Usage/);
    expect(main(['help'], { out: sink().out })).toBe(0);
  });

  it('commande inconnue : refus', () => {
    const s = sink();
    expect(main(['zzz'], { out: s.out })).toBe(1);
    expect(s.lines.err[0]).toMatch(/inconnue/);
  });

  it.each(['icml', 'pdf'])('%s : sans Pandoc, rien n\'est lancé', (command) => {
    const run = jest.fn(() => ({ error: new Error('ENOENT'), status: null }));
    const s = sink();
    expect(main([command], { out: s.out, run })).toBe(1);
    expect(s.lines.err[0]).toBe(PANDOC_MISSING);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0][0]).toBe('pandoc');
  });

  it('transmet les options au script concerné', () => {
    const run = jest.fn(() => ({ status: 0 }));
    expect(main(['icml', '--force', '--config', 'x.json'], { out: sink().out, run })).toBe(0);
    const call = run.mock.calls[1];
    expect(path.basename(call[1][0])).toBe(SCRIPTS.icml);
    expect(call[1].slice(1)).toEqual(['--force', '--config', 'x.json']);
  });

  it('merge et idml ne demandent pas Pandoc', () => {
    const run = jest.fn(() => ({ status: 0 }));
    main(['merge', '--check'], { out: sink().out, run });
    main(['idml'], { out: sink().out, run });
    expect(run).toHaveBeenCalledTimes(2);
    expect(run.mock.calls.every(call => call[0] === process.execPath)).toBe(true);
  });

  it('code de sortie non nul du script : 1', () => {
    expect(main(['merge'], { out: sink().out, run: () => ({ status: 2 }) })).toBe(1);
  });

  it('hasPandoc lit le code de sortie', () => {
    expect(hasPandoc(() => ({ status: 0 }))).toBe(true);
    expect(hasPandoc(() => ({ status: 1 }))).toBe(false);
  });

  describe('init', () => {
    let dir;
    beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-pdf-init-')); });
    afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

    const MAQUETTE = path.join(__dirname, '..', 'maquettes', 'squelette');

    it("écrit une configuration valide puis refuse d'écraser", () => {
      const { resolveConfig } = require('../guide-config');
      expect(main(['init', '--dir', dir, '--maquette', MAQUETTE], { out: sink().out })).toBe(0);
      const file = path.join(dir, 'documentation.config.json');
      const written = JSON.parse(fs.readFileSync(file, 'utf8'));
      expect(written.maquette.split(String.fromCharCode(92))).toHaveLength(1);
      expect(written.guides[0].accent).toBe('bleu');
      expect(() => resolveConfig(written, file)).not.toThrow();
      fs.writeFileSync(file, 'garde');
      const s = sink();
      expect(main(['init', '--dir', dir, '--maquette', MAQUETTE], { out: s.out })).toBe(1);
      expect(fs.readFileSync(file, 'utf8')).toBe('garde');
    });

    it('refuse sans --maquette ou avec une maquette invalide, sans rien écrire', () => {
      const file = path.join(dir, 'documentation.config.json');
      const s = sink();
      expect(main(['init', '--dir', dir], { out: s.out })).toBe(1);
      expect(main(['init', '--dir', dir, '--maquette', path.join(dir, 'absente')], { out: s.out })).toBe(1);
      expect(fs.existsSync(file)).toBe(false);
    });
  });
});

describe('cli maquette', () => {
  const tmp = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cli-maquette-')), 'nouvelle');

  it('maquette init crée la maquette, maquette specimen refuse un spécimen existant', () => {
    const dest = tmp();
    const a = sink();
    expect(main(['maquette', 'init', dest], { out: a.out })).toBe(0);
    expect(fs.existsSync(path.join(dest, 'maquette.json'))).toBe(true);
    const b = sink();
    expect(main(['maquette', 'specimen', dest], { out: b.out })).toBe(1);
    expect(b.lines.err[0]).toMatch(/existe déjà/);
  });

  it('maquette init refuse un nom invalide avec le code 1', () => {
    const s = sink();
    expect(main(['maquette', 'init', tmp(), '--nom', 'Mauvais Nom'], { out: s.out })).toBe(1);
    expect(s.lines.err[0]).toMatch(/invalide/);
  });

  it('sous-commande inconnue ou dossier manquant : code 1 et usage', () => {
    const s = sink();
    expect(main(['maquette', 'zzz'], { out: s.out })).toBe(1);
    expect(s.lines.err[0]).toMatch(/inconnue/);
    expect(s.lines.err.join('\n')).toMatch(/maquette init/);
    expect(main(['maquette', 'init'], { out: sink().out })).toBe(1);
  });
});
