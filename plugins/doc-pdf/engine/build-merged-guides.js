#!/usr/bin/env node
/**
 * Assemble la version fusionnée de chaque guide utilisateur à partir de ses
 * fichiers numérotés (`0N-xxx.md`), seule source de vérité (issue #74).
 *
 *   node <racine du plugin>/engine/cli.js merge          écrit les versions fusionnées
 *   node <racine du plugin>/engine/cli.js merge --check  n'écrit rien, sort en 1 si l'une est périmée
 *   --config <chemin>                                   configuration du projet (défaut : documentation.config.json
 *                                                       cherché depuis le dossier courant) ; les guides à fusionner
 *                                                       sont ceux qui portent un `mergedFile`
 *
 * Les liens `](0N-xxx.md)` deviennent des ancres internes ; les liens vers un
 * autre guide (`../guide-…/0N-xxx.md`) et les images restent inchangés.
 */

const fs = require('fs');
const path = require('path');
const { ConfigError, loadConfig, extractConfigArg } = require('./guide-config');

/** Cibles de la configuration : dossier de guide → nom de la version fusionnée (champ `mergedFile`). */
function mergedTargets(config) {
  return config.guides
    .filter(guide => guide.mergedFile)
    .map(guide => ({ dir: guide.dir, output: guide.mergedFile }));
}

const BANNER = '<!-- Fichier généré par la commande merge du plugin doc-pdf à partir des '
  + 'fichiers 0*.md de ce dossier. Ne pas modifier : éditer les fichiers numérotés '
  + 'puis relancer merge. -->';

const NUMBERED_FILE = /^0\d-[^/\\]+\.md$/;
const LOCAL_LINK = /\[([^\]]*)\]\((0\d-[^)#\s/\\]+\.md)(#[^)\s]*)?\)/g;
const HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/;

function toLf(text) {
  return text.replace(/\r\n?/g, '\n');
}

/** Slug d'un titre à la manière de GitHub : minuscules, ponctuation retirée, espaces → `-`. */
function slugify(title) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s_-]/gu, '')
    .replace(/ /g, '-');
}

/**
 * Parcourt les titres hors blocs de code et rend, pour chaque fichier, l'ancre
 * de son premier titre de niveau 1, dédoublonnée comme GitHub (`-1`, `-2`…).
 */
function computeFileAnchors(files) {
  const seen = new Map();
  const anchors = new Map();

  for (const file of files) {
    let inFence = false;
    for (const line of toLf(file.content).split('\n')) {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        continue;
      }
      if (inFence) continue;
      const match = HEADING.exec(line);
      if (!match) continue;

      const base = slugify(match[2]);
      const count = seen.get(base) || 0;
      seen.set(base, count + 1);
      const slug = count === 0 ? base : `${base}-${count}`;

      if (match[1] === '#' && !anchors.has(file.name)) {
        anchors.set(file.name, slug);
      }
    }
  }
  return anchors;
}

/**
 * Assemble les fichiers numérotés d'un guide.
 * @param {Array<{name: string, content: string}>} files - fichiers du dossier
 * @returns {string} version fusionnée, en LF, terminée par un seul saut de ligne
 */
function buildMergedGuide(files) {
  const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name));
  const anchors = computeFileAnchors(sorted);

  const chapters = sorted.map(file => {
    const body = toLf(file.content).replace(LOCAL_LINK, (whole, text, target, hash) => {
      if (!sorted.some(f => f.name === target)) {
        throw new Error(`${file.name} : lien vers un fichier numéroté absent du dossier (${whole})`);
      }
      if (hash) return `[${text}](${hash})`;
      const anchor = anchors.get(target);
      if (!anchor) {
        throw new Error(`${file.name} : ${target} n'a aucun titre de niveau 1 pour servir d'ancre (${whole})`);
      }
      return `[${text}](#${anchor})`;
    });
    return body.trim();
  });

  return `${BANNER}\n\n${chapters.join('\n\n')}\n`;
}

function readNumberedFiles(dir) {
  return fs.readdirSync(dir)
    .filter(name => NUMBERED_FILE.test(name))
    .map(name => ({ name, content: fs.readFileSync(path.join(dir, name), 'utf8') }));
}

/** Rend l'état de chaque cible : contenu attendu et fraîcheur du fichier sur disque. */
function inspectTargets(config) {
  return mergedTargets(config).map(target => {
    const dir = path.join(config.sourceDir, target.dir);
    const outputPath = path.join(dir, target.output);
    const expected = buildMergedGuide(readNumberedFiles(dir));
    // core.autocrlf=true laisse le fichier en CRLF sur disque : comparer en LF.
    const current = fs.existsSync(outputPath) ? toLf(fs.readFileSync(outputPath, 'utf8')) : null;
    return { ...target, outputPath, expected, upToDate: current === expected };
  });
}

function main(argv) {
  let options;
  let targets;
  try {
    options = extractConfigArg(argv);
    targets = inspectTargets(loadConfig({ configPath: options.configPath }));
  } catch (error) {
    if (!(error instanceof ConfigError)) throw error;
    console.error(error.message);
    return 1;
  }
  const check = options.rest.includes('--check');

  if (check) {
    const stale = targets.filter(t => !t.upToDate);
    stale.forEach(t => console.error(`Version fusionnée périmée : ${path.relative(process.cwd(), t.outputPath)}`));
    if (stale.length > 0) {
      console.error('Relancer la commande merge du plugin doc-pdf.');
      return 1;
    }
    console.log('Versions fusionnées à jour.');
    return 0;
  }

  targets.forEach(t => {
    fs.writeFileSync(t.outputPath, t.expected, 'utf8');
    console.log(`Écrit : ${path.relative(process.cwd(), t.outputPath)}`);
  });
  return 0;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = { buildMergedGuide, slugify, inspectTargets, mergedTargets, NUMBERED_FILE };
