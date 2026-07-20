const { Resend } = require('resend');

let resendClient = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

/**
 * Notify site owner about a new hire/contact message.
 * Fails soft — contact form still succeeds if email is misconfigured.
 */
async function sendContactNotification(msg) {
  const resend = getResend();
  const to = process.env.EMAIL_TO;
  const from = process.env.EMAIL_FROM || 'Portfolio <onboarding@resend.dev>';

  if (!resend || !to) {
    console.warn('[email] RESEND_API_KEY or EMAIL_TO missing — skip notify');
    return { skipped: true };
  }

  const subject = `New hire request: ${msg.projectType} — ${msg.name}`;
  const html = `
    <h2>New contact / hire request</h2>
    <p><strong>Name:</strong> ${escapeHtml(msg.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(msg.email)}</p>
    <p><strong>Project type:</strong> ${escapeHtml(msg.projectType)}</p>
    <p><strong>Budget:</strong> ${escapeHtml(msg.budget || '—')}</p>
    <p><strong>Message:</strong></p>
    <pre style="white-space:pre-wrap;font-family:sans-serif">${escapeHtml(msg.message)}</pre>
  `;

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: msg.email,
    subject,
    html,
  });

  if (error) {
    console.error('[email] Resend error:', error);
    return { ok: false, error };
  }

  return { ok: true, id: data?.id };
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { sendContactNotification };
