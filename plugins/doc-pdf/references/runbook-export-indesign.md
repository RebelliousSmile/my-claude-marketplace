# Runbook — export des guides vers InDesign

La commande `pnpm run guides:icml` convertit chaque chapitre numéroté des trois guides (partenaire, vendeur, administrateur) en un fichier ICML. Le fichier se place lié dans InDesign : après une correction du Markdown, on relance l'export et on met à jour le lien, la mise en page reste en place.

Le Markdown reste la source du texte. InDesign porte la mise en forme, par un jeu court de styles dont les noms sont fixés par l'export.

## Prérequis

- Pandoc installé, la commande `pandoc` accessible dans le PATH : `pandoc --version` répond par un numéro de version (installation : https://pandoc.org/installing.html).
- Les dépendances du dépôt installées (`pnpm install`).
- InDesign, pour la mise en page.

## 1. Lancer l'export

1. Depuis la racine du dépôt, lancer :

   ```bash
   pnpm run guides:icml
   ```

2. Lire le récapitulatif : une ligne `Écrit :` par fichier, puis le nombre de fichiers écrits.
3. Les fichiers sont rangés par guide, puis par page ou par chapitre. Ce dossier n'est pas suivi par git ; chaque export remplace les fichiers du précédent.

   ```text
   output/icml/
   ├── common/                        identiques pour les trois guides : à lier une seule fois
   │   ├── pied.icml                  texte unique des pieds de page (pages de droite et d'ouverture)
   │   ├── pied-gauche.icml           même texte, aligné à droite (pages de gauche)
   │   ├── en-tete-version.icml       version, en-tête de la page gauche
   │   ├── type-document.icml         pastille « type de document » de la couverture
   │   └── fin-mentions.icml          pied anthracite de la page de fin
   └── guide-partenaire/              un dossier par guide (partenaire, vendeur, administrateur)
       ├── 00-pages/                  pages de gabarit propres au guide
       │   ├── couverture.icml        titre, version, sommaire de la couverture
       │   ├── sommaire.icml          page de sommaire (page 2)
       │   ├── en-tete-titre.icml     titre du document, en-tête de la page gauche
       │   ├── fin-bandeau.icml       titre et accroche du bandeau de contact (page de fin)
       │   ├── fin-carte-1.icml       cartes de contact de la page de fin (1 à 3)
       │   └── fin-conseils.icml      deux colonnes de conseils de la page de fin
       ├── 01-vue-ensemble/           un dossier par chapitre, du nom du fichier Markdown
       │   ├── corps.icml             texte qui coule dans la colonne
       │   ├── ouverture-*.icml       cadres de l'ouverture de chapitre
       │   ├── en-tete-chapitre.icml  numéro du chapitre, en-tête de la page droite
       │   ├── en-tete-titre-chapitre.icml  titre du chapitre, en-tête de la page droite
       │   ├── marge-N.M-<titre>.icml colonne marginale, une par section
       │   └── renvoi-K-<début>.icml  notes de renvoi
       └── 02-import-catalogue/ …
   ```

   Exemple : `output/icml/guide-partenaire/02-import-catalogue/corps.icml`. `00-pages/` passe avant les chapitres dans l'ordre alphabétique, et dans chaque dossier de chapitre `corps.icml` précède les fichiers par cadre.
4. Passer la largeur de la colonne de texte du document, en points (360 par défaut), telle que la mesure InDesign : sélectionner le bloc de texte et lire sa largeur moins les marges intérieures, ou la largeur de colonne dans Objet > Options de bloc de texte. Cette largeur plafonne les captures et se répartit entre les colonnes de chaque tableau, chacune assez large pour son plus long mot. InDesign ne réduit ni une capture ancrée ni un tableau plus larges que leur bloc : ils débordent de la colonne. Une valeur trop grande, même de quelques points, suffit à les faire déborder. Pour une colonne de 260 pt :

   ```bash
   pnpm run guides:icml --largeur-colonne 260
   ```

   Garder la même valeur à chaque export, sinon les captures et les tableaux changent de taille à la mise à jour des liens.

Les captures ne sont pas copiées : chaque ICML pointe vers l'image du dépôt par son chemin absolu. Le dépôt doit rester au même emplacement sur le poste qui met en page.

## 2. Styles à créer

Les ICML n'emploient que les styles ci-dessous. Les créer une fois dans le document (ou le futur gabarit) sous ces noms exacts, casse et accents compris. Un style du document l'emporte sur la définition minimale portée par l'ICML : la mise en forme se règle donc dans InDesign, une seule fois. Les définitions de l'ICML ne fixent aucune police, graisse ou chasse : le gras, l'italique et la police du style « Code-inline » se règlent dans les styles du document, et l'ouverture d'un ICML ne demande aucune substitution de police.

| Style | Famille | Habille |
| ----- | ------- | ------- |
| « Surtitre » | paragraphe | mention « Chapitre » au-dessus du numéro, posée par l'export |
| « Numéro-chapitre » | paragraphe | numéro du chapitre, posé par l'export d'après le nom du fichier |
| « Titre-chapitre » | paragraphe | titre du chapitre |
| « Chapeau » | paragraphe | premier paragraphe du chapitre |
| « Intertitre-1 » | paragraphe | titre de section |
| « Intertitre-2 » | paragraphe | titre de sous-section |
| « Courant » | paragraphe | paragraphe courant |
| « Liste-num » | paragraphe | étape d'une procédure |
| « Liste-num-suite » | paragraphe | paragraphe qui prolonge une étape, sans numéro |
| « Liste-puce » | paragraphe | élément de liste |
| « Liste-puce-2 » | paragraphe | élément de liste à l'intérieur d'une étape |
| « Tableau texte » | paragraphe | cellule d'un tableau |
| « Tableau en-tête » | paragraphe | cellule d'en-tête d'un tableau |
| « Titre-couverture » | paragraphe | titre du document, dans `00-pages/couverture.icml` seulement |
| « Légende » | paragraphe | légende des pages de couverture et de fin, posée dans les cadres du gabarit |
| « Titre-courant » | paragraphe | texte unique des pieds de page et titres courants d'en-tête, dans `00-pages/`, `common/` et les dossiers de chapitre seulement |
| « Type-document » | paragraphe | pastille « type de document » de la couverture (anthracite, centrée), dans `common/type-document.icml` seulement |
| « Carte-valeur » | paragraphe | valeur d'une carte de contact de la page de fin, dans `00-pages/fin-carte-N.icml` seulement |
| « Mentions » | paragraphe | pied anthracite de la page de fin (couleur du papier), dans `common/fin-mentions.icml` seulement |
| « Mentions-marque » | paragraphe | phrase de marque du pied anthracite de la page de fin (couleur du papier, plus grande que « Mentions »), dans `common/fin-mentions.icml` seulement |
| « En-tête-chapitre » | paragraphe | numéro du chapitre dans l'en-tête de la page courante (couleur d'accent), dans le dossier du chapitre seulement |
| « Bandeau-titre » | paragraphe | titre du bandeau orange de la page de fin (couleur du papier), dans `00-pages/fin-bandeau.icml` seulement |
| « Bandeau-texte » | paragraphe | accroche du bandeau orange de la page de fin (couleur du papier), dans `00-pages/fin-bandeau.icml` seulement |
| « Capture » | paragraphe | paragraphe qui porte une capture d'écran ancrée |
| « Sommaire-général » | paragraphe | libellé « Sommaire » du sommaire général du guide (couverture), posé par l'export |
| « Sommaire-titre » | paragraphe | intitulé « Dans ce chapitre » du sommaire partiel d'un chapitre, posé par l'export |
| « Sommaire-ligne » | paragraphe | ligne du sommaire de la page de couverture : numéro, tabulation, titre |
| « Sommaire-chapitre » | paragraphe | ligne de la page de sommaire : numéro, tabulation, titre, tabulation à droite, « p. … » |
| « Sommaire-section » | paragraphe | section du sommaire d'ouverture : numéro, tabulation, titre, tabulation à droite, « p. … » |
| « Numéro-section » | paragraphe | numéro de section (« 2.1 »), rendu par l'export dans le fichier de marge de la section |
| « Encadré-info » | paragraphe | encadré « Bon à savoir » |
| « Encadré-attention » | paragraphe | encadré « Attention » |
| « Encadré-retenir » | paragraphe | encadré « À retenir » |
| « Note-renvoi » | paragraphe | note « Renvoi » vers un autre chapitre ou guide |
| « Gras » | caractère | libellé à repérer |
| « Italique » | caractère | mise en valeur |
| « Code-inline » | caractère | nom de champ, valeur saisie |
| « Renvoi » | caractère | texte d'un lien vers un autre chapitre ou guide |
| « Accent » | caractère | mot du titre mis en couleur d'axe (écrit `*mot*` dans le Markdown) |
| « Encadré-libellé » | caractère | libellé en capitales d'un encadré (« Bon à savoir »…) |
| « Sommaire-numéro » | caractère | numéro de section du sommaire d'ouverture (gros, penché, couleur d'axe) |
| « Sommaire-page » | caractère | « p. … » du sommaire d'ouverture, à remplacer par la page |
| « Puce » | caractère | triangle ▶ devant « Dans ce chapitre » |
| « Tableau » | tableau | tableau |
| « Cellule » | cellule | cellule de tableau |
| « Capture » | objet | cadre d'une capture d'écran ancrée |

