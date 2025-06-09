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