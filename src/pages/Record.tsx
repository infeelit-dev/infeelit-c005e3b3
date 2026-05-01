import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { X, StopCircle, Loader2, Share2, Video, Mic, Download } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const MAX_DURATION_SECONDS = 180;

const FOLLOWUP_QUESTIONS = {
  en: {
    childhood: ["Who made that moment feel safe?", "What did that place smell like?", "Do your children know this story?"],
    family:    ["What did that person teach you without words?", "When did you last tell them what they mean to you?", "What part of them lives in you today?"],
    loss:      ["What do you wish you had said?", "What did they leave behind in you?", "Who carries their memory with you?"],
    default:   ["Who else was there in that memory?", "What would you tell that version of yourself?", "Is there someone who needs to hear this story?"],
  },
  fr: {
    childhood: ["Qui a rendu ce moment sûr ?", "Quelle odeur avait cet endroit ?", "Vos enfants connaissent-ils cette histoire ?"],
    family:    ["Que vous a appris cette personne sans mots ?", "Quand lui avez-vous dit ce qu'elle représente pour vous ?", "Quelle part d'elle vit en vous aujourd'hui ?"],
    loss:      ["Qu'auriez-vous voulu dire ?", "Que vous ont-ils laissé en vous ?", "Qui porte leur mémoire avec vous ?"],
    default:   ["Qui d'autre était là dans ce souvenir ?", "Que diriez-vous à cette version de vous-même ?", "Y a-t-il quelqu'un qui a besoin d'entendre cette histoire ?"],
  },
  ar: {
    childhood: ["من جعل تلك اللحظة آمنة؟", "كيف كانت رائحة ذلك المكان؟", "هل يعرف أطفالك هذه القصة؟"],
    family:    ["ماذا علّمتك هذه الشخصية دون كلام؟", "متى أخبرتها آخر مرة بما تعنيه لك؟", "أي جزء منها يعيش فيك اليوم؟"],
    loss:      ["ما الذي تمنيت قوله؟", "ماذا تركوا فيك؟", "من يحمل ذكراهم معك؟"],
    default:   ["من آخر كان في تلك الذكرى؟", "ماذا ستقول لتلك النسخة من نفسك؟", "هل هناك من يحتاج أن يسمع هذه القصة؟"],
  },
};

const POETIC_TITLES = {
  en: {
    childhood: ["A memory that still smells like home...", "The day I understood what childhood meant...", "A place I can still find with my eyes closed..."],
    family:    ["What they never said out loud...", "The voice I still carry with me...", "A love that didn't need words..."],
    loss:      ["What remains after goodbye...", "The presence that never truly left...", "Everything they left inside me..."],
    default:   ["A story that deserved to be told...", "The moment I didn't know I'd remember...", "A thread in the tapestry of who I am..."],
  },
  fr: {
    childhood: ["Un souvenir qui sent encore comme la maison...", "Le jour où j'ai compris ce qu'était l'enfance...", "Un endroit que je trouve encore les yeux fermés..."],
    family:    ["Ce qu'ils n'ont jamais dit à voix haute...", "La voix que je porte encore avec moi...", "Un amour qui n'avait pas besoin de mots..."],
    loss:      ["Ce qui reste après l'au revoir...", "La présence qui n'est jamais vraiment partie...", "Tout ce qu'ils ont laissé en moi..."],
    default:   ["Une histoire qui méritait d'être racontée...", "Le moment dont je ne savais pas que je m'en souviendrais...", "Un fil dans la tapisserie de qui je suis..."],
  },
  ar: {
    childhood: ["ذكرى لا تزال تفوح منها رائحة البيت...", "اليوم الذي فهمت فيه معنى الطفولة...", "مكان لا أزال أجده بعيني مغمضتين..."],
    family:    ["ما لم يقولوه بصوت عالٍ...", "الصوت الذي لا أزال أحمله معي...", "حبٌّ لم يحتج إلى كلمات..."],
    loss:      ["ما يبقى بعد الوداع...", "الحضور الذي لم يغادر حقاً...", "كل ما تركوه بداخلي..."],
    default:   ["قصة استحقت أن تُروى...", "اللحظة التي لم أعلم أنني سأتذكرها...", "خيط في نسيج هويتي..."],
  },
};

const getTheme = (question: string): string => {
  const q = question.toLowerCase();
  if (q.includes("child") || q.includes("home") || q.includes("school") || q.includes("enfance") || q.includes("طفل") || q.includes("بيت")) return "childhood";
  if (q.includes("mother") || q.includes("father") || q.includes("family") || q.includes("mère") || q.includes("père") || q.includes("أم") || q.includes("أب")) return "family";
  if (q.includes("lost") || q.includes("miss") || q.includes("gone") || q.includes("perdu") || q.includes("فقد")) return "loss";
  return "default";
};

const capturePosterFrame = (videoElement: HTMLVideoElement): Promise<Blob | null> => {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 320; canvas.height = 180;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(null); return; }
      ctx.drawImage(videoElement, 0, 0, 320, 180);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7);
    } catch { resolve(null); }
  });
};

type Stage = "question" | "countdown" | "recording" | "uploading" | "followup" | "title" | "share";

const Record = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang, rtl } = useLanguage();

  const videoRef         = u