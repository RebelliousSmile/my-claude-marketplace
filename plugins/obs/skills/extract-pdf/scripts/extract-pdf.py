#!/usr/bin/env python3
"""
Orchestrateur d'extraction PDF multi-session.

Lance des sessions Claude Code separees pour chaque chunk,
evitant la saturation du contexte.

Inclut normalisation automatique de l'encodage apres extraction.

Usage:
    python scripts/extract-pdf.py <project-path> <source.pdf>
    python scripts/extract-pdf.py --resume <progress-file>
    python scripts/extract-pdf.py --status <progress-file>
"""

import argparse
import subprocess
import sys
import shutil
from pathlib import Path
import re
from datetime import date

# Import normalize_text functions if available
try:
    from normalize_text import normalize_text, detect_encoding_issues, read_file_with_encoding
    NORMALIZE_AVAILABLE = True
except ImportError:
    NORMALIZE_AVAILABLE = False


def get_project_root():
    """Get the project root directory."""
    return Path(__file__).parent.parent


def validate_pdf(pdf_path: Path) -> tuple[bool, str]:
    """Validate that PDF is readable."""
    if not pdf_path.exists():
        return False, f"File not found: {pdf_path}"

    if not pdf_path.suffix.lower() == '.pdf':
        return False, f"Not a PDF file: {pdf_path}"

    # Try to read first bytes
    try:
        with open(pdf_path, 'rb') as f:
            header = f.read(5)
            if header != b'%PDF-':
                return False, f"Invalid PDF header: {pdf_path}"
    except Exception as e:
        return False, f"Cannot read file: {e}"

    return True, "OK"


def normalize_raw_files(extraction_dir: Path, quiet: bool = False) -> dict:
    """
    Normalize encoding in all raw/*.txt files.

    Args:
        extraction_dir: Path to extraction directory (contains raw/ folder)
        quiet: Suppress output if True

    Returns:
        dict with statistics of corrections made
    """
    raw_dir = extraction_dir / 'raw'
    if not raw_dir.exists():
        return {'files': 0, 'corrections': 0}

    stats = {'files': 0, 'corrections': 0, 'errors': []}

    # Try to use the normalize module directly
    if NORMALIZE_AVAILABLE:
        for txt_file in raw_dir.glob('*.txt'):
            try:
                content, encoding = read_file_with_encoding(txt_file)
                issues_before = detect_encoding_issues(content)

                normalized = normalize_text(content, keep_french=True, fix_encoding=True)

                issues_after = detect_encoding_issues(normalized)
                corrections = (
                    issues_before['ligatures'] - issues_after['ligatures'] +
                    issues_before['typography'] - issues_after['typography'] +
                    issues_before['mojibake'] - issues_after['mojibake'] +
                    issues_before['control_chars'] - issues_after['control_chars']
                )

                if corrections > 0:
                    txt_file.write_text(normalized, encoding='utf-8')
                    stats['corrections'] += corrections
                    if not quiet:
                        print(f"[INFO] Normalized {txt_file.name}: {corrections} corrections")

                stats['files'] += 1

            except Exception as e:
                stats['errors'].append(f"{txt_file.name}: {e}")
                if not quiet:
                    print(f"[WARN] Could not normalize {txt_file.name}: {e}")
    else:
        # Fallback: call the script via subprocess
        normalize_script = Path(__file__).parent / 'normalize-text.py'
        if normalize_script.exists():
            for txt_file in raw_dir.glob('*.txt'):
                try:
                    result = subprocess.run(
                        [sys.executable, str(normalize_script), str(txt_file), '--in-place', '--quiet'],
                        capture_output=True, text=True
                    )
                    if result.returncode == 0:
                        stats['files'] += 1
                    else:
                        stats['errors'].append(f"{txt_file.name}: {result.stderr}")
                except Exception as e:
                    stats['errors'].append(f"{txt_file.name}: {e}")

            if not quiet and stats['files'] > 0:
                print(f"[INFO] Normalized {stats['files']} file(s) via subprocess")
        else:
            if not quiet:
                print("[WARN] normalize-text.py not found, skipping normalization")

    return stats


