import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

type EmailLang =
  | "en"
  | "fr"
  | "ar"
  | "hi"
  | "ur"
  | "es"
  | "ru"
  | "zh"
  | "pt"
  | "tr"
  | "sw"
  | "kab";

const getEmailContent = (lang: string) => {
  const content: Record<
    EmailLang,
    { subject: string; title: string; body: string; cta: string; tagline: string; expire: string; footer: string }
  > = {
    en: {
      subject: "✦ Enter Infeelit — Your link is waiting",
      title: "This voice deserves to stay.",
      body: "Create your free space so this memory has somewhere to live forever.",
      cta: "Enter Infeelit ✦",
      tagline: "Preserve the voices that matter",
      expire: "This link will expire in 24 hours.",
      footer: "infeelit.com — With care, The Infeelit team",
    },
    fr: {
      subject: "✦ Entrez dans Infeelit — Votre lien vous attend",
      title: "Cette voix mérite de rester.",
      body: "Créez votre espace gratuit pour que ce souvenir ait un endroit où vivre.",
      cta: "Entrer dans Infeelit ✦",
      tagline: "Préserve les voix qui comptent",
      expire: "Ce lien expire dans 24 heures.",
      footer: "infeelit.com — Avec soin, l'équipe Infeelit",
    },
    ar: {
      subject: "✦ ادخل إلى Infeelit — رابطك بانتظارك",
      title: "هذا الصوت يستحق أن يبقى.",
      body: "أنشئ مساحتك المجانية لتعيش هذه الذكرى إلى الأبد.",
      cta: "ادخل إلى Infeelit ✦",
      tagline: "احفظ الأصوات التي تهمّك",
      expire: "ينتهي هذا الرابط خلال 24 ساعة.",
      footer: "infeelit.com — بعناية، فريق Infeelit",
    },
    hi: {
      subject: "✦ Infeelit में प्रवेश करें — आपका लिंक प्रतीक्षा कर रहा है",
      title: "यह आवाज़ रहनी चाहिए।",
      body: "अपना मुफ़्त स्थान बनाएं ताकि यह यादें हमेशा के लिए जीवित रहें।",
      cta: "Infeelit में प्रवेश करें ✦",
      tagline: "जो आवाज़ें मायने रखती हैं, उन्हें सुरक्षित रखें",
      expire: "यह लिंक 24 घंटे में समाप्त हो जाएगा।",
      footer: "infeelit.com — स्नेह सहित, Infeelit टीम",
    },
    ur: {
      subject: "✦ Infeelit میں داخل ہوں — آپ کا لنک انتظار کر رہا ہے",
      title: "یہ آواز رہنی چاہیے۔",
      body: "اپنی مفت جگہ بنائیں تاکہ یہ یادیں ہمیشہ کے لیے زندہ رہیں۔",
      cta: "Infeelit میں داخل ہوں ✦",
      tagline: "اہم آوازوں کو محفوظ رکھیں",
      expire: "یہ لنک 24 گھنٹوں میں ختم ہو جائے گا۔",
      footer: "infeelit.com — محبت سے، Infeelit ٹیم",
    },
    es: {
      subject: "✦ Entra en Infeelit — Tu enlace te espera",
      title: "Esta voz merece quedarse.",
      body: "Crea tu espacio gratuito para que este recuerdo viva para siempre.",
      cta: "Entrar en Infeelit ✦",
      tagline: "Preserva las voces que importan",
      expire: "Este enlace caduca en 24 horas.",
      footer: "infeelit.com — Con cuidado, el equipo Infeelit",
    },
    ru: {
      subject: "✦ Войдите в Infeelit — Ваша ссылка ждёт",
      title: "Этот голос заслуживает остаться.",
      body: "Создайте своё бесплатное пространство, чтобы эта память жила вечно.",
      cta: "Войти в Infeelit ✦",
      tagline: "Сохраняй голоса, которые важны",
      expire: "Эта ссылка истечёт через 24 часа.",
      footer: "infeelit.com — С заботой, команда Infeelit",
    },
    zh: {
      subject: "✦ 进入 Infeelit — 您的链接正在等待",
      title: "这个声音值得留存。",
      body: "创建您的免费空间，让这段记忆永远存活。",
      cta: "进入 Infeelit ✦",
      tagline: "守护那些重要的声音",
      expire: "此链接将在 24 小时后失效。",
      footer: "infeelit.com — 用心，Infeelit 团队",
    },
    pt: {
      subject: "✦ Entre no Infeelit — Seu link está esperando",
      title: "Esta voz merece ficar.",
      body: "Crie seu espaço gratuito para que esta memória viva para sempre.",
      cta: "Entrar no Infeelit ✦",
      tagline: "Preserve as vozes que importam",
      expire: "Este link expira em 24 horas.",
      footer: "infeelit.com — Com carinho, equipe Infeelit",
    },
    tr: {
      subject: "✦ Infeelit'e Girin — Bağlantınız Sizi Bekliyor",
      title: "Bu ses kalmalı.",
      body: "Ücretsiz alanınızı oluşturun, bu anı sonsuza kadar yaşatsın.",
      cta: "Infeelit'e Gir ✦",
      tagline: "Önemli sesleri koru",
      expire: "Bu bağlantı 24 saat içinde sona erecek.",
      footer: "infeelit.com — Sevgiyle, Infeelit ekibi",
    },
    sw: {
      subject: "✦ Ingia Infeelit — Kiungo chako kinakungoja",
      title: "Sauti hii inastahili kubaki.",
      body: "Unda nafasi yako ya bure ili kumbukumbu hii iishi milele.",
      cta: "Ingia Infeelit ✦",
      tagline: "Hifadhi sauti zinazojali",
      expire: "Kiungo hiki kitaisha baada ya saa 24.",
      footer: "infeelit.com — Kwa upendo, timu ya Infeelit",
    },
    kab: {
      subject: "✦ Kcem ɣer Infeelit — Aseɣwen-ik ittsares",
      title: "Tigawt-a tistahaq ad tqim.",
      body: "Rnu aghal-ik n tilellit i talɣut-a ad tɛiš akw.",
      cta: "Kcem ɣer Infeelit ✦",
      tagline: "Ḥrez tigawt i d-teqqaren",
      expire: "Aseɣwen-a ad ifak deg 24 n tsaɛtin.",
      footer: "infeelit.com — S tmerna, tarbaɛt n Infeelit",
    },
  };

  return content[(lang as EmailLang)] || content.en;
};

