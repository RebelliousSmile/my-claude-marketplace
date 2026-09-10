# Changelog — my-claude-marketplace

Journal au niveau du marketplace : ajout/retrait de plugins et changements transverses. Les évolutions internes à un plugin sont dans son propre `CHANGELOG.md`.

Format inspiré de [Keep a Changelog](https://keepachangelog.com/). Versionnement du marketplace en SemVer (`marketplace.json`).

## [4.4.0] - 2026-09-10

### Added

- `overcode:harvest` accepte désormais un pilier ciblé (`inventory`, `tracker`, `normative`, `cleanup`, `freshness`, `review` ou `report`) tout en conservant l’exécution complète lorsque rien n’est précisé.

### Changed

- Les opérations de maintenance de `harvest` sont chargées à la demande depuis des actions séparées, avec leurs dépendances minimales explicites, afin de réduire la consommation de contexte des parcours ciblés.

## [4.3.0] - 2026-09-10

### Added

- `overcode:alias previously` reprend désormais le contexte documentaire d'un projet depuis son état durable avant de produire le snapshot courant.
- `overcode:taste` évalue la sobriété d'un produit ou d'un code et distingue l'ajout minimal justifié, la conservation, la simplification, la fusion et la suppression sans assimiler volume et valeur.
- `overcode:foresee` compose une analyse de résilience bornée par scénarios, fondée sur les preuves d'architecture, de tests, de plans, de travaux terminés ou d'horizon des dépendances fournies par AIDD.

### Changed

- Le contrat de délégation AIDD partagé résout les capacités canoniques du catalogue vivant, conserve l'autorité de chaque rapport, expose toutes les écritures dans une quittance et exige un consentement explicite avant toute mutation du produit évalué.

## [4.2.0] - 2026-09-01

### Added

- Le plugin `design` 2.15.0 enrichit `wireframes-analyze.py` : regroupement structurel des fratries en candidats d'unité/transition et détection de risques de contrat d'annotation, tous deux remontés comme candidats à revue, jamais autoritaires.

### Changed

- `design:wireframes` documente l'installation Chromium/Playwright (`WIREFRAMES_CHROMIUM`), la règle de préremplissage du harness pour `normalize`, le routage depuis `aidd-dev:01-plan`, et l'intake HTML issu d'un Artifact claude.ai.

## [4.1.0] - 2026-09-01

### Added

- Le plugin `design` 2.14.0 expose `design:wireframes` pour générer ou normaliser des planches HTML desktop/mobile comparables, vérifier séparément structure, rendu Chromium et review humaine, puis promouvoir les pages acceptées vers `design:harness`.

### Changed

- La carte publique de `design` place désormais `wireframes` et `harness` hors de l’entonnoir du contrat, avec un gate déterministe intégré à la régression globale du marketplace.

## [4.0.0] - 2026-08-28

### Changed ⚠ BREAKING

- Le plugin `sc-tiers` devient `web-tiers` afin de distinguer les services web tiers de la famille `sc-*` consacrée aux langages et stacks.
- Les invocations actives sont désormais `/web-tiers:setup` et `/web-tiers:cd`; tous les contrats, pivots, tests et délégations inter-plugins ont été migrés.
- Le plugin autonome `pdf` disparaît : son unique skill devient `/overcode:extract-pdf`, ce qui évite la collision avec le plugin PDF natif.
- Les README racine et plugins documentent les frontières et délégations inter-plugins actuelles.

### Fixed

- Les appels inter-plugins actifs sont vérifiés par la suite de cohérence, y compris les identifiants retirés.
- Les audits `sc-js`, `sc-php`, `sc-python` et `sc-rust` délèguent à `aidd-dev:04-audit` avec le pilier `code-quality`.
- `overcode:alias mirror` charge l’agent interne `design/agents/copycat.md` au lieu d’inventer une skill publique.
- `obs:project` délègue l’amorçage logiciel à `aidd-context:01-bootstrap`.
- `overcode:extract-pdf` s’arrête aux sources extraites et ne référence plus les skills RPG/TTRPG supprimées.

## [3.19.1] - 2026-08-28

### Fixed

- `sc-js:cd` refuse désormais de propager vers Linux les permissions, propriétaires et groupes synthétiques d'un artefact DrvFs ; il exige un artefact Linux natif ou des modes destination explicites, puis une preuve de modes couvrant répertoire, nouveau fichier et fichier mis à jour.
- Les affirmations `proof` et `recovery` de la façade JavaScript sont liées aux événements ordonnés du script réellement inspecté : une preuve décorative ou un rollback supprimé avant la fin de sa fenêtre fait échouer la réconciliation hors réseau.

## [3.19.0] - 2026-08-28

### Added

- Contrat SC-CD v2 pour plusieurs cibles nommées, chacune dotée d'une phase `staging` ou `production`, d'un mode `server` ou `automata`, d'un verrou et d'une garde de cycle de vie indépendants.
- Protocole commun de synchronisation différentielle des données et médias : manifestes normalisés, aperçu des octets, reprise, vérification finale et refus de toute archive complète de secours.
- Profil Alwaysdata borné et fixtures fédérées Suddenly/Scriptami couvrant Railway, serveur SSH, code, schéma, données et médias sans flux cible-à-cible.

### Changed

- `sc-css`, `sc-js`, `sc-php`, `sc-python` et `sc-rust` conservent une façade applicative unique et gouvernent séparément `code`, `schema`, `data` et `media` selon la phase de chaque cible.
- `web-tiers` configure exclusivement les prérequis et enveloppes fournisseur par cible ; les automates utilisent un ref immuable, une garde courante et un groupe de concurrence propre.
- Les productions deviennent autoritatives pour leurs données et médias, tandis qu'un staging peut refléter le local après aperçu, sauvegarde et confirmation.

### Fixed

- Le scanner de couverture ignore les caches et dépendances inaccessibles au lieu d'interrompre la suite racine sur un répertoire hors périmètre.

## [3.18.1] - 2026-08-28

### Fixed

- `sc-php:cd` conserve la façade de déploiement déjà native du projet au lieu d'imposer Composer aux projets WordPress pilotés par pnpm, PowerShell ou shell.
- La stratégie de livraison WordPress dépend maintenant des capacités vérifiées de chaque cible ; un hébergement plus permissif peut conserver ses outils et son automatisation tandis qu'une cible restreinte garde ses contournements propres.

## [3.18.0] - 2026-08-28

### Added

- Famille `cd` commune aux plugins `sc-css`, `sc-js`, `sc-php`, `sc-python`, `sc-rust` et `web-tiers`, avec actions `local`, `server` et `automata`, contrat projet portable et façade de production unique propre à chaque stack.
- Action `design:harness normalize` pour reconstruire un HTML existant dans le shell canonique, préserver ses interactions et mesurer séparément conformité de format, validité runtime, migration et fidélité visuelle.
- Exclusion de milestones dans `overcode:status backlog`, applicable avant le filtre de milestone et transmissible depuis l’alias `previously`.

### Changed

- Les livraisons CI, PaaS et SSH consomment la commande `deploy:*` déclarée par le projet au lieu de réimplémenter sa procédure ; les synchronisations de données restent bornées par surface et direction.
- Les routeurs et actions `cd` suivent le format de skill commun et disposent de suites comportementales de sûreté distinctes des tests de routage.

### Fixed

- `overcode:alias endtask` et `harvest` reconnaissent les plans AIDD durables par répertoire et statut de frontmatter, sans renommage de cycle de vie.
- Le harness détecte les dépendances CSS externes, borne l’évaluation de ses scripts et refuse les snapshots de tokens ou chemins source dont la provenance n’est pas démontrée.

## [3.17.0] - 2026-08-20

### Added

- Plugin `pdf` : l'extraction multi-sessions de gros PDF quitte `obs`, dont elle n'utilisait ni le coffre ni les conventions, et devient un plugin installable seul.

### Changed

- `obs` (0.38.0) exécute son travail par scripts Python déterministes au lieu d'actions en prose : l'arborescence `Documents/`, les répertoires de contenu, les notes de projet et le tri du courrier ne demandent plus d'appel au modèle. Les commandes qui exigeaient un jugement de lecture — résumer, distiller, synthétiser, répondre — sont retirées plutôt que simulées.

## [3.16.0] - 2026-08-14

### Added

- Support Codex portable pour `design`, `obs`, `overcode`, `sc-css`, `sc-js`, `sc-php`, `sc-python`, `sc-rust` et `web-tiers`, avec manifestes natifs, règles de résolution de racine et agents OpenAI pour les workflows concernés.
- Contrat de délégation AIDD partagé par `foresee` et `taste`, scénarios comportementaux dédiés et garde structurelle/live contre les routes périmées ou les moteurs locaux réintroduits.
- Générateur autonome du plugin `design`, livré avec ses routes Codex et ses preuves de validation.

### Changed

- `foresee` se concentre sur le risque prospectif des dépendances et délègue les audits génériques aux skills AIDD maintenues.
- `taste` se concentre sur la fraîcheur documentaire vérifiable contre le dépôt et délègue l'analyse de code ainsi que les faits externes aux capacités AIDD propriétaires.
- Les plugins et la documentation du marketplace utilisent désormais des pivots de portabilité communs au lieu de chemins ou de syntaxes propres à un seul hôte.
- La skill `research` rejoint `overcode`, propriétaire de la recherche transverse, au lieu de rester rattachée à `obs`.

### Removed

- Les plugins `game-writer` et `sc-godot`, ainsi que les anciens moteurs locaux et références de langage devenus redondants dans `foresee` et `taste`.

### Fixed

- Les échecs de résolution AIDD nomment désormais la skill canonique, son package et sa version minimale sans fallback silencieux.
- Les recommandations de réécriture de `taste` distinguent le seuil de trois claims dans un fichier du regroupement inter-fichiers.
- Les écarts relevés par la revue du plugin `design` sont corrigés sans régression de ses routes autonomes.

## [3.11.0] - 2026-08-03

`overcode` 4.2.0 → 4.3.0 · `design` 2.7.1 → 2.8.0 · `web-tiers` 0.2.2 → 0.3.0 · `sc-css` 0.3.3 → 0.4.0 · `sc-python` 0.6.1 → 0.6.2 · `sc-php` 0.10.0 → 0.10.1 · `sc-rust` 0.5.0 → 0.5.1 · `sc-js` 0.15.1 → 0.15.2. Huit plugins sur onze : c'est le premier lot qui traverse la marketplace au lieu d'en approfondir un morceau.

**Les deux bouts de la chaîne des pivots mentaient dans le même sens, et aucune garde ne pouvait le voir.** Côté installeur, six actions déclaraient des cibles `.claude/rules/` sans fichier source derrière — **neuf** au total, trois chez `web-tiers` et six chez `sc-css` — et annonçaient « installed » même quand elles n'écrivaient rien. Côté consommateur, les quatre skills `*-optimize` chargeaient le pivot quand il était là, repliaient sur leur schéma générique quand il ne l'était pas, et rendaient le même rapport dans les deux cas. Un projet pouvait donc lire un audit « Django » entièrement générique, produit à partir d'une promesse d'installation qui n'aurait de toute façon écrit aucun fichier. Les deux défauts sont symétriques : **la sortie ne rend pas compte de ce qui s'est passé**.

**La quittance de pivot (DEC-010).** Chaque rapport `*-optimize` rend maintenant une paire `source` / `pivot` par stack applicable, et `pivot` prend quatre valeurs distinctes : `installed`, `not installed`, `no provider`, `empty receptacle`. La distinction n'est pas cosmétique — les trois dernières appellent trois suites incompatibles : installer les règles ici, générer une checklist, ou n'attendre personne. Deux précisions qui ne se déduisent pas : la quittance se lit **par stack** et non par dépôt (DEC-008), et « vide » se lit **sur les règles**, jamais sur les fichiers — un réceptacle avec un `.gitkeep` reste vide.

**`no provider` exige une table, parce qu'une skill ne voit pas la marketplace depuis un projet.** `overcode/references/pivot-providers.md` porte la correspondance `<stack> → <plugin>, <commande>` — 33 lignes, citée par les quatre skills, recopiée par aucune. Elle dérive des tables *Target* des installeurs sous deux bornes explicites : n'entre que la cible **de la forme** `<famille>-pivots-<stack>.md`, et seulement si sa **source résout sur disque**. La commande y est portée **par plugin**, jamais par famille : `web-tiers` s'installe par `/web-tiers:setup`, les quatre `sc-<langage>` par `/sc-<langage>:sniff` — `web-tiers` n'a pas de skill `sniff`, et un gabarit uniforme aurait remplacé un remède faux par un autre.

**Une famille de pivots sans aucun fournisseur est écrite comme telle.** `seo-pivots-<sitetype>.md` est une interface publique que personne ne remplit : aucun plugin n'écrit ce nom. `seo-optimize` continue de scanner le réceptacle — un fichier déposé à la main y garde la précédence — mais toute absence s'y rend `no provider`, jamais `not installed`. Un réceptacle vide qu'on présente comme installable fabrique une recommandation qui ne mène nulle part.

**Deux gardes de build là où il n'y en avait aucune.** `M4` : toute ligne d'action citant une cible `.claude/rules/` doit voir **toutes** ses sources résoudre sur disque — formulée par ligne, parce qu'une action de `sc-python` met source et cible dans la même cellule, et ancrée sur la **forme** de la ligne, jamais sur l'intitulé de colonne, qui varie d'un plugin à l'autre. `M5` : chaque ligne de `pivot-providers.md` doit joindre une paire (plugin, cible) que `M4` a validée — la table ne peut donc pas dériver de ses installeurs sans qu'une garde s'en aperçoive. Les neuf cibles fantômes existaient depuis des mois ; ce qui manquait n'était pas la vigilance mais la garde.

**Le remède retenu partout est le retrait de la déclaration, pas l'écriture du contenu manquant.** Écrire six pivots CSS et trois pivots SaaS est une décision produit, qui n'a pas été prise. Ce que le lot corrige, c'est l'écart entre ce que les actions annoncent et ce qu'elles font — et il le corrige dans le sens qui ne fabrique rien.

**Trois arbitrages tranchés en chemin, chacun consigné au journal du plugin concerné.** Un chemin de la liste fermée de `sc-js:03-clean` n'a jamais été versionné, donc jamais installable : retiré, avec la branche de garde qui manquait pour les candidats sans référence. Un pivot ActivityPub de `sc-python` avait **deux** sources pour une cible : `capabilities/protocol/activitypub-django.md` fait foi, l'autre est supprimée après versement de ce qu'elle avait en propre. Et une clé de manifeste de `sc-css` recommandait trois pivots qui ne résolvaient vers aucune action : supprimée plutôt que réparée.

**Deux suites behave accompagnent le lot et sont rejouées sur le code corrigé** — 12 scénarios de quittance côté consommateur (`overcode/skills/web-optimize/evals/`), 8 d'honnêteté côté installeur (`web-tiers/skills/setup/evals/`). Registres append-only : le run 2 s'ajoute sous le run 1, il ne le remplace pas. Les deux runs sont jugés en contexte neuf, par des lecteurs qui n'ont écrit ni les suites ni les corrections.

**Le run 2 tout-vert a produit le défaut suivant, et il est traité dans le contrat plutôt que dans les deux suites.** Une suite écrite pour reproduire un défaut cesse, le jour du correctif, d'établir qu'un défaut *nouveau* de la même famille serait attrapé : elle est devenue une suite de non-régression, ce qui est autre chose et moins. Deux invariants entrent donc dans `overcode/skills/behave/references/harness-conventions.md` et dans son gabarit de scaffold, donc devant les suites à naître et pas seulement derrière celles-ci — **une ligne n'annonce jamais son verdict** (l'annotation est lue comme la réponse par le juge suivant, et elle périme au correctif : mesuré 8 annotations sur 11 décrivant un texte disparu, soit six FAIL faux pour qui les recopiait) et **une suite garde un rouge vivant**, contrôle négatif *et* positif, compté **par famille** — un rouge ailleurs ne compte pas. Les deux suites gagnent en conséquence un contrôle négatif appuyé sur une mesure et explicitement non jugé.

