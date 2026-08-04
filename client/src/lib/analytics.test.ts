import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { shouldSendBookingConversion, trackConversion } from "./analytics";

describe("shouldSendBookingConversion", () => {
  const booking = { bookingReference: "AE-2026-0001", bookingStatus: "pending" };

  it("sends for a fresh pending booking — the normal post-checkout state", () => {
    expect(shouldSendBookingConversion(booking, false)).toBe(true);
  });

  it.each(["confirmed", "completed"])("sends for a %s booking", (bookingStatus) => {
    expect(shouldSendBookingConversion({ ...booking, bookingStatus }, false)).toBe(true);
  });

  it("never sends for a cancelled booking", () => {
    expect(shouldSendBookingConversion({ ...booking, bookingStatus: "cancelled" }, false)).toBe(false);
  });

  // The confirmation page is a permalink — reloaded, bookmarked, emailed.
  it("does not re-send once already sent for that reference", () => {
    expect(shouldSendBookingConversion(booking, true)).toBe(false);
  });

  it("does not send without a booking reference", () => {
    expect(shouldSendBookingConversion({ bookingStatus: "confirmed" }, false)).toBe(false);
    expect(shouldSendBookingConversion(undefined, false)).toBe(false);
    expect(shouldSendBookingConversion(null, false)).toBe(false);
  });
});

/**
 * The failure mode these guard against is silent, not loud: gtag accepts a
 * conversion with a bogus send_to, Google discards it server-side, and the site
 * looks instrumented while reporting nothing. That is what hid the broken
 * analytics wiring for months, so the no-label case must provably NOT send.
 */
describe("trackConversion", () => {
  let calls: any[][];

  beforeEach(() => {
    calls = [];
    (globalThis as any).window = globalThis;
    (globalThis as any).gtag = (...args: any[]) => calls.push(args);
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    delete (globalThis as any).gtag;
    vi.restoreAllMocks();
  });

  it("does not send when the conversion label is empty", () => {
    trackConversion("", 5625, "EGP", "AE-123");
    expect(calls).toHaveLength(0);
  });

  it("warns loudly when the label is missing, rather than failing silently", () => {
    trackConversion("", 5625);
    expect(console.warn).toHaveBeenCalledOnce();
    expect(vi.mocked(console.warn).mock.calls[0][0]).toMatch(/conversion NOT sent/i);
  });

  it("sends a well-formed conversion once a label is configured", () => {
    trackConversion("AbC-D_efGhIjKl", 5625, "EGP", "AE-2026-0001");
    expect(calls).toHaveLength(1);
    const [event, name, payload] = calls[0];
    expect(event).toBe("event");
    expect(name).toBe("conversion");
    expect(payload.send_to).toBe("AW-17431672142/AbC-D_efGhIjKl");
    expect(payload.value).toBe(5625);
    expect(payload.currency).toBe("EGP");
  });

  it("passes the booking reference as transaction_id so Ads can de-duplicate", () => {
    trackConversion("AbC-D_efGhIjKl", 100, "EGP", "AE-2026-0042");
    expect(calls[0][2].transaction_id).toBe("AE-2026-0042");
  });

  it("defaults currency to EGP", () => {
    trackConversion("AbC-D_efGhIjKl", 100);
    expect(calls[0][2].currency).toBe("EGP");
  });

  it("is a no-op when gtag has not loaded", () => {
    delete (globalThis as any).gtag;
    expect(() => trackConversion("AbC-D_efGhIjKl", 100)).not.toThrow();
  });
});
