import { useEffect, useState } from "react";

/**
 * "On this page" navigation for the long-form guide pages.
 *
 * Headings are discovered from the DOM rather than passed in as a list. Two
 * reasons: the guides render their headings from translated content objects, so
 * a hardcoded list would be English-only and wrong the moment someone switches
 * language; and a hand-maintained list is exactly the kind of duplicated
 * source-of-truth that produced the pricing and trust-claim drift elsewhere in
 * this repo. Add an <h2>, it appears here.
 *
 * Deliberately renders nothing until after mount. The guides are prerendered,
 * and emitting a heading list during prerender that the client then rebuilt
 * would be a hydration mismatch — the class of bug that caused the locale
 * flicker. Empty on the server, empty on first client render, populated after.
 */

const SLUG_MAX = 60;

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // strip accents so ids stay URL-safe
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, SLUG_MAX) || "section"
  );
}

interface TocItem {
  id: string;
  text: string;
}

export default function GuideToc({
  /** Below this many headings a TOC is noise rather than navigation. */
  minHeadings = 3,
}: {
  minHeadings?: number;
}) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll("h2")).filter(
      // Navbar/footer headings are not page sections. [data-guide-toc] excludes
      // this component's own markup.
      (h) => !h.closest("nav, header, footer, [data-guide-toc]"),
    );

    const seen = new Map<string, number>();
    const found: TocItem[] = [];

    for (const h of headings) {
      const text = (h.textContent ?? "").trim().replace(/\s+/g, " ");
      if (!text) continue;

      if (!h.id) {
        const base = slugify(text);
        const n = seen.get(base) ?? 0;
        seen.set(base, n + 1);
        h.id = n === 0 ? base : `${base}-${n + 1}`;
      }

      // The navbar (h-16/h-20, sticky) plus this bar would otherwise sit on top
      // of whatever the anchor jumps to. Set inline so it survives regardless of
      // which utility classes the page already applies.
      h.style.scrollMarginTop = "9rem";

      found.push({ id: h.id, text });
    }

    if (found.length >= minHeadings) setItems(found);
  }, [minHeadings]);

  // Active section = the last heading whose top has scrolled past the sticky
  // chrome. A plain scroll listener rather than IntersectionObserver: an
  // observer band leaves no section highlighted whenever a long section spans
  // the whole viewport with its heading already above the band, which is the
  // common case on these pages — one heading can be followed by 1,500 lines.
  // rAF-throttled, so at most one measurement per frame over ≤10 headings.
  useEffect(() => {
    if (items.length === 0) return;

    const INTERVAL = 100;
    let last = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const measure = () => {
      // Just below the navbar + this bar, so the highlight changes as a heading
      // slides under the sticky chrome rather than when it leaves the viewport.
      const marker = 160;
      let current = items[0].id;
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= marker) current = id;
      }
      setActiveId(current);
    };

    // Leading + trailing throttle rather than requestAnimationFrame: rAF is
    // suspended while the tab is backgrounded, so a heading scrolled past in a
    // hidden tab would still be highlighted when the reader returns. At most
    // one pass per 100ms over ≤10 headings.
    const onScroll = () => {
      const now = Date.now();
      if (now - last >= INTERVAL) {
        last = now;
        measure();
      } else if (timer === undefined) {
        timer = setTimeout(() => {
          timer = undefined;
          last = Date.now();
          measure();
        }, INTERVAL);
      }
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      data-guide-toc
      className="sticky top-16 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Horizontal scroll rather than wrapping: keeps the bar one row tall on
            mobile without hiding sections behind a toggle. */}
        <ul className="flex items-center gap-1 overflow-x-auto whitespace-nowrap py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <li className="shrink-0 pr-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            On this page
          </li>
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={`flex min-h-11 items-center rounded-md px-3 text-sm transition-colors ${
                    isActive
                      ? "font-semibold text-teal-700 bg-teal-50"
                      : "text-gray-600 hover:text-teal-700 hover:bg-gray-50"
                  }`}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
