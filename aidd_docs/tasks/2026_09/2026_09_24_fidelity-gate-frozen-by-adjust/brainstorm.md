# Un gate de fidélité qui applique tout le contrat

Un contrat de design ne sert à rien si l'implémentation ne corrige pas tout ce qui n'y est pas conforme. Aujourd'hui le gate de fidélité est sous-défini : `measure.py` mesure une liste globale de propriétés pour toutes les cibles, `config-gen.py` cible tous les composants sans filtre de page et pose le même sélecteur côté maquette et côté implémentation, et aucune étape du plugin ne produit le gate depuis le contrat (`enforce/05-fidelity-gate` le suppose « généré puis complété »). Conséquence observée sur un site réel : la réconciliation visuelle (mirror → copycat) n'a presque rien corrigé, faute de cibles. Objectif : le gate est défini au gel du contrat et l'implémentation ne fait que l'appliquer.

## Ce qui est tranché

- Critère : le gate est bien défini quand il applique complètement ce que déclare le contrat. Aucun élément, propriété ou page déclaré n'échappe à la mesure sans exclusion explicite.
- Répartition, par analogie avec un cycle de dev : `define` = brainstorm, `destructure` = challenge, `adjust` = plan, `enforce` = implémentation. Le gate est un critère d'acceptation : il appartient au plan, donc à `adjust`.
- Au gel, `adjust` traduit le contrat via `config-gen.py` et vérifie que tout se tient : chaque page de la table de correspondance produit un gate complet, dont chaque cible résout côté maquette.
- Un échec de cette vérification bloque le gel : composant sans sélecteur maquette, sélecteur introuvable, page non couverte sont des défauts du contrat.
- Corrections plugin : `measure.py` lit les props par élément ; le schéma oracle porte le sélecteur côté maquette issu de la table de correspondance ; `config-gen.py` filtre par page et ajoute les props de mise en page déclarées.
- Les 28 composants sans oracle du site sont un symptôme : la vérification au gel les refusera.
- Côté dépôt consommateur, le lanceur ne garde que les exceptions (ledger, `coverage_ack`).
- Ordre : plugin d'abord ; compléter l'oracle avant que son schéma porte le sélecteur maquette ferait tout refaire.

## Encore ouvert

- Composants déclarés mais présents sur aucune page de la référence : pas de mesure de fidélité possible, seul le lint les couvre.
- Portée : le gate de fidélité compare à la maquette, pas aux tokens ; la conformité tokens reste au lint. La couverture totale s'entend sur les deux gates réunis.

## Next Move

Corriger le plugin (mesure, schéma, génération, gel, application), puis compléter l'oracle du site et réduire son lanceur aux exceptions.
