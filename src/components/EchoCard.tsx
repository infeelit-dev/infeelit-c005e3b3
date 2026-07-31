export type EchoCardMemory = {
  title?: string | null;
  transcript_fr?: string | null;
  transcript_en?: string | null;
  transcript_ar?: string | null;
  detected_lang?: string | null;
};

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }
  ctx.fill();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(" ");
  let line = "";
  let lineCount = 0;
  let cursorY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== "") {
      const isLast = lineCount >= maxLines - 1;
      ctx.fillText(isLast ? line.trimEnd() + "…" : line.trimEnd(), x, cursorY);
      lineCount += 1;
      if (isLast) return cursorY;
      line = words[i] + " ";
      cursorY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line && lineCount < maxLines) {
    ctx.fillText(line.trimEnd(), x, cursorY);
  }
  return cursorY;
}

function pickTranscript(memory: EchoCardMemory): string | null {
  const lang = (memory.detected_lang || "").toLowerCase();
  if (lang.startsWith("fr") && memory.transcript_fr) return memory.transcript_fr;
  if (lang.startsWith("en") && memory.transcript_en) return memory.transcript_en;
  if (lang.startsWith("ar") && memory.transcript_ar) return memory.transcript_ar;
  return memory.transcript_fr || memory.transcript_en || memory.transcript_ar || null;
}

/**
 * Generate a 1080×1920 Stories-format Echo Card PNG for viral sharing.
 */
const generateEchoCard = async (
  memory: EchoCardMemory,
  anonymous: boolean = false,
): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Background
  ctx.fillStyle = "#0a0501";
  ctx.fillRect(0, 0, 1080, 1920);

  // Subtle radial glow
  const gradient = ctx.createRadialGradient(540, 960, 0, 540, 960, 800);
  gradient.addColorStop(0, "rgba(232,116,42,0.08)");
  gradient.addColorStop(1, "transparent");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1920);

  // Soft grain
  for (let i = 0; i < 1800; i++) {
    const gx = Math.random() * 1080;
    const gy = Math.random() * 1920;
    ctx.fillStyle = `rgba(255,255,255,${0.015 + Math.random() * 0.025})`;
    ctx.fillRect(gx, gy, 1.5, 1.5);
  }

  // ✦ infeelit top
  ctx.fillStyle = "#E8742A";
  ctx.font = "bold 52px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("✦ infeelit", 540, 200);

  // Question / title
  if (!anonymous) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "italic 72px Georgia, serif";
    ctx.textAlign = "center";
    const title = memory.title || "A memory";
    wrapText(ctx, title, 540, 480, 900, 90, 2);
  }

  // Waveform (golden bars)
  const bars = 40;
  const barWidth = 16;
  const gap = 10;
  const totalWidth = bars * (barWidth + gap);
  const startX = (1080 - totalWidth) / 2;

  for (let i = 0; i < bars; i++) {
    const height = 40 + Math.sin(i * 0.5) * 80 + Math.random() * 60;
    const x = startX + i * (barWidth + gap);
    const y = 960 - height / 2;

    ctx.fillStyle = `rgba(212,175,55,${0.4 + Math.sin(i * 0.3) * 0.4})`;
    fillRoundRect(ctx, x, y, barWidth, height, 8);
  }

  // Transcript teaser
  const transcript = pickTranscript(memory);

  if (anonymous) {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "italic 48px Georgia, serif";
    ctx.textAlign = "center";
    wrapText(ctx, "A memory preserved on Infeelit ✦", 540, 1180, 900, 60, 2);
  } else if (transcript) {
    const teaser = `"${transcript.slice(0, 80)}..."`;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "italic 44px Georgia, serif";
    ctx.textAlign = "center";
    wrapText(ctx, teaser, 540, 1180, 900, 58, 3);
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "44px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("A voice preserved forever", 540, 1200);
  }

  // CTA pill
  ctx.fillStyle = "#E8742A";
  fillRoundRect(ctx, 290, 1500, 500, 100, 50);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 42px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Hear the full story →", 540, 1550);
  ctx.textBaseline = "alphabetic";

  // URL
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "36px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("infeelit.com", 540, 1750);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate Echo Card"));
      },
      "image/png",
      0.95,
    );
  });
};

/**
 * Instagram Stories–optimized card: larger type, link-sticker hint, bottom safe zone.
 */
export const generateStoriesCard = async (
  memory: {
    title?: string | null;
    transcript_fr?: string | null;
    transcript_en?: string | null;
    transcript_ar?: string | null;
    detected_lang?: string | null;
  },
  anonymous: boolean = false,
): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = "#0a0501";
  ctx.fillRect(0, 0, 1080, 1920);

  const g = ctx.createRadialGradient(540, 960, 0, 540, 960, 900);
  g.addColorStop(0, "rgba(232,116,42,0.1)");
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1080, 1920);

  // Top hint for Stories link sticker (safe from top chrome)
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "32px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("↑ Add link sticker here", 540, 120);

  ctx.fillStyle = "#E8742A";
  ctx.font = "bold 60px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("✦ infeelit", 540, 280);

  if (!anonymous) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "italic 80px Georgia, serif";
    ctx.textAlign = "center";
    wrapText(ctx, memory.title || "A memory", 540, 560, 900, 100, 2);
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "italic 52px Georgia, serif";
    ctx.textAlign = "center";
    wrapText(ctx, "A memory preserved on Infeelit ✦", 540, 600, 900, 64, 2);
  }

  const bars = 36;
  const bw = 18;
  const gap = 12;
  const tw = bars * (bw + gap);
  const sx = (1080 - tw) / 2;
  for (let i = 0; i < bars; i++) {
    const h = 50 + Math.sin(i * 0.6) * 90 + Math.random() * 50;
    ctx.fillStyle = `rgba(212,175,55,${0.5 + Math.sin(i * 0.4) * 0.4})`;
    fillRoundRect(ctx, sx + i * (bw + gap), 1000 - h / 2, bw, h, 6);
  }

  const transcript =
    memory.transcript_fr || memory.transcript_en || memory.transcript_ar || null;
  if (transcript && !anonymous) {
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.font = "italic 48px Georgia, serif";
    ctx.textAlign = "center";
    wrapText(ctx, `"${transcript.slice(0, 70)}..."`, 540, 1220, 900, 58, 3);
  }

  // CTA above Stories bottom UI safe zone
  ctx.fillStyle = "#E8742A";
  fillRoundRect(ctx, 240, 1520, 600, 110, 55);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 46px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Hear the full story →", 540, 1575);
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.font = "38px Georgia, serif";
  ctx.fillText("infeelit.com", 540, 1750);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate Stories card"));
      },
      "image/png",
      0.95,
    );
  });
};

export default generateEchoCard;
