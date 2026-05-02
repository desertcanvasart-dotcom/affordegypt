# Deployment

How AffordEgypt actually gets to production today. This is descriptive — it captures what exists, not what we wish existed. The "Known gap" section flags the main thing worth fixing later.

## Where production runs

- **Host:** Railway.
- **Trigger:** auto-deploy on every push to `main` (the `origin` is GitHub at `desertcanvasart-dotcom/affordegypt`).
- **Served at:** affordegypt.com.
- **Build:** Railway builds from the repo's [Dockerfile](Dockerfile). The `[build]` block in [railway.json](railway.json) sets `buildCommand = npm run build`; the `[deploy]` block sets `startCommand = npm start`.

That's it for the deploy pipeline. There is no preview environment, no staging, no separate prod branch.

## What auto-deploy does

On a push to `main`:

1. Railway pulls the commit and builds the Docker image.
2. The Dockerfile installs OS deps (Chromium for build-time prerendering), runs `npm ci --include=dev`, then `npm run build`.
3. `npm run build` runs the pricing-tiers snapshot script, `vite build` (which prerenders the public marketing routes via Chromium), the sitemap generator, and `esbuild` for the server bundle.
4. Dev dependencies are pruned out.
5. The container starts with `npm start`, which runs `node dist/index.js` on port 5000.

## What auto-deploy does NOT do

This is the important part. Auto-deploy:

- **Does not run `drizzle-kit push`.**
- **Does not apply any SQL file in `migrations/`.**
- **Does not run any seed.**
- Does not run `npm run db:push` (that script exists in `package.json`, but nothing in the build/start path invokes it).
- Does not run a migration runner at server boot — `server/index.ts` does not call `migrate()`.

If you merge a PR that adds a migration file, the migration is **not** applied by deploying. The deploy will succeed, the new code will start running, and any code that depends on the new schema will fail at runtime.

The current state of the production DB reflects this: there is no `__drizzle_migrations` journal table — historically, schema changes have been applied with `drizzle-kit push` against the prod `DATABASE_URL`, plus `psql` for any SQL file that contains seeds or DDL not expressible in `shared/schema.ts`.

## How to apply a schema change to production

Manual, every time. Don't rely on the deploy.

1. **Confirm the migration is merged to `main`** and the auto-deploy has finished. If the new code is running but the schema isn't applied yet, the app will be broken until you finish step 4.

2. **Get the production `DATABASE_URL`** from the Railway dashboard.

   **Which service to copy from:** the **web service** (the one running affordegypt.com), not the Postgres service.
   - The web service's `DATABASE_URL` is the value the deployed app actually reads at runtime. That's the source of truth.
   - The Postgres service has its own `DATABASE_URL` in its Variables tab. In practice the web service's variable is set to `${{ Postgres.DATABASE_URL }}` — a reference — so the two values usually match. But the web service is what you trust: if someone overrode the reference with a literal value (e.g. pointing at a different Postgres instance during a migration), only the web service's view tells you what the app is actually using.
   - Open the web service → Variables tab → resolve/reveal `DATABASE_URL` → copy it.
   - Use the public `*.proxy.rlwy.net` host (the internal `*.railway.internal` host only resolves from inside Railway).

   **Where to put it on your laptop:** a local `.env.production` file in the repo root, **not** an inline shell variable.
   - `.env.production` keeps the secret out of your shell history and out of every command you ever scroll past.
   - All `.env.*` files are gitignored by default (the only exception is `.env.example`, which is committed as a template for new contributors). Name your file anything matching that pattern — `.env.production`, `.env.staging`, `.env.local` — and you don't need to touch `.gitignore`.
   - Once it's saved, run migrations through it. Two ergonomic options:
     ```bash
     # Option A: export the file inline, run one command, then unset.
     export $(grep -v '^\s*#' .env.production | xargs) && npm run db:push

     # Option B: dotenv-cli (npm i -g dotenv-cli, one-time).
     dotenv -e .env.production -- npm run db:push
     dotenv -e .env.production -- psql "$DATABASE_URL" -f migrations/000X_name.sql
     ```

   **Handling rules — non-negotiable:**
   - **Never commit** the file. Verify with `git status` before every commit on a branch where you may have created it.
   - **Never paste** the URL into Slack, GitHub issues, PR descriptions, screenshots, or chat with an LLM (yes, including this one). If you need to share it with another teammate, share it via your password manager.
   - **Don't put it in `.env.example`.** That file is committed.
   - After you're done applying the migration, you have two reasonable choices:
     - **Paranoid:** `rm .env.production` and re-fetch from the Railway dashboard next time. Removes the local copy entirely.
     - **Pragmatic:** keep it for the next migration. Acceptable if your laptop disk is encrypted and the file is gitignored. Re-fetch if Railway rotates the credential or if you ever suspect leakage.

