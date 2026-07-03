# 01 - Scan

List all `.md` files in the scope, exclude already-processed files, detect special cases, and load (or create) `mail-config.yaml`.

## Inputs

- `scope` (optional) — sub-branch relative to `Thunderbird/` (e.g. `Internet/Login`). If absent, all of `Thunderbird/`.
- `--reprocess` (flag, optional) — if present, also include files with `processed: true`

## Outputs

- `file_list` — list of absolute paths of all `.md` files in the scope to process
- `config` — content of `mail-config.yaml` (loaded or generated from template)
- `prelim_report` — preliminary report (ATrier/ files, epoch dates)

## Process

1. Determine the target directory:
   - If `scope` provided: `C:/Users/fxgui/Public/Notes/Thunderbird/<scope>/`
   - Otherwise: `C:/Users/fxgui/Public/Notes/Thunderbird/`

2. **Delegate to a sub-agent (`model: haiku`)** with the mission to:
   - Recursively list all `.md` files in the target directory
   - Exclude files in `.archive/`
   - Exclude files in `_drafts/` (reply working area — never triaged)
   - Exclude `mail-sessions.log.md`
   - For each file, read only the `processed:` line of the frontmatter
   - If `processed: true` AND `--reprocess` flag absent → exclude from `file_list`
   - Detect files in any `ATrier/` subfolder → flag them in `prelim_report`
   - Detect files with `date: 1970-01-01` or no date → flag them in `prelim_report`
   - Return `file_list` + `prelim_report` (paths only, no content)

   ⚠️ The sub-agent does not read the body of the emails.

3. Display the `prelim_report` if non-empty:
   ```
   ⚠️ Rapport préliminaire
   - Fichiers dans ATrier/ : N (forcés en classify)
   - Fichiers avec date epoch (1970-01-01) : N — vérifier manuellement
   ```

4. Check the existence of `C:/Users/fxgui/Public/Notes/Thunderbird/mail-config.yaml`:
   - **If absent**: display the template below and ask for confirmation before continuing.
     Once confirmed, create the file from the template.
   - **If present**: load and parse the YAML.

5. Return `file_list`, `config` and `prelim_report` for handoff to `02-analyze`.

## mail-config.yaml template

If absent, generate:
```yaml
# Emails et branches à conserver intacts (ne pas résumer, ne pas fusionner)
preserve:
  senders: []        # ex: - domain: gmail.com
  branches: []       # ex: - Banque/

# Emails et branches à supprimer (spam, notifications sans valeur)
suppress:
  senders: []        # ex: - domain: klaviyo.com
  branches: []       # ex: - Publicités/Spam/

# Exceptions aux règles preserve/suppress
exceptions: []       # ex: - address: foo@bar.com\n  action: preserve

# Suppression automatique par âge (days: 0 = toujours supprimer)
prune: []
# ex:
#   - branch: Publicités/Spam/
#     days: 0
#   - sender:
#       domain: jeveuxtravailler.com
#     days: 7

# Fusionner les threads par domaine racine plutôt que par adresse exacte
merge_by_domain: false

# Marques à surveiller pour la détection phishing (complète la liste par défaut)
phishing_brands: []
```

## Test

- `file_list` contains no files with `processed: true` (unless `--reprocess`).
- `file_list` contains no files in `.archive/`, `_drafts/`, nor `mail-sessions.log.md`.
- `prelim_report` lists the ATrier/ and epoch files if present.
- `config` contains the keys `preserve`, `suppress`, `exceptions`, and optionally `prune`, `merge_by_domain`, `phishing_brands`.
- No email content appeared in the main chat.
