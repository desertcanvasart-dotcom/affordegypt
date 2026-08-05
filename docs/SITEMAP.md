# AffordEgypt — Full Site Reference

A complete inventory of every page, route, component, button, function, and API endpoint that ships in this codebase. Organised so you can use it as a checklist or quickly find where something lives.

**Scope:** 50 pages, 84 server endpoints, ~40 components (excluding shadcn `ui/` primitives).

---

## 0. What this site is and why it exists

### The business

**AffordEgypt** is the budget-tier brand of **Capital Travel Service**, a Cairo-based licensed tour operator (ETAA 2179, Commercial Registration #148004, operating since 2003). Capital Travel Service has been serving premium Egypt tours for years — multilingual guides, hotel partnerships, concierge planning, the whole package. AffordEgypt is the same operation stripped to its operational core: a private car, a licensed Egyptologist guide, and transparent base pricing.

The founder, Islam, grew up in Siwa Oasis. He built AffordEgypt because of a pattern he kept seeing: travelers were either booking $4,000 packaged tours they couldn't really afford, or rolling the dice with unverifiable WhatsApp operators. There was no honest middle ground — a real, licensed Egyptian operator selling exactly the operational essentials with no padding. That's the gap this site fills.

### The promise to the customer

> "Same licensed guides as Capital Travel Service's premium tours. Same vehicles. Same standards. Stripped down to what you actually need. Add tickets, meals, and experiences only when you want them."

Three commitments that drive every design decision:

1. **Real prices.** Server-side pricing computed from a single source of truth. No bait-and-switch. The number on the website is the number the customer pays.
2. **Real operator.** All credentials (ETAA, Commercial Registration, Tax ID) published on the homepage. The brand is verifiable, not anonymous.
3. **Real Egypt.** Licensed Ministry of Tourism Egyptologists only. Same guide roster as the premium tier.

### Who it's for

- **Budget-conscious independent travelers** — backpackers, solo adventurers, couples on a tight budget — who don't want a $4,000 packaged tour but also don't want to gamble on a stranger off Reddit.
- **Research-heavy planners** — the kind of customer who reads the cancellation policy before booking. The site optimises for trust signals over slick marketing.
- **Multi-city itinerary builders** — anyone planning to hit Cairo + Luxor + Aswan (or similar) and wanting one transparent total instead of pricing each leg separately.

### What the site actually does

Three primary user flows:

1. **Get a quote → book.** Customer picks destinations, vehicle, guide, attractions, add-ons in the Multi-City Pricing Tool. Sees a real-time price. Submits the booking. Receives a frozen, immutable quote (so the price can never change after the fact). Pays via Stripe. Gets a confirmation email.
2. **Single-route transfer booking.** Customer browses transfer routes (airport → hotel, Cairo → Alexandria, etc.), picks a vehicle and date, books in three clicks.
3. **Browse + learn.** Long-form SEO guides (Budget Travel, Street Food, Nile Valley, Sinai, Eastern/Western Deserts), service-area pages, FAQs. Funnels readers into the booking flow.

There's also a fully-functional **admin dashboard** at `/admin` for the operator side: managing cities, vehicles, routes, guides, attractions, add-ons, viewing and updating bookings, moderating reviews, importing routes via CSV.

### Why the brand frame matters in the code

The "real operator" thesis isn't just marketing — it shapes the architecture:

- **Pricing has one source of truth** (`pricing_tiers` table + `PricingService`). A previous version had four pricing engines that could disagree; that was rebuilt because inconsistent pricing destroys the trust thesis.
- **Quotes are immutable financial documents** (`quote_line_items` rows, frozen at creation). If a customer is quoted 4,500 EGP and the underlying tier price moves later, their quote still says 4,500 EGP. Customer always pays what they were quoted.
- **`/api/bookings` recomputes the total server-side** and ignores any client-supplied `totalAmount`. A customer can't tamper with the price.
- **Admin edits propagate correctly.** When an admin changes a route's price in the dashboard, the new price applies to NEW quotes only — existing customer quotes keep their original price (audit-trail preserved).
- **Real auth on admin endpoints.** Earlier versions had a fake admin login (literally `admin/admin123` in the frontend, no server validation). That's been replaced with real JWT auth where only users with `role = 'admin'` can hit write endpoints.

### Stack at a glance

- **Frontend:** React 18 + Vite (SPA) + Tailwind + shadcn/ui + wouter routing + react-i18next (English / Spanish / French / German / Arabic)
- **Backend:** Express server (TypeScript), bundled to a single file with esbuild
- **Database:** Postgres via Drizzle ORM (Railway-managed)
- **Email:** Resend (replaces SendGrid as of Apr 28, 2026)
- **Payments:** Stripe
- **Analytics:** Google Analytics + Google Tag Manager
- **Hosting:** Railway. Custom domain `affordegypt.com` points at the Railway service. Deploys on every push to `main`.

### Repository conventions

- All client code in `client/src/`, server code in `server/`, shared types/schema in `shared/`
- Pages live in `client/src/pages/`, reusable components in `client/src/components/`
- Database migrations in `migrations/` (hand-written SQL, applied via `scripts/run-sql.mjs`)
- One-shot scripts (seeds, e2e tests, admin tools) in `scripts/`
- Architectural decisions and rationale documented in `docs/HANDOFF.md` (the audit + rewrite history) and `ASSESSMENT.md` (pre-rewrite baseline)

---

## 1. Top-level shell (loads on every page)

| Element | Where | What it does |
|---|---|---|
| `<App>` | `client/src/App.tsx` | Wires QueryClientProvider, HelmetProvider, AuthProvider, TooltipProvider, Toaster, Router. Initialises Google Analytics if `VITE_GA_MEASUREMENT_ID` is set. |
| Floating WhatsApp button | bottom-right of every page | Links to `https://wa.me/201100765283` in a new tab. |
| `<Toaster>` | global | shadcn toast notifications. |
| `useAnalytics()` hook | inside Router | Fires GA pageview on every wouter route change. |

---

## 2. Public marketing pages

### Homepage — `/` (`pages/home.tsx`)

Composed of these sections in order:

1. **Navbar** (`components/navbar.tsx`)
   - Logo (clicking returns home)
   - Tagline under logo: "Operated by Capital Travel Service · ETAA 2179" (rendered from `OPERATOR` in `lib/operator-facts.ts`)
   - Desktop nav: **Destinations**, **Transfers**, **FAQs** (scrolls to `#faq`), **Language selector**
   - **WhatsApp** link (right side) — opens chat with `+20 110 0765283`
   - **Get Instant Quote** button (primary, scrolls to `#quote-builder`)
   - Mobile menu mirrors desktop, plus social media icons
   - When user is logged in: shows user dropdown with Dashboard + Sign Out
2. **Hero** (`components/hero.tsx`)
   - H1: "Real Egypt tours, from a real Egyptian operator. Real prices."
   - Subhead with `${MIN_DAILY_PRICE_USD}/day` (placeholder until Islam confirms)
   - Single CTA **Build Your Quote in 60 Seconds** → scrolls to `#quote-builder`
   - Sub-text: "No account needed. Get your price, then send to WhatsApp."
3. **CredentialsStrip** (`components/credentials-strip.tsx`) — single-line trust strip with operator, ETAA, Commercial Reg, Tax ID, since-2020, 2,500+ travelers.
4. **FounderBlock** (`components/founder-block.tsx`) — Islam's 5-paragraph note + photo at `/islam-photo.jpg` (gracefully hidden if file missing).
5. **InclusionsComparison** (`components/inclusions-comparison.tsx`) — 3-column grid: included / not included / Capital Travel Service premium adds.
6. **MultiCityPricingTool** (`components/multi-city-pricing-tool.tsx`) — see [§5](#5-multi-city-pricing-tool-design-your-egypt-adventure).
7. **AnimatedReviewCarousel** (`components/animated-review-carousel.tsx`) — auto-scrolling 5-star reviews fetched from `/api/reviews`.
8. **BlogGrid** (`components/blog-grid.tsx`) — links to the 5 long-form guides (Budget Travel, Street Food, Nile Valley, Sinai, Eastern/Western Deserts).
9. **FAQSection** (`components/faq-section.tsx`) — 7 expandable Q&As. WhatsApp / Email CTAs at the bottom. `id="faq"` is the scroll target.
10. **NewsletterSection** (`components/newsletter-section.tsx`) — "Get the Egypt Trip Calculator" subscribe form. POSTs `/api/newsletter-subscribe`.
11. **Footer** (`components/footer.tsx`) — 4 columns of links + trust block + copyright.
12. **MobileStickyCTA** (`components/mobile-sticky-cta.tsx`) — sticky bottom CTA on mobile only. **Get Quote** button + price hint.

### Service pages

| Path | Page | Purpose |
|---|---|---|
| `/transfers` | `transfers.tsx` | Browse transfer routes. Filter by city, vehicle. Each route card has a **Book Now** button → `/book?route=ID&vehicle=N&price=X`. |
| `/pricing-tool` | `pricing-tool.tsx` | Standalone version of the Multi-City Pricing Tool with a header/footer wrapper. |
| `/destinations` | `destinations.tsx` | Lists the 6 cities (Cairo, Alexandria, Luxor, Aswan, Hurghada, Sharm El Sheikh) with hero images. CTA buttons link to `/transfers` and `/travel-tips`. |
| `/attractions` | `attractions-simple.tsx` | Browse attractions (filtered by city). Each attraction shows name, description, ticket price, duration. |
| `/routes` | `routes-simple.tsx` | All routes table with vehicle pricing. Booking link goes to `/route-booking`. |
| `/routes/:category/:citySlug` | `route-city-page.tsx` | Routes scoped to one city + category (inter-city, intra-city, airport). |
| `/routes/book/:routeId` | `route-booking.tsx` | Single-route booking form. Collects customer info + travel date. POSTs `/api/route-bookings`. |
| `/route-booking` | `route-booking.tsx` | Same component, alternate URL. |

### Long-form guide pages (SEO content)

| Path | Page |
|---|---|
| `/budget-travel-egypt` | `budget-travel-egypt.tsx` |
| `/egyptian-street-food-guide` | `egyptian-street-food-guide.tsx` |
| `/nile-valley-guide` | `nile-valley-guide.tsx` |
| `/sinai-peninsula-guide` | `sinai-peninsula-guide.tsx` |
| `/eastern-western-deserts-guide` | `eastern-western-deserts-guide.tsx` |
| `/cuisine-passport` | `cuisine-passport.tsx` — interactive food bingo card |
| `/travel-tips` | `travel-tips.tsx` |

Each long-form page has its own hero (full-screen image), 5–10 content sections, and two CTAs at the end (one primary going to `/#pricing-tool`, one outline going to `/travel-tips` or similar).

### Service-area pages

For each of Cairo / Luxor / Aswan, a pair of pages:

- `/cairo-airport-transfers`, `/luxor-airport-transfers`, `/aswan-airport-transfers` (`*-airport-transfers.tsx`)
- `/cairo-car-tour-guide-services`, `/luxor-car-tour-guide-services`, `/aswan-car-tour-guide-services` (`*-guide-services.tsx`)

Each has a hero, route/service cards with pricing, FAQ, testimonials. CTAs route to the booking flow.

### Standard pages

| Path | Page |
|---|---|
| `/about` | `about.tsx` — Company story |
| `/contact` | `contact.tsx` — Contact form. POSTs `/api/contact-form` (server emails `info@affordegypt.com` + replies to user's address) |
| `/reviews` | `reviews.tsx` — Customer reviews list |
| `/submit-review` | `submit-review.tsx` — Public review submission form |
| `/booking-agreement` | `booking-agreement.tsx` |
| `/terms-of-service` | `terms-of-service.tsx` |
| `/privacy-policy` | `privacy-policy.tsx` |
| `/cookie-policy` | `cookie-policy.tsx` |
| `*` (no match) | `not-found.tsx` — 404 page |

**Note:** Most public pages are also registered in localised slug variants (`/transferi`, `/destinos`, etc.) via `createMultilingualRoute()` in `App.tsx` so search engines and users in other languages land on the right page.

---

## 3. Authentication pages

| Path | Page | Submits to |
|---|---|---|
| `/login` | `login.tsx` | POST `/api/auth/login` — returns JWT and user info. Has "Forgot password?" dialog that POSTs `/api/auth/request-reset`. Inline red field errors when submitted empty. |
| `/register` | `register.tsx` | POST `/api/auth/register` — creates a customer account. Validates email format, password ≥ 6 chars, password match. Inline red field errors. |
| `/reset-password?selector=&token=` | `reset-password.tsx` | First verifies token via POST `/api/auth/verify-reset-token`, then on submit POSTs `/api/auth/reset-password` with new password. |
| `/verify-email?token=` | `verify-email.tsx` | Hits GET `/api/auth/verify-email?token=` on mount; shows success or expired message. |

Auth state is held in `useAuth()` hook (`hooks/useAuth.ts`) — wraps `/api/auth/login`, `/api/auth/profile`, etc., and stores the JWT in `localStorage.auth_token`. The `apiRequest()` helper in `lib/queryClient.ts` automatically attaches `Authorization: Bearer <token>` to every fetch.

---

## 4. Customer dashboard — `/dashboard` (`pages/user-dashboard.tsx`)

Logged-in customers land here after login. Shows:

- Profile summary
- Booking history (fetched from `/api/bookings/:id` for their own bookings)
- Saved quotes
- Account settings link
- **Sign Out** button

---

## 5. Multi-City Pricing Tool ("Design Your Egypt Adventure")

Lives at `components/multi-city-pricing-tool.tsx`. Embedded on the homepage at `id="quote-builder"` and on the standalone `/pricing-tool` page.

Three-step wizard:

### Step 1 — Trip basics
- **Travel date** picker (date input)
- **Number of travelers** stepper (1–20)
- **Continue to Destinations →** button

### Step 2 — Destinations & activities
- City selector dropdown (only shown when no destinations chosen yet)
- Each chosen destination renders an accordion item with:
  - Day badge, city name, date
  - **TransportationSearch** (`components/transportation-search.tsx`) — pick routes for this city
  - **GuideSearch** (`components/guide-search.tsx`) — pick a guide language
  - **AttractionsSearch** (`components/attractions-search.tsx`) — multi-select attractions
  - **AddOnsSearch** (`components/addons-search.tsx`) — multi-select add-ons with quantity
  - **Remove Day** button
- **Add Day N** city selector at the bottom of the list
- Live pricing recomputes via POST `/api/pricing/calculate` on every change

### Step 3 — Review & checkout
- Summary of selections
- Per-person and total pricing breakdown
- **Build Quote** button — creates a frozen quote via POST `/api/quotes`, then routes to checkout / confirmation
- **Saved Quotes** button — opens the QuoteManager modal (load a previously-saved quote into the wizard)

---

## 6. Booking flow

### `/book` and `/book/:id` (`pages/book.tsx`)
Single-route booking page launched from `/transfers` or quote completion. Reads `route`, `vehicle`, `price` from query string. Displays:
- Selected route card
- Booking form (name, email, phone, travel date, special requests)
- **Book Now** button — POSTs to `/api/route-bookings` (server recomputes price via PricingService, ignores client price). Returns `bookingReference`.
- After successful booking → navigates to `/booking-confirmation/:reference`.

### `/checkout/:bookingId` (`pages/checkout.tsx`)
Stripe-powered checkout for an existing booking ID. Wraps `<Elements>` from `@stripe/react-stripe-js`. Steps:
- Fetches booking by ID
- Calls POST `/api/create-payment-intent` with `{ bookingId, amount }` to get a Stripe PaymentIntent client secret
- Renders `<PaymentElement>` (card input)
- **Pay $X EGP** button — confirms the payment via Stripe.js
- Webhook at POST `/api/stripe-webhook` updates booking `paymentStatus` to "paid" on success

### `/booking-confirmation/:reference` (`pages/booking-confirmation.tsx`)
Read-only confirmation page. Fetches booking by reference via GET `/api/bookings/reference/:reference`. Shows:
- Booking reference, customer info, travel dates
- Itinerary breakdown
- Total amount, payment status
- **Download PDF Confirmation** button (uses `jspdf` + `html2canvas`)

---

## 7. Admin dashboard

The admin dashboard is gated behind real JWT auth — only users with `role = 'admin'` can access. Login happens via `<AdminLogin>` (`components/admin-login.tsx`) which POSTs `/api/auth/login` and validates the role.

### `/admin` (`pages/admin-sidebar.tsx`)

Single-page admin shell with a left sidebar. Sections:

**Sidebar navigation:**
- Cities, Vehicle Types, Guides, Add-ons, Routes, Attractions, Bookings, Reviews
- Each section toggles `activeSection` state

**Top bar:**
- Logout button → clears `auth_token` + `admin-token` from localStorage

**Main panel** (per section):
- Table view of items (cities / vehicles / etc.)
- **+ Add New** button → opens AddItemModal
- Edit pencil icon per row → opens AddItemModal in edit mode
- Trash icon per row → opens delete confirmation dialog
- For routes: also has **Import CSV** button → opens import modal that POSTs `/api/routes/import-csv`

**AddItemModal** (`components/add-item-modal.tsx`):
- Renders different fields based on `modalType` (city/vehicle/guide/addon/route/attraction)
- **Save** button → POSTs (create) or PUTs (update) the right `/api/*` endpoint with the admin JWT
- **Cancel** button → closes modal

**RouteEditModal** (`components/route-edit-modal.tsx`) is a dedicated, larger modal for editing routes (more fields than the generic AddItemModal).

### `/admin/routes` (`pages/admin-routes-overview.tsx`)
Routes-by-city overview. Each city card shows route count, click navigates to `/admin/routes/city/:citySlug/:category?`.
- **+ Add Route** button → opens the route modal
- **Back to Dashboard** button → returns to `/admin`

### `/admin/routes/city/:citySlug/:category?` (`pages/admin-city-routes.tsx`)
Routes for one city. Same CRUD pattern as the main admin sidebar. Filter by category (inter-city / intra-city / airport).

### `/admin/bookings` (`pages/admin-bookings.tsx`)
List + manage all bookings.
- Filterable by status (pending, confirmed, completed, cancelled), payment status, search by name/email/reference
- Stats cards: total bookings, pending, confirmed, completed, paid revenue
- Each row has: View, Send Confirmation Email, Send Reminder Email, Update Status, Update Payment Status, Delete buttons. Each calls the corresponding `/api/bookings/:id/...` endpoint with admin JWT.
- Includes the `<AdminBookings>` modal with full booking detail view including the frozen quote breakdown.

### `/admin/reviews` (`pages/admin-reviews.tsx`)
- Lists all reviews (active + inactive)
- Approve / unapprove toggle (PATCH `/api/reviews/:id`)
- Delete button (DELETE `/api/reviews/:id`)
- Bulk **CSV upload** for reviews via `<ReviewUpload>`

### Unused admin pages
`pages/admin.tsx`, `pages/admin-working.tsx`, `pages/admin-dashboard.tsx`, `pages/attractions.tsx`, `pages/routes.tsx`, `pages/routes-overview.tsx`, `pages/booking-confirmation-broken.tsx` — leftovers from prior iterations. Not wired into `App.tsx`. Safe to delete.

---

## 8. Components reference

### Primary section components (homepage & section blocks)
| Component | File | Purpose |
|---|---|---|
| Hero | `hero.tsx` | Homepage hero |
| HeroSection | `hero-section.tsx` | Alternate two-card hero (deprecated, no longer rendered) |
| CredentialsStrip | `credentials-strip.tsx` | Trust strip under hero |
| FounderBlock | `founder-block.tsx` | Islam founder note |
| InclusionsComparison | `inclusions-comparison.tsx` | 3-column included/not/premium |
| MultiCityPricingTool | `multi-city-pricing-tool.tsx` | The wizard (1,300 lines) |
| FAQSection | `faq-section.tsx` | 7 expandable Q&As |
| NewsletterSection | `newsletter-section.tsx` | Egypt Trip Calculator subscribe |
| AboutSection | `about-section.tsx` | About-page content block |
| ContactSection | `contact-section.tsx` | Contact-page form |
| BlogGrid | `blog-grid.tsx` | Long-form guide cards |
| ServiceOverview | `service-overview.tsx` | Service cards block |
| FeaturedDestinations | `featured-destinations.tsx` | Destination cards |
| AnimatedReviewCarousel | `animated-review-carousel.tsx` | Auto-scroll reviews |
| CustomerReviews | `customer-reviews.tsx` | Static reviews grid |

### Layout / chrome
| Component | File |
|---|---|
| Navbar | `navbar.tsx` |
| Header | `header.tsx` (alternate, unused on homepage) |
| Footer | `footer.tsx` |
| MobileStickyCTA | `mobile-sticky-cta.tsx` |
| LanguageSelector | `language-selector.tsx` |
| WhatsAppWidget | `whatsapp-widget.tsx` |
| UserNav | `user-nav.tsx` |

### Booking & pricing
| Component | File |
|---|---|
| BookingWizard | `booking-wizard.tsx` (legacy quote wizard) |
| QuoteBuilderWizard | `quote-builder-wizard.tsx` (legacy alternate wizard) |
| QuoteManager | `quote-manager.tsx` (saved quotes modal) |
| PricingSidebar | `pricing-sidebar.tsx` |
| TransportationSearch | `transportation-search.tsx` |
| GuideSearch | `guide-search.tsx` |
| AttractionsSearch | `attractions-search.tsx` |
| AddOnsSearch | `addons-search.tsx` |

### Day-by-Day planner subcomponents
| Component | File |
|---|---|
| DayColumn | `day-by-day/day-column.tsx` |
| ServiceModal | `day-by-day/service-modal.tsx` |
| DayByDay PricingSidebar | `day-by-day/pricing-sidebar.tsx` |

### Admin
| Component | File |
|---|---|
| AdminLogin | `admin-login.tsx` |
| AdminBookings | `admin-bookings.tsx` (booking detail modal + table) |
| AddItemModal | `add-item-modal.tsx` |
| RouteEditModal | `route-edit-modal.tsx` |
| RoutesNavigation | `routes-navigation.tsx` |
| ReviewForm | `review-form.tsx` |
| ReviewUpload | `review-upload.tsx` (CSV import for reviews) |
| TranslationDemo | `translation-demo.tsx` (developer-only i18n preview) |

### shadcn/ui primitives
`components/ui/*.tsx` — 47 files: button, card, dialog, dropdown-menu, input, label, table, toast, tooltip, etc. These are unstyled or lightly-styled wrappers around Radix UI. The `outline` variant of `button.tsx` was customised to white-bg + primary-green hover.

---

## 9. Server endpoints (84 total)

All on the same Express server bundled to `dist/index.js`. JSON throughout. Customer-facing endpoints are public; admin write endpoints require `authenticateToken + requireAdmin` (real JWT with `role = 'admin'`).

### Auth
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create customer account |
| POST | `/api/auth/login` | Public | Login → returns JWT + user |
| POST | `/api/auth/logout` | User | Logout (client clears token) |
| GET | `/api/auth/profile` | User | Current user info |
| PUT | `/api/auth/profile` | User | Update profile fields |
| PUT | `/api/auth/change-password` | User | Change password |
| GET | `/api/auth/verify` | User | Token validity check |
| POST | `/api/auth/request-reset` | Public | Send password reset email |
| POST | `/api/auth/verify-reset-token` | Public | Validate selector+token from reset URL |
| POST | `/api/auth/reset-password` | Public | Set new password using selector+token |
| POST | `/api/auth/send-verification` | Public | Trigger email verification |
| GET | `/api/auth/verify-email` | Public | Confirm email via token in URL |
| POST | `/api/auth/resend-verification` | Public | Resend verification email |

### Catalog reads (public)
| Method | Path | Notes |
|---|---|---|
| GET | `/api/cities` | Translated via headers |
| GET | `/api/vehicle-types` | Translated |
| GET | `/api/license-classes` | Normal/Tourism |
| GET | `/api/routes` | All routes |
| GET | `/api/guide-rates` | Optionally `?cityId=` |
| GET | `/api/time-blocks?cityId=N` | Required `cityId` param |
| GET | `/api/add-ons` | Optionally `?cityId=` |
| GET | `/api/addons` | Same data, alternate path |
| GET | `/api/attractions` | Optionally `?cityId=` |
| GET | `/api/attractions/:id` | Single attraction |
| GET | `/api/reviews` | Active reviews only |
| GET | `/api/pricing/routes` | Pricing-engine derived list |
| GET | `/api/pricing/routes/:cityId` | Filtered |
| GET | `/api/pricing/languages` | Available guide languages |
| GET | `/api/pricing/addons` | Available add-ons |

### Catalog writes (admin only)
All require `Bearer <admin JWT>`:
- `POST/PUT/DELETE /api/cities`, `/api/cities/:id`
- `POST/PUT/DELETE /api/addons`, `/api/addons/:id`
- `POST/PUT/DELETE /api/attractions`, `/api/attractions/:id`
- `POST/PUT/DELETE /api/vehicle-types`, `/api/vehicle-types/:id`
- `POST/PUT/DELETE /api/guide-rates`, `/api/guide-rates/:id`
- `POST/PUT/DELETE /api/routes`, `/api/routes/:id`
- `POST /api/routes/import-csv` (multipart) — bulk route import
- `PUT /api/admin/cities/:id`, `/api/admin/routes/:id`, `/api/admin/addons/:id` (alternate admin paths)
- `GET /api/admin/dashboard-stats` — totals, average basket, etc.
- `GET /api/admin/export/cities` — CSV export
- `POST /api/admin/quotes` — create a manual quote

### Pricing
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/calculate-pricing` | Public | Live preview for the booking sidebar. Routes through `PricingService`, returns `{ subtotal, breakdown, total, perPerson, currency }` |
| POST | `/api/pricing/calculate` | Public | Multi-city wizard preview. Same `PricingService`, accepts `cityServices[]` array |

### Quotes
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/quotes` | Public | Create + freeze a quote (writes `quote_line_items`) |
| GET | `/api/quotes/:id` | Public | Read quote with frozen line items |
| GET | `/api/quotes` | Admin | List all quotes |
| DELETE | `/api/quotes/:id` | Admin | Delete a quote |

### Bookings
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/bookings` | Public | Create booking. Server recomputes total via PricingService, freezes a quote, ignores client `totalAmount` |
| POST | `/api/route-bookings` | Public | Same but for single-route bookings (resolves vehicle category strings → vehicle type IDs) |
| GET | `/api/bookings/:id` | Public | Read booking |
| GET | `/api/bookings/reference/:reference` | Public | Read by reference (for confirmation page) |
| DELETE | `/api/bookings/:id` | Admin | Delete |
| GET | `/api/admin/bookings` | Admin | List all bookings |
| PUT | `/api/bookings/:id/status` | Admin | Update bookingStatus |
| PUT | `/api/bookings/:id/payment-status` | Admin | Update paymentStatus |
| POST | `/api/bookings/:id/send-confirmation` | Admin | Trigger confirmation email |
| POST | `/api/bookings/:id/send-reminder` | Admin | Trigger reminder email |

### Reviews
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/reviews` | Public | Active reviews |
| GET | `/api/reviews/all` | Admin | All reviews (incl. inactive) |
| POST | `/api/reviews` | Public | Submit a review |
| PUT | `/api/reviews/:id` | Admin | Edit review |
| PATCH | `/api/reviews/:id` | Admin | Toggle active/featured |
| DELETE | `/api/reviews/:id` | Admin | Delete |

### Misc
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Health probe (returns `{ status: "ok" }`) |
| POST | `/api/contact-form` | Public | Sends contact form email |
| POST | `/api/newsletter-subscribe` | Public | Newsletter signup |
| POST | `/api/create-payment-intent` | Public | Stripe PaymentIntent for a given booking |
| POST | `/api/stripe-webhook` | Stripe signature | Updates booking on `payment_intent.succeeded` |

---

## 10. Email touchpoints (all via Resend now)

Defined in `server/email-service.ts` and `server/password-reset-routes.ts`:

- Booking confirmation (`sendBookingConfirmation`) — sent on booking create
- Booking reminder (`sendBookingReminder`) — manually triggered by admin
- Booking status update (`sendBookingStatusUpdate`)
- Email verification (`sendEmailVerification`)
- Admin notification (`sendAdminNotification`) — sent to `info@affordegypt.com` after every customer booking
- Password reset (`sendPasswordResetEmail`)
- Contact form (`sendContactFormEmail`)
- Newsletter signup confirmation (`sendNewsletterSubscriptionEmail`)

All use the `mailService` adapter in `server/email-client.ts` which wraps the `resend` SDK. Requires `RESEND_API_KEY` and (optionally) `FROM_EMAIL` env vars.

---

## 11. Database schema (Postgres via Drizzle)

Defined in `shared/schema.ts`. 17 tables:

- `users` — customers + admins (role column)
- `password_reset_tokens`, `email_verification_tokens` — auth flows
- `sessions` — express-session (legacy, unused since auth went JWT)
- `cities`, `vehicle_types`, `license_classes` — catalog primitives
- `routes`, `time_blocks`, `guide_rates`, `add_ons`, `attractions` — catalog
- `services` — Day-by-Day catalog
- `pricing_tiers` — single source of truth for route × vehicle × license pricing (Phase 2)
- `seasonal_modifiers`, `commission_rules` — pricing modifiers (empty by default)
- `quotes`, `quote_line_items` — frozen financial documents (Phase 2)
- `bookings`, `booking_days`, `booking_services`, `booking_adjustments` — booking records
- `reviews`

Indexes on every FK column + common filter paths. All timestamps are `timestamptz` (UTC).

See `docs/HANDOFF.md` for the full architecture context.

---

## 12. Build, deploy, and runtime

- **Frontend:** Vite (`npm run build` → `dist/public/`)
- **Backend:** esbuild bundle (`dist/index.js`)
- **Start:** `npm start` runs `node dist/index.js` (Express on `process.env.PORT`)
- **Database:** `DATABASE_URL` (Postgres). Migrations in `migrations/*.sql` applied via `node scripts/run-sql.mjs` or `npm run db:push`
- **Required env vars:** `DATABASE_URL`, `JWT_SECRET`, `SESSION_SECRET`, `APP_URL`, `RESEND_API_KEY`
- **Optional env vars:** `FROM_EMAIL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLIC_KEY`, `OPENAI_API_KEY`, `VITE_GA_MEASUREMENT_ID`, `VITE_GOOGLE_ADS_ID`
- **Hosted on:** Railway. Custom domain `affordegypt.com` points at Railway service. Auto-deploys on push to `main`.

Diagnostic and one-shot scripts in `scripts/`:
- `probe-all-endpoints.mjs` — health-check every public endpoint
- `test-booking-flow.mjs` — full e2e booking
- `seed-attractions.mjs` — data seeds
- `generate-pricing-snapshot.mjs` — build-time SEO price snapshot (reads `routes.vehicle_prices` + `guide_rates`)
- `promote-admin.mjs`, `reset-password.mjs` — user admin
- `run-sql.mjs` — apply a SQL file to DB
- `check-tz.mjs`, `verify-phase1b.mjs` — diagnostics

> Removed 2026-06-20 with the pricing-tables cleanup (see PRICING_CLEANUP.md):
> `seed-pricing-tiers.mjs`, `inspect-pricing.mjs`, `verify-phase1.mjs`,
> `test-quote-immutability.mjs`, `test-admin-tier-sync.mjs`.
