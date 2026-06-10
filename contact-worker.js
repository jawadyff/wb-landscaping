// Cloudflare Worker — receives form submissions and sends via Resend
// Deploy: wrangler deploy contact-worker.js --name wb-contact-worker --config wrangler-contact.toml

const RESEND_API_KEY = 're_hwXSEJ45_3jZLjtc4rEnA8EfcPpJsw69w';
const FROM_EMAIL    = 'noreply@wnblandscapingny.com';
const TO_EMAIL      = 'wandb.landscanpingservice@gmail.com';

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: 'Invalid JSON' }, 400);
    }

    const { name, phone, email, service, city, message, subject } = body;

    if (!name || !phone) {
      return json({ success: false, error: 'Name and phone are required' }, 400);
    }

    const emailSubject = subject || `New Quote Request — W&B Landscaping`;
    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <div style="background:#2D5016;padding:20px 24px;border-radius:8px 8px 0 0;">
          <h2 style="color:#fff;margin:0;font-size:20px;">New Quote Request — W&B Landscaping</h2>
        </div>
        <div style="background:#f9f9f9;padding:24px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#666;width:130px;"><strong>Name</strong></td><td style="padding:8px 0;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#666;"><strong>Phone</strong></td><td style="padding:8px 0;"><a href="tel:${phone}">${phone}</a></td></tr>
            <tr><td style="padding:8px 0;color:#666;"><strong>Email</strong></td><td style="padding:8px 0;">${email || 'Not provided'}</td></tr>
            <tr><td style="padding:8px 0;color:#666;"><strong>Service</strong></td><td style="padding:8px 0;">${service || 'Not specified'}</td></tr>
            <tr><td style="padding:8px 0;color:#666;"><strong>City</strong></td><td style="padding:8px 0;">${city || 'Not specified'}</td></tr>
            ${message ? `<tr><td style="padding:8px 0;color:#666;vertical-align:top;"><strong>Message</strong></td><td style="padding:8px 0;">${message.replace(/\n/g, '<br>')}</td></tr>` : ''}
          </table>
          <div style="margin-top:20px;padding:16px;background:#fff3cd;border-left:4px solid #C1440E;border-radius:4px;">
            <strong style="color:#C1440E;">Action needed:</strong> Reply to this customer within 1 business day.
          </div>
        </div>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `W&B Landscaping <${FROM_EMAIL}>`,
        to: [TO_EMAIL],
        reply_to: email || undefined,
        subject: emailSubject,
        html: htmlBody,
      }),
    });

    if (res.ok) {
      return json({ success: true });
    } else {
      const err = await res.text();
      return json({ success: false, error: err }, 500);
    }
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
