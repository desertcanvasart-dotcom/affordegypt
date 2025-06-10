CREATE TABLE "add_ons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"unit_type" text NOT NULL,
	"city_id" integer,
	"category" text NOT NULL,
	"image" text,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "attractions" (
	"id" serial PRIMARY KEY NOT NULL,
	"city_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"duration" integer DEFAULT 2,
	"ticket_price" numeric(10, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"image" text,
	"coordinates" text,
	"best_time_to_visit" text,
	"capacity" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"quote_id" integer,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text,
	"stripe_payment_intent_id" text,
	"payment_status" text DEFAULT 'pending',
	"booking_status" text DEFAULT 'confirmed',
	"booking_reference" text NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"total_amount" numeric(10, 2) NOT NULL,
	"confirmation_email_sent" boolean DEFAULT false,
	"reminder_email_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image" text,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "cities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "guide_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"city_id" integer NOT NULL,
	"language" text NOT NULL,
	"hourly_price" numeric(10, 2) NOT NULL,
	"name" text NOT NULL,
	"rating" numeric(3, 2),
	"image" text
);
--> statement-breakpoint
CREATE TABLE "license_classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"surcharge_pct" numeric(5, 4) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"json_blob" jsonb NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"commission_pct" numeric(5, 4) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" text NOT NULL,
	"customer_location" text,
	"rating" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"trip_date" timestamp,
	"is_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_city_id" integer NOT NULL,
	"to_city_id" integer NOT NULL,
	"from_location" text,
	"to_location" text,
	"name" text,
	"km" numeric(8, 2) NOT NULL,
	"base_price_by_vehicle" jsonb NOT NULL,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" text PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"city_id" integer NOT NULL,
	"hours" integer NOT NULL,
	"base_price_by_vehicle" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"role" text DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true,
	"email_verified" boolean DEFAULT false,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicle_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"pax_min" integer NOT NULL,
	"pax_max" integer NOT NULL,
	"image" text
);
--> statement-breakpoint
ALTER TABLE "add_ons" ADD CONSTRAINT "add_ons_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attractions" ADD CONSTRAINT "attractions_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guide_rates" ADD CONSTRAINT "guide_rates_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_from_city_id_cities_id_fk" FOREIGN KEY ("from_city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_to_city_id_cities_id_fk" FOREIGN KEY ("to_city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_blocks" ADD CONSTRAINT "time_blocks_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");