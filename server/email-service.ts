import { MailService } from '@sendgrid/mail';
import type { Booking, Quote } from '@shared/schema';

export interface EmailService {
  sendBookingConfirmation(booking: Booking, quote: Quote): Promise<boolean>;
  sendBookingReminder(booking: Booking, quote: Quote): Promise<boolean>;
  sendBookingStatusUpdate(booking: Booking, status: string): Promise<boolean>;
}

class SendGridEmailService implements EmailService {
  private mailService: MailService;
  private fromEmail: string;

  constructor() {
    this.mailService = new MailService();
    // Use the verified sender email address
    this.fromEmail = 'info@affordegypt.com';
    
    if (process.env.SENDGRID_API_KEY) {
      this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  async sendBookingConfirmation(booking: Booking, quote: Quote): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid API key not configured - email not sent');
      return false;
    }

    const quoteData = quote.jsonBlob as any;
    const totalAmount = booking.totalAmount || quote.total;

    const emailContent = this.generateConfirmationEmail(booking, quoteData, totalAmount);

    try {
      await this.mailService.send({
        to: booking.customerEmail,
        from: {
          email: this.fromEmail,
          name: 'Afford Egypt'
        },
        subject: `Booking Confirmation - ${booking.bookingReference}`,
        html: emailContent,
        text: this.stripHtml(emailContent)
      });
      return true;
    } catch (error: any) {
      console.error('Failed to send booking confirmation email:', error);
      if (error.response && error.response.body && error.response.body.errors) {
        console.error('SendGrid error details:', JSON.stringify(error.response.body.errors, null, 2));
      }
      return false;
    }
  }

  async sendBookingReminder(booking: Booking, quote: Quote): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid API key not configured - email not sent');
      return false;
    }

    const quoteData = quote.jsonBlob as any;
    const daysUntilTrip = this.calculateDaysUntilTrip(booking.startDate);

    const emailContent = this.generateReminderEmail(booking, quoteData, daysUntilTrip);

    try {
      await this.mailService.send({
        to: booking.customerEmail,
        from: this.fromEmail,
        subject: `Trip Reminder - ${booking.bookingReference} (${daysUntilTrip} days to go!)`,
        html: emailContent,
        text: this.stripHtml(emailContent)
      });
      return true;
    } catch (error) {
      console.error('Failed to send booking reminder email:', error);
      return false;
    }
  }

  async sendBookingStatusUpdate(booking: Booking, status: string): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid API key not configured - email not sent');
      return false;
    }

    const emailContent = this.generateStatusUpdateEmail(booking, status);

    try {
      await this.mailService.send({
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
              <h1>Booking Confirmed!</h1>
              <p>Thank you for choosing Afford Egypt</p>
            </div>
            
            <div class="content">
              <h2>Dear ${booking.customerName},</h2>
              <p>Your Egypt travel booking has been confirmed. Here are your booking details:</p>
              
              <div class="booking-details">
                <h3>Booking Information</h3>
                <p><strong>Booking Reference:</strong> <span class="highlight">${booking.bookingReference}</span></p>
                <p><strong>Total Amount:</strong> $${totalAmount}</p>
                <p><strong>Payment Status:</strong> ${booking.paymentStatus}</p>
                ${booking.startDate ? `<p><strong>Trip Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>` : ''}
                ${booking.endDate ? `<p><strong>Trip End Date:</strong> ${new Date(booking.endDate).toLocaleDateString()}</p>` : ''}
              </div>

              <div class="booking-details">
                <h3>Contact Information</h3>
                <p><strong>Email:</strong> ${booking.customerEmail}</p>
                ${booking.customerPhone ? `<p><strong>Phone:</strong> ${booking.customerPhone}</p>` : ''}
              </div>

              <p>You will receive additional details about your itinerary and travel arrangements shortly.</p>
              <p>If you have any questions, please contact us using your booking reference.</p>
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
}

export const emailService = new SendGridEmailService();

// Contact form email function
export async function sendContactFormEmail(contactData: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - contact email not sent');
    return false;
  }

  const mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);

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
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - newsletter email not sent');
    return false;
  }

  const mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);

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