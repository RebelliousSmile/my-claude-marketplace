#!/usr/bin/env python3
"""
Script pour migrer les SKILL.md de my-marketplace vers le format Vibe complet.
Ajoute les métadonnées manquantes : author, version, permissions, tags, vibe_version.
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Optional

# Chemin de la marketplace
MARKETPLACE_ROOT = Path(r"C:\Users\fxgui\Documents\LLM\Marketplace\plugins")

# Permissions par défaut selon le type de skill
# À adapter après analyse
DEFAULT_PERMISSIONS = {
    # Design skills
    "design": ["files", "bash"],
    "define": ["files", "bash"],
    "destructure": ["files"],
    "detail": ["files"],
    "adjust": ["files", "bash"],
    "enforce": ["files", "bash"],
    "diffuse": ["files", "bash"],
    "harness": ["files", "bash"],
    
    # Overcode skills
    "alias": ["bash", "files"],
    "research": ["network", "bash"],
    "harvest": ["files", "bash"],
    "extract-pdf": ["files", "bash", "network"],
    "filler": ["files", "bash"],
    "mail": ["bash"],
    "project": ["files", "bash"],
    "tree": ["bash"],
    "status": ["bash"],
    "changelog": ["bash"],
    "control": ["bash"],
    "data-optimize": ["bash"],
    "decompose": ["bash"],
    "foresee": ["bash"],
    "readme": ["files", "bash"],
    "reconcile-normative": ["files", "bash"],
    "behave": ["bash"],
    "ap-optimize": ["bash"],
    "seo-optimize": ["bash", "network"],
    "web-optimize": ["bash", "network"],
    "taste": ["bash"],
    
    # SC skills (CSS, JS, PHP, Python, Rust)
    "audit": ["bash", "files"],
    "improve": ["bash", "files"],
    "legacy": ["bash", "files"],
    "sniff": ["bash", "files"],
    "teach": ["bash", "files"],
    "design-bridge": ["bash", "files"],
    "setup": ["bash", "files"],
    "builder-coverage": ["bash"],
    "bruno": ["bash"],
    "log-analysis": ["bash", "files"],
    "wp-blocks": ["bash", "files"],
}

# Tags par plugin
PLUGIN_TAGS = {
    "design": ["design-system", "ui", "contract"],
    "overcode": ["workflow", "automation", "productivity"],
    "obs": ["obsidian", "notes", "documentation"],
    "sc-css": ["css", "frontend", "audit"],
    "sc-js": ["javascript", "frontend", "audit"],
    "sc-php": ["php", "backend", "audit"],
    "sc-python": ["python", "backend", "audit"],
    "sc-rust": ["rust", "backend", "audit"],
    "web-tiers": ["saas", "third-party", "integration"],
}

# Tags supplémentaires par skill name
SKILL_EXTRA_TAGS = {
    "adjust": ["freeze", "arbitrage", "migration"],
    "define": ["extraction", "tokens", "components"],
    "destructure": ["challenge", "critique"],
    "enforce": ["lint", "validation", "gates"],
    "diffuse": ["export", "generation", "elements"],
    "harness": ["testing", "fixtures"],
    "extract-pdf": ["pdf", "ingestion", "parsing"],
    "filler": ["organization", "sorting", "synthesis"],
    "research": ["documentation", "analysis"],
    "harvest": ["collection", "data-mining"],
    "alias": ["shortcuts", "workflows"],
    "seo-optimize": ["seo", "optimization"],
    "web-optimize": ["performance", "web"],
}

def extract_plugin_metadata(plugin_dir: Path) -> Optional[Dict]:
    """Extrait les métadonnées du plugin depuis .claude-plugin/plugin.json ou .codex-plugin/plugin.json"""
    
    # Essayer .claude-plugin/plugin.json
    claude_plugin_file = plugin_dir / ".claude-plugin" / "plugin.json"
    if claude_plugin_file.exists():
        with open(claude_plugin_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return {
            "version": data.get("version", "1.0.0"),
            "author": data.get("author", {}).get("name", "fxgui"),
            "description": data.get("description", ""),
        }
    
    # Essayer .codex-plugin/plugin.json
    codex_plugin_file = plugin_dir / ".codex-plugin" / "plugin.json"
    if codex_plugin_file.exists():
        with open(codex_plugin_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return {
            "version": data.get("version", "1.0.0"),
            "author": data.get("author", {}).get("name", "fxgui"),
            "description": data.get("description", ""),
        }
    
    return None

def get_permissions_for_skill(plugin_name: str, skill_name: str) -> List[str]:
    """Détermine les permissions pour une skill donnée"""
    # Vérifier si on a une entrée spécifique
    if skill_name in DEFAULT_PERMISSIONS:
        return DEFAULT_PERMISSIONS[skill_name]
    
    # Sinon, utiliser les permissions par défaut du plugin
    if plugin_name in DEFAULT_PERMISSIONS:
        return DEFAULT_PERMISSIONS[plugin_name]
    
    # Fallback
    return ["bash", "files"]

def get_tags_for_skill(plugin_name: str, skill_name: str) -> List[str]:
    """Détermine les tags pour une skill donnée"""
    tags = []
    
    # Tags du plugin
    if plugin_name in PLUGIN_TAGS:
        tags.extend(PLUGIN_TAGS[plugin_name])
    
    # Tags spécifiques à la skill
    if skill_name in SKILL_EXTRA_TAGS:
        tags.extend(SKILL_EXTRA_TAGS[skill_name])
    
    # Supprimer les doublons
    return list(set(tags))

def update_skill_md(skill_file: Path, plugin_metadata: Dict) -> bool:
    """Met à jour un fichier SKILL.md avec les métadonnées manquantes"""
    
    with open(skill_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extraire le nom de la skill depuis le frontmatter
    name_match = re.search(r'^name:\s*(.+)$', content, re.MULTILINE)
    if not name_match:
        print(f"⚠️  Impossible de trouver le nom dans {skill_file}")
        return False
    
    skill_name = name_match.group(1).strip()
    
    # Extraire le plugin name depuis le chemin
    # Chemin : .../plugins/{plugin}/skills/{skill}/SKILL.md
    parts = skill_file.parts
    plugin_idx = parts.index("plugins") + 1
    plugin_name = parts[plugin_idx]
    
    # Déterminer les métadonnées
    author = plugin_metadata.get("author", "fxgui")
    version = plugin_metadata.get("version", "1.0.0")
    permissions = get_permissions_for_skill(plugin_name, skill_name)
    tags = get_tags_for_skill(plugin_name, skill_name)
    
    # Construire le nouveau frontmatter
    old_frontmatter_pattern = r'^---\nname:\s*' + re.escape(skill_name) + r'\ndescription:\s*(.+?)\n---'
    
    # Trouver le frontmatter actuel
    frontmatter_match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not frontmatter_match:
        print(f"WARN Impossible de trouver le frontmatter dans {skill_file}")
        return False
    
    old_frontmatter = frontmatter_match.group(0)
    old_content = frontmatter_match.group(1)
    
    # Verifier si les metadonnees sont deja presentes
    if "author:" in old_content and "version:" in old_content:
        print(f"OK {skill_file} deja a jour")
        return False
    
    # Extraire la description originale de la skill
    desc_match = re.search(r'^description:\s*(.+)$', old_content, re.MULTILINE)
    original_description = desc_match.group(1).strip() if desc_match else ""
    
    # Construire le nouveau frontmatter
    permissions_str = "  - " + "\n  - ".join(permissions) if permissions else ""
    new_frontmatter = f"""---
name: {skill_name}
description: {original_description}
author: {author}
version: {version}
vibe_version: ">=1.0.0"
permissions:
{permissions_str}
"""
    
    if tags:
        new_frontmatter += "tags:\n"
        for tag in tags:
            new_frontmatter += f"  - {tag}\n"
    
    new_frontmatter += "---"
    
    # Remplacer le frontmatter
    new_content = content.replace(old_frontmatter, new_frontmatter)
    
    # Écrire le nouveau contenu
    with open(skill_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"OK Mis a jour: {skill_file}")
    return True

def main():
    """Point d'entrée principal"""
    
    print("Detection des plugins et de leurs metadonnees...")
    
    # Trouver tous les plugins
    plugins = []
    for plugin_dir in MARKETPLACE_ROOT.iterdir():
        if plugin_dir.is_dir():
            plugin_json = plugin_dir / ".claude-plugin" / "plugin.json"
            codex_json = plugin_dir / ".codex-plugin" / "plugin.json"
            if plugin_json.exists() or codex_json.exists():
                metadata = extract_plugin_metadata(plugin_dir)
                if metadata:
                    plugins.append((plugin_dir, metadata))
                    print(f"  OK {plugin_dir.name} (v{metadata['version']}) par {metadata['author']}")
    
    print(f"\nTrouve {len(plugins)} plugins avec metadonnees")
    
    # Trouver toutes les SKILL.md
    skill_files = []
    for plugin_dir, metadata in plugins:
        skills_dir = plugin_dir / "skills"
        if skills_dir.exists():
            for skill_dir in skills_dir.iterdir():
                if skill_dir.is_dir():
                    skill_md = skill_dir / "SKILL.md"
                    if skill_md.exists():
                        skill_files.append((skill_md, metadata))
    
    # Exclure les faux positifs (comme ceux dans .venv)
    skill_files = [(sf, md) for sf, md in skill_files if "site-packages" not in str(sf) and ".venv" not in str(sf)]
    
    print(f"\nTrouve {len(skill_files)} fichiers SKILL.md a traiter")
    
    # Mettre à jour chaque SKILL.md
    updated_count = 0
    for skill_file, metadata in skill_files:
        if update_skill_md(skill_file, metadata):
            updated_count += 1
    
    print(f"\n{updated_count} fichiers SKILL.md mis a jour")

if __name__ == "__main__":
    main()
