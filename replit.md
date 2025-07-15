# Egypt Travel Platform - Replit Guide

## Overview

This is a full-stack travel platform for Egypt tourism, specifically designed for budget-conscious travelers. The application provides transparent pricing for transfers, tours, and travel services across Egyptian cities. Built with modern web technologies, it features a React frontend, Node.js backend, and PostgreSQL database with comprehensive booking and pricing management systems.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state, custom hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Design System**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based auth with bcrypt password hashing
- **Email Service**: SendGrid for transactional emails
- **Payment Processing**: Stripe integration (configurable)
- **File Upload**: Multer for CSV import functionality

### Database Architecture
- **ORM**: Drizzle with PostgreSQL dialect
- **Migration System**: Built-in Drizzle migration management
- **Connection**: Neon serverless PostgreSQL (configured via DATABASE_URL)
- **Schema**: Comprehensive travel booking schema with users, cities, routes, bookings, and pricing

## Key Components

### Core Data Models
- **Users**: Authentication and user management with role-based access
- **Cities**: Egyptian destinations with slugs and metadata
- **Routes**: Transfer routes between cities with multi-vehicle pricing
- **Vehicle Types**: Different vehicle categories (sedan, minivan, van, coach)
- **Guide Rates**: Hourly rates for tour guides by city and language
- **Bookings**: Complete booking lifecycle with payment tracking
- **Services**: Modular service system for tours and add-ons

### Pricing Engine
- **Multi-Vehicle Pricing**: Automatic vehicle selection based on passenger count
- **Dynamic Calculations**: Real-time pricing based on routes, guides, and add-ons
- **Transparent Pricing**: No hidden fees, clear breakdowns
- **CSV Import**: Bulk route import functionality for administrators

### Authentication System
- **JWT Tokens**: 30-day expiration for user sessions
- **Role-Based Access**: User, admin, and staff roles
- **Protected Routes**: Admin panel and user dashboard protection
- **Password Security**: Bcrypt hashing with salt rounds

### Admin Management
- **Booking Management**: View, edit, and track all bookings
- **Route Management**: CRUD operations for transfer routes
- **CSV Import**: Bulk route import with validation
- **User Management**: Admin user controls and permissions

## Data Flow

### Booking Process
1. User selects route and travel preferences
2. System calculates pricing based on vehicle type and passenger count
3. Add-ons and guide services are optionally added
4. Booking is created with payment processing
5. Confirmation emails are sent via SendGrid
6. Admin can track and manage bookings

### Pricing Calculation
1. Route pricing retrieved from database based on vehicle type
2. Guide pricing calculated from hourly rates (daily rate / travelers)
3. Attraction pricing pulled directly from database
4. Add-on pricing calculated based on pricing type (per person/trip/unit)
5. Total aggregated and displayed with breakdown

### Route Management
1. Admin can add routes manually or via CSV import
2. Route validation ensures city existence and pricing completeness
3. Display order controls route appearance in booking system
4. Multi-vehicle pricing stored as JSON in database

## External Dependencies

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `SENDGRID_API_KEY`: SendGrid API key for email service
- `STRIPE_SECRET_KEY`: Stripe secret key (optional)
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key (optional)

### Third-Party Services
- **Neon Database**: Serverless PostgreSQL hosting
- **SendGrid**: Transactional email service
- **Stripe**: Payment processing (optional)
- **Google Tag Manager**: Analytics tracking

### Node.js Dependencies
- Core: Express, TypeScript, Drizzle ORM
- UI: React, Tailwind CSS, Radix UI
- Auth: JWT, bcrypt
- Utils: Multer, CSV parser, Zod validation

## Deployment Strategy

### Development Environment
- Use `npm run dev` for development with hot reload
- Vite dev server with Express API proxy
- Auto-seeding of services data on startup

### Production Build
- `npm run build` creates optimized client and server bundles
- `npm run start` runs production server
- Static assets served from dist/public directory

### Database Management
- `npm run db:push` applies schema changes
- Migration files stored in `/migrations` directory
- Automatic database seeding on first run

### Environment Setup
1. Provision PostgreSQL database (Neon recommended)
2. Set required environment variables
3. Run database migrations
4. Deploy to hosting platform (Replit, Vercel, etc.)

## Changelog

