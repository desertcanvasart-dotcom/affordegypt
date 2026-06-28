# Updating catalog transfer prices from a CSV

Use `scripts/update-catalog-prices.mjs` to refresh `service_catalog`
vehicle prices for one city from a price sheet. It updates rows **in place**
— slug, id, name, and trip-type are preserved; only the sedan/minivan/van
numbers change. (The old `scripts/import-catalog-from-xlsx.ts` is
**insert-only** and can never update existing prices — see
`docs/SERVICES_ARCHITECTURE.md`.)

## CSV format

```
Route,sedan,minivan,van
<notes row — ignored>
Station ↔ Hotel,870,1025,1265
Hotel → Aswan,4855,7385,10945
...
```

- Row 1 = header, row 2 = notes (skipped), row 3+ = data.
- Prices in EGP. Arrows/format don't matter for the price update — rows are
  matched to existing catalog rows by name, and the existing trip-type is
  kept regardless of how the new sheet writes it.
- Default path: `data/catalog-import/<City>.csv` (e.g. `data/catalog-import/Aswan.csv`).

## Two-phase workflow

### 1. Plan (no writes)

```
node scripts/update-catalog-prices.mjs aswan
```

Prints a review table and writes `data/catalog-import/aswan.plan.json`:

- **auto-matched** — exact name-signature matches; these will be PATCHed.
- **needs review** — rows the matcher couldn't confidently place (genuine
  renames or brand-new routes), each with the top existing-row suggestions.
- **prod rows NOT in CSV** — existing rows the sheet doesn't mention.

For each `needsReview` entry in the plan file, set:

- `"action": "update"` + `"targetId": <existing row id>` — to repoint a
  renamed sheet row onto an existing catalog row, **or**
- `"action": "insert"` — to create a new row (tweak `insert.name`,
  `insert.category`, `insert.tripType` as needed), **or**
- `"action": "skip"` — leave it out (default).

### 2. Apply (writes to prod)

```
APPLY=1 STAMP=2026-06-28 node scripts/update-catalog-prices.mjs aswan
```

- Backs up the city's current prices to
  `backups/<city>-prices-backup-<STAMP>.json` first.
- PATCHes all matched rows and inserts any `action:"insert"` rows via the
  admin API (schema-validated), then you can re-run the plan to verify
  (everything should show `(no change)`).

## Auth / target

The apply path logs in via the admin API. Credentials and host come from
`.env.production` (loaded with override over `.env`): `APP_URL`,
`ADMIN_USERNAME`/`ADMIN_EMAIL`, `ADMIN_PASSWORD`. The `.env` admin password
is dev-only and will 401 against prod. `APP_URL`/`DATABASE_URL` point at the
live production system — there is no separate dev DB.

Catalog prices are read live from the DB, so changes are effective
immediately; no redeploy is needed.
