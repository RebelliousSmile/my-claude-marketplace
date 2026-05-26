#!/usr/bin/env python3
"""
Normalise l'encodage et les caracteres d'un fichier texte.

Corrige les problemes courants d'extraction PDF:
- Encodage mal detecte (Latin-1/Windows-1252 vs UTF-8)
- Ligatures PDF (fi, fl, ffi, ffl)
- Caracteres typographiques (apostrophes, guillemets, tirets)
- Caracteres de controle
- BOM (Byte Order Mark)

Usage:
    python normalize-text.py <input.txt> [--output output.txt]
    python normalize-text.py <input.txt> --detect-only
    cat file.txt | python normalize-text.py --stdin
"""

import argparse
import sys
import re
from pathlib import Path


# Mapping des ligatures PDF courantes
LIGATURES = {
    '\ufb00': 'ff',   # ff ligature
    '\ufb01': 'fi',   # fi ligature
    '\ufb02': 'fl',   # fl ligature
    '\ufb03': 'ffi',  # ffi ligature
    '\ufb04': 'ffl',  # ffl ligature
    '\ufb05': 'st',   # st ligature (rare)
    '\ufb06': 'st',   # st ligature variant
}

# Mapping des caracteres typographiques vers ASCII/standard
TYPOGRAPHY = {
    # Apostrophes
    '\u2018': "'",    # left single quote
    '\u2019': "'",    # right single quote (apostrophe)
    '\u201a': "'",    # single low-9 quote
    '\u201b': "'",    # single high-reversed-9 quote
    '\u0060': "'",    # grave accent as quote
    '\u00b4': "'",    # acute accent as quote

    # Guillemets doubles
    '\u201c': '"',    # left double quote
    '\u201d': '"',    # right double quote
    '\u201e': '"',    # double low-9 quote
    '\u201f': '"',    # double high-reversed-9 quote
    '\u00ab': '"',    # left guillemet
    '\u00bb': '"',    # right guillemet

    # Tirets
    '\u2013': '-',    # en dash
    '\u2014': '--',   # em dash
    '\u2015': '--',   # horizontal bar
    '\u2212': '-',    # minus sign

    # Espaces speciaux
    '\u00a0': ' ',    # non-breaking space
    '\u2002': ' ',    # en space
    '\u2003': ' ',    # em space
    '\u2009': ' ',    # thin space
    '\u200a': ' ',    # hair space
    '\u200b': '',     # zero-width space (remove)
    '\u200c': '',     # zero-width non-joiner (remove)
    '\u200d': '',     # zero-width joiner (remove)
    '\ufeff': '',     # BOM / zero-width no-break space (remove)

    # Points et ellipses
    '\u2026': '...',  # horizontal ellipsis
    '\u2022': '*',    # bullet
    '\u2023': '>',    # triangular bullet
    '\u2043': '-',    # hyphen bullet

    # Autres
    '\u00ad': '',     # soft hyphen (remove)
    '\u2028': '\n',   # line separator
    '\u2029': '\n\n', # paragraph separator
}

# Corrections UTF-8 mal decode en Latin-1 (Mojibake)
MOJIBAKE_PATTERNS = [
    # UTF-8 decode comme Latin-1 puis re-encode
    ('Ã©', 'e'),      # e accent aigu
    ('Ã¨', 'e'),      # e accent grave
    ('Ãª', 'e'),      # e accent circonflexe
    ('Ã«', 'e'),      # e trema
    ('Ã ', 'a'),      # a accent grave
    ('Ã¢', 'a'),      # a accent circonflexe
    ('Ã¤', 'a'),      # a trema
    ('Ã®', 'i'),      # i accent circonflexe
    ('Ã¯', 'i'),      # i trema
    ('Ã´', 'o'),      # o accent circonflexe
    ('Ã¶', 'o'),      # o trema
    ('Ã¹', 'u'),      # u accent grave
    ('Ã»', 'u'),      # u accent circonflexe
    ('Ã¼', 'u'),      # u trema
    ('Ã§', 'c'),      # c cedille
    ('Å"', 'oe'),     # oe ligature
    ('Ã¦', 'ae'),     # ae ligature
    ('â€™', "'"),     # apostrophe
    ('â€"', '-'),     # tiret
    ('â€¦', '...'),   # ellipse
    ('Â°', ''),       # degree mal encode
    ('Â', ''),        # artefact Latin-1
]


