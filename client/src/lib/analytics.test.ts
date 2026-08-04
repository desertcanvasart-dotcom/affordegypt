import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  hasSentConversion,
  markConversionSent,
  shouldSendBookingConversion,
  trackPurchase,
  trackQualifiedLead,
} from "./analytics";

/** Minimal localStorage so the marker helpers can run under the node env. */
function installStorage(throwing = false) {
  const map = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => {
      if (throwing) throw new Error("storage disabled");
      return map.get(k) ?? null;
    },
    setItem: (k: string, v: string) => {
      if (throwing) throw new Error("storage disabled");
      map.set(k, v);
    },
    removeItem: (k: string) => map.delete(k),
  };
}

describe("conversion de-duplication markers", () => {
  beforeEach(() => installStorage());
  afterEach(() => delete (globalThis as any).localStorage);

  it("reports a reference as unsent until it is marked", () => {
    expect(hasSentConversion("AE-1")).toBe(false);
    markConversionSent("AE-1");
    expect(hasSentConversion("AE-1")).toBe(true);
  });

  it("keeps references independent", () => {
    markConversionSent("AE-1");
    expect(hasSentConversion("AE-2")).toBe(false);
  });

  // The quote builder and the confirmation page must agree on the key, or a
  // booking gets counted twice.
  it("is the shared gate both report paths consult", () => {
    markConversionSent("AE-SHARED");
    expect(shouldSendBookingConversion(
      { bookingReference: "AE-SHARED", bookingStatus: "pending" },
      hasSentConversion("AE-SHARED"),
    )).toBe(false);
  });

  it("treats disabled storage as not-yet-sent rather than dropping the conversion", () => {
    installStorage(true);
    expect(hasSentConversion("AE-1")).toBe(false);
    expect(() => markConversionSent("AE-1")).not.toThrow();
  });
});

describe("trackQualifiedLead", () => {
  let calls: any[][];

  beforeEach(() => {
    calls = [];
    (globalThis as any).window = globalThis;
    (globalThis as any).gtag = (...args: any[]) => calls.push(args);
  });

  afterEach(() => delete (globalThis as any).gtag);

  it('fires a GA4 event named exactly "qualify_lead"', () => {
    trackQualifiedLead({ quoteId: 7, value: 5625 });
    expect(calls[0][0]).toBe("event");
    expect(calls[0][1]).toBe("qualify_lead");
  });

  it("carries the quote value and defaults currency to EGP", () => {
    trackQualifiedLead({ quoteId: 7, value: 5625 });
    expect(calls[0][2].value).toBe(5625);
    expect(calls[0][2].currency).toBe("EGP");
  });

  it("is a no-op when gtag has not loaded", () => {
    delete (globalThis as any).gtag;
    expect(() => trackQualifiedLead({ quoteId: 1 })).not.toThrow();
  });
});

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

describe("trackPurchase", () => {
  let calls: any[][];

  beforeEach(() => {
    calls = [];
    (globalThis as any).window = globalThis;
    (globalThis as any).gtag = (...args: any[]) => calls.push(args);
  });

  afterEach(() => {
    delete (globalThis as any).gtag;
    vi.restoreAllMocks();
  });

  /**
   * The event name is the join key between this site and the Ads conversion
   * action "Afford Egypt (web) purchase", which imports from GA4. Rename it and
   * the conversion silently detaches — no error, just zero conversions. Hence a
   * test asserting the literal string.
   */
  it('fires a GA4 event named exactly "purchase"', () => {
    trackPurchase({ transactionId: "AE-2026-0001", value: 5625 });
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe("event");
    expect(calls[0][1]).toBe("purchase");
  });

  it("sends no send_to — GA4 imports carry no Ads conversion label", () => {
    trackPurchase({ transactionId: "AE-2026-0001", value: 5625 });
    expect(calls[0][2]).not.toHaveProperty("send_to");
  });

  it("passes the booking reference as transaction_id so GA4 de-duplicates", () => {
    trackPurchase({ transactionId: "AE-2026-0042", value: 100 });
    expect(calls[0][2].transaction_id).toBe("AE-2026-0042");
  });

  it("defaults currency to EGP", () => {
    trackPurchase({ transactionId: "AE-1", value: 100 });
    expect(calls[0][2].currency).toBe("EGP");
  });

  it("carries the booking value", () => {
    trackPurchase({ transactionId: "AE-1", value: 5625 });
    expect(calls[0][2].value).toBe(5625);
  });

  it("always includes an items array, even when none is supplied", () => {
    trackPurchase({ transactionId: "AE-1", value: 100 });
    expect(Array.isArray(calls[0][2].items)).toBe(true);
  });

  it("is a no-op when gtag has not loaded", () => {
    delete (globalThis as any).gtag;
    expect(() => trackPurchase({ transactionId: "AE-1", value: 1 })).not.toThrow();
  });
});