« Capture » existe deux fois, en paragraphe et en objet : le style de paragraphe règle l'espace autour de l'image, le style d'objet règle son cadre.

Les noms « Surtitre », « Numéro-chapitre », « Titre-chapitre », « Chapeau », « Intertitre-1 », « Intertitre-2 », « Courant », « Liste-num », « Liste-puce » et « Code-inline » sont ceux de la feuille de styles de la charte (`Scriptami — Charte de mise en page des documentations PDF.md`, section « Feuille de styles »), dont la mise en forme (polices Quicksand et Proza Libre, corps, interlignage, couleurs) se règle dans InDesign. Les autres styles n'ont pas d'équivalent dans la charte : « Liste-num-suite » et « Liste-puce-2 » prolongent les listes, « Tableau texte », « Tableau en-tête », « Capture », « Gras », « Italique » et « Renvoi » couvrent ce que les guides emploient en plus. L'ouverture de chapitre (surtitre « Chapitre », numéro lu dans le préfixe `0N-` du nom de fichier, titre, chapeau, sommaire) ne figure pas dans l'ICML du chapitre : l'export la rend à part, un fichier par cadre (section 2 ter). « Titre-couverture » et « Légende » ne servent qu'aux pages de couverture et de fin, « Bandeau-titre », « Bandeau-texte » et « Mentions » qu'à la page de fin (en couleur papier, que l'ICML ne peut pas poser lui-même), « En-tête-chapitre » (couleur d'accent) qu'à l'en-tête de la page droite et « Titre-courant » aux pieds de page et aux titres courants d'en-tête (section 3 bis) ; seul le folio reste au gabarit, posé à la main.

Document déjà mis en page avec les anciens noms (« Titre 1 », « Corps », « Liste numérotée », « Liste à puces », « Code »…) : renommer chaque style dans le panneau Styles (double-clic, champ « Nom du style ») au lieu d'en créer de nouveaux. La mise en forme est conservée, et l'ICML retrouve ses styles par leur nom à la mise à jour des liens. Un style non renommé serait recréé en doublon par l'import.

Listes : l'ICML définit un retrait suspendu (retrait à gauche 18 pt et retrait de première ligne -18 pt pour « Liste-num », 14 et -14 pour « Liste-puce »), de sorte que la tabulation qui suit le numéro ou la puce s'arrête au texte et que les lignes suivantes s'alignent dessus. Un style déjà présent dans le document garde sa définition : pour corriger des listes déjà placées, régler ces deux retraits dans les options du style (rubrique « Retraits et espacement »), puis la position dans « Puces et numérotation ». « Liste-num-suite » prend le même retrait gauche que « Liste-num », « Liste-puce-2 » la somme des deux retraits.


## 2 bis. Conventions Markdown de mise en page

L'export reconnaît quelques conventions dans le Markdown des guides pour reproduire la présentation de la charte :

1. Encadré : une citation dont le premier mot est un libellé en gras. `> **Bon à savoir** texte` donne « Encadré-info », `> **Attention** …` « Encadré-attention », `> **À retenir** …` « Encadré-retenir », `> **Renvoi** …` « Note-renvoi ». Les paragraphes suivants de la même citation gardent le style. Une citation sans libellé, ou au libellé inconnu, fait échouer l'export.
2. Mot en couleur dans un titre : `# Monter un *hub* auto-hébergé` applique le style de caractère « Accent » à « hub ». Ailleurs que dans un titre, `*mot*` reste de l'italique.
3. Sommaire : un chapitre d'au moins deux sections reçoit un bloc « Dans ce chapitre » (« Sommaire-titre » avec le triangle en « Puce », puis un « Sommaire-section » par section : numéro en « Sommaire-numéro », titre, « p. … » en « Sommaire-page »), rendu dans `ouverture-sommaire.icml`. Les numéros de page viennent de la clé `pages` de `pages-gabarit.json` (section 3 bis) ; sans elle, « p. … » reste à remplacer, par exemple par une table des matières InDesign.
4. Numéro de section : chaque intertitre de niveau 1 reçoit un fichier de marge `marge-N.M-<titre>.icml` (« Numéro-section » « 2.1 », puis la rubrique en « Surtitre »).
5. Note de renvoi : une citation `> **Renvoi** …` quitte le corps du chapitre et va dans son propre fichier `renvoi-K-<début du texte>.icml`.
6. Typographie française : l'export remplace l'apostrophe droite par `’`, pose une espace insécable avant `:`, `%`, `»` et après `«`, et une fine insécable avant `;`, `!`, `?`. Le texte du style « Code-inline » reste tel quel. Rien à saisir dans le Markdown ni à corriger dans InDesign.

## 2 ter. Fichiers par cadre

Le corps du chapitre (`<chapitre>/corps.icml`) ne contient que le texte qui coule dans la colonne. Le texte que la mise en page place dans ses propres cadres est rendu à part, un fichier par cadre, dans le même dossier `output/icml/<guide>/<chapitre>/`. Le retirer à la main du corps ferait perdre le lien à la mise à jour : c'est l'export qui le sépare, à chaque fois.

| Fichier | Contenu | Cadre du modèle IDML |
| ------- | ------- | -------------------- |
| `ouverture-surtitre.icml` | « Chapitre » | `chapitre-surtitre` |
| `ouverture-numero.icml` | numéro du chapitre sur deux chiffres (« 03 ») | `chapitre-numero` |
| `ouverture-titre.icml` | titre du chapitre | `chapitre-titre` |
| `ouverture-chapeau.icml` | premier paragraphe du chapitre, en « Chapeau » | `chapitre-chapeau` |
| `ouverture-sommaire.icml` | bloc « Dans ce chapitre » (absent sous deux sections) | `chapitre-sommaire` |
| `marge-N.M-<titre>.icml` | numéro et rubrique de la section N.M (ex. `marge-1.2-se-connecter.icml`) | `marginale-…` de la page courante |
| `renvoi-K-<début du texte>.icml` | K-ième note de renvoi du chapitre (les notes consécutives sont réunies) | `renvoi-…` de la page courante |

Les fichiers `ouverture-*` se placent une fois, sur la page d'ouverture du chapitre (gabarit B). Les fichiers `marge-N.M` et `renvoi-K` vont chacun dans le cadre de la colonne marginale, en regard du paragraphe qu'ils accompagnent : ce choix de page reste manuel, mais le lien suit les mises à jour.

Pour savoir où poser `marge-N.M-<titre>` : le titre dans le nom est celui de l'intertitre de la section dans le corps (le N.M-ième intertitre de niveau 1 du chapitre). Aligner le haut du cadre de marge sur le haut de cet intertitre. Le nom d'un fichier de marge change quand le titre de la section change : l'export liste l'ancien nom comme orphelin, et le bloc InDesign est à relier au nouveau fichier (Liens > Relier à).

## 3. Placer un chapitre

Un chapitre = un fichier ICML de corps = un bloc de texte (ou une suite de blocs chaînés). Les textes d'ouverture, de marge et de renvoi se placent à part, un fichier par cadre (section 2 ter).

1. Dans InDesign, ouvrir le document de mise en page.
2. Choisir Fichier > Importer, puis sélectionner l'ICML du chapitre sous `output/icml/<guide>/`.
3. Sélectionner le bloc de texte qui doit recevoir le chapitre avec l'outil de sélection, et cocher « Remplacer l'élément sélectionné » dans la fenêtre d'import : le texte du bloc est remplacé en entier, sans avoir à le vider. Sans cette case, un clic dans un bloc déjà rempli insère le chapitre au point de clic et s'ajoute à l'existant. À défaut de bloc, en tracer un.
4. Ouvrir le panneau Fenêtre > Liens : le chapitre y figure, avec ses captures. Aucune ligne ne doit porter l'icône de lien manquant.
5. Répéter pour chaque chapitre, dans l'ordre des numéros. L'export désactive l'alignement optique des marges dans chaque ICML, comme le modèle IDML (Pandoc l'active : le texte déborde alors du cadre et paraît gras et collé au bord). Une histoire importée avant ce réglage se corrige en plaçant le curseur dans le texte, puis Texte > Article (panneau « Article »), case « Alignement optique des marges » décochée.
6. Pour chaque fichier du dossier `<chapitre>/`, sélectionner le cadre de destination (tableau de la section 2 ter) avec l'outil de sélection, puis Fichier > Importer en cochant « Remplacer l'élément sélectionné ». Dans un modèle généré avec `--guide`, les cadres existent déjà sur les pages d'exemple : leur texte d'exemple est remplacé, il n'y a rien à vider.

