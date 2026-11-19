// Module commun de composition InDesign (ExtendScript, ES3 : ni let, ni const, ni JSON natif).
// Réutilisé par la phase 3 (mise à jour d'un .indd) : une seule implémentation du placement et du chaînage.
// Vérifié dans InDesign 2025 de bout en bout en phase 1 (compte rendu dans le plan).

var MAX_ADDED_PAGES = 200;

function toFile(path) {
  return new File(String(path).replace(/\\/g, '/'));
}

function fail(message) {
  throw new Error(message);
}

/** Cadre nommé de la page ; surcharge l'élément de gabarit s'il en vient. Arrête avec le nom introuvable. */
function frameNamed(page, name) {
  var items = page.allPageItems;
  var index;
  for (index = 0; index < items.length; index += 1) {
    if (items[index].name === name) return items[index];
  }
  if (page.appliedMaster !== null && page.appliedMaster !== undefined) {
    var masterItems = page.appliedMaster.allPageItems;
    for (index = 0; index < masterItems.length; index += 1) {
      if (masterItems[index].name === name) return masterItems[index].override(page);
    }
  }
  fail('Cadre introuvable : ' + name + ' (page ' + page.name + ')');
}

/** Premier cadre nommé du document, toutes pages confondues ; null s'il n'existe pas. */
function pageHolding(doc, name) {
  var index;
  var items;
  var itemIndex;
  for (index = 0; index < doc.pages.length; index += 1) {
    items = doc.pages[index].allPageItems;
    for (itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
      if (items[itemIndex].name === name) return doc.pages[index];
    }
  }
  return null;
}

function requirePage(doc, name) {
  var page = pageHolding(doc, name);
  if (page === null) fail('Cadre introuvable : ' + name + ' (aucune page du modèle ne le porte)');
  return page;
}

/** Remplace le contenu d'un cadre par le texte d'un ICML. */
function placeIcml(frame, path) {
  var file = toFile(path);
  if (!file.exists) fail('Fichier ICML introuvable : ' + path);
  frame.contents = '';
  frame.place(file);
}

function masterNamed(doc, fragment) {
  var index;
  for (index = 0; index < doc.masterSpreads.length; index += 1) {
    if (doc.masterSpreads[index].name.indexOf(fragment) !== -1) return doc.masterSpreads[index];
  }
  fail('Gabarit introuvable : ' + fragment);
}

/**
 * Chaîne le texte de `first` sur de nouveaux cadres, une page de plus tant que le texte déborde.
 * `bodyFrames` : cadres de corps déjà posés, dans l'ordre de lecture (au moins deux : un par côté),
 * `beforePage` : page devant laquelle insérer (la page de fin). Renvoie le nombre de pages ajoutées.
 */
function flowBody(doc, bodyFrames, beforePage, masterFragment) {
  var added = 0;
  var master = masterNamed(doc, masterFragment);
  var last = bodyFrames[bodyFrames.length - 1];
  while (last.overflows) {
    if (added >= MAX_ADDED_PAGES) fail('Plus de ' + MAX_ADDED_PAGES + ' pages ajoutées : composition interrompue.');
    var reference = bodyFrames[bodyFrames.length - 2];
    var referencePage = reference.parentPage;
    var page = doc.pages.add(LocationOptions.BEFORE, beforePage);
    page.appliedMaster = master;
    var offset = [
      reference.geometricBounds[0] - referencePage.bounds[0],
      reference.geometricBounds[1] - referencePage.bounds[1],
      reference.geometricBounds[2] - referencePage.bounds[0],
      reference.geometricBounds[3] - referencePage.bounds[1]
    ];
    var frame = page.textFrames.add();
    frame.geometricBounds = [
      page.bounds[0] + offset[0], page.bounds[1] + offset[1],
      page.bounds[0] + offset[2], page.bounds[1] + offset[3]
    ];
    frame.textFramePreferences.textColumnCount = reference.textFramePreferences.textColumnCount;
    last.nextTextFrame = frame;
    bodyFrames.push(frame);
    last = frame;
    added += 1;
  }
  return added;
}

/** Préréglage d'export : celui demandé, sinon le premier dont le nom évoque la haute qualité. */
function pdfPreset(requested) {
  var presets = app.pdfExportPresets;
  var index;
  var name;
  if (requested) {
    for (index = 0; index < presets.length; index += 1) {
      if (presets[index].name === requested) return presets[index];
    }
    fail('Préréglage PDF introuvable : ' + requested);
  }
  for (index = 0; index < presets.length; index += 1) {
    name = presets[index].name.toLowerCase();
    if (name.indexOf('qualit') !== -1 || name.indexOf('quality') !== -1) return presets[index];
  }
  if (presets.length === 0) fail('Aucun préréglage PDF disponible.');
  return presets[0];
}

function exportPdf(doc, path, requestedPreset) {
  var preset = pdfPreset(requestedPreset);
  doc.exportFile(ExportFormat.PDF_TYPE, toFile(path), false, preset);
  return preset.name;
}
