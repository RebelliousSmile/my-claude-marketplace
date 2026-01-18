---
name: update-docs
description: Sync documentation after code changes (code -> docs)
allowed-tools: Read, Write, Glob, Grep
---

# Commande : Update Documentation

Automatise la mise a jour de la documentation apres des changements de code.

## Workflow

### Etape 1 : Analyser les changements

Execute `git diff` pour identifier les changements recents :
```bash
git diff HEAD~1 HEAD --name-status
```

### Etape 2 : Categoriser les changements

Pour chaque fichier modifie, identifie la categorie et la documentation impactee.

### Etape 3 : Generer les mises a jour

Pour chaque fonction/composant modifie :
1. Lire le code source et extraire signatures, parametres, retours
2. Mettre a jour le fichier Markdown correspondant

### Etape 4 : Valider les modifications

Avant d'appliquer :
- Syntaxe Markdown valide
- Exemples de code syntaxiquement corrects
- Liens internes vers fichiers existants

### Etape 5 : Proposer les mises a jour

Pour chaque fichier de documentation a modifier :
1. Afficher un diff des changements proposes
2. Demander confirmation a l'utilisateur
3. Appliquer les modifications si accepte

## Regles Importantes

### Ne JAMAIS

- Supprimer de la documentation existante sans validation explicite
- Modifier les exemples de code sans les tester
- Creer de nouveaux fichiers de documentation sans demander
- Ecraser les descriptions metier redigees manuellement

### TOUJOURS

- Preserver les descriptions fonctionnelles existantes
- Valider les changements avec l'utilisateur avant application
- Respecter les templates existants
- Verifier la coherence cross-reference entre documents