## 3 bis. Placer la couverture, le sommaire et la fin

Chaque guide reçoit sept ICML en plus de ses chapitres, dans `00-pages/` : `couverture.icml`, `sommaire.icml`, `en-tete-titre.icml`, `fin-bandeau.icml`, `fin-carte-1.icml` à `fin-carte-3.icml` et `fin-conseils.icml`. Cinq autres sont identiques pour les trois guides et ne sont écrits qu'une fois, dans `output/icml/common/` : `pied.icml`, `pied-gauche.icml`, `en-tete-version.icml`, `type-document.icml` et `fin-mentions.icml`. Un document lie ces cinq fichiers à `common/` : une correction du texte commun (pied, mentions légales) se fait dans `pages-gabarit.json` (clé `commun`) et se propage aux trois guides au prochain export. Un `00-pages/pied.icml` ou `00-pages/fin-mentions.icml` d'un export antérieur reste sur le disque et est signalé comme orphelin : repointer le lien vers `common/`, puis supprimer l'ancien fichier. Ils portent le texte des pages de gabarit, mis à jour à chaque export comme les chapitres. Un ICML ne porte ni fond ni forme : ils restent dans les gabarits (section 7). Chaque fichier va dans son propre cadre : la couverture et le sommaire n'ont pas les mêmes styles et ne se partagent jamais un cadre.

