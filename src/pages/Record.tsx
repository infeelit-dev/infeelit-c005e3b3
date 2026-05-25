import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  X,
  StopCircle,
  Loader2,
  Share2,
  Video,
  Mic,
  Download,
  RotateCcw,
  Check,
  Camera,
  Lock,
  Users,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import useUserName from "@/hooks/useUserName";
import ShareModal from "@/components/ShareModal";

import childImg from "@/assets/child.jpg";
import grandfatherImg from "@/assets/grandfather.jpg";
import houseImg from "@/assets/house.jpg";
import loveImg from "@/assets/love.jpg";
import travelImg from "@/assets/travel.jpg";
import relaxImg from "@/assets/relax.jpg";
import picnicImg from "@/assets/picnic.jpg";
import marryImg from "@/assets/marry.jpg";
import birthImg from "@/assets/birth.jpg";
import graduateImg from "@/assets/graduate.jpg";

const MAX_DURATION_SECONDS = 180;
const VIDEO_BITRATE = 500_000;
const AUDIO_BITRATE = 32_000;

const getThematicCards = (question: string): string[] => {
  const q = question.toLowerCase();
  if (q.match(/jouet|toy|enfant|child|école|school|طفل/)) return [childImg, houseImg, picnicImg];
  if (q.match(/père|father|أب|grand-père|grandfather/)) return [grandfatherImg, loveImg, houseImg];
  if (q.match(/mère|mother|أم|grand-mère|grandmother/)) return [loveImg, houseImg, picnicImg];
  if (q.match(/maison|home|بيت|cuisine|kitchen|مطبخ/)) return [houseImg, grandfatherImg, relaxImg];
  if (q.match(/amour|love|حب|coeur|heart/)) return [loveImg, marryImg, picnicImg];
  if (q.match(/voyage|travel|سفر|vacances|holiday/)) return [travelImg, relaxImg, graduateImg];
  if (q.match(/fête|celebration|احتفال|repas|meal|famil|عائلة/)) return [picnicImg, marryImg, birthImg];
  if (q.match(/nager|swim|سباحة|sport|match|stade|stadium/)) return [relaxImg, travelImg, graduateImg];
  return [grandfatherImg, houseImg, relaxImg];
};

const generateTitleFromQuestion = (q: string): string => {
  return q
    .replace(/^[A-Za-zÀ-ÿ\u0600-\u06FF]+[،,]?\s*/u, "")
    .replace(/raconte-leur |raconte-nous |tell them |tell us |احكِ لهم |احكِ لنا /gi, "")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
};

const imageUrlToBlob = async (src: string): Promise<Blob> => {
  const res = await fetch(src);
  return res.blob();
};

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

const getTheme = (q: string): string => {
  const lq = q.toLowerCase();
  if (lq.includes("child") || lq.includes("home") || lq.includes("enfance") || lq.includes("طفل") || lq.includes("بيت"))
    return "childhood";
  if (
    lq.includes("mother") ||
    lq.includes("father") ||
    lq.includes("family") ||
    lq.includes("mère") ||
    lq.includes("père") ||
    lq.includes("أم") ||
    lq.includes("أب")
  )
    return "family";
  if (lq.includes("lost") || lq.includes("miss") || lq.includes("gone") || lq.includes("perdu") || lq.includes("فقد"))
    return "loss";
  return "default";
};

const estimateFileSize = (s: number, audio: boolean): string => {
  const b = audio ? (AUDIO_BITRATE / 8) * s : ((VIDEO_BITRATE + AUDIO_BITRATE) / 8) * s;
  const mb = b / (1024 * 1024);
  return mb < 1 ? Math.round(mb * 1000) + " KB" : mb.toFixed(1) + " MB";
};

const capturePosterFrame = (el: HTMLVideoElement): Promise<Blob | null> =>
  new Promise((r) => {
    try {
      const c = document.createElement("canvas");
      c.width = 320;
      c.height = 180;
      const x = c.getContext("2d");
      if (!x) {
        r(null);
        return;
      }
      x.drawImage(el, 0, 0, 320, 180);
      c.toBlob((b) => r(b), "image/jpeg", 0.7);
    } catch {
      r(null);
    }
  });

