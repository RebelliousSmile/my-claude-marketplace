# Export ICML

Procédure d'export d'un document `doc-writer` vers **ICML** (Adobe InCopy Markup Language) — le format qui permet de faire couler le contenu dans InDesign/InCopy pour la mise en page. Référencée via `${CLAUDE_PLUGIN_ROOT}/references/export-icml.md`.

## Principe

- **Le Markdown reste la source de vérité** (éditable, versionnable). L'ICML est un **export généré**, jamais édité à la main.
- L'export se déclenche avec `--format icml` ; par défaut le format est `markdown` (pas d'export).
- La conversion passe par **pandoc** (writer ICML natif). On ne génère **jamais** le XML ICML à la main.

## Conversion

À partir du document Markdown finalisé (`<nom>.md`) :

```bash
pandoc <nom>.md -f markdown -t icml --standalone -o <nom>.icml
```

- `--standalone` produit une *story* ICML complète (importable directement). Sans ce flag, pandoc émet un fragment à insérer dans une story existante.
- Écrire le `.icml` à côté du `.md` (même base de nom).

## Mappage des styles

- pandoc émet des **styles de paragraphe** et **de caractère** ICML nommés (« Heading 1 », « Heading 2 », « Body », « Block Quote »…) que le maquettiste **remappe sur les styles InDesign** du gabarit.
- Garder une hiérarchie de titres propre et régulière : c'est ce qui rend le remappage prévisible.
- Les encarts (blockquotes), listes et tableaux Markdown deviennent des paragraphes stylés correspondants.

## Limites à signaler

- **Images** : non embarquées. Les `![](chemin)` deviennent des références ; livrer les fichiers d'images séparément au maquettiste, ou les placer manuellement dans InDesign.
- **Blocs de code** : convertis en paragraphes stylés (pas de coloration syntaxique).
- ICML porte le **contenu et les styles nommés**, pas la mise en page finale (gabarit, gouttières) : c'est le rôle d'InDesign.

## Repli si pandoc est absent

- Vérifier la présence de pandoc (`pandoc --version`).
- S'il manque : **ne pas** tenter d'écrire de l'ICML à la main. Conserver le `.md` comme livrable, signaler que pandoc est requis, et fournir la commande ci-dessus pour que l'utilisateur l'exécute (ou l'installe : <https://pandoc.org/installing.html>).

## Test

`<nom>.icml` existe, est un export pandoc valide du `.md` (mêmes titres/sections), le `.md` source est inchangé, et les limites (images, code) sont signalées si elles s'appliquent.
