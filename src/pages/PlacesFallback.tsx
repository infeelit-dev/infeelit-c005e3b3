import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Mic, Video, Lock, Globe, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLabel } from "@/lib/uiLabels";
import { toast } from "sonner";

// ─── Demo memory pins ─────────────────────────────────────────────────────────

interface MemoryPin {
  id: string;
  title: string;
  lat: number;
  lng: number;
  type: "audio" | "video";
  isPublic: boolean;
  isDemo: boolean;
  emoji: string;
  color: string;
}

const DEMO_PINS: MemoryPin[] = [
  {
    id: "p1",
    title: "L'odeur de sa cuisine",
    lat: 48.8566,
    lng: 2.3522,
    type: "audio",
    isPublic: false,
    isDemo: true,
    emoji: "🍽️",
    color: "#E8742A",
  },
  {
    id: "p2",
    title: "Our first home in Dubai",
    lat: 25.2048,
    lng: 55.2708,
    type: "video",
    isPublic: false,
    isDemo: true,
    emoji: "🏠",
    color: "#6B4E9B",
  },
  {
    id: "p3",
    title: "Grandmother's tajine recipe",
    lat: 36.7372,
    lng: 3.0865,
    type: "audio",
    isPublic: true,
    isDemo: true,
    emoji: "🫕",
    color: "#E8742A",
  },
  {
    id: "p4",
    title: "The day you were born",
    lat: 51.5074,
    lng: -0.1278,
    type: "video",
    isPublic: false,
    isDemo: true,
    emoji: "👶",
    color: "#38bdf8",
  },
  {
    id: "p5",
    title: "Dad's lesson about courage",
    lat: 33.8869,
    lng: 9.5375,
    type: "audio",
    isPublic: false,
    isDemo: true,
    emoji: "💪",
    color: "#6B4E9B",
  },
  {
    id: "p6",
    title: "صوت الجد في الصباح",
    lat: 24.7136,
    lng: 46.6753,
    type: "audio",
    isPublic: false,
    isDemo: true,
    emoji: "🌅",
    color: "#E8742A",
  },
  {
    id: "p7",
    title: "Le pacte de sang",
    lat: 43.2965,
    lng: 5.3698,
    type: "video",
    isPublic: false,
    isDemo: true,
    emoji: "🤝",
    color: "#38bdf8",
  },
];

// ─── World map SVG paths (simplified continents) ──────────────────────────────

const CONTINENTS = [
  // North America
  "M 82 95 L 95 88 L 115 85 L 130 90 L 145 88 L 158 95 L 165 108 L 162 125 L 155 138 L 148 145 L 140 155 L 132 165 L 125 158 L 118 150 L 108 148 L 98 140 L 88 128 L 80 115 Z",
  // South America
  "M 130 168 L 145 162 L 158 168 L 165 180 L 168 195 L 165 215 L 158 230 L 148 240 L 138 245 L 128 240 L 120 228 L 118 212 L 122 195 L 126 180 Z",
  // Europe
  "M 250 78 L 268 72 L 285 75 L 295 82 L 298 92 L 290 100 L 278 105 L 268 102 L 258 108 L 248 105 L 242 95 L 245 85 Z",
  // Africa
  "M 252 112 L 275 108 L 295 110 L 308 120 L 315 138 L 318 158 L 315 178 L 308 195 L 295 210 L 278 218 L 262 215 L 248 205 L 240 188 L 238 168 L 242 148 L 248 130 Z",
  // Asia
  "M 298 68 L 330 60 L 368 58 L 405 62 L 435 72 L 448 85 L 445 100 L 432 112 L 415 118 L 395 122 L 375 125 L 355 120 L 335 115 L 318 108 L 305 98 L 295 85 Z",
  // Middle East
  "M 295 100 L 318 95 L 332 100 L 338 115 L 330 128 L 315 132 L 300 128 L 292 115 Z",
  // Australia
  "M 388 185 L 415 178 L 438 182 L 450 195 L 452 212 L 445 225 L 428 232 L 408 230 L 392 222 L 382 208 L 382 195 Z",
  // Greenland
  "M 168 45 L 195 38 L 218 42 L 225 55 L 218 65 L 198 68 L 178 62 L 165 52 Z",
  // Japan
  "M 435 85 L 445 80 L 452 88 L 448 98 L 438 100 L 432 92 Z",
  // UK
  "M 245 80 L 252 76 L 258 80 L 255 90 L 248 92 L 242 87 Z",
];

