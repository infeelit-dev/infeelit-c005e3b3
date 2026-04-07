import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { X, StopCircle, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";

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

// Upload vers Cloudflare R2
const uploadToR2 = async (blob: Blob, fileName: string): Promise<string> => {
  const endpoint = import.meta.env.VITE_R2_ENDPOINT;
  const accessKeyId = import.meta.env.VITE_R2_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;
  const bucketName = import.meta.env.VITE_R2_BUCKET_NAME || "infeelit-memories";

  const url = `${endpoint}/${bucketName}/${fileName}`;

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const timeStr = now.toISOString().slice(11, 19).replace(/:/g, "");
  const datetime = `${dateStr}T${timeStr}Z`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "video/webm",
      "X-Amz-Date": datetime,
      Authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${dateStr}/auto/s3/aws4_request`,
    },
    body: blob,
  });

  if (!response.ok) {
    throw new Error(`R2 upload failed: ${response.status}`);
  }

  return url;
};

type Stage = "question" | "countdown" | "recording" | "uploading" | "followup" | "title" | "share";

const Record = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [stage, setStage] = useState<Stage>("question");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [followupIndex, setFollowupIndex] = useState(0);
  const [memoryTitle, setMemoryTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const question = location.state?.question || "What smell instantly brings you back to your childhood home?";

  const theme = getTheme(question);
  const followups = FOLLOWUP_QUESTIONS[theme];

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 1280, height: 720 },
          audio: true,
        });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;

        const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm";

        const recorder = new MediaRecorder(s, { mimeType });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        setMediaRecorder(recorder);
      } catch {
        toast.error("Camera not accessible. Please check your permissions.");
      }
    }
    startCamera();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

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
          return 3;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStop = async () => {
    if (!mediaRecorder) return;
    setStage("uploading");

    mediaRecorder.requestData();

    mediaRecorder.onstop = async () => {
      try {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });

        if (blob.size === 0) {
          toast.error("No video recorded. Please try again.");
          setStage("recording");
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id || "anonymous";
        const fileName = `${userId}/${Date.now()}_memory.webm`;

        let uploadedUrl = "";

        try {
          // Upload vers Cloudflare R2 en priorité
          uploadedUrl = await uploadToR2(blob, fileName);
          toast.success("Memory saved to your cloud.");
        } catch (r2Error) {
          console.warn("R2 failed, falling back to Supabase:", r2Error);
          // Fallback vers Supabase si R2 échoue
          if (user) {
            const { data } = await supabase.storage
              .from("memories")
              .upload(fileName, blob, { contentType: "video/webm" });
            if (data) {
              const { data: urlData } = supabase.storage.from("memories").getPublicUrl(fileName);
              uploadedUrl = urlData.publicUrl;
            }
          }
        }

        // Sauvegarde l'URL dans Supabase database
        if (user && uploadedUrl) {
          await supabase.from("memories").insert({
            user_id: user.id,
            video_url: uploadedUrl,
            question: question,
            title: "",
            storage: uploadedUrl.includes("cloudflare") ? "r2" : "supabase",
          });
        }

        setVideoUrl(uploadedUrl);

        const titles = POETIC_TITLES[theme];
        setMemoryTitle(titles[Math.floor(Math.random() * titles.length)]);
        setStage("followup");
      } catch (err) {
        console.error(err);
        toast.error("Error saving your memory. Please try again.");
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

  const handleShare = (type: "circle" | "public" | "private") => {
    stream?.getTracks().forEach((t) => t.stop());
    if (type === "circle") toast.success("Shared with your family circle.");
    else if (type === "public") toast.success("Shared in the ocean.");
    else toast.success("Memory kept privately.");
    navigate("/feed");
  };

  const stopAndLeave = () => {
    stream?.getTracks().forEach((t) => t.stop());
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden font-sans">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          stage === "recording" ? "opacity-80" : "opacity-20"
        }`}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />

      <div className="relative z-10 p-6">
        <button
          onClick={stopAndLeave}
          className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20"
        >
          <X size={24} />
        </button>
      </div>

      {/* STAGE 1 — QUESTION */}
      {stage === "question" && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-8 text-center gap-8">
          <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em]">Your Story</p>
          <h2 className="text-white text-2xl font-bold leading-tight italic">"{question}"</h2>
          <p className="text-white/50 text-sm">Take a breath. Speak from the heart.</p>
          <button
            onClick={startCountdown}
            className="mt-4 px-10 py-4 rounded-full gradient-orange font-bold text-lg"
            style={{ color: "#FFFFFF" }}
          >
            I'm ready
          </button>
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
              <span className="text-[10px] text-white font-black uppercase tracking-widest">Recording</span>
            </div>
          </div>
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
              className="w-full py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold text-base"
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
            className="w-full max-w-xs py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold text-base"
          >
            🔐 Keep it private
          </button>
        </div>
      )}
    </div>
  );
};

export default Record;
