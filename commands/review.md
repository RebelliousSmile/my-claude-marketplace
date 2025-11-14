---
name: review
description: Orchestrateur code reviews - Déclenche skill (rapide) ou agent (approfondi) selon contexte
---

# Commande : Code Review

Orchestrateur intelligent de code reviews pour SmartLockers. Décide automatiquement entre review rapide (skill) ou approfondie (agent).

## Usage

```bash
/review [module] [--depth=quick|full]
```

## Paramètres

- `module` (optionnel) : Nom du module (ex: onet, sync-api, guesty, lockandchill)
- `--depth` (optionnel) : `quick` (skill, 5 min) ou `full` (agent, 15 min)

**Si aucun paramètre** : Détection automatique des changements Git

## Workflow

### ÉTAPE 1 : Détection Scope

**Si module fourni** :
```
Module : {module}
```

**Si aucun module** :

Demander à l'utilisateur via AskUserQuestion :

```
Quel scope voulez-vous reviewer ?

A. Branche Git (tous changements depuis main)
B. Module spécifique (onet, cosyhosting, halpades, lockandchill, sync-api, database, auth)
C. Fichier(s) spécifique(s)
D. Tous les fichiers du projet (audit complet)
```

**Modules disponibles** :
- `onet` : code/clients/onet_functions.php + code/apis/pilotphone_functions.php + code/apis/planet_functions.php
- `cosyhosting` : code/clients/cosyhosting_functions.php + code/apis/guesty_functions.php
- `halpades` : code/clients/halpades_functions.php + code/apis/msexchange_functions.php
- `lockandchill` : code/clients/lockandchill_functions.php + code/apis/beds24_functions.php
- `sync-api` : code/src/services/smartlockers_sync.php
- `database` : code/src/services/database/mysql.php
- `auth` : code/src/services/auth.php

### ÉTAPE 2 : Décision Depth (Automatique ou Manuel)

**Si --depth fourni** : Utiliser la valeur

**Si --depth NON fourni** : Détection automatique

```bash
# Compter fichiers et lignes modifiés
files_count=$(echo "$files" | wc -w)
lines_count=$(cat $files | wc -l)

# Règles de décision
if [ "$files_count" -lt 5 ] && [ "$lines_count" -lt 500 ]; then
    depth="quick"   # Skill code-review
else
    depth="full"    # Agent senior-code-reviewer
fi
```

**Confirmation utilisateur** (AskUserQuestion) :

```
🔍 **Paramètres Code Review**

Module : {module}
Fichiers : {files_count}
Lignes : {lines_count}

Profondeur recommandée : {depth}

Options :
- ⚡ Quick : Review rapide (5 min) via skill code-review
- 🔬 Full : Review approfondie (15 min) avec scoring détaillé via agent senior-code-reviewer

Quelle profondeur voulez-vous utiliser ?
```

### ÉTAPE 3 : Délégation Review

#### Si depth = quick

```markdown
⚡ **Review Rapide (Skill)**

Je lance la skill code-review pour une review rapide...
```

**Action** : Déclencher skill via contexte (la skill se déclenche automatiquement)

```
Code review des fichiers suivants :
{liste fichiers}

Utilise la checklist SmartLockers :
- Functionality, Quality, Security, Performance, Testing
- Patterns spécifiques : cache-first, multi-tenant, UUID, sanitisation
- Format compatible /review-and-fix
```

---

#### Si depth = full

```markdown
🔬 **Review Approfondie (Agent)**

Je lance l'agent senior-code-reviewer pour une review exhaustive avec scoring...
```

**Action** : Invoquer agent senior-code-reviewer

```
@senior-code-reviewer :

Effectue une code review approfondie du module "{module}".

Fichiers à reviewer :
{liste fichiers}

Génère un rapport structuré avec :
- Score global 0-10
- Scores par catégorie (Functionality, Quality, Security, Performance, Architecture, Testing)
- Détection automatique patterns critiques SmartLockers
- Problèmes par priorité (🔴 CRITIQUE, 🟡 AVERTISSEMENT, 🟢 SUGGESTION)
- Format compatible /review-and-fix

Sauvegarde le rapport dans : documentation/reviews/{module}-review-{YYYY-MM}.md
```

### ÉTAPE 4 : Post-Review

Une fois review générée (par skill ou agent) :

```markdown
✅ **Code Review Terminée**

Fichier : documentation/reviews/{filename}

**Résumé** :
- Review type : {quick/full}
- Score global : {score}/10 (si full)
- Problèmes critiques : {critical_count}
- Avertissements : {warning_count}
- Suggestions : {suggestion_count}

**Prochaines étapes** :

1. **Lire review complète** :
   ```bash
   cat documentation/reviews/{filename}
   ```

2. **Corriger automatiquement problèmes critiques** :
   ```bash
   /review-and-fix {filename}
   ```

3. **Valider corrections** :
   ```bash
   composer phpstan
   composer test
   ```

4. **Re-review après corrections** (optionnel) :
   ```bash
   /review {module} --depth={same_depth}
   ```
```

## Exemples d'Utilisation

### Exemple 1 : Review Auto (Branche Git)

```bash
# Détecte automatiquement changements Git
/review

# Workflow :
# 1. Détecte 3 fichiers modifiés (< 5)
# 2. Suggère depth=quick
# 3. Utilisateur confirme
# 4. Skill code-review s'exécute (5 min)
# 5. Rapport généré : documentation/reviews/feature-branch-review-2025-11.md
```

### Exemple 2 : Review Module Spécifique

```bash
# Review approfondie module ONET
/review onet --depth=full

# Workflow :
# 1. Identifie 3 fichiers (onet_functions.php, pilotphone_functions.php, planet_functions.php)
# 2. Agent senior-code-reviewer s'exécute (15 min)
# 3. Scoring détaillé : 7.2/10
# 4. Rapport : documentation/reviews/onet-review-2025-11.md
# 5. Suggestion : /review-and-fix pour corriger 5 problèmes critiques
```

### Exemple 3 : Review Fichier Spécifique

```bash
# Review rapide d'un seul fichier
/review code/clients/lockandchill_functions.php --depth=quick

# Workflow :
# 1. 1 fichier détecté
# 2. Depth=quick automatique
# 3. Skill code-review (3 min)
# 4. Rapport : documentation/reviews/lockandchill-review-2025-11.md
```

### Exemple 4 : Audit Complet Projet

```bash
# Audit complet de tous les modules (rare, pour release majeure)
/review --depth=full

# Workflow :
# 1. Demande scope : "Tous les fichiers du projet"
# 2. Agent senior-code-reviewer (30-45 min)
# 3. Rapport complet : documentation/reviews/full-audit-2025-11.md
# 4. Scoring global : 8.1/10
```

## Intégration avec /review-and-fix

**Workflow complet** :

```
┌────────────────────────┐
│ /review onet --depth=full │
└────────────┬───────────┘
             ↓
   ┌─────────────────────────────┐
   │ Agent senior-code-reviewer   │
   │ - Analyse code               │
   │ - Détecte patterns           │
   │ - Génère rapport             │
   └────────────┬────────────────┘
                ↓
   ┌─────────────────────────────────────┐
   │ documentation/reviews/onet-review-2025-11.md │
   │ - Score : 6.5/10                    │
   │ - 5 problèmes critiques 🔴          │
   └────────────┬────────────────────────┘
                ↓
   ┌───────────────────────────────┐
   │ /review-and-fix onet-review-2025-11.md │
   └────────────┬──────────────────┘
                ↓
   ┌─────────────────────────────┐
   │ - Parse problèmes 🔴         │
   │ - Crée tâches correction     │
   │ - Applique corrections       │
   │ - Valide (PHPStan + Tests)   │
   └────────────┬────────────────┘
                ↓
   ┌─────────────────────────────┐
   │ Nouvelle review générée      │
   │ Score : 8.5/10 ✅            │
   │ 0 problèmes critiques        │
   └──────────────────────────────┘
```

## Notes Importantes

- **TOUJOURS sauvegarder** review dans `documentation/reviews/`
- **Format fichier** : `{module}-review-{YYYY-MM}.md`
- **Compatibilité** : Format DOIT être compatible avec `/review-and-fix`
- **Historique** : Conserver reviews pour traçabilité (ne pas écraser)

## Règles de Décision Depth

| Critère | Quick (Skill) | Full (Agent) |
|---------|---------------|--------------|
| **Fichiers** | < 5 | >= 5 |
| **Lignes** | < 500 | >= 500 |
| **Temps** | 3-5 min | 15-20 min |
| **Scoring** | ✅/⚠️/❌ | 0-10 détaillé |
| **Détection patterns** | Basique | Automatique avancée |
| **Use case** | PR review, validation rapide | Audit module, release |
