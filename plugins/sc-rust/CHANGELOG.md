# Changelog — sc-rust

## [0.7.2] — 2026-09-16

### Changed

- `cd automata` délègue son enveloppe de livraison à `overcode:deploy`.

## [0.7.1] — 2026-08-28

### Fixed

- `sc-rust:audit` délègue à `aidd-dev:04-audit` avec le pilier `code-quality` et conserve le rapport AIDD comme artefact autoritatif ; le README reflète ce contrat.

## [0.7.0] — 2026-08-28

- CD v2 avec releases, pointeurs, verrous et rollbacks indépendants par cible, via un xtask commun.

## [0.6.0] — 2026-08-28

### Added

- Skill `cd` pour crates, workspaces, services et binaires avec façade Cargo/xtask ou task runner versionné.
- Releases identifiables et réversibles : checksum, cible prouvée, migrations avant bascule atomique, health check et release précédente conservée.

> Baseline établie le 2026-05-29 à partir de l'état courant ; transitions récentes reprises de l'historique git. Détail antérieur : `git log -- plugins/sc-rust`.

## [0.5.2] — 2026-08-05

### Fixed — le corps illustré de `Case A` se lisait comme la liste à reproduire (S8, rouge au run 3)

`sniff/02-install-pivots` posait sa clause de sortie sur le seul **en-tête** — *Pick the header by what actually happened* — et ne disait rien du corps. Le bloc *Case B* voisin, lui, porte `Use this header verbatim`. Le fichier posait donc une norme de copie littérale sur un bloc et **aucune contre-instruction sur l'autre** : un lecteur qui reproduit *Case A* énumère les cibles des tables au lieu de celles qu'il a écrites. C'est le contrôle négatif **S8** de `plugins/web-tiers/skills/setup/evals/pivot-install-scenarios.md`, laissé délibérément non jugé en 0.3.0 et rendu **FAIL** au run 3 sur les quatre installeurs `sniff`.

- **Marqueur d'exemple** sous chaque famille du bloc : `… one line per target actually processed`.
- **Contre-instruction** au-dessus du bloc : les blocs sont des *formes, pas des contenus*, et seuls les pivots que le manifeste liste sont traités — un crate axum + sqlx émet deux lignes, `data-pivots-diesel.md` et `data-pivots-rusqlite.md` n'apparaissent **pas même en `skipped`**.
- **Les `(skipped — not applicable)` sont retirés du corps illustré.** Ils contredisaient la règle d'installation du fichier lui-même, qui boucle *For each pivot in the manifeste* : un pivot absent du manifeste ne peut jamais ressortir en `skipped`. Ajouter le marqueur ne suffisait pas — ce que l'exemple **montrait** était faux.
- **Rust est la stack où les deux défauts se composent** : son cas nominal est `Case B` (aucun pivot applicable), déjà corrigé en 0.5.1 ; quand `Case A` s'ouvre, ses 4 cibles sont assez peu nombreuses pour qu'une recopie intégrale passe pour plausible.

## [0.5.1] — 2026-08-03

### Fixed — l'en-tête d'installation est dérivé de ce qui a été écrit

`sniff/02-install-pivots` n'avait qu'un bloc de sortie, en-tête `✅ pivots installed` compris — écrit quel que soit le nombre de fichiers effectivement produits. C'est le plugin où ce défaut porte le plus loin : **le cas nominal de Rust est de n'avoir aucun pivot applicable** — une CLI, un crate de bibliothèque ou une cible embarquée n'a ni `axum` ni crate SQL, et recevait pourtant « pivots installed ». La sortie se branche maintenant en trois cas : au moins un pivot écrit ou mis à jour · **rien à installer** (en-tête `✅ sc-rust sniff — nothing to install`, verbatim) · tout déjà à jour.

## [0.5.0] — 2026-07-30

### Added — pivot `testing`, mesuré sur un crate binaire Win32, et trois hypothèses du contrat mises à l'épreuve

