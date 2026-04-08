import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Plus, Mic, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Memory {
  id: string;
  title: string | null;
  file_url: string;
  file_type: string | null;
  thumbnail_url: string | null;
  created_at: string;
  user_id: string;
}

interface Member {
  initial: string;
  name: string;
  color: string;
  orbitRadius: number;
  speed: number;
  size: number;
  isYou?: boolean;
}

const Circle = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("demo-user-123");
  const [copied, setCopied] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [latestMemory, setLatestMemory] = useState<Memory | null>(null);
  const [angles, setAngles] = useState<number[]>([0, 72, 144, 216, 288]);
  const animRef = useRef<number>(0);
  const anglesRef = useRef<number[]>([0, 72, 144, 216, 288]);

  const getDemoMembers = (name: string): Member[] => [
    {
      initial: name?.[0]?.toUpperCase() || "M",
      name: name || "You",
      color: "#E8742A",
      orbitRadius: 115,
      speed: 0.25,
      size: 78,
      isYou: true,
    },
    { initial: "E", name: "Emma", color: "#6B4E9B", orbitRadius: 128, speed: 0.18, size: 70 },
    { initial: "J", name: "James", color: "#38bdf8", orbitRadius: 112, speed: 0.22, size: 66 },
    { initial: "A", name: "Aisha", color: "#10b981", orbitRadius: 124, speed: 0.2, size: 72 },
    { initial: "C", name: "Carlos", color: "#f59e0b", orbitRadius: 118, speed: 0.28, size: 64 },
  ];

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);

        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", session.user.id)
          .single();

        if (profile?.display_name) setUserName(profile.display_name);

        const { data: mems } = await (supabase as any)
          .from("memories")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (mems && mems.length > 0) {
          setMemories(mems as Memory[]);
          setLatestMemory(mems[0] as Memory);
        }
      }
    };
    init();

    const speeds = [0.25, 0.18, 0.22, 0.2, 0.28];
    const animate = () => {
      anglesRef.current = anglesRef.current.map((a, i) => (a + speeds[i]) % 360);
      setAngles([...anglesRef.current]);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const inviteLink = `https://infeelit.com/join/${userId.slice(0, 8)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const name = userName || "someone special";
    const message = `${name} is preserving family memories on Infeelit 🌊\n\nJoin my family circle to share and hear our stories together.\n\n${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const cx = 185;
  const cy = 210;

  const getMemberPos = (member: Member, angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + Math.cos(rad) * member.orbitRadius - member.size / 2,
      y: cy + Math.sin(rad) * member.orbitRadius - member.size / 2,
    };
  };

  const members = getDemoMembers(userName);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 38%, rgba(184,134,11,0.2) 0%, rgba(232,116,42,0.1) 20%, rgba(10,17,40,0.97) 60%, #020810 100%)",
        backgroundColor: "#0A1128",
      }}
    >
      <style>{`
        @keyframes corePulse {
          0%, 100% { box-shadow: 0 0 40px rgba(184,134,11,0.5), 0 0 80px rgba(232,116,42,0.25), 0 0 120px rgba(107,78,155,0.15); }
          50%       { box-shadow: 0 0 70px rgba(184,134,11,0.8), 0 0 130px rgba(232,116,42,0.4), 0 0 200px rgba(107,78,155,0.25); }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.7; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .core-pulse { animation: corePulse 3s ease-in-out infinite; }
        .fade-up { animation: fadeInUp 0.6s ease forwards; }
      `}</style>

      {/* Étoiles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 0.5 + "px",
              height: Math.random() * 2 + 0.5 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animation: `starTwinkle ${Math.random() * 4 + 2}s ease-in-out infinite`,
              animationDelay: Math.random() * 4 + "s",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-14 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full text-white"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          ←
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold text-lg">Family Circle</h1>
          <p className="text-white/40 text-xs">Your constellation</p>
        </div>
        <div
          className="px-3 py-1.5 rounded-full text-xs font-bold"
          style={{
            backgroundColor: "rgba(107,78,155,0.25)",
            border: "1px solid rgba(107,78,155,0.5)",
            color: "#a78bfa",
          }}
        >
          🔒 Private
        </div>
      </div>

      {/* Canvas constellation */}
      <div className="relative mx-auto" style={{ width: "370px", height: "440px" }}>
        {/* Anneaux */}
        {[105, 120, 132].map((r, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: r * 2 + "px",
              height: r * 2 + "px",
              left: cx - r + "px",
              top: cy - r + "px",
              border: `1px solid rgba(255,255,255,${0.04 + i * 0.02})`,
            }}
          />
        ))}

        {/* Sphère centrale */}
        <div
          className="absolute core-pulse"
          style={{
            width: "110px",
            height: "110px",
            left: cx - 55 + "px",
            top: cy - 55 + "px",
            borderRadius: "50%",
            background: latestMemory?.thumbnail_url
              ? "none"
              : "radial-gradient(circle at 35% 35%, rgba(255,210,80,0.95), rgba(232,116,42,0.75), rgba(107,78,155,0.6))",
            border: "2px solid rgba(255,200,80,0.5)",
            cursor: "pointer",
            zIndex: 5,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => (latestMemory ? navigate("/treasure") : navigate("/record"))}
        >
          {latestMemory?.thumbnail_url ? (
            <>
              <img
                src={latestMemory.thumbnail_url}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.7,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(circle, rgba(232,116,42,0.4), rgba(107,78,155,0.3))",
                }}
              />
              <Play size={28} className="text-white relative z-10" />
            </>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Mic size={26} className="text-white" />
              <span className="text-white font-black uppercase" style={{ fontSize: "7px", letterSpacing: "0.1em" }}>
                Record
              </span>
            </div>
          )}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)",
            }}
          />
        </div>

        {/* Compteur souvenirs */}
        {memories.length > 0 && (
          <div
            className="absolute z-10 rounded-full flex items-center justify-center font-bold text-white"
            style={{
              width: "24px",
              height: "24px",
              left: cx + 30 + "px",
              top: cy - 55 + "px",
              backgroundColor: "#E8742A",
              fontSize: "10px",
              border: "2px solid #0A1128",
            }}
          >
            {memories.length}
          </div>
        )}

        {/* Membres orbitaux */}
        {members.map((member, i) => {
          const pos = getMemberPos(member, angles[i] || 0);
          return (
            <div
              key={member.name}
              className="absolute"
              style={{
                width: member.size + "px",
                height: member.size + "px",
                left: pos.x + "px",
                top: pos.y + "px",
                zIndex: 4,
              }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center font-bold text-white relative overflow-hidden"
                style={{
                  backgroundColor: member.color,
                  border: member.isYou ? "2.5px solid rgba(255,255,255,0.8)" : "2px solid rgba(255,255,255,0.25)",
                  boxShadow: `0 0 20px ${member.color}70`,
                  fontSize: member.size > 70 ? "20px" : "16px",
                }}
              >
                {member.initial}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%)",
                  }}
                />
              </div>
              <p
                className="text-white text-center mt-0.5 font-medium"
                style={{ fontSize: "9px", textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
              >
                {member.isYou ? "You" : member.name}
              </p>
            </div>
          );
        })}

        {/* Bouton + */}
        <button
          onClick={handleWhatsApp}
          className="absolute z-10 rounded-full flex items-center justify-center"
          style={{
            width: "48px",
            height: "48px",
            right: "16px",
            bottom: "30px",
            background: "linear-gradient(135deg, #E8742A, #D4621A)",
            boxShadow: "0 0 20px rgba(232,116,42,0.5)",
            border: "2px solid rgba(255,255,255,0.2)",
          }}
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Galerie souvenirs */}
      {memories.length > 0 && (
        <div className="px-6 mb-4 fade-up">
          <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
            Latest memories · {memories.length}
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {memories.slice(0, 5).map((mem) => (
              <div
                key={mem.id}
                className="shrink-0 rounded-2xl overflow-hidden cursor-pointer relative"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onClick={() => navigate("/treasure")}
              >
                {mem.thumbnail_url ? (
                  <img src={mem.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Mic size={20} className="text-white/30" />
                  </div>
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}
                />
                <p
                  className="absolute bottom-1 left-1 right-1 text-white font-bold truncate"
                  style={{ fontSize: "8px" }}
                >
                  {mem.title || "Memory"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invitation */}
      <div className="px-6 pb-32 fade-up">
        <div
          className="flex items-center gap-3 p-4 rounded-2xl mb-3"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>
              Your invite link
            </p>
            <p className="text-white text-sm font-mono truncate">{inviteLink}</p>
          </div>
          <button
            onClick={handleCopyLink}
            className="shrink-0 p-2.5 rounded-xl"
            style={{
              backgroundColor: copied ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.08)",
              border: copied ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-white/50" />}
          </button>
        </div>

        <button
          onClick={handleWhatsApp}
          className="w-full py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-3"
          style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", color: "#FFFFFF" }}
        >
          <span className="text-lg">💬</span>
          Invite your family on WhatsApp
        </button>

        <p className="text-center text-xs mt-2" style={{ color: "rgba(255,255,255,0.18)" }}>
          Your circle is private. Only invited members can see your memories.
        </p>
      </div>

      {/* CTA fixe */}
      <div
        className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4"
        style={{ background: "linear-gradient(to top, rgba(2,8,16,1) 60%, transparent)" }}
      >
        <button
          onClick={() => navigate("/record")}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3"
          style={{
            background: "linear-gradient(135deg, #E8742A, #D4621A)",
            color: "#FFFFFF",
            boxShadow: "0 0 30px rgba(232,116,42,0.3)",
          }}
        >
          🎙️ Record a memory for your circle
        </button>
      </div>
    </div>
  );
};

export default Circle;
