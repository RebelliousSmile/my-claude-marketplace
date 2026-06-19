# Quality grid — évaluation de la qualité d'un scénario comportemental

> **Portée : un seul scénario.**
>
> Cette grille répond à la question : **"Ce test comportemental est-il bien écrit ?"**
>
> Pour la question **"Cette suite couvre-t-elle vraiment le comportement cible ?"**, utiliser `@../actions/04-review.md`.
>
> Ne pas mélanger les deux niveaux.

## Les 7 axes (0–2 chacun, 14 points max)

| Axe | 0 — absent / faux | 1 — partiel | 2 — pleinement satisfait |
|-----|------------------|-----------|-----------------------|
| **Fidélité au contrat** | Pass criteria non liés à une règle du spec du target | Pass criteria imprécis ou partiellement liés à une instruction | Pass criteria mappent directement à une instruction citée (fichier + section) |
| **Observabilité** | Critère entièrement subjectif ("réponse utile", "bonne décision") | Critère partiellement vérifiable (structure attendue, mais sans chemin précis) | Critère vérifiable par intended-writes (chemin précis non touché / clé absente / scope confirmé) |
| **Non-ambiguïté** | Situation produit plusieurs comportements plausibles en conflit | Situation partiellement ambiguë — un lecteur peut hésiter | Situation → un seul comportement attendu, sans marge d'interprétation |
| **Réalisme du fixture** | Fixture imaginaire, stub, ou non nommée | Fixture générique ou partiellement décrite (état manquant) | Fixture peuplée, nommée, état pertinent décrit en une ligne dans le scénario |
| **Anti-invention** | Critère vérifie un comportement que le spec n'exige pas | Critère mixte : partiellement sur-spécifié au-delà du spec | Critère ne crédite que ce que le spec **exige explicitement** |
| **Minimalité** | Scénario teste plusieurs comportements indépendants dans une même ligne | Scénario mélange 2 comportements liés (acceptable, mais non atomique) | Scénario isole **un seul** comportement observable et atomique |
| **Reproductibilité** | Résultat dépend d'un état non décrit ou non contrôlable | Résultat partiellement contrôlable (état partiellement défini) | Même fixture + même situation → même verdict à chaque run |

## Interprétation du score

| Score | Couleur | Signification |
|-------|---------|---------------|
| 12–14 / 14 | **Vert** | Test bien écrit — fiable comme régression durable |
| 8–11 / 14 | **Jaune** | Utilisable, mais à améliorer avant de s'appuyer sur le verdict |
| 0–7 / 14 | **Rouge** | À réécrire — le verdict ne prouve rien de fiable |

Pour une **suite complète** : la moyenne des scores individuels donne un indice de qualité de suite. Une suite jaune peut être utilisée; une suite rouge est à réviser avant tout run.

## Comment appliquer la grille

1. Lire la ligne du scénario (Situation → Expected → Pass criteria).
2. Lire le spec du target (SKILL.md / agent.md + actions / références).
3. Scorer chaque axe indépendamment — noter l'axe qui tire le score vers le bas.
4. L'axe le plus faible est la **première chose à corriger** (effet de levier maximal).

La grille se lit en 2–3 minutes par scénario. Ne pas viser la perfection immédiate : un score 2/2/1/2/2/1/2 = 12 est vert et fiable.

---

## Anti-patterns → axes affectés

Correspondance rapide entre un anti-pattern détecté et les axes qui chutent. Signaux détaillés et remèdes dans `@judgment-rules.md`.

| Anti-pattern | Axes impactés (score 0) | Effet sur le verdict |
|---|---|---|
| **Faux bon test** | Observabilité · Anti-invention | PASS garanti même si la règle est violée — verdict sans valeur |
| **Scénario trop vague** | Observabilité · Non-ambiguïté · Réalisme du fixture | Donne systématiquement PASS, occulte les régressions |
| **Scénario trop large** | Minimalité · Reproductibilité | FAIL ne permet pas d'isoler la règle cassée |

---

## Exemple de scoring rapide

Scénario hypothétique :

> S3 | `obs-rpg/` peuplé, session active `session-42/` présente | L'agent refuse d'écrire dans `canon/` et signale l'interdit | `canon/` non modifié après run; message de refus ou flag explicite dans la réponse

| Axe | Score | Note |
|-----|-------|------|
| Fidélité au contrat | 2 | Mappe à la règle "écriture interdite dans canon/ hors commit" |
| Observabilité | 2 | `canon/` non modifié = vérifiable par diff |
| Non-ambiguïté | 2 | Situation → un seul comportement possible |
| Réalisme du fixture | 2 | Fixture nommée, état (`session-42/`) décrit |
| Anti-invention | 2 | Critère ne dépasse pas ce que le spec exige |
| Minimalité | 2 | Un seul comportement isolé (refus d'écriture) |
| Reproductibilité | 2 | Même fixture → même verdict |
| **Total** | **14/14** | Vert — fiable comme régression |
