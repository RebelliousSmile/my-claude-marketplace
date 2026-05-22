# Dependency Risk Signals — foresee

Full catalogue of risk signals for `analyze-dep`. Each signal maps to a severity level and a concrete detection method.

---

## Maintenance signals

| Signal | Severity | Detection |
|---|---|---|
| Last release > 18 months ago | 🔴 Will break | `npm view <pkg> time.modified` / `composer show <pkg>` — compare to today |
| Last release 9–18 months ago | 🟡 Will degrade | Same as above |
| Solo maintainer (1 person) | 🟡 Will degrade | `npm view <pkg> maintainers` — count entries |
| "No longer maintained" notice in README or package description | 🔴 Will break | Read package README; look for deprecation / archive notice |
| Repository archived on GitHub/GitLab | 🔴 Will break | Check repository page or `gh repo view <owner/repo> --json isArchived` |
| 0 commits in last 12 months | 🟡 Will degrade | `gh api repos/<owner>/<repo>/commits?since=<1-year-ago> | jq length` |
| Open issues > closed issues ratio > 3:1 | 🟢 Latent debt | GitHub/GitLab issue search |
| No response to issues in > 60 days | 🟡 Will degrade | Check last-commented date on open issues |

---

## Security surface signals

| Signal | Severity | Detection |
|---|---|---|
| Known unpatched critical CVE | 🔴 Will break | `npm audit --json` / `composer audit` / OSV.dev API |
| Known unpatched high CVE | 🟡 Will degrade | Same as above |
| Patched CVE — update not applied in project | 🟡 Will degrade | Compare project version vs. patched version in advisory |
| Transitive depth > 5 | 🟢 Latent debt | `npm ls <pkg> --all --json` depth count; `cargo tree -p <pkg>` |
| Requires broad file system permissions | 🟡 Will degrade | Check package README / install scripts for `postinstall`, `preinstall` |
| Uses `eval()` or `exec()` internally | 🟡 Will degrade | Audit package source or flag from security advisory |
| Accesses network at install time | 🔴 Will break | Look for `postinstall` scripts making HTTP calls |

---

## Lock-in signals

| Signal | Severity | Detection |
|---|---|---|
| Imported in > 20 files without an abstraction layer | 🔴 Will break | `rg -c "import.*<pkg>\|require.*<pkg>" | awk -F: 'sum += $2 END {print sum}'` |
| Framework-level coupling (imported in > 50% of source files) | 🔴 Will break | Same as above, computed against total file count |
| No maintained alternatives available | 🟡 Will degrade | Manual research; check npm/Packagist/crates.io for alternatives |
| API surface > 200 exported symbols (large API) | 🟢 Latent debt | `npm view <pkg> exports` or inspect `index.d.ts` |
| Proprietary or non-standard API (no web standard equivalent) | 🟡 Will degrade | Check if package wraps a standard API (e.g., fetch, IndexedDB) or exposes a bespoke one |
| Vendor lock-in to a paid/cloud service | 🟡 Will degrade | Package README or description mentions a specific SaaS, cloud provider, or paid tier |

---

## Version drift signals

| Signal | Severity | Detection |
|---|---|---|
| Project uses a version ≥ 2 major versions behind latest | 🟡 Will degrade | `npm outdated` / `composer outdated` / `cargo outdated` |
| Breaking changes in latest major not yet adopted | 🔴 Will break | Check CHANGELOG or migration guide for the gap |
| `*` or `latest` pinning in manifest | 🔴 Will break | Grep manifest for `"*"` or `"latest"` as version value |
| Floating minor version (`^`) with known breaking minor release | 🟡 Will degrade | Compare `^x.y.z` resolution range against known breaking releases in CHANGELOG |

---

## Ecosystem signals

| Signal | Severity | Detection |
|---|---|---|
| Package not in official registry (custom npm/Packagist/crates.io) | 🟡 Will degrade | Check registry URL in manifest or `.npmrc`/`composer.json` repositories |
| Fork of abandoned project with low star/download count | 🟡 Will degrade | Check fork history on GitHub; compare download counts |
| Package name squatting risk (near-name of popular package) | 🔴 Will break | Compare package name to well-known alternatives — typosquatting risk |
| License incompatibility with project license | 🔴 Will break | `license-checker --json` (Node) / `composer licenses` (PHP); compare against project license |
