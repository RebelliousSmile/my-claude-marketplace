# 01 - campaign

Crée une campagne si elle n'existe pas encore (bootstrap du `config.yaml` + structure) **et** amorce sa couche de préparation MJ (la matière MJ).

## Inputs

- `campagne` (requis) — nom de la campagne. Demander si absent ; lister les dossiers de `JDR/<jeu>/campagnes/` contenant un `config.yaml`.
- `univers` (optionnel) — slug de l'univers ; à défaut, déduire de l'unique univers présent ou demander (lister `JDR/<jeu>/univers/`).
- `pj` (optionnel) — PJ canonique à rattacher (lister `JDR/<jeu>/pjs/`).

## Process

1. **Vérifier / amorcer le `config.yaml`** dans `JDR/<jeu>/campagnes/<campagne>/`.
   - **S'il existe** : le lire et passer à l'étape 2.
   - **S'il manque : amorcer la campagne** (bootstrap minimal — ne PAS dérouler un long questionnaire ; ne demander que l'indispensable manquant : l'univers, et le PJ à rattacher). *(Auparavant délégué à `/hermes:solo-mc setup` ; `rpg` s'en charge désormais. Si `hermes:solo-mc` est installé, il pourra affiner/gérer le `config.yaml` ensuite — mais il n'est pas requis pour démarrer.)*
     1. Créer le dossier `JDR/<jeu>/campagnes/<slug-campagne>/` avec la structure `sessions/`, `pj/`, `scenarios/`, `prep/`.
     2. Écrire un `config.yaml` **minimal jouable** :
        ```yaml
        jeu: <jeu>
        univers: <univers-slug>
        type: campaign
        lore:
          canon: univers/<univers>/canon/
          mj: univers/<univers>/mj/
        systeme:
          canon: systeme/canon/
          mj: systeme/mj/
        pjs:
          - <pj-slug>
        pj_canonique: pjs/<pj-slug>/
        pj_campagne: campagnes/<slug-campagne>/pj/<pj-slug>.md
        compagnons:
          roster: pjs/<pj-slug>/compagnons/_roster.yaml   # si le PJ a une team (skill pc) ; sinon omettre
        # ── réglage de jeu (ton, approche, difficulté, rythme, chaos, jauges) : VOLONTAIREMENT ABSENT ──
        # Domaine de solo-mc (son setup). rpg n'écrit QUE l'identité/wiring ci-dessus.
        ```
     3. **Ne pas écrire le réglage de jeu** (`ton`, `approche`, `difficulte`, `rythme`, chaos, profils de sous-système) : il appartient à **`solo-mc`** et sera renseigné par son setup au moment de jouer. `rpg` se limite à l'**identité/wiring** — juste de quoi ancrer la prep MJ. Ne rien inventer.
     4. Si un PJ est rattaché mais que `pj/<pj-slug>.md` (instance de campagne) n'existe pas, le créer en stub qui `[[lie]]` le PJ canonique (`pjs/<pj-slug>/`) — l'instance détaillée est remplie au lancement du jeu.
2. **Lire le contexte** : `config.yaml` (univers, ton, rythme, difficulté, chaos, profondeur PNJ/lieux) et, si un PJ est rattaché, son `JDR/<jeu>/pjs/<pj>/intention.md` (thèmes, ligne rouge, question viscérale).
3. **Rattacher l'univers** : depuis `config.yaml › univers`, cibler `JDR/<jeu>/univers/<univers>/`. Si l'arborescence n'existe pas, créer **deux sous-arbres thématiques** `canon/` (lore officiel) et `mj/` (création MJ), chacun avec `terminologie.md`, `factions.md`, `personnages.md`, `histoire.md`, `geographie.md`. S'il existe des sources brutes canoniques, proposer `/rpg-writer:lore-extract` pour les consigner **dans `canon/`** ; le contenu créé par le MJ ira dans `mj/` (via `npc`, `faction`, `scenario`).
4. **Rédiger `JDR/<jeu>/campagnes/<campagne>/synopsis.md`** : prémisse, thèmes (alignés sur l'intention du PJ), ton, enjeux centraux, vérités cachées, question dramatique de campagne.
5. **Créer la structure de prep de campagne** si absente : `scenarios/`, `prep/`, `fronts.md` (horloges actives), plus un `index.md` qui recense scénarios et fronts en cours et lie l'univers. *(Les PNJ, factions et lieux durables vivent dans l'univers, pas ici.)*
6. **Proposer 2–3 fronts de départ** (horloges) à détailler ensuite via `faction`.

## Outputs

Si la campagne n'existait pas : `JDR/<jeu>/campagnes/<campagne>/config.yaml` + structure (`sessions/`, `pj/`, `scenarios/`, `prep/`). Dans tous les cas : `synopsis.md` + structure de prep (`fronts.md`, `index.md`) + l'arborescence univers `JDR/<jeu>/univers/<univers>/{canon,mj}/` (créée ou identifiée). Lister les fronts proposés et les `[À compléter]`.

## Test

`config.yaml` existe (créé ou préexistant) avec au minimum `jeu`, `univers`, `type`, `pjs` ; `synopsis.md` existe et ses thèmes renvoient à l'`intention.md` du PJ (si un PJ existe) ; la structure de prep de campagne est créée ; l'univers est rattaché avec ses deux sous-arbres `canon/` et `mj/` ; l'`index.md` lie l'univers et recense les éléments présents.
