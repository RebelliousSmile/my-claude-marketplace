const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadMaquette, MaquetteError, MAQUETTE_FILE } = require('../maquette');

const SQUELETTE = path.join(__dirname, '..', 'maquettes', 'squelette');
const base = () => JSON.parse(fs.readFileSync(path.join(SQUELETTE, MAQUETTE_FILE), 'utf8'));

function folderWith(raw) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'maquette-test-'));
  fs.writeFileSync(path.join(dir, MAQUETTE_FILE), typeof raw === 'string' ? raw : JSON.stringify(raw));
  fs.copyFileSync(path.join(SQUELETTE, 'logo.svg'), path.join(dir, 'logo.svg'));
  return dir;
}

describe('loadMaquette', () => {
  test('lit le squelette et le fige en profondeur', () => {
    const maquette = loadMaquette(SQUELETTE);
    expect(maquette.format).toBe(1);
    expect(Object.isFrozen(maquette)).toBe(true);
    expect(Object.isFrozen(maquette.page.marges)).toBe(true);
    expect(Object.isFrozen(maquette.axes.noms)).toBe(true);
  });

  test('le squelette n’emploie que des polices présentes sur tout poste Windows', () => {
    expect(loadMaquette(SQUELETTE).polices).toEqual({
      titre: 'Segoe UI', texte: 'Segoe UI', code: 'Consolas', puce: 'Segoe UI Symbol'
    });
  });

  test('exige le dossier de la maquette', () => {
    expect(() => loadMaquette()).toThrow(/dossier de la maquette est requis/);
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

  test('refuse une famille de styles manquante', () => {
    const raw = base();
    delete raw.styles.cell;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« styles\.cell » manquant ou vide/);
  });

  test('refuse une entrée de style sans attributs', () => {
    const raw = base();
    delete raw.styles.paragraph[0].attributes;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« styles\.paragraph\[0\]\.attributes »/);
  });

  test('refuse un pandoc qui n’est pas une liste de textes', () => {
    const raw = base();
    raw.styles.character[0].pandoc = 'Strong';
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« styles\.character\[0\]\.pandoc »/);
  });

  test('refuse une famille de formats manquante', () => {
    const raw = base();
    delete raw.formats.object;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« formats.object » manquant ou invalide/);
  });

  test('refuse une police de format qui n’est pas un texte', () => {
    const raw = base();
    const [name] = Object.keys(raw.formats.paragraph);
    raw.formats.paragraph[name].font = 12;
    expect(() => loadMaquette(folderWith(raw))).toThrow(new RegExp('« formats\.paragraph\.' + name + '\.font »'));
  });

  test('refuse une liste charteSeule qui n’est pas une liste de noms', () => {
    const raw = base();
    raw.charteSeule.paragraph = 'Folio';
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« charteSeule.paragraph »/);
  });

  test('signale un chemin introuvable', () => {
    const missing = path.join(os.tmpdir(), 'maquette-inexistante-xyz');
    expect(() => loadMaquette(missing)).toThrow(/fichier introuvable/);
  });

  test('signale un JSON illisible', () => {
    expect(() => loadMaquette(folderWith('{ pas du json'))).toThrow(/illisible/);
  });
});

describe('loadMaquette : textes', () => {
  test('refuse un texte fixe manquant en nommant la clé', () => {
    const raw = base();
    delete raw.textes.signature;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« textes.signature » manquant ou invalide/);
  });

  test('refuse des mentions par défaut qui ne sont pas une liste', () => {
    const raw = base();
    raw.textes.mentionsDefaut = 'une phrase';
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« textes.mentionsDefaut »/);
  });

  test('refuse une carte de contact incomplète', () => {
    const raw = base();
    delete raw.textes.contactDefaut.cartes[1].note;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« textes\.contactDefaut\.cartes\[1\]\.note »/);
  });

  test('refuse un bloc de page d’exemple sans style', () => {
    const raw = base();
    delete raw.textes.pagesExemple[0].blocs[0].style;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« textes\.pagesExemple\[0\]\.blocs\[0\]\.style »/);
  });

  test('refuse l’absence du bloc textes', () => {
    const raw = base();
    delete raw.textes;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« textes » manquant ou invalide/);
  });
});

describe('loadMaquette : nuances', () => {
  test('refuse l’absence du bloc nuances', () => {
    const raw = base();
    delete raw.nuances;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« nuances » manquant ou invalide/);
  });

  test('refuse un rôle de nuance manquant', () => {
    const raw = base();
    delete raw.nuances.orange;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« nuances.orange » manquant ou invalide/);
  });

  test('refuse une nuance absente du nuancier en la nommant', () => {
    const raw = base();
    raw.nuances.sombre = 'Inconnue';
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« nuances.sombre » nomme « Inconnue »/);
  });

  test('refuse un flanc dont la teinte sort de 0 à 100', () => {
    const raw = base();
    raw.nuances.flanc[0][1] = 140;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« nuances\.flanc\[0\] »/);
  });
});

