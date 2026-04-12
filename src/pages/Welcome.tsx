import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import infeelit from "@/assets/infeelit-logo.png";

const Welcome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const incomingQuestion = location.state?.question as string | undefined;
  const context = location.state?.context as string | undefined;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          // CORRECTION ICI : On envoie vers l'aiguilleur et non plus vers treasure en direct
          emailRedirectTo: window.location.origin + "/auth/callback",
        },
      });

      if (error) throw error;
      toast.success("Your key is on its way. ✉️");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-canvas px-6">
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <img
          src={infeelit}
          alt="Infeelit"
          className="w-[280px] md:w-[350px] max-w-[80vw] h-auto object-contain mx-auto"
        />

        <div className="text-center max-w-sm space-y-3 px-4">
          <p className="text-xl text-primary leading-relaxed" style={{ fontFamily: "'serif'" }}>
            Your family's voice, preserved forever.
          </p>
          <p className="text-sm font-medium leading-relaxed pt-2" style={{ color: "#1A1A1A" }}>
            The private space where stories live, grow, and never disappear.
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm pb-12 space-y-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Your email to enter"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-[85%] mx-auto block p-4 rounded-full border border-gray-200 text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-[85%] mx-auto block py-4 rounded-full font-bold text-base tracking-wide transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-white"
            style={{
              background: "linear-gradient(135deg, #E8742A, #D4621A)",
            }}
          >
            {loading ? "Sending..." : "Begin my story"}
          </button>
        </form>

        <p className="text-center text-[10px] text-muted-foreground/60 px-4 italic">
          The art of transmission starts here.
        </p>
      </div>
    </div>
  );
};

export default Welcome;
