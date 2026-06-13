# Règles de ton, de format et procédure d'auto-vérification

---

## Tournures interdites (sans exception)

- "incroyable", "révolutionnaire", "best-in-class", "puissant", "élégant", "moderne", "robuste"
- "battle-tested", "production-ready", "enterprise-grade"
- "facile à utiliser", "intuitif", "simple"
- "malheureusement", "désolé", "encore en chantier"

**Listes ouvertes** :
- "etc.", "et bien plus", "et plus encore" — acceptables **uniquement pour des listes ouvertes par nature** (intégrations communautaires, plugins tiers, exemples non limitatifs)
- Pour les listes de features ou capacités du projet lui-même : lister précisément ou marquer le statut (✓ / ✗)

---

## Tournures à préférer

- État du projet → "utilisable pour X, pas encore pour Y"
- Limitations → "X n'est pas supporté" plutôt que "X n'est pas encore disponible"
- Public cible → "pertinent si tu… probablement pas si tu…"

---

## Performance et chiffres

- Ne **jamais** inventer une mesure de performance ("rapide", "performant" sans chiffre, ou avec chiffre fabriqué)
- Soit une mesure chiffrée fournie par l'utilisateur, reproductible avec son contexte (machine, taille de données), soit retirer la mention

---

## Personne et registre

- Tutoiement en français par convention de l'auteur du dépôt, sauf instruction contraire
- Pas de "nous" royal, sauf si le projet a une équipe explicite
- Ton informé et direct, sans froideur ni familiarité excessive

---

## Format de sortie

- Markdown standard, pas de front-matter, pas de HTML sauf pour images
- Titre principal en `#` (H1), sections en `##`, sous-sections en `###`
- Blocs de code délimités par triple backtick avec langage spécifié (` ```bash `, ` ```rust `, ` ```ts `, etc.)
- Zéro à trois badges maximum en haut, uniquement license et/ou build status
- Pas de redondance avec la sidebar GitHub pour les **topics** et le **compteur de stars** — la phrase d'identité peut reprendre/étoffer la description GitHub (qui n'est pas toujours visible : clones locaux, miroirs, recherche) ; la **section Licence reste obligatoire** malgré la mention dans la sidebar
- **Table des matières** manuelle si au moins un critère est rempli : > 600 mots, > 8 sections principales, ou > 3 sous-sections `###` dans une même section

---

## Longueur indicative

Moduler selon la nature du projet :

| Type de projet | Fourchette |
|---|---|
| Petit outil / CLI / script | 300–600 mots |
| Lib / SDK / package | 400–800 mots |
| Plateforme / service / framework | 600–1 200 mots |

Si la fourchette ne peut pas être tenue en gardant le contenu utile, prioriser dans cet ordre :
1. Titre + phrase d'identité
2. État du projet
3. Démarrage rapide
4. Un cas d'usage minimal
5. Le reste

Un README un peu long vaut mieux qu'un lien mort vers une `docs/` inexistante.

---

## Procédure d'auto-vérification

Exécuter dans l'ordre. Corriger toute défaillance avant de rendre.

1. **Lisibilité d'entrée** : après le titre et la phrase d'identité, un lecteur peut-il déjà répondre à "qu'est-ce que ça fait et pour qui" ? Sinon retravailler la phrase d'identité.

2. **Scan visuel** : sans lire le texte, identifier en 8 secondes le nom, le problème résolu, l'état d'avancement, la commande d'installation. Si l'un manque visuellement, ajuster la hiérarchie.

3. **Test du concurrent** : si un concurrent évident existe et que le README ne le nomme pas, ajouter la phrase de différenciation dans la section Pourquoi.

4. **Test des tournures interdites** : faire une passe pour traquer les mots de la liste ci-dessus. Les remplacer.

5. **Test des sections conditionnelles** : vérifier que les sections 3 (Aperçu), 8 (Configuration), 9 (Déploiement), 11 (À propos) ne sont présentes que si leurs critères d'inclusion sont remplis.

6. **Test des inventions** : vérifier qu'aucune version, mesure, URL, plateforme supportée ou chiffre n'a été inventé. Toute information non fournie par l'utilisateur doit être soit absente, soit listée dans le bloc d'audit final.

7. **Cohérence interne** : vérifier qu'aucune section ne contredit une autre (ex. "Pas encore : support Windows" en haut, et bloc d'install Windows complet plus bas sans avertissement).

8. **Décompte des mots** : vérifier que le total est dans la fourchette adaptée au type de projet. Sinon ajuster ou justifier brièvement dans le bloc d'audit.