## [3.10.0] - 2026-07-30

`sc-php` 0.9.0 → 0.10.0. `sc-css` reste en **0.3.3**, délibérément. Suppression de `version.txt`.

**Le quatrième pivot `testing` est le premier dont la stack n'a pas de point d'entrée unique.** Les trois précédents décrivaient chacun un projet, une commande, une population. PHP en décrit deux mondes sans intersection — un dépôt de boutique où neuf composants portent chacun leur `composer.json`, leur `vendor/` et leur suite, et une installation WordPress où le code du projet est 5,2 % des fichiers `.php` versionnés. Le pivot dit les deux, ce qui l'oblige à écrire que la mesure se fait N fois et que la racine du dépôt n'est pas l'unité. Détail dans le journal de `sc-php`.

**Le cinquième pivot n'est pas écrit, et son absence est le résultat de la part, pas son échec.** La question posée à `sc-css` était : un pivot `testing` CSS a-t-il un contenu non creux ? Réponse par décompte, champ par champ — **un seul** des dix reçoit une réponse propre à la stack (*Source glob & exclusions*), et **aucun des cinq champs requis** n'en reçoit : CSS n'a pas de runner, pas de fichier de test, donc pas de décompte ni de piège d'outillage de test. Les deux champs qui semblaient répondre sont déjà fournis ailleurs par le même plugin, plus finement. Le livrer coûterait plus qu'il ne rapporte : par la règle d'union de DEC-008, son *Source glob* ferait entrer les fichiers CSS dans l'univers source d'un projet dont la population de tests contribuée est vide par construction, et le run rendrait un « 0 test » qui n'est pas un défaut du projet. Le contrat prévoit l'absence et impose de la déclarer ; c'est plus vrai qu'un fichier.

