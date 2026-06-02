# GEO — extractabilité par les moteurs génératifs

> Référence pour la section §5 (GEO / extractabilité IA) et la grille de baseline §0/§10. GEO = Generative Engine Optimization : rendre un contenu **récupérable, citable et attribuable** par ChatGPT, Perplexity, Google AI Overviews, Claude.

## Principe

Le SEO classique optimise pour un crawler qui classe des pages. Le GEO optimise pour un moteur qui **récupère des passages** (RAG) et **cite des sources**. Les leviers diffèrent :

- L'unité utile n'est pas la page mais le **chunk autonome** (un passage compréhensible hors contexte).
- La citation dépend de la **clarté factuelle** et de la **cohérence d'entité**, pas du backlink seul.
- La réponse directe en tête de section est extraite telle quelle — c'est le format que les moteurs recopient.

## Bloc réponse directe (direct-answer block)

Le pattern le plus extrait. Sur chaque page/section cible :

- Un **H2 formulé en question** réelle (« Où louer une salle de yoga en Haute-Savoie ? »)
- Immédiatement suivi d'une **réponse de 40-60 mots**, autosuffisante, factuelle, sans renvoi (« comme vu plus haut »)
- Les faits saillants (lieu, prix, horaire, distance) **dans la première phrase**
- Pas de superlatif non étayé — l'IA filtre le marketing ; elle cite le factuel

Règle de véracité : tout chiffre vient du site (source de vérité). Inconnu → `[placeholder]`, jamais inventé.

## FAQPage structurée

- Bloc `FAQPage` JSON-LD **+** rendu HTML visible (les deux ; le schema seul sans HTML est dévalué)
- Chaque `Question` = une vraie requête longue-traîne ; chaque `acceptedAnswer` = réponse directe citable
- 4-8 Q/R par page, pas plus (au-delà, dilution)
- Réponses cohérentes avec le corps de page et la fiche GBP (mêmes chiffres)

## llm.txt / llms.txt

Fichier racine déclarant aux moteurs IA la structure et les sources de vérité du site (analogue `robots.txt` pour les LLM) :

- Emplacement : `/llm.txt` (ou `/llms.txt`)
- Contenu : nom du site, une ligne de description, liens vers les pages piliers / doc / pricing avec une phrase de contexte chacun
- Format Markdown, liens absolus
- Utile surtout pour `docs`, `saas`, `blog` ; secondaire pour `local-business` (où GBP + cohérence NAP priment)
- Non normatif/non garanti côté moteurs — un signal complémentaire, pas un substitut au contenu structuré

## Cohérence d'entité (entity consistency)

Ce qui fait qu'un moteur **associe** la marque à un lieu / un thème :

- **NAP strictement identique** partout : site, GBP, annuaires, mentions presse (un « 63 rue Amédée VIII » vs « 63 r. Amédée 8 » fragmente l'entité)
- `sameAs` dans le JSON-LD `Organization`/`LocalBusiness` pointant GBP, réseaux, profils — relie les occurrences en une entité unique
- Désignations cohérentes : même nom de marque, même catégorie d'activité, mêmes disciplines listées
- Pour un lieu : revendiquer explicitement le statut réel (« maison de santé pluridisciplinaire ») dans le copy ET le schema, pour que l'IA attribue à la marque le même statut qu'au concurrent de référence

## Chunk-level retrievability

- Chaque section doit être **compréhensible isolément** (le RAG extrait un passage, pas la page) : répéter le contexte minimal (lieu, sujet) plutôt que pronominaliser
- Titres descriptifs (un H2 « Tarifs » seul est moins récupérable que « Tarifs de location à Vallières-sur-Fier »)
- Tableaux et listes : préférés pour les comparaisons (extraits proprement) ; éviter l'info clé enfouie dans un paragraphe long
- Exemples de code complets et copiables (`docs`/`saas`) — les fragments partiels ne sont pas cités

## Grille de test de citation IA (baseline §0 / suivi §10)

Méthode reproductible pour mesurer la visibilité générative — le pendant « bruité » du GSC, à caractériser par re-test.

| Requête testée | Moteur | Cité ? | Rang / sur N | Source citée | Re-test |
|---|---|---|---|---|---|
| Où louer un cabinet thérapeute à <ville> ? | ChatGPT | o/n | 6e / 8 | <domaine> | J0, J+30 |
| <service> près de <ville> | Perplexity | o/n | — | — | J0, J+30 |
| (idem) | Google AI Overviews | o/n | — | — | J0, J+30 |

- Tester **chaque requête cible × chaque moteur**, ≥ 2 fois par relevé (la réponse varie d'une exécution à l'autre — caractériser la variance comme on caractérise le bruit PSI)
- Noter le **concurrent cité à la place** : c'est le gap à combler (analyse concurrentielle §7)
- Automatisable via Ahrefs Brand Radar (`brand-radar-ai-responses`, `brand-radar-sov-overview`) si le MCP est connecté ; sinon manuel
- **Ne jamais** déclarer un gain GEO sur un seul relevé — exiger une fenêtre + re-test, comme pour le ranking organique

## Anti-patterns GEO (rejetés)

| Pattern | Pourquoi rejeté |
|---|---|
| Bourrer la FAQ de 30 questions | Dilution ; les moteurs extraient mal, signal de spam |
| Schema `FAQPage` sans HTML visible | Dévalué (Google a restreint le rich result aux pages d'autorité ; risque de non-affichage) |
| Réponse directe noyée dans un paragraphe marketing | Non extractible ; l'IA cite le concurrent plus net |
| NAP divergent site/GBP/annuaires | Fragmente l'entité → l'IA n'attribue pas |
| Chiffres inventés pour « paraître complet » | Risque factuel ; contredit la source de vérité du site |
| llm.txt comme substitut au contenu structuré | Signal faible seul ; ne remplace ni le schema ni la cohérence d'entité |
