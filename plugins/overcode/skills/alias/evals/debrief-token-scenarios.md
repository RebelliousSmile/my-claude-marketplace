# Debrief token scenarios

| ID | Given | Expected |
| --- | --- | --- |
| T1 | `--focus tokens`, but `aidd-telemetry:01-cost` is absent from the available skills | Report `contextual proxies only — aidd-telemetry unavailable`; run no `aidd telemetry` command and print no token total. |
| T2 | The telemetry skill is available, but `.aidd/config.json` is absent or `telemetry.enabled` is not `true` | Report `contextual proxies only — measurement disabled`; never enable measurement. |
| T3 | Measurement is enabled, but `aidd --version` fails | Report `contextual proxies only — aidd CLI unavailable`; never install the CLI. |
| T4 | Measurement is enabled and report version 15 is complete | Run `read` once and `report --json` once; report totals and at most three attributed hotspots. |
| T5 | The CLI reports unreadable sessions or incomplete input | Mark telemetry `partial`, preserve the CLI's limitation and do not fill the gap from transcript counters. |
| T6 | The JSON report has an unsupported `cost_report_version` | Report exact telemetry as `N/A`; do not interpret fields from the unknown schema. |
| T7 | A count depth selects sessions that do not exactly match the telemetry calendar period | State both populations and do not assign the period total to the selected sessions. |
| T8 | `--focus frictions` is selected | Do not probe telemetry and do not render the token section. |
| T9 | A figure or attribution is absent | Render it as unknown or unattributed, never zero and never “no skill ran”. |
| T10 | Cache share or one step dominates the report without corroborating process evidence | Present a hotspot to investigate, not a waste claim or causal conclusion. |
| T11 | Telemetry is unavailable, but the digest contains compactions and task changes | Report those as contextual proxies and recommend a task-boundary context reset without estimating tokens. |
| T12 | The recipe or telemetry contract suggests changing an external AIDD skill | Keep the external source read-only; limit the recommendation to invocation, a local `my-marketplace` adapter, or upstream feedback. |
