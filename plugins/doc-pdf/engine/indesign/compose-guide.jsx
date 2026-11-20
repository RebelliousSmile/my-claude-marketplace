// Compose TOUS les chapitres d'un guide dans une copie du modèle IDML, enregistre le .indd et exporte le PDF.
// Les ICML sont placés (donc liés) : `pdf update` pourra ensuite les rafraîchir.
// Lancé par run-indesign.ps1 : les chemins arrivent en JSON dans app.scriptArgs ("paths") :
//   template (IDML de la charte), document (.indd écrit), pdf, preset, icmlDir, chapters (noms de dossiers triés).
// Couverture, sommaire et page de fin gardent leur contenu : le générateur d'IDML les a déjà remplis.
// Par chapitre : ouverture (5 ICML), corps chaîné sur autant de pages que nécessaire, en-têtes de la page droite.
// Aucune page blanche : une ouverture suit directement la fin du chapitre précédent, à droite comme à gauche.
// Pages dupliquées : cadres nommés recalés sur la géométrie du premier kit (la copie les décalait).
// Titre et sommaire d'ouverture : cadre agrandi puis texte réduit tant qu'il déborde.
// En-têtes de gauche (titre du guide, version) : placés sur toutes les pages de gauche dont le gabarit les porte.
// Colonne marginale et renvois : posés en face de leur rubrique (numéro N.M, notes de renvoi) après le chaînage du corps.
// ES3 : ni let, ni const, ni JSON natif. Premier essai réel (guide partenaire) contrôlé ; ce second jeu de corrections est à contrôler.

#include "compose-lib.jsx"

var OPENING_FILES = [
  ['chapitre-surtitre', 'ouverture-surtitre.icml'],
  ['chapitre-numero', 'ouverture-numero.icml'],
  ['chapitre-titre', 'ouverture-titre.icml'],
  ['chapitre-chapeau', 'ouverture-chapeau.icml', true],
  ['chapitre-sommaire', 'ouverture-sommaire.icml', true]
];
var SATELLITE_FRAMES = ['marginale-gauche', 'marginale-droite', 'renvoi-gauche', 'renvoi-droite'];
var HEADER_FILES = [
  ['en-tete-droite-chapitre', 'en-tete-chapitre.icml'],
  ['en-tete-droite-titre', 'en-tete-titre-chapitre.icml']
];

var MIN_TEXT_SCALE = 0.6;
var SHRINK_STEP = 0.94;
var FOOT_CLEARANCE = 28; // marge basse + réserve pour le filet et le pied de page
var TITLE_GAP = 8;
// Hauteur des capitales rapportée au corps (Quicksand, titres et numéros de marge de la charte Scriptami).
var CAP_HEIGHT = 0.7;
// Le modèle IDML travaille en millimètres : geometricBounds et baseline sont en mm, pointSize en points. Toute valeur en points
// entrant dans une coordonnée passe par PT_MM (sans quoi un réglage de 9,5 pt déplaçait de 27 pt, mesuré le 2026-11-20).
var PT_MM = 25.4 / 72;
// Haut du cadre de marge, en points, mesuré depuis le haut des capitales de l'intertitre. Négatif parce que le haut du chiffre
// tombe ≈ 10 pt sous le haut de son cadre ; la maquette veut le chiffre ≈ 5 pt sous le haut du titre. Relevé sur le PDF vendeur
// (2026-11-20, hauts de glyphes au pixel), à réajuster sur une nouvelle mesure.
var NUMBER_FRAME_SHIFT = -5.2;
var GEOMETRY_TOLERANCE = 0.5;
// Pas de remontée (mm) d'une marge dont l'intertitre est en bas de page.
var MARGIN_RISE_STEP = 4;
var MIN_LINES_UNDER_HEADING = 3; // en dessous, l'intertitre passe sur la page suivante

function lastPageOf(pages) {
  var best = pages[0];
  var index;
  for (index = 1; index < pages.length; index += 1) {
    if (pages[index].documentOffset > best.documentOffset) best = pages[index];
  }
  return best;
}

/** Géométrie relative (au coin de la page) de chaque cadre nommé d'une page, première occurrence de chaque nom. */
function snapshotGeometry(page) {
  var items = page.allPageItems;
  var seen = {};
  var result = [];
  var index;
  var item;
  var bounds;
  for (index = 0; index < items.length; index += 1) {
    item = items[index];
    if (!item.name || seen[item.name] === true) continue;
    seen[item.name] = true;
    bounds = item.geometricBounds;
    result.push({
      name: item.name,
      rel: [bounds[0] - page.bounds[0], bounds[1] - page.bounds[1], bounds[2] - page.bounds[0], bounds[3] - page.bounds[1]]
    });
  }
  return result;
}

