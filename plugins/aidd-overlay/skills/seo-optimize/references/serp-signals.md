# SERP signals — grounding autoritatif (anti-folklore)

> Pendant SEO de `w3c-perf-specs.md`. Avant de recommander un fix, vérifier ici que la cible est un **signal confirmé** (source officielle), pas une croyance corrélationnelle. Le SEO est saturé de mythes — cette référence est le garde-fou.

## Comment utiliser

1. Pour chaque finding de l'audit, retrouver le signal ci-dessous.
2. Si **confirmé** → recommander, en citant la source.
3. Si **corrélation/contexte** → recommander avec réserve, sans promettre de gain de position.
4. Si **folklore** → ne PAS recommander ; si le code l'applique déjà, signaler comme effort inutile (pas un bug).

---

## §1 — Indexabilité & crawl

| Signal | Statut | Source | Effet réel |
|---|---|---|---|
| `robots.txt` `Disallow` | Confirmé | Google Search Central — Robots | Contrôle le crawl, **pas** la désindexation (une URL bloquée peut rester indexée sans snippet) |
| `<meta robots noindex>` | Confirmé | Search Central — Block indexing | Désindexe ; ne PAS la combiner avec `Disallow` (le crawler doit pouvoir lire le noindex) |
| `rel=canonical` | Confirmé (hint) | Search Central — Canonicalization | Indice de consolidation, pas une directive absolue ; Google peut choisir une autre canonique |
| `sitemap.xml` | Confirmé | Search Central — Sitemaps | Aide la découverte ; n'améliore pas le rang en soi |
| Crawl budget | Confirmé (gros sites) | Search Central — Crawl budget | Pertinent au-delà de ~10k URL ; négligeable sur un site vitrine |

## §2 — On-page

| Signal | Statut | Source | Effet réel |
|---|---|---|---|
| `<title>` pertinent | Confirmé | Search Central — Title links | Facteur + élément cliquable du SERP ; Google peut le réécrire |
| Meta description | Corrélation | Search Central — Snippets | **Pas** un facteur de rang ; influence le CTR (snippet) |
| Longueur title ~50-60 / meta ~150-160 | Contexte | Pratique (largeur SERP) | Troncature au-delà ; pas de pénalité, juste lisibilité |
| H1 unique, hiérarchie Hn | Confirmé (léger) | Search Central — Headings | Aide la compréhension ; un seul H1 recommandé, pas obligatoire |
| Balise `meta keywords` | **Folklore** | Google (déclaré ignoré depuis 2009) | Aucun effet — ne pas en mettre |
| Densité de mots-clés | **Folklore** | — | Aucun seuil ; le bourrage nuit (spam) |
| Exact-match domain | **Folklore** (déprécié) | EMD update 2012 | Plus d'avantage ; peut nuire si thin content |

## §3 — Contenu & maillage

| Signal | Statut | Source | Effet réel |
|---|---|---|---|
| Maillage interne / ancres descriptives | Confirmé | Search Central — Internal links | Distribue l'autorité + le contexte ; ancres « cliquez ici » = gaspillage |
| Topical authority (clusters) | Corrélation forte | Pratique + Quality Rater Guidelines | Couverture exhaustive d'un sujet corrèle au rang |
| Contenu unique vs dupliqué | Confirmé | Search Central — Duplicate content | Pas de « pénalité duplicate » mythique, mais consolidation/choix d'une seule URL |
| Fraîcheur (`dateModified`) | Contexte | Query Deserves Freshness | Compte pour les requêtes sensibles au temps, pas universellement |

## §4 — Données structurées

