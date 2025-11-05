---
name: new-client
description: Créer un nouveau client SmartLockers avec workflow complet automatisé
---

# Commande : /new-client

Crée un nouveau client SmartLockers en suivant le workflow standardisé complet.

## Usage

```bash
/new-client <client_name> [--apis=API1,API2] [--dry-run]
```

## Arguments

- `<client_name>` : Nom du client (alphanumérique, snake_case, exemple: `mycompany`, `onet`, `cosyhosting`)
- `--apis=API1,API2` : (Optionnel) Liste des APIs autorisées séparées par virgule
- `--dry-run` : (Optionnel) Prévisualise les changements sans exécuter

## Exemples

```bash
/new-client mycompany --apis=Pilotphone,Stripe
/new-client testclient --dry-run
/new-client newcorp
```

## Workflow Automatique

Cette commande délègue au **agent `client-creator`** qui exécutera automatiquement :

1. ✅ **Validation** du nom client (snake_case, alphanumérique, non existant)
2. 🔐 **Génération credentials** (Bearer Token + Machine Login/Password)
3. 📄 **Création fichier client** (`code/clients/<client>_functions.php`)
4. 🗄️ **Création tables DB** (`<client>_api_cache` + tables test)
5. 🧪 **Génération collection Bruno** (tests API)
6. ✅ **Tests de contrat** (validation fonctions obligatoires)
7. 📚 **Documentation client** (`documentation/clients/<client>.md`)

## Checklist de Validation

L'agent vérifiera automatiquement :

- [ ] Credentials générées et testées
- [ ] Fichier client créé avec fonctions obligatoires
- [ ] Tables DB créées avec préfixe correct
- [ ] Collection Bruno générée
- [ ] Tests passent (`composer test-client <client>`)
- [ ] PHPStan niveau 6 : 0 erreur
- [ ] Documentation créée

## Instructions à Claude

Quand cette commande est invoquée :

### Étape 0 : Initialiser TodoList

Utilise **TodoWrite** pour créer une todo list de suivi avec ces tâches :

```yaml
- Valider nom client et arguments
- Déléguer à l'agent client-creator
- Monitorer progression agent
- Vérifier checklist finale
- Générer rapport de création
```

Marque chaque tâche comme `in_progress` avant de l'exécuter et `completed` après.

### Étape 1 : Validation Arguments

1. **Extraire nom client** :
   - Premier argument après `/new-client`
   - Doit être alphanumérique et snake_case
   - Ne doit pas être vide

2. **Parser options** :
   - `--apis=API1,API2` → extraire liste APIs
   - `--dry-run` → mode preview activé

3. **Valider format nom** :
   ```bash
   # Vérifier snake_case et alphanumérique
   if [[ ! "$client_name" =~ ^[a-z0-9_]+$ ]]; then
       echo "❌ ERREUR: Nom client invalide. Utiliser snake_case (a-z, 0-9, _)"
       exit 1
   fi
   ```

4. **Vérifier non-existence** :
   ```bash
   # Vérifier que client n'existe pas déjà
   if [ -f "code/clients/${client_name}_functions.php" ]; then
       echo "❌ ERREUR: Client ${client_name} existe déjà"
       exit 1
   fi
   ```

### Étape 2 : Confirmation Utilisateur

**SI mode dry-run activé** :

```markdown
🔍 **Aperçu Création Client : ${client_name}**

Fichiers qui seront créés :
- code/clients/${client_name}_functions.php
- code/clients/config/${client_name}.cfg
- database/migrations/${client_name}_tables.sql
- bruno-collections/${client_name}/
- code/tests/contracts/test_${client_name}.php
- documentation/clients/${client_name}.md

APIs autorisées : ${apis_list}

Scripts qui seront exécutés :
1. php code/scripts/setup_client_credentials.php ${client_name}
2. php code/scripts/generate_bruno_collection.php ${client_name}

Tests qui seront exécutés :
- composer test-client ${client_name}
- composer phpstan

Voulez-vous procéder ? (oui/non)
```

**SI mode normal** :

```markdown
⚙️ **Création Client : ${client_name}**

Je vais créer un nouveau client avec :
- Nom : ${client_name}
- APIs : ${apis_list ou "À configurer manuellement"}

Cette opération va :
1. Générer credentials automatiquement
2. Créer fichiers et tables DB
3. Exécuter scripts d'automatisation
4. Lancer tests de validation

Durée estimée : 10-15 minutes

Voulez-vous continuer ? (oui/non)
```

### Étape 3 : Délégation Agent

**Invoquer l'agent `client-creator`** avec les paramètres validés :

```markdown
Je délègue maintenant la création à l'agent spécialisé `client-creator`...
```

**Utiliser Task tool** :

