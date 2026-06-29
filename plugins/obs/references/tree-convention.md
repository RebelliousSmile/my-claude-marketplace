# Convention d'arborescence — `Documents/`

Référence de `obs:tree`. Décrit **comment `tree` se repère** dans `Documents/` et le **petit noyau d'invariants** qui tient quoi qu'il arrive.

> **L'arborescence bouge régulièrement.** On ne fige donc **pas** un layout de référence à faire respecter au caractère près. À la place, `tree` **maintient un cache** (carte de l'arbo réelle) et s'en sert pour naviguer, vérifier la dérive et arbitrer le tri. Le cache est descriptif (ce qui *est*), les invariants sont prescriptifs (ce qui doit *toujours* tenir).

> **Statut vis-à-vis des autres skills.** Cette convention est une vue d'ensemble **pour l'humain et pour `tree`**, **pas une dépendance d'exécution** des skills de production (`writing`, `brief`…). Ceux-ci opèrent relativement à un **répertoire de référence local** (argument ou CWD) et ignorent ce schéma global. On peut donc **déplacer** une unité de travail n'importe où sans rien casser — le contexte vit dans l'unité (`_brief/summary.md` autosuffisant), pas dans le chemin.

---

## Noyau d'invariants (stable — ce que `tree` fait respecter)

Ces règles servent la **portabilité** ; elles ne dépendent pas de l'organisation du moment.

| # | Invariant | Détail |
|---|-----------|--------|
| I1 | **Préfixe `_` des répertoires de travail** | Tout répertoire **de travail** (produit/consommé par un skill : `_brief`, `_output`, `_research`, `_univers`, `_systeme`, `_subsystems`…) commence par `_`. |
| I2 | **Contenu interne non préfixé** | À l'intérieur d'un répertoire de travail, fichiers et sous-dossiers **ne** sont **pas** préfixés (`_brief/summary.md`, pas `_brief/_summary.md`). |
| I3 | **Slugs portables** | Noms de dossiers « libres » en `kebab-case` : minuscules, tirets, **sans espace ni accent** (portabilité cross-OS). Exemptés : les niveaux à format imposé (`Perso`/`Pro`, années `AAAA`, mois `MM`). |
| I4 | **Mois/année bien formés** | Quand un niveau daté est utilisé : année = 4 chiffres, mois = 2 chiffres `01`–`12`. |

`tree check` signale toute violation d'invariant comme une **anomalie** (corrigeable par `fix`). Tout le reste est de la **dérive de convention** (souple), jugée à l'aune du cache.

---

## Niveaux sémantiques — notion de bucket

Chaque niveau de l'arborescence est un **bucket** : un conteneur nommé qui délimite un périmètre sémantique ou temporel. Les buckets se nichent les uns dans les autres.

| Niveau | Nom | Rôle | Exemple |
|--------|-----|------|---------|
| 1 | Ancre | Séparateur Perso / Pro | `Perso`, `Pro` |
| 2 | Category | Bucket sémantique de premier niveau | `Projets`, `Finance`, `Correspondance` |
| 3 | Subcategory (R) | Bucket domaine — point d'ancrage du domaine | `smartlockers`, `mauceri` |
| 3b | Bucket de travail | Répertoire `_`-préfixé dans R — contenu général durable, hors axe temporel | `_univers/`, `_systeme/`, `_onet/`, `_references/` |
| 4 | YYYY | Bucket temporel annuel | `2026` |
| 5 | MM | Bucket temporel mensuel | `06` |
| 6 | Unité / entité | Bucket feuille — projet, sous-dossier thématique ou entité source | `onet`, `mon-projet` |

**Bucket de travail (niveau 3b)** : répertoire préfixé `_` posé directement dans R, sans axe temporel. Contient des fichiers généraux liés au domaine — références, ressources durables, digests transversaux, données consolidées — qui n'appartiennent à aucune période YYYY/MM en particulier. Conforme à l'invariant I1 (`_` prefix). Exemples : `R/_univers/`, `R/_systeme/`, `R/_onet/`, `R/_references/`. Plusieurs buckets de travail peuvent coexister dans R, chacun délimitant un sous-thème ou une entité du domaine.

Un bucket de niveau N peut contenir des buckets de niveau N+1 ou des fichiers de contenu directement. Il n'est pas obligatoire d'atteindre le niveau 6 : un domaine peut s'arrêter à `Subcategory/YYYY/MM/` si ses unités sont des fichiers plutôt que des répertoires.

La notion de **bucket entité** (niveau 6, regroupement par source expéditrice ou par thème) est distincte des buckets temporels YYYY/MM : elle découpe un bucket temporel en sous-groupes nommés selon l'origine du contenu, et non selon la date.

---

## Schéma par défaut (observé, non figé)

Le pattern recommandé, enregistré dans le cache comme défaut du domaine :

```
<Perso|Pro>/<category>/<R = subcategory>/<AAAA>/<MM>/<projet>/
            │                            │             ├── _brief/
            │                            │             └── _output/
            │                            └── _univers/, _systeme/, _subsystems/…   ← ressources globales du domaine (non daté)
```

