# 02 - Update

Révise un `README.md` existant — globalement ou sur une section ciblée. Ne collecte pas d'inputs bloquants : tout le contexte est lu depuis le fichier. S'auto-vérifie, puis rend le résultat.

> Si aucun `README.md` n'existe → dispatcher vers `write`.

## Inputs

- `README.md` existant (required) — lu intégralement avant toute modification
- Texte de la demande (required) — détermine la portée (globale ou section ciblée)

## Outputs

- Markdown brut imprimé dans la réponse (défaut — pas de wrapper ` ```markdown ``` `)
- `README.md` mis à jour si l'utilisateur a explicitement demandé l'écriture du fichier (demander confirmation avant d'écraser)
- Bloc de diff concis listant les changements appliqués (toujours présent)

## Process

### Étape 1 — Lecture du README existant

Lire `README.md` en entier. Identifier :
- Les sections présentes et leur ordre
- Le statut de maturité déclaré
- Les éventuelles incohérences ou sections manquantes par rapport à `@references/sections.md`

### Étape 2 — Détection de la portée

| Portée | Déclencheurs | Comportement |
|---|---|---|
| **Globale** | "améliore ce README", "challenge cette version", "/readme" (README existant), "ce README est trop long" | Passer en revue l'ensemble du document ; appliquer corrections de ton, structure, cohérence |
| **Section ciblée** | "mets à jour la section X", "améliore la section Utilisation", "ajoute la section Prérequis" | Travailler uniquement sur la section concernée ; laisser le reste intact |

### Étape 3 — Diagnostic

Avant de modifier, produire un diagnostic interne (non affiché) :

- Tournures interdites présentes ?
- Sections conditionnelles incluses sans critère rempli ?
- Informations inventées (URLs, versions, plateformes) ?
- Sections obligatoires manquantes ?
- Incohérences internes (ex. plateforme "non supportée" en haut + bloc d'install complet plus bas) ?
- Longueur hors fourchette pour le type de projet ?

### Étape 4 — Application des modifications

**Portée globale** : appliquer dans cet ordre de priorité :
1. Supprimer les tournures interdites (liste dans `@references/tone.md`)
2. Corriger les incohérences internes
3. Retirer les informations inventées (ou les déplacer dans le bloc d'audit)
4. Ajouter les sections obligatoires manquantes (1, 2, 12)
5. Retirer les sections conditionnelles sans critère rempli
6. Ajuster la longueur si hors fourchette
7. Améliorer la phrase d'identité si elle échoue au test de lisibilité d'entrée

**Portée section ciblée** : appliquer les règles de `@references/sections.md` pour la section concernée uniquement. Ne pas toucher aux autres sections.

**Règle transversale** : ne jamais inventer d'informations pour combler un vide — signaler dans le bloc de diff que l'information est manquante.

### Étape 5 — Auto-vérification

Exécuter la checklist en 8 points de `@references/tone.md` dans l'ordre sur le document résultant. Corriger toute défaillance avant de rendre.

### Étape 6 — Output

Imprimer le README mis à jour directement — sans wrapper ` ```markdown ``` `.

Ajouter **toujours** après le contenu un bloc de diff concis :

```
---

## Modifications appliquées

- [description courte du changement 1]
- [description courte du changement 2]
- …

**Informations manquantes** (non inventées — à fournir pour compléter)
- [information manquante 1, section concernée]
```

Omettre la section "Informations manquantes" si rien ne manque.

## Test

Invoquer sur un README contenant "robuste", une URL inventée, et une section Configuration vide. Vérifier :
- "robuste" remplacé par une formulation factuelle
- URL signalée dans "Informations manquantes" (pas inventée, pas supprimée silencieusement)
- Section Configuration supprimée (critère d'inclusion non rempli)
- Bloc "Modifications appliquées" liste les 3 changements
