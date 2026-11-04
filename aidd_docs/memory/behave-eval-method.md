# Méthode d'évaluation `behave` — ce que la refonte de `control` a appris

Établi le 2026-07-30, sur les huit suites de `overcode:control` (149 scénarios, deux fixtures).

## Un « 0 FAIL » ne dit rien de la couverture

Après une vague de correctifs, compter les **PASS→N/A** autant que les FAIL. Le rejeu de confirmation a rendu 0 FAIL et **six lignes passées de PASS à N/A**, toutes rendues injoignables par deux correctifs justes de la skill : une règle peut cesser d'être atteignable par toute fixture sans qu'aucune ligne rougisse.

Le Δ à rapporter est donc à trois colonnes — PASS, FAIL, **et le mouvement de N/A** — jamais le seul tally. Une ligne devenue injoignable est une dette de suite (fixture ou re-visée), pas un signal de corriger la règle qui vient de la fermer.

## Ne pas corriger la cible pendant qu'un run est en vol

Les juges lisent les fichiers de la skill. Éditer pendant qu'ils tournent fait des entrées de registre le portrait de **deux états différents** de la cible, et le run cesse d'être un instantané. Les correctifs partent quand tous les verdicts sont rentrés.

## Le registre dans le fichier de suite empêche le jugement à froid — ouvert

L'instruction de juger sans lire les verdicts antérieurs est **structurellement inapplicable** tant que le Results log vit dans le fichier de suite que le juge doit lire : **7 juges sur 8** ont vu les verdicts précédents, seul celui qui s'est arrêté avant la section a tenu froid. C'est un défaut de forme du harnais, pas des suites — il se corrige en sortant le registre du fichier de suite, pas en renforçant l'instruction.

## Les dénominateurs ne sont pas commensurables

Une suite peut compter des **cellules** (une situation à deux fixtures en vaut deux) là où les autres comptent des lignes. Ne jamais additionner les tallies en un total unique : chaque suite porte le sien, et une somme masque la correction de dénominateur.

## Une suite peut encoder le défaut qu'un correctif normatif retire

Constaté le 2026-08-25 sur `overcode:alias/backlog`. La règle bornait un remplacement au « prochain titre » ; la suite exigeait, mot pour mot, ce remplacement jusqu'au titre suivant. Corriger la règle seule aurait laissé la suite **rouge à raison** et le dépôt en contradiction interne.

Avant de modifier une règle, relire ce que sa suite exige d'elle : une ligne d'éval n'est pas un contrôle indépendant de la règle, elle en est la transcription. Là où elle cite l'observable en termes de mécanisme (« remplace jusqu'à `X` ») plutôt que d'effet (« ne détruit rien hors du bloc généré »), elle fige le mécanisme et devient un obstacle au correctif.

Corollaire de rédaction : viser l'**effet préservé**, pas le geste. Un observable écrit en effet survit au changement de mécanisme ; écrit en geste, il doit être réécrit à chaque correctif — et cette réécriture ressemble à un ajustement de la mesure pour faire passer la cible.

## L'auteur des consignes ne juge pas son propre run à sec

Constaté le 2026-11-04 sur `overcode:control` (journal des lots, L8 et L9). L'auteur des consignes les relit avec l'intention qu'il y a mise : un agent neuf, qui ne connaît que les fichiers, a trouvé L9 en échec (une ligne `idle` lue dans le journal n'était commentée par aucune instruction) là où l'auteur tenait le scénario pour couvert.

Le run se joue donc en deux passes d'agents neufs : la suite entière, puis, après retouche, les scénarios touchés, **y compris ceux dont une action citée a changé** (L4, parce que `03-stop` avait gagné une étape de rattrapage). Un critère obtenu par bon sens, sans instruction qui le porte, est un FAIL.
