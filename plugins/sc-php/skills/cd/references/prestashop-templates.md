# PrestaShop templates

Starting points for [the PrestaShop strategy](prestashop.md). Reconcile them with existing files:
preserve project values, targets and workarounds, and change only what the strategy requires.
Placeholders are written `<like-this>`. No template contains a secret value.

## `docker-compose.yml`

```yaml
name: <project>

services:
  mysql:
    image: mariadb:<production-major>          # same engine and major as production
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:?set in .env}
      MARIADB_DATABASE: ${DB_NAME:-prestashop}
    volumes:
      - db-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      interval: 5s
      timeout: 5s
      retries: 30

  prestashop:
    image: prestashop/prestashop:${PS_IMAGE_TAG:-<ps-version>-<edition-version>-classic-<php>-apache}
    restart: unless-stopped
    depends_on:
      mysql:
        condition: service_healthy
    ports:
      - "${HTTP_PORT:-8080}:80"
    environment:
      DB_SERVER: mysql
      DB_NAME: ${DB_NAME:-prestashop}
      DB_USER: root
      DB_PASSWD: ${DB_ROOT_PASSWORD:?set in .env}
      DB_PREFIX: ${DB_PREFIX:-ps_}
      PS_INSTALL_AUTO: 1
      PS_DOMAIN: ${PS_DOMAIN:-localhost:8080}
      PS_FOLDER_ADMIN: admin                   # the 9.2 installer renames it; other values fail
      PS_LANGUAGE: ${PS_LANGUAGE:-fr}
      PS_COUNTRY: ${PS_COUNTRY:-FR}
      PS_ENABLE_SSL: 0
      PS_DEV_MODE: 0
      ADMIN_MAIL: ${ADMIN_MAIL:?set in .env}
      ADMIN_PASSWD: ${ADMIN_PASSWD:?set in .env}
    volumes:
      - ./prestashop:/var/www/html

volumes:
  db-data:
```

`.env.example` lists `DB_ROOT_PASSWORD`, `DB_NAME`, `DB_PREFIX`, `PS_IMAGE_TAG`, `HTTP_PORT`,
`PS_DOMAIN`, `ADMIN_MAIL`, `ADMIN_PASSWD`, `DEPLOY_SSH`, `DEPLOY_PATH`, `DEPLOY_PHP`,
`DEPLOY_PHP_INI` with empty or example values.

## `.gitignore` (allowlist)

```gitignore
/*
!/.gitignore
!/.gitattributes
!/README.md
!/docker-compose.yml
!/.env.example
!/scripts/
!/aidd_docs/

!/prestashop/
/prestashop/*
!/prestashop/override/
!/prestashop/modules/
/prestashop/modules/*
!/prestashop/modules/<prefix>_*/
/prestashop/modules/<prefix>_*/vendor/
!/prestashop/themes/
/prestashop/themes/*
!/prestashop/themes/<child-theme>/
/prestashop/themes/<child-theme>/cache/*

.env
.env.local
*.sql
*.sql.gz
```

## `scripts/deploy.sh` (code release)

Shape of the owned implementation behind the project facade. Default is a local plan that contacts
nothing; `--preview` asks the target for the transferable delta; `--apply` previews, asks for
confirmation, transfers and runs post-delivery.

```bash
#!/usr/bin/env bash
set -euo pipefail

DEPLOY_SSH="${DEPLOY_SSH:?}"            # SSH alias of the target
DEPLOY_PATH="${DEPLOY_PATH:?}"          # absolute PrestaShop root on the target
DEPLOY_PHP="${DEPLOY_PHP:-php}"         # binary of the SITE's PHP version, not the SSH default
DEPLOY_PHP_INI="${DEPLOY_PHP_INI-}"     # site php.ini passed with -c; empty = none
SRC_DIR="prestashop"; REF="HEAD"; MODE="plan"

die() { echo "Error: $*" >&2; exit 1; }
while [[ $# -gt 0 ]]; do
  case "$1" in
    --preview) MODE="preview"; shift ;;
    --apply) MODE="apply"; shift ;;
    --ref) REF="${2:?}"; shift 2 ;;
    *) die "unknown argument: $1" ;;
  esac
done
[[ "$DEPLOY_PATH" == /* ]] || die "DEPLOY_PATH must be absolute"

cd "$(git rev-parse --show-toplevel)"
SHA="$(git rev-parse --verify "${REF}^{commit}")"
mapfile -t FILES < <(git ls-tree -r --name-only "$SHA" -- "$SRC_DIR/")
[[ ${#FILES[@]} -gt 0 ]] || die "nothing tracked under $SRC_DIR/ at $SHA"
for f in "${FILES[@]}"; do
  case "$f" in
    */app/config/parameters.*|*/.env|*.sql|*.sql.gz|*/vendor/*) die "forbidden in a release: $f" ;;
  esac
done
echo "Target $DEPLOY_SSH:$DEPLOY_PATH  ref $SHA  files ${#FILES[@]}"
[[ "$MODE" == plan ]] && { printf '  %s\n' "${FILES[@]#"$SRC_DIR"/}"; exit 0; }

tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
git archive "$SHA" -- "$SRC_DIR/" | tar -x -C "$tmp" --strip-components=1
ssh "$DEPLOY_SSH" "command -v rsync >/dev/null && test -f '$DEPLOY_PATH/app/config/parameters.php'" \
  || die "target lacks rsync or an installed PrestaShop"
sync() { rsync -rlc --itemize-changes --stats "$@" "$tmp"/ "$DEPLOY_SSH:$DEPLOY_PATH/"; }

sync --dry-run                           # changed files + transferable bytes, no deletion
[[ "$MODE" == preview ]] && exit 0
read -r -p "Deploy $SHA to $DEPLOY_SSH:$DEPLOY_PATH? [y/N] " ok
[[ "$ok" == y ]] || die "aborted"
sync

ssh "$DEPLOY_SSH" bash -s -- "$DEPLOY_PATH" "$DEPLOY_PHP" "$DEPLOY_PHP_INI" <<'REMOTE'
set -euo pipefail
cd "$1"; php="$2"; ini="$3"; args=()
[[ -z "$ini" ]] || { [[ -f "$ini" ]] || { echo "missing ini $ini" >&2; exit 1; }; args=(-c "$ini"); }
phpx() { "$php" "${args[@]}" -d memory_limit=512M "$@"; }
phpx -r 'extension_loaded("pdo_mysql") || exit(1);' || { echo "PHP CLI without pdo_mysql" >&2; exit 1; }
for m in modules/<prefix>_*/; do
  [[ -f "$m/composer.json" ]] || continue
  composer_bin="$(command -v composer)" || { echo "composer missing for $m" >&2; exit 1; }
  (cd "$m" && phpx "$composer_bin" install --no-dev --optimize-autoloader --no-interaction --quiet)
done
phpx bin/console cache:clear --env=prod --no-warmup --quiet
REMOTE
echo "Deployed $SHA"
```

Proof after `--apply`: HTTP 200 on front, admin login and checkout, and no new `CRITICAL` or
`ERROR` line in the newest `var/logs/prod-*.log` on the target.

The project facade (package-manager script, Makefile target or the script itself when no manager
owns the root) passes the target id and operation, and `deploy/contract.json` records the exact
invocation as required by the server action.
