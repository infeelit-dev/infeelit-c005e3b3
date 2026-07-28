import type { CSSProperties, ReactNode } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import infeelit from "@/assets/infeelit-logo.png";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f0501",
        color: "#fff",
        padding: "24px 20px 64px",
      }}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Back"
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <ChevronLeft size={20} color="#fff" />
      </button>

      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <img
          src={infeelit}
          alt="Infeelit"
          style={{
            width: "160px",
            maxWidth: "55vw",
            height: "auto",
            objectFit: "contain",
            margin: "0 auto",
            display: "block",
          }}
        />
      </div>

      <article style={{ maxWidth: "560px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "28px",
            fontFamily: "Georgia, serif",
            fontWeight: 700,
            marginBottom: "8px",
            letterSpacing: "-0.02em",
          }}
        >
          Privacy Policy
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.45)",
            marginBottom: "32px",
          }}
        >
          Last updated: July 2026
        </p>

        <Section title="What we collect">
          We collect the information you choose to give us: your email, your name, and the
          voice or video recordings you create on Infeelit.
        </Section>

        <Section title="How we use it">
          We use this data to preserve and share your family memories — so your stories can
          live, grow, and reach the people you love.
        </Section>

        <Section title="Who sees it">
          Your memories are private by default. Only you and the people you choose to share
          with can see them. We do not sell your data.
        </Section>

        <Section title="Storage">
          Your content is stored on secure servers using Supabase and Cloudflare, with
          industry-standard protections for access and transmission.
        </Section>

        <Section title="Deletion">
          To delete your account and associated data, email{" "}
          <a href="mailto:malik@infeelit.com" style={linkStyle}>
            malik@infeelit.com
          </a>
          . We will process your request with care.
        </Section>

        <Section title="Contact">
          Questions about privacy? Reach us at{" "}
          <a href="mailto:malik@infeelit.com" style={linkStyle}>
            malik@infeelit.com
          </a>
          .
        </Section>

        <p
          style={{
            marginTop: "40px",
            fontSize: "13px",
            color: "rgba(255,255,255,0.4)",
            textAlign: "center",
          }}
        >
          Also see our{" "}
          <Link to="/terms" style={linkStyle}>
            Terms of Service
          </Link>
          .
        </p>
      </article>
    </div>
  );
};

const linkStyle: CSSProperties = {
  color: "#E8742A",
  textDecoration: "underline",
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section style={{ marginBottom: "28px" }}>
    <h2
      style={{
        fontSize: "16px",
        fontWeight: 700,
        color: "#E8742A",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        marginBottom: "10px",
      }}
    >
      {title}
    </h2>
    <p
      style={{
        fontSize: "15px",
        lineHeight: 1.7,
        color: "rgba(255,255,255,0.88)",
        margin: 0,
      }}
    >
      {children}
    </p>
  </section>
);

export default Privacy;
