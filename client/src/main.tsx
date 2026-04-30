import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { applyDetectedLanguage } from "./i18n";

const rootElement = document.getElementById("root")!;
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, <App />, {
    onRecoverableError: (error, errorInfo) => {
      try {
        const err = error as Error;
        console.error(
          "[hydration] recoverable error:",
          err?.message ?? String(error),
          "\nstack:",
          err?.stack ?? "(no stack)",
          "\ncomponentStack:",
          errorInfo?.componentStack ?? "(no componentStack)",
        );
      } catch {
        // never let the diagnostic itself break anything
      }
    },
  });
} else {
  createRoot(rootElement).render(<App />);
}

// Run language detection AFTER hydration completes so first paint matches the
// prerendered (English) HTML. If the user prefers another language it will
// swap in via a normal post-hydration re-render.
const runDetection = () => applyDetectedLanguage();
if (typeof window !== "undefined") {
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(runDetection, { timeout: 1000 });
  } else {
    setTimeout(runDetection, 0);
  }
}
