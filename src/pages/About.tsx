import { useNavigate } from "react-router-dom";
import imgGrandfather from "@/assets/grandfather.jpg";
import infeeilitTexte from "@/assets/infeelit_texte_logo.png";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col">
      {/* Image hero en noir et blanc sépia */}
      <div className="h-[40vh] relative">
        <img src={imgGrandfather} className="w-full h-full object-cover grayscale sepia" alt="Legacy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCFB] to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-6 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold text-xs uppercase tracking-widest"
        >
          ← Back
        </button>
      </div>

      {/* Contenu */}
      <div className="px-8 -mt-10 relative z-10 pb-12">
        {/* Logo texte Infeelit avec le double e infini — fond transparent */}
        <img src={infeeilitTexte} alt="Infeelit" className="w-[220px] h-auto object-contain mb-6" />

        <div className="space-y-6 text-[#4A5568] leading-relaxed font-medium">
          <p>
            We believe that silence is the only thing that truly dies. Every life is a library of stories, lessons, and
            emotions that deserve to be heard by the ones who follow.
          </p>

          <p className="border-l-4 border-[#F97316] pl-4 italic">
            "Your voice is the bridge between yesterday's wisdom and tomorrow's dreams."
          </p>

          <p>
            Our mission is to help you capture the essence of your journey, one memory at a time, through a personalized
            and emotional AI experience.
          </p>

          <p>Don't write your story. Live it out loud.</p>
        </div>

        {/* Bouton CTA orange */}
        <button
          onClick={() => navigate("/")}
          className="mt-12 w-full py-4 rounded-full gradient-orange font-black uppercase tracking-widest text-sm shadow-xl"
          style={{ color: "#FFFFFF" }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default About;