`skills/sniff/references/capabilities/tools/testing.md` — dix champs du contrat de pivot `testing`, titres repris verbatim, aucune table de correspondance due. Terrain : `winfxstart`, crate binaire natif (`tao` 0.26, `windows` 0.52), 17 fichiers source, **122 tests**, `cargo 1.93.0` / `rustc 1.93.0`, en lecture seule — `CARGO_TARGET_DIR` détourné hors du dépôt, arbre resté strictement propre.

**Ce pivot est le premier écrit contre une stack qui contredit le contrat**, et c'est ce qui en fait autre chose qu'une couverture de plus. Deux des trois hypothèses en cause ont mené à un amendement (`overcode` 4.2.0, DEC-009) ; la troisième est **réfutée** et consignée comme telle.

- **Les populations *source* et *test* se recouvrent totalement.** Mesuré : 122 fonctions `#[test]` réparties sur **12 des 17** fichiers source, **zéro fichier de test dédié**, aucun répertoire `tests/`, aucun doctest. Un glob de fichiers de test au sens JS ou Python rendrait ici *0 test et 17 fichiers de production non testés*. Le pivot déclare la non-disjonction et nomme l'unité réelle — le module annoté `#[cfg(test)]`, pas le fichier.
- **L'attribut `#[cfg(test)]` ne compte pas les suites.** 14 occurrences pour 12 modules de tests : les deux autres annotent des helpers compilés seulement en test — une fonction, et un module `TempDir` maison. Compter les attributs surcompte.
- **La toolchain ne produit aucune couverture.** `cargo test` n'embarque pas de reporter ; `cargo-llvm-cov`, `cargo-tarpaulin` et `cargo-nextest` sont **absents des trois** sur le terrain (`cargo llvm-cov --version` → `error: no such command`). Le pivot fournit donc la commande de **constat du prérequis** avant celle de mesure, et marque les commandes de couverture elles-mêmes comme non exécutées — un outil absent n'est pas un projet fautif.
- **Le repli du champ *Coverage command* ne fonctionne pas sur cette stack.** Le mapping statique module → fichier de test ferait se référencer chaque module lui-même. Le pivot le dit plutôt que de laisser rendre un classement vide de sens.
- **`Anchor boundary` : l'hypothèse d'un contrat centré navigateur est réfutée.** Sa définition oppose déjà « frontière publique réelle du produit » à « rester dans le processus », et la table générique énonce `Anchored does not mean "in a browser."`. Le pivot y positionne la frontière Rust — binaire compilé invoqué, socket réel, `tests/` qui ne voit que le `pub` — et nomme ce qui **n'ancre pas** malgré l'apparence : `#[cfg(test)] mod tests` quelle qu'en soit la lourdeur, `#[tokio::test]`, un routeur exercé in-process, un `TempDir`. Mesuré et contre-intuitif : les tests du terrain écrivent dans le **vrai** système de fichiers via `std::env::temp_dir()` — réel et ancré ne sont pas synonymes.
- **Six pièges d'outillage, en (constat, détection, correctif)**, dont deux mesurés en cours de route : `cargo test` écrit `target/` dans le dépôt mesuré, et aucun décompte n'existe sans compilation complète (52 s à froid ici).
- **Contre-signal utile** : `Cargo.toml` ne porte **aucune** section `[dev-dependencies]`, sur un crate à 122 tests. L'absence de dépendances de test ne signale pas un crate sans tests.

Ce que ce pivot ne fait pas : décider s'il faut un test, ni quel niveau de preuve un cas mérite. Ce que le terrain n'a pas — `tests/`, doctests, couverture, code asynchrone, `[features]` — est marqué **non vérifié** à l'endroit où il apparaît.

`README.md` gagne les sections *Pivots* correspondantes, jusqu'ici absentes pour tous les pivots du plugin.

## [0.4.5] — 2026-07-28

### Changed

