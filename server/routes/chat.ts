// Website chat assistant endpoints.
//
//   GET  /api/chat/config  → { enabled }  (the widget renders only when true)
//   POST /api/chat         → { sessionId, reply, quote }
//
// OFF unless CHAT_ENABLED=true AND ANTHROPIC_API_KEY are set on the server.
// Merging to main deploys (Railway), so a missing env var must mean "no
// widget", never "a widget that errors".
//
// Every message costs real money at the model provider, so the public
// endpoint carries three cheap guards: a per-IP sliding window, a per-day
// global cap, and a message length limit. All in memory (one instance).

import type { Express, Request } from "express";
import { z } from "zod";
import { validateBody } from "../middleware/validate";
import { chatEnabled, runChatTurn, ChatLimitError, WHATSAPP_NUMBER } from "../services/chat-assistant";

const PER_IP_LIMIT = 20;
const PER_IP_WINDOW_MS = 10 * 60 * 1000;
const DAILY_LIMIT = Number(process.env.CHAT_DAILY_LIMIT) || 500;

export const chatRequestSchema = z.object({
  sessionId: z.string().uuid().nullish(),
  message: z.string().trim().min(1).max(1000),
});

const hits = new Map<string, number[]>();
let day = new Date().toISOString().slice(0, 10);
let dayCount = 0;

function clientIp(req: Request): string {
  // Railway sits behind a proxy; the first X-Forwarded-For hop is the client.
  const fwd = req.headers["x-forwarded-for"];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0]?.trim();
  return first || req.socket.remoteAddress || "unknown";
}

/** Returns a reason string if the request should be refused, else null. */
export function checkRateLimit(ip: string, now = Date.now()): string | null {
  const today = new Date(now).toISOString().slice(0, 10);
  if (today !== day) {
    day = today;
    dayCount = 0;
  }
  if (dayCount >= DAILY_LIMIT) return "daily";

  const recent = (hits.get(ip) ?? []).filter((t) => now - t < PER_IP_WINDOW_MS);
  if (recent.length >= PER_IP_LIMIT) {
    hits.set(ip, recent);
    return "ip";
  }
  recent.push(now);
  hits.set(ip, recent);
  dayCount += 1;

  if (hits.size > 10_000) {
    hits.forEach((v, k) => {
      if (v.every((t) => now - t >= PER_IP_WINDOW_MS)) hits.delete(k);
    });
  }
  return null;
}

export function _resetChatRateLimits() {
  hits.clear();
  dayCount = 0;
}

export function registerChatRoutes(app: Express): void {
  app.get("/api/chat/config", (_req, res) => {
    res.json({ enabled: chatEnabled() });
  });

  app.post("/api/chat", validateBody(chatRequestSchema), async (req, res) => {
    if (!chatEnabled()) return res.status(404).json({ message: "Chat is not enabled" });

    const limited = checkRateLimit(clientIp(req));
    if (limited) {
      return res.status(429).json({
        message:
          limited === "daily"
            ? `The chat assistant is busy right now. Please message us on WhatsApp at ${WHATSAPP_NUMBER}.`
            : "You're sending messages quickly. Please wait a few minutes and try again.",
      });
    }

    try {
      const result = await runChatTurn(req.body.sessionId, String(req.body.message).trim());
      res.json(result);
    } catch (err) {
      if (err instanceof ChatLimitError) return res.status(429).json({ message: err.message });
      console.error("[POST /api/chat] Error:", err);
      res.status(502).json({
        message: `Sorry, the assistant is unavailable right now. Please message us on WhatsApp at ${WHATSAPP_NUMBER}.`,
      });
    }
  });
}
