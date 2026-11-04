#!/usr/bin/env bash
# watch.sh — sonde passive pour le commentateur `control`.
#
# Interroge un dépôt (et, en option, le transcript JSONL de la session observée)
# toutes les N secondes et n'écrit UNE ligne sur stdout que lorsqu'un tick a vu
# quelque chose changer. Chaque ligne est un lot : sous `Monitor`, un lot = une
# notification. Le script n'écrit jamais dans le dépôt observé.
#
# Usage :
#   watch.sh [--root DIR] [--interval 10] [--transcript FILE] [--idle 300]
#            [--state DIR] [--once] [--reset]
#
#   --root        dépôt observé (défaut : répertoire courant)
#   --interval    secondes entre deux ticks (défaut : 10)
#   --transcript  JSONL de la session observée (optionnel)
#   --idle        émet une ligne `idle` après N secondes sans changement (0 = jamais)
#   --state       dossier d'état, conservé entre deux réarmements du Monitor
#   --once        un seul tick puis sortie (tests, recap)
#   --reset       efface l'état : le prochain tick repose une ligne de base
#
# Format des lignes (une par tick non vide) :
#   [HH:MM:SS] baseline | <n> fichier(s) déjà modifié(s) | HEAD <sha>
#   [HH:MM:SS] batch #<k> | files: <statut chemin>, … | commits: <sha sujet>; … | transcript: +<n> lines <a>-<b> (<Outil>×<n> … errors×<n>)
#   [HH:MM:SS] idle <n>s
#
# Dossier d'état : snapshot, head (dernier tick) ; baseline_snapshot, baseline_head
# (jamais réécrits — ce qui était déjà là au départ) ; tlines, tlines_prev (offsets
# du transcript : les lignes <a>-<b> du dernier lot) ; batch, last_change, idle_sent.

set -u

root="$PWD"; interval=10; transcript=""; idle=300; state=""; once=0; reset=0
while [ $# -gt 0 ]; do
  case "$1" in
    --root) root="$2"; shift 2 ;;
    --interval) interval="$2"; shift 2 ;;
    --transcript) transcript="$2"; shift 2 ;;
    --idle) idle="$2"; shift 2 ;;
    --state) state="$2"; shift 2 ;;
    --once) once=1; shift ;;
    --reset) reset=1; shift ;;
    -h|--help) sed -n '2,29p' "$0"; exit 0 ;;
    *) echo "watch.sh: option inconnue $1" >&2; exit 2 ;;
  esac
done

root="$(cd "$root" 2>/dev/null && pwd)" || { echo "watch.sh: --root introuvable" >&2; exit 2; }
if [ -z "$state" ]; then
  key="$(printf '%s' "$root" | cksum | cut -d' ' -f1)"
  state="${TMPDIR:-/tmp}/overcode-control-$key"
fi
[ "$reset" = 1 ] && rm -rf "$state"
mkdir -p "$state"

is_git=0
git -C "$root" rev-parse --is-inside-work-tree >/dev/null 2>&1 && is_git=1

# Empreinte de l'arbre de travail : "statut<TAB>chemin<TAB>taille:mtime" par fichier modifié.
snapshot() {
  if [ "$is_git" = 1 ]; then
    git -C "$root" status --porcelain=v1 --untracked-files=all 2>/dev/null |
    while IFS= read -r line; do
      st="${line:0:2}"; p="${line:3}"; p="${p##* -> }"; p="${p%\"}"; p="${p#\"}"
      sig="$(stat -c '%s:%Y' "$root/$p" 2>/dev/null || echo gone)"
      printf '%s\t%s\t%s\n' "$(echo "$st" | tr -d ' ')" "$p" "$sig"
    done | LC_ALL=C sort
  else
    find "$root" -type f -not -path '*/.git/*' -not -path '*/node_modules/*' \
      -printf '~\t%P\t%s:%T@\n' 2>/dev/null | LC_ALL=C sort
  fi
}

head_sha() { [ "$is_git" = 1 ] && git -C "$root" rev-parse --short HEAD 2>/dev/null || echo "-"; }

tool_names() {
  if command -v jq >/dev/null 2>&1; then
    jq -r 'select(.type=="assistant") | .message.content[]? | select(.type=="tool_use") | .name' 2>/dev/null
  else
    grep -oE '"type":"tool_use","id":"[^"]*","name":"[^"]*"' | sed -E 's/.*"name":"([^"]*)"/\1/'
  fi
}

