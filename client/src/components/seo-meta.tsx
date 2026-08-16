import { useLayoutEffect } from "react";
import { canonicalForPath } from "@shared/public-routes";

export interface SeoMetaProps {
  title: string;
  description: string;
  /** Omit only for noindex pages (admin tools) — public pages must set it. */
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  schema?: object | object[];
  /**
   * Ask crawlers to stay out (admin/internal pages). Pass "follow" on pages
   * that shouldn't be indexed but still link somewhere useful — a 404 wants
   * crawlers to keep walking to the home and quote links, not dead-end.
   */
  noindex?: boolean | "follow";
}

// Must be a real file under client/public/ — /og-default.jpg never existed,
// so every share preview silently got the SPA shell HTML instead of an image.
const DEFAULT_OG_IMAGE = "https://affordegypt.com/images/giza-pyramids.jpg";

/**
 * Marks the elements this component owns, so it can replace exactly its own
 * output and leave anything hand-written in index.html alone.
 */
const OWNED = "data-seo-meta";

/**
 * This used to render react-helmet-async. It was replaced because helmet was
 * not doing the job:
 *
 *  - It wrote nothing at all under the dev server. Every title, description and
 *    JSON-LD block was unverifiable locally, which is why an earlier note in
 *    this repo records "react-helmet does not apply in the dev server" as a
 *    fact to work around rather than a bug to fix.
 *  - In the production build it wrote on first mount — that is how the
 *    prerendered HTML got correct heads — but never again. After any
 *    client-side navigation the tab kept the previous page's title and
 *    description: /destinations -> /about left "Egypt Destinations Guide" in
 *    place, and switching language to /reiseziele left an English title above
 *    German content. A MutationObserver on <head> recorded zero changes across
 *    those navigations.
 *
 * The library is at 2.0.5 and effectively unmaintained, and this was its only
 * use, so the head is managed here instead. Roughly seventy lines, works
 * identically in dev, in the production bundle and under Puppeteer, and is
 * ordinary DOM code anyone can step through.
 *
 * useLayoutEffect rather than useEffect: it runs before paint, and therefore
 * before the requestAnimationFrame in App.tsx that fires `prerender-ready`.
 * With useEffect the prerenderer could serialise the document before the head
 * was written, which would silently ship pages with the shell's title.
 */
export default function SeoMeta({
  title,
  description,
  canonical,
  ogImage,
  ogType,
  schema,
  noindex,
}: SeoMetaProps) {
  const image = ogImage ?? DEFAULT_OG_IMAGE;
  const type = ogType ?? "website";
  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];
  // Serialised so the effect re-runs when the content changes but not when a
  // caller rebuilds an equal object on every render — which every page that
  // builds its schema inline does.
  const schemaJson = JSON.stringify(schemas);
  // Pages hardcode their English canonical. On a translated route that would
  // declare the German page a duplicate of the English one, which removes it
  // from the index and invalidates the hreflang alternates pointing at it.
  const selfCanonical =
    canonical && typeof window !== "undefined"
      ? canonicalForPath(canonical, window.location.pathname)
      : canonical;

  useLayoutEffect(() => {
    const head = document.head;
    document.title = title;

    const metas: Array<[string, string, string]> = [
      ["name", "description", description],
      ["property", "og:title", title],
      ["property", "og:description", description],
      ["property", "og:type", type],
      ["property", "og:image", image],
      ["property", "og:site_name", "AffordEgypt"],
      ["name", "twitter:card", "summary_large_image"],
      ["name", "twitter:title", title],
      ["name", "twitter:description", description],
      ["name", "twitter:image", image],
    ];
    if (selfCanonical) metas.push(["property", "og:url", selfCanonical]);
    if (noindex) {
      metas.push([
        "name",
        "robots",
        noindex === "follow" ? "noindex, follow" : "noindex, nofollow",
      ]);
    }

    const created: Element[] = [];

    for (const [attr, key, content] of metas) {
      // Reuse a prerendered tag of the same identity rather than appending a
      // duplicate: the serialised HTML already carries one, and two
      // description metas is worse than none.
      const existing = head.querySelector(`meta[${attr}="${key}"]`);
      const el = existing ?? document.createElement("meta");
      el.setAttribute(attr, key);
      el.setAttribute("content", content);
      el.setAttribute(OWNED, "");
      if (!existing) {
        head.appendChild(el);
        created.push(el);
      }
    }

    let canonicalEl: HTMLLinkElement | null = null;
    if (selfCanonical) {
      canonicalEl =
        head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ??
        document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      canonicalEl.setAttribute("href", selfCanonical);
      canonicalEl.setAttribute(OWNED, "");
      if (!canonicalEl.parentNode) head.appendChild(canonicalEl);
    }

    // Structured data is replaced wholesale — a page's schemas are one unit,
    // and leaving a previous page's FAQPage behind would describe this one.
    head
      .querySelectorAll(`script[type="application/ld+json"][${OWNED}]`)
      .forEach((stale) => stale.remove());
    for (const s of JSON.parse(schemaJson) as object[]) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute(OWNED, "");
      script.textContent = JSON.stringify(s);
      head.appendChild(script);
      created.push(script);
    }

    return () => {
      // Only remove what this render added. Tags that were already in the
      // document get overwritten by the next page rather than deleted, so the
      // head never briefly empties between routes.
      //
      // The title is deliberately left alone: the next page sets its own in the
      // same commit, and restoring the previous one here only introduced a
      // flicker and a dependency on which of unmount and mount ran first.
      for (const el of created) el.remove();
    };
  }, [title, description, selfCanonical, image, type, noindex, schemaJson]);

  return null;
}
