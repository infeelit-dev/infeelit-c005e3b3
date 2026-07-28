import type { CSSProperties, ReactNode } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import infeelit from "@/assets/infeelit-logo.png";

const Terms = () => {
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
          Terms of Service
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

        <Section title="Your memories">
          You own your memories and recordings. Infeelit helps you preserve and share them —
          we do not claim ownership of your content.
        </Section>

        <Section title="Respect others">
          Do not upload content that harms others, violates the law, or infringes someone
          else&apos;s rights. We may remove content that breaks these rules.
        </Section>

        <Section title="Our care">
          We preserve your data with care, using secure infrastructure so your stories can
          endure for the people you choose.
        </Section>

        <Section title="Beta service">
          The service is provided as-is during beta. Features may change, and we do not
          guarantee uninterrupted availability while we build.
        </Section>

        <Section title="Governing law">
          These terms are governed by the laws of the United Arab Emirates.
        </Section>

        <Section title="Contact">
          Questions? Email{" "}
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
          <Link to="/privacy" style={linkStyle}>
            Privacy Policy
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

export default Terms;
