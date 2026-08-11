import { describe, expect, it } from "vitest";
import {
  COLLAPSE_AT,
  EXPAND_AT,
  HEADER_SHED_PX,
  nextCollapsed,
} from "./header-collapse";

describe("header collapse hysteresis", () => {
  it("collapses only past the upper threshold", () => {
    expect(nextCollapsed(false, 0)).toBe(false);
    expect(nextCollapsed(false, COLLAPSE_AT)).toBe(false);
    expect(nextCollapsed(false, COLLAPSE_AT + 1)).toBe(true);
  });

  it("expands only below the lower threshold", () => {
    expect(nextCollapsed(true, COLLAPSE_AT)).toBe(true);
    expect(nextCollapsed(true, EXPAND_AT + 1)).toBe(true);
    expect(nextCollapsed(true, EXPAND_AT)).toBe(false);
    expect(nextCollapsed(true, 0)).toBe(false);
  });

  // The invariant that makes the state machine stable at all: collapsing
  // sheds HEADER_SHED_PX of in-flow height, and scroll anchoring moves
  // scrollY by up to that much in response. If the thresholds were closer
  // together than the shed height, that adjustment could re-cross the other
  // threshold and the header would oscillate (the shaking-header bug this
  // module exists to prevent).
  it("keeps the threshold gap wider than the height the header sheds", () => {
    expect(COLLAPSE_AT - EXPAND_AT).toBeGreaterThan(HEADER_SHED_PX);
  });

  it("survives scroll anchoring without oscillating, at every position", () => {
    // Model the browser: each toggle shifts scrollY by the shed height
    // (up on collapse, down on expand), then the handler runs again on the
    // resulting scroll event. Stable means: at most one further transition,
    // never a return to the state we just left.
    for (let y = 0; y <= COLLAPSE_AT + HEADER_SHED_PX + 10; y++) {
      for (const start of [false, true]) {
        let state = start;
        let pos = y;
        const seen: boolean[] = [state];
        for (let step = 0; step < 10; step++) {
          const next = nextCollapsed(state, pos);
          if (next === state) break;
          pos += next ? -HEADER_SHED_PX : HEADER_SHED_PX;
          pos = Math.max(0, pos);
          state = next;
          seen.push(state);
        }
        // Oscillation would revisit a state after leaving it: [a, b, a, ...]
        expect(seen.length).toBeLessThanOrEqual(2);
      }
    }
  });
});
