---
paths:
  - "**/modules/*/*.php"
  - "**/modules/*/src/**/*.php"
  - "**/override/**/*.php"
  - "**/themes/*/templates/**/*.tpl"
  - "!**/vendor/**"
---

# PrestaShop custom code — capability pivot for sc-php audit

Standalone pivot. Authoring conventions for **project-owned PrestaShop code** (8.x / 9.x): custom
modules, class overrides and child themes. Core, marketplace modules and the stock theme are
vendor code: audit them only to explain an interaction, never as findings. Delivery and local
runtime belong to `sc-php:cd` (see its `prestashop.md` reference). Loaded at audit time when
PrestaShop is detected.

#### Extend through modules and hooks before overrides

- An override replaces a core class or controller for the whole shop. Two modules overriding the
  same method conflict, `PS_DISABLE_OVERRIDES` silently disables them, and a core upgrade can
  change the overridden signature.
- Look for: an override whose behavior is reachable through a hook (`display*`, `action*`), a
  Symfony service decoration, or a module front/admin controller.
- Look for: an override that copies a whole core method instead of calling `parent::` around a
  narrow change.
- A new or removed override is only taken into account after the class index is rebuilt
  (`var/cache/<env>/class_index.php`): the delivery must clear the cache.

#### One module, one directory, one name

- The main class name, the `$this->name` value and the directory name match exactly; the main
  file is `<name>/<name>.php`.
- Project modules carry a project prefix (e.g. `sc_*`) so a versioning allowlist and an inventory
  can tell them apart from marketplace modules.
- `install()` registers every hook it needs and creates its tables and configuration keys;
  `uninstall()` removes what `install()` created. Look for: a hook used in code but never
  registered, configuration keys left behind, tables created outside `install()`.
- Declare `ps_versions_compliancy` honestly; a module tested only on 9.x does not claim 8.x.

#### Never hard-code the table prefix or the admin directory

- The table prefix is chosen at install time and differs between environments (a production shop
  may use `xyz_` while local uses `ps_`). Every SQL string uses `_DB_PREFIX_`; Doctrine entities
  use the prefix-aware mapping. Look for: a literal `ps_` in SQL, fixtures or migrations.
- The admin directory is renamed to a random name at install and differs per environment. Build
  admin URLs through `Context::getContext()->link->getAdminLink()` or the Symfony router; look
  for a literal `/admin` path or a stored admin URL.

#### SQL and input hygiene

- Legacy `Db::getInstance()` queries escape strings with `pSQL()` and cast integers with `(int)`;
  identifiers never come from user input. Prefer `DbQuery` or Doctrine for new code.
- Request values come from `Tools::getValue()` and are validated with `Validate::*` or Symfony
  constraints before use; `Tools::getValue()` does not sanitize.
- Admin legacy controllers check the token (`Tools::getAdminTokenLite()`); Symfony admin
  controllers rely on the framework CSRF and declare their permission with `AdminSecurity`
  (annotation or attribute, depending on the major version).
  Look for: a state-changing admin action reachable by GET without token or permission check.

#### Configuration and translations

- Configuration keys are prefixed with the module name (`SC_FOO_ENABLED`) and read through
  `Configuration::get()`; shop-specific values are not cached in static properties across shops.
- Strings use the translation system with a module domain (`$this->trans('…', [], 'Modules.Scfoo.Admin')`)
  rather than hard-coded French or English.

#### Symfony layer (8.x / 9.x)

- Module services are declared in the module `config/services.yml` (front and admin as needed)
  and autoloaded through the module's own Composer autoload; the module `vendor/` is built at
  delivery, never versioned.
- New admin pages use the Symfony admin controller base of the targeted major version instead of
  a legacy `AdminController`; on 9.x check the version's deprecations before reusing an 8.x
  example.
- A service or route change requires a container rebuild: the delivery clears the prod cache.

#### Child theme, never the stock theme

- Front changes live in a child theme whose `config/theme.yml` declares `parent: classic` (or the
  actual parent) and overrides only the templates and assets it changes. Look for: an edited file
  under the stock theme, which the next core or theme upgrade overwrites.
- Templates escape output with Smarty modifiers (`{$var|escape:'html':'UTF-8'}`) unless the value
  is trusted HTML produced server-side.
