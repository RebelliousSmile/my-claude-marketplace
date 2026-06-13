# Sections du README

Les numéros sont internes — ils n'apparaissent pas dans le README final. L'ordre relatif des sections présentes est à respecter ; les sections absentes sont simplement omises.

---

## 1. Titre + phrase d'identité

**Obligatoire.**

- Format : `# {nom du projet}` puis une phrase de 15 à 25 mots, immédiatement sous le titre
- Présentation : *italique* sur une ligne, ou en blockquote `> ...` — pas en paragraphe normal (elle se confondrait avec le corps)
- La phrase doit dire **ce que fait le projet** ET **contre quoi il se positionne** (concurrent implicite ou statu quo)
- Bannir les superlatifs et les descriptions génériques applicables à tout projet du domaine
- Acronymes : autorisés s'ils font partie du vocabulaire standard du public cible (MCP, ORM, API, REST, CLI, SDK, RAG, LLM sont OK pour un public dev) ; pour les acronymes plus rares, expliciter brièvement

---

## 2. État du projet

**Obligatoire.** Vient avant l'aperçu et avant les arguments.

**Niveau de maturité** (un et un seul) :

- 🧪 **Experimental / Proof of concept** — API change à chaque commit
- 🔬 **Alpha** — utilisable, bugs attendus, breaking changes possibles
- 🧰 **Beta** — stable sur le chemin nominal, edge cases incomplets
- ✅ **Stable** — utilisable en production, semver respecté
- 🛠️ **Maintenance** — pas de nouvelles features
- 📦 **Archived** — figé

**Trois listes courtes** (3 à 6 items chacune, faits et non promesses) :
- *Ça marche aujourd'hui :* …
- *Pas encore :* …
- *Prochaine étape :* … (horizon temporel approximatif **uniquement si fourni** — ne pas inventer)

**Tableau plateformes** (uniquement si projet multi-OS ou multi-cible) :

| Plateforme | État | Note |
|---|---|---|

---

## 3. Aperçu

**Conditionnel** — inclure si un élément peut concrètement montrer le projet en début de document.

Trois variantes selon le type de projet :
- **Projet visuel** (UI, CLI à output coloré, rapport HTML, fichier média) : capture, GIF ou asciinema. Légende d'une ligne maximum.
- **Lib / SDK** : snippet de code court (≤ 10 lignes) montrant l'API principale en action.
- **API / service** : exemple de requête + réponse (≤ 15 lignes au total).

Omettre la section entière si rien de pertinent à montrer. Ne pas forcer un visuel artificiel.

---

## 4. Pourquoi / Pour qui

- 3 à 5 bullets, chacun de 10 à 25 mots
- Chaque bullet doit être un **angle de positionnement** (pourquoi un choix technique compte pour l'utilisateur), pas une feature technique brute
- Suivi d'une à deux phrases sur le public cible **et** sur ceux qui ne sont pas la cible
- Si un concurrent évident existe : une phrase explicite qui le nomme et précise la différence

---

## 5. Prérequis

- Liste à puces concise, une ligne par prérequis
- Préciser les versions minimales **uniquement si fournies** — ne pas inventer
- Une remarque courte entre parenthèses est acceptable pour un cas particulier  
  *(ex: "Python 3.11+ (3.10 fonctionne mais sans le mode async)")*

---

## 6. Démarrage rapide

**Obligatoire si l'input est fourni ou validé.** (Voir inputs bloquants dans l'action.)

- Un bloc de code par OS supporté, basé sur les commandes effectives fournies par l'utilisateur
- Commandes copiables telles quelles, sans `<placeholder>` non expliqué
- La séquence doit se terminer sur une commande qui produit une **sortie visible** (smoke test)
- Maximum **deux** lignes courtes (≤ 80 caractères chacune) de prose entre deux blocs
- Ne jamais renvoyer vers une doc externe pour l'installation
- Si certaines plateformes ne sont pas couvertes par les inputs : ne **pas inventer** les commandes — indiquer "support à venir" ou omettre la plateforme

---

## 7. Utilisation

**Obligatoire si l'input est fourni.** (Voir inputs bloquants dans l'action.)

- 2 à 4 cas d'usage principaux, **uniquement parmi ceux fournis par l'utilisateur**
- Un sous-titre `###` par cas, une à deux commandes ou snippet, sortie attendue quand pertinent
- Pas d'exhaustivité

---

## 8. Configuration

**Conditionnel** — inclure si et seulement si l'utilisateur a fourni des variables d'environnement, un fichier de config, ou des flags persistants.

Format recommandé pour les **variables d'environnement** :

| Variable | Défaut | Description |
|---|---|---|

Pour d'autres types de config (fichier de profil, flags persistants) : adapter en conservant 3 colonnes max, factuel, scannable. Pas de prose.

