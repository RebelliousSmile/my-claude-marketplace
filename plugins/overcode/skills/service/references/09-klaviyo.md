# Klaviyo integration rules

## API authentication

- Private API key côté serveur uniquement (Cloud Functions / Nitro) — jamais dans le bundle client
- Header obligatoire sur chaque requête : `revision: 2024-10-15`
- Authorization : `Klaviyo-API-Key <private_key>`
- Base URL : `https://a.klaviyo.com/api`

## Gestion des profils

### Pattern 2 appels (subscribe)

`/profile-subscription-bulk-create-jobs` n'accepte que `email` + `subscriptions`.
Envoyer `first_name`, `last_name`, ou `properties` → 400 error.

Toujours séparer en 2 appels séquentiels côté Cloud Function :
1. POST `/profiles` — créer/mettre à jour le profil avec name, properties, userType
2. POST `/profile-subscription-bulk-create-jobs` — abonner avec email + consent uniquement

```js
// ❌ Un seul appel avec toutes les données
POST /profile-subscription-bulk-create-jobs { email, first_name, properties }  // → 400

// ✅ 2 appels séquentiels
await createOrUpdateProfile({ email, first_name, last_name, properties })
await addToList(email, listId)
```

### Fallback 409 → PATCH

POST `/profiles` retourne 409 si l'email existe déjà. Le corps de l'erreur contient `errors[0].meta.duplicate_profile_id`.

```js
// ❌ Ignorer le 409
try { await request('/profiles', {...}) } catch { /* skip */ }

// ✅ POST → 409 → PATCH
try {
  return await request('/profiles', { method: 'POST', body: JSON.stringify({ data: { type: 'profile', attributes } }) })
} catch (error) {
  if (error.status === 409) {
    let profileId = JSON.parse(error.responseBody)?.errors?.[0]?.meta?.duplicate_profile_id
    if (!profileId) {
      const search = await request(`/profiles?filter=equals(email,"${attributes.email}")`)
      profileId = search?.data?.[0]?.id
    }
    if (profileId) {
      await request(`/profiles/${profileId}`, { method: 'PATCH', body: JSON.stringify({ data: { type: 'profile', id: profileId, attributes } }) })
      return profileId
    }
  }
  throw error
}
```

### Recherche par email

```js
GET /profiles?filter=equals(email,"user@example.com")
// Toujours encodeURIComponent(email) dans les tests E2E qui construisent cette URL
```

## Listes et abonnements

### Listes séparées par type d'utilisateur

Utiliser deux listes distinctes — ne pas utiliser une liste unique avec un champ `userType` :
- `KLAVIYO_LIST_CANDIDATES` — candidats
- `KLAVIYO_LIST_RECRUITERS` — recruteurs

Tous les utilisateurs sont ajoutés à leur liste à l'inscription, quelle que soit la préférence newsletter.

### Newsletter opt-in

La préférence newsletter = propriété personnalisée du profil (`newsletter_opt_in: true/false`), pas l'appartenance à une liste.
Ne pas désinscrire de la liste quand l'utilisateur opt-out newsletter — mettre à jour la propriété uniquement.

### Single opt-in obligatoire pour les tests

Les listes doivent être en `single_opt_in` pour une subscription immédiate.
`double_opt_in` nécessite confirmation par email — le profil apparaît mais `subscribed = false` jusqu'à confirmation.

## Suppression de profil

L'API Klaviyo n'a pas de `DELETE /profiles/:id`.
Pour les tests : marquer le profil avec une propriété custom :

```js
await request(`/profiles/${profileId}`, {
  method: 'PATCH',
  body: JSON.stringify({
    data: { type: 'profile', id: profileId, attributes: { properties: { _test_deleted: true, _deleted_at: new Date().toISOString() } } }
  })
})
```

## Chargement côté client (plugin Nuxt)

- Charger le script Klaviyo en lazy via `requestIdleCallback` (fallback : `setTimeout(fn, 1200)`)
- Restreindre aux routes marketing — ne jamais charger sur les routes authentifiées (`/moncompte`, `/admin`, etc.)
- Rendre le chargement idempotent : vérifier l'existence du script tag avant injection
- Les appels Firebase Functions doivent être lazy-importés pour éviter le coût bundle au démarrage

## Tests E2E

- L'abonnement à une liste Klaviyo est asynchrone — utiliser des retries pour vérifier la membership après `getProfileByEmail()`
- Flux : `getProfileByEmail(email)` → `getProfileLists(profileId)` avec polling
- Utiliser des emails Gmail avec alias : `user+label-timestamp@gmail.com`
- `KLAVIYO_PRIVATE_KEY` dans `.env.test` (pas `.env`)
- Après chaque test : marquer le profil `_test_deleted: true` — pas de vraie suppression possible