| Fichier | Contenu | Cadre | Source |
| ------- | ------- | ----- | ------ |
| `00-pages/couverture.icml` | titre du document, « Version x.y.z », sommaire de la couverture (« Sommaire-général », « Sommaire-ligne ») | `texte-couverture` (gabarit C) | premier titre de chaque chapitre ; version de `package.json` |
| `00-pages/sommaire.icml` | page de sommaire : « Sommaire » en « Surtitre », puis une ligne « Sommaire-chapitre » par chapitre (numéro, titre, « p. … ») | `sommaire` (page 2) | premier titre de chaque chapitre |
| `common/pied.icml` | le texte unique des pieds de page (« François-Xavier Guillois · scriptami », le même pour les trois guides), en « Titre-courant », aligné à gauche | `pied-droite` (gabarit A), `pied-titre` (gabarit B) | `commun.pied` dans `aidd_docs/guides/pages-gabarit.json` |
| `common/pied-gauche.icml` | le même texte et le même style, aligné à droite contre la marge intérieure : l'import écrase l'alignement du cadre, d'où un fichier à part | `pied-gauche` (gabarit A) | idem |
| `00-pages/en-tete-titre.icml` | puce et titre du document (celui de la couverture), en « Titre-courant » | `en-tete-gauche-titre` (gabarit A) | premier titre du premier chapitre |
| `common/en-tete-version.icml` | « v » et la version, en « Titre-courant », aligné à droite | `en-tete-gauche-version` (gabarit A) | version de `package.json` |
| `<chapitre>/en-tete-chapitre.icml` | « Chapitre NN » en « En-tête-chapitre » (couleur d'accent) | `en-tete-droite-chapitre` (gabarit A) | numéro lu dans le préfixe `0N-` du fichier |
| `<chapitre>/en-tete-titre-chapitre.icml` | titre du chapitre puis puce, en « Titre-courant », aligné à droite | `en-tete-droite-titre` (gabarit A) | premier titre du chapitre |
| `00-pages/fin-bandeau.icml` | titre (« Bandeau-titre ») puis accroche (« Bandeau-texte ») du bandeau orange de contact, en couleur papier | `bandeau-texte` (gabarit D) | `fin.titre` et `fin.accroche` dans `aidd_docs/guides/pages-gabarit.json` |
| `00-pages/fin-carte-1.icml` à `fin-carte-3.icml` | une carte de contact : libellé (« Surtitre »), valeur (« Carte-valeur »), note (« Légende ») | `carte-1-texte` à `carte-3-texte` (gabarit D) | `fin.cartes` dans `aidd_docs/guides/pages-gabarit.json`, coordonnées à renseigner à la main |
| `common/type-document.icml` | « Documentation utilisateur » en « Type-document » (anthracite, centré) | `type-document` (gabarit C) | texte fixe, identique pour les trois guides (`COVER_TYPE`, `scripts/guides/icml-pages.js`) |
| `common/fin-mentions.icml` | pied anthracite : phrase de marque en « Mentions-marque » (plus grande, espace après), puis une ligne « Mentions » par donnée des mentions légales (séparées par « · » dans le JSON), couleur papier | `pied-texte` (gabarit D) | `commun.mentions` dans `aidd_docs/guides/pages-gabarit.json`, à renseigner à la main |
| `00-pages/fin-conseils.icml` | deux colonnes de conseils propres au guide, sans césure (attribut posé sur chaque paragraphe, le style « Courant » garde la sienne) | `conseils-fin` (gabarit D) | `fin.colonnes` dans `aidd_docs/guides/pages-gabarit.json`, à tenir à jour à la main |

1. Appliquer le gabarit C à la page de couverture, une page courante à la page 2, puis le gabarit D à la dernière page.
2. Sur chaque page de gabarit, dégager le cadre : « texte-couverture » (C) ou « bandeau-texte », « carte-1-texte » à « carte-3-texte » et « conseils-fin » (D). Un élément de gabarit ne se sélectionne pas tel quel sur la page : Ctrl+Maj+clic le surcharge, ce qui le rend modifiable. Le cadre « sommaire » de la page 2 est un cadre de page, à sélectionner directement.
3. Sélectionner le cadre avec l'outil de sélection, puis Fichier > Importer en cochant « Remplacer l'élément sélectionné », et choisir le fichier qui lui correspond, dans `00-pages/` (`couverture.icml`, `sommaire.icml`, `en-tete-titre.icml`, `fin-bandeau.icml`, `fin-carte-N.icml` ou `fin-conseils.icml`) ou dans `common/` (`type-document.icml`, `pied.icml`, `pied-gauche.icml`, `en-tete-version.icml` ou `fin-mentions.icml`), et pour chaque chapitre `en-tete-chapitre.icml` et `en-tete-titre-chapitre.icml`). Pour le pied, importer `common/pied.icml` dans chacun des trois cadres de pied du gabarit (Ctrl+Maj+clic pour les dégager), en remplaçant le texte saisi à la main. Dans un modèle généré avec `--guide`, les trois cadres portent déjà le même texte : le lien n'est utile que pour les suivre à l'export. Le texte remplace les repères et prend les styles du jeu court. Dans un modèle généré avec `--guide`, la couverture, le sommaire et la fin sont déjà remplis : ne pas les importer, le titre, la version et le sommaire seraient en double.
4. Pour la mise à jour, procéder comme pour un chapitre (section 4) : le lien suit l'export.