```yaml
subagent_type: general-purpose
description: Créer nouveau client SmartLockers
prompt: |
  Tu dois créer un nouveau client SmartLockers nommé "${client_name}".

  Suis EXACTEMENT le workflow documenté dans `.claude/agents/client-creator.md`.

  Paramètres :
  - Client name: ${client_name}
  - APIs autorisées: ${apis_list}
  - Dry-run: ${dry_run_mode}

  Exécute chaque étape séquentiellement et demande confirmation avant actions destructives.
  Respecte TOUJOURS les conventions du projet (patterns cache-first, PHPDoc, préfixes).

  Retourne un rapport complet avec :
  - Fichiers créés
  - Scripts exécutés
  - Tests passés
  - Credentials générées (NE PAS COMMITER)
  - Prochaines étapes pour l'utilisateur
```

### Étape 4 : Monitorer Progression

Pendant l'exécution de l'agent :

1. **Suivre avancement** via TodoList
2. **Afficher messages d'avancement** :
   ```
   ⏳ Génération credentials...
   ✅ Credentials générées

   ⏳ Création fichier client...
   ✅ Fichier créé

   ⏳ Création tables DB...
   ✅ Tables créées

   ...
   ```

3. **Gérer erreurs** :
   - Si erreur à une étape : STOP et afficher erreur
   - Proposer rollback si nécessaire
   - Ne pas continuer si validation échoue

### Étape 5 : Vérification Checklist Finale

Après retour de l'agent, vérifier checklist complète :

```markdown
## ✅ Checklist Validation Client : ${client_name}

### Configuration
- [✓/✗] Credentials générées (`code/clients/config/${client_name}.cfg`)
- [✓/✗] Tables DB créées avec préfixe correct
- [✓/✗] APIs autorisées configurées dans get_required_apis()
- [✓/✗] Collection Bruno générée et testée

### Code
- [✓/✗] Fichier client créé (`code/clients/${client_name}_functions.php`)
- [✓/✗] Fonctions obligatoires implémentées :
  - client_${client_name}_get_required_apis()
  - client_${client_name}_get_required_providers()
  - client_${client_name}_handle()
- [✓/✗] PHPDoc complet sur toutes fonctions
- [✓/✗] Préfixes respectés (client_, api_, db_)

### Tests
- [✓/✗] composer test-client ${client_name} : 100% success
- [✓/✗] composer phpstan : 0 erreur
- [✓/✗] Tests Bruno manuels : Toutes routes OK

### Sécurité
- [✓/✗] Isolation multi-tenant validée (pas de cross-access)
- [✓/✗] Credentials de production différentes de test
- [✓/✗] Logs ne contiennent pas de secrets

### Documentation
- [✓/✗] Documentation client créée (`documentation/clients/${client_name}.md`)
- [✓/✗] APIs utilisées listées
- [✓/✗] Routes disponibles documentées
```

**Si checklist complète** : Passer à Étape 6

**Si checklist incomplète** :
```markdown
⚠️ **Validation incomplète**

Problèmes détectés :
- [Liste des items ✗]

Je recommande de corriger ces problèmes avant de considérer la création terminée.

Voulez-vous :
A. Corriger maintenant (je peux vous aider)
B. Rollback complet (supprimer tout ce qui a été créé)
C. Ignorer et continuer (non recommandé)
```

### Étape 6 : Générer Rapport Final

**Rapport de création** :

```markdown
## 🎉 Client ${client_name} créé avec succès !

### Fichiers Créés

**Code** :
- `code/clients/${client_name}_functions.php` (squelette complet)
- `code/clients/config/${client_name}.cfg` (configuration)

**Base de Données** :
- `${client_name}_api_cache` (table cache)
- `test_${client_name}_api_cache` (table test)
- Migration : `database/migrations/${client_name}_tables.sql`

**Tests** :
- `code/tests/contracts/test_${client_name}.php` (tests de contrat)
- Collection Bruno : `bruno-collections/${client_name}/`

**Documentation** :
- `documentation/clients/${client_name}.md` (documentation client)

### Credentials Générées

⚠️ **IMPORTANT : NE PAS COMMITER CES CREDENTIALS**

- **Machine Login** : `${machine_login}`
- **Machine Password** : `${machine_password}`
- **Bearer Token** : `${bearer_token}`

Ces credentials sont stockées dans `code/clients/config/${client_name}.cfg`

### Prochaines Étapes

1. **Configurer APIs**
   Éditer `code/clients/config/${client_name}.cfg` et ajouter :
   ```ini
   # API Configuration
   api_targetapi_mode=production
   api_targetapi_base_url=https://api.example.com/v1
   api_targetapi_api_key=YOUR_API_KEY_HERE
   ```

2. **Implémenter Logique Métier**
   Éditer `code/clients/${client_name}_functions.php` :
   ```php
   function client_${client_name}_get_required_apis(): array {
       return ['TargetAPI']; // Ajouter vos APIs
   }

   function client_${client_name}_handle(string $apiName, $data): array {
       // Implémenter logique métier ici
   }
   ```

3. **Créer Tables Métier** (si nécessaire)
   ```sql
   CREATE TABLE ${client_name}_reservations (...);
   CREATE TABLE ${client_name}_data (...);
   ```

4. **Tester**
   ```bash
   # Tests contracts
   composer test-client ${client_name}

   # Tests Bruno (API)
   cd bruno-collections/${client_name}/
   bruno run

   # Validation PHPStan
   composer phpstan
   ```

5. **Configurer Cron** (si synchronisation programmée)
   ```bash
   # Exemple : sync quotidien à 4h
   0 4 * * * curl -X POST https://domain.com/${client_name}/process-api \
       -H "Authorization: Bearer ${bearer_token}"
   ```

### Ressources

- **Guide complet** : `documentation/memory-bank/guides/nouveau-client.md`
- **Conventions** : `documentation/memory-bank/core/conventions-dev.md`
- **Patterns API** : `documentation/memory-bank/guides/api-integration.md`

### Support

Pour questions ou problèmes :
- Consulter documentation dans `documentation/`
- Vérifier exemples clients : `code/clients/onet_functions.php`
- Tests de référence : `code/tests/contracts/`
```