def get_extraction_tool() -> str:
    """Determine best available extraction tool."""
    if shutil.which('pdftotext'):
        return 'pdftotext'

    # Try Python libraries
    try:
        import pdfplumber
        return 'pdfplumber'
    except ImportError:
        pass

    try:
        import PyPDF2
        return 'pypdf2'
    except ImportError:
        pass

    if shutil.which('tesseract'):
        return 'tesseract'

    return None


def read_progress(progress_file: Path) -> dict:
    """Parse progress.md and return status."""
    if not progress_file.exists():
        return None

    content = progress_file.read_text(encoding='utf-8')

    # Extract metadata
    source_match = re.search(r'\*\*Source\*\*:\s*(.+)', content)
    project_match = re.search(r'\*\*Project\*\*:\s*(.+)', content)
    univers_match = re.search(r'\*\*Univers\*\*:\s*(.+)', content)

    # Parse chunks table
    chunks = []
    # Chunk filename = real split-pdf.py output `<source>_partNN_pX-Y.pdf` (legacy `chunk_NN.pdf` also matched).
    rows = re.findall(r'\| ([^|]+\.pdf) \| ([^|]+) \| ([^|]+) \| (pending|done|failed) \| ([^|]+) \|', content)
    for chunk, pages, chars, status, session in rows:
        chunks.append({
            'name': chunk,
            'pages': pages.strip(),
            'chars': chars.strip(),
            'status': status.strip(),
            'session': session.strip()
        })

    return {
        'source': source_match.group(1).strip() if source_match else None,
        'project': project_match.group(1).strip() if project_match else None,
        'univers': univers_match.group(1).strip() if univers_match else None,
        'chunks': chunks,
        'file': progress_file,
        'source_name': progress_file.parent.name
    }


def find_next_chunk(progress: dict) -> str:
    """Find the next pending chunk."""
    for chunk in progress['chunks']:
        if chunk['status'] == 'pending':
            return chunk['name']
    return None


def find_failed_chunks(progress: dict) -> list:
    """Find all failed chunks for retry."""
    return [c['name'] for c in progress['chunks'] if c['status'] == 'failed']


def update_progress(progress_file: Path, chunk_name: str, status: str):
    """Update a chunk's status in progress.md."""
    content = progress_file.read_text(encoding='utf-8')
    today = date.today().isoformat()

    # Replace the chunk's status (handle both pending and failed)
    pattern = rf'(\| {re.escape(chunk_name)} \| [^|]+ \| [^|]+ \|) (?:pending|failed) (\| [^|]+ \|)'
    replacement = rf'\1 {status} | {today} |'
    new_content = re.sub(pattern, replacement, content)

    if new_content == content:
        print(f"[WARN] Could not update status for {chunk_name}")
    else:
        progress_file.write_text(new_content, encoding='utf-8')


def git_stash_push(repo_path: Path, name: str) -> bool:
    """Create a git stash for rollback."""
    try:
        result = subprocess.run(
            ['git', '-C', str(repo_path), 'stash', 'push', '-m', f'pre-extraction-{name}'],
            capture_output=True, text=True
        )
        return result.returncode == 0
    except Exception as e:
        print(f"[WARN] Git stash failed for {repo_path}: {e}")
        return False


def git_stash_pop(repo_path: Path) -> bool:
    """Restore from git stash (rollback)."""
    try:
        subprocess.run(['git', '-C', str(repo_path), 'checkout', '.'], check=True)
        subprocess.run(['git', '-C', str(repo_path), 'stash', 'pop'], check=True)
        return True
    except Exception:
        return False


def git_commit(repo_path: Path, message: str) -> bool:
    """Commit changes and drop stash."""
    try:
        subprocess.run(['git', '-C', str(repo_path), 'add', '.'], check=True)
        subprocess.run(['git', '-C', str(repo_path), 'commit', '-m', message], check=True)
        subprocess.run(['git', '-C', str(repo_path), 'stash', 'drop'], capture_output=True)
        return True
    except Exception:
        return False


