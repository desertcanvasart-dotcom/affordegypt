import type { Express } from "express";
import { validateBody } from "../middleware/validate";
import {
  contactRequestSchema,
  newsletterSubscribeSchema,
} from "../request-schemas";
import {
  sendContactFormEmail,
  sendNewsletterSubscriptionEmail,
} from "../email-service";

// Contact form + newsletter subscription. Both forms existed on the client
// long before these routes did — they used to POST into the SPA fallback,
// which answered 200 with index.html, so the UI showed "sent" while the
// message went nowhere. Email is the only sink (no contact_messages table),
// so when delivery fails we must answer 5xx and let the form surface its
// error state (which points people at WhatsApp) instead of faking success.
export function registerContactRoutes(app: Express): void {
  app.post(
    "/api/contact",
    validateBody(contactRequestSchema),
    async (req, res) => {
      try {
        const { name, email, phone, subject, message } = req.body;
        const sent = await sendContactFormEmail({
          name,
          email,
          phone: phone ?? "",
          subject,
          message,
        });
        if (!sent) {
          console.error(
            `Contact form email NOT delivered (from ${email}, subject "${subject}") — is RESEND_API_KEY configured?`,
          );
          return res.status(502).json({
            message:
              "We couldn't send your message right now. Please reach us on WhatsApp instead.",
          });
        }
        res.json({ success: true });
      } catch (error: any) {
        console.error("Error handling contact form:", error);
        res.status(500).json({ message: "Failed to send message" });
      }
    },
  );

  app.post(
    "/api/newsletter-subscribe",
    validateBody(newsletterSubscribeSchema),
    async (req, res) => {
      try {
        const sent = await sendNewsletterSubscriptionEmail(req.body.email);
        if (!sent) {
          console.error(
            `Newsletter subscription NOT delivered for ${req.body.email} — is RESEND_API_KEY configured?`,
          );
          return res.status(502).json({
            message: "Subscription failed. Please try again later.",
          });
        }
        res.json({ success: true });
      } catch (error: any) {
        console.error("Error handling newsletter subscription:", error);
        res.status(500).json({ message: "Failed to subscribe" });
      }
    },
  );
}
