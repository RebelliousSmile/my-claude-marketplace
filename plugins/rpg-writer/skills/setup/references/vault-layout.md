# Vault Layout — Path-Variable Convention

Single source of truth for the by-game JDR vault structure.
Referenced by every rpg-writer skill that reads or writes vault paths.

---

## Path variables

| Variable | Valeur résolue |
|----------|----------------|
| `<vault>` | `C:/Users/fxgui/Public/Notes/Perso/JDR/` |
| `<jeu>` | Premier segment sous `<vault>` — déduit du CWD ou de `bank.yml` |
| `<univers-root>` | `<jeu>/univers/<univers>/` |
| `<systeme-root>` | `<jeu>/systeme/` |
| `<subsys-root>` | `<jeu>/subsystems/<nom>/` → repli sur `<vault>/subsystems/<nom>/` |
| `<projet-root>` | `<jeu>/ecrits/<projet>/` |
| `<campagne-root>` | `<jeu>/campagnes/<campagne>/` |
| `<pj-root>` | `<jeu>/pjs/<pj>/` |
| `<sources>` | `<univers-root>/sources/<source>/` (références lore) ou `<systeme-root>/sources/<source>/` (références règles) |

> Résolution de `<jeu>` : si le CWD est `<vault>/<jeu>/ecrits/<projet>/`, alors `<jeu>` = `<vault>/<jeu>/`.
> Toujours vérifier l'existence du chemin résolu avant toute lecture/écriture.

---

## Arborescence par jeu

```
<vault>/
└── <jeu>/
    ├── univers/
    │   └── <univers>/
    │       ├── canon/              ← lore officiel ventilé depuis sources/
    │       │   ├── terminologie.md
    │       │   ├── factions.md
    │       │   ├── histoire.md
    │       │   └── ...
    │       ├── mj/                 ← contenu maison (non-canon)
    │       │   └── ...
    │       ├── sources/
    │       │   └── <source>/       ← documents de référence bruts (extract-pdf)
    │       │       ├── lore.md
    │       │       ├── terminology.md
    │       │       ├── style.md
    │       │       └── ...
    │       └── .output-styles/
    │           └── <univers>-<source>.md
    ├── systeme/
    │   ├── canon/                  ← règles officielles restructurées (rules-keeper)
    │   │   └── ...
    │   ├── mj/                     ← règles maison (rules-keeper --homemade)
    │   │   └── ...
    │   └── sources/
    │       └── <source>/           ← règles brutes extraites (extract-pdf)
    │           ├── rules.md
    │           ├── terminology.md
    │           └── ...
    ├── subsystems/
    │   └── <nom>/
    │       ├── canon/
    │       ├── mj/
    │       └── sources/
    │           └── <source>/
    ├── pjs/
    │   └── <pj>/
    ├── campagnes/
    │   └── <campagne>/
    └── ecrits/
        └── <projet>/
            ├── bank.yml
            └── docs/
                └── extraction/
                    └── <source>/   ← espace de travail temporaire (extract-pdf)
```

---

## Pipeline canon — frontière décidée

```
PDF officiel
    ↓
extract-pdf          → sources de référence brutes (fidèles, non interprétées)
    ├── lore/terminologie → <univers-root>/sources/<source>/
    └── règles           → <systeme-root>/sources/<source>/
                                      ↓
lore-extract         → ventile sources/ vers <univers-root>/canon/        (ou mj/)
rules-keeper         → ventile sources/ vers <systeme-root>/canon/         (ou mj/)
                        (ou <subsys-root>/canon/ pour les sous-systèmes)
```

**Règle d'or :** `extract-pdf` n'écrit **jamais** dans `canon/` ni dans `mj/` directement.
Son output (`sources/`) est un document de référence brut qui attend la ventilation.

### Ventilation lore → sources/ → canon/

| Input (sources de référence) | Output (canon ventilé) |
|------------------------------|------------------------|
| `<univers-root>/sources/<source>/lore.md` | `<univers-root>/canon/<theme>.md` |
| `<univers-root>/sources/<source>/terminology.md` | `<univers-root>/canon/terminologie.md` |
| Sources maison (`--homemade`) | `<univers-root>/mj/<theme>.md` |

### Ventilation règles → sources/ → canon/

| Input (sources de référence) | Output (canon ventilé) |
|------------------------------|------------------------|
| `<systeme-root>/sources/<source>/rules.md` | `<systeme-root>/canon/<fichier>.md` |
| `<subsys-root>/sources/<source>/rules.md` | `<subsys-root>/canon/<fichier>.md` |
| Règles maison (`--homemade`) | `<systeme-root>/mj/<fichier>.md` |

---

## Interopérabilité obsidian

Les sous-arbres `canon/` + `mj/` sont **partagés avec `obsidian:rpg`**.
Ne jamais renommer ni déplacer ces dossiers sans coordination avec le plugin obsidian.

**Consommation des règles** :
- `systeme/{canon,mj}/` (système de jeu) — partagé entre `obsidian:solo-mc`, `pc`, `rpg`, et le writer (`rules-files` du bank.yml).
- `subsystems/<nom>/{canon,mj}/` (sous-systèmes génériques : Parallaxe, Cinério, Muses et Oracles) — **produits par `rules-keeper`, consommés par `obsidian:solo-mc` uniquement** (outils de jeu en direct). Ni `pc`/`rpg` ni le writer ne les référencent.

---

## Versioning & gitignore (dépôt `tnn-jdr`)

Le dépôt `tnn-jdr` versionne tout le contenu personnel et les sorties des outils (lore-extract, rules-keeper). Seules les sources brutes (extractions PDF, dumps) sont exclues — elles sont volumineuses, dérivées de matériel commercial, et régénérables.

**Patterns gitignored** :

| Pattern | Ce qu'il couvre |
|---------|-----------------|
| `**/sources/` | Toutes les sources brutes : `<univers-root>/sources/`, `<systeme-root>/sources/`, `<subsys-root>/sources/` |
| `**/fulltext.md` | Dumps PDF directs (`extract-pdf`) |

**Exceptions (un-ignore)** — le `.gitignore` ajoute explicitement :

| Pattern | Effet |
|---------|-------|
| `!**/systeme/canon/**` | Le canon du système est versionné — les agents (`solo-mc`, `pc`, `write`) en ont besoin après un clone |
| `!**/univers/*/canon/**` · `!**/univers/*/mj/**` | Le lore d'univers est versionné au même titre, même si un sous-dossier porte un nom ignoré (`*pdf_*`, `nobf00_*`…) |
| `!**/.docs/**` | Conservé pour les projets d'écriture (`ecrits/<projet>/.docs/` : `document-rules.md`, `scenarios-details.md`…) |
| `**/systeme/canon/**/sources/` · `**/univers/*/{canon,mj}/**/sources/` | Ré-ignore les `sources/` bruts nichés dans un canon/mj |

**Versionné vs non-versionné** :

| Chemin | Rôle | Statut |
|--------|------|--------|
| `<systeme-root>/canon/` | Règles officielles du système (rules-keeper) | ✅ versionné |
| `<systeme-root>/mj/` | Règles maison du système | ✅ versionné |
| `<systeme-root>/sources/` | Sources brutes règles (extract-pdf) | ❌ gitignored |
| `<univers-root>/canon/` | Lore officiel (lore-extract) | ✅ versionné |
| `<univers-root>/mj/` | Lore maison | ✅ versionné |
| `<univers-root>/{canon,mj}/**/sources/` | Sources brutes nichées dans canon/mj | ❌ gitignored |
| `<univers-root>/sources/` | Sources brutes lore (extract-pdf) | ❌ gitignored |
| `<subsys-root>/canon/` | Canon des sous-systèmes (Parallaxe…) | ✅ versionné |

### Conséquence après un clone sur une nouvelle machine

Seuls les dossiers `sources/` sont **absents**. Tous les canons (système, lore, sous-systèmes) et tous les `mj/` survivent au clone — les agents (`solo-mc`, `pc`, `rpg`, `write`) sont opérationnels immédiatement.

Pour **enrichir** le lore ou les règles à partir de nouveaux PDFs, reconstituer les sources via `extract-pdf` puis relancer `lore-extract` / `rules-keeper`.

```
PDF officiel (hors dépôt)
    ↓ extract-pdf            → reconstitue <systeme-root>/sources/<source>/
    ↓ rules-keeper --update  → met à jour <systeme-root>/canon/
    └ (lore : extract-pdf → <univers-root>/sources/ → lore-extract --update → <univers-root>/canon/)
```

> **Pour réutiliser cette convention dans vos propres agents** : pointez-les vers ce fichier (`@setup/references/vault-layout.md`) plutôt que de redupliquer la règle. C'est la référence unique de l'arborescence ET du versioning du vault.