describe('loadMaquette : gabarits, cadres, variables', () => {
  test('refuse l’absence de gabarits', () => {
    const raw = base();
    delete raw.gabarits;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« gabarits » manquant ou invalide/);
  });

  test('refuse un gabarit sans rôle connu', () => {
    const raw = base();
    raw.gabarits[0].role = 'inconnu';
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« gabarits\[0\]\.role »/);
  });

  test('refuse un rôle de gabarit manquant', () => {
    const raw = base();
    raw.gabarits = raw.gabarits.filter(entry => entry.role !== 'fin');
    expect(() => loadMaquette(folderWith(raw))).toThrow(/rôle « fin » \(0 trouvé\)/);
  });

  test('refuse deux gabarits du même nom', () => {
    const raw = base();
    raw.gabarits[1].nom = raw.gabarits[0].nom;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/deux gabarits du même nom/);
  });

  test('refuse un nom de cadre de page manquant', () => {
    const raw = base();
    delete raw.cadres.pages.fin;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« cadres\.pages\.fin » manquant ou invalide/);
  });

  test('refuse une variable de style absente des styles', () => {
    const raw = base();
    raw.variables[3].style = 'Inexistant';
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« variables\[3\]\.style » nomme « Inexistant »/);
  });

  test('refuse un type de variable inconnu', () => {
    const raw = base();
    raw.variables[0].type = 'autre';
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« variables\[0\]\.type »/);
  });
});

describe('loadMaquette : logo et picto', () => {
  test('expose les tracés du logo ; le squelette n’a pas de picto', () => {
    const maquette = loadMaquette(SQUELETTE);
    expect(maquette.logo.chemins).toHaveLength(1);
    expect(maquette.picto).toBeNull();
  });

  test('lit un picto désigné par la maquette', () => {
    const raw = { ...base(), picto: 'picto.json' };
    const dir = folderWith(raw);
    const facette = { nom: 'a', points: [[0, 0], [1, 1], [0, 1]], degrade: { depart: [0, 1], arrivee: [0, 0], arrets: [{ offset: 0, rgb: [0, 0, 0] }, { offset: 1, rgb: [9, 9, 9] }] } };
    fs.writeFileSync(path.join(dir, 'picto.json'), JSON.stringify({ opacite: 90, facettes: [facette] }));
    expect(loadMaquette(dir).picto.facettes).toHaveLength(1);
  });

  test('refuse un logo introuvable en nommant le fichier', () => {
    const raw = base();
    raw.logo = 'absent.svg';
    expect(() => loadMaquette(folderWith(raw))).toThrow(/logo introuvable.*absent.svg/);
  });

  test('refuse un logo sans tracé', () => {
    const dir = folderWith(base());
    fs.writeFileSync(path.join(dir, 'logo.svg'), '<svg></svg>');
    expect(() => loadMaquette(dir)).toThrow(/aucun tracé/);
  });

  test('refuse une ressource hors du dossier', () => {
    const raw = base();
    raw.logo = '../logo.svg';
    expect(() => loadMaquette(folderWith(raw))).toThrow(/sort du dossier/);
  });

  test('refuse un picto sans facettes', () => {
    const dir = folderWith({ ...base(), picto: 'picto.json' });
    fs.writeFileSync(path.join(dir, 'picto.json'), JSON.stringify({ opacite: 88, facettes: [] }));
    expect(() => loadMaquette(dir)).toThrow(/« opacite » et « facettes » sont requis/);
  });

  test('accepte une maquette sans picto', () => {
    expect(loadMaquette(folderWith(base())).picto).toBeNull();
  });
});

describe('loadMaquette : composition et export', () => {
  test('refuse l’absence du bloc composition', () => {
    const raw = base();
    delete raw.composition;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« composition » manquant ou invalide/);
  });

  test('refuse un réglage numérique manquant', () => {
    const raw = base();
    delete raw.composition.reglages.pasReduction;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« composition.reglages.pasReduction »/);
  });

  test('refuse un cadre d’ouverture sans fichier', () => {
    const raw = base();
    delete raw.composition.ouverture[2].fichier;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« composition\.ouverture\[2\]\.fichier »/);
  });

  test('refuse un indicateur facultatif qui n’est pas un booléen', () => {
    const raw = base();
    raw.composition.ouverture[3].facultatif = 'oui';
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« composition\.ouverture\[3\]\.facultatif »/);
  });

  test('refuse des cadres satellites qui ne sont pas une liste de noms', () => {
    const raw = base();
    raw.composition.satellites = 'marginale-gauche';
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« composition.satellites »/);
  });

  test('refuse un préréglage d’export qui n’est pas un texte', () => {
    const raw = base();
    raw.export = { preset: 3 };
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« export.preset »/);
  });

  test('accepte un préréglage d’export', () => {
    const raw = base();
    raw.export = { preset: 'Qualité optimale' };
    expect(loadMaquette(folderWith(raw)).export.preset).toBe('Qualité optimale');
  });
});

describe('loadMaquette : commun', () => {
  test('le commun est facultatif', () => {
    const raw = base();
    delete raw.commun;
    expect(loadMaquette(folderWith(raw)).commun).toBeUndefined();
  });

  test('refuse un pied qui n’est pas un texte', () => {
    const raw = base();
    raw.commun.pied = 3;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« commun.pied »/);
  });

  test('refuse des mentions qui ne sont pas une liste de textes', () => {
    const raw = base();
    raw.commun.mentions = 'une phrase';
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« commun.mentions »/);
  });

  test('refuse un commun qui n’est pas un objet', () => {
    const raw = base();
    raw.commun = [];
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« commun »/);
  });

  test('exige le libellé de mise à jour', () => {
    const raw = base();
    delete raw.textes.miseAJour;
    expect(() => loadMaquette(folderWith(raw))).toThrow(/« textes.miseAJour »/);
  });
});
