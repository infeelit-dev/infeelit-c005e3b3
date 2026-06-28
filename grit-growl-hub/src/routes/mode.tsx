import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell, PrimaryButton } from "@/components/PageShell";
import { useTheme, type AppMode } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/mode")({
  component: ModePage,
});

function ModePage() {
  const { mode, setMode } = useTheme();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const options: { value: AppMode; title: string; desc: string }[] = [
    { value: "lounge", title: "Chill", desc: "I'm here to relax, recharge, no agenda." },
    { value: "builder", title: "Connect", desc: "I'm here to connect and build something meaningful tonight." },
  ];

  const handleLockIn = async () => {
    const email = localStorage.getItem("gg_email");

    if (!email) {
      setError("Missing email. Please check in again.");
      navigate({ to: "/checkin" });
      return;
    }

    setSaving(true);
    setError("");

    const payload = { mode, checked_in_at: new Date().toISOString() };

    const { data, error: fnError } = await supabase.functions.invoke("manage-attendee", {
      body: { action: "update", email, ...payload },
    });


    if (fnError || !data?.success) {
      const msg = fnError?.message || data?.error || "Failed to save mode";
      console.error("❌ Mode save error:", msg);
      setError(msg);
      setSaving(false);
      return;
    }


    const next = mode === "builder" ? "/manifesto" : "/lounge";
    navigate({ to: next });
  };

  return (
    <PageShell
      title="Choose your mode"
      subtitle="Locked for the evening. Choose carefully."
      step={{ current: 2, total: 5 }}
      backTo="/checkin"
      cta={
        <PrimaryButton onClick={handleLockIn} disabled={saving}>
          {saving ? "Locking..." : "Lock it in"}
        </PrimaryButton>
      }
    >
      <div className="grid gap-3">
        {options.map((o) => {
          const active = mode === o.value;
          return (
            <button
              key={o.value}
              onClick={() => setMode(o.value)}
              className="text-left p-6 rounded-[16px] border bg-[var(--bg-card)] transition-colors"
              style={{
                borderColor: active ? "var(--accent-color)" : "var(--border)",
              }}
            >
              <div
                className="text-[18px] font-medium"
                style={{ color: active ? "var(--accent-color)" : "var(--text-primary)" }}
              >
                {o.title}
              </div>
              <div className="text-[13px] font-light text-[var(--text-secondary)] mt-1">{o.desc}</div>
            </button>
          );
        })}
        {error && <p style={{ color: "#D85A30", fontSize: "12px" }}>{error}</p>}
      </div>
    </PageShell>
  );
}