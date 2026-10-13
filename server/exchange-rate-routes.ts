import type { Express } from "express";
import { getExchangeRates } from "./services/exchange-rates";

export function registerExchangeRateRoutes(app: Express) {
  app.get("/api/exchange-rates", async (_req, res) => {
    try {
      const rates = await getExchangeRates();
      res.setHeader("Cache-Control", rates.stale ? "no-store" : "public, max-age=300");
      res.json(rates);
    } catch {
      res.setHeader("Cache-Control", "no-store");
      res.status(503).json({ message: "Exchange rates temporarily unavailable" });
    }
  });
}