/** Replace chaque cadre nommé de la page d'après le relevé ; rend le nombre de cadres déplacés de plus de la tolérance. */
function restoreGeometry(page, snapshot) {
  var items = page.allPageItems;
  var moved = 0;
  var index;
  var itemIndex;
  var item;
  var wanted;
  var current;
  var delta;
  for (index = 0; index < snapshot.length; index += 1) {
    item = null;
    for (itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
      if (items[itemIndex].name === snapshot[index].name) { item = items[itemIndex]; break; }
    }
    if (item === null) continue;
    wanted = [
      page.bounds[0] + snapshot[index].rel[0], page.bounds[1] + snapshot[index].rel[1],
      page.bounds[0] + snapshot[index].rel[2], page.bounds[1] + snapshot[index].rel[3]
    ];
    current = item.geometricBounds;
    delta = Math.max(Math.abs(current[0] - wanted[0]), Math.abs(current[1] - wanted[1]), Math.abs(current[2] - wanted[2]), Math.abs(current[3] - wanted[3]));
    if (delta > GEOMETRY_TOLERANCE) {
      try {
        item.geometricBounds = wanted;
        moved += 1;
      } catch (lockedError) {
        // cadre verrouillé : laissé tel quel
      }
    }
  }
  return moved;
}

/** Vrai pour une taille ou un interligne exploitable (hors énumération « mixte » ou « auto »). */
function isPlainSize(value) {
  return typeof value === 'number' && value >= 0 && value < 2000;
}

/** Multiplie corps, interligne et espacements de chaque paragraphe du cadre. */
function scaleStory(frame, factor) {
  var paragraphs = frame.parentStory.paragraphs;
  var index;
  var paragraph;
  for (index = 0; index < paragraphs.length; index += 1) {
    paragraph = paragraphs[index];
    if (isPlainSize(paragraph.pointSize)) paragraph.pointSize = paragraph.pointSize * factor;
    if (isPlainSize(paragraph.leading)) paragraph.leading = paragraph.leading * factor;
    if (isPlainSize(paragraph.spaceBefore)) paragraph.spaceBefore = paragraph.spaceBefore * factor;
    if (isPlainSize(paragraph.spaceAfter)) paragraph.spaceAfter = paragraph.spaceAfter * factor;
  }
}

/** Agrandit le cadre vers le bas jusqu'à `bottomLimit` (jamais plus petit qu'avant). */
function growDown(frame, bottomLimit) {
  var bounds = frame.geometricBounds;
  if (bottomLimit > bounds[2]) frame.geometricBounds = [bounds[0], bounds[1], bottomLimit, bounds[3]];
}

/** Réduit le texte par pas tant que le cadre déborde ; rend l'échelle finale (1 = inchangé). */
function shrinkToFit(frame) {
  var scale = 1;
  while (frame.overflows && scale * SHRINK_STEP >= MIN_TEXT_SCALE) {
    scaleStory(frame, SHRINK_STEP);
    scale = scale * SHRINK_STEP;
  }
  return scale;
}

/** Titre et sommaire d'ouverture : le cadre s'agrandit d'abord, le texte ne rétrécit qu'ensuite. */
function fitOpening(kit, notes, chapterName) {
  var title = frameNamed(kit.opening, 'chapitre-titre');
  var lead = frameNamed(kit.opening, 'chapitre-chapeau');
  var summary = frameNamed(kit.opening, 'chapitre-sommaire');
  var scale;
  var limit;
  if (title.overflows) {
    limit = lead.geometricBounds[0] - TITLE_GAP;
    growDown(title, limit);
    scale = shrinkToFit(title);
    if (scale < 1) notes.push(chapterName + ' : titre d\'ouverture réduit à ' + Math.round(scale * 100) + ' % (page ' + kit.opening.name + ')');
  }
  if (lead.overflows) {
    // Chapeau trop long : le texte rétrécit d'abord (le cadre reste sur le fond coloré), le cadre s'agrandit ensuite jusqu'au sommaire.
    scale = shrinkToFit(lead);
    if (scale < 1) notes.push(chapterName + ' : chapeau d\'ouverture réduit à ' + Math.round(scale * 100) + ' % (page ' + kit.opening.name + ')');
    if (lead.overflows) growDown(lead, summary.geometricBounds[0] - TITLE_GAP);
  }
  if (summary.overflows) {
    limit = kit.opening.bounds[2] - kit.opening.marginPreferences.bottom - FOOT_CLEARANCE;
    growDown(summary, limit);
    scale = shrinkToFit(summary);
    if (scale < 1) notes.push(chapterName + ' : sommaire d\'ouverture réduit à ' + Math.round(scale * 100) + ' % (page ' + kit.opening.name + ')');
  }
}

/** Page blanche (sans gabarit), insérée avant ou après la page de référence. */
function addBlankPage(doc, location, reference) {
  var blank = doc.pages.add(location, reference);
  blank.appliedMaster = NothingEnum.NOTHING;
  return blank;
}