- **`R` = le domaine** (niveau `subcategory`) : c'est le **répertoire de travail** qui héberge les **ressources globales / savoir durable** du domaine (`R/_univers/`, `R/_systeme/`, `R/_subsystems/`…).
- **`<projet>` = l'unité de travail** : le projet d'écriture, typiquement `R/<AAAA>/<MM>/<projet>/`, qui **porte les `_brief/`/`_output/`**. C'est ce que `brief` cible et ce que `writing` consomme.
- **Frontière de portabilité** : `brief` lit les globales de `R` et les **consolide inline** dans `<projet>/_brief/summary.md` ; au runtime, `writing` ne touche que `<projet>/`, jamais `R`. Déplacer `<projet>/` seul ne casse rien.
- **Savoir durable** = `R/_univers/`, `R/_systeme/`, `R/_subsystems/`… (hors axe daté). Forme interne **non figée** (point ouvert) — `tree` la reconnaît sans imposer de structure.
- **`R/bank.yml`** = manifeste (cache) des ressources globales du domaine. **Maintenu par `tree`** (`index` le régénère en scannant `R/_univers/`, `R/_systeme/`, etc., fusion non destructive des `summary` curés), **lu par `obs:brief`** à l'assemblage (jamais par `writing`). Format : voir `obs:brief › references/bank-yml.md`.

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
      "durable": ["_univers", "_systeme", "_subsystems"],
      "notes": "convention effective apprise du contenu existant"
    }
  ],
  "anomalies": [ "chemin — invariant violé (I1…I4)" ],
  "unsorted": [ "chemins hors schéma, candidats à sort" ]
}
```

> Le cache enregistre `root` en absolu **pour ce scan** uniquement (commodité de navigation). Il n'est pas une dépendance des skills de production et reste régénérable : si l'arbo est déplacée, on relance `index`.

---

## Domaines à convention connue

Certains domaines ont une convention **établie et documentée** que `tree` reconnaît directement, sans devoir l'inférer à partir du contenu existant. `tree` les identifie au scan, enregistre leur convention dans le cache sous `kind`, et ne la remet pas en question lors du `check`.

### `Pro/Projets` — projets avec code

```
Pro/Projets/<projet>/
  ├── _code/              ← code source (répertoire de travail — I1 ✓)
  └── <AAAA>/<MM>/        ← travaux et suivi mensuel (dates — I4 ✓)
```

**Règles propres à ce domaine :**

| Règle | Détail |
|-------|--------|
| Pas d'`INDEX.md` | Aucun fichier index central n'est attendu ni requis — ni à la racine du projet, ni dans les mois. |
| Point d'entrée vivant | Le mois `<AAAA>/<MM>/` le plus récent fait office d'entrée courante ; `index` l'enregistre comme `entry`. |
| `_code/` est un répertoire de travail | I1 ✓ — son contenu suit les conventions du projet code (git, etc.) et n'est pas jugé contre I2–I3. |
| `<AAAA>/<MM>/` = travaux et suivi | Chaque mois contient notes, tâches, rétrospectives — pas nécessairement des unités `_brief/`/`_output/`. |
| Structure interne libre | En dessous de `_code/` et de chaque mois, la structure est libre (ni imposée, ni vérifiée par `tree`). |

**Ce que `check` ne signale PAS comme anomalie dans ce domaine :**
- Absence d'`INDEX.md` à tout niveau.
- Présence de `_code/` (n'est pas de la dérive).
- Mois sans `_brief/` ni `_output/`.
- Structure interne de `_code/` non conforme aux invariants I2–I3.

**Ce que `sort` propose pour ce domaine :**
- Fichier de code / source → `<projet>/_code/`
- Note / tâche / document de suivi → `<projet>/<AAAA-courant>/<MM-courant>/`

**Forme dans le cache** pour un projet de ce domaine :

```json
{
  "path": "Projets/mon-projet",
  "kind": "pro-projet",
  "dated": true,
  "convention": "_code + AAAA/MM (travaux)",
  "code_dir": "_code",
  "travaux": ["2026/06", "2026/05"],
  "entry": "2026/06",
  "notes": "Pro/Projets — entrée courante : mois le plus récent"
}
```

---

## Résolution de l'ancre (découverte, jamais hardcodée)

`tree` ne hardcode jamais `C:\Users\…\Documents`. Il **découvre** l'ancre :

1. Partir du répertoire cible (argument, ou CWD par défaut).
2. Remonter les parents jusqu'à un segment `Perso` ou `Pro` → c'est l'ancre.
3. Si un `_tree/cache.json` existe à l'ancre, le charger ; sinon `index` le crée.
4. **Aucune ancre trouvée** → la cible n'est pas dans un sous-arbre reconnu : le signaler, et proposer de traiter la cible comme racine gérée (`index` y posera `_tree/`).

Ce mécanisme garde `tree` portable : il fonctionne où qu'on déplace `Documents/`, et sur un sous-arbre exporté ailleurs.
