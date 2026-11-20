const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadMaquette, MaquetteError, DEFAULT_MAQUETTE_DIR, MAQUETTE_FILE } = require('../maquette');

const base = () => JSON.parse(fs.readFileSync(path.join(DEFAULT_MAQUETTE_DIR, MAQUETTE_FILE), 'utf8'));

function folderWith(raw) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'maquette-test-'));
  fs.writeFileSync(path.join(dir, MAQUETTE_FILE), typeof raw === 'string' ? raw : JSON.stringify(raw));
  return dir;
}

describe('loadMaquette', () => {
  test('lit la maquette embarquée et la fige en profondeur', () => {
    const maquette = loadMaquette();
    expect(maquette.format).toBe(1);
    expect(Object.isFrozen(maquette)).toBe(true);
    expect(Object.isFrozen(maquette.page.marges)).toBe(true);
    expect(Object.isFrozen(maquette.axes.noms)).toBe(true);
  });

  test('refuse un format inconnu en le nommant', () => {
    const dir = folderWith({ ...base(), format: 2 });
    expect(() => loadMaquette(dir)).toThrow(MaquetteError);
    expect(() => loadMaquette(dir)).toThrow(/format 2 inconnu/);
  });

  test('refuse un champ manquant en nommant le champ', () => {
    const raw = base();
    delete raw.page.marges.hautMm;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« page\.marges\.hautMm » manquant ou invalide/);
  });

  test('refuse une couleur d’axe absente du nuancier', () => {
    const raw = base();
    const [axis, label] = Object.entries(raw.axes.noms)[0];
    const tone = Object.values(raw.axes.tons)[0];
    delete raw.couleurs[`${label} ${tone}`];
    expect(() => loadMaquette(folderWith(raw))).toThrow(new RegExp(`axe ${axis}`));
  });

  test('refuse un axe par défaut hors des axes', () => {
    const raw = base();
    raw.axes.defaut = 'rose';
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« axes\.defaut »/);
  });

  test('refuse une couleur qui n’est pas [r, g, b]', () => {
    const raw = base();
    raw.couleurs.Paper = [300, 0, 0];
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« couleurs\.Paper »/);
  });

  test('signale un chemin introuvable', () => {
    const missing = path.join(os.tmpdir(), 'maquette-inexistante-xyz');
    expect(() => loadMaquette(missing)).toThrow(/fichier introuvable/);
  });

  test('signale un JSON illisible', () => {
    expect(() => loadMaquette(folderWith('{ pas du json'))).toThrow(/illisible/);
  });
});
