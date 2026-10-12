# Stripe integration rules

## Clés et client

- Clé restreinte (`rk_`) au moindre privilège, jamais une clé secrète complète (`sk_`) ; une clé par environnement
- Clé et secret de signature du webhook dans le coffre de secrets de la plateforme — jamais dans le code, un fichier versionné, le bundle client, un log ou un message d'erreur
- Un seul module applicatif instancie le client (les scripts autonomes créent le leur) : instance (`new Stripe(key, { apiVersion })`), jamais la clé globale du module ; instanciation paresseuse quand le secret n'existe qu'à l'exécution
- `apiVersion` épinglée sur celle du SDK installé ; les scripts annexes importent la même constante
- Identifiants de prix lus dans la configuration, jamais écrits dans le code ; un seul module porte la correspondance offre ↔ prix, dans les deux sens
- Montants définis à un seul endroit, lu par l'affichage et par les contrôles Stripe
- Si Stripe.js est chargé : CSP avec `https://*.stripe.com` dans `script-src`, `frame-src`, `connect-src`

## Checkout

- Checkout Sessions (hébergé ou embarqué) pour tout paiement en session ; jamais Charges, Sources, Tokens ni Card Element
- Ne jamais passer `payment_method_types` (sauf Terminal) : les moyens de paiement se règlent dans le Dashboard
- `automatic_tax` uniquement avec un enregistrement fiscal actif, sinon aucune taxe n'est collectée
- `integration_identifier` sur `checkout.sessions.create` (API ≥ `2026-03-25.dahlia`), libellé suffixé de 8 lettres aléatoires
- La session est créée côté serveur après gardes, dans l'ordre : appelant authentifié, offre ouverte à ce compte, éligibilité recalculée côté serveur, prix configuré, aucun abonnement encore ouvert chez Stripe
- Statuts d'un abonnement encore ouvert : `active`, `trialing`, `past_due`, `unpaid`, `paused`, `incomplete`
- Une seule session ouverte par client : expirer les sessions `open` avant d'en créer une
- `client_reference_id` et `subscription_data.metadata` portent l'identifiant du compte
- URLs de retour construites côté serveur : origine reprise seulement si elle figure sur une liste blanche, repli sur la production ; aucune URL fournie par le client n'est transmise à Stripe

```js
// ❌ Moyens de paiement figés, URL dictée par le client
stripe.checkout.sessions.create({ payment_method_types: ['card'], success_url: data.returnUrl, ... })

// ✅ Moyens de paiement du Dashboard, URL résolue côté serveur
stripe.checkout.sessions.create({
  mode: 'subscription',
  customer: customerId,
  client_reference_id: accountId,
  line_items: [{ price, quantity: 1 }],
  subscription_data: { metadata: { accountId, plan } },
  success_url: `${allowedOrigin(origin)}${path}?checkout=success`,
  cancel_url: `${allowedOrigin(origin)}${path}?checkout=cancel`,
  integration_identifier
})
```

## Lien client Stripe ↔ compte

- Lien stocké côté serveur, fermé au client applicatif, lisible dans les deux sens (compte → client, client → compte)
- `metadata` du client Stripe porte l'identifiant du compte
- Créations concurrentes : écriture du lien en création stricte ; le perdant supprime le client Stripe qu'il vient de créer et relit le lien

## Webhook

Obligatoire dès qu'un état dépend d'un paiement — jamais une étape à différer.

- Signature vérifiée sur le corps **brut** avant tout traitement ; signature invalide → 400, méthode autre que POST → 405
- L'événement n'est qu'un signal : le traitement relit l'état chez Stripe ; ni l'ordre d'arrivée ni le contenu de l'événement ne font foi
- Idempotence par `event.id` : marqueur en création stricte ; déjà présent → doublon ignoré, réponse 200
- Traitement en échec : retirer le marqueur et répondre 500 pour que Stripe relance
- Ne jamais journaliser le corps de l'événement — seulement `event.id`, `event.type`, `error.type`, `error.code`
- Abonnements : `customer.subscription.created|updated|deleted`, `invoice.paid`, `invoice.payment_failed`, `checkout.session.completed`
- Paiement ponctuel : `checkout.session.completed` et `checkout.session.async_payment_succeeded`, livraison seulement si `payment_status` ≠ `unpaid` ; `checkout.session.async_payment_failed` pour l'échec

