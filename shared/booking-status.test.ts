import { describe, it, expect } from 'vitest';
import { getTableColumns } from 'drizzle-orm';
import { bookings } from './schema';

/**
 * A booking is confirmed when the 10% deposit clears — the customer's
 * confirmation email says so, and the ops alert tells the team to wait for it.
 *
 * The column defaulted to 'confirmed' for long enough that every unpaid request
 * was recorded as confirmed on submission, and the ops alert ended up
 * announcing "PAYMENT: PENDING / BOOKING: CONFIRMED" on one booking. Nothing
 * failed loudly, which is why it survived; this asserts the invariant instead.
 */
describe('bookings.bookingStatus default', () => {
  it("defaults to 'pending', never 'confirmed'", () => {
    const { bookingStatus } = getTableColumns(bookings);
    expect(bookingStatus.default).toBe('pending');
  });

  it("does not default paymentStatus to anything paid-like", () => {
    const { paymentStatus } = getTableColumns(bookings);
    expect(paymentStatus.default).toBe('pending');
  });
});
