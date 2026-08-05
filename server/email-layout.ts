/**
 * Shared layout and components for transactional email.
 *
 * Email is not the web. The previous templates styled themselves with a
 * <style> block full of classes, which Outlook desktop drops entirely and
 * Gmail strips once a message is clipped — so a share of recipients got
 * unstyled black-on-white text with no brand on it at all. Everything here is
 * table-based with inline styles for that reason, and the only <style> block
 * carries progressive enhancement (mobile stacking) that is safe to lose.
 *
 * Rules for anything added here:
 *   - inline every style that matters; treat <style> as optional
 *   - layout with <table>, never flex/grid/float
 *   - width in attributes AND inline CSS (Outlook reads the attribute)
 *   - PNG or JPEG only — see LOGO_URL
 *   - no background-image for anything load-bearing
 */

import { OPERATOR } from '@shared/operator-facts';

/**
 * Absolute and hardcoded to the public site, not APP_URL: a mail client
 * fetches this months later from outside our network, so a localhost or
 * preview-environment URL would render a broken image in the recipient's
 * inbox forever.
 */
const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://affordegypt.com';

/**
 * Deliberately NOT /images/logo-afford-egypt.png. That file is a WebP served
 * under a .png extension — browsers sniff the real type so the site is fine,
 * but Outlook and several mail clients do not decode WebP and would show a
 * broken image. This asset is a real PNG at 2x the display width.
 */
const LOGO_URL = `${SITE_URL}/images/logo-afford-egypt-email.png`;

const WHATSAPP_URL = 'https://wa.me/201100765283';

export const BRAND = {
  ink: '#0F3D35',
  brand: '#19A974',
  brandDeep: '#12805A',
  body: '#33413E',
  muted: '#6B7B77',
  line: '#E3E9E7',
  panel: '#F4F8F6',
  pageBg: '#EEF2F1',
  white: '#FFFFFF',
} as const;

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

/** Escape interpolated values — customer names and free text reach these templates. */
export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface EmailShellOptions {
  /** <title>, and the fallback subject line shown by some clients. */
  title: string;
  /** Inbox preview text. Without it clients scrape the first body words. */
  preheader: string;
  /** Small uppercase label above the heading, e.g. "Booking received". */
  eyebrow?: string;
  heading: string;
  /** One or two sentences under the heading. */
  lede?: string;
  /** Main body, built from the block helpers below. */
  body: string;
}

export function renderEmail(opts: EmailShellOptions): string {
  const { title, preheader, eyebrow, heading, lede, body } = opts;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${esc(title)}</title>
<!--[if mso]>
<style type="text/css">
  body, table, td, p, a, h1, h2, h3 { font-family: Arial, Helvetica, sans-serif !important; }
</style>
<![endif]-->
<style type="text/css">
  /* Progressive enhancement only — the inline styles stand on their own. */
  @media only screen and (max-width: 620px) {
    .ae-wrap { width: 100% !important; }
    .ae-pad { padding-left: 24px !important; padding-right: 24px !important; }
    .ae-h1 { font-size: 24px !important; line-height: 32px !important; }
    .ae-stack { display: block !important; width: 100% !important; text-align: left !important; }
    .ae-stack-value { padding-top: 2px !important; padding-bottom: 12px !important; }
  }
  a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
</style>
</head>
<body style="margin:0; padding:0; width:100%; background-color:${BRAND.pageBg}; -webkit-font-smoothing:antialiased;">
<div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">${esc(preheader)}</div>
<div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">&#8203;&#847;&#8203;&#847;&#8203;&#847;&#8203;&#847;&#8203;&#847;</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.pageBg};">
  <tr>
    <td align="center" style="padding:32px 12px;">

      <table role="presentation" class="ae-wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px;">

        <!-- Logo -->
        <tr>
          <td align="center" style="padding:0 0 24px 0;">
            <a href="${SITE_URL}" style="text-decoration:none;">
              <img src="${LOGO_URL}" width="190" height="31" alt="AffordEgypt"
                   style="display:block; width:190px; height:31px; border:0; outline:none; text-decoration:none;" />
            </a>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background-color:${BRAND.white}; border:1px solid ${BRAND.line}; border-radius:14px; overflow:hidden;">

            <!-- Brand rule -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="height:4px; line-height:4px; font-size:0; background-color:${BRAND.brand};">&nbsp;</td></tr>
            </table>

            <!-- Hero -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="ae-pad" style="padding:36px 40px 8px 40px;">
                  ${
                    eyebrow
                      ? `<p style="margin:0 0 10px 0; font-family:${FONT}; font-size:12px; line-height:16px; letter-spacing:1.2px; text-transform:uppercase; font-weight:700; color:${BRAND.brandDeep};">${esc(eyebrow)}</p>`
                      : ''
                  }
                  <h1 class="ae-h1" style="margin:0; font-family:${FONT}; font-size:28px; line-height:36px; font-weight:700; color:${BRAND.ink};">${esc(heading)}</h1>
                  ${
                    lede
                      ? `<p style="margin:14px 0 0 0; font-family:${FONT}; font-size:16px; line-height:26px; color:${BRAND.muted};">${lede}</p>`
                      : ''
                  }
                </td>
              </tr>
            </table>

            ${body}

          </td>
        </tr>

        ${renderFooter()}

      </table>

    </td>
  </tr>
</table>
</body>
</html>`;
}

/** Standard content block. Use for paragraphs and nested helpers. */
export function block(innerHtml: string, paddingTop = 24): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td class="ae-pad" style="padding:${paddingTop}px 40px 0 40px; font-family:${FONT}; font-size:16px; line-height:26px; color:${BRAND.body};">${innerHtml}</td></tr>
</table>`;
}