def detect_encoding_issues(text: str) -> dict:
    """
    Detecte les problemes d'encodage dans le texte.

    Returns:
        dict avec statistiques des problemes detectes
    """
    issues = {
        'ligatures': 0,
        'typography': 0,
        'mojibake': 0,
        'control_chars': 0,
        'non_printable_ratio': 0.0,
    }

    # Compter les ligatures
    for char in LIGATURES:
        issues['ligatures'] += text.count(char)

    # Compter les caracteres typographiques
    for char in TYPOGRAPHY:
        issues['typography'] += text.count(char)

    # Compter les patterns mojibake
    for pattern, _ in MOJIBAKE_PATTERNS:
        issues['mojibake'] += text.count(pattern)

    # Compter les caracteres de controle (sauf newline, tab)
    control_chars = sum(1 for c in text if ord(c) < 32 and c not in '\n\r\t')
    issues['control_chars'] = control_chars

    # Ratio de caracteres non-imprimables
    if len(text) > 0:
        non_printable = sum(1 for c in text if not c.isprintable() and c not in '\n\r\t')
        issues['non_printable_ratio'] = non_printable / len(text)

    return issues


def fix_mojibake(text: str) -> str:
    """
    Tente de corriger le texte UTF-8 mal decode.
    """
    # Essayer de re-encoder/decoder
    try:
        # Si c'est du UTF-8 mal interprete comme Latin-1
        fixed = text.encode('latin-1').decode('utf-8')
        # Verifier que ca a ameliore les choses
        if detect_encoding_issues(fixed)['mojibake'] < detect_encoding_issues(text)['mojibake']:
            return fixed
    except (UnicodeDecodeError, UnicodeEncodeError):
        pass

    # Sinon, appliquer les patterns de correction
    for pattern, replacement in MOJIBAKE_PATTERNS:
        text = text.replace(pattern, replacement)

    return text


def normalize_ligatures(text: str) -> str:
    """
    Remplace les ligatures PDF par leurs caracteres individuels.
    """
    for ligature, replacement in LIGATURES.items():
        text = text.replace(ligature, replacement)
    return text


def normalize_typography(text: str, keep_french: bool = True) -> str:
    """
    Normalise les caracteres typographiques.

    Args:
        keep_french: Si True, garde les guillemets francais et apostrophes typographiques
    """
    if keep_french:
        # Version qui preserve les caracteres francais
        french_safe = TYPOGRAPHY.copy()
        # Garder les guillemets francais
        del french_safe['\u00ab']  # <<
        del french_safe['\u00bb']  # >>
        # Garder l'apostrophe typographique
        del french_safe['\u2019']  # '

        for char, replacement in french_safe.items():
            text = text.replace(char, replacement)
    else:
        for char, replacement in TYPOGRAPHY.items():
            text = text.replace(char, replacement)

    return text


def remove_control_chars(text: str) -> str:
    """
    Supprime les caracteres de controle (sauf newline, tab, carriage return).
    """
    # Garder \n, \r, \t
    return ''.join(c for c in text if ord(c) >= 32 or c in '\n\r\t')


def normalize_whitespace(text: str) -> str:
    """
    Normalise les espaces et sauts de ligne.
    """
    # Remplacer les multiples espaces par un seul
    text = re.sub(r'[ \t]+', ' ', text)

    # Supprimer les espaces en fin de ligne
    text = re.sub(r' +\n', '\n', text)

    # Limiter les sauts de ligne consecutifs a 2 max
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text


def normalize_text(text: str, keep_french: bool = True, fix_encoding: bool = True) -> str:
    """
    Applique toutes les normalisations au texte.

    Args:
        text: Texte a normaliser
        keep_french: Garder les caracteres typographiques francais
        fix_encoding: Tenter de corriger les problemes d'encodage

    Returns:
        Texte normalise
    """
    if fix_encoding:
        text = fix_mojibake(text)

    text = normalize_ligatures(text)
    text = normalize_typography(text, keep_french=keep_french)
    text = remove_control_chars(text)
    text = normalize_whitespace(text)

    # Supprimer BOM si present au debut
    if text.startswith('\ufeff'):
        text = text[1:]

    return text


def read_file_with_encoding(file_path: Path) -> tuple[str, str]:
    """
    Lit un fichier en detectant l'encodage.

    Returns:
        Tuple (contenu, encodage_detecte)
    """
    # Essayer les encodages courants dans l'ordre
    encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252', 'iso-8859-15']

    for encoding in encodings:
        try:
            content = file_path.read_text(encoding=encoding)
            return content, encoding
        except UnicodeDecodeError:
            continue

    # Fallback: lire en binaire et decoder avec remplacement
    content = file_path.read_bytes().decode('utf-8', errors='replace')
    return content, 'utf-8 (with replacements)'


