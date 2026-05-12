# Guideline — rédiger un README

## Ce que c'est

Un README est un document d'accueil pour des **humains** qui découvrent le projet. Son rôle est de répondre aux questions dans l'ordre où elles se posent naturellement.

## Structure canonique

### 1. Titre + accroche (1-3 lignes)
Ce que le projet fait, en une phrase. Pas de jargon, pas d'acronymes non expliqués.

### 2. Pourquoi / À quoi ça sert
Le problème résolu. Ce que ça apporte par rapport à l'existant. Public cible si non évident.

### 3. Démo ou capture (si applicable)
Une image ou un GIF vaut mieux qu'un paragraphe d'explication.

### 4. Prérequis
Ce qu'il faut avoir installé avant de commencer. Versions minimales si importantes.

### 5. Installation / Démarrage rapide
Commandes copiables, dans l'ordre, qui mènent à un état fonctionnel. Pas de prose entre les étapes.

### 6. Utilisation
Cas d'usage principaux. Exemples concrets avec entrée/sortie si possible.

### 7. Configuration
Variables d'environnement, fichiers de config, options importantes.

### 8. Déploiement
Instructions de mise en production. Différences avec le mode développement.

### 9. Contribuer (si open source)
Comment soumettre des issues ou des PR. Conventions de code si non triviales.

### 10. Licence
Une ligne suffit pour une licence standard.

## Principes de rédaction

- Écrire pour quelqu'un qui arrive sans contexte
- Chaque section répond à une question implicite — si la question ne se pose pas, la section peut être omise
- Les commandes doivent être copiables telles quelles (pas de `<your-value>` sans explication)
- Pas de marketing — décrire ce que ça fait, pas à quel point c'est génial
- Un README trop long n'est pas lu — renvoyer vers une doc externe pour les détails avancés

## Ce que le README ne doit PAS contenir

- Des règles de travail pour Claude → CLAUDE.md
- De l'architecture interne détaillée → `aidd_docs/` ou `/docs`
- L'historique des changements → CHANGELOG ou git log

## Test de lisibilité

Lire les 5 premières lignes à froid. Si la question "à quoi ça sert ?" n'est pas répondue, retravailler l'intro.
