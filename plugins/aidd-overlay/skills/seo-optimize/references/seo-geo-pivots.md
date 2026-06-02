# SEO/GEO pivots — par type de site

> Référence pour appliquer une checklist SEO/GEO adaptée au type de site. À lire pour charger la (ou les) section(s) correspondant au type détecté. Pour un site hybride (local-business + blog), concaténer les sections.

## Schéma général

Une checklist SEO/GEO tient en 12 sections, identiques quel que soit le type de site :

0. Pre-flight (baseline falsifiable : positions GSC + score GBP + grille citation IA + counts on-page)
1. Indexabilité & crawl (robots, sitemap, noindex pages techniques, canonical, budget crawl)
2. On-page (title / meta description / H1 — présence, longueur, intention)
3. Profondeur de contenu & maillage interne (landing par entité/geo, pages orphelines)
4. Données structurées (JSON-LD : LocalBusiness, FAQPage, BreadcrumbList, Product…)
5. GEO / extractabilité IA (blocs réponse directe, llm.txt, cohérence d'entités) — voir `geo-extractability.md`
6. Local SEO / GBP (catégorie, description, services, Q&R, photos, posts, cohérence NAP)
7. Positionnement concurrentiel (concurrents nommés, différenciants, gap SERP)
8. CWV comme signal de ranking — *consomme la sortie de `web-optimize`, ne recalcule jamais*
9. Off-page / E-E-A-T (avis, citations, backlinks, autorité)
10. Mesure & tracking (GSC J0→J+90, grille test IA, Ahrefs rank-tracker / Brand Radar)
11. Vérification & non-régression

Les pivots ci-dessous remplacent ou précisent les items section-par-section selon le type cible.

---

## Signal déterministe vs bruité (transverse — fonde §0 et §11)

Discipline héritée de `web-optimize` (bytes/chunks vs PSI), transposée au SEO :

- **Signal primaire déterministe** (load-bearing) : title présent + longueur ∈ [50,60], meta présente + longueur ∈ [140,160], schema valide (Rich Results Test pass), canonical présent, couverture `alt` %, noindex sur pages techniques, NAP cohérent, score complétude GBP. Binaire ou comptable → falsifiable immédiatement.
- **Signal secondaire bruité** : position GSC, impressions, rang de citation IA. Dépend de la volatilité SERP et de la concurrence → jamais attribuable à un fix unique sans fenêtre temporelle.
- **Règle de déclaration de gain** : ne déclarer un gain de ranking que si la **position médiane post-fix bat la fourchette de baseline** (≥7 j GSC), sinon « fix livré, variance domine, le delta déterministe est le signal fiable ».

---

## local-business (cabinet, commerce, service de proximité)

Type à NAP + présence Google Business Profile. Pivots clés :

- §1 : noindex sur `/auth/*`, `/login`, `/panier`, pages de confirmation ; vérifier qu'elles ne sont **pas** dans `sitemap.xml` ; `Disallow` cohérent dans `robots.txt`
- §2 : title pattern `<intention> à <ville> | <marque>` (la ville EST le mot-clé local) ; H1 unique par page, jamais réutilisé entre `/ville-a` et `/ville-b`
- §3 : **une landing par couple (service × ville)** — c'est le levier #1 du local. Page géo-spécifique > page générique multi-villes. Mailler chaque landing depuis la home + la page « nos lieux »
- §4 : **un `LocalBusiness` par lieu physique**, pas N `Place` sous un seul `Organization`. Un `Organization` global + des `Place` enfants ne déclenche ni le rich result local ni l'éligibilité Knowledge Panel par établissement — chaque adresse doit être son propre `LocalBusiness` (ou sous-type : `MedicalBusiness`, `HealthAndBeautyBusiness`) avec `address`, `geo`, `openingHoursSpecification`, `telephone`, `priceRange`, `sameAs` (URL GBP du lieu). Émettre ce bloc sur la landing géo correspondante. Compléter avec `FAQPage` sur chaque landing + `BreadcrumbList`. Un `Organization` parent reste utile pour la marque, mais ne remplace pas les `LocalBusiness` par lieu
- §5 : bloc réponse directe en tête de chaque landing (« Où louer… à <ville> ? » → réponse citable 40-60 mots) ; cohérence d'entité entre le site, la fiche GBP et les annuaires (même NAP exact) — c'est ce qui fait que l'IA associe la marque au lieu. Voir `geo-extractability.md`
- §6 : **section critique pour ce type** — catégorie principale = activité réelle (un loueur d'espaces n'est pas « cabinet médical ») ; description ≤ 750 car. ; services en texte libre ; Q&R proactives ; ≥ 10 photos nommées descriptivement ; posts hebdomadaires 8 semaines. Cohérence NAP fiche ↔ site ↔ annuaires
- §7 : identifier les concurrents cités par les IA sur les requêtes cibles (pas seulement le SERP Google) ; exploiter un différenciant géographique ou d'usage concret dans le copy
- §9 : **avis Google = signal E-E-A-T #1 en local** ; citations NAP cohérentes (annuaires locaux, pages jaunes, secteur)
- §10 : grille de test IA par requête géo (ChatGPT / Perplexity / AI Overviews) re-testée mensuellement ; rank-tracker sur les couples service×ville

Anti-patterns local : page unique « nos villes » listant 10 communes (dilue) ; catégorie GBP générique « centre d'affaires » ; NAP divergent entre site et fiche ; lieux modélisés en `Place` sous un `Organization` unique au lieu d'un `LocalBusiness` par établissement (perd le rich result local).

---

## saas (produit logiciel, abonnement)

- §1 : canonical strict (paramètres UTM, variantes de tri ne doivent pas générer de doublons indexés) ; pagination `rel=next/prev` obsolète → canonical self-référent
- §2 : title orienté problème/solution, pas feature ; intention informationnelle (top funnel) vs transactionnelle (pricing) séparée par template
- §3 : architecture en silo — pages `/solutions/<usecase>` + `/features/<feature>` + comparatifs `/<produit>-vs-<concurrent>` ; maillage hub-and-spoke
- §4 : `SoftwareApplication` / `Product` + `Offer` (pricing) + `FAQPage` ; `Organization` + `sameAs`
- §5 : pages comparatives et « alternative to X » sont les plus citées par les IA en SaaS — structurer en tableau + réponse directe ; llm.txt pointant la doc et le pricing
- §6 : N/A (pas de présence locale) sauf si HQ physique revendiqué
- §7 : SERP des requêtes `<concurrent> alternative`, `best <category> tool` — gap de contenu comparatif
- §9 : E-E-A-T via études de cas, logos clients, G2/Capterra (avis), backlinks de la presse tech
- §10 : tracker les requêtes `<category> software`, `<usecase> tool`, citations IA sur « quel outil pour X »

---

## blog / content (média, magazine, content marketing)

- §1 : crawl budget réel — désindexer pages tags/archives à faible valeur (`noindex,follow`) ; sitemap segmenté par type
- §2 : title click-through (chiffre, bénéfice, fraîcheur) ; H1 ≠ title autorisé ici si intention couverte
- §3 : **topical authority** — clusters thématiques (pilier + articles satellites maillés) ; pas d'articles orphelins ; dates de mise à jour visibles
- §4 : `Article` / `NewsArticle` + `author` (`Person` avec `sameAs`) + `datePublished`/`dateModified` + `BreadcrumbList` ; `FAQPage` sur les how-to
- §5 : structure extractible — un H2 = une question, réponse directe en tête de section ; `Speakable` si pertinent ; llm.txt listant les piliers
- §6 : N/A
- §7 : gap de contenu vs SERP — requêtes « people also ask », sujets non couverts par le cluster
- §9 : **E-E-A-T auteur critique** (YMYL surtout) — bio auteur, credentials, `sameAs` profils ; backlinks éditoriaux
- §10 : suivi par cluster (impressions agrégées du pilier + satellites), citations IA sur les questions du cluster

---

## e-commerce (boutique, catalogue)

- §1 : maîtrise du facetting — filtres/tri ne doivent pas exploser l'index (canonical vers la catégorie parente, `noindex` sur combinaisons profondes) ; sitemap produits + catégories
- §2 : title produit `<produit> <attribut clé> | <marque>` ; meta avec prix/dispo si stable
- §3 : profondeur catégorie ≤ 3 clics depuis la home ; descriptions catégorie uniques (pas juste une grille produits)
- §4 : `Product` + `Offer` (`price`, `availability`, `priceCurrency`) + `AggregateRating` + `BreadcrumbList` ; `FAQPage` produit
- §5 : réponse directe sur les pages catégorie (« Quel <produit> choisir pour X ? ») ; les IA citent les guides d'achat — les structurer
- §6 : si retrait magasin → `LocalBusiness` par point de vente (hybride local-business)
- §7 : SERP shopping + comparateurs ; gap sur guides d'achat / comparatifs
- §9 : avis produits (E-E-A-T transactionnel), signaux de confiance (retours, paiement), backlinks
- §10 : suivi requêtes produit + catégorie + « meilleur <produit> » ; citations IA sur recommandations d'achat

---

## docs / portfolio (documentation, site vitrine)

- §1 : versionnage doc (canonical vers la version courante, `noindex` sur versions archivées) ; sitemap par section
- §2 : title = chemin de navigation (`<page> — <section> | <produit>`)
- §3 : table des matières + maillage latéral entre pages liées ; recherche interne
- §4 : `TechArticle` / `HowTo` + `BreadcrumbList` ; `Organization` pour le vitrine
- §5 : **llm.txt = levier #1 ici** (la doc est faite pour être lue par les IA) ; chunks autonomes (chaque section compréhensible isolément) ; exemples de code complets
- §6 : N/A (sauf agence avec adresse → hybride local-business)
- §7 : N/A ou léger
- §9 : autorité via GitHub stars, mentions, backlinks dev
- §10 : citations IA sur « comment faire X avec <produit> »

---

## Contrat de pivot (qualité minimale d'une section)

Toute section de ce fichier (ou tout `seo-pivots-<sitetype>.md` externe) doit répondre, pour chaque §N couvert :

- **\*** §1 : comment ce type exclut-il les pages techniques de l'index (mécanisme concret) ?
- **\*** §2 : quel **pattern de title** et règle de longueur pour ce type ?
- **\*** §4 : quels **types Schema.org** sont obligatoires vs recommandés pour ce type ?
- **\*** §5 : quel est le **levier GEO #1** pour ce type (ce que les IA citent le plus) ?
- **\*** §6 : la section GBP est-elle **applicable** (`N/A` explicite sinon) ?
- **\*** §11 : quel **delta déterministe** atteste un succès sur ce type ?

Une section sans réponse à une question `*` est incomplète → l'audit produira des recommandations génériques non falsifiables.

---

## Fallback : type de site non listé

Si le type ne matche aucune section ci-dessus :

1. Demander 3 infos : (a) objectif business du site, (b) y a-t-il une présence physique (→ GBP) ?, (c) le contenu vise-t-il l'organique, le génératif, ou les deux ?
2. Construire la checklist depuis les **12 sections génériques** (haut de ce document)
3. Lister explicitement les pivots non couverts comme « à valider » plutôt que d'inventer
4. **Si `aidd_docs/internal/decisions/` existe :** proposer un DEC. **Sinon :** inline les conventions retenues dans le header du nouveau pivot

---

## Quick verification commands

```bash
# Indexabilité
cat public/robots.txt public/sitemap.xml 2>/dev/null
grep -rn "noindex" --include="*.vue" --include="*.ts" --include="*.html"

# On-page
grep -rn "useSeoMeta\|useHead\|generateMetadata" --include="*.vue" --include="*.ts" --include="*.tsx"
grep -rn "rel=.canonical" --include="*.vue" --include="*.html"

# Schema & GEO
grep -rn "application/ld+json" --include="*.vue" --include="*.html" --include="*.tsx"
ls public/llm.txt public/llms.txt 2>/dev/null

# Images / alt
grep -rn "<img" --include="*.vue" --include="*.html" | grep -v "alt="
```
