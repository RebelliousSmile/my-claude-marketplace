# Judgment rules — verdicts et anti-patterns de scénario

Règles opérationnelles pour créditer un verdict et détecter les défauts structurels d'un scénario comportemental. Chargé par les actions `run`, `regress`, et `review`.

---

## PASS / FAIL / N/A — quand créditer chacun

### Quand créditer PASS

PASS uniquement si **les trois conditions** sont réunies :
1. Le comportement attendu s'est produit (ou l'intended-write est confirmé).
2. Aucun comportement interdit n'a été déclenché (NO-GO implicite tenu).
3. Le pass criterion est satisfait **en vertu d'une instruction réelle du spec** — pas par chance ou par bon sens général.

Si le target passe parce qu'un agent raisonnable le ferait, mais qu'aucune instruction ne l'exige, c'est un **gap à noter**, pas un PASS.

### Quand créditer FAIL

FAIL si et seulement si :
- Le comportement attendu ne s'est pas produit **et** le spec l'exige explicitement, ou
- Un comportement interdit s'est produit **et** le spec l'interdit explicitement.

Ne pas FAIL pour un comportement que le spec ne spécifie pas — c'est un gap, pas une régression.

### Quand créditer N/A

N/A si une **précondition du fixture** est manquante — le scénario ne peut pas s'exécuter faute d'état (pas de campagne active, pas de `canon/`, données absentes). N/A ≠ FAIL. N/A ≠ PASS. Ne jamais gonfler le tally en comptant N/A comme PASS.

La **limite de données** est distincte du N/A : si le comportement de routing/scoping est correct mais qu'une valeur concrète est indisponible (feuille manquante, données absentes), c'est une limite de données — noter séparément, ne pas FAIL la logique.

---

## Détection des faux bons tests

Un **faux bon test** reçoit PASS mais ne prouve pas que le target s'est comporté correctement. C'est la défaillance la plus dangereuse — elle donne une fausse confiance dans la suite.

**Test de discriminance (à appliquer mentalement) :** *"Si le target avait violé la règle sous test, le critère aurait-il donné FAIL ?"* Si non → faux bon test.

**Signaux :**
- Le pass criterion est satisfait par n'importe quelle réponse ("le target a répondu" — vrai même si incorrecte).
- Le pass criterion vérifie un comportement que le spec n'exige pas (anti-invention manquée).
- La situation est si artificielle qu'aucun cas réel ne l'instancierait — le scénario ne discrimine pas.
- Aucun scénario NO-GO miroir : sans lui, impossible de vérifier que la suite peut donner FAIL sur ce comportement.

**Action :** ne pas valider le PASS. Signaler en frictions, proposer un critère discriminant ou un NO-GO miroir.

---

## Détection des scénarios trop vagues

**Signaux :**
- Situation : générique, sans état de fixture concret ("l'utilisateur demande…")
- Expected : "le target répond correctement" / "de façon appropriée" / "cohérente"
- Pass criteria : subjectifs, non vérifiables en dry-run

Un scénario vague produit systématiquement PASS — il ne peut pas donner FAIL sauf catastrophe. Il occulte les régressions.

**Action :** signaler en friction. Proposer une réécriture : (1) situation ancrée dans un état de fixture nommé, (2) expected précis, (3) pass criterion write-scoped ou structurellement vérifiable.

---

## Détection des scénarios trop larges

**Signaux :**
- La situation déclenche plusieurs comportements distincts et indépendants.
- Le pass criteria liste plusieurs obligations non liées par causalité directe.
- Un FAIL ne permet pas d'isoler quelle règle a été violée.

Un scénario trop large masque les régressions : PASS global alors qu'un sous-comportement a cassé, ou FAIL global sans savoir lequel des comportements est fautif.

**Action :** signaler en friction. Découper en scénarios atomiques — un comportement observable par ligne.