/** Pages de corps d'exemple au-delà de la première paire : retirées. */
function removeExampleBodyPages(doc, leftPage, rightPage) {
  var index;
  var page;
  for (index = doc.pages.length - 1; index >= 0; index -= 1) {
    page = doc.pages[index];
    if (page === leftPage || page === rightPage) continue;
    if (hasFrame(page, 'corps-gauche') || hasFrame(page, 'corps-droite')) page.remove();
  }
}

/** Réserve : copie vierge des trois pages d'un chapitre après la dernière page, ouverture sur une page de droite. */
function makeReserve(doc, kit) {
  var opening = kit.opening.duplicate(LocationOptions.AFTER, doc.pages.lastItem());
  var pages = [opening];
  if (opening.side !== PageSideOptions.RIGHT_HAND) {
    pages.push(addBlankPage(doc, LocationOptions.BEFORE, opening));
  }
  var left = kit.left.duplicate(LocationOptions.AFTER, opening);
  var right = kit.right.duplicate(LocationOptions.AFTER, left);
  pages.push(left, right);
  return { opening: opening, left: left, right: right, pages: pages };
}

/**
 * Trois pages d'un nouveau chapitre copiées de la réserve, juste après `after`, sans page blanche :
 * l'ouverture suit directement la dernière page du chapitre précédent. Quand elle tombe à gauche, le corps
 * commence sur une page de droite : les deux pages de corps se copient alors dans l'ordre inverse
 * (droite puis gauche), chacune gardant la géométrie de son côté. `bodyPages` donne l'ordre de lecture.
 */
function appendKit(doc, reserve, after, notes, snapshots) {
  var opening = reserve.opening.duplicate(LocationOptions.AFTER, after);
  var first;
  var second;
  var left;
  var right;
  if (opening.side === PageSideOptions.RIGHT_HAND) {
    left = reserve.left.duplicate(LocationOptions.AFTER, opening);
    right = reserve.right.duplicate(LocationOptions.AFTER, left);
    first = left;
    second = right;
  } else {
    right = reserve.right.duplicate(LocationOptions.AFTER, opening);
    left = reserve.left.duplicate(LocationOptions.AFTER, right);
    first = right;
    second = left;
    notes.push('ouverture à gauche (page ' + opening.name + ') : pas de page blanche intercalée');
  }
  // La copie décale les cadres locaux : on les replace d'après le premier kit, resté en place.
  var moved = restoreGeometry(opening, snapshots.opening) + restoreGeometry(left, snapshots.left) + restoreGeometry(right, snapshots.right);
  return { opening: opening, left: left, right: right, bodyPages: [first, second], moved: moved };
}

function placeOpening(kit, chapterDir, notes, chapterName) {
  var index;
  var frame;
  for (index = 0; index < OPENING_FILES.length; index += 1) {
    frame = frameNamed(kit.opening, OPENING_FILES[index][0]);
    // Chapeau et sommaire sont facultatifs : l'exporteur n'écrit pas leur ICML quand le Markdown n'en fournit pas
    // (pas de paragraphe courant sous le titre, moins de deux sections). Le cadre est alors vidé, sans arrêter la composition.
    if (OPENING_FILES[index][2] && !toFile(chapterDir + '/' + OPENING_FILES[index][1]).exists) {
      frame.contents = '';
      notes.push(chapterName + ' : pas de « ' + OPENING_FILES[index][0] + ' » (page ' + kit.opening.name + '), cadre laissé vide');
    } else {
      placeIcml(frame, chapterDir + '/' + OPENING_FILES[index][1]);
    }
  }
  fitOpening(kit, notes, chapterName);
  for (index = 0; index < OPENING_FILES.length; index += 1) {
    frame = frameNamed(kit.opening, OPENING_FILES[index][0]);
    if (frame.overflows) notes.push(chapterName + ' : texte en excès dans « ' + OPENING_FILES[index][0] + ' » (page ' + kit.opening.name + ')');
  }
}

/** Pages de gauche dont le gabarit porte les cadres d'en-tête : titre du guide et version ; rend le nombre de pages garnies. */
function placeLeftHeaders(doc, pagesDir, commonDir) {
  var count = 0;
  var index;
  var page;
  for (index = 0; index < doc.pages.length; index += 1) {
    page = doc.pages[index];
    if (page.side !== PageSideOptions.LEFT_HAND) continue;
    if (page.appliedMaster === null || page.appliedMaster === undefined || page.appliedMaster.allPageItems === undefined) continue;
    if (!hasFrame(page, 'en-tete-gauche-titre') && !masterHasFrame(page, 'en-tete-gauche-titre')) continue;
    placeIcml(frameNamed(page, 'en-tete-gauche-titre'), pagesDir + '/en-tete-titre.icml');
    placeIcml(frameNamed(page, 'en-tete-gauche-version'), commonDir + '/en-tete-version.icml');
    count += 1;
  }
  return count;
}

