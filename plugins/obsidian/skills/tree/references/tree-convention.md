# Convention d'arborescence — `Documents/`

Référence de `obsidian:tree`. Décrit **comment `tree` se repère** dans `Documents/` et le **petit noyau d'invariants** qui tient quoi qu'il arrive.

> **L'arborescence bouge régulièrement.** On ne fige donc **pas** un layout de référence à faire respecter au caractère près. À la place, `tree` **maintient un cache** (carte de l'arbo réelle) et s'en sert pour naviguer, vérifier la dérive et arbitrer le tri. Le cache est descriptif (ce qui *est*), les invariants sont prescriptifs (ce qui doit *toujours* tenir).

> **Statut vis-à-vis des autres skills.** Cette convention est une vue d'ensemble **pour l'humain et pour `tree`**, **pas une dépendance d'exécution** des skills de production (`writing`, `brief`…). Ceux-ci opèrent relativement à un **répertoire de référence local** (argument ou CWD) et ignorent ce schéma global. On peut donc **déplacer** une unité de travail n'importe où sans rien casser — le contexte vit dans l'unité (`_brief/summary.md` autosuffisant), pas dans le chemin.

---

## Noyau d'invariants (stable — ce que `tree` fait respecter)

Ces règles servent la **portabilité** ; elles ne dépendent pas de l'organisation du moment.

| # | Invariant | Détail |
|---|-----------|--------|
| I1 | **Préfixe `_` des répertoires de travail** | Tout répertoire **de travail** (produit/consommé par un skill : `_brief`, `_output`, `_research`, `_savoir`…) commence par `_`. |
| I2 | **Contenu interne non préfixé** | À l'intérieur d'un répertoire de travail, fichiers et sous-dossiers **ne** sont **pas** préfixés (`_brief/summary.md`, pas `_brief/_summary.md`). |
| I3 | **Slugs portables** | Noms de dossiers « libres » en `kebab-case` : minuscules, tirets, **sans espace ni accent** (portabilité cross-OS). Exemptés : les niveaux à format imposé (`Perso`/`Pro`, années `AAAA`, mois `MM`). |
| I4 | **Mois/année bien formés** | Quand un niveau daté est utilisé : année = 4 chiffres, mois = 2 chiffres `01`–`12`. |

`tree check` signale toute violation d'invariant comme une **anomalie** (corrigeable par `fix`). Tout le reste est de la **dérive de convention** (souple), jugée à l'aune du cache.

---

## Schéma par défaut (observé, non figé)

Le pattern recommandé, enregistré dans le cache comme défaut du domaine :

```
<Perso|Pro>/<category>/<R = subcategory>/<AAAA>/<MM>/<projet>/
            │                            │             ├── _brief/
            │                            │             └── _output/
            │                            └── _savoir/   ← ressources globales du domaine (non daté)
```

- **`R` = le domaine** (niveau `subcategory`) : c'est le **répertoire de travail** qui héberge les **ressources globales / savoir durable** du domaine (`R/_savoir/`).
- **`<projet>` = l'unité de travail** : le projet d'écriture, typiquement `R/<AAAA>/<MM>/<projet>/`, qui **porte les `_brief/`/`_output/`**. C'est ce que `brief` cible et ce que `writing` consomme.
- **Frontière de portabilité** : `brief` lit les globales de `R` et les **consolide inline** dans `<projet>/_brief/summary.md` ; au runtime, `writing` ne touche que `<projet>/`, jamais `R`. Déplacer `<projet>/` seul ne casse rien.
- **Savoir durable** = `R/_savoir/` (hors axe daté). Forme interne **non figée** (point ouvert) — `tree` la reconnaît sans imposer de structure.
- **`R/bank.yml`** = manifeste (cache) des ressources globales du domaine. **Maintenu par `tree`** (`index` le régénère en scannant `R/_savoir/`, fusion non destructive des `summary` curés), **lu par `obsidian:brief`** à l'assemblage (jamais par `writing`). Format : voir `obsidian:brief › references/bank-yml.md`.

Un domaine peut diverger de ce défaut (axe non daté, niveaux en plus/en moins). `tree` ne le sanctionne pas : il **apprend** la convention effective du domaine et la consigne dans le cache.

---

## Le cache — `<ancre>/_tree/cache.json`

Cœur du dispositif. `tree index` le construit/rafraîchit en scannant l'arbo réelle ; `check`/`fix`/`sort` le lisent.

- **Emplacement** : `_tree/` est posé à l'**ancre** découverte (le segment `Perso` ou `Pro`). Un cache par ancre. `_tree/` est lui-même un répertoire de travail (préfixe `_`).
- **Pas de chemin global en dur** : l'ancre est **découverte** (voir plus bas), jamais hardcodée.
- **Régénérable** : le cache est dérivé de l'arbo ; on peut le supprimer et relancer `index`. Il accélère la navigation, il ne fait pas autorité contre le disque.

Forme (indicative) :

```json
{
  "root": "<chemin absolu de l'ancre au moment du scan>",
  "scanned_at": "<date passée par l'appelant>",
  "default_pattern": "<category>/<subcategory>/<AAAA>/<MM>/<unité>",
  "domains": [
    {
      "path": "RPG/zombiology",
      "dated": true,
      "convention": "<AAAA>/<MM>/<unité>",
      "units": ["2026/06/test-scenario"],
      "durable": ["_savoir"],
      "notes": "convention effective apprise du contenu existant"
    }
  ],
  "anomalies": [ "chemin — invariant violé (I1…I4)" ],
  "unsorted": [ "chemins hors schéma, candidats à sort" ]
}
```

> Le cache enregistre `root` en absolu **pour ce scan** uniquement (commodité de navigation). Il n'est pas une dépendance des skills de production et reste régénérable : si l'arbo est déplacée, on relance `index`.

---

## Résolution de l'ancre (découverte, jamais hardcodée)

`tree` ne hardcode jamais `C:\Users\…\Documents`. Il **découvre** l'ancre :

1. Partir du répertoire cible (argument, ou CWD par défaut).
2. Remonter les parents jusqu'à un segment `Perso` ou `Pro` → c'est l'ancre.
3. Si un `_tree/cache.json` existe à l'ancre, le charger ; sinon `index` le crée.
4. **Aucune ancre trouvée** → la cible n'est pas dans un sous-arbre reconnu : le signaler, et proposer de traiter la cible comme racine gérée (`index` y posera `_tree/`).

Ce mécanisme garde `tree` portable : il fonctionne où qu'on déplace `Documents/`, et sur un sous-arbre exporté ailleurs.