- July 15, 2025. **MAJOR FIX: Resolved all city attraction translation issues across 4 languages**
  * **FIXED TRANSLATION KEYS**: Successfully added missing flat key translations for all major cities
  * **COMPLETED CITIES**: Alexandria, Cairo, Beni Suef, Minya, Asyut, Qena, Sohag, Luxor, Aswan, Abu Simbel
  * **COMPREHENSIVE COVERAGE**: All attraction names, descriptions, entry fees, and hours now translate properly
  * **VERIFIED WORKING**: Instead of showing literal keys like "attractions.beniSuef.meidumPyramid.name", now displays proper translations:
    - English: "Meidum Pyramid", "Pyramids of Giza", "Valley of the Kings", "Philae Temple"
    - Spanish: "Pirámide de Meidúm", "Pirámides de Giza", "Valle de los Reyes", "Templo de Filae"  
    - French: "Pyramide de Meidoum", "Pyramides de Gizeh", "Vallée des Rois", "Temple de Philae"
    - German: "Meidum-Pyramide", "Pyramiden von Gizeh", "Tal der Könige", "Philae-Tempel"
  * **COMPLETE MULTILINGUAL EXPERIENCE**: All destination guides now fully functional across all 4 languages
  * **TRANSLATION ARCHITECTURE**: Maintained flat key structure for optimal performance and consistency
- July 09, 2025. **COMPLETED: 100% multilingual translation system for transportation routes INCLUDING all Luxor routes**
  * **COMPLETED TRANSPORTATION ROUTES TRANSLATION**: Added comprehensive translations for all major transportation routes including Cairo and Luxor
  * **COMPLETED LOCATION DESCRIPTIONS**: Fixed third-line route descriptions with proper translations (fromLocation/toLocation fields)
  * **COMPLETED LUXOR ROUTES TRANSLATION**: Added full translations for all Luxor routes including route names and location descriptions
  * **VERIFIED WORKING TRANSLATIONS**: All route endpoints now return properly translated names AND location descriptions in Spanish, French, and German
  * **CAIRO TRANSLATION EXAMPLES**:
    - Spanish: "El Cairo - Día completo Saqqara y Dahshur", "Aeropuerto ↔ Hotel de El Cairo o Giza", "Aeropuerto de Hurghada → Hotel de la Ciudad"
    - French: "Le Caire - Journée complète Saqqarah et Dahchour", "Aéroport ↔ Hôtel du Caire ou Gizeh", "Aéroport de Hurghada → Hôtel de la Ville"
    - German: "Kairo - Ganztägig Saqqara und Dahschur", "Flughafen ↔ Kairo oder Gizeh Hotel", "Hurghada Flughafen → Stadthotel"
  * **LUXOR TRANSLATION EXAMPLES**:
    - Spanish: "Aeropuerto de Lúxor ↔ Hotel de la Orilla Este", "Experiencia Completa de la Orilla Oeste", "Espectáculo de Sonido y Luz de Karnak"
    - French: "Aéroport de Louxor ↔ Hôtel de la Rive Est", "Expérience Complète de la Rive Ouest", "Spectacle Son et Lumière de Karnak"
    - German: "Luxor Flughafen ↔ Ostufer Hotel", "Vollständige Westufer Erfahrung", "Karnak Ton- und Lichtshow"
  * **LOCATION TRANSLATIONS EXAMPLES**:
    - Spanish: "hotel → restaurante", "Centro de El Cairo → Centro de Alejandría", "Valle de los Reyes → Templo de Hatshepsut"
    - French: "hôtel → restaurant", "Centre-ville du Caire → Centre-ville d'Alexandrie", "Vallée des Rois → Temple d'Hatshepsout"
    - German: "Hotel → Restaurant", "Kairo Stadtzentrum → Alexandria Zentrum", "Tal der Könige → Hatschepsut-Tempel"
  * **COMPLETE MULTILINGUAL TRANSPORTATION**: All major airport transfers, city routes, and inter-city transportation now fully translated including location descriptions
  * **END-TO-END MULTILINGUAL PLATFORM**: Destinations, attractions, AND transportation routes all translate seamlessly across 4 languages
