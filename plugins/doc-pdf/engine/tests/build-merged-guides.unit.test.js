/**
 * Assemblage des versions fusionnées des guides utilisateur (#74).
 * Les fichiers numérotés sont la seule source ; la version fusionnée en est dérivée.
 */

const fs = require('fs');
const path = require('path');
const { buildMergedGuide, slugify, inspectTargets } = require('../build-merged-guides');
const { loadConfig } = require('../guide-config');

const FIXTURE_CONFIG = path.join(__dirname, 'fixtures', 'project', 'docs', 'documentation.config.json');

/** Configuration du dépôt : la liste des guides et leur dossier viennent d'elle, pas du test. */
const CONFIG = loadConfig({ configPath: FIXTURE_CONFIG });
const GUIDES_DIR = CONFIG.sourceDir;
const GUIDE_DIRS = CONFIG.guides.map(guide => guide.dir);

/** Images citées par les guides : `![texte](chemin)`, chemin relatif au fichier qui le cite. */
function citedImages() {
  const cited = [];
  for (const dir of GUIDE_DIRS) {
    const guideDir = path.join(GUIDES_DIR, dir);
    for (const name of fs.readdirSync(guideDir).filter(f => f.endsWith('.md'))) {
      const content = fs.readFileSync(path.join(guideDir, name), 'utf8');
      for (const match of content.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)) {
        cited.push({ source: `${dir}/${name}`, target: match[1], file: path.join(guideDir, match[1]) });
      }
    }
  }
  return cited;
}

describe('slugify', () => {
  test('minuscules, ponctuation retirée, accents gardés, espaces en tirets', () => {
    expect(slugify('Guide administrateur — CERASCAN')).toBe('guide-administrateur--cerascan');
    expect(slugify('Gérer les partenaires')).toBe('gérer-les-partenaires');
    expect(slugify('Guide How-To : Gestion des accès (codes partagés)'))
      .toBe('guide-how-to--gestion-des-accès-codes-partagés');
  });
});

describe('buildMergedGuide', () => {
  const files = [
    { name: '02-suite.md', content: '# Suite du guide\r\n\r\nRetour au [début](01-debut.md).\r\n' },
    {
      name: '01-debut.md',
      content: '# Début\n\nVoir [la suite](02-suite.md), [une section](02-suite.md#etape-2), '
        + '[autre guide](../guide-partenaire/02-import-catalogue.md) et ![capture](images/x.png).\n'
    }
  ];

  test('concatène dans l\'ordre du nom, sans en-tête de nom de fichier, avec le bandeau', () => {
    const merged = buildMergedGuide(files);
    expect(merged.startsWith('<!-- Fichier généré par scripts/guides/build-merged-guides.js')).toBe(true);
    expect(merged.indexOf('# Début')).toBeLessThan(merged.indexOf('# Suite du guide'));
    expect(merged).not.toMatch(/^# 0\d-/m);
  });

  test('réécrit un lien vers un fichier numéroté en ancre de son premier titre', () => {
    const merged = buildMergedGuide(files);
    expect(merged).toContain('[la suite](#suite-du-guide)');
    expect(merged).toContain('[début](#début)');
  });

  test('garde l\'ancre explicite d\'un lien vers une section', () => {
    expect(buildMergedGuide(files)).toContain('[une section](#etape-2)');
  });

  test('laisse inchangés les liens vers un autre guide et les images', () => {
    const merged = buildMergedGuide(files);
    expect(merged).toContain('(../guide-partenaire/02-import-catalogue.md)');
    expect(merged).toContain('(images/x.png)');
  });

  test('sortie stable, en LF, terminée par un seul saut de ligne', () => {
    const first = buildMergedGuide(files);
    expect(buildMergedGuide(files)).toBe(first);
    expect(first).not.toContain('\r');
    expect(first.endsWith('\n')).toBe(true);
    expect(first.endsWith('\n\n')).toBe(false);
  });

  test('dédoublonne une ancre comme GitHub quand un titre se répète', () => {
    const merged = buildMergedGuide([
      { name: '01-a.md', content: '# Accès\n\nVers [b](02-b.md).\n' },
      { name: '02-b.md', content: '# Accès\n' }
    ]);
    expect(merged).toContain('[b](#accès-1)');
  });

  test('ignore les titres situés dans un bloc de code', () => {
    const merged = buildMergedGuide([
      { name: '01-a.md', content: '```\n# Pas un titre\n```\n\n# Vrai titre\n\nVers [a](01-a.md).\n' }
    ]);
    expect(merged).toContain('[a](#vrai-titre)');
  });

  test('lève une erreur nommant la source et le lien quand la cible est absente', () => {
    expect(() => buildMergedGuide([{ name: '01-a.md', content: '# A\n\n[x](03-absent.md)\n' }]))
      .toThrow(/01-a\.md.*\[x\]\(03-absent\.md\)/);
  });
});

describe('versions fusionnées du projet de fixture', () => {
  test.each(inspectTargets(CONFIG).map(t => [t.output, t]))('%s est à jour (pnpm run guides:build)', (_name, target) => {
    expect(target.upToDate).toBe(true);
  });
});

describe('images des guides', () => {
  const cited = citedImages();

  test('les guides citent des images (plancher contre un motif qui ne matche plus)', () => {
    expect(cited.length).toBeGreaterThanOrEqual(1);
  });

  test('toute image citée existe sur le disque', () => {
    const missing = cited.filter(c => !fs.existsSync(c.file)).map(c => `${c.source} → ${c.target}`);
    expect(missing).toEqual([]);
  });
});
