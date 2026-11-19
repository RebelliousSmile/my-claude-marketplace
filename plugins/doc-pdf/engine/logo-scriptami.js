/**
 * Logo Scriptami pour les gabarits IDML : le mot « scriptami » en tracés vectoriels
 * (couverture) et le picto sans texte (page de fin, sur la zone noire).
 *
 * Les tracés viennent des SVG du dossier de logos de l'éditeur (`LOGO SCRIPTAMI.svg` pour le
 * mot, `PICTO SCRIPTAMI.svg` pour le picto), recopiés ici pour que le dépôt ne dépende pas
 * de ce dossier. Le mot est en contours (aucune police à installer) ; le picto garde ses
 * dégradés verticaux et son opacité de 88 %. Les surcouches d'ombrage du SVG (noir dégradé à
 * 18 %), que les nuances IDML ne savent pas rendre (un dégradé IDML n'a pas d'opacité par
 * point d'arrêt), sont incorporées aux couleurs des points d'arrêt.
 */

/** Lettres S, C, R, I, P, T, A, M, I du mot, dans l'espace du SVG (viewBox 600,945 × 158,74). */
const WORDMARK_PATHS = Object.freeze([
  'M153.573,98.421c0,2.508-0.53,4.729-1.59,6.664c-1.06,1.936-2.501,3.558-4.322,4.865c-1.822,1.309-3.942,2.304-6.36,2.984 c-2.419,0.681-4.988,1.022-7.706,1.022c-1.142,0-2.419-0.082-3.833-0.245c-1.415-0.163-2.868-0.394-4.363-0.693 c-1.496-0.298-2.99-0.652-4.485-1.06c-1.496-0.408-2.923-0.856-4.281-1.346l1.957-3.914l2.61,0.57 c0.652,0.163,1.413,0.354,2.283,0.571c0.869,0.218,1.794,0.407,2.772,0.57s1.957,0.313,2.936,0.449s1.875,0.203,2.691,0.203h3.343 c1.794,0,3.506-0.244,5.137-0.733s3.071-1.209,4.322-2.161c1.25-0.95,2.242-2.12,2.976-3.506c0.734-1.387,1.101-2.977,1.101-4.771 c0-0.761-0.191-1.604-0.571-2.528c-0.381-0.924-0.789-1.685-1.223-2.283v0.082c-0.762-1.032-1.618-1.862-2.569-2.487 c-0.952-0.625-1.93-1.102-2.936-1.428c-1.007-0.326-2.067-0.557-3.18-0.692c-1.115-0.136-2.216-0.258-3.303-0.367 c-1.849-0.108-3.724-0.285-5.626-0.53c-1.904-0.244-3.724-0.909-5.463-1.998v0.082c-1.957-1.087-3.575-2.663-4.852-4.729 c-1.278-2.065-1.917-4.403-1.917-7.013c0-3.588,1.317-6.659,3.955-9.215c2.636-2.555,6.157-4.294,10.56-5.219h-0.082 c0.652-0.108,1.617-0.23,2.895-0.367c1.276-0.135,2.704-0.203,4.281-0.203c0.869,0,1.875,0.094,3.017,0.28 s2.324,0.414,3.547,0.682s2.432,0.588,3.629,0.962c1.195,0.374,2.283,0.748,3.262,1.122l-1.875,4.374 c-1.415-0.489-2.705-0.909-3.874-1.264c-1.169-0.353-2.283-0.624-3.343-0.815c-1.06-0.189-2.093-0.339-3.099-0.448 c-1.007-0.108-2.053-0.163-3.14-0.163c-1.686,0-3.412,0.203-5.178,0.611c-1.767,0.407-3.384,1.02-4.852,1.835 s-2.678,1.875-3.629,3.18c-0.952,1.305-1.427,2.854-1.427,4.648c0,0.599,0.108,1.237,0.326,1.916 c0.218,0.681,0.517,1.346,0.899,1.998s0.818,1.278,1.309,1.876c0.49,0.599,1.008,1.087,1.553,1.468 c1.417,0.869,2.902,1.427,4.456,1.671c1.553,0.245,3.12,0.422,4.702,0.53c1.853,0.109,3.854,0.382,6.007,0.817 c2.153,0.437,4.156,1.228,6.01,2.372c0.981,0.654,1.867,1.431,2.656,2.33c0.79,0.899,1.472,1.866,2.044,2.902 s1.022,2.112,1.349,3.229C153.408,96.229,153.573,97.332,153.573,98.421z',
  'M224.76,106.477c-2.827,2.338-5.817,4.146-8.97,5.423c-3.154,1.277-6.47,1.916-9.949,1.916 c-3.806,0-7.367-0.734-10.682-2.202c-3.316-1.468-6.211-3.438-8.685-5.911c-2.475-2.474-4.417-5.368-5.831-8.685 c-1.414-3.315-2.12-6.851-2.12-10.602c0-3.804,0.706-7.365,2.12-10.682c1.413-3.315,3.356-6.225,5.831-8.726 c2.473-2.5,5.368-4.471,8.685-5.912c3.315-1.439,6.876-2.16,10.682-2.16c2.936,0,5.872,0.544,8.807,1.631 c2.936,1.088,5.843,2.664,8.725,4.729l-3.669,2.936c-4.35-3.044-8.97-4.566-13.863-4.566c-3.153,0-6.103,0.598-8.848,1.791 c-2.746,1.194-5.137,2.809-7.176,4.843c-2.039,2.035-3.657,4.449-4.852,7.245c-1.196,2.795-1.794,5.766-1.794,8.912 c0,3.094,0.598,6.01,1.794,8.751c1.195,2.74,2.813,5.143,4.852,7.204s4.43,3.689,7.176,4.884c2.745,1.193,5.694,1.79,8.848,1.79 c2.772,0,5.504-0.557,8.195-1.672c2.691-1.113,5.26-2.703,7.706-4.771L224.76,106.477z',
  'M253.38,92.858v20.468h-4.648V59.589h15.373c2.332,0,4.486,0.462,6.466,1.386c1.979,0.925,3.7,2.161,5.164,3.71 c1.464,1.55,2.616,3.317,3.457,5.301c0.841,1.985,1.262,4.036,1.262,6.156c0,1.631-0.218,3.235-0.652,4.812 c-0.436,1.577-1.088,3.031-1.957,4.362c-0.871,1.333-1.917,2.516-3.14,3.547c-1.223,1.034-2.597,1.876-4.118,2.528 c1.087,1.414,2.188,2.842,3.303,4.281c1.113,1.44,2.214,2.868,3.302,4.281l10.275,13.373h-5.953l-15.82-20.468H253.38z M253.38,64.318v23.811h10.722c1.636,0,3.178-0.312,4.624-0.938c1.445-0.625,2.686-1.468,3.723-2.528 c1.037-1.06,1.855-2.324,2.456-3.791c0.6-1.469,0.9-3.018,0.9-4.648s-0.3-3.166-0.9-4.607c-0.6-1.439-1.418-2.704-2.456-3.792 c-1.037-1.087-2.278-1.942-3.723-2.568c-1.446-0.624-2.988-0.938-4.624-0.938H253.38z',
  'M314.702,59.589v53.737h-4.647V59.589H314.702z',
  'M344.138,113.326V59.589h14.64c2.222,0,4.311,0.436,6.262,1.305c1.952,0.87,3.66,2.066,5.124,3.588 c1.463,1.522,2.628,3.289,3.496,5.3c0.867,2.012,1.302,4.159,1.302,6.442s-0.42,4.432-1.26,6.441 c-0.841,2.012-1.979,3.766-3.415,5.26c-1.436,1.496-3.129,2.679-5.08,3.548c-1.951,0.87-4.037,1.305-6.26,1.305h-10.161v20.549 H344.138z M348.786,64.318v23.729h10.193c1.576,0,3.058-0.312,4.444-0.938c1.386-0.624,2.581-1.468,3.588-2.527 c1.005-1.061,1.807-2.311,2.405-3.751c0.598-1.44,0.897-2.977,0.897-4.607s-0.3-3.181-0.897-4.648 c-0.599-1.468-1.414-2.731-2.446-3.792c-1.033-1.06-2.242-1.901-3.629-2.527c-1.386-0.624-2.868-0.938-4.444-0.938H348.786z',
  'M437.996,59.589v4.729h-20.712v49.008h-4.648V64.318h-20.876v-4.729H437.996z',
  'M475.751,57.713L498.176,113c-0.763,0.218-1.36,0.38-1.795,0.489c-0.436,0.108-0.788,0.204-1.06,0.285 c-0.272,0.082-0.53,0.149-0.774,0.204c-0.245,0.054-0.53,0.108-0.856,0.163l-9.052-21.364H466.7l-4.24,10.355 c-0.763,1.794-1.55,3.67-2.365,5.627s-1.549,3.806-2.201,5.545c-0.381-0.109-0.856-0.231-1.428-0.367 c-0.57-0.136-1.59-0.366-3.058-0.693L475.751,57.713z M482.764,88.455c-0.6-1.848-1.522-4.375-2.772-7.583 c-1.252-3.207-2.665-7.04-4.24-11.498l-7.34,19.081H482.764z',
  'M568.058,57.632v55.694h-4.647V71.005L544.9,93.919L526.226,70.76v42.566h-4.648V57.55l23.281,28.785L568.058,57.632z',
  'M600.839,59.589v53.737h-4.647V59.589H600.839z'
]);

