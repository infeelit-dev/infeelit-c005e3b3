import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { X, StopCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Record = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const question = location.state?.question || "Tell me about a memory that changed the way you see life.";

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
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        setMediaRecorder(recorder);
      } catch (err) {
        toast.error("Camera not accessible. Please check your permissions.");
      }
    }
    startCamera();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleStartFlow = () => {
    recordedChunksRef.current = [];
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          mediaRecorder?.start(100);
          setIsRecording(true);
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const handleStopAndUpload = async () => {
    if (!mediaRecorder) return;
    setIsRecording(false);

    mediaRecorder.requestData();

    mediaRecorder.onstop = async () => {
      setIsUploading(true);
      try {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });

        if (blob.size === 0) {
          toast.error("No video recorded. Please try again.");
          setIsUploading(false);
          return;
        }

        const fileName = `${Date.now()}_memory.webm`;
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          toast.error("Please log in to save your memory.");
          setIsUploading(false);
          return;
        }

        const { error } = await supabase.storage.from("memories").upload(`${user.id}/${fileName}`, blob, {
          contentType: "video/webm",
          upsert: false,
        });

        if (error) throw error;

        toast.success("Memory saved successfully.");
        stream?.getTracks().forEach((t) => t.stop());
        navigate("/feed");
      } catch (err) {
        console.error(err);
        toast.error("Error saving your memory. Please try again.");
        setIsUploading(false);
      }
    };

    mediaRecorder.stop();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden font-sans">
      {/* Caméra plein écran */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />

      {/* Gradient */}
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

        {isRecording && (
          <div className="flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full border border-red-400 animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span className="text-[10px] text-white font-black uppercase tracking-widest">Recording</span>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="mt-auto relative z-20 px-10 pb-12 text-center">
        <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em] mb-4">Your Story</p>
        <h2 className="text-white text-2xl font-bold leading-tight drop-shadow-2xl italic px-4">"{question}"</h2>
      </div>

      {/* Contrôles */}
      <div className="relative z-20 pb-20 flex justify-center items-center h-32">
        {/* Prêt à filmer */}
        {!isRecording && countdown === null && !isUploading && (
          <button
            onClick={handleStartFlow}
            className="w-24 h-24 bg-red-600 rounded-full border-8 border-white/20 flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 bg-white rounded-sm" />
          </button>
        )}

        {/* Décompte 3-2-1 */}
        {countdown !== null && <div className="text-white text-9xl font-black animate-pulse">{countdown}</div>}

        {/* En cours de filmage */}
        {isRecording && (
          <button
            onClick={handleStopAndUpload}
            className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          >
            <StopCircle size={48} className="text-red-600" />
          </button>
        )}

        {/* Sauvegarde */}
        {isUploading && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-[#E8742A] animate-spin" />
            <p className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Weaving your memory...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Record;
