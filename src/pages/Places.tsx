import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, X } from "lucide-react";
import Header from "@/components/Header";
import PlacesFallback from "./PlacesFallback";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
if (MAPBOX_TOKEN) mapboxgl.accessToken = MAPBOX_TOKEN;

interface MemoryPin {
  id: string;
  title: string;
  lat: number;
  lng: number;
  name: string;
  city: string | null;
  file_url: string | null;
  file_type: string | null;
  thumbnail_url: string | null;
  is_anonymous: boolean;
}

const DEMO_PINS: MemoryPin[] = [
  {
    id: "demo1",
    title: "Where my father taught me to ride",
    lat: 25.2048,
    lng: 55.2708,
    name: "Malik",
    city: "Dubai",
    file_url: null,
    file_type: null,
    thumbnail_url: null,
    is_anonymous: false,
  },
  {
    id: "demo2",
    title: "The school where everything began",
    lat: 48.8566,
    lng: 2.3522,
    name: "Sarah",
    city: "Paris",
    file_url: null,
    file_type: null,
    thumbnail_url: null,
    is_anonymous: false,
  },
  {
    id: "demo3",
    title: "My grandmother's kitchen",
    lat: 36.7538,
    lng: 3.0588,
    name: "Ahmed",
    city: "Alger",
    file_url: null,
    file_type: null,
    thumbnail_url: null,
    is_anonymous: false,
  },
  {
    id: "demo4",
    title: "Where I said yes",
    lat: 25.1972,
    lng: 55.2744,
    name: "Leila",
    city: "Dubai",
    file_url: null,
    file_type: null,
    thumbnail_url: null,
    is_anonymous: false,
  },
  {
    id: "demo5",
    title: "The stadium of my first goal",
    lat: 48.9245,
    lng: 2.3602,
    name: "Karim",
    city: "Saint-Denis",
    file_url: null,
    file_type: null,
    thumbnail_url: null,
    is_anonymous: false,
  },
];