const detectLang = (payload: Record<string, unknown>): string => {
  const user = (payload?.user || {}) as Record<string, unknown>;
  const meta = (user.user_metadata || user.user_meta || {}) as Record<string, unknown>;
  const candidates = [
    payload.lang,
    payload.language,
    meta.lang,
    meta.language,
    meta.preferred_language,
    user.locale,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.length >= 2) {
      const lower = c.toLowerCase().replace("_", "-").split("-")[0];
      // Preserve 3-letter Kabyle code
      if (lower === "kab" || lower.startsWith("kab")) return "kab";
      return lower.slice(0, 2);
    }
  }
  return "en";
};

serve(async (req) => {
  const payload = await req.json();
  console.log("Full payload:", JSON.stringify(payload));

  const confirmationUrl =
    payload?.email_data?.token_hash
      ? `https://rynnnhxfrcebdandsbjn.supabase.co/auth/v1/verify?token=${payload.email_data.token_hash}&type=${payload.email_data.email_action_type}&redirect_to=${encodeURIComponent("https://infeelit.com/auth/callback")}`
      : payload?.email_data?.confirmation_url ||
        payload?.confirmation_url ||
        payload?.token_hash ||
        "#";

  const toEmail = payload?.user?.email || payload?.email || "";
  const lang = detectLang(payload);
  const copy = getEmailContent(lang);
  const dir = lang === "ar" || lang === "ur" ? "rtl" : "ltr";

  console.log("confirmationUrl:", confirmationUrl);
  console.log("toEmail:", toEmail);
  console.log("emailLang:", lang);

  const html = `<!DOCTYPE html>
<html dir="${dir}">
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
                ${copy.tagline}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              <p style="margin:0 0 16px;font-size:20px;color:#ffffff;
                font-style:italic;line-height:1.5;text-align:center;font-family:Georgia,serif;">
                ${copy.title}
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#aaaaaa;
                text-align:center;line-height:1.6;">
                ${copy.body}
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
                      ${copy.cta}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:11px;color:#666666;
                text-align:center;font-style:italic;">
                ${copy.expire}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:16px 32px 32px;
              border-top:1px solid #1a0a05;">
              <p style="margin:0;font-size:11px;color:#555555;">
                ${copy.footer}
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
      subject: copy.subject,
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
