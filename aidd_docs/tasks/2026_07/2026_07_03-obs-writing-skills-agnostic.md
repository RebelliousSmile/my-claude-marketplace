# Chantier — agnosticisation de `brief` · `research` · `extract-pdf`

> **Statut** : à traiter (design validé, implémentation non commencée)
> **Date** : 2026-07-03
> **Plugins touchés** : `obs` (principal), `ttrpg` (profil), `writing` (repointage mineur)

## Contexte & diagnostic

Les skills `obs:brief`, `obs:research` et `obs:extract-pdf` ont été conçus dans un cadre JDR (jeu de rôle) et en gardent un couplage. Le plugin `obs` a déjà externalisé l'outillage TTRPG (pc, campaign, solo-mc, lore-extract, rules-keeper → plugin `ttrpg`), mais ces 3 skills sont restés dans `obs` avec une mécanique interne JDR.

**Nature exacte du couplage** — il est *uniquement* côté entrées, jamais dans la mécanique ni dans les contrats aval :
1. **Vocabulaire des buckets** hardcodé : `_univers` (lore de setting), `_systeme` (règles), `_subsystems`, split de provenance `canon/` + `mj/`.
2. **Feeders nommés** : `ttrpg:lore-extract`, `ttrpg:rules-keeper`.
3. **Résolution du domaine `R`** via marqueurs JDR (`_campagnes/`/`_univers/`/`_pjs/`).

Le tout est encodé dans `plugins/obs/references/jdr-layout.md`, **dupliqué** dans `plugins/ttrpg/references/jdr-layout.md` (le fichier lui-même signale la duplication à maintenir à la main, ligne 3), et pointé aussi par `writing:forge`.

