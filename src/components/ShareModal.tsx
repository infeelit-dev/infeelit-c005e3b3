import { X, Copy, Facebook, Twitter, MessageCircle, Link2, Check, Heart, Bookmark, Share2, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoryId?: string;
  title: string;
  url: string;
  text: string;
  thumbnailUrl?: string;
}

const ShareModal = ({ isOpen, onClose, memoryId, title, url, text, thumbnailUrl }: ShareModalProps) => {
  const { lang } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);

  if (!isOpen) return null;

  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  const deepLink = `https://infeelit.com/memory/${memoryId || ""}`;

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    instagram: `https://www.instagram.com/`,
    tiktok: `https://www.tiktok.com/`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    messenger: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=0`,
    snapchat: `https://www.snapchat.com/`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
    reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
  };

  // Load stats from Supabase
  useEffect(() => {
    if (!memoryId) return;
    const loadStats = async () => {
      const { data } = await supabase
        .from("memories")
        .select("like_count, save_count, share_count, view_count")
        .eq("id", memoryId)
        .single();
      if (data) {
        setLikeCount(data.like_count || 0);
        setSaveCount(data.save_count || 0);
        setShareCount(data.share_count || 0);
        setViewCount(data.view_count || 0);
      }
    };
    loadStats();
  }, [memoryId]);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => prev + (newLiked ? 1 : -1));
    if (memoryId) {
      await supabase.rpc("increment_likes", { memory_id: memoryId, increment: newLiked ? 1 : -1 });
    }
    toast.success(newLiked ? "Liked!" : "Unliked");
  };

  const handleSave = async () => {
    const newSaved = !saved;
    setSaved(newSaved);
    setSaveCount((prev) => prev + (newSaved ? 1 : -1));
    if (memoryId) {
      await supabase.rpc("increment_saves", { memory_id: memoryId, increment: newSaved ? 1 : -1 });
    }
    toast.success(newSaved ? "Saved to your collection!" : "Removed from collection");
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(`${text} ${deepLink}`);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: deepLink,
        });
        if (memoryId) {
          await supabase.rpc("increment_shares", { memory_id: memoryId });
          setShareCount((prev) => prev + 1);
        }
        toast.success("Shared successfully!");
      } catch (err: any) {
        if (err?.name !== "AbortError") handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSocialShare = async (platform: string) => {
    if (memoryId) {
      await supabase.rpc("increment_shares", { memory_id: memoryId });
      setShareCount((prev) => prev + 1);
    }
    if (platform === "instagram" || platform === "tiktok" || platform === "snapchat") {
      await navigator.clipboard.writeText(`${text} ${deepLink}`);
      toast.success(
        lang === "ar"
          ? "تم نسخ النص! افتح التطبيق والصقه"
          : lang === "fr"
            ? "Texte copié ! Ouvrez l'application et collez-le"
            : "Text copied! Open the app and paste it",
      );
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        backgroundColor: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "#141414",
          borderRadius: "24px 24px 0 0",
          padding: "24px 20px 40px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, fontFamily: "Georgia, serif" }}>
            {lang === "ar" ? "شارك هذه الذكرى" : lang === "fr" ? "Partager ce souvenir" : "Share this memory"}
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Memory preview */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "20px",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt=""
              style={{
                width: "100%",
                height: "160px",
                objectFit: "cover",
                borderRadius: "12px",
                marginBottom: "12px",
              }}
            />
          )}
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: ".1em",
              marginBottom: "4px",
            }}
          >
            {lang === "ar" ? "ذكرى من Infeelit" : lang === "fr" ? "Un souvenir Infeelit" : "An Infeelit memory"}
          </p>
          <p
            style={{ color: "#fff", fontSize: "15px", fontWeight: 600, fontFamily: "Georgia, serif", lineHeight: 1.4 }}
          >
            "{title}"
          </p>
        </div>

        {/* Action buttons: Like, Save, Stats */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            padding: "12px",
            backgroundColor: "rgba(255,255,255,0.03)",
            borderRadius: "16px",
          }}
        >
          <button
            onClick={handleLike}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: "12px 8px",
              borderRadius: "12px",
              backgroundColor: liked ? "rgba(239,68,68,0.15)" : "transparent",
              border: liked ? "1px solid rgba(239,68,68,0.3)" : "1px solid transparent",
              cursor: "pointer",
              color: liked ? "#EF4444" : "rgba(255,255,255,0.6)",
              transition: "all .15s",
            }}
          >
            <Heart size={20} fill={liked ? "#EF4444" : "none"} />
            <span style={{ fontSize: "10px", fontWeight: 600 }}>{likeCount}</span>
          </button>

          <button
            onClick={handleSave}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: "12px 8px",
              borderRadius: "12px",
              backgroundColor: saved ? "rgba(232,116,42,0.15)" : "transparent",
              border: saved ? "1px solid rgba(232,116,42,0.3)" : "1px solid transparent",
              cursor: "pointer",
              color: saved ? "#E8742A" : "rgba(255,255,255,0.6)",
              transition: "all .15s",
            }}
          >
            <Bookmark size={20} fill={saved ? "#E8742A" : "none"} />
            <span style={{ fontSize: "10px", fontWeight: 600 }}>{saveCount}</span>
          </button>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: "12px 8px",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <Eye size={20} />
            <span style={{ fontSize: "10px", fontWeight: 600 }}>{viewCount}</span>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: "12px 8px",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <Share2 size={20} />
            <span style={{ fontSize: "10px", fontWeight: 600 }}>{shareCount}</span>
          </div>
        </div>

        {/* Native share button */}
        <button
          onClick={handleNativeShare}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #E8742A, #D4621A)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "15px",
            border: "none",
            cursor: "pointer",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: "0 0 20px rgba(232,116,42,0.3)",
          }}
        >
          <Share2 size={20} />
          {lang === "ar" ? "مشاركة عبر..." : lang === "fr" ? "Partager via..." : "Share via..."}
        </button>

        {/* Social buttons grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
          {[
            {
              label: "WhatsApp",
              icon: <MessageCircle size={18} />,
              color: "#25D366",
              link: shareLinks.whatsapp,
              platform: "whatsapp",
            },
            {
              label: "Facebook",
              icon: <Facebook size={18} />,
              color: "#1877F2",
              link: shareLinks.facebook,
              platform: "facebook",
            },
            {
              label: "Twitter/X",
              icon: <Twitter size={18} />,
              color: "#1DA1F2",
              link: shareLinks.twitter,
              platform: "twitter",
            },
            {
              label: "Instagram",
              icon: <InstagramIcon size={18} />,
              color: "#E4405F",
              link: shareLinks.instagram,
              platform: "instagram",
            },
            {
              label: "TikTok",
              icon: <TikTokIcon size={18} />,
              color: "#FF0050",
              link: shareLinks.tiktok,
              platform: "tiktok",
            },
            {
              label: "Telegram",
              icon: <TelegramIcon size={18} />,
              color: "#0088cc",
              link: shareLinks.telegram,
              platform: "telegram",
            },
            {
              label: "Messenger",
              icon: <MessengerIcon size={18} />,
              color: "#00B2FF",
              link: shareLinks.messenger,
              platform: "messenger",
            },
            {
              label: "LinkedIn",
              icon: <LinkedInIcon size={18} />,
              color: "#0A66C2",
              link: shareLinks.linkedin,
              platform: "linkedin",
            },
          ].map((item) => (
            <a
              key={item.platform}
              href={item.link}
              target={item.platform === "instagram" || item.platform === "tiktok" ? undefined : "_blank"}
              rel="noopener noreferrer"
              onClick={(e) => {
                if (item.platform === "instagram" || item.platform === "tiktok") {
                  e.preventDefault();
                  handleSocialShare(item.platform);
                }
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                padding: "12px 6px",
                borderRadius: "14px",
                backgroundColor: item.color + "15",
                border: "1px solid " + item.color + "35",
                textDecoration: "none",
                cursor: "pointer",
                transition: "transform .1s",
              }}
            >
              <span style={{ color: item.color }}>{item.icon}</span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "9px", fontWeight: 600 }}>{item.label}</span>
            </a>
          ))}
        </div>

        {/* More social */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
          {[
            {
              label: "Snapchat",
              icon: <SnapchatIcon size={18} />,
              color: "#FFFC00",
              link: shareLinks.snapchat,
              platform: "snapchat",
            },
            {
              label: "Pinterest",
              icon: <PinterestIcon size={18} />,
              color: "#BD081C",
              link: shareLinks.pinterest,
              platform: "pinterest",
            },
            {
              label: "Reddit",
              icon: <RedditIcon size={18} />,
              color: "#FF4500",
              link: shareLinks.reddit,
              platform: "reddit",
            },
          ].map((item) => (
            <a
              key={item.platform}
              href={item.link}
              target={item.platform === "snapchat" ? undefined : "_blank"}
              rel="noopener noreferrer"
              onClick={(e) => {
                if (item.platform === "snapchat") {
                  e.preventDefault();
                  handleSocialShare(item.platform);
                }
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                padding: "12px 6px",
                borderRadius: "14px",
                backgroundColor: item.color + "15",
                border: "1px solid " + item.color + "35",
                textDecoration: "none",
                cursor: "pointer",
                transition: "transform .1s",
              }}
            >
              <span style={{ color: item.color }}>{item.icon}</span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "9px", fontWeight: 600 }}>{item.label}</span>
            </a>
          ))}
        </div>

        {/* Copy link */}
        <button
          onClick={handleCopyLink}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "14px",
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {copied ? <Check size={18} color="#4ADE80" /> : <Link2 size={18} />}
          {copied
            ? lang === "ar"
              ? "تم النسخ!"
              : lang === "fr"
                ? "Copié !"
                : "Copied!"
            : lang === "ar"
              ? "نسخ الرابط"
              : lang === "fr"
                ? "Copier le lien"
                : "Copy link"}
        </button>
      </div>
    </div>
  );
};

