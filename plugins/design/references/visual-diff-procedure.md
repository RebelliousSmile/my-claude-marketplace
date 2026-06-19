# Procédure — visual-diff pass (complémentaire à l'oracle style)

## Quand l'utiliser

En parallèle de l'oracle style (`measure.py`), dans §4 de la méthode copycat. Elle couvre ce
que `getComputedStyle` ne peut pas mesurer sur les éléments mappés, et révèle les zones hors
config (éléments non mappés).

## Ce que l'oracle style ne voit pas

| Invisible à getComputedStyle | Exemple typique |
|---|---|
| Espacements relationnels | gap visuel entre cartes > gap déclaré (margin collapsing, stacking context) |
| Éléments hors config | section entière absente du selector mapping |
| Effets composites | box-shadow + border-radius perçus comme « border » ; gradient overlay masquant une image |
| Décalages de positionnement | z-index, transform: translateY, sticky header qui pousse le contenu |
| Typographie perçue vs calculée | line-height juste mais interlignage visuel différent (leading trim, descenders) |
| États injectés par le CMS | ::before/::after WP, focus outline, classes utilitaires ajoutées dynamiquement |

## Commandes

```bash
# 1 — captures full-page par breakpoint (mockup + cible)
#     Même config JSON que measure.py — maquette_url, wp_url, breakpoints réutilisés.
python ${CLAUDE_PLUGIN_ROOT}/adapters/measure/screenshot.py \
  --config <config-projet> \
  --out <projet>/<qa-dir>/shots/<page>
# → <page>__maq__desktop.png  /  <page>__wp__desktop.png  (+ mobile, tablet)

# 2 — pixel diff par breakpoint
python ${CLAUDE_PLUGIN_ROOT}/adapters/measure/pixeldiff.py \
  --a <shots>/<page>__maq__<bp>.png \
  --b <shots>/<page>__wp__<bp>.png \
  --out <projet>/<qa-dir>/shots/<page>/<bp>
# → <bp>-diff.png  (pixels divergents en magenta)
# → <bp>-sbs.png   (côte-à-côte : maquette | wp | diff)
```

## Analyse des diff images

Lire le `-sbs.png` par breakpoint. Pour chaque **bloc magenta continu** :

1. **Localiser** — quelle section de page, quel composant.
2. **Décrire l'écart** — « gap inter-cartes ~32px maquette vs ~16px wp ».
3. **Identifier le CSS probable** — gap, margin, padding, transform, z-index, box-shadow…
4. **Classifier à la couche** — token / markup / component / content (mêmes routes que §5).
5. **Estimer la confiance** :
   - `high` — bloc magenta net et localisé, écart visuel évident, cause probable identifiable
   - `medium` — probable mais ambigu (margin collapsing ? z-index context ?) — vérifier avant de corriger
   - `low` — pixels isolés, bruit de rendu probable → **ne pas corriger sans validation humaine**

**Filtrer le bruit** : ignorer les zones < ~5px linéaires isolés. Bruit typique : arêtes de
texte (font hinting), coins arrondis (sub-pixel anti-aliasing), bords de shadow dégradés.

## Format des rows visuelles

Les zones alimentent les `rows:` du fragment copycat avec `source: visual` :

```yaml
rows:
  - element: "Offres — gap inter-cartes"
    prop: gap
    mockup_value: "~32px visuel"
    current_value: "~16px visuel"
    breakpoint: desktop
    source: visual       # distingue de source: measured (oracle getComputedStyle)
    confidence: high
    routed_layer: token
    action: align
  # confidence: low → zone_noise séparée, pas de correction auto
```

Les deltas `confidence: low` vont dans une section `visual_noise:` du fragment (signalés,
pas actionnés — l'humain valide avant toute correction).

## Clôture d'un delta visuel

Un delta `source: visual` n'est **pas clos par re-capture seule**. Séquence obligatoire :

1. Corriger à la source.
2. **Re-mesurer via l'oracle** (`measure.py`) — si la propriété est mesurable, le verdict
   CLOSED confirme la correction de façon déterministe.
3. Re-capturer pour confirmation visuelle (effets composites non mesurables par style).

Si l'oracle reste CLOSED après correction mais le diff persiste → l'écart n'est pas rattachable
à une propriété CSS mesurable → investiguer (effet composite, état injecté, rendu natif spécifique).
Options : enrichir le config oracle pour couvrir la propriété manquante, ou ledger entry si
l'écart est délibéré.
