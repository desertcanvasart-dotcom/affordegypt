import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./database-storage";
import { insertBookingSchema, insertQuoteSchema } from "@shared/schema";
import { emailService } from "./email-service";

// Stripe will be initialized later when keys are provided
let stripe: any = null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Get cities
  app.get("/api/cities", async (req, res) => {
    try {
      const cities = await storage.getCities();
      res.json(cities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get vehicle types
  app.get("/api/vehicle-types", async (req, res) => {
    try {
      const vehicleTypes = await storage.getVehicleTypes();
      res.json(vehicleTypes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get license classes
  app.get("/api/license-classes", async (req, res) => {
    try {
      const licenseClasses = await storage.getLicenseClasses();
      res.json(licenseClasses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get routes
  app.get("/api/routes", async (req, res) => {
    try {
      const { fromCityId, toCityId } = req.query;
      if (fromCityId && toCityId) {
        const route = await storage.getRoute(parseInt(fromCityId as string), parseInt(toCityId as string));
        res.json(route);
      } else {
        const routes = await storage.getRoutes();
        res.json(routes);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get time blocks
  app.get("/api/time-blocks", async (req, res) => {
    try {
      const { cityId } = req.query;
      if (!cityId) {
        return res.status(400).json({ message: "cityId is required" });
      }
      
      const timeBlocks = await storage.getTimeBlocks(parseInt(cityId as string));
      res.json(timeBlocks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get guide rates by city
  app.get("/api/guide-rates", async (req, res) => {
    try {
      const { cityId } = req.query;
      const guides = cityId 
        ? await storage.getGuideRates(parseInt(cityId as string))
        : await storage.getGuideRates();
      
      res.json(guides);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get add-ons by city
  app.get("/api/add-ons", async (req, res) => {
    try {
      const { cityId } = req.query;
      const addOns = cityId 
        ? await storage.getAddOns(parseInt(cityId as string))
        : await storage.getAddOns();
      
      res.json(addOns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Enhanced pricing calculation using new engine
  app.post("/api/calculate-pricing", async (req, res) => {
    try {
      const { itinerary = [], addons = [], passengers = 1 } = req.body;
      
      const pricing = await storage.calculateQuotePrice(itinerary, addons, passengers);
      
      res.json({
        subtotal: pricing.subtotal.toFixed(2),
        commissionPct: (pricing.commissionPct * 100).toFixed(1),
        commission: (pricing.subtotal * pricing.commissionPct).toFixed(2),
        taxes: "0.00", // No taxes in simplified model
        total: pricing.grandTotal.toFixed(2),
        breakdown: pricing.breakdown
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create quote endpoint - receives wizard payload, returns priced quote
  app.post("/api/quote", async (req, res) => {
    try {
      const { itinerary, addons, passengers } = req.body;
      
      const pricing = await storage.calculateQuotePrice(itinerary, addons, passengers);
      
      const quote = await storage.createQuote({
        jsonBlob: { itinerary, addons, passengers, breakdown: pricing.breakdown },
        total: pricing.grandTotal.toString(),
        commissionPct: pricing.commissionPct.toString()
      });
      
      res.json({
        ...quote,
        pricing: {
          subtotal: pricing.subtotal,
          commissionPct: pricing.commissionPct,
          total: pricing.grandTotal,
          breakdown: pricing.breakdown
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get quote by ID
  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quote = await storage.getQuote(id);
      
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      res.json(quote);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      
      // Send booking confirmation email
      if (booking.quoteId) {
        try {
          const quote = await storage.getQuote(booking.quoteId);
          if (quote) {
            const emailSent = await emailService.sendBookingConfirmation(booking, quote);
            if (emailSent) {
              await storage.markEmailSent(booking.id, 'confirmation');
            }
          }
        } catch (emailError) {
          console.error('Failed to send booking confirmation email:', emailError);
          // Don't fail the booking creation if email fails
        }
      }
      
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get booking by ID
  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Checkout endpoint - creates Stripe session, returns redirect URL
  app.post("/api/checkout", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe not configured. Please provide STRIPE_SECRET_KEY." });
      }
      
      const { quoteId, customerEmail } = req.body;
      
      // Get the quote
      const quote = await storage.getQuote(quoteId);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      const amount = Math.round(parseFloat(quote.total) * 100); // Convert to cents
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Egypt Travel Package',
              description: `Complete travel package for ${(quote.jsonBlob as any).passengers} passenger(s)`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/booking-confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/checkout?quote=${quoteId}`,
        customer_email: customerEmail,
        metadata: {
          quoteId: quoteId.toString(),
        },
      });
      
      res.json({ 
        sessionId: session.id,
        url: session.url 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating checkout session: " + error.message });
    }
  });

  // Stripe payment route for one-time payments (legacy)
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe not configured. Please provide STRIPE_SECRET_KEY." });
      }
      
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Stripe webhook → mark quote paid
  app.post("/webhooks/payment", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe not configured" });
    }

    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } else {
        event = JSON.parse(req.body.toString());
      }
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Payment completed:', session.id);
        
        // Update booking payment status and send confirmation email
        if (session.metadata?.bookingId) {
          const bookingId = parseInt(session.metadata.bookingId);
          try {
            const booking = await storage.updateBookingPaymentStatus(bookingId, 'paid', session.payment_intent);
            
            // Send payment confirmation email if quote exists
            if (booking.quoteId !== null) {
              const quote = await storage.getQuote(booking.quoteId);
              if (quote) {
                await emailService.sendBookingStatusUpdate(booking, 'Payment Confirmed');
              }
            }
          } catch (error) {
            console.error('Error updating booking after payment:', error);
          }
        }
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
  });

  // Update booking payment status
  app.patch("/api/bookings/:id/payment", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, paymentIntentId } = req.body;
      
      const booking = await storage.updateBookingPaymentStatus(id, status, paymentIntentId);
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Email notification endpoints
  
  // Send booking confirmation email manually (admin)
  app.post("/api/bookings/:id/send-confirmation", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (booking.quoteId === null) {
        return res.status(400).json({ message: "Booking has no associated quote" });
      }
      
      const quote = await storage.getQuote(booking.quoteId);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      const emailSent = await emailService.sendBookingConfirmation(booking, quote);
      if (emailSent) {
        await storage.markEmailSent(booking.id, 'confirmation');
        res.json({ message: "Confirmation email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send confirmation email" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Send booking reminder email (admin)
  app.post("/api/bookings/:id/send-reminder", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (booking.quoteId === null) {
        return res.status(400).json({ message: "Booking has no associated quote" });
      }
      
      const quote = await storage.getQuote(booking.quoteId);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      const emailSent = await emailService.sendBookingReminder(booking, quote);
      if (emailSent) {
        await storage.markEmailSent(booking.id, 'reminder');
        res.json({ message: "Reminder email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send reminder email" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Send booking status update email (admin)
  app.post("/api/bookings/:id/send-status-update", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const emailSent = await emailService.sendBookingStatusUpdate(booking, status);
      if (emailSent) {
        res.json({ message: "Status update email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send status update email" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Confirm payment and send confirmation email
  app.post("/api/bookings/:id/confirm-payment", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { paymentIntentId } = req.body;
      
      // Get booking and quote details
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (booking.quoteId === null) {
        return res.status(400).json({ message: "Booking has no associated quote" });
      }
      
      const quote = await storage.getQuote(booking.quoteId);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      // Verify payment with Stripe
      let paymentSuccessful = false;
      if (stripe && paymentIntentId) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          paymentSuccessful = paymentIntent.status === 'succeeded';
        } catch (stripeError) {
          console.error("Payment verification failed:", stripeError);
        }
      }
      
      // Update booking payment status
      const paymentStatus = paymentSuccessful ? 'paid' : 'failed';
      const updatedBooking = await storage.updateBookingPaymentStatus(bookingId, paymentStatus, paymentIntentId);
      
      // Send confirmation email if payment successful and not already sent
      if (paymentSuccessful && !updatedBooking.confirmationEmailSent) {
        const emailSent = await emailService.sendBookingConfirmation(updatedBooking, quote);
        if (emailSent) {
          await storage.markEmailSent(bookingId, 'confirmation');
        }
      }
      
      res.json({ 
        booking: updatedBooking, 
        paymentSuccessful,
        emailSent: paymentSuccessful && !booking.confirmationEmailSent
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get booking by reference (public endpoint)
  app.get("/api/bookings/reference/:reference", async (req, res) => {
    try {
      const booking = await storage.getBookingByReference(req.params.reference);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Get associated quote data
      const quote = await storage.getQuote(booking.quoteId);
      
      res.json({ 
        booking,
        quote: quote ? {
          id: quote.id,
          jsonBlob: quote.jsonBlob,
          total: quote.total,
          commissionPct: quote.commissionPct
        } : null
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user bookings (requires authentication)
  app.get("/api/user/:userId/bookings", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const bookings = await storage.getUserBookings(userId);
      
      // Get quote data for each booking
      const bookingsWithQuotes = await Promise.all(
        bookings.map(async (booking) => {
          const quote = await storage.getQuote(booking.quoteId);
          return {
            ...booking,
            quote: quote ? {
              id: quote.id,
              jsonBlob: quote.jsonBlob,
              total: quote.total,
              commissionPct: quote.commissionPct
            } : null
          };
        })
      );
      
      res.json(bookingsWithQuotes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update booking status (admin endpoint)
  app.put("/api/bookings/:id/status", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { status } = req.body;
      
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Update booking status
      const updatedBooking = await storage.updateBookingStatus(bookingId, status);
      
      // Send status update email
      const emailSent = await emailService.sendBookingStatusUpdate(updatedBooking, status);
      
      res.json({ 
        booking: updatedBooking,
        emailSent 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Send booking reminder (admin endpoint)
  app.post("/api/bookings/:id/send-reminder", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const quote = await storage.getQuote(booking.quoteId);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      // Send reminder email
      const emailSent = await emailService.sendBookingReminder(booking, quote);
      
      if (emailSent) {
        await storage.markEmailSent(bookingId, 'reminder');
      }
      
      res.json({ 
        emailSent,
        booking: await storage.getBooking(bookingId)
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all bookings (admin endpoint)
  app.get("/api/admin/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      
      // Get quote data for each booking
      const bookingsWithQuotes = await Promise.all(
        bookings.map(async (booking) => {
          const quote = await storage.getQuote(booking.quoteId);
          return {
            ...booking,
            quote: quote ? {
              id: quote.id,
              jsonBlob: quote.jsonBlob,
              total: quote.total,
              commissionPct: quote.commissionPct
            } : null
          };
        })
      );
      
      res.json(bookingsWithQuotes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Initialize Stripe when keys are available
export function initializeStripe() {
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const Stripe = require('stripe');
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
      });
      console.log("Stripe initialized successfully");
    } catch (error) {
      console.warn("Failed to initialize Stripe:", error);
    }
  }
}