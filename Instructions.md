# Instructions & Documentation

## Table of Contents
1. [Pricing Synchronization Fix](#pricing-synchronization-fix)
2. [Booking Flow & UX Guide](#booking-flow--ux-guide)

---

# Pricing Synchronization Fix

## 🚨 Critical Problem  
**Frontend displays 1500 EGP for Cairo ↔️ Alexandria, but database & admin dashboard show 4800-7500 EGP**

[Previous pricing documentation content preserved above...]

---

# Booking Flow & UX Guide

*Added: October 7, 2025*

## Business Model Overview

**AffordEgypt** is a commission-based travel platform specializing in **private services only** for Egypt tourism. The platform focuses on transparent pricing and comprehensive multi-day itinerary planning.

### Core Service Types

1. **Private Transportation**
   - Inter-city transfers (Cairo ↔ Luxor, Cairo ↔ Aswan, etc.)
   - Intra-city tours (pyramids tour, desert safari, etc.)
   - Vehicle types: Sedan (1-2 pax), Minivan (3-8 pax), Van (9+ pax)
   - Pricing varies by route type: Transfer, Day Trip, Overnight, Multi-day

2. **Multilingual Tour Guides**
   - Languages: English, Spanish, French, German, Italian, Japanese, Chinese, Arabic
   - Pricing: Daily rates (typically 8-hour service)
   - Specialties: Historical sites, cultural tours, archaeological sites, photography tours

3. **Attractions & Site Visits**
   - Entrance tickets to major attractions
   - Per-person pricing
   - Categories: Museums, Temples, Historical Sites, Natural Wonders

4. **Add-ons & Experiences**
   - Meals (breakfast, lunch, dinner packages)
   - Activities (felucca rides, desert safaris, snorkeling)
   - Equipment rentals
   - Per-person or per-trip pricing

### Revenue Model
- Commission-based (commission percentage applied to total booking amount)
- Transparent pricing shown to customers
- No hidden fees

---

## 5-Step Booking Flow

### **STEP 1: Trip Overview** ✅ COMPLETE
**Purpose**: Capture basic trip parameters that apply to the entire journey

**User Inputs:**
- **Travel Start Date**: When the trip begins
- **Number of Travelers**: Total passengers (1-10+)
- **Trip Style**: Private services only (no shared option)

**Validation:**
- Date must be present
- Travelers must be selected
- Cannot proceed without both inputs

**UX Pattern:**
- Clean card-based layout
- Large, easy-to-tap inputs
- Clear call-to-action: "Continue to Destinations"

**Technical Implementation:**
- State: `travelDate`, `globalTravelers`, `tripStyle`
- Component: `multi-city-pricing-tool.tsx` lines 606-684

---

### **STEP 2: Destinations** ✅ COMPLETE
**Purpose**: Build a day-by-day itinerary with services for each destination

**User Flow:**
1. **Add Destination/Day**
   - Click "Add Destination" to create a new day in the itinerary
   - Each day has: City, Date, Number of travelers

2. **Select City**
   - Dropdown selector shows available cities (Cairo, Luxor, Aswan, Alexandria, etc.)
   - Automatically filters services for that city

3. **Add Services (Per Day)** - Collapsible accordion UI:

   a. **Transfer Routes** (Required for meaningful pricing)
      - Shows routes that START from the selected city
      - Includes inter-city transfers (Cairo → Luxor) and intra-city tours (Pyramids Tour)
      - Multi-select capability
      - Displays: Route name, distance, trip type badge
      - Automatic vehicle selection based on travelers:
        - 1-2 travelers → Sedan
        - 3-8 travelers → Minivan
        - 9+ travelers → Van

   b. **Tour Guide** (Optional)
      - Select language from available options
      - Choose duration (4-hour, 8-hour, or custom)
      - Shows daily rate, guide rating, and specialties
      - Single selection per day

   c. **Attractions & Sites** (Optional)
      - Filter by category (Museums, Temples, Historical Sites)
      - Shows ticket price, duration, opening hours
      - Multi-select capability
      - City-specific attractions only

4. **Remove Day**
   - Option to delete a day from itinerary
   - Recalculates pricing automatically

**Validation:**
- Must have at least one destination with city selected
- Recommended to have at least one route for accurate pricing
- Cannot proceed without destinations

**UX Pattern:**
- **Accordion-based collapsible cards** for each day
- **Progressive disclosure**: Services only shown after city selection
- **Visual hierarchy**: Day number, city, date → Services
- **Add button** prominently displayed to add more days

**Technical Implementation:**
- State: `cityServices` array (one object per day)
- Components:
  - Main container: lines 696-938
  - TransportationSearch: `transportation-search.tsx`
  - GuideSearch: `guide-search.tsx`
  - AttractionsSearch: `attractions-search.tsx`
- Data fetching:
  - Routes: `/api/routes` (filtered by city)
  - Languages: `/api/pricing/languages`
  - Attractions: `/api/attractions` (filtered by city)

**Recent Fixes (Oct 7, 2025):**
- ✅ FIXED: `availableLanguages` undefined → Changed to `languages`
- ✅ FIXED: Props mismatch in child components
- ✅ FIXED: Scroll navigation (now scrolls to step content, not page top)

---

### **STEP 3: Add-ons & Upgrades** ⏳ TO IMPLEMENT
**Purpose**: Offer optional extras that enhance the trip experience

**Planned Structure:**

1. **Trip-Wide Add-ons** (Apply to entire booking)
   - Travel insurance
   - Airport meet & greet service
   - 24/7 support hotline
   - SIM card with data package

2. **Per-Day Add-ons** (Can be added to specific days)
   - **Meals**: Breakfast, lunch, dinner packages
   - **Activities**: Felucca rides, camel rides, desert safaris, snorkeling
   - **Upgrades**: Premium vehicle upgrade, private photographer
   - **Equipment**: Audio guides, binoculars, safety gear

**User Flow:**
1. Display add-ons grouped by category
2. Toggle to add/remove from booking
3. For per-day add-ons, select which day(s) to apply
4. Quantity selector for items like meals (per person)
5. Real-time price update in summary panel

**UX Pattern:**
- **Toggle cards** with image, description, and price
- **Quantity selectors** for per-person items
- **Day assignment** for flexible add-ons
- **Category filters** for easy browsing

**Technical Implementation:**
- Component: `AddOnsSearch` already exists at `addons-search.tsx`
- Data: `/api/addons` endpoint already available
- Integration: Hook into existing `cityServices` state

**Validation:**
- Add-ons are optional (can skip this step)
- Quantity must be ≥ 1 for selected add-ons

---

### **STEP 4: Review & Pricing** ⏳ TO IMPLEMENT
**Purpose**: Show complete itinerary summary and pricing breakdown before checkout

**Display Structure:**

1. **Trip Summary Card**
   - Travel dates (start → end)
   - Total travelers
   - Number of destinations/days

2. **Day-by-Day Breakdown** (Expandable accordions)
   For each day show:
   - Day number and date
   - City/destination
   - Selected routes with vehicle type
   - Guide (if selected) with language and duration
   - Attractions list
   - Add-ons for this day
   - **Day subtotal**

3. **Pricing Breakdown**
   ```
   Transportation: X EGP
   Tour Guides: X EGP
   Attractions: X EGP
   Add-ons: X EGP
   ─────────────────────
   Subtotal: X EGP
   Commission (X%): X EGP
   ─────────────────────
   TOTAL: X EGP
   ```

4. **Edit Capabilities**
   - "Edit" button on each section to go back to that step
   - Preserve all selections when navigating back

**UX Pattern:**
- **Read-only summary** with edit options
- **Visual breakdown** with icons for each service type
- **Sticky CTA** at bottom: "Proceed to Checkout"
- **Save Quote** option for later

**Technical Implementation:**
- Use existing `totalPricing` state (from `/api/pricing/calculate`)
- Display `totalPricing.breakdown` array
- Component location: `multi-city-pricing-tool.tsx`
- Integrate with existing QuoteManager for save/load functionality

---

### **STEP 5: Checkout** ⏳ TO IMPLEMENT
**Purpose**: Collect customer information and process payment

**User Flow:**

1. **Customer Information Form**
   - Full Name (required)
   - Email (required, validated format)
   - Phone Number (required, international format)
   - Nationality (optional)
   - Special Requests (textarea, optional)

2. **Terms & Conditions**
   - Checkbox: "I agree to terms of service"
   - Checkbox: "I agree to booking policy"
   - Links to full terms/policy documents

3. **Payment Method**
   - Currently supports Stripe (if configured)
   - Fallback: Manual booking (admin will contact)
   - Display total amount prominently

4. **Submit Booking**
   - Creates quote in database
   - Sends confirmation email
   - Redirects to confirmation page

**Post-Booking Flow:**
1. Create booking record with status: 'pending'
2. Create quote with itinerary JSON
3. Send confirmation email via SendGrid
4. Show confirmation page with:
   - Booking reference number
   - Trip summary
   - Next steps
   - Download/Print options

**UX Pattern:**
- **Single-page form** with sections
- **Sticky summary panel** on right (desktop) or top (mobile)
- **Progress indicator** at top
- **Security badges** near payment section

**Technical Implementation:**
- Form validation: Zod schema from `shared/schema.ts`
- API endpoint: POST `/api/bookings`
- Email service: `server/email-service.ts` (SendGrid)
- Payment: Stripe integration (if enabled)
- Redirect to: `/booking-confirmation/:reference`

---

## Navigation & UX Patterns

### Step Navigation
- **Progress indicator** at top shows all 5 steps
- **Forward navigation**: "Continue to [Next Step]" button (enabled when validation passes)
- **Backward navigation**: "Back to [Previous Step]" button (always enabled)
- **Direct navigation**: Click on completed steps in progress indicator
- **Scroll behavior**: ✅ FIXED - Now scrolls to step content, not page top

### Validation Rules
- Step 1: Date + Travelers required
- Step 2: At least 1 destination with city required
- Step 3: Optional (can skip)
- Step 4: Review only (cannot proceed without reviewing)
- Step 5: Customer info + terms required

### Responsive Design

**Desktop (>1024px)**
- 2-column layout: Form on left, sticky summary on right
- Full accordions expanded by default
- Hover states on all interactive elements

**Tablet (768px - 1024px)**
- Single column layout
- Summary panel at top (collapsible)
- Accordions start collapsed

**Mobile (<768px)**
- Simplified navigation (bottom bar with step dots)
- Compact input fields
- Native date/number pickers
- Sticky summary as bottom sheet
- One service section visible at a time

---

## Data Flow & State Management

### State Structure
```typescript
// Global state
const [currentStep, setCurrentStep] = useState(1);
const [travelDate, setTravelDate] = useState('');
const [globalTravelers, setGlobalTravelers] = useState(1);
const [tripStyle, setTripStyle] = useState('private');

// Itinerary state (array of days)
const [cityServices, setCityServices] = useState<CityService[]>([]);

// Pricing state
const [totalPricing, setTotalPricing] = useState(null);

// Each CityService contains:
{
  dayNumber: number,
  cityId: number,
  cityName: string,
  date: string,
  travelers: number,
  selectedRoutes: number[],
  selectedGuide: { language: string, duration: number },
  selectedAttractions: string[],
  selectedAddOns: SelectedAddOn[]
}
```

### API Endpoints
- `GET /api/cities` - Available cities
- `GET /api/routes` - Transportation routes
- `GET /api/pricing/languages` - Available guide languages
- `GET /api/attractions` - Available attractions
- `GET /api/addons` - Available add-ons
- `POST /api/pricing/calculate` - Calculate total price
- `POST /api/quotes` - Save quote
- `POST /api/bookings` - Create booking

---

## Known Issues & Solutions

### ✅ FIXED Issues (Oct 7, 2025)
1. **Scroll Navigation**
   - Problem: Clicking "Continue" scrolled to top of page, not step content
   - Solution: Added `stepContentRef` and scroll to `.scrollIntoView()`
   - Files: `multi-city-pricing-tool.tsx`

2. **Language Data Error**
   - Problem: `availableLanguages is not defined` in GuideSearch
   - Solution: Changed to `languages` (already fetched from API)
   - Files: `multi-city-pricing-tool.tsx` line 804

3. **Component Props Errors**
   - Problem: TransportationSearch, GuideSearch, AttractionsSearch missing required props
   - Solution: Added `routes`, `languages`, `attractions`, `cityId`, `cityName` props
   - Files: `multi-city-pricing-tool.tsx` lines 784-832

### ⏳ TO IMPLEMENT
1. **Step 3: Add-ons & Upgrades**
   - Design toggle card UI
   - Implement quantity selectors
   - Add day assignment for per-day add-ons

2. **Step 4: Review & Pricing**
   - Build summary layout
   - Add edit buttons to return to previous steps
   - Implement save quote integration

3. **Step 5: Checkout**
   - Customer information form
   - Payment integration (Stripe)
   - Email confirmation flow
   - Booking confirmation page

4. **Mobile Responsiveness**
   - Bottom sheet summary panel
   - Simplified navigation
   - Touch-optimized controls

---

## File Structure Reference

### Main Components
- `client/src/components/multi-city-pricing-tool.tsx` - Main booking flow container
- `client/src/components/transportation-search.tsx` - Route selection
- `client/src/components/guide-search.tsx` - Guide selection
- `client/src/components/attractions-search.tsx` - Attractions selection
- `client/src/components/addons-search.tsx` - Add-ons selection
- `client/src/components/quote-manager.tsx` - Save/load quotes

### Backend
- `server/routes.ts` - API endpoints
- `server/database-storage.ts` - Pricing calculation logic
- `server/email-service.ts` - SendGrid integration
- `shared/schema.ts` - Data models & validation schemas

---

## Implementation Priority

### Phase 1: Core Flow ✅ COMPLETE
- ✅ Step 1: Trip Overview
- ✅ Step 2: Destinations
- ✅ Fix scroll navigation
- ✅ Fix component errors

### Phase 2: Complete Steps (NEXT)
- [ ] Step 3: Add-ons UI
- [ ] Step 4: Review & Pricing
- [ ] Step 5: Checkout Form
- [ ] Email confirmation flow

### Phase 3: UX Enhancements
- [ ] Mobile responsive design
- [ ] Sticky summary panel
- [ ] Loading states & animations
- [ ] Error handling & validation messages

---

*Last Updated: October 7, 2025*
*Status: Steps 1-2 Complete | Steps 3-5 In Progress*
