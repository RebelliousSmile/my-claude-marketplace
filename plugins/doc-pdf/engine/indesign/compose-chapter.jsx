// Compose un chapitre dans une copie du modèle IDML et exporte le PDF (essai de la phase 1).
// Lancé par run-indesign.ps1 : les chemins arrivent en JSON dans app.scriptArgs ("paths").
// Couverture, sommaire et page de fin gardent leur contenu : le générateur d'IDML les a déjà remplis
// d'après les mêmes sources. Seules l'ouverture de chapitre et les pages de corps sont recomposées.
// Vérifié dans InDesign 2025 de bout en bout en phase 1 (compte rendu dans le plan).

#include "compose-lib.jsx"

function composeChapter() {
  var paths = eval('(' + app.scriptArgs.getValue('paths') + ')');
  BODY_MASTER = paths.composition.gabaritCorps;
  var doc = app.open(toFile(paths.template));
  var report = [];
  try {
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
    doc = doc.save(toFile(paths.document));

    // Repères du modèle : chaque page est retrouvée par un de ses cadres nommés.
    requirePage(doc, 'conseils-fin'); // la page de fin doit exister ; flowBody insère après la dernière page de corps
    var openingPage = requirePage(doc, 'chapitre-titre');
    var leftBodyPage = requirePage(doc, 'corps-gauche');
    var rightBodyPage = requirePage(doc, 'corps-droite');

    // Pages de corps d'exemple au-delà de la première paire : retirées.
    var index;
    for (index = doc.pages.length - 1; index >= 0; index -= 1) {
      var page = doc.pages[index];
      if (page === leftBodyPage || page === rightBodyPage) continue;
      if (hasFrame(page, 'corps-gauche') || hasFrame(page, 'corps-droite')) page.remove();
    }

    // Ouverture de chapitre : un fichier ICML par cadre.
    var opening = [
      ['chapitre-surtitre', 'ouverture-surtitre.icml'],
      ['chapitre-numero', 'ouverture-numero.icml'],
      ['chapitre-titre', 'ouverture-titre.icml'],
      ['chapitre-chapeau', 'ouverture-chapeau.icml'],
      ['chapitre-sommaire', 'ouverture-sommaire.icml']
    ];
    for (index = 0; index < opening.length; index += 1) {
      placeIcml(frameNamed(openingPage, opening[index][0]), paths.chapterDir + '/' + opening[index][1]);
    }

    // Colonne marginale et renvois : leur position dépend de la section, non automatisée dans l'essai.
    var satellites = ['marginale-gauche', 'marginale-droite', 'renvoi-gauche', 'renvoi-droite'];
    for (index = 0; index < satellites.length; index += 1) {
      if (hasFrame(leftBodyPage, satellites[index])) frameNamed(leftBodyPage, satellites[index]).contents = '';
      if (hasFrame(rightBodyPage, satellites[index])) frameNamed(rightBodyPage, satellites[index]).contents = '';
    }
    report.push('marge et renvois : cadres vidés, à placer à la main');

    // Corps : première paire de cadres chaînée, puis pages ajoutées tant que le texte déborde.
    var leftFrame = frameNamed(leftBodyPage, 'corps-gauche');
    var rightFrame = frameNamed(rightBodyPage, 'corps-droite');
    placeIcml(leftFrame, paths.chapterDir + '/corps.icml');
    rightFrame.contents = '';
    leftFrame.nextTextFrame = rightFrame;
    var bodyFrames = [leftFrame, rightFrame];
    var added = flowBody(doc, bodyFrames, BODY_MASTER);
    report.push('pages de corps ajoutées : ' + added);

    var overflowing = bodyFrames[bodyFrames.length - 1].overflows;
    if (overflowing) fail('Le texte du corps déborde encore après la composition.');

    var preset = exportPdf(doc, paths.pdf, paths.preset || null);
    report.push('PDF : ' + paths.pdf + ' (préréglage ' + preset + ', ' + doc.pages.length + ' pages)');
    doc.save();
  } finally {
    doc.close(SaveOptions.NO);
  }
  return report.join('\n');
}

composeChapter();