def run_claude_session(prompt: str, description: str, max_retries: int = 1) -> bool:
    """Run a Claude Code session with the given prompt."""
    print(f"\n{'='*60}")
    print(f"[INFO] {description}")
    print(f"{'='*60}\n")

    for attempt in range(max_retries + 1):
        try:
            result = subprocess.run(
                ['claude', '-p', prompt],
                check=True,
                text=True
            )
            return True
        except subprocess.CalledProcessError as e:
            if attempt < max_retries:
                print(f"[WARN] Attempt {attempt + 1} failed, retrying...")
            else:
                print(f"[ERROR] Session failed after {max_retries + 1} attempts: {e}")
                return False
        except FileNotFoundError:
            print("[ERROR] 'claude' command not found. Is Claude Code installed?")
            return False

    return False


def setup_extraction(project_path: str, source_pdf: str) -> Path:
    """Run Phase A: Setup extraction."""
    root = get_project_root()
    source_path = Path(source_pdf)

    # Validate PDF first
    valid, msg = validate_pdf(source_path)
    if not valid:
        print(f"[ERROR] {msg}")
        return None

    # Check extraction tools
    tool = get_extraction_tool()
    if not tool:
        print("[ERROR] No PDF extraction tool available.")
        print("Install one of: poppler-utils (pdftotext), pdfplumber, PyPDF2, tesseract")
        return None
    print(f"[INFO] Using extraction tool: {tool}")

    source_name = source_path.stem
    extraction_dir = root / "docs" / "extraction" / source_name
    progress_file = extraction_dir / "progress.md"

    if progress_file.exists():
        print(f"[INFO] Extraction already started: {progress_file}")
        print("[INFO] Use --resume to continue")
        return progress_file

    # Run setup session
    prompt = f"""@docs/prompts/workshop/extract.prompt.md {project_path} {source_pdf}

Execute Phase A only:
1. Validate environment
2. Create extraction workspace
3. Split PDF into chunks
4. Create progress.md
5. END SESSION after creating progress.md

Extraction tool available: {tool}
Do NOT process any chunks in this session."""

    success = run_claude_session(prompt, f"Setup extraction: {source_name}")

    if success and progress_file.exists():
        return progress_file
    else:
        print("[ERROR] Setup failed - progress.md not created")
        return None


def extract_chunk(progress: dict, chunk_name: str, retry: bool = False) -> bool:
    """Run Phase B: Extract single chunk."""
    # id = NN from `<source>_partNN_pX-Y.pdf` (or legacy `chunk_NN.pdf`)
    m = re.search(r'_part(\d+)', chunk_name) or re.search(r'chunk_(\d+)', chunk_name)
    chunk_num = m.group(1) if m else chunk_name

    action = "Retrying" if retry else "Extracting"

    prompt = f"""Reprendre: {progress['file']}

Extract chunk {chunk_name} (chunk number {chunk_num}):
1. Load and extract text
2. Classify content
3. Save to classified/ files
4. Update progress.md
5. END SESSION

Context from progress.md:
- Univers: {progress['univers']}
- Project: {progress['project']}"""

    # Retry with max_retries
    success = run_claude_session(prompt, f"{action} {chunk_name}", max_retries=1 if retry else 0)

    if success:
        # Normalize raw text files after successful extraction
        extraction_dir = progress['file'].parent
        normalize_raw_files(extraction_dir, quiet=False)

        update_progress(progress['file'], chunk_name, 'done')
    else:
        update_progress(progress['file'], chunk_name, 'failed')

    return success


def discover_domain_root(start: Path) -> Path | None:
    """
    Discover the JDR domain root R by walking up from `start` until a
    directory containing one of the markers `_campagnes/`, `_univers/` or
    `_pjs/` is found.

    No global path, no per-machine config: R is found locally relative to
    the reference directory. See references/domain-layout.md (§ JDR profile).
    """
    start = start.resolve()
    markers = ('_campagnes', '_univers', '_pjs')
    for p in [start, *start.parents]:
        if any((p / m).is_dir() for m in markers):
            return p
    return None