Pour changer le sous-titre, le texte du pied, le contact ou les conseils d'un guide, modifier `aidd_docs/guides/pages-gabarit.json`, puis relancer l'export. Le fichier porte une entrée par dossier de guide (`guide-partenaire`, `guide-vendeur`, `guide-administrateur`) :

| Clé | Contenu |
| --- | ------- |
| `sousTitre` | phrase de la couverture, sous le titre |
| `pages` | facultatif : numéros de page du sommaire, `"N"` (chapitre) ou `"N.M"` (section) vers un entier ≥ 1 ; relevés sur le PDF exporté, à relever à nouveau après tout changement de mise en page. Une entrée absente reste « p. … » |
| `fin.titre`, `fin.accroche` | titre et phrase du bandeau de contact de la page de fin |
| `fin.cartes` | exactement trois cartes `{ label, valeur, note }`, toutes renseignées |
| `fin.colonnes` | exactement deux colonnes `{ titre, lignes }` de conseils, lignes non vides |

La page de fin répond à ce que chaque lecteur cherche : le client (partenaire) y trouve son interlocuteur technique, le vendeur son responsable de showroom, l'administrateur le moyen de joindre l'éditeur. Les coordonnées du client et du vendeur sont encore « À renseigner » dans le fichier : les compléter avant de diffuser ces guides. `sousTitre`, titres, accroches et conseils sont des propositions à relire.

## 3 ter. Composer un guide entier (`pdf compose`)

