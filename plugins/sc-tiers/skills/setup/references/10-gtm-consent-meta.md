# GTM Consent Mode v2 + tracking

## Règle critique — format des commandes consent

GTM Consent Mode v2 **ignore silencieusement** `dataLayer.push(['consent', ...])` (format Array).
Les commandes consent doivent obligatoirement passer par `window.gtag()` qui crée un objet `Arguments`.

```js
// ❌ Format Array — GTM l'ignore comme commande consent
window.dataLayer.push(['consent', 'update', { ad_storage: 'granted' }])

// ✅ Arguments via gtag() — reconnu par GTM
window.gtag('consent', 'update', { ad_storage: 'granted' })
```

## Pattern ensureGtag()

Définir `window.gtag` avant tout appel consent, même avant que GTM ne soit chargé :

```js
function ensureGtag() {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  // Doit être une function expression — le mot-clé `arguments` est requis par GTM
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments) }
}
```

`ensureGtag()` est idempotente — sûr d'appeler plusieurs fois.

## État par défaut (avant choix utilisateur)

```js
ensureGtag()
window.gtag('consent', 'default', {
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  ad_storage: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500,  // ms d'attente avant de déclencher les tags
})
```

## Mise à jour après choix utilisateur

```js
ensureGtag()
window.gtag('consent', 'update', {
  ad_user_data: 'granted/denied',       // advertising
  ad_personalization: 'granted/denied', // advertising
  ad_storage: 'granted/denied',         // advertising → contrôle Meta Pixel
  analytics_storage: 'granted/denied',  // analytics → contrôle GA4
  personalization_storage: 'granted/denied', // behavior
})
// functionality_storage et security_storage NE sont PAS inclus dans l'update
```

## Catégories de consentement

| Catégorie | Contrôle | Signaux Consent Mode v2 |
|---|---|---|
| `essential` | Toujours granted | — |
| `analytics` | GA4 | `analytics_storage` |
| `behavior` | Microsoft Clarity | `personalization_storage` |
| `advertising` | Meta Pixel | `ad_storage`, `ad_user_data`, `ad_personalization` |

## Initialisation GTM (chargement lazy)

Ne pas injecter le snippet GTM inline dans `<head>`. Charger GTM via script dynamique après consentement :

```js
// 1. Initialiser le dataLayer AVANT le script
window.dataLayer = window.dataLayer || []
window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })

// 2. Injecter le script async
const script = document.createElement('script')
script.async = true
script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX'
script.onload = () => syncConsentToDataLayer()  // réémettre le consent après chargement GTM
document.head.appendChild(script)
```

GTM doit recevoir `syncConsentToDataLayer()` deux fois : avant injection (consent déjà donné) et dans `onload` (GTM relit le consent à l'init).

## Event `cookie_consent_updated` — bridge consent → GTM

Pousser cet event personnalisé dans `dataLayer` après chaque mise à jour du consent. C'est le signal que les tags GTM utilisent pour savoir quelles catégories sont accordées :

```js
window.dataLayer.push({
  event: 'cookie_consent_updated',
  consent_analytics: Boolean(categories.analytics),
  consent_behavior: Boolean(categories.behavior),
  consent_advertising: Boolean(categories.advertising),
  gtm_ga4_enabled: Boolean(categories.analytics),  // variable GTM pour bloquer GA4 si false
})
```

Cet event est un push `dataLayer` ordinaire (pas via `gtag()`).

## Variable GTM `gtm_ga4_enabled`

GTM peut charger avec le consentement **advertising uniquement** (Meta Pixel seul, sans GA4).
Dans ce cas, les tags GA4 ne doivent pas se déclencher.

Pattern : créer une variable GTM de type "variable de couche de données" → `gtm_ga4_enabled`.
Ajouter cette variable comme condition d'activation sur tous les tags GA4 (`gtm_ga4_enabled equals true`).

| Scenario | `analytics` | `advertising` | GTM chargé | GA4 | Meta Pixel |
|---|---|---|---|---|---|
| Tout accepté | ✓ | ✓ | ✓ | ✓ | ✓ |
| Analytics seul | ✓ | ✗ | ✓ | ✓ | ✗ |
| Advertising seul | ✗ | ✓ | ✓ | ✗ | ✓ |
| Tout refusé | ✗ | ✗ | ✗ | ✗ | ✗ |

## Condition de chargement GTM

GTM se charge si `analytics` OU `advertising` est accordé. Clarity nécessite `behavior`.

```js
// GTM
shouldLoadGtm = categories.analytics || categories.advertising

// Clarity
shouldLoadClarity = categories.behavior
```

## Ordre des plugins (Nuxt)

Nommer les plugins avec des préfixes numériques pour garantir l'ordre d'exécution :

1. `01-cookie-consent.client.js` — émet `gtag('consent', 'default', {...})` → état denied par défaut
2. `lazy-analytics.client.js` — charge GTM/Clarity après consentement

`syncConsentToDataLayer()` doit être appelé :
- Juste avant l'injection du script GTM (pour envoyer l'état courant)
- Dans le callback `onload` du script GTM (GTM relit le consent à l'initialisation)

## Taxonomie des fonctions de push

| Fonction | Gate consent | Clarity | Usage |
|---|---|---|---|
| `trackCustomEvent(name, params)` | analytics seul | ✓ | Events UX / comportement (results_loaded, swipe) |
| `pushGtmEvent(name, params)` | analytics OU advertising | ✗ | Events de conversion (signup, email_verified) |

Règle de classification : un event qui déclenche une balise Meta Pixel dans GTM → `pushGtmEvent`.

## Déduplication des events de conversion

| Event | Scope | Stockage |
|---|---|---|
| `email_verified` | par uid | `sessionStorage` — re-fire autorisé en nouvelle session |
| `signup_candidate_completed` | par uid | `sessionStorage` — scoped à l'onglet |
| `inscription_*_complete` | par uid | `sessionStorage` — scoped à l'onglet |

```js
// ❌ localStorage pour un event de conversion → bloque les sessions suivantes
alreadyFired("local", "email_verified", uid)

// ✅ sessionStorage → 1 fire par session, re-fire si nouvelle session
alreadyFired("session", "email_verified", uid)
```

## Meta Pixel

Meta Pixel est géré entièrement via GTM — aucun code client direct requis.
Il se déclenche quand `ad_storage: granted` dans le consent update.
Si le format Array est utilisé à la place de `gtag()`, Meta Pixel ne reçoit pas les signaux de consent corrects et se déclenche en mode dégradé (ou systématiquement).

## Validation manuelle (Tag Assistant)

Le Consent Mode v2 ne peut pas être validé par des tests automatisés — les tests unitaires ne touchent pas au comportement réel de GTM.

Checklist après chaque déploiement affectant le consentement :
1. Ouvrir Tag Assistant sur l'URL de production
2. Accepter tout → vérifier que GTM reçoit `ad_storage: granted`, `analytics_storage: granted`
3. Refuser tout → vérifier `ad_storage: denied`, `analytics_storage: denied`
4. Confirmer que Meta Pixel ne se déclenche **pas** quand `ad_storage: denied`
5. Vérifier que l'event `email_verified` apparaît dans le dataLayer après vérification email
