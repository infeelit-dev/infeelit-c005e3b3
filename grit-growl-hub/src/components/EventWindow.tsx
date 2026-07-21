import { useEffect, useState } from "react";

function isEventOpen(): boolean {
  const now = new Date();
  const dubai = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dubai" }));
  const day = dubai.getDay();
  const hour = dubai.getHours();

  // Tuesday 18:00 = day 2, hour >= 18
  // Wednesday all day = day 3
  // Thursday until 12:00 = day 4, hour < 12

  if (day === 2 && hour >= 18) return true;
  if (day === 3) return true;
  if (day === 4 && hour < 12) return true;
  return false;
}

function getNextEventDate(): string {
  const now = new Date();
  const dubai = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dubai" }));
  const day = dubai.getDay();
  const daysUntilWed = (3 - day + 7) % 7 || 7;
  const next = new Date(dubai);
  next.setDate(dubai.getDate() + daysUntilWed);
  next.setHours(19, 0, 0, 0);
  return next.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function WaitingScreen() {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const dubai = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dubai" }));
      const day = dubai.getDay();
      const daysUntilWed = (3 - day + 7) % 7 || 7;
      const nextWed = new Date(dubai);
      nextWed.setDate(dubai.getDate() + daysUntilWed);
      nextWed.setHours(18, 0, 0, 0);

      const diff = nextWed.getTime() - dubai.getTime();
      if (diff <= 0) {
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        return;
      }

      setDays(Math.floor(diff / (1000 * 60 * 60 * 24)));
      setHours(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
      setMinutes(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
      setSeconds(Math.floor((diff % (1000 * 60)) / 1000));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const nextDate = getNextEventDate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          margin: "auto",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "48px",
            color: "#ffffff",
            letterSpacing: "3px",
            textAlign: "center",
            marginBottom: "4px",
          }}
        >
          GRIT <span style={{ color: "#D85A30" }}>&</span> GROWL
        </div>

        {/* Powered by */}
        <div
          style={{
            fontSize: "10px",
            color: "#333",
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          powered by Infeelit Pro
        </div>

        {/* Card */}
        <div
          style={{
            background: "#111111",
            border: "1px solid #1E1E1E",
            borderRadius: "16px",
            padding: "28px",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#444",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "12px",
            }}
          >
            NEXT EVENT
          </div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "4px",
            }}
          >
            {nextDate}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#555",
              fontWeight: "300",
            }}
          >
            Birds Dubai · 63rd floor · 7PM
          </div>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "#1E1E1E",
              margin: "20px 0",
            }}
          />

          {/* Countdown */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                {days}
              </div>
              <div
                style={{
                  fontSize: "9px",
                  color: "#333",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                DAYS
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                {hours}
              </div>
              <div
                style={{
                  fontSize: "9px",
                  color: "#333",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                HOURS
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                {minutes}
              </div>
              <div
                style={{
                  fontSize: "9px",
                  color: "#333",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                MINS
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                {seconds}
              </div>
              <div
                style={{
                  fontSize: "9px",
                  color: "#333",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                SECS
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => window.open("https://lu.ma/gritandgrowl")}
          style={{
            background: "#D85A30",
            borderRadius: "12px",
            padding: "14px",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: "600",
            width: "100%",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Register for next Wednesday →
        </button>

        {/* Bottom hint */}
        <div
          style={{
            fontSize: "10px",
            color: "#222",
            textAlign: "center",
            marginTop: "14px",
          }}
        >
          3,000+ members · 33 editions · Every Wednesday
        </div>
      </div>
    </div>
  );
}

export default function EventWindow({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(isEventOpen());

  // Check URL for preview mode
  const isPreview = typeof window !== "undefined" && window.location.search.includes("preview=true");

  useEffect(() => {
    const interval = setInterval(() => {
      setOpen(isEventOpen());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Preview mode bypasses event window
  if (isPreview) return <>{children}</>;
  if (!open) return <WaitingScreen />;
  return <>{children}</>;
}