# Instructions pour Claude Code - SmartLockers Client Manager

Ce fichier fournit des directives à Claude Code (claude.ai/code) pour travailler avec le projet **SmartLockers Client Manager**.

## Commandes Essentielles

### Tests et Qualité
- `composer test` - Exécuter tous les tests
- `composer test-client [client]` - Tests pour un client spécifique (cosyhosting, halpades, onet)
- `composer test-generic` - Tests génériques uniquement
- `composer phpstan` - Analyse statique du code (niveau 5)
- `composer quality` - PHPStan + Tests complets
- `composer install` - Installer les dépendances

### Collections Bruno et Credentials
- `php code/scripts/generate_bruno_collection.php` - Générer la collection Bruno API globale
- `php code/scripts/generate_bruno_collection.php [client]` - Générer collection Bruno pour un client
- `php code/scripts/setup_client_credentials.php <client>` - **Bootstrap credentials pour nouveau client**
  - Génère automatiquement Bearer Token + Machine Login/Password
  - Configure sync_auth.php, smartlockers_sync.php, bruno_client_generator.php
  - Régénère les collections Bruno
  - Documentation : `documentation/developpement/bootstrap-client-credentials.md`

### Création Nouveau Client
- `php code/scripts/setup/generate_client.php <client> [--apis=API1,API2]` - **Client standard (générique)**
  - Interactif : credentials Sync + test docs + APIs
  - Génère : client + API(s) + DB + config + documentation
  - Automatique : migration + tables prod/test + config DB/fichier
  - **Utiliser par défaut pour tout nouveau client**

- `php code/scripts/setup/generate_reservation_client.php <client> [api]` - **Client réservation (spécialisé)**
  - Comme `generate_client.php` + fonctions `reservation_processor.php`
  - Tables supplémentaires : reservations, owners
  - Routes pré-configurées : GET /reservations, POST /process-reservations
  - **Utiliser pour Halpades, CosyHosting, LockAndChill**
  - Documentation : `documentation/memory-bank/guides/reservation-patterns.md`

### Migrations Base de Données
- `php code/scripts/tools/migrate.php up` - Exécuter migrations en attente
- `php code/scripts/tools/migrate.php down` - Annuler dernière migration
- `php code/scripts/tools/migrate.php create [name]` - Créer nouvelle migration
- `php code/scripts/tools/migrate.php status` - Afficher statut migrations

**RÈGLE CRITIQUE** : NE JAMAIS exécuter SQL directement (`mysql < file.sql`). Toujours utiliser le système de migrations.
Documentation : `documentation/memory-bank/guides/database-migrations.md`

## 🌐 Règles de Langue / Language Rules

### Configuration Outils Claude Code : ANGLAIS

**TOUS les outils Claude Code doivent être écrits en ANGLAIS** :
- ✅ **Agents** (`.claude/agents/*.md`) → English
- ✅ **Skills** (`.claude/skills/*/SKILL.md`) → English
- ✅ **Commands** (`.claude/commands/*.md`) → English
- ✅ **Prompts système** → English

**Raison** : Gains de performance mesurés :
- **-20.4% tokens** (efficacité prouvée)
- **+14.3% qualité** (score objectif)
- **Cohérence** avec documentation officielle Claude Code (100% anglais)

### Communication avec Utilisateur : FRANÇAIS

**TOUJOURS répondre en FRANÇAIS dans le chat** :
- ✅ Réponses conversationnelles → Français
- ✅ Explications techniques → Français
- ✅ Messages d'erreur → Français
- ✅ Rapports de tâches → Français

### Documentation Projet : FRANÇAIS

**Documentation lue par humains reste en FRANÇAIS** :
- ✅ `documentation/` → Français (memory-bank, guides, notebooks, etc.)
- ✅ `CLAUDE.md` → Français
- ✅ `README.md` → Français
- ✅ Commentaires code PHP → Français (selon préférence équipe)
- ✅ PHPDoc → Français (selon préférence équipe)

