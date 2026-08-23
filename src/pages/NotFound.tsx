export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0501",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <p style={{ fontSize: "64px", marginBottom: "16px" }}>✦</p>
      <h1
        style={{
          color: "#fff",
          fontSize: "24px",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          marginBottom: "12px",
        }}
      >
        This memory doesn't exist yet.
      </h1>
      <p
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: "15px",
          marginBottom: "32px",
        }}
      >
        The page you're looking for has been moved or deleted.
      </p>
      <a
        href="/"
        style={{
          padding: "14px 32px",
          borderRadius: "999px",
          background: "linear-gradient(135deg, #E8742A, #D4621A)",
          color: "#fff",
          textDecoration: "none",
          fontWeight: 700,
          fontSize: "15px",
        }}
      >
        ✦ Return to Infeelit
      </a>
    </div>
  );
}
