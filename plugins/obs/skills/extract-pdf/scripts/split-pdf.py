#!/usr/bin/env python3
"""
Script pour decouper un PDF en plusieurs fichiers.
Usage: python split-pdf.py <input.pdf> [options]

Compatible Windows, Linux, macOS.
Necessite: pip install pypdf
"""

import argparse
import os
import sys
from pathlib import Path

try:
    from pypdf import PdfReader, PdfWriter
except ImportError:
    print("[ERREUR] Module 'pypdf' non installe.")
    print("[INFO] Installez-le avec: pip install pypdf")
    sys.exit(1)


class Colors:
    """ANSI color codes for terminal output."""
    GREEN = '\033[92m'
    RED = '\033[91m'
    CYAN = '\033[96m'
    YELLOW = '\033[93m'
    MAGENTA = '\033[95m'
    RESET = '\033[0m'

    @staticmethod
    def supports_color():
        """Check if terminal supports colors."""
        if os.name == 'nt':
            return True
        return hasattr(sys.stdout, 'isatty') and sys.stdout.isatty()


def print_success(msg):
    if Colors.supports_color():
        print(f"{Colors.GREEN}[OK] {msg}{Colors.RESET}")
    else:
        print(f"[OK] {msg}")


def print_error(msg):
    if Colors.supports_color():
        print(f"{Colors.RED}[ERREUR] {msg}{Colors.RESET}")
    else:
        print(f"[ERREUR] {msg}")


def print_info(msg):
    if Colors.supports_color():
        print(f"{Colors.CYAN}[INFO] {msg}{Colors.RESET}")
    else:
        print(f"[INFO] {msg}")


def print_warning(msg):
    if Colors.supports_color():
        print(f"{Colors.YELLOW}[WARN] {msg}{Colors.RESET}")
    else:
        print(f"[WARN] {msg}")


def print_header(msg):
    if Colors.supports_color():
        print(f"{Colors.MAGENTA}{msg}{Colors.RESET}")
    else:
        print(msg)


def get_pdf_info(pdf_path: Path) -> dict:
    """Get PDF metadata and page count."""
    reader = PdfReader(pdf_path)
    total_pages = len(reader.pages)

    # Estimate character count (rough: ~2500 chars per page average)
    estimated_chars = total_pages * 2500

    return {
        'total_pages': total_pages,
        'estimated_chars': estimated_chars,
        'file_size_kb': pdf_path.stat().st_size / 1024
    }


def split_by_ranges(pdf_path: Path, ranges: list[tuple[int, int]], output_dir: Path, prefix: str) -> list[Path]:
    """
    Split PDF by page ranges.

    Args:
        pdf_path: Source PDF file
        ranges: List of (start, end) tuples (1-indexed, inclusive)
        output_dir: Directory for output files
        prefix: Prefix for output filenames

    Returns:
        List of created PDF paths
    """
    reader = PdfReader(pdf_path)
    total_pages = len(reader.pages)
    created_files = []

    for i, (start, end) in enumerate(ranges, 1):
        # Validate range
        start = max(1, start)
        end = min(end, total_pages)

        if start > end:
            print_warning(f"Plage invalide ignoree: {start}-{end}")
            continue

        writer = PdfWriter()

        # Add pages (convert to 0-indexed)
        for page_num in range(start - 1, end):
            writer.add_page(reader.pages[page_num])

        # Write output file
        output_path = output_dir / f"{prefix}_part{i:02d}_p{start}-{end}.pdf"
        with open(output_path, 'wb') as f:
            writer.write(f)

        created_files.append(output_path)
        print_success(f"Cree: {output_path.name} (pages {start}-{end})")

    return created_files


def split_into_chunks(pdf_path: Path, pages_per_chunk: int, output_dir: Path, prefix: str) -> list[Path]:
    """
    Split PDF into chunks of N pages each.

    Args:
        pdf_path: Source PDF file
        pages_per_chunk: Maximum pages per chunk
        output_dir: Directory for output files
        prefix: Prefix for output filenames

    Returns:
        List of created PDF paths
    """
    reader = PdfReader(pdf_path)
    total_pages = len(reader.pages)

    # Calculate ranges
    ranges = []
    for start in range(1, total_pages + 1, pages_per_chunk):
        end = min(start + pages_per_chunk - 1, total_pages)
        ranges.append((start, end))

    print_info(f"Decoupage en {len(ranges)} parties de {pages_per_chunk} pages max")
    return split_by_ranges(pdf_path, ranges, output_dir, prefix)


