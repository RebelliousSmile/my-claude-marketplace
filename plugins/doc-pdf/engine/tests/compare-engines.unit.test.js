const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseArgs, compareTrees, buildTempConfig, commandsFor, resolveEngine, CompareError } = require('../tools/compare-engines');

function tree(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-test-'));
  for (const [name, content] of Object.entries(files)) {
    const full = path.join(dir, name);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return dir;
}

describe('compareTrees', () => {
  test('arbres identiques', () => {
    const files = { 'a.icml': 'x', 'idml/b.idml': 'y' };
    const result = compareTrees(tree(files), tree(files));
    expect(result.identical).toEqual(['a.icml', 'idml/b.idml']);
    expect(result.different).toEqual([]);
    expect(result.onlyReference).toEqual([]);
    expect(result.onlyCurrent).toEqual([]);
  });

  test('un octet de différence', () => {
    const result = compareTrees(tree({ 'a.icml': 'abc' }), tree({ 'a.icml': 'abd' }));
    expect(result.different).toEqual(['a.icml']);
    expect(result.identical).toEqual([]);
  });

  test('fichier en trop et fichier manquant', () => {
    const result = compareTrees(tree({ 'a': '1', 'b': '2' }), tree({ 'a': '1', 'c': '3' }));
    expect(result.onlyReference).toEqual(['b']);
    expect(result.onlyCurrent).toEqual(['c']);
  });
});

describe('options et configuration', () => {
  test('parseArgs exige --reference et --config', () => {
    expect(() => parseArgs([])).toThrow(CompareError);
    expect(() => parseArgs(['--reference', 'r'])).toThrow(/--config est obligatoire/);
    expect(parseArgs(['--reference', 'r', '--config', 'c', '--garder'])).toEqual({ reference: 'r', config: 'c', keep: true });
    expect(() => parseArgs(['--bizarre'])).toThrow(/Option inconnue/);
  });

  test('resolveEngine accepte engine/ ou la racine du plugin', () => {
    const plugin = tree({ 'engine/cli.js': '' });
    expect(resolveEngine(path.join(plugin, 'engine'))).toBe(path.join(plugin, 'engine'));
    expect(resolveEngine(plugin)).toBe(path.join(plugin, 'engine'));
    expect(() => resolveEngine(tree({}))).toThrow(/Moteur introuvable/);
  });

  test('buildTempConfig passe les chemins en absolu et impose outputDir', () => {
    const dir = tree({ 'guides/documentation.config.json': '{}' });
    const original = path.join(dir, 'guides', 'documentation.config.json');
    const out = path.join(dir, 'tmp-out');
    const config = buildTempConfig({
      sourceDir: '.', outputDir: '../../output', pagesFile: 'pages.json', versionFile: '../package.json',
      guides: [{ id: 'a', document: 'doc.indd' }, { id: 'b' }]
    }, original, out);
    expect(config.outputDir).toBe(out);
    expect(config.sourceDir).toBe(path.join(dir, 'guides'));
    expect(config.pagesFile).toBe(path.join(dir, 'guides', 'pages.json'));
    expect(config.versionFile).toBe(path.join(dir, 'package.json'));
    expect(config.guides[0].document).toBe(path.join(dir, 'guides', 'doc.indd'));
    expect(config.guides[1].document).toBeUndefined();
  });

  test('commandsFor enchaîne icml, gabarits par axe puis guides', () => {
    expect(commandsFor(['a', 'b'], ['g'])).toEqual([
      ['icml'],
      ['idml', '--gabarits', '--axe', 'a'],
      ['idml', '--gabarits', '--axe', 'b'],
      ['idml', '--guide', 'g']
    ]);
  });
});
