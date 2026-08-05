import type { Booking, Quote } from '@shared/schema';
import { mailService } from './email-client';
import {
  renderEmail,
  paragraph,
  summaryPanel,
  stepList,
  checkList,
  button,
  divider,
  cardEnd,
  esc,
  emailLinks,
  BRAND,
} from './email-layout';

/** "15,290" — no currency symbol, callers prefix "LE". */
function formatMoney(amount: number | string | null | undefined): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (!Number.isFinite(n)) return '0';
  return Math.round(n).toLocaleString('en-US');
}

/**
 * "26 August 2026" rather than toLocaleDateString()'s "8/26/2026".
 *
 * Most of these travellers are not American, and 8/26 vs 26/8 is exactly the
 * ambiguity you do not want on the one line telling someone which day to be at
 * the pickup point. Spelling the month removes the guess.
 */
function formatTripDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export interface EmailService {
  sendBookingConfirmation(booking: Booking, quote: Quote): Promise<boolean>;
  sendBookingReminder(booking: Booking, quote: Quote): Promise<boolean>;
  sendBookingStatusUpdate(booking: Booking, status: string): Promise<boolean>;
  sendEmailVerification(email: string, token: string, username: string): Promise<boolean>;
}

class TransactionalEmailService implements EmailService {
  // Defaults to hello@affordegypt.com but can be overridden via FROM_EMAIL
  // so the verified Resend sender can change without a code release.
  private fromEmail = process.env.FROM_EMAIL || 'hello@affordegypt.com';

  async sendBookingConfirmation(booking: Booking, quote: Quote): Promise<boolean> {
    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured - email not sent');
      return false;
    }

    const quoteData = quote.jsonBlob as any;
    const totalAmount = booking.totalAmount || quote.total;

    const emailContent = this.generateConfirmationEmail(booking, quoteData, totalAmount);

