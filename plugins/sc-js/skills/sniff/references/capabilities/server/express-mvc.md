# Express.js — patterns MVC (controllers, middleware, routes, erreurs)

## Structure MVC recommandée

```
src/
  routes/        ← définition des routes uniquement (pas de logique)
  controllers/   ← orchestration req/res, appel aux services
  services/      ← logique métier pure (testable sans req/res)
  middleware/    ← auth, validation, error handler
  utils/         ← helpers sans état
```

Controllers fins : extraire toute logique dans des services.

## Async middleware — toujours propager les erreurs

```js
// ❌ throw silencieux — Express ne le capture pas
router.get('/items', async (req, res) => {
  const items = await db.findAll() // si reject → crash
  res.json(items)
})

// ✅ propager via next(err)
router.get('/items', async (req, res, next) => {
  try {
    const items = await db.findAll()
    res.json(items)
  } catch (err) { next(err) }
})

// ✅ wrapper réutilisable
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
router.get('/items', asyncHandler(async (req, res) => {
  res.json(await db.findAll())
}))
```

## Error middleware — signature 4 arguments obligatoire

```js
// DOIT être enregistré en dernier, après toutes les routes
app.use((err, req, res, next) => {
  const status = err.status ?? 500
  res.status(status).json({ error: err.message ?? 'Internal Server Error' })
})
```

Express identifie les error middlewares à la signature `(err, req, res, next)` — les 4 paramètres sont obligatoires même si `next` n'est pas utilisé.

## Routes — organisation modulaire

```js
// routes/index.js
router.use('/products', require('./products'))
router.use('/orders', require('./orders'))
router.use('/auth', require('./auth'))

// routes/products.js — routes uniquement, pas de logique
router.get('/', asyncHandler(ProductController.list))
router.post('/', auth, validate(productSchema), asyncHandler(ProductController.create))
```

## Validation entrée — middleware dédié

```js
const validate = schema => (req, res, next) => {
  const { error } = schema.validate(req.body)
  if (error) return res.status(422).json({ error: error.message })
  next()
}
```

Ne pas valider dans le controller — séparer validation et traitement.

## Sécurité — middleware obligatoires

```js
app.use(helmet())                    // headers sécurité
app.use(cors({ origin: allowList })) // CORS explicite
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })) // rate limiting
```

## SQL brut — paramétrage obligatoire

```js
// ❌ injection SQL
db.query(`SELECT * FROM users WHERE id = ${req.params.id}`)

// ✅ paramétré
db.query('SELECT * FROM users WHERE id = ?', [req.params.id])
```

S'applique à mysql2, pg, sqlite3 — toujours utiliser les placeholders.

## Anti-patterns

- Logique métier dans les routes ou controllers → extraire dans un service
- `async` sans `try/catch` ni `asyncHandler` → erreur silencieuse, pas de réponse HTTP
- Error middleware avec 3 arguments → non reconnu par Express comme error handler
- `app.use(express.json())` absent → `req.body` undefined sur les POST
- CORS avec `origin: '*'` en production → accepte toutes les origines
- `console.log(err)` dans l'error middleware puis `next(err)` → double log si un autre handler existe en aval
