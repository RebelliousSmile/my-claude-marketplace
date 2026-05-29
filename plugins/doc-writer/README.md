# doc-writer

*Rédaction de documentation professionnelle : guides utilisateur, documents techniques et cahiers des charges — structurés d'abord, vérifiés ensuite, sans remplissage.*

Distinct du plugin `writing` (rédaction narrative) et du skill `aidd-overlay:readme` (README de dépôt) : `doc-writer` couvre la documentation produit, technique et contractuelle.

> **Rédaction en français par défaut.** Les noms de skills et certains termes (`specification`, `runbook`…) sont en anglais, mais les documents produits sont rédigés en français, sauf demande explicite d'une autre langue.

## Philosophie

- **Lecteur d'abord** : on nomme le lecteur et son objectif avant d'écrire une ligne.
- **Structure avant prose** : on valide le plan, on remplit ensuite.
- **Exemples plutôt que descriptions** ; **tout fait est vérifiable** (aucune invention de version, chiffre ou comportement).
- **Scannable** : titres, tableaux, listes — on trouve la réponse sans lire linéairement.
- **Zéro marketing** : pas de « puissant », « simple », « robuste ».

Principes partagés : `references/doc-principles.md`.

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `user-guide` | `/doc-writer:user-guide` | Documentation utilisateur final (manuels, prise en main, how-to, dépannage, FAQ), orientée tâches — outline → write → review |
| `technical-document` | `/doc-writer:technical-document` | Doc développeur/ops (architecture, référence API, guide d'intégration, runbook, design note), vérifiée contre le code — scope → write → verify |
| `specification` | `/doc-writer:specification` | Cahier des charges : objectifs, périmètre in/out, exigences fonctionnelles et non-fonctionnelles (ID + priorité MoSCoW + critère d'acceptation), livrables, contraintes — elicit → draft → challenge |

## Quel skill pour quoi

| Besoin | Skill |
|---|---|
| Doc pour les gens qui *utilisent* le produit | `user-guide` |
| Doc pour les gens qui *construisent/opèrent* | `technical-document` |
| Document de besoins/exigences (cahier des charges) | `specification` |
| README de dépôt | `aidd-overlay:readme` |
| Rédaction narrative (roman, JDR) | plugin `writing` |

## Styles de sortie

Chaque type de document a un **style de sortie** par défaut (voix, ton, temps, formatage, encarts), dans le `references/` de son skill :

- `skills/user-guide/references/output-style.md` — vouvoiement, impératif, encarts Astuce/Attention/Note
- `skills/technical-document/references/output-style.md` — neutre, présent, code/tableaux/Mermaid
- `skills/specification/references/output-style.md` — formel, normatif (« doit »), tables d'exigences

Pour **injecter un autre style**, passer `--style <chemin>` à l'invocation :

```
/doc-writer:user-guide "manuel d'onboarding" --style chemin/vers/mon-style.md
```

Le fichier fourni remplace alors le style par défaut (la structure et les règles de fond restent).

## Format de sortie

Markdown par défaut (source de vérité, éditable et versionnable). Pour exporter vers **ICML** (Adobe InCopy/InDesign), passer `--format icml` :

```
/doc-writer:specification "cahier des charges plateforme" --format icml
```

L'export passe par **pandoc** (`pandoc <nom>.md -t icml --standalone -o <nom>.icml`) ; le `.md` reste la source, le `.icml` est généré. Si pandoc n'est pas installé, le `.md` est conservé et la commande est indiquée — voir `references/export-icml.md`. Prérequis : [pandoc](https://pandoc.org/installing.html).

## Démarrage rapide

```
/doc-writer:user-guide "manuel d'onboarding pour notre app mobile"
/doc-writer:technical-document "documenter l'architecture du service paiements"
/doc-writer:specification "cahier des charges pour la nouvelle plateforme de réservation"
```

## Licence

MIT — voir [LICENSE](../../LICENSE).