def split_into_n_parts(pdf_path: Path, n_parts: int, output_dir: Path, prefix: str) -> list[Path]:
    """
    Split PDF into exactly N equal parts.

    Args:
        pdf_path: Source PDF file
        n_parts: Number of parts to create
        output_dir: Directory for output files
        prefix: Prefix for output filenames

    Returns:
        List of created PDF paths
    """
    reader = PdfReader(pdf_path)
    total_pages = len(reader.pages)

    if n_parts > total_pages:
        print_warning(f"Nombre de parties ({n_parts}) > nombre de pages ({total_pages})")
        n_parts = total_pages

    # Calculate pages per part
    base_pages = total_pages // n_parts
    extra_pages = total_pages % n_parts

    ranges = []
    current_page = 1

    for i in range(n_parts):
        # Distribute extra pages to first chunks
        chunk_size = base_pages + (1 if i < extra_pages else 0)
        end_page = current_page + chunk_size - 1
        ranges.append((current_page, end_page))
        current_page = end_page + 1

    print_info(f"Decoupage en {n_parts} parties (~{base_pages} pages chacune)")
    return split_by_ranges(pdf_path, ranges, output_dir, prefix)


def extract_single_pages(pdf_path: Path, output_dir: Path, prefix: str) -> list[Path]:
    """
    Extract each page as a separate PDF.

    Args:
        pdf_path: Source PDF file
        output_dir: Directory for output files
        prefix: Prefix for output filenames

    Returns:
        List of created PDF paths
    """
    reader = PdfReader(pdf_path)
    total_pages = len(reader.pages)

    ranges = [(i, i) for i in range(1, total_pages + 1)]

    print_info(f"Extraction de {total_pages} pages individuelles")
    return split_by_ranges(pdf_path, ranges, output_dir, prefix)


def estimate_context_chunks(pdf_path: Path, context_limit: int = 100000) -> dict:
    """
    Estimate how to split a PDF based on context window limits.

    Args:
        pdf_path: Source PDF file
        context_limit: Maximum characters per chunk (default 100k for safety margin)

    Returns:
        Dictionary with estimation details
    """
    info = get_pdf_info(pdf_path)
    total_pages = info['total_pages']
    estimated_chars = info['estimated_chars']

    # Calculate recommended chunk size
    chars_per_page = estimated_chars / total_pages if total_pages > 0 else 2500
    pages_per_chunk = max(1, int(context_limit / chars_per_page))

    # Calculate number of chunks needed
    num_chunks = (total_pages + pages_per_chunk - 1) // pages_per_chunk

    return {
        'total_pages': total_pages,
        'estimated_chars': estimated_chars,
        'chars_per_page': int(chars_per_page),
        'context_limit': context_limit,
        'recommended_pages_per_chunk': pages_per_chunk,
        'num_chunks_needed': num_chunks,
        'needs_splitting': num_chunks > 1
    }


def parse_ranges(range_str: str) -> list[tuple[int, int]]:
    """
    Parse range string like "1-10,15-20,25-30".

    Args:
        range_str: Comma-separated page ranges

    Returns:
        List of (start, end) tuples
    """
    ranges = []
    for part in range_str.split(','):
        part = part.strip()
        if '-' in part:
            start, end = part.split('-', 1)
            ranges.append((int(start.strip()), int(end.strip())))
        else:
            page = int(part)
            ranges.append((page, page))
    return ranges