function masterHasFrame(page, name) {
  var items = page.appliedMaster.allPageItems;
  var index;
  for (index = 0; index < items.length; index += 1) {
    if (items[index].name === name) return true;
  }
  return false;
}

/**
 * Cadres de marge et de renvoi des deux pages du kit, avec leur position relative au coin de leur page.
 * Le cadre de marge est exigé ; le cadre de renvoi peut manquer d'un côté (le gabarit Scriptami n'en porte
 * qu'un, à gauche) : il est alors repris de l'autre côté, symétrique par rapport au milieu de la page.
 */
function marginSources(kit) {
  var sources = { left: null, right: null };
  var sides = [['left', kit.left, 'marginale-gauche', 'renvoi-gauche'], ['right', kit.right, 'marginale-droite', 'renvoi-droite']];
  var index;
  var page;
  var margin;
  var note;
  for (index = 0; index < sides.length; index += 1) {
    page = sides[index][1];
    if (!hasFrame(page, sides[index][2])) continue;
    margin = frameNamed(page, sides[index][2]);
    note = hasFrame(page, sides[index][3]) ? frameNamed(page, sides[index][3]) : null;
    sources[sides[index][0]] = {
      margin: margin, marginRel: relativeBounds(margin, page),
      note: note, noteRel: note === null ? null : relativeBounds(note, page),
      width: page.bounds[3] - page.bounds[1]
    };
  }
  borrowMissingNote(sources.left, sources.right);
  borrowMissingNote(sources.right, sources.left);
  return sources;
}

/** Donne à `target` le cadre de renvoi de `donor`, retourné en miroir sur la largeur de la page. */
function borrowMissingNote(target, donor) {
  if (target === null || donor === null || target.note !== null || donor.note === null) return;
  var rel = donor.noteRel;
  target.note = donor.note;
  target.noteRel = [rel[0], target.width - rel[3], rel[2], target.width - rel[1]];
}

function relativeBounds(item, page) {
  var bounds = item.geometricBounds;
  return [bounds[0] - page.bounds[0], bounds[1] - page.bounds[1], bounds[2] - page.bounds[0], bounds[3] - page.bounds[1]];
}

/** Retire les cadres de marge et de renvoi du modèle : la composition crée les siens, un par rubrique. */
function removeSatelliteFrames(kit) {
  var pages = [kit.left, kit.right];
  var pageIndex;
  var index;
  for (pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
    for (index = 0; index < SATELLITE_FRAMES.length; index += 1) {
      if (hasFrame(pages[pageIndex], SATELLITE_FRAMES[index])) frameNamed(pages[pageIndex], SATELLITE_FRAMES[index]).remove();
    }
  }
}

/** Fichiers `marge-N.M-*.icml` et `renvoi-K-sM-*.icml` d'un chapitre, triés par rang de section puis de note. */
function listMarginFiles(chapterDir) {
  var files = new Folder(chapterDir).getFiles('*.icml');
  var margins = [];
  var notes = [];
  var index;
  var name;
  var match;
  for (index = 0; index < files.length; index += 1) {
    name = decodeURI(files[index].name);
    match = name.match(/^marge-\d+\.(\d+)(?:-|\.icml$)/);
    if (match !== null) {
      margins.push({ section: parseInt(match[1], 10), file: files[index] });
      continue;
    }
    match = name.match(/^renvoi-(\d+)-s(\d+)(?:-|\.icml$)/);
    if (match !== null) notes.push({ rank: parseInt(match[1], 10), section: parseInt(match[2], 10), file: files[index] });
  }
  // Une rubrique renommée laisse l'ancien fichier sur le disque : le plus récent des fichiers d'une même rubrique fait foi.
  margins.sort(function (a, b) { return a.section - b.section || b.file.modified.getTime() - a.file.modified.getTime(); });
  var kept = [];
  for (index = 0; index < margins.length; index += 1) {
    if (kept.length === 0 || kept[kept.length - 1].section !== margins[index].section) kept.push(margins[index]);
  }
  margins = kept;
  notes.sort(function (a, b) { return a.rank - b.rank; });
  return { margins: margins, notes: notes };
}

/** Intertitres de niveau 1 du corps, dans l'ordre de lecture : le N.M-ième est la rubrique N.M. */
function sectionHeadings(bodyFrame) {
  var paragraphs = bodyFrame.parentStory.paragraphs;
  var headings = [];
  var index;
  for (index = 0; index < paragraphs.length; index += 1) {
    if (paragraphs[index].appliedParagraphStyle.name === 'Intertitre-1') headings.push(paragraphs[index]);
  }
  return headings;
}

/** Page d'une ligne de texte, ou null si elle est en excès (hors de tout cadre). */
function pageOfLine(line) {
  var frames = line.parentTextFrames;
  if (!frames || frames.length === 0) return null;
  return frames[0].parentPage;
}

