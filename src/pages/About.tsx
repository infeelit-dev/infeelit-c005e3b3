import { useNavigate } from "react-router-dom";
import imgGrandfather from "@/assets/grandfather.jpg";

const About = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col">
      <div className="h-[40vh] relative">
        <img src={imgGrandfather} className="w-full h-full object-cover grayscale-[20%]" alt="Legacy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCFB] to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-6 bg-white/20 backdrop-blur-md p-3 rounded-full text-white font-bold text-xs uppercase tracking-widest"
        >
          ← Back
        </button>
      </div>

      <div className="px-8 -mt-10 relative z-10">
        <h1 className="text-4xl font-black text-[#1A4D4D] mb-6 tracking-tighter">Infeelit.</h1>
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
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-12 w-full py-4 bg-[#1A4D4D] text-white rounded-full font-black uppercase tracking-widest text-sm shadow-xl"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};
export default About;
