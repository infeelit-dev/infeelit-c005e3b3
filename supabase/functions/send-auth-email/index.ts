import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { user, email_data } = await req.json();

  const confirmationUrl = email_data.confirmation_url;
  const toEmail = user.email;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0f0501;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="100%" style="max-width:480px;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="https://infeelit.com/infeelit-logo.png"
                   width="80" height="80"
                   alt="Infeelit"
                   style="display:block;margin:0 auto 16px;border-radius:50%;">
              <p style="margin:0;font-size:28px;color:#E8742A;letter-spacing:0.1em;">
                ✦ infeelit
              </p>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.4);
                font-style:italic;letter-spacing:0.05em;">
                Préserve les voix qui comptent
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:rgba(255,255,255,0.04);border-radius:20px;
              padding:36px 32px;border:1px solid rgba(232,116,42,0.15);">
              <p style="margin:0 0 16px;font-size:22px;color:#fff;
                font-style:italic;line-height:1.5;text-align:center;">
                "What you have felt deeply<br>never truly disappears."
              </p>
              <p style="margin:0 0 8px;font-size:15px;
                color:rgba(255,255,255,0.6);text-align:center;line-height:1.6;">
                It lives here.
              </p>
              <p style="margin:0 0 32px;font-size:14px;
                color:rgba(255,255,255,0.5);text-align:center;line-height:1.6;">
                Click below to enter your private space<br>
                and start preserving what matters most.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${confirmationUrl}"
                      style="display:inline-block;padding:16px 40px;
                        background:linear-gradient(135deg,#E8742A,#D4621A);
                        color:#fff;text-decoration:none;border-radius:999px;
                        font-size:16px;font-weight:700;letter-spacing:0.05em;
                        box-shadow:0 4px 20px rgba(232,116,42,0.4);">
                      Enter Infeelit ✦
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:12px;
                color:rgba(255,255,255,0.25);text-align:center;font-style:italic;">
                This link will expire in 24 hours.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;
                color:rgba(255,255,255,0.2);letter-spacing:0.1em;">
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
