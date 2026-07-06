import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getDubaiEventDate, getEventId } from "@/lib/eventDate";

function AuthCallbackPage() {
  const [message, setMessage] = useState("Signing you in...");

  useEffect(() => {
    const handleCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.user?.email) {
        setMessage("Sign-in failed. Please try again.");
        setTimeout(() => window.location.assign("/checkin"), 2500);
        return;
      }

      const email = sessionData.session.user.email.toLowerCase();
      localStorage.setItem("gg_email", email);
      const eventDate = getDubaiEventDate();

      const { data: profileRes, error: profileError } = await supabase.functions.invoke("manage-attendee", {
        body: { action: "get-profile", email, event_date: eventDate },
      });

      if (profileError) {
        setMessage("Something went wrong. Redirecting...");
        setTimeout(() => window.location.assign("/checkin"), 2000);
        return;
      }

      const profile = profileRes?.profile;
      if (profile?.id) {
        await supabase.functions.invoke("manage-attendee", {
          body: {
            action: "upsert-participant",
            profile_id: profile.id,
            event_id: getEventId(eventDate),
            event_date: eventDate,
            checked_in_at: new Date().toISOString(),
          },
        });
        setMessage(`Welcome back ${profile.first_name || "friend"}! Your profile is ready.`);
        setTimeout(() => window.location.assign("/mode"), 1500);
        return;
      }

      window.location.assign("/profile-setup");
    };

    handleCallback();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Inter', sans-serif" }}>
      <p style={{ color: "#888", fontSize: "15px", textAlign: "center", maxWidth: "420px" }}>{message}</p>
    </div>
  );
}

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
  ssr: false,
});
