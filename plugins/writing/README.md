# writing

*Rédaction professionnelle **et** narrative : de la documentation produit/technique/contractuelle au craft narratif (romans, scénarios, guides) — structuré d'abord, vérifié ensuite, sans remplissage.*

Fusion de `doc-writer` (documentation pro) et des parties génériques de `rpg-writer` (craft narratif).

**Séparation des responsabilités** : `writing` **produit à partir d'un brief**. L'**assemblage des intrants** est délégué au plugin `obs` — `brief` (construit le répertoire `_brief/`), `forge` (concept), `research` (données), `lore-extract`, `rules-keeper`, `extract-pdf`.

> **Rédaction en français par défaut.** Les noms de skills et certains termes (`specification`, `runbook`…) sont en anglais, mais les documents produits sont rédigés en français, sauf demande explicite d'une autre langue.

## Modèle de travail : brief → output

Contrat partagé par tous les skills narratifs : [`references/brief-model.md`](references/brief-model.md). Deux répertoires, chemins indépendants.

```
<brief>/              ← assemblé par obsidian (lecture seule)     <output>/          ← produit par writing
  summary.md          brief autosuffisant (lore/règles/langue)      toc/             INDEX.md + chapter-NN.md (optionnel)
  personas/           personas lecteurs (review)                    chapters/        chapter-NN.md (1+)
  output-styles/      styles d'écriture (write/review)              review/          feedback persona
```

- Invocation : `<brief>` positionnel + `--out <output>` (ex. `/writing:toc <brief> --out <output>`).
- **Écriture courte** : pas de TOC (`toc/` absent), un seul `chapters/chapter-01.md`.
- Aucun `bank.yml`, aucun couplage au vault JDR : tout le contexte vient de `summary.md`.

## Philosophie

- **Lecteur d'abord** : on nomme le lecteur et son objectif avant d'écrire une ligne.
- **Structure avant prose** : on valide le plan, on remplit ensuite.
- **Exemples plutôt que descriptions** ; **tout fait est vérifiable** (aucune invention de version, chiffre ou comportement).
- **Scannable** : titres, tableaux, listes — on trouve la réponse sans lire linéairement.
- **Zéro marketing** : pas de « puissant », « simple », « robuste ».

Principes partagés (documentation) : `references/doc-principles.md`.

## Skills — Documentation professionnelle

| Skill | Description |
|---|---|
| `user-guide` | Documentation utilisateur final (manuels, prise en main, how-to, dépannage, FAQ), orientée tâches — outline → write → review |
| `technical-document` | Doc développeur/ops (architecture, référence API, guide d'intégration, runbook, design note), vérifiée contre le code — scope → write → verify |
| `specification` | Cahier des charges : objectifs, périmètre in/out, exigences fonctionnelles et non-fonctionnelles (ID + priorité MoSCoW + critère d'acceptation), livrables, contraintes — elicit → draft → challenge |

## Skills — Craft narratif

| Skill | Description |
|---|---|
| `toc` | Génère la table des matières depuis un document source / un brief |
| `write` | Rédige des chapitres narratifs (roman ou JDR) en Markdown, selon la TOC et l'output-style |
| `upgrade` | Améliore itérativement un texte ou un prompt d'atelier par critique structurée |
| `review` | Pipeline de relecture qualitative basée sur persona (analyse, audit, nœuds) |
| `persona` | Crée et affine des fichiers YAML de persona lecteur pour le pipeline de relecture |
| `tone-finder` | Génère ou met à jour un output-style pour un univers éditorial (depuis des textes sources) |
| `storyboard` | Identifie les moments visuels clés d'un chapitre et génère des briefs d'illustration |

> Les skills d'**assemblage des intrants** — `brief` (construit `_brief/`), `forge` (concept), `research` (données) — sont dans le plugin `obs`.

## Quel skill pour quoi

| Besoin | Skill |
|---|---|
| Doc pour les gens qui *utilisent* le produit | `user-guide` |
| Doc pour les gens qui *construisent/opèrent* | `technical-document` |
| Document de besoins/exigences (cahier des charges) | `specification` |
| README de dépôt | `overcode:readme` |
| Forger le concept / brief narratif | `obs:forge` |
| Rédaction narrative à partir d'un brief | `toc` → `write` → `review` |
| Assembler le brief / lore / données / règles de jeu | plugin `obs` (`brief`, `research`, `lore-extract`, `rules-keeper`) |

## Format de sortie (documentation)

Markdown par défaut (source de vérité, éditable et versionnable). Pour exporter vers **ICML** (Adobe InCopy/InDesign), passer `--format icml` :

```
/writing:specification "cahier des charges plateforme" --format icml
```

L'export écrit d'abord le `.md` sur disque (pandoc ne convertit pas une sortie en chat), puis convertit (`pandoc <nom>.md -t icml -o <nom>.icml`) ; le `.md` reste la source, le `.icml` est généré. Si pandoc est absent ou non exécutable, le `.md` est conservé et la commande est indiquée — voir `references/export-icml.md`. Prérequis : [pandoc](https://pandoc.org/installing.html).

## Démarrage rapide

```
/writing:user-guide "manuel d'onboarding pour notre app mobile"
/writing:technical-document "documenter l'architecture du service paiements"
/writing:specification "cahier des charges pour la nouvelle plateforme de réservation"
/writing:write "rédiger le chapitre 3 selon la TOC"
```

## Licence

MIT — voir [LICENSE](../../LICENSE).
