# SC-CD — modèle de livraison v2

Source de vérité normative : `tools/sc-cd/contract.md`, `tools/sc-cd/project-contract.schema.json` et `tools/sc-cd/differential-sync.md`. Cette mémoire explique l'architecture ; elle ne remplace pas ces contrats.

## Unité de livraison

Un projet possède une seule façade applicative `deploy:*` et une ou plusieurs cibles nommées. Chaque cible déclare indépendamment :

- une phase `staging` ou `production` ;
- un mode `server` ou `automata` ;
- un fournisseur et un contexte d'exécution ;
- une invocation exacte, un verrou et une `lifecycleRevision` ;
- ses preuves, sa récupération et les noms de secrets requis.

Passer une cible de `server` à `automata` change seulement l'enveloppe d'exécution. La façade, ses arguments et son verdict restent identiques. Les verrous sont par cible afin que deux instances indépendantes puissent être livrées en parallèle.

## Autorité des surfaces

Les surfaces `code`, `schema`, `data` et `media` sont toujours séparées.

| Phase | Code et schéma | Données et médias |
| --- | --- | --- |
| staging | local autoritatif | local autoritatif ; miroir possible avec gardes |
| production | local autoritatif | cible autoritative ; envoi local refusé |

Une livraison part seulement du workspace local ou d'un checkout automatisé propre du même ref immuable. Le contrat ne représente ni `pull:*` ni flux cible-à-cible : une instance fédérée ne devient jamais la source d'une autre.

## Synchronisation persistante

Un miroir staging compare deux manifestes normalisés contenant chemin, type, taille et empreinte. Il affiche ajouts, modifications, suppressions et octets transférables avant mutation. Les contenus de même empreinte, y compris les gros médias, ne sont pas retransmis ; une reprise saute les fichiers déjà vérifiés.

Rsync est préféré lorsque ses capacités sont prouvées. Sinon, le fallback manifeste transfère fichier par fichier avec partiels sûrs, remplacement atomique et vérification finale. L'absence de liste, d'empreinte, de reprise ou de preuve finale arrête l'opération ; elle n'autorise jamais une archive complète de secours.

## Promotion fail-closed

Une promotion staging vers production sur place exige la quiescence des écritures applicatives. Sous le verrou cible : dernier aperçu stable, sauvegarde fraîche et preuve saine, puis augmentation de la garde distante avant la mise à jour du contrat et des enveloppes. Une ancienne enveloppe staging rencontre alors une révision périmée et échoue avant toute mutation.

Après une interruption postérieure à la garde, la reprise termine la promotion sans réactiver le miroir. `lifecycleRevision` ne diminue jamais, même pendant un rollback applicatif. Sans capacité de quiescence, la promotion sur place est refusée et une nouvelle cible est requise.

## Responsabilités des plugins

- `sc-css`, `sc-js`, `sc-php`, `sc-python` ou `sc-rust` possèdent la façade et les décisions propres à la stack.
- Les contributions composites restent bornées sous un seul propriétaire racine.
- `overcode` consomme une cible validée et ne possède que ses prérequis fournisseur et son enveloppe mince ; il ne copie ni build, ni migration, ni inventaire, ni synchronisation.
- Les capacités d'Alwaysdata, Railway ou d'un stockage sont des faits vérifiés par cible, jamais des suppositions dérivées du fournisseur.
