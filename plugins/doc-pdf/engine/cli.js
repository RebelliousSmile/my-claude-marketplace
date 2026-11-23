#!/usr/bin/env node
/**
 * Point d'entrée unique du moteur doc-pdf : Markdown → ICML/IDML → PDF (InDesign), mise en page d'une maquette externe.
 *
 *   node cli.js <commande> [options]
 *
 * Commandes (chaque option est transmise telle quelle au script concerné) :
 *   init --maquette <dossier> [--dir <dossier>]  écrit un documentation.config.json de départ (refuse d'écraser)
 *   maquette init <dossier> [--nom <nom>]  crée une maquette (squelette et spécimen de calage)
 *   maquette specimen <dossier>  ajoute le spécimen de calage à une maquette existante
 *   merge  [--check]           versions fusionnées des guides (build-merged-guides.js)
 *   icml   [--force] …         régénère les ICML (export-icml.js) ; Pandoc requis
 *   idml   [--gabarits] …      modèle IDML de la maquette (build-idml-template.js)
 *   pdf    build|update|compose …  pilote InDesign (compose-guide.js) ; Pandoc et InDesign requis
 *   captures list|check|run …  images citées par les guides, contrôle, commande de captures du projet (capture-guides.js)
 *   version                    version du plugin
 *
 * Toutes les commandes acceptent `--config <chemin>` (sinon recherche en remontant depuis le dossier courant).
 * Aucune écriture n'a lieu quand Pandoc manque : le contrôle précède le lancement du script.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadMaquette, initMaquette, addSpecimen } = require('./maquette');

const PLUGIN_MANIFEST = path.join(__dirname, '..', '.claude-plugin', 'plugin.json');
const CONFIG_NAME = 'documentation.config.json';
const SCRIPTS = {
  merge: 'build-merged-guides.js',
  icml: 'export-icml.js',
  idml: 'build-idml-template.js',
  pdf: 'compose-guide.js',
  captures: 'capture-guides.js'
};
const NEEDS_PANDOC = new Set(['icml', 'pdf']);
const PANDOC_MISSING = "Pandoc est introuvable dans le PATH. L'installer (https://pandoc.org/installing.html, "
  + "ou `winget install JohnMacFarlane.Pandoc`), rouvrir le terminal, puis relancer. Aucun fichier n'a été écrit.";

/** Configuration de départ ; « maquette » et l'accent sont posés par `init --maquette`. */
function configTemplate(maquettePath, accent) {
  return {
    maquette: maquettePath,
    sourceDir: '.',
    outputDir: '../output',
    pagesFile: 'pages-gabarit.json',
    versionFile: '../package.json',
    guides: [
      {
        id: 'utilisateur',
        dir: 'guide-utilisateur',
        title: 'Guide de l’utilisateur',
        verb: 'Maîtriser',
        type: 'Documentation utilisateur',
        accent
      }
    ]
  };
}

function pluginVersion() {
  return JSON.parse(fs.readFileSync(PLUGIN_MANIFEST, 'utf8')).version;
}

function hasPandoc(run = spawnSync) {
  const result = run('pandoc', ['--version'], { encoding: 'utf8' });
  return !result.error && result.status === 0;
}

function usage() {
  return [
    `doc-pdf ${pluginVersion()} — Markdown → ICML/IDML → PDF (InDesign)`,
    '',
    'Usage : node cli.js <commande> [options]',
    '  init --maquette <dossier> [--dir <dossier>]  écrit un documentation.config.json de départ',
    '  maquette init <dossier> [--nom <nom>]  crée une maquette (squelette et spécimen de calage)',
    '  maquette specimen <dossier>  ajoute le spécimen de calage à une maquette',
    '  merge [--check]          versions fusionnées des guides',
    '  icml [--force]           régénère les ICML (Pandoc requis)',
    '  idml [--gabarits]        modèle IDML de la charte',
    '  pdf build|update|compose pilote InDesign (Pandoc et InDesign requis)',
    '  captures list|check|run  images citées par les guides, contrôle, lancement des captures du projet',
    '  version                  version du plugin',
    '',
    'Toutes les commandes acceptent --config <chemin>.'
  ].join('\n');
}

