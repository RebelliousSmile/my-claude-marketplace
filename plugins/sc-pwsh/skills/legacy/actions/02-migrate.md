# Migrate

Apply the portable form of each construct listed by `01-scan`, one file at a time, after confirmation.

## Inputs

- Manifest from `01-scan` (required)
- `dry-run` (optional flag) — show diffs only, write nothing

## Process

### Order of application

1. Parse failures (`HIGH`), file by file.
2. Behaviour differences (`INFO`) only when the user asks for them: they do not fail, so they are never a default.

Entries marked **not verified** are never migrated.

### Per-file loop

For each file of the manifest:

1. Show the diff of every transformation planned for this file.
2. Ask for confirmation. Nothing is written without it; a refusal skips the file and moves on.
3. Keep a copy of the previous bytes. Write the file **keeping its encoding and its BOM**: read the first bytes before, write with `[System.IO.File]::WriteAllText` or `WriteAllBytes` and an explicit encoding (the default writes of `Set-Content` and `Out-File` differ between hosts, per the idioms pivot), check the first bytes after. A rewrite that changes the encoding is a failed migration.
4. Re-parse the file with the parser of each host that must accept it. On a new parse error, restore the kept bytes and report the file as failed; do not continue with it.
5. Report the file as migrated only when the re-parse is clean on every required host. A host whose binary is absent leaves the file **migrated, not verified**.

### Per-construct transformations

The portable forms come from `../references/powershell-versions.md`: apply the form listed there, no other. A construct whose row lists no portable form is reported and left to the user.

```powershell
# Before — three segments, rejected by 5.1
Join-Path $root 'logs' 'app'

# After — identical result on both hosts
Join-Path (Join-Path $root 'logs') 'app'
```

```powershell
# Before — rejected by 5.1
$utc = Get-Date -AsUTC

# After — Kind is Utc on both hosts
$utc = (Get-Date).ToUniversalTime()
```

A construct whose portable form is `not measured` in the reference (ternary, `&&`, `||`, `?.`, `??=`) is reported and left to the user. So is any transformation that needs a choice (a branch on `$PSVersionTable.PSEdition` for byte-level reads, replacing `??` where the left side has side effects): it is shown with its alternatives.

## Output

```
✅ sc-pwsh migrate

Migrated: <n> files (parse clean on 5.1 and 7)
Migrated, not verified: <n> files (<host> parser absent)
Skipped (refused): <n> files
Failed (restored): <n> files
```
