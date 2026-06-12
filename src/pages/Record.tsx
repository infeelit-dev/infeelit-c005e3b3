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
import MemoryCard from "@/components/MemoryCard";
import html2canvas from "html2canvas";
import { CHAPTERS } from "@/data/questions";

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

const getFollowupsFromQuestion = (questionText: string, lang: string, name: string): string[] => {
  for (const chapter of CHAPTERS) {
    for (const category of chapter.categories) {
      for (const q of category.questions) {
        const qText = q.fr.replace("{name}", "").trim();
        const inputText = questionText.replace(name, "").trim();
        if (qText === inputText || q.en.replace("{name}", "").trim() === inputText) {
          const langKey = lang as "fr" | "en" | "ar";
          const followupsKey = `followups_${langKey}` as keyof typeof q;
          return (q[followupsKey] as string[]) || [];
        }
      }
    }
  }
  if (lang === "fr") {
    return [
      "Qui était là avec toi à ce moment-là ?",
      "C'est quoi le détail que tu n'as jamais oublié ?",
      "Qu'est-ce que ce souvenir t'a appris sur toi ?",
    ];
  } else if (lang === "ar") {
    return ["مَن كان معك في تلك اللحظة؟", "ما التفصيل الذي لم تنسَه أبداً؟", "ماذا علّمك هذا الذكرى عن نفسك؟"];
  } else {
    return [
      "Who was with you at that moment?",
      "What's the detail you've never forgotten?",
      "What did this memory teach you about yourself?",
    ];
  }
};

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
  const cardRef = useRef<HTMLDivElement>(null);

  const [stage, setStage] = useState<Stage>("question");
  const [mr, setMR] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [followupIdx, setFollowIdx] = useState(0);
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

  const [followupQuestions, setFollowupQuestions] = useState<string[]>([]);

  const question = loc.state?.question || "What smell instantly brings you back to your childhood home?";
  const thumbCards = getThematicCards(question);
  const auraBackground = useAsAura ? customThumb || thumbCards[selectedThumb] : null;

  useEffect(() => {
    const displayName = userName || (lang === "fr" ? "ami(e)" : lang === "ar" ? "صديقي" : "friend");
    const followups = getFollowupsFromQuestion(question, lang, displayName);
    setFollowupQuestions(followups);
  }, [question, lang, userName]);

  useEffect(() => {
    if (stage === "recording" && followupQuestions.length > 0) {
      const t1 = setTimeout(() => setFollowIdx(1), 20000);
      const t2 = setTimeout(() => setFollowIdx(2), 45000);
      const t3 = setTimeout(() => setFollowIdx(3), 70000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [stage, followupQuestions]);

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
    const q = ff ? followupQuestions[Math.min(followupIdx, followupQuestions.length - 1)] : question;
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

  const generateCardImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 1);
      });
    } catch (err) {
      console.error("Error generating card image:", err);
      return null;
    }
  };

  const handleShareToWhatsApp = async () => {
    const blob = await generateCardImage();
    if (!blob) {
      toast.error(lang === "fr" ? "Erreur lors de la génération de l'image" : "Error generating image");
      return;
    }

    const file = new File([blob], "infeelit-memory.png", { type: "image/png" });
    const text =
      lang === "fr"
        ? `J'ai préservé un souvenir de notre famille sur Infeelit. Écoute et ajoute le tien : https://infeelit.com`
        : lang === "ar"
          ? `حفظت ذكرى عائلية على Infeelit. استمع وأضف ذكراك: https://infeelit.com`
          : `I preserved a family memory on Infeelit. Listen and add yours: https://infeelit.com`;

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: memoryTitle,
          text: text,
        });
        return;
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Share error:", err);
        }
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "infeelit-memory.png";
    a.click();
    URL.revokeObjectURL(url);
    await navigator.clipboard.writeText(text);
    toast.success(lang === "fr" ? "Image téléchargée et lien copié" : "Image downloaded and link copied");
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

  const estimateFileSize = (s: number, audio: boolean): string => {
    const b = audio ? (AUDIO_BITRATE / 8) * s : ((VIDEO_BITRATE + AUDIO_BITRATE) / 8) * s;
    const mb = b / (1024 * 1024);
    return mb < 1 ? Math.round(mb * 1000) + " KB" : mb.toFixed(1) + " MB";
  };

  const formatTime = (s: number) => Math.floor(s / 60) + ":" + (s % 60).toString().padStart(2, "0");
  const timerColor = elapsed >= 150 ? "#EF4444" : elapsed >= 120 ? "#F97316" : "#FFFFFF";

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden font-sans" dir={rtl ? "rtl" : "ltr"}>
      <style>{`
        @keyframes ambientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {stage === "recording" && (
        <div className="absolute inset-0 z-0">
          {auraBackground ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${auraBackground})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(20px) brightness(0.5) sepia(20%)",
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, #2D1810 0%, #8B4513 25%, #D4621A 50%, #8B4513 75%, #2D1810 100%)",
                backgroundSize: "400% 400%",
                animation: "ambientShift 8s ease infinite",
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)",
            }}
          />
        </div>
      )}

      {!audioMode && stage !== "recording" && stage !== "preview" && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${stage === "recording" ? "opacity-80" : "opacity-20"}`}
        />
      )}
      {stage === "preview" && !audioMode && (
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-90" />
      )}
      {audioMode && stage !== "recording" && stage !== "preview" && (
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(160deg, #1A3B47 0%, #2D5A4F 30%, #3D2B1F 70%, #E8742A 100%)",
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />

      {stage === "recording" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "56px 24px 20px",
            background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
            zIndex: 5,
          }}
        >
          <p
            style={{
              fontSize: "18px",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              color: "#fff",
              textAlign: "center",
              lineHeight: 1.5,
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            }}
          >
            "{questionRef.current}"
          </p>
        </div>
      )}

      {stage === "recording" && (
        <div
          style={{
            position: "absolute",
            top: "56px",
            right: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#ef4444",
              animation: "blink 1s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.7)",
              fontWeight: 600,
              letterSpacing: "0.1em",
            }}
          >
            REC
          </span>
          <span
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "monospace",
            }}
          >
            {formatTime(elapsed)} / 3:00
          </span>
        </div>
      )}

      {stage === "recording" && followupIdx > 0 && followupIdx <= followupQuestions.length && (
        <div
          style={{
            position: "absolute",
            bottom: "120px",
            left: "16px",
            right: "16px",
            padding: "16px 20px",
            background: "rgba(0,0,0,0.75)",
            borderRadius: "16px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            zIndex: 5,
            animation: "slideUp 0.5s ease",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              color: "rgba(232,116,42,0.8)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            ✦ {lang === "fr" ? "Question suivante" : lang === "ar" ? "السؤال التالي" : "Next question"}
          </p>
          <p
            style={{
              fontSize: "16px",
              color: "#fff",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              lineHeight: 1.5,
            }}
          >
            {followupQuestions[followupIdx - 1]}
          </p>
        </div>
      )}

      {stage === "recording" && (
        <button
          onClick={handleStop}
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(220,38,38,0.9)",
            border: "4px solid rgba(255,255,255,0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 30px rgba(220,38,38,0.5)",
            zIndex: 10,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateX(-50%) scale(1.05)";
            e.currentTarget.style.background = "rgba(220,38,38,1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateX(-50%) scale(1)";
            e.currentTarget.style.background = "rgba(220,38,38,0.9)";
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "4px",
              backgroundColor: "#fff",
            }}
          />
        </button>
      )}

      {stage === "recording" && audioMode && (
        <div
          style={{
            position: "absolute",
            bottom: "180px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "200px",
            height: "60px",
            zIndex: 5,
          }}
        >
          <canvas ref={canvasRef} width={200} height={60} style={{ width: "100%", opacity: 0.8 }} />
        </div>
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
          {stage === "countdown" && (
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
        <>
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
        </>
      )}

      {stage === "countdown" && (
        <div className="relative z-20 flex-1 flex items-center justify-center">
          <div
            className="text-white text-9xl font-black animate-pulse"
            style={{
              textShadow: "0 0 30px rgba(232,116,42,0.5)",
            }}
          >
            {countdown}
          </div>
        </div>
      )}

      {stage === "followup" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #2D1810 0%, #8B4513 50%, #D4621A 100%)",
            padding: "24px",
            textAlign: "center",
            zIndex: 20,
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.3em",
              color: "rgba(255,210,80,0.7)",
              textTransform: "uppercase",
              marginBottom: "24px",
            }}
          >
            {followupIdx + 1} / {followupQuestions.length}
          </p>
          <p
            style={{
              fontSize: "20px",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              color: "#fff",
              lineHeight: 1.6,
              maxWidth: "340px",
              marginBottom: "48px",
            }}
          >
            "{followupQuestions[followupIdx]}"
          </p>
          <button
            onClick={() => {
              if (followupIdx < followupQuestions.length - 1) {
                setFollowIdx(followupIdx + 1);
                setStage("recording");
              } else {
                setStage("title");
              }
            }}
            style={{
              padding: "16px 32px",
              borderRadius: "999px",
              background: "linear-gradient(135deg, #E8742A, #D4621A)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(232,116,42,0.4)",
            }}
          >
            {followupIdx < followupQuestions.length - 1
              ? lang === "fr"
                ? "Question suivante →"
                : lang === "ar"
                  ? "السؤال التالي →"
                  : "Next question →"
              : lang === "fr"
                ? "Terminer ✓"
                : lang === "ar"
                  ? "إنهاء ✓"
                  : "Finish ✓"}
          </button>
        </div>
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
          <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em]">
            {lang === "fr"
              ? "Ta carte mémoire est prête"
              : lang === "ar"
                ? "بطاقة ذاكرتك جاهزة"
                : "Your memory card is ready"}
          </p>
          <h2 className="text-white text-lg font-bold leading-tight italic mb-2">"{memoryTitle}"</h2>

          <MemoryCard
            ref={cardRef}
            title={memoryTitle}
            authorName={userName || (lang === "fr" ? "Quelqu'un" : lang === "ar" ? "شخص ما" : "Someone")}
            city={undefined}
            familyName={undefined}
            memoryNumber={undefined}
            backgroundImage={thumbUrlRef.current || undefined}
            lang={lang}
          />

          <button
            onClick={handleShareToWhatsApp}
            style={{
              width: "100%",
              maxWidth: "320px",
              padding: "16px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #25D366, #128C7E)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "15px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginTop: "16px",
            }}
          >
            <span style={{ fontSize: "20px" }}>📱</span>
            {lang === "fr" ? "Envoyer à ma famille" : lang === "ar" ? "أرسل لعائلتي" : "Send to my family"}
          </button>

          <button
            onClick={handleNativeShare}
            style={{
              width: "100%",
              maxWidth: "320px",
              padding: "14px",
              borderRadius: "16px",
              background: "none",
              border: "1px solid rgba(232,116,42,0.3)",
              color: "#E8742A",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            {lang === "fr"
              ? "Autres options de partage"
              : lang === "ar"
                ? "خيارات مشاركة أخرى"
                : "Other sharing options"}
          </button>

          <button
            onClick={handleDownload}
            style={{
              width: "100%",
              maxWidth: "320px",
              padding: "12px",
              borderRadius: "16px",
              background: "none",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.5)",
              fontWeight: 500,
              fontSize: "12px",
              cursor: "pointer",
              marginTop: "4px",
            }}
          >
            {lang === "fr" ? "Télécharger l'image" : lang === "ar" ? "تحميل الصورة" : "Download image"}
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="w-full max-w-xs py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 mt-2"
            style={{
              backgroundColor: "rgba(255,255,255,.1)",
              color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <Share2 size={16} />
            {lang === "ar"
              ? "مشاركة على وسائل التواصل"
              : lang === "fr"
                ? "Partager sur les réseaux"
                : "Share on social media"}
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