**Une source de vérité de version qui a divergé de six mineures est supprimée, pas réalignée.** `version.txt` portait `3.1.0` face à un manifeste en 3.9.0, et aucun fichier du dépôt ne le lisait — vérifié. Le réaligner l'aurait fait rediverger au bump suivant, faute de quiconque pour le maintenir. `.claude-plugin/marketplace.json` reste la seule source de vérité ; `index.json` ne porte aucune version et n'en reçoit pas.

## [3.9.0] - 2026-07-30

`sc-rust` 0.4.5 → 0.5.0 · `overcode` 4.1.0 → 4.2.0 · `sc-js` 0.15.0 → 0.15.1 · `sc-python` 0.6.0 → 0.6.1.

**Le troisième implémenteur du contrat de pivot `testing` est le premier à le contredire, et c'est à ça qu'il sert.** Les deux premiers — Vitest et pytest — partagent assez de forme pour qu'une clause fausse passe inaperçue. Rust n'en partage pas : ses tests vivent **dans** le fichier source qu'ils testent, sa toolchain ne produit aucune couverture, et son terrain de mesure porte 122 tests sans une seule ligne de `[dev-dependencies]`. Trois hypothèses du contrat y ont été mises à l'épreuve ; deux ont cédé, une a tenu. Détail dans le journal de `sc-rust`.

**Ce qu'un champ de contrat supposait sans jamais l'écrire (DEC-009).** Le contrat présentait *Test file glob* et *Source glob & exclusions* comme une partition, et traitait l'absence d'un **champ** sans jamais traiter l'absence de l'**outil** qu'une commande présuppose. Les deux suppositions sont maintenant explicites : un pivot déclare la non-disjonction et nomme l'unité réelle quand elle n'est pas le fichier ; un prérequis constaté absent vaut champ absent pour ce run, le pivot fournissant la commande de constat et le consommateur ne rapportant jamais l'échec comme un défaut du projet mesuré. Un outil manquant et une mesure manquante appellent des correctifs opposés.

**Une règle rétroactive se paie dans le même lot, pas plus tard.** La clause de prérequis vaut pour les pivots déjà livrés : `sc-js` et `sc-python` sont repris ici même, plutôt que laissés non conformes à un contrat qui vient de bouger. La clause de non-disjonction, elle, n'est due que lorsque la disjonction ne tient pas — aucune reprise nécessaire. La distinction est ce qui permet de dire qu'aucun pivot livré n'est devenu non conforme sans être repris.

**Une hypothèse réfutée est consignée comme telle.** Le plan prévoyait trois amendements ; `Anchor boundary` n'en a pas eu besoin — le contrat énonce déjà qu'ancré ne veut pas dire « dans un navigateur ». L'infirmation est écrite à l'ADR plutôt que passée sous silence, parce qu'un plan qui annonce trois corrections et n'en livre que deux doit dire laquelle n'avait pas lieu d'être.