/**
 * Picto : trois facettes, du fond vers le dessus. Coordonnées du SVG (178,583 × 371,339).
 * Chaque facette porte un dégradé vertical (`start` → `end`, repère du SVG, après application
 * des `gradientTransform` du fichier) et les points d'arrêt du SVG : `[décalage, couleur, opacité]`.
 */
const PICTO_SIZE = Object.freeze({ width: 178.583, height: 371.339 });
/** Opacité de chaque facette dans le SVG (« opacity="0.88" »), en pourcentage IDML. */
const PICTO_OPACITY = 88;
/** Opacité de la surcouche d'ombrage (« opacity="0.18" »). */
const SHADE_OPACITY = 0.18;

const SUN_STOPS = Object.freeze([
  [0, '#A6CE39', 1], [0.5031, '#F8991D', 1], [0.6034, '#F9A11B', 1], [0.7813, '#FDB714', 1], [1, '#FFD800', 1]
]);
const SEA_STOPS = Object.freeze([
  [0, '#A6CE39', 1], [0.5031, '#00B5AD', 1], [0.616, '#00B8B3', 1], [0.8155, '#44C1C5', 1], [1, '#70CCD9', 1]
]);
/** Ombrage de la facette orange : du noir opaque au blanc transparent. */
const SHADE_UP_STOPS = Object.freeze([
  [0, '#000000', 1], [0.1085, '#131313', 0.8915], [0.2324, '#353436', 0.7676], [0.3637, '#505052', 0.6363],
  [0.5003, '#6B6C6E', 0.4997], [0.641, '#8A8C8E', 0.359], [0.7852, '#B1B3B5', 0.2148],
  [0.9294, '#E1E2E3', 0.0706], [1, '#FFFFFF', 0]
]);
/** Ombrage de la facette jaune. */
const SHADE_DOWN_STOPS = Object.freeze([
  [0, '#000000', 0.83], [0.1085, '#131313', 0.7399], [0.2324, '#353436', 0.6371], [0.3637, '#505052', 0.5282],
  [0.5003, '#6B6C6E', 0.4148], [0.641, '#8A8C8E', 0.298], [0.7852, '#B1B3B5', 0.1783],
  [0.9294, '#E1E2E3', 0.0586], [1, '#FFFFFF', 0]
]);