- **Les titres `H1` des actions ne portent plus leur numéro** — `# Explain`, plus `# Action 01 — explain`. Le numéro vivait à trois endroits, il n'en occupe plus que deux : le nom de fichier et la table de `SKILL.md`, que le gate de cohérence du marketplace compare désormais. Changement transversal aux onze plugins, détaillé dans le journal du marketplace (3.4.0).

## [0.4.4] — 2026-07-27

### Fixed — discipline de sévérité (l'audit alimente des mutants)

Même correctif transversal que sc-css, transposé au Rust : chaque signal présupposait une propriété du monde puis sur-affirmait la sévérité quand elle était fausse. `audit`/`improve`/`legacy/01-scan` sont read-only mais alimentent `legacy/02-migrate` (mutant, écriture in-place) — un faux verdict devient une mutation destructrice. Correction **inline**, conditionnée à une propriété **mesurée** (signature de fonction, `Cargo.toml`, attribut d'enum), jamais à une stack supposée.

- **(A) Verdict sur propriété supposée → mesurée.** Les règles async/erreurs typées ne nomment plus `tokio`/`thiserror`/`anyhow` par défaut : elles ne s'appliquent qu'aux crates **déclarées dans `Cargo.toml`** ; le défaut runtime-agnostique reste à gauche de la flèche, les noms de crates à droite sont illustratifs (`improve/01-analyze.md`, `sniff/references/capabilities/rust/idioms.md`).
- **(B) Sévérité alimentant la mutation — la seule classe qui casse pour de vrai.** `Arc<Mutex<T>>` écrit une seule fois au démarrage est une propriété **runtime**, absente du scan statique → `info` question, jamais un finding qui pilote le retrait du lock (mauvaise supposition = *data race que le compilateur ne rattrape pas*, contrairement aux fixes async qui sont grep-prouvables et vérifiés à la compilation) (`improve/01-analyze.md § Concurrency`).
- **(C) « Code mort » indécidable au scan statique.** `extern "C"` (souvent un export FFI/cdylib sans appelant intra-crate) et `extern crate` ne sont plus « à retirer » : émission de « non-référencé dans les sources scannées — vérifier l'absence de consommateur FFI/cdylib avant retrait » (`legacy/01-scan.md`).
- **(E) Le moteur d'analyse mal-juge les constructions qu'il recommande.** `\.unwrap\(\)` est un **signal, pas un verdict** : défaut seulement si la fonction retourne `Result`/`Option` **et** l'appel est réellement faillible ; exemption des cas idiomatiques-infaillibles (`write!` vers `String`, regex depuis `const`, `Mutex::lock` poison-only) → `warning`, jamais `HIGH`. `match err { _ => … }` : n'enjoindre d'énumérer les variantes **que si l'enum n'est pas `#[non_exhaustive]`** (`io::Error`/`sqlx::Error`/`rusqlite::Error` exigent le `_` — le retirer produit du code qui ne compile pas) (`improve/01-analyze.md § Error handling`, `legacy/01-scan.md`, `idioms.md`).

## [0.4.3] — 2026-05-29 (baseline)

Knowledge provider Rust (Axum, Actix-web). Skills : `sniff`, `audit`, `improve`, `legacy`, `log-analysis`, `teach`.

### Added
- Capability pivot **Tauri** (IPC, state, async, sécurité, chemins) — bump 0.4.2 → 0.4.3.
- `improve` : Step 1.5 — chargement des capability pivots pour les anti-patterns spécifiques à la stack.

## [0.4.1]
- `legacy` : ajout de `references/` (patterns dépréciés / spécifiques à une édition).

## [0.4.0]
- Alignement sur le modèle sc-php v0.4.0 : sniff à deux niveaux (pivot model), skill `audit` déléguant la revue, evals. Bump 0.3.0 → 0.4.0.

## Antérieur
- Voir `git log -- plugins/sc-rust` pour l'historique complet.
