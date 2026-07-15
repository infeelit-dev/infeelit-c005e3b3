import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  ssr: false,
});

function Index() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "48px",
            color: "#fff",
            letterSpacing: "3px",
            marginBottom: "24px",
          }}
        >
          GRIT <span style={{ color: "#D85A30" }}>&</span> GROWL
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#fff", marginBottom: "12px" }}>
          Dubai's most human networking night
        </h1>
        <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6, marginBottom: "32px" }}>
          Every Wednesday at Birds Dubai 63F. Come to give. Leave with the right people.
        </p>
        <Link
          to="/checkin"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#D85A30",
            borderRadius: "12px",
            height: "52px",
            color: "#fff",
            fontSize: "15px",
            fontWeight: 600,
            textDecoration: "none",
            width: "100%",
          }}
        >
          Join the community
        </Link>
        <p style={{ fontSize: "12px", color: "#333", marginTop: "28px" }}>
          Every Wednesday · Birds Dubai · 63F · 7PM
        </p>
      </div>
    </div>
  );
}