def main():
    parser = argparse.ArgumentParser(
        description='Decoupe un PDF en plusieurs fichiers',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples:
  # Decoupe en chunks de 20 pages
  python split-pdf.py document.pdf --pages-per-chunk 20

  # Decoupe en 5 parties egales
  python split-pdf.py document.pdf --parts 5

  # Extrait des plages specifiques
  python split-pdf.py document.pdf --ranges "1-10,20-30,45-50"

  # Extrait chaque page separement
  python split-pdf.py document.pdf --single-pages

  # Estimation pour contexte LLM
  python split-pdf.py document.pdf --estimate --context-limit 80000
"""
    )

    parser.add_argument(
        'input',
        help='Fichier PDF source'
    )

    # Split modes (mutually exclusive)
    mode_group = parser.add_mutually_exclusive_group()
    mode_group.add_argument(
        '--pages-per-chunk', '-c',
        type=int,
        metavar='N',
        help='Decoupe en chunks de N pages maximum'
    )
    mode_group.add_argument(
        '--parts', '-n',
        type=int,
        metavar='N',
        help='Decoupe en exactement N parties egales'
    )
    mode_group.add_argument(
        '--ranges', '-r',
        type=str,
        metavar='RANGES',
        help='Extrait des plages specifiques (ex: "1-10,20-30")'
    )
    mode_group.add_argument(
        '--single-pages', '-s',
        action='store_true',
        help='Extrait chaque page separement'
    )
    mode_group.add_argument(
        '--estimate', '-e',
        action='store_true',
        help='Affiche une estimation de decoupage sans creer de fichiers'
    )

    # Options
    parser.add_argument(
        '--output-dir', '-o',
        type=str,
        default='',
        help='Repertoire de sortie (defaut: meme repertoire que le PDF)'
    )
    parser.add_argument(
        '--prefix', '-p',
        type=str,
        default='',
        help='Prefixe pour les fichiers de sortie (defaut: nom du PDF source)'
    )
    parser.add_argument(
        '--context-limit', '-l',
        type=int,
        default=100000,
        help='Limite de caracteres pour estimation (defaut: 100000)'
    )
    parser.add_argument(
        '--info', '-i',
        action='store_true',
        help='Affiche les informations du PDF et quitte'
    )

    args = parser.parse_args()

    # Header
    print_header("\n========================================")
    print_header("  PDF Splitter")
    print_header("========================================\n")

    # Validate input file
    input_path = Path(args.input).resolve()

    if not input_path.exists():
        print_error(f"Fichier non trouve: {input_path}")
        return 1

    if not input_path.suffix.lower() == '.pdf':
        print_warning(f"Le fichier n'a pas l'extension .pdf: {input_path.name}")

    print_info(f"Source: {input_path.name}")

    # Get PDF info
    try:
        info = get_pdf_info(input_path)
    except Exception as e:
        print_error(f"Impossible de lire le PDF: {e}")
        return 1

    print_info(f"Pages: {info['total_pages']}")
    print_info(f"Taille: {info['file_size_kb']:.1f} KB")
    print_info(f"Caracteres estimes: ~{info['estimated_chars']:,}")

    # Info only mode
    if args.info:
        return 0

    # Estimate mode
    if args.estimate:
        print_header("\n--- Estimation pour contexte LLM ---")
        estimation = estimate_context_chunks(input_path, args.context_limit)

        print_info(f"Limite de contexte: {estimation['context_limit']:,} caracteres")
        print_info(f"Caracteres/page estimes: ~{estimation['chars_per_page']:,}")
        print_info(f"Pages recommandees par chunk: {estimation['recommended_pages_per_chunk']}")
        print_info(f"Nombre de chunks necessaires: {estimation['num_chunks_needed']}")

        if estimation['needs_splitting']:
            print_warning("Decoupage recommande pour ce PDF")
            print(f"\nCommande suggeree:")
            print(f"  python split-pdf.py \"{args.input}\" --pages-per-chunk {estimation['recommended_pages_per_chunk']}")
        else:
            print_success("Le PDF peut etre traite en une seule fois")

        return 0

    # Setup output directory
    if args.output_dir:
        output_dir = Path(args.output_dir).resolve()
    else:
        output_dir = input_path.parent

    output_dir.mkdir(parents=True, exist_ok=True)
    print_info(f"Sortie: {output_dir}")

    # Setup prefix
    prefix = args.prefix if args.prefix else input_path.stem

    # Execute split based on mode
    created_files = []

    try:
        if args.pages_per_chunk:
            created_files = split_into_chunks(input_path, args.pages_per_chunk, output_dir, prefix)

        elif args.parts:
            created_files = split_into_n_parts(input_path, args.parts, output_dir, prefix)

        elif args.ranges:
            ranges = parse_ranges(args.ranges)
            created_files = split_by_ranges(input_path, ranges, output_dir, prefix)

        elif args.single_pages:
            created_files = extract_single_pages(input_path, output_dir, prefix)

        else:
            # Default: show help
            print_warning("Aucun mode de decoupage specifie")
            print_info("Utilisez --help pour voir les options disponibles")
            print_info("Ou --estimate pour obtenir une recommandation")
            return 0

    except Exception as e:
        print_error(f"Erreur durant le decoupage: {e}")
        return 1

    # Summary
    if created_files:
        print_header("\n========================================")
        print_success(f"{len(created_files)} fichier(s) cree(s)")
        print_header("========================================\n")

        total_size = sum(f.stat().st_size for f in created_files) / 1024
        print_info(f"Taille totale: {total_size:.1f} KB")

    return 0


if __name__ == '__main__':
    sys.exit(main())
