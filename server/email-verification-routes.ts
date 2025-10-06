import type { Express, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from './db';
import { users, emailVerificationTokens } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import { emailService } from './email-service';

const TOKEN_EXPIRY_HOURS = 24;

// Generate secure random token
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function setupEmailVerificationRoutes(app: Express) {
  // Send verification email
  app.post('/api/auth/send-verification', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: 'Email already verified' });
      }

      // Generate token
      const token = generateVerificationToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

      // Delete any existing tokens for this user
      await db
        .delete(emailVerificationTokens)
        .where(eq(emailVerificationTokens.userId, user.id));

      // Create new verification token
      await db.insert(emailVerificationTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      // Send verification email
      const emailSent = await emailService.sendEmailVerification(
        user.email,
        token,
        user.username
      );

      if (!emailSent) {
        return res.status(500).json({ 
          message: 'Failed to send verification email. Please try again later.' 
        });
      }

      res.json({ 
        message: 'Verification email sent successfully. Please check your inbox.' 
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Verify email with token
  app.get('/api/auth/verify-email', async (req: Request, res: Response) => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: 'Invalid verification token' });
      }

      // Find valid token
      const [verificationToken] = await db
        .select()
        .from(emailVerificationTokens)
        .where(
          and(
            eq(emailVerificationTokens.token, token),
            gt(emailVerificationTokens.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!verificationToken) {
        return res.status(400).json({ 
          message: 'Invalid or expired verification token' 
        });
      }

      // Update user email verification status
      await db
        .update(users)
        .set({ emailVerified: true })
        .where(eq(users.id, verificationToken.userId));

      // Delete the used token
      await db
        .delete(emailVerificationTokens)
        .where(eq(emailVerificationTokens.id, verificationToken.id));

      res.json({ 
        message: 'Email verified successfully! You can now access all features.' 
      });
    } catch (error) {
      console.error('Error verifying email:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Resend verification email
  app.post('/api/auth/resend-verification', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: 'Email already verified' });
      }

      // Generate new token
      const token = generateVerificationToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

      // Delete any existing tokens for this user
      await db
        .delete(emailVerificationTokens)
        .where(eq(emailVerificationTokens.userId, user.id));

      // Create new verification token
      await db.insert(emailVerificationTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      // Send verification email
      const emailSent = await emailService.sendEmailVerification(
        user.email,
        token,
        user.username
      );

      if (!emailSent) {
        return res.status(500).json({ 
          message: 'Failed to send verification email. Please try again later.' 
        });
      }

      res.json({ 
        message: 'Verification email resent successfully. Please check your inbox.' 
      });
    } catch (error) {
      console.error('Error resending verification email:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}
