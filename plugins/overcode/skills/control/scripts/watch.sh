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
# Variantes : un renommage s'écrit "R ancien -> nouveau" ; "outside×n: <chemin>" compte les
# fichiers visés par le transcript hors de --root (premier chemin cité, jq requis) ; un dossier
# de plus de 10 entrées se résume en "<statut> <dossier>/ (<n> entries)" ;
# `commits:` peut porter "branch: <a> → <b> (HEAD …)", "HEAD a → b (retour en arrière …)" ou
# "HEAD a → b (réécriture d'historique ?)".
#
# Dossier d'état : snapshot, head (dernier tick) ; baseline_snapshot, baseline_head
# (jamais réécrits — ce qui était déjà là au départ) ; branch ; tlines, tlines_prev (offsets
# du transcript : les lignes <a>-<b> du dernier lot) ; batch, last_change, idle_sent.

set -u
# `git status` rafraîchit l'index et prend `.git/index.lock` : sans ceci, la sonde peut faire
# échouer un `git commit` de la session observée qui tombe sur le même instant.
export GIT_OPTIONAL_LOCKS=0

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
    -h|--help) sed -n '2,33p' "$0"; exit 0 ;;
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
      st="${line:0:2}"; p="${line:3}"; from=""
      case "$p" in *" -> "*) from="${p%% -> *}"; from="${from%\"}"; from="${from#\"}"; p="${p##* -> }" ;; esac
      p="${p%\"}"; p="${p#\"}"
      sig="$(stat -c '%s:%Y' "$root/$p" 2>/dev/null || echo gone)"
      printf '%s\t%s\t%s\t%s\n' "$(echo "$st" | tr -d ' ')" "$p" "$sig" "$from"
    done | LC_ALL=C sort
  else
    find "$root" -type f -not -path '*/.git/*' -not -path '*/node_modules/*' \
      -printf '~\t%P\t%s:%T@\n' 2>/dev/null | LC_ALL=C sort
  fi
}

branch_name() { [ "$is_git" = 1 ] && git -C "$root" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "-"; }

# Liste "statut<TAB>chemin[<TAB>origine]" → "statut chemin, …" ; un renommage ou une copie
# s'écrit "R ancien -> nouveau". Au-delà de BULK entrées dans un même
# dossier, le dossier est résumé en une entrée : "?? dist/ (42 entries)".
BULK=10
group_bulk() {
  awk -F'\t' -v bulk="$BULK" '
    $2 == "" || seen[$2]++ { next }
    { n++; st[n] = $1; path[n] = $2; from[n] = $3; d = $2; sub(/\/[^\/]*$/, "", d); if (d == $2) d = "."; dir[n] = d; count[d]++ }
    END {
      for (i = 1; i <= n; i++) {
        d = dir[i]
        if (count[d] > bulk) {
          if (done[d]++) continue
          item = st[i] " " d "/ (" count[d] " entries)"
        } else item = st[i] " " (from[i] != "" ? from[i] " -> " : "") path[i]
        printf "%s%s", (k++ ? ", " : ""), item
      }
    }'
}

head_sha() { [ "$is_git" = 1 ] && git -C "$root" rev-parse --short HEAD 2>/dev/null || echo "-"; }

tool_names() {
  if command -v jq >/dev/null 2>&1; then
    jq -r 'select(.type=="assistant") | .message.content[]? | select(.type=="tool_use") | .name' 2>/dev/null
  else
    grep -oE '"type":"tool_use","id":"[^"]*","name":"[^"]*"' | sed -E 's/.*"name":"([^"]*)"/\1/'
  fi
}

# Fichiers visés par les outils (`file_path`, `notebook_path`, `path`) hors de la racine observée.
tool_outside() {
  if command -v jq >/dev/null 2>&1; then
    jq -r 'select(.type=="assistant") | .message.content[]? | select(.type=="tool_use")
           | .input | (.file_path // .notebook_path // .path // empty)' 2>/dev/null |
      awk -v root="$root" 'index($0, "/") == 1 && index($0, root "/") != 1 && $0 != root'
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
    branch_name > "$state/branch"
    echo 0 > "$state/batch"
    if [ -n "$transcript" ] && [ -f "$transcript" ]; then
      wc -l < "$transcript" | tr -d ' ' > "$state/tlines"; cp "$state/tlines" "$state/tlines_prev"
    fi
    n="$(printf '%s' "$cur" | grep -c . || true)"
    echo "[$(ts)] baseline | ${n} fichier(s) déjà modifié(s) | HEAD ${head}"
    return
  fi

  prev="$(cat "$state/snapshot")"; prev_head="$(cat "$state/head")"
  local br prev_br
  br="$(branch_name)"; prev_br="$(cat "$state/branch" 2>/dev/null || echo "$br")"

  # Fichiers apparus, modifiés ou disparus depuis le tick précédent.
  files="$(
    { comm -13 <(printf '%s\n' "$prev") <(printf '%s\n' "$cur") | cut -f1,2,4
      comm -23 <(printf '%s\n' "$prev" | cut -f2 | LC_ALL=C sort -u) \
               <(printf '%s\n' "$cur" | cut -f2 | LC_ALL=C sort -u) | sed 's/^/clean\t/'
    } | grep -v '^\s*$' | group_bulk
  )"

  # Mouvement de HEAD : changement de branche, nouveaux commits, retour en arrière
  # (ancêtre de l'ancien HEAD) ou, en dernier recours, réécriture d'historique.
  commits=""
  if [ "$is_git" = 1 ] && [ "$br" != "$prev_br" ]; then
    commits="branch: ${prev_br} → ${br} (HEAD ${prev_head} → ${head})"
  elif [ "$head" != "$prev_head" ] && [ "$is_git" = 1 ]; then
    if git -C "$root" merge-base --is-ancestor "$prev_head" "$head" 2>/dev/null; then
      commits="$(git -C "$root" log --format='%h %s' "${prev_head}..${head}" 2>/dev/null | head -n 10 | paste -sd ';' - | sed 's/;/; /g')"
    elif git -C "$root" merge-base --is-ancestor "$head" "$prev_head" 2>/dev/null; then
      commits="HEAD ${prev_head} → ${head} (retour en arrière sur ${br} : reset ?)"
    else
      commits="HEAD ${prev_head} → ${head} (réécriture d'historique ?)"
      local new_commits
      new_commits="$(git -C "$root" log --format='%h %s' "${prev_head}..${head}" 2>/dev/null | head -n 10 | paste -sd ';' - | sed 's/;/; /g')"
      [ -n "$new_commits" ] && commits="$commits; $new_commits"
    fi
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
      local outside first
      outside="$(sed -n "$((old + 1)),${new}p" "$transcript" | tool_outside)"
      if [ -n "$outside" ]; then
        first="$(printf '%s\n' "$outside" | head -n 1)"
        tools="${tools:+$tools }outside×$(printf '%s\n' "$outside" | grep -c .): ${first}"
      fi
      tr="+$((new - old)) lines $((old + 1))-${new}${tools:+ ($tools)}"
    fi
    echo "$old" > "$state/tlines_prev"; echo "$new" > "$state/tlines"
  fi

  printf '%s\n' "$cur" > "$state/snapshot"; echo "$head" > "$state/head"; echo "$br" > "$state/branch"

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
