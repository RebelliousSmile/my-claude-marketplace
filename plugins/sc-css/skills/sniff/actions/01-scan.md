# Action 01 — scan

## Rôle

Analyser les fichiers CSS/SCSS/Less du projet pour détecter l'architecture, la stack, et le degré de maturité. Émettre un pivot manifeste JSON.

## Procédure

1. **Localiser les fichiers CSS** : chercher `**/*.css`, `**/*.scss`, `**/*.less` (exclure `node_modules`, `.cache`, `dist/` générés).
2. **Détecter le préprocesseur** : lire `package.json` → `dependencies`/`devDependencies` pour `sass`, `postcss`, `less`. Vérifier la présence de `postcss.config.*`.
3. **Détecter le linter** : chercher `.stylelintrc*`, `stylelint.config.*`, entrée `stylelint` dans `package.json`/`biome.json`.
4. **Identifier l'architecture** :
   - Lire un échantillon de fichiers (les 5 plus volumineux hors variables/tokens).
   - Compter : classes `__` + `--` (BEM), classes utilitaires systématiques (Tailwind/utility), `@layer`, `var(--`.
   - Classifier : BEM / utility-first / CSS Modules / ITCSS / ad-hoc (mixte ou aucun pattern dominant).
5. **Mesurer l'adoption custom properties** : pourcentage de valeurs de couleur/spacing/typo exprimées en `var(--` vs valeurs littérales.
6. **Mesurer l'adoption cascade layers** : présence de déclarations `@layer` → `none / partial / full`.
7. **Émettre le pivot manifeste** :
   ```json
   {
     "preprocessor": "scss | postcss | less | none",
     "linter": "stylelint | biome | none",
     "architecture": "bem | utility | modules | itcss | adhoc",
     "custom_properties_adoption": "none | partial | full",
     "cascade_layers": "none | partial | full",
     "files_scanned": 42,
     "pivots_recommended": ["improve/custom-properties", "improve/cascade-layers", "legacy/float-to-flex"]
   }
   ```

## Output

Plain-text :
```
✅ Préprocesseur : SCSS (sass 1.77)
✅ Linter : Stylelint (.stylelintrc.json)
✅ Architecture : BEM (classes __ / -- dominantes sur 38/42 fichiers)
⚠️ Custom properties : partiel — 12% des valeurs de couleur en var(--)
❌ Cascade layers : aucun @layer détecté
📄 Pivot manifeste : <chemin>/css-pivot.json
```
