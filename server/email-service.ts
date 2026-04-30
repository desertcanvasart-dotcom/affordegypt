import type { Booking, Quote } from '@shared/schema';
import { mailService } from './email-client';

export interface EmailService {
  sendBookingConfirmation(booking: Booking, quote: Quote): Promise<boolean>;
  sendBookingReminder(booking: Booking, quote: Quote): Promise<boolean>;
  sendBookingStatusUpdate(booking: Booking, status: string): Promise<boolean>;
  sendEmailVerification(email: string, token: string, username: string): Promise<boolean>;
}

class TransactionalEmailService implements EmailService {
  // Defaults to info@affordegypt.com but can be overridden via FROM_EMAIL
  // so the verified Resend sender can change without a code release.
  private fromEmail = process.env.FROM_EMAIL || 'info@affordegypt.com';

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
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0891b2; color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 15px 30px; background: #0891b2; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .highlight { color: #0891b2; font-weight: bold; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Afford Egypt!</h1>
              <p>Please verify your email address</p>
            </div>
            
            <div class="content">
              <h2>Hello ${username},</h2>
              <p>Thank you for registering with Afford Egypt! We're excited to help you explore the wonders of Egypt.</p>
              
              <p>To complete your registration and access all features, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #0891b2;">${verificationUrl}</p>
              
              <div class="warning">
                <strong>⏰ Important:</strong> This verification link will expire in 24 hours for security reasons.
              </div>
              
              <p>If you didn't create an account with Afford Egypt, you can safely ignore this email.</p>
            </div>
            
            <div class="footer">
              <p>Afford Egypt - Making Egypt Accessible</p>
              <p>This is an automated email. Please do not reply directly to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateConfirmationEmail(booking: Booking, quoteData: any, totalAmount: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0891b2; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .booking-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .highlight { color: #0891b2; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking received — thank you, ${booking.customerName}</h1>
              <p>We've received your booking request. Here's what happens next.</p>
            </div>

            <div class="content">
              <ol style="padding-left: 20px;">
                <li style="margin-bottom: 14px;">
                  <strong>We review your booking.</strong>
                  Within 24 hours (usually much faster), our team confirms vehicle and guide availability for your dates.
                </li>
                <li style="margin-bottom: 14px;">
                  <strong>We send your 10% deposit link.</strong>
                  You'll receive a payment link via email — typically Tab.travel for international cards. The deposit is fully refundable up to 3 days before arrival.
                </li>
                <li style="margin-bottom: 14px;">
                  <strong>Your booking is confirmed once the deposit clears.</strong>
                  The remaining 90% is paid on arrival in cash (EGP, USD, EUR, or GBP), via a second payment link, or by card through our mobile reader.
                </li>
                <li style="margin-bottom: 14px;">
                  <strong>We meet you.</strong>
                  On the day of your trip, our driver and licensed Egyptologist meet you at the agreed pickup point. You're set.
                </li>
              </ol>

              <div class="booking-details">
                <h3>Booking Information</h3>
                <p><strong>Booking Reference:</strong> <span class="highlight">${booking.bookingReference}</span></p>
                <p><strong>Total Amount:</strong> LE ${Math.round(parseFloat(totalAmount)).toLocaleString('en-US')}</p>
                ${booking.startDate ? `<p><strong>Trip Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>` : ''}
                ${booking.endDate ? `<p><strong>Trip End Date:</strong> ${new Date(booking.endDate).toLocaleDateString()}</p>` : ''}
              </div>

              <div class="booking-details">
                <h3>Contact Information</h3>
                <p><strong>Email:</strong> ${booking.customerEmail}</p>
                ${booking.customerPhone ? `<p><strong>Phone:</strong> ${booking.customerPhone}</p>` : ''}
              </div>

              <p>If you have any questions, just reply to this email with your booking reference.</p>
            </div>
            
            <div class="footer">
              <p>Afford Egypt - Making Egypt Accessible</p>
              <p>This is an automated email. Please do not reply directly to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateReminderEmail(booking: Booking, quoteData: any, daysUntilTrip: number): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0891b2; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .countdown { background: #0891b2; color: white; padding: 15px; text-align: center; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Egypt Adventure Awaits!</h1>
            </div>
            
            <div class="content">
              <h2>Dear ${booking.customerName},</h2>
              
              <div class="countdown">
                <h2>${daysUntilTrip} Days Until Your Trip!</h2>
                <p>Booking Reference: ${booking.bookingReference}</p>
              </div>

              <p>We're excited that your Egypt adventure is approaching! Here are some important reminders:</p>
              
              <ul>
                <li>Ensure your passport is valid for at least 6 months</li>
                <li>Check visa requirements for your nationality</li>
                <li>Pack comfortable walking shoes for sightseeing</li>
                <li>Bring sun protection (hat, sunscreen, sunglasses)</li>
                <li>Have some Egyptian pounds for small purchases</li>
              </ul>

              <p>We'll contact you with final arrangements and meeting points closer to your travel date.</p>
              <p>Safe travels!</p>
            </div>
            
            <div class="footer">
              <p>Afford Egypt - Making Egypt Accessible</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateStatusUpdateEmail(booking: Booking, status: string): string {
    const statusMessages = {
      'confirmed': 'Your booking has been confirmed',
      'in_progress': 'Your trip is currently in progress',
      'completed': 'Your trip has been completed',
      'cancelled': 'Your booking has been cancelled'
    };

    const message = statusMessages[status as keyof typeof statusMessages] || `Your booking status has been updated to: ${status}`;

    return `
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
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Status Update</h1>
            </div>
            
            <div class="content">
              <h2>Dear ${booking.customerName},</h2>
              <p>${message}</p>
              <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
              <p>If you have any questions about this update, please contact us with your booking reference.</p>
            </div>
            
            <div class="footer">
              <p>Afford Egypt - Making Egypt Accessible</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private calculateDaysUntilTrip(startDate: Date | null): number {
    if (!startDate) return 0;
    const now = new Date();
    const tripDate = new Date(startDate);
    const diffTime = tripDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  async sendAdminNotification(booking: any, quote: any, type: 'confirmation' | 'reminder'): Promise<boolean> {
    try {
      const jsonBlob = typeof quote.jsonBlob === 'string' ? JSON.parse(quote.jsonBlob) : quote.jsonBlob;
      
      const emailContent = this.generateAdminNotificationEmail(booking, quote, jsonBlob, type);
      
      await mailService.send({
        to: 'info@affordegypt.com',
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
      to: 'info@affordegypt.com',
      from: {
        email: 'info@affordegypt.com',
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
            <div class="footer-text">📧 info@affordegypt.com | 📱 +20 110 076 5283</div>
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
        email: 'info@affordegypt.com',
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
📧 info@affordegypt.com | 📱 +20 110 076 5283
      `.trim()
    });

    // Send notification to admin
    await mailService.send({
      to: 'info@affordegypt.com',
      from: {
        email: 'info@affordegypt.com',
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