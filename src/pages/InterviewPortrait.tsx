import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { INTERVIEW_QUESTIONS, questionText } from "@/lib/interviewQuestions";

type RecMode = "audio" | "video";
type SessionRow = {
  id: string;
  locale: string;
  status: string;
  slug: string | null;
  mode_pref: RecMode;
  featured_question_ids: number[] | null;
};
type AnswerRow = {
  id: string;
  question_id: number;
  take_no: number;
  media_url: string | null;
  duration_s: number | null;
  transcript: string | null;
  strong_sentence: string | null;
  retired_at: string | null;
};

const BG = "#F8F9FA";
const INK = "#0F172A";
const MUTED = "#64748B";

function isVideoPath(path: string | null, mode: RecMode) {
  if (!path) return mode === "video";
  if (/\.(m4a|ogg|mp3)(\?|$)/i.test(path)) return false;
  if (mode === "audio") return false;
  return true;
}

function AudioWave({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;
    let ctx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    const data = new Uint8Array(64);

    const draw = () => {
      const c = canvas.getContext("2d");
      if (!c) return;
      const w = canvas.width;
      const h = canvas.height;
      c.clearRect(0, 0, w, h);
      if (analyser) analyser.getByteFrequencyData(data);
      const n = 32;
      const gap = 3;
      const bw = (w - gap * (n - 1)) / n;
      for (let i = 0; i < n; i++) {
        const v = analyser ? data[i] / 255 : 0.15;
        const bh = Math.max(4, v * h * 0.9);
        c.fillStyle = INK;
        c.fillRect(i * (bw + gap), (h - bh) / 2, bw, bh);
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    const boot = async () => {
      try {
        ctx = new AudioContext();
        const srcNode = ctx.createMediaElementSource(audio);
        analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        srcNode.connect(analyser);
        analyser.connect(ctx.destination);
      } catch {
        /* bars only */
      }
      draw();
    };

    const onPlay = () => {
      if (ctx?.state === "suspended") void ctx.resume();
    };
    audio.addEventListener("play", onPlay);
    void boot();
    return () => {
      audio.removeEventListener("play", onPlay);
      cancelAnimationFrame(rafRef.current);
      void ctx?.close();
    };
  }, [src]);

  return (
    <div>
      <canvas ref={canvasRef} width={320} height={56} style={{ width: "100%", height: 56, display: "block", marginBottom: 8 }} />
      <audio ref={audioRef} src={src} controls preload="metadata" style={{ width: "100%" }} />
    </div>
  );
}

const InterviewPortrait = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [mode, setMode] = useState<"portrait" | "text">("portrait");
  const [session, setSession] = useState<SessionRow | null>(null);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!slug) {
      setMissing(true);
      setLoading(false);
      return;
    }
    void (async () => {
      const { data } = await (supabase as any)
        .from("interview_sessions")
        .select("id, locale, status, slug, mode_pref, featured_question_ids")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (!data) {
        setMissing(true);
        setLoading(false);
        return;
      }
      const row = data as SessionRow;
      setSession(row);
      const { data: ans } = await (supabase as any)
        .from("interview_answers")
        .select("id, question_id, take_no, media_url, duration_s, transcript, strong_sentence, retired_at")
        .eq("session_id", row.id)
        .is("retired_at", null)
        .order("question_id");
      const rows = (ans || []) as AnswerRow[];
      setAnswers(rows);
      const next: Record<string, string> = {};
      await Promise.all(
        rows.map(async (a) => {
          if (!a.media_url) return;
          const { data: signed } = await supabase.storage.from("interview-media").createSignedUrl(a.media_url, 3600);
          if (signed?.signedUrl) next[a.id] = signed.signedUrl;
        }),
      );
      setUrls(next);
      setLoading(false);
    })();
  }, [slug]);

  const shell: CSSProperties = {
    minHeight: "100vh",
    background: BG,
    color: INK,
    padding: "32px 20px 64px",
    boxSizing: "border-box",
  };

  const tab = (active: boolean): CSSProperties => ({
    flex: 1,
    minHeight: 44,
    border: `1px solid ${INK}`,
    background: active ? INK : "#fff",
    color: active ? "#fff" : INK,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  });

  if (loading) {
    return <div style={{ ...shell, display: "flex", alignItems: "center", justifyContent: "center", color: MUTED }}>◆</div>;
  }

  if (missing || !session) {
    return (
      <div style={{ ...shell, textAlign: "center", paddingTop: 80 }}>
        <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 22 }}>This portrait is private.</p>
      </div>
    );
  }

  const locale = session.locale === "en" ? "en" : "fr";
  const live = answers.filter((a) => !a.retired_at);
  const featuredIds = session.featured_question_ids || [];
  const featured = featuredIds
    .map((id) => live.filter((a) => a.question_id === id).sort((a, b) => b.take_no - a.take_no)[0])
    .filter(Boolean);

  return (
    <div style={shell}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <p style={{ letterSpacing: "0.2em", fontSize: 11, fontWeight: 700, color: MUTED, marginBottom: 20 }}>À VOIX HAUTE</p>
        <div style={{ display: "flex", marginBottom: 28 }}>
          <button type="button" onClick={() => setMode("portrait")} style={{ ...tab(mode === "portrait"), borderRadius: "12px 0 0 12px" }}>
            Portrait
          </button>
          <button type="button" onClick={() => setMode("text")} style={{ ...tab(mode === "text"), borderRadius: "0 12px 12px 0", borderLeft: "none" }}>
            Text
          </button>
        </div>

        {mode === "portrait" &&
          featured.map((a) => {
            const qq = INTERVIEW_QUESTIONS.find((x) => x.id === a.question_id);
            const src = urls[a.id];
            const video = isVideoPath(a.media_url, session.mode_pref);
            return (
              <article key={a.id} style={{ marginBottom: 40 }}>
                {src && video && (
                  <video src={src} controls playsInline style={{ width: "100%", borderRadius: 12, background: "#000", marginBottom: 12 }} />
                )}
                {src && !video && <AudioWave src={src} />}
                {a.strong_sentence && (
                  <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 26, lineHeight: 1.35, margin: "16px 0 8px" }}>
                    {a.strong_sentence}
                  </p>
                )}
                {qq && <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>{questionText(qq, locale)}</p>}
              </article>
            );
          })}

        {mode === "text" &&
          live.map((a) => {
            const qq = INTERVIEW_QUESTIONS.find((x) => x.id === a.question_id);
            return (
              <article key={a.id} style={{ marginBottom: 32 }}>
                {qq && (
                  <h2 style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 20, fontWeight: 400, margin: "0 0 10px" }}>
                    {questionText(qq, locale)}
                  </h2>
                )}
                <p style={{ fontSize: 16, lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>{a.transcript || "…"}</p>
              </article>
            );
          })}
      </div>
    </div>
  );
};

export default InterviewPortrait;
