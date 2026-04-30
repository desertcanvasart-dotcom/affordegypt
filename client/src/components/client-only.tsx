import { useEffect, useState, type ReactNode } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only after mount, on the client.
 *
 * Use for components whose first render produces different DOM than their
 * subsequent renders (e.g. Radix Select, components that depend on
 * window/localStorage, components with refs that influence first render).
 *
 * During prerender (puppeteer with @prerenderer/renderer-puppeteer's
 * `inject: { isPrerender: true }` flag set) and on first hydration pass, this
 * renders the optional fallback (or null). After hydration completes on a
 * real client, it renders the actual children.
 *
 * The prerender flag check ensures the captured static HTML never includes the
 * children, so the hydration walk sees matching `null`/fallback markup.
 *
 * This trades crawler-visibility of the wrapped UI for hydration correctness.
 * Only wrap components where the wrapped UI is not SEO-critical.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const injected = (window as any).__PRERENDER_INJECTED;
      if (injected?.isPrerender) return;
    }
    setMounted(true);
  }, []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
