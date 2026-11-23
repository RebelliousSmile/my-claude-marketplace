#!/usr/bin/env node
/**
 * Captures d'écran des guides : inventaire des images citées, contrôle, lancement de la commande du projet.
 *
 *   node <racine du plugin>/engine/cli.js captures list  [--guide <id>]   images citées par chaque guide et leur état
 *   node <racine du plugin>/engine/cli.js captures check [--guide <id>]   sort en 1 si une image citée manque sur le disque
 *   node <racine du plugin>/engine/cli.js captures run   [--guide <id>]   lance `captures.command`, puis dit quelles images ont été réécrites
 *   --config <chemin>                                                   configuration du projet (défaut : documentation.config.json
 *                                                                       cherché depuis le dossier courant)
 *
 * Le moteur ne prend aucune capture : il ne sait rien de l'application ni de l'outil (Playwright, Puppeteer, à la main).
 * La commande du projet (champ `captures` de la configuration) les produit, en écrivant chaque PNG sous le nom que le guide cite.
 * `run` expose à cette commande `DOC_PDF_SOURCE_DIR` (dossier des guides, absolu) et, avec `--guide`, `DOC_PDF_GUIDE`.
 *
 * Une image est « citée » par `![texte](chemin)` dans un fichier Markdown du guide (version fusionnée exclue, fenêtres de
 * code exclues, adresses distantes ignorées) ; le chemin est relatif au fichier qui la cite.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { ConfigError, loadConfig, extractConfigArg, findGuide } = require('./guide-config');

const IMAGE = /!\[[^\]]*\]\(\s*(<[^>]+>|[^)\s]+)(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g;
const FENCE = /^ {0,3}(```|~~~)[\s\S]*?^ {0,3}\1[ \t]*$/gm;
const IMAGE_FILE = /\.(png|jpe?g|gif|svg|webp)$/i;
const REMOTE = /^[a-z][a-z0-9+.-]*:/i;
// Tolérance sur l'horodatage des fichiers, que certains systèmes arrondissent à la seconde.
const MTIME_SLACK_MS = 1000;

function toLf(text) {
  return text.replace(/\r\n?/g, '\n');
}

/** Chemin d'une image citée, sans chevrons, ancre ni requête ; null pour une adresse distante. */
function localTarget(raw) {
  const unwrapped = raw.startsWith('<') ? raw.slice(1, -1) : raw;
  if (REMOTE.test(unwrapped)) return null;
  const bare = unwrapped.split(/[#?]/)[0];
  try {
    return decodeURIComponent(bare);
  } catch {
    return bare;
  }
}

/**
 * Images citées par un guide : un élément par fichier image, avec les fichiers Markdown qui le citent.
 * @returns {{ file: string, sources: string[] }[]}
 */
function citedImages(config, guide) {
  const dir = path.join(config.sourceDir, guide.dir);
  const byFile = new Map();
  const names = fs.readdirSync(dir)
    .filter(name => name.endsWith('.md') && name !== guide.mergedFile)
    .sort();
  for (const name of names) {
    const text = toLf(fs.readFileSync(path.join(dir, name), 'utf8')).replace(FENCE, '');
    for (const match of text.matchAll(IMAGE)) {
      const target = localTarget(match[1]);
      if (!target) continue;
      const file = path.resolve(dir, target);
      if (!byFile.has(file)) byFile.set(file, new Set());
      byFile.get(file).add(name);
    }
  }
  return [...byFile].map(([file, sources]) => ({ file, sources: [...sources] }));
}

/** Fichiers image du dossier `images` du guide qu'aucun fichier Markdown ne cite. */
function orphanImages(config, guide, cited) {
  const imagesDir = path.join(config.sourceDir, guide.dir, 'images');
  if (!fs.existsSync(imagesDir)) return [];
  const known = new Set(cited.map(image => image.file));
  return fs.readdirSync(imagesDir)
    .filter(name => IMAGE_FILE.test(name))
    .map(name => path.join(imagesDir, name))
    .filter(file => !known.has(file));
}

/** État d'une image citée : présente ou non, date de modification en ms. */
function statOf(file) {
  try {
    return { exists: true, mtimeMs: fs.statSync(file).mtimeMs };
  } catch {
    return { exists: false, mtimeMs: null };
  }
}

function selectGuides(config, name) {
  return name ? [findGuide(config, name)] : config.guides;
}

function relativeTo(config, file) {
  return path.relative(config.dir, file).split(path.sep).join('/');
}

function reportGuide(config, guide, out, { onlyMissing = false } = {}) {
  const cited = citedImages(config, guide).map(image => ({ ...image, ...statOf(image.file) }));
  const missing = cited.filter(image => !image.exists);
  out.log(`${guide.id} : ${cited.length} image(s) citée(s), ${missing.length} manquante(s)`);
  for (const image of onlyMissing ? missing : cited) {
    const state = image.exists ? new Date(image.mtimeMs).toISOString().slice(0, 10) : 'MANQUANTE';
    out.log(`  ${state.padEnd(10)}  ${relativeTo(config, image.file)}  (${image.sources.join(', ')})`);
  }
  const orphans = orphanImages(config, guide, cited);
  if (orphans.length > 0) {
    out.log(`  ${orphans.length} image(s) du dossier images non citée(s) : ${orphans.map(file => path.basename(file)).join(', ')}`);
  }
  return { cited, missing };
}

function listCommand(config, guides, out) {
  guides.forEach(guide => reportGuide(config, guide, out));
  return 0;
}

function checkCommand(config, guides, out) {
  const reports = guides.map(guide => reportGuide(config, guide, out, { onlyMissing: true }));
  const missing = reports.reduce((total, report) => total + report.missing.length, 0);
  if (missing > 0) {
    out.err(`${missing} image(s) citée(s) absente(s) du disque : les capturer (captures run) ou corriger le Markdown.`);
    return 1;
  }
  out.log('Toutes les images citées existent.');
  return 0;
}

function runCommand(config, guides, guideName, out, deps) {
  if (!config.captures) {
    out.err('Configuration : aucun champ « captures » (command) : rien à lancer. Voir references/captures.md du plugin.');
    return 1;
  }
  const { command, cwd, env } = config.captures;
  const run = deps.run || spawnSync;
  const now = deps.now || Date.now;
  const startedAt = now();
  const childEnv = { ...process.env, ...env, DOC_PDF_SOURCE_DIR: config.sourceDir };
  if (guideName) childEnv.DOC_PDF_GUIDE = guides[0].id;

  out.log(`Captures : ${command} (dans ${cwd})`);
  const result = run(command, { shell: true, cwd, env: childEnv, stdio: 'inherit' });
  if (result.error || result.status !== 0) {
    out.err(`La commande de captures a échoué (${result.error ? result.error.message : `code ${result.status}`}) : images non contrôlées.`);
    return 1;
  }

  let missing = 0;
  for (const guide of guides) {
    const cited = citedImages(config, guide).map(image => ({ ...image, ...statOf(image.file) }));
    const rewritten = cited.filter(image => image.exists && image.mtimeMs >= startedAt - MTIME_SLACK_MS);
    const untouched = cited.filter(image => image.exists && image.mtimeMs < startedAt - MTIME_SLACK_MS);
    const absent = cited.filter(image => !image.exists);
    missing += absent.length;
    out.log(`${guide.id} : ${rewritten.length} réécrite(s), ${untouched.length} inchangée(s), ${absent.length} manquante(s)`);
    untouched.forEach(image => out.log(`  inchangée  ${relativeTo(config, image.file)}  (hors de la commande, ou capture à reprendre)`));
    absent.forEach(image => out.log(`  MANQUANTE  ${relativeTo(config, image.file)}  (${image.sources.join(', ')})`));
  }
  if (missing > 0) {
    out.err(`${missing} image(s) citée(s) toujours absente(s) du disque.`);
    return 1;
  }
  return 0;
}

/** Route `list|check|run` ; `deps` isole le lancement, l'horloge et la sortie pour les tests. Rend le code de sortie. */
function main(argv, deps = {}) {
  const out = deps.out || { log: m => process.stdout.write(`${m}\n`), err: m => process.stderr.write(`${m}\n`) };
  try {
    const { configPath, rest } = extractConfigArg(argv);
    const [sub, ...options] = rest;
    const guideIndex = options.indexOf('--guide');
    const guideName = guideIndex === -1 ? null : options[guideIndex + 1];
    if (guideIndex !== -1 && (!guideName || guideName.startsWith('--'))) {
      throw new ConfigError('--guide attend l’identifiant d’un guide.');
    }
    if (!['list', 'check', 'run'].includes(sub)) {
      out.err(`Sous-commande de captures inconnue ou manquante : « ${sub || ''} ». Attendu : list, check ou run.`);
      return 1;
    }
    const config = loadConfig({ configPath, cwd: deps.cwd });
    const guides = selectGuides(config, guideName);
    if (sub === 'list') return listCommand(config, guides, out);
    if (sub === 'check') return checkCommand(config, guides, out);
    return runCommand(config, guides, guideName, out, deps);
  } catch (error) {
    if (!(error instanceof ConfigError)) throw error;
    out.err(error.message);
    return 1;
  }
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = { main, citedImages, orphanImages, localTarget };
