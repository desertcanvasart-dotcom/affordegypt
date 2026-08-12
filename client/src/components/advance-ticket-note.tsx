import { Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSmartTranslation } from "@/hooks/useSmartTranslation";

/**
 * The optional advance entrance-ticket service, shown on the three guide and
 * car pages directly under the band that ends "Entrance tickets billed
 * separately" — the point at which a reader has just learned tickets are not
 * included and is most likely to want the alternative.
 *
 * One component rather than the same block pasted into three pages: the
 * entrance-fee copy on these pages has already contradicted itself once, when
 * a card claimed "All entrance fees" while the hero said the opposite.
 *
 * The wording says the service can "reduce time at ticket offices", never that
 * it skips the queue. Security screening, identity and student-card checks,
 * timed entry and venue capacity all still apply, and promising otherwise
 * would be the same unsupportable claim as the "exclusive early access" line
 * removed from the Luxor page.
 */
export default function AdvanceTicketNote() {
  const { t } = useSmartTranslation();

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Ticket className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t("guideServices.common.ticketServiceTitle")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("guideServices.common.ticketServiceBody1")}{" "}
                    <strong className="text-foreground">
                      {t("guideServices.common.ticketServiceFee")}
                    </strong>
                    {t("guideServices.common.ticketServiceBody2")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
