-- OPTIONAL backfill for the booking_status default change (migrations/0007).
--
-- DO NOT APPLY WITHOUT READING THIS.
--
-- Historical rows still say booking_status = 'confirmed' on bookings whose
-- deposit never cleared, because that was the column default. The statement
-- below reclassifies exactly the contradictory set — confirmed on paper,
-- unpaid in fact.
--
-- The judgement call: payment_status is only accurate if it has been kept
-- accurate. If any of these trips were settled offline — cash on arrival, a
-- bank transfer, a card taken on the mobile reader — and nobody moved
-- payment_status to 'paid', then this will demote a genuinely confirmed
-- booking to pending. That is the risk, and it is why this is not in the
-- schema migration.
--
-- Run the SELECT first and read the rows. If they are all genuinely awaiting a
-- deposit, run the UPDATE. If some were settled offline, fix their
-- payment_status first, then run the UPDATE.

-- 1. Inspect. How many, and which?
SELECT booking_reference,
       customer_name,
       customer_email,
       total_amount,
       start_date,
       created_at
FROM bookings
WHERE booking_status = 'confirmed'
  AND payment_status = 'pending'
ORDER BY created_at DESC;

-- 2. Reclassify, only once the list above has been checked.
-- UPDATE bookings
-- SET booking_status = 'pending'
-- WHERE booking_status = 'confirmed'
--   AND payment_status = 'pending';
