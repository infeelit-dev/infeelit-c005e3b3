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
  const markerElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const sheetTouchStartY = useRef(0);
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

  const setupHeatmap = (m: mapboxgl.Map, currentPins: MemoryPin[]) => {
    if (!m.getSource("memories-heat")) {
      m.addSource("memories-heat", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: currentPins.map((pin) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [pin.lng, pin.lat] },
            properties: { intensity: 1 },
          })),
        },
      });

      m.addLayer({
        id: "memories-heatmap",
        type: "heatmap",
        source: "memories-heat",
        paint: {
          "heatmap-weight": 1,
          "heatmap-intensity": 0.35,
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
          "heatmap-opacity": 0.5,
        },
      });
    } else {
      const source = m.getSource("memories-heat") as mapboxgl.GeoJSONSource;
      source.setData({
        type: "FeatureCollection",
        features: currentPins.map((pin) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [pin.lng, pin.lat] },
          properties: { intensity: 1 },
        })),
      });
    }
  };

  const createPinElement = (pin: MemoryPin) => {
    const el = document.createElement("div");
    el.className = "infeelit-pin";
    el.dataset.pinId = pin.id;
    el.innerHTML = `<div class="infeelit-pin__body"><span>✦</span></div>`;

    el.addEventListener("click", (e) => {
      e.stopPropagation();
      setSelectedPin(pin);
      map.current?.flyTo({
        center: [pin.lng, pin.lat],
        zoom: 14,
        duration: 1200,
      });
    });

    return el;
  };

  const syncMarkers = (currentPins: MemoryPin[]) => {
    if (!map.current) return;

    const pinIds = new Set(currentPins.map((p) => p.id));

    markersRef.current = markersRef.current.filter((marker) => {
      const el = marker.getElement() as HTMLDivElement;
      const id = el.dataset.pinId;
      if (!id || !pinIds.has(id)) {
        marker.remove();
        markerElementsRef.current.delete(id!);
        return false;
      }
      return true;
    });

    const existingIds = new Set(markerElementsRef.current.keys());
    currentPins.forEach((pin) => {
      if (existingIds.has(pin.id)) return;
      const el = createPinElement(pin);
      markerElementsRef.current.set(pin.id, el);
      const marker = new mapboxgl.Marker({ element: el }).setLngLat([pin.lng, pin.lat]).addTo(map.current!);
      markersRef.current.push(marker);
    });
  };

  const addUserRadar = (longitude: number, latitude: number) => {
    if (!map.current) return;

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

    new mapboxgl.Marker({ element: radarEl }).setLngLat([longitude, latitude]).addTo(map.current);
    new mapboxgl.Marker({ element: centerEl }).setLngLat([longitude, latitude]).addTo(map.current);
  };

  const fitBoundsToPins = (currentPins: MemoryPin[]) => {
    if (!map.current || currentPins.length === 0) return;
    const bounds = new mapboxgl.LngLatBounds();
    currentPins.forEach((pin) => bounds.extend([pin.lng, pin.lat]));
    map.current.fitBounds(bounds, { padding: 80, maxZoom: 12 });
  };

  // Initialiser la carte (après chargement des pins)
  useEffect(() => {
    if (!MAPBOX_TOKEN || map.current || !mapContainer.current || loading) return;

    const DUBAI_CENTER: [number, number] = [20, 30];
    const DUBAI_ZOOM = 2;

    const onMapLoad = (
      currentPins: MemoryPin[],
      userLng?: number,
      userLat?: number,
    ) => {
      const m = map.current!;
      console.log("Mapbox layers:", m.getStyle().layers.map((l) => l.id));

      try {
        m.setPaintProperty("background", "background-color", "#FDF8F0");
      } catch {
        /* layer may not exist */
      }

      ["landuse", "landcover", "national-park"].forEach((id) => {
        try {
          m.setPaintProperty(id, "fill-color", "#F5EDD8");
        } catch {
          /* layer may not exist */
        }
      });

      try {
        m.setPaintProperty("water", "fill-color", "#E8DCC8");
      } catch {
        /* layer may not exist */
      }

      ["road-primary", "road-secondary-tertiary", "road-street", "road-minor"].forEach((id) => {
        try {
          m.setPaintProperty(id, "line-color", "#D4AF37");
          m.setPaintProperty(id, "line-opacity", 0.12);
        } catch {
          /* layer may not exist */
        }
      });

      try {
        m.setPaintProperty("hillshade", "hillshade-exaggeration", 0.3);
      } catch {
        /* layer may not exist */
      }

      try {
        m.setPaintProperty("building", "fill-color", "#F0E8D8");
        m.setPaintProperty("building", "fill-opacity", 0.4);
      } catch {
        /* layer may not exist */
      }

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
        } catch {
          /* layer may not exist */
        }
      });

      setupHeatmap(m, currentPins);
      syncMarkers(currentPins);

      if (userLng !== undefined && userLat !== undefined) {
        addUserRadar(userLng, userLat);
      }
    };

    const startMap = (
      center: [number, number],
      zoom: number,
      currentPins: MemoryPin[],
      userLng?: number,
      userLat?: number,
    ) => {
      if (!mapContainer.current || map.current) return;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center,
        zoom,
        pitch: 15,
        bearing: 0,
        attributionControl: false,
      });

      map.current.on("load", () => onMapLoad(currentPins, userLng, userLat));
    };

    const initializeMap = (currentPins: MemoryPin[]) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            startMap([20, 30], 2, currentPins, longitude, latitude);
          },
          () => {
            startMap(DUBAI_CENTER, DUBAI_ZOOM, currentPins);
          },
          { timeout: 3000, maximumAge: 300000 },
        );
      } else {
        startMap(DUBAI_CENTER, DUBAI_ZOOM, currentPins);
      }
    };

    initializeMap(pins);

    return () => {
      map.current?.remove();
      map.current = null;
      markersRef.current = [];
      markerElementsRef.current.clear();
    };
  }, [loading]);

  // Sync markers + heatmap when pins change (without recreating on selection)
  useEffect(() => {
    if (!map.current || loading) return;

    const update = () => {
      setupHeatmap(map.current!, pins);
      syncMarkers(pins);
    };

    if (map.current.loaded()) {
      update();
    } else {
      map.current.once("load", update);
    }
  }, [pins, loading]);

  // État sélectionné via classList — pas de recréation des markers
  useEffect(() => {
    markerElementsRef.current.forEach((el, id) => {
      const isSelected = selectedPin?.id === id;
      el.classList.toggle("infeelit-pin--selected", isSelected);
      el.classList.toggle("infeelit-pin--dimmed", !!selectedPin && !isSelected);
    });
  }, [selectedPin]);

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

  const handleSheetTouchStart = (e: React.TouchEvent) => {
    sheetTouchStartY.current = e.touches[0].clientY;
  };

  const handleSheetTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - sheetTouchStartY.current;
    if (deltaY > 60) setSelectedPin(null);
  };

  if (!MAPBOX_TOKEN) return <PlacesFallback />;

  return (
    <div className="relative w-full h-screen overflow-hidden" dir={rtl ? "rtl" : "ltr"}>
      <Header activeTimeline="memories" onTimelineChange={() => {}} />
      <style>{`
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes radar {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .infeelit-pin {
          cursor: pointer;
          transition: opacity 0.25s ease;
        }
        .infeelit-pin__body {
          width: 36px;
          height: 44px;
          background: linear-gradient(160deg, #E8742A, #D4621A);
          border: 2px solid #D4AF37;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(232,116,42,0.4);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .infeelit-pin__body span {
          transform: rotate(45deg);
          font-size: 14px;
          color: #FFF9F2;
          filter: drop-shadow(0 0 3px rgba(212,175,55,0.8));
        }
        .infeelit-pin--selected .infeelit-pin__body {
          transform: rotate(-45deg) scale(1.15);
          box-shadow: 0 0 0 4px rgba(212,175,55,0.35), 0 8px 24px rgba(232,116,42,0.55);
        }
        .infeelit-pin--dimmed {
          opacity: 0.45;
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
      <div ref={mapContainer} style={{ width: "100%", height: "100%", minHeight: "320px" }} />

      {/* Bottom sheet du souvenir sélectionné */}
      {selectedPin && (
        <>
          <div
            onClick={() => setSelectedPin(null)}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 19,
              background: "rgba(61,43,31,0.15)",
            }}
          />
          <div
            onTouchStart={handleSheetTouchStart}
            onTouchEnd={handleSheetTouchEnd}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              background: "#FFF9F2",
              borderRadius: "24px 24px 0 0",
              padding: "12px 20px calc(24px + env(safe-area-inset-bottom))",
              boxShadow: "0 -8px 40px rgba(61,43,31,0.12)",
              animation: "sheetUp 0.35s cubic-bezier(0.32,0.72,0,1)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                background: "rgba(61,43,31,0.15)",
                margin: "0 auto 16px",
              }}
            />

            <div
              style={{
                aspectRatio: "16/9",
                borderRadius: 16,
                overflow: "hidden",
                marginBottom: 16,
                background: "linear-gradient(135deg, rgba(232,116,42,0.15), rgba(212,175,55,0.15))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selectedPin.thumbnail_url ? (
                <img
                  src={selectedPin.thumbnail_url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: 32, opacity: 0.5 }}>✦</span>
              )}
            </div>

            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#3D2B1F",
                fontFamily: "Georgia, serif",
                lineHeight: 1.35,
                marginBottom: 8,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {selectedPin.title}
            </p>
            <p
              style={{
                fontSize: 12,
                color: "rgba(61,43,31,0.5)",
                marginBottom: 16,
              }}
            >
              {selectedPin.name} ·{" "}
              {selectedPin.city ||
                (lang === "fr" ? "Lieu inconnu" : lang === "ar" ? "مكان غير معروف" : "Unknown place")}
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
        </>
      )}

      {/* Bouton épingler */}
      {!selectedPin && (
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
      )}

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
      {isDemo && !loading && !selectedPin && (
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
