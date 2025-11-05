---
name: api-integration-assistant
description: |
  Use this skill when the user wants to integrate a new external API,
  create API functions, or needs guidance on API integration patterns.
  Triggers: "integrate API", "add API", "new API integration",
  "connect to API", "API setup", "create API"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Skill : API Integration Assistant

Assist users in integrating new external APIs into SmartLockers following project architecture and cache-first resilience patterns.

## Purpose

Guide users through the complete workflow of adding a new API integration:
1. Provide templates for API functions (cache-first pattern included)
2. Generate configuration sections for `.cfg` files
3. Create contract tests
4. Generate documentation
5. Validate implementation

## When to Activate

This skill activates automatically when user mentions:
- "I need to integrate [API name]"
- "Add [API] integration"
- "Connect to [API]"
- "Create API functions for [API]"
- "New API integration"
- "Setup [API]"

## Workflow

### Step 0: Information Gathering

When activated, ask user these questions:

```markdown
🔌 **API Integration Assistant - Phase 1/3 : Informations Basiques**

1. **Nom de l'API** : [Pour nommage fichier: api_<nom>_functions.php]
2. **Client(s) utilisant cette API** : [onet, cosyhosting, lockandchill, autre...]
3. **Catégorie API** :
   - [ ] PMS (Property Management System - Beds24, Guesty, etc.)
   - [ ] Payment Gateway (Stripe, PayPal, etc.)
   - [ ] Email/SMS Service (Mailgun, SendGrid, Twilio)
   - [ ] CRM/Marketing
   - [ ] Autre (préciser)
4. **Documentation officielle** : [URL documentation API]
5. **Format réponse** : [JSON, XML, autre]

---

🔐 **Phase 2/3 : Authentification (CRITIQUE)**

6. **Flow d'authentification** :
   - [ ] A. Simple (token statique, 1 étape)
   - [ ] B. OAuth2 standard (client credentials, 2 étapes)
   - [ ] C. Multi-step custom (invitation → refresh → access comme Beds24)
   - [ ] D. Autre (décrire détails)

**Si A ou B (flow simple)** :
7a. **Type d'authentification** :
   - [ ] Bearer Token statique
   - [ ] API Key (header ou query)
   - [ ] OAuth2 Client Credentials
   - [ ] Basic Auth

**Si C ou D (flow multi-step)** :
7b. **Décrivez le flow complet** :
   Exemple Beds24 :
   - Étape 1 : Génération invitation code (manuel dans UI)
   - Étape 2 : GET /authentication/setup (header: code) → token + refreshToken
   - Étape 3 : GET /authentication/token (header: refreshToken) → nouveau token

8. **Headers d'authentification** :
   - [ ] A. Standard : `Authorization: Bearer {token}`
   - [ ] B. API Key : `X-API-Key: {key}`
   - [ ] C. Custom (spécifier) : [ex: `token: {value}` pour Beds24]

9. **Gestion tokens** :
   - Access token expire-t-il ? [oui/non]
   - Si oui, durée : [ex: 24h]
   - Refresh token disponible ? [oui/non]
   - Si oui, durée validité refresh : [ex: 30 jours]

10. **Scopes/Permissions** :
    - Nécessite-t-il sélection de scopes lors setup initial ? [oui/non]
    - Si oui, liste scopes requis : [ex: read:bookings, write:properties]

---

🌐 **Phase 3/3 : Configuration Endpoints**

11. **URL de base** : [ex: https://api.example.com/v1]

12. **Pattern URL** :
    - [ ] A. https://api.{service}.com/{version}
    - [ ] B. https://{service}.com/api/{version} (ex: Beds24)
    - [ ] C. Autre (spécifier)

13. **Endpoints principaux** : [liste endpoints à intégrer]

14. **Endpoint de test/validation** :
    - URL : [ex: GET /properties ou GET /ping]
    - Réponse attendue : [ex: HTTP 200 + JSON array]

15. **Rate limits** : [ex: 100 req/min, 1000 req/heure]

16. **TTL cache recommandé** : [ex: 30min pour réservations, 1h pour config]

Répondez à ces questions pour que je génère les templates optimaux.
```

---

### Step 1: Validate API Name

```bash
# Vérifier format nom API
api_name=$(echo "$API_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9_]/_/g')

# Vérifier que API n'existe pas déjà
if [ -f "code/apis/${api_name}_functions.php" ]; then
    echo "⚠️ ATTENTION: API ${api_name} existe déjà"
    echo "Fichier existant: code/apis/${api_name}_functions.php"
    echo ""
    echo "Options:"
    echo "A. Modifier API existante"
    echo "B. Créer nouvelle version (v2)"
    echo "C. Choisir autre nom"
    exit 1
fi
```

---

### Step 1.5: Detect Multi-Step Auth Flow

**Based on answer to question 6** (Flow d'authentification) :

**IF answer = C (Multi-step custom)** :

```markdown
✅ **Flow multi-step détecté**

Je vais générer un script setup auth personnalisé pour gérer le flow initial.

Fichier qui sera créé :
📄 `code/scripts/setup_${api_name}_auth.php`

Ce script gérera :
1. Lecture credentials initiales (invitation code, etc.)
2. Échange contre tokens (access + refresh)
3. Stockage en cache
4. Test de validation

Référence : `code/scripts/setup_beds24_auth.php`
```

**THEN** : Générer aussi `code/scripts/setup_${api_name}_auth.php` (voir Step 2.5)

**ELSE** : Flow standard, pas de script setup nécessaire

---

### Step 2: Generate API Functions File

**Create** `code/apis/${api_name}_functions.php` with complete template:

```php
<?php
/**
 * Fonctions API : ${ApiName}
 *
 * Intégration de l'API ${ApiName} (${base_url})
 *
 * Documentation officielle : ${docs_url}
 *
 * @package SmartLockers\APIs
 * @author ${author}
 * @created ${date}
 */

/**
 * Authentifie auprès de l'API ${ApiName}
 *
 * Cette fonction gère l'authentification selon le type configuré
 * (Bearer Token, API Key, OAuth2, Basic Auth).
 *
 * Pattern : Les tokens sont mis en cache pour éviter ré-authentifications inutiles.
 *
 * @param array $config Configuration API contenant :
 *   - auth_type: string Type auth ('bearer_token', 'api_key', 'oauth2', 'basic_auth')
 *   - api_key: string Clé API (si auth_type = 'api_key')
 *   - bearer_token: string Token Bearer (si auth_type = 'bearer_token')
 *   - username: string Username (si auth_type = 'basic_auth')
 *   - password: string Password (si auth_type = 'basic_auth')
 *   - client_id: string Client ID OAuth2 (si auth_type = 'oauth2')
 *   - client_secret: string Client Secret OAuth2 (si auth_type = 'oauth2')
 * @return array Token d'authentification :
 *   - access_token: string Token d'accès
 *   - token_type: string Type de token (Bearer, etc.)
 *   - expires_in: int Durée validité en secondes
 * @throws Exception Si authentification échoue
 *
 * @example
 * $config = ['auth_type' => 'api_key', 'api_key' => 'xxx'];
 * $auth = api_${api_name}_authenticate($config);
 * // Returns: ['access_token' => '...', 'token_type' => 'Bearer']
 */
function api_${api_name}_authenticate(array $config): array
{
    $authType = $config['auth_type'] ?? 'bearer_token';

    switch ($authType) {
        case 'bearer_token':
            // Token statique fourni dans config
            return [
                'access_token' => $config['bearer_token'] ?? '',
                'token_type' => 'Bearer',
                'expires_in' => 86400 // 24h par défaut
            ];

        case 'api_key':
            // API Key statique
            return [
                'access_token' => $config['api_key'] ?? '',
                'token_type' => 'ApiKey',
                'expires_in' => 86400
            ];

        case 'oauth2':
            // OAuth2 Client Credentials Flow
            return api_${api_name}_authenticate_oauth2($config);

        case 'basic_auth':
            // Basic Authentication
            $credentials = base64_encode(
                ($config['username'] ?? '') . ':' . ($config['password'] ?? '')
            );
            return [
                'access_token' => $credentials,
                'token_type' => 'Basic',
                'expires_in' => 86400
            ];

        default:
            throw new Exception("Type d'authentification inconnu: {$authType}");
    }
}

/**
 * Authentification OAuth2 pour ${ApiName}
 *
 * Implémente le flow OAuth2 Client Credentials.
 *
 * @param array $config Configuration OAuth2
 * @return array Token OAuth2
 * @throws Exception Si authentification échoue
 *
 * @internal
 */
function api_${api_name}_authenticate_oauth2(array $config): array
{
    $tokenUrl = $config['token_url'] ?? $config['base_url'] . '/oauth/token';

    $response = http_post($tokenUrl, [
        'headers' => [
            'Content-Type' => 'application/x-www-form-urlencoded'
        ],
        'body' => http_build_query([
            'grant_type' => 'client_credentials',
            'client_id' => $config['client_id'] ?? '',
            'client_secret' => $config['client_secret'] ?? ''
        ]),
        'timeout' => 30
    ]);

    if ($response['status'] !== 200) {
        throw new Exception("OAuth2 auth failed: " . $response['body']);
    }

    $data = json_decode($response['body'], true);

    return [
        'access_token' => $data['access_token'] ?? '',
        'token_type' => $data['token_type'] ?? 'Bearer',
        'expires_in' => $data['expires_in'] ?? 3600
    ];
}

/**
 * Récupère [ressource] depuis l'API ${ApiName}
 *
 * Pattern cache-first avec fallback (OBLIGATOIRE).
 *
 * RÈGLE CRITIQUE : Cache mis à jour SEULEMENT si HTTP 2xx.
 * En cas d'erreur API, fallback sur cache périmé (stale cache).
 *
 * @param array $config Configuration API contenant :
 *   - base_url: string URL de base API
 *   - auth_type: string Type authentification
 *   - api_key / bearer_token / credentials: selon auth_type
 *   - timeout: int Timeout requête (default: 30)
 * @param array $params Paramètres de filtrage optionnels :
 *   - limit: int Nombre max résultats
 *   - offset: int Décalage pagination
 *   - filters: array Filtres additionnels
 * @return array Résultat avec pattern résilience :
 *   - status: string ('success', 'degraded', 'error')
 *   - source: string ('api', 'cache', 'stale_cache')
 *   - data: mixed Données API ou cache
 *   - fresh: bool Données fraîches (true) ou cache (false)
 * @throws Exception Si configuration invalide
 *
 * @example
 * $config = client_load_config('onet');
 * $result = api_${api_name}_get_resource($config, ['limit' => 100]);
 *
 * if ($result['status'] === 'success') {
 *     $data = $result['data'];
 *     foreach ($data as $item) {
 *         // Process item...
 *     }
 * } elseif ($result['status'] === 'degraded') {
 *     // API down mais on a données cache
 *     $staleData = $result['data'];
 *     // Utiliser avec précaution (données potentiellement obsolètes)
 * } else {
 *     // Ni API ni cache disponibles
 *     error_log("api_${api_name}_get_resource: No data available");
 * }
 */
function api_${api_name}_get_resource(array $config, array $params = []): array
{
    // 1. Validation configuration
    $required = ['base_url'];
    foreach ($required as $key) {
        if (empty($config[$key])) {
            throw new Exception("Config '{$key}' manquante pour ${ApiName}");
        }
    }

    // 2. Déterminer client (depuis contexte ou config)
    $clientName = $config['client_name'] ?? 'default';

    // 3. Pattern cache-first OBLIGATOIRE
    return api_resilient_call(
        clientName: $clientName,
        apiName: '${api_name}',
        cacheKey: 'resource_' . md5(json_encode($params)),
        apiCall: function() use ($config, $params) {
            // Authentification
            $auth = api_${api_name}_authenticate($config);

            // Construction URL
            $url = $config['base_url'] . '/resource';
            if (!empty($params)) {
                $url .= '?' . http_build_query($params);
            }

            // Headers selon type auth
            $headers = [
                'Accept' => 'application/json',
                'Content-Type' => 'application/json'
            ];

            if ($auth['token_type'] === 'Bearer') {
                $headers['Authorization'] = 'Bearer ' . $auth['access_token'];
            } elseif ($auth['token_type'] === 'ApiKey') {
                $headers['X-API-Key'] = $auth['access_token'];
            } elseif ($auth['token_type'] === 'Basic') {
                $headers['Authorization'] = 'Basic ' . $auth['access_token'];
            }

            // Appel API
            $response = http_get($url, [
                'headers' => $headers,
                'timeout' => $config['timeout'] ?? 30
            ]);

            // CRITIQUE : Retourner status_code + data
            return [
                'status_code' => $response['status'],
                'data' => json_decode($response['body'], true)
            ];
        },
        ttl: $config['ttl_resource'] ?? 3600 // 1h par défaut
    );
}

/**
 * Crée ou met à jour [ressource] dans l'API ${ApiName}
 *
 * Pattern API-first (pas de cache pour mutations).
 *
 * Les mutations (POST, PUT, DELETE) ne doivent JAMAIS utiliser le cache.
 * Toujours appeler l'API directement.
 *
 * @param array $config Configuration API
 * @param array $data Données à envoyer
 * @return array Résultat opération :
 *   - status: string ('success', 'error')
 *   - data: mixed Données retournées par API
 * @throws Exception Si échec API
 *
 * @example
 * $config = client_load_config('onet');
 * $result = api_${api_name}_create_resource($config, [
 *     'name' => 'New Resource',
 *     'type' => 'example'
 * ]);
 *
 * if ($result['status'] === 'success') {
 *     $createdId = $result['data']['id'];
 *     // Resource created successfully
 * }
 */
function api_${api_name}_create_resource(array $config, array $data): array
{
    // Authentification
    $auth = api_${api_name}_authenticate($config);

    // Construction URL
    $url = $config['base_url'] . '/resource';

    // Headers
    $headers = [
        'Content-Type' => 'application/json',
        'Accept' => 'application/json'
    ];

    if ($auth['token_type'] === 'Bearer') {
        $headers['Authorization'] = 'Bearer ' . $auth['access_token'];
    } elseif ($auth['token_type'] === 'ApiKey') {
        $headers['X-API-Key'] = $auth['access_token'];
    }

    // Appel API POST
    $response = http_post($url, [
        'headers' => $headers,
        'body' => json_encode($data),
        'timeout' => $config['timeout'] ?? 30
    ]);

    // Vérifier succès
    if ($response['status'] !== 200 && $response['status'] !== 201) {
        throw new Exception("API ${ApiName} error: " . $response['body']);
    }

    return [
        'status' => 'success',
        'data' => json_decode($response['body'], true)
    ];
}

/**
 * Met à jour [ressource] dans l'API ${ApiName}
 *
 * @param array $config Configuration API
 * @param string $resourceId Identifiant de la ressource
 * @param array $data Données à mettre à jour
 * @return array Résultat opération
 * @throws Exception Si échec API
 */
function api_${api_name}_update_resource(array $config, string $resourceId, array $data): array
{
    $auth = api_${api_name}_authenticate($config);

    $url = $config['base_url'] . '/resource/' . urlencode($resourceId);

    $headers = [
        'Content-Type' => 'application/json',
        'Accept' => 'application/json'
    ];

    if ($auth['token_type'] === 'Bearer') {
        $headers['Authorization'] = 'Bearer ' . $auth['access_token'];
    }

    $response = http_put($url, [
        'headers' => $headers,
        'body' => json_encode($data),
        'timeout' => $config['timeout'] ?? 30
    ]);

    if ($response['status'] !== 200) {
        throw new Exception("API ${ApiName} update error: " . $response['body']);
    }

    return [
        'status' => 'success',
        'data' => json_decode($response['body'], true)
    ];
}

/**
 * Supprime [ressource] de l'API ${ApiName}
 *
 * @param array $config Configuration API
 * @param string $resourceId Identifiant de la ressource
 * @return array Résultat opération
 * @throws Exception Si échec API
 */
function api_${api_name}_delete_resource(array $config, string $resourceId): array
{
    $auth = api_${api_name}_authenticate($config);

    $url = $config['base_url'] . '/resource/' . urlencode($resourceId);

    $headers = ['Accept' => 'application/json'];

    if ($auth['token_type'] === 'Bearer') {
        $headers['Authorization'] = 'Bearer ' . $auth['access_token'];
    }

    $response = http_delete($url, [
        'headers' => $headers,
        'timeout' => $config['timeout'] ?? 30
    ]);

    if ($response['status'] !== 200 && $response['status'] !== 204) {
        throw new Exception("API ${ApiName} delete error: " . $response['body']);
    }

    return [
        'status' => 'success',
        'message' => 'Resource deleted successfully'
    ];
}
```

**Note**: Replace placeholders with actual values collected from user.

---

### Step 2.5: Generate Setup Auth Script (IF Multi-Step Flow)

**IF** flow d'authentification = Multi-step custom (question 6 answer = C), **THEN** :

**Create** `code/scripts/setup_${api_name}_auth.php` based on Beds24 template:

```php
<?php
/**
 * Script : Setup Authentification ${ApiName}
 *
 * ${auth_flow_description}
 *
 * Usage:
 *   php code/scripts/setup_${api_name}_auth.php <client_name>
 *
 * Arguments:
 *   client_name    Nom du client utilisant ${ApiName}
 *
 * Prérequis:
 *   - ${setup_prerequisites}
 *
 * Exemples:
 *   php code/scripts/setup_${api_name}_auth.php ${example_client}
 *
 * @package SmartLockers\Scripts
 * @author Claude Code (Generated)
 */

// Configuration, helpers, etc. (basé sur setup_beds24_auth.php)

// TODO: Adapter selon flow spécifique décrit par utilisateur
// Structure basée sur Beds24 :
// 1. Lire credentials initiales depuis .temp/credentials/${api_name}_invitation_token.txt
// 2. Appeler endpoint setup avec headers custom
// 3. Stocker refresh_token longue durée
// 4. Stocker access_token courte durée
// 5. Tester access_token
// 6. Afficher résumé + prochaines étapes

echo "✅ Script setup auth créé : code/scripts/setup_${api_name}_auth.php\n";
echo "   À compléter selon flow ${ApiName} spécifique\n";
echo "   Référence : code/scripts/setup_beds24_auth.php\n";
```

**Créer aussi** `.temp/credentials/${api_name}_invitation_token.txt` template :

```bash
# Créer répertoire si nécessaire
mkdir -p .temp/credentials

# Créer fichier template
cat > .temp/credentials/${api_name}_invitation_token.txt <<EOF
# ${ApiName} Invitation Token (Temporaire Développement)
#
# Ce fichier contient ${initial_credential_description}
#
# ⚠️ IMPORTANT :
# - Ce fichier est dans .gitignore (ne sera JAMAIS commité)
# - À SUPPRIMER avant mise en production
#
# Date création : $(date +%Y-%m-%d)
# Usage : Développement uniquement
#
# ----------------------------------------------------------------------
# COLLEZ VOTRE ${CREDENTIAL_NAME} CI-DESSOUS :
# ----------------------------------------------------------------------

${CREDENTIAL_KEY}=

# ----------------------------------------------------------------------
# Notes : ${setup_notes}
# ----------------------------------------------------------------------
EOF

echo "✅ Template credentials créé : .temp/credentials/${api_name}_invitation_token.txt"
echo "   Collez vos credentials dans ce fichier avant d'exécuter le script setup"
```

**Informer utilisateur** :

```markdown
✅ **Script setup auth multi-step généré**

Fichiers créés :
📄 `code/scripts/setup_${api_name}_auth.php`
📄 `.temp/credentials/${api_name}_invitation_token.txt` (template)

Prochaines étapes :
1. Éditer script setup pour adapter au flow ${ApiName} exact
2. Générer credentials initiales dans UI ${ApiName}
3. Coller dans .temp/credentials/${api_name}_invitation_token.txt
4. Exécuter : php code/scripts/setup_${api_name}_auth.php ${client}

Référence complète : code/scripts/setup_beds24_auth.php
```

---

### Step 3: Generate Configuration Template

**Display configuration template** for user to add to `code/clients/config/${client}.cfg`:

```markdown
✅ **Configuration à ajouter dans `code/clients/config/${client}.cfg`** :

\`\`\`ini
# ============================================================================
# API ${ApiName} Configuration
# ============================================================================

[${ApiName}]

# Mode (production, staging, test)
api_${api_name}_mode=production

# URL de base API
api_${api_name}_base_url=${base_url}

# Authentification (${auth_type})
${auth_config_template}

# Timeout requêtes (secondes)
api_${api_name}_timeout=30

# TTL Cache par ressource (secondes)
ttl_${api_name}_resource=3600        # 1 heure
ttl_${api_name}_users=1800           # 30 minutes
ttl_${api_name}_config=86400         # 24 heures
\`\`\`

**Remplacez** :
- \`${base_url}\` par l'URL réelle de l'API
- \`**TODO**\` par les credentials réelles (⚠️ NE PAS COMMITER)
```

**Auth config templates by type**:

```ini
# Bearer Token
api_${api_name}_auth_type=bearer_token
api_${api_name}_bearer_token=**TODO**

# API Key
api_${api_name}_auth_type=api_key
api_${api_name}_api_key=**TODO**

# OAuth2
api_${api_name}_auth_type=oauth2
api_${api_name}_client_id=**TODO**
api_${api_name}_client_secret=**TODO**
api_${api_name}_token_url=${base_url}/oauth/token

# Basic Auth
api_${api_name}_auth_type=basic_auth
api_${api_name}_username=**TODO**
api_${api_name}_password=**TODO**
```

---

### Step 4: Update Client Authorization

**Guide user to update** `code/clients/${client}_functions.php`:

```markdown
✅ **Autoriser l'API pour le client ${client}** :

Éditer \`code/clients/${client}_functions.php\` et ajouter l'API dans \`get_required_apis()\` :

\`\`\`php
function client_${client}_get_required_apis(): array
{
    return [
        'ExistingAPI1',
        'ExistingAPI2',
        '${ApiName}'  // ← AJOUTER CETTE LIGNE
    ];
}
\`\`\`

✅ Sauvegardez le fichier.
```

---

### Step 5: Generate Contract Tests

**Create** `code/tests/contracts/test_api_${api_name}.php`:

```php
<?php
/**
 * Tests de contrat pour API ${ApiName}
 *
 * Ces tests vérifient que les fonctions API respectent les patterns
 * obligatoires (cache-first, gestion erreurs, etc.).
 *
 * @package SmartLockers\Tests\Contracts
 * @author ${author}
 * @created ${date}
 */

require_once __DIR__ . '/../../code/apis/${api_name}_functions.php';

/**
 * Test : Vérifier pattern cache-first avec fallback
 */
function test_api_${api_name}_cache_fallback()
{
    echo "=== Test: ${ApiName} - Cache Fallback ===\n";

    // 1. Mock cache avec données
    api_store_cached_data('test_client', '${api_name}_resource', ['test' => 'data'], 3600);

    // 2. Simuler erreur API (URL invalide)
    $result = api_${api_name}_get_resource([
        'base_url' => 'https://invalid-url-will-fail.test',
        'auth_type' => 'bearer_token',
        'bearer_token' => 'test_token',
        'client_name' => 'test_client'
    ]);

    // 3. Vérifier fallback sur stale cache
    assert(
        $result['status'] === 'degraded',
        "Status devrait être 'degraded' (API down, fallback cache)"
    );
    assert(
        $result['source'] === 'stale_cache',
        "Source devrait être 'stale_cache'"
    );
    assert(
        isset($result['data']),
        "Data devrait être présent (depuis cache)"
    );

    echo "✅ Pattern cache fallback fonctionne\n";
}

/**
 * Test : Vérifier qu'authentification retourne structure attendue
 */
function test_api_${api_name}_authenticate_structure()
{
    echo "=== Test: ${ApiName} - Authenticate Structure ===\n";

    $auth = api_${api_name}_authenticate([
        'auth_type' => 'bearer_token',
        'bearer_token' => 'test_token_123'
    ]);

    // Vérifier structure retour
    assert(isset($auth['access_token']), "Doit contenir 'access_token'");
    assert(isset($auth['token_type']), "Doit contenir 'token_type'");
    assert(isset($auth['expires_in']), "Doit contenir 'expires_in'");

    // Vérifier valeurs
    assert($auth['access_token'] === 'test_token_123', "Token correct");
    assert($auth['token_type'] === 'Bearer', "Type Bearer");
    assert($auth['expires_in'] > 0, "Expiration > 0");

    echo "✅ Structure authentification conforme\n";
}

/**
 * Test : Vérifier que create_resource rejette config invalide
 */
function test_api_${api_name}_create_invalid_config()
{
    echo "=== Test: ${ApiName} - Create Invalid Config ===\n";

    $exceptionThrown = false;

    try {
        // Config vide (devrait échouer)
        api_${api_name}_create_resource([], ['name' => 'test']);
    } catch (Exception $e) {
        $exceptionThrown = true;
        assert(
            strpos($e->getMessage(), 'manquante') !== false,
            "Message d'erreur doit mentionner config manquante"
        );
    }

    assert($exceptionThrown, "Exception doit être levée pour config invalide");

    echo "✅ Validation config fonctionne\n";
}

// ============================================================================
// Exécution des tests
// ============================================================================

echo "\n";
echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║  Tests de Contrat : API ${ApiName}                           ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n";
echo "\n";

try {
    test_api_${api_name}_cache_fallback();
    test_api_${api_name}_authenticate_structure();
    test_api_${api_name}_create_invalid_config();

    echo "\n";
    echo "✅ Tous les tests de contrat passent pour API ${ApiName}\n";
    echo "\n";
    exit(0);

} catch (AssertionError $e) {
    echo "\n";
    echo "❌ Test échoué : " . $e->getMessage() . "\n";
    echo "Fichier : " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\n";
    exit(1);
} catch (Exception $e) {
    echo "\n";
    echo "❌ Erreur inattendue : " . $e->getMessage() . "\n";
    echo "\n";
    exit(1);
}
```

---

### Step 6: Generate Documentation

**Create** `documentation/api/${api_name}.md`:

```markdown
# API : ${ApiName}

**Date création** : ${date}
**Documentation officielle** : ${docs_url}

## Vue d'Ensemble

[Description de l'API externe, cas d'usage]

TODO: Compléter cette section avec informations métier.

## Authentification

**Type** : ${auth_type}

**Configuration** :
\`\`\`ini
api_${api_name}_auth_type=${auth_type}
${auth_config_example}
\`\`\`

## Endpoints Intégrés

### GET /resource - Récupérer ressources

**Fonction** : \`api_${api_name}_get_resource()\`

**Paramètres** :
- \`limit\` (int) : Nombre max résultats
- \`offset\` (int) : Décalage pagination
- \`filters\` (array) : Filtres additionnels

**Cache** : ${ttl_resource} secondes (configurable via \`ttl_${api_name}_resource\`)

**Pattern** : Cache-first avec fallback stale cache

**Exemple** :
\`\`\`php
$config = client_load_config('${client}');
$result = api_${api_name}_get_resource($config, ['limit' => 100]);

if ($result['status'] === 'success') {
    $resources = $result['data'];
    // Traiter ressources...
} elseif ($result['status'] === 'degraded') {
    // API down mais données cache disponibles
    $staleResources = $result['data'];
    // Utiliser avec précaution (potentiellement obsolètes)
}
\`\`\`

### POST /resource - Créer ressource

**Fonction** : \`api_${api_name}_create_resource()\`

**Pattern** : API-first (pas de cache, mutation)

**Exemple** :
\`\`\`php
$config = client_load_config('${client}');
$result = api_${api_name}_create_resource($config, [
    'name' => 'New Resource',
    'type' => 'example'
]);

if ($result['status'] === 'success') {
    $createdId = $result['data']['id'];
}
\`\`\`

### PUT /resource/:id - Mettre à jour ressource

**Fonction** : \`api_${api_name}_update_resource()\`

**Pattern** : API-first (pas de cache)

### DELETE /resource/:id - Supprimer ressource

**Fonction** : \`api_${api_name}_delete_resource()\`

**Pattern** : API-first (pas de cache)

## Rate Limits

${rate_limits_info}

## Gestion d'Erreurs

### Erreurs Courantes

**401 Unauthorized** :
- Cause : Credentials invalides ou token expiré
- Solution : Vérifier configuration dans .cfg

**429 Too Many Requests** :
- Cause : Rate limit dépassé
- Solution : Augmenter TTL cache, implémenter retry avec backoff

**500 Server Error** :
- Cause : Erreur serveur API
- Solution : Vérifier status page API, utiliser cache fallback

### Circuit Breaker

Pattern circuit breaker activé automatiquement :
- Seuil échecs : ${failure_threshold} (configurable)
- Timeout récupération : ${timeout} secondes
- États : CLOSED (normal) → OPEN (bloqué) → HALF_OPEN (test)

## Tests

### Tests de Contrat

\`\`\`bash
php code/tests/contracts/test_api_${api_name}.php
\`\`\`

### Tests avec Bruno

\`\`\`bash
cd bruno-collections/${client}/
bruno run apis/${api_name}/
\`\`\`

### Validation Complète

\`\`\`bash
composer test
composer phpstan
\`\`\`

## Exemples d'Usage

### Cas d'Usage 1 : Récupération Données avec Cache

\`\`\`php
$config = client_load_config('${client}');

// Pattern cache-first automatique
$result = api_${api_name}_get_resource($config, ['limit' => 50]);

switch ($result['status']) {
    case 'success':
        // Données fraîches depuis API
        $data = $result['data'];
        break;

    case 'degraded':
        // API down mais cache disponible
        $data = $result['data'];
        // Afficher avertissement utilisateur
        break;

    case 'error':
        // Ni API ni cache disponibles
        error_log("${ApiName}: No data available");
        break;
}
\`\`\`

### Cas d'Usage 2 : Création Ressource

\`\`\`php
$config = client_load_config('${client}');

try {
    $result = api_${api_name}_create_resource($config, [
        'name' => 'My Resource',
        'description' => 'Description',
        'type' => 'example'
    ]);

    $resourceId = $result['data']['id'];
    echo "Ressource créée : {$resourceId}\n";

} catch (Exception $e) {
    error_log("Erreur création ressource : " . $e->getMessage());
}
\`\`\`

## Dépannage

### Problème : API retourne toujours données cache

**Cause** : TTL trop élevé

**Solution** :
\`\`\`ini
# Réduire TTL dans .cfg
ttl_${api_name}_resource=600  # 10 minutes au lieu de 1h
\`\`\`

### Problème : Tests échouent avec "Config manquante"

**Cause** : Configuration client incomplète

**Solution** :
1. Vérifier \`code/clients/config/${client}.cfg\` contient section [${ApiName}]
2. Vérifier toutes les clés obligatoires présentes (\`base_url\`, credentials)

### Problème : Trop de requêtes API (rate limit)

**Cause** : Cache non utilisé ou TTL trop court

**Solution** :
1. Augmenter TTL cache
2. Vérifier pattern cache-first respecté (pas d'appel direct API)
3. Implémenter circuit breaker plus agressif

## Références

- **Documentation officielle** : ${docs_url}
- **Guide intégration API** : \`documentation/memory-bank/guides/api-integration.md\`
- **Patterns résilience** : \`documentation/memory-bank/core/architecture-essentials.md\`
- **Code source** : \`code/apis/${api_name}_functions.php\`

## Changelog

### ${date} - Création initiale
- Intégration API ${ApiName}
- Authentification ${auth_type}
- Endpoints : GET, POST, PUT, DELETE
- Pattern cache-first implémenté
- Tests de contrat créés

TODO: Documenter évolutions futures
```

---

### Step 7: Validation and Testing

```bash
echo "🔍 Validation intégration API ${api_name}..."

# 1. Vérifier fichier API créé
if [ ! -f "code/apis/${api_name}_functions.php" ]; then
    echo "❌ ERREUR: Fichier API non créé"
    exit 1
fi

# 2. Vérifier PHPStan
composer phpstan > /tmp/phpstan_api_${api_name}.log 2>&1

if [ $? -ne 0 ]; then
    echo "⚠️ ATTENTION: PHPStan a détecté des erreurs"
    cat /tmp/phpstan_api_${api_name}.log
fi

# 3. Exécuter tests de contrat
php "code/tests/contracts/test_api_${api_name}.php"

if [ $? -ne 0 ]; then
    echo "⚠️ ATTENTION: Tests de contrat échouent"
    exit 1
fi

echo "✅ Validation complète passée"
```

---

### Step 8: Final Report

```markdown
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║  🎉 API ${ApiName} intégrée avec succès !                           ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝

## Résumé Intégration

**API** : ${api_name}
**Date** : ${date}
**Authentification** : ${auth_type}
**Client(s)** : ${client_list}

## Fichiers Créés

✅ \`code/apis/${api_name}_functions.php\` (pattern cache-first ✓)
✅ \`code/tests/contracts/test_api_${api_name}.php\` (tests de contrat)
✅ \`documentation/api/${api_name}.md\` (documentation complète)

## Fichiers à Modifier

📝 \`code/clients/${client}_functions.php\` (autoriser API dans get_required_apis())
📝 \`code/clients/config/${client}.cfg\` (ajouter configuration API)

## Validation Qualité

✅ **PHPDoc complet** : Sur toutes fonctions
✅ **Pattern cache-first** : Implémenté pour GET operations
✅ **Pattern API-first** : Implémenté pour mutations (POST/PUT/DELETE)
✅ **Gestion erreurs** : Try-catch + validation config
✅ **Tests de contrat** : Créés et passants

## Prochaines Étapes

### 1. Configurer Credentials (OBLIGATOIRE)

Éditer \`code/clients/config/${client}.cfg\` et ajouter :

\`\`\`ini
[${ApiName}]
api_${api_name}_mode=production
api_${api_name}_base_url=${base_url}
api_${api_name}_auth_type=${auth_type}
${auth_config_template}
api_${api_name}_timeout=30
ttl_${api_name}_resource=3600
\`\`\`

⚠️ **Remplacez \`**TODO**\` par credentials réelles (NE PAS COMMITER)**

### 2. Autoriser API pour Client

Éditer \`code/clients/${client}_functions.php\` :

\`\`\`php
function client_${client}_get_required_apis(): array
{
    return [
        // ... APIs existantes
        '${ApiName}'  // ← AJOUTER
    ];
}
\`\`\`

### 3. Tester

\`\`\`bash
# Tests contracts
php code/tests/contracts/test_api_${api_name}.php

# Validation PHPStan
composer phpstan

# Tests complets
composer test
\`\`\`

### 4. Régénérer Collection Bruno

\`\`\`bash
php code/scripts/generate_bruno_collection.php ${client}
\`\`\`

### 5. Tester avec Bruno

\`\`\`bash
cd bruno-collections/${client}/
bruno run apis/${api_name}/
\`\`\`

## Patterns Critiques

✅ **Cache-First** : \`api_resilient_call()\` pour GET operations
✅ **API-First** : Appels directs pour POST/PUT/DELETE (mutations)
✅ **Règle Cache** : Mise à jour SEULEMENT si HTTP 2xx
✅ **Fallback** : Stale cache si API down
✅ **Validation** : Config validée avant appels API

## Ressources

- **Documentation** : \`documentation/api/${api_name}.md\`
- **Guide intégration** : \`documentation/memory-bank/guides/api-integration.md\`
- **Exemples** : \`code/apis/pilotphone_functions.php\` (référence)

## Support

Pour questions ou problèmes :
- Consulter documentation : \`documentation/api/${api_name}.md\`
- Voir exemples : \`code/apis/guesty_functions.php\`, \`code/apis/pilotphone_functions.php\`
- Tests référence : \`code/tests/contracts/test_api_guesty.php\`

---

✅ **API ${ApiName} prête à être configurée et utilisée !**

Prochaine action : Configurer credentials dans .cfg
```

---

## Templates Reference

### Auth Config Templates

```ini
# Bearer Token
api_${api_name}_auth_type=bearer_token
api_${api_name}_bearer_token=**TODO**

# API Key
api_${api_name}_auth_type=api_key
api_${api_name}_api_key=**TODO**

# OAuth2 Client Credentials
api_${api_name}_auth_type=oauth2
api_${api_name}_client_id=**TODO**
api_${api_name}_client_secret=**TODO**
api_${api_name}_token_url=https://api.example.com/oauth/token

# Basic Authentication
api_${api_name}_auth_type=basic_auth
api_${api_name}_username=**TODO**
api_${api_name}_password=**TODO**
```

---

## Critical Rules

### Security
1. ⚠️ **NEVER commit credentials in Git**
2. ⚠️ **ALWAYS validate config before API calls**
3. ⚠️ **ALWAYS sanitize user inputs**

### Quality
1. ✅ **ALWAYS use cache-first pattern** for GET operations
2. ✅ **NEVER cache mutations** (POST, PUT, DELETE)
3. ✅ **ALWAYS include PHPDoc** with parameters, return, exceptions, examples
4. ✅ **ALWAYS validate with PHPStan** niveau 6

### Architecture
1. ✅ **ALWAYS prefix functions** with \`api_${name}_\`
2. ✅ **ALWAYS update cache ONLY on HTTP 2xx**
3. ✅ **ALWAYS implement fallback to stale cache**
4. ✅ **ALWAYS return standardized response format** :
   \`\`\`php
   [
       'status' => 'success|degraded|error',
       'source' => 'api|cache|stale_cache',
       'data' => $data,
       'fresh' => true|false
   ]
   \`\`\`

---

## Success Metrics

Integration réussie quand :

✅ Fichier API créé avec pattern cache-first
✅ PHPDoc complet sur toutes fonctions
✅ Configuration template fournie
✅ Client autorisé (get_required_apis updated)
✅ Tests de contrat créés et passants
✅ Documentation complète créée
✅ PHPStan niveau 6 : 0 erreur
✅ Utilisateur peut configurer et tester sans aide

---

## Troubleshooting

### Problème : API non autorisée pour client

**Cause** : Oublié d'ajouter dans \`get_required_apis()\`

**Solution** : Éditer \`code/clients/${client}_functions.php\` et ajouter API

### Problème : Configuration manquante

**Cause** : Section [API] absente ou incomplète dans .cfg

**Solution** : Vérifier toutes clés obligatoires (\`base_url\`, credentials)

### Problème : Tests échouent

**Cause** : Pattern cache-first non respecté ou config invalide

**Solution** :
1. Vérifier \`api_resilient_call()\` utilisé pour GET operations
2. Vérifier config contient toutes clés obligatoires
3. Exécuter tests manuellement : \`php code/tests/contracts/test_api_${api_name}.php\`