export function paragraph(html: string, paddingTop = 20): string {
  return block(
    `<p style="margin:0; font-family:${FONT}; font-size:16px; line-height:26px; color:${BRAND.body};">${html}</p>`,
    paddingTop,
  );
}

export interface DetailRow {
  label: string;
  value: string;
  /** Renders larger and in brand colour — for the reference and the total. */
  emphasis?: boolean;
}

/**
 * Key/value panel. The old templates used <p><strong>Label:</strong> value</p>,
 * which gives no alignment and buries the reference and total in prose. These
 * are the two things a customer opens the mail to find, so they get a panel of
 * their own at the top.
 */
export function summaryPanel(title: string, rows: DetailRow[]): string {
  const cells = rows
    .filter((r) => r.value !== '' && r.value != null)
    .map(
      (r, i) => `
        <tr>
          <td class="ae-stack" width="45%" style="padding:${i === 0 ? '0' : '12px'} 12px 0 0; font-family:${FONT}; font-size:14px; line-height:22px; color:${BRAND.muted}; vertical-align:top;">${esc(r.label)}</td>
          <td class="ae-stack ae-stack-value" align="right" style="padding:${i === 0 ? '0' : '12px'} 0 0 0; font-family:${FONT}; font-size:${r.emphasis ? '18px' : '15px'}; line-height:${r.emphasis ? '24px' : '22px'}; font-weight:${r.emphasis ? '700' : '600'}; color:${r.emphasis ? BRAND.brandDeep : BRAND.ink}; vertical-align:top;">${esc(r.value)}</td>
        </tr>`,
    )
    .join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="ae-pad" style="padding:24px 40px 0 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.panel}; border:1px solid ${BRAND.line}; border-radius:10px;">
        <tr>
          <td style="padding:20px 22px;">
            <p style="margin:0 0 14px 0; font-family:${FONT}; font-size:12px; line-height:16px; letter-spacing:1px; text-transform:uppercase; font-weight:700; color:${BRAND.muted};">${esc(title)}</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${cells}</table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

/** Numbered steps with the number in a brand chip, rather than a bare <ol>. */
export function stepList(steps: Array<{ title: string; body: string }>): string {
  const rows = steps
    .map(
      (s, i) => `
      <tr>
        <td width="34" valign="top" style="padding:0 14px ${i === steps.length - 1 ? '0' : '18px'} 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="26" height="26" align="center" valign="middle"
                  style="width:26px; height:26px; background-color:${BRAND.brand}; border-radius:13px; font-family:${FONT}; font-size:13px; line-height:26px; font-weight:700; color:${BRAND.white};">${i + 1}</td>
            </tr>
          </table>
        </td>
        <td valign="top" style="padding:0 0 ${i === steps.length - 1 ? '0' : '18px'} 0; font-family:${FONT}; font-size:15px; line-height:24px; color:${BRAND.body};">
          <strong style="color:${BRAND.ink};">${esc(s.title)}</strong><br />${s.body}
        </td>
      </tr>`,
    )
    .join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="ae-pad" style="padding:24px 40px 0 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
    </td>
  </tr>
</table>`;
}

/**
 * Checklist. Uses a text check glyph in a table cell rather than a bullet:
 * list-style rendering is one of the least consistent things across mail
 * clients, and Outlook indents <ul> unpredictably.
 */
export function checkList(items: string[]): string {
  const rows = items
    .map(
      (item, i) => `
      <tr>
        <td width="26" valign="top" style="padding:0 12px ${i === items.length - 1 ? '0' : '12px'} 0; font-family:${FONT}; font-size:16px; line-height:24px; font-weight:700; color:${BRAND.brand};">&#10003;</td>
        <td valign="top" style="padding:0 0 ${i === items.length - 1 ? '0' : '12px'} 0; font-family:${FONT}; font-size:15px; line-height:24px; color:${BRAND.body};">${item}</td>
      </tr>`,
    )
    .join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="ae-pad" style="padding:20px 40px 0 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
    </td>
  </tr>
</table>`;
}

/** Bulletproof button — the VML fallback is what makes it render in Outlook. */
export function button(href: string, label: string, paddingTop = 28): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="ae-pad" align="left" style="padding:${paddingTop}px 40px 0 40px;">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
                   href="${href}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="21%"
                   stroke="f" fillcolor="${BRAND.brand}">
        <w:anchorlock/>
        <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${esc(label)}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-- -->
      <a href="${href}"
         style="display:inline-block; background-color:${BRAND.brand}; color:${BRAND.white}; font-family:${FONT}; font-size:16px; line-height:20px; font-weight:700; text-decoration:none; padding:14px 28px; border-radius:10px; mso-hide:all;">${esc(label)}</a>
      <!--<![endif]-->
    </td>
  </tr>
</table>`;
}

/** Hairline separator between sections. */
export function divider(paddingTop = 28): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td class="ae-pad" style="padding:${paddingTop}px 40px 0 40px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="height:1px; line-height:1px; font-size:0; background-color:${BRAND.line};">&nbsp;</td></tr>
    </table>
  </td></tr>
</table>`;
}

