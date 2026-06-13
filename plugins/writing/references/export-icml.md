# Export ICML

Procédure d'export d'un document `writing` vers **ICML** (Adobe InCopy Markup Language) — le format qui permet de faire couler le contenu dans InDesign/InCopy pour la mise en page. Référencée via `${CLAUDE_PLUGIN_ROOT}/references/export-icml.md`.

## Principe

- **Le Markdown reste la source de vérité** (éditable, versionnable). L'ICML est un **export généré**, jamais édité à la main.
- L'export se déclenche avec `--format icml` ; par défaut le format est `markdown` (pas d'export).
- **L'export ICML suppose un fichier** : pandoc ne convertit pas une sortie affichée en chat. Donc `--format icml` **écrit d'abord le Markdown sur disque**, puis convertit — c'est une demande explicite de workflow fichier (cf. « Output destination » de `doc-principles.md`).
- La conversion passe par **pandoc** (writer ICML natif). On ne génère **jamais** le XML ICML à la main.

## Conversion

1. **Écrire le Markdown sur disque** : `<nom>.md`, où `<nom>` vient du chemin fourni par l'utilisateur, sinon d'un slug du sujet (demander si ambigu). Ce `.md` est la source.
2. **Convertir avec pandoc**, en écrivant le `.icml` à côté du `.md` (même base de nom) :

   ```bash
   pandoc <nom>.md -f markdown -t icml -o <nom>.icml
   ```

3. **Vérifier la sortie** : `<nom>.icml` est un XML non vide reprenant titres et sections du `.md`. Si la version de pandoc émet un fragment non importable tel quel, ajouter `--standalone` et re-vérifier. (Le comportement exact de `--standalone` dépend de la version de pandoc — vérifier, ne pas présumer.)

## Mappage des styles

- pandoc émet des **styles de paragraphe** et **de caractère** ICML nommés (« Heading 1 », « Heading 2 », « Body », « Block Quote »…) que le maquettiste **remappe sur les styles InDesign** du gabarit.
- Garder une hiérarchie de titres propre et régulière : c'est ce qui rend le remappage prévisible.
- Les encarts (blockquotes), listes et tableaux Markdown deviennent des paragraphes stylés correspondants.

## Limites à signaler

- **Images** : non embarquées. Les `![](chemin)` deviennent des références ; livrer les fichiers d'images séparément au maquettiste, ou les placer manuellement dans InDesign.
- **Blocs de code** : convertis en paragraphes stylés (pas de coloration syntaxique).
- ICML porte le **contenu et les styles nommés**, pas la mise en page finale (gabarit, gouttières) : c'est le rôle d'InDesign.

## Repli si pandoc est absent ou non exécutable

- Vérifier la présence de pandoc (`pandoc --version`).
- S'il manque, **ou** si l'exécution de commandes shell n'est pas permise dans l'environnement : **ne pas** tenter d'écrire de l'ICML à la main. Conserver le `.md` comme livrable, signaler le blocage, et fournir la commande ci-dessus pour que l'utilisateur l'exécute (ou installe pandoc : <https://pandoc.org/installing.html>).

## Test

`<nom>.icml` existe, est un export pandoc valide du `.md` (mêmes titres/sections), le `.md` source est inchangé, et les limites (images, code) sont signalées si elles s'appliquent.
