import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
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
  Globe,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import useUserName from "@/hooks/useUserName";
import Header from "@/components/Header";
import ShareModal from "@/components/ShareModal";
import MemoryCard from "@/components/MemoryCard";
import html2canvas from "html2canvas";
import { CHAPTERS } from "@/data/questions";
import { triggerTranscription } from "@/lib/triggerTranscription";

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
  | "freeTitle"
  | "importPeriod"
  | "question"
  | "background"
  | "countdown"
  | "recording"
  | "preview"
  | "uploading"
  | "followup"
  | "thumbnail"
  | "title"
  | "visibility"
  | "share";

const isStage = (value: Stage, target: Stage) => value === target;

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
    return ["مَن كان معك في تلك اللحظة؟", "ما التفصيل الذي لم تنسَه أبداً؟", "ماذا علّمك هذا الذكرى عن نفسك?"];
  } else {
    return [
      "Who was with you at that moment?",
      "What's the detail you've never forgotten?",
      "What did this memory teach you about yourself?",
    ];
  }
};

const extractFrames = async (videoBlob: Blob): Promise<string[]> => {
  const url = URL.createObjectURL(videoBlob);
  const points = [0.08, 0.22, 0.38, 0.54, 0.70, 0.88];

  const captureAt = (seekRatio: number): Promise<string | null> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = url;
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";

      const timeout = setTimeout(() => resolve(null), 8000);

      video.onloadedmetadata = () => {
        video.currentTime = Math.max(0.1, video.duration * seekRatio);
      };

      video.onseeked = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 480;
          canvas.height = 270;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, 480, 270);
            resolve(canvas.toDataURL("image/jpeg", 0.8));
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      };

      video.onerror = () => {
        clearTimeout(timeout);
        resolve(null);
      };
    });
  };

  try {
    const results = await Promise.all(
      points.map((p) => captureAt(p))
    );
    URL.revokeObjectURL(url);
    return results.filter((f): f is string => f !== null);
  } catch {
    URL.revokeObjectURL(url);
    return [];
  }
};

