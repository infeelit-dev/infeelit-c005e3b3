import { useState, useRef, useCallback, useEffect } from "react";
import { X, Video, Square, RotateCcw } from "lucide-react";
import type { BubbleCategory } from "./MemoryBubble";

interface CaptureScreenProps {
  question: string;
  category: BubbleCategory;
  onClose: () => void;
  onSave: (videoBlob: Blob) => void;
}

const MAX_DURATION = 120; // 2 minutes
const MIN_DURATION = 30;

const categoryLabel: Record<BubbleCategory, string> = {
  past: "Past Memory",
  future: "Forever",
  family: "Family Circle",
};

const categoryAccent: Record<BubbleCategory, string> = {
  past: "from-purple-500/80 to-purple-400/60",
  future: "from-orange-500/80 to-orange-400/60",
  family: "from-amber-500/80 to-yellow-400/60",
};

const CaptureScreen = ({ question, category, onClose, onSave }: CaptureScreenProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [cameraReady, setCameraReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start camera
  const startCamera = useCallback(async (facing: "user" | "environment") => {
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraReady(true);
      setError(null);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Camera access denied. Please allow camera permissions and try again.");
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flipCamera = () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    startCamera(next);
  };

  // Recording controls
  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mr = new MediaRecorder(streamRef.current, { mimeType: "video/webm;codecs=vp9,opus" });

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
    };

    mr.start(1000);
    mediaRecorderRef.current = mr;
    setRecording(true);
    setElapsed(0);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= MAX_DURATION) {
          stopRecording();
          return MAX_DURATION;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const retake = () => {
    setRecordedBlob(null);
    setElapsed(0);
    startCamera(facingMode);
  };

  const handleSave = () => {
    if (recordedBlob) {
      onSave(recordedBlob);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const tooShort = elapsed < MIN_DURATION && !recording;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Camera feed */}
      <div className="relative flex-1 overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-center glass-surface-strong rounded-2xl p-6 max-w-sm">
              <p className="text-white font-semibold text-sm">{error}</p>
              <button
                onClick={() => startCamera(facingMode)}
                className="mt-4 px-4 py-2 gradient-orange rounded-full text-white text-sm font-bold"
              >
                Try again
              </button>
            </div>
          </div>
        ) : recordedBlob ? (
          <video
            src={URL.createObjectURL(recordedBlob)}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
          />
        )}

        {/* Question overlay — top, transparent, always visible during recording/preview */}
        <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
          <div className={`mx-4 mt-16 rounded-2xl bg-gradient-to-r ${categoryAccent[category]} backdrop-blur-xl border border-white/30 p-4 shadow-lg`}>
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/70 block mb-1">
              {categoryLabel[category]}
            </span>
            <p className="text-white font-bold text-base leading-snug text-shadow-soft">
              {question}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            if (recording) stopRecording();
            onClose();
          }}
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Timer */}
        {(recording || recordedBlob) && (
          <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
            {recording && <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />}
            <span className="text-white font-mono font-bold text-sm bg-black/40 backdrop-blur rounded-full px-3 py-1">
              {formatTime(elapsed)}
            </span>
          </div>
        )}

        {/* Flip camera */}
        {!recordedBlob && cameraReady && (
          <button
            onClick={flipCamera}
            className="absolute bottom-28 right-5 z-20 w-11 h-11 rounded-full bg-black/40 backdrop-blur flex items-center justify-center"
          >
            <RotateCcw className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Bottom controls */}
      <div className="bg-black/80 backdrop-blur-lg px-6 py-6 flex items-center justify-center gap-8">
        {recordedBlob ? (
          <>
            <button
              onClick={retake}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-14 h-14 rounded-full border-2 border-white/40 flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-white" />
              </div>
              <span className="text-white/70 text-[10px] font-semibold">Retake</span>
            </button>
            <button
              onClick={handleSave}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-16 h-16 rounded-full gradient-orange fab-glow flex items-center justify-center">
                <span className="text-white font-bold text-sm">Save</span>
              </div>
              <span className="text-white/70 text-[10px] font-semibold">Keep</span>
            </button>
          </>
        ) : (
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={!cameraReady}
            className="relative"
          >
            <div className={`w-20 h-20 rounded-full border-4 border-white/60 flex items-center justify-center transition-all duration-300 ${
              recording ? "border-red-400" : ""
            }`}>
              {recording ? (
                <Square className="w-8 h-8 text-red-500 fill-red-500" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-red-500" />
              )}
            </div>
            {!recording && cameraReady && (
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-[10px] whitespace-nowrap font-medium">
                Tap to record
              </span>
            )}
          </button>
        )}
      </div>

      {/* Min duration warning */}
      {tooShort && recordedBlob && elapsed > 0 && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-red-500/80 backdrop-blur rounded-full px-4 py-1.5 text-white text-xs font-semibold">
          Minimum 30 seconds required
        </div>
      )}
    </div>
  );
};

export default CaptureScreen;
