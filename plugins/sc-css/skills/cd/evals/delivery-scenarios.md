# Static delivery scenarios

| Scenario | Expected behavior |
| --- | --- |
| Pure static site | sc-css owns one facade after build/output/preview are proven. |
| JS application with CSS | Register a bounded contributor and defer root delivery to sc-js. |
| WordPress theme | Register theme assets only and defer root delivery to sc-php. |
| Unknown output | Report a gap and write no target or contract. |
| Cache policy | Revalidate HTML and preserve immutable caching for fingerprinted assets. |
| Missing overcode deploy | Stop automata with no generated fallback. |
| Two static targets | Reuse one deterministic artifact and facade with independent cache, proof and recovery metadata. |
| Repository image/font | Include it in the code artifact rather than declaring mutable user media. |
| User uploads or database | Refuse ownership and route to the root application runtime. |
| Missing target id | Select no destination when the contract declares several targets. |
