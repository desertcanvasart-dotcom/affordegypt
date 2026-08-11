/**
 * Hysteresis for the sticky header's collapsed state.
 *
 * Collapsing sheds in-flow height (80→64px bar + 36px trust line = 52px), and
 * the browser's scroll anchoring moves scrollY by the same amount to keep the
 * content under the cursor still. A single threshold below that shed height can
 * therefore never be stable: crossing it shifts scrollY back across it and the
 * header oscillates — the "shaking header" bug. Two thresholds are stable if
 * and only if their gap exceeds the shed height; keep that invariant if the
 * header's collapsed/expanded dimensions ever change.
 *
 * Extracted from the navbar so the rule is testable without a browser — see
 * header-collapse.test.ts, which encodes the stability argument.
 */

/** In-flow height the header sheds when it collapses. */
export const HEADER_SHED_PX = 52;

export const COLLAPSE_AT = 140;
export const EXPAND_AT = 40;

/** Next collapsed state for a given scroll position. */
export function nextCollapsed(prev: boolean, scrollY: number): boolean {
  return prev ? scrollY > EXPAND_AT : scrollY > COLLAPSE_AT;
}
