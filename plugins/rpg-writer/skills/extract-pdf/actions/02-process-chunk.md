# 02 - Process Chunk

Sessions 2-N : extraire le texte d'un chunk PDF, classifier le contenu dans `classified/*.md`.

## Inputs

- `project_path` (required) — string, format `<univers>/<projet>`
- `source_name` (required) — nom du PDF source sans extension (ex. `engrenages-regles`). Visible dans `docs/extraction/` ou dans `progress.md#Source`.
- `chunk_id` (required) — numéro du chunk (ex. `01`, `02`)

## Depends on

- `setup`

## Outputs

Un ou plusieurs fichiers classifiés dans `docs/extraction/<source-name>/classified/` :
```
classified/
  lore.md             — contenu narratif, historique, monde
  terminology.md      — termes, définitions, glossaire
  style.md            — ton, directives d'écriture, exemples
  rules.md            — règles, mécaniques, stats, modificateurs
  structure.md        — chapitres, parties, sommaire, TOC
  templates.md        — macros LaTeX, patterns, commandes
```

Chaque fichier classifié utilise des marqueurs YAML :
```markdown
---
chunk: XX
pages: N-M
extracted: YYYY-MM-DD
---

[contenu extrait]

---
```

`progress.md` mis à jour : statut `pending` → `done`, date dans la colonne Session.
`raw/chunk_XX.txt` : texte brut extrait du PDF avant classification.

## Process

1. Lire `docs/extraction/<source-name>/progress.md`. Trouver le chunk `chunk_<chunk_id>.pdf`. Si déjà `done` → avertir et demander confirmation avant de retraiter.
2. **Extraire le texte brut** du chunk PDF — essayer dans l'ordre :

   **a) pdftotext** (préféré) :
   ```bash
   pdftotext -layout "docs/extraction/<source-name>/chunks/chunk_<chunk_id>.pdf" - > "docs/extraction/<source-name>/raw/chunk_<chunk_id>.txt"
   ```

   **b) Python fallback** si pdftotext absent :
   ```python
   import pdfplumber, pathlib
   with pdfplumber.open("docs/extraction/<source-name>/chunks/chunk_<chunk_id>.pdf") as pdf:
       text = "\n".join(p.extract_text() or "" for p in pdf.pages)
   pathlib.Path("docs/extraction/<source-name>/raw/chunk_<chunk_id>.txt").write_text(text, encoding="utf-8")
   ```

   **c) OCR** uniquement si le texte est garbled (>30% non-printable après extraction — pour mesurer, utiliser `extract-pdf debug` ou le snippet Python de l'action 04). Tesseract n'accepte pas de PDF, convertir d'abord en images. Utiliser `>` (overwrite) pour remplacer tout fichier brut garbled issu des étapes a) ou b) :
   ```bash
   TMPDIR=$(python -c "import tempfile; print(tempfile.gettempdir())")
   pdftoppm -r 300 "docs/extraction/<source-name>/chunks/chunk_<chunk_id>.pdf" "$TMPDIR/chunk_<chunk_id>_page"
   for f in "$TMPDIR"/chunk_<chunk_id>_page*.ppm; do tesseract "$f" stdout -l fra; done \
     > "docs/extraction/<source-name>/raw/chunk_<chunk_id>.txt"
   ```

3. Vérifier que `docs/extraction/<source-name>/raw/chunk_<chunk_id>.txt` existe et est non-vide. Si vide → relancer l'extraction avec la méthode suivante dans la hiérarchie.
4. Lancer `python scripts/normalize-text.py "docs/extraction/<source-name>/raw/chunk_<chunk_id>.txt" --in-place` pour corriger les artefacts d'encodage.
5. Montrer les 500 premiers caractères. Demander : "Continuer la classification ? [Y/n]"
6. **Passe 1 — Lecture** : lire le chunk en entier sans écrire. Identifier les catégories présentes.
7. **Passe 2 — Classification** :
   - Lore : récits, histoire, dates, événements, lieux
   - Terminology : termes = définitions, glossaire
   - Style : ton, consignes d'écriture, exemples à suivre/éviter
   - Rules : mécaniques, jets de dés, stats, modificateurs (valeurs exactes — ne jamais inventer)
   - Structure : chapitres, sommaire, plan, TOC
   - Templates : macros LaTeX, `\newcommand`, patterns réutilisables
8. **Vérifier** chaque élément extrait contre le texte source. Ne jamais inventer ni extrapoler.
9. Après confirmation : écrire dans `docs/extraction/<source-name>/classified/*.md` avec les marqueurs YAML. Créer les fichiers si inexistants. Si un fichier dépasse 30 000 chars → splitter en `lore-1.md`, `lore-2.md`, etc.
10. Mettre à jour `docs/extraction/<source-name>/progress.md` : `pending` → `done`, date du jour dans la colonne Session.
11. Indiquer les chunks restants et suggérer : `extract-pdf process-chunk <project_path> <source_name> <next_chunk_id>`.

## Test

Après `process-chunk <project_path> <source_name> 01`, vérifier que :
- `docs/extraction/<source-name>/progress.md` montre chunk 01 en statut `done`
- `docs/extraction/<source-name>/raw/chunk_01.txt` existe et est non-vide
- Au moins un `docs/extraction/<source-name>/classified/*.md` a été créé avec des marqueurs YAML
