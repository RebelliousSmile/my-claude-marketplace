# 01 - Scan

Lister tous les fichiers `.md` du périmètre et charger (ou créer) `mail-config.yaml`.

## Inputs

- `scope` (optional) — sous-branche relative à `Thunderbird/` (ex: `Internet/Login`). Si absent, tout `Thunderbird/`.

## Outputs

- `file_list` — liste des chemins absolus de tous les `.md` du périmètre
- `config` — contenu de `mail-config.yaml` (chargé ou généré depuis template)

## Process

1. Déterminer le répertoire cible :
   - Si `scope` fourni : `C:/Users/fxgui/Public/Notes/Thunderbird/<scope>/`
   - Sinon : `C:/Users/fxgui/Public/Notes/Thunderbird/`

2. **Déléguer à un sous-agent** (`Agent` tool) avec pour seule mission :
   - Lister récursivement tous les fichiers `.md` dans le répertoire cible
   - Exclure les fichiers dans `.archive/`
   - Retourner la liste des chemins absolus uniquement (pas de contenu)
   
   ⚠️ Le sous-agent ne lit pas le contenu des fichiers — chemins seulement.

3. Vérifier l'existence de `C:/Users/fxgui/Public/Notes/Thunderbird/mail-config.yaml` :
   - **Si absent** : afficher le template ci-dessous et demander confirmation avant de continuer.
     Une fois confirmé, créer le fichier depuis le template.
   - **Si présent** : charger et parser le YAML.

4. Retourner `file_list` et `config` pour transmission à `02-analyze`.

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
```

## Test

- `file_list` contient au moins un élément.
- `config` est un objet YAML parsé avec les clés `preserve`, `suppress`, `exceptions`.
- Aucun contenu d'email n'est apparu dans le chat principal.
