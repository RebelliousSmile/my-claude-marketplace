#!/usr/bin/env bash
# Deploy the solo-mc skill to Hermes Agent.
#
# This plugin is the *source* for the Hermes Agent skill. Hermes loads skills from
# ~/.hermes/skills/<category>/<name>/SKILL.md — NOT from the Claude Code marketplace.
# Run this on the machine where Hermes Agent runs (the Linux server).
#
#   ./deploy-to-hermes.sh
#
# Idempotent (mirrors the source, removing stale files). Override the skills root
# with HERMES_SKILLS_DIR if your install differs.
set -euo pipefail

SRC="$(cd "$(dirname "$0")/skills/solo-mc" && pwd)"
DEST="${HERMES_SKILLS_DIR:-$HOME/.hermes/skills}/rpg/solo-mc"

if [ ! -f "$SRC/SKILL.md" ]; then
  echo "error: $SRC/SKILL.md not found" >&2
  exit 1
fi

mkdir -p "$DEST"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete --exclude '.git' "$SRC"/ "$DEST"/
else
  rm -rf "${DEST:?}"/* && cp -r "$SRC"/. "$DEST"/
fi

echo "Deployed solo-mc → $DEST"
echo "  SKILL.md (Hermes agentskills.io format, single-agent)"
echo "  references/: oracle.md (decision engine), narrateur.md (GM voice), response-templates.md"
echo "  actions/ (12 detailed procedures), evals/ (functional tests + oracle-data-checks.py)"
echo
echo "Reminder: this machine needs ~/.jdr.yaml with 'vault:' (e.g. ~/JDR) and 'git:'."
