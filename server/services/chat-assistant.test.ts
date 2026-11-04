// The chat loop with a scripted model: tool results go back in one user
// message, the verified quote comes from the tool (not the model's text),
// history stays server-side, and a failed turn leaves no trace in it.
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../db", () => ({ db: {}, pool: {} }));

import { runChatTurn, _resetChatSessions } from "./chat-assistant";
import type { ChatToolDeps } from "./chat-tools";

const deps: ChatToolDeps = {
  loadCatalog: async () => [
    {
      slug: "cairo-airport-hotel",
      name: "Airport → Hotel",
      city: "Cairo",
      category: "airport_transfer",
      pickupZone: null,
      vehiclePrices: { sedan_one_way: 2025 },
    },
  ],
  loadEntranceFees: async () => [],
  loadGuideRates: async () => [],
  buildQuote: async (_c, travelers) => ({
    lineItems: [
      {
        kind: "service",
        description: "x",
        unitPrice: 2025,
        quantity: 1,
        lineTotal: 2025,
        meta: { serviceSlug: "cairo-airport-hotel", vehicleSlug: "sedan", cityName: "Cairo" },
      },
    ],
    breakdown: { routes: 2025, guide: 0, attractions: 0, addons: 0 },
    subtotal: 2025,
    total: 2025,
    travelers,
    perCity: [],
  }),
};

function scripted(responses: unknown[]) {
  const calls: any[] = [];
  const create = vi.fn(async (params: any) => {
    calls.push(structuredClone(params));
    const next = responses.shift();
    if (next instanceof Error) throw next;
    return next;
  });
  return { client: { beta: { messages: { create } } } as any, calls, create };
}

const toolTurn = (blocks: unknown[]) => ({ stop_reason: "tool_use", content: blocks });
const textTurn = (text: string) => ({ stop_reason: "end_turn", content: [{ type: "text", text }] });

beforeEach(() => _resetChatSessions());

describe("runChatTurn", () => {
  it("runs tools, returns ALL results in one user message, and surfaces the verified quote", async () => {
    const { client, calls } = scripted([
      toolTurn([
        { type: "tool_use", id: "t1", name: "search_services", input: { city: "Cairo" } },
        {
          type: "tool_use",
          id: "t2",
          name: "calculate_quote",
          input: { travelers: 2, cities: [{ city: "Cairo", services: [{ slug: "cairo-airport-hotel", vehicle: "sedan", trip_type: "one_way" }] }] },
        },
      ]),
      textTurn("Your airport pickup is LE 2,025."),
    ]);

    const out = await runChatTurn(null, "airport pickup for 2", deps, client);

    expect(out.reply).toBe("Your airport pickup is LE 2,025.");
    expect(out.quote).toMatchObject({ total: 2025, perPerson: 1012.5, travelers: 2 });
    const toolResultMsg = calls[1].messages[2];
    expect(toolResultMsg.role).toBe("user");
    expect(toolResultMsg.content.map((b: any) => b.tool_use_id)).toEqual(["t1", "t2"]);
    expect(calls[0].fallbacks).toBe("default");
  });

  it("keeps history server-side: the second turn replays the first without the client sending it", async () => {
    const { client, calls } = scripted([textTurn("How many travellers?"), textTurn("Thanks!")]);
    const first = await runChatTurn(null, "Luxor tour", deps, client);
    await runChatTurn(first.sessionId, "Four", deps, client);
    expect(calls[1].messages.map((m: any) => m.role)).toEqual(["user", "assistant", "user"]);
    expect(calls[1].messages[0].content).toBe("Luxor tour");
  });

  it("ignores an unknown session id and starts fresh", async () => {
    const { client } = scripted([textTurn("Hi")]);
    const out = await runChatTurn("00000000-0000-4000-8000-000000000000", "hi", deps, client);
    expect(out.sessionId).not.toBe("00000000-0000-4000-8000-000000000000");
  });

  it("does not commit a turn whose API call failed", async () => {
    const { client, calls } = scripted([textTurn("Hello"), new Error("overloaded"), textTurn("Back")]);
    const first = await runChatTurn(null, "one", deps, client);
    await expect(runChatTurn(first.sessionId, "two", deps, client)).rejects.toThrow("overloaded");
    await runChatTurn(first.sessionId, "three", deps, client);
    expect(calls[2].messages.map((m: any) => m.content)).toEqual(["one", [{ type: "text", text: "Hello" }], "three"]);
  });

  it("answers a refusal with a WhatsApp hand-off instead of an empty reply", async () => {
    const { client } = scripted([{ stop_reason: "refusal", content: [] }]);
    const out = await runChatTurn(null, "something off-topic", deps, client);
    expect(out.reply).toMatch(/WhatsApp/);
    expect(out.quote).toBeNull();
  });
});
