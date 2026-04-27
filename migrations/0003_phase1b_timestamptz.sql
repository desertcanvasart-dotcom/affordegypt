-- Phase 1b: Convert all timestamp columns to timestamptz.
-- Server timezone is UTC, so existing values are already UTC; the USING
-- clause interprets them as UTC and re-stores as timestamptz. No shift.
-- Idempotent: ALTER ... TYPE timestamptz on a column already of that type
-- is a no-op in Postgres when the underlying type matches.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT table_schema, table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type = 'timestamp without time zone'
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ALTER COLUMN %I TYPE timestamptz USING %I AT TIME ZONE ''UTC''',
      r.table_schema, r.table_name, r.column_name, r.column_name
    );
  END LOOP;
END $$;
