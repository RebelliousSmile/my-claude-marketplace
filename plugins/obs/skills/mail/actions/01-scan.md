# 01 - Scan

Lister tous les fichiers `.md` du périmètre, exclure les fichiers déjà traités, détecter les cas particuliers, et charger (ou créer) `mail-config.yaml`.

## Inputs

- `scope` (optional) — sous-branche relative à `Thunderbird/` (ex: `Internet/Login`). Si absent, tout `Thunderbird/`.
- `--reprocess` (flag, optional) — si présent, inclure aussi les fichiers avec `processed: true`

## Outputs

- `file_list` — liste des chemins absolus de tous les `.md` du périmètre à traiter
- `config` — contenu de `mail-config.yaml` (chargé ou généré depuis template)
- `prelim_report` — rapport préliminaire (fichiers ATrier/, dates epoch)

## Process

1. Déterminer le répertoire cible :
   - Si `scope` fourni : `C:/Users/fxgui/Public/Notes/Thunderbird/<scope>/`
   - Sinon : `C:/Users/fxgui/Public/Notes/Thunderbird/`

2. **Déléguer à un sous-agent (`model: haiku`)** avec pour mission :
   - Lister récursivement tous les fichiers `.md` dans le répertoire cible
   - Exclure les fichiers dans `.archive/`
   - Exclure `mail-sessions.log.md`
   - Pour chaque fichier, lire uniquement la ligne `processed:` du frontmatter
   - Si `processed: true` ET flag `--reprocess` absent → exclure de `file_list`
   - Détecter les fichiers dans tout sous-dossier `ATrier/` → les signaler dans `prelim_report`
   - Détecter les fichiers avec `date: 1970-01-01` ou date absente → les signaler dans `prelim_report`
   - Retourner `file_list` + `prelim_report` (chemins seulement, pas de contenu)

   ⚠️ Le sous-agent ne lit pas le corps des emails.

3. Afficher le `prelim_report` si non vide :
   ```
   ⚠️ Rapport préliminaire
   - Fichiers dans ATrier/ : N (forcés en classify)
   - Fichiers avec date epoch (1970-01-01) : N — vérifier manuellement
   ```

4. Vérifier l'existence de `C:/Users/fxgui/Public/Notes/Thunderbird/mail-config.yaml` :
   - **Si absent** : afficher le template ci-dessous et demander confirmation avant de continuer.
     Une fois confirmé, créer le fichier depuis le template.
   - **Si présent** : charger et parser le YAML.

5. Retourner `file_list`, `config` et `prelim_report` pour transmission à `02-analyze`.

## Template mail-config.yaml

Si absent, générer :
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

- `file_list` ne contient pas de fichiers avec `processed: true` (sauf si `--reprocess`).
- `file_list` ne contient pas de fichiers dans `.archive/` ni `mail-sessions.log.md`.
- `prelim_report` liste les fichiers ATrier/ et epoch si présents.
- `config` contient les clés `preserve`, `suppress`, `exceptions`, et optionnellement `prune`, `merge_by_domain`, `phishing_brands`.
- Aucun contenu d'email n'est apparu dans le chat principal.
