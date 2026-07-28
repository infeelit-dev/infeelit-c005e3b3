import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const payload = await req.json();
  console.log('Full payload:', JSON.stringify(payload));

  // Supabase Auth Hook sends this structure:
  const confirmationUrl =
    payload?.email_data?.token_hash
      ? `https://rynnnhxfrcebdandsbjn.supabase.co/auth/v1/verify?token=${payload.email_data.token_hash}&type=${payload.email_data.email_action_type}&redirect_to=${encodeURIComponent('https://infeelit.com/auth/callback')}`
      : payload?.email_data?.confirmation_url
      || payload?.confirmation_url
      || payload?.token_hash
      || '#';

  const toEmail = payload?.user?.email || payload?.email || '';

  console.log('confirmationUrl:', confirmationUrl);
  console.log('toEmail:', toEmail);

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="100%" style="max-width:480px;background-color:#0f0501;border-radius:20px;">
          
          <tr>
            <td align="center" style="padding:40px 32px 24px;">
              <img src="https://infeelit.com/infeelit-logo.png"
                   width="80" height="80"
                   alt="Infeelit"
                   style="display:block;margin:0 auto 16px;border-radius:50%;">
              <p style="margin:0;font-size:26px;color:#E8742A;letter-spacing:0.1em;font-family:Georgia,serif;">
                ✦ infeelit
              </p>
              <p style="margin:8px 0 0;font-size:13px;color:#999999;font-style:italic;">
                Préserve les voix qui comptent
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              <p style="margin:0 0 16px;font-size:20px;color:#ffffff;
                font-style:italic;line-height:1.5;text-align:center;font-family:Georgia,serif;">
                "What you have felt deeply<br>never truly disappears."
              </p>
              
              <p style="margin:0 0 24px;font-size:14px;color:#aaaaaa;
                text-align:center;line-height:1.6;">
                Click below to enter your private space<br>
                and start preserving what matters most.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px;">
                    <a href="${confirmationUrl}"
                      style="display:inline-block;padding:16px 40px;
                        background-color:#E8742A;
                        color:#ffffff;
                        text-decoration:none;
                        border-radius:50px;
                        font-size:16px;
                        font-weight:bold;
                        font-family:Arial,sans-serif;
                        letter-spacing:0.05em;">
                      Enter Infeelit ✦
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:11px;color:#666666;
                text-align:center;font-style:italic;">
                This link will expire in 24 hours.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:16px 32px 32px;
              border-top:1px solid #1a0a05;">
              <p style="margin:0;font-size:11px;color:#555555;">
                infeelit.com — With care, The Infeelit team
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const resendKey = Deno.env.get("RESEND_API_KEY");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Infeelit <noreply@infeelit.com>",
      to: toEmail,
      subject: "✦ Enter Infeelit — Your link is waiting",
      html: html,
    }),
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
