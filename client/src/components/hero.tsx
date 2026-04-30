import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Replace the placeholder once Islam confirms the real defensible floor
// price. Used in hero subhead and the FAQ "absolute minimum" answer.
const MIN_DAILY_PRICE_USD = "X";

export default function Hero() {
  const scrollToQuote = () => {
    const element = document.getElementById("quote-builder");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="min-h-[90vh] flex items-center justify-center relative"
      style={{
        backgroundImage: `linear-gradient(rgba(25, 169, 116, 0.3), rgba(31, 41, 55, 0.6)), url('http://travel2egypt.org/wp-content/uploads/2025/06/karnak-temple.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center text-white max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance leading-tight">
            Real Egypt tours, from a real Egyptian operator.{" "}
            <span className="text-primary-foreground bg-primary px-3 py-1 rounded-lg inline-block">
              Real prices.
            </span>
          </h1>

          <p className="text-lg md:text-xl mb-8 text-white/90 max-w-3xl mx-auto text-balance">
            AffordEgypt is the transparent budget tier from Travel2Egypt — an
            ETAA-licensed Cairo operator since 2020. Same licensed guides,
            lighter inclusions, no hidden fees. Private car + Egyptologist from{" "}
            <span className="font-semibold text-white">
              ${MIN_DAILY_PRICE_USD}/day
            </span>
            , all-in.
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
