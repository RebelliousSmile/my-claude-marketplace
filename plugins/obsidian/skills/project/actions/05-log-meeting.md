# 05 - Log Meeting

Add a meeting report to the appropriate project file.

## Inputs

- `name` (required) - string, project folder name
- `meeting_info` (optional) - free-form meeting details

## Outputs

New meeting report entry in the correct target file, respecting its existing format.

## Process

1. Ask for `name` if not provided via `$ARGUMENTS`.
2. Ask for meeting details:
   - Date (default: today)
   - Attendees
   - Topics discussed
   - Decisions made
   - Follow-up actions
3. Determine the target file based on project type:
   - `commercial`  → `commercial.md` (section CR Réunions)
   - `open-source` → `communication.md` (section Journal)
   - `personnel`   → `projet.md` (section Journal)
4. Add the entry using the file's existing format, with the date as the section header.

## Test

The target file contains a new dated section (e.g. `## CR — YYYY-MM-DD`) listing the attendees and decisions.
