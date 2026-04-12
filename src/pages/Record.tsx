import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { X, StopCircle, Loader2, Share2, Video, Mic } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const MAX_DURATION_SECONDS = 180;

const FOLLOWUP_QUESTIONS = {
  en: {
    childhood: [
      "Who made that moment feel safe?",
      "What did that place smell like?",
      "Do your children know this story?",
    ],
    family: [
      "What did that person teach you without words?",
      "When did you last tell them what they mean to you?",
      "What part of them lives in you today?",
    ],
    loss: [
      "What do you wish you had said?",
      "What did they leave behind in you?",
      "Who carries their memory with you?",
    ],
    default: [
      "Who else was there in that memory?",
      "What would you tell that version of yourself?",
      "Is there someone who needs to hear this story?",
    ],
  },
  fr: {
    childhood: [
      "Qui a rendu ce moment sûr ?",
      "Quelle odeur avait cet endroit ?",
      "Vos enfants connaissent-ils cette histoire ?",
    ],
    family: [
      "Que vous a appris cette personne sans mots ?",
      "Quand lui avez-vous dit ce qu'elle représente pour vous ?",
      "Quelle part d'elle vit en vous aujourd'hui ?",
    ],
    loss: ["Qu'auriez-vous voulu dire ?", "Que vous ont-ils laissé en vous ?", "Qui porte leur mémoire avec vous ?"],
    default: [
      "Qui d'autre était là dans ce souvenir ?",
      "Que diriez-vous à cette version de vous-même ?",
      "Y a-t-il quelqu'un qui a besoin d'entendre cette histoire ?",
    ],
  },
  ar: {
    childhood: ["من جعل تلك اللحظة آمنة؟", "كيف كانت رائحة ذلك المكان؟", "هل يعرف أطفالك هذه القصة؟"],
    family: ["ماذا علّمتك هذه الشخصية دون كلام؟", "متى أخبرتها آخر مرة بما تعنيه لك؟", "أي جزء منها يعيش فيك اليوم؟"],
    loss: ["ما الذي تمنيت قوله؟", "ماذا تركوا فيك؟", "من يحمل ذكراهم معك؟"],
    default: ["من آخر كان في تلك الذكرى؟", "ماذا ستقول لتلك النسخة من نفسك؟", "هل هناك من يحتاج أن يسمع هذه القصة؟"],
  },
};

const POETIC_TITLES = {
  en: {
    childhood: [
      "A memory that still smells like home...",
      "The day I understood what childhood meant...",
      "A place I can still find with my eyes closed...",
    ],
    family: [
      "What they never said out loud...",
      "The voice I still carry with me...",
      "A love that didn't need words...",
    ],
    loss: [
      "What remains after goodbye...",
      "The presence that never truly left...",
      "Everything they left inside me...",
    ],
    default: [
      "A story that deserved to be told...",
      "The moment I didn't know I'd remember...",
      "A thread in the tapestry of who I am...",
    ],
  },
  fr: {
    childhood: [
      "Un souvenir qui sent encore comme la maison...",
      "Le jour où j'ai compris ce qu'était l'enfance...",
      "Un endroit que je trouve encore les yeux fermés...",
    ],
    family: [
      "Ce qu'ils n'ont jamais dit à voix haute...",
      "La voix que je porte encore avec moi...",
      "Un amour qui n'avait pas besoin de mots...",
    ],
    loss: [
      "Ce qui reste après l'au revoir...",
      "La présence qui n'est jamais vraiment partie...",
      "Tout ce qu'ils ont laissé en moi...",
    ],
    default: [
      "Une histoire qui méritait d'être racontée...",
      "Le moment dont je ne savais pas que je m'en souviendrais...",
      "Un fil dans la tapisserie de qui je suis...",
    ],
  },
  ar: {
    childhood: [
      "ذكرى لا تزال تفوح منها رائحة البيت...",
      "اليوم الذي فهمت فيه معنى الطفولة...",
      "مكان لا أزال أجده بعيني مغمضتين...",
    ],
    family: ["ما لم يقولوه بصوت عالٍ...", "الصوت الذي لا أزال أحمله معي...", "حبٌّ لم يحتج إلى كلمات..."],
    loss: ["ما يبقى بعد الوداع...", "الحضور الذي لم يغادر حقاً...", "كل ما تركوه بداخلي..."],
    default: ["قصة استحقت أن تُروى...", "اللحظة التي لم أعلم أنني سأتذكرها...", "خيط في نسيج هويتي..."],
  },
};

