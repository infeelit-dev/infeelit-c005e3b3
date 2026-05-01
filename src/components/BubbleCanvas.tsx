import type { Timeline } from "@/types/timeline";
import { useLanguage } from "@/contexts/LanguageContext";
import imgGrandfather from "@/assets/grandfather.jpg";
import imgChild from "@/assets/child.jpg";
import imgMarry from "@/assets/marry.jpg";
import imgRelax from "@/assets/relax.jpg";
import imgBirth from "@/assets/birth.jpg";
import imgLove from "@/assets/love.jpg";
import imgHouse from "@/assets/house.jpg";
import imgPicnic from "@/assets/picnic.jpg";
import imgTravel from "@/assets/travel.jpg";
import imgGraduate from "@/assets/graduate.jpg";
import type { BubbleCategory } from "./MemoryBubble";

type Lang = "fr" | "en" | "ar";

interface InfeeilitQuestion {
  title: Record<Lang, string>;
  narrative: Record<Lang, string>;
  image: string;
  size: number;
  x: number;
  y: number;
  colorMode: "sepia" | "color";
}

const QUESTIONS: Record<string, InfeeilitQuestion[]> = {
  memories: [
    {
      title: { fr: "L'odeur de sa cuisine", en: "The scent of her kitchen", ar: "رائحة مطبخها" },
      narrative: {
        fr: "Décris-moi l'ambiance de la cuisine quand ta mère préparait ton plat préféré : les bruits des casseroles, les parfums et ce qui se disait entre vous.",
        en: "Describe the atmosphere of the kitchen when your mother prepared your favorite dish: the clinking pots, the aromas, and the words shared between you.",
        ar: "صف لي أجواء المطبخ عندما كانت والدتك تحضر طبقك المفضل: أصوات الأواني والروائح التي كانت تملأ المكان.",
      },
      image: imgGrandfather,
      size: 130,
      x: 5,
      y: 15,
      colorMode: "sepia",
    },
    {
      title: { fr: "Ton plus vieux fou rire", en: "Your earliest belly laugh", ar: "أول ضحكة من القلب" },
      narrative: {
        fr: "Raconte-moi ton plus vieux souvenir de fou rire partagé avec les tiens : les visages qui s'illuminaient, le bruit des éclats de rire.",
        en: "Tell me about your earliest memory of a shared belly laugh with your family: the faces lighting up, the sound of the laughter.",
        ar: "احكِ لي عن أقدم ذكرى لضحك من القلب شاركتها مع أهلك: كيف كانت تضيء وجوههم وصوت الضحكات.",
      },
      image: imgChild,
      size: 110,
      x: 55,
      y: 10,
      colorMode: "color",
    },
    {
      title: { fr: "Leur geste d'amour muet", en: "Their silent act of love", ar: "لفتة حب صامتة" },
      narrative: {
        fr: "Raconte-moi ce geste silencieux qu'ils faisaient pour te dire 'je t'aime' sans utiliser les mots : ce regard ou cette main sur ton épaule.",
        en: "Tell me about that silent gesture they made to say 'I love you' without words: that look or that hand on your shoulder.",
        ar: "احكِ لي عن تلك اللفتة الصامتة التي كانوا يقومون بها ليقولوا لك 'أحبك' دون كلمات.",
      },
      image: imgMarry,
      size: 140,
      x: 25,
      y: 38,
      colorMode: "sepia",
    },
    {
      title: { fr: "Le bruit de la maison", en: "The sound of home", ar: "صوت البيت" },
      narrative: {
        fr: "Raconte-moi le bruit unique de la maison de ton enfance : le craquement d'un parquet, le chant des oiseaux au matin ou le bourdonnement d'une radio lointaine.",
        en: "Tell me about the unique sound of your childhood home: the creaking floorboards, the morning birdsong, or the hum of a distant radio.",
        ar: "احكِ لي عن الصوت المميز لمنزل طفولتك: صرير الأرضية الخشبية، زقزقة العصافير في الصباح.",
      },
      image: imgPicnic,
      size: 90,
      x: 5,
      y: 52,
      colorMode: "color",
    },
    {
      title: { fr: "Le café des matins", en: "The morning coffee", ar: "قهوة الصباح" },
      narrative: {
        fr: "Décris-moi l'odeur du café ou du thé dans la maison le matin : le bruit de la cuillère, la lumière sur la table et cette voix qui te réveillait doucement.",
        en: "Describe the smell of coffee or tea in the house in the morning: the sound of the spoon, the light on the table, and that voice waking you gently.",
        ar: "صف لي رائحة القهوة أو الشاي في المنزل صباحاً: صوت الملعقة، الضوء على الطاولة وذاك الصوت الذي كان يوقظك.",
      },
      image: imgLove,
      size: 115,
      x: 45,
      y: 68,
      colorMode: "sepia",
    },
    {
      title: { fr: "Le vêtement de ton père", en: "Your father's old coat", ar: "رداء والدك القديم" },
      narrative: {
        fr: "Décris-moi ce vêtement que ton père portait tout le temps et que tu n'oseras jamais jeter : sa texture sous tes doigts et l'odeur qui y est restée.",
        en: "Describe that piece of clothing your father wore constantly and that you'll never throw away: its texture under your fingers and the scent still lingering.",
        ar: "صف لي تلك القطعة من الملابس التي كان يرتديها والدك دائماً والتي لن تجرؤ على رميها أبداً.",
      },
      image: imgTravel,
      size: 100,
      x: 65,
      y: 55,
      colorMode: "sepia",
    },
    {
      title: { fr: "Leur secret de bonheur", en: "Their secret to happiness", ar: "سر سعادتهم" },
      narrative: {
        fr: "Raconte-moi ce secret de bonheur simple que tes aînés possédaient : comment ils savouraient l'instant et quelle phrase ils répétaient pour garder le sourire.",
        en: "Tell me about that simple secret to happiness your elders possessed: how they savored the moment and what phrase they repeated to keep smiling.",
        ar: "احكِ لي عن سر السعادة البسيط الذي كان يمتلكه كبار عائلتك وكيف كانوا يستمتعون باللحظة.",
      },
      image: imgRelax,
      size: 95,
      x: 70,
      y: 20,
      colorMode: "color",
    },
    {
      title: { fr: "", en: "", ar: "" },
      narrative: { fr: "", en: "", ar: "" },
      image: imgBirth,
      size: 40,
      x: 88,
      y: 8,
      colorMode: "sepia",
    },
    {
      title: { fr: "", en: "", ar: "" },
      narrative: { fr: "", en: "", ar: "" },
      image: imgGraduate,
      size: 35,
      x: 3,
      y: 88,
      colorMode: "sepia",
    },
  ],

  instant: [
    {
      title: { fr: "Ton doudou fétiche", en: "Your favorite plushie", ar: "دميتك المفضلة" },
      narrative: {
        fr: "Décris-moi ton premier compagnon de sommeil : sa douceur usée par les années, son nom secret et la sécurité que sa présence t'apportait chaque nuit.",
        en: "Describe your first sleep companion: its softness worn by the years, its secret name, and the security its presence brought you every night.",
        ar: "صف لي رفيق نومك الأول: ملمسه الذي استهلكته السنون، اسمه السري والأمان الذي كان يمنحك وجوده.",
      },
      image: imgLove,
      size: 130,
      x: 10,
      y: 18,
      colorMode: "color",
    },
    {
      title: { fr: "Votre langage secret", en: "Your secret language", ar: "لغتكم السرية" },
      narrative: {
        fr: "Raconte-moi ce langage ou ces codes secrets que tu partageais avec tes frères et sœurs : ces regards qui disaient tout et cette complicité que personne ne pouvait briser.",
        en: "Tell me about that secret language or codes you shared with your siblings: those looks that said everything and that bond no one could break.",
        ar: "احكِ لي عن تلك اللغة أو الرموز السرية التي كنت تشاركها مع إخوتك وتلك الرابطة التي لا يمكن لأحد كسرها.",
      },
      image: imgChild,
      size: 110,
      x: 55,
      y: 12,
      colorMode: "color",
    },
    {
      title: { fr: "Ta première cabane", en: "Your first secret fort", ar: "مخبؤك الأول" },
      narrative: {
        fr: "Décris-moi la première cabane que tu as construite avec tes amis : l'odeur du bois ou des draps, et ce sentiment d'être les seuls maîtres du monde.",
        en: "Describe the first secret fort you built with your friends: the scent of wood or sheets, and that feeling of being the only masters of the world.",
        ar: "صف لي أول مخبأ بنيته مع أصدقائك: رائحة الخشب أو الملاءات وشعوركم بأنكم أسياد العالم الوحيدون.",
      },
      image: imgPicnic,
      size: 95,
      x: 70,
      y: 35,
      colorMode: "sepia",
    },
    {
      title: { fr: "Le pacte de sang", en: "The childhood pact", ar: "عهد الطفولة" },
      narrative: {
        fr: "Raconte-moi ce pacte ou cette promesse solennelle que tu as faite à ton meilleur ami d'enfance : le sérieux de vos visages et l'importance que cela avait pour vous.",
        en: "Tell me about that pact or solemn promise you made to your childhood best friend: the seriousness on your faces and how much it meant to you.",
        ar: "احكِ لي عن ذلك الميثاق أو الوعد الجاد الذي قطعته لأفضل صديق لك في طفولتك.",
      },
      image: imgTravel,
      size: 120,
      x: 20,
      y: 50,
      colorMode: "color",
    },
    {
      title: { fr: "Ton goûter d'enfance", en: "Your childhood snack", ar: "وجبة طفولتك الخفيفة" },
      narrative: {
        fr: "Décris-moi ton goûter préféré après l'école : le goût du pain frais, le craquement du chocolat et cette sensation de réconfort en rentrant à la maison.",
        en: "Describe your favorite after-school snack: the taste of fresh bread, the snap of chocolate, and that feeling of immediate comfort coming home.",
        ar: "صف لي وجبتك الخفيفة المفضلة بعد المدرسة: طعم الخبز الطازج وشعور الراحة عند العودة إلى المنزل.",
      },
      image: imgMarry,
      size: 100,
      x: 60,
      y: 65,
      colorMode: "color",
    },
    {
      title: { fr: "", en: "", ar: "" },
      narrative: { fr: "", en: "", ar: "" },
      image: imgRelax,
      size: 45,
      x: 85,
      y: 70,
      colorMode: "sepia",
    },
    {
      title: { fr: "", en: "", ar: "" },
      narrative: { fr: "", en: "", ar: "" },
      image: imgHouse,
      size: 35,
      x: 5,
      y: 80,
      colorMode: "color",
    },
  ],

  forever: [
    {
      title: { fr: "S'ils t'écoutaient ce soir", en: "If they heard you tonight", ar: "لو سمعوك الليلة" },
      narrative: {
        fr: "Si la personne que tu as perdue pouvait t'écouter ce soir, que lui raconterais-tu en souriant ? Décris la joie que tu aurais à partager tes victoires.",
        en: "If the person you lost could hear you tonight, what would you tell them with a smile? Describe the joy of sharing your victories with them.",
        ar: "لو كان الشخص الذي فقدته يسمعك الليلة، ماذا ستحكي له وأنت تبتسم؟ صف لي الفرحة التي ستشعر بها.",
      },
      image: imgGraduate,
      size: 140,
      x: 8,
      y: 18,
      colorMode: "color",
    },
    {
      title: { fr: "Le merci suspendu", en: "The unspoken thank you", ar: "شكر لم يُقل بعد" },
      narrative: {
        fr: "Raconte-moi ce 'merci' que tu n'as jamais pris le temps de dire à tes parents : le poids de cette gratitude et la chaleur que tu ressens en le formulant enfin.",
        en: "Tell me about that 'thank you' you never took the time to say to your parents: the weight of this gratitude and the warmth you feel finally putting it into words.",
        ar: "احكِ لي عن كلمة 'شكراً' التي لم تجد الوقت لتقولها لوالديك: ثقل هذا الامتنان والدفء الذي تشعر به.",
      },
      image: imgHouse,
      size: 120,
      x: 58,
      y: 12,
      colorMode: "sepia",
    },
    {
      title: { fr: "Le nom que tu portes", en: "The name you carry", ar: "الاسم الذي تحمله" },
      narrative: {
        fr: "Raconte-moi l'histoire de ton prénom : la fierté que tu as ressentie en comprenant de qui tu héritais et quelle force ce nom te donne aujourd'hui.",
        en: "Tell me the story of your name: the pride you felt realizing who you inherited it from and what strength that name gives you today.",
        ar: "احكِ لي قصة اسمك: الفخر الذي شعرت به عندما أدركت من ورثته وما القوة التي يمنحك إياها هذا الاسم.",
      },
      image: imgRelax,
      size: 130,
      x: 22,
      y: 40,
      colorMode: "color",
    },
    {
      title: { fr: "La maison quittée", en: "The house left behind", ar: "البيت الذي غادرته" },
      narrative: {
        fr: "Décris-moi la dernière fois que tu as fermé la porte d'une maison que tu aimais : le silence des pièces vides et ce que tu as emporté dans ton cœur.",
        en: "Describe the last time you closed the door of a house you loved: the silence of the empty rooms and what you carried away in your heart.",
        ar: "صف لي آخر مرة أغلقت فيها باب منزل كنت تحبه: صمت الغرف الفارغة وما الذي حملته معك في قلبك.",
      },
      image: imgMarry,
      size: 105,
      x: 68,
      y: 42,
      colorMode: "color",
    },
    {
      title: { fr: "La valeur héritée", en: "The inherited value", ar: "القيمة الموروثة" },
      narrative: {
        fr: "Raconte-moi la valeur morale la plus forte que tes parents t'ont transmise : le moment précis où tu as compris son importance et comment elle guide tes pas.",
        en: "Tell me about the strongest moral value your parents passed on to you: the exact moment you realized its importance and how it guides your steps today.",
        ar: "احكِ لي عن أقوى قيمة أخلاقية نقلها إليك والداك: اللحظة التي أدركت فيها أهميتها وكيف توجه خطواتك.",
      },
      image: imgLove,
      size: 115,
      x: 12,
      y: 62,
      colorMode: "sepia",
    },
    {
      title: { fr: "Leur sacrifice invisible", en: "Their invisible sacrifice", ar: "تضحيتهم غير المرئية" },
      narrative: {
        fr: "Raconte-moi ce sacrifice que tes parents ont fait pour toi et que tu n'as compris que bien plus tard : l'émotion de cette réalisation et la force qu'elle t'a donnée.",
        en: "Tell me about a sacrifice your parents made for you that you only understood much later: the emotion of that realization and the strength it gave you.",
        ar: "احكِ لي عن تضحية قدمها والداك لأجلك ولم تدركها إلا بعد فوات الأوان: شعورك عند إدراك ذلك.",
      },
      image: imgBirth,
      size: 100,
      x: 55,
      y: 65,
      colorMode: "color",
    },
    {
      title: { fr: "Le fauteuil de ton grand-père", en: "Your grandfather's chair", ar: "كرسي جدك المفضل" },
      narrative: {
        fr: "Décris-moi la place exacte où ton grand-père s'asseyait toujours : la forme de ce fauteuil, le bruit qu'il faisait et l'image de lui, paisible.",
        en: "Describe the exact spot where your grandfather always sat: the shape of that chair, the creak it made, and the image of him, peaceful, in the room.",
        ar: "صف لي المكان الذي كان يجلس فيه جدك دائماً: شكل ذلك الكرسي وصريره وصورته وهو جالس بسلام.",
      },
      image: imgGrandfather,
      size: 110,
      x: 72,
      y: 28,
      colorMode: "sepia",
    },
    {
      title: { fr: "", en: "", ar: "" },
      narrative: { fr: "", en: "", ar: "" },
      image: imgTravel,
      size: 38,
      x: 85,
      y: 55,
      colorMode: "color",
    },
    {
      title: { fr: "", en: "", ar: "" },
      narrative: { fr: "", en: "", ar: "" },
      image: imgChild,
      size: 30,
      x: 3,
      y: 75,
      colorMode: "sepia",
    },
  ],
};

