# Codex — marketplaces et plugins globaux

## État configuré le 22 juillet 2026

Le Codex CLI système était en version `0.46.0` et ne reconnaissait pas la commande
`codex plugin marketplace`. Il a été mis à jour avec npm :

```bash
npm install -g @openai/codex@latest
hash -r
codex --version
```

Le binaire actif est désormais `/home/tnn/.npm-global/bin/codex`. La version
obtenue lors de la configuration était `codex-cli 0.145.0`.

## Marketplaces globales

Deux marketplaces ont été enregistrées pour l'utilisateur, donc rendues
disponibles depuis tous les projets :

```bash
codex plugin marketplace add ai-driven-dev/framework
codex plugin marketplace add /home/tnn/Projets/my-marketplace
codex plugin marketplace list
```

| Marketplace | Source |
|---|---|
| `aidd-framework` | `https://github.com/ai-driven-dev/framework.git` |
| `my-marketplace` | `/home/tnn/Projets/my-marketplace` |

La marketplace Git AIDD est mise en cache sous
`~/.codex/.tmp/marketplaces/aidd-framework`. La marketplace locale reste liée à
son répertoire source.

Commandes de maintenance :

```bash
codex plugin marketplace list
codex plugin marketplace upgrade
codex plugin marketplace upgrade aidd-framework
codex plugin marketplace remove <nom>
```

## Plugins installés

| Plugin | Version constatée | Activation globale |
|---|---:|---|
| `aidd-context@aidd-framework` | `2.4.0` | activé |
| `overcode@my-marketplace` | `3.2.0` | activé |
| `sc-js@my-marketplace` | `0.9.0` | désactivé |
| `sc-css@my-marketplace` | `0.1.0` | désactivé |

```bash
codex plugin add aidd-context@aidd-framework
codex plugin add overcode@my-marketplace
codex plugin add sc-js@my-marketplace
codex plugin add sc-css@my-marketplace
```

`aidd-context` 2.4.0 fournit notamment la skill `02-project-memory`. Cette
version ne contient pas la skill plus récente nommée `02-project-init`.

## Portée globale et portée projet

Dans cette version du CLI, `codex plugin add` ne propose pas d'option de portée
projet. Le plugin est installé physiquement dans le cache utilisateur global.
La portée se gère par l'activation :

- les plugins génériques, comme `overcode`, restent activés globalement ;
- les plugins spécialisés par langage sont désactivés globalement ;
- chaque projet active uniquement ceux dont il a besoin.

Configuration dans `~/.codex/config.toml` :

```toml
[plugins."overcode@my-marketplace"]
enabled = true

[plugins."sc-js@my-marketplace"]
enabled = false

[plugins."sc-css@my-marketplace"]
enabled = false
```

Configuration créée dans
`/home/tnn/Projets/SmartLockers/multisite-clients/.codex/config.toml` :

```toml
[plugins."sc-js@my-marketplace"]
enabled = true

[plugins."sc-css@my-marketplace"]
enabled = true
```

Après une installation ou un changement d'activation, ouvrir une nouvelle
session Codex depuis le projet concerné afin de charger les skills et outils.

## Diagnostic rapide

```bash
command -v codex
codex --version
codex plugin marketplace list
codex plugin list
```

Si `codex plugin marketplace` produit `unexpected argument 'marketplace'`, le
shell utilise probablement un ancien binaire. Vérifier `command -v codex`,
placer `~/.npm-global/bin` avant `/usr/bin` dans `PATH`, puis exécuter `hash -r`.
