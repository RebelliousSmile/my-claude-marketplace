/**
 * Logo de la maquette pour les gabarits IDML : le mot (couverture) en tracés vectoriels et, si la
 * maquette en a un, le picto sans texte (page de fin). Les tracés viennent de `logo.svg` et de
 * `picto.json` de la maquette (lus par maquette.js) ; ce module ne porte aucune forme ni couleur.
 */

const COMMAND_ARITY = Object.freeze({ M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Z: 0 });

class LogoError extends Error {}

const sameSpot = (a, b) => Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;

/**
 * Tracé SVG → sous-tracés Bézier `{ points: [{ anchor, left, right }], open }`.
 * Commandes prises en charge : M, L, H, V, C, S, Z, absolues ou relatives (celles des SVG
 * Illustrator du logo) ; toute autre commande lève une erreur plutôt que de dessiner faux.
 */
function parseSvgPath(d) {
  const tokens = d.match(/[A-Za-z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) || [];
  const subpaths = [];
  let current = null;
  let position = [0, 0];
  let start = [0, 0];
  let lastControl = null; // dernier point de contrôle d'une courbe, pour S
  let index = 0;

  const begin = (spot) => {
    current = { points: [{ anchor: spot, left: spot, right: spot }], open: true };
    subpaths.push(current);
    position = spot;
    start = spot;
  };
  const lineTo = (spot) => {
    current.points.push({ anchor: spot, left: spot, right: spot });
    position = spot;
    lastControl = null;
  };
  const curveTo = (first, second, spot) => {
    current.points[current.points.length - 1].right = first;
    current.points.push({ anchor: spot, left: second, right: spot });
    position = spot;
    lastControl = second;
  };
  const close = () => {
    const { points } = current;
    if (points.length > 1 && sameSpot(points[points.length - 1].anchor, points[0].anchor)) {
      points[0].left = points[points.length - 1].left;
      points.pop();
    }
    current.open = false;
    position = start;
    lastControl = null;
  };

  while (index < tokens.length) {
    const letter = tokens[index++];
    if (!/^[A-Za-z]$/.test(letter)) throw new LogoError(`Tracé SVG illisible près de « ${letter} ».`);
    const upper = letter.toUpperCase();
    const relative = letter !== upper;
    if (!(upper in COMMAND_ARITY)) throw new LogoError(`Commande SVG non prise en charge : « ${letter} ».`);
    const arity = COMMAND_ARITY[upper];
    if (arity === 0) {
      close();
      continue;
    }
    let first = true;
    // Une commande peut enchaîner plusieurs jeux d'arguments ; après M, les suivants sont des L.
    while (first || (index < tokens.length && !/^[A-Za-z]$/.test(tokens[index]))) {
      const values = tokens.slice(index, index + arity).map(Number);
      if (values.length < arity || values.some(Number.isNaN)) throw new LogoError(`Arguments manquants pour « ${letter} ».`);
      index += arity;
      const [ox, oy] = relative ? position : [0, 0];
      const at = (x, y) => [ox + x, oy + y];
      if (upper === 'M') {
        if (first) begin(at(values[0], values[1]));
        else lineTo(at(values[0], values[1]));
      } else if (upper === 'L') {
        lineTo(at(values[0], values[1]));
      } else if (upper === 'H') {
        lineTo([(relative ? position[0] : 0) + values[0], position[1]]);
      } else if (upper === 'V') {
        lineTo([position[0], (relative ? position[1] : 0) + values[0]]);
      } else if (upper === 'C') {
        curveTo(at(values[0], values[1]), at(values[2], values[3]), at(values[4], values[5]));
      } else if (upper === 'S') {
        const reflected = lastControl ? [2 * position[0] - lastControl[0], 2 * position[1] - lastControl[1]] : position;
        curveTo(reflected, at(values[0], values[1]), at(values[2], values[3]));
      }
      first = false;
    }
  }
  return subpaths;
}

/** Applique `x' = x·scale + dx`, `y' = y·scale + dy` à des sous-tracés. */
function transformSubpaths(subpaths, { scale, dx, dy }) {
  const move = ([x, y]) => [x * scale + dx, y * scale + dy];
  return subpaths.map(({ points, open }) => ({
    open,
    points: points.map(({ anchor, left, right }) => ({ anchor: move(anchor), left: move(left), right: move(right) }))
  }));
}

/** Boîte englobante des ancres et des points de contrôle (majorant sûr pour l'ajustement). */
function subpathsBounds(subpaths) {
  const xs = [];
  const ys = [];
  for (const { points } of subpaths) {
    for (const { anchor, left, right } of points) {
      for (const [x, y] of [anchor, left, right]) {
        xs.push(x);
        ys.push(y);
      }
    }
  }
  return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
}

/**
 * Mot du logo ajusté à `width` points avec son coin haut gauche en (`left`, `top`) ;
 * rend les sous-tracés (repère de la page, ordonnées comptées depuis le haut) et leur hauteur.
 */
function wordmarkShapes(paths, { left, top, width }) {
  const raw = paths.flatMap(parseSvgPath);
  const bounds = subpathsBounds(raw);
  const scale = width / (bounds.right - bounds.left);
  const subpaths = transformSubpaths(raw, { scale, dx: left - bounds.left * scale, dy: top - bounds.top * scale });
  const placed = subpathsBounds(subpaths);
  return { subpaths, height: placed.bottom - placed.top };
}

/**
 * Facettes du picto ajustées à `height` points, coin haut gauche en (`left`, `top`) ;
 * rend `[{ name, points, opacity, gradient }]` et la largeur obtenue. `gradient` : nom du dégradé
 * (`pictoGradients`), départ, longueur et angle (degrés, sens trigonométrique : 90 = du bas vers
 * le haut) dans le repère de la page.
 */
function pictoFacets(picto, { left, top, height }) {
  const all = picto.facettes.flatMap(facet => facet.points);
  const minX = Math.min(...all.map(([x]) => x));
  const minY = Math.min(...all.map(([, y]) => y));
  const maxX = Math.max(...all.map(([x]) => x));
  const maxY = Math.max(...all.map(([, y]) => y));
  const scale = height / (maxY - minY);
  const place = ([x, y]) => [left + (x - minX) * scale, top + (y - minY) * scale];
  const facets = picto.facettes.map(({ nom: name, points, degrade }) => {
    const start = place(degrade.depart);
    const end = place(degrade.arrivee);
    return {
      name,
      points: points.map(place),
      opacity: picto.opacite,
      gradient: {
        name: `Picto ${name}`,
        start,
        length: Math.hypot(end[0] - start[0], end[1] - start[1]),
        angle: Math.round((Math.atan2(start[1] - end[1], end[0] - start[0]) * 180) / Math.PI * 1000) / 1000
      }
    };
  });
  return { facets, width: (maxX - minX) * scale };
}

/** Dégradés à déclarer dans le nuancier du document : `[{ name, stops: [{ offset, rgb }] }]`. */
const pictoGradients = picto => (picto ? picto.facettes : []).map(({ nom, degrade }) => ({ name: `Picto ${nom}`, stops: degrade.arrets }));

module.exports = {
  LogoError,
  pictoGradients,
  parseSvgPath,
  subpathsBounds,
  wordmarkShapes,
  pictoFacets
};
