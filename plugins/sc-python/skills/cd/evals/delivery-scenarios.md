# Python delivery scenarios

| Scenario | Expected behavior |
| --- | --- |
| uv Django | Execute the versioned deployment script through uv and keep migrations distinct. |
| Poetry FastAPI | Preserve Poetry and the configured ASGI entrypoint. |
| Pipenv Flask | Preserve Pipenv and prove the script invocation. |
| requirements only | Ask before adding any runner or manager. |
| Celery worker | Declare process ordering and an independent health proof. |
| SQL data request | Require named scope, backup, confirmation and recovery. |
| Missing overcode deploy | Stop automata without files or fallback. |
| Django federation | Railway automata and Alwaysdata server share one facade and immutable code ref, while retaining distinct databases and media. |
| Named staging | Mirror only the named staging data/media through a manifest delta; leave production targets untouched. |
| Mode switch | Preserve facade semantics when a named target changes from server to automata. |
| Unknown object-store inventory | Refuse media sync instead of sending a full archive. |
