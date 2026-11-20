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
// Colonne marginale et renvois : vidés, à placer à la main (cf. runbook).
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
var GEOMETRY_TOLERANCE = 0.5;

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

function clearSatellites(kit) {
  var index;
  for (index = 0; index < SATELLITE_FRAMES.length; index += 1) {
    if (hasFrame(kit.left, SATELLITE_FRAMES[index])) frameNamed(kit.left, SATELLITE_FRAMES[index]).contents = '';
    if (hasFrame(kit.right, SATELLITE_FRAMES[index])) frameNamed(kit.right, SATELLITE_FRAMES[index]).contents = '';
  }
}

/** En-têtes du chapitre sur chaque page de droite du corps ; rend le nombre de pages garnies. */
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
      clearSatellites(kit);

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
      if (bodyFrames[bodyFrames.length - 1].overflows) fail(chapterName + ' : le texte du corps déborde encore après la composition.');
      kit.lastPage = bodyFrames[bodyFrames.length - 1].parentPage;

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

    step = 'export du PDF';
    var preset = exportPdf(doc, paths.pdf, paths.preset || null);
    doc.save();
    report.push('chapitres composés : ' + paths.chapters.length + ' (pages de corps ajoutées : ' + addedPages + ')');
    report.push('en-têtes de chapitre : ' + headerPages + ' pages de droite garnies');
    report.push('en-têtes de gauche (titre, version) : ' + leftHeaderPages + ' pages garnies');
    report.push('cadres replacés après duplication : ' + movedFrames);
    report.push('marge et renvois : cadres vidés, à placer à la main');
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
