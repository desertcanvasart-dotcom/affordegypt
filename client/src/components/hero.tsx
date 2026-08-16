import { ArrowRight } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { formatLE } from "@/lib/service-pricing";
import { OPERATOR } from "@shared/operator-facts";

// Cairo guide + full-day private car, from the build-time pricing snapshot.
// This was `const MIN_DAILY_PRICE_EGP = 5625` — the most prominent price on the
// site, and the one literal that survived #48 because that sweep grepped for
// the formatted "5,625" rather than the bare number.
//
// The USD/EUR hints that used to sit here are gone. They were "$105 / €98"
// while the FAQ quoted "$118 / €110" for the same EGP figure, their comment
// asked for a monthly FX review that never happened, and a stale conversion is
// exactly the kind of number a transparent-pricing pitch cannot afford.
//
// The "/ day" that used to be concatenated here in English now lives inside
// each locale's priceLine, so the unit follows the sentence it belongs to.

export default function Hero() {
  const { t } = useTranslation();

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
          {/* Trans, not two concatenated halves: the highlighted phrase is a
              clause, and which words it covers — and where it falls in the
              sentence — is a decision each language has to make for itself. */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance leading-tight">
            <Trans
              i18nKey="hero.title"
              components={{
                highlight: (
                  <span className="text-primary-foreground bg-primary px-3 py-1 rounded-lg inline-block" />
                ),
              }}
            />
          </h1>

          {/* One line on purpose: the header already carries the legal entity
              and license number, and the trust bar covers pricing honesty —
              this only adds what the rest of the screen doesn't say. */}
          <p className="text-lg md:text-xl mb-8 text-white/90 max-w-3xl mx-auto text-balance">
            {t("hero.subtitle", { year: OPERATOR.licensedSince })}
          </p>
          <p className="text-lg md:text-xl mb-8 text-white/95 max-w-3xl mx-auto text-balance">
            <Trans
              i18nKey="hero.priceLine"
              values={{ price: formatLE("cairo-guide-car") }}
              components={{ price: <span className="font-semibold text-white" /> }}
            />
          </p>

          <Button
            onClick={scrollToQuote}
            size="lg"
            // Buttons are white-space:nowrap by default. At text-lg/px-8 this label is
            // 370px wide and cannot wrap, which set the hero container's min-content
            // width to 402px — wider than a 375px phone — so the whole homepage
            // scrolled sideways. Scaled down below sm so it fits; full size from sm up.
            //
            // Scaling alone only held while the label was the English one. Translating
            // it brought the page back to 386px on a 375px screen in Spanish and 385px
            // in French, because those labels are longer and still could not wrap. The
            // button wraps below sm now, so no future translation can widen the page —
            // a CTA that fits in exactly one language is not a fixed layout.
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-6 sm:text-lg sm:px-8 py-6 rounded-lg font-semibold shadow-xl whitespace-normal sm:whitespace-nowrap"
          >
            {t("hero.cta")}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <p className="mt-4 text-sm text-white/75">{t("hero.note")}</p>
        </div>
      </div>
    </section>
  );
}
