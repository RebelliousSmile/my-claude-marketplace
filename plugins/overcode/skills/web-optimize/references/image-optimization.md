# Image optimization

> **Source d'autorité :** `.claude/rules/03-frameworks-and-libraries/03-image-optimization.md` (installé par sc-js).
> Ce fichier est un renvoi — ne pas modifier ici. Modifier `plugins/sc-js/skills/setup/references/03-image-optimization.md`.

Règles clés (résumé non-normatif) :
- Above-fold / LCP : `<img :src="webp">` direct **sans `<picture>`** — le preload scanner Chrome provoque ERR_ABORTED + Inspector Issue si `<picture>` wrapper est utilisé
- Below-fold : `<picture><source type="image/webp"><img src="jpg"></picture>`
- `fetchpriority="high"` obligatoire sur le LCP `<img>` ET son `<link rel="preload">`
- `width` + `height` explicites sur tout `<img>`
