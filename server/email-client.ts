// Thin wrapper around Resend so the rest of the codebase keeps using a
// mailService.send({ to, from, subject, html, text, replyTo }) shape that
// matches the SendGrid SDK we used to use. One swap point, every existing
// email template untouched.

import { Resend } from "resend";

type FromValue = string | { email: string; name?: string };

interface SendArgs {
  to: string | string[];
  from: FromValue;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

const formatFrom = (value: FromValue): string => {
  if (typeof value === "string") return value;
  if (value.name) return `${value.name} <${value.email}>`;
  return value.email;
};

class ResendMailer {
  private client: Resend | null;

  constructor() {
    this.client = process.env.RESEND_API_KEY
      ? new Resend(process.env.RESEND_API_KEY)
      : null;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async send(args: SendArgs): Promise<void> {
    if (!this.client) {
      throw new Error("RESEND_API_KEY not set — refusing to send email");
    }
    const result = await this.client.emails.send({
      from: formatFrom(args.from),
      to: Array.isArray(args.to) ? args.to : [args.to],
      subject: args.subject,
      html: args.html,
      text: args.text,
      replyTo: args.replyTo,
    });
    if (result.error) {
      const err: any = new Error(result.error.message || "Resend send failed");
      err.response = { body: { errors: [result.error] } };
      throw err;
    }
  }
}

export const mailService = new ResendMailer();
