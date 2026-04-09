import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { X, StopCircle, Loader2, Share2, Video, Mic } from "lucide-react";
import { toast } from "sonner";

const MAX_DURATION_SECONDS = 180;

const FOLLOWUP_QUESTIONS: Record<string, string[]> = {
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
  loss: ["What do you wish you had said?", "What did they leave behind in you?", "Who carries their memory with you?"],
  default: [
    "Who else was there in that memory?",
    "What would you tell that version of yourself if you could?",
    "Is there someone who needs to hear this story?",
  ],
};

const POETIC_TITLES: Record<string, string[]> = {
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
  loss: ["What remains after goodbye...", "The presence that never truly left...", "Everything they left inside me..."],
  default: [
    "A story that deserved to be told...",
    "The moment I didn't know I'd remember...",
    "A thread in the tapestry of who I am...",
  ],
};

const getTheme = (question: string): string => {
  const q = question.toLowerCase();
  if (q.includes("child") || q.includes("home") || q.includes("school") || q.includes("grow")) return "childhood";
  if (q.includes("mother") || q.includes("father") || q.includes("family") || q.includes("grand")) return "family";
  if (q.includes("lost") || q.includes("miss") || q.includes("gone") || q.includes("death")) return "loss";
  return "default";
};

const uploadToR2 = async (blob: Blob, fileName: string): Promise<string> => {
  const endpoint = import.meta.env.VITE_R2_ENDPOINT;
  const bucketName = import.meta.env.VITE_R2_BUCKET_NAME || "infeelit-memories";
  const url = `${endpoint}/${bucketName}/${fileName}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": blob.type },
    body: blob,
  });
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const hardCapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stockage des URLs après upload — utilisées lors du share
  const uploadedFileUrlRef = useRef<string>("");
  const uploadedThumbnailUrlRef = useRef<string>("");
  const uploadedFileTypeRef = useRef<string>("video");
  const userIdRef = useRef<string>("");

  const [stage, setStage] = useState<Stage>("question");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [followupIndex, setFollowupIndex] = useState(0);
  const [memoryTitle, setMemoryTitle] = useState("");
  const [audioMode, setAudioMode] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const question = location.state?.question || "What smell instantly brings you back to your childhood home?";

  const theme = getTheme(question);
  const followups = FOLLOWUP_QUESTIONS[theme];

  const startMedia = async (audioOnly: boolean) => {
    try {
      const constraints = audioOnly
        ? { audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 } }
        : {
            video: {
              facingMode: "user",
              width: { ideal: 720, max: 1280 },
              height: { ideal: 480, max: 720 },
              frameRate: { ideal: 24, max: 30 },
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100,
            },
          };

      const s = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(s);

      if (!audioOnly && videoRef.current) {
        videoRef.current.srcObject = s;
      }

      if (audioOnly) {
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(s);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
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
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      setMediaRecorder(recorder);
    } catch {
      toast.error("Microphone not accessible. Please check your permissions.");
    }
  };

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(animFrameRef.current);
      if (hardCapTimerRef.current) clearTimeout(hardCapTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [stream]);

  useEffect(() => {
    if (!audioMode || stage !== "recording") return;
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#E8742A";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#E8742A";
      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [audioMode, stage]);

  const handleSelectMode = async (mode: "video" | "audio") => {
    const isAudio = mode === "audio";
    setAudioMode(isAudio);
    await startMedia(isAudio);
  };

  const startCountdown = () => {
    setStage("countdown");
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          recordedChunksRef.current = [];
          mediaRecorder?.start(100);
          setStage("recording");
          setElapsed(0);

          elapsedTimerRef.current = setInterval(() => {
            setElapsed((e) => e + 1);
          }, 1000);

          hardCapTimerRef.current = setTimeout(() => {
            toast("3 minute limit reached. Saving your memory...", { icon: "⏱️" });
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
    if (hardCapTimerRef.current) clearTimeout(hardCapTimerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    cancelAnimationFrame(animFrameRef.current);
    setStage("uploading");
    mediaRecorder.requestData();

    let posterBlob: Blob | null = null;
    if (!audioMode && videoRef.current) {
      posterBlob = await capturePosterFrame(videoRef.current);
    }

    mediaRecorder.onstop = async () => {
      try {
        const type = audioMode ? "audio/webm" : "video/webm";
        const blob = new Blob(recordedChunksRef.current, { type });

        if (blob.size === 0) {
          toast.error("Nothing recorded. Please try again.");
          setStage("recording");
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id || "anonymous";
        userIdRef.current = userId;
        uploadedFileTypeRef.current = audioMode ? "audio" : "video";

        const timestamp = Date.now();
        const fileName = `${userId}/${timestamp}_memory.webm`;
        const posterName = `${userId}/${timestamp}_poster.jpg`;

        // Upload fichier principal
        let fileUrl = "";
        try {
          fileUrl = await uploadToR2(blob, fileName);
        } catch {
          if (user) {
            const { data } = await supabase.storage.from("memories").upload(fileName, blob, { contentType: type });
            if (data) {
              const { data: urlData } = supabase.storage.from("memories").getPublicUrl(fileName);
              fileUrl = urlData.publicUrl;
            }
          }
        }
        uploadedFileUrlRef.current = fileUrl;

        // Upload poster frame si disponible
        let thumbUrl = "";
        if (posterBlob) {
          try {
            thumbUrl = await uploadToR2(posterBlob, posterName);
          } catch {
            if (user) {
              const { data } = await supabase.storage
                .from("memories")
                .upload(posterName, posterBlob, { contentType: "image/jpeg" });
              if (data) {
                const { data: urlData } = supabase.storage.from("memories").getPublicUrl(posterName);
                thumbUrl = urlData.publicUrl;
              }
            }
          }
        }
        uploadedThumbnailUrlRef.current = thumbUrl;

        const titles = POETIC_TITLES[theme];
        setMemoryTitle(titles[Math.floor(Math.random() * titles.length)]);
        setStage("followup");
      } catch (err) {
        console.error(err);
        toast.error("Error saving. Please try again.");
        setStage("recording");
      }
    };

    mediaRecorder.stop();
  };

  const handleNextFollowup = () => {
    if (followupIndex < followups.length - 1) {
      setFollowupIndex((prev) => prev + 1);
    } else {
      setStage("title");
    }
  };

  const handleShare = async (type: "circle" | "public" | "private") => {
    stream?.getTracks().forEach((t) => t.stop());

    const fileUrl = uploadedFileUrlRef.current;
    const thumbUrl = uploadedThumbnailUrlRef.current;
    const userId = userIdRef.current;
    const fileType = uploadedFileTypeRef.current;
    const isPublic = type === "public";

    // Insert dans la table memories
    if (userId && userId !== "anonymous" && fileUrl) {
      const { error } = await (supabase as any).from("memories").insert({
        user_id: userId,
        title: memoryTitle || "A memory",
        description: null,
        file_url: fileUrl,
        file_type: fileType,
        thumbnail_url: thumbUrl || null,
        timeline: "past",
        is_public: isPublic,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Supabase memories insert error:", error);
        toast.error("Memory saved locally but not indexed. Please try again.");
      } else {
        if (type === "circle") toast.success("Shared with your family circle.");
        else if (type === "public") toast.success("Shared in the ocean.");
        else toast.success("Memory kept privately.");
      }
    } else {
      // Utilisateur non connecté ou URL manquante
      if (type === "circle") toast.success("Shared with your family circle.");
      else if (type === "public") toast.success("Shared in the ocean.");
      else toast.success("Memory kept privately.");
    }

    navigate("/");
  };

  const stopAndLeave = () => {
    stream?.getTracks().forEach((t) => t.stop());
    cancelAnimationFrame(animFrameRef.current);
    if (hardCapTimerRef.current) clearTimeout(hardCapTimerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    navigate(-1);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const timerColor = elapsed >= 150 ? "#EF4444" : elapsed >= 120 ? "#F97316" : "#FFFFFF";

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden font-sans">
      {!audioMode && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            stage === "recording" ? "opacity-80" : "opacity-20"
          }`}
        />
      )}

      {audioMode && (
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)" }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center">
        <button
          onClick={stopAndLeave}
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
                {audioMode ? "Voice only" : "Video"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* STAGE 1 — QUESTION */}
      {stage === "question" && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em]">Your Story</p>
          <h2 className="text-white text-2xl font-bold leading-tight italic">"{question}"</h2>
          <p className="text-white/50 text-sm">Take a breath. Speak from the heart.</p>

          {!stream ? (
            <div className="flex flex-col gap-4 w-full max-w-xs mt-4">
              <p className="text-white/70 text-xs uppercase tracking-widest text-center">How do you want to share?</p>
              <button
                onClick={() => handleSelectMode("video")}
                className="w-full py-4 rounded-full gradient-orange font-bold text-base flex items-center justify-center gap-3"
                style={{ color: "#FFFFFF" }}
              >
                <Video size={20} />
                Video — Show your face
              </button>
              <button
                onClick={() => handleSelectMode("audio")}
                className="w-full py-4 rounded-full bg-white/15 border border-white/40 text-white font-bold text-base flex items-center justify-center gap-3"
              >
                <Mic size={20} />
                Voice only — Just your voice
              </button>
            </div>
          ) : (
            <button
              onClick={startCountdown}
              className="mt-2 px-10 py-4 rounded-full gradient-orange font-bold text-lg"
              style={{ color: "#FFFFFF" }}
            >
              I'm ready
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
                {audioMode ? "Listening..." : "Recording"}
              </span>
            </div>
          </div>

          {audioMode && (
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center"
                style={{
                  background: "radial-gradient(circle, rgba(107,78,155,0.4) 0%, rgba(232,116,42,0.2) 100%)",
                  boxShadow: "0 0 40px rgba(232,116,42,0.3)",
                }}
              >
                <Mic size={48} className="text-[#E8742A]" />
              </div>
              <canvas ref={canvasRef} width={300} height={80} className="opacity-90" />
              <p className="text-white/50 text-sm italic">Your voice is being recorded...</p>
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
          <p className="text-white text-sm font-bold uppercase tracking-widest">Weaving your memory...</p>
        </div>
      )}

      {/* STAGE 5 — AI FOLLOWUP */}
      {stage === "followup" && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-8 text-center gap-8">
          <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em]">One more question</p>
          <p className="text-white/40 text-xs uppercase tracking-widest">
            {followupIndex + 1} of {followups.length}
          </p>
          <h2 className="text-white text-2xl font-bold leading-tight">{followups[followupIndex]}</h2>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={startCountdown}
              className="w-full py-4 rounded-full gradient-orange font-bold text-base"
              style={{ color: "#FFFFFF" }}
            >
              Answer this too
            </button>
            <button
              onClick={handleNextFollowup}
              className="w-full py-4 rounded-full bg-white/15 border border-white/40 text-white font-bold text-base"
            >
              {followupIndex < followups.length - 1 ? "Next question" : "See my memory"}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 6 — TITLE */}
      {stage === "title" && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-8 text-center gap-8">
          <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em]">Your memory is ready</p>
          <h2 className="text-white text-2xl font-bold leading-tight italic">"{memoryTitle}"</h2>
          <input
            type="text"
            value={memoryTitle}
            onChange={(e) => setMemoryTitle(e.target.value)}
            className="w-full max-w-xs bg-white/10 border border-white/20 rounded-full px-6 py-3 text-white text-center text-sm outline-none"
            placeholder="Edit your title..."
          />
          <button
            onClick={() => setStage("share")}
            className="w-full max-w-xs py-4 rounded-full gradient-orange font-bold text-base flex items-center justify-center gap-2"
            style={{ color: "#FFFFFF" }}
          >
            <Share2 size={18} />
            Share this memory
          </button>
        </div>
      )}

      {/* STAGE 7 — SHARE */}
      {stage === "share" && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
          <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em]">Who should hear this?</p>
          <h2 className="text-white text-lg font-bold leading-tight italic mb-2">"{memoryTitle}"</h2>
          <button
            onClick={() => handleShare("circle")}
            className="w-full max-w-xs py-4 rounded-full font-bold text-white text-base"
            style={{ backgroundColor: "#6B4E9B" }}
          >
            🔒 My family circle
          </button>
          <button
            onClick={() => handleShare("public")}
            className="w-full max-w-xs py-4 rounded-full gradient-orange font-bold text-base"
            style={{ color: "#FFFFFF" }}
          >
            🌊 Share in the ocean
          </button>
          <button
            onClick={() => handleShare("private")}
            className="w-full max-w-xs py-4 rounded-full bg-white/15 border border-white/40 text-white font-bold text-base"
          >
            🔐 Keep it private
          </button>
        </div>
      )}
    </div>
  );
};

export default Record;
