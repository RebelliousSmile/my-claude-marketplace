# Règles Typographiques Françaises

**Version :** 1.0  
**Date :** 2026-02-13  
**Usage :** Référence pour doctor.prompt.md et tous les prompts d'écriture

---

## Guillemets

| Type | Incorrect | Correct | Usage |
|------|-----------|---------|-------|
| Dialogue | "texte" | « texte » | Guillemets français avec espaces insécables |
| Citation courte | "mot" | « mot » | Toujours guillemets français |
| Citation imbriquée | « "texte" » | « "texte" » | Guillemets anglais à l'intérieur seulement |

**Espaces obligatoires :**
- Espace insécable **après** `«`
- Espace insécable **avant** `»`

**Exemple :**
```markdown
❌ "Je ne peux pas", dit-il.
✅ « Je ne peux pas », dit-il.
```

---

## Tirets

| Type | Caractère | Usage | Exemple |
|------|-----------|-------|---------|
| Trait d'union | `-` (U+002D) | Mots composés | arc-en-ciel, Jean-Paul |
| Tiret demi-cadratin | `–` (U+2013) | Intervalles numériques | 1914–1918, pages 12–45 |
| Tiret cadratin | `—` (U+2014) | Dialogue, incises | — Bonjour, dit-il. |

**Dialogue français :**
```markdown
❌ - Bonjour, dit-il.
❌ -- Bonjour, dit-il.
✅ — Bonjour, dit-il.
```

**Incises :**
```markdown
❌ Il marchait - seul dans la nuit - vers la ville.
✅ Il marchait — seul dans la nuit — vers la ville.
```

**Espaces :**
- Dialogue : `—` collé au mot, espace après
- Incise : espace insécable avant et après `—`

---

## Ponctuation et Espaces Insécables

| Ponctuation | Espace avant | Espace après | Type d'espace |
|-------------|--------------|--------------|---------------|
| `.` | Non | Oui | Normal |
| `,` | Non | Oui | Normal |
| `;` | Oui | Oui | **Insécable** avant |
| `:` | Oui | Oui | **Insécable** avant |
| `!` | Oui | Oui | **Insécable** avant |
| `?` | Oui | Oui | **Insécable** avant |
| `«` | Non | Oui | **Insécable** après |
| `»` | Oui | Non | **Insécable** avant |

**Exemples :**
```markdown
❌ Il demanda: "Pourquoi ?"
✅ Il demanda : « Pourquoi ? »

❌ Attention!
✅ Attention !

❌ C'est simple;il suffit de...
✅ C'est simple ; il suffit de...
```

---

## Points de Suspension

| Incorrect | Correct | Notes |
|-----------|---------|-------|
| `...` (3 points) | `…` (U+2026) | Caractère unique |
| `. . .` | `…` | Pas d'espaces entre les points |
| `....` (4 points) | `…` | Toujours 3 points (sauf fin de phrase) |

**Usage :**
```markdown
❌ Il hésita... puis parla.
✅ Il hésita… puis parla.

❌ « Je ne sais pas... »
✅ « Je ne sais pas… »
```

**Exception :** `….` (points de suspension + point final = 4 caractères)

---

## Apostrophes et Élisions

| Type | Caractère | Usage |
|------|-----------|-------|
| Apostrophe droite | `'` (U+0027) | ❌ À éviter |
| Apostrophe typographique | `'` (U+2019) | ✅ Correct |

**Exemples :**
```markdown
❌ l'homme, d'accord, qu'il
✅ l'homme, d'accord, qu'il
```

**LaTeX :** `'` (backtick inversé) ou commande `\apostrophe{}`

---

## Accents et Caractères Spéciaux Français

### Accents Obligatoires

| Voyelle | Accents possibles | Exemples |
|---------|-------------------|----------|
| a | à, â | à la, pâte |
| e | é, è, ê, ë | été, mère, être, Noël |
| i | î, ï | île, naïf |
| o | ô | côte, hôtel |
| u | ù, û, ü | où, sûr, Saül |
| c | ç | français, leçon |

### Ligatures

| Ligature | Caractère | Exemples |
|----------|-----------|----------|
| œ | U+0153 | œuvre, cœur, bœuf |
| æ | U+00E6 | ex æquo (rare) |

**Exemples :**
```markdown
❌ oeuvre, coeur
✅ œuvre, cœur

❌ francais, ete
✅ français, été
```

---

## Majuscules Accentuées

**RÈGLE :** Les majuscules prennent TOUJOURS les accents en français.

```markdown
❌ ETAT, A, ECOLE
✅ ÉTAT, À, ÉCOLE

❌ Ete, Eglise
✅ Été, Église
```

---

## Nombres et Unités

### Nombres en Lettres

| Contexte | Règle | Exemples |
|----------|-------|----------|
| 0 à 16 | En lettres | trois hommes, quinze jours |
| > 16 | En chiffres | 25 soldats, 1 000 habitants |
| Début de phrase | En lettres | Vingt ans plus tard… |
| Dates | En chiffres | 13 février 2026 |

