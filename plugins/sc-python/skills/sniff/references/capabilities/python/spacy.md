---
paths:
  - "**/*.py"
  - "!**/migrations/**"
  - "!**/venv/**"
  - "!**/.venv/**"
---

# spaCy — Code Quality Pivot

Criteria for `/sc-python:audit`. Loaded at audit time, never installed to `.claude/rules/`.

## Model loading

- Charger `nlp` au niveau module (singleton) — jamais dans une boucle ou par appel :
  ```python
  # ✅ chargé une seule fois au démarrage
  nlp = spacy.load("fr_core_news_sm")

  def process(text: str) -> Doc:
      return nlp(text)

  # ❌ rechargement à chaque call (plusieurs secondes, centaines de Mo)
  def process(text: str) -> Doc:
      nlp = spacy.load("fr_core_news_sm")
      return nlp(text)
  ```
- `spacy.load()` est coûteux — le résultat doit être mis en cache au démarrage du processus.
- Détecter : `grep -rn "spacy\.load(" . --include="*.py"` — vérifier que l'appel est au niveau module ou dans une factory appelée une seule fois, jamais dans une boucle ou une fonction de traitement.

## Composants inutilisés — disable

- Désactiver explicitement les composants non utilisés :
  ```python
  # NER uniquement — tagger, parser, lemmatizer non chargés
  nlp = spacy.load("fr_core_news_sm", disable=["tagger", "parser", "lemmatizer", "attribute_ruler"])

  # Contextuel (one-shot) — select_pipes préféré pour les appels isolés
  with nlp.select_pipes(enable=["ner"]):
      doc = nlp(text)
  ```
- `disable=` en `spacy.load()` est permanent pour la session ; `select_pipes()` est contextuel.
- Détecter : `grep -rn "spacy\.load(" . --include="*.py" | grep -v "disable="` — modèle large chargé sans `disable` = suspect.

## Traitement batch — nlp.pipe()

- Utiliser `nlp.pipe()` pour traiter plusieurs textes — jamais une boucle d'appels `nlp(text)` :
  ```python
  # ✅ batch vectorisé
  docs = list(nlp.pipe(texts, batch_size=50))

  # ❌ appel séquentiel — pas de parallélisation interne
  docs = [nlp(text) for text in texts]
  ```
- `batch_size=50` est un bon défaut ; augmenter pour des textes courts, diminuer pour des textes longs (RAM).
- `nlp.pipe(zip(texts, metas), as_tuples=True)` pour conserver les métadonnées associées à chaque texte.
- Détecter : `grep -rn "\bnlp(text\|t\|doc\|s)\b" . --include="*.py"` dans des boucles `for` — remplacer par `nlp.pipe()`.

## Pipelines custom

- Composants enregistrés avec `@Language.component` ou `@Language.factory` :
  ```python
  @Language.component("custom_ner_post")
  def post_process(doc: Doc) -> Doc:
      ...
      return doc

  nlp.add_pipe("custom_ner_post", after="ner")
  ```
- Vérifier l'ordre d'exécution : `print(nlp.pipe_names)` avant de soumettre en prod.
- Tests de composants isolés : `nlp.make_doc(text)` crée un `Doc` vide sans passer par le pipeline complet.

## Matchers et entity ruler

- `PhraseMatcher` pour des patterns d'entités à faible coût computationnel :
  ```python
  matcher = PhraseMatcher(nlp.vocab)
  patterns = [nlp.make_doc(name) for name in entity_list]
  matcher.add("ORG", patterns)
  matches = matcher(doc)
  ```
- `EntityRuler` en pipeline pour injecter des entités avant ou après le NER neural :
  ```python
  ruler = nlp.add_pipe("entity_ruler", before="ner")
  ruler.add_patterns([{"label": "ORG", "pattern": "ACME Corp"}])
  ```
- Détecter : `grep -rn "re\.compile\|re\.findall\|re\.search" . --include="*.py"` sur des fichiers spaCy — vérifier si un `Matcher` serait plus expressif et maintenable.

## Extensions et attributs custom

- Déclarer les extensions avant de les utiliser : `Doc.set_extension("score", default=None)`.
- Getter lazy : `Doc.set_extension("entities_list", getter=lambda doc: [e.text for e in doc.ents])`.
- Même pattern pour `Token.set_extension` et `Span.set_extension`.

## Type hints

- Annoter systématiquement avec les types spaCy : `doc: Doc`, `span: Span`, `token: Token`, `nlp: Language`.
- `from spacy.tokens import Doc, Span, Token` — ne pas utiliser `Any` pour les retours spaCy.
