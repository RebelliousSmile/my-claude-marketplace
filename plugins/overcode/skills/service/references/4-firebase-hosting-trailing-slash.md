---
paths:
  - "firebase.json"
  - "nuxt.config.ts"
  - "server/routes/sitemap.xml.ts"
---

# Firebase Hosting — trailing slash

## Rule

- Convention projet : URLs **sans slash final** (canonical, sitemap, og:url)
- `firebase.json` hosting bloc DOIT contenir `"trailingSlash": false`
- Sans ce flag, Firebase 301 redirige `/foo` → `/foo/` dès qu'un `/foo/index.html` existe (cas standard du prerender Nuxt)

## Pattern d'audit

Quand Lighthouse signale un redirect sur **une seule** page, auditer **toutes** les routes publiques :

```bash
for route in / /about /contact; do
  curl -sI "https://yourdomain.com$route" | grep -E "^HTTP|^location:" | head -2
  echo "---"
done
```

- Lighthouse ne teste qu'une URL → ne révèle pas l'ampleur d'un défaut de config globale
- Un seul redirect signalé = symptôme, pas le périmètre

## Vérifications post-déploiement

- `curl -sI https://yourdomain.com/<route>` doit retourner `200`, pas `301`
- L'inverse (`/<route>/`) reste 301 vers la version sans slash : c'est le redirect natif Firebase, OK
- Sitemap, canonicals et og:url restent sans slash : 1 source de vérité

## Cache headers — glob `**/*.html`

- Bloc `headers` doit utiliser `**/*.html` pour couvrir TOUTES les pages prerendered en une seule règle
- Ne jamais énumérer les routes manuellement (chaque nouvelle page casse la cohérence)
- Cache 1h sur HTML, 1j sur assets statiques

```json
{
  "source": "**/*.html",
  "headers": [{ "key": "Cache-Control", "value": "public, max-age=3600, s-maxage=3600" }]
}
```