### Séparateurs

| Type | Séparateur | Exemple |
|------|------------|---------|
| Milliers | Espace insécable | 1 000, 25 000 |
| Décimales | Virgule | 3,14 ; 0,5 |

**Exemples :**
```markdown
❌ 1000 habitants, 3.14
✅ 1 000 habitants, 3,14

❌ 1,000,000 (anglais)
✅ 1 000 000
```

### Unités

**Espace insécable entre nombre et unité :**
```markdown
❌ 25kg, 100m, 5h30
✅ 25 kg, 100 m, 5 h 30

❌ 20°C, 45%
✅ 20 °C, 45 %
```

---

## Dates et Heures

### Format de Date

| Format | Usage |
|--------|-------|
| 13 février 2026 | Standard français |
| 2026-02-13 | ISO 8601 (technique) |

**Exemples :**
```markdown
❌ February 13, 2026
❌ 02/13/2026 (US)
✅ 13 février 2026
✅ 2026-02-13 (contexte technique)
```

### Heures

```markdown
❌ 2:30 PM, 14h30min
✅ 14 h 30, 2 h 30 (après-midi)
```

---

## Abréviations Françaises

| Abréviation | Signification | Usage |
|-------------|---------------|-------|
| M. | Monsieur | M. Dupont |
| Mme | Madame | Mme Martin |
| Dr | Docteur | Dr Yamada |
| etc. | et cetera | livres, cahiers, etc. |
| c.-à-d. | c'est-à-dire | Le MJ, c.-à-d. le Meneur de Jeu |
| p. | page | p. 42 |
| pp. | pages | pp. 12-45 |

**Point abréviatif :**
- Présent si dernière lettre ≠ dernière lettre du mot : `M.` (Monsieur)
- Absent si dernière lettre = dernière lettre du mot : `Dr` (Docteur)

---

## Citations et Dialogues

### Citation Courte (< 3 lignes)

```markdown
Selon Jordan, « La Roue tisse comme La Roue veut ».
```

### Citation Longue (> 3 lignes)

```markdown
> La Roue du Temps tourne, les Âges viennent et passent,
> laissant des souvenirs qui deviennent légendes.
> Les légendes s'effacent en mythes, et les mythes
> sont depuis longtemps oubliés quand revient l'Âge qui les vit naître.
```

### Dialogue

```markdown
— Vous êtes prêt ? demanda Alise.
— Oui, répondit Fael.
— Alors partons.

(Incise après le dialogue :)
— Je ne peux pas, dit-il en détournant le regard.
```

**Règles :**
- Tiret cadratin `—` (pas trait d'union `-`)
- Espace après le tiret, pas avant
- Incises avec virgules

---

## Cas Spéciaux JdR

### Termes Anglais (JdR, Fantasy)

**Règle :** Italique si terme étranger non francisé.

```markdown
❌ Le game master doit préparer.
✅ Le *game master* doit préparer.
✅ Le MJ (abréviation française) doit préparer.

❌ Les NPCs sont importants.
✅ Les PNJ (personnages non-joueurs) sont importants.
```

### Univers Spécifiques

**La Roue du Temps :**
```markdown
✅ *saidin* (pouvoir masculin, italique)
✅ *saidar* (pouvoir féminin, italique)
✅ Aes Sedai (nom propre, pas d'italique)
✅ *ter'angreal* (objet de pouvoir, italique)
```

**Demon Slayer :**
```markdown
✅ *pourfendeur* (traduction française)
✅ *oni* (démon, terme japonais, italique)
✅ Technique de Respiration (traduction, pas d'italique)
```

---

## Checklist Doctor.prompt.md

Lors de la correction d'un texte, vérifier **dans cet ordre** :

### 🔴 CRITICAL (mode quick)
- [ ] Accents présents (é, è, ê, à, ù, etc.)
- [ ] Guillemets français `« »` (pas `"`)
- [ ] Espaces insécables avant `;` `:` `!` `?`
- [ ] Apostrophes typographiques `'` (pas `'`)
- [ ] Majuscules accentuées (`ÉTAT`, pas `ETAT`)

### 🟡 IMPORTANT (mode deep)
- [ ] Tirets cadratins `—` pour dialogues (pas `-`)
- [ ] Points de suspension `…` (pas `...`)
- [ ] Ligatures `œ` `æ` quand nécessaire
- [ ] Nombres > 1000 avec espace insécable
- [ ] Unités séparées par espace insécable (25 kg, 20 °C)

### 🟢 OPTIONAL (mode deep)
- [ ] Nombres 0-16 en lettres
- [ ] Cohérence format dates (13 février 2026)
- [ ] Abréviations françaises correctes (M., Dr, etc.)

---

**Références :**
- Lexique des règles typographiques en usage à l'Imprimerie nationale
- Le Ramat de la typographie (11e édition)
- Banque de dépannage linguistique (OQLF)

**Version :** 1.0  
**Dernière mise à jour :** 2026-02-13