const getTheme = (question: string): string => {
  const q = question.toLowerCase();
  if (
    q.includes("child") ||
    q.includes("home") ||
    q.includes("school") ||
    q.includes("enfance") ||
    q.includes("طفل") ||
    q.includes("بيت")
  )
    return "childhood";
  if (
    q.includes("mother") ||
    q.includes("father") ||
    q.includes("family") ||
    q.includes("mère") ||
    q.includes("père") ||
    q.includes("أم") ||
    q.includes("أب")
  )
    return "family";
  if (q.includes("lost") || q.includes("miss") || q.includes("gone") || q.includes("perdu") || q.includes("فقد"))
    return "loss";
  return "default";
};

const uploadToR2 = async (blob: Blob, fileName: string): Promise<string> => {
  const endpoint = import.meta.env.VITE_R2_ENDPOINT;
  const bucketName = import.meta.env.VITE_R2_BUCKET_NAME || "infeelit-memories";
  const url = `${endpoint}/${bucketName}/${fileName}`;
  const response = await fetch(url, { method: "PUT", headers: { "Content-Type": blob.type }, body: blob });
  if (!response.ok) throw new Error(`R2 upload failed: ${response.status}`);
  return url;
};

const capturePosterFrame = (videoElement: HTMLVideoElement): Promise<Blob | null> => {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.drawImage(videoElement, 0, 0, 320, 180);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7);
    } catch {
      resolve(null);
    }
  });
};

type Stage = "question" | "countdown" | "recording" | "uploading" | "followup" | "title" | "share";

