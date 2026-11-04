# PHP framework strategies

| Framework | Local | Production unit |
| --- | --- | --- |
| WordPress | wp-env/Docker through project wrappers | reviewed theme/plugin code and explicitly selected synchronization scopes |
| Laravel | existing Docker Compose and Artisan | built application, Composer dependencies and reviewed Artisan migrations |
| Symfony | existing Docker Compose and Console | built application, Composer dependencies and reviewed Doctrine migrations |
| PrestaShop | official `prestashop/prestashop` image with Compose and Console | tracked project code only (overrides, project modules, child theme); core installed once by hand on the target — see [PrestaShop](prestashop.md) |

Detect configuration rather than assuming document roots, public paths or process managers. Unknown hosting constraints are a gap and cause no write. SQL migrations never imply copying mutable production content.

For WordPress, theme code, application plugins, declarative configuration and reviewed schema changes remain local-authoritative. Posts, options with editorial state, users, orders and other business records are `data`; uploads are `media`. Cache, logs, upgrade temporaries and secrets belong to neither deliverable surface. Production owns its mutable data and media independently per target.

For PrestaShop, the core, marketplace modules, `app/config/parameters.php`, `img/`, `upload/`, `download/` and the database are never part of a release. Module install, upgrade or uninstall is a `data` operation on production, never a side effect of `deploy:prod`.