## [3.8.0] - 2026-07-30

`sc-python` 0.5.4 → 0.6.0. Complète `overcode` 4.1.0 sans le rebumper : cette version n'a pas encore été publiée, donc le contrat corrigé et les trois runs d'éval atterrissent dans le même commit qu'elle — un numéro identifie une intention, et celle-ci n'a jamais été installable dans son état de 3.7.0.

**Le contrat de pivot `testing` a un deuxième implémenteur, et c'est ce qui le rend vérifiable.** Tant qu'un seul plugin en livrait un, rien ne distinguait le contrat de ce pivot-là : toute clause du contrat pouvait être satisfaite par accident. `sc-python` en livre un écrit contre la même spécification et contre une autre stack — pytest/coverage.py au lieu de Vitest/Playwright — et les deux divergent partout où les stacks divergent, comme le contrat l'exige depuis 3.7.0. Détail dans le journal de `sc-python`.

**Le contrat cesse de se citer un exemple.** `pivot-contract.md` nommait « le seul pivot livré » comme illustration : la phrase est devenue fausse le jour de cette livraison, et elle avait déjà cessé d'être vraie une fois auparavant, sur la réécriture du pivot `sc-js`. Elle est remplacée par l'énoncé de ce que les deux ont en commun — la spécification — et de ce qu'ils n'ont pas — leurs champs. Un contrat qui s'illustre d'un état du monde périme à chaque livraison.

**Trois lignes d'éval d'`overcode:control` étaient N/A faute d'un pivot Python, et l'une d'elles était mal diagnostiquée.** Elles avaient été écrites contre un contrat qu'aucun projet Python ne pouvait alors satisfaire, et leur N/A ne se levait par aucune édition de la cible. Rejeu sur un projet Django réel : deux passent (`matrix` 18/18, `authority` 13/17), la troisième reste N/A sur une cause qui se nomme — aucune fixture ne déclare de domaine. En chemin, le dossier corrige une attribution de cause fausse : le blocage de `authority` S6 avait été imputé à l'absence de données de branches, alors qu'il tenait à une commande de couverture, que la fixture configure. **Un N/A qui vieillit sans être rejoué se déplace vers la mauvaise cause** — c'est le mouvement des N/A, et non le compte des FAIL, qui l'expose.

## [3.7.0] - 2026-07-30

`overcode` 4.0.0 → 4.1.0 · `sc-js` 0.14.0 → 0.15.0.

**Le contrat de pivot de `control` cesse d'élire une stack : le pivot suit le fichier.** Un projet a autant de plugins de langage applicables que de stacks, chacun contribue son pivot, et un champ est résolu par le pivot de la stack à laquelle appartient le fichier considéré. Transverse parce que c'est le contrat — interface publique au sens de DEC-004 §5 — qui change, mais **additif** : aucun champ renommé ni retiré, aucune implémentation de pivot à modifier. Détail dans le journal d'`overcode`.

**`Domain resolution` cesse d'être un champ de contrat que personne ne remplit.** Le contrat le définit, six consommateurs le lisent, aucun pivot ne le fournissait — le repli s'appliquait donc partout, sans erreur et sans bruit. `sc-js` le pourvoit le premier, et c'est cette forme-là que les quatre pivots à venir copient plutôt que d'en produire quatre interprétations parallèles. Détail dans le journal de `sc-js`.

**Une rectification, dans quatre fichiers à la fois.** Les entrées 3.5.1 et 3.6.0, DEC-007 §3 et le journal de `sc-js` affirmaient que le contenu du champ `Tier thresholds` → `Anchor boundary` était *« conservé tel quel »*. Le commit de la part 3 a **aussi reborné le champ** : les attributions de tier et l'argument de budget sont partis, seul le savoir de position reste, et c'est ce retrait qui rend le pivot conforme. La phrase décrivait le plan, pas la livraison. Conservée, elle a fait rouvrir un correctif déjà fait comme un défaut ouvert — d'où la rectification partout où elle figure plutôt qu'au seul endroit où elle a été remarquée.

## [3.6.0] - 2026-07-30

`overcode` 3.12.1 → 4.0.0 · `sc-js` 0.13.2 → 0.14.0. Part 3 sur 3 de la refonte de `control` : la skill reçoit le modèle posé en 3.5.1. L'écart déclaré alors, et reconduit en 3.5.2, se referme.

**La page d'autorité a elle aussi été amendée dans cette part** — trois règles que la skill portait seule y sont descendues, trouvées par la passe de cohérence jouée dans le sens skill → page. Le détail est dans le `CHANGELOG` d'`overcode`. Et comme les 3.5.1 et 3.5.2, les deux versions intermédiaires d'`overcode` n'ont jamais été publiées séparément : le dernier commit porte la marketplace 3.5.0, les trois parts ont été menées d'un seul tenant, et leurs entrées atterrissent ensemble. Ces numéros datent une étape, pas un état installable.

### Changed

- **Le renommage de champ de pivot atterrit des deux côtés dans le même commit.** `## Tier thresholds` → `## Anchor boundary` : `overcode` porte le contrat (`skills/control/references/pivot-contract.md`), `sc-js` porte l'unique implémentation (`skills/sniff/references/capabilities/tools/testing.md`). C'est ce qui rend `overcode` majeur, et c'est la seule raison pour laquelle un changement transverse a été annoncé deux versions à l'avance plutôt que fait sur place : un contrat et son implémentation ne peuvent pas diverger le temps d'une version, mais les consommateurs tiers, eux, avaient besoin du préavis. Le champ était mal nommé, pas inutile — son contenu est conservé, et sa borne d'autorité est écrite pour la première fois.
- **La seconde règle transversale du modèle s'applique au voisin.** *Le pivot déclare ce qu'il fournit, jamais qui le consomme.* **Onze** mentions de `control` et de ses actions ont été retirées du pivot `testing` de `sc-js` — le compte publié d'abord était de huit, sur les seules occurrences de nom d'action, et il ratait les deux endroits où le fichier nommait son lecteur en toutes lettres. La règle est inter-plugins par nature : un champ qui nomme son consommateur empêche mécaniquement toute autre skill de lire un fait vrai de la stack, et c'est le contrat de DEC-004 qui en souffre, pas la skill nommée.
- **Le gate du dépôt reste vert et ne dit rien de la refonte.** `node tools/eval/consistency.mjs` passe — 71 skills, 0 problème. Il n'a jamais lu les `evals/*-scenarios.md` : un run `behave` est un jugement d'agent, pas une étape de CI. L'état des 149 scénarios de `control` est donc consigné dans les registres des suites et dans le CHANGELOG d'`overcode`, pas ici.
- **Le run de confirmation a eu lieu, et il livre 0 FAIL sur les huit suites — mais pas un état entièrement vert.** 126 PASS · 0 FAIL · 24 N/A sur 150 cellules, zéro PASS→FAIL. **Six lignes sont pourtant passées de PASS à N/A**, toutes les six rendues injoignables par deux correctifs justes de la skill : une suite peut perdre son unique moyen d'atteindre la règle qu'elle garde sans qu'aucune ligne rougisse. Elles sont conservées comme dettes de suite (DEC-006), jamais comptées PASS. Le détail, et les 22 correctifs de cible posés après le rejeu, sont dans le CHANGELOG d'`overcode`.