const ANIMS = ["animate-float-slow", "animate-float-medium", "animate-float-fast"];
const DELAYS = ["0s", "1.2s", "0.5s", "0.8s", "2s", "1.8s", "2.8s", "1.5s", "2.5s"];

interface BubbleCanvasProps {
  onBubbleClick: (question: string, category: BubbleCategory) => void;
  activeTimeline: Timeline;
}

const BubbleCanvas = ({ onBubbleClick, activeTimeline }: BubbleCanvasProps) => {
  const { lang } = useLanguage();
  const bubbles = QUESTIONS[activeTimeline] ?? QUESTIONS.memories;

  return (
    <div className="absolute inset-0 z-[1] overflow-hidden">
      <style>{`
        @keyframes float-slow {
          0%   { transform: translate(0px, 0px); }
          20%  { transform: translate(50px, -60px); }
          40%  { transform: translate(90px, -20px); }
          60%  { transform: translate(60px, 55px); }
          80%  { transform: translate(-30px, 40px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes float-medium {
          0%   { transform: translate(0px, 0px); }
          20%  { transform: translate(-60px, -50px); }
          40%  { transform: translate(-90px, 30px); }
          60%  { transform: translate(-45px, 80px); }
          80%  { transform: translate(40px, 50px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes float-fast {
          0%   { transform: translate(0px, 0px); }
          25%  { transform: translate(70px, 55px); }
          50%  { transform: translate(30px, -70px); }
          75%  { transform: translate(-55px, -40px); }
          100% { transform: translate(0px, 0px); }
        }
        .animate-float-slow   { animation: float-slow   18s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium  14s ease-in-out infinite; }
        .animate-float-fast   { animation: float-fast    10s ease-in-out infinite; }
      `}</style>

      {bubbles.map((b, i) => {
        const displayTitle = b.title[lang as Lang] || b.title.en;
        const displayQuestion = b.narrative[lang as Lang] || b.narrative.en;
        const isClickable = !!displayQuestion;

        return (
          <button
            key={`${activeTimeline}-${i}`}
            onClick={() => isClickable && onBubbleClick(displayQuestion, "past")}
            className={`absolute rounded-full overflow-hidden ${ANIMS[i % 3]} ${isClickable ? "cursor-pointer" : "pointer-events-none"}`}
            style={{
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: `${b.x}%`,
              top: `${b.y}%`,
              animationDelay: DELAYS[i] || "0s",
              willChange: "transform",
              border: b.colorMode === "color" ? "2.5px solid rgba(232,116,42,0.7)" : "2px solid rgba(255,255,255,0.5)",
              boxShadow: b.colorMode === "color" ? "0 0 20px rgba(232,116,42,0.3)" : "0 4px 16px rgba(0,0,0,0.2)",
            }}
          >
            {/* Background image */}
            <img
              src={b.image}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
                filter:
                  b.colorMode === "sepia"
                    ? "grayscale(60%) sepia(40%) brightness(0.85)"
                    : "saturate(1.1) brightness(0.95)",
              }}
            />

            {/* Gradient overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  b.colorMode === "color"
                    ? "linear-gradient(to top, rgba(232,116,42,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)"
                    : "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
              }}
            />

            {/* Glass gloss */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%)",
              }}
            />

            {/* Short title on bubble — only for large enough bubbles */}
            {displayTitle && b.size >= 90 && (
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  left: 0,
                  right: 0,
                  padding: "0 6px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: b.size >= 120 ? "10px" : "8px",
                    fontWeight: 900,
                    color: "#fff",
                    lineHeight: 1.2,
                    textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                    letterSpacing: "0.02em",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit",
                  }}
                >
                  {displayTitle}
                </p>
              </div>
            )}

            {/* Decorative star for small bubbles without question */}
            {!isClickable && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "18px" }}>✦</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BubbleCanvas;
