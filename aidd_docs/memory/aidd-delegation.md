# Délégation AIDD — autorité, traces et consentement

Établi le 2026-09-10 lors de l'évolution de `overcode:taste` et `overcode:foresee`.

## Une délégation collecte une preuve, elle ne transfère pas le verdict

Une skill composite peut déléguer une analyse spécialisée à AIDD, mais le rapport délégué reste l'autorité sur son propre domaine et doit être conservé sans rescoring. La skill appelante demeure responsable de sa synthèse distinctive : Taste juge la valeur et la sobriété du produit ; Foresee construit les scénarios de résilience.

Cette séparation évite deux dérives : reproduire localement un moteur déjà fourni par AIDD, ou faire passer une conclusion produit pour une conclusion technique du délégué.

## « Lecture seule » distingue les rapports du produit évalué

Un audit ou une review peut écrire un rapport annoncé sous `aidd_docs/` tout en restant analytique vis-à-vis du produit. Chaque invocation doit donc rendre une quittance qui nomme la capacité appelée, son résultat et tous les fichiers écrits.

Une capacité susceptible de modifier le code source, les tests ou la configuration — par exemple assert, test, refactor ou implement — exige une demande ou un consentement explicite. Sans ce consentement, la skill peut proposer la délégation et sa quittance prévue, mais ne l'exécute pas.

## La résolution des capacités échoue explicitement

Les capacités sont résolues depuis le catalogue vivant de l'hôte avec leurs identifiants canoniques et leur version minimale. Une capacité absente ou incompatible arrête uniquement la branche concernée en nommant l'écart ; elle ne déclenche ni scanner local de remplacement, ni résolution par un chemin de cache installé.

Source durable : `aidd_docs/tasks/2026_09/2026_09_10_taste-sobriety-foresee-resilience/plan.md` et ses phases.