| Signal | Statut | Source | Effet réel |
|---|---|---|---|
| JSON-LD valide | Confirmé | Schema.org + Rich Results Test | Active les rich results ; **format recommandé par Google** (vs microdata) |
| `LocalBusiness` | Confirmé | Search Central — Local Business markup | Renforce l'entité locale + éligibilité knowledge panel |
| `FAQPage` | Confirmé (restreint) | Search Central — FAQ (mise à jour 2023) | Rich result limité aux sites d'autorité gouvernement/santé ; le balisage reste utile pour la compréhension + GEO |
| `BreadcrumbList` | Confirmé | Search Central — Breadcrumb | Affiche le fil d'Ariane dans le SERP |
| `Product`/`Offer`/`AggregateRating` | Confirmé | Search Central — Product markup | Rich result prix/dispo/avis ; policy stricte sur les avis auto-déclarés |
| Le schema améliore le **rang** | **Folklore** | Google (déclaré non-facteur de rang) | Améliore l'**apparence**/CTR, pas le rang directement |

## §5 — GEO / IA

| Signal | Statut | Source | Effet réel |
|---|---|---|---|
| Réponse directe extractible | Corrélation (émergent) | Études GEO + observation moteurs | Format le plus cité par les LLM ; pas de spec officielle |
| `llm.txt` | Non standardisé | Proposition communautaire | Adopté par certains moteurs ; signal faible, pas de garantie |
| Cohérence d'entité / `sameAs` | Confirmé (entités) | Schema.org `sameAs` + Knowledge Graph | Consolide l'entité dans le Knowledge Graph → réutilisé par les IA |
| AI Overviews / citations | Observation | Pas de doc officielle de ranking | Traiter comme bruité ; mesurer par grille de test, ne rien promettre |

## §6 — Local SEO / GBP

| Signal | Statut | Source | Effet réel |
|---|---|---|---|
| Catégorie principale GBP | Confirmé | GBP Help — Categories | Facteur local majeur ; doit refléter l'activité réelle |
| Avis (volume + note + fraîcheur) | Confirmé | GBP Help + Local ranking factors | Pilier du classement local + E-E-A-T |
| Cohérence NAP | Confirmé | Local ranking (proximity, prominence) | Citations cohérentes = prominence |
| Photos / posts / Q&R | Corrélation | GBP Help | Engagement + complétude ; corrèle à la visibilité |
| Proximité du chercheur | Confirmé (non actionnable) | Local Pack factors | Pondéré par Google selon la position de l'utilisateur |

## §8 — CWV comme signal de ranking

| Signal | Statut | Source | Effet réel |
|---|---|---|---|
| Core Web Vitals (LCP/CLS/INP) | Confirmé (faible, départage) | Search Central — Page Experience | Signal réel mais **secondaire** : départage à pertinence égale, ne sauve pas un contenu faible |
| HTTPS | Confirmé (léger) | Search Central | Facteur mineur |
| Mobile-friendly | Confirmé | Mobile-first indexing | Prérequis (indexation mobile-first) |
| « Score Lighthouse = rang » | **Folklore** | — | Le score lab ≠ les CrUX field data utilisées par Google ; ne pas confondre (voir `web-optimize` §11) |

## §9 — Off-page / E-E-A-T

| Signal | Statut | Source | Effet réel |
|---|---|---|---|
| Backlinks de qualité | Confirmé | Search Central — Links | Facteur majeur ; qualité/pertinence > volume |
| E-E-A-T | Corrélation (cadre Rater) | Search Quality Rater Guidelines | Pas un score direct ; cadre d'évaluation, critique en YMYL |
| Backlinks achetés / PBN | **Anti-pattern** | Spam policies — Link spam | Risque de pénalité manuelle/algorithmique |
| `nofollow`/`sponsored`/`ugc` | Confirmé | Search Central — Qualify outbound | Attribut requis sur liens payants/UGC |

---

## Règle de synthèse

Avant d'écrire une reco dans le rapport :

- **Confirmé** → « Fix X (source : <doc>) — effet : <effet réel> ».
- **Corrélation** → « Fix X corrèle à <effet>, sans garantie de position ; valeur : compréhension/CTR/GEO ».
- **Folklore** → ne pas recommander ; si déjà présent, `[fp]` dans les learnings (effort inutile, pas un bug).

Ne jamais promettre une position. Promettre un **delta déterministe** (schema valide, NAP cohérent, meta présente) + un suivi de la position bruitée.