const Places = () => {
  const navigate = useNavigate();
  const { lang, rtl } = useLanguage();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [pins, setPins] = useState<MemoryPin[]>(DEMO_PINS);
  const [selectedPin, setSelectedPin] = useState<MemoryPin | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);

  // Charger les souvenirs géolocalisés depuis Supabase
  useEffect(() => {
    const loadGeoMemories = async () => {
      setLoading(true);
      try {
        const { data: memories, error } = await supabase
          .from("memories")
          .select(
            `
            id,
            title,
            file_url,
            file_type,
            thumbnail_url,
            is_anonymous,
            is_community,
            latitude,
            longitude,
            created_at,
            user_id,
            profiles!left (display_name)
          `,
          )
          .not("latitude", "is", null)
          .not("longitude", "is", null)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        if (memories && memories.length > 0) {
          setIsDemo(false);
          const formattedPins: MemoryPin[] = memories.map((mem: any) => ({
            id: mem.id,
            title: mem.title || "Un souvenir",
            lat: mem.latitude,
            lng: mem.longitude,
            name: mem.is_anonymous ? "Un Gardien" : mem.profiles?.display_name?.split(" ")[0] || "Quelqu'un",
            city: null,
            file_url: mem.file_url,
            file_type: mem.file_type,
            thumbnail_url: mem.thumbnail_url,
            is_anonymous: mem.is_anonymous,
          }));
          setPins(formattedPins);
        } else {
          setPins(DEMO_PINS);
        }
      } catch (err) {
        console.error("Error loading geo memories:", err);
        setPins(DEMO_PINS);
      } finally {
        setLoading(false);
      }
    };
    loadGeoMemories();
  }, []);

  // Initialiser la carte
  useEffect(() => {
    if (!MAPBOX_TOKEN || map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [55.27, 25.2048],
      zoom: 12,
      pitch: 15,
      bearing: 0,
      attributionControl: false,
    });

    map.current.on("load", () => {
      const m = map.current!;

      // Définir les couleurs personnalisées après le chargement
      // Utiliser setPaintProperty sur les couches existantes

      // Fond de la carte
      try {
        m.setPaintProperty("background", "background-color", "#FDF8F0");
      } catch (e) {
        console.warn("background layer not found");
      }

      // Eau
      try {
        m.setPaintProperty("water", "fill-color", "#E8DCC8");
      } catch (e) {
        console.warn("water layer not found");
      }

      // Bâtiments
      try {
        m.setPaintProperty("building", "fill-color", "#F0E6D3");
        m.setPaintProperty("building", "fill-opacity", 0.6);
      } catch (e) {
        console.warn("building layer not found");
      }

      // Routes (essayer plusieurs noms de couches possibles)
      const roadLayers = ["road", "road-primary", "road-secondary", "road-street", "road-path"];
      roadLayers.forEach((layer) => {
        try {
          m.setPaintProperty(layer, "line-color", "#D4AF37");
          m.setPaintProperty(layer, "line-opacity", 0.3);
        } catch (e) {}
      });

      // Masquer les labels POI
      const labelLayers = [
        "poi-label",
        "road-label",
        "waterway-label",
        "natural-line-label",
        "water-label",
        "landuse-label",
        "state-label",
        "country-label",
        "settlement-label",
      ];
      labelLayers.forEach((layer) => {
        try {
          m.setLayoutProperty(layer, "visibility", "none");
        } catch (e) {}
      });

      // Ajouter une couche de fond beige si besoin
      if (!m.getLayer("custom-background")) {
        m.addLayer(
          {
            id: "custom-background",
            type: "background",
            paint: {
              "background-color": "#FDF8F0",
            },
          },
          "water",
        );
      }

      // Ajouter la source de données pour la heatmap
      m.addSource("memories-heat", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: pins.map((pin) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [pin.lng, pin.lat],
            },
            properties: { intensity: 1 },
          })),
        },
      });

      // Ajouter la couche heatmap
      m.addLayer({
        id: "memories-heatmap",
        type: "heatmap",
        source: "memories-heat",
        paint: {
          "heatmap-weight": 1,
          "heatmap-intensity": 0.6,
          "heatmap-radius": 40,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(253,248,240,0)",
            0.2,
            "rgba(232,116,42,0.1)",
            0.4,
            "rgba(232,116,42,0.2)",
            0.6,
            "rgba(232,116,42,0.35)",
            0.8,
            "rgba(255,180,40,0.5)",
            1,
            "rgba(255,200,60,0.7)",
          ],
          "heatmap-opacity": 0.8,
        },
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Ajouter les pins sur la carte
  useEffect(() => {
    if (!map.current || loading) return;

    const addMarkers = () => {
      // Nettoyer les anciens markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      pins.forEach((pin) => {
        const el = document.createElement("div");
        el.style.cssText = `
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: radial-gradient(circle at 40% 40%,
            rgba(232,116,42,0.9),
            rgba(212,98,26,0.6));
          border: 2px solid rgba(255,200,60,0.7);
          box-shadow:
            0 0 20px rgba(232,116,42,0.5),
            0 0 40px rgba(232,116,42,0.2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pinPulse 3s ease-in-out infinite;
        `;

        el.innerHTML = `<span style="font-size: 18px; filter: drop-shadow(0 0 4px rgba(255,200,60,0.8));">✦</span>`;

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setSelectedPin(pin);
          map.current?.flyTo({
            center: [pin.lng, pin.lat],
            zoom: 14,
            duration: 1200,
          });
        });

        const marker = new mapboxgl.Marker({ element: el }).setLngLat([pin.lng, pin.lat]).addTo(map.current!);

        markersRef.current.push(marker);
      });

      // Mettre à jour la heatmap
      const source = map.current?.getSource("memories-heat") as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: pins.map((pin) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [pin.lng, pin.lat],
            },
            properties: { intensity: 1 },
          })),
        });
      }
    };

    if (map.current.loaded()) {
      addMarkers();
    } else {
      map.current.once("load", addMarkers);
    }
  }, [pins, loading]);

  // Géolocalisation de l'utilisateur avec radar
  useEffect(() => {
    if (!map.current) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          // Radar émotionnel
          const radarEl = document.createElement("div");
          radarEl.style.cssText = `
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: radial-gradient(circle,
              rgba(232,116,42,0.3) 0%,
              rgba(232,116,42,0.05) 50%,
              transparent 70%);
            border: 1px solid rgba(232,116,42,0.2);
            animation: radar 2.5s ease-out infinite;
          `;

          const centerEl = document.createElement("div");
          centerEl.style.cssText = `
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #E8742A;
            border: 2px solid rgba(255,255,255,0.9);
            box-shadow: 0 0 10px rgba(232,116,42,0.8);
          `;

          new mapboxgl.Marker({ element: radarEl }).setLngLat([longitude, latitude]).addTo(map.current!);

          new mapboxgl.Marker({ element: centerEl }).setLngLat([longitude, latitude]).addTo(map.current!);
        },
        (err) => {
          console.warn("Geolocation error:", err);
        },
      );
    }
  }, []);

  const handlePinHere = () => {
    if (userLocation) {
      navigate("/record", {
        state: {
          fromPlaces: true,
          latitude: userLocation.lat,
          longitude: userLocation.lng,
        },
      });
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          navigate("/record", {
            state: {
              fromPlaces: true,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            },
          });
        },
        () => {
          navigate("/record", { state: { fromPlaces: true } });
        },
      );
    }
  };

  const handleListen = (pin: MemoryPin) => {
    navigate("/treasure", { state: { memoryId: pin.id } });
  };

  if (!MAPBOX_TOKEN) return <PlacesFallback />;

  return (
    <div className="relative w-full h-screen overflow-hidden" dir={rtl ? "rtl" : "ltr"}>
      <Header activeTimeline="memories" onTimelineChange={() => {}} />
      <style>{`
        @keyframes pinPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(232,116,42,0.5), 0 0 40px rgba(232,116,42,0.2); }
          50% { transform: scale(1.15); box-shadow: 0 0 30px rgba(232,116,42,0.7), 0 0 60px rgba(232,116,42,0.3); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes radar {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .mapboxgl-ctrl-attrib, .mapboxgl-ctrl-logo { display: none !important; }
      `}</style>

      {/* Header flottant */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: "56px 20px 16px",
          background: "linear-gradient(to bottom, rgba(253,248,240,0.95) 0%, rgba(253,248,240,0) 100%)",
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: "0.3em",
            color: "#E8742A",
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: "4px",
            pointerEvents: "auto",
          }}
        >
          {lang === "fr" ? "Atlas des émotions" : lang === "ar" ? "أطلس المشاعر" : "Atlas of Emotions"}
        </p>
        <p
          style={{
            fontSize: "13px",
            color: "rgba(61,43,31,0.5)",
            textAlign: "center",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            pointerEvents: "auto",
          }}
        >
          {lang === "fr"
            ? "Chaque lieu raconte une histoire"
            : lang === "ar"
              ? "كل مكان يروي قصة"
              : "Every place tells a story"}
        </p>
      </div>

      {/* Conteneur de la carte */}
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      {/* Popup du souvenir sélectionné */}
      {selectedPin && (
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            maxWidth: "340px",
            backgroundColor: "#FFF9F2",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(232,116,42,0.15)",
            zIndex: 20,
            animation: "slideUp 0.3s ease",
          }}
        >
          <p
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#3D2B1F",
              fontFamily: "Georgia, serif",
              lineHeight: 1.4,
              marginBottom: "8px",
            }}
          >
            "{selectedPin.title}"
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "rgba(61,43,31,0.5)",
              marginBottom: "16px",
            }}
          >
            {selectedPin.name} ·{" "}
            {selectedPin.city || (lang === "fr" ? "Lieu inconnu" : lang === "ar" ? "مكان غير معروف" : "Unknown place")}
          </p>
          <button
            onClick={() => handleListen(selectedPin)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #E8742A, #D4621A)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 16px rgba(232,116,42,0.35)",
            }}
          >
            <span>▶</span>
            {lang === "fr" ? "Écouter ce souvenir" : lang === "ar" ? "استمع لهذه الذكرى" : "Listen to this memory"}
          </button>
          <button
            onClick={handlePinHere}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              borderRadius: "14px",
              background: "none",
              border: "1px solid rgba(232,116,42,0.3)",
              color: "#E8742A",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            {lang === "fr"
              ? "Moi aussi j'ai un souvenir ici ✦"
              : lang === "ar"
                ? "أنا أيضاً لدي ذكرى هنا ✦"
                : "I also have a memory here ✦"}
          </button>
          <button
            onClick={() => setSelectedPin(null)}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(61,43,31,0.3)",
              padding: "4px",
            }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Bouton épingler */}
      <button
        onClick={handlePinHere}
        style={{
          position: "absolute",
          bottom: "100px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "14px 24px",
          borderRadius: "999px",
          background: "linear-gradient(135deg, #E8742A, #D4621A)",
          color: "#fff",
          fontWeight: 700,
          fontSize: "14px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(232,116,42,0.4)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          zIndex: 10,
          whiteSpace: "nowrap",
        }}
      >
        <MapPin size={18} />
        {lang === "fr" ? "Épingler un souvenir ici" : lang === "ar" ? "ثبّت ذكرى هنا" : "Pin a memory here"}
      </button>

      {/* Message de chargement */}
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(253,248,240,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 15,
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "2px solid rgba(232,116,42,0.2)",
              borderTopColor: "#E8742A",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Badge démo */}
      {isDemo && !loading && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "6px 12px",
            borderRadius: "999px",
            backgroundColor: "rgba(232,116,42,0.15)",
            backdropFilter: "blur(8px)",
            fontSize: "10px",
            color: "#E8742A",
            fontWeight: 600,
            zIndex: 10,
            whiteSpace: "nowrap",
          }}
        >
          ✦{" "}
          {lang === "fr"
            ? "Aperçu — épingle tes souvenirs"
            : lang === "ar"
              ? "معاينة — ثبّت ذكرياتك"
              : "Preview — pin your memories"}
        </div>
      )}
    </div>
  );
};

export default Places;
