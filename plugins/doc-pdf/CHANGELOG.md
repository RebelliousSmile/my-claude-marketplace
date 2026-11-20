# Changelog

## 0.2.3

- En-tête de la page gauche : la flèche devant le titre du guide est maintenant ◀ (vers le bord extérieur), comme le ▶ de la page droite ; avant, les deux flèches regardaient vers l'intérieur à gauche et vers l'extérieur à droite. Modèle IDML et ICML d'en-tête ; recomposer (`pdf compose --remplacer`) ou régénérer l'ICML puis `pdf update` pour les .indd existants. Le ▶ du bloc « Dans ce chapitre » et des puces ne change pas.

## 0.2.2

- `pdf compose` et `pdf update` écrivent le PDF sous `<outputDir>/pdf/<nom du .indd>-v<version>.pdf` (version lue dans `versionFile`, sans suffixe si le fichier manque) au lieu de le poser à côté du .indd ; avec `--sortie`, le PDF reste à côté du .indd choisi. Les dossiers de sortie sont créés. Le champ `document` n'a pas changé de sens : y mettre `../../output/indd/<nom>.indd` pour ranger les .indd (et leurs copies `avant-<horodatage>`) sous `output/indd`. Les anciens PDF restent où ils étaient, sans effet.
- `pdf compose` place la colonne marginale et les renvois : numéro « N.M » et rubrique à hauteur de chaque intertitre de niveau 1, notes « Renvoi » de la section dessous. Les fichiers de renvoi portent désormais le rang de leur section (`renvoi-K-s<M>-…`) ; les anciens `renvoi-K-<début>.icml` restent sur le disque comme orphelins, sans effet. Script InDesign non exécuté par l'agent : à contrôler sur une recomposition. Une marge dont l’intertitre est en bas de page est bornée au cadre de corps (au-dessus du filet du pied) et remonte par pas de 4 mm tant que son texte déborde, sans passer sous la précédente.
- `pdf compose` ne laisse plus un intertitre (niveau 1 ou 2) en bas de page avec moins de 3 lignes de texte dessous : un saut de page local le reporte en tête de la page suivante (`MIN_LINES_UNDER_HEADING` dans `compose-guide.jsx`). Sans effet en fin de chapitre ni quand l'intertitre ouvre déjà la page ; chaque chapitre signale le nombre d'intertitres reportés (`A CONTROLER`). Le saut est posé à la composition : un `pdf update` (liens ICML rafraîchis) ne le recalcule pas. Peut décaler des pages : recomposer avec `--maj-pages`, puis une seconde fois pour les sommaires.
- `pdf compose` ignore sans alerte les fichiers `marge-N.M-*.icml` dont le rang dépasse le nombre d'intertitres de niveau 1 du chapitre (rubrique supprimée du Markdown, fichier ICML resté sur le disque) ; l'alerte « pas d'intertitre n° N » ne reste que si le corps n'a aucun intertitre. Script InDesign non exécuté par l'agent.
- `pdf compose` : le cadre de renvoi manquant d'un côté du modèle (le gabarit Scriptami n'a pas de `renvoi-droite`, seulement `renvoi-gauche`) est repris de l'autre côté, en miroir ; avant, aucune marge n'était placée sur les pages de droite (« le modèle n'a pas de cadre de marge pour la page N »). Sans aucun cadre de renvoi, les notes sont signalées en `A CONTROLER` au lieu d'arrêter la composition. Script InDesign non exécuté par l'agent.
- `pdf compose` cale le haut du chiffre « N.M » de la marge ≈ 5 pt sous le haut de l’intertitre (maquette) : le cadre de marge a sa première ligne réglée sur la hauteur de capitale et sa marge intérieure haute nulle, son haut est placé d’après la ligne de base de l’intertitre, avec conversion explicite des points en millimètres (le modèle IDML est en millimètres : un réglage en points était multiplié par 2,83). Avant, le chiffre tombait au-dessus ou très en dessous du titre. Script InDesign non exécuté par l'agent : à mesurer sur une recomposition.
- Modèle IDML : `Intertitre-1` et `Intertitre-2` gardent leurs lignes ensemble (`KeepLinesTogether`) : un intertitre de deux lignes n’est plus coupé entre deux pages. Peut décaler des pages : recomposer avec `--maj-pages`.
- `pdf compose` ne place qu'une marge par rubrique : si plusieurs fichiers `marge-N.M-*.icml` existent pour la même rubrique (rubrique renommée, ancien fichier resté sur le disque), seul le plus récent est retenu. Avant, les deux marges étaient placées l'une sous l'autre, d'où des alertes « rubrique décalée » et « pas d'intertitre n° N ». Script InDesign non exécuté par l'agent.
- `pdf compose` relève les numéros de page réels des sommaires (chapitres et sections), les compare à la clé `pages` de `pages-gabarit.json` et signale les écarts (`A CONTROLER`). `--maj-pages` réécrit la table ; relancer ensuite la composition pour que les sommaires la reprennent.

## 0.2.1

- `pdf compose` n'intercale plus de page blanche avant une ouverture de chapitre : l'ouverture suit la fin du chapitre précédent, à gauche comme à droite (à gauche, les deux premières pages de corps se copient dans l'ordre droite puis gauche). Script InDesign non exécuté par l'agent : à contrôler sur une recomposition (`pdf compose --remplacer`) ; les `.indd` déjà composés gardent leurs pages blanches tant qu'ils ne sont pas recomposés.

## 0.2.0

- Commande `pdf compose` : compose tous les chapitres d'un guide dans le modèle IDML (ouverture, corps chaîné, en-têtes, pages blanches pour garder chaque ouverture à droite), crée les liens ICML qu'`update` rafraîchira ensuite. Un `.indd` existant n'est remplacé qu'avec `--remplacer` (copie de sauvegarde). Script InDesign non vérifié : colonne marginale et renvois laissés vides.
- Constat des fichiers après `pdf update` et `pdf compose` : empreintes avant/après des ICML, de l'IDML, du `.indd` et du PDF, avec une alerte quand aucun ICML n'a changé. Sert à prouver qu'un correctif a atteint les sorties avant de l'annoncer livré (et non à supposer que le cache ou une ancienne copie n'est pas en cause).

## 0.1.0

- Première version. Moteur issu du projet cerascan (`scripts/guides/`, branche `feat/export-icml-guides`) : Markdown vers ICML (Pandoc), modèle IDML de la charte Scriptami, manifeste d'empreintes des ICML, mise à jour d'un `.indd` existant et export PDF par InDesign.
- Configuration par projet : `documentation.config.json` (guides, `document`, `pdfPreset`).
- Point d'entrée `engine/cli.js` : `init`, `merge`, `icml`, `idml`, `pdf`.
- La mise à jour d'un `.indd` (commande `pdf update`) n'a pas encore été vérifiée dans InDesign : le COM exige un PowerShell administrateur.
