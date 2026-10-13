BEGIN;
CREATE TABLE IF NOT EXISTS travel_packages (
 id serial PRIMARY KEY,
 slot integer NOT NULL UNIQUE CHECK (slot BETWEEN 1 AND 3),
 slug text NOT NULL UNIQUE,
 title text NOT NULL DEFAULT '', summary text NOT NULL DEFAULT '', description text NOT NULL DEFAULT '',
 image_url text NOT NULL DEFAULT '', duration_days integer NOT NULL DEFAULT 1 CHECK (duration_days BETWEEN 1 AND 60),
 nights integer NOT NULL DEFAULT 0 CHECK (nights >= 0 AND nights < duration_days),
 itinerary jsonb NOT NULL DEFAULT '[]', inclusions jsonb NOT NULL DEFAULT '[]', exclusions jsonb NOT NULL DEFAULT '[]',
 booking_terms text NOT NULL DEFAULT '', per_person_rates jsonb NOT NULL DEFAULT '{}',
 single_supplement numeric(10,2) CHECK (single_supplement >= 0),
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
 version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS package_booking_requests (
 request_key text PRIMARY KEY, request_hash text NOT NULL,
 booking_id integer NOT NULL REFERENCES bookings(id)
);
COMMIT;
