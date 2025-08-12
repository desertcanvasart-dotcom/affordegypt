# Egypt Travel Platform - Replit Guide

## Overview
This project is a full-stack travel platform for Egypt tourism, catering to budget-conscious travelers. Its main purpose is to offer transparent pricing for transfers, tours, and travel services across various Egyptian cities. The platform aims to provide a comprehensive booking and pricing management system, featuring dynamic pricing calculations, multi-vehicle options, and an easy-to-use interface. The business vision is to become a leading online travel resource for Egypt, emphasizing affordability and clarity in travel arrangements.

## Recent Changes
- **Aug 12, 2025**: **CRITICAL PRICING ALIGNMENT FIX** - Resolved major discrepancy where customer-facing prices (1500 EGP fallback) didn't match admin dashboard prices (2450-6550 EGP). Fixed 52 routes with inconsistent pricing data format. Now all pricing is synchronized across customer and admin interfaces.

## User Preferences
Preferred communication style: Simple, everyday language.
Content approach: Replace translation function calls with direct dummy data in components rather than using JSON translation files.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built with Vite for optimized performance.
- **Styling**: Tailwind CSS, utilizing shadcn/ui and Radix UI primitives for a robust design system.
- **State Management**: TanStack Query for server state; custom hooks for local state.
- **Routing**: Wouter for lightweight client-side routing.

### Backend Architecture
- **Runtime**: Node.js with Express.
- **Database**: PostgreSQL, managed with Drizzle ORM and built-in migration system.
- **Authentication**: JWT-based with bcrypt for security.
- **Email Service**: SendGrid for transactional emails.
- **Payment Processing**: Stripe integration (optional).
- **File Upload**: Multer for CSV import.

### Core System Features
- **Data Models**: Comprehensive schema including Users, Cities, Routes, Vehicle Types, Guide Rates, Bookings, and Services.
- **Pricing Engine**: Supports multi-vehicle pricing, dynamic calculations, and transparent breakdowns. Administrators can import routes via CSV. **CRITICAL FIX (Aug 12, 2025)**: Resolved major pricing inconsistency between customer interface and admin dashboard by standardizing all route pricing data to use consistent vehicle type naming format ({"sedan": 2450, "minivan": 2890, "van": 6550}) instead of mixed nested formats.
- **Authentication**: JWT-based system with role-based access (User, Admin, Staff) and protected routes.
- **Admin Management**: Tools for managing bookings, routes (CRUD operations and CSV import), and users.
- **Booking Process**: Streamlined user flow from selection to payment and confirmation.
- **Multilingual Support**: Comprehensive multilingual content system with dummy data implementation for English, Spanish, French, and German. Language switching works dynamically across all content including destinations, activities, practical information, and itineraries. Translation JSON files have been replaced with direct dummy data in components for improved performance and easier maintenance.
- **Analytics Tracking**: Comprehensive tracking with Google Analytics (G-MWY0T7465M) and Google Ads (AW-17431672142) including automatic page view tracking, event tracking for user interactions, and conversion tracking for advertising campaigns.

## External Dependencies

- **Environment Variables**: `DATABASE_URL`, `JWT_SECRET`, `SENDGRID_API_KEY`, `STRIPE_SECRET_KEY` (optional), `STRIPE_PUBLISHABLE_KEY` (optional), `VITE_GA_MEASUREMENT_ID` (Google Analytics), `VITE_GOOGLE_ADS_ID` (Google Ads).
- **Third-Party Services**: Neon Database (serverless PostgreSQL), SendGrid, Stripe (optional), Google Analytics (G-MWY0T7465M), Google Ads (AW-17431672142).
- **Key Node.js Dependencies**: Express, TypeScript, Drizzle ORM, React, Tailwind CSS, Radix UI, JWT, bcrypt, Multer, CSV parser, Zod.