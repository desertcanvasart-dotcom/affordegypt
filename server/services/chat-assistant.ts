// Website chat assistant: a Claude tool-use loop over the read-only pricing
// tools in ./chat-tools.
//
// Conversation history lives HERE, server-side, keyed by an unguessable
// session id. The browser only ever sends the new message. If the client
// held the history, anyone could hand-craft a fake tool_result ("total:
// 10 EGP") and get the assistant to repeat it as a quote.
//
// Sessions are in memory: fine for a single Railway instance and a
// prototype, lost on deploy (the widget just starts a new chat).

import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "crypto";
import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { cities, entranceFees, guideRates, serviceCatalog, travelPackages } from "@shared/schema";
import { pickName } from "../public-catalog-routes";
import { buildMultiCityQuote } from "./quote-builder";
import {
  CHAT_TOOLS,
  runChatTool,
  type ChatToolDeps,
  type CatalogRow,
  type EntranceFeeRow,
  type GuideRateRow,
  type PackageRow,
  type VerifiedQuote,
} from "./chat-tools";

// Opus 5.5 is the default; CHAT_MODEL overrides it (e.g. claude-sonnet-5-5
// for a cheaper bot) without a code change.
const MODEL = process.env.CHAT_MODEL || "claude-opus-5-5";
const MAX_TOOL_ROUNDS = 8;
const MAX_TURNS_PER_SESSION = 30;
const SESSION_TTL_MS = 60 * 60 * 1000;
const MAX_SESSIONS = 2000;

export const WHATSAPP_NUMBER = "+20 110 076 5283";

const SYSTEM_PROMPT = `You are the booking assistant on affordegypt.com, the website of AffordEgypt (operated by Capital Travel Service, ETAA licence 2179). You help travellers price private transfers, day tours, guides, entrance tickets and multi-day trips in Egypt.

How you work:
- Every price you mention must come from a tool result in this conversation. Never estimate, round, convert currencies, or quote from memory. If a tool has no price for something, say we don't list it online and offer WhatsApp (${WHATSAPP_NUMBER}).
- For any total, call calculate_quote (custom trips) or price_package (ready-made packages). Never add numbers up yourself. The customer sees the result as a verified price card, so after calling it give a short summary (total, per person, what's included) rather than repeating every line.
- Prices are in Egyptian pounds (EGP). Transfer and tour prices are per vehicle for the whole group; entrance tickets are per person; a guide is one rate per day for the group. Pick the smallest vehicle that seats the group: sedan up to 2, minivan up to 8, van up to 15. Larger groups need a custom quote on WhatsApp.
- If the request is vague, ask one or two short questions (city, number of travellers, which transfers or sights) before searching. Don't interrogate; make sensible assumptions and say what you assumed.
- If a tool returns an error, fix the request (look up the right slug, pick a bigger vehicle) or tell the customer plainly.

Multi-day trips — two kinds, never mix their prices or terms:
- Ready-made packages (list_packages / price_package): fixed programs that include hotels, intercity trains or a Nile cruise, guided touring and the extras listed. Groups of 2 to 12. Suggest them whenever someone wants several days, especially with hotels or a cruise. Use each package's own booking_terms for deposit, balance, cancellation and blackout dates, and send the customer to the package page (the card has a button) to book.
- Custom trips (calculate_quote): built day by day from transfers, tours, guides and entrance tickets, one entry per day; a guide is charged per day. They do NOT include hotels, sleeper trains or cruises, and you must say so. If the customer needs those, offer a package or WhatsApp.
- If it's unclear which they want, briefly offer both.

What happens after a custom-trip price (state this accurately, never promise more; packages follow their own booking_terms instead):
- To book, the customer uses "Build Your Quote" on the site or messages the team on WhatsApp (${WHATSAPP_NUMBER}).
- Booking needs a 10% deposit. After a booking request the team confirms availability and sends a secure payment link (usually Tab.travel, any major card). The booking is confirmed once the deposit clears. The other 90% is paid on arrival (cash in EGP, USD, EUR or GBP, a second payment link, or card).
- Any foreign-currency figure is only approximate; the booking is priced in EGP.

Style: friendly, brief, plain language. Reply in the customer's language. Write plain text: no markdown (no **bold**, headings or tables). For a list, start lines with "- ". Only discuss AffordEgypt trips, pricing and booking; politely decline anything else.`;

