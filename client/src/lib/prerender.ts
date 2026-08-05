/**
 * Prerender snapshot preparation.
 *
 * The build prerenders public routes by loading them in Puppeteer and
 * serialising the live DOM (`@prerenderer/rollup-plugin`). Serialisation is
 * where hydration used to break: `outerHTML` writes adjacent text nodes as one
 * run of characters, and the boundary between them is gone forever.
 *
 * React cares about that boundary. `Licensed since {OPERATOR.licensedSince}`
 * is two text children, so React creates two text nodes and expects to find two
 * when it hydrates. The snapshot only has "Licensed since 2003" — one node —
 * and React reports a mismatch (#418). The pattern "some words {anExpression}"
 * appears in the header, the footer and nearly every section, which is why a
 * single homepage load produced ~18 of them, and why one failure outside a
 * Suspense boundary (#423) then threw away the server HTML for the whole root.
 *
 * Real SSR never hits this because `renderToString` emits `<!-- -->` between
 * adjacent text nodes; hydration skips comment nodes, so the boundary survives
 * the HTML round trip. We do the same thing to the snapshot DOM just before the
 * prerenderer takes it.
 */

/** Comments are literal text inside these — inserting one would corrupt content. */
const RAW_TEXT_PARENTS = new Set([
  "SCRIPT",
  "STYLE",
  "TEXTAREA",
  "TITLE",
  "NOSCRIPT",
  "XMP",
]);

/**
 * Insert an empty comment between every pair of adjacent text nodes, matching
 * what `renderToString` would have emitted.
 */
export function insertTextNodeSeparators(root: Node = document.body): number {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  // Collect first, mutate after: inserting during the walk would have the
  // walker step over nodes we still need to visit.
  const needsSeparator: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node as Text;
    const parent = text.parentNode;
    if (!parent || RAW_TEXT_PARENTS.has((parent as Element).nodeName)) continue;
    if (text.previousSibling?.nodeType === Node.TEXT_NODE) {
      needsSeparator.push(text);
    }
  }

  for (const text of needsSeparator) {
    text.parentNode?.insertBefore(document.createComment(""), text);
  }

  return needsSeparator.length;
}

/** True when this page is being rendered by the build's Puppeteer instance. */
export function isPrerendering(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as any).__PRERENDER_INJECTED?.isPrerender);
}

/**
 * Tell the prerenderer the page is done. Under Puppeteer this first repairs the
 * text-node boundaries; in a real browser it is just the event dispatch, which
 * is harmless (nothing listens for it).
 */
export function signalPrerenderReady(): void {
  if (isPrerendering()) {
    insertTextNodeSeparators(document.body);
  }
  document.dispatchEvent(new Event("prerender-ready"));
}