```js
// ❌ Corps parsé, contenu de l'événement recopié tel quel
const event = req.body
await saveSubscription(event.data.object)

// ✅ Corps brut vérifié, état relu chez Stripe
const event = stripe.webhooks.constructEvent(req.rawBody, req.headers['stripe-signature'], webhookSecret)
await syncSubscriptionForCustomer(customerIdOf(event))
```

## Synchronisation de l'état

- Une seule fonction écrit le résumé d'abonnement du compte ; webhook, retour de Checkout et mutations passent tous par elle
- Le résumé n'est jamais modifiable par le client applicatif (règles de la base)
- Aucune écriture si le résumé est inchangé
- Lister les abonnements du client tous statuts confondus ; retenir l'abonnement ouvert le plus récent, sinon le plus récent ; plus d'un abonnement ouvert → erreur journalisée
- La fin de période se lit sur l'item (`items.data[0].current_period_end`), plus sur l'abonnement (API ≥ `2025-03-31`)
- Résiliation programmée : `cancel_at_period_end === true` **ou** `cancel_at` numérique — le portail client pose une date `cancel_at` et laisse `cancel_at_period_end` à faux
- Reprise : `cancel_at_period_end: false`, plus `cancel_at: ''` quand une date est posée
- Abonnement `incomplete` : annulation immédiate, jamais programmée à l'échéance
- Seuls `active` et `trialing` ouvrent les droits
- Stocker `livemode` dans le résumé

```js
// ❌ Ignore une résiliation faite depuis le portail
const scheduled = subscription.cancel_at_period_end

// ✅
const scheduled = subscription.cancel_at_period_end === true || typeof subscription.cancel_at === 'number'
```

## Retour de Checkout

- La page de retour ne livre rien : elle déclenche la resynchronisation serveur
- Retirer le paramètre de retour de l'URL avant tout traitement — un rechargement ne rejoue rien
- Resynchronisation en échec : message « activation en cours », jamais « échec du paiement »
- Resynchroniser aussi à l'arrivée sans paramètre (retour du portail client)

## Erreurs

- Aucun message d'erreur Stripe ne remonte au client : journaliser `error.type` et `error.code` sans donnée personnelle, renvoyer un texte fixe

## Effacement de compte

- Supprimer le client Stripe (ce qui résilie ses abonnements) **avant** d'effacer le compte ; un échec interrompt l'effacement
- `resource_missing` vaut succès
- Vider le résumé d'abonnement et supprimer le lien dans la même étape, sans attendre le webhook

## Tests

- Environnement : sandbox dédiée par usage (développement local, CI), pas le mode test partagé
- Unitaires : handlers purs à dépendances injectées, faux client Stripe en mémoire limité à l'API utilisée ; couvrir signature invalide, doublon, type ignoré, client inconnu, échec puis relance
- Un faux client ne voit ni une permission de clé manquante, ni un prix absent, ni un webhook mal enregistré : script de câblage qui rejoue contre Stripe, hors mode réel, les appels du serveur avec **la clé restreinte réellement déployée** — prix (montant, devise, intervalle), session Checkout créée puis expirée, session de portail, endpoint webhook `enabled` — et supprime ce qu'il crée
- Scripts de préparation et de contrôle : refuser toute clé `sk_live_` / `rk_live_` ; rejouables (prix retrouvés par `lookup_key`, rien créé en double)
- E2E du Checkout hébergé : désactivé par défaut, activé par variable d'environnement ; carte `4242 4242 4242 4242` ; s'arrêter avec la raison si le compte ne peut pas payer ; résilier en fin de parcours