### Étape 7 : Cleanup TodoList

Marquer toutes les tâches comme `completed` et nettoyer la todo list.

## Gestion d'Erreurs

### Erreur : Nom Client Invalide

```markdown
❌ **Erreur : Nom client invalide**

Le nom "${client_name}" ne respecte pas les conventions :
- Doit être en snake_case (minuscules + underscores)
- Caractères autorisés : a-z, 0-9, _
- Exemples valides : mycompany, test_client, onet

Corrigez le nom et réessayez.
```

### Erreur : Client Existe Déjà

```markdown
❌ **Erreur : Client existe déjà**

Un client nommé "${client_name}" existe déjà dans le système :
- Fichier : `code/clients/${client_name}_functions.php`

Options :
A. Choisir un autre nom
B. Supprimer le client existant (⚠️ destructif)
C. Modifier le client existant

Que voulez-vous faire ?
```

### Erreur : Script Génération Credentials Échoue

```markdown
❌ **Erreur : Génération credentials a échoué**

Le script `setup_client_credentials.php` a retourné une erreur :
${error_message}

Causes possibles :
- Script PHP non exécutable
- Extensions PHP manquantes
- Permissions fichiers insuffisantes

Actions recommandées :
1. Vérifier que PHP est installé : `php --version`
2. Vérifier permissions : `ls -la code/scripts/setup_client_credentials.php`
3. Exécuter manuellement : `php code/scripts/setup_client_credentials.php ${client_name}`

Voulez-vous réessayer après correction ?
```

### Erreur : Tests Échouent

```markdown
❌ **Erreur : Tests échouent**

Les tests de validation ont échoué :
${test_errors}

Le client a été partiellement créé mais n'est pas production-ready.

Options :
A. Corriger les erreurs et relancer tests
B. Rollback complet (supprimer tout)
C. Ignorer et continuer (non recommandé)

Recommandation : **Option A** (corriger)

Que voulez-vous faire ?
```

### Erreur : PHPStan Erreurs

```markdown
❌ **Erreur : PHPStan a détecté des erreurs**

Analyse statique échouée avec ${error_count} erreur(s) :
${phpstan_errors}

Le code créé ne respecte pas les standards qualité du projet.

Je peux corriger automatiquement ces erreurs. Voulez-vous que je procède ?
```

## Rollback Automatique

Si l'utilisateur demande un rollback ou si erreur critique :

```markdown
🔄 **Rollback en cours...**

Suppression fichiers créés :
- code/clients/${client_name}_functions.php ✓
- code/clients/config/${client_name}.cfg ✓
- bruno-collections/${client_name}/ ✓
- code/tests/contracts/test_${client_name}.php ✓
- documentation/clients/${client_name}.md ✓

Suppression tables DB :
- DROP TABLE IF EXISTS ${client_name}_api_cache; ✓
- DROP TABLE IF EXISTS test_${client_name}_api_cache; ✓

Nettoyage credentials :
- Suppression entries dans sync_auth.php ✓
- Suppression entries dans smartlockers_sync.php ✓

Validation intégrité système :
- composer phpstan : ✓ OK
- composer test : ✓ OK

✅ Rollback terminé. Système restauré à l'état initial.
```

## Notes Importantes

### Règles Critiques

1. **TOUJOURS** demander confirmation utilisateur avant actions destructives
2. **JAMAIS** créer fichiers sans validation nom client
3. **JAMAIS** commiter credentials générées
4. **TOUJOURS** valider avec PHPStan avant complétion
5. **TOUJOURS** proposer rollback si erreur

### Conventions Projet

- **Architecture** : Fonctionnel PHP pur (pas de classes)
- **Préfixes** : `client_`, `api_`, `provider_`, `db_`, `auth_`
- **Cache-first** : TOUJOURS mettre à jour cache SEULEMENT si HTTP 2xx
- **Tests** : 70% PHPStan + 20% Contrats + 10% Intégration
- **Multi-tenant** : Tables préfixées par client
- **UUID pour lockers** : Pas d'ID numérique exposé

### Sécurité

- ⚠️ **Credentials NE DOIVENT JAMAIS être commitées dans Git**
- ⚠️ **Validation isolation multi-tenant obligatoire**
- ⚠️ **Sanitisation entrées obligatoire**

## Exemples Complets

### Exemple 1 : Création Client Simple

```bash
User: /new-client acmecompany