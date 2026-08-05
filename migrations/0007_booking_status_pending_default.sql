-- Booking status defaults to 'pending', not 'confirmed'.
--
-- A booking is confirmed once the 10% deposit clears — that is what the
-- customer's confirmation email promises, and what the ops alert instructs the
-- team to wait for. The column defaulted to 'confirmed', so every unpaid
-- request was recorded as confirmed the instant the form was submitted. The
-- row contradicted the promise, and the ops alert announced
-- "PAYMENT: PENDING / BOOKING: CONFIRMED" on the same booking.
--
-- Both insert paths in server/routes/bookings.ts now set 'pending' explicitly,
-- so this default is the backstop for any future insert that omits it.
--
-- Schema only. Existing rows are NOT touched here — see
-- migrations-adhoc/booking-status-backfill-2026-08-05.sql, which is deliberately
-- separate because reclassifying historical bookings is a judgement call, not a
-- schema fix.

ALTER TABLE "bookings" ALTER COLUMN "booking_status" SET DEFAULT 'pending';
