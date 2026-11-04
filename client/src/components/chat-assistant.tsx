// Floating "Ask for a price" chat assistant.
//
// Renders nothing unless the server says chat is enabled
// (GET /api/chat/config), so a deploy without CHAT_ENABLED / the API key
// shows no widget at all rather than a broken one.
//
// Prices in the assistant's text are model-written summaries of tool
// output; the price CARD is rendered straight from the pricing engine's
// result (`quote` in the response), never from model text. The card is what
// the customer acts on, and its "Send on WhatsApp" hand-off carries the
// card's numbers, not the chat text.

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle, X, Send, Loader2, ShieldCheck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { formatEGP } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

export interface ChatQuote {
  travelers: number;
  currency: "EGP";
  total: number;
  perPerson: number;
  lines: Array<{ label: string; city: string; amount: number }>;
}

interface ChatEntry {
  role: "user" | "assistant";
  text: string;
  quote?: ChatQuote | null;
  error?: boolean;
}

const WHATSAPP_URL = "https://wa.me/201100765283";

/** WhatsApp message carrying the verified quote's own numbers. */
export function whatsappQuoteText(q: ChatQuote, intro: string): string {
  const lines = q.lines.map((l) => `- ${l.label}${l.city ? ` [${l.city}]` : ""}: ${formatEGP(l.amount)}`);
  return [
    intro,
    ...lines,
    `Total: ${formatEGP(q.total)} (${q.travelers} × ${formatEGP(q.perPerson)})`,
  ].join("\n");
}

function QuoteCard({ quote }: { quote: ChatQuote }) {
  const { t } = useTranslation();
  const href = `${WHATSAPP_URL}?text=${encodeURIComponent(whatsappQuoteText(quote, t("chat.whatsappIntro")))}`;
  return (
    <div className="mt-2 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-gray-800">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-teal-800">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        {t("chat.verifiedPrice")}
      </div>
      <ul className="space-y-1">
        {quote.lines.map((l, i) => (
          <li key={i} className="flex justify-between gap-3">
            <span className="min-w-0">{l.label}</span>
            <span className="shrink-0 tabular-nums">{formatEGP(l.amount)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex justify-between border-t border-teal-200 pt-2 font-semibold">
        <span>{t("chat.total", { count: quote.travelers })}</span>
        <span className="tabular-nums">{formatEGP(quote.total)}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>{t("chat.perPerson")}</span>
        <span className="tabular-nums">{formatEGP(quote.perPerson)}</span>
      </div>
      <p className="mt-2 text-xs text-gray-600">{t("chat.depositNote", { amount: formatEGP(Math.round(quote.total * 0.1)) })}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("chat_quote_whatsapp", "chat", undefined, quote.total)}
        className="mt-2 flex min-h-10 items-center justify-center gap-2 rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
      >
        <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
        {t("chat.bookOnWhatsapp")}
      </a>
    </div>
  );
}

export default function ChatAssistant() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const sessionId = useRef<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/chat/config")
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((c) => alive && setEnabled(!!c.enabled))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [entries, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!enabled) return null;

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
    setInput("");
    setEntries((prev) => [...prev, { role: "user", text: message }]);
    setBusy(true);
    if (!sessionId.current) trackEvent("chat_start", "chat");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.current, message }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || t("chat.error"));
      sessionId.current = body.sessionId;
      if (body.quote) trackEvent("chat_quote", "chat", undefined, body.quote.total);
      setEntries((prev) => [...prev, { role: "assistant", text: body.reply, quote: body.quote }]);
    } catch (err) {
      setEntries((prev) => [
        ...prev,
        { role: "assistant", text: err instanceof Error ? err.message : t("chat.error"), error: true },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    sessionId.current = null;
    setEntries([]);
  };

  return (
    <>
      {!open && (
        <div className="fixed bottom-36 right-4 z-50 md:bottom-24 md:right-6">
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              trackEvent("chat_open", "chat");
            }}
            aria-label={t("chat.open")}
            className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-teal-600 p-3 text-white shadow-lg transition-all hover:bg-teal-700 hover:shadow-xl md:px-4"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            <span className="hidden text-sm font-medium md:inline">{t("chat.launcher")}</span>
          </button>
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={t("chat.title")}
          className="fixed inset-x-2 bottom-2 top-16 z-[60] flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl md:inset-x-auto md:right-6 md:top-auto md:bottom-6 md:h-[600px] md:max-h-[calc(100vh-3rem)] md:w-[380px]"
        >
          <div className="flex items-center justify-between bg-teal-600 px-4 py-3 text-white">
            <div>
              <div className="text-sm font-semibold">{t("chat.title")}</div>
              <div className="text-xs text-teal-100">{t("chat.subtitle")}</div>
            </div>
            <div className="flex items-center gap-1">
              {entries.length > 0 && (
                <button type="button" onClick={reset} className="rounded px-2 py-1 text-xs hover:bg-teal-700">
                  {t("chat.newChat")}
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("chat.close")}
                className="rounded p-1.5 hover:bg-teal-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-3 py-3" aria-live="polite">
            {entries.length === 0 && (
              <div className="space-y-2">
                <p className="rounded-lg bg-white p-3 text-sm text-gray-700 shadow-sm">{t("chat.greeting")}</p>
                {(["example1", "example2", "example3"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setInput(t(`chat.${k}`));
                      inputRef.current?.focus();
                    }}
                    className="block w-full rounded-lg border border-teal-200 bg-white px-3 py-2 text-left text-sm text-teal-800 hover:bg-teal-50"
                  >
                    {t(`chat.${k}`)}
                  </button>
                ))}
              </div>
            )}
            {entries.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="ml-8 whitespace-pre-wrap rounded-lg bg-teal-600 px-3 py-2 text-sm text-white">
                  {m.text}
                </div>
              ) : (
                <div key={i} className="mr-4">
                  <div
                    className={`whitespace-pre-wrap rounded-lg px-3 py-2 text-sm shadow-sm ${
                      m.error ? "bg-red-50 text-red-800" : "bg-white text-gray-800"
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.quote && <QuoteCard quote={m.quote} />}
                </div>
              ),
            )}
            {busy && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                {t("chat.thinking")}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="flex items-end gap-2 border-t border-gray-200 bg-white p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={1}
              maxLength={1000}
              placeholder={t("chat.placeholder")}
              aria-label={t("chat.placeholder")}
              className="max-h-28 min-h-10 flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-base focus:border-teal-500 focus:outline-none md:text-sm"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label={t("chat.send")}
              className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
          <p className="bg-white px-3 pb-2 text-[11px] text-gray-500">{t("chat.disclaimer")}</p>
        </div>
      )}
    </>
  );
}
