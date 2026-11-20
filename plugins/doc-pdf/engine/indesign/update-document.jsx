// Met à jour le .indd d'un guide déjà composé : rafraîchit les liens ICML, ajoute ou retire des pages de corps,
// exporte le PDF et enregistre. Les cadres retouchés à la main gardent position et taille ; seuls les textes liés changent.
// Lancé par run-indesign.ps1 : les chemins arrivent en JSON dans app.scriptArgs ("paths") :
//   document, pdf, preset, icmlDir (ICML du guide), commonDir (cinq ICML communs), commonNames (leurs noms de fichier).
// La copie de sauvegarde `<nom>.avant-<horodatage>.indd` est faite par compose-guide.js avant ce script.
// ES3 : ni let, ni const, ni JSON natif. NON VÉRIFIÉ dans InDesign : la nature de `link.parent` pour un ICML placé
// (Story attendue) et le statut des liens sont à contrôler au premier lancement par l'utilisateur.

#include "compose-lib.jsx"

var BODY_ICML = 'corps.icml';

function lower(text) {
  return String(text).toLowerCase();
}

/** Chemin système normalisé (séparateur « \ » sous Windows) pour comparer deux emplacements. */
function normalized(path) {
  return lower(toFile(path).fsName).replace(/\//g, '\\');
}

function isUnder(path, folder) {
  var root = normalized(folder);
  if (root.charAt(root.length - 1) !== '\\') root += '\\';
  return normalized(path).indexOf(root) === 0;
}

function contains(list, value) {
  var index;
  for (index = 0; index < list.length; index += 1) {
    if (list[index] === value) return true;
  }
  return false;
}

/** Position et taille de chaque cadre de texte, par identifiant : repère pour vérifier que rien ne bouge. */
function snapshotFrames(doc) {
  var snapshot = {};
  var pageIndex;
  var items;
  var itemIndex;
  for (pageIndex = 0; pageIndex < doc.pages.length; pageIndex += 1) {
    items = doc.pages[pageIndex].allPageItems;
    for (itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
      if (items[itemIndex].constructor.name === 'TextFrame') {
        snapshot[items[itemIndex].id] = items[itemIndex].geometricBounds.join(',');
      }
    }
  }
  return snapshot;
}

/** Cadres présents avant et après dont les bornes ont changé : liste de leurs identifiants. */
function movedFrames(before, doc) {
  var after = snapshotFrames(doc);
  var moved = [];
  var id;
  for (id in before) {
    if (before.hasOwnProperty(id) && after.hasOwnProperty(id) && before[id] !== after[id]) moved.push(id);
  }
  return moved;
}

/** Classe les liens ICML : à mettre à jour, manquants, hors des chemins attendus. */
function inspectLinks(doc, paths) {
  var result = { all: [], outdated: [], missing: [], misplaced: [] };
  var index;
  var link;
  for (index = 0; index < doc.links.length; index += 1) {
    link = doc.links[index];
    if (lower(link.name).indexOf('.icml') !== link.name.length - 5) continue;
    result.all.push(link);
    if (link.status === LinkStatus.LINK_MISSING) result.missing.push(link);
    else if (link.status === LinkStatus.LINK_OUT_OF_DATE) result.outdated.push(link);
    var expected = contains(paths.commonNames, link.name)
      ? isUnder(link.filePath, paths.commonDir)
      : (isUnder(link.filePath, paths.icmlDir) || isUnder(link.filePath, paths.commonDir));
    if (!expected) result.misplaced.push(link);
  }
  return result;
}

function describeLink(link) {
  return link.name + ' (' + link.filePath + ')';
}

/** Dernier cadre vide d'une histoire, seul sur sa page : la page est retirée. Rend le nombre de pages retirées. */
function removeTrailingEmptyPages(story) {
  var removed = 0;
  var containers = story.textContainers;
  var index = containers.length - 1;
  var frame;
  var page;
  while (index >= 2) {
    frame = containers[index];
    page = frame.parentPage;
    if (page === null || page === undefined) break;
    if (frame.contents !== '' || page.allPageItems.length !== 1) break;
    page.remove();
    removed += 1;
    index -= 1;
  }
  return removed;
}

/** Ajoute des pages tant que le texte du corps déborde. Rend le nombre de pages ajoutées. */
function growStory(doc, story, notes) {
  var containers = story.textContainers;
  var frames = [];
  var index;
  for (index = 0; index < containers.length; index += 1) frames.push(containers[index]);
  if (!frames[frames.length - 1].overflows) return 0;
  if (frames.length < 2) {
    notes.push('corps déborde dans un cadre unique : pages à ajouter à la main');
    return 0;
  }
  return flowBody(doc, frames, BODY_MASTER);
}

function updateDocument() {
  var paths = eval('(' + app.scriptArgs.getValue('paths') + ')');
  BODY_MASTER = paths.composition.gabaritCorps;
  var documentFile = toFile(paths.document);
  if (!documentFile.exists) fail('Document introuvable : ' + paths.document);
  app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
  var doc = app.open(documentFile);
  var report = [];
  try {
    var before = snapshotFrames(doc);
    var links = inspectLinks(doc, paths);
    var index;
    for (index = 0; index < links.misplaced.length; index += 1) {
      report.push('LIEN HORS CHEMIN ATTENDU : ' + describeLink(links.misplaced[index]));
    }
    for (index = 0; index < links.missing.length; index += 1) {
      report.push('LIEN MANQUANT : ' + describeLink(links.missing[index]));
    }

    var updated = 0;
    var bodyStories = [];
    for (index = 0; index < links.all.length; index += 1) {
      if (links.all[index].status === LinkStatus.LINK_OUT_OF_DATE) {
        links.all[index].update();
        updated += 1;
      }
    }
    for (index = 0; index < links.all.length; index += 1) {
      if (links.all[index].name === BODY_ICML && links.all[index].status !== LinkStatus.LINK_MISSING) {
        var story = links.all[index].parent;
        if (story && story.textContainers) bodyStories.push(story);
        else report.push('corps non reconnu comme texte lié : ' + describeLink(links.all[index]));
      }
    }

    var added = 0;
    var removed = 0;
    var notes = [];
    for (index = 0; index < bodyStories.length; index += 1) {
      added += growStory(doc, bodyStories[index], notes);
      removed += removeTrailingEmptyPages(bodyStories[index]);
    }
    for (index = 0; index < notes.length; index += 1) report.push(notes[index]);

    var moved = movedFrames(before, doc);
    if (moved.length > 0) report.push('CADRES DONT LA GÉOMÉTRIE A CHANGÉ : ' + moved.length + ' (identifiants ' + moved.join(', ') + ')');

    var preset = exportPdf(doc, paths.pdf, paths.preset || null);
    doc.save();
    report.unshift('liens ICML : ' + links.all.length + ' (mis à jour : ' + updated + ', manquants : ' + links.missing.length +
      ', hors chemin : ' + links.misplaced.length + ')');
    report.push('pages ajoutées : ' + added + ', retirées : ' + removed + ' (' + doc.pages.length + ' pages)');
    report.push('PDF : ' + paths.pdf + ' (préréglage ' + preset + ')');
    report.push('Rappel : un texte retouché dans InDesign sur un cadre lié est écrasé par la mise à jour ; corriger dans les ICML ou le Markdown.');
  } finally {
    doc.close(SaveOptions.NO);
  }
  return report.join('\n');
}

updateDocument();
