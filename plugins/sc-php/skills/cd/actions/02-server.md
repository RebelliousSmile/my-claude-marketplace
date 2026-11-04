# Server target

Reconcile one project-native root facade with explicit WordPress or PHP delivery scopes.

## Input

- Verified local setup, framework strategy, named `server` target facts and capabilities, phase, lifecycle guard, requested operation, proof, and recovery.

## Output

One root facade, one owned implementation, and a matching secret free contract, or a no write refusal.

## Process

1. **Load.** Read [facade reconciliation](../references/command-facade.md), [framework strategies](../references/php-frameworks.md), and [WordPress synchronization](../references/wordpress-sync.md); for PrestaShop also [the PrestaShop strategy](../references/prestashop.md).
2. **Select.** Resolve the exact target, phase, independent lock and lifecycle revision. Identify the existing root package-manager command and its owning script before choosing a facade. PHP or WordPress does not by itself make Composer the deployment owner.
3. **Reconcile.** Preserve targets and custom behavior behind that one existing facade. Create a Composer facade only when Composer already owns root project operations or no deployment facade exists and Composer is the detected project manager.
   - Report conflicting semantics and request arbitration without adding a second producer.
4. **Profile.** Record commands available on the actual host. Prefer the strongest verified transport without assuming that two shared hosts expose the same SSH, shell, archive, rsync, WP-CLI, database, or scheduler capabilities.
5. **Scope.** Keep code, declarative configuration, schema, editorial data and uploads separate. Exclude caches, logs, temporary upgrade files and secrets everywhere.
6. **Authorize.** In production, permit code and explicitly safe migrations only; refuse local database, content and upload transfer. In staging, allow a local mirror only after a stable diff preview, fresh backup and explicit confirmation.
7. **Transport.** Use proven rsync or the manifest fallback, with resumable partials and final inventory verification. Refuse unreliable inventories and never fall back to a full `tar | ssh` upload.
8. **Contract.** Write `deploy/contract.json` with exact root command, manager, directory, named target, invocation, lifecycle guard, source, operations, capability assumptions and secret names.
9. **Verify.** Run local dry-run and contract checks without contacting production. Propagate every failure and repeat reconciliation.

## Test

| Case | Pass |
| --- | --- |
| normal WordPress code release is configured | database, uploads, caches, and secrets are excluded |
| sync scope or direction is absent | zero remote commands and zero project writes are intended |
| database backup or confirmation is absent | no migration, import, transfer, or remote command is intended |
| existing pnpm/PowerShell or Composer pipeline is present | its one root facade remains and custom targets are preserved |
| host offers more capabilities than another known host | verified capabilities select the procedure; the provider name does not cap it |
| reconciliation runs twice unchanged | the second intended-write set is empty |
| staging upload is unchanged | it contributes zero transferable bytes |
| production sync includes database, content or uploads | no transport or remote mutation is intended |
| PrestaShop code release is configured | only tracked overrides, project modules and child theme are sent; `parameters.php`, media, `var/` and module `vendor/` are refused |
| PrestaShop target CLI PHP differs from the site PHP | post-delivery uses the site's binary and ini and proves `pdo_mysql` before `bin/console` |