type Stage =
  | "question"
  | "countdown"
  | "recording"
  | "preview"
  | "uploading"
  | "followup"
  | "thumbnail"
  | "title"
  | "visibility"
  | "share";
interface MemoryClip {
  blob: Blob;
  question: string;
  posterBlob: Blob | null;
}

const Record = () => {
  const navigate = useNavigate();
  const loc = useLocation();
  const { t, lang, rtl } = useLanguage();
  const userName = useUserName();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const hardCapRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clipsRef = useRef<MemoryClip[]>([]);
  const fileUrlRef = useRef("");
  const thumbUrlRef = useRef("");
  const typeRef = useRef("video");
  const userIdRef = useRef("");
  const followupRef = useRef(false);
  const questionRef = useRef("");
  const posterRef = useRef<Blob | null>(null);
  const fromSparkRef = useRef(false);
  const sparkRewardRef = useRef(0);
  const isCommunityRef = useRef(false);
  const isAnonymousRef = useRef(false);
  const posterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thumbScrollRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef(false);

  const [stage, setStage] = useState<Stage>("question");
  const [mr, setMR] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [followIdx, setFollowIdx] = useState(0);
  const [memoryTitle, setTitle] = useState("");
  const [audioMode, setAudioMode] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [estSize, setEstSize] = useState("0 KB");
  const [showShareModal, setShowShareModal] = useState(false);
  const [localBlob, setLocalBlob] = useState<Blob | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [customThumb, setCustomThumb] = useState<string | null>(null);
  const [useAsAura, setUseAsAura] = useState(false);

  const question = loc.state?.question || "What smell instantly brings you back to your childhood home?";
  const theme = getTheme(question);
  const followups =
    FOLLOWUP_QUESTIONS[lang as keyof typeof FOLLOWUP_QUESTIONS]?.[theme as keyof typeof FOLLOWUP_QUESTIONS.en] ??
    FOLLOWUP_QUESTIONS.en.default;
  const thumbCards = getThematicCards(question);

  useEffect(() => {
    if (loc.state?.fromSpark) fromSparkRef.current = true;
  }, [loc.state]);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setHasSession(!!session));
  }, []);
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(animRef.current);
      if (hardCapRef.current) clearTimeout(hardCapRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (localUrl) URL.revokeObjectURL(localUrl);
      if (posterTimerRef.current) clearTimeout(posterTimerRef.current);
    };
  }, [stream, localUrl]);
  useEffect(() => {
    if (!audioMode || stage !== "recording") return;
    const c = canvasRef.current;
    const a = analyserRef.current;
    if (!c || !a) return;
    const x = c.getContext("2d")!;
    const b = new Uint8Array(a.frequencyBinCount);
    const d = () => {
      animRef.current = requestAnimationFrame(d);
      a.getByteTimeDomainData(b);
      x.clearRect(0, 0, c.width, c.height);
      x.lineWidth = 3;
      x.strokeStyle = "#E8742A";
      x.shadowBlur = 15;
      x.shadowColor = "#E8742A";
      x.beginPath();
      const sw = c.width / b.length;
      let px = 0;
      for (let i = 0; i < b.length; i++) {
        const y = ((b[i] / 128) * c.height) / 2;
        i === 0 ? x.moveTo(px, y) : x.lineTo(px, y);
        px += sw;
      }
      x.lineTo(c.width, c.height / 2);
      x.stroke();
    };
    d();
    return () => cancelAnimationFrame(animRef.current);
  }, [audioMode, stage]);
  useEffect(() => {
    if (stage === "preview" && previewReady && !audioMode && videoRef.current && localUrl) {
      videoRef.current.srcObject = null;
      videoRef.current.src = localUrl;
      videoRef.current.controls = true;
      videoRef.current.loop = false;
      videoRef.current.muted = false;
      videoRef.current.autoplay = false;
      videoRef.current.playsInline = true;
    }
  }, [stage, previewReady, audioMode, localUrl]);

  const getMimeType = (a: boolean) => {
    if (a) {
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) return "audio/webm;codecs=opus";
      if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
      return "audio/webm";
    }
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) return "video/webm;codecs=vp9";
    if (MediaRecorder.isTypeSupported("video/webm")) return "video/webm";
    if (MediaRecorder.isTypeSupported("video/mp4")) return "video/mp4";
    return "video/webm";
  };

  const startMedia = async (a: boolean) => {
    try {
      const c = a
        ? { audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 } }
        : {
            video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
            audio: { echoCancellation: true, noiseSuppression: true },
          };
      const s = await navigator.mediaDevices.getUserMedia(c);
      setStream(s);
      if (!a && videoRef.current) videoRef.current.srcObject = s;
      if (a) {
        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(s);
        const an = ctx.createAnalyser();
        an.fftSize = 256;
        src.connect(an);
        analyserRef.current = an;
      }
      const m = getMimeType(a);
      const r = new MediaRecorder(s, {
        mimeType: m,
        videoBitsPerSecond: VIDEO_BITRATE,
        audioBitsPerSecond: AUDIO_BITRATE,
      });
      r.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      setMR(r);
    } catch {
      toast.error("Microphone not accessible.");
    }
  };

  const startCountdown = (ff = false) => {
    followupRef.current = ff;
    const q = ff ? followups[Math.min(followIdx, followups.length - 1)] : question;
    questionRef.current = q;
    setStage("countdown");
    setCountdown(3);
    const tmr = setInterval(() => {
      setCountdown((p) => {
        if (p === 1) {
          clearInterval(tmr);
          chunksRef.current = [];
          mr?.start(100);
          setStage("recording");
          setElapsed(0);
          setEstSize("0 KB");
          elapsedRef.current = setInterval(() => {
            setElapsed((e) => {
              const n = e + 1;
              setEstSize(estimateFileSize(n, audioMode));
              return n;
            });
          }, 1000);
          hardCapRef.current = setTimeout(() => {
            handleStop();
          }, MAX_DURATION_SECONDS * 1000);
          posterTimerRef.current = setTimeout(async () => {
            if (!audioMode && videoRef.current) {
              const bl = await capturePosterFrame(videoRef.current);
              if (bl) posterRef.current = bl;
            }
          }, 2000);
          return 3;
        }
        return p - 1;
      });
    }, 1000);
  };

  const handleStop = async () => {
    if (!mr) return;
    if (hardCapRef.current) clearTimeout(hardCapRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    cancelAnimationFrame(animRef.current);
    mr.requestData();
    mr.onstop = () => {
      try {
        const m = getMimeType(audioMode);
        const bl = new Blob(chunksRef.current, { type: m });
        if (bl.size === 0) {
          toast.error("Nothing recorded.");
          setStage("recording");
          return;
        }
        setLocalBlob(bl);
        const u = URL.createObjectURL(bl);
        setLocalUrl(u);
        setPreviewReady(true);
        setStage("preview");
      } catch (err) {
        console.error(err);
        toast.error("Error preparing preview.");
        setStage("recording");
      }
    };
    mr.stop();
  };
  const handleRetake = () => {
    if (localUrl) URL.revokeObjectURL(localUrl);
    setLocalUrl(null);
    chunksRef.current = [];
    setStage("question");
  };
  const handleUpload = () => {
    if (!localBlob) return;
    setPreviewReady(false);
    clipsRef.current.push({ blob: localBlob, question: questionRef.current, posterBlob: posterRef.current });
    setStage("uploading");
    setTimeout(() => setStage("thumbnail"), 300);
  };

  const handleThumbSelect = (idx: number) => {
    setSelectedThumb(idx);
    setCustomThumb(null);
    if (thumbScrollRef.current) {
      const cw = thumbScrollRef.current.children[0]?.clientWidth || 200;
      thumbScrollRef.current.scrollTo({ left: idx * (cw + 12), behavior: "smooth" });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const u = URL.createObjectURL(f);
      setCustomThumb(u);
    }
  };

  const handleThumbValidate = () => {
    auraRef.current = useAsAura;
    if (customThumb) {
      const img = new Image();
      img.src = customThumb;
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = 320;
        c.height = 180;
        const x = c.getContext("2d")!;
        x.drawImage(img, 0, 0, 320, 180);
        c.toBlob(
          (b) => {
            if (b) posterRef.current = b;
          },
          "image/jpeg",
          0.7,
        );
      };
    } else if (!audioMode && posterRef.current) {
    } else {
      imageUrlToBlob(thumbCards[selectedThumb]).then((b) => {
        posterRef.current = b;
      });
    }
    setTitle(generateTitleFromQuestion(question));
    setStage("title");
  };

  const uploadAllClips = async (): Promise<string[]> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const uid = session?.user?.id || "anonymous";
    userIdRef.current = uid;
    const urls: string[] = [];
    for (const cl of clipsRef.current) {
      const m = getMimeType(audioMode);
      const ts = Date.now() + Math.random();
      const ext = m.includes("mp4") ? "mp4" : "webm";
      const fn = uid + "/" + ts + "_memory." + ext;
      const pn = uid + "/" + ts + "_poster.jpg";
      try {
        const { data, error } = await supabase.storage
          .from("memories")
          .upload(fn, cl.blob, { contentType: m, upsert: true });
        if (error) {
          console.error("Upload err:", error);
          continue;
        }
        const { data: ud } = supabase.storage.from("memories").getPublicUrl(fn);
        if (ud?.publicUrl) urls.push(ud.publicUrl);
        thumbUrlRef.current = "";
        if (cl.posterBlob) {
          const { data: pd } = await supabase.storage
            .from("memories")
            .upload(pn, cl.posterBlob, { contentType: "image/jpeg", upsert: true });
          if (pd) {
            const { data: td } = supabase.storage.from("memories").getPublicUrl(pn);
            if (td?.publicUrl) thumbUrlRef.current = td.publicUrl;
          }
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
    return urls;
  };

  const handleVisibilityChoice = (ch: "family" | "community" | "anonymous") => {
    if (ch === "family") {
      isCommunityRef.current = false;
      isAnonymousRef.current = false;
      sparkRewardRef.current = 0;
    } else if (ch === "community") {
      isCommunityRef.current = true;
      isAnonymousRef.current = false;
      sparkRewardRef.current = 2;
    } else {
      isCommunityRef.current = true;
      isAnonymousRef.current = true;
      sparkRewardRef.current = 2;
    }
    setStage("share");
  };

  const handleShare = async (type: "circle" | "public" | "private") => {
    stream?.getTracks().forEach((t) => t.stop());
    try {
      const urls = await uploadAllClips();
      if (urls.length === 0) {
        toast.error("Upload failed.");
        setStage("share");
        return;
      }
      fileUrlRef.current = urls[urls.length - 1];
      typeRef.current = audioMode ? "audio" : "video";
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (uid && uid !== "anonymous") {
        userIdRef.current = uid;
        const ips = urls.map((u) =>
          (supabase.from("memories") as any)
            .insert({
              user_id: uid,
              title: memoryTitle || "A memory",
              description: null,
              file_url: u,
              file_type: typeRef.current,
              thumbnail_url: thumbUrlRef.current || null,
              timeline: "memories",
              is_public: isCommunityRef.current,
              is_community: isCommunityRef.current,
              is_anonymous: isAnonymousRef.current,
              spark_reward: sparkRewardRef.current,
              background_image_url: auraRef.current ? customThumb || thumbCards[selectedThumb] : null,
              aura_intensity: auraRef.current ? 35 : null,
              created_at: new Date().toISOString(),
            })
            .select("id"),
        );
        const res = await Promise.all(ips);
        const errs = res.filter((r) => r.error);
        if (errs.length > 0) {
          console.error("Insert errors:", errs);
          toast.error("Error saving.");
          setStage("share");
          return;
        }

        // First-memory welcome toast
        try {
          const { count } = await supabase
            .from("memories")
            .select("*", { count: "exact", head: true })
            .eq("user_id", uid);
          if (count === 1) {
            const who = userName || (lang === "fr" ? "toi" : lang === "ar" ? "أنت" : "you");
            const msg =
              lang === "fr"
                ? `${who}, ton premier souvenir est préservé pour toujours. ✦`
                : lang === "ar"
                  ? `${who}، ذكراك الأولى محفوظة للأبد. ✦`
                  : `${who}, your first memory is preserved forever. ✦`;
            toast.success(msg, { duration: 5000 });
          }
        } catch (e) {
          console.error("First-memory count failed:", e);
        }

        // Notify the user's circle(s) about the new memory
        try {
          const insertedIds = res.map((r: any) => r?.data?.[0]?.id).filter(Boolean) as string[];
          const newMemoryId = insertedIds[insertedIds.length - 1] || null;
          if (type === "circle" || type === "public") {
            const { data: memberships } = await supabase.from("circle_members").select("circle_id").eq("user_id", uid);
            if (memberships?.length) {
              const msg =
                lang === "fr"
                  ? `${userName || "Quelqu'un"} a laissé quelque chose pour vous.`
                  : lang === "ar"
                    ? `${userName || "شخص ما"} ترك شيئاً لكم.`
                    : `${userName || "Someone"} left something for you.`;
              await Promise.all(
                memberships.map((m: { circle_id: string }) =>
                  supabase.from("notifications").insert({
                    circle_id: m.circle_id,
                    from_user_id: uid,
                    memory_id: newMemoryId,
                    message: msg,
                  }),
                ),
              );
            }
          }
        } catch (notifErr) {
          console.error("Notification insert failed:", notifErr);
        }
      }
      if (fromSparkRef.current || sparkRewardRef.current > 0) {
        const bal = Number(localStorage.getItem("infeelit_spark_balance") || 0);
        const tot = sparkRewardRef.current + (fromSparkRef.current ? 1 : 0);
        localStorage.setItem("infeelit_spark_balance", String(bal + tot));
        fromSparkRef.current = false;
        toast.success(
          userName
            ? lang === "ar"
              ? `${userName}، صوتك للتو عبر العالم. ✦ +${tot}`
              : lang === "fr"
                ? `${userName}, ta voix vient de traverser le monde. ✦ +${tot}`
                : `${userName}, your voice just crossed the world. ✦ +${tot}`
            : lang === "ar"
              ? `صوتك للتو عبر العالم. ✦ +${tot}`
              : lang === "fr"
                ? `Ta voix vient de traverser le monde. ✦ +${tot}`
                : `Your voice just crossed the world. ✦ +${tot}`,
          { duration: 4000 },
        );
      }
      if (!hasSession) {
        setStage("share");
        return;
      }
      if (type === "private") {
        navigate("/treasure", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
      setStage("share");
    }
  };

  const handleNativeShare = async () => {
    const all = clipsRef.current.map((c) => c.blob);
    const cb = new Blob(all, { type: getMimeType(audioMode) });
    const topic = memoryTitle || "un souvenir précieux";
    const txt =
      lang === "fr"
        ? `${userName || "Quelqu'un"} a raconté ${topic}. Certains souvenirs méritent de durer. Découvre son histoire sur Infeelit.`
        : lang === "ar"
          ? `${userName || "شخص ما"} حكى ${topic}. بعض الذكريات تستحق أن تدوم. اكتشف قصته على Infeelit.`
          : `${userName || "Someone"} shared ${topic}. Some memories deserve to last forever. Discover their story on Infeelit.`;
    const url = "https://infeelit.com";
    if (navigator.canShare && cb.size > 0) {
      const f = new File([cb], "memory." + (audioMode ? "webm" : "mp4"), { type: cb.type });
      if (navigator.canShare({ files: [f] })) {
        try {
          await navigator.share({ title: memoryTitle || "A memory on Infeelit", text: txt, files: [f] });
          return;
        } catch (er: any) {
          if (er?.name === "AbortError") return;
        }
      }
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: memoryTitle || "A memory on Infeelit", text: txt, url });
      } catch (er: any) {
        if (er?.name === "AbortError") return;
        navigator.clipboard.writeText(txt + " " + url);
        toast.success(lang === "ar" ? "تم نسخ الرابط!" : lang === "fr" ? "Lien copié !" : "Link copied!");
      }
    } else {
      navigator.clipboard.writeText(txt + " " + url);
      toast.success(lang === "ar" ? "تم نسخ الرابط!" : lang === "fr" ? "Lien copié !" : "Link copied!");
    }
  };

  const handleDownload = () => {
    const all = clipsRef.current.map((c) => c.blob);
    const cb = new Blob(all, { type: getMimeType(audioMode) });
    if (cb.size === 0) return;
    const u = URL.createObjectURL(cb);
    const a = document.createElement("a");
    a.href = u;
    a.download = "infeelit-memory-" + Date.now() + "." + (audioMode ? "webm" : "mp4");
    a.click();
    URL.revokeObjectURL(u);
  };

  const formatTime = (s: number) => Math.floor(s / 60) + ":" + (s % 60).toString().padStart(2, "0");
  const timerColor = elapsed >= 150 ? "#EF4444" : elapsed >= 120 ? "#F97316" : "#FFFFFF";

  return (
    <div
      className="min-h-screen bg-black flex flex-col relative overflow-hidden font-sans"
      dir={rtl ? "rtl" : "ltr"}
      style={{
        background: "linear-gradient(160deg, #1A3B47 0%, #2D5A4F 30%, #3D2B1F 70%, #E8742A 100%)",
      }}
    >
      {!audioMode && stage !== "preview" && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500 " +
            (stage === "recording" ? "opacity-80" : "opacity-20")
          }
        />
      )}
      {stage === "preview" && !audioMode && (
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-90" />
      )}
      {audioMode && stage !== "preview" && (
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(160deg, #1A3B47 0%, #2D5A4F 30%, #3D2B1F 70%, #E8742A 100%)",
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />

      {/* Stage Question avec image thématique */}
      {stage === "question" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${thumbCards[0]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.08,
            filter: "blur(20px) sepia(50%)",
            zIndex: 0,
          }}
        />
      )}

      <div className="relative z-10 p-6 flex justify-between items-center">
        <button
          onClick={() => {
            stream?.getTracks().forEach((t) => t.stop());
            if (localUrl) URL.revokeObjectURL(localUrl);
            navigate(-1);
          }}
          className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20"
        >
          <X size={24} />
        </button>
        <div className="flex items-center gap-3">
          {stage === "recording" && (
            <div className="flex flex-col items-end gap-0.5">
              <span className="font-black text-lg tabular-nums" style={{ color: timerColor }}>
                {formatTime(elapsed)} / 3:00
              </span>
              <span className="text-[10px] text-white/40 tabular-nums">~{estSize}</span>
            </div>
          )}
          {(stage === "recording" || stage === "countdown") && (
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
              {audioMode ? (
                <Mic size={14} className="text-[#E8742A]" />
              ) : (
                <Video size={14} className="text-[#E8742A]" />
              )}
              <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest">
                {audioMode ? t.voiceLabel : t.videoLabel}
              </span>
            </div>
          )}
        </div>
      </div>
      {stage === "question" && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em]">{t.yourStory}</p>
          <h2 className="text-white text-2xl font-bold leading-tight italic">"{question}"</h2>
          {userName && (
            <p
              style={{
                color: "#E8742A",
                fontSize: "12px",
                fontStyle: "italic",
                fontFamily: "Georgia,serif",
                textAlign: "center",
                marginTop: "8px",
              }}
            >
              {lang === "fr"
                ? `${userName}, raconte-leur.`
                : lang === "ar"
                  ? `${userName}، احكِ لهم.`
                  : `${userName}, tell them.`}
            </p>
          )}
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
              onClick={() => startCountdown(false)}
              className="mt-2 px-10 py-4 rounded-full gradient-orange font-bold text-lg"
              style={{ color: "#fff" }}
            >
              {t.imReady}
            </button>
          )}
        </div>
      )}
      {stage === "countdown" && (
        <div className="relative z-20 flex-1 flex items-center justify-center">
          <div className="text-white text-9xl font-black animate-pulse">{countdown}</div>
        </div>
      )}
      {stage === "recording" && (
        <>
          <div className="relative z-10 flex justify-end px-6 -mt-16">
            <div className="flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span className="text-[10px] text-white font-black uppercase tracking-widest">
                {audioMode ? t.listening : t.recording}
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
            <h2 className="text-white text-lg font-bold leading-tight italic opacity-60">"{questionRef.current}"</h2>
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
      {stage === "preview" && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em]">
            {lang === "ar"
              ? "استمع قبل الحفظ..."
              : lang === "fr"
                ? "Réécoutez avant de garder..."
                : "Listen before keeping..."}
          </p>
          <h2 className="text-white text-xl font-bold leading-tight italic mb-2">"{questionRef.current}"</h2>
          {audioMode ? (
            <audio src={localUrl || undefined} controls style={{ width: "100%" }} autoPlay />
          ) : (
            <video
              src={localUrl || undefined}
              controls
              style={{ width: "100%", borderRadius: "16px" }}
              autoPlay
              playsInline
            />
          )}
          <div className="flex gap-4 w-full max-w-xs mt-4">
            <button
              onClick={handleRetake}
              className="flex-1 py-4 rounded-full bg-white/10 text-white font-bold text-base border border-white/20 flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              {lang === "ar" ? "حاول مجدداً" : lang === "fr" ? "Recommencer" : "Try again"}
            </button>
            <button
              onClick={handleUpload}
              className="flex-1 py-4 rounded-full gradient-orange text-white font-bold text-base flex items-center justify-center gap-2"
              style={{ color: "#fff" }}
            >
              <Check size={18} />
              {lang === "ar" ? "هذا رائع ✦" : lang === "fr" ? "C'est parfait ✦" : "This is perfect ✦"}
            </button>
          </div>
        </div>
      )}
      {stage === "uploading" && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center gap-6">
          <Loader2 size={48} className="text-[#E8742A] animate-spin" />
          <p className="text-white text-sm font-bold uppercase tracking-widest">{t.weaving}</p>
          <p className="text-white/40 text-xs">~{estSize}</p>
        </div>
      )}
      {stage === "thumbnail" && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
          <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em]">
            {lang === "ar"
              ? "اختر صورة لهذه الذكرى"
              : lang === "fr"
                ? "Quelle image pour ce souvenir ?"
                : "Choose an image for this memory"}
          </p>
          <div
            ref={thumbScrollRef}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 max-w-full hide-scroll"
            style={{ scrollbarWidth: "none" }}
          >
            {thumbCards.map((img, idx) => {
              const isSel = selectedThumb === idx && !customThumb;
              return (
                <button
                  key={idx}
                  onClick={() => handleThumbSelect(idx)}
                  className={`snap-center shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${isSel ? "border-[#E8742A] scale-105 shadow-[0_0_24px_rgba(232,116,42,0.5)]" : "border-transparent opacity-70"}`}
                  style={{ width: "180px", height: "180px", transform: `rotate(${(idx - 1) * 4}deg)` }}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ filter: "sepia(40%) brightness(0.85)" }}
                  />
                </button>
              );
            })}
            {customThumb && (
              <button
                onClick={() => {
                  setCustomThumb(null);
                  setSelectedThumb(0);
                }}
                className="snap-center shrink-0 rounded-2xl overflow-hidden border-2 border-[#E8742A] scale-105 shadow-[0_0_24px_rgba(232,116,42,0.5)]"
                style={{ width: "180px", height: "180px" }}
              >
                <img src={customThumb} alt="" className="w-full h-full object-cover" />
              </button>
            )}
          </div>
          <label className="flex items-center gap-2 text-white/40 text-xs cursor-pointer hover:text-white/60 transition-colors">
            <Camera size={14} />
            {lang === "ar" ? "📷 استخدام صورتي" : lang === "fr" ? "📷 Utiliser ma photo" : "📷 Use my photo"}
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderRadius: "14px",
              backgroundColor: "rgba(232,116,42,0.08)",
              border: "1px solid rgba(232,116,42,0.2)",
              marginTop: "16px",
              width: "100%",
              maxWidth: "320px",
            }}
          >
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>
                {lang === "fr"
                  ? "Montrer pendant ta vidéo"
                  : lang === "ar"
                    ? "إظهارها خلال الفيديو"
                    : "Show during your video"}
              </p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                {lang === "fr"
                  ? "L'image apparaîtra derrière toi"
                  : lang === "ar"
                    ? "ستظهر الصورة خلفك"
                    : "The image will appear behind you"}
              </p>
            </div>
            <button
              onClick={() => setUseAsAura(!useAsAura)}
              style={{
                width: "48px",
                height: "26px",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                transition: "background 0.2s",
                backgroundColor: useAsAura ? "#E8742A" : "rgba(255,255,255,0.2)",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "3px",
                  left: useAsAura ? "25px" : "3px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}
              />
            </button>
          </div>
          <button
            onClick={handleThumbValidate}
            className="w-full max-w-xs py-4 rounded-full font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
            style={{
              background: "linear-gradient(135deg, #E8742A, #D4621A)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(232,116,42,0.3)",
            }}
          >
            {lang === "ar" ? "اختيار هذه الصورة" : lang === "fr" ? "Choisir cette image" : "Choose this image"}
          </button>
        </div>
      )}
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
            onClick={() => setStage("visibility")}
            className="w-full max-w-xs py-4 rounded-full gradient-orange font-bold text-base flex items-center justify-center gap-2"
            style={{ color: "#fff" }}
          >
            <Share2 size={18} /> {t.shareMemory}
          </button>
        </div>
      )}
      {stage === "visibility" && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
          <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em]">
            {lang === "ar"
              ? userName
                ? `${userName}، لمن هذا الصوت؟`
                : "لمن هذا الصوت؟"
              : lang === "fr"
                ? userName
                  ? `${userName}, à qui appartient cette voix ?`
                  : "À qui appartient cette voix ?"
                : userName
                  ? `${userName}, who is this voice for?`
                  : "Who is this voice for?"}
          </p>
          <button
            onClick={() => handleVisibilityChoice("family")}
            className="w-full max-w-xs py-4 rounded-full font-bold text-base flex items-center justify-center gap-3"
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Lock size={18} />
            {lang === "ar" ? "لعائلتي فقط." : lang === "fr" ? "Pour ma famille uniquement." : "For my family only."}
          </button>
          <button
            onClick={() => handleVisibilityChoice("community")}
            className="w-full max-w-xs py-4 rounded-full font-bold text-base flex items-center justify-center gap-3"
            style={{
              background: "linear-gradient(135deg,#E8742A,#D4621A)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(232,116,42,0.3)",
            }}
          >
            <Users size={18} />
            {lang === "ar"
              ? "لمن فقدوا صوتاً أيضاً."
              : lang === "fr"
                ? "Pour ceux qui ont aussi perdu une voix."
                : "For those who also lost a voice."}
          </button>
          <button
            onClick={() => handleVisibilityChoice("anonymous")}
            className="w-full max-w-xs py-4 rounded-full font-bold text-base flex items-center justify-center gap-3"
            style={{ backgroundColor: "rgba(107,78,155,0.3)", color: "#fff", border: "1px solid rgba(107,78,155,0.4)" }}
          >
            <UserPlus size={18} />
            {lang === "ar"
              ? "للجميع، دون كشف هويتي."
              : lang === "fr"
                ? "Pour tout le monde, anonymement."
                : "For everyone, anonymously."}
          </button>
        </div>
      )}
      {stage === "share" && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
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
          <div className="flex items-center gap-3 w-full max-w-xs my-1">
            <div className="flex-1 h-px bg-white/15" />
            <span className="text-white/30 text-xs uppercase tracking-widest">
              {lang === "ar" ? "أو" : lang === "fr" ? "ou" : "or"}
            </span>
            <div className="flex-1 h-px bg-white/15" />
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="w-full max-w-xs py-4 rounded-full font-bold text-base flex items-center justify-center gap-2"
            style={{
              backgroundColor: "rgba(255,255,255,.12)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.2)",
            }}
          >
            <Share2 size={18} />
            {lang === "ar"
              ? "مشاركة على وسائل التواصل"
              : lang === "fr"
                ? "Partager sur les réseaux"
                : "Share on social media"}
          </button>
          <button
            onClick={handleDownload}
            className="w-full max-w-xs py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2"
            style={{ color: "rgba(255,255,255,.4)" }}
          >
            <Download size={16} />
            {lang === "ar" ? "تحميل الذكرى" : lang === "fr" ? "Télécharger le souvenir" : "Download memory"}
          </button>
        </div>
      )}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={memoryTitle || "A memory"}
        url={fileUrlRef.current || "https://infeelit.com"}
        text={`I preserved a memory on Infeelit: "${memoryTitle}"`}
      />
    </div>
  );
};

export default Record;
