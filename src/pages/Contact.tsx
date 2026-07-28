import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Send } from "lucide-react";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

const SYSTEM_PROMPT = `Tu es Le Guide Infeelit.

HISTOIRE FONDATRICE :
Infeelit a été créé par Malik,
dont le père est décédé brutalement
quand il avait 14 ans.
Son père lui a demandé un verre d'eau
à l'hôpital. Malik n'a pas pu le lui donner.
Le lendemain, son père était mort.

Malik a passé des années à réaliser
que le vrai verre manquant était autre chose :
l'histoire de son père, ses valeurs,
ses leçons de vie, ses aventures.
Il avait soif de connaître la vie
de son père.

"Infeelit est le verre qu'il n'a pas eu
le temps de remplir."

LA MISSION :
Permettre à chacun de remplir ce verre —
de partager son histoire, ses souvenirs,
sa voix — pour les générations futures.
Maintenant. Pas demain.

TU SAIS :
- Comment enregistrer un souvenir
  (voix, vidéo ou texte)
- Comment créer ou rejoindre un Circle
  (famille, amis, collègues, école)
- Les Sparks et récompenses
- La confidentialité et sécurité (RLS Supabase)
- Places — la carte émotionnelle des souvenirs
- Les messages pour le futur
  ("Pour tes 18 ans", "Pour ton mariage")
- L'accessibilité (mode texte pour sourds/muets,
  sous-titres automatiques)
- Les Circles thématiques multiples
- La SparkBubble et son fonctionnement
- Le système de Whispers (messagerie intime)
- La page Treasure/Flamme (espace personnel)

TON COMPORTEMENT :
- Tu réponds dans la langue de l'utilisateur
- Tu es chaleureux, empathique, humain
- Tu es concis — max 3 phrases par réponse
- Tu portes l'histoire de Malik dans chaque mot
- Si tu ne sais pas → tu dis honnêtement
  que tu vas transférer à l'équipe
- Si l'utilisateur n'est pas satisfait →
  tu proposes de transférer à Malik
  à contact@infeelit.com

Email de contact : contact@infeelit.com`;

const Contact = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content:
        lang === "fr"
          ? "Bonjour 🔥 Je suis Le Guide Infeelit. Comment puis-je t'aider aujourd'hui ?"
          : lang === "ar"
            ? "مرحباً 🔥 أنا دليل Infeelit. كيف يمكنني مساعدتك اليوم ؟"
            : "Hello 🔥 I'm the Infeelit Guide. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [escalated, setEscalated] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user" as const, content: input };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply = data.content[0].text;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (
        reply.includes("contact@infeelit") ||
        reply.includes("équipe") ||
        reply.includes("team") ||
        reply.includes("فريق")
      ) {
        setEscalated(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            lang === "fr"
              ? "Une erreur s'est produite. Écris-nous directement à contact@infeelit.com"
              : lang === "ar"
                ? "حدث خطأ. اكتب لنا مباشرة على contact@infeelit.com"
                : "An error occurred. Write to us at contact@infeelit.com",
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F2", display: "flex", flexDirection: "column" }}>
      <Header activeTimeline="memories" onTimelineChange={() => {}} />
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
      <div
        style={{
          padding: "56px 24px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid rgba(61,43,31,0.08)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(61,43,31,0.4)" }}
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#3D2B1F", fontFamily: "Georgia, serif" }}>
            {lang === "fr" ? "Le Guide Infeelit" : lang === "ar" ? "دليل Infeelit" : "The Infeelit Guide"}
          </h1>
          <p style={{ fontSize: "11px", color: "rgba(61,43,31,0.4)" }}>
            {lang === "fr"
              ? "Toujours là pour t'aider 🔥"
              : lang === "ar"
                ? "دائماً هنا لمساعدتك 🔥"
                : "Always here to help 🔥"}
          </p>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          paddingBottom: "120px",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div
              style={{
                maxWidth: "80%",
                padding: "12px 16px",
                borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                background: msg.role === "user" ? "linear-gradient(135deg,#E8742A,#D4621A)" : "#fff",
                color: msg.role === "user" ? "#fff" : "#3D2B1F",
                fontSize: "14px",
                lineHeight: 1.55,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                border: msg.role === "assistant" ? "1px solid rgba(61,43,31,0.08)" : "none",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex" }}>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "20px 20px 20px 4px",
                background: "#fff",
                border: "1px solid rgba(61,43,31,0.08)",
                display: "flex",
                gap: "4px",
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#E8742A",
                    animation: `bounce 1s ${i * 0.2}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        {escalated && (
          <div
            style={{
              padding: "16px",
              borderRadius: "16px",
              background: "rgba(232,116,42,0.08)",
              border: "1px solid rgba(232,116,42,0.2)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "13px", color: "#3D2B1F", marginBottom: "8px", lineHeight: 1.5 }}>
              {lang === "fr"
                ? "Je transmets ton message à Malik et son équipe. Tu recevras une réponse à contact@infeelit.com"
                : lang === "ar"
                  ? "أنقل رسالتك إلى مالك وفريقه. ستتلقى رداً على contact@infeelit.com"
                  : "I'm forwarding your message to Malik and his team. You'll receive a reply at contact@infeelit.com"}
            </p>
            <a
              href="mailto:contact@infeelit.com"
              style={{ color: "#E8742A", fontWeight: 700, fontSize: "13px", textDecoration: "none" }}
            >
              contact@infeelit.com
            </a>
          </div>
        )}
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 80,
          left: 0,
          right: 0,
          padding: "12px 16px",
          background: "linear-gradient(to top, #FFF9F2 70%, transparent)",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={lang === "fr" ? "Pose ta question..." : lang === "ar" ? "اطرح سؤالك..." : "Ask your question..."}
          style={{
            flex: 1,
            padding: "14px 18px",
            borderRadius: "999px",
            border: "1px solid rgba(232,116,42,0.3)",
            background: "#fff",
            fontSize: "14px",
            color: "#3D2B1F",
            outline: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            background: "linear-gradient(135deg,#E8742A,#D4621A)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: !input.trim() ? 0.4 : 1,
            flexShrink: 0,
          }}
        >
          <Send size={18} color="#fff" />
        </button>
      </div>
    </div>
  );
};

export default Contact;
