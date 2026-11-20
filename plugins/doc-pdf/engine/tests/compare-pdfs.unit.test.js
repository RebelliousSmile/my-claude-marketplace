const fs = require('fs');
const os = require('os');
const path = require('path');
const { comparePdfs, main, PdfCompareError } = require('../tools/compare-pdfs');

function pdfs(...names) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cp-test-'));
  return names.map((name) => { const file = path.join(dir, name); fs.writeFileSync(file, 'x'); return file; });
}

/** Faux poppler : le texte et le rendu dépendent d'un descripteur indexé par le nom du PDF. */
function fakeRun(spec) {
  return (name, args) => {
    const pdf = args.find(arg => arg.endsWith('.pdf'));
    const entry = spec[path.basename(pdf)];
    if (name === 'pdftotext') return { status: 0, stdout: Buffer.from(entry.pages.map(p => p.text).join('\f') + '\f') };
    const prefix = args[args.length - 1];
    entry.pages.forEach((p, i) => fs.writeFileSync(`${prefix}-${i + 1}.pgm`, p.render));
    return { status: 0, stdout: Buffer.alloc(0) };
  };
}

const page = (text, render) => ({ text, render });

describe('comparePdfs', () => {
  test('identiques', () => {
    const [a, b] = pdfs('a.pdf', 'b.pdf');
    const same = { pages: [page('un', 'r1'), page('deux', 'r2')] };
    expect(comparePdfs(a, b, fakeRun({ 'a.pdf': same, 'b.pdf': same })).ok).toBe(true);
  });

  test('nomme la page dont le rendu seul diffère', () => {
    const [a, b] = pdfs('a.pdf', 'b.pdf');
    const result = comparePdfs(a, b, fakeRun({
      'a.pdf': { pages: [page('un', 'r1'), page('deux', 'r2')] },
      'b.pdf': { pages: [page('un', 'r1'), page('deux', 'rX')] }
    }));
    expect(result).toMatchObject({ ok: false, textDifferent: [], renderDifferent: [2] });
  });

  test('nomme la page dont le texte diffère', () => {
    const [a, b] = pdfs('a.pdf', 'b.pdf');
    const result = comparePdfs(a, b, fakeRun({
      'a.pdf': { pages: [page('un', 'r1')] },
      'b.pdf': { pages: [page('uN', 'r1')] }
    }));
    expect(result.textDifferent).toEqual([1]);
  });

  test('un nombre de pages différent est un écart', () => {
    const [a, b] = pdfs('a.pdf', 'b.pdf');
    const result = comparePdfs(a, b, fakeRun({
      'a.pdf': { pages: [page('un', 'r1')] },
      'b.pdf': { pages: [page('un', 'r1'), page('deux', 'r2')] }
    }));
    expect(result.ok).toBe(false);
    expect(result.pages).toEqual([1, 2]);
  });

  test('un outil absent est nommé', () => {
    const [a, b] = pdfs('a.pdf', 'b.pdf');
    const run = () => ({ error: new Error('ENOENT') });
    expect(() => comparePdfs(a, b, run)).toThrow(/Outil introuvable : pdftotext/);
    expect(() => comparePdfs(a, b, run)).toThrow(PdfCompareError);
  });

  test('un PDF absent est signalé', () => {
    const [a] = pdfs('a.pdf');
    expect(() => comparePdfs(a, path.join(os.tmpdir(), 'nope.pdf'), () => ({}))).toThrow(/PDF introuvable/);
  });
});

describe('main', () => {
  test('code 0 si identiques, 1 sinon, 1 sans arguments', () => {
    const [a, b] = pdfs('a.pdf', 'b.pdf');
    const same = { pages: [page('un', 'r1')] };
    const log = jest.fn();
    expect(main([a, b], fakeRun({ 'a.pdf': same, 'b.pdf': same }), log)).toBe(0);
    expect(main([a, b], fakeRun({ 'a.pdf': same, 'b.pdf': { pages: [page('un', 'r9')] } }), log)).toBe(1);
    const err = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(main([], undefined, log)).toBe(1);
    err.mockRestore();
  });
});
