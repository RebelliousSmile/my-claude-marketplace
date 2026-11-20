# doc-pdf : des maquettes séparées du moteur, pour Scriptami et pour les gammes de jeu

Brainstorm du 2026-11-20, mené depuis le projet cerascan, où la méthode Markdown → ICML → IDML → InDesign → PDF a été mise au point.

L'auteur produit deux sortes de documents à partir de Markdown : des guides pour ses clients pro et des ouvrages de jeu pour ses gammes. Aujourd'hui `doc-pdf` ne sait faire qu'une maquette, Scriptami, et elle est écrite dans son code (`build-idml-template.js`, `compose-guide.jsx`, `STYLE_TABLE` d'`icml-transform.js`). La méthode rodée sur cerascan est dispersée : runbook encore rédigé pour cerascan, lancement d'InDesign par des scripts temporaires. Le but : faire de `doc-pdf` un moteur qui lit une maquette décrite ailleurs, avec Scriptami comme première maquette et une maquette par gamme, et créer une nouvelle maquette en suivant une méthode écrite une fois, sans réapprendre la méthode ni refaire les calages.

Trois limites : les guides cerascan doivent sortir identiques après l'extraction, les sources restent en Markdown, InDesign reste l'outil de composition.

## Ce qui est clair

- **Le contenu d'une maquette.** Une maquette est un dossier autonome qui porte un numéro de format. Il contient :
  - la grille, le nuancier et les polices ;
  - les gabarits et les noms de leurs cadres ;
  - la correspondance entre les styles Markdown et les styles InDesign ;
  - le rendu des callouts et des blocs Obsidian ;
  - le logo et les autres ressources ;
  - les réglages d'export.

  Le moteur refuse une maquette dont il ne connaît pas le format.
- **Ce qui reste dans `doc-pdf`.** Le plugin ne garde que le moteur et un squelette de maquette neutre, sans marque. Ce squelette sert aux tests du plugin et de point de départ à toute nouvelle maquette.
- **Scriptami part dans un dépôt dédié.** Il emporte la charte `.md` et le PDF des gabarits, aujourd'hui rangés dans `cerascan/aidd_docs/guides/`. Il emporte aussi le pied de page et les mentions légales, communs à tous les guides pro (bloc `commun` de `pages-gabarit.json`). Sa palette y reste une copie des jetons du site (`Code/Perso/scriptami/wp-2026/design/tokens.json` : `#34B89A`, `#E89B3C`, `#90C472`, `#2A2A2C`, Quicksand) ; c'est un choix assumé. Les projets pro désignent ce dépôt dans leur configuration.
- **La preuve de l'extraction.** Les guides cerascan ressortent identiques avant et après : les ICML octet pour octet, les modèles et les PDF par comparaison.
- **La maquette d'une gamme.** Elle vit dans le dépôt `schema-*` de la gamme, qui contient toutes les informations ludiques et graphiques de la gamme. Elle est rangée à côté du `pack.json`, dont elle reprend les polices, les couleurs et la liste des callouts. Elle ajoute ce que le pack n'a pas : format de page, grille, marges, gabarits et tailles en points.
- **La diffusion.** Les ouvrages de jeu sont vendus en PDF dans la boutique de téléchargements de l'auteur. Les guides sont livrés en PDF écran. Aucun imprimeur n'est prévu pour l'instant. Chaque maquette garde son propre réglage d'export, pour qu'un export imprimeur puisse s'ajouter plus tard sans toucher au moteur.
- **Les sources.** Elles restent en Markdown. Les callouts Obsidian `[!alias|modificateur]` et les modèles de blocs sont rendus comme la maquette l'indique.
- **Deux procédures.** La skill actuelle produit un document avec une maquette existante. Une skill `doc-pdf:maquette` conduit la création ou le recalage d'une maquette en trois temps :
  - le modèle IDML avec des pages d'exemple et tous les ICML ;
  - le calage ;
  - le passage en production.
- **La méthode est écrite une seule fois, dans le plugin.** Le runbook InDesign, encore rédigé pour cerascan, est réécrit en termes génériques. Aucun runbook n'est généré par projet : l'idée d'une skill `doc-pdf:runbook` est écartée.
- **Le lancement d'InDesign entre dans le plugin.** Il passe par une tâche planifiée en mode administrateur. L'agent compose lui-même, sans qu'un terminal administrateur soit ouvert à la main.

## Encore ouvert

- **Le rendu des blocs.** La façon de rendre les fiches PJ, PNJ et monstre dans InDesign se décidera avec la première gamme, supposée être Adrenaline (`schema-adrenaline/handbook/adrenaline/` : huit callouts et trois blocs déjà décrits).
- **Les polices.** InDesign a besoin de polices OTF ou TTF installées, alors que les dépôts `schema-*` n'ont que du `woff2`. Il faudra les fichiers d'origine, et vérifier que les licences autorisent l'incorporation dans un PDF vendu.
- **Les attentes d'un PDF vendu.** On suppose qu'un acheteur attend des signets, un sommaire cliquable et un fichier de poids raisonnable. Ce que produit le moteur aujourd'hui sur ces trois points n'a pas été vérifié ; à contrôler sur le premier ouvrage.
- **L'impression.** Elle est écartée pour l'instant. Si elle arrive, il faudra ajouter à la maquette de la gamme le fond perdu, les traits de coupe, les couleurs CMJN et un export PDF/X, avec le profil couleur de l'imprimeur retenu.
- **La date de mise à jour.** On suppose qu'elle reste propre à chaque ouvrage.
- **Le chemin local.** Un projet désigne sa maquette par un chemin sur la machine. Sur un autre poste, il faudra d'abord cloner le dépôt de la maquette.

## Prochaine étape

Ordre retenu :

1. Écrire la méthode dans le plugin, en termes génériques, et y intégrer le lancement d'InDesign. Cette partie ne dépend de rien et se perd si on attend : elle n'existe aujourd'hui que dans la session cerascan et dans des scripts temporaires.
2. Extraire Scriptami dans son dépôt, ce qui fixe le format et produit le squelette neutre.
3. Terminer la procédure de création de maquette sur ce format.
4. Concevoir la maquette d'Adrenaline.