// ---------------------------------------------------------------------------
// Data access (read-only), cached briefly so a chat doesn't hit the DB on
// every tool call.
// ---------------------------------------------------------------------------

const CACHE_MS = 60_000;
function cached<T>(load: () => Promise<T>): () => Promise<T> {
  let value: { at: number; data: Promise<T> } | null = null;
  return () => {
    if (!value || Date.now() - value.at > CACHE_MS) {
      const data = load();
      value = { at: Date.now(), data };
      data.catch(() => {
        value = null;
      });
    }
    return value.data;
  };
}

const toNumberRecord = (blob: unknown): Record<string, number> => {
  const obj = typeof blob === "string" ? JSON.parse(blob) : blob;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries((obj ?? {}) as Record<string, unknown>)) {
    const n = typeof v === "number" ? v : parseFloat(String(v));
    if (Number.isFinite(n)) out[k] = n;
  }
  return out;
};

export const dbChatDeps: ChatToolDeps = {
  loadCatalog: cached(async (): Promise<CatalogRow[]> => {
    const rows = await db
      .select({
        slug: serviceCatalog.slug,
        name: serviceCatalog.name,
        city: serviceCatalog.city,
        category: serviceCatalog.category,
        pickupZone: serviceCatalog.pickupZone,
        vehiclePrices: serviceCatalog.vehiclePrices,
        nameTranslations: serviceCatalog.nameTranslations,
      })
      .from(serviceCatalog)
      .where(eq(serviceCatalog.isActive, true))
      .orderBy(asc(serviceCatalog.city), asc(serviceCatalog.sortOrder));
    return rows.map((r) => ({
      slug: r.slug,
      name: pickName(r),
      city: r.city,
      category: r.category,
      pickupZone: r.pickupZone,
      vehiclePrices: toNumberRecord(r.vehiclePrices),
    }));
  }),
  loadEntranceFees: cached(async (): Promise<EntranceFeeRow[]> => {
    const rows = await db
      .select({
        slug: entranceFees.slug,
        city: entranceFees.city,
        nameTranslations: entranceFees.nameTranslations,
        pricePerPerson: entranceFees.pricePerPerson,
      })
      .from(entranceFees)
      .where(eq(entranceFees.isActive, true))
      .orderBy(asc(entranceFees.sortOrder));
    return rows
      .map((r) => ({
        slug: r.slug,
        name: pickName({ name: null, slug: r.slug, nameTranslations: r.nameTranslations }),
        city: r.city,
        pricePerPerson: Number(r.pricePerPerson),
      }))
      .filter((r) => r.pricePerPerson > 0);
  }),
  loadGuideRates: cached(async (): Promise<GuideRateRow[]> => {
    const rows = await db
      .select({
        cityId: guideRates.cityId,
        cityName: cities.name,
        language: guideRates.language,
        rate: guideRates.hourlyPrice, // column name is legacy; live data is a daily rate
      })
      .from(guideRates)
      .innerJoin(cities, eq(guideRates.cityId, cities.id));
    return rows
      .map((r) => ({ cityId: r.cityId, cityName: r.cityName, language: r.language, dailyRate: Number(r.rate) }))
      .filter((r) => r.dailyRate > 0);
  }),
  loadPackages: cached(async (): Promise<PackageRow[]> => {
    const rows = await db
      .select()
      .from(travelPackages)
      .where(eq(travelPackages.status, "published"))
      .orderBy(asc(travelPackages.slot));
    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      summary: r.summary,
      durationDays: r.durationDays,
      nights: r.nights,
      dayTitles: (r.itinerary ?? []).map((d) => d.title),
      inclusions: r.inclusions ?? [],
      exclusions: r.exclusions ?? [],
      bookingTerms: r.bookingTerms,
      perPersonRates: toNumberRecord(r.perPersonRates),
      singleSupplement: r.singleSupplement === null ? null : Number(r.singleSupplement),
      version: r.version,
    }));
  }),
  buildQuote: (cityInputs, travelers) => buildMultiCityQuote(cityInputs, travelers),
};

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

interface ChatSession {
  messages: Anthropic.Beta.BetaMessageParam[];
  turns: number;
  lastSeen: number;
}
const sessions = new Map<string, ChatSession>();

function sweep(now: number) {
  sessions.forEach((s, id) => {
    if (now - s.lastSeen > SESSION_TTL_MS) sessions.delete(id);
  });
  // Hard cap: drop the oldest if a flood of new sessions arrives.
  while (sessions.size > MAX_SESSIONS) {
    const oldest = sessions.keys().next().value;
    if (oldest === undefined) break;
    sessions.delete(oldest);
  }
}

export class ChatLimitError extends Error {}

export interface ChatReply {
  sessionId: string;
  reply: string;
  quote: VerifiedQuote | null;
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

export function chatEnabled(): boolean {
  return process.env.CHAT_ENABLED === "true" && !!process.env.ANTHROPIC_API_KEY;
}

/**
 * Runs one customer turn: appends the message, loops through tool calls,
 * returns the assistant's text plus the last verified quote of this turn.
 */
export async function runChatTurn(
  sessionId: string | null | undefined,
  userMessage: string,
  deps: ChatToolDeps = dbChatDeps,
  anthropic: Pick<Anthropic, "beta"> = getClient(),
): Promise<ChatReply> {
  const now = Date.now();
  sweep(now);

  const id = sessionId && sessions.has(sessionId) ? sessionId : randomUUID();
  let session = sessions.get(id);
  if (!session) {
    session = { messages: [], turns: 0, lastSeen: now };
    sessions.set(id, session);
  }
  if (session.turns >= MAX_TURNS_PER_SESSION) {
    throw new ChatLimitError("This chat has reached its length limit. Please start a new chat or message us on WhatsApp.");
  }
  session.lastSeen = now;

  // Work on a copy; only commit to the session if the turn completes, so a
  // failed API call doesn't leave a dangling user message or tool_use.
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    ...session.messages,
    { role: "user", content: userMessage },
  ];
  let quote: VerifiedQuote | null = null;

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const response = await anthropic.beta.messages.create({
      model: MODEL,
      max_tokens: 4096,
      // Chat is a low-effort workload; the pricing rules live in the tools.
      output_config: { effort: "low" },
      // On a safety-classifier decline, re-run on Anthropic's recommended
      // fallback model instead of returning a refusal to the customer.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      tools: CHAT_TOOLS,
      messages,
    });

    // Full content (thinking blocks included) goes back verbatim: the
    // history is append-only.
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "refusal") {
      return commit(id, session, messages, quote,
        `Sorry, I can't help with that here. For anything about your trip, message us on WhatsApp at ${WHATSAPP_NUMBER}.`);
    }

    const toolUses = response.content.filter(
      (b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use",
    );
    if (response.stop_reason !== "tool_use" || toolUses.length === 0) {
      const text = response.content
        .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return commit(id, session, messages, quote, text);
    }

    if (round === MAX_TOOL_ROUNDS) break;

    // All tool results go back in ONE user message.
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
    for (const tu of toolUses) {
      let outcome;
      try {
        outcome = await runChatTool(tu.name, tu.input, deps);
      } catch (err) {
        console.error(`[chat] tool ${tu.name} failed:`, err);
        outcome = { content: JSON.stringify({ error: "Pricing lookup failed. Apologise and offer WhatsApp." }), isError: true };
      }
      if (outcome.quote) quote = outcome.quote;
      results.push({ type: "tool_result", tool_use_id: tu.id, content: outcome.content, is_error: outcome.isError });
    }
    messages.push({ role: "user", content: results });
  }

  // The loop ran out of rounds mid-tool-use; don't commit a dangling tool_use.
  throw new Error("chat tool loop exceeded its round limit");
}

function commit(
  id: string,
  session: ChatSession,
  messages: Anthropic.Beta.BetaMessageParam[],
  quote: VerifiedQuote | null,
  text: string,
): ChatReply {
  session.messages = messages;
  session.turns += 1;
  return {
    sessionId: id,
    reply: text || `Sorry, I didn't catch that. Could you rephrase, or message us on WhatsApp at ${WHATSAPP_NUMBER}?`,
    quote,
  };
}

/** Test hook. */
export function _resetChatSessions() {
  sessions.clear();
}