## [3.5.2] - 2026-07-28

`overcode` 3.12.0 → 3.12.1. Part 2 sur 3 de la refonte de `control` : les huit suites `behave` qui décrivent le modèle publié en 3.5.1. La skill reste sur le modèle précédent — l'écart déclaré en 3.5.1 tient encore, et se referme en part 3.

### Changed

- **Les suites d'évaluation sont livrées rouges, et c'est l'ordre imposé par DEC-006.** Page → suites → skill. Une suite écrite après la skill ne teste que ce que la skill fait déjà ; écrite avant, elle est le seul artefact qui dise ce que la part 3 doit faire passer. Les `| FAIL |` consignés ne signalent donc aucune régression du plugin publié : ils mesurent la distance entre la page normative de la 3.5.1 et une skill qui ne l'a pas encore reçue. C'est aussi la raison pour laquelle cette version reste un correctif et non une mineure — rien de ce que `control` fait aujourd'hui ne change.
- **Le gate du dépôt reste vert.** `node tools/eval/consistency.mjs` passe : les suites `behave` ne sont lues par aucun outil du dépôt, et un run `behave` est un jugement d'agent, pas une étape de CI. Un `| FAIL |` dans un `evals/*.md` ne peut donc pas casser la CI — ce qui est la raison même pour laquelle chaque FAIL doit nommer l'instruction fautive par fichier et section : le registre est la seule chose qui le rende vérifiable par un tiers.

## [3.5.1] - 2026-07-28

`overcode` 3.11.1 → 3.12.0. Refonte du modèle de `control` : la phase devient l'autorité classante. Part 1 sur 3 — cette version ne publie que la **page normative**, et l'ADR qui la fonde.

### Added

- **`aidd_docs/internal/decisions/007-phase-as-classifying-authority.md`**, statut `Accepted`. Le registre de décisions est un artefact du dépôt et non d'un plugin : DEC-007 amende DEC-004, dont la portée est inter-plugins (le contrat de pivot, consommé par `overcode` et fourni par les `sc-*`). Il conserve du §4 le principe — *le pivot priorise, il ne classe pas*, promu règle transversale — et retire à la table des tiers l'autorité de classement qu'il lui donnait. `004-cross-plugin-pivot-consumption.md` reçoit un en-tête d'amendement et rien d'autre : un ADR accepté ne se réécrit pas, sinon le motif de l'amendement perd l'état auquel il s'oppose.

### Changed

- **Le champ de pivot `Tier thresholds` sera renommé `Anchor boundary`.** C'est un changement de l'interface publique décrite par DEC-004 §5, donc un changement transverse : `overcode` le consomme, `sc-js` le fournit. La page de `control` l'anticipe dès cette version pour que le modèle qu'elle publie soit lisible ; `references/pivot-contract.md` et le pivot `sc-js` porteront le nouveau titre dans la part 3, dans le même commit — un contrat et son unique implémentation ne peuvent pas diverger le temps d'une version. Le contenu du champ est conservé tel quel : il était mal nommé, pas inutile. *(Annonce démentie par la livraison — cf. 3.7.0 : le contenu a aussi été reborné.)*
- **`skills/control/` reste sur le modèle précédent dans cette version, par construction.** DEC-006 impose l'ordre page → suites `behave` rouges → skill, au motif que `behave` teste des sorties et jamais la cohérence entre deux documents normatifs : commencer par la skill rendrait une incohérence page/référence indétectable. L'écart est donc déclaré, et la page fait foi tant qu'il dure. Il se referme en `overcode` 4.0.0, majeur à cause du renommage ci-dessus.

## [3.5.0] - 2026-07-28

L'outillage de test revient dans le dépôt. Il en avait été sorti le 13 juin 2026 (« les tests ne sont pas versionnés »), et la 3.4.0 reconduisait ce choix ; il s'est retourné le jour où le gate a été réparé.

### Changed

- **`tools/`, `package.json` et `.github/workflows/test.yml` sont de nouveau versionnés.** `.gitignore` ne retient plus que `__pycache__/`. Un gate hors dépôt n'a d'autorité que sur le poste qui le porte : `coverage.mjs` a été corrigé en profondeur ce jour, et cette correction n'existait sur aucun autre clone — un `git clone` frais serait reparti de la version qui ne savait lire qu'une forme de routage sur six. Le raisonnement d'origine traitait l'outillage comme un accessoire personnel ; il est en réalité la seule chose qui vérifie que les onze plugins restent cohérents entre eux, ce qui est une propriété du dépôt, pas du poste. Le second motif invoqué alors — « éviter les soucis d'encodage/PowerShell sur les `.mjs` riches en UTF-8 » — est sans objet : `.gitattributes` déclare `*.mjs text` et est resté suivi précisément pour cela.
- **La CI s'exécute de nouveau.** `.github/workflows/test.yml` n'avait tourné qu'une fois, le 13 juin 2026, avant d'être détraqué le jour même avec le reste de l'outillage. Quatre étapes `node` sur chaque push et chaque PR : `consistency`, `harness`, `coverage`, `selftest`. La 3.4.0 avait rendu l'étape de vérification d'`alias:bump-plugin` conditionnelle (« si la marketplace fournit un gate, préférer son verdict ; sinon relire les deux manifestes ») au motif qu'il n'y avait pas de CI — cette formulation reste la bonne et n'est pas reprise : l'action est distribuée avec le plugin, donc vers des dépôts où le gate n'existe pas.

### Added

- **`tools/eval/` — 79 fichiers, 220 Ko de texte.** Quatre scripts sans dépendance (`consistency`, `harness`, `coverage`, `selftest`), leur `README`, les fixtures valides (5 projets) et invalides (2 cas de rejet) dont `selftest` se sert pour vérifier que `harness` n'est pas devenu permissif, et le matériel d'éval comportemental (`behavioral/`).

### Fixed