/** Valeur d'une option `--nom <valeur>`, ou null. */
function optionValue(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? null : (args[index + 1] || null);
}

/**
 * Écrit le fichier de configuration de départ ; refuse d'écraser un fichier existant.
 * `--maquette <dossier>` est obligatoire : la maquette est chargée (donc validée) avant toute écriture.
 */
function init(args, out) {
  const dirFlag = optionValue(args, '--dir');
  const dir = path.resolve(dirFlag || '.');
  const file = path.join(dir, CONFIG_NAME);
  const maquetteArg = optionValue(args, '--maquette');
  if (!maquetteArg) {
    out.err('init demande --maquette <dossier> : le dossier de la maquette (maquette.json). Rien écrit.');
    return 1;
  }
  const maquetteDir = path.resolve(maquetteArg);
  let maquette;
  try {
    maquette = loadMaquette(maquetteDir);
  } catch (error) {
    out.err(`${error.message} Rien écrit.`);
    return 1;
  }
  if (fs.existsSync(file)) {
    out.err(`${file} existe déjà : rien écrit.`);
    return 1;
  }
  const relative = path.relative(dir, maquetteDir).split(path.sep).join('/');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(configTemplate(relative, maquette.axes.defaut), null, 2)}
`, 'utf8');
  out.log(`Écrit : ${file}`);
  out.log('Compléter les guides (dossier, titre, accent), puis ajouter pages-gabarit.json (sous-titres, pages de fin, mentions).');
  return 0;
}

/** Sous-commandes de `maquette` : `init <dossier> [--nom <nom>]` et `specimen <dossier>`. */
function maquetteCommand(args, out) {
  const [sub, ...rest] = args;
  const folder = rest.find(arg => !arg.startsWith('--') && arg !== optionValue(rest, '--nom'));
  try {
    if (sub === 'init' && folder) {
      const created = initMaquette(folder, { nom: optionValue(rest, '--nom') ?? undefined });
      out.log(`Écrit : ${created}`);
      out.log('Remplir maquette.json et poser logo.svg, puis suivre la skill doc-pdf:maquette (modèle, calage, production).');
      return 0;
    }
    if (sub === 'specimen' && folder) {
      out.log(`Écrit : ${addSpecimen(folder)}`);
      return 0;
    }
  } catch (error) {
    out.err(error.message);
    return 1;
  }
  out.err(`Sous-commande de maquette inconnue ou dossier manquant : « ${args.join(' ')} ».
${usage()}`);
  return 1;
}

/**
 * Route une commande. `deps` isole les effets (Pandoc, lancement) pour les tests.
 * Rend le code de sortie.
 */
function main(argv, deps = {}) {
  const out = deps.out || { log: m => process.stdout.write(`${m}\n`), err: m => process.stderr.write(`${m}\n`) };
  const run = deps.run || spawnSync;
  const [command, ...rest] = argv;

  if (!command || command === '--help' || command === '-h' || command === 'help') {
    out.log(usage());
    return command ? 0 : 1;
  }
  if (command === 'version' || command === '--version') {
    out.log(pluginVersion());
    return 0;
  }
  if (command === 'init') return init(rest, out);
  if (command === 'maquette') return maquetteCommand(rest, out);
  if (!SCRIPTS[command]) {
    out.err(`Commande inconnue : « ${command} ».\n${usage()}`);
    return 1;
  }
  if (NEEDS_PANDOC.has(command) && !hasPandoc(run)) {
    out.err(PANDOC_MISSING);
    return 1;
  }
  const result = run(process.execPath, [path.join(__dirname, SCRIPTS[command]), ...rest], { stdio: 'inherit' });
  return result.status === 0 ? 0 : 1;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = { main, hasPandoc, init, usage, pluginVersion, PANDOC_MISSING, configTemplate, SCRIPTS };
