const {
  LogoError,
  WORDMARK_PATHS,
  parseSvgPath,
  subpathsBounds,
  wordmarkShapes,
  pictoFacets,
  pictoGradients,
  PICTO_OPACITY
} = require('../logo-scriptami');

describe('logo-scriptami : analyse des tracés SVG', () => {
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

  it('lit les neuf lettres du mot, avec leurs contreformes', () => {
    const letters = WORDMARK_PATHS.map(parseSvgPath);
    expect(letters).toHaveLength(9);
    // R, P et A portent chacun une contreforme ; S et C sont d’un seul tenant.
    expect(letters.map(subpaths => subpaths.length)).toEqual([1, 1, 2, 1, 2, 1, 2, 1, 1]);
    expect(letters.flat().every(subpath => subpath.open === false)).toBe(true);
  });
});

describe('logo-scriptami : mise à l’échelle', () => {
  it('ajuste le mot à la largeur demandée, coin haut gauche compris', () => {
    const { subpaths, height } = wordmarkShapes({ left: 58, top: 50, width: 120 });
    const bounds = subpathsBounds(subpaths);
    expect(bounds.left).toBeCloseTo(58, 3);
    expect(bounds.right - bounds.left).toBeCloseTo(120, 3);
    expect(bounds.top).toBeCloseTo(50, 3);
    expect(height).toBeGreaterThan(10);
    expect(height).toBeLessThan(20);
  });

  it('ajuste le picto à la hauteur demandée, sans texte', () => {
    const { facets, width } = pictoFacets({ left: 58, top: 700, height: 56 });
    expect(facets.map(facet => facet.name)).toEqual(['orange', 'jaune', 'turquoise']);
    const xs = facets.flatMap(facet => facet.points.map(([x]) => x));
    const ys = facets.flatMap(facet => facet.points.map(([, y]) => y));
    expect(Math.min(...xs)).toBeCloseTo(58, 3);
    expect(Math.min(...ys)).toBeCloseTo(700, 3);
    expect(Math.max(...ys)).toBeCloseTo(756, 3);
    expect(width).toBeGreaterThan(20);
    expect(width).toBeLessThan(40);
  });

  it('donne à chaque facette un dégradé vertical dans la facette, à 88 % d’opacité', () => {
    const { facets } = pictoFacets({ left: 58, top: 700, height: 56 });
    expect(PICTO_OPACITY).toBe(88);
    for (const { name, points, gradient, opacity } of facets) {
      expect(opacity).toBe(88);
      expect(gradient.name).toBe(`Picto ${name}`);
      expect(gradient.length).toBeGreaterThan(0);
      const ys = points.map(([, y]) => y);
      expect(gradient.start[1]).toBeGreaterThanOrEqual(Math.min(...ys) - 1e-6);
      expect(gradient.start[1]).toBeLessThanOrEqual(Math.max(...ys) + 1e-6);
    }
    // Orange et turquoise montent (90°), le jaune descend (-90°) : repère de la page, y vers le bas.
    expect(facets.map(({ gradient }) => gradient.angle)).toEqual([90, -90, 90]);
  });

  it('déclare un dégradé par facette, aux décalages croissants de 0 à 1, en RVB valide', () => {
    const gradients = pictoGradients();
    expect(gradients.map(({ name }) => name)).toEqual(['Picto orange', 'Picto jaune', 'Picto turquoise']);
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

  it('incorpore l’ombrage aux couleurs : l’orange foncé du bas est plus sombre que le jaune clair du haut', () => {
    const [orange] = pictoGradients();
    const luminance = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b;
    expect(luminance(orange.stops[0].rgb)).toBeLessThan(luminance(orange.stops[orange.stops.length - 1].rgb));
    // Sans l’ombrage, le point d’arrêt du jaune final (#FFD800) resterait inchangé : ici il l’est (ombrage nul en haut).
    expect(orange.stops[orange.stops.length - 1].rgb).toEqual([255, 216, 0]);
  });
});
