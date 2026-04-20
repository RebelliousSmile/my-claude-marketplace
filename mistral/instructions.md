# Instructions pour Mistral Vibe

Ce fichier décrit comment utiliser Mistral Vibe avec le framework AIDD dans le projet.

## Environnement d'Exécution

- **Système d'exploitation** : La plupart des projets sont développés sous Windows.
- **Terminal** : Les commandes sont exécutées dans PowerShell.
- **Vérification initiale** : Avant d'exécuter des commandes, vérifiez l'OS et le terminal utilisé pour adapter les commandes.

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

## Notes supplémentaires

- Les agents, commandes, règles et compétences sont définis dans `.opencode/`.
- La mémoire interne est chargée automatiquement depuis `aidd_docs/memory/internal/`.
- Les modifications dans `.opencode/` sont prises en compte dynamiquement.
- **Images** : Les images pour Mistral Vibe sont placées dans `aidd_docs/images/`.
- **Exécution des prompts** : Lorsque vous ciblez un fichier dans `.opencode/` avec `@`, il doit être exécuté comme un prompt et non modifié.
