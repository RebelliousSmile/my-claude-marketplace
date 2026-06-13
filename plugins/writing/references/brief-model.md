# Modèle de travail `writing` — brief → output

Source de vérité partagée par **tous** les skills `writing`. `writing` **produit à partir d'un brief** et écrit dans un répertoire de **sortie séparé**. Les deux répertoires sont des **chemins indépendants** passés à chaque invocation.

> `writing` est **totalement découplé** : aucune notion de `bank.yml`, de vault, de chemin global (`~/.jdr.yaml`, racine absolue). Les chemins sont **locaux et portables** — déplacer `<brief>`/`<output>` ailleurs ne casse rien, car tout le contexte vit dans `<projet>/` (`<brief>` + `<output>`). `writing` ne lit **jamais** hors de `<projet>/`.
>
> **Convention de nommage** : par défaut `<brief>` = `_brief/` et `<output>` = `_output/` (répertoires de **travail**, donc préfixés `_` ; leur contenu interne n'est pas préfixé). Ils vivent côte à côte dans le **projet** (unité de travail) `<projet>/`, typiquement `R/<Year>/<Month>/mon-projet/` — où `R` est le **domaine** (qui héberge les ressources globales, hors périmètre de `writing`). `_brief/` est produit en amont par **`obsidian:brief`**, qui consolide *inline* les globales de `R` ; `writing` ne lit donc jamais hors de `<projet>/`. La convention d'organisation `R`/`<projet>` dans `Documents/` est portée par **`obsidian:tree`**.

## Entrée — répertoire de brief `<brief>/` (lecture seule)

```
<brief>/
  summary.md        ← brief AUTOSUFFISANT
  personas/         ← 0+ personas lecteurs (YAML)
  output-styles/    ← 1+ styles d'écriture
```

- **`summary.md`** — la **seule** source de contexte. Contient : concept/synopsis, consignes, **langue** (défaut : français), **type** (roman / JDR / guide / texte court), **et le lore/données pertinents déjà consolidés** par `obsidian`. Si une information manque, le brief est incomplet : ne pas aller la chercher ailleurs — le signaler.
- **`personas/`** — fichiers YAML de persona lecteur, consommés par `review`. Peut être vide.
- **`output-styles/`** — fichiers de convention d'écriture (voix, ton, temps, densité…), consommés par `write` et `review`. Au moins un.

## Sortie — répertoire `<output>/` (écriture)

```
<output>/
  toc/              ← OPTIONNEL (absent si écriture courte)
    INDEX.md        ← table des matières (synopsis + key points par chapitre)
    chapter-<NN>.md ← spec détaillée par chapitre (sur demande)
  chapters/
    chapter-<NN>.md ← contenu rédigé
  review/           ← OPTIONNEL — sorties de review
    chapter-<NN>-<persona>.md  ← feedback persona, consommé par write --feedback et upgrade
```

- **`toc/`** est **optionnel** : une écriture courte n'a **pas de TOC** (0 toc). Quand elle existe, `INDEX.md` est produit par `toc`, les specs `chapter-<NN>.md` à la demande.
- **`chapters/`** contient **1 fichier ou plus**. Un texte court tient en **un seul** `chapter-01.md`.
- Numérotation **2 chiffres** : `chapter-01.md`, `chapter-02.md`, … `chapter-10.md`.

## Invocation

Chaque skill prend `<brief>` en **argument positionnel** et `<output>` via **`--out`** :

```
/writing:toc   <brief> --out <output>
/writing:write <brief> --out <output> --chapter <NN> [--feedback <comment-file>]
/writing:review <output>/chapters/chapter-<NN>.md --brief <brief>
```

## Flux type

`obsidian` assemble `<brief>/` → `writing:toc` écrit `<output>/toc/INDEX.md` (si projet long) → `writing:write` écrit `<output>/chapters/chapter-<NN>.md` → `writing:review` relit depuis `<output>/chapters/` avec les `<brief>/personas/` et `<brief>/output-styles/`.

## Rôle des skills writing dans ce modèle

| Skill | Lit | Écrit |
|---|---|---|
| `toc` | `<brief>/summary.md` | `<output>/toc/INDEX.md` (+ specs) |
| `write` | `<brief>/` + `<output>/toc/` (si présent) | `<output>/chapters/chapter-<NN>.md` |
| `review` | `<output>/chapters/` + `<brief>/personas/` + `<brief>/output-styles/` | `<output>/review/chapter-<NN>-<persona>.md` |
| `persona` | (description) | `<brief>/personas/<nom>.yaml` |
| `tone-finder` | sources de style | `<brief>/output-styles/<nom>.md` |
| `storyboard` | `<output>/chapters/chapter-<NN>.md` | `<output>/storyboard/chapter-<NN>.md` |
| `upgrade` | un texte (`<output>/chapters/…` ou prompt) | version améliorée |