def main():
    parser = argparse.ArgumentParser(
        description='Normalise l\'encodage et les caracteres d\'un fichier texte',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples:
  # Normaliser un fichier
  python normalize-text.py input.txt --output output.txt

  # Normaliser en place
  python normalize-text.py input.txt --in-place

  # Detecter les problemes sans corriger
  python normalize-text.py input.txt --detect-only

  # Depuis stdin
  cat file.txt | python normalize-text.py --stdin

  # Mode strict (remplace aussi les caracteres francais)
  python normalize-text.py input.txt --strict
"""
    )

    parser.add_argument(
        'input',
        nargs='?',
        help='Fichier texte a normaliser'
    )
    parser.add_argument(
        '--output', '-o',
        help='Fichier de sortie (defaut: stdout)'
    )
    parser.add_argument(
        '--in-place', '-i',
        action='store_true',
        help='Modifier le fichier en place'
    )
    parser.add_argument(
        '--stdin',
        action='store_true',
        help='Lire depuis stdin'
    )
    parser.add_argument(
        '--detect-only', '-d',
        action='store_true',
        help='Detecter les problemes sans corriger'
    )
    parser.add_argument(
        '--strict',
        action='store_true',
        help='Mode strict: remplacer aussi les caracteres typographiques francais'
    )
    parser.add_argument(
        '--no-fix-encoding',
        action='store_true',
        help='Ne pas tenter de corriger les problemes d\'encodage (mojibake)'
    )
    parser.add_argument(
        '--quiet', '-q',
        action='store_true',
        help='Mode silencieux (pas de statistiques)'
    )

    args = parser.parse_args()

    # Lire l'entree
    if args.stdin:
        text = sys.stdin.read()
        source = 'stdin'
        detected_encoding = 'utf-8'
    elif args.input:
        input_path = Path(args.input)
        if not input_path.exists():
            print(f"[ERREUR] Fichier non trouve: {input_path}", file=sys.stderr)
            sys.exit(1)
        text, detected_encoding = read_file_with_encoding(input_path)
        source = str(input_path)
    else:
        parser.print_help()
        sys.exit(1)

    # Detecter les problemes
    issues_before = detect_encoding_issues(text)

    if args.detect_only:
        print(f"Source: {source}")
        print(f"Encodage detecte: {detected_encoding}")
        print(f"Taille: {len(text)} caracteres")
        print()
        print("Problemes detectes:")
        print(f"  - Ligatures PDF: {issues_before['ligatures']}")
        print(f"  - Caracteres typographiques: {issues_before['typography']}")
        print(f"  - Mojibake (encodage): {issues_before['mojibake']}")
        print(f"  - Caracteres de controle: {issues_before['control_chars']}")
        print(f"  - Ratio non-imprimables: {issues_before['non_printable_ratio']:.1%}")

        if issues_before['non_printable_ratio'] > 0.3:
            print()
            print("[WARN] Plus de 30% de caracteres non-imprimables.")
            print("       Ce fichier pourrait necessiter une extraction OCR.")

        sys.exit(0)

    # Normaliser
    normalized = normalize_text(
        text,
        keep_french=not args.strict,
        fix_encoding=not args.no_fix_encoding
    )

    # Statistiques
    issues_after = detect_encoding_issues(normalized)

    if not args.quiet:
        total_fixes = (
            issues_before['ligatures'] - issues_after['ligatures'] +
            issues_before['typography'] - issues_after['typography'] +
            issues_before['mojibake'] - issues_after['mojibake'] +
            issues_before['control_chars'] - issues_after['control_chars']
        )
        print(f"[INFO] Source: {source}", file=sys.stderr)
        print(f"[INFO] Encodage detecte: {detected_encoding}", file=sys.stderr)
        print(f"[INFO] Corrections: {total_fixes} caracteres", file=sys.stderr)
        if issues_before['ligatures'] > 0:
            print(f"[INFO]   - Ligatures: {issues_before['ligatures']}", file=sys.stderr)
        if issues_before['mojibake'] > 0:
            print(f"[INFO]   - Mojibake: {issues_before['mojibake']}", file=sys.stderr)

    # Ecrire la sortie
    if args.in_place:
        if not args.input:
            print("[ERREUR] --in-place necessite un fichier d'entree", file=sys.stderr)
            sys.exit(1)
        Path(args.input).write_text(normalized, encoding='utf-8')
        if not args.quiet:
            print(f"[OK] Fichier modifie: {args.input}", file=sys.stderr)
    elif args.output:
        Path(args.output).write_text(normalized, encoding='utf-8')
        if not args.quiet:
            print(f"[OK] Fichier cree: {args.output}", file=sys.stderr)
    else:
        print(normalized)


if __name__ == '__main__':
    main()
