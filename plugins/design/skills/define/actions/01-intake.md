# 01 - intake

Détecter la nature de la source de design et router vers le bon chemin : extraction (maquettes) ou construction (brief).

## Inputs

- `source` (required) — ce que l'utilisateur fournit. Peut être :
  - un visuel : chemin d'image / screenshot, URL live, export Figma (JSON/CSS/images), CSS ou feuille de style existante
  - un besoin écrit : brief client, positionnement produit, user story — sans visuel à copier
- La grille de détection : `references/intake-questions.md`.

## Process

1. **Classer la source** :
   - Présence d'un artefact visuel exploitable (image, URL, Figma, CSS) → chemin **extraction** (`02-extract`).
   - Seulement du texte décrivant un besoin, sans visuel → chemin **construction** (`03-construct`).
2. **Lever l'ambiguïté** quand les deux coexistent :
   - Un brief qui *mentionne* un visuel mais ne le fournit pas → demander le visuel ; s'il n'arrive pas, basculer en construction et noter l'hypothèse.
   - Un visuel accompagné d'un brief → l'extraction fait foi pour les valeurs ; le brief informe l'intention (à reporter en Foundations / Open questions). Router vers `02-extract`.
3. **Proposer le profil optionnel** : demander une fois si le projet veut injecter le profil mobile-first / a11y / no-emoji (`references/profile-mobile-first.md`). Ne l'imposer pas ; consigner la réponse pour `04-write-material`.
4. **Passer la main** à l'action choisie avec la source identifiée.

## Outputs

Une décision de routage explicite (`extract` ou `construct`), la source qualifiée, et le choix d'injection du profil optionnel.

## Test

Le routage est explicite et justifié ; un cas mixte (visuel + brief) est tranché sans ambiguïté ; le profil optionnel est proposé une seule fois, jamais imposé.
