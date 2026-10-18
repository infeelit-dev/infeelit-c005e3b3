import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { pickAudioRecorderMime, pickLiveRecorderMime } from "@/lib/gngChallenge";
import { INTERVIEW_QUESTIONS, questionText, type InterviewQuestion } from "@/lib/interviewQuestions";

type RecMode = "audio" | "video";
type Stage = "contract" | "mode" | "question" | "end";
type SessionRow = {
  id: string;
  token: string;
  locale: string;
  status: "in_progress" | "complete" | "published";
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
const MAX_MS = 120_000;
const MAX_BYTES = 80 * 1024 * 1024;
const SILENCE_MS = 20_000;

const copy = {
  fr: {
    contract1: "Vous pouvez passer.",
    contract2: "Vous pouvez vous arrêter.",
    contract3: "Rien n'est publié sans votre accord.",
    begin: "Begin",
    camera: "Record with camera",
    voice: "Voice only",
    skip: "Skip",
    lastTake: "This is your last take.",
    moveOn: "Move on?",
    orStay: "Or stay.",
    stay: "Stay",
    pass: "Move on",
    tap: "Tap to record",
    stop: "Tap to stop",
    saving: "Saving…",
    keep: "Keep this take",
    pick: "Choose 3 answers to feature.",
    save: "Save privately",
    publish: "Publish portrait",
    confirmPub: "Publish this portrait?",
    cancel: "Cancel",
    published: "Published",
    need3: "Select exactly 3.",
    inApp: "Open in Safari or Chrome to record.",
  },
  en: {
    contract1: "You can skip.",
    contract2: "You can stop.",
    contract3: "Nothing is published without your approval.",
    begin: "Begin",
    camera: "Record with camera",
    voice: "Voice only",
    skip: "Skip",
    lastTake: "This is your last take.",
    moveOn: "Move on?",
    orStay: "Or stay.",
    stay: "Stay",
    pass: "Move on",
    tap: "Tap to record",
    stop: "Tap to stop",
    saving: "Saving…",
    keep: "Keep this take",
    pick: "Choose 3 answers to feature.",
    save: "Save privately",
    publish: "Publish portrait",
    confirmPub: "Publish this portrait?",
    cancel: "Cancel",
    published: "Published",
    need3: "Select exactly 3.",
    inApp: "Open in Safari or Chrome to record.",
  },
};

function t(locale: string, key: keyof typeof copy.en) {
  return (locale === "en" ? copy.en : copy.fr)[key];
}

function extFor(blob: Blob, mode: RecMode) {
  if (blob.type.includes("mp4")) return "mp4";
  if (blob.type.includes("ogg")) return "ogg";
  if (blob.type.includes("webm")) return "webm";
  return mode === "video" ? "mp4" : "m4a";
}

function formatClock(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function isInAppBrowser() {
  const ua = navigator.userAgent || "";
  return /FBAN|FBAV|Instagram|LinkedInApp|Twitter|Line\/|Snapchat|TikTok/i.test(ua);
}

function nextTakeNo(rows: AnswerRow[], questionId: number) {
  const maxTake = rows.filter((a) => a.question_id === questionId).reduce((m, a) => Math.max(m, a.take_no), 0);
  return (maxTake + 1) as 1 | 2 | 3;
}

function resumeIndex(rows: AnswerRow[]) {
  if (!rows.length) return 0;
  const maxQ = rows.reduce((m, a) => Math.max(m, a.question_id), 0);
  const maxTake = rows.filter((a) => a.question_id === maxQ).reduce((m, a) => Math.max(m, a.take_no), 0);
  if (maxTake < 2) {
    const idx = INTERVIEW_QUESTIONS.findIndex((qq) => qq.id === maxQ);
    return idx >= 0 ? idx : 0;
  }
  const idx = INTERVIEW_QUESTIONS.findIndex((qq) => qq.id > maxQ);
  return idx >= 0 ? idx : INTERVIEW_QUESTIONS.length - 1;
}

function requiredDone(rows: AnswerRow[]) {
  const answered = new Set(rows.filter((a) => !a.retired_at).map((a) => a.question_id));
  return INTERVIEW_QUESTIONS.filter((qq) => !qq.optional).every((qq) => answered.has(qq.id));
}

const btnDark: CSSProperties = {
  width: "100%",
  minHeight: 52,
  border: "none",
  borderRadius: 12,
  background: INK,
  color: "#fff",
  fontWeight: 600,
  fontSize: 16,
  cursor: "pointer",
};

const btnGhost: CSSProperties = {
  ...btnDark,
  background: "#fff",
  color: INK,
  border: `1px solid ${INK}`,
};

const Interview = () => {
  const { token } = useParams<{ token: string }>();
  const [locale, setLocale] = useState<"fr" | "en">("fr");
  const [session, setSession] = useState<SessionRow | null>(null);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [stage, setStage] = useState<Stage>("contract");
  const [qIndex, setQIndex] = useState(0);
  const [mode, setMode] = useState<RecMode>("video");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const [silencePrompt, setSilencePrompt] = useState(false);
  const [featured, setFeatured] = useState<number[]>([]);
  const [inApp, setInApp] = useState(false);
  const [missing, setMissing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const durationRef = useRef(0);
  const lastSoundRef = useRef(0);
  const waveRaf = useRef(0);
  const skipSaveRef = useRef(false);
  const advanceAfterSaveRef = useRef(false);
  const answersRef = useRef<AnswerRow[]>([]);
  const qIndexRef = useRef(0);

  const q = INTERVIEW_QUESTIONS[qIndex];
  const liveAnswers = answers.filter((a) => !a.retired_at);
  const takeNo = q ? nextTakeNo(answers, q.id) : 1;

  const loadAnswers = async (sessionId: string) => {
    const { data } = await (supabase as any)
      .from("interview_answers")
      .select("id, question_id, take_no, media_url, duration_s, transcript, strong_sentence, retired_at")
      .eq("session_id", sessionId)
      .order("question_id");
    const rows = (data || []) as AnswerRow[];
    answersRef.current = rows;
    setAnswers(rows);
    return rows;
  };

  useEffect(() => {
    setInApp(isInAppBrowser());
  }, []);

  useEffect(() => {
    qIndexRef.current = qIndex;
  }, [qIndex]);

  useEffect(() => {
    if (!token) {
      setMissing(true);
      setLoading(false);
      return;
    }
    void (async () => {
      const loc = (navigator.language || "fr").slice(0, 2) === "en" ? "en" : "fr";
      setLocale(loc);
      let { data } = await (supabase as any).from("interview_sessions").select("*").eq("token", token).maybeSingle();
      if (!data) {
        const inserted = await (supabase as any)
          .from("interview_sessions")
          .insert({ token, locale: loc, status: "in_progress", mode_pref: "video" })
          .select("*")
          .single();
        data = inserted.data;
      }
      if (!data) {
        setMissing(true);
        setLoading(false);
        return;
      }
      const row = data as SessionRow;
      setSession(row);
      setMode(row.mode_pref || "video");
      if (row.locale === "en" || row.locale === "fr") setLocale(row.locale);
      const rows = await loadAnswers(row.id);
      if (row.featured_question_ids?.length) setFeatured(row.featured_question_ids);
      if (row.status === "published" && row.slug) {
        setPublishedUrl(`${window.location.origin}/p/${row.slug}`);
        setStage("end");
      } else if (row.status === "complete" || row.status === "published" || requiredDone(rows)) {
        setQIndex(resumeIndex(rows));
        setStage("end");
      } else {
        setQIndex(resumeIndex(rows));
        setStage("contract");
      }
      setLoading(false);
    })();
  }, [token]);

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    cancelAnimationFrame(waveRaf.current);
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const startCapture = async (nextMode: RecMode) => {
    if (inApp) {
      toast.error(t(locale, "inApp"));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        nextMode === "video"
          ? { video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1920 } }, audio: true }
          : { audio: true, video: false },
      );
      streamRef.current = stream;
      setMode(nextMode);
      if (session) {
        await (supabase as any).from("interview_sessions").update({ mode_pref: nextMode, locale }).eq("id", session.id);
        setSession({ ...session, mode_pref: nextMode });
      }
      setStage("question");
      setElapsed(0);
      setRecording(false);
    } catch {
      toast.error(nextMode === "video" ? "Camera unavailable." : "Microphone unavailable.");
    }
  };

  const beginInterview = () => {
    if (answers.length > 0 && session?.mode_pref) {
      void startCapture(session.mode_pref);
      return;
    }
    setStage("mode");
  };

  useEffect(() => {
    if (stage !== "question" || mode !== "video") return;
    const el = videoRef.current;
    const stream = streamRef.current;
    if (!el || !stream) return;
    el.srcObject = stream;
    void el.play();
  }, [stage, mode, qIndex]);

  const goNext = () => {
    const idx = qIndexRef.current;
    setElapsed(0);
    setRecording(false);
    setSilencePrompt(false);
    if (idx >= INTERVIEW_QUESTIONS.length - 1) {
      setStage("end");
      return;
    }
    setQIndex(idx + 1);
  };

  const persistTake = async (blob: Blob, advance: boolean) => {
    if (!session) return;
    const question = INTERVIEW_QUESTIONS[qIndexRef.current];
    if (!question) return;
    const take = nextTakeNo(answersRef.current, question.id);
    if (blob.size > MAX_BYTES) {
      toast.error("File too large (80 MB max).");
      return;
    }
    if (take > 2) return;
    setSaving(true);
    try {
      const ext = extFor(blob, mode);
      const path = `${session.id}/q${question.id}/take${take}.${ext}`;
      const { error: upErr } = await supabase.storage.from("interview-media").upload(path, blob, {
        contentType: blob.type || (mode === "video" ? "video/mp4" : "audio/mp4"),
        upsert: true,
      });
      if (upErr) throw upErr;
      if (take === 2) {
        await (supabase as any)
          .from("interview_answers")
          .update({ retired_at: new Date().toISOString() })
          .eq("session_id", session.id)
          .eq("question_id", question.id)
          .eq("take_no", 1);
      }
      const { data: inserted, error: insErr } = await (supabase as any)
        .from("interview_answers")
        .insert({
          session_id: session.id,
          question_id: question.id,
          take_no: take,
          media_url: path,
          duration_s: Math.max(1, Math.round(durationRef.current / 1000)),
          transcript_status: "pending",
        })
        .select("id")
        .single();
      if (insErr) throw insErr;
      void supabase.functions.invoke("transcribe-interview-answer", { body: { answer_id: inserted.id } });
      await loadAnswers(session.id);
      if (advance || take === 2) goNext();
    } catch (e) {
      console.error(e);
      toast.error("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const startRecording = () => {
    const stream = streamRef.current;
    if (!stream || takeNo > 2 || saving) return;
    chunksRef.current = [];
    setSilencePrompt(false);
    skipSaveRef.current = false;
    advanceAfterSaveRef.current = false;
    const mime = mode === "audio" ? pickAudioRecorderMime() : pickLiveRecorderMime();
    let rec: MediaRecorder;
    try {
      rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    } catch {
      rec = new MediaRecorder(stream);
    }
    recorderRef.current = rec;
    rec.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      if (skipSaveRef.current) {
        skipSaveRef.current = false;
        chunksRef.current = [];
        return;
      }
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || (mode === "audio" ? "audio/webm" : "video/webm") });
      if (blob.size < 400) {
        toast.error("Empty recording. Try again.");
        return;
      }
      const take = nextTakeNo(answersRef.current, INTERVIEW_QUESTIONS[qIndexRef.current]?.id || 0);
      void persistTake(blob, advanceAfterSaveRef.current || take >= 2);
    };
    rec.start(250);
    setRecording(true);
    const started = Date.now();
    lastSoundRef.current = started;
    timerRef.current = window.setInterval(() => {
      const ms = Date.now() - started;
      durationRef.current = ms;
      setElapsed(ms);
      if (ms >= MAX_MS) stopRecording({ save: true, advance: true });
    }, 200);

    try {
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        if (rms > 0.04) lastSoundRef.current = Date.now();
        if (Date.now() - lastSoundRef.current >= SILENCE_MS) setSilencePrompt(true);
        waveRaf.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* optional */
    }
  };

  const stopRecording = (opts?: { save?: boolean; advance?: boolean }) => {
    skipSaveRef.current = opts?.save === false;
    advanceAfterSaveRef.current = !!opts?.advance;
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") {
      try {
        rec.requestData();
      } catch {
        /* Safari */
      }
      rec.stop();
    }
    setRecording(false);
    setSilencePrompt(false);
    stopTimer();
  };

  const skipOptional = () => {
    if (!q?.optional) return;
    if (recording) stopRecording({ save: false });
    goNext();
  };

  const latestByQuestion = () => {
    const map = new Map<number, AnswerRow>();
    for (const a of liveAnswers) {
      const prev = map.get(a.question_id);
      if (!prev || a.take_no > prev.take_no) map.set(a.question_id, a);
    }
    return [...map.values()].sort((a, b) => a.question_id - b.question_id);
  };

  const toggleFeatured = (id: number) => {
    setFeatured((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const saveSession = async (publish: boolean) => {
    if (!session) return;
    if (featured.length !== 3) {
      toast.error(t(locale, "need3"));
      return;
    }
    const patch: Record<string, unknown> = {
      featured_question_ids: featured,
      status: publish ? "published" : "complete",
    };
    if (publish) {
      patch.slug = session.slug || `v-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
    }
    const { data, error } = await (supabase as any).from("interview_sessions").update(patch).eq("id", session.id).select("*").single();
    if (error) {
      toast.error("Could not save.");
      return;
    }
    setSession(data);
    setConfirmPublish(false);
    if (publish && data.slug) {
      setPublishedUrl(`${window.location.origin}/p/${data.slug}`);
      toast.success(t(locale, "published"));
    } else {
      toast.success("Saved privately.");
    }
  };

  useEffect(
    () => () => {
      stopTimer();
      stopStream();
    },
    [],
  );

  const shell: CSSProperties = {
    minHeight: "100vh",
    background: BG,
    color: INK,
    padding: "32px 20px 56px",
    boxSizing: "border-box",
  };

  const recBtn = (on: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 84,
    height: 84,
    borderRadius: 12,
    border: `2px solid ${mode === "video" ? "#fff" : INK}`,
    background: on ? (mode === "video" ? "#fff" : INK) : "transparent",
    cursor: "pointer",
    color: mode === "video" ? "#fff" : INK,
    fontWeight: 700,
    fontSize: 14,
  });

  if (loading) {
    return <div style={{ ...shell, display: "flex", alignItems: "center", justifyContent: "center", color: MUTED }}>◆</div>;
  }
  if (missing || !token) {
    return (
      <div style={{ ...shell, textAlign: "center", paddingTop: 80 }}>
        <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 22 }}>Invalid link</p>
      </div>
    );
  }

  if (stage === "contract") {
    return (
      <div style={shell}>
        <div style={{ maxWidth: 390, margin: "0 auto", paddingTop: 48 }}>
          <p style={{ letterSpacing: "0.2em", fontSize: 11, fontWeight: 700, color: MUTED, marginBottom: 28 }}>À VOIX HAUTE</p>
          <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 26, lineHeight: 1.4, margin: "0 0 16px" }}>{t(locale, "contract1")}</p>
          <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 26, lineHeight: 1.4, margin: "0 0 16px" }}>{t(locale, "contract2")}</p>
          <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 26, lineHeight: 1.4, margin: "0 0 40px" }}>{t(locale, "contract3")}</p>
          <button type="button" onClick={beginInterview} style={btnDark}>
            {t(locale, "begin")}
          </button>
        </div>
      </div>
    );
  }

  if (stage === "mode") {
    return (
      <div style={shell}>
        <div style={{ maxWidth: 390, margin: "0 auto", paddingTop: 64 }}>
          {inApp && <p style={{ color: MUTED, marginBottom: 16 }}>{t(locale, "inApp")}</p>}
          <button type="button" disabled={inApp} onClick={() => void startCapture("video")} style={{ ...btnDark, marginBottom: 12 }}>
            {t(locale, "camera")}
          </button>
          <button type="button" disabled={inApp} onClick={() => void startCapture("audio")} style={btnGhost}>
            {t(locale, "voice")}
          </button>
        </div>
      </div>
    );
  }

  if (stage === "end") {
    const list = latestByQuestion();
    return (
      <div style={shell}>
        <div style={{ maxWidth: 390, margin: "0 auto" }}>
          <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 24, margin: "0 0 24px" }}>{t(locale, "pick")}</p>
          {list.map((a) => {
            const qq = INTERVIEW_QUESTIONS.find((x) => x.id === a.question_id);
            const on = featured.includes(a.question_id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleFeatured(a.question_id)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: "#fff",
                  border: on ? `1.5px solid ${INK}` : "1px solid #E2E8F0",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 10,
                  cursor: "pointer",
                }}
              >
                <p style={{ margin: 0, fontSize: 12, color: MUTED }}>
                  Q{a.question_id} · {a.duration_s || 0}s
                </p>
                <p style={{ margin: "6px 0 0", fontSize: 15, fontFamily: "Georgia, serif", fontStyle: "italic", color: INK }}>
                  {qq ? questionText(qq, locale) : ""}
                </p>
              </button>
            );
          })}
          <button type="button" onClick={() => void saveSession(false)} style={{ ...btnGhost, marginTop: 16 }}>
            {t(locale, "save")}
          </button>
          <button type="button" onClick={() => setConfirmPublish(true)} style={{ ...btnDark, marginTop: 10 }}>
            {t(locale, "publish")}
          </button>
          {publishedUrl && (
            <p style={{ marginTop: 16, fontSize: 14, wordBreak: "break-all" }}>
              <a href={publishedUrl} style={{ color: INK }}>
                {publishedUrl}
              </a>
            </p>
          )}
        </div>
        {confirmPublish && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 30,
              background: "rgba(248,249,250,0.96)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 26, margin: "0 0 28px", textAlign: "center" }}>
              {t(locale, "confirmPub")}
            </p>
            <button type="button" onClick={() => void saveSession(true)} style={{ ...btnDark, maxWidth: 320 }}>
              {t(locale, "publish")}
            </button>
            <button type="button" onClick={() => setConfirmPublish(false)} style={{ ...btnGhost, maxWidth: 320, marginTop: 10 }}>
              {t(locale, "cancel")}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!q) {
    return (
      <div style={shell}>
        <button type="button" onClick={() => setStage("end")} style={btnDark}>
          {t(locale, "keep")}
        </button>
      </div>
    );
  }

  if (takeNo > 2) {
    return (
      <div style={shell}>
        <div style={{ maxWidth: 390, margin: "0 auto" }}>
          <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 22 }}>{questionText(q as InterviewQuestion, locale)}</p>
          <button type="button" onClick={goNext} style={{ ...btnDark, marginTop: 24 }}>
            {t(locale, "keep")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...shell, padding: 0, position: "relative", background: mode === "video" ? "#000" : BG, color: mode === "video" ? "#fff" : INK }}>
      {mode === "video" && (
        <video ref={videoRef} playsInline muted autoPlay style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          padding: "28px 20px 40px",
          boxSizing: "border-box",
          background: mode === "video" ? "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 28%, transparent 55%, rgba(0,0,0,0.7) 100%)" : "none",
        }}
      >
        <div style={{ maxWidth: 390, margin: "0 auto" }}>
          <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 28, lineHeight: 1.4, margin: "48px 0 24px" }}>
            {questionText(q, locale)}
          </p>
          {takeNo === 2 && <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>{t(locale, "lastTake")}</p>}
          <p style={{ textAlign: "center", fontSize: 28, fontWeight: 600, margin: "32px 0 16px" }}>{recording ? formatClock(elapsed) : "0:00"}</p>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
            <button
              type="button"
              disabled={saving || takeNo > 2}
              onClick={() => (recording ? stopRecording({ save: true, advance: takeNo >= 2 }) : startRecording())}
              style={recBtn(recording)}
              aria-label={recording ? "Stop" : "Record"}
            >
              <span
                style={{
                  width: recording ? 18 : 22,
                  height: recording ? 18 : 22,
                  borderRadius: recording ? 4 : "50%",
                  background: recording ? (mode === "video" ? INK : "#fff") : mode === "video" ? "#fff" : INK,
                  display: "block",
                }}
              />
            </button>
            {q.optional && (
              <button type="button" onClick={skipOptional} style={recBtn(false)}>
                {t(locale, "skip")}
              </button>
            )}
          </div>
          <p style={{ textAlign: "center", fontSize: 15, fontWeight: 600, marginTop: 12 }}>
            {saving ? t(locale, "saving") : recording ? t(locale, "stop") : t(locale, "tap")}
          </p>
          {takeNo === 2 && !recording && !saving && (
            <button
              type="button"
              onClick={goNext}
              style={{
                ...btnGhost,
                marginTop: 20,
                background: mode === "video" ? "rgba(255,255,255,0.12)" : "#fff",
                color: mode === "video" ? "#fff" : INK,
                borderColor: mode === "video" ? "#fff" : INK,
              }}
            >
              {t(locale, "keep")}
            </button>
          )}
        </div>
      </div>

      {silencePrompt && recording && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 20,
            background: "rgba(248,249,250,0.94)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            color: INK,
          }}
        >
          <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 28, margin: "0 0 8px" }}>{t(locale, "moveOn")}</p>
          <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 28, margin: "0 0 32px" }}>{t(locale, "orStay")}</p>
          <button
            type="button"
            onClick={() => {
              setSilencePrompt(false);
              lastSoundRef.current = Date.now();
            }}
            style={{ ...btnDark, maxWidth: 280 }}
          >
            {t(locale, "stay")}
          </button>
          <button type="button" onClick={() => stopRecording({ save: true, advance: true })} style={{ ...btnGhost, maxWidth: 280, marginTop: 10 }}>
            {t(locale, "pass")}
          </button>
        </div>
      )}
    </div>
  );
};

export default Interview;