const hexToRgb = hex => [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16));

/** Couleur et opacité d'un dégradé SVG au décalage `offset` (interpolation linéaire, sans prémultiplication). */
function sampleStops(stops, offset) {
  const after = stops.findIndex(([at]) => at >= offset);
  if (after <= 0) {
    const [, hex, alpha] = stops[Math.max(after, 0)];
    return { rgb: hexToRgb(hex), alpha };
  }
  const [fromAt, fromHex, fromAlpha] = stops[after - 1];
  const [toAt, toHex, toAlpha] = stops[after];
  const ratio = toAt === fromAt ? 0 : (offset - fromAt) / (toAt - fromAt);
  const from = hexToRgb(fromHex);
  const to = hexToRgb(toHex);
  return {
    rgb: from.map((value, index) => value + (to[index] - value) * ratio),
    alpha: fromAlpha + (toAlpha - fromAlpha) * ratio
  };
}

/**
 * Points d'arrêt IDML d'une facette : ceux du dégradé de couleur et, s'il y en a un, ceux du
 * dégradé d'ombrage, avec l'ombrage (opacité × `SHADE_OPACITY`) déjà posé sur la couleur.
 */
function bakeStops(base, shade = null) {
  const offsets = [...new Set([...base, ...(shade || [])].map(([at]) => at))].sort((a, b) => a - b);
  return offsets.map(offset => {
    const color = sampleStops(base, offset).rgb;
    let rgb = color;
    if (shade) {
      const veil = sampleStops(shade, offset);
      const weight = veil.alpha * SHADE_OPACITY;
      rgb = color.map((value, index) => value * (1 - weight) + veil.rgb[index] * weight);
    }
    return { offset, rgb: rgb.map(Math.round) };
  });
}