// ─── Lat/Lng to SVG coordinate conversion ─────────────────────────────────────

const latLngToXY = (lat: number, lng: number, width: number, height: number) => {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
};

// ─── Main component ───────────────────────────────────────────────────────────

const Places = () => {
  const navigate = useNavigate();
  const { lang, rtl } = useLanguage();

  const [pins, setPins] = useState<MemoryPin[]>(DEMO_PINS);
  const [selectedPin, setSelectedPin] = useState<MemoryPin | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [isDemo, setIsDemo] = useState(true);
  const [mapSize, setMapSize] = useState({ w: 500, h: 280 });
  const mapRef = useRef<SVGSVGElement>(null);

  const T = {
    title: { en: "Memory Places", fr: "Lieux de Souvenirs", ar: "أماكن الذكريات" },
    subtitle: {
      en: "Every memory has a place where it was born.",
      fr: "Chaque souvenir a un lieu où il est né.",
      ar: "لكل ذكرى مكان وُلدت فيه.",
    },
    locate: { en: "Find me", fr: "Me localiser", ar: "حدد موقعي" },
    locating: { en: "Locating...", fr: "Localisation...", ar: "جارٍ التحديد..." },
    pin: { en: "Pin a memory here", fr: "Épingler un souvenir", ar: "أضف ذكرى هنا" },
    demo: {
      en: "Preview — connect to see your memories on the map",
      fr: "Aperçu — connectez-vous pour voir vos souvenirs",
      ar: "معاينة — سجّل دخولك لرؤية ذكرياتك على الخريطة",
    },
    listen: { en: "Listen", fr: "Écouter", ar: "استمع" },
    close: { en: "Close", fr: "Fermer", ar: "إغلاق" },
    noMemories: { en: "No memories pinned yet", fr: "Aucun souvenir épinglé", ar: "لا توجد ذكريات مثبتة بعد" },
  };

  const t = (key: keyof typeof T) => T[key][lang as "en" | "fr" | "ar"] || T[key].en;

  useEffect(() => {
    const loadRealMemories = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      setIsDemo(false);

      const { data: mems } = await (supabase as any)
        .from("memories")
        .select("id, title, file_type, is_public, latitude, longitude")
        .eq("user_id", session.user.id)
        .not("latitude", "is", null);

      if (mems?.length) {
        const realPins: MemoryPin[] = mems.map((m: any) => ({
          id: m.id,
          title: m.title || "A memory",
          lat: m.latitude,
          lng: m.longitude,
          type: m.file_type === "audio" ? "audio" : "video",
          isPublic: m.is_public,
          isDemo: false,
          emoji: m.file_type === "audio" ? "🎙️" : "🎬",
          color: "#E8742A",
        }));
        setPins(realPins);
      }
    };
    loadRealMemories();
  }, []);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success(lang === "ar" ? "تم تحديد موقعك" : lang === "fr" ? "Position trouvée !" : "Location found!");
      },
      () => {
        setLocating(false);
        toast.error(
          lang === "ar" ? "تعذر الوصول إلى الموقع" : lang === "fr" ? "Position inaccessible" : "Location unavailable",
        );
      },
    );
  };

  const svgW = 500;
  const svgH = 280;

  return (
    <div
      className="min-h-screen flex flex-col"
      dir={rtl ? "rtl" : "ltr"}
      style={{
        background: "linear-gradient(180deg, #0a1628 0%, #0d2240 40%, #091830 100%)",
        fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit",
      }}
    >
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,.1)", color: "#fff" }}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold text-lg">{t("title")}</h1>
          <p className="text-white/40 text-[10px] uppercase tracking-widest">
            {pins.length} {lang === "ar" ? "ذكريات" : lang === "fr" ? "souvenirs" : "memories"}
          </p>
        </div>
        <button
          onClick={handleLocate}
          disabled={locating}
          style={{
            padding: "8px 14px",
            borderRadius: "999px",
            backgroundColor: locating ? "rgba(255,255,255,.1)" : "rgba(232,116,42,.2)",
            border: "1px solid rgba(232,116,42,.4)",
            color: "#E8742A",
            fontSize: "11px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <Navigation size={13} />
          {locating ? t("locating") : getLabel("locate", lang)}
        </button>
      </div>

      {/* Demo banner */}
      {isDemo && (
        <div
          style={{
            margin: "0 20px 8px",
            padding: "8px 14px",
            borderRadius: "12px",
            backgroundColor: "rgba(232,116,42,.12)",
            border: "1px solid rgba(232,116,42,.25)",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "10px", color: "rgba(232,116,42,.8)", fontWeight: 600 }}>✦ {t("demo")}</p>
        </div>
      )}

      {/* Map */}
      <div
        style={{
          margin: "0 16px",
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,.08)",
          backgroundColor: "#0a1e3a",
          boxShadow: "0 8px 32px rgba(0,0,0,.4)",
          position: "relative",
        }}
      >
        <svg
          ref={mapRef}
          viewBox={`0 0 ${svgW} ${svgH}`}
          style={{ width: "100%", display: "block" }}
          onClick={() => setSelectedPin(null)}
        >
          {/* Ocean background */}
          <rect width={svgW} height={svgH} fill="#0a1e3a" />

          {/* Grid lines */}
          {[0, 60, 120, 180, 240, 300, 360, 420, 480].map((x) => (
            <line key={`vl-${x}`} x1={x} y1={0} x2={x} y2={svgH} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          ))}
          {[0, 70, 140, 210, 280].map((y) => (
            <line key={`hl-${y}`} x1={0} y1={y} x2={svgW} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          ))}

          {/* Equator */}
          <line
            x1={0}
            y1={svgH / 2}
            x2={svgW}
            y2={svgH / 2}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.8"
            strokeDasharray="4 4"
          />

          {/* Continents */}
          {CONTINENTS.map((d, i) => (
            <path key={i} d={d} fill="rgba(30,80,120,0.7)" stroke="rgba(100,180,220,0.2)" strokeWidth="0.8" />
          ))}

          {/* User position */}
          {userPos &&
            (() => {
              const { x, y } = latLngToXY(userPos.lat, userPos.lng, svgW, svgH);
              return (
                <g>
                  <circle cx={x} cy={y} r={10} fill="rgba(56,189,248,0.2)">
                    <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r={5} fill="#38bdf8" stroke="#fff" strokeWidth="1.5" />
                </g>
              );
            })()}

          {/* Memory pins */}
          {pins.map((pin) => {
            const { x, y } = latLngToXY(pin.lat, pin.lng, svgW, svgH);
            const isSelected = selectedPin?.id === pin.id;
            return (
              <g
                key={pin.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPin(isSelected ? null : pin);
                }}
                style={{ cursor: "pointer" }}
              >
                {/* Pulse ring */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 18 : 12}
                  fill={`${pin.color}20`}
                  stroke={pin.color}
                  strokeWidth={isSelected ? 1.5 : 1}
                  opacity={isSelected ? 0.9 : 0.6}
                >
                  {!isSelected && <animate attributeName="r" values="8;14;8" dur="3s" repeatCount="indefinite" />}
                </circle>
                {/* Pin dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 7 : 5}
                  fill={pin.color}
                  stroke="#fff"
                  strokeWidth={isSelected ? 2 : 1}
                />
                {/* Emoji */}
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize={isSelected ? "9" : "7"}
                  style={{ userSelect: "none" }}
                >
                  {pin.emoji}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            display: "flex",
            gap: "8px",
          }}
        >
          {[
            { color: "#E8742A", label: lang === "ar" ? "ذكرياتك" : lang === "fr" ? "Vos souvenirs" : "Your memories" },
            { color: "#38bdf8", label: lang === "ar" ? "أنت هنا" : lang === "fr" ? "Vous ici" : "You here" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "3px 8px",
                borderRadius: "999px",
                backgroundColor: "rgba(0,0,0,.5)",
                backdropFilter: "blur(4px)",
              }}
            >
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: item.color }} />
              <span style={{ fontSize: "8px", color: "rgba(255,255,255,.6)", fontWeight: 600 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected pin detail */}
      {selectedPin && (
        <div
          style={{
            margin: "12px 16px 0",
            padding: "16px",
            borderRadius: "18px",
            backgroundColor: "rgba(255,255,255,.06)",
            border: `1px solid ${selectedPin.color}40`,
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              flexShrink: 0,
              backgroundColor: `${selectedPin.color}25`,
              border: `1px solid ${selectedPin.color}50`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            {selectedPin.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#fff",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {selectedPin.title}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
              {selectedPin.type === "audio" ? (
                <Mic size={10} color="rgba(255,255,255,.4)" />
              ) : (
                <Video size={10} color="rgba(255,255,255,.4)" />
              )}
              {selectedPin.isPublic ? (
                <Globe size={10} color="rgba(255,255,255,.4)" />
              ) : (
                <Lock size={10} color="rgba(255,255,255,.4)" />
              )}
              <span style={{ fontSize: "9px", color: "rgba(255,255,255,.35)" }}>
                {selectedPin.isDemo
                  ? lang === "ar"
                    ? "معاينة"
                    : lang === "fr"
                      ? "Aperçu"
                      : "Preview"
                  : selectedPin.isPublic
                    ? lang === "ar"
                      ? "عام"
                      : lang === "fr"
                        ? "Public"
                        : "Public"
                    : lang === "ar"
                      ? "خاص"
                      : lang === "fr"
                        ? "Privé"
                        : "Private"}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate("/treasure")}
            style={{
              padding: "8px 14px",
              borderRadius: "999px",
              flexShrink: 0,
              background: `linear-gradient(135deg, ${selectedPin.color}, ${selectedPin.color}cc)`,
              color: "#fff",
              fontSize: "11px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
          >
            {t("listen")}
          </button>
        </div>
      )}

      {/* Memory list */}
      <div style={{ padding: "16px 16px 120px" }}>
        <p
          style={{
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: ".16em",
            color: "rgba(255,255,255,.3)",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          {lang === "ar" ? "كل الذكريات" : lang === "fr" ? "Tous les souvenirs" : "All memories"}
        </p>

        {pins.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              backgroundColor: "rgba(255,255,255,.04)",
              borderRadius: "16px",
              border: "1px dashed rgba(255,255,255,.1)",
            }}
          >
            <MapPin size={32} color="rgba(255,255,255,.15)" style={{ margin: "0 auto 12px" }} />
            <p style={{ color: "rgba(255,255,255,.35)", fontSize: "13px" }}>{t("noMemories")}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {pins.map((pin) => (
              <button
                key={pin.id}
                onClick={() => setSelectedPin(pin)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "14px",
                  textAlign: "left",
                  backgroundColor: selectedPin?.id === pin.id ? "rgba(232,116,42,.12)" : "rgba(255,255,255,.04)",
                  border:
                    selectedPin?.id === pin.id ? "1px solid rgba(232,116,42,.3)" : "1px solid rgba(255,255,255,.06)",
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    flexShrink: 0,
                    backgroundColor: `${pin.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                  }}
                >
                  {pin.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#fff",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {pin.title}
                  </p>
                  <p style={{ fontSize: "9px", color: "rgba(255,255,255,.3)", marginTop: "2px" }}>
                    {pin.lat.toFixed(2)}°, {pin.lng.toFixed(2)}°
                  </p>
                </div>
                <MapPin size={14} color={pin.color} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 20px 32px",
          background: "linear-gradient(to top, #091830 55%, transparent)",
          zIndex: 50,
        }}
      >
        <button
          onClick={() => navigate("/record")}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, #E8742A, #D4621A)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 0 0 1px rgba(232,116,42,.3), 0 8px 28px rgba(232,116,42,.45)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <MapPin size={18} />
          {lang === "ar" ? "سجّل ذكرى بموقعها" : lang === "fr" ? "Enregistrer un souvenir ici" : "Pin a memory here"}
        </button>
      </div>
    </div>
  );
};

export default Places;
