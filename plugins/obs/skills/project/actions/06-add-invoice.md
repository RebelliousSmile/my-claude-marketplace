# 06 - Add Invoice

Add an invoice or quote entry to `commercial.md`.

## Inputs

- `name` (required) - string, project folder name
- `invoice_info` (optional) - free-form invoice details

## Outputs

Updated `commercial.md` with a new row in `## Devis` and, if applicable, an updated `## Facturation` section.

## Process

1. Ask for `name` if not provided via `$ARGUMENTS`.
2. Ask for invoice details:
   - Date (default: today)
   - Subject / description
   - Amount excluding tax (HT)
   - Status: `émise` | `payée` | `en attente` | `annulée`
3. Add a row in the `## Devis` table of `Projets/<name>/commercial.md`.
4. Update `## Facturation` if the last-invoice date or next-due date needs to change.

## Test

Read `commercial.md`: `## Devis` contains a new row with today's date and the stated amount.
