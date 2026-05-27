---
paths:
  - "**/*.html"
  - "index.html"
  - "nuxt.config.ts"
  - "vite.config.ts"
  - "public/**"
---

# Networking — stratégie preconnect / dns-prefetch

## Règle

Utiliser `preconnect` uniquement pour les origines sur le **chemin de rendu critique**.
Utiliser `dns-prefetch` pour les scripts différés ou déclenchés par interaction.

| Type de ressource | Hint |
|---|---|
| CDN d'images above-fold, CDN de polices | `preconnect` |
| Analytics différés (GTM, Klaviyo, Clarity) | `dns-prefetch` |
| Origine non utilisée (aucune requête confirmée) | supprimer |

## Avant d'ajouter un preconnect

Toujours vérifier que l'origine est réellement utilisée :

```bash
grep -r "fonts.googleapis\|fonts.gstatic\|<origin>" assets/ pages/ components/ public/
```

0 résultats → supprimer le preconnect.

## Pourquoi

`preconnect` établit TCP + TLS immédiatement (~150ms par connexion).
Pour les scripts différés (chargés après interaction ou idle), cela gaspille la connexion avant qu'elle soit nécessaire.
`dns-prefetch` résout seulement le DNS (~20ms) — adapté aux scripts hors chemin critique.

## Application

**HTML statique** :
```html
<!-- ✅ CDN above-fold confirmé → preconnect -->
<link rel="preconnect" href="https://your-image-cdn.com">
<!-- ✅ analytics différé → dns-prefetch uniquement -->
<link rel="dns-prefetch" href="https://www.googletagmanager.com">
```

**Nuxt (`nuxt.config.ts`)** :
```ts
link: [
  { rel: 'preconnect', href: 'https://your-image-cdn.com' },
  { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
]
```

Auditer chaque `rel: 'preconnect'` existant : si l'origine n'est utilisée que par un script différé, rétrograder en `dns-prefetch`.
