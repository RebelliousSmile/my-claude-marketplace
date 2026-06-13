# Contribuer

Marketplace personnelle de plugins Claude Code. Ce guide décrit comment ajouter ou modifier un plugin en respectant les conventions du dépôt. Tutoiement par convention.

## Structure du dépôt

```
.claude-plugin/marketplace.json   # registre du marketplace (source de vérité installable)
index.json                        # index résumé des plugins (id, nom, description, version)
plugins/<nom>/
  .claude-plugin/plugin.json      # manifeste du plugin
  README.md                       # doc du plugin
  CHANGELOG.md                    # journal du plugin
  references/                     # docs partagées entre skills (via ${CLAUDE_PLUGIN_ROOT})
  skills/<skill>/
    SKILL.md                      # routeur du skill (frontmatter + actions + flow)
    actions/NN-<nom>.md           # une étape par fichier
    references/                   # docs/templates propres au skill
    evals/scenarios.json          # cas de routage (prompt → expect_action)
memory/                           # guidelines d'authoring (README, CLAUDE.md)
aidd_docs/internal/decisions/     # ADR (décisions d'architecture, ex. DEC-001)
tools/eval/                       # harness e2e brief→output + fixtures golden (node, zéro dép.)
```

## Anatomie d'un skill

Un `SKILL.md` est un **routeur**, pas une procédure. Frontmatter :

```yaml
---
name: <skill>
model: sonnet            # modèle conseillé
description: >-          # déclencheurs + périmètre + "Do NOT use ... use X instead"
  ...
# disable-model-invocation: true   # si le skill ne doit se lancer que sur /<plugin>:<skill>
---
```

Corps attendu :

- **Available actions** — tableau `# · Action · Role · Input`.
- **Default flow** — linéaire (`01 → 02`) ou routeur, avec un mapping *trigger → action*.
- **Transversal rules** — invariants valables pour toutes les actions.
- **References / Evals** — pointeurs.

Chaque `actions/NN-<nom>.md` suit : `Inputs` → `Process` → `Outputs` → `Test`. Le `Test` doit être vérifiable (une condition observable, pas « ça marche »).

Pour partager une procédure entre skills (DRY), la placer dans `plugins/<nom>/references/` et la référencer via `${CLAUDE_PLUGIN_ROOT}/references/<fichier>.md` — **référencer, ne pas redupliquer** (cf. `aidd_docs/internal/decisions/001-pivot-authoring-conventions.md`).

## Règles installées dans un projet (`.claude/rules/`)

Un skill `setup`/`sniff` peut installer des règles dans le projet cible. Chaque règle porte un frontmatter `paths:` (globs) : elle s'auto-charge quand un fichier touché correspond. Conséquences :

- `paths:` d'une **règle de codage** → globs de fichiers source pertinents (`**/*.vue`, `**/*.css`…).
- `paths:` d'un **pivot perf** (consommé par `web-optimize`) → uniquement les fichiers de **config** (`vite.config.ts`…), pas les globs source — voir DEC-001.
- Bullets impératifs et courts (`Always X` / `Never Y`), un `## Why` quand utile.

## Ajouter un plugin

1. Créer `plugins/<nom>/.claude-plugin/plugin.json` (`$schema`, `name`, `version`, `description`, `author`).
2. Ajouter les skills sous `skills/`.
3. **Enregistrer le plugin à deux endroits** :
   - `.claude-plugin/marketplace.json` (bloc `plugins[]` : `name`, `version`, `source`, `description`, `recommended`).
   - `index.json` (bloc `plugins[]` : `id`, `name`, `description`, `version`).
4. Documenter dans le `README.md` racine (tableau des plugins + section dédiée + tableau « par type de projet » si pertinent) et créer `plugins/<nom>/README.md`.
5. Créer `plugins/<nom>/CHANGELOG.md`.

Garder `marketplace.json`, `index.json` et les README **cohérents** entre eux à chaque changement de version ou de description.

## Versionnement

- SemVer par plugin (`plugin.json` + `marketplace.json` + `index.json`).
- **Mineur** : ajout rétro-compatible (skill, action, règle).
- **Majeur** : suppression/renommage cassant un usage existant.
- Consigner chaque bump dans le `CHANGELOG.md` du plugin ; les changements de composition du marketplace (ajout/retrait de plugin) vont dans le `CHANGELOG.md` racine.

## Commits

Convention *Conventional Commits* :

```
feat(<plugin>): ...
fix(<plugin>/<skill>): ...
docs(<plugin>): ...
chore(<plugin>): bump x.y.z → x.y.(z+1)
```

Messages factuels, impératifs. Pas d'emoji dans les artefacts versionnés.

## Développement local

Sur la machine de dev, enregistrer le marketplace avec `"source": "directory"` et le chemin local (clé distincte de l'install GitHub) : les modifications sont prises en compte sans push.

Après modification d'un skill déjà installé, recharger le cache (voir la section *Maintenance du cache* du `README.md`) puis `/reload-plugins`.

## Avant de pousser

- JSON valides (`marketplace.json`, `index.json`, `plugin.json`, chaque `evals/scenarios.json`).
- Chaque action a un `Test` vérifiable.
- Harness e2e vert : `node tools/eval/harness.mjs` (contrat brief→output + invariants).
- Couverture de routage verte : `node tools/eval/coverage.mjs` (chaque action routable a ≥1 scénario).
- Les `references` croisées (`${CLAUDE_PLUGIN_ROOT}/...`) pointent vers des fichiers existants.
- README racine + README plugin + CHANGELOG cohérents avec la version.
