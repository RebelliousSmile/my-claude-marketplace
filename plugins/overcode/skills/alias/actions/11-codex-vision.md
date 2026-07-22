# Action 11 — codex-vision

Audite de façon critique du code généré ou modifié par un autre LLM. L'objectif est de détecter les défauts réels, les simplifications trompeuses et les régressions, tout en préservant l'intégralité du contrat fonctionnel.

Cette action est **non mutante vis-à-vis du code audité** : elle analyse et rapporte. Elle ne corrige, ne reformate, ne commit et ne pousse rien. Les validations susceptibles d'écrire des artefacts ou des données persistantes sont écartées.

## Context required

- **Cible** — diff, branche, commit, PR ou chemin à auditer. Par défaut : changements suivis et non suivis du working tree courant, comparés à `HEAD`.
- **Référence** *(optionnelle)* — branche, commit ou état antérieur servant de baseline.
- **Contrat fonctionnel** *(optionnel mais prioritaire)* — issue, plan, spécification, critères d'acceptation ou instructions ayant produit le code.

Si aucune cible ne peut être déterminée depuis le contexte ou le dépôt, demander : *« Quel diff, commit, branche, PR ou chemin dois-je auditer ? »*

## Prompt

Execute the following workflow verbatim.

### Step 1 — Ancrer le périmètre sans modifier l'état

1. Lire les instructions du dépôt et relever les commandes de validation disponibles.
2. Identifier précisément :
   - la cible auditée ;
   - la baseline utilisée ;
   - les fichiers ajoutés, modifiés, supprimés et non suivis inclus ;
   - le contrat fonctionnel disponible.
3. Résoudre la baseline de façon déterministe quand elle n'est pas fournie : `HEAD` pour le working tree ou un chemin local, parent du commit pour un commit isolé, merge-base avec la branche de base pour une branche/PR. Si la branche de base n'est pas identifiable localement, l'indiquer au lieu de la deviner.
4. Si la cible est le working tree, inclure les diffs staged et unstaged ainsi que les fichiers non suivis pertinents. Ne jamais nettoyer, restaurer, checkout ou stash le dépôt.
5. Afficher l'ancrage avant l'analyse :

```text
🔭 codex-vision — ancrage
Cible    : <cible>
Baseline : <référence>
Contrat  : <sources ou « contrat explicite absent »>
Portée   : <fichiers / modules>
Mode     : audit en lecture seule
```

### Step 2 — Reconstituer le contrat fonctionnel

Construire un inventaire compact des comportements que la cible doit préserver ou introduire, par ordre de fiabilité :

1. critères d'acceptation, issue, plan ou spécification fournis ;
2. tests existants et nouveaux ;
3. comportement observable de la baseline et API publiques ;
4. documentation et conventions du projet ;
5. intention raisonnablement inférable du diff — marquée explicitement comme **inférence**.

Inclure les parcours nominaux, erreurs, cas limites, permissions, données persistées, contrats d'API, compatibilité et effets de bord pertinents. Ne pas considérer les seuls tests comme le contrat complet.

Produire une matrice :

```text
| ID | Comportement attendu | Source du contrat | Couverture/preuve disponible |
|----|----------------------|-------------------|------------------------------|
```

Si aucun contrat fiable ni baseline exploitable n'existe, continuer l'audit statique mais annoncer que l'absence de perte fonctionnelle ne pourra pas être démontrée.

### Step 3 — Comprendre le changement dans son contexte

Lire le diff intégral puis le code appelant et appelé nécessaire pour comprendre chaque changement. Pour les suppressions ou remplacements, rechercher tous les usages, exports, routes, événements, migrations, configurations et tests associés.

Tracer pour chaque comportement de la matrice :

```text
entrée → validation → logique métier → état/effet de bord → sortie observable
```

Comparer cette chaîne entre baseline et cible. Chercher particulièrement :

- fonctionnalités supprimées, branches oubliées, retours anticipés et fallbacks perdus ;
- API, schémas, événements ou formats modifiés sans migration/compatibilité ;
- code plausible mais non connecté au flux réel, duplication et abstraction fictive ;
- erreurs masquées, valeurs par défaut inventées, validations affaiblies ;
- races, idempotence, transactions, ressources non libérées et incohérences d'état ;
- failles de permissions, injection, exposition de secrets/données et frontières de confiance ;
- tests qui valident l'implémentation au lieu du comportement ou qui omettent un parcours critique.

Ne signaler ni préférence de style ni refactor hypothétique sans impact concret.

### Step 4 — Vérifier par preuves

1. Exécuter les validations ciblées déjà disponibles (tests, typecheck, lint, build) en commençant par les plus proches du changement.
2. N'installer aucune dépendance et ne modifier aucun fichier pour faire passer les validations.
3. Avant chaque commande, vérifier ses effets de bord attendus. Si elle peut modifier des fichiers suivis, une base de données ou un service persistant, ne pas l'exécuter. Comparer l'état Git avant et après les validations ; si un effet inattendu apparaît, arrêter les validations, le signaler et ne rien nettoyer automatiquement.
4. Si une commande est coûteuse, destructive, nécessite des secrets ou des services absents, ne pas l'exécuter ; expliquer précisément la limite.
5. Pour toute régression suspectée, chercher une preuve reproductible : test existant, chemin d'exécution, appelant concret, contradiction avec le contrat ou comparaison baseline/cible.
6. Ne jamais affirmer « aucune perte de fonctionnalités » sur la seule base d'un build vert. Distinguer :
   - **préservé** — preuve positive disponible ;
   - **régression** — comportement perdu ou altéré avec preuve ;
   - **non démontré** — preuve insuffisante ou validation impossible.

### Step 5 — Qualifier les findings

Ne retenir que les constats actionnables et indépendants. Chaque finding doit contenir :

- sévérité : `bloquant`, `majeur`, `mineur` ;
- confiance : `haute`, `moyenne`, `faible` ;
- fichier et ligne au plus près de la cause ;
- comportement affecté et scénario minimal de reproduction ;
- preuve observée ;
- correction minimale recommandée, sans l'appliquer.

Une possibilité théorique sans chemin déclenchable n'est pas un finding. Regrouper les occurrences ayant la même cause racine. Classer d'abord par sévérité, puis par confiance.

### Step 6 — Rapport

Commencer par les findings, sans préambule. Si aucun défaut prouvé n'est trouvé, l'indiquer explicitement tout en conservant les limites de preuve.

```text
🔭 codex-vision — audit critique

Findings
1. [majeur · confiance haute] <titre>
   <fichier:ligne> — <comportement affecté, scénario et preuve>
   Correction minimale : <recommandation>

Préservation fonctionnelle
| ID | Statut (préservé/régression/non démontré) | Preuve |
|----|-------------------------------------------|--------|

Vérifications
- ✅ <commande> — <résultat>
- ❌ <commande> — <échec pertinent>
- ⚠ <non exécutée> — <raison>

Verdict : <préservé / régressions détectées / non démontré>
Risque résiduel : <zones non couvertes ou « aucun identifié »>
```

Le verdict **préservé** exige que tous les comportements inventoriés soient prouvés préservés. Au moindre comportement en `régression`, choisir **régressions détectées**. Sans régression prouvée mais avec au moins un comportement `non démontré`, choisir **non démontré**.