const Record = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang, rtl } = useLanguage();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const hardCapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const uploadedFileUrl = useRef<string>("");
  const uploadedThumbUrl = useRef<string>("");
  const uploadedType = useRef<string>("video");
  const userIdRef = useRef<string>("");

  const [stage, setStage] = useState<Stage>("question");
  const [mediaRecorder, setMR] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [followupIdx, setFollowIdx] = useState(0);
  const [memoryTitle, setTitle] = useState("");
  const [audioMode, setAudioMode] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const question = location.state?.question || "What smell instantly brings you back to your childhood home?";
  const theme = getTheme(question);

  const followups =
    FOLLOWUP_QUESTIONS[lang]?.[theme as keyof typeof FOLLOWUP_QUESTIONS.en] ??
    FOLLOWUP_QUESTIONS.en[theme as keyof typeof FOLLOWUP_QUESTIONS.en];
  const poeticTitles =
    POETIC_TITLES[lang]?.[theme as keyof typeof POETIC_TITLES.en] ??
    POETIC_TITLES.en[theme as keyof typeof POETIC_TITLES.en];

  const startMedia = async (audioOnly: boolean) => {
    try {
      const constraints = audioOnly
        ? { audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 } }
        : {
            video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 480 }, frameRate: { ideal: 24 } },
            audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
          };
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(s);
      if (!audioOnly && videoRef.current) videoRef.current.srcObject = s;
      if (audioOnly) {
        const ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(s);
        const anal = ctx.createAnalyser();
        anal.fftSize = 256;
        source.connect(anal);
        analyserRef.current = anal;
      }
      const mimeType = audioOnly
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm";
      const recorder = new MediaRecorder(s, {
        mimeType,
        videoBitsPerSecond: audioOnly ? undefined : 500_000,
        audioBitsPerSecond: 64_000,
      });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.current.push(e.data);
      };
      setMR(recorder);
    } catch {
      toast.error("Microphone not accessible.");
    }
  };

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(animFrameRef.current);
      if (hardCapTimer.current) clearTimeout(hardCapTimer.current);
      if (elapsedTimer.current) clearInterval(elapsedTimer.current);
    };
  }, [stream]);

  useEffect(() => {
    if (!audioMode || stage !== "recording") return;
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d")!;
    const buf = new Uint8Array(analyser.frequencyBinCount);
    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(buf);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#E8742A";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#E8742A";
      ctx.beginPath();
      const sliceW = canvas.width / buf.length;
      let x = 0;
      for (let i = 0; i < buf.length; i++) {
        const y = ((buf[i] / 128.0) * canvas.height) / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceW;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [audioMode, stage]);

  const startCountdown = () => {
    setStage("countdown");
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          recordedChunks.current = [];
          mediaRecorder?.start(100);
          setStage("recording");
          setElapsed(0);
          elapsedTimer.current = setInterval(() => setElapsed((e) => e + 1), 1000);
          hardCapTimer.current = setTimeout(() => {
            toast(
              lang === "ar"
                ? "انتهى الوقت، جارٍ الحفظ..."
                : lang === "fr"
                  ? "Limite atteinte, sauvegarde..."
                  : "3 minute limit reached. Saving...",
              { icon: "⏱️" },
            );
            handleStop();
          }, MAX_DURATION_SECONDS * 1000);
          return 3;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStop = async () => {
    if (!mediaRecorder) return;
    if (hardCapTimer.current) clearTimeout(hardCapTimer.current);
    if (elapsedTimer.current) clearInterval(elapsedTimer.current);
    cancelAnimationFrame(animFrameRef.current);
    setStage("uploading");
    mediaRecorder.requestData();

    let posterBlob: Blob | null = null;
    if (!audioMode && videoRef.current) posterBlob = await capturePosterFrame(videoRef.current);

    mediaRecorder.onstop = async () => {
      try {
        const type = audioMode ? "audio/webm" : "video/webm";
        const blob = new Blob(recordedChunks.current, { type });
        if (blob.size === 0) {
          toast.error("Nothing recorded.");
          setStage("recording");
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id || "anonymous";
        userIdRef.current = userId;
        uploadedType.current = audioMode ? "audio" : "video";

        const ts = Date.now();
        const fileName = `${userId}/${ts}_memory.webm`;
        const posterName = `${userId}/${ts}_poster.jpg`;

        let fileUrl = "";
        try {
          fileUrl = await uploadToR2(blob, fileName);
        } catch {
          if (user) {
            const { data } = await supabase.storage.from("memories").upload(fileName, blob, { contentType: type });
            if (data) fileUrl = supabase.storage.from("memories").getPublicUrl(fileName).data.publicUrl;
          }
        }
        uploadedFileUrl.current = fileUrl;

        let thumbUrl = "";
        if (posterBlob) {
          try {
            thumbUrl = await uploadToR2(posterBlob, posterName);
          } catch {
            if (user) {
              const { data } = await supabase.storage
                .from("memories")
                .upload(posterName, posterBlob, { contentType: "image/jpeg" });
              if (data) thumbUrl = supabase.storage.from("memories").getPublicUrl(posterName).data.publicUrl;
            }
          }
        }
        uploadedThumbUrl.current = thumbUrl;
        setTitle(poeticTitles[Math.floor(Math.random() * poeticTitles.length)]);
        setStage("followup");
      } catch (err) {
        console.error(err);
        toast.error("Error saving. Please try again.");
        setStage("recording");
      }
    };
    mediaRecorder.stop();
  };

  const handleShare = async (type: "circle" | "public" | "private") => {
    stream?.getTracks().forEach((t) => t.stop());
    const isPublic = type === "public";
    if (userIdRef.current && userIdRef.current !== "anonymous" && uploadedFileUrl.current) {
      const { error } = await (supabase as any).from("memories").insert({
        user_id: userIdRef.current,
        title: memoryTitle || "A memory",
        description: null,
        file_url: uploadedFileUrl.current,
        file_type: uploadedType.current,
        thumbnail_url: uploadedThumbUrl.current || null,
        timeline: "past",
        is_public: isPublic,
        created_at: new Date().toISOString(),
      });
      if (error) console.error("Insert error:", error);
    }
    if (type === "circle") toast.success(t.sharedCircle);
    else if (type === "public") toast.success(t.sharedOcean);
    else toast.success(t.keptPrivate);
    navigate("/");
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const timerColor = elapsed >= 150 ? "#EF4444" : elapsed >= 120 ? "#F97316" : "#FFFFFF";

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden font-sans" dir={rtl ? "rtl" : "ltr"}>
      {!audioMode && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${stage === "recording" ? "opacity-80" : "opacity-20"}`}
        />
      )}
      {audioMode && (
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg,#0a0a0a 0%,#1a0a2e 50%,#0a0a0a 100%)" }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center">
        <button
          onClick={() => {
            stream?.getTracks().forEach((t) => t.stop());
            navigate(-1);
          }}
          className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20"
        >
          <X size={24} />
        </button>
        <div className="flex items-center gap-3">
          {stage === "recording" && (
            <span className="font-black text-lg tabular-nums" style={{ color: timerColor }}>
              {formatTime(elapsed)} / 3:00
            </span>
          )}
          {(stage === "recording" || stage === "countdown") && (
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
              {audioMode ? (
                <Mic size={14} className="text-[#E8742A]" />
              ) : (
                <Video size={14} className="text-[#E8742A]" />
              )}
              <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest">
                {audioMode
                  ? lang === "ar"
                    ? "صوت فقط"
                    : lang === "fr"
                      ? "Voix"
                      : "Voice only"
                  : lang === "ar"
                    ? "فيديو"
                    : "Video"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* STAGE 1 — QUESTION */}
      {stage === "question" && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em]">{t.yourStory}</p>
          <h2 className="text-white text-2xl font-bold leading-tight italic">"{question}"</h2>
          <p className="text-white/50 text-sm">{t.breathe}</p>
          {!stream ? (
            <div className="flex flex-col gap-4 w-full max-w-xs mt-4">
              <p className="text-white/70 text-xs uppercase tracking-widest text-center">{t.howShare}</p>
              <button
                onClick={() => {
                  setAudioMode(false);
                  startMedia(false);
                }}
                className="w-full py-4 rounded-full gradient-orange font-bold text-base flex items-center justify-center gap-3"
                style={{ color: "#fff" }}
              >
                <Video size={20} /> {t.videoShowFace}
              </button>
              <button
                onClick={() => {
                  setAudioMode(true);
                  startMedia(true);
                }}
                className="w-full py-4 rounded-full bg-white/15 border border-white/40 text-white font-bold text-base flex items-center justify-center gap-3"
              >
                <Mic size={20} /> {t.voiceOnly}
              </button>
            </div>
          ) : (
            <button
              onClick={startCountdown}
              className="mt-2 px-10 py-4 rounded-full gradient-orange font-bold text-lg"
              style={{ color: "#fff" }}
            >
              {t.imReady}
            </button>
          )}
        </div>
      )}

      {/* STAGE 2 — COUNTDOWN */}
      {stage === "countdown" && (
        <div className="relative z-20 flex-1 flex items-center justify-center">
          <div className="text-white text-9xl font-black animate-pulse">{countdown}</div>
        </div>
      )}

      {/* STAGE 3 — RECORDING */}
      {stage === "recording" && (
        <>
          <div className="relative z-10 flex justify-end px-6 -mt-16">
            <div className="flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span className="text-[10px] text-white font-black uppercase tracking-widest">
                {audioMode
                  ? lang === "ar"
                    ? "يستمع..."
                    : lang === "fr"
                      ? "Écoute..."
                      : "Listening..."
                  : lang === "ar"
                    ? "تسجيل"
                    : lang === "fr"
                      ? "Enregistrement"
                      : "Recording"}
              </span>
            </div>
          </div>
          {audioMode && (
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center"
                style={{
                  background: "radial-gradient(circle,rgba(107,78,155,.4) 0%,rgba(232,116,42,.2) 100%)",
                  boxShadow: "0 0 40px rgba(232,116,42,.3)",
                }}
              >
                <Mic size={48} className="text-[#E8742A]" />
              </div>
              <canvas ref={canvasRef} width={300} height={80} className="opacity-90" />
            </div>
          )}
          <div className="mt-auto relative z-20 px-10 pb-8 text-center">
            <h2 className="text-white text-lg font-bold leading-tight italic opacity-60">"{question}"</h2>
          </div>
          <div className="relative z-20 pb-20 flex justify-center">
            <button
              onClick={handleStop}
              className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
            >
              <StopCircle size={48} className="text-red-600" />
            </button>
          </div>
        </>
      )}

      {/* STAGE 4 — UPLOADING */}
      {stage === "uploading" && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center gap-6">
          <Loader2 size={48} className="text-[#E8742A] animate-spin" />
          <p className="text-white text-sm font-bold uppercase tracking-widest">{t.weaving}</p>
        </div>
      )}

      {/* STAGE 5 — FOLLOWUP */}
      {stage === "followup" && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-8 text-center gap-8">
          <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em]">{t.oneMoreQuestion}</p>
          <p className="text-white/40 text-xs uppercase tracking-widest">
            {followupIdx + 1} / {followups.length}
          </p>
          <h2 className="text-white text-2xl font-bold leading-tight">{followups[followupIdx]}</h2>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={startCountdown}
              className="w-full py-4 rounded-full gradient-orange font-bold text-base"
              style={{ color: "#fff" }}
            >
              {t.answerToo}
            </button>
            <button
              onClick={() => (followupIdx < followups.length - 1 ? setFollowIdx((i) => i + 1) : setStage("title"))}
              className="w-full py-4 rounded-full bg-white/15 border border-white/40 text-white font-bold text-base"
            >
              {followupIdx < followups.length - 1 ? t.nextQuestion : t.seeMyMemory}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 6 — TITLE */}
      {stage === "title" && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-8 text-center gap-8">
          <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em]">{t.memoryReady}</p>
          <h2 className="text-white text-2xl font-bold leading-tight italic">"{memoryTitle}"</h2>
          <input
            type="text"
            value={memoryTitle}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full max-w-xs bg-white/10 border border-white/20 rounded-full px-6 py-3 text-white text-center text-sm outline-none"
            dir={rtl ? "rtl" : "ltr"}
          />
          <button
            onClick={() => setStage("share")}
            className="w-full max-w-xs py-4 rounded-full gradient-orange font-bold text-base flex items-center justify-center gap-2"
            style={{ color: "#fff" }}
          >
            <Share2 size={18} /> {t.shareMemory}
          </button>
        </div>
      )}

      {/* STAGE 7 — SHARE */}
      {stage === "share" && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
          <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em]">{t.whoHears}</p>
          <h2 className="text-white text-lg font-bold leading-tight italic mb-2">"{memoryTitle}"</h2>
          <button
            onClick={() => handleShare("circle")}
            className="w-full max-w-xs py-4 rounded-full font-bold text-white text-base"
            style={{ backgroundColor: "#6B4E9B" }}
          >
            {t.myFamilyCircle}
          </button>
          <button
            onClick={() => handleShare("public")}
            className="w-full max-w-xs py-4 rounded-full gradient-orange font-bold text-base"
            style={{ color: "#fff" }}
          >
            {t.shareInOcean}
          </button>
          <button
            onClick={() => handleShare("private")}
            className="w-full max-w-xs py-4 rounded-full bg-white/15 border border-white/40 text-white font-bold text-base"
          >
            {t.keepPrivate}
          </button>
        </div>
      )}
    </div>
  );
};

export default Record;
