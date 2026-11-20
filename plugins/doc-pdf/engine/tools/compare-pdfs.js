#!/usr/bin/env node
/**
 * Comparaison de deux PDF : nombre de pages, texte (pdftotext) et rendu (pdftoppm, 72 ppp, niveaux de gris).
 *
 *   node tools/compare-pdfs.js <référence.pdf> <courant.pdf>
 *
 * Code de sortie : 0 si les deux PDF ont le même nombre de pages, le même texte et le même rendu page par page, 1 sinon.
 * Les outils poppler (`pdftotext`, `pdftoppm`) doivent être dans le PATH ; leur absence est signalée en nommant l'outil.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

class PdfCompareError extends Error {}

function tool(name, args, run = spawnSync) {
  const result = run(name, args, { encoding: 'buffer', maxBuffer: 256 * 1024 * 1024 });
  if (result.error) {
    throw new PdfCompareError(`Outil introuvable : ${name} (poppler) doit être dans le PATH (${result.error.message}).`);
  }
  if (result.status !== 0) {
    throw new PdfCompareError(`${name} a échoué (code ${result.status}) : ${String(result.stderr || '').trim().split('\n')[0]}`);
  }
  return result.stdout;
}

/** Texte de chaque page (pdftotext sépare les pages par un saut de page). */
function pageTexts(pdf, run) {
  const text = tool('pdftotext', ['-layout', pdf, '-'], run).toString('utf8');
  const pages = text.split('\f');
  if (pages.length > 0 && pages[pages.length - 1].trim() === '') pages.pop();
  return pages;
}

/** Rendu de chaque page : octets du PGM produit par pdftoppm. */
function pageRenders(pdf, run) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-pdfs-'));
  try {
    tool('pdftoppm', ['-r', '72', '-gray', pdf, path.join(dir, 'page')], run);
    return fs.readdirSync(dir).sort().map(file => fs.readFileSync(path.join(dir, file)));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** Compare deux PDF ; renvoie { ok, pages: [n, n], textDifferent: [pages], renderDifferent: [pages] } (pages numérotées depuis 1). */
function comparePdfs(referencePdf, currentPdf, run = spawnSync) {
  for (const file of [referencePdf, currentPdf]) {
    if (!fs.existsSync(file)) throw new PdfCompareError(`PDF introuvable : ${file}`);
  }
  const textA = pageTexts(referencePdf, run);
  const textB = pageTexts(currentPdf, run);
  const renderA = pageRenders(referencePdf, run);
  const renderB = pageRenders(currentPdf, run);
  const count = Math.max(renderA.length, renderB.length);
  const textDifferent = [];
  const renderDifferent = [];
  for (let i = 0; i < count; i += 1) {
    if (textA[i] !== textB[i]) textDifferent.push(i + 1);
    if (!renderA[i] || !renderB[i] || !renderA[i].equals(renderB[i])) renderDifferent.push(i + 1);
  }
  return {
    ok: renderA.length === renderB.length && textDifferent.length === 0 && renderDifferent.length === 0,
    pages: [renderA.length, renderB.length],
    textDifferent,
    renderDifferent
  };
}

function main(argv, run = spawnSync, log = console.log) {
  try {
    if (argv.length !== 2) throw new PdfCompareError('Usage : node tools/compare-pdfs.js <référence.pdf> <courant.pdf>');
    const result = comparePdfs(argv[0], argv[1], run);
    log(`Pages : référence ${result.pages[0]}, courant ${result.pages[1]}`);
    if (result.textDifferent.length) log(`Texte différent, pages : ${result.textDifferent.join(', ')}`);
    if (result.renderDifferent.length) log(`Rendu différent, pages : ${result.renderDifferent.join(', ')}`);
    log(result.ok ? 'PDF identiques (pages, texte, rendu).' : 'Écarts constatés.');
    return result.ok ? 0 : 1;
  } catch (error) {
    if (!(error instanceof PdfCompareError)) throw error;
    console.error(error.message);
    return 1;
  }
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = { comparePdfs, main, PdfCompareError };
