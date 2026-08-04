import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Anchor price for hero subhead and FAQ "absolute minimum" answer.
// EGP is the source of truth; USD/EUR are display-only hints.
// Review monthly against current FX rates and update as needed.
const MIN_DAILY_PRICE_EGP = 5625;
const USD_DISPLAY_HINT = "$105";
const EUR_DISPLAY_HINT = "€98";

export default function Hero() {
  const scrollToQuote = () => {
    const element = document.getElementById("quote-builder");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="min-h-[90vh] flex items-center justify-center relative bg-cover bg-center bg-fixed bg-[url('/images/karnak-temple.jpg')]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(25,169,116,0.3)] to-[rgba(31,41,55,0.6)] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center text-white max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance leading-tight">
            {"Real Egypt tours, from a real Egyptian operator. "}
            <span className="text-primary-foreground bg-primary px-3 py-1 rounded-lg inline-block">
              Real prices.
            </span>
          </h1>

          <p className="text-lg md:text-xl mb-8 text-white/90 max-w-3xl mx-auto text-balance">
            AffordEgypt is the transparent budget tier from Travel2Egypt — an
            ETAA-licensed Egypt operator since 2003. Same licensed guides,
            lighter inclusions, no hidden fees.
          </p>
          <p className="text-lg md:text-xl mb-2 text-white/95 max-w-3xl mx-auto text-balance">
            {"Private car + Egyptologist from "}
            <span className="font-semibold text-white">
              {`LE ${MIN_DAILY_PRICE_EGP.toLocaleString("en-US")} / day`}
            </span>
          </p>
          <p className="text-sm md:text-base mb-8 text-white/75 max-w-3xl mx-auto">
            {`(~${USD_DISPLAY_HINT} USD / ${EUR_DISPLAY_HINT} EUR)`}
          </p>

          <Button
            onClick={scrollToQuote}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-lg font-semibold shadow-xl"
          >
            Build Your Quote in 60 Seconds
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <p className="mt-4 text-sm text-white/75">
            No account needed. Get your price, then send to WhatsApp.
          </p>
        </div>
      </div>
    </section>
  );
}