`pdf compose --guide <id> [--remplacer] [--sortie <fichier.indd>]` place tous les chapitres dans une copie du modèle IDML, enregistre le `.indd` et exporte le PDF à côté. InDesign doit être fermé ; un `.indd` existant n'est remplacé qu'avec `--remplacer` (copie `<nom>.avant-<horodatage>.indd` faite avant).

Ce que la commande fait seule :

- ouverture de chaque chapitre à la suite du précédent, sans page blanche : à droite ou à gauche selon la parité (à gauche, le corps commence sur une page de droite ; le cas est signalé dans le rapport) ;
- cadres des pages dupliquées replacés sur la géométrie du premier jeu de pages ;
- titre et sommaire d'ouverture : cadre agrandi, puis texte réduit (jusqu'à 60 %) tant qu'il déborde, la réduction étant signalée ;
- en-têtes de droite (numéro et titre du chapitre) et de gauche (titre du guide, version) ;
- corps chaîné sur autant de pages que nécessaire.

Ce qu'elle laisse à la main : colonne marginale et renvois (cadres vidés), numéros de page du sommaire (clé `pages` de `pages-gabarit.json`). Les lignes `A CONTROLER` du rapport listent les débordements et les réductions de texte.

## 4. Mettre à jour après une modification des guides

1. Corriger le chapitre dans le Markdown, sous `aidd_docs/guides/<guide>/`.
2. Relancer `pnpm run guides:icml`.
3. Dans le panneau Liens, sélectionner les chapitres et les fichiers par cadre signalés modifiés, puis les mettre à jour : bouton « Mettre à jour le lien » en bas du panneau, ou double-clic sur l'icône d'alerte de modification.
4. Contrôler les pages touchées : le texte et les captures suivent, les styles et les blocs restent en place.

Toute correction de texte se fait dans le Markdown. Une retouche faite directement dans InDesign sur un chapitre lié disparaît à la mise à jour suivante. Ce qui relève de la mise en forme se règle par les styles du document, qui survivent aux mises à jour.

## 5. Chapitre renommé ou supprimé

Le dossier du chapitre suit le nom du fichier Markdown. Après un renommage, l'export écrit le nouveau dossier (corps et fichiers par cadre) et liste l'ancien sous « ICML sans chapitre correspondant, conservés ». Il liste de même un fichier par cadre qui n'existe plus, par exemple `marge-2.5-ancien-titre.icml` quand le chapitre a perdu une section.

1. Dans le panneau Liens, sélectionner l'ancien chapitre, puis choisir Rééditer le lien... dans son menu contextuel (clic droit).
2. Désigner le nouvel ICML sous `output/icml/<guide>/`.
3. Supprimer l'ancien fichier ICML que le récapitulatif signalait.
4. Relancer `pnpm run guides:icml` : le récapitulatif ne liste plus aucun fichier orphelin.

## 6. Quand l'export échoue

L'export vérifie tous les chapitres avant d'écrire : en cas d'erreur, il affiche « Aucun fichier écrit. » et les ICML du dernier export réussi restent en place. Le message nomme le chapitre en cause.

1. « Styles Pandoc sans correspondance dans le jeu court » : le chapitre emploie une construction Markdown que le jeu de styles ne couvre pas (citation, liste à trois niveaux, bloc de code…). Soit simplifier le Markdown, soit ajouter la correspondance à `STYLE_TABLE` dans `scripts/guides/icml-transform.js`, puis ajouter le style au tableau de la section 2 de ce runbook et au document InDesign.
2. « Page de fin » ou « Couverture » : le fichier `aidd_docs/guides/pages-gabarit.json` est illisible, n'a pas d'entrée pour le guide, ou une valeur est vide ou mal formée (sous-titre, titre ou accroche de fin, nombre de cartes ou de colonnes, ligne vide) ; le message nomme le guide et la valeur.
3. « image introuvable » : corriger le chemin de l'image dans le chapitre (il est relatif au dossier du chapitre), ou ajouter l'image manquante.
4. « Pandoc est introuvable » : installer Pandoc (voir Prérequis), rouvrir le terminal, puis relancer.
5. Relancer `pnpm run guides:icml` jusqu'au récapitulatif sans erreur.

## 7. Charger la charte dans InDesign (modèle IDML)

La commande `pnpm run guides:idml` écrit `output/idml/scriptami-<axe>.idml`, un modèle qui porte la charte (`Scriptami — Charte de mise en page des documentations PDF.md`) : les styles de la section 2 et les styles de la charte que l'export n'emploie pas (couverture, numéro de chapitre, surtitre, chapeau, légende, code, titre courant, folio), avec polices, corps, interlignage, approche, couleurs et retraits suspendus ; le nuancier ; un document A4 en pages en vis-à-vis, aux marges de la grille, avec 3 mm de fond perdu. Les noms sont ceux des ICML : aucun doublon à l'import.

Ce modèle n'a pas encore été ouvert dans InDesign. S'il est refusé ou s'il s'ouvre incomplet, le dire avec le message affiché : le générateur est à corriger, pas le poste.

### Préparer le poste