def resolve_by_game_paths(progress: dict) -> dict:
    """
    Resolve by-game paths from the local domain root R.

    R is discovered by walking up from the progress file's location (the
    extraction lives under the project dir, itself under R) until a
    `_campagnes/`/`_univers/`/`_pjs/` marker is found — no global vault path.
    progress['univers'] gives the target universe slug.
    Returns dict with 'R', 'univers_root', 'systeme_root', 'project_root'.
    """
    univers = progress.get('univers', '') or ''
    project_str = progress.get('project', '') or ''

    # Reference directory: where the extraction (progress.md) lives.
    progress_file = progress.get('file')
    ref = Path(progress_file).parent if progress_file else Path.cwd()

    R = discover_domain_root(ref)
    if R is None:
        print(f"[WARN] Could not discover domain root R (no _campagnes/_univers/_pjs marker found from {ref})")
        return {'R': None, 'univers_root': None, 'systeme_root': None, 'project_root': None}

    univers_root = R / '_univers' / univers if univers else None
    systeme_root = R / '_systeme'
    # project_root: the writing-project dir, relative to R when known.
    project_root = (R / project_str) if project_str else ref

    if univers_root and not univers_root.exists():
        print(f"[WARN] <univers-root> not found at {univers_root} (will be created on distribute if needed)")

    return {
        'R': R,
        'univers_root': univers_root,
        'systeme_root': systeme_root,
        'project_root': project_root,
    }


def distribute_content(progress: dict) -> bool:
    """Run Phase C: Distribute extracted content with git stash."""
    source_name = progress['source_name']
    paths = resolve_by_game_paths(progress)

    R = paths['R']
    univers_root = paths['univers_root']
    systeme_root = paths['systeme_root']
    project_root = paths['project_root']

    # Git stash before distribution — a single repo: the domain root R.
    stashed = []
    if R and R.exists():
        if git_stash_push(R, source_name):
            stashed.append(('R', R))
            print(f"[INFO] Stashed R: {R}")

    prompt = f"""@docs/prompts/workshop/extract-distribute.prompt.md {progress['file']}

Final distribution:
1. Merge all classified content
2. Distribute to sources/ reference destinations (not canon/)
   - Lore/terminology → <univers-root>/sources/<source-name>/
   - Rules → <systeme-root>/sources/<source-name>/
3. Generate report
4. Ask for validation before cleanup

Context:
- Univers: {progress['univers']}
- Project: {progress['project']}
- univers-root: {univers_root}
- systeme-root: {systeme_root}
- Stashed repos: {[str(p) for _, p in stashed]}"""

    success = run_claude_session(prompt, "Distributing extracted content")

    if not success and stashed:
        print("[WARN] Distribution failed. Rolling back...")
        for name, path in stashed:
            if git_stash_pop(path):
                print(f"[OK] Restored {name}: {path}")
            else:
                print(f"[ERROR] Failed to restore {name}: {path}")

    return success


def show_status(progress: dict):
    """Display current extraction status."""
    print(f"\n{'='*60}")
    print(f"Extraction: {progress['source_name']}")
    print(f"{'='*60}")
    print(f"Source:  {progress['source']}")
    print(f"Project: {progress['project']}")
    print(f"Univers: {progress['univers']}")
    print()

    pending = [c for c in progress['chunks'] if c['status'] == 'pending']
    done = [c for c in progress['chunks'] if c['status'] == 'done']
    failed = [c for c in progress['chunks'] if c['status'] == 'failed']

    print(f"Progress: {len(done)}/{len(progress['chunks'])} chunks")
    print(f"  - Done:    {len(done)}")
    print(f"  - Pending: {len(pending)}")
    print(f"  - Failed:  {len(failed)}")

    if failed:
        print(f"\nFailed chunks: {', '.join(c['name'] for c in failed)}")
        print("Use --retry to retry failed chunks")

    if pending:
        print(f"\nNext: {pending[0]['name']}")
    elif not failed:
        print("\nAll chunks done! Ready for distribution.")
        print(f"Run: python scripts/extract-pdf.py --distribute {progress['file']}")


def cleanup_extraction(progress: dict) -> bool:
    """Clean up extraction workspace. Returns False if not ready."""
    # Safety check: only cleanup if all chunks are done
    pending = [c for c in progress['chunks'] if c['status'] == 'pending']
    failed = [c for c in progress['chunks'] if c['status'] == 'failed']

    if pending or failed:
        print(f"[ERROR] Cannot cleanup: {len(pending)} pending, {len(failed)} failed chunks")
        return False

    extraction_dir = progress['file'].parent

    # Preserve the raw full text BEFORE deleting anything: assemble raw/chunk_*.txt
    # into fulltext.md kept in the (surviving) extraction dir. The distribute prompt
    # also writes fulltext.md into sources/<source>/, but this guarantees no data loss
    # even if that step was skipped. raw/ is the only verbatim copy of the document.
    raw_dir = extraction_dir / 'raw'
    if raw_dir.exists():
        chunks = sorted(raw_dir.glob('*.txt'))
        if chunks and not (extraction_dir / 'fulltext.md').exists():
            header = (f"# {extraction_dir.name} — TEXTE BRUT INTÉGRAL\n\n"
                      "> Contenu d'extraction brut (normalisé). Conservé au nettoyage. "
                      "Copie de référence ; voir aussi sources/<source>/fulltext.md.\n\n---\n\n")
            full = "\n\n".join(p.read_text(encoding='utf-8') for p in chunks)
            (extraction_dir / 'fulltext.md').write_text(header + full, encoding='utf-8')
            print(f"[OK] Preserved brut -> {extraction_dir / 'fulltext.md'}")

    # Remove temporary directories (fulltext.md already preserved above)
    for subdir in ['chunks', 'raw', 'classified']:
        path = extraction_dir / subdir
        if path.exists():
            shutil.rmtree(path)
            print(f"[OK] Removed {path}")

    # Rename progress to archive
    archive_name = f"DONE-{date.today()}.md"
    archive_path = extraction_dir / archive_name
    progress['file'].rename(archive_path)
    print(f"[OK] Archived to {archive_path}")
    return True