/**
 * Nombre de lignes de texte qui suivent `heading` sur sa page (plafonné à `wanted`), et vrai si le texte se
 * poursuit sur une page suivante. Le texte est lu paragraphe par paragraphe : arrêt à la première ligne d'une autre page.
 */
function linesBelowHeading(paragraphs, headingIndex, wanted) {
  var headingPage = pageOfLine(paragraphs[headingIndex].lines[paragraphs[headingIndex].lines.length - 1]);
  var count = 0;
  var index;
  var lineIndex;
  var line;
  var page;
  if (headingPage === null) return { count: wanted, continues: false };
  for (index = headingIndex + 1; index < paragraphs.length; index += 1) {
    for (lineIndex = 0; lineIndex < paragraphs[index].lines.length; lineIndex += 1) {
      line = paragraphs[index].lines[lineIndex];
      page = pageOfLine(line);
      if (page === null || page.documentOffset !== headingPage.documentOffset) return { count: count, continues: true };
      count += 1;
      if (count >= wanted) return { count: count, continues: true };
    }
  }
  return { count: count, continues: false };
}

/**
 * Un intertitre ne reste pas en bas de page avec moins de MIN_LINES_UNDER_HEADING lignes dessous : il passe en
 * tête de la page suivante (saut de page local sur le paragraphe). Sans effet quand le texte s'arrête sur cette page
 * (fin de chapitre) ou quand l'intertitre ouvre déjà la page. Les pages ajoutées par ce report sont comptées en retour.
 */
function keepHeadingsWithText(doc, bodyFrames, masterFragment, notes, chapterName) {
  var story = bodyFrames[0].parentStory;
  var added = 0;
  var index;
  var paragraphs;
  var styleName;
  var heading;
  var previousPage;
  var headingPage;
  var below;
  var moved = 0;
  try {
    paragraphs = story.paragraphs;
    for (index = 1; index < paragraphs.length; index += 1) {
      heading = paragraphs[index];
      styleName = heading.appliedParagraphStyle.name;
      if (styleName !== 'Intertitre-1' && styleName !== 'Intertitre-2') continue;
      headingPage = pageOfLine(heading.lines[0]);
      previousPage = pageOfLine(paragraphs[index - 1].lines[paragraphs[index - 1].lines.length - 1]);
      if (headingPage === null || previousPage === null || previousPage.documentOffset !== headingPage.documentOffset) continue;
      below = linesBelowHeading(paragraphs, index, MIN_LINES_UNDER_HEADING);
      if (!below.continues || below.count >= MIN_LINES_UNDER_HEADING) continue;
      heading.startParagraph = StartParagraph.NEXT_PAGE;
      moved += 1;
      added += flowBody(doc, bodyFrames, masterFragment);
      paragraphs = story.paragraphs;
    }
  } catch (error) {
    notes.push(chapterName + ' : intertitres en bas de page non contrôlés (' + error.message + ')');
  }
  if (moved > 0) notes.push(chapterName + ' : ' + moved + ' intertitre(s) reporté(s) en haut de la page suivante (moins de ' + MIN_LINES_UNDER_HEADING + ' lignes dessous)');
  return added;
}

/** Copie un cadre du modèle sur `page`, vidée, à la position demandée (relative au coin de la page). */
function cloneFrame(source, rel, page, top, name) {
  var copy = source.duplicate(page);
  copy.contents = '';
  copy.name = name;
  copy.geometricBounds = [
    top, page.bounds[1] + rel[1],
    top + (rel[2] - rel[0]), page.bounds[1] + rel[3]
  ];
  return copy;
}

/** Cale le haut d'un cadre de texte sur le haut des capitales de sa première ligne (marge intérieure haute nulle). */
function alignFrameTopOnCaps(frame) {
  var insets;
  try {
    frame.textFramePreferences.firstBaselineOffset = FirstBaselineOffset.CAP_HEIGHT;
    insets = frame.textFramePreferences.insetSpacing;
    if (insets instanceof Array && insets.length === 4) frame.textFramePreferences.insetSpacing = [0, insets[1], insets[2], insets[3]];
    else frame.textFramePreferences.insetSpacing = 0;
  } catch (e) {
    // Réglage indisponible : le haut du cadre reste celui du modèle.
  }
}

/** Agrandit vers le bas, jusqu'à `limit`, un cadre dont le texte déborde ; rend vrai si le texte tient. */
function fitFrameDown(frame, limit) {
  var bounds;
  var guard = 0;
  while (frame.overflows && guard < 40) {
    bounds = frame.geometricBounds;
    if (bounds[2] >= limit) return false;
    frame.geometricBounds = [bounds[0], bounds[1], Math.min(limit, bounds[2] + 12), bounds[3]];
    guard += 1;
  }
  return !frame.overflows;
}