1. Installer les polices : Quicksand (Bold, Medium, SemiBold), Proza Libre (Regular, Italic, Bold) et JetBrains Mono (Regular). Une police absente s'affiche en rose, comme à la section 2.
2. Le triangle ▶ des puces n'existe ni dans Quicksand ni dans Proza Libre : le style de caractère « Puce » prend la police « Segoe UI Symbol » (Windows). Sur un autre poste, ou pour une autre police qui porte le triangle : `pnpm run guides:idml --police-puce "<police>"`. Sans elle, InDesign affiche un carré surligné en rose à la place de la puce.
3. Quicksand n'a pas d'italique : le numéro de chapitre et le style « Accent » sont inclinés de 12° par le style, pas par la police.

### Générer le modèle

1. Choisir la couleur d'axe de la charte : `turquoise` (par défaut), `orange` ou `vert`. Les nuances « Axe vif », « Axe texte » et « Axe fond » prennent ses valeurs, et les styles qui les emploient suivent.

   ```bash
   pnpm run guides:idml
   pnpm run guides:idml --axe orange
   ```

2. Ajouter `--gabarits` pour créer aussi les quatre gabarits de la charte, sur le modèle des maquettes :
   - « A-Courante » (page gauche et page droite) : titres courants en variables de texte, pointillé orange sous chaque titre courant, pied « scriptami.com », coin plié côté extérieur, bordé d'un pointillé de pliage de la couleur du coin (« Axe vif », tirets de 1,5 pt séparés de 1,5 pt, dessinés comme segments d’un tracé composé (InDesign ignore les styles de contour d’un IDML ; le pli se règle donc en retouchant le tracé, non le panneau Contour), 0,75 pt, le même trait que sous le titre courant) qui sépare la zone de pied de page, folio en couleur du papier (blanc) centré dans le rabat. À appliquer aux pages de contenu.
   - « B-Chapitre » (page simple) : fond d'ouverture à bord incliné, pli, triangles de flanc, folio, même pointillé orange de pliage que A-Courante au-dessus du pied. À appliquer à la première page de chaque chapitre.
   - « C-Couverture » (page simple) : (le filet de pied est le même pointillé orange que le pli de A-Courante) bandeau d'axe, mot « SCRIPTAMI » en tracé vectoriel dans la police du logo (anthracite, sans le picto : ses couleurs se mêlaient au fond), verbe, puis un cadre « texte-couverture » (titre, version, sommaire). À appliquer à la couverture ; le texte du cadre vient de `00-pages/couverture.icml` (section 3 bis).
   - « D-Fin » (page simple) : bandeau de contact, trois cartes, pied anthracite portant le picto du logo seul (trois facettes, sans texte) à gauche des mentions, puis un filet et un cadre « conseils-fin » à deux colonnes (`00-pages/fin-conseils.icml` impose le saut de colonne avant la seconde). À appliquer à la dernière page ; le texte du cadre vient de `00-pages/fin-conseils.icml`, celui du bandeau (un cadre « bandeau-texte » : titre et accroche) de `fin-bandeau.icml` et celui de chaque carte (« carte-N-texte ») de `fin-carte-N.icml` (section 3 bis). Sans `--guide`, le bandeau et les cartes sont des repères « À renseigner » à éditer dans le gabarit ; avec `--guide`, ils portent le contact du guide (voir `pages-gabarit.json`, section 3 bis). Les textes du pied restent des repères à éditer.

   Les gabarits A et B portent aussi des repères de règle (cyan) pour poser des cadres de texte aux bons endroits, sans surcharger d'élément de gabarit : sur A, trois repères horizontaux (haut du corps, bas du bloc « numéro de section + rubrique » sous lequel se glisse une note de renvoi, bas du corps), les côtés étant donnés par les colonnes du gabarit ; sur B, un repère par bord des cinq zones de l'ouverture de chapitre (surtitre, numéro, titre, chapeau, « Dans ce chapitre »), identiques aux cadres de la page d'exemple. Ils sont visibles sur toute page qui applique le gabarit (Affichage > Grilles et repères > Repères).

   Les variables « Titre du document », « Version » et « Chapitre » se renseignent dans Texte > Variables de texte > Définir. Un gabarit ne s'applique pas tout seul : le glisser sur la page dans le panneau Pages (ou Appliquer le gabarit aux pages).

   ```bash
   pnpm run guides:idml --gabarits
   ```

