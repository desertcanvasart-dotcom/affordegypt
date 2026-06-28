# Entrance-fees bulk-import template

Fill `entrance-fees-template.csv` (one row per site, all cities in one file)
and hand it to a maintainer to import — or add them one at a time in the
browser at **/admin → Entrance Fees**. Entrance fees live in the
`entrance_fees` table (separate from `service_catalog`) and are priced
**per person, in EGP**. See `docs/SERVICES_ARCHITECTURE.md`.

## Columns

| Column | Required | Meaning | Example |
|---|---|---|---|
| `name` | yes | Site name shown to customers | `Karnak Temple` |
| `city` | yes | Booking city it belongs to | `Luxor` |
| `price_per_person` | yes | Final price charged per traveler, EGP (**incl. profit**) | `660` |
| `student_price` | no | Student rate — stored in `notes` | `330` |
| `notes` | no | Extra note (hours, what's included) | `Open daily 6am–5:30pm` |

## Pricing

Enter **one flat price per person** — the final amount charged, with your
profit already included. (There is intentionally no percentage markup: a
flat % is too coarse for high-value tickets.) It is stored in
`price_per_person`; the legacy `base_price`/`markup_percent` columns are
mirrored to the same value / zeroed for compatibility.

## Rules

- One row per site; `city` keeps cities apart (no per-city files).
- `city` must match a booking city (case-insensitive) for the fee to appear
  in the planner.
- Currency is EGP; prices are per person.
- Uniqueness key is `city + name` — no duplicate name+city rows.

## Import

Bulk: a maintainer runs the importer, which backs up the current
`entrance_fees` rows and then replaces them. Per-row: use the **Entrance
Fees** admin page (add/edit/delete). The example values above are
illustrative — replace with real published rates.
