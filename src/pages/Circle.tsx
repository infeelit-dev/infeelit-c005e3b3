import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Mic, Play, Volume2, Video, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Assets imports restants identiques...
import grandfatherImg from "@/assets/grandfather.jpg";
import marryImg from "@/assets/marry.jpg";
// ... (garder tes imports)

// --- Styles CSS Avancés ---
const EXTRA_STYLES = `
  .shrine-container { perspective: 1000px; }
  .glass-pill {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
  @keyframes flame-flicker {
    0%, 100% { transform: scale(1) rotate(-1deg); opacity: 0.9; }
    20% { transform: scale(1.1, 0.9) rotate(2deg); opacity: 1; }
    40% { transform: scale(0.9, 1.1) rotate(-2deg); opacity: 0.8; }
    60% { transform: scale(1.05) rotate(1deg); opacity: 0.95; }
  }
  .candle-flame {
    animation: flame-flicker 0.2s infinite alternate;
    filter: blur(0.5px);
  }
`;

const Circle = () => {
  const navigate = useNavigate();
  // ... (Garder tes states initiaux)

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden font-sans selection:bg-amber-200"
      style={{ background: "radial-gradient(circle at 50% 40%, #FDF6E9 0%, #D2B48C 100%)" }}
    >
      <style>{EXTRA_STYLES}</style>

      {/* 1. Texture de mur réaliste */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")` }}
      />

      {/* 2. Header Style "Prestige" */}
      <header className="relative z-30 px-6 pt-12 flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-900/10 text-stone-800"
        >
          ←
        </motion.button>
        <div className="text-center">
          <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">Famille Al-Fassi</h1>
          <div className="flex items-center justify-center gap-1.5 opacity-60">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-bold">12 âmes connectées</span>
          </div>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* 3. Le Cœur et la Constellation */}
      <main className="flex-1 relative z-20 mt-4">
        <div className="relative mx-auto" style={{ width: 380, height: 420 }}>
          {/* Sphère Centrale Optimisée */}
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <div className="w-36 h-36 rounded-full p-1 bg-gradient-to-br from-amber-200 to-orange-400 shadow-[0_0_60px_rgba(232,116,42,0.4)] flex items-center justify-center text-center">
              <div className="w-full h-full rounded-full bg-stone-900/5 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={sphereMode}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    {sphereMode === "question" ? (
                      <p className="text-[10px] font-medium leading-tight text-stone-900 italic">"{AI_QUESTION}"</p>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Play size={16} className="mb-1 text-orange-700" fill="currentColor" />
                        <p className="text-[9px] font-bold uppercase tracking-tighter">Dernier Éclat</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Rendu des membres flottants (DEMO_MEMBERS) ici... */}
          {/* (Utiliser Framer Motion pour chaque membre pour plus de fluidité) */}
        </div>
      </main>

      {/* 4. Le Sanctuaire : Table de Chevet 3D */}
      <section className="absolute bottom-32 left-0 z-30 shrine-container">
        <div className="relative flex items-end gap-0 pl-4">
          {/* Cadre Grand-Père */}
          <motion.div
            whileHover={{ rotate: -2, y: -5 }}
            className="relative -rotate-3 transition-transform duration-500 origin-bottom"
          >
            <div className="w-20 h-28 bg-[#4A2E0A] p-1.5 rounded-sm shadow-2xl border-2 border-amber-600/30">
              <div className="w-full h-full overflow-hidden grayscale sepia-[0.4] brightness-90">
                <img src={grandfatherImg} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <p className="text-[8px] mt-1 font-serif text-center font-bold opacity-70">Jacques</p>
          </motion.div>

          {/* La Bougie (Placée entre les deux cadres pour la profondeur) */}
          <div className="relative -ml-4 -mb-2 z-40 flex flex-col items-center">
            <div className="relative">
              <div className="w-3 h-4 bg-orange-400 rounded-full blur-[2px] candle-flame" />
              <div className="w-1.5 h-2 bg-white/80 absolute top-1 left-1/2 -translate-x-1/2 rounded-full blur-[1px]" />
            </div>
            <div className="w-6 h-16 bg-gradient-to-r from-stone-100 via-stone-50 to-stone-200 rounded-t-sm shadow-inner" />
          </div>

          {/* Cadre Grand-Mère */}
          <motion.div
            whileHover={{ rotate: 2, y: -5 }}
            className="relative rotate-2 -ml-2 transition-transform duration-500 origin-bottom"
          >
            <div className="w-16 h-24 bg-[#4A2E0A] p-1 rounded-sm shadow-xl border-2 border-amber-600/20">
              <div className="w-full h-full overflow-hidden grayscale sepia-[0.6] opacity-80">
                <img src={relaxImg} className="w-full h-full object-cover" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bord de la table */}
        <div className="h-2 w-56 bg-gradient-to-b from-amber-900 to-stone-900 rounded-r-full shadow-lg ml-2" />
      </section>

      {/* 5. Navigation & Actions (Garder ta logique de Shelf et de Filtres) */}
      <footer className="fixed bottom-0 inset-x-0 z-50 p-6 bg-gradient-to-t from-[#D2B48C] via-[#D2B48C]/90 to-transparent">
        <div className="max-w-md mx-auto space-y-4">
          <div className="glass-pill p-2 flex gap-2 overflow-x-auto no-scrollbar">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all ${activeFilter === f.id ? "bg-orange-600 text-white shadow-lg" : "bg-white/40 text-stone-800"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button className="w-full py-4 bg-stone-900 text-amber-50 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-transform">
            <Mic size={20} />
            Déposer un souvenir
          </button>
        </div>
      </footer>
    </div>
  );
};
