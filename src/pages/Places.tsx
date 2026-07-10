import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, X } from "lucide-react";
import Header from "@/components/Header";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

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

const AutoLocate = () => {
  const map = useMap();
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.flyTo([latitude, longitude], 15, {
            animate: true,
            duration: 1.5,
          });
        },
        () => {
          map.flyTo([30, 20], 2);
        },
        { timeout: 8000, enableHighAccuracy: true },
      );
    }
  }, [map]);
  return null;
};

const MapController = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 16, { animate: true, duration: 1.5 });
  }, [position, map]);
  return null;
};

const Places = () => {
  const navigate = useNavigate();
  const { lang, rtl } = useLanguage();
  const sheetTouchStartY = useRef(0);
  const [pins, setPins] = useState<MemoryPin[]>(DEMO_PINS);
  const [selectedPin, setSelectedPin] = useState<MemoryPin | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPosition, setSearchPosition] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);

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
        setSearchPosition([lat, lng]);
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

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        () => {},
        { enableHighAccuracy: true },
      );
      return () => navigator.geolocation.clearWatch(watchId);
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

  const handleSheetTouchStart = (e: React.TouchEvent) => {
    sheetTouchStartY.current = e.touches[0].clientY;
  };

  const handleSheetTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - sheetTouchStartY.current;
    if (deltaY > 60) setSelectedPin(null);
  };

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
              🔍 Trouver
            </button>
          </div>
          <MapContainer
            center={[30, 20]}
            zoom={2}
            style={{
              width: "100%",
              height: "320px",
              borderRadius: "16px",
              zIndex: 1,
            }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
              url={`https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${import.meta.env.VITE_STADIA_API_KEY}`}
            />
            <AutoLocate />
            <MapController position={searchPosition} />
            {userPosition && (
              <>
                <CircleMarker
                  center={userPosition}
                  radius={18}
                  pathOptions={{
                    color: "#4A90E2",
                    fillColor: "#4A90E2",
                    fillOpacity: 0.2,
                    weight: 1,
                  }}
                />
                <CircleMarker
                  center={userPosition}
                  radius={10}
                  pathOptions={{
                    color: "#4A90E2",
                    fillColor: "#4A90E2",
                    fillOpacity: 0.8,
                    weight: 3,
                  }}
                />
              </>
            )}
            {pins.map((memory) =>
              memory.lat && memory.lng ? (
                <Marker key={memory.id} position={[memory.lat, memory.lng]}>
                  <Popup>
                    <div
                      style={{
                        fontFamily: "Georgia, serif",
                        fontSize: "14px",
                        maxWidth: "200px",
                      }}
                    >
                      <strong>{memory.title}</strong>
                      {memory.thumbnail_url && (
                        <img
                          src={memory.thumbnail_url}
                          alt=""
                          style={{ width: "100%", borderRadius: "8px", marginTop: "8px" }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => navigate(`/memory/${memory.id}`)}
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
                        }}
                      >
                        Écouter ✦
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ) : null,
            )}
          </MapContainer>
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