**Modèle structurel réel (générique, établi avec l'utilisateur)** :
- `R` = **sous-catégorie** de l'arbo : `(Perso|Pro)/<Category>/<Subcategory>/`. Il y a *plein* de `R` par catégorie (ex. `Perso/RPG/engrenages/`, `Perso/RPG/archipels/`, …). `R` se résout par l'ancre de `obs:tree` (walk-up vers `Perso`/`Pro`), pas par un marqueur JDR.
- Dans un `R`, les buckets de travail sont `R/_<bucket>` (préfixe `_` = invariant I1 de `tree`). `_univers`/`_campagnes`/`_systeme` ne sont **que des buckets nommés JDR** — structurellement identiques à n'importe quel `R/_<bucket>`.
- `R/bank.yml` = manifeste générique des ressources durables de `R`, maintenu par `obs:tree`.

**Conclusion** : le couplage est du *vocabulaire*, pas de la structure. On réutilise le modèle existant (R = sous-catégorie + `R/_<bucket>` + `bank.yml`) et on arrête de hardcoder les noms JDR dans les 3 skills. Le jeu de buckets JDR devient un **profil possédé par `ttrpg`**.

### Preuves disque (recon du 2026-07-03)
- Les chemins `C:/Users/fxgui/Public/Notes/…` hardcodés dans `project`/`mail` **n'existent pas** ; le vrai vault est sous `C:/Users/fxgui/Documents/` (ancres `Perso`/`Pro` peuplées, `_tree/cache.json` présents).
- Vrais domaines `R` JDR sous `Documents/Perso/RPG/` (dont `engrenages`, `archipels`, `apocalypse-world`, …).
- `bank.yml` réels **uniquement** sous `Documents/Ecriture/` (projets d'écriture : `spire/nadir`, `archives/ilsetaientdix`, `shattered-city/…`) — **pas** aux racines des sous-catégories RPG. Divergence entre le modèle documenté (`R/bank.yml`) et la réalité.
- **Aucune trace de `brief`** : zéro `_brief/`, zéro `summary.md` hors marketplace → le pipeline `writing` n'a jamais tourné de bout en bout. Les projets `Ecriture/` sont *antérieurs* au contrat `brief-model` (working dirs `.`-préfixés `.output-styles`/`.toc`/`.wip`, `chapitres/`, `overview.md` — pas `_brief/_output` + `chapters/`).

### Verdict sur `brief` (après lecture de `writing:references/brief-model.md`)
Le contrat `_brief/` est **vivant et déjà agnostique** :
- `brief-model.md` est la source de vérité partagée de TOUS les skills `writing` (toc, write, review, persona, tone-finder).
- `summary.md` déclare `type:` ∈ `{technical-doc, cheat-sheet, rpg-scenario, novel, guide}` — multi-genre, le JDR n'est qu'un type sur cinq. `writing:write` a deux modes (novel / roleplaying) choisis depuis `type`.
- Contrat « totalement découplé » : aucune notion de `bank.yml`/vault/chemin global ; `writing` ne lit jamais hors de `<projet>/` ; **il nomme `obs:brief` comme producteur** de `_brief/`.

→ `brief` n'est ni un vestige ni intrinsèquement JDR. Son couplage est de même nature que `research`/`extract-pdf` (vocabulaire de buckets + feeders `ttrpg:*` côté entrées). Les 3 forment **un seul chantier cohérent**.

---

## 1. Modèle générique cible

Nouveau fichier **`plugins/obs/references/domain-layout.md`** :

| Concept | Générique | Instance JDR (profil) |
|---|---|---|
| **Domaine `R`** | sous-catégorie `(Perso\|Pro)/<Cat>/<Subcat>/`, résolue par l'ancre de `obs:tree` | `Perso/RPG/<jeu>/` |
| **Localisation de `R`** | niveau sous-catégorie (tree) — pas de marqueur requis | raccourci : walk-up vers `_univers`/`_campagnes`/`_pjs` |
| **Buckets de ressources** | `R/_<bucket>/` (nom libre, catalogués par `bank.yml`) | `_univers`, `_systeme`, `_subsystems` |
| **Manifeste** | `R/bank.yml` (générique, maintenu par `tree`) | idem |
| **Matière brute ingérée** | `<bucket\|projet>/sources/<source>/` | `_univers/<u>/sources/`, `_systeme/sources/` |
| **Connaissance durable synthétisée** | `<bucket>/reference/` | split provenance `canon/` + `mj/` |
| **Unité de travail (projet)** | `R/<AAAA>/<MM>/<projet>/` (avec `_brief/`, `_output/`, `research/`, `sources/`) | idem (+ `_ecrits/`) |
| **Portées de recherche** | `shared` (niveau R, durable) · `project` (une unité) | + `campagne` (3ᵉ portée) |

**Principe directeur** : le cœur ne connaît que `R` (sous-catégorie) + `_<bucket>` + `bank.yml` + `sources/`/`reference/`. Tout ce qui est nommé JDR (`_univers`/`_systeme`, `canon`/`mj`, portée `campagne`, feeders `ttrpg:*`) est un **profil**.

## 2. Profil JDR

- `jdr-layout.md` existe déjà en double (obs + ttrpg). → **Supprimer la copie `obs`** ; le profil devient **possédé par `ttrpg`** (fin de la duplication).
- Le profil définit : noms de buckets JDR, split `canon/mj`, portée `campagne`, résolution par marqueurs, feeders `ttrpg:lore-extract`/`rules-keeper`.
- `plugins/obs/references/jdr-layout-checks.py` → migre vers `ttrpg`.
- `plugins/obs/references/bank-yml.md` **reste** dans `obs` (générique).
- Repointer `writing:forge` (qui référence `jdr-layout` en cross-plugin) vers la copie `ttrpg` ou vers le générique selon son besoin réel (à vérifier au moment de l'édition).

## 3. Changements par skill

### `extract-pdf` (le plus simple — mécanique déjà générique)
- Sortie : `<target>/sources/<source>/` générique au lieu de `<univers-root>/sources/` + `<systeme-root>/sources/`.
- Garde l'invariant fort : n'écrit jamais dans `reference/` (générique) / `canon/`·`mj/` (profil).
- Le split lore-vs-règles et le pipeline `lore-extract`/`rules-keeper` → renvoyés au profil JDR.
- `references/jdr-layout.md` → `references/domain-layout.md`.

### `research`
- Portées : `shared` (R-level) vs `project` — au lieu de `univers`/`campagne`/`projet`. `campagne` réintroduite par le profil JDR.
- Cibles : rapport → `<scope-root>/research/<slug>-<date>.md` (déjà générique) ; trouvailles vérifiées → `<scope-root>/reference/` (générique) / `canon/` (profil).
- `extract-terminology` : `reference/terminologie.md` générique ; complément `ttrpg:lore-extract` = profil.

### `brief`
- Remplacer « consolider `_univers`/`_systeme`/`_subsystems` » par « consolider ce que `bank.yml` catalogue » (agnostique par construction).
- Feeders : `writing:forge` (concept) + `research` restent génériques ; `ttrpg:lore-extract`/`rules-keeper` → exemples du profil.
- **Le contrat aval ne bouge pas** : `_brief/summary.md` + `personas/` + `output-styles/`, `type:` multi-genre — c'est déjà le contrat `writing` vivant.

## 4. Impact sur les suites behave

- **3 suites à re-scaffolder** (`brief`, `research`, `extract-pdf`) : fixtures agnostiques (un `R` non-JDR : doc technique / roman) **+ une variante profil-JDR** pour conserver la couverture du cas `engrenages`. Les correctifs de discriminance déjà appliqués (2026-07-02) sont réutilisables tels quels — ils testent des comportements, pas des noms de buckets.
- **4 suites intactes** (`project`, `mail`, `filler`, `tree`) : aucun impact — leur run peut avancer indépendamment.

## 5. Séquencement

0. **(parallèle, sans dépendance)** Run behave des 4 suites saines (`project`, `mail`, `filler`, `tree`).
1. Écrire `domain-layout.md` (obs) ; migrer profil + checker vers `ttrpg` ; supprimer la copie `obs` ; repointer `writing:forge`.
2. Éditer les 3 skills (référence générique + fallback profil).
3. Re-scaffolder les 3 suites behave (fixture agnostique + variante JDR).
4. Bumps de version : `obs` (mineur/majeur), `ttrpg` (le profil bouge).

## 6. Choix à trancher (avant Phase 1)

1. **`canon/mj` dans le générique ?** — *Recommandation : collapser* en un seul `reference/` au cœur, garder le split `canon/mj` comme raffinement du profil JDR (un roman n'a pas de « canon vs maison »). Alternative : garder `canon/mj` partout.
2. **Détection du profil** — par présence de buckets (`_univers`/`_systeme`) ou par clé explicite `profile: jdr` dans `bank.yml` ? *Recommandation : la clé, avec fallback sur la présence* (robuste + auto-documentée + zéro-config en secours).
3. **Réconciliation du layout legacy `Ecriture/`** (`.`-préfixés, `chapitres/` vs `_brief/_output`, `chapters/`) — dans ce chantier ou séparé ? *Recommandation : séparé* (ressort de `tree`/`writing`, pas de l'agnosticisation).

## Notes annexes (défauts repérés au passage, hors périmètre)

- `obs:project` : `créer un nouveau PJ` a 3 lectures divergentes (Router→`create` / `scenarios.json`→`null` / defer). À réconcilier côté skill.
- `obs:brief` : contradiction seuil personas `check` ≥3 (SKILL) vs ≥1/optionnel (`02-check`) ; front-matter YAML (SKILL) vs markdown gras (skeleton `01-assemble`).
- `obs:extract-pdf` : `actions/05-run.md` orphelin (vocabulaire `TODO`/`DONE` + chemin `.docs/` au lieu de `pending`/`done` + `docs/`).
- Chemins morts `C:/Users/fxgui/Public/Notes/…` hardcodés dans `project`/`mail` alors que le vault réel est sous `Documents/`.
