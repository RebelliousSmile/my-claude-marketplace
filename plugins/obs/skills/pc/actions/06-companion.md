# 06 - Companion

Create / fill / show a companion sheet (autonomous or by reference); register it in the PJ-level team roster.

## Inputs

- `pj` (resolved) - the active PJ (argument or `R/.current-session`).
- `companion name` (required for create) - slugified for the filename.
- `mode` (inferred from intent) - **create**, **fill/update**, or **show**.
- `source text` (for fill/update) - pasted content to distribute.

## Outputs

- A wrapper companion sheet `R/_pjs/<pj>/compagnons/<slug>.md` (autonomous *Minimal playable* shape, or *Reference* shape pointing to a canonical sheet via `ref:`).
- An entry appended to the **PJ-level roster** `R/_pjs/<pj>/compagnons/_roster.yaml`.
- If a campaign is active, its `config.yaml` references this roster (or copies the `actif: true` entries).

## Process

Manages the PJ's **companions** — the recurring team played **by substitution** to recreate a tabletop feel (not to run 4–5 full PCs). Infer the mode from intent: **create**, **fill/update**, or **show**.

Resolution (always first):
1. Determine the active PJ (argument or `R/.current-session`) and the active campaign.
2. List existing `R/_pjs/<pj>/compagnons/` before creating — never overwrite a sheet without explicit confirmation.

### create
1. Ask the companion name if not supplied; slugify it for the filename.
2. Choose the sheet mode:
   - **by reference** (recommended if the companion already has a complete sheet elsewhere — pre-gen, mue, univers NPC) — the wrapper sheet points to the canonical source via `ref:` and duplicates no mechanics (*Reference* shape below).
   - **autonomous** — *Minimal playable* sheet written on the spot (shape below).
3. Create `R/_pjs/<pj>/compagnons/<slug>.md` with the chosen structure.
4. Register the companion in the **PJ-level roster** `R/_pjs/<pj>/compagnons/_roster.yaml` — append the entry, never duplicate one (create the file if it does not exist):

```yaml
pj: <pj-slug>
compagnons:
  - nom: <Nom>
    role: <rôle dans la team>
    fiche: _pjs/<pj>/compagnons/<slug>.md
    ref: _univers/<univers>/pretires/<x>.md   # mode par référence ; omettre si autonome
    actif: true
```

5. **If a campaign is active**, point its `config.yaml` at this roster (`compagnons: { roster: _pjs/<pj>/compagnons/_roster.yaml }`) or copy the `actif: true` entries into it. **Without a campaign**, the PJ-level roster is enough (the team is definable from PJ creation onward).

### fill / update
Distribute pasted text into the companion sheet. Preserve existing content — complete, never overwrite. Mark gaps `[To complete]`. Do not invent content absent from the source.

### show
Display a companion sheet; with no name, list the active team from the campaign roster (`config.yaml › compagnons:`).

## Companion sheet templates

### Companion sheet — shape (Minimal playable, ~1 page)

```markdown
# <Nom du compagnon>

- **Rôle dans la team** : <éclaireur, soutien, mentor…>
- **Lien au PJ** : <relation + historique en une ligne>
- **Voix / personnalité** : <2–3 tics de langage ou de comportement>

## Mécanique (substitution)
- Système : hérité de la campagne (`config.yaml › system`)
- 3 à 5 prises clés : stats / tags / moves saillants, suffisants pour résoudre ses actions selon les règles actives (système de jeu) — jamais de mécanique inventée

## État courant
- Statuts, ressources, blessures, position — tenu à jour au fil du jeu
```

### Companion sheet — shape (Reference, ~½ page)

When the companion already has a complete sheet elsewhere (pre-gen, mue, univers NPC), do not duplicate its mechanics: point to the source.

```markdown
# <Nom du compagnon>

- **Mue / fiche source** : [[<chemin relatif vers la fiche canonique>]]  ← mécaniques complètes ici
- **Rôle dans la team** : <éclaireur, soutien, mentor, muscle…>
- **Lien au PJ** : <relation + ascendants de départ en une ligne>
- **Voix / personnalité** : <2–3 tics>

## Prises clés (rappel)
- 3 à 5 stats / tags / moves saillants recopiés pour le jeu rapide — la référence fait foi.

## État courant
- Statuts, ressources, blessures, position — tenu à jour au fil du jeu.
```

The roster's `ref:` (`_roster.yaml`) points to the same canonical sheet.

Wrapper sheets live under `_pjs/<pj>/compagnons/`; the **PJ-level roster** (`_roster.yaml`) lists them, and a campaign's `config.yaml` (if one exists) only **references** this roster (the way a campaign instance references the canonical PJ). Read by `obs:solo-mc` in play for substitution.

## Test

After a create, `R/_pjs/<pj>/compagnons/<slug>.md` exists in the chosen shape and `R/_pjs/<pj>/compagnons/_roster.yaml` contains exactly one matching entry (with `ref:` only in by-reference mode).
