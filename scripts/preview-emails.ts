/**
 * Render every transactional email to a browser, with fixture data.
 *
 * Email templates are the one surface with no way to see your work: the only
 * feedback loop was to make a real booking and check an inbox, which is why
 * these drifted into unbranded boilerplate. This serves each template at a URL
 * so a change can be eyeballed in seconds, and prints the plain-text
 * alternative too — that part is what plain-text clients and spam filters read,
 * and it is even easier to leave broken.
 *
 *   npx tsx scripts/preview-emails.ts [port]
 *
 * Nothing here sends mail. It does not touch RESEND_API_KEY or the database.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const port = Number(process.argv[2] ?? 4175);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Point the templates at this server so the logo resolves locally. Must happen
// before the module loads, hence the dynamic import below — email-layout reads
// PUBLIC_SITE_URL once at module scope.
process.env.PUBLIC_SITE_URL = `http://localhost:${port}`;
const { emailService } = await import('../server/email-service');

const booking = {
  bookingReference: 'AE642949AV9',
  customerName: 'Islam Hussein',
  customerEmail: 'islamjp69@gmail.com',
  customerPhone: '+201158011600',
  totalAmount: '15290',
  startDate: new Date('2026-08-26T00:00:00Z'),
  endDate: new Date('2026-08-30T00:00:00Z'),
  paymentStatus: 'pending',
  bookingStatus: 'pending',
} as any;

const quote = { jsonBlob: { travelers: 2, language: 'English', vehicleType: 'Private sedan' } } as any;

// Reaching the private generators is the point of a preview harness; they are
// private so application code cannot call them, not to hide them from a tool.
const svc = emailService as any;

const templates: Record<string, () => string> = {
  'booking-confirmation': () => svc.generateConfirmationEmail(booking, quote.jsonBlob, booking.totalAmount),
  'trip-reminder': () => svc.generateReminderEmail(booking, quote.jsonBlob, 12),
  'status-confirmed': () => svc.generateStatusUpdateEmail(booking, 'confirmed'),
  'status-cancelled': () => svc.generateStatusUpdateEmail(booking, 'cancelled'),
  'email-verification': () =>
    svc.generateVerificationEmail('Islam', 'https://affordegypt.com/verify-email?token=demo-token-123'),
  'admin-notification': () => svc.generateAdminNotificationEmail(booking, quote, quote.jsonBlob, 'confirmation'),
};

const app = express();

// Serves /images/logo-afford-egypt-email.png so previews aren't dependent on
// the asset already being live.
app.use(express.static(path.join(root, 'client/public')));

app.get('/', (_req, res) => {
  res.send(`<!doctype html><meta charset="utf-8">
<title>AffordEgypt email previews</title>
<body style="font-family:system-ui,sans-serif;max-width:640px;margin:48px auto;padding:0 24px;line-height:1.6">
<h1 style="font-size:22px">AffordEgypt email previews</h1>
<p style="color:#555">Fixture data. Nothing is sent.</p>
<ul style="padding-left:18px">
${Object.keys(templates)
  .map((k) => `<li><a href="/${k}">${k}</a> &middot; <a href="/${k}.txt" style="color:#777;font-size:14px">text part</a></li>`)
  .join('\n')}
</ul></body>`);
});

app.get('/:name.txt', (req, res) => {
  const render = templates[req.params.name];
  if (!render) return res.status(404).send('unknown template');
  res.type('text/plain').send(svc.stripHtml(render()));
});

app.get('/:name', (req, res) => {
  const render = templates[req.params.name];
  if (!render) return res.status(404).send('unknown template');
  res.send(render());
});

app.listen(port, () => console.log(`email previews: http://localhost:${port}`));
