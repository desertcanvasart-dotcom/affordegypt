import type { Express, Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { db } from './db';
import { users, passwordResetTokens } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import { MailService } from '@sendgrid/mail';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY_MINUTES = 30;

// Initialize SendGrid
const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

// Generate secure random token
function generateToken(): { selector: string; token: string; hashedToken: string } {
  const selector = crypto.randomBytes(12).toString('hex');
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  return { selector, token, hashedToken };
}

// Send password reset email
async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - password reset email not sent');
    return false;
  }

  const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>We received a request to reset your password for your AffordEgypt account.</p>
      <p>Click the button below to reset your password. This link will expire in ${TOKEN_EXPIRY_MINUTES} minutes.</p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
      <p><strong>If you didn't request this password reset, please ignore this email.</strong></p>
      <p>Best regards,<br>AffordEgypt Team</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
      <p>&copy; ${new Date().getFullYear()} AffordEgypt. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await mailService.send({
      to: email,
      from: {
        email: 'info@affordegypt.com',
        name: 'AffordEgypt'
      },
      subject: 'Reset Your Password - AffordEgypt',
      html: emailContent,
    });
    
    console.log(`Password reset email sent successfully to ${email}`);
    return true;
  } catch (error: any) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

export function setupPasswordResetRoutes(app: Express) {
  // Request password reset
  app.post('/api/auth/request-reset', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase().trim()));

      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ 
          message: 'If an account exists with this email, you will receive a password reset link shortly.' 
        });
      }

      // Generate reset token
      const { selector, token, hashedToken } = generateToken();
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

      // Store reset token in database
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token: hashedToken,
        selector,
        expiresAt,
        used: false,
      });

      // Create reset link
      const baseUrl = process.env.APP_URL
        || (process.env.NODE_ENV === 'production' ? 'https://affordegypt.com' : 'http://localhost:5000');
      const resetLink = `${baseUrl}/reset-password?selector=${selector}&token=${token}`;

      // Send email
      await sendPasswordResetEmail(user.email, resetLink);

      res.json({ 
        message: 'If an account exists with this email, you will receive a password reset link shortly.' 
      });
    } catch (error: any) {
      console.error('Password reset request error:', error);
      res.status(500).json({ message: 'Failed to process password reset request' });
    }
  });

  // Verify reset token
  app.post('/api/auth/verify-reset-token', async (req: Request, res: Response) => {
    try {
      const { selector, token } = req.body;

      if (!selector || !token) {
        return res.status(400).json({ message: 'Invalid reset link' });
      }

      // Hash the provided token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find reset token
      const [resetToken] = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.selector, selector),
            eq(passwordResetTokens.token, hashedToken),
            eq(passwordResetTokens.used, false),
            gt(passwordResetTokens.expiresAt, new Date())
          )
        );

      if (!resetToken) {
        return res.status(400).json({ message: 'Invalid or expired reset link' });
      }

      res.json({ valid: true });
    } catch (error: any) {
      console.error('Token verification error:', error);
      res.status(500).json({ message: 'Failed to verify reset token' });
    }
  });

  // Reset password
  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      const { selector, token, newPassword } = req.body;

      if (!selector || !token || !newPassword) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }

      // Hash the provided token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find and validate reset token
      const [resetToken] = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.selector, selector),
            eq(passwordResetTokens.token, hashedToken),
            eq(passwordResetTokens.used, false),
            gt(passwordResetTokens.expiresAt, new Date())
          )
        );

      if (!resetToken) {
        return res.status(400).json({ message: 'Invalid or expired reset link' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

      // Update user password
      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, resetToken.userId));

      // Mark token as used
      await db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.id, resetToken.id));

      res.json({ message: 'Password reset successfully' });
    } catch (error: any) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: 'Failed to reset password' });
    }
  });
}