- **`tools/eval/coverage.mjs` — le détecteur d'actions routables ne modélisait qu'une forme de routage sur les six que le dépôt emploie.** Il ne reconnaissait qu'une phrase entre guillemets suivie d'une flèche, et lisait table de dispatch, puce de dispatch, colonne « Déclencheur », chaîne séquentielle et action unique déclarée comme « aucune action routable » — 30 skills classées non vérifiables, dont six qui cachaient un vrai trou de couverture. La règle qui débloque les deux dernières formes d'un coup : sur une ligne contenant une flèche, compter les identifiants qui résolvent vers une action déclarée — un seul est un dispatch, deux ou plus sont un pipeline dont seule la tête est routable. S'y ajoute la normalisation du préfixe (`01-scan` ≡ `scan`), la 3.4.0 ayant retiré le numéro des titres sans le retirer de toutes les cellules de table. Résultat : 30 non vérifiables → 7 (des skills sans table d'actions, où le détecteur ne peut légitimement rien établir), 3 problèmes → 0. Imposer une forme unique aurait signifié réécrire trente `SKILL.md` pour satisfaire un linter ; c'est l'outil qui a appris le dépôt.
- **Le verdict des skills sans suite de routage est compté, pas sanctionné** (`○`). Corriger le détecteur rend ce cas atteignable pour onze skills qui n'ont jamais eu de `scenarios.json` ; les traiter toutes en échec est littéralement vrai et pratiquement inutile — les régressions réelles disparaîtraient dans le bruit. Le compteur existe pour que la dette reste visible : s'il cesse de décroître, c'est la politique qu'il faut durcir, pas le compteur qu'il faut masquer.

## [3.4.0] - 2026-07-27

Trois défauts partageaient une forme : une information recopiée à N endroits, sans autorité déclarée entre les copies et sans rien qui les compare. Le correctif suit le même ordre partout — d'abord un vérificateur, ensuite les suppressions qu'il rend sûres.

### Added

- **`tools/eval/consistency.mjs`**, câblé en tête de `pnpm test` et de la CI. Il compare `plugin.json` ↔ `marketplace.json` (version et description), vérifie que toute entrée de manifeste a un dossier, que toute ligne de table de `SKILL.md` résout vers un fichier d'action et réciproquement, qu'aucun préfixe numérique n'est porté par deux fichiers, et qu'aucun titre `H1` ne porte son numéro. Il vit sur un point de passage obligé, et non dans `alias:bump-plugin` : cette action vérifiait déjà les manifestes, mais depuis l'intérieur du chemin discipliné — un bump fait à la main l'évitait entièrement, ce qui est exactement la façon dont la dérive de 3.3.3 s'est produite.
- **Politique de numérotation**, écrite en assertion plutôt qu'en prose : un numéro **identifie**, il n'ordonne pas. Le doublon est une erreur — deux fichiers portant `06` rendent toute référence ambiguë. Le trou est toléré : l'interdire rendrait bloquante la cascade de renommages qui suit chaque suppression d'action, or c'est cette cascade non faite qui a produit le trou d'`alias` en 3.1.1. Le strict n'aurait pas empêché la dette, il l'aurait déplacée dans la CI.

### Changed

- **`index.json` ne porte plus ni `version` ni `description`** — seulement `{id, name}`. Ces champs ont dérivé sur six plugins (voir 3.3.3) parce qu'aucun consommateur ne les lit : Claude Code lit `marketplace.json`. Une copie que personne ne lit ne se maintient pas, elle se supprime. Le fichier garde ses deux rôles réels : balise de racine pour l'étape 0b de `bump-plugin`, et registre humain des plugins. `CONTRIBUTING.md`, `aidd_docs/memory/marketplace-v3.md` et la documentation d'`alias` sont alignés.
- **Les titres `H1` des actions ne portent plus leur numéro** — `# Bump-plugin`, plus `# Action 03 — bump-plugin`. 166 fichiers sur 178, dans les onze plugins. Contrairement à ce qui avait été annoncé au moment du diagnostic, ce n'était **pas** la généralisation d'une convention majoritaire mais sa rupture : la mesure initiale ne détectait qu'une des deux formes numérotées (`# Action NN — nom`, 69 fichiers) et ignorait l'autre (`# NN - nom`, 97), concluant à tort que 103 titres étaient déjà propres alors qu'ils n'étaient que 12. Le choix tient malgré la correction, pour la raison qui fondait le chantier et qu'unifier les deux formes n'aurait pas servie : le numéro vivait à trois endroits, il n'en occupe plus que deux — le nom de fichier et la table, que le gate compare désormais. Les libellés enrichis sont préservés (`# Parse errors`, `# Realize-lint (sc-css)`) : seul le préfixe est retiré.

### Fixed

- **`alias:bump-plugin` affirmait que sa vérification tournait en CI.** C'est faux : `tools/`, `package.json` et `.github/` sont gitignorés — l'outillage est local par choix, et le workflow lui-même n'est pas poussé. L'étape est devenue conditionnelle (« si la marketplace fournit un gate, préférer son verdict ; sinon relire les deux manifestes »), ce qui la rend en outre correcte pour les dépôts où le fichier n'existe pas, l'action étant distribuée avec le plugin.

## [3.3.3] - 2026-07-27

### Fixed

- **`overcode` (3.9.1)** — numérotation des actions d'`alias` réalignée sur la table de `SKILL.md` : six fichiers sur dix résolvaient sur un mauvais numéro, dont deux revendiquant tous deux « Action 06 ». Origine : un trou en `07` laissé par la suppression de `07-aiddlegacy.md` en 3.1.1, jamais comblé. Aucun contrat cassé — les actions sont désignées par nom partout. Documentation de `control` : l'autorité entre `docs/control.md` et `skills/control/` est inversée (la page porte le modèle, la skill le réalise), et une quatrième autorité est énoncée — que la skill ne réalise pas encore.
- **Dérive silencieuse d'`index.json` sur six plugins** — `design`, `sc-css`, `sc-js`, `sc-php`, `sc-python` et `sc-rust` y portaient encore la version précédant les bumps de 3.3.2, alors que `plugin.json` et `marketplace.json` étaient à jour. Aucune version n'est bumpée ici : c'est le troisième manifeste qui rattrape. La cause est structurelle — `index.json` est le seul des trois qu'aucun consommateur ne lit à l'exécution (Claude Code se sert de `marketplace.json`), donc rien ne se casse quand il ment. `alias:bump-plugin` propage bien sur les trois depuis `overcode` 3.9.0, mais un bump fait à la main y échappe.
- **`~/.claude/rules/plugins-marketplace.md`** (hors dépôt, chargé à chaque session) — décrivait la marketplace sous son ancienne racine `aidd-overlay/`, nom abandonné en 3.0.0, et listait neuf plugins dont trois inexistants (`gamedesign`, `writing`, `obsidian`) et trois manquants (`design`, `sc-css`, `sc-godot`). Il annonçait notamment la skill `dig`, retirée en 3.3.0 — d'où un diagnostic de skill « manquante » qui ne portait sur rien. Reconstruit depuis `marketplace.json`, sans versions (elles dérivent). Règle ajoutée : la marketplace étant déclarée `source: directory` sur l'arbre de travail, une installation capture **ce qui est sur le disque**, commité ou non — un numéro de version identifie une intention, jamais un contenu.
- **`aidd_docs/memory/marketplace-v3.md`** — titré « état v3.0.0 » mais décrivant un état antérieur à la v3, avec onze versions fausses. Réécrit en « état courant », sans versions, et doté de deux registres de ce qui n'existe plus : plugins supprimés ou renommés, et skills supprimées.

## [3.3.2] - 2026-07-27

Entrée écrite rétroactivement : la version a été atteinte par deux apports — le commit `81c66dd` (correctifs `sc-*`) puis le merge `cc604e2` (overcode 3.9.0) — dont aucun ne l'a rédigée.

### Added

- **`overcode` (3.9.0)** — revue DDD de la skill `control` : le modèle a été écrit d'abord, puis la skill alignée dessus. Trois autorités séparées et énoncées comme telles, les **domaines** comme nouvelle dimension (le projet déclare lesquels existent, le pivot `sc-*` déclare comment les repérer — autorité découpée par nature de connaissance, donc sans arbitrage nécessaire), deux nouvelles phases (`default` et `undetermined`), et le graphe de chaînage des six actions promu en contrat. Quatre pages `docs/` créées (`concepts`, `workflow`, `aliases`, `control`). `alias:bump-plugin` propage désormais la version sur les **trois** manifestes au lieu de deux — la divergence que ça corrige ne se voyait qu'à l'installation.

### Fixed

- **Discipline de sévérité des audits, sur cinq plugins `sc-*`** — `sc-css` (0.3.2), `sc-js` (0.13.1), `sc-php` (0.8.1), `sc-python` (0.5.3), `sc-rust` (0.4.4). Même défaut transposé à chaque stack : une dimension d'audit présupposait une propriété du monde (un conteneur DI, un hôte en `@layer`, un plancher d'interpréteur, un runtime async, un module ESM) puis sur-affirmait la sévérité quand cette propriété était fausse. Le verdict est désormais conditionné à une propriété **mesurée** de la preuve, jamais à la plateforme supposée. L'enjeu est le chaînage : `audit` et `improve/01-analyze` sont read-only mais alimentent des actions **mutantes** (`legacy/02-migrate`, `aidd-dev:implement`), donc un faux verdict devient une réécriture. Toute indécidabilité est portée dans la **sévérité** (`info`), jamais dans une note que le pipeline ignore — et « code mort » n'est plus jamais affirmé au scan statique, seulement « non référencé dans les sources scannées ». Détail par plugin dans leurs CHANGELOG respectifs.
- **`design` (2.6.1)** — titres de section et phrases du README portaient des numéros de version (`(2.4.0)`, `(2.1.0)`, « Depuis 1.1.0 : … »). Retirés : l'historique est le rôle du CHANGELOG. Même correction dans `sc-js`, dont une section s'intitulait « Migration depuis 0.3.0 ».

## [3.3.1] - 2026-07-25

### Fixed

- **`sc-php` (0.7.1)** — description du manifeste (`plugin.json` + `marketplace.json`) omettait les skills `log-analysis` et `bruno`. `log-analysis` avait été livrée le 2026-05-27 (commit `37f792f`) sans jamais toucher `plugin.json` ni le CHANGELOG du plugin — non versionnée depuis sa création. `bruno` figurait dans l'historique du CHANGELOG mais jamais dans la phrase de description. Découvert après coup, en vérifiant une suspicion de l'utilisateur sur les data pivots Eloquent/Doctrine (ceux-ci se sont avérés réels et implémentés — le vrai trou était ailleurs dans la même description).

## [3.3.0] - 2026-07-25

### Added

- **`overcode` (3.8.0)** — skill `baby` : explique, réécrit ou compare un sujet en langage simple et progressif, sans jargon non défini.
- **`sc-css` (0.3.1)** — `README.md` créé (n'en avait jamais eu) et ajouté à l'index et à la table de référence rapide du README racine ; ses six skills (`sniff`, `audit`, `improve`, `legacy`, `teach`, `design-bridge`) étaient jusqu'ici invisibles depuis la documentation du marketplace bien qu'installables.

### Removed

- **`overcode` (3.8.0)** — skill `dig` (quiz interactif /20) retirée : supplantée pour l'explication passive par le output style natif Learning (blocs ★ Insight). Sa capacité de rappel actif noté n'a pas d'équivalent.

### Fixed

- **Dérive de README vs état réellement livré**, sur quatre plugins dont le `plugin.json`/`CHANGELOG` étaient déjà à jour mais dont le `README.md` avait pris du retard :
  - `design` — la ligne `harness` ne mentionnait pas le flag `--contract` (2.6.0).
  - `obs` — les lignes `tree`, `filler` et `mail` omettaient respectivement `judge`/`destinations`, `index`/`synthesize`, et l'action `reply`.
  - `sc-js` — affirmait à tort que Svelte/SvelteKit n'étaient "pas encore" supportés ; `design-bridge` ne mentionnait pas le workflow de plateforme SPA.
  - `sc-php` — `design-bridge` ne mentionnait pas le workflow de plateforme FSE.
- **`web-tiers` (0.2.1)** — `README.md` et `marketplace.json` affirmaient des data pivots Supabase/DynamoDB/Hasura qui n'ont jamais été implémentés (seul un pivot Firebase/Firestore existe). Fausse mention présente depuis l'entrée baseline du CHANGELOG du plugin, non corrigée pour préserver l'historique.
- **`sc-python`** — CHANGELOG comblé pour les versions `0.5.0`/`0.5.1`/`0.5.2`, bumpées sans entrée documentée. Un écart résiduel est noté dans le CHANGELOG du plugin : le commit `315a499` (2026-05-31) a ajouté du contenu après le bump `0.5.2` sans bumper à son tour — non corrigé ici, faute de version taguée à lui attribuer.

## [3.2.0] - 2026-07-22

### Added

- **Consommation cross-plugin d'un pivot `sc-*`** (`DEC-004`) — premier cas d'un pivot lu par un plugin **autre** que le sien : `sc-js/tools/testing.md` (0.10.0) est découvert **par glob** et consommé par `overcode:control` (3.3.0), qui détient le contrat (`references/pivot-contract.md`). Champs optionnels à repli documenté, titres de section alignés sur le contrat, et frontière d'autorité explicite — un pivot priorise un classement, il ne décide jamais d'un tier. Tout futur pivot `testing` (`sc-php`, `sc-python`…) s'y conforme sans modifier `control`.
- La résolution de racine du pivot accepte la **racine source** (`plugins/<plugin>/`) quand le consommateur tourne contre le dépôt marketplace — sans quoi aucun pivot n'est testable avant publication, les versions étant épinglées à l'installation.

### Fixed

- **Dérive de `marketplace.json`** — le manifeste annonçait encore `overcode` 3.1.5 et `sc-js` 0.8.0 alors que les plugins étaient publiés en 3.2.0 / 0.9.0, et la description d'`overcode` ignorait la skill `control`. Version du marketplace réalignée sur ce CHANGELOG (elle indiquait 3.0.0 pour une entrée 3.1.0 existante).

## [3.1.0] - 2026-06-13

### Added

- **Infra de test `tools/eval/`** (Node, zéro dépendance) — trois couches : `harness.mjs` (conformité structurelle d'un projet brief→output + invariants de portabilité + invariant plateau), `coverage.mjs` (chaque action *routable* a ≥1 scénario, tous plugins) et `behavioral/` (spec + rubrique LLM-juge à la demande). 4 fixtures golden + spec comportementale.
- **`writing` (1.1.0)** — boucle de review convergente + **PLATEAU** (`Δ < 1.0`), artefact `chapter-NN-scores.md`, routes de triage vers `tone-finder:improve` / `persona:train` (`references/review-loop.md`).

### Changed

- **Contrat brief resserré** : `_brief/personas/` et `_brief/output-styles/` exigent ≥3 entrées distinctes (`writing` 1.1.0 + `obsidian` 0.14.0).

### Fixed

- **`obsidian` (0.15.0)** — `rules-keeper/evals/scenarios.json` réparé (ids d'action périmés) ; dérive de version + description corrigée dans `index.json` (obsidian 0.11.0 → 0.15.0).

> `obsidian` 0.15.0 inclut aussi la formalisation de la convention `Pro/Projets` dans `tree` (`references/tree-convention.md`) — détail dans `plugins/obsidian/CHANGELOG.md`.

## [3.0.0] - 2026-06-13

### Added

- **Plugin `writing`** (1.0.0) — production éditoriale à partir d'un brief : documentation pro (`specification`, `technical-document`, `user-guide`) + craft narratif (`toc`, `write`, `tone-finder`, `persona`, `review`, `storyboard`, `upgrade`). Fusion de `doc-writer` + `rpg-writer`.
- **Plugin `game-writer`** (1.0.0) — contenu narratif jeu vidéo (bank, dialogic-draft, dialogic-review) ; remplace `gamedesign` (renommé).
- **Plugin `sc-godot`** (0.1.0) — coquille Godot/GDScript ; pendant technique de `game-writer`.
- **`obsidian`** (0.13.0) — skill `tree` (organiseur Documents/ piloté par cache) ; skill `brief` (construit `_brief/` autosuffisant) ; 8 skills JDR migrés vers domaines locaux autonomes (`R = <jeu>`, résolution via `_savoir/`) ; réf `jdr-layout.md`.

### Changed

- **Séparation des responsabilités** : `obsidian` assemble les intrants (`brief`, `forge`, `research`, `lore-extract`, `rules-keeper`, `extract-pdf`) ; `writing` produit à partir du brief — sans remonter vers `R` ni `bank.yml`.
- **`obsidian` — modèle JDR autonome (BREAKING)** : abandon de `tnn-jdr` / `~/.jdr.yaml` / variable globale `<vault>`. Savoir durable en `R/_savoir/{systeme,subsystems,univers}/{canon,mj}/` ; campagnes en `R/_campagnes/<c>/<AAAA>/<MM>/` ; résolution locale via marqueur `_savoir/`.

### Removed ⚠ BREAKING

- **Plugin `doc-writer`** — fusionné dans `writing`. Les déclencheurs `/doc-writer:*` sont inactifs.
- **Plugin `rpg-writer`** — fusionné : craft narratif → `writing`, skills JDR + assemblage intrants → `obsidian`. Les déclencheurs `/rpg-writer:*` sont inactifs.
- **Plugin `gamedesign`** — renommé `game-writer`. Les déclencheurs `/gamedesign:*` sont inactifs.
- **`obsidian`** — agents `claude-code-optimizer-jdr` et `documentation-architect-jdr` supprimés (obsolètes).

## [2.0.0] - 2026-06-11

### Added

- **Plugin `design`** (1.0.0) — entonnoir 5 verbes `define → destructure → adjust → enforce → diffuse` avec contrat 3 couches (tokens W3C · manifeste composants · charte prose), linter portable `lint-core.mjs` dérivé du contrat, 3 gates (règles génération, success_condition, pre-commit auto-armé), et pivot hybride vers `sc-php:design-bridge` / `sc-js:design-bridge`.
- **`sc-php`** (0.5.0) — skill `design-bridge` : réceptacle pivot design — linter PHP natif + block patterns WP FSE dérivés du contrat.
- **`sc-js`** (0.7.0) — skill `design-bridge` : réceptacle pivot design — règle ESLint/Biome + composant Vue 3 SFC ou React TypeScript dérivés du contrat.
- **`aidd-overlay`** (2.1.x) — skill `seo-optimize` ; alias `weeklyemail` ; endtask auto-détecte le numéro d'issue depuis 5 sources.
- **Plugin `doc-writer`** (0.1.0) — rédaction professionnelle : `user-guide`, `technical-document`, `specification`.
- **`LICENSE`** (MIT), **`CONTRIBUTING.md`** et ce **`CHANGELOG.md`** à la racine.

### Changed

- **`obsidian`** (0.10.0) — `solo-mc` enrichi (narrateur-agent, oracle agent, grille décisionnelle, substitution compagnon) ; `pc` avec questionnaire de background par genre (mapping GROG).
- **`rpg-writer`** (0.10.0) — migration vers vault layout par jeu ; pipeline canon/MJ ; extract-pdf préserve le brut.
- **`sc-python`** (0.5.2) — modèle pivot v0.5.0 (8 nouveaux pivots, catégorie AP protocol, refonte sniff).
- **`sc-js`** (0.6.8→0.7.0) — perf-vanilla : couverture img-src-dynamic + passive listeners.

### Removed ⚠ BREAKING

- **`design`** — 9 skills supprimés : `setup`, `from-reference`, `from-brief`, `wireframe`, `component`, `audit`, `diagnose`, `refactor`, `export-wordpress`. Tous les déclencheurs `/design:<skill>` correspondants sont inactifs. Voir `plugins/design/CHANGELOG.md` pour la correspondance legacy → 5 verbes.
- **Plugin `hermes`** — retiré du marketplace. La skill `solo-mc` est portée par `obsidian:solo-mc` (Claude Code).

### Fixed

- **`aidd-overlay`** (2.1.4) — endtask : auto-détection numéro d'issue depuis branche, frontmatter, commits.
- **`design`** — skill `doctor` renommé `diagnose` pour éviter la collision avec `/doctor` natif de Claude Code.
- **`sc-python`** — corrections AP protocol (ap-optimize audit v2 + v3).

## [1.0.0] - (unreleased)

### Added

- **Plugin `design`** (0.2.0) — design system mobile-first et responsive : intakes `from-reference` / `from-brief`, tokens W3C (DTCG) + adaptateurs CSS/Tailwind générés, wireframes HTML vivants, composants réutilisables à options, `audit` de conformité, `doctor` + `refactor` pour le code en production, et `export-wordpress` (`theme.json` v3 + block patterns). Règle « jamais d'émoticons » et décision du trio palette/typo/icônes en priorité.

## [1.0.0-initial]

- État initial du marketplace : `aidd-overlay`, `gamedesign`, `writing`, `sc-js`, `sc-php`, `sc-python`, `sc-rust`, `web-tiers`, `obsidian`.
