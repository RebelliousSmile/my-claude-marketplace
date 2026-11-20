const {
  LogoError,
  parseSvgPath,
  subpathsBounds,
  wordmarkShapes,
  pictoFacets,
  pictoGradients
} = require('../logo');

// Données neutres : trois lettres (une pleine, deux à contreforme) et un picto de trois facettes.
const WORDMARK_PATHS = [
  'M0,0H10V20H0Z',
  'M20,0H40V20H20Z M25,5H35V15H25Z',
  'M50,0H70V20H50Z M55,5H65V15H55Z'
];
const gradient = (from, to) => ({
  depart: [0, 100],
  arrivee: [0, 0],
  arrets: [{ offset: 0, rgb: from }, { offset: 0.5, rgb: [100, 100, 100] }, { offset: 1, rgb: to }]
});
const PICTO = {
  opacite: 88,
  facettes: [
    { nom: 'premiere', points: [[0, 100], [20, 0], [10, 60]], degrade: gradient([20, 40, 60], [255, 216, 0]) },
    { nom: 'deuxieme', points: [[20, 0], [40, 100], [30, 50]], degrade: { ...gradient([10, 10, 10], [200, 200, 200]), depart: [20, 0], arrivee: [20, 100] } },
    { nom: 'troisieme', points: [[40, 100], [60, 0], [50, 60]], degrade: gradient([5, 5, 5], [250, 250, 250]) }
  ]
};
const PICTO_OPACITY = PICTO.opacite;

describe('logo : analyse des tracés SVG', () => {
  it('lit des segments droits (M, L, H, V, Z) et fusionne le point de fermeture', () => {
    const [path] = parseSvgPath('M10,10H20V30h-10z');
    expect(path.open).toBe(false);
    expect(path.points.map(point => point.anchor)).toEqual([[10, 10], [20, 10], [20, 30], [10, 30]]);
  });

  it('place les poignées des courbes C relatives sur le bon point', () => {
    const [path] = parseSvgPath('M0,0c1,2,3,4,5,6');
    const [start, end] = path.points;
    expect(path.open).toBe(true);
    expect(start.right).toEqual([1, 2]);
    expect(end.left).toEqual([3, 4]);
    expect(end.anchor).toEqual([5, 6]);
  });

  it('reflète le point de contrôle précédent pour S', () => {
    const [path] = parseSvgPath('M0,0C0,10,10,10,10,0S20,-10,20,0');
    const [, middle, last] = path.points;
    expect(middle.right).toEqual([10, -10]);
    expect(last.left).toEqual([20, -10]);
  });

  it('enchaîne les jeux d’arguments implicites, M devenant L, et sépare les sous-tracés', () => {
    const paths = parseSvgPath('M0,0 10,0 10,10z M20,20h5v5z');
    expect(paths).toHaveLength(2);
    expect(paths[0].points).toHaveLength(3);
    expect(paths[1].points[0].anchor).toEqual([20, 20]);
  });

  it('refuse une commande non prise en charge plutôt que de dessiner faux', () => {
    expect(() => parseSvgPath('M0,0A5,5,0,0,1,10,0')).toThrow(LogoError);
  });

  it('lit les lettres du mot, avec leurs contreformes', () => {
    const letters = WORDMARK_PATHS.map(parseSvgPath);
    expect(letters).toHaveLength(3);
    expect(letters.map(subpaths => subpaths.length)).toEqual([1, 2, 2]);
    expect(letters.flat().every(subpath => subpath.open === false)).toBe(true);
  });
});

describe('logo : mise à l’échelle', () => {
  it('ajuste le mot à la largeur demandée, coin haut gauche compris', () => {
    const { subpaths, height } = wordmarkShapes(WORDMARK_PATHS, { left: 58, top: 50, width: 120 });
    const bounds = subpathsBounds(subpaths);
    expect(bounds.left).toBeCloseTo(58, 3);
    expect(bounds.right - bounds.left).toBeCloseTo(120, 3);
    expect(bounds.top).toBeCloseTo(50, 3);
    expect(height).toBeCloseTo(120 * 20 / 70, 3);
  });

  it('ajuste le picto à la hauteur demandée, sans texte', () => {
    const { facets, width } = pictoFacets(PICTO, { left: 58, top: 700, height: 56 });
    expect(facets.map(facet => facet.name)).toEqual(['premiere', 'deuxieme', 'troisieme']);
    const xs = facets.flatMap(facet => facet.points.map(([x]) => x));
    const ys = facets.flatMap(facet => facet.points.map(([, y]) => y));
    expect(Math.min(...xs)).toBeCloseTo(58, 3);
    expect(Math.min(...ys)).toBeCloseTo(700, 3);
    expect(Math.max(...ys)).toBeCloseTo(756, 3);
    expect(width).toBeCloseTo(60 * 56 / 100, 3);
  });

  it('donne à chaque facette un dégradé vertical dans la facette, à l’opacité du picto', () => {
    const { facets } = pictoFacets(PICTO, { left: 58, top: 700, height: 56 });
    expect(PICTO_OPACITY).toBe(88);
    for (const { name, points, gradient: placed, opacity } of facets) {
      expect(opacity).toBe(88);
      expect(placed.name).toBe(`Picto ${name}`);
      expect(placed.length).toBeGreaterThan(0);
      const ys = points.map(([, y]) => y);
      expect(placed.start[1]).toBeGreaterThanOrEqual(Math.min(...ys) - 1e-6);
      expect(placed.start[1]).toBeLessThanOrEqual(Math.max(...ys) + 1e-6);
    }
    // Repère de la page, y vers le bas : du bas vers le haut = 90°, du haut vers le bas = -90°.
    expect(facets.map(({ gradient: placed }) => placed.angle)).toEqual([90, -90, 90]);
  });

  it('déclare un dégradé par facette, aux décalages croissants de 0 à 1, en RVB valide', () => {
    const gradients = pictoGradients(PICTO);
    expect(gradients.map(({ name }) => name)).toEqual(['Picto premiere', 'Picto deuxieme', 'Picto troisieme']);
    for (const { stops } of gradients) {
      expect(stops[0].offset).toBe(0);
      expect(stops[stops.length - 1].offset).toBe(1);
      stops.forEach(({ offset, rgb }, index) => {
        if (index) expect(offset).toBeGreaterThan(stops[index - 1].offset);
        expect(rgb).toHaveLength(3);
        rgb.forEach(channel => expect(Number.isInteger(channel) && channel >= 0 && channel <= 255).toBe(true));
      });
    }
  });

  it('sans picto, ne déclare aucun dégradé', () => {
    expect(pictoGradients(null)).toEqual([]);
  });

  it('reprend tels quels les points d’arrêt de la maquette', () => {
    const [first] = pictoGradients(PICTO);
    expect(first.stops[first.stops.length - 1].rgb).toEqual([255, 216, 0]);
  });
});
