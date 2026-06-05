# Harvest — {YYYY_MM_DD}

## Tracker

| Groupe | Items fermés | Fichiers purgés |
|--------|-------------|-----------------|
| A — issue ouverte + plan terminé | {tracker_a_closed} | {tracker_a_purged} |
| B — issue déjà fermée | — | {tracker_b_purged} |
| C — sans issue | — | {tracker_c_purged} |
| **Total** | **{tracker_total_closed}** | **{tracker_total_purged}** |

## Normative (`reconcile-normative`)

| Métrique | Valeur |
|----------|--------|
| Entrées migrées depuis l'archive | {norm_migrated} |
| Règles existantes enrichies (couverture partielle) | {norm_enriched} |
| Entrées déjà couvertes (skip) | {norm_skipped} |
| Doublons fusionnés | {norm_duplicates} |
| Contradictions résolues | {norm_contradictions} |
| Patterns élevés en règles | {norm_elevated} |
| Décisions obsolètes signalées | {norm_obsolete} |
| Règles passées en freshness (mises à jour / touchées / supprimées) | {norm_freshness} |

## Fraîcheur (`taste`)

### Documentation

| Statut | N |
|--------|---|
| Obsolète | {taste_doc_obsolete} |
| Partiel | {taste_doc_partial} |
| Current | {taste_doc_current} |

### Code

| Type de finding | N |
|----------------|---|
| Import manquant | {taste_code_missing_import} |
| Fonction manquante | {taste_code_missing_function} |
| Violation de règle | {taste_code_rule_violation} |
| Commentaire périmé | {taste_code_stale_comment} |

## Fichiers revus (Phase 6)

| Type | Supprimés | Conservés | Clarification demandée |
|------|-----------|-----------|------------------------|
| User stories | {p6_story_del} | {p6_story_keep} | {p6_story_ask} |
| Checklists / phases | {p6_check_del} | {p6_check_keep} | {p6_check_ask} |
| Sub-plans | {p6_sub_del} | {p6_sub_keep} | {p6_sub_ask} |
| Plans actifs | {p6_plan_del} | {p6_plan_keep} | {p6_plan_ask} |
| Audits | {p6_audit_del} | {p6_audit_keep} | {p6_audit_ask} |

## Notes

<!-- Observations ponctuelles, dérives signalées (group C cluster, violations de règle créée, etc.) -->
