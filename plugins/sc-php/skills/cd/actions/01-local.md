# Local

Reconcile WordPress, Laravel, Symfony, or PrestaShop locally without destructive container or database effects.

## Input

- Composer and package manifests, framework sentinels, local examples, database engine, and existing container wrappers.

## Output

An idempotent local start, stop, CLI, and verification procedure for the detected framework.

## Process

1. **Detect.** Reuse existing sniff signals to resolve WordPress, Laravel, Symfony, or PrestaShop and stop on an unsupported combination.
2. **Reconcile.** Preserve existing containers, volumes, variables, and framework commands.
   - For WordPress, reuse wp-env, the Compose project name guard, and the `pnpm wp` wrapper.
   - For PrestaShop, apply [the PrestaShop strategy](../references/prestashop.md): pinned image tag matching the production PHP, database healthcheck, `PS_FOLDER_ADMIN=admin`, WSL filesystem on Windows, console as `www-data` with raised memory.
3. **Verify.** Check the framework CLI, local URL, and rendered application without reset, destroy, import, or production access.
4. **Repeat.** Reconcile unchanged inputs a second time and report each check explicitly.

## Test

| Case | Pass |
| --- | --- |
| WordPress fixture is verified | the wrapper reports WP CLI, active theme or plugin, URL, and rendered content |
| Laravel or Symfony fixture is verified | the native framework CLI and welcome route are checked |
| PrestaShop fixture is verified | `bin/console` answers as `www-data`, front and renamed admin return 200, and the image PHP minor equals the production site's |
| PrestaShop install is interrupted | `install.lock` removal is proposed only while `app/config/parameters.php` is absent |
| database volume is populated | no reset, destroy, import, or deletion command is intended |
| reconciliation runs twice unchanged | the second intended-write set is empty |
