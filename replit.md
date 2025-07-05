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

- July 05, 2025. Implemented comprehensive multilingual support with react-i18next
  * Added English, Spanish, French, and German language support
  * Translated Hero component with full language switching
  * Started translating Multi-City Pricing Tool component
  * Removed Arabic language support per user request
  * Updated navbar with language selector and removed Cuisine Passport link
- July 05, 2025. Fixed route caching issue - all 15 Luxor routes now display correctly in multi-city pricing tool
- July 04, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.