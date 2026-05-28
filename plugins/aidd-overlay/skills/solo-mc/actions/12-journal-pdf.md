# 12 - Journal PDF

Convert a session journal Markdown file to a formatted LaTeX/PDF document.

## Inputs

- `source` (required) — string, path to the session Markdown file
- `universe` (optional, default: detected from config.yaml) — string, universe name for theming
- `output` (optional, default: same folder as source, `.pdf` extension) — string, output PDF path
- `open` (optional, default: `false`) — boolean, open the PDF in the system viewer after build

## Outputs

PDF file at the `output` path.

## Process

1. Verify `source` file exists; error if not.
2. Detect `universe` from `<campaign>/config.yaml` via `.current-session` if not provided.
3. Invoke `narrateur-latex-agent` to convert the Markdown source to LaTeX with universe theming applied.
4. Run the build script (`build-pdf.ps1` on Windows, `build-pdf.sh` on Unix) to compile LaTeX → PDF.
5. If `open` is true, open the PDF with the system default viewer.
6. Confirm success with the output path and file size.

## Test

PDF file exists at the expected output path after the action completes.