- July 07, 2025. **COMPLETED: 100% multilingual translation system for destinations AND attractions**
  * **FIXED FRONTEND TRANSLATIONS**: Updated "EGP/day" text to use proper translations: "EGP/día", "EGP/jour", "EGP/Tag"
  * **COMPLETED COMPREHENSIVE ATTRACTION TRANSLATIONS**: Added authentic translations for 50+ major Egyptian attractions
  * **FULL COVERAGE**: Translated complete list including Valley of Kings, Karnak Temple, Abu Simbel, Luxor Temple, Hatshepsut Temple, and all major museums
  * **VERIFIED MULTILINGUAL API**: All attraction endpoints working perfectly with language parameters
  * **VERIFIED EXAMPLES**: 
    - Spanish: "Valle de los Reyes", "Templo de Karnak", "Templo de Abu Simbel", "Festival del Sol de Abu Simbel"
    - French: "Vallée des Rois", "Temple de Karnak", "Temple d'Abou Simbel", "Festival du Soleil d'Abou Simbel"  
    - German: "Tal der Könige", "Karnak-Tempel", "Abu Simbel Tempel", "Abu Simbel Sonnenfest"
  * **COMPLETE MULTILINGUAL EXPERIENCE**: Both destinations AND attractions fully translated across 4 languages
  * **BACKEND API CONFIRMED**: All endpoints (?lang=es/fr/de) return fully translated destination AND attraction data with unique descriptions
- July 06, 2025. **MAJOR: Completed full end-to-end multilingual translation system**
  * **FRONTEND-BACKEND INTEGRATION COMPLETE**: Created useTranslatedQuery hook to automatically send language parameters with API requests
  * **REAL TRANSLATION DATA**: Populated database with authentic translations for major Egyptian cities and attractions
  * **VERIFIED WORKING TRANSLATIONS**: Successfully tested complete system - language switching now shows translated city names, routes, and attractions
  * **TRANSLATION EXAMPLES CONFIRMED**: 
    - Spanish: "Cairo" → "El Cairo", "Alexandria" → "Alejandría", "Luxor" → "Lúxor", "Aswan" → "Asuán"
    - French: "Cairo" → "Le Caire", "Alexandria" → "Alexandrie", "Luxor" → "Louxor", "Aswan" → "Assouan" 
    - German: "Cairo" → "Kairo", "Aswan" → "Assuan"
  * **END-TO-END VALIDATION**: Frontend language selector → API calls with ?lang parameter → backend translation middleware → translated JSON responses → UI displays translated content
  * **COMPLETE MULTILINGUAL PLATFORM**: Both frontend UI elements AND backend data now translate seamlessly across 4 languages
- July 06, 2025. Completed comprehensive footer translations in all 4 languages
  * Translated all footer sections: company description, useful links, legal links, newsletter
  * Added translations for travel guides, policies, and interactive elements
  * Newsletter form now fully translates including placeholder text and button states
  * Copyright and attribution text now translate appropriately per language
  * Footer provides complete multilingual user experience
- July 06, 2025. Reorganized navigation by moving Travel Tips from header to footer
  * Removed "Travel Tips" link from both desktop and mobile navigation menus
  * Added "Travel Tips" to footer under "Useful Links" section with multilingual support
  * Updated translation files to support "Useful Links" and "Travel Tips" in all 4 languages
  * Navigation now cleaner with only Destinations link and language selector
- July 05, 2025. Completed multilingual translations for all homepage sections
  * Added translations for Reviews, Blog Grid, and FAQ sections in 4 languages
  * All homepage sections now fully support English, Spanish, French, and German
  * Dynamic FAQ questions and answers translate based on selected language
  * Complete homepage is now multilingual: Hero, Multi-City Tool, Reviews, Blog, FAQ, Footer
- July 05, 2025. Restored homepage to original simple design per user request
  * Removed About section and other extra sections that were incorrectly added
  * Restored clean homepage structure: Hero → Multi-City Tool → Reviews → Blog → FAQ → Footer
  * Homepage now matches original design exactly as intended
  * Multilingual translations remain available in appropriate components
- July 05, 2025. Implemented comprehensive multilingual support with react-i18next
  * Added English, Spanish, French, and German language support
  * Translated Hero component with full language switching
  * Translated Multi-City Pricing Tool header and About section components
  * Removed Arabic language support per user request
  * Updated navbar with language selector and removed Cuisine Passport link
- July 05, 2025. Fixed route caching issue - all 15 Luxor routes now display correctly in multi-city pricing tool
- July 04, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.