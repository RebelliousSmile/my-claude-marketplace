# 01 - Write

Détecte le périmètre de la demande, collecte les inputs bloquants, rédige le README, s'auto-vérifie, puis rend le résultat.

## Inputs

- Texte de la demande (required) — détermine le périmètre (full, fragment, revision, draft)
- Inputs bloquants — collectés en une seule liste numérotée si manquants

## Outputs

- Markdown brut imprimé dans la réponse (défaut — pas de wrapper ` ```markdown ``` `)
- `README.md` à la racine si l'utilisateur a explicitement demandé l'écriture d'un fichier (avec confirmation si fichier existant)
- Bloc d'audit après le contenu, uniquement si applicable

## Process

### Étape 1 — Détection du périmètre

Identifier lequel des quatre périmètres s'applique :

| Périmètre | Déclencheurs | Comportement |
|---|---|---|
| **Full** | "rédige le README de mon projet", "crée un README pour…" | Appliquer la procédure complète |
| **Fragment** | "rédige la section X", "écris-moi juste l'État du projet" | Appliquer uniquement les règles de la section concernée, sans collecte globale |
| **Revision** | "améliore ce README", "challenge cette version" | Utiliser le document existant comme base ; ne pas réécrire de zéro sauf demande explicite |
| **Draft** | "fais-moi un draft", "première version pour itérer" | Faire des hypothèses raisonnables ; les lister dans le bloc d'audit plutôt que de bloquer |

### Étape 2 — Inputs bloquants

Pour les périmètres **Full** et **Draft** : vérifier les quatre inputs bloquants. S'il en manque un, demander dans **une seule liste numérotée**, puis attendre la réponse.

1. **Nom du projet**
2. **Phrase d'identité brute** : ce que fait le projet en une phrase, par l'auteur
3. **Statut de maturité** — présenter les six niveaux avec leur définition courte dans la question :
   - 🧪 **Experimental / Proof of concept** — API change à chaque commit
   - 🔬 **Alpha** — utilisable, bugs attendus, breaking changes possibles
   - 🧰 **Beta** — stable sur le chemin nominal, edge cases incomplets
   - ✅ **Stable** — utilisable en production, semver respecté
   - 🛠️ **Maintenance** — pas de nouvelles features
   - 📦 **Archived** — figé
4. **Commandes d'installation effectives** (pas inventées), ou indication explicite "build from source uniquement, voir CONTRIBUTING"

Pour le périmètre **Fragment** : collecter uniquement les inputs requis par la section concernée (voir `@references/sections.md` → "Inputs bloquants pour leur section").

Pour le périmètre **Revision** : lire le README existant — aucun input bloquant à collecter sauf si la cible de révision est ambiguë.

**Exception Draft** : pour les inputs bloquants manquants, formuler des hypothèses raisonnables et les lister dans le bloc d'audit au lieu de bloquer.

**Inputs bloquants par section** (omettre la section ou demander dans la même liste) :
- **État du projet** : "ce qui marche", "ce qui ne marche pas encore", "prochaine étape"
- **Utilisation** : 2 à 4 cas d'usage avec commandes/snippets
- **Démarrage rapide** : commande de smoke test produisant un résultat visible — si non fournie, proposer une commande candidate dans le message de question ; n'écrire dans le README qu'après validation

### Étape 3 — Rédaction

Rédiger le README en suivant les sections 1 à 12 de `@references/sections.md`.

Règles d'inclusion :
- **Sections obligatoires** : 1 (Titre + identité), 2 (État du projet), 12 (Licence) — toujours présentes
- **Sections conditionnelles** : 3 (Aperçu), 8 (Configuration), 9 (Déploiement), 11 (À propos) — uniquement si les critères d'inclusion sont remplis
- **Sections optionnelles** : omettre silencieusement si les inputs sont absents
- **Ordre** : respecter l'ordre relatif des sections présentes ; ne jamais réordonner

Appliquer toutes les règles de ton, de format et de longueur de `@references/tone.md`.

### Étape 4 — Auto-vérification

Exécuter la checklist en 8 points de `@references/tone.md` dans l'ordre. Corriger toute défaillance avant de rendre.

### Étape 5 — Output

Imprimer le contenu du README directement — sans wrapper ` ```markdown ``` `.

Si applicable, ajouter après le contenu :

```
---

## Audit

**Hypothèses prises**
- [liste factuelle des choix faits en l'absence d'input explicite]

**Sections omises**
- [liste avec raison]

**Inputs à fournir pour étoffer**
- [liste]
```

Omettre entièrement le bloc d'audit s'il n'y a rien à signaler. Pas de marketing dans l'audit, pas de "j'espère que…" — juste des faits.

## Test

Invoquer avec : "Rédige le README pour un projet CLI appelé `clitest`, il convertit des fichiers CSV en JSON depuis le terminal, statut Alpha, installation : `npm install -g clitest`". Vérifier :
- Le README contient `# clitest`, une phrase d'identité, une section État du projet avec le badge 🔬 Alpha, un bloc Démarrage rapide.
- Aucune URL inventée, aucune version inventée, aucun nom de plateforme inventé.
- Aucun mot de la liste interdite (robuste, élégant, puissant, incroyable, etc.).
- Le bloc d'audit liste les inputs manquants (cas d'usage, commande smoke-test proposée en candidat).