3. **Apply the schema change** from your local machine, with the prod URL in the environment for that one command:

   - **For schema-only changes that match `shared/schema.ts`:**
     ```bash
     DATABASE_URL="<prod-url>" npm run db:push
     ```
     `drizzle-kit push` diffs the live DB against `shared/schema.ts` and applies the DDL. It will print the planned changes and ask you to confirm. Read the plan before saying yes — `push` will happily drop a column if `shared/schema.ts` no longer mentions it.

   - **For SQL files that include seed data, custom DDL, or anything not expressible in `shared/schema.ts`** (e.g. the Phase A migration's category and trip-type seeds):
     ```bash
     psql "<prod-url>" -f migrations/000X_name.sql
     ```
     The SQL files in this repo are written to be idempotent (`CREATE TABLE IF NOT EXISTS`, `INSERT … ON CONFLICT DO NOTHING`), so re-running them on a partially-applied DB is safe. If you write a future migration, keep that property.

   For most non-trivial migrations you need both: `db:push` to apply the DDL, then `psql -f` to load the seeds.

4. **Verify.** Hit an admin page or API endpoint that exercises the new schema and confirm it loads without 500s. For Phase A this was `/admin/trip-types`, `/admin/service-categories`, `/admin/service-catalog`. Spot-check a row count from psql if it's a seed migration.

5. **Tell whoever else might deploy** that the migration is applied, so nobody re-runs it under the assumption it didn't happen. (No journal table = no programmatic way to ask the DB.)

## Known gap

The current process is push-based, not journaled. There is no `__drizzle_migrations` table on production, so the DB doesn't track which migrations it has seen. We rely on the SQL files being idempotent and on humans remembering what they ran.

Future improvement (out of scope for now, just flagging):

- Switch to journaled migrations: `drizzle-kit generate` + `drizzle-kit migrate`, with `migrations/meta/_journal.json` becoming the source of truth.
- Add a pre-deploy step that runs `drizzle-kit migrate` against the prod DB before the new image starts. Railway supports this via a release/deploy hook or a `predeploy` script.
- Until that exists, the manual process above is the contract.

## Rollback

There is no automated rollback. If a migration breaks production:

1. **Revert the code commit on `main`** (`git revert <sha> && git push origin main`). Railway auto-deploys the revert. The app is now running the previous code.
2. **Manually undo the schema change** via `psql` against the prod `DATABASE_URL`. Drop the new column, restore the old one, etc. There's no down-migration in the repo to lean on.
3. **Restore data from a backup** if rows were modified or deleted. Railway's Postgres add-on takes daily backups — find them under the Postgres service's "Backups" tab in the dashboard.

Order matters: revert the code first so the running app stops writing schema-dependent data, *then* fix the DB. If you fix the DB first while the broken code is still serving traffic, you may take more damage during the window.

## Quick reference

| What | Command / location |
|---|---|
| Deploy trigger | `git push origin main` |
| Build config | [railway.json](railway.json), [Dockerfile](Dockerfile) |
| Schema source of truth | [shared/schema.ts](shared/schema.ts) |
| Migration SQL files | [migrations/](migrations/) |
| Apply schema (DDL only) | `DATABASE_URL=… npm run db:push` |
| Apply SQL file (seeds + DDL) | `psql "$DATABASE_URL" -f migrations/000X_name.sql` |
| Prod URL source | Railway dashboard → Postgres service → Variables |
| Rollback | `git revert` + manual `psql` undo + (if needed) restore from Railway backup |
