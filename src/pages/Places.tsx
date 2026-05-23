import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Navigation } from "lucide-react";
import PlacesFallback from "./PlacesFallback";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
if (MAPBOX_TOKEN) mapboxgl.accessToken = MAPBOX_TOKEN;

interface Pin {
  id: string;
  title: string;
  lat: number;
  lng: number;
  type: "audio" | "video";
}

const DEMO_PINS: Pin[] = [
  { id: "d1", title: "L'odeur de sa cuisine", lat: 48.8566, lng: 2.3522, type: "audio" },
  { id: "d2", title: "Our first home", lat: 25.2048, lng: 55.2708, type: "video" },
  { id: "d3", title: "صوت الجد في الصباح", lat: 24.7136, lng: 46.6753, type: "audio" },
  { id: "d4", title: "Le match de ma vie", lat: 36.7372, lng: 3.0865, type: "video" },
  { id: "d5", title: "Grandmother's recipe", lat: 51.5074, lng: -0.1278, type: "audio" },
];

const Places = () => {
  if (!MAPBOX_TOKEN) return <PlacesFallback />;

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const navigate = useNavigate();
  const { lang, rtl } = useLanguage();
  const [pins] = useState<Pin[]>(DEMO_PINS);
  const [selected, setSelected] = useState<Pin | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [25, 30],
      zoom: 2,
      attributionControl: false,
    });

    map.current.on("load", () => {
      const m = map.current!;
      try {
        if (m.getLayer("background")) m.setPaintProperty("background", "background-color", "#FDF8F0");
      } catch {}
      ["road-primary", "road-secondary", "road-street"].forEach((layer) => {
        try {
          if (m.getLayer(layer)) {
            m.setPaintProperty(layer, "line-color", "#D4AF37");
            m.setPaintProperty(layer, "line-opacity", 0.4);
          }
        } catch {}
      });
      try {
        if (m.getLayer("water")) m.setPaintProperty("water", "fill-color", "#E8D5B0");
      } catch {}
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;
    const markers: mapboxgl.Marker[] = [];
    const addPins = () => {
      pins.forEach((pin) => {
        const el = document.createElement("div");
        el.style.cssText = `
          width: 44px; height: 44px; border-radius: 50%;
          background: radial-gradient(circle, rgba(232,116,42,0.9), rgba(180,70,10,0.7));
          border: 2px solid rgba(255,200,60,0.8);
          box-shadow: 0 0 15px rgba(232,116,42,0.5), 0 0 30px rgba(232,116,42,0.2);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          animation: pinPulse 2s ease-in-out infinite; font-size: 16px;
        `;
        el.innerHTML = pin.type === "audio" ? "🎙️" : "🎬";
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setSelected(pin);
          map.current?.flyTo({ center: [pin.lng, pin.lat], zoom: 12, duration: 1500 });
        });
        const marker = new mapboxgl.Marker({ element: el }).setLngLat([pin.lng, pin.lat]).addTo(map.current!);
        markers.push(marker);
      });
    };
    if (map.current.loaded()) addPins();
    else map.current.once("load", addPins);
    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [pins]);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
      map.current?.flyTo({ center: coords, zoom: 13, duration: 2000 });
      const el = document.createElement("div");
      el.style.cssText = `
        width: 16px; height: 16px; border-radius: 50%;
        background: #38bdf8; border: 3px solid white;
        box-shadow: 0 0 20px rgba(56,189,248,0.6);
      `;
      new mapboxgl.Marker({ element: el }).setLngLat(coords).addTo(map.current!);
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden" dir={rtl ? "rtl" : "ltr"}>
      <style>{`
        @keyframes pinPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.12); } }
        .mapboxgl-ctrl-attrib, .mapboxgl-ctrl-logo { display: none !important; }
      `}</style>

      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
          padding: "56px 20px 16px",
          background: "linear-gradient(to bottom, rgba(253,248,240,0.95) 0%, transparent 100%)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#3D2B1F", fontFamily: "Georgia, serif" }}>
            {lang === "fr" ? "Lieux de Souvenirs" : lang === "ar" ? "أماكن الذكريات" : "Memory Places"}
          </h1>
          <p style={{ fontSize: "11px", color: "rgba(61,43,31,0.5)" }}>
            {pins.length} {lang === "fr" ? "souvenirs" : lang === "ar" ? "ذكريات" : "memories"}
          </p>
        </div>
        <button
          onClick={handleLocate}
          style={{
            padding: "8px 16px", borderRadius: "999px",
            background: "rgba(232,116,42,0.1)", border: "1px solid rgba(232,116,42,0.3)",
            color: "#E8742A", fontSize: "12px", fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
          }}
        >
          <Navigation size={14} />
          {lang === "fr" ? "Me localiser" : lang === "ar" ? "حدد موقعي" : "Find me"}
        </button>
      </div>

      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      <div
        style={{
          position: "absolute", bottom: selected ? 220 : 100,
          left: "50%", transform: "translateX(-50%)",
          zIndex: 10, textAlign: "center", transition: "bottom 0.3s ease",
          padding: "0 20px", pointerEvents: "none",
        }}
      >
        <p style={{ fontSize: "11px", color: "rgba(61,43,31,0.5)", fontStyle: "italic", fontFamily: "Georgia, serif" }}>
          {lang === "fr" ? "Chaque lieu porte une voix." : lang === "ar" ? "كل مكان يحمل صوتاً." : "Every place holds a voice."}
        </p>
      </div>

      {selected && (
        <div
          style={{
            position: "absolute", bottom: 80, left: 16, right: 16, zIndex: 10,
            background: "#FDF8F0", borderRadius: "20px", padding: "16px",
            border: "1px solid rgba(232,116,42,0.2)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
            display: "flex", alignItems: "center", gap: "12px",
          }}
        >
          <div
            style={{
              width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
              background: "rgba(232,116,42,0.1)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: "20px",
            }}
          >
            {selected.type === "audio" ? "🎙️" : "🎬"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: "13px", fontWeight: 700, color: "#3D2B1F",
                overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
              }}
            >
              {selected.title}
            </p>
            <p style={{ fontSize: "10px", color: "rgba(61,43,31,0.4)" }}>
              {selected.lat.toFixed(2)}°, {selected.lng.toFixed(2)}°
            </p>
          </div>
          <button
            onClick={() => navigate("/treasure")}
            style={{
              padding: "8px 16px", borderRadius: "999px",
              background: "linear-gradient(135deg, #E8742A, #D4621A)",
              color: "#fff", fontSize: "12px", fontWeight: 700,
              border: "none", cursor: "pointer", flexShrink: 0,
            }}
          >
            {lang === "fr" ? "Écouter" : lang === "ar" ? "استمع" : "Listen"}
          </button>
          <button
            onClick={() => setSelected(null)}
            style={{
              background: "none", border: "none", color: "rgba(61,43,31,0.3)",
              cursor: "pointer", fontSize: "18px", flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
      )}

      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20,
          padding: "16px 20px 32px",
          background: "linear-gradient(to top, #FDF8F0 55%, transparent)",
        }}
      >
        <button
          onClick={() => navigate("/record")}
          style={{
            width: "100%", padding: "16px", borderRadius: "18px",
            background: "linear-gradient(135deg, #E8742A, #D4621A)",
            color: "#fff", fontWeight: 700, fontSize: "14px",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            boxShadow: "0 0 0 1px rgba(232,116,42,0.3), 0 8px 28px rgba(232,116,42,0.45)",
          }}
        >
          <MapPin size={18} />
          {lang === "fr" ? "Épingler un souvenir ici" : lang === "ar" ? "أضف ذكرى هنا" : "Pin a memory here"}
        </button>
      </div>
    </div>
  );
};

export default Places;