**Exception** : Noms techniques (variables, fonctions, tables) restent en anglais selon conventions du projet.

### Résumé

```yaml
Outils Claude (.claude/):     English (performance +20%)
Réponses chat:                Français (confort utilisateur)
Documentation projet (docs/): Français (équipe francophone)
Code PHP:                     Selon conventions projet
```

## Utilisation des Agents

### Quand Utiliser les Agents

**7 Agents spécialisés disponibles** (voir `.claude/agents/README.md`) :

1. **`claude-code-optimizer`** - Meta-configuration Claude Code
   - **Déclencher** : Optimisation setup .claude/, création agents/skills/hooks
   - **Domaine** : Configuration Claude Code (projet + global)

2. **`documentation-architect`** - Documentation et memory bank
   - **Déclencher** : Questions sur docs, memory bank, optimisation contexte
   - **Keywords** : "docs", "memory", "context", "documentation"
   - **RÈGLE STRICTE** : 8 répertoires uniquement dans documentation/

3. **`test-architect`** - Tests et qualité automatisée
   - **Déclencher** : Après génération de code, correction tests cassés, audit couverture
   - **Automatique** : Se lance PROACTIVEMENT, consulte memory-bank pour stratégie tests

4. **`code-architect`** - Architecture technique et choix technologiques
   - **Déclencher** : Décisions architecturales, choix patterns, refactoring, validation conception
   - **Automatique** : Consulte memory-bank pour contraintes projet

5. **`super-coder`** - Génération de code orchestrée
   - **Déclencher** : Génération code complexe, implémentation multi-fichiers
   - **Automatique** : Découpe tasks si complexe, lance test-architect pour validation

6. **`ux-designer`** - Ergonomie et design
   - **Déclencher** : Création/refonte interface, validation UX, wireframes
   - **Domaine** : Charte graphique, ergonomie, styles

7. **`web-optimizer`** - Optimisation web, accessibilité, SEO
   - **Déclencher** : Audit accessibilité, optimisation responsive, vérification SEO
   - **Domaine** : Compatibilité navigateurs, WCAG 2.1 AA, référencement

### Parallélisation des Agents (PRIORITÉ)

**RÈGLE** : Lancer les agents **EN PARALLÈLE** quand possible pour gains de performance.

```yaml
# ✅ CORRECT - Agents parallèles (1 message, multiple Task calls)
- Task: test-architect (valider tests)
- Task: code-architect (audit architecture)
- Task: documentation-architect (mettre à jour docs)

# ❌ INCORRECT - Agents séquentiels
1. Attendre test-architect
2. Puis lancer code-architect
3. Puis lancer documentation-architect
```

**Cas d'usage parallélisation** :
- Code généré → Lancer `test-architect` + `code-architect` + `documentation-architect` en même temps
- Nouveau client → Lancer `code-architect` + `super-coder` + `ux-designer` ensemble
- Audit qualité → Lancer `test-architect` + `code-architect` + `web-optimizer` en parallèle

## Scripts Réutilisables

### Principe : Traitement Agnostique → Script

**Si un traitement peut être répété de manière générique** → Créer script dans `code/scripts/`

**Langages supportés** :
- **Bash** (`.sh`) - Préféré pour système/git/files
- **PHP** (`.php`) - Préféré pour logique métier/DB
- **Python** (`.py`) - Pour analyses/data processing
- **PowerShell** (`.ps1`) - Si environnement Windows

### Exemples Scripts Existants

```bash
code/scripts/
├── setup_client_credentials.php      # Bootstrap credentials client
├── generate_bruno_collection.php     # Génération collections API
├── tools/migrate.php                 # Migrations DB
└── setup/generate_client.php         # Création client complet
```

### Quand Créer un Script

**✅ Créer script si** :
- Tâche répétée > 2 fois
- Workflow multi-étapes automatisable
- Traitement batch de données
- Validation/vérification systématique
- Setup/bootstrap reproductible

**❌ Ne PAS créer script si** :
- Tâche unique/ponctuelle
- Logique trop spécifique à un contexte
- Moins de 10 lignes de code
- Déjà une commande composer disponible

### Template Script PHP

```php
#!/usr/bin/env php
<?php
/**
 * Description du script et usage
 *
 * Usage: php code/scripts/nom_script.php [args]
 */

// Chargement dépendances
require_once __DIR__ . '/../src/services/database.php';

// Validation args
if ($argc < 2) {
    echo "Usage: php {$argv[0]} <param>\n";
    exit(1);
}

// Logique métier
try {
    $result = process_data($argv[1]);
    echo "✅ Succès: {$result}\n";
    exit(0);
} catch (Exception $e) {
    echo "❌ Erreur: {$e->getMessage()}\n";
    exit(1);
}
```

## Architecture

**Système PHP sans framework** avec architecture fonctionnelle pure (pas de classes).

## Infrastructure Technique
- **Base de données** : MariaDB
- **Version** : 10.11.14-MariaDB-0+deb12u2
- **Type de JSON** : JSON (pas JSONB)
- **API Sync SmartLockers** : Identifiants lockers via **UUID uniquement** (pas d'ID numérique exposé)
  - Table `lockers` : Champ `uuid` (VARCHAR 36) - Identifiant unique
  - Table `lockers` : Champ `num` (INT) - Numéro de casier (1, 2, 3... unique par machine)
  - Table `lockers` : Champ `ext_ref_locker` (VARCHAR) - Référence externe métier
  - **IMPORTANT** : L'API Sync **N'EXPOSE PAS** de champ `ID` numérique pour les lockers
  - **OBLIGATOIRE** : Utiliser `uuid` dans les WHERE/UPDATE/PUTUPDATE, jamais `ID`

## Modèles d'Authentification API

Le système supporte **deux modèles d'authentification API** :

### Modèle "client" (Centralisé)
- **Credentials** : `clients_configuration.config_data` (JSON)
- **Usage** : 1 compte API partagé pour tous les owners
- **Config** : `"auth_model": "client"`
- **Fonction** : `client_get_api_credentials($clientName)`
- **Exemple** : CosyHosting (1 compte Guesty centralisé)

### Modèle "owner" (Distribué)
- **Credentials** : Table `{client}_owners` (1 row par propriétaire)
- **Usage** : 1 compte API par owner (OAuth2 individuel)
- **Config** : `"auth_model": "owner"`
- **Fonction** : `client_get_api_credentials($clientName, $ownerId)`
- **Exemple** : LockAndChill (OAuth2 Beds24 par propriétaire)
- **Table obligatoire** : `{client}_owners` avec `api_access_token`, `api_refresh_token`

**Documentation** : `documentation/memory-bank/guides/reservation-patterns.md#modèles-dauthentification-api`

### Principes Clés

- **Architecture fonctionnelle** : Uniquement des fonctions pures, pas de classes
- **Chargement manuel** : Instructions `require_once` manuelles, pas d'autoloading PSR-4
- **Trois couches** : `code/clients/` (préfixe `client_`), `code/apis/` (préfixe `api_`), `code/providers/` (préfixe `provider_`)
- **Autorisations client-first** : Chaque client définit ses APIs autorisées

## Documentation de Référence

Le projet utilise **8 répertoires spécialisés** dans `documentation/` :

1. **`memory-bank/`** - Source principale (80-90% des besoins) - TOUJOURS consulter en premier
   - `core/` : Essentiels (quick-start, architecture, conventions, database, business-rules)
   - `guides/` : Cas d'usage spécifiques (nouveau-client, reservation-patterns, etc.)

2. **`notebooks/`** - Analyses approfondies (sous-répertoires : api/, architecture/, developpement/, fonctionnel/)
   - Schémas DB complets, règles métier exhaustives, documentation APIs externes

3. **`guides/`** - Tutoriels pas-à-pas et workflows

4. **`diagrams/`** - Visualisations architecture, flux, modèles

5. **`tasks/`** - Définitions de tâches structurées (DoD, critères acceptation)

6. **`reviews/`** - Code reviews et audits qualité

7. **`reports/`** - Rapports techniques (matrices conformité, analyses écarts)

8. **`wireframes/`** - Maquettes et designs UI/UX

### Workflow Documentation

```
1. TOUJOURS commencer par memory-bank/core/ (réponses rapides, 80-90% besoins)
   ↓
2. Si besoin spécifique → memory-bank/guides/
   ↓
3. Si cas avancé → notebooks/ (documentation exhaustive)
   ↓
4. Autres répertoires selon contexte (diagrams/, tasks/, reviews/, etc.)
```

### Commandes Utiles

- **Lire memory bank** : `Read documentation/memory-bank/core/quick-start.md`
- **Chercher** : `Grep -r "pattern" documentation/`
- **Explorer** : Utiliser agent `Explore` pour recherches approfondies

### RÈGLE CRITIQUE - Résilience des Données

Les données en cache ne sont mises à jour QUE si l'API répond avec un code HTTP 2xx. En cas d'erreur, conserver les données précédentes.

```php
// Pattern standard obligatoire
if ($response['status_code'] === 200 && !empty($response['data'])) {
    // Mise à jour des données
    api_store_result($clientName, 'data_key', $processedData, $ttl);
    return ['status' => 'success', 'source' => 'api'];
} else {
    // Fallback sur le cache
    $cachedData = api_get_stored_data($clientName, 'data_key');
    return $cachedData ? ['status' => 'cached', 'source' => 'cache'] : ['status' => 'error'];
}
```

## Conventions Obligatoires

### Nommage
- **Fonctions** : `snake_case` avec préfixes (`client_`, `api_`, `provider_`, `db_`, `auth_`)
- **Variables** : `snake_case` descriptif

### Structure Type
```php
function client_onet_get_required_apis(): array
{
    return ['Planet', 'Pilotphone'];
}

function api_planet_make_call($data, string $clientName, array $config): array
{
    return api_make_authenticated_request($url, 'POST', $data, $config);
}
```

### Gestion d'Erreurs
```php
function auth_authenticate_machine(string $login, string $password): bool
{
    try {
        $machineData = sync_get_machine_data($login, $password);
        return !empty($machineData);
    } catch (Exception $e) {
        error_log("auth_authenticate_machine error: " . $e->getMessage());
        return false;
    }
}
```


## Stratégie de Tests Pragmatique 70/20/10

Le projet adopte une **stratégie de tests pragmatique** qui optimise le rapport valeur/effort :

### 70% - PHPStan Niveau 6 (Analyse Statique)
**Responsabilité** : Détection automatique de la majorité des erreurs
- Types de données incorrects
- Variables non définies
- Appels de fonctions incorrects
- Cohérence des paramètres
- Respect des conventions de nommage

**Commande** : `composer phpstan`
**Objectif** : 0 erreur PHPStan niveau 6

### 20% - Tests de Contrat (5-8 tests maximum)
**Responsabilité** : Validation des interfaces critiques entre couches

**Fonctions prioritaires à tester** :
1. **Cache et résilience** : `api_store_result()`, `api_get_stored_data()`, patterns fallback
2. **Authentification** : `auth_sync_authenticate_machine()`, `auth_sync_validate_bearer_token()`
3. **Mapping client/API** : `get_client_info()`, `client_*_get_required_apis()`
4. **Transformation de données** : Fonctions de mapping entre formats API

**Structure** : `code/tests/contracts/` - Tests simples < 10 lignes/test
**Commande** : `composer test-contracts` (< 30 secondes)

### 10% - Tests d'Intégration (2-3 flux critiques)
**Responsabilité** : Validation des flux complets critiques

**Flux prioritaires** :
1. Flux d'authentification machine complète
2. Processus de synchronisation avec fallback cache
3. Gestion des webhooks avec validation client

**Structure** : `code/tests/integration/critical_flows/`
**Temps d'exécution** : < 2 minutes total

### Règles d'Or
1. **PHPStan d'abord** - Résoudre tous les warnings avant d'écrire des tests
2. **Test de contrat = interface critique** - Pas de test sur la logique interne
3. **Cache-first obligatoire** - Tout test doit vérifier la résilience des données
4. **Simplicité maximale** - Si un test prend > 10 lignes, le simplifier
5. **Maintenance minimale** - Un test qui casse souvent doit être supprimé

### Ce qu'il ne faut PAS tester (Over-engineering)
- Fonctions utilitaires simples (formatage, logging basique)
- Getters/setters triviaux
- Code debug/temporaire
- Logique technique pure (pas business)
- Fonctions < 5 lignes de logique

**Documentation complète** : `documentation/architecture/13-testing-strategy.md`

## Authentification JWT (Système Actuel)

Le middleware utilise **JSON Web Tokens (JWT)** avec refresh tokens révocables pour l'authentification.

### Architecture JWT
- **Access Token** : JWT HS256, TTL 30 minutes (stateless)
- **Refresh Token** : Token opaque en DB, TTL 1 jour (machine) / 30 jours (user)
- **Multi-Device** : 1 refresh token par device (logout sélectif)
- **Révocation** : Immédiate via `jti_parent` dans access token
- **Scopes** : `exploitant` (admin), `owner` (propriétaire)
- **TTL glissant** : Renouvellement automatique si utilisation < 7 jours

### Routes API
```bash
POST /auth/login          # Login → access_token + refresh_token
POST /auth/refresh        # Renouveler access_token
POST /auth/logout         # Logout device spécifique
POST /auth/logout-all     # Logout global (tous devices)
GET  /auth/validate       # Valider JWT + infos user
```

### Utilisation dans Requêtes
```bash
# Header Authorization
Authorization: Bearer <access_token>
```

### Configuration
```bash
# .env obligatoire
JWT_SECRET=<256_bits_minimum>
```

### Dépréciation Bearer Sync
**IMPORTANT** : L'ancien système Bearer Token Sync API est déprécié (Option C - Migration complète).

- `auth_validate_bearer_token()` → **DEPRECATED** (log warning)
- Migration vers JWT pour tous les nouveaux clients
- Collections Bruno à mettre à jour avec nouveau système JWT

**Documentation complète** : `documentation/memory-bank/guides/authentification.md`

---

## Points d'Attention Critiques

1. **Résilience des données** : Pattern de cache obligatoire
2. **Authentification JWT** : Access token (30 min) + Refresh token révocable
3. **Chargement manuel** : Mettre à jour les `require_once` lors d'ajout de fonctions
4. **Validation systématique** : Vérifier autorisations client avant appels API
5. **Documentation PHPDoc** : Obligatoire pour toutes les fonctions publiques avec paramètres détaillés
6. **Sécurité** : Sanitiser toutes les données externes + JWT_SECRET en .env
7. **Stratégie de tests 70/20/10** : PHPStan (70%) + Tests de contrat (20%) + Tests d'intégration (10%)

## Definition of Done - Critères d'Acceptation

### Code Implemented
- **Scripts d'analyse** : Créer des scripts PHP dans `code/scripts/` si nécessaire pour automatiser l'analyse
- **Fonctionnalités** : Code fonctionnel respectant l'architecture fonctionnelle pure
- **Patterns** : Respect du pattern cache-first et résilience des données

### Tests Written and Passing
**Suivre la stratégie 70/20/10 :**
1. **PHPStan niveau 6** : 0 erreur (`composer phpstan`)
2. **Tests de contrat** : 5-8 tests maximum sur fonctions critiques (`code/tests/contracts/`)
3. **Tests d'intégration** : 2-3 flux critiques (`code/tests/integration/critical_flows/`)

**Critères de qualité** :
- **Pas de framework de tests** : Scripts PHP simples sans dépendances externes
- **Tests simples** : < 10 lignes par test de contrat
- **Exécution rapide** : Tests de contrat < 30s, total < 2 minutes
- **Couverture critique** : 100% des fonctions business identifiées
- **Résilience obligatoire** : Chaque test valide le pattern cache-first
- **Pas de legacy** : Suppression des tests de debug ou obsolètes

### Documentation Updated
- **Rapports techniques** : Matrices de conformité, analyses d'écarts
- **Documentation API** : Préférer les commentaires PHPDoc dans le code source
- **Architecture** : Modifications reflétées dans `documentation/architecture/`
- **Principe** : Documentation intégrée au code via PHPDoc plutôt que fichiers séparés

### Code Reviewed
- **Validation fonctionnelle** : Vérification des critères métier
- **Respect conventions** : Nommage, structure, patterns obligatoires
- **Sécurité** : Audit des données sensibles et sanitisation

### Deployed/Merged
- **Branches Git** : Développement sur branche feature, merge vers `develop`, puis `main`
- **Accessibilité équipe** : Résultats disponibles dans le projet
- **Intégration** : Compatible avec l'existant, pas de breaking changes
- **Documentation** : Guide d'utilisation et procédures mises à jour
- **Pull Request** : Code review obligatoire avant merge

## ⚠️ RÈGLE CRITIQUE - Git Commits

**INTERDICTION ABSOLUE de commiter sans autorisation explicite de l'utilisateur**

### Règles Git strictes :
1. ❌ **JAMAIS** exécuter `git commit` sans que l'utilisateur le demande explicitement
2. ❌ **JAMAIS** exécuter `git add` suivi de `git commit` automatiquement
3. ✅ **TOUJOURS** demander confirmation avant de commiter : "Voulez-vous que je crée un commit avec ces modifications ?"

### Workflow Git autorisé :
```bash
# ✅ AUTORISÉ : Montrer les modifications
git status
git diff

# ❌ INTERDIT sans autorisation explicite :
git commit -m "..."

# ✅ AUTORISÉ uniquement si l'utilisateur dit "commit" ou "crée un commit" :
git add -A && git commit -m "..."
```

### Exceptions (avec confirmation) :
- L'utilisateur dit explicitement : "commit", "crée un commit", "fais un commit"
- L'utilisateur demande : "commit les changements", "valide les modifications"

**En cas de doute : TOUJOURS demander confirmation à l'utilisateur avant de commiter.**

## Règles de Développement Supplémentaires

- Ne rien faire de plus ou de moins que ce qui est demandé
- JAMAIS créer de fichiers sauf s'ils sont absolument nécessaires
- TOUJOURS préférer éditer un fichier existant plutôt qu'en créer un nouveau
- JAMAIS créer de façon proactive de fichiers de documentation (*.md) ou README. Les créer uniquement si explicitement demandé par l'utilisateur.
- **JAMAIS créer de rapports ou de résumés** sauf si nécessaire pour un fonctionnement ultérieur (README d'une section par exemple) ou si explicitement demandé par l'utilisateur

---

## Références Memory Bank (Auto-chargées)

**Documents essentiels toujours en contexte** (~21k tokens) :

```
@documentation/memory-bank/core/quick-start.md
@documentation/memory-bank/core/architecture-essentials.md
@documentation/memory-bank/core/conventions-dev.md
@documentation/memory-bank/core/database-schema-quick.md
@documentation/memory-bank/guides/nouveau-client.md
```

**Autres guides chargés selon besoin** : Voir `documentation/memory-bank/guides/` pour liste complète.

---

**Note finale** : Pas d'erreur Apache, pas de redémarrage Apache nécessaire.