# Résultats d'outils en erreur (`tool_result` avec `is_error: true`).
tool_errors() {
  if command -v jq >/dev/null 2>&1; then
    jq -r 'select(.type=="user") | .message.content[]? | select(.type=="tool_result" and .is_error==true) | "e"' 2>/dev/null | grep -c . || true
  else
    grep -oE '"is_error": ?true' | grep -c . || true
  fi
}

ts() { date +%H:%M:%S; }

tick() {
  local now cur prev head prev_head files commits tr="" changed=0
  now="$(date +%s)"
  cur="$(snapshot)"; head="$(head_sha)"

  if [ ! -f "$state/snapshot" ]; then
    printf '%s\n' "$cur" > "$state/snapshot"; echo "$head" > "$state/head"
    printf '%s\n' "$cur" > "$state/baseline_snapshot"
    echo "$head" > "$state/baseline_head"; echo "$now" > "$state/last_change"
    echo 0 > "$state/batch"
    if [ -n "$transcript" ] && [ -f "$transcript" ]; then
      wc -l < "$transcript" | tr -d ' ' > "$state/tlines"; cp "$state/tlines" "$state/tlines_prev"
    fi
    n="$(printf '%s' "$cur" | grep -c . || true)"
    echo "[$(ts)] baseline | ${n} fichier(s) déjà modifié(s) | HEAD ${head}"
    return
  fi

  prev="$(cat "$state/snapshot")"; prev_head="$(cat "$state/head")"

  # Fichiers apparus, modifiés ou disparus depuis le tick précédent.
  files="$(
    { comm -13 <(printf '%s\n' "$prev") <(printf '%s\n' "$cur") | cut -f1,2
      comm -23 <(printf '%s\n' "$prev" | cut -f2 | LC_ALL=C sort -u) \
               <(printf '%s\n' "$cur" | cut -f2 | LC_ALL=C sort -u) | sed 's/^/clean\t/'
    } | grep -v '^\s*$' | awk -F'\t' '$2 != "" && !seen[$2]++ { printf "%s%s %s", (n++ ? ", " : ""), $1, $2 }'
  )"

  commits=""
  if [ "$head" != "$prev_head" ] && [ "$is_git" = 1 ]; then
    commits="$(git -C "$root" log --format='%h %s' "${prev_head}..${head}" 2>/dev/null | head -n 10 | paste -sd ';' - | sed 's/;/; /g')"
    [ -z "$commits" ] && commits="HEAD ${prev_head} → ${head} (réécriture d'historique ?)"
  fi

  if [ -n "$transcript" ] && [ -f "$transcript" ]; then
    local old new
    old="$(cat "$state/tlines" 2>/dev/null || echo 0)"; new="$(wc -l < "$transcript" | tr -d ' ')"
    [ "$new" -lt "$old" ] && old=0
    if [ "$new" -gt "$old" ]; then
      local tools
      tools="$(sed -n "$((old + 1)),${new}p" "$transcript" | tool_names | sort | uniq -c | sort -rn |
               awk '{ printf "%s%s×%s", (n++ ? " " : ""), $2, $1 }')"
      local errs
      errs="$(sed -n "$((old + 1)),${new}p" "$transcript" | tool_errors)"
      [ "${errs:-0}" -gt 0 ] && tools="${tools:+$tools }errors×${errs}"
      tr="+$((new - old)) lines $((old + 1))-${new}${tools:+ ($tools)}"
    fi
    echo "$old" > "$state/tlines_prev"; echo "$new" > "$state/tlines"
  fi

  printf '%s\n' "$cur" > "$state/snapshot"; echo "$head" > "$state/head"

  if [ -n "$files" ] || [ -n "$commits" ] || [ -n "$tr" ]; then changed=1; fi
  if [ "$changed" = 1 ]; then
    local k; k=$(( $(cat "$state/batch") + 1 )); echo "$k" > "$state/batch"
    echo "$now" > "$state/last_change"; rm -f "$state/idle_sent"
    local out="[$(ts)] batch #${k}"
    [ -n "$files" ] && out="$out | files: $files"
    [ -n "$commits" ] && out="$out | commits: $commits"
    [ -n "$tr" ] && out="$out | transcript: $tr"
    echo "$out"
  elif [ "$idle" -gt 0 ] && [ ! -f "$state/idle_sent" ]; then
    local quiet=$(( now - $(cat "$state/last_change") ))
    if [ "$quiet" -ge "$idle" ]; then echo "[$(ts)] idle ${quiet}s"; touch "$state/idle_sent"; fi
  fi
}

if [ "$once" = 1 ]; then tick; exit 0; fi
while true; do
  tick || true
  sleep "$interval"
done
