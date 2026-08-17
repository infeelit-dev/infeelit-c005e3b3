import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Map, { Marker, Popup, NavigationControl, GeolocateControl, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLabel } from "@/lib/uiLabels";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, X } from "lucide-react";
import Header from "@/components/Header";

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
  location_visibility?: string | null;
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
    location_visibility: "family",
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
    location_visibility: "public",
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
    location_visibility: "following",
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
    location_visibility: "family",
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
    location_visibility: "public",
  },
];

const Places = () => {
  const navigate = useNavigate();
  const { lang, rtl } = useLanguage();
  const sheetTouchStartY = useRef(0);
  const [pins, setPins] = useState<MemoryPin[]>(DEMO_PINS);
  const [selectedPin, setSelectedPin] = useState<MemoryPin | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [viewState, setViewState] = useState({
    longitude: 20,
    latitude: 30,
    zoom: 2,
    pitch: 45,
    bearing: 0,
  });
  const [selectedMemory, setSelectedMemory] = useState<MemoryPin | null>(null);
  const [filters, setFilters] = useState({
    family: true,
    following: true,
    public: true,
  });
  const [locationVisibility, setLocationVisibility] = useState<"family" | "following" | "public">("family");

  const toggleFilter = (key: "family" | "following" | "public") => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getMarkerColor = (memory: MemoryPin) => {
    const vis = memory.location_visibility || "private";
    if (vis === "family") return "#D4AF37";
    if (vis === "following") return "#E8742A";
    if (vis === "public") return "#ffffff";
    return "#666666";
  };

  const userPosition = userLocation ? ([userLocation.lat, userLocation.lng] as [number, number]) : null;

  const filteredMemories = pins.filter((m) => {
    if (!m.lat || !m.lng) return false;
    const vis = m.location_visibility || "private";
    if (vis === "family") return filters.family;
    if (vis === "following") return filters.following;
    if (vis === "public") return filters.public;
    return false;
  });

  const searchAddress = async () => {
    if (!searchQuery.trim()) return;
    const apiKey = import.meta.env.VITE_STADIA_API_KEY;
    try {
      const response = await fetch(
        `https://api.stadiamaps.com/geocoding/v1/search?text=${encodeURIComponent(searchQuery)}&api_key=${apiKey}`,
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        setViewState((prev) => ({
          ...prev,
          longitude: lng,
          latitude: lat,
          zoom: 16,
          pitch: 45,
        }));
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
  };

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
            location_visibility,
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
            location_visibility: mem.location_visibility,
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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        () => {},
        { timeout: 3000, maximumAge: 300000 },
      );
    }
  }, []);

  const handlePinHere = () => {
    if (userLocation) {
      navigate("/record", {
        state: {
          fromPlaces: true,
          latitude: userPosition?.[0],
          longitude: userPosition?.[1],
          locationVisibility,
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
              locationVisibility,
            },
          });
        },
        () => {
          navigate("/record", { state: { fromPlaces: true, locationVisibility } });
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

  const stadiaApiKey = import.meta.env.VITE_STADIA_API_KEY;

  return (
    <div className="relative w-full h-screen overflow-hidden" dir={rtl ? "rtl" : "ltr"}>
      <Header activeTimeline="memories" onTimelineChange={() => {}} />
      <style>{`
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
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
      {!loading && (
        <div style={{ padding: "120px 16px 0", position: "relative", zIndex: 5 }}>
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "12px",
              flexWrap: "wrap",
            }}
          >
            {[
              { key: "family", label: "👨‍👩‍👧 Famille", color: "#D4AF37" },
              { key: "following", label: "👥 Following", color: "#E8742A" },
              { key: "public", label: "🌍 Public", color: "#ffffff" },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleFilter(key as "family" | "following" | "public")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "999px",
                  border: `2px solid ${color}`,
                  background: filters[key as keyof typeof filters] ? color : "transparent",
                  color: filters[key as keyof typeof filters] ? "#000" : color,
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "12px",
              width: "100%",
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchAddress()}
              placeholder="Hôpital où je suis né, mon école, ma rue..."
              style={{
                flex: 1,
                padding: "12px 20px",
                borderRadius: "999px",
                border: "1.5px solid rgba(232,116,42,0.3)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={searchAddress}
              style={{
                padding: "12px 20px",
                borderRadius: "999px",
                background: "linear-gradient(135deg, #E8742A, #D4621A)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "14px",
                whiteSpace: "nowrap",
              }}
            >
              🔍 {getLabel("search", lang)}
            </button>
          </div>
          <Map
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            style={{ width: "100%", height: "380px", borderRadius: "16px" }}
            mapStyle={`https://tiles.stadiamaps.com/styles/alidade_smooth.json?api_key=${stadiaApiKey}`}
            pitchWithRotate={true}
            maxPitch={60}
          >
            <NavigationControl position="top-right" />

            <GeolocateControl
              position="top-right"
              trackUserLocation={true}
              onGeolocate={(e) => {
                setUserLocation({ lat: e.coords.latitude, lng: e.coords.longitude });
                setViewState((prev) => ({
                  ...prev,
                  longitude: e.coords.longitude,
                  latitude: e.coords.latitude,
                  zoom: 15,
                  pitch: 45,
                }));
              }}
            />

            <Source
              id="openmaptiles"
              type="vector"
              url={`https://tiles.stadiamaps.com/data/openmaptiles.json?api_key=${stadiaApiKey}`}
            >
              <Layer
                id="3d-buildings"
                source="openmaptiles"
                source-layer="building"
                type="fill-extrusion"
                minzoom={14}
                paint={{
                  "fill-extrusion-color": "#E8742A",
                  "fill-extrusion-height": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    14,
                    0,
                    16,
                    ["get", "render_height"],
                  ],
                  "fill-extrusion-base": ["get", "render_min_height"],
                  "fill-extrusion-opacity": 0.3,
                }}
              />
            </Source>

            {filteredMemories.map((memory) =>
              memory.lat && memory.lng ? (
                <Marker
                  key={memory.id}
                  longitude={memory.lng}
                  latitude={memory.lat}
                  anchor="bottom"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setSelectedMemory(memory);
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: `3px solid ${getMarkerColor(memory)}`,
                      overflow: "hidden",
                      cursor: "pointer",
                      boxShadow: `0 0 12px ${getMarkerColor(memory)}60`,
                      background: "#1a0a05",
                    }}
                  >
                    {memory.thumbnail_url ? (
                      <img
                        src={memory.thumbnail_url}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                        }}
                      >
                        ✦
                      </div>
                    )}
                  </div>
                </Marker>
              ) : null,
            )}

            {selectedMemory && (
              <Popup
                longitude={selectedMemory.lng}
                latitude={selectedMemory.lat}
                anchor="top"
                onClose={() => setSelectedMemory(null)}
                closeButton={true}
              >
                <div
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "14px",
                    maxWidth: "200px",
                    padding: "8px",
                    background: "#1a0a05",
                    color: "#fff",
                    borderRadius: "12px",
                  }}
                >
                  <strong style={{ color: "#E8742A" }}>{selectedMemory.title}</strong>
                  {selectedMemory.thumbnail_url && (
                    <img
                      src={selectedMemory.thumbnail_url}
                      alt=""
                      style={{
                        width: "100%",
                        borderRadius: "8px",
                        marginTop: "8px",
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(`/memory/${selectedMemory.id}`)}
                    style={{
                      marginTop: "8px",
                      padding: "6px 12px",
                      background: "#E8742A",
                      color: "#fff",
                      border: "none",
                      borderRadius: "999px",
                      cursor: "pointer",
                      fontSize: "12px",
                      width: "100%",
                      fontWeight: 700,
                    }}
                  >
                    Écouter ✦
                  </button>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      )}

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
        <div
          style={{
            position: "absolute",
            bottom: "100px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            width: "100%",
            maxWidth: "400px",
            padding: "0 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "12px",
                width: "100%",
                textAlign: "center",
                marginBottom: "4px",
              }}
            >
              Qui peut voir cet endroit ?
            </p>
            {[
              { value: "family", label: "👨‍👩‍👧 Famille", color: "#D4AF37" },
              { value: "following", label: "👥 Following", color: "#E8742A" },
              { value: "public", label: "🌍 Tous", color: "#ffffff" },
            ].map(({ value, label, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setLocationVisibility(value as "family" | "following" | "public")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "999px",
                  border: `2px solid ${color}`,
                  background: locationVisibility === value ? color : "transparent",
                  color: locationVisibility === value ? "#000" : color,
                  fontWeight: 700,
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handlePinHere}
            style={{
              width: "100%",
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
              justifyContent: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <MapPin size={18} />
            {lang === "fr" ? "Épingler un souvenir ici" : lang === "ar" ? "ثبّت ذكرى هنا" : "Pin a memory here"}
          </button>
        </div>
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
