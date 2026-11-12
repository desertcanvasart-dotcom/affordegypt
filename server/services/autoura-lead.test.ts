// Website enquiries and booking requests → Autoura (2026-11-13).
import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  bookingToAutouraLead,
  contactReference,
  contactToAutouraLead,
  queueLeadToAutoura,
  sendLeadToAutoura,
  signedHeaders,
  type SendDeps,
} from "./autoura-lead";

describe("what Autoura receives", () => {
  it("a contact message: brand, name, a fresh AFF- reference, the subject in the note", () => {
    expect(contactReference()).toMatch(/^AFF-[A-HJ-NP-Z2-9]{6}$/);
    const b = contactToAutouraLead("AFF-ABCDEF", { name: "Jane Doe", email: "jane@example.com", phone: "+44 7700 900123", subject: "Family trip", message: "4 of us in March" });
    expect(b).toMatchObject({ brand: "affordegypt", reference: "AFF-ABCDEF", name: "Jane Doe", whatsapp: "+44 7700 900123", page_url: "https://affordegypt.com/contact" });
    expect(b.notes).toBe("Contact form — Family trip\n\n4 of us in March");
  });

  it("a booking request: its own reference, dates, party, the quoted total", () => {
    const b = bookingToAutouraLead(
      { bookingReference: "PKG-ABC123DEF456", customerName: "Jane Doe", customerEmail: "jane@example.com", customerPhone: null, startDate: new Date("2027-03-02T00:00:00Z"), endDate: "2027-03-09T00:00:00Z", totalAmount: "48000.00", currency: "EGP" },
      { what: "Cairo & Nile 8 days", travelers: 2, notes: "Vegetarian" },
    );
    expect(b).toMatchObject({ brand: "affordegypt", reference: "PKG-ABC123DEF456", start_date: "2027-03-02", end_date: "2027-03-09", adults: 2, tour_title: "Cairo & Nile 8 days", estimate: "48000.00 EGP", whatsapp: null });
    expect(b.notes).toBe("Booking request PKG-ABC123DEF456 — Cairo & Nile 8 days\n\nQuoted total: 48000.00 EGP\n\nVegetarian");
  });

  it("a reference Autoura would refuse is replaced, never sent as is", () => {
    const b = bookingToAutouraLead({ bookingReference: "bad ref!", customerName: "A", customerEmail: "a@x.com" }, { what: "x" });
    expect(b.reference).toMatch(/^AFF-/);
  });
});

const deps = (replies: Array<number | null>, calls: Array<{ headers: Record<string, string>; body: string }>): SendDeps => ({
  url: "https://getautoura.net/api/webhooks/website-lead",
  secret: "s3cret",
  post: async (_u, headers, body) => {
    calls.push({ headers, body });
    const st = replies.shift() ?? null;
    return { httpStatus: st, response: null };
  },
  sleep: async () => {},
  nowSeconds: () => 1_700_000_000,
  requestId: () => "r1",
});

describe("sending", () => {
  it("signs over the exact bytes sent", async () => {
    const calls: Array<{ headers: Record<string, string>; body: string }> = [];
    expect((await sendLeadToAutoura({ a: 1 }, deps([200], calls))).status).toBe("sent");
    const v1 = createHmac("sha256", "s3cret").update(`1700000000.${calls[0].body}`).digest("hex");
    expect(calls[0].headers["X-Autoura-Signature"]).toBe(`t=1700000000,v1=${v1}`);
    expect(signedHeaders("k", "{}", 5, "x")["X-Autoura-Timestamp"]).toBe("5");
  });

  it("retries a 5xx and a network error, stops on a 4xx, gives up after 3, skips without config", async () => {
    let calls: Array<{ headers: Record<string, string>; body: string }> = [];
    expect([(await sendLeadToAutoura({}, deps([500, null, 200], calls))).status, calls.length]).toEqual(["sent", 3]);
    calls = [];
    expect([(await sendLeadToAutoura({}, deps([422, 200], calls))).status, calls.length]).toEqual(["failed", 1]);
    calls = [];
    expect((await sendLeadToAutoura({}, deps([503, 503, 503], calls))).attempts).toBe(3);
    expect((await sendLeadToAutoura({}, { ...deps([200], []), secret: null })).status).toBe("skipped");
  });

  it("queueing never throws and never waits, even when sending blows up", () => {
    const spy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("down"));
    process.env.AUTOURA_LEAD_WEBHOOK_URL = "https://x.test/hook";
    process.env.AUTOURA_WEBHOOK_SECRET = "k";
    expect(() => queueLeadToAutoura({ reference: "AFF-ABCDEF" })).not.toThrow();
    spy.mockRestore();
    delete process.env.AUTOURA_LEAD_WEBHOOK_URL;
    delete process.env.AUTOURA_WEBHOOK_SECRET;
  });
});
