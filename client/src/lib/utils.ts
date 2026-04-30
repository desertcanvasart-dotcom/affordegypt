import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// EGP is the canonical display currency. "LE" prefix, comma-thousands,
// no fractional part for whole-pound totals.
export function formatEGP(amount: number | string | null | undefined): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (n == null || Number.isNaN(n)) return "LE 0";
  const rounded = Math.round(n);
  return `LE ${rounded.toLocaleString("en-US")}`;
}
