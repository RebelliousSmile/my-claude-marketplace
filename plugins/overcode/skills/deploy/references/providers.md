# Supported provider primitives

| Provider | Required primitive | Contract/secret names | Failure boundary |
| --- | --- | --- | --- |
| Classic SSH | system `ssh` plus project-selected transfer/release commands | e.g. `DEPLOY_HOST`, `DEPLOY_USER`, key supplied by agent/CI | missing host/user/path or command stops before remote access |
| Railway | existing Railway project and supported CLI/API workflow | e.g. `RAILWAY_TOKEN`, project/service identifiers without secret values | missing CLI/project link stops configuration |
| Heroku | existing Heroku app and supported CLI/git/container workflow | e.g. `HEROKU_API_KEY`, app name | missing CLI/app/strategy stops configuration |
| Alwaysdata | verified SSH/SFTP account, remote paths, host-key reference and optional rsync capability | e.g. `ALWAYSDATA_ACCOUNT`, `ALWAYSDATA_HOST`, `ALWAYSDATA_USER`, optional `ALWAYSDATA_API_TOKEN`; site/service ids are nonsecret | missing path, host identity, transport or lifecycle guard stops that target before remote access |

This is an allow-list. Unknown providers remain unsupported until a tested adapter is added. Provider files contain only identifiers safe to version and references to environment/secret-store names. The project facade continues to own build, migrations, deployment proof and recovery.

Local emulation is normally N/A for SSH, Railway and Heroku unless the project already uses an official supported local primitive. Do not simulate production semantics with an unrelated container.

Alwaysdata has no assumed root access. Record SSH/SFTP, shell, rsync, path and restart capabilities as verified facts rather than provider defaults. Keep a nonsecret remote guard containing target id, phase and lifecycle revision; preflight reads it and promotion updates it under the target lock. A site/service restart is an optional hook after the application facade and proof. An Apache restart may affect several sites in the same account, so require explicit account-wide authorization. Store API token names only and never contact the API while configuring files.
