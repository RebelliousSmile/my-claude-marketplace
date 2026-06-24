# 01-validate-roundtrip (sc-js:wp-blocks)

## Rôle

Matérialiser et exécuter un validateur Playwright qui ouvre chaque page/article
dans l'éditeur Gutenberg et asserte que **tous les blocs survivent au round-trip**
parse → `save()` → compare. Sortie : liste des blocs invalides (page · type ·
extrait du markup fautif) ; exit 1 si au moins un bloc est invalide.

## Pré-vol

1. **Instance WP locale en marche** et joignable. **Vérifier la REST API** :
   `curl -s -o /dev/null -w "%{http_code}" $WP_BASE/wp-json/wp/v2/types` doit
   renvoyer `200`. L'éditeur Gutenberg **dépend de la REST** : un thème/plugin qui
   fait planter `/wp-json` (fatal sur un filtre `rest_endpoints`, etc.) casse
   l'éditeur → la validation timeout partout. Corriger la REST d'abord.
2. **Valider contre la MÊME version de WP que la prod.** La fonction `save()`
   d'un bloc évolue entre versions : valider un contenu rédigé en 7.0 dans un
   éditeur 6.5 (ou l'inverse) produit des **faux invalides en masse**. Aligner
   `.wp-env.json` (`"core"`) sur la version de production, re-provisionner
   (`wp-env start --update`), puis `wp core update-db`.
3. **Pas d'écran « mise à jour de la base »** : si `db_version` ≠ celui du core,
   l'admin redirige vers `upgrade.php` et l'éditeur ne charge jamais. Lancer
   `wp core update-db`.
4. **Plugins de blocs custom actifs** (sinon ils ressortent en `core/missing` —
   c'est un vrai signal, mais à ne pas confondre avec une invalidité `save()`).
5. **Playwright** dispo : `pnpm dlx playwright install chromium` si besoin.
6. **Identifiants admin** connus (wp-env : `admin` / `password` ; si l'admin a un
   login custom, créer un admin jetable et le supprimer après le run).

## Comment résoudre la liste des pages

Générique, sans config projet : interroger la REST API publique pour récupérer
**id + lien** des contenus publiés (`pages` puis `posts`). L'URL d'édition est
toujours `"$WP_BASE/wp-admin/post.php?post=<id>&action=edit"` (pages ET articles).

> Si la REST est désactivée : passer une liste d'IDs en argv, ou lire les
> `body.className` du frontend (`page-id-N` / `postid-N`).

## Détection de l'éditeur prêt

Attendre que le store soit monté **et** le post chargé, pas seulement le DOM :
`wp.data.select('core/editor').getCurrentPostId()` non nul + la liste de blocs
visuelle présente. Une page vide (`getBlocks() === []`) est un cas valide.

## Lecture de la validité

Parcourir récursivement `wp.data.select('core/block-editor').getBlocks()` :
- `b.isValid === false` → bloc invalide (mismatch `save()`), capturer
  `b.originalContent` (le markup stocké fautif).
- `b.name === 'core/missing'` → bloc non reconnu (plugin non chargé / nom erroné).
- Récurser sur `b.innerBlocks` (group, columns, buttons… imbriquent).

## Script à matérialiser

Écrire dans le projet (p. ex. `tools/qa/gutenberg-validate.mjs` ou
`scripts/`). Adapter le bloc `CONFIG` au projet, garder le reste tel quel.

```js
/**
 * gutenberg-validate.mjs — Round-trip de validité des blocs Gutenberg.
 *
 * Ouvre chaque page/article dans l'éditeur et vérifie que tout bloc natif
 * statique survit au cycle parse → save() → compare. Le frontend masque les
 * blocs invalides (il recrache le HTML stocké) ; seul l'éditeur les détecte.
 *
 * Usage :
 *   node tools/qa/gutenberg-validate.mjs                 # toutes pages + posts publiés
 *   node tools/qa/gutenberg-validate.mjs 12 48           # restreint à ces IDs
 *   node tools/qa/gutenberg-validate.mjs --json out.json # écrit le rapport
 *
 * Exit 1 si ≥ 1 bloc invalide/missing.
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

// ─── CONFIG (adapter au projet) ────────────────────────────────────────────
const CONFIG = {
  base: process.env.WP_BASE || 'http://localhost:8888',
  user: process.env.WP_ADMIN_USER || 'admin',
  pass: process.env.WP_ADMIN_PASS || 'password',
  types: ['pages', 'posts'],   // CPT REST à énumérer
  headless: true,
  navTimeout: 45000,
};
// ───────────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const jsonIdx = argv.indexOf('--json');
const JSON_OUT = jsonIdx >= 0 ? argv[jsonIdx + 1] : null;
const ONLY_IDS = argv.filter(a => /^\d+$/.test(a)).map(Number);

async function listTargets() {
  const targets = [];
  for (const type of CONFIG.types) {
    let page = 1;
    for (;;) {
      const url = `${CONFIG.base}/wp-json/wp/v2/${type}?per_page=100&page=${page}&status=publish&_fields=id,link,title`;
      const res = await fetch(url);
      if (!res.ok) break;
      const batch = await res.json();
      if (!Array.isArray(batch) || batch.length === 0) break;
      for (const it of batch) {
        targets.push({ id: it.id, link: it.link, title: (it.title?.rendered || '').replace(/<[^>]+>/g, '').trim() });
      }
      const total = Number(res.headers.get('x-wp-totalpages') || page);
      if (page >= total) break;
      page++;
    }
  }
  return ONLY_IDS.length ? targets.filter(t => ONLY_IDS.includes(t.id)) : targets;
}

// Exécuté DANS la page éditeur — renvoie les blocs invalides/missing (récursif).
function collectInvalid() {
  const wp = window.wp;
  const out = [];
  const walk = (blocks) => {
    for (const b of blocks || []) {
      if (b.name === 'core/missing') {
        out.push({ name: b.name, status: 'missing', original: String(b.attributes?.originalContent || '').slice(0, 180) });
      } else if (b.isValid === false) {
        out.push({ name: b.name, status: 'invalid', original: String(b.originalContent || '').slice(0, 220) });
      }
      if (b.innerBlocks && b.innerBlocks.length) walk(b.innerBlocks);
    }
  };
  walk(wp.data.select('core/block-editor').getBlocks());
  return out;
}

const targets = await listTargets();
if (!targets.length) {
  console.error('Aucune cible trouvée — REST API joignable ? Contenu publié ?');
  process.exit(2);
}
console.log(`Cibles : ${targets.length} (${CONFIG.types.join('+')})`);

const browser = await chromium.launch({ headless: CONFIG.headless });
const ctx = await browser.newContext();
const page = await ctx.newPage();
page.setDefaultTimeout(CONFIG.navTimeout);

// ── Login ──
await page.goto(`${CONFIG.base}/wp-login.php`, { waitUntil: 'domcontentloaded' });
await page.fill('#user_login', CONFIG.user);
await page.fill('#user_pass', CONFIG.pass);
await page.click('#wp-submit');
await page.waitForLoadState('networkidle');
if (!(await page.url()).includes('/wp-admin')) {
  console.error('Login échoué — vérifier les identifiants admin.');
  await browser.close();
  process.exit(2);
}

const report = [];
let broken = 0;
for (const t of targets) {
  const editUrl = `${CONFIG.base}/wp-admin/post.php?post=${t.id}&action=edit`;
  try {
    await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
    // Éditeur monté + post chargé
    // Éditeur prêt = post chargé + blocs parsés. On lit le STORE (wp.data), pas
    // le DOM : depuis WP 6.3 le canevas est dans un IFRAME, donc un sélecteur
    // comme `.block-editor-block-list__layout` n'est PAS dans le document
    // principal (waitForSelector y timeout indéfiniment). `.catch` : une page
    // sans bloc (getBlocks() === []) reste un cas valide.
    await page.waitForFunction(() => {
      const sel = window.wp?.data?.select;
      const ed = sel && sel('core/editor');
      const ble = sel && sel('core/block-editor');
      return !!(ed && ed.getCurrentPostId() && ble && ble.getBlocks().length > 0);
    }, { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(500); // settle parsing
    const invalid = await page.evaluate(collectInvalid);
    if (invalid.length) {
      broken++;
      report.push({ id: t.id, title: t.title, link: t.link, invalid });
      console.log(`\n✗ [${t.id}] ${t.title}`);
      for (const b of invalid) console.log(`    ${b.status.padEnd(7)} ${b.name}  « ${b.original.replace(/\s+/g, ' ').slice(0, 90)} »`);
    } else {
      console.log(`✓ [${t.id}] ${t.title}`);
    }
  } catch (e) {
    broken++;
    report.push({ id: t.id, title: t.title, link: t.link, error: String(e.message || e) });
    console.log(`⚠ [${t.id}] ${t.title} — ${String(e.message || e).slice(0, 80)}`);
  }
}

await browser.close();
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(report, null, 2));

const totalInvalid = report.reduce((n, r) => n + (r.invalid?.length || 0), 0);
console.log(`\n${'─'.repeat(48)}`);
console.log(`Pages OK : ${targets.length - broken}/${targets.length}  ·  blocs invalides : ${totalInvalid}`);
process.exit(broken ? 1 : 0);
```

## Câblage

Ajouter au `package.json` du projet :

```json
"qa:blocks": "node tools/qa/gutenberg-validate.mjs"
```

## Interpréter le rapport

| Symptôme | Cause probable | Correction |
|---|---|---|
| `invalid core/heading` | classes / attributs du markup ≠ sérialisation core (ordre des classes, classe en trop/manquante) | aligner la chaîne générée sur la sortie exacte du bloc (copier depuis l'éditeur une fois le bloc posé proprement) |
| `invalid core/list` | `<ul>`/`<li>` sans la classe `wp-block-list`, ou structure imbriquée non conforme | corriger le markup généré |
| `missing sc-xxx/yyy` | bloc non enregistré dans l'éditeur | activer le plugin / corriger le nom du bloc ; si SSR, vérifier `register_block_type` |
| `error … timeout` | éditeur non monté (perf, modale bloquante, post inexistant) | augmenter `navTimeout`, vérifier l'ID |

## Limites

- Ne juge **que la validité d'édition**, pas le rendu visuel ni le vocabulaire
  design (orthogonaux → garder le lint DS et le diff visuel/texte à côté).
- Blocs SSR / `core/html` : non validés par nature (pas de `save()`).
- Headless : si un bloc dépend d'un asset front non chargé en admin, il reste
  néanmoins parsé/validé normalement (la validité ne dépend pas du CSS).
