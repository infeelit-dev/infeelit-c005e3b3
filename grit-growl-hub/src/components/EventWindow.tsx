import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

const ALWAYS_OPEN = ["/", "/checkin", "/auth/callback", "/profile-setup"];
const GATED = ["/mode", "/onboarding", "/match", "/lounge", "/manifesto", "/recap", "/admin", "/gratitude"];

function isEventOpen(): boolean {
  const dubai = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dubai" }));
  const day = dubai.getDay();
  const hour = dubai.getHours();
  if (day === 2 && hour >= 18) return true;
  if (day === 3) return true;
  if (day === 4 && hour < 12) return true;
  return false;
}

function pathMatches(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => (p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(`${p}/`)));
}

function getNextEventDate(): string {
  const dubai = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dubai" }));
  const daysUntilWed = (3 - dubai.getDay() + 7) % 7 || 7;
  const next = new Date(dubai);
  next.setDate(dubai.getDate() + daysUntilWed);
  return next.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function WaitingScreen() {
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const dubai = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dubai" }));
      const daysUntilWed = (3 - dubai.getDay() + 7) % 7 || 7;
      const nextWed = new Date(dubai);
      nextWed.setDate(dubai.getDate() + daysUntilWed);
      nextWed.setHours(18, 0, 0, 0);
      const diff = Math.max(0, nextWed.getTime() - dubai.getTime());
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "48px", color: "#fff", letterSpacing: "3px" }}>
          GRIT <span style={{ color: "#D85A30" }}>&</span> GROWL
        </div>
        <div style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: "16px", padding: "28px", margin: "32px 0 20px" }}>
          <p style={{ fontSize: "11px", color: "#444", letterSpacing: "1px", textTransform: "uppercase" }}>Next event</p>
          <p style={{ fontSize: "18px", fontWeight: 600, color: "#fff", margin: "8px 0" }}>{getNextEventDate()}</p>
          <p style={{ fontSize: "14px", color: "#555" }}>Birds Dubai · 63F · 7PM</p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "20px" }}>
            {(["d", "h", "m", "s"] as const).map((k, i) => (
              <div key={k}>
                <div style={{ fontSize: "24px", fontWeight: 600, color: "#fff" }}>{[countdown.d, countdown.h, countdown.m, countdown.s][i]}</div>
              </div>
            ))}
          </div>
        </div>
        <a href="https://lu.ma/gritandgrowl" target="_blank" rel="noopener noreferrer" style={{ display: "block", background: "#D85A30", borderRadius: "12px", padding: "14px", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none", minHeight: "44px", lineHeight: "16px" }}>
          Register for next Wednesday →
        </a>
        <a href="/checkin" style={{ display: "block", marginTop: "16px", fontSize: "14px", color: "#555", textDecoration: "none" }}>Already checked in? Continue →</a>
      </div>
    </div>
  );
}

export default function EventWindow({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(isEventOpen());
  const isPreview =
    typeof window !== "undefined" &&
    (window.location.search.includes("preview=true") || localStorage.getItem("gg_preview") === "true");

  useEffect(() => {
    if (isPreview) localStorage.setItem("gg_preview", "true");
    const id = setInterval(() => setOpen(isEventOpen()), 60000);
    return () => clearInterval(id);
  }, [isPreview]);

  if (isPreview) return <>{children}</>;
  if (pathMatches(pathname, ALWAYS_OPEN)) return <>{children}</>;
  if (pathMatches(pathname, GATED) && !open) return <WaitingScreen />;
  return <>{children}</>;
}
