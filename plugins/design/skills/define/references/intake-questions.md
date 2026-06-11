# Intake questions

Grille d'aiguillage et de clarification pour `define`. Deux usages : détecter la source (utilisé par `01-intake`), puis — sur le chemin brief — ne demander que ce que le brief laisse réellement ambigu **et** qui change une décision de token (utilisé par `03-construct`).

## A. Détection de source (01-intake)

| Signal | Chemin | Action |
|---|---|---|
| Image, screenshot, URL live, export Figma, CSS/feuille de style fournis | **extraction** | `02-extract` |
| Brief / positionnement / user story, **sans** visuel exploitable | **construction** | `03-construct` |
| Brief qui *mentionne* un visuel non fourni | ambigu | demander le visuel ; sinon construction + hypothèse notée |
| Visuel **et** brief | **extraction** | le visuel fait foi pour les valeurs ; le brief informe l'intention (Foundations / Open questions) |

## B. Drivers qui changent les tokens (chemin brief — demander si inconnu)

| Attribut | Pourquoi ça compte | Défaut raisonnable si non répondu |
|---|---|---|
| **Personnalité de marque** (trustworthy / playful / premium / technical / warm) | Pilote température de palette, pairing de type, radius, énergie de motion | Neutre-professionnel |
| **Audience & contexte** (grand public vs outil pro, casual vs expert, région) | Pilote densité, contraste, plancher de taille de police, ton | Grand public, mobile-heavy |
| **Plateforme & usage primaires** (app mobile-first, site de contenu, dashboard) | Pilote stratégie de mise en page, split enriched/mobile-only, densité | Web responsive mobile-first |
| **Contraintes couleur ou logo** | Ancre la ramp de marque | Dériver un primary distinctif depuis la personnalité |
| **Light / dark / les deux** | Double la couche sémantique si les deux | Light only (dark noté comme futur) |
| **Style d'icônes** (outline / solid / duotone ; préférence de librairie) | Choisit le jeu d'icônes unique — partie du core trio | Lucide, outline |
| **Barre d'accessibilité / conformité** (WCAG AA/AAA, secteur public) | Fixe les minima de contraste et de taille de cible | WCAG AA |

## C. Ne pas demander

- Valeurs hex exactes, noms de police, tailles en pixels — c'est le travail du système de les dériver.
- Tout ce qui est déjà énoncé ou fortement impliqué par le brief.
- Détails d'implémentation/framework, sauf s'ils contraignent les tokens.

## Sortie de la clarification

Un profil d'attributs court (personnalité, audience, plateforme, contraintes couleur/thème, barre a11y) que `03-construct` transforme en tokens. Tout ce qui est défauté est listé pour que l'utilisateur le corrige.