const Record = () => {
  const navigate = useNavigate();
  const loc = useLocation();
  const [searchParams] = useSearchParams();
  const recordMode = searchParams.get("mode");
  const isFreeMode = recordMode === "instant" || recordMode === "forever";
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
  const [visibilityChoice, setVisibilityChoice] = useState<"family" | "community" | "private" | null>(null);
  const posterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thumbScrollRef = useRef<HTMLDivElement>(null);
  const bgVideoInputRef = useRef<HTMLInputElement>(null);
  const auraRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isPublishingRef = useRef(false);
  const deliverAtRef = useRef<string>("");
  const isImportModeRef = useRef(false);
  const importTimelineRef = useRef<"memories" | "instant" | "forever">("memories");

  const [stage, setStage] = useState<Stage>("question");
  const [deliverAt, setDeliverAt] = useState("");
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
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgVideoUrl, setBgVideoUrl] = useState<string | null>(null);
  const [useAsAura, setUseAsAura] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [pendingMemory, setPendingMemory] = useState<any>(null);

  const [followupQuestions, setFollowupQuestions] = useState<string[]>([]);
  const [autoThumbnails, setAutoThumbnails] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
  const [thumbnailsLoading, setThumbnailsLoading] = useState(false);
  const [isImportMode, setIsImportMode] = useState(false);
  const [importTimeline, setImportTimeline] = useState<"memories" | "instant" | "forever">("memories");

  const location = useLocation();
  const preSelected = location.state?.preSelectedQuestion;
  const inspiredBy = location.state?.inspiredBy;
  const replyTo = location.state?.replyTo;

  const initialQuestion = preSelected
    ? lang === "fr"
      ? preSelected.fr
      : lang === "ar"
        ? preSelected.ar
        : preSelected.en
    : loc.state?.question || "What smell instantly brings you back to your childhood home?";

  const question = initialQuestion;
  const thumbCards = getThematicCards(isFreeMode ? memoryTitle || question : question);
  const auraBackground = bgImage || (useAsAura ? customThumb || thumbCards[selectedThumb] : null);

  useEffect(() => {
    if (isImportModeRef.current) return;
    if (isFreeMode) {
      setStage("freeTitle");
      setFollowupQuestions([]);
    } else {
      setStage("question");
    }
  }, [isFreeMode]);

  useEffect(() => {
    const file = location.state?.importedFile as File | undefined;
    if (!location.state?.skipToImport || !file) return;

    isImportModeRef.current = true;
    setIsImportMode(true);
    setAudioMode(false);
    typeRef.current = "video";
    setLocalBlob(file);
    clipsRef.current = [{ blob: file, question: "", posterBlob: null }];
    setThumbnailsLoading(true);
    setStage("freeTitle");

    (async () => {
      try {
        const frames = await extractFrames(file);
        setAutoThumbnails(frames);
        if (frames.length > 0) {
          setSelectedThumbnail(frames[0]);
          try {
            const response = await fetch(frames[0]);
            posterRef.current = await response.blob();
          } catch {
            // keep without poster
          }
        }
      } catch (err) {
        console.error("Import thumbnail extraction failed:", err);
      } finally {
        setThumbnailsLoading(false);
      }
    })();
  }, [location.state]);

  useEffect(() => {
    if (!location.state?.pendingRestore) return;

    if (location.state.pendingTitle) {
      setTitle(location.state.pendingTitle);
    }
    if (location.state.pendingVisibility) {
      setVisibilityChoice(location.state.pendingVisibility);
    }

    toast.info(
      lang === "fr"
        ? "Tu es connecté ! Reprends ton enregistrement pour publier ton souvenir."
        : lang === "ar"
          ? "أنت متصل! أكمل التسجيل لنشر ذكراك."
          : "You're signed in! Continue recording to publish your memory.",
      { duration: 6000 },
    );
  }, [location.state?.pendingRestore, location.state?.pendingTitle, location.state?.pendingVisibility, lang]);

  useEffect(() => {
    if (isFreeMode) return;
    const displayName = userName || (lang === "fr" ? "ami(e)" : lang === "ar" ? "صديقي" : "friend");
    const followups = getFollowupsFromQuestion(question, lang, displayName);
    setFollowupQuestions(followups);
  }, [question, lang, userName, isFreeMode]);

  useEffect(() => {
    if (preSelected && stage === "question") {
      setAudioMode(true);
      startMedia(true);
      setTimeout(() => goToBackground(false), 500);
    }
  }, [preSelected, stage]);

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout> | null = null;
    let t2: ReturnType<typeof setTimeout> | null = null;
    let t3: ReturnType<typeof setTimeout> | null = null;

    if (stage === "recording" && followupQuestions.length > 0 && followupIdx === 0) {
      t1 = setTimeout(() => setFollowIdx(1), 20000);
      t2 = setTimeout(() => setFollowIdx(2), 45000);
      t3 = setTimeout(() => setFollowIdx(3), 70000);
    }

    return () => {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      if (t3) clearTimeout(t3);
    };
  }, [stage, followupQuestions, followupIdx]);

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

  const startCountdown = () => {
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

  const goToBackground = (ff = false) => {
    followupRef.current = ff;
    const q = ff ? followupQuestions[Math.min(followupIdx, followupQuestions.length - 1)] : question;
    questionRef.current = q;
    setStage("background");
  };

  const handleBackgroundSkip = () => {
    setBgImage(null);
    if (bgVideoUrl) URL.revokeObjectURL(bgVideoUrl);
    setBgVideoUrl(null);
    setUseAsAura(false);
    auraRef.current = false;
    startCountdown();
  };

  const handleBackgroundContinue = () => {
    if (bgVideoUrl) URL.revokeObjectURL(bgVideoUrl);
    setBgVideoUrl(null);
    const url = customThumb || thumbCards[selectedThumb];
    setBgImage(url);
    setUseAsAura(true);
    auraRef.current = true;
    startCountdown();
  };

  const handleBackgroundVideoContinue = () => {
    if (!bgVideoUrl) return;
    setBgImage(null);
    setUseAsAura(false);
    auraRef.current = false;
    startCountdown();
  };

  const handleBgVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (bgVideoUrl) URL.revokeObjectURL(bgVideoUrl);
    setBgImage(null);
    setUseAsAura(false);
    auraRef.current = false;
    setCustomThumb(null);
    setBgVideoUrl(URL.createObjectURL(file));
    e.target.value = "";
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
    setBgImage(null);
    if (bgVideoUrl) URL.revokeObjectURL(bgVideoUrl);
    setBgVideoUrl(null);
    setUseAsAura(false);
    auraRef.current = false;
    setAutoThumbnails([]);
    setSelectedThumbnail(null);
    setThumbnailsLoading(false);
    setLocalBlob(null);
    setStage(isFreeMode ? "freeTitle" : "question");
  };

  const goToThumbnail = async () => {
    setStage("thumbnail");
    if (localBlob && !audioMode && autoThumbnails.length === 0) {
      setThumbnailsLoading(true);
      try {
        const frames = await extractFrames(localBlob);
        setAutoThumbnails(frames);
        if (frames.length > 0) {
          setSelectedThumbnail(frames[0]);
        }
      } catch (err) {
        console.error("Thumbnail extraction failed:", err);
      } finally {
        setThumbnailsLoading(false);
      }
    }
  };

  const handleUpload = () => {
    if (!localBlob) return;
    setPreviewReady(false);
    clipsRef.current.push({ blob: localBlob, question: questionRef.current, posterBlob: posterRef.current });
    setStage("uploading");
    setTimeout(() => goToThumbnail(), 300);
  };

  const handleThumbSelect = (idx: number) => {
    setSelectedThumb(idx);
    setCustomThumb(null);
    if (bgVideoUrl) URL.revokeObjectURL(bgVideoUrl);
    setBgVideoUrl(null);
    if (thumbScrollRef.current) {
      const cw = thumbScrollRef.current.children[0]?.clientWidth || 200;
      thumbScrollRef.current.scrollTo({ left: idx * (cw + 12), behavior: "smooth" });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (bgVideoUrl) URL.revokeObjectURL(bgVideoUrl);
      setBgVideoUrl(null);
      const u = URL.createObjectURL(f);
      setCustomThumb(u);
    }
  };

  const handleThumbValidate = async () => {
    if (selectedThumbnail) {
      try {
        const response = await fetch(selectedThumbnail);
        const blob = await response.blob();
        posterRef.current = blob;
      } catch (err) {
        console.error("Poster from thumbnail failed:", err);
      }
    } else if (customThumb) {
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
      // keep captured poster frame
    } else {
      imageUrlToBlob(thumbCards[selectedThumb]).then((b) => {
        posterRef.current = b;
      });
    }
    if (isFreeMode) {
      setStage("visibility");
    } else {
      if (!memoryTitle.trim()) {
        setTitle(generateTitleFromQuestion(question));
      }
      setStage("title");
    }
  };

  const uploadAllClips = async (): Promise<string[]> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const uid = session?.user?.id || "anonymous";
    userIdRef.current = uid;
    const urls: string[] = [];
    for (const cl of clipsRef.current) {
      const m =
        isImportModeRef.current && cl.blob.type
          ? cl.blob.type
          : getMimeType(audioMode);
      const ts = Date.now() + Math.random();
      const ext = m.includes("mp4") ? "mp4" : m.includes("quicktime") ? "mov" : "webm";
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
        urls.push(fn);
        thumbUrlRef.current = "";
        if (cl.posterBlob) {
          const { data: pd } = await supabase.storage
            .from("memories")
            .upload(pn, cl.posterBlob, { contentType: "image/jpeg", upsert: true });
          if (pd) {
            thumbUrlRef.current = pn;
          }
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
    return urls;
  };

  const handleVisibilitySelect = (ch: "family" | "community" | "private") => {
    setVisibilityChoice(ch);
    if (ch === "family") {
      isCommunityRef.current = false;
      isAnonymousRef.current = false;
      sparkRewardRef.current = 0;
    } else if (ch === "community") {
      isCommunityRef.current = true;
      isAnonymousRef.current = false;
      sparkRewardRef.current = 2;
    } else {
      isCommunityRef.current = false;
      isAnonymousRef.current = false;
      sparkRewardRef.current = 0;
    }
  };

  const handleVisibilityConfirm = async () => {
    if (!visibilityChoice) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const isLoggedIn = !!session?.user;

    if (!isLoggedIn) {
      const pendingData = {
        title: memoryTitle,
        question_fr: preSelected?.fr || null,
        question_en: preSelected?.en || null,
        question_ar: preSelected?.ar || null,
        fileType: typeRef.current,
        visibility: visibilityChoice,
        timestamp: Date.now(),
      };
      localStorage.setItem("pending_memory", JSON.stringify(pendingData));
      setPendingMemory(pendingData);
      setShowAuthGate(true);
      return;
    }

    handlePublish();
  };

  const handlePublish = async () => {
    if (isPublishingRef.current) return;
    isPublishingRef.current = true;
    try {
      const shareType =
        visibilityChoice === "community" ? "public" : visibilityChoice === "family" ? "circle" : "private";
      await handleShare(shareType);
    } finally {
      isPublishingRef.current = false;
    }
  };

  const visibilityButtonStyle = (choice: "family" | "community" | "private") => ({
    backgroundColor: visibilityChoice === choice ? "#E8742A" : "rgba(255,255,255,0.1)",
    color: "#fff",
    border: visibilityChoice === choice ? "2px solid #D4AF37" : "1px solid rgba(255,255,255,0.2)",
  });

  const generateAndShareCard = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png", 1);
      });

      if (!blob) return;

      const file = new File([blob], "infeelit-memory.png", { type: "image/png" });

      const shareText =
        {
          fr: `J'ai préservé un souvenir de notre famille sur Infeelit.\nÉcoute et ajoute le tien 👇\nhttps://infeelit.com`,
          en: `I just preserved a family memory on Infeelit.\nListen and add yours 👇\nhttps://infeelit.com`,
          ar: `حفظتُ ذكرى عائلية على Infeelit.\nاستمع وأضف ذكراك 👇\nhttps://infeelit.com`,
        }[lang] || `https://infeelit.com`;

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          text: shareText,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "infeelit-memory.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Share error:", err);
    }
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
        const finalUrl = urls[urls.length - 1];

        let finalThumbnailBlob: Blob | null = null;

        if (selectedThumbnail) {
          try {
            const response = await fetch(selectedThumbnail);
            finalThumbnailBlob = await response.blob();
          } catch (err) {
            console.error("Failed to fetch selected thumbnail blob:", err);
          }
        }

        if (!finalThumbnailBlob && posterRef.current) {
          finalThumbnailBlob = posterRef.current;
        }

        let finalThumbnailUrl: string | null = null;
        if (finalThumbnailBlob) {
          try {
            const thumbPath = `thumbnails/${uid}/${Date.now()}.jpg`;
            const { data } = await supabase.storage
              .from("memories")
              .upload(thumbPath, finalThumbnailBlob, {
                contentType: "image/jpeg",
                upsert: true,
              });
            if (data) finalThumbnailUrl = thumbPath;
          } catch (err) {
            console.error("Thumbnail upload failed:", err);
          }
        }

        const { data: inserted, error: insertError } = await (supabase.from("memories") as any)
          .insert({
            user_id: uid,
            title: memoryTitle || "A memory",
            description: null,
            file_url: finalUrl,
            file_type: typeRef.current,
            thumbnail_url: finalThumbnailUrl,
            timeline: isImportModeRef.current
              ? importTimelineRef.current
              : recordMode === "forever"
                ? "forever"
                : recordMode === "instant"
                  ? "instant"
                  : "memories",
            is_public: isCommunityRef.current,
            is_community: isCommunityRef.current,
            is_anonymous: isAnonymousRef.current,
            spark_reward: sparkRewardRef.current,
            background_image_url: auraRef.current ? customThumb || thumbCards[selectedThumb] : null,
            aura_intensity: auraRef.current ? 35 : null,
            created_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (insertError) {
          console.error("Insert error:", insertError);
          toast.error("Error saving.");
          setStage("share");
          return;
        }

        const newMemoryId = inserted?.id ?? null;

        if (newMemoryId && finalUrl) {
          triggerTranscription(newMemoryId, finalUrl, memoryTitle || "A memory");
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
          if (newMemoryId && (type === "circle" || type === "public")) {
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
      navigate("/", { replace: true });
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

  const sparkBalance = Number(localStorage.getItem("infeelit_spark_balance") || 0);

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden font-sans" dir={rtl ? "rtl" : "ltr"}>
      <Header activeTimeline="memories" onTimelineChange={() => {}} />
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Fond pendant l'enregistrement — image, vidéo ou gradient */}
      {stage === "recording" && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
          {bgVideoUrl && (
            <video
              src={bgVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "blur(6px) brightness(0.55)",
                transform: "scale(1.05)",
                zIndex: 0,
              }}
            />
          )}

          {!bgVideoUrl && bgImage && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(10px) brightness(0.5)",
                transform: "scale(1.1)",
                zIndex: 0,
              }}
            />
          )}

          {!bgVideoUrl && !bgImage && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, #1a0a05 0%, #3D1810 40%, #8B3A1A 100%)",
                zIndex: 0,
              }}
            />
          )}

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center bottom, rgba(232,116,42,0.15) 0%, transparent 60%)",
              zIndex: 1,
            }}
          />
        </div>
      )}

      {/* Caméra utilisateur */}
      {!audioMode && !isStage(stage, "preview") && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ zIndex: stage === "recording" ? 2 : 10 }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            stage === "recording" ? "opacity-[0.88]" : "opacity-20"
          }`}
        />
      )}

      {stage === "preview" && !audioMode && (
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-90" />
      )}

      {audioMode && !isStage(stage, "recording") && !isStage(stage, "preview") && (
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(160deg, #1A3B47 0%, #2D5A4F 30%, #3D2B1F 70%, #E8742A 100%)",
          }}
        />
      )}

      {stage !== "recording" && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
      )}

      {replyTo && preSelected && stage === "recording" && (
        <div
          style={{
            position: "absolute",
            top: "56px",
            left: "16px",
            right: "16px",
            padding: "10px 14px",
            background: "rgba(0,0,0,0.6)",
            borderRadius: "12px",
            backdropFilter: "blur(8px)",
            zIndex: 5,
          }}
        >
          <p
            style={{
              fontSize: "10px",
              color: "rgba(232,116,42,0.7)",
              letterSpacing: "0.15em",
              marginBottom: "4px",
              fontFamily: "system-ui",
            }}
          >
            {lang === "fr" ? "Ta réponse à :" : lang === "ar" ? "ردّك على:" : "Your answer to:"}
          </p>
          <p
            style={{
              fontSize: "14px",
              color: "#fff",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              lineHeight: 1.4,
            }}
          >
            {lang === "fr" ? preSelected.fr : lang === "ar" ? preSelected.ar : preSelected.en}
          </p>
        </div>
      )}

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

      {stage === "freeTitle" && isImportMode && thumbnailsLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            background: "linear-gradient(160deg, #FDF8F0 0%, #FEF0E0 50%, #FDF8F0 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 24px 40px",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(232,116,42,0.2)",
              borderTop: "3px solid #E8742A",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ fontSize: "13px", color: "rgba(61,43,31,0.5)" }}>
            {lang === "fr"
              ? "Génération des aperçus…"
              : lang === "ar"
                ? "جارٍ إنشاء الصور المصغّرة…"
                : "Generating previews…"}
          </p>
        </div>
      )}

      {stage === "freeTitle" && !(isImportMode && thumbnailsLoading) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            background:
              !isImportMode && recordMode === "forever"
                ? "linear-gradient(160deg, #0a0a1a 0%, #1a1040 50%, #2D1810 100%)"
                : "linear-gradient(160deg, #FDF8F0 0%, #FEF0E0 50%, #FDF8F0 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 24px 40px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            {isImportMode ? "📁" : recordMode === "forever" ? "✉️" : "⚡"}
          </div>

          <p
            style={{
              fontSize: "11px",
              fontWeight: 900,
              letterSpacing: "0.3em",
              color: "#E8742A",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            {isImportMode
              ? lang === "fr"
                ? "Vidéo importée"
                : lang === "ar"
                  ? "فيديو مستورد"
                  : "Imported video"
              : recordMode === "forever"
                ? lang === "fr"
                  ? "Message pour le futur"
                  : lang === "ar"
                    ? "رسالة للمستقبل"
                    : "Message for the future"
                : lang === "fr"
                  ? "Souvenir spontané"
                  : lang === "ar"
                    ? "ذكرى عفوية"
                    : "Spontaneous memory"}
          </p>

          <p
            style={{
              fontSize: "16px",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              color: !isImportMode && recordMode === "forever" ? "rgba(255,255,255,0.7)" : "#3D2B1F",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            {lang === "fr"
              ? "Donne un titre à ce moment."
              : lang === "ar"
                ? "أعطِ هذه اللحظة عنواناً."
                : "Give this moment a title."}
          </p>

          <input
            type="text"
            value={memoryTitle}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              isImportMode
                ? lang === "fr"
                  ? "Ex : Vacances en famille 2024"
                  : lang === "ar"
                    ? "مثال: عطلة عائلية 2024"
                    : "Ex: Family vacation 2024"
                : recordMode === "forever"
                  ? lang === "fr"
                    ? "Ex : Pour toi, le jour de ton mariage"
                    : lang === "ar"
                      ? "مثال: إليك، يوم زفافك"
                      : "Ex: For you, on your wedding day"
                  : lang === "fr"
                    ? "Ex : Devant ma maison d'enfance"
                    : lang === "ar"
                      ? "مثال: أمام بيت طفولتي"
                      : "Ex: In front of my childhood home"
            }
            style={{
              width: "100%",
              maxWidth: "360px",
              padding: "16px 20px",
              borderRadius: "16px",
              border: "1.5px solid rgba(232,116,42,0.3)",
              background: !isImportMode && recordMode === "forever" ? "rgba(255,255,255,0.08)" : "#fff",
              fontSize: "16px",
              color: !isImportMode && recordMode === "forever" ? "#fff" : "#3D2B1F",
              outline: "none",
              boxSizing: "border-box",
              marginBottom: "16px",
            }}
            autoFocus
            dir={rtl ? "rtl" : "ltr"}
          />

          {!isImportMode && recordMode === "forever" && (
            <div style={{ width: "100%", maxWidth: "360px", marginBottom: "16px" }}>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
                {lang === "fr" ? "Date de livraison" : lang === "ar" ? "تاريخ التسليم" : "Delivery date"}
              </p>
              <input
                type="date"
                value={deliverAt}
                min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                onChange={(e) => {
                  setDeliverAt(e.target.value);
                  deliverAtRef.current = e.target.value;
                }}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: "1px solid rgba(212,175,55,0.3)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          <button
            onClick={() => {
              if (!memoryTitle.trim()) return;
              if (!isImportMode && recordMode === "forever" && !deliverAtRef.current) return;
              questionRef.current = memoryTitle.trim();
              if (isImportMode) {
                setStage("importPeriod");
              } else {
                goToBackground(false);
              }
            }}
            disabled={
              !memoryTitle.trim() || (!isImportMode && recordMode === "forever" && !deliverAt)
            }
            style={{
              width: "100%",
              maxWidth: "360px",
              padding: "18px",
              borderRadius: "18px",
              background:
                memoryTitle.trim() && (isImportMode || recordMode !== "forever" || deliverAt)
                  ? "linear-gradient(135deg, #E8742A, #D4621A)"
                  : "rgba(232,116,42,0.3)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
              border: "none",
              cursor:
                memoryTitle.trim() && (isImportMode || recordMode !== "forever" || deliverAt)
                  ? "pointer"
                  : "not-allowed",
              boxShadow:
                memoryTitle.trim() && (isImportMode || recordMode !== "forever" || deliverAt)
                  ? "0 4px 20px rgba(232,116,42,0.4)"
                  : "none",
            }}
          >
            {isImportMode
              ? lang === "fr"
                ? "Continuer →"
                : lang === "ar"
                  ? "→ متابعة"
                  : "Continue →"
              : lang === "fr"
                ? "Enregistrer ce moment →"
                : lang === "ar"
                  ? "→ سجّل هذه اللحظة"
                  : "Record this moment →"}
          </button>

          <button
            onClick={() => navigate(-1)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color:
                !isImportMode && recordMode === "forever"
                  ? "rgba(255,255,255,0.4)"
                  : "rgba(61,43,31,0.45)",
              fontSize: "13px",
              marginTop: "16px",
            }}
          >
            {lang === "fr" ? "← Retour" : lang === "ar" ? "→ رجوع" : "← Back"}
          </button>
        </div>
      )}

      {stage === "importPeriod" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            background: "linear-gradient(160deg, #FDF8F0 0%, #FEF0E0 50%, #FDF8F0 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 24px 40px",
          }}
        >
          <button
            onClick={() => setStage("freeTitle")}
            style={{
              background: "none",
              border: "none",
              color: "rgba(61,43,31,0.5)",
              fontSize: "13px",
              cursor: "pointer",
              marginBottom: "16px",
              alignSelf: "flex-start",
            }}
          >
            ← Retour
          </button>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 900,
              letterSpacing: "0.3em",
              color: "#E8742A",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            {lang === "fr" ? "Choisir la période" : lang === "ar" ? "اختر الفترة" : "Choose period"}
          </p>
          <p
            style={{
              fontSize: "16px",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              color: "#3D2B1F",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            {lang === "fr"
              ? "Où classer ce souvenir ?"
              : lang === "ar"
                ? "أين تصنّف هذه الذكرى؟"
                : "Where does this memory belong?"}
          </p>

          {(
            [
              { id: "memories" as const, label: "Memories", icon: "🌅" },
              { id: "instant" as const, label: "Instant", icon: "⚡" },
              { id: "forever" as const, label: "Forever", icon: "✉️" },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setImportTimeline(option.id);
                importTimelineRef.current = option.id;
              }}
              style={{
                width: "100%",
                maxWidth: "360px",
                padding: "16px 20px",
                borderRadius: "16px",
                background: importTimeline === option.id ? "rgba(232,116,42,0.12)" : "#fff",
                border:
                  importTimeline === option.id
                    ? "2px solid #E8742A"
                    : "1px solid rgba(232,116,42,0.2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "10px",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: "24px" }}>{option.icon}</span>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#3D2B1F" }}>{option.label}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              if (localBlob && !audioMode) {
                goToThumbnail();
              } else {
                setStage("visibility");
              }
            }}
            style={{
              width: "100%",
              maxWidth: "360px",
              padding: "18px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #E8742A, #D4621A)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
              border: "none",
              cursor: "pointer",
              marginTop: "8px",
              boxShadow: "0 4px 20px rgba(232,116,42,0.4)",
            }}
          >
            {lang === "fr" ? "Continuer →" : lang === "ar" ? "→ متابعة" : "Continue →"}
          </button>
        </div>
      )}

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
                onClick={() => goToBackground(false)}
                className="mt-2 px-10 py-4 rounded-full gradient-orange font-bold text-lg"
                style={{ color: "#fff" }}
              >
                {t.imReady}
              </button>
            )}
          </div>
        </>
      )}

      {stage === "background" && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
          <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em]">
            {lang === "ar"
              ? "اختر خلفية لتسجيلك"
              : lang === "fr"
                ? "Choisis un fond pour ton enregistrement"
                : "Choose a background for your recording"}
          </p>
          <div
            ref={thumbScrollRef}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 max-w-full hide-scroll"
            style={{ scrollbarWidth: "none", opacity: bgVideoUrl ? 0.45 : 1 }}
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
          <label
            className={`flex items-center gap-2 text-white/40 text-xs cursor-pointer hover:text-white/60 transition-colors ${bgVideoUrl ? "opacity-45 pointer-events-none" : ""}`}
          >
            <Camera size={14} />
            {lang === "ar" ? "📷 استخدام صورتي" : lang === "fr" ? "📷 Utiliser ma photo" : "📷 Use my photo"}
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => bgVideoInputRef.current?.click()}
            style={{
              width: "100%",
              maxWidth: "300px",
              padding: "18px",
              borderRadius: "20px",
              background: bgVideoUrl
                ? "linear-gradient(135deg, #E8742A, #D4621A)"
                : "rgba(255,255,255,0.08)",
              border: bgVideoUrl ? "none" : "1.5px solid rgba(255,255,255,0.15)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginTop: "12px",
            }}
          >
            <span style={{ fontSize: "28px" }}>🎬</span>
            <div style={{ textAlign: "left" }}>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#fff",
                  margin: 0,
                }}
              >
                {bgVideoUrl
                  ? lang === "fr"
                    ? "Vidéo sélectionnée ✓"
                    : lang === "ar"
                      ? "تم اختيار الفيديو ✓"
                      : "Video selected ✓"
                  : lang === "fr"
                    ? "Une vidéo depuis ma galerie"
                    : lang === "ar"
                      ? "فيديو من معرضي"
                      : "A video from my gallery"}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: bgVideoUrl ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.5)",
                  margin: 0,
                }}
              >
                {lang === "fr"
                  ? "Joue en fond pendant que tu parles"
                  : lang === "ar"
                    ? "يشغّل في الخلفية أثناء حديثك"
                    : "Plays in background while you speak"}
              </p>
            </div>
          </button>

          <input
            ref={bgVideoInputRef}
            type="file"
            accept="video/*"
            style={{ display: "none" }}
            onChange={handleBgVideoSelect}
          />

          <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
            {bgVideoUrl ? (
              <button
                onClick={handleBackgroundVideoContinue}
                className="w-full py-4 rounded-full font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #E8742A, #D4621A)",
                  color: "#fff",
                  boxShadow: "0 4px 20px rgba(232,116,42,0.3)",
                }}
              >
                {lang === "ar"
                  ? "المتابعة مع الفيديو"
                  : lang === "fr"
                    ? "Continuer avec vidéo"
                    : "Continue with video"}
              </button>
            ) : (
              <button
                onClick={handleBackgroundContinue}
                className="w-full py-4 rounded-full font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #E8742A, #D4621A)",
                  color: "#fff",
                  boxShadow: "0 4px 20px rgba(232,116,42,0.3)",
                }}
              >
                {lang === "ar"
                  ? "المتابعة مع الصورة"
                  : lang === "fr"
                    ? "Continuer avec image"
                    : "Continue with image"}
              </button>
            )}
            <button
              onClick={handleBackgroundSkip}
              className="w-full py-4 rounded-full bg-white/10 text-white font-bold text-base border border-white/20"
            >
              {lang === "ar" ? "تخطّي" : lang === "fr" ? "Passer" : "Skip"}
            </button>
          </div>
        </div>
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
          <div className="relative w-full">
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
            {(bgVideoUrl || bgImage) && (
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "6px 14px",
                  background: "rgba(0,0,0,0.6)",
                  borderRadius: "999px",
                  backdropFilter: "blur(8px)",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.8)",
                    margin: 0,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {bgVideoUrl
                    ? lang === "fr"
                      ? "🎬 Fond vidéo activé"
                      : lang === "ar"
                        ? "🎬 خلفية الفيديو مفعّلة"
                        : "🎬 Video background active"
                    : lang === "fr"
                      ? "🖼️ Fond image activé"
                      : lang === "ar"
                        ? "🖼️ خلفية الصورة مفعّلة"
                        : "🖼️ Image background active"}
                </p>
              </div>
            )}
          </div>
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            background: "#FDF8F0",
            display: "flex",
            flexDirection: "column",
            padding: "56px 20px 32px",
            overflowY: "auto",
          }}
        >
          <button
            onClick={() => setStage("preview")}
            style={{
              background: "none",
              border: "none",
              color: "rgba(61,43,31,0.5)",
              fontSize: "13px",
              cursor: "pointer",
              marginBottom: "16px",
              alignSelf: "flex-start",
            }}
          >
            ← Retour
          </button>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 900,
              letterSpacing: "0.3em",
              color: "#E8742A",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            ✦{" "}
            {lang === "fr" ? "Choisir l'aperçu" : lang === "ar" ? "اختر الصورة المصغّرة" : "Choose preview"}
          </p>
          <p
            style={{
              fontSize: "15px",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              color: "#3D2B1F",
              marginBottom: "24px",
              opacity: 0.7,
            }}
          >
            {lang === "fr"
              ? "Quelle image représente ce souvenir ?"
              : lang === "ar"
                ? "ما الصورة التي تمثّل هذه الذكرى؟"
                : "Which image represents this memory?"}
          </p>

          {thumbnailsLoading && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "40px 0",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "3px solid rgba(232,116,42,0.2)",
                  borderTop: "3px solid #E8742A",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <p style={{ fontSize: "13px", color: "rgba(61,43,31,0.5)" }}>
                {lang === "fr"
                  ? "Génération des aperçus…"
                  : lang === "ar"
                    ? "جارٍ إنشاء الصور المصغّرة…"
                    : "Generating previews…"}
              </p>
            </div>
          )}

          {!thumbnailsLoading && autoThumbnails.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              {autoThumbnails.map((frame, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedThumbnail(frame)}
                  style={{
                    padding: 0,
                    border: selectedThumbnail === frame ? "3px solid #E8742A" : "3px solid transparent",
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    aspectRatio: "16/9",
                    position: "relative",
                    boxShadow: selectedThumbnail === frame ? "0 0 0 2px #D4AF37" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <img
                    src={frame}
                    alt={`Frame ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      aspectRatio: "16/9",
                      maxWidth: "320px",
                      margin: "0 auto",
                    }}
                  />
                  {selectedThumbnail === frame && (
                    <div
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "#E8742A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setSelectedThumbnail(url);
                  setAutoThumbnails((prev) => [...prev.filter((f) => !f.startsWith("blob:")), url]);
                }
              };
              input.click();
            }}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              background: "rgba(61,43,31,0.05)",
              border: "1.5px dashed rgba(61,43,31,0.2)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "24px",
            }}
          >
            <span style={{ fontSize: "20px" }}>🖼️</span>
            <p style={{ fontSize: "14px", color: "rgba(61,43,31,0.6)", margin: 0 }}>
              {lang === "fr"
                ? "Choisir une image personnalisée"
                : lang === "ar"
                  ? "اختر صورة مخصّصة"
                  : "Choose a custom image"}
            </p>
          </button>

          <button
            onClick={handleThumbValidate}
            style={{
              width: "100%",
              padding: "18px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #E8742A, #D4621A)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(232,116,42,0.4)",
            }}
          >
            {lang === "fr" ? "Continuer →" : lang === "ar" ? "→ متابعة" : "Continue →"}
          </button>
        </div>
      )}

      {stage === "title" && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-8 text-center gap-8">
          <button
            onClick={() => setStage("thumbnail")}
            style={{
              background: "none",
              border: "none",
              color: "rgba(61,43,31,0.5)",
              fontSize: "13px",
              cursor: "pointer",
              marginBottom: "16px",
              alignSelf: "flex-start",
            }}
          >
            ← Retour
          </button>
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
          <button
            onClick={() => setStage(isFreeMode ? "thumbnail" : "title")}
            style={{
              background: "none",
              border: "none",
              color: "rgba(61,43,31,0.5)",
              fontSize: "13px",
              cursor: "pointer",
              marginBottom: "16px",
              alignSelf: "flex-start",
            }}
          >
            ← Retour
          </button>
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
            onClick={() => handleVisibilitySelect("community")}
            className="w-full max-w-xs py-4 rounded-full font-bold text-base flex items-center justify-center gap-3 transition-all duration-200"
            style={visibilityButtonStyle("community")}
          >
            <Globe size={18} />
            {lang === "ar" ? "للجميع" : lang === "fr" ? "Tout le monde" : "Everyone"}
          </button>
          <button
            onClick={() => handleVisibilitySelect("family")}
            className="w-full max-w-xs py-4 rounded-full font-bold text-base flex items-center justify-center gap-3 transition-all duration-200"
            style={visibilityButtonStyle("family")}
          >
            <Users size={18} />
            {lang === "ar" ? "عائلتي" : lang === "fr" ? "Ma famille" : "My family"}
          </button>
          <button
            onClick={() => handleVisibilitySelect("private")}
            className="w-full max-w-xs py-4 rounded-full font-bold text-base flex items-center justify-center gap-3 transition-all duration-200"
            style={visibilityButtonStyle("private")}
          >
            <Lock size={18} />
            {lang === "ar" ? "خاص" : lang === "fr" ? "Privé" : "Private"}
          </button>
          <button
            onClick={handleVisibilityConfirm}
            disabled={!visibilityChoice}
            className="w-full max-w-xs py-4 rounded-full gradient-orange font-bold text-base flex items-center justify-center gap-2 mt-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: "#fff" }}
          >
            <Share2 size={18} />
            {lang === "ar" ? "نشر ✦" : lang === "fr" ? "Publier ✦" : "Publish ✦"}
          </button>
        </div>
      )}

      {stage === "share" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#FDF8F0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "60px 24px 40px",
            overflowY: "auto",
            zIndex: 20,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.3em",
                color: "#E8742A",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              ✦ {lang === "fr" ? "Souvenir préservé" : lang === "ar" ? "تم حفظ الذكرى" : "Memory preserved"}
            </p>
            <p
              style={{
                fontSize: "15px",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                color: "#3D2B1F",
                opacity: 0.7,
              }}
            >
              {lang === "fr"
                ? "Partage-le avec ta famille"
                : lang === "ar"
                  ? "شاركه مع عائلتك"
                  : "Share it with your family"}
            </p>
          </div>

          <MemoryCard
            ref={cardRef}
            title={memoryTitle || "Mon souvenir"}
            authorName={userName || "Moi"}
            memoryNumber={sparkBalance + 1}
            lang={lang as "fr" | "en" | "ar"}
          />

          <div
            style={{
              width: "100%",
              maxWidth: "320px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "8px",
            }}
          >
            <button
              onClick={generateAndShareCard}
              style={{
                width: "100%",
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
                boxShadow: "0 4px 16px rgba(37,211,102,0.3)",
              }}
            >
              <span style={{ fontSize: "20px" }}>📱</span>
              {lang === "fr" ? "Envoyer à ma famille" : lang === "ar" ? "أرسل لعائلتي" : "Send to my family"}
            </button>

            <button
              onClick={() => navigate("/")}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "16px",
                background: "none",
                border: "1px solid rgba(232,116,42,0.3)",
                color: "#E8742A",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {lang === "fr" ? "Retour au fil ✦" : lang === "ar" ? "العودة إلى المنشورات ✦" : "Back to feed ✦"}
            </button>
          </div>
        </div>
      )}

      {showAuthGate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(45,24,16,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "24px",
          }}
          onClick={() => setShowAuthGate(false)}
        >
          <div
            style={{
              background: "#FDF8F0",
              borderRadius: "28px",
              padding: "36px 28px",
              maxWidth: "340px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ fontSize: "40px" }}>✦</span>

            <p
              style={{
                fontSize: "20px",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                color: "#3D2B1F",
                margin: "16px 0 8px",
                lineHeight: 1.4,
              }}
            >
              {lang === "fr" ? "Ton souvenir est prêt." : lang === "ar" ? "ذكراك جاهزة." : "Your memory is ready."}
            </p>

            <p
              style={{
                fontSize: "14px",
                color: "rgba(61,43,31,0.6)",
                marginBottom: "28px",
                lineHeight: 1.5,
              }}
            >
              {lang === "fr"
                ? "Crée un compte gratuit pour le préserver pour toujours."
                : lang === "ar"
                  ? "أنشئ حساباً مجانياً لحفظها إلى الأبد."
                  : "Create a free account to preserve it forever."}
            </p>

            <button
              onClick={() => navigate("/welcome")}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #E8742A, #D4621A)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "16px",
                border: "none",
                cursor: "pointer",
                marginBottom: "12px",
                boxShadow: "0 4px 20px rgba(232,116,42,0.4)",
              }}
            >
              {lang === "fr"
                ? "Rejoindre Infeelit — c'est gratuit"
                : lang === "ar"
                  ? "انضم إلى Infeelit — مجاناً"
                  : "Join Infeelit — it's free"}
            </button>

            <button
              onClick={() => {
                setShowAuthGate(false);
                const pendingData = {
                  title: memoryTitle,
                  question_fr: preSelected?.fr || null,
                  question_en: preSelected?.en || null,
                  question_ar: preSelected?.ar || null,
                  fileType: typeRef.current,
                  timestamp: Date.now(),
                };
                localStorage.setItem("pending_memory", JSON.stringify(pendingData));
                toast.info(
                  lang === "fr"
                    ? "Ton souvenir a été sauvegardé localement. Reviens quand tu veux !"
                    : lang === "ar"
                      ? "تم حفظ ذكراك محلياً. عد متى شئت!"
                      : "Your memory has been saved locally. Come back anytime!",
                );
                navigate("/");
              }}
              style={{
                background: "none",
                border: "none",
                color: "rgba(61,43,31,0.4)",
                fontSize: "13px",
                cursor: "pointer",
                padding: "8px",
              }}
            >
              {lang === "fr"
                ? "Continuer sans compte"
                : lang === "ar"
                  ? "المتابعة بدون حساب"
                  : "Continue without account"}
            </button>
          </div>
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