3. Ajouter `--guide partenaire` (ou `vendeur`, `administrateur`) pour obtenir en plus huit pages d'exemple remplies avec le texte de ce guide, qui montrent les gabarits en situation (l'ouverture de chapitre reprend les zones de la maquette : surtitre, numéro, titre dont le dernier mot est en « Accent », chapeau et bloc « Dans ce chapitre » en cadres séparés). Cette option implique `--gabarits` ; le fichier s'appelle `scriptami-<axe>-<guide>.idml`.

   | Page | Gabarit | Contenu |
   | ---- | ------- | ------- |
   | 1 | C-Couverture | rectangle du type de document, titre du guide, version, trois aplats d'axe, triangle, signature |
   | 2 (gauche) | A-Courante | sommaire seul : libellé « Sommaire », une ligne par chapitre (numéro, titre, « p. … »), sans encadré de couleur ; son texte vient de `00-pages/sommaire.icml` |
   | 3 (droite) | B-Chapitre | ouverture du premier chapitre : surtitre, numéro, titre (qui alimente le titre courant des pages suivantes) et chapeau |
   | 4 à 7 | A-Courante | texte courant d'exemple : intertitres, paragraphes, listes à puces et numérotées, encadrés (info, attention, à retenir), note de renvoi ; sert à contrôler les en-têtes, le folio et le pied de page. La colonne marginale (guides de colonne du gabarit) reçoit un cadre par élément, à la hauteur de son contenu : numéro de section et rubrique en tête, note de renvoi à une position d'exemple. Chaque note se glisse en regard du paragraphe qu'elle commente |
   | 8 | D-Fin | contact du guide (bandeau et trois cartes) et deux colonnes de conseils de `pages-gabarit.json` |

   Les numéros de page du sommaire sont l'espace réservé « p. … » : les renseigner à la main, ou remplacer ces lignes par une table des matières InDesign (Mise en page > Table des matières) une fois les chapitres placés. La page 8 tombe à gauche d'une double page : si elle doit rester une page simple, désactiver « Pages en vis-à-vis » pour la dernière planche.

   ```bash
   pnpm run guides:idml --guide partenaire
   pnpm run guides:idml --guide vendeur
   pnpm run guides:idml --guide administrateur
   ```

   Sans `--axe`, chaque guide prend l'axe de son verbe dans la charte (`GUIDE_AXES`) : partenaire en turquoise (« Consolider »), vendeur en orange (« Débloquer »), administrateur en vert (« Maîtriser »). Cela donne trois fichiers : `scriptami-turquoise-partenaire.idml`, `scriptami-orange-vendeur.idml` et `scriptami-vert-administrateur.idml`.

### Utiliser le modèle

1. Nouveau document : ouvrir le fichier IDML (Fichier > Ouvrir), puis l'enregistrer en modèle (`.indt`) ou en document.
2. Document existant : panneau Styles de paragraphe > menu > Charger les styles de paragraphe, et de même pour les styles de caractère, de tableau, de cellule et d'objet, puis choisir le fichier IDML. En cas de conflit, choisir « Utiliser la définition entrante » : c'est ce qui applique la charte aux styles de même nom.
3. Vérifier dans le panneau Styles que « Titre-chapitre » est bien à 34 pt Quicksand Bold, comme le règle le modèle : un style déjà présent dans le document garde sa définition si le conflit n'est pas résolu par « Utiliser la définition entrante ». Une zone rose sur un numéro de liste ou un titre signale une police absente.
4. Placer ensuite les chapitres ICML (section 3) : ils retrouvent leurs styles par leur nom.

### Ce que le modèle ne contient pas

- Images : à poser à la main. Le logo est dessiné par le générateur (`scripts/guides/logo-scriptami.js`, tracés tirés de `LOGO SCRIPTAMI.svg`) : mot en tracé composé sur la couverture, picto en trois facettes sur la page de fin, avec les dégradés verticaux et l'opacité de 88 % du SVG d'origine. Les ombrages du SVG (noir à 18 %), qu'un dégradé IDML ne sait pas rendre (pas d'opacité par point d'arrêt), sont incorporés aux couleurs des points d'arrêt : le rendu est proche, pas identique au pixel. Le nuancier reçoit trois dégradés (« Picto orange », « Picto jaune », « Picto turquoise ») et leurs nuances de points d'arrêt (« Picto orange 01 », etc.) : les ignorer, ou les supprimer avec le picto. Hypothèse non vérifiée dans InDesign : l'angle de dégradé (`GradientFillAngle`, 90° = du bas vers le haut) ; si un dégradé apparaît inversé, le retourner depuis le panneau Dégradé. Largeur du mot : `coverBoxes().logo` ; hauteur du picto : `PICTO_HEIGHT`, dans `build-idml-template.js`. Pour un logo exact, remplacer ces formes par le fichier SVG ou AI placé à la main.
- La barre latérale des encadrés : ils n'ont qu'un fond et un libellé. Le numéro de section en marge vient du fichier `marge-N.M-<titre>.icml` (section 2 ter).
- Les textes du pied de page des gabarits : à éditer dans les gabarits, ils ne changent pas d'un guide à l'autre. Avec `--guide`, le sous-titre de la couverture et le contact de la fin viennent de `pages-gabarit.json`, et le verbe de la couverture suit le guide (partenaire : « Consolider · Guide du client », vendeur : « Débloquer · Guide du vendeur », administrateur : « Maîtriser · Guide de l’administrateur » ; `GUIDE_VERBS` et `GUIDE_LABELS`, le client étant le « partenaire » du code) ; sans `--guide`, le gabarit garde « Maîtriser ». Le triangle et le texte du verbe suivent l'axe choisi par `--axe` (teintes « Axe vif » et « Axe texte »), comme le reste du document. Les trois lignes de signature du bandeau (« consolider · guide du client », « débloquer · guide du vendeur », « maîtriser · guide de l’administrateur ») présentent les trois guides existants et sont identiques dans les trois documents : aucune n'est mise en avant, le verbe du document figure déjà sur la ligne de surtitre. Le verbe de chaque ligne est en gras, la teinte d'axe n'y serait pas toujours lisible sur l'aplat de couleur fixe du bandeau.
- Les styles « Tableau texte » (10 pt) et « Tableau en-tête » (Quicksand Bold 10 pt) ne figurent pas dans la charte : leur mise en forme est un choix du générateur, à ajuster dans `FORMATS`, `scripts/guides/build-idml-template.js`.
