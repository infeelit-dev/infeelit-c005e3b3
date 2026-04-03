import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { X, StopCircle, Video, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Record = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);

  // États pour l'enregistrement
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // La question (le Hook) passée par le Feed
  const question = location.state?.question || "Racontez un souvenir qui a changé votre regard sur la vie.";

  // 1. Allumer la caméra dès l'arrivée sur la page
  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 1280, height: 720 },
          audio: true,
        });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;

        // Préparation du magnétophone (Recorder)
        const recorder = new MediaRecorder(s, { mimeType: "video/webm" });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
        };
        setMediaRecorder(recorder);
      } catch (err) {
        toast.error("Caméra non accessible. Vérifiez les permissions.");
      }
    }
    startCamera();
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  // 2. Le flux : Décompte 3-2-1 puis Enregistrement
  const handleStartFlow = () => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          setRecordedChunks([]); // On vide les anciens morceaux
          mediaRecorder?.start();
          setIsRecording(true);
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  // 3. Arrêt et envoi vers le Cloud (Supabase Storage)
  const handleStopAndUpload = async () => {
    if (!mediaRecorder) return;

    mediaRecorder.onstop = async () => {
      setIsUploading(true);
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const fileName = `${Date.now()}_memory.webm`;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Connectez-vous pour sauvegarder.");

        // Envoi vers le bucket 'memories'
        const { error } = await supabase.storage.from("memories").upload(`${user.id}/${fileName}`, blob);

        if (error) throw error;

        toast.success("Souvenir tissé avec succès !");
        navigate("/feed");
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors de la sauvegarde.");
      } finally {
        setIsUploading(false);
      }
    };

    mediaRecorder.stop();
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden font-sans">
      {/* RETOUR CAMÉRA PLEIN ÉCRAN */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />

      {/* GRADIENT POUR LISIBILITÉ */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />

      {/* HEADER */}
      <div className="relative z-10 p-6 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20"
        >
          <X size={24} />
        </button>
        {isRecording && (
          <div className="flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full border border-red-400 animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span className="text-[10px] text-white font-black uppercase tracking-widest">Enregistrement</span>
          </div>
        )}
      </div>

      {/* LA QUESTION (LE HOOK) */}
      <div className="mt-auto relative z-20 px-10 pb-12 text-center">
        <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em] mb-4">Votre Histoire</p>
        <h2 className="text-white text-2xl font-bold leading-tight drop-shadow-2xl italic px-4">"{question}"</h2>
      </div>

      {/* CONTRÔLES D'ACTION */}
      <div className="relative z-20 pb-20 flex justify-center items-center h-32">
        {/* État : Prêt à filmer */}
        {!isRecording && countdown === null && !isUploading && (
          <button
            onClick={handleStartFlow}
            className="w-24 h-24 bg-red-600 rounded-full border-8 border-white/20 flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 bg-white rounded-sm" />
          </button>
        )}

        {/* État : Décompte */}
        {countdown !== null && <div className="text-white text-9xl font-black animate-pulse">{countdown}</div>}

        {/* État : En cours de filmage */}
        {isRecording && (
          <button
            onClick={handleStopAndUpload}
            className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl animate-pulse"
          >
            <StopCircle size={48} className="text-red-600" />
          </button>
        )}

        {/* État : Sauvegarde sur le serveur */}
        {isUploading && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-[#E8742A] animate-spin" />
            <p className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Sauvegarde en cours...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Record;
