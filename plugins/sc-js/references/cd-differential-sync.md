# SC CD differential synchronization

Canonical maintenance source: `tools/sc-cd/differential-sync.md`. It is copied to every SC-CD plugin as a shared behavioral reference; application plugins own generated project procedures and `overcode` owns transport prerequisites only.

## Manifest

An inventory is a JSON object with:

- `version: 1`;
- one content-hash `algorithm`, identical on both ends;
- `entries` sorted by normalized relative POSIX path;
- for each regular file: `path`, `type: file`, byte `size`, and content `hash`;
- for each directory: `path`, `type: directory`, and `size: 0`.

Paths are relative, slash-separated, free of `.` and `..`, and unique even under case-folding. Absolute paths, drive prefixes, backslashes, NUL, symlinks, devices, sockets, and duplicate case variants stop comparison. Exclusions are resolved before manifest creation and are identical on both sides.

## Comparison

Compare local and target inventories by path and type, then by size and content hash. Classify every entry as:

- `unchanged`: same type, size, and hash; transfer cost is zero;
- `added`: absent on target; transfer cost is the local file size;
- `modified`: different type, size, or hash; reported transfer cost is the local file size upper bound;
- `deleted`: present only on target; no transfer bytes, but deletion remains a separate guarded mutation.

The preview reports total local bytes, transferable bytes, counts, and the ordered itemized changes. Repeating comparison after the target manifest equals local yields no additions, modifications, deletions, or transferable bytes.

## Phase policy

- `staging` plus `data` or `media` may mirror local to target only with a reviewed preview, fresh backup, confirmation, content-hash comparison, resumable transport, target lock, and proven application-write quiescence for destructive operations or promotion.
- `production` plus `data` or user `media` always returns a refusal and no intended mutation. Code and schema use their stack-specific release procedure instead of this mutable-surface protocol.
- `mirror` includes previewed target-only entries as deletions. `preserve` reports them without deletion. `forbid` rejects a request that would delete.

## Transport

Prefer a verified rsync pair with checksum comparison, itemized dry-run, partial directory, protected arguments, and guarded deletion. Otherwise use a project-native manifest exchange and transfer only added or modified paths. A target unable to return a trustworthy manifest or verify the final content hash is unsupported; never replace the operation with a full archive.

Write each changed file to a target-side temporary or partial path, verify its final hash, then rename it into place. Preserve valid partials for resume, discard mismatched partials, and rebuild the target manifest after completion. Deletions run only after successful transfers and final confirmation. Any I/O or verification error disables deletion and returns nonzero.

## Promotion recovery

Promotion recovery never lowers lifecycle revision. Before the remote guard changes, resume or abandon while staging remains authoritative. After the guard changes to production, old staging invocations fail preflight; recovery finishes the local contract and envelopes while data and media remain target-authoritative.
