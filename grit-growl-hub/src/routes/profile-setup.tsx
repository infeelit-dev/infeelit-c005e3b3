import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getDubaiEventDate, getEventId } from "@/lib/eventDate";
import { normalizeLinkedInUrl } from "@/lib/contacts";

function ProfileSetupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("gg_email");
    if (!stored) window.location.assign("/checkin");
    else setEmail(stored);
  }, []);

  const handleSave = async () => {
    if (!firstName.trim() || !whatsapp.trim()) {
      setError("First name and WhatsApp are required.");
      return;
    }
    setLoading(true);
    setError("");

    const { data: created, error: createError } = await supabase.functions.invoke("manage-attendee", {
      body: {
        action: "create-profile",
        email,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        whatsapp: whatsapp.trim(),
        linkedin_url: normalizeLinkedInUrl(linkedinUrl) || linkedinUrl.trim() || null,
      },
    });

    if (createError || !created?.profile?.id) {
      setError(createError?.message || created?.error || "Could not save profile.");
      setLoading(false);
      return;
    }

    const eventDate = getDubaiEventDate();

    await supabase.functions.invoke("manage-attendee", {
      body: {
        action: "upsert-participant",
        profile_id: created.profile.id,
        event_id: getEventId(eventDate),
        event_date: eventDate,
        checked_in_at: new Date().toISOString(),
      },
    });

    window.location.assign("/mode");
  };

  const inputStyle = {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "10px",
    padding: "14px",
    color: "#fff",
    fontSize: "14px",
    width: "100%",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    minHeight: "44px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#fff", marginBottom: "8px", textAlign: "center" }}>Create your profile</h1>
        <p style={{ fontSize: "14px", color: "#666", textAlign: "center", marginBottom: "28px" }}>One-time setup. Follows you every week.</p>
        {[
          { label: "First name", value: firstName, set: setFirstName, placeholder: "Alex" },
          { label: "Last name", value: lastName, set: setLastName, placeholder: "Chen" },
          { label: "WhatsApp (+country code)", value: whatsapp, set: setWhatsapp, placeholder: "+971501234567" },
          { label: "LinkedIn URL (optional)", value: linkedinUrl, set: setLinkedinUrl, placeholder: "linkedin.com/in/you" },
        ].map((f) => (
          <div key={f.label} style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "6px" }}>{f.label}</label>
            <input value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.placeholder} style={inputStyle} />
          </div>
        ))}
        {error && <p style={{ color: "#D85A30", fontSize: "12px", marginBottom: "12px" }}>{error}</p>}
        <button onClick={handleSave} disabled={loading} style={{ background: "#D85A30", borderRadius: "12px", padding: "15px", color: "#fff", fontSize: "15px", fontWeight: "600", width: "100%", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", minHeight: "52px" }}>
          {loading ? "Saving..." : "Save & continue →"}
        </button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/profile-setup")({
  component: ProfileSetupPage,
  ssr: false,
});