// Custom icons
const InstagramIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TikTokIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const TelegramIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.46-1.901-.903-1.056-.692-1.653-1.123-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.441-.752-.245-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.145.118.185.276.204.387.02.111.045.365.025.559z" />
  </svg>
);

const MessengerIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.24 0 0 4.952 0 11.64c0 3.499 1.434 6.521 3.769 8.61.24.21.38.51.38.83l-.06 2.64c0 .56.61.91 1.08.6l2.94-1.94c.27-.18.6-.24.91-.16 1.36.59 2.88.92 4.48.92 6.76 0 12-4.95 12-11.64S18.76 0 12 0zm1.32 15.42l-3.06-3.26-5.98 3.26 6.58-6.98 3.12 3.26 5.9-3.26-6.56 6.98z" />
  </svg>
);

const LinkedInIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const SnapchatIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847-.06.952-.12 1.906-.12 2.86 0 1.845.134 3.674.268 5.506.033.46.067.918.067 1.358 0 .998-.471 1.998-1.343 2.598-.873.6-2.071.898-3.347 1.088-.12.823-.134 1.646-.268 1.996-.034.096-.134.19-.268.19-.1 0-.2-.05-.267-.143-.1-.14-.167-.35-.2-.638-.034-.288-.067-.619-.067-.994 0-.122.003-.245.01-.368-.22.014-.443.021-.67.021-.223 0-.443-.007-.656-.02.006.122.009.244.009.367 0 .375-.033.706-.067.994-.033.288-.1.498-.2.638-.067.093-.167.143-.268.143-.134 0-.234-.094-.268-.19-.134-.35-.148-1.173-.268-1.996-1.276-.19-2.474-.488-3.347-1.088-.872-.6-1.343-1.6-1.343-2.598 0-.46.034-.898.067-1.358.134-1.832.268-3.661.268-5.506 0-.954-.06-1.908-.12-2.86-.104-1.628-.23-3.654.299-4.847C7.86 1.069 11.216.793 12.206.793z" />
  </svg>
);

const PinterestIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
  </svg>
);

const RedditIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.231 12.346c0 .72-.589 1.302-1.309 1.302-.36 0-.694-.144-.939-.39-1.834 1.212-4.314 1.996-7.079 2.092l1.442-4.635 3.232.718c.04.626.557 1.124 1.192 1.124.66 0 1.195-.529 1.195-1.188 0-.658-.535-1.188-1.195-1.188-.494 0-.92.302-1.103.726l-2.992-.665-.957 3.07c-2.435-.098-4.63-.821-6.25-1.894-.238.234-.561.38-.923.38-.72 0-1.309-.582-1.309-1.302 0-.316.11-.603.294-.823-.16-.396-.249-.82-.249-1.26 0-2.776 3.382-5.034 7.549-5.034s7.549 2.258 7.549 5.034c0 .44-.089.864-.249 1.26.184.22.294.507.294.823z" />
  </svg>
);

export default ShareModal;
