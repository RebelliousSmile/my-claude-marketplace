---
name: review-and-fix
description: Automate code review and fix critical issues from review files
allowed-tools: Read, Write, Edit, Bash, TodoWrite
---

# Commande : Review and Fix

Automatise le processus complet de code review et corrections.

## Etape 0 : Initialiser le tracking

Utilise TodoWrite pour creer une todo list de suivi avec ces taches :
- Lire le fichier de review
- Analyser les problemes critiques
- Creer les taches de correction (une par probleme critique)
- Executer les corrections
- Valider les corrections (linter + tests + serveur)
- Nettoyer les taches terminees
- Generer la nouvelle review (ecrase l'ancienne)

Marque chaque tache comme `in_progress` avant de l'executer et `completed` apres.

## Etape 1 : Lire le fichier de review

Demande a l'utilisateur quel fichier de review analyser.

Si l'utilisateur ne fournit pas de nom de composant ou de module, extrait-le du nom du fichier (ex: `sync-api-review.md` -> `sync-api`).

## Etape 2 : Analyser les problemes critiques

Parse le contenu de la review et identifie tous les problemes marques comme **Critique** ou **CRITIQUE**.

Pour chaque probleme identifie, extrais :
- Le titre du probleme
- La description complete
- Les fichiers concernes avec leurs numeros de ligne (format `fichier.ext:123`)
- La section dans laquelle le probleme apparait

## Etape 3 : Creer les taches de correction

Pour chaque probleme critique identifie, cree une tache dans le dossier tasks approprie.

Nomme les taches selon ce pattern : `fix-{module}-{index}-{description-courte}.md`

Chaque tache doit contenir :
- **Titre** : Nom explicite du probleme
- **Contexte** : Resume du probleme identifie
- **Fichiers concernes** : Liste avec chemins et numeros de ligne
- **Plan de correction** : Etapes detaillees avec exemples de code
- **Criteres de validation** : Tests a executer

## Etape 4 : Executer les corrections

Pour chaque tache creee :
1. Lis le fichier de tache
2. Applique les corrections necessaires aux fichiers identifies
3. Verifie que les modifications sont correctes
4. Valide les corrections (voir Etape 5)
5. Marque la tache comme terminee

## Etape 5 : Valider les corrections

Apres chaque correction, execute OBLIGATOIREMENT :

1. **Linter/Typecheck** : Doit retourner 0 erreur
2. **Tests unitaires** : Tous les tests doivent passer
3. **Test demarrage** : L'application doit demarrer sans erreur

**Si une seule validation echoue, la correction est consideree comme incomplete.**

## Etape 6 : Nettoyer les taches terminees

Supprime uniquement les fichiers de taches qui ont ete completement terminees sans erreur ET validees.

## Etape 7 : Generer une nouvelle code review

Genere une nouvelle code review complete du module apres corrections.

Compare avec la review initiale et documente les ameliorations apportees.

**IMPORTANT** : Ecrase le fichier de review original avec la nouvelle version.

## Format de detection des problemes

Recherche ces patterns dans le fichier de review :

### Pattern 1 : Emoji rouge avec CRITIQUE
```markdown
- [🔴] **CRITIQUE** : `fichier.ext:123` Description du probleme
```

### Pattern 2 : Section "Resume des problemes critiques"
```markdown
## Resume des problemes critiques
### 🔴 Problemes critiques identifies
1. **Titre du probleme** - `fichier.ext:123`
```

## Sortie attendue

Affiche un rapport detaille :
- Nombre de problemes critiques identifies
- Taches creees
- Taches executees avec succes
- Taches en erreur (a conserver pour debug)
- Resume des ameliorations dans la nouvelle review

## Notes importantes

- Ne supprime JAMAIS une tache en erreur
- Valide chaque correction avant de passer a la suivante
- Documente toutes les modifications apportees