const PICTO_FACETS = Object.freeze([
  {
    name: 'orange',
    points: [[77.854, 259.775], [171.903, 0.482], [63.919, 59.496], [-0.335, 213.523]],
    gradient: { start: [85.785, 259.775], end: [85.785, 0.482], stops: bakeStops(SUN_STOPS, SHADE_UP_STOPS) }
  },
  {
    name: 'jaune',
    points: [[77.854, 259.775], [39.532, 370.857], [177.306, 259.775]],
    gradient: { start: [108.419, 259.775], end: [108.419, 370.857], stops: bakeStops(SUN_STOPS, SHADE_DOWN_STOPS) }
  },
  {
    name: 'turquoise',
    points: [[77.854, 259.775], [177.306, 259.775], [63.919, 59.496], [-0.335, 213.523]],
    gradient: { start: [88.486, 259.775], end: [88.486, 59.496], stops: bakeStops(SEA_STOPS) }
  }
]);

/** Dégradés à déclarer dans le nuancier du document : `[{ name, stops: [{ offset, rgb }] }]`. */
const pictoGradients = () => PICTO_FACETS.map(({ name, gradient }) => ({ name: `Picto ${name}`, stops: gradient.stops }));

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
 * Mot « scriptami » ajusté à `width` points avec son coin haut gauche en (`left`, `top`) ;
 * rend les sous-tracés (repère de la page, ordonnées comptées depuis le haut) et leur hauteur.
 */
function wordmarkShapes({ left, top, width }) {
  const raw = WORDMARK_PATHS.flatMap(parseSvgPath);
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
function pictoFacets({ left, top, height }) {
  const all = PICTO_FACETS.flatMap(facet => facet.points);
  const minX = Math.min(...all.map(([x]) => x));
  const minY = Math.min(...all.map(([, y]) => y));
  const maxX = Math.max(...all.map(([x]) => x));
  const maxY = Math.max(...all.map(([, y]) => y));
  const scale = height / (maxY - minY);
  const place = ([x, y]) => [left + (x - minX) * scale, top + (y - minY) * scale];
  const facets = PICTO_FACETS.map(({ name, points, gradient }) => {
    const start = place(gradient.start);
    const end = place(gradient.end);
    return {
      name,
      points: points.map(place),
      opacity: PICTO_OPACITY,
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

module.exports = {
  LogoError,
  PICTO_SIZE,
  PICTO_OPACITY,
  pictoGradients,
  WORDMARK_PATHS,
  parseSvgPath,
  subpathsBounds,
  wordmarkShapes,
  pictoFacets
};