    try {
      console.log(`Attempting to send confirmation email to: ${booking.customerEmail} from: ${this.fromEmail}`);
      
      await mailService.send({
        to: booking.customerEmail,
        from: {
          email: this.fromEmail,
          name: 'Afford Egypt'
        },
        subject: `Booking received — your AffordEgypt deposit link is on the way (booking #${booking.bookingReference})`,
        html: emailContent,
        text: this.stripHtml(emailContent)
      });
      
      console.log(`Successfully sent confirmation email for booking ${booking.bookingReference}`);
      
      // Send admin notification
      await this.sendAdminNotification(booking, quote, 'confirmation');
      return true;
    } catch (error: any) {
      console.error('Failed to send booking confirmation email:', error);
      if (error.response && error.response.body && error.response.body.errors) {
        console.error('Resend error details:', JSON.stringify(error.response.body.errors, null, 2));
      }
      return false;
    }
  }

  async sendBookingReminder(booking: Booking, quote: Quote): Promise<boolean> {
    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured - email not sent');
      return false;
    }

    const quoteData = quote.jsonBlob as any;
    const daysUntilTrip = this.calculateDaysUntilTrip(booking.startDate);

    const emailContent = this.generateReminderEmail(booking, quoteData, daysUntilTrip);

    try {
      await mailService.send({
        to: booking.customerEmail,
        from: this.fromEmail,
        subject: `Trip Reminder - ${booking.bookingReference} (${daysUntilTrip} days to go!)`,
        html: emailContent,
        text: this.stripHtml(emailContent)
      });
      
      // Send admin notification
      await this.sendAdminNotification(booking, quote, 'reminder');
      return true;
    } catch (error) {
      console.error('Failed to send booking reminder email:', error);
      return false;
    }
  }

  async sendBookingStatusUpdate(booking: Booking, status: string): Promise<boolean> {
    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured - email not sent');
      return false;
    }

    const emailContent = this.generateStatusUpdateEmail(booking, status);

    try {
      await mailService.send({
        to: booking.customerEmail,
        from: this.fromEmail,
        subject: `Booking Update - ${booking.bookingReference}`,
        html: emailContent,
        text: this.stripHtml(emailContent)
      });
      return true;
    } catch (error) {
      console.error('Failed to send booking status update email:', error);
      return false;
    }
  }

  async sendEmailVerification(email: string, token: string, username: string): Promise<boolean> {
    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured - verification email not sent');
      return false;
    }

    const appUrl = process.env.APP_URL || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000');
    const verificationUrl = `${appUrl}/verify-email?token=${token}`;
    const emailContent = this.generateVerificationEmail(username, verificationUrl);

    try {
      console.log(`Sending verification email to: ${email}`);
      
      await mailService.send({
        to: email,
        from: {
          email: this.fromEmail,
          name: 'Afford Egypt'
        },
        subject: 'Verify Your Email - Afford Egypt',
        html: emailContent,
        text: this.stripHtml(emailContent)
      });
      
      console.log(`Successfully sent verification email to ${email}`);
      return true;
    } catch (error: any) {
      console.error('Failed to send verification email:', error);
      if (error.response && error.response.body && error.response.body.errors) {
        console.error('Resend error details:', JSON.stringify(error.response.body.errors, null, 2));
      }
      return false;
    }
  }

  private generateVerificationEmail(username: string, verificationUrl: string): string {
    const body =
      paragraph(
        'Confirm your email address and your account is ready to use.',
        26,
      ) +
      button(verificationUrl, 'Verify my email') +
      paragraph(
        `<span style="color:${BRAND.muted}; font-size:14px;">Button not working? Paste this into your browser:</span><br /><a href="${verificationUrl}" style="color:${BRAND.brandDeep}; font-size:14px; word-break:break-all;">${esc(verificationUrl)}</a>`,
        24,
      ) +
      divider() +
      paragraph(
        `<span style="color:${BRAND.muted}; font-size:14px;">This link expires in 24 hours. If you didn't create an AffordEgypt account, you can ignore this email — nothing will happen.</span>`,
        24,
      ) +
      cardEnd();

    return renderEmail({
      title: 'Verify your email — AffordEgypt',
      preheader: 'One click to confirm your email address. The link expires in 24 hours.',
      eyebrow: 'Confirm your email',
      heading: `Welcome, ${String(username || '').trim().split(/\s+/)[0] || 'there'}`,
      body,
    });
  }

  private generateConfirmationEmail(booking: Booking, quoteData: any, totalAmount: string): string {
    const firstName = String(booking.customerName || '').trim().split(/\s+/)[0] || 'there';
    const bookingUrl = `${emailLinks.SITE_URL}/booking-confirmation/${encodeURIComponent(booking.bookingReference)}`;

    const body =
      // Reference and total first. These are the two things someone opens this
      // mail to find, and they used to sit below a four-step explainer.
      summaryPanel('Your booking', [
        { label: 'Booking reference', value: booking.bookingReference, emphasis: true },
        { label: 'Total', value: `LE ${formatMoney(totalAmount)}`, emphasis: true },
        { label: 'Trip start', value: formatTripDate(booking.startDate) },
        { label: 'Trip end', value: formatTripDate(booking.endDate) },
      ]) +
      button(bookingUrl, 'View your booking') +
      divider() +
      paragraph(
        `<strong style="color:${BRAND.ink}; font-size:17px;">What happens next</strong>`,
        26,
      ) +
      stepList([
        {
          title: 'We review your booking',
          body: 'Within 24 hours — usually much faster — we confirm vehicle and guide availability for your dates.',
        },
        {
          title: 'We send your 10% deposit link',
          body: 'A payment link by email, typically Tab.travel for international cards. The deposit is fully refundable up to 3 days before arrival.',
        },
        {
          title: 'Your booking is confirmed once the deposit clears',
          body: 'The remaining 90% is paid on arrival — cash in EGP, USD, EUR or GBP, a second payment link, or by card on our mobile reader.',
        },
        {
          title: 'We meet you',
          body: 'On the day, your driver and licensed Egyptologist meet you at the agreed pickup point.',
        },
      ]) +
      divider() +
      summaryPanel('Your details', [
        { label: 'Name', value: booking.customerName },
        { label: 'Email', value: booking.customerEmail },
        { label: 'Phone', value: booking.customerPhone || '' },
      ]) +
      // The old footer said "do not reply" two lines after inviting a reply.
      // hello@affordegypt.com is a monitored inbox, so the invitation is the
      // true half and the boilerplate was the wrong half.
      paragraph(
        `Something look wrong, or want to change a detail? Reply to this email — it reaches a real person — or message us on <a href="${emailLinks.WHATSAPP_URL}" style="color:${BRAND.brandDeep}; font-weight:600; text-decoration:none;">WhatsApp</a>. Quote <strong style="color:${BRAND.ink};">${esc(booking.bookingReference)}</strong> and we'll pick it straight up.`,
        26,
      ) +
      cardEnd();

    return renderEmail({
      title: `Booking received — ${booking.bookingReference}`,
      preheader: `Reference ${booking.bookingReference} · LE ${formatMoney(totalAmount)}. Your 10% deposit link follows within 24 hours.`,
      eyebrow: 'Booking received',
      heading: `Thank you, ${firstName} — we have your booking`,
      lede: 'Nothing to pay yet. We check availability first, then send your deposit link.',
      body,
    });
  }

  private generateReminderEmail(booking: Booking, quoteData: any, daysUntilTrip: number): string {
    const firstName = String(booking.customerName || '').trim().split(/\s+/)[0] || 'there';
    const dayWord = daysUntilTrip === 1 ? 'day' : 'days';

    const body =
      summaryPanel('Your trip', [
        { label: 'Starts in', value: `${daysUntilTrip} ${dayWord}`, emphasis: true },
        { label: 'Booking reference', value: booking.bookingReference },
        { label: 'Trip start', value: formatTripDate(booking.startDate) },
      ]) +
      paragraph(
        `<strong style="color:${BRAND.ink}; font-size:17px;">Before you fly</strong>`,
        28,
      ) +
      checkList([
        'Passport valid for at least 6 months beyond your arrival date',
        'Visa requirements checked for your nationality',
        'Comfortable walking shoes — the sites are bigger than they look',
        'Sun protection: hat, sunscreen, sunglasses',
        'Some Egyptian pounds for small purchases and tips',
      ]) +
      divider() +
      paragraph(
        `We'll be in touch with your final pickup point and timings closer to the day. Questions before then? Reply here or message us on <a href="${emailLinks.WHATSAPP_URL}" style="color:${BRAND.brandDeep}; font-weight:600; text-decoration:none;">WhatsApp</a>.`,
        26,
      ) +
      cardEnd();

    return renderEmail({
      title: `${daysUntilTrip} ${dayWord} until your trip — ${booking.bookingReference}`,
      preheader: `${daysUntilTrip} ${dayWord} to go. A short checklist before you travel.`,
      eyebrow: 'Trip reminder',
      heading: `${firstName}, Egypt is ${daysUntilTrip} ${dayWord} away`,
      lede: 'A few things worth sorting before you fly.',
      body,
    });
  }

  private generateStatusUpdateEmail(booking: Booking, status: string): string {
    const statusMessages = {
      'confirmed': 'Your booking has been confirmed',
      'in_progress': 'Your trip is currently in progress',
      'completed': 'Your trip has been completed',
      'cancelled': 'Your booking has been cancelled'
    };

    const message = statusMessages[status as keyof typeof statusMessages] || `Your booking status has been updated to: ${status}`;
    const firstName = String(booking.customerName || '').trim().split(/\s+/)[0] || 'there';
    const statusLabel = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const bookingUrl = `${emailLinks.SITE_URL}/booking-confirmation/${encodeURIComponent(booking.bookingReference)}`;

    const body =
      summaryPanel('Your booking', [
        { label: 'Status', value: statusLabel, emphasis: true },
        { label: 'Booking reference', value: booking.bookingReference },
        { label: 'Trip start', value: formatTripDate(booking.startDate) },
      ]) +
      button(bookingUrl, 'View your booking') +
      divider() +
      paragraph(
        `Questions about this update? Reply to this email or message us on <a href="${emailLinks.WHATSAPP_URL}" style="color:${BRAND.brandDeep}; font-weight:600; text-decoration:none;">WhatsApp</a>, quoting <strong style="color:${BRAND.ink};">${esc(booking.bookingReference)}</strong>.`,
        26,
      ) +
      cardEnd();

    return renderEmail({
      title: `Booking update — ${booking.bookingReference}`,
      preheader: `${message}. Reference ${booking.bookingReference}.`,
      eyebrow: 'Booking update',
      heading: `${firstName}, ${message.charAt(0).toLowerCase()}${message.slice(1)}`,
      body,
    });
  }

  private calculateDaysUntilTrip(startDate: Date | null): number {
    if (!startDate) return 0;
    const now = new Date();
    const tripDate = new Date(startDate);
    const diffTime = tripDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Plain-text alternative.
   *
   * The old version was `replace(/<[^>]*>/g,'')` collapsed to one line. Against
   * the table-based templates that yields a single unreadable paragraph that
   * also leaks the <style> rules, the hidden preheader and a run of &nbsp;
   * spacers — and the text part is what plain-text clients, some
   * accessibility tooling and several spam filters actually read. Drop the
   * non-content first, then map block boundaries to newlines.
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<head[\s\S]*?<\/head>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      // Hidden preheader/spacer divs: useful in the inbox, noise in the text part.
      .replace(/<div[^>]*display:\s*none[\s\S]*?<\/div>/gi, '')
      .replace(/<a\b[^>]*href="(mailto:)?([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, _mail, href, label) => {
        const text = String(label).replace(/<[^>]*>/g, '').trim();
        // Image-only links (the logo) have no text. Emitting the bare URL put a
        // naked link on line 1 of every message, which reads as a broken email.
        if (!text) return '';
        return href.includes(text) ? href : `${text} (${href})`;
      })
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|h1|h2|h3|tr|li|div|table)>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;|&#8203;|&#847;/g, ' ')
      .replace(/&middot;/g, '·')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#10003;/g, '-')
      .replace(/[ \t]+/g, ' ')
      .replace(/ *\n */g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  async sendAdminNotification(booking: any, quote: any, type: 'confirmation' | 'reminder'): Promise<boolean> {
    try {
      const jsonBlob = typeof quote.jsonBlob === 'string' ? JSON.parse(quote.jsonBlob) : quote.jsonBlob;
      
      const emailContent = this.generateAdminNotificationEmail(booking, quote, jsonBlob, type);
      
      await mailService.send({
        to: 'hello@affordegypt.com',
        from: this.fromEmail,
        subject: `ACTION: send Tab.travel deposit link — booking ${booking.bookingReference}`,
        html: emailContent,
      });
      
      return true;
    } catch (error: any) {
      console.error("Failed to send admin notification email:", error);
      return false;
    }
  }

  private generateAdminNotificationEmail(booking: any, quote: any, jsonBlob: any, type: 'confirmation' | 'reminder'): string {
    const formatPrice = (price: number | string) => {
      const numPrice = typeof price === 'string' ? parseFloat(price) : price;
      if (Number.isNaN(numPrice)) return '0';
      return Math.round(numPrice).toLocaleString('en-US');
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0d9488; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #0d9488; }
          .total { background: #0d9488; color: white; padding: 15px; text-align: center; border-radius: 6px; font-size: 18px; font-weight: bold; }
          .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .status.paid { background: #dcfce7; color: #16a34a; }
          .status.pending { background: #fef3c7; color: #d97706; }
          .status.failed { background: #fee2e2; color: #dc2626; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔔 New booking — send Tab.travel deposit link</h1>
          <p>${type === 'confirmation'
            ? 'A new booking request was just received. Send the customer a Tab.travel deposit link for 10% of the total below.'
            : 'A trip reminder was sent to a customer.'}</p>
        </div>

        <div class="content">
          ${type === 'confirmation' ? `
          <div class="booking-details" style="background:#fff7e6; border-left:4px solid #f59e0b;">
            <h3 style="margin-top:0;">Action required</h3>
            <p><strong>1.</strong> Confirm vehicle and guide availability for the dates below.</p>
            <p><strong>2.</strong> Send a Tab.travel payment link for 10% of the total to the customer's email.</p>
            <p><strong>3.</strong> Booking is confirmed once the deposit clears.</p>
          </div>
          ` : ''}
          <div class="booking-details">
            <h3>Booking Information</h3>
            <div class="detail-row">
              <span class="detail-label">Booking Reference:</span>
              <span>${booking.bookingReference}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Customer Name:</span>
              <span>${booking.customerName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span>${booking.customerEmail}</span>
            </div>
            ${booking.customerPhone ? `
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span>${booking.customerPhone}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Payment Status:</span>
              <span class="status ${booking.paymentStatus}">${booking.paymentStatus.toUpperCase()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Booking Status:</span>
              <span class="status ${booking.bookingStatus}">${booking.bookingStatus.toUpperCase()}</span>
            </div>
            ${booking.startDate ? `
            <div class="detail-row">
              <span class="detail-label">Travel Date:</span>
              <span>${new Date(booking.startDate).toLocaleDateString('en-GB')}</span>
            </div>
            ` : ''}
          </div>

          ${jsonBlob?.travelers ? `
          <div class="booking-details">
            <h3>Trip Details</h3>
            <div class="detail-row">
              <span class="detail-label">Number of Travelers:</span>
              <span>${jsonBlob.travelers}</span>
            </div>
            ${jsonBlob.language ? `
            <div class="detail-row">
              <span class="detail-label">Guide Language:</span>
              <span>${jsonBlob.language}</span>
            </div>
            ` : ''}
            ${jsonBlob.vehicleType ? `
            <div class="detail-row">
              <span class="detail-label">Vehicle Type:</span>
              <span>${jsonBlob.vehicleType}</span>
            </div>
            ` : ''}
          </div>
          ` : ''}

          ${jsonBlob?.itinerary && Array.isArray(jsonBlob.itinerary) && jsonBlob.itinerary.length > 0 ? `
          <div class="booking-details">
            <h3>Itinerary</h3>
            ${jsonBlob.itinerary.map((item: any, index: number) => `
              <div class="detail-row">
                <span class="detail-label">${item.city || item.route || `Day ${index + 1}`}:</span>
                <span>${item.description || item.date || 'Service included'}</span>
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${jsonBlob?.addons && jsonBlob.addons.length > 0 ? `
          <div class="booking-details">
            <h3>Add-ons</h3>
            ${jsonBlob.addons.map((addon: any) => `
              <div class="detail-row">
                <span class="detail-label">${addon.name}:</span>
                <span>LE ${formatPrice(addon.price)}</span>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <div class="total">
            Total Amount: LE ${formatPrice(booking.totalAmount)}
          </div>

          <div class="booking-details">
            <h3>Next steps</h3>
            <p><strong>Customer email:</strong> ${booking.customerEmail}</p>
            ${booking.customerPhone ? `<p><strong>Customer phone:</strong> ${booking.customerPhone}</p>` : ''}
            <p><strong>What to do:</strong> ${type === 'confirmation' ? 'Send a Tab.travel deposit link for 10% of the total above to the customer.' : 'Ensure all arrangements are confirmed for the upcoming trip.'}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new TransactionalEmailService();

// Contact form email function
export async function sendContactFormEmail(contactData: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured - contact email not sent');
    return false;
  }
  const emailContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0891b2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #0891b2; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
          </div>
          
          <div class="content">
            <h2>Contact Form Details</h2>
            
            <div class="field">
              <div class="label">Name:</div>
              <div>${contactData.name}</div>
            </div>
            
            <div class="field">
              <div class="label">Email:</div>
              <div>${contactData.email}</div>
            </div>
            
            ${contactData.phone ? `
            <div class="field">
              <div class="label">Phone:</div>
              <div>${contactData.phone}</div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="label">Subject:</div>
              <div>${contactData.subject}</div>
            </div>
            
            <div class="field">
              <div class="label">Message:</div>
              <div>${contactData.message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>This message was sent from the Afford Egypt contact form</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await mailService.send({
      to: 'hello@affordegypt.com',
      from: {
        email: 'hello@affordegypt.com',
        name: 'Afford Egypt Contact Form'
      },
      replyTo: contactData.email,
      subject: `Contact Form: ${contactData.subject}`,
      html: emailContent,
      text: `
New Contact Form Submission

Name: ${contactData.name}
Email: ${contactData.email}
${contactData.phone ? `Phone: ${contactData.phone}` : ''}
Subject: ${contactData.subject}

Message:
${contactData.message}
      `.trim()
    });
    return true;
  } catch (error: any) {
    console.error('Failed to send contact form email:', error);
    return false;
  }
}

// Newsletter subscription email function
export async function sendNewsletterSubscriptionEmail(email: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured - newsletter email not sent');
    return false;
  }
  // Send welcome email to subscriber
  const welcomeEmailContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Georgia, serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; }
          .header { background: linear-gradient(135deg, #0891b2 0%, #065f7c 100%); color: white; padding: 40px 20px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .tagline { font-size: 16px; opacity: 0.9; font-style: italic; }
          .content { padding: 40px 30px; }
          .welcome-title { color: #0891b2; font-size: 24px; margin-bottom: 20px; text-align: center; }
          .message { font-size: 16px; margin-bottom: 25px; }
          .promise-box { background: #f8f9fa; border-left: 4px solid #0891b2; padding: 20px; margin: 25px 0; }
          .promise-title { color: #0891b2; font-weight: bold; margin-bottom: 15px; }
          .benefits { list-style: none; padding: 0; }
          .benefits li { padding: 8px 0; position: relative; padding-left: 25px; }
          .benefits li:before { content: "🏺"; position: absolute; left: 0; }
          .footer { background: #2c3e50; color: #bdc3c7; text-align: center; padding: 30px 20px; }
          .footer-text { margin: 5px 0; }
          .unsubscribe { font-size: 12px; color: #95a5a6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Afford Egypt</div>
            <div class="tagline">Your Gateway to Ancient Wonders</div>
          </div>
          
          <div class="content">
            <h1 class="welcome-title">Welcome to Our Travel Community!</h1>
            
            <div class="message">
              Dear Egypt Travel Enthusiast,
            </div>
            
            <div class="message">
              Thank you for joining the Afford Egypt newsletter! We're thrilled to have you as part of our community of passionate travelers who share a love for Egypt's incredible history, culture, and hidden treasures.
            </div>
            
            <div class="promise-box">
              <div class="promise-title">Our Promise to You</div>
              <p>We believe your inbox should only receive content that truly matters. That's why we promise to send you:</p>
              <ul class="benefits">
                <li>Insider tips from local Egyptian guides and experts</li>
                <li>Exclusive travel deals and early-bird offers</li>
                <li>Hidden gems and off-the-beaten-path destinations</li>
                <li>Cultural insights and historical stories</li>
                <li>Practical travel advice for budget-conscious explorers</li>
                <li>Seasonal travel recommendations and timing tips</li>
              </ul>
            </div>
            
            <div class="message">
              <strong>No spam, no fluff, no irrelevant content.</strong> Only carefully curated information that will enhance your Egypt travel experience and help you discover the country like never before.
            </div>
            
            <div class="message">
              Whether you're planning your first visit to the Pyramids or you're a seasoned Egypt traveler looking for new adventures, we're here to help you explore this magnificent country affordably and authentically.
            </div>
            
            <div class="message">
              Safe travels and welcome aboard!<br>
              <strong>The Afford Egypt Team</strong>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-text">Afford Egypt - Making Egypt Accessible to Everyone</div>
            <div class="footer-text">📧 hello@affordegypt.com | 📱 +20 110 076 5283</div>
            <div class="unsubscribe">
              You're receiving this because you subscribed to our newsletter. 
              You can unsubscribe at any time by replying to this email.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  // Send notification email to admin
  const adminNotificationContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0891b2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #0891b2; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Newsletter Subscription</h1>
          </div>
          
          <div class="content">
            <h2>Newsletter Subscription Alert</h2>
            
            <div class="field">
              <div class="label">New Subscriber Email:</div>
              <div>${email}</div>
            </div>
            
            <div class="field">
              <div class="label">Subscription Date:</div>
              <div>${new Date().toLocaleString()}</div>
            </div>
            
            <div class="field">
              <div class="label">Action Required:</div>
              <div>Add this email to your newsletter mailing list. A welcome email has been automatically sent to the subscriber.</div>
            </div>
          </div>
          
          <div class="footer">
            <p>This notification was sent from the Afford Egypt newsletter subscription form</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    // Send welcome email to subscriber
    await mailService.send({
      to: email,
      from: {
        email: 'hello@affordegypt.com',
        name: 'Afford Egypt'
      },
      subject: 'Welcome to Afford Egypt - Your Egypt Travel Journey Begins!',
      html: welcomeEmailContent,
      text: `
Welcome to Afford Egypt!

Dear Egypt Travel Enthusiast,

Thank you for joining our newsletter! We're excited to have you as part of our community.

Our Promise: We'll only send you content that truly matters for Egypt travel lovers:
• Insider tips from local guides
• Exclusive travel deals
• Hidden gems and destinations
• Cultural insights and stories
• Practical budget travel advice
• Seasonal recommendations

No spam, no fluff - just valuable content to enhance your Egypt travel experience.

Whether you're planning your first visit or you're a seasoned traveler, we're here to help you explore Egypt affordably and authentically.

Safe travels and welcome aboard!
The Afford Egypt Team

---
Afford Egypt - Making Egypt Accessible to Everyone
📧 hello@affordegypt.com | 📱 +20 110 076 5283
      `.trim()
    });

    // Send notification to admin
    await mailService.send({
      to: 'hello@affordegypt.com',
      from: {
        email: 'hello@affordegypt.com',
        name: 'Afford Egypt Newsletter'
      },
      subject: `New Newsletter Subscription - ${email}`,
      html: adminNotificationContent,
      text: `
New Newsletter Subscription

Subscriber Email: ${email}
Subscription Date: ${new Date().toLocaleString()}

Action Required: Add this email to your newsletter mailing list. A welcome email has been automatically sent to the subscriber.
      `.trim()
    });

    return true;
  } catch (error: any) {
    console.error('Failed to send newsletter subscription email:', error);
    return false;
  }
}