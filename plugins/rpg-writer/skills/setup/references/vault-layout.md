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
    │       ├── .docs/
    │       │   ├── canon/          ← lore officiel ventilé depuis sources/
    │       │   │   ├── terminologie.md
    │       │   │   ├── factions.md
    │       │   │   ├── histoire.md
    │       │   │   └── ...
    │       │   └── mj/             ← contenu maison (non-canon)
    │       │       └── ...
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
lore-extract         → ventile sources/ vers <univers-root>/.docs/canon/  (ou mj/)
rules-keeper         → ventile sources/ vers <systeme-root>/canon/         (ou mj/)
                        (ou <subsys-root>/canon/ pour les sous-systèmes)
```

**Règle d'or :** `extract-pdf` n'écrit **jamais** dans `canon/` ni dans `mj/` directement.
Son output (`sources/`) est un document de référence brut qui attend la ventilation.

### Ventilation lore → sources/ → canon/

| Input (sources de référence) | Output (canon ventilé) |
|------------------------------|------------------------|
| `<univers-root>/sources/<source>/lore.md` | `<univers-root>/.docs/canon/<theme>.md` |
| `<univers-root>/sources/<source>/terminology.md` | `<univers-root>/.docs/canon/terminologie.md` |
| Sources maison (`--homemade`) | `<univers-root>/.docs/mj/<theme>.md` |

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
