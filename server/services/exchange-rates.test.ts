import { describe, expect, it, vi } from "vitest";
import { createExchangeRateService, parseExchangeRates } from "./exchange-rates";
import { convertEGP } from "@shared/exchange-rates";
const NOW = Date.parse("2026-10-13T12:00:00Z");
const rows = [
  { base: "EGP", quote: "USD", date: "2026-10-13", rate: 0.02 },
  { base: "EGP", quote: "EUR", date: "2026-10-13", rate: 0.018 },
  { base: "EGP", quote: "GBP", date: "2026-10-13", rate: 0.015 },
];
describe("currency estimates", () => {
  it("multiplies an EGP amount by the target rate, without rounding the source price", () => {
    expect(convertEGP("5450", 0.02)).toBe(109);
    expect(convertEGP(5450, 0.018)).toBeCloseTo(98.1);
    expect(convertEGP(5450, 0.015)).toBeCloseTo(81.75);
    expect(convertEGP(0, 0.02)).toBe(0);
    for (const amount of [null, undefined, "", "oops", -1, Infinity]) expect(convertEGP(amount, 0.02)).toBeNull();
  });
  it("rejects missing, invalid, future and outdated provider rates", () => {
    expect(parseExchangeRates(rows, NOW).rates.USD).toBe(0.02);
    for (const change of [{ rate: 0 }, { rate: -1 }, { rate: "0.02" }, { base: "USD" }, { date: "2026-10-14" }, { date: "2026-10-01" }]) {
      expect(() => parseExchangeRates([{ ...rows[0], ...change }, ...rows.slice(1)], NOW)).toThrow();
    }
    expect(() => parseExchangeRates(rows.slice(1), NOW)).toThrow();
  });
  it("shares concurrent fetches and caches successful rates for an hour", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify(rows)));
    const getRates = createExchangeRateService(fetcher as typeof fetch, () => NOW);
    const results = await Promise.all([getRates(), getRates(), getRates()]);
    expect(results[0].stale).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(1);
    await getRates();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("labels cached rates during an outage, backs off, and refuses expired rates", async () => {
    let now = NOW;
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(rows))).mockRejectedValue(new Error("offline"));
    const getRates = createExchangeRateService(fetcher, () => now);
    await getRates();
    now += 2 * 60 * 60 * 1000;
    expect((await getRates()).stale).toBe(true);
    expect((await getRates()).stale).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(2);
    now += 8 * 24 * 60 * 60 * 1000;
    await expect(getRates()).rejects.toThrow("temporarily unavailable");
  });
  it("returns unavailable with no cache and retries after the backoff", async () => {
    let now = NOW;
    const fetcher = vi.fn().mockResolvedValueOnce(new Response("down", { status: 503 })).mockResolvedValue(new Response(JSON.stringify(rows)));
    const getRates = createExchangeRateService(fetcher, () => now);
    await expect(getRates()).rejects.toThrow();
    await expect(getRates()).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledTimes(1);
    now += 61_000;
    expect((await getRates()).rates.GBP).toBe(0.015);
  });
});