/**
 * Colonne marginale d'un chapitre, une fois le corps chaîné : pour chaque Intertitre-1, le bloc « numéro et
 * rubrique » (marge-N.M) est posé sur la page du titre, le haut aligné sur celui-ci ; les notes de renvoi de la
 * section (renvoi-K-sM) viennent dessous, empilées. Rend les décomptes {sections, notes}.
 */
function placeMargins(bodyFrames, chapterDir, sources, notes, chapterName) {
  var result = { sections: 0, notes: 0 };
  var found = listMarginFiles(chapterDir);
  if (found.margins.length === 0 && found.notes.length === 0) return result;
  var headings = sectionHeadings(bodyFrames[0]);
  var bottoms = {};
  var index;
  var noteIndex;
  var heading;
  var page;
  var source;
  var limit;
  var top;
  var headingBaseline;
  var shift;
  var room;
  var fits;
  var margin;
  var cursor;
  var noteFrame;
  var sectionNotes;
  var sectionIndex;
  for (index = 0; index < found.margins.length; index += 1) {
    sectionIndex = found.margins[index].section;
    heading = headings[sectionIndex - 1];
    if (heading === undefined) {
      // Marge orpheline : rubrique supprimée du Markdown, fichier resté sur le disque (l'export ne le supprime pas).
      // Silence tant que le corps a des intertitres ; sans aucun intertitre, c'est la détection qui est en cause.
      if (headings.length > 0) continue;
      notes.push(chapterName + ' : pas d\'intertitre de niveau 1 n° ' + sectionIndex + ' dans le corps, marge non placée');
      continue;
    }
    page = heading.parentTextFrames[0].parentPage;
    if (page === null || page === undefined) {
      notes.push(chapterName + ' : intertitre ' + sectionIndex + ' hors page, marge non placée');
      continue;
    }
    source = page.side === PageSideOptions.LEFT_HAND ? sources.left : sources.right;
    if (source === null) {
      notes.push(chapterName + ' : le modèle n\'a pas de cadre de marge pour la page ' + page.name + ', marge non placée');
      continue;
    }
    limit = page.bounds[2] - page.marginPreferences.bottom;
    headingBaseline = heading.insertionPoints[0].baseline;
    // Le haut du cadre de marge est réglé pour valoir le haut des capitales du numéro (première ligne calée sur la hauteur de
    // capitale, marge intérieure haute nulle) : plus de lecture de ligne de base sur un cadre fraîchement rempli, instable. Repère
    // de la maquette : le chiffre part ≈ 5 pt sous le haut de l'intertitre.
    top = headingBaseline - (heading.pointSize * CAP_HEIGHT - NUMBER_FRAME_SHIFT) * PT_MM;
    margin = cloneFrame(source.margin, source.marginRel, page, top, 'marge-' + sectionIndex);
    alignFrameTopOnCaps(margin);
    placeIcml(margin, found.margins[index].file.fsName);
    if (bottoms[page.name] !== undefined && margin.geometricBounds[0] < bottoms[page.name]) {
      margin.move(undefined, [0, bottoms[page.name] - margin.geometricBounds[0]]);
      notes.push(chapterName + ' : rubrique ' + sectionIndex + ' décalée sous la précédente (page ' + page.name + ', deux intertitres rapprochés)');
    }
    // La marge ne descend pas sous le cadre de corps (le filet du pied de page est juste dessous). Intertitre en bas de page : si le
    // texte déborde, la marge remonte par pas, sans passer sous la précédente, puis le cadre regagne sa hauteur.
    limit = Math.min(limit, heading.parentTextFrames[0].geometricBounds[2]);
    room = margin.geometricBounds[0] - (bottoms[page.name] === undefined ? page.marginPreferences.top : bottoms[page.name]);
    if (margin.geometricBounds[2] > limit) margin.geometricBounds = [margin.geometricBounds[0], margin.geometricBounds[1], limit, margin.geometricBounds[3]];
    fits = fitFrameDown(margin, limit);
    while (!fits && room > 0.5) {
      shift = Math.min(MARGIN_RISE_STEP, room);
      margin.move(undefined, [0, -shift]);
      room -= shift;
      fits = fitFrameDown(margin, limit);
    }
    if (!fits) notes.push(chapterName + ' : texte en excès dans la marge de la rubrique ' + sectionIndex + ' (page ' + page.name + ')');
    result.sections += 1;
    cursor = margin.geometricBounds[2];
    bottoms[page.name] = cursor + 8;

    sectionNotes = [];
    for (noteIndex = 0; noteIndex < found.notes.length; noteIndex += 1) {
      // Une note placée avant le premier intertitre (rang 0) se range avec la première rubrique.
      if (found.notes[noteIndex].section === sectionIndex || (sectionIndex === 1 && found.notes[noteIndex].section === 0)) sectionNotes.push(found.notes[noteIndex]);
    }
    if (sectionNotes.length > 0 && source.note === null) {
      notes.push(chapterName + ' : aucun cadre de renvoi dans le modèle, ' + sectionNotes.length + ' renvoi(s) de la rubrique ' + sectionIndex + ' non placé(s)');
      sectionNotes = [];
    }
    for (noteIndex = 0; noteIndex < sectionNotes.length; noteIndex += 1) {
      top = noteIndex === 0 ? margin.geometricBounds[0] + (source.noteRel[0] - source.marginRel[0]) : cursor + 10;
      if (top < cursor) top = cursor + 10;
      noteFrame = cloneFrame(source.note, source.noteRel, page, top, 'renvoi-' + sectionNotes[noteIndex].rank);
      placeIcml(noteFrame, sectionNotes[noteIndex].file.fsName);
      if (!fitFrameDown(noteFrame, limit)) notes.push(chapterName + ' : texte en excès dans le renvoi ' + sectionNotes[noteIndex].rank + ' (page ' + page.name + ')');
      cursor = noteFrame.geometricBounds[2];
      bottoms[page.name] = cursor + 8;
      result.notes += 1;
    }
  }
  // Notes dont la section n'a pas de rubrique placée : signalées, jamais perdues sans le dire.
  var expected = 0;
  for (index = 0; index < found.notes.length; index += 1) expected += 1;
  if (result.notes < expected) notes.push(chapterName + ' : ' + (expected - result.notes) + ' note(s) de renvoi non placée(s) (section sans marge)');
  return result;
}

