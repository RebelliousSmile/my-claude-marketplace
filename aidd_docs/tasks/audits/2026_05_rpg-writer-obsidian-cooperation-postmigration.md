---
name: audit
description: Re-audit post-migration — organisation des données, bank.yml, coopération MJ/joueur/writer (rpg-writer + obsidian)
---

# Codebase Audit (post-migration) for plugins/obsidian + plugins/rpg-writer

Re-audit après la migration par-jeu + canon/mj (commit `631e7e0`). Vérifie la fermeture des findings du premier audit (`2026_05_rpg-writer-obsidian-cooperation.md`) et la cohérence de la chaîne de coopération.

- Status: 🟢 Sain — findings du premier audit fermés, chaîne de coopération cohérente
- Confidence: Élevée (relecture des artefacts migrés + balayages de cohérence transverses)
- Scope: `plugins/rpg-writer/skills/**`, `plugins/obsidian/skills/{pc,rpg,solo-mc}`

## Chaîne de coopération — état vérifié

```
PDF officiel → extract-pdf → sources/ (réf. brutes)
                              ├─ lore-extract  → <univers-root>/.docs/canon/   (+ mj/ via --homemade)
                              └─ rules-keeper  → <systeme-root>/canon/ (+ <subsys-root>/canon/, mj/)
MJ (obsidian:rpg)            → <univers-root>/.docs/mj/  + <campagne-root>/ (prep)
Joueur (obsidian:pc)         → <pj-root>/intention.md
Writer (rpg-writer)          → lit canon/ + mj/ + systeme/ via bank.yml → récit final
```

Chaque maillon a été vérifié dans le code migré (citations ci-dessous).

## Findings

### Fermeture des findings du premier audit

- [🟢] **F1 (extract-pdf ne créait pas le canon)** — RÉSOLU. `plugins/rpg-writer/skills/extract-pdf/actions/03-distribute.md:21-23` écrit dans `<univers-root>/sources/` et `<systeme-root>/sources/` ; `vault-layout.md:94` « extract-pdf n'écrit jamais dans canon/ ni mj/ directement ». Ventilation déléguée à lore-extract/rules-keeper.
- [🟢] **F2 (couche d'action non migrée)** — RÉSOLU. Balayage final : 0 occurrence de `<univers>/<projet>`, `docs/templates/personas`, `docs/rules-files/`, `parent du CWD` dans `plugins/rpg-writer/skills`.
- [🟢] **F3 (writer ignorait mj/)** — RÉSOLU. `write/actions/02-write-roleplaying.md:39` « Load ALL universe docs… span both `.docs/canon/` … and `.docs/mj/` » ; idem `forge/actions/01-forge.md:43` et `toc/actions/01-generate-toc.md:54`.
- [🟢] **F4 (schéma bank.yml divergent)** — RÉSOLU. `setup/references/bank-yml.md` documente `.docs/canon/`, personas à tiers, rules-files → `systeme/canon/`. `setup/actions/02-audit.md:64` ajoute un contrôle `[WARN]` si `docs.univers` n'est pas dans `canon/`.
- [🟢] **F5 (3 schémas personas)** — RÉSOLU. Cascade unique projet→univers→`<vault>/_shared/personas/` dans `persona/actions/01-generate.md:7-9`, `review/actions/01-comment.md:38`, `bank-yml.md`.
- [🟢] **F6 (rules-keeper non câblé)** — RÉSOLU côté skills. `rules-keeper/actions/01-restructure.md:5,15` cible `<systeme-root>/canon/` (+ `<subsys-root>/`). Câblage des `bank.yml` réels : voir suggestion ci-dessous.

### Qualité de la migration

- [🟢] **Source unique de vérité** : `setup/references/vault-layout.md` (variables + arborescence + pipeline canon + interop obsidian), référencée par tous les skills migrés.
- [🟢] **Interop obsidian** : `canon/` + `mj/` à `<univers-root>/.docs/` partagés ; aucun chemin obsidian périmé (`plugins/obsidian/skills` : 0 résidu non-`<jeu>`).
- [🟢] **Provenance** : `--homemade` route vers `mj/` partout (lore-extract + rules-keeper) ; le canon reste réservé à l'officiel + recherche vérifiée.

## ✅ Audit Checklist

### Organisation des données
- [🟢] Arbre par-jeu cohérent rpg-writer ET obsidian
- [🟢] Pipeline `sources/ → canon/` explicite et appliqué (extract-pdf → lore-extract/rules-keeper)
- [🟢] `setup init` scaffolde `.docs/{canon,mj}/` + bank.yml par défaut canon/+mj/

### Contrat bank.yml
- [🟢] Schéma (`bank-yml.md`) aligné sur la réalité migrée (canon/, personas tiers, systeme/)
- [🟢] Writer 100% piloté par bank.yml (plus de chemins en dur)
- [🟡] 3 `bank.yml` réels : `rules-files` encore project-local (voir suggestion)

### Coopération inter-skills
- [🟢] `mj/` lu par le writer (write/forge/toc)
- [🟢] `systeme/` + `subsystems/` produits par rules-keeper, déclarables en bank.yml
- [🟢] Frontières nettes : extract-pdf=sources ; lore-extract/rules-keeper=ventilation ; obsidian=mj/prep

## Recommendations

1. **Câbler les règles canoniques (suite de F6, data)** : lancer `rules-keeper` sur `<systeme-root>/sources/adrenaline` → `<systeme-root>/canon/adrenaline.md`, puis repointer `rules-files.systeme` des bank.yml WoT (actuellement project-local `.rules-files/adrenaline-d100.md`, documenté en commentaire). Non bloquant : les chemins actuels résolvent.
2. **Clarifier la propriété de `terminologie.md`** : `lore-extract` ET `research:extract-terminology` écrivent tous deux `<univers-root>/.docs/canon/terminologie.md` (+ `extract-pdf` produit `sources/terminology.md` brut). Append+dedup fonctionne, mais désigner lore-extract comme propriétaire principal (extract-terminology en complément ciblé) éviterait toute dérive.
3. **Polissage writer** : `write/actions/02-write-roleplaying.md:40` indique que les rules-files « resolves under `<systeme-root>/` » — ajouter `<subsys-root>/` pour les sous-systèmes actifs (le « Load ALL declared » couvre déjà le cas en pratique).

## Final Audit

- **Score**: 9/10 — migration complète et cohérente ; la chaîne MJ→joueur→writer est fonctionnelle et les frontières sont nettes.
- **Top risks**: aucun bloquant. Risque opérationnel résiduel : le coffre n'est pas sous git (toute écriture de masse reste irréversible — cf. mémoire delete-safety).
- **Quick wins**: reco 2 (propriété terminologie) et reco 3 (mention subsys dans le writer).
- **Follow-up actions**: reco 1 (produire `systeme/canon/` via rules-keeper puis repointer les bank.yml réels).
- **Additional notes**: 3 `bank.yml` réels alignés cette session (personas en tiers, shattered-paris dé-imbriqué). Premier audit conservé pour historique du pré-état.
