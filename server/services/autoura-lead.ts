// Send website enquiries and booking requests into Autoura as leads
// (2026-11-13).
//
// The contact form and the three booking paths (quote builder, route
// transfer, ready-made package) email hello@affordegypt.com. That mailbox is
// synced into Autoura, but only as email. Each one is now ALSO POSTed, signed,
// to Autoura's /api/webhooks/website-lead, which files it as a lead in the
// Afford Egypt company (brand "affordegypt"), once per `reference` (the
// booking reference, or AFF-XXXXXX for a contact message), so a retry never
// files it twice.
//
// Signing mirrors Autoura's verifier (lib/concierge-webhook-auth.ts):
// HMAC-SHA256 over `${t}.${rawBody}`, header
// `X-Autoura-Signature: t=<unix>,v1=<hex>`. Sign the EXACT bytes sent.
//
// Contract: NEVER throws and never blocks the visitor's request. Missing URL
// or secret → 'skipped', no POST. Up to 3 sends (1s, 3s apart) on a network
// error or 5xx; a 4xx is final.

import { createHmac, randomBytes, randomUUID } from "node:crypto";

export type LeadStatus = "sent" | "failed" | "skipped";
export interface LeadResult {
  status: LeadStatus;
  attempts: number;
  httpStatus: number | null;
  response: unknown;
}

const BRAND = "affordegypt";
const SITE = "https://affordegypt.com";
const REF = /^[A-Za-z0-9-]{4,40}$/;

/** AFF- + 6 unambiguous characters: the reference of a contact message. */
export function contactReference(bytes: Uint8Array = randomBytes(6)): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (const b of Array.from(bytes.slice(0, 6))) out += alphabet[b % 32];
  return `AFF-${out}`;
}

const s = (v: unknown): string => (v == null ? "" : String(v).trim());
const isoDate = (v: unknown): string | null => {
  if (v == null || v === "") return null;
  const d = v instanceof Date ? v : new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

/** The contact form → the body Autoura's validateExternalEnquiry reads. */
export function contactToAutouraLead(
  reference: string,
  c: { name: string; email: string; phone?: string | null; subject: string; message: string },
) {
  return {
    brand: BRAND,
    reference,
    kind: "trip",
    name: s(c.name) || null,
    email: s(c.email),
    whatsapp: s(c.phone) || null,
    notes: `Contact form — ${s(c.subject)}\n\n${s(c.message)}`,
    page_url: `${SITE}/contact`,
  };
}

export interface BookingLike {
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  totalAmount?: string | number | null;
  currency?: string | null;
}

/** A booking request → the body Autoura reads. `what` names what was asked
 *  for ("Quote builder request", the package title, "Airport transfer"). */
export function bookingToAutouraLead(
  b: BookingLike,
  extra: { what: string; kind?: "trip" | "day_tour"; travelers?: number | null; notes?: string | null },
) {
  const reference = REF.test(s(b.bookingReference)) ? s(b.bookingReference) : contactReference();
  const total = s(b.totalAmount);
  const lines = [
    `Booking request ${s(b.bookingReference)} — ${extra.what}`,
    total && Number(total) > 0 ? `Quoted total: ${total} ${s(b.currency) || "EGP"}` : "",
    s(extra.notes),
  ].filter(Boolean);
  return {
    brand: BRAND,
    reference,
    kind: extra.kind ?? "trip",
    name: s(b.customerName) || null,
    email: s(b.customerEmail),
    whatsapp: s(b.customerPhone) || null,
    start_date: isoDate(b.startDate),
    end_date: isoDate(b.endDate),
    adults: extra.travelers && extra.travelers > 0 ? extra.travelers : null,
    tour_title: extra.what,
    estimate: total && Number(total) > 0 ? `${total} ${s(b.currency) || "EGP"}` : null,
    notes: lines.join("\n\n"),
  };
}

export interface SendDeps {
  url: string | null;
  secret: string | null;
  post: (url: string, headers: Record<string, string>, body: string) => Promise<{ httpStatus: number | null; response: unknown }>;
  sleep: (ms: number) => Promise<void>;
  nowSeconds: () => number;
  requestId: () => string;
}

export function signedHeaders(secret: string, rawBody: string, nowSeconds: number, requestId: string): Record<string, string> {
  const v1 = createHmac("sha256", secret).update(`${nowSeconds}.${rawBody}`).digest("hex");
  return {
    "Content-Type": "application/json",
    "X-Autoura-Signature": `t=${nowSeconds},v1=${v1}`,
    "X-Autoura-Timestamp": String(nowSeconds),
    "X-Request-Id": requestId,
  };
}

async function defaultPost(url: string, headers: Record<string, string>, body: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, { method: "POST", headers, body, signal: controller.signal });
    let response: unknown = null;
    try {
      response = await res.json();
    } catch {
      response = null;
    }
    return { httpStatus: res.status, response };
  } catch (err) {
    return { httpStatus: null, response: { error: (err as Error).message } };
  } finally {
    clearTimeout(timer);
  }
}

export function defaultSendDeps(): SendDeps {
  return {
    url: process.env.AUTOURA_LEAD_WEBHOOK_URL?.trim() || null,
    secret: process.env.AUTOURA_WEBHOOK_SECRET?.trim() || null,
    post: defaultPost,
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
    nowSeconds: () => Math.floor(Date.now() / 1000),
    requestId: () => randomUUID(),
  };
}

const BACKOFF_MS = [1000, 3000];

/** POST one lead to Autoura. Never throws. */
export async function sendLeadToAutoura(payload: object, deps: SendDeps = defaultSendDeps()): Promise<LeadResult> {
  if (!deps.url || !deps.secret) return { status: "skipped", attempts: 0, httpStatus: null, response: null };
  const rawBody = JSON.stringify(payload);
  let last: { httpStatus: number | null; response: unknown } = { httpStatus: null, response: null };
  for (let attempt = 1; attempt <= BACKOFF_MS.length + 1; attempt++) {
    try {
      last = await deps.post(deps.url, signedHeaders(deps.secret, rawBody, deps.nowSeconds(), deps.requestId()), rawBody);
    } catch (err) {
      last = { httpStatus: null, response: { error: (err as Error).message } };
    }
    if (last.httpStatus !== null && last.httpStatus >= 200 && last.httpStatus < 300) return { status: "sent", attempts: attempt, ...last };
    if (last.httpStatus !== null && last.httpStatus >= 400 && last.httpStatus < 500) return { status: "failed", attempts: attempt, ...last };
    if (attempt <= BACKOFF_MS.length) await deps.sleep(BACKOFF_MS[attempt - 1]);
  }
  return { status: "failed", attempts: BACKOFF_MS.length + 1, ...last };
}

/** Fire-and-forget: send, log a failure, never throw or wait. */
export function queueLeadToAutoura(payload: { reference: string } & object): void {
  try {
    void sendLeadToAutoura(payload)
      .then((r) => {
        if (r.status === "failed")
          console.error("[autoura] lead not delivered", payload.reference, r.httpStatus, JSON.stringify(r.response)?.slice(0, 300));
      })
      .catch((err) => console.error("[autoura] lead send threw", err));
  } catch (err) {
    console.error("[autoura] lead send could not start", err);
  }
}