/** En-têtes du chapitre sur chaque page de droite du corps ; rend le nombre de pages garnies. */
/**
 * Pages réelles d'un chapitre pour les sommaires : « N » (page d'ouverture) et « N.M » (page de l'Intertitre-1 de rang M).
 * Rend des paires [clé, page] ; la clé suit celle de `pages` dans pages-gabarit.json.
 */
function measureChapterPages(chapterName, opening, bodyFrames) {
  var number = parseInt(chapterName.substr(0, 2), 10);
  var pairs = [[String(number), parseInt(opening.name, 10)]];
  var headings = sectionHeadings(bodyFrames[0]);
  var index;
  var page;
  for (index = 0; index < headings.length; index += 1) {
    page = headings[index].parentTextFrames[0].parentPage;
    if (page !== null && page !== undefined) pairs.push([number + '.' + (index + 1), parseInt(page.name, 10)]);
  }
  return pairs;
}

/** Écrit les pages relevées en JSON (`{ "1": 3, "1.1": 4 }`), lu ensuite par le pilote Node. */
function writeMeasuredPages(path, pairs) {
  var file = toFile(path);
  var lines = [];
  var index;
  for (index = 0; index < pairs.length; index += 1) lines.push('  "' + pairs[index][0] + '": ' + pairs[index][1]);
  file.encoding = 'UTF-8';
  if (!file.open('w')) fail('relevé des pages : impossible d\'écrire ' + path);
  file.write('{\n' + lines.join(',\n') + '\n}\n');
  file.close();
}

function placeHeaders(bodyFrames, chapterDir) {
  var count = 0;
  var index;
  var page;
  var headerIndex;
  for (index = 0; index < bodyFrames.length; index += 1) {
    page = bodyFrames[index].parentPage;
    if (page === null || page === undefined || page.side !== PageSideOptions.RIGHT_HAND) continue;
    for (headerIndex = 0; headerIndex < HEADER_FILES.length; headerIndex += 1) {
      placeIcml(frameNamed(page, HEADER_FILES[headerIndex][0]), chapterDir + '/' + HEADER_FILES[headerIndex][1]);
    }
    count += 1;
  }
  return count;
}

function composeGuide() {
  var paths = eval('(' + app.scriptArgs.getValue('paths') + ')');
  var doc = app.open(toFile(paths.template));
  var report = [];
  var notes = [];
  var step = 'préparation du modèle';
  try {
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
    doc = doc.save(toFile(paths.document));

    requirePage(doc, 'conseils-fin'); // la page de fin doit exister ; les chapitres s'insèrent avant elle
    var firstKit = {
      opening: requirePage(doc, 'chapitre-titre'),
      left: requirePage(doc, 'corps-gauche'),
      right: requirePage(doc, 'corps-droite')
    };
    firstKit.bodyPages = [firstKit.left, firstKit.right];
    removeExampleBodyPages(doc, firstKit.left, firstKit.right);
    if (firstKit.opening.side !== PageSideOptions.RIGHT_HAND) {
      notes.push('la première ouverture de chapitre du modèle n\'est pas sur une page de droite (page ' + firstKit.opening.name + ')');
    }

    var snapshots = {
      opening: snapshotGeometry(firstKit.opening),
      left: snapshotGeometry(firstKit.left),
      right: snapshotGeometry(firstKit.right)
    };
    var reserve = paths.chapters.length > 1 ? makeReserve(doc, firstKit) : null;
    var movedFrames = 0;
    var leftHeaderPages = 0;
    var headersDone = true;
    var kit = firstKit;
    var chapterIndex;
    var headerPages = 0;
    var addedPages = 0;
    var marginSections = 0;
    var marginNotes = 0;
    var chapterRuns = [];
    for (chapterIndex = 0; chapterIndex < paths.chapters.length; chapterIndex += 1) {
      var chapterName = paths.chapters[chapterIndex];
      var chapterDir = paths.icmlDir + '/' + chapterName;
      step = chapterName + ' : kit de pages';
      if (chapterIndex > 0) {
        kit = appendKit(doc, reserve, kit.lastPage, notes, snapshots);
        movedFrames += kit.moved;
      }

      step = chapterName + ' : ouverture du chapitre';
      placeOpening(kit, chapterDir, notes, chapterName);
      var marginSourceFrames = marginSources(kit);

      step = chapterName + ' : corps du chapitre';
      var leftFrame = frameNamed(kit.left, 'corps-gauche');
      var rightFrame = frameNamed(kit.right, 'corps-droite');
      // Ordre de lecture : gauche puis droite, ou droite puis gauche quand l'ouverture est à gauche.
      var firstFrame = kit.bodyPages[0] === kit.left ? leftFrame : rightFrame;
      var secondFrame = firstFrame === leftFrame ? rightFrame : leftFrame;
      placeIcml(firstFrame, chapterDir + '/corps.icml');
      secondFrame.contents = '';
      firstFrame.nextTextFrame = secondFrame;
      var bodyFrames = [firstFrame, secondFrame];
      addedPages += flowBody(doc, bodyFrames, 'Courante');
      addedPages += keepHeadingsWithText(doc, bodyFrames, 'Courante', notes, chapterName);
      if (bodyFrames[bodyFrames.length - 1].overflows) fail(chapterName + ' : le texte du corps déborde encore après la composition.');
      kit.lastPage = bodyFrames[bodyFrames.length - 1].parentPage;

      step = chapterName + ' : colonne marginale et renvois';
      var placedMargins = placeMargins(bodyFrames, chapterDir, marginSourceFrames, notes, chapterName);
      marginSections += placedMargins.sections;
      marginNotes += placedMargins.notes;
      removeSatelliteFrames(kit);
      chapterRuns.push({ name: chapterName, opening: kit.opening, frames: bodyFrames });

      if (headersDone) {
        try {
          headerPages += placeHeaders(bodyFrames, chapterDir);
        } catch (headerError) {
          headersDone = false;
          notes.push('en-têtes de chapitre non placés (' + headerError.message + ') : à importer à la main');
        }
      }
    }

    if (reserve !== null) {
      var removeIndex;
      for (removeIndex = reserve.pages.length - 1; removeIndex >= 0; removeIndex -= 1) reserve.pages[removeIndex].remove();
    }
    if (!headersDone) headerPages = 0;

    try {
      leftHeaderPages = placeLeftHeaders(doc, paths.pagesDir, paths.commonDir);
    } catch (leftError) {
      notes.push('en-têtes de gauche non placés (' + leftError.message + ') : à importer à la main');
    }

    if (paths.measuredPages) {
      step = 'relevé des pages';
      var measuredPages = [];
      var runIndex;
      for (runIndex = 0; runIndex < chapterRuns.length; runIndex += 1) {
        measuredPages = measuredPages.concat(measureChapterPages(chapterRuns[runIndex].name, chapterRuns[runIndex].opening, chapterRuns[runIndex].frames));
      }
      writeMeasuredPages(paths.measuredPages, measuredPages);
    }

    step = 'export du PDF';
    var preset = exportPdf(doc, paths.pdf, paths.preset || null);
    doc.save();
    report.push('chapitres composés : ' + paths.chapters.length + ' (pages de corps ajoutées : ' + addedPages + ')');
    report.push('en-têtes de chapitre : ' + headerPages + ' pages de droite garnies');
    report.push('en-têtes de gauche (titre, version) : ' + leftHeaderPages + ' pages garnies');
    report.push('cadres replacés après duplication : ' + movedFrames);
    report.push('colonne marginale : ' + marginSections + ' rubriques numérotées, ' + marginNotes + ' renvois placés');
    report.push('document : ' + paths.document + ' (' + doc.pages.length + ' pages, liens : ' + doc.links.length + ')');
    report.push('PDF : ' + paths.pdf + ' (préréglage ' + preset + ')');
    var index;
    for (index = 0; index < notes.length; index += 1) report.push('A CONTROLER : ' + notes[index]);
  } catch (composeError) {
    // Une erreur ExtendScript traverse COM sans son texte (« Object reference not set… ») : on la nomme ici.
    throw new Error(step + ' : ' + composeError.message + ' (ligne ' + composeError.line + ')');
  } finally {
    doc.close(SaveOptions.NO);
  }
  return report.join('\n');
}

composeGuide();