---

## 9. Déploiement

**Conditionnel** — inclure si et seulement si le projet se déploie comme service (serveur, MCP exposé, daemon) **et** que l'utilisateur a fourni des informations de déploiement.

Un paragraphe d'overview + lien vers doc séparée si elle existe réellement.

---

## 10. Contribuer

- 2 à 4 phrases
- Préciser les types de contributions prioritaires à ce stade (bug reports, retours plateforme, PR sur certains domaines)
- Lien vers `CONTRIBUTING.md` **uniquement si l'utilisateur a confirmé qu'il existe**

---

## 11. À propos

**Conditionnel** — inclure si et seulement si l'utilisateur a fourni une motivation du mainteneur. Sinon omettre.

Une seule phrase. Objectif : humaniser, donner le contexte du mainteneur.

---

## 12. Licence

**Obligatoire.**

Format : `{licence} — voir [LICENSE](LICENSE).` où `{licence}` est la licence effective (MIT si non précisé).

---

## Exemple annoté (projet fictif `fmtshift`)

Les chiffres, versions, URLs et plateformes ci-dessous illustrent la **forme** uniquement. Ne pas reproduire les valeurs.

---

# fmtshift

*Convertisseur de fichiers en ligne de commande, pensé pour s'enchaîner dans un pipeline shell plutôt que pour cliquer dans une fenêtre.*

## État du projet

**Statut : 🔬 Alpha.** Utilisable au quotidien pour les conversions courantes. La CLI évolue encore d'une version mineure à l'autre, donc à ne pas scripter de manière dure pour l'instant.

- *Ça marche aujourd'hui :* conversion Markdown ↔ HTML, CSV ↔ JSON, détection automatique du format d'entrée, sortie sur stdout
- *Pas encore :* conversion vers PDF, traitement en streaming pour fichiers > 1 Go, mode watch sur dossier, support Windows complet
- *Prochaine étape :* stabilisation de l'API CLI et ajout du streaming

| Plateforme | État | Note |
|---|---|---|
| Linux | ✅ Testé | Cible principale |
| macOS | 🧰 Beta | Retours bienvenus |
| Windows | 🧪 Expérimental | Build passe, chemins UNC non testés |

## Aperçu

```bash
$ echo '# Hello' | fmtshift --to html
<h1>Hello</h1>
```

## Pourquoi

- **Stdout par défaut** : tout est conçu pour être chaîné avec d'autres outils Unix, pas pour produire un fichier de sortie sauf si demandé
- **Détection plutôt que configuration** : le format d'entrée est deviné depuis le contenu, pas depuis l'extension
- **Un seul binaire statique** : aucune dépendance runtime à installer côté utilisateur
- **Codes de retour POSIX stricts** : utilisable dans des scripts qui réagissent à l'échec

Pertinent si tu fais beaucoup de transformations de fichiers en ligne de commande et que les solutions existantes (pandoc, jq + miller) couvrent ton besoin avec trop de complexité. Probablement pas pertinent si tu cherches une GUI ou si tu as besoin de la richesse de conversion de pandoc.

## Prérequis

- Aucun pour utiliser le binaire pré-compilé
- Go 1.22+ pour build from source

## Démarrage rapide

### Linux / macOS

```bash
curl -sSL https://example.com/fmtshift/install.sh | sh
fmtshift --version
```

### Windows (support expérimental — voir État du projet)

```powershell
iwr -useb https://example.com/fmtshift/install.ps1 | iex
fmtshift --version
```

### Première conversion

```bash
echo '# Hello' | fmtshift --to html
```

Sortie attendue :

```html
<h1>Hello</h1>
```

## Utilisation

### Conversion d'un fichier

```bash
fmtshift document.md --to html > document.html
```

### Pipeline avec détection automatique

```bash
cat data.csv | fmtshift --to json | jq '.[] | select(.active)'
```

Le format d'entrée (CSV) est détecté depuis le contenu, sans avoir à le préciser.

### Mode silencieux pour scripts

```bash
fmtshift input.csv --to json --quiet || echo "conversion failed"
```

## Configuration

| Variable | Défaut | Description |
|---|---|---|
| `FMTSHIFT_NO_COLOR` | `0` | Désactive la coloration des erreurs si `1` |
| `FMTSHIFT_BUFFER` | `64k` | Taille du buffer de lecture |

## Contribuer

Les retours d'expérience sur Windows et les bug reports sur la détection de format sont particulièrement utiles à ce stade. Les nouvelles features sont à discuter en issue avant PR. Voir `CONTRIBUTING.md` pour la procédure complète.

## À propos

Construit par un développeur qui se retrouvait à réécrire les mêmes scripts de conversion sur chaque nouvelle machine.

## Licence

MIT — voir [LICENSE](LICENSE).
