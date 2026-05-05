# Instructions pour Mistral Vibe

Ce fichier décrit comment utiliser Mistral Vibe avec le framework AIDD dans le projet.

## Environnement d'Exécution

- **Détection dynamique** : Détectez automatiquement le système d'exploitation et le terminal utilisé. Stockez ces informations dans `aidd_docs/memory/internal/environment.md` au format Markdown.
- **Format recommandé** :
  ```markdown
  # Environnement détecté
  - OS: [Windows/Linux/macOS]
  - Terminal: [PowerShell/Bash/Zsh]
  - Version: [version détaillée]
  - Dernière mise à jour: [timestamp]
  ```
- **Vérification initiale** : Avant d'exécuter des commandes, vérifiez l'OS et le terminal utilisé pour adapter les commandes.
- **Intégration** : Utilisez ces informations pour configurer les chemins, commandes et comportements spécifiques à l'environnement.

## Framework AIDD

Le projet utilise le framework **AIDD** (Agent-Integrated Development Framework), défini dans le répertoire `.opencode/`.

### Structure du framework

- **Agents** : `.opencode/agents/` - Contient les définitions des agents disponibles.
- **Commandes** : `.opencode/commands/` - Contient les commandes disponibles pour interagir avec le système.
- **Règles** : `.opencode/rules/` - Contient les règles et procédures à suivre.
- **Compétences** : `.opencode/skills/` - Contient les compétences et capacités des agents.

### Mémoire

Mistral Vibe utilise une mémoire interne pour stocker les informations importantes :

- **Mémoire interne** : `aidd_docs/memory/internal/` - Contient les informations persistantes et les règles chargées.
- **Mémoire externe** : `aidd_docs/memory/external/` - Contient les informations temporaires ou spécifiques à une session.

### Utilisation

Les commandes intégrées comme `/clear`, `/model`, `/exit` sont disponibles directement dans l'interface. Pour utiliser les commandes personnalisées du framework AIDD, référez-vous aux fichiers dans `.opencode/commands/`.

## Exécution des prompts

- **Fichiers @** : Les fichiers dans `.opencode/` préfixés par `@` sont des prompts exécutables
- **Comportement attendu** :
  - Ne pas modifier ces fichiers directement
  - Exécuter leur contenu comme instructions
  - Respecter les validations définies dans le prompt lui-même
  - Ne pas ajouter de validations supplémentaires non prévues
- **Completion** :
  - Suivre strictement les critères de completion définis dans chaque prompt
  - Ne pas marquer comme "completed" sans avoir satisfait tous les critères
  - Signaler clairement les échecs ou blocages

## Notes supplémentaires

- Les agents, commandes, règles et compétences sont définis dans `.opencode/`.
- La mémoire interne est chargée automatiquement depuis `aidd_docs/memory/internal/`.
- Les modifications dans `.opencode/` sont prises en compte dynamiquement.
- **Images** : Les images pour Mistral Vibe sont placées dans `aidd_docs/images/`.