/** Bottom padding for the card. Call once at the end of every body. */
export function cardEnd(padding = 36): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td style="height:${padding}px; line-height:${padding}px; font-size:0;">&nbsp;</td></tr>
</table>`;
}

/**
 * Footer.
 *
 * Carries the licence and the legal operator name because that is the whole
 * trust proposition — the site leads with it, so the mail should not read like
 * it came from an unnamed reseller. Figures come from shared/operator-facts so
 * the mail and the site cannot drift apart.
 */
function renderFooter(): string {
  return `<tr>
  <td class="ae-pad" style="padding:28px 40px 8px 40px; text-align:center;">
    <p style="margin:0 0 8px 0; font-family:${FONT}; font-size:14px; line-height:22px; font-weight:600; color:${BRAND.ink};">
      AffordEgypt &middot; operated by ${esc(OPERATOR.legalName)}
    </p>
    <p style="margin:0 0 14px 0; font-family:${FONT}; font-size:13px; line-height:21px; color:${BRAND.muted};">
      Licensed Egyptian tour operator &middot; ${esc(OPERATOR.etaaLicence)} &middot; operating since ${OPERATOR.licensedSince}<br />
      Giza, Egypt
    </p>
    <p style="margin:0 0 16px 0; font-family:${FONT}; font-size:13px; line-height:21px; color:${BRAND.muted};">
      <a href="mailto:hello@affordegypt.com" style="color:${BRAND.brandDeep}; text-decoration:none;">hello@affordegypt.com</a>
      &nbsp;&middot;&nbsp;
      <a href="${WHATSAPP_URL}" style="color:${BRAND.brandDeep}; text-decoration:none;">WhatsApp</a>
      &nbsp;&middot;&nbsp;
      <a href="${SITE_URL}" style="color:${BRAND.brandDeep}; text-decoration:none;">affordegypt.com</a>
    </p>
    <p style="margin:0; font-family:${FONT}; font-size:12px; line-height:18px; color:${BRAND.muted};">
      You are receiving this because you contacted AffordEgypt or made a booking with us.
    </p>
  </td>
</tr>`;
}

export const emailLinks = { SITE_URL, WHATSAPP_URL, LOGO_URL };