def main():
    parser = argparse.ArgumentParser(
        description='Orchestrate PDF extraction across multiple Claude sessions',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # New extraction
  python scripts/extract-pdf.py archipels/mon-projet source.pdf

  # Resume extraction
  python scripts/extract-pdf.py --resume docs/extraction/source/progress.md

  # Check status
  python scripts/extract-pdf.py --status docs/extraction/source/progress.md

  # Retry failed chunks
  python scripts/extract-pdf.py --retry docs/extraction/source/progress.md

  # Run distribution only
  python scripts/extract-pdf.py --distribute docs/extraction/source/progress.md

  # Normalize raw text encoding (fix ligatures, mojibake, etc.)
  python scripts/extract-pdf.py --normalize docs/extraction/source/progress.md
"""
    )
    parser.add_argument('project', nargs='?', help='Project path (e.g., archipels/mon-projet)')
    parser.add_argument('source', nargs='?', help='Source PDF file')
    parser.add_argument('--resume', metavar='PROGRESS_FILE', help='Resume from progress file')
    parser.add_argument('--status', metavar='PROGRESS_FILE', help='Show extraction status')
    parser.add_argument('--retry', metavar='PROGRESS_FILE', help='Retry failed chunks')
    parser.add_argument('--distribute', metavar='PROGRESS_FILE', help='Run distribution phase only')
    parser.add_argument('--chunk', type=int, help='Process specific chunk number only')
    parser.add_argument('--cleanup', metavar='PROGRESS_FILE', help='Clean up extraction workspace')
    parser.add_argument('--normalize', metavar='PROGRESS_FILE', help='Normalize raw text files encoding')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done')

    args = parser.parse_args()
    root = get_project_root()

    # Status mode
    if args.status:
        progress_file = Path(args.status)
        if not progress_file.is_absolute():
            progress_file = root / progress_file
        progress = read_progress(progress_file)
        if progress:
            show_status(progress)
        else:
            print(f"[ERROR] Cannot read: {progress_file}")
        sys.exit(0)

    # Cleanup mode
    if args.cleanup:
        progress_file = Path(args.cleanup)
        if not progress_file.is_absolute():
            progress_file = root / progress_file
        progress = read_progress(progress_file)
        if progress:
            cleanup_extraction(progress)
        else:
            print(f"[ERROR] Cannot read: {progress_file}")
        sys.exit(0)

    # Normalize mode
    if args.normalize:
        progress_file = Path(args.normalize)
        if not progress_file.is_absolute():
            progress_file = root / progress_file
        if progress_file.exists():
            extraction_dir = progress_file.parent
        else:
            # Maybe it's a directory path
            extraction_dir = progress_file
            if not extraction_dir.exists():
                print(f"[ERROR] Cannot find: {progress_file}")
                sys.exit(1)

        print(f"[INFO] Normalizing raw files in {extraction_dir}")
        stats = normalize_raw_files(extraction_dir, quiet=False)
        print(f"[OK] Processed {stats['files']} files, {stats['corrections']} corrections")
        if stats['errors']:
            print(f"[WARN] {len(stats['errors'])} errors occurred")
        sys.exit(0)

    # Determine progress file
    if args.resume or args.retry or args.distribute:
        progress_file = Path(args.resume or args.retry or args.distribute)
        if not progress_file.is_absolute():
            progress_file = root / progress_file
    elif args.project and args.source:
        progress_file = setup_extraction(args.project, args.source)
        if not progress_file:
            sys.exit(1)
    else:
        parser.print_help()
        sys.exit(1)

    # Load progress
    progress = read_progress(progress_file)
    if not progress:
        print(f"[ERROR] Cannot read progress file: {progress_file}")
        sys.exit(1)

    show_status(progress)

    if args.dry_run:
        print("\n[DRY-RUN] No changes made.")
        sys.exit(0)

    # Distribution only mode
    if args.distribute:
        pending = [c for c in progress['chunks'] if c['status'] == 'pending']
        failed = [c for c in progress['chunks'] if c['status'] == 'failed']
        if pending or failed:
            print(f"[ERROR] {len(pending)} pending, {len(failed)} failed chunks")
            sys.exit(1)
        if distribute_content(progress):
            cleanup_extraction(progress)
        sys.exit(0)

    # Retry mode
    if args.retry:
        failed = find_failed_chunks(progress)
        if not failed:
            print("[INFO] No failed chunks to retry")
            sys.exit(0)

        print(f"\n[INFO] Retrying {len(failed)} failed chunks...")
        for chunk_name in failed:
            if not extract_chunk(progress, chunk_name, retry=True):
                print(f"[ERROR] Retry failed for {chunk_name}")
            progress = read_progress(progress_file)
        sys.exit(0)

    # Process specific chunk
    if args.chunk:
        chunk_name = f"chunk_{args.chunk:02d}.pdf"
        if not extract_chunk(progress, chunk_name):
            sys.exit(1)
        sys.exit(0)

    # Process all pending chunks
    pending = [c for c in progress['chunks'] if c['status'] == 'pending']
    for chunk in pending:
        if not extract_chunk(progress, chunk['name']):
            print(f"[ERROR] Failed on {chunk['name']}")
            print(f"[INFO] Resume with: python scripts/extract-pdf.py --resume {progress_file}")
            print(f"[INFO] Or retry with: python scripts/extract-pdf.py --retry {progress_file}")
            sys.exit(1)

        progress = read_progress(progress_file)

    # Check for failures before distribution
    failed = find_failed_chunks(progress)
    if failed:
        print(f"\n[WARN] {len(failed)} chunks failed: {', '.join(failed)}")
        print(f"[INFO] Retry with: python scripts/extract-pdf.py --retry {progress_file}")
        sys.exit(1)

    # All chunks done - distribute
    print("\n[INFO] All chunks processed. Starting distribution...")
    if distribute_content(progress):
        cleanup_extraction(progress)
        print("\n[OK] Extraction complete!")
    else:
        print("\n[ERROR] Distribution failed. Repos were rolled back.")
        sys.exit(1)


if __name__ == '__main__':
    main()
