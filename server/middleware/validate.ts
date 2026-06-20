import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";

/**
 * Express middleware factory: validate `req.body` against a Zod schema.
 *
 * On failure responds 400 with `{ message, issues }` — the same shape the
 * pre-existing /api/calculate-pricing handler returns — and does NOT call
 * next(), so the handler never runs on bad input.
 *
 * This is a GATE: on success `req.body` is left untouched and the handler
 * runs exactly as before. Schemas are therefore free to ignore fields they
 * don't care about (unknown keys pass), so retrofitting validation onto a
 * live handler cannot strip a field the handler still reads.
 */
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid request",
        issues: result.error.issues.map((i) => ({
          path: i.path.join(".") || "(body)",
          message: i.message,
        })),
      });
    }
    next();
  };
}
