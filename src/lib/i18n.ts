// ─── Language types ───────────────────────────────────────────────────────────

export type Lang = "en" | "fr" | "ar";

export interface Translations {
  // Header
  memories: string;
  instant: string;
  forever: string;
  beginMyStory: string;

  // Welcome
  welcomeTagline: string;
  welcomeSubtitle: string;
  welcomePlaceholder: string;
  welcomeCta: string;
  welcomeSending: string;
  welcomeFooter: string;
  welcomeSuccess: string;

  // Treasure / Profile
  yourHaven: string;
  yourStories: string;
  storiesPreserved: string;
  videoMoments: string;
  voiceCaptures: string;
  previewMode: string;
  tabAll: string;
  tabMemories: string;
  tabForever: string;
  tabVideo: string;
  tabVoices: string;
  openingChest: string;
  nothingYet: string;
  recordToFill: string;
  preserveStory: string;
  privateVault: string;
  privateVaultSub: string;
  lifeThrough: string;

  // Record
  yourStory: string;
  breathe: string;
  howShare: string;
  videoShowFace: string;
  voiceOnly: string;
  imReady: string;
  weaving: string;
  oneMoreQuestion: string;
  answerToo: string;
  nextQuestion: string;
  seeMyMemory: string;
  memoryReady: string;
  shareMemory: string;
  whoHears: string;
  myFamilyCircle: string;
  shareInOcean: string;
  keepPrivate: string;
  sharedCircle: string;
  sharedOcean: string;
  keptPrivate: string;

  // Circle
  ourCircle: string;
  privateLabel: string;
  thisWeek: string;
  latestMemory: string;
  addVoice: string;
  inviteLink: string;
  inviteWhatsApp: string;
  circlePrivate: string;
  seeAll: string;

  // Auth
  verifying: string;
  checkingProfile: string;
  welcomeBack: string;
  setupProfile: string;

  // General
  comingSoon: string;
}

// ─── English ──────────────────────────────────────────────────────────────────

const en: Translations = {
  memories: "Memories",
  instant: "Instant",
  forever: "Forever",
  beginMyStory: "Begin my story",
  welcomeTagline: "Your family's voice, preserved forever.",
  welcomeSubtitle: "The private space where stories live, grow, and never disappear.",
  welcomePlaceholder: "Your email to enter",
  welcomeCta: "Begin my story",
  welcomeSending: "Sending...",
  welcomeFooter: "The art of transmission starts here.",
  welcomeSuccess: "Your key is on its way. ✉️",
  yourHaven: "Your Haven",
  yourStories: "your stories",
  storiesPreserved: "Stories",
  videoMoments: "Moments",
  voiceCaptures: "Voices",
  previewMode: "✦ Preview mode — record your first memory",
  tabAll: "All",
  tabMemories: "Memories",
  tabForever: "Forever",
  tabVideo: "🎬 Video",
  tabVoices: "🎙️ Voice",
  openingChest: "Opening your chest...",
  nothingYet: "Nothing here yet...",
  recordToFill: "Record a memory to fill this space.",
  preserveStory: "Preserve a story",
  privateVault: "My Private Vault",
  privateVaultSub: "Your most intimate memories. Visible only to you.",
  lifeThrough: "your life through time",
  yourStory: "Your Story",
  breathe: "Take a breath. Speak from the heart.",
  howShare: "How do you want to share?",
  videoShowFace: "Video — Show your face",
  voiceOnly: "Voice only — Just your voice",
  imReady: "I'm ready",
  weaving: "Weaving your memory...",
  oneMoreQuestion: "One more question",
  answerToo: "Answer this too",
  nextQuestion: "Next question",
  seeMyMemory: "See my memory",
  memoryReady: "Your memory is ready",
  shareMemory: "Share this memory",
  whoHears: "Who should hear this?",
  myFamilyCircle: "🔒 My family circle",
  shareInOcean: "🌊 Share in the ocean",
  keepPrivate: "🔐 Keep it private",
  sharedCircle: "Shared with your family circle.",
  sharedOcean: "Shared in the ocean.",
  keptPrivate: "Memory kept privately.",
  ourCircle: "Our Circle of Life",
  privateLabel: "🔒 Private",
  thisWeek: "This week",
  latestMemory: "Latest memory",
  addVoice: "+ Add a voice to the circle",
  inviteLink: "Your invite link",
  inviteWhatsApp: "Invite your family on WhatsApp",
  circlePrivate: "Your circle is private. Only invited members can see your memories.",
  seeAll: "See all →",
  verifying: "Opening your space...",
  checkingProfile: "Checking your profile...",
  welcomeBack: "Welcome back ✦",
  setupProfile: "Let's set up your profile...",
  comingSoon: "Coming soon",
};

// ─── French ───────────────────────────────────────────────────────────────────

const fr: Translations = {
  memories: "Mémoires",
  instant: "Instant",
  forever: "Pour toujours",
  beginMyStory: "Commencer mon histoire",
  welcomeTagline: "La voix de votre famille, préservée pour toujours.",
  welcomeSubtitle: "L'espace privé où les histoires vivent, grandissent et ne disparaissent jamais.",
  welcomePlaceholder: "Votre email pour entrer",
  welcomeCta: "Commencer mon histoire",
  welcomeSending: "Envoi en cours...",
  welcomeFooter: "L'art de la transmission commence ici.",
  welcomeSuccess: "Votre clé est en chemin. ✉️",
  yourHaven: "Votre Sanctuaire",
  yourStories: "vos histoires",
  storiesPreserved: "Histoires",
  videoMoments: "Moments",
  voiceCaptures: "Voix",
  previewMode: "✦ Mode aperçu — enregistrez votre premier souvenir",
  tabAll: "Tout",
  tabMemories: "Mémoires",
  tabForever: "Pour toujours",
  tabVideo: "🎬 Vidéo",
  tabVoices: "🎙️ Voix",
  openingChest: "Ouverture de votre coffre...",
  nothingYet: "Rien encore ici...",
  recordToFill: "Enregistrez un souvenir pour remplir cet espace.",
  preserveStory: "Préserver une histoire",
  privateVault: "Mon Coffre Privé",
  privateVaultSub: "Vos souvenirs les plus intimes. Visibles uniquement par vous.",
  lifeThrough: "votre vie à travers le temps",
  yourStory: "Votre Histoire",
  breathe: "Respirez. Parlez du cœur.",
  howShare: "Comment voulez-vous partager ?",
  videoShowFace: "Vidéo — Montrez votre visage",
  voiceOnly: "Voix uniquement — Juste votre voix",
  imReady: "Je suis prêt",
  weaving: "Tissage de votre souvenir...",
  oneMoreQuestion: "Encore une question",
  answerToo: "Répondre à celle-ci aussi",
  nextQuestion: "Question suivante",
  seeMyMemory: "Voir mon souvenir",
  memoryReady: "Votre souvenir est prêt",
  shareMemory: "Partager ce souvenir",
  whoHears: "Qui devrait entendre ceci ?",
  myFamilyCircle: "🔒 Mon cercle familial",
  shareInOcean: "🌊 Partager dans l'océan",
  keepPrivate: "🔐 Garder en privé",
  sharedCircle: "Partagé avec votre cercle familial.",
  sharedOcean: "Partagé dans l'océan.",
  keptPrivate: "Souvenir conservé en privé.",
  ourCircle: "Notre Cercle de Vie",
  privateLabel: "🔒 Privé",
  thisWeek: "Cette semaine",
  latestMemory: "Dernier souvenir",
  addVoice: "+ Ajouter une voix au cercle",
  inviteLink: "Votre lien d'invitation",
  inviteWhatsApp: "Inviter la famille sur WhatsApp",
  circlePrivate: "Votre cercle est privé. Seuls les membres invités peuvent voir vos souvenirs.",
  seeAll: "Tout voir →",
  verifying: "Ouverture de votre espace...",
  checkingProfile: "Vérification de votre profil...",
  welcomeBack: "Bon retour ✦",
  setupProfile: "Configurons votre profil...",
  comingSoon: "Bientôt disponible",
};

// ─── Arabic ───────────────────────────────────────────────────────────────────
// Literary Arabic, Dubai register — dignified, warm, not colloquial

const ar: Translations = {
  memories: "الذكريات",
  instant: "اللحظة",
  forever: "إلى الأبد",
  beginMyStory: "ابدأ قصتي",
  welcomeTagline: "صوت عائلتك، محفوظٌ إلى الأبد.",
  welcomeSubtitle: "المساحة الخاصة التي تعيش فيها القصص وتنمو ولا تختفي أبداً.",
  welcomePlaceholder: "بريدك الإلكتروني للدخول",
  welcomeCta: "ابدأ قصتي",
  welcomeSending: "جارٍ الإرسال...",
  welcomeFooter: "فنّ التوارث يبدأ هنا.",
  welcomeSuccess: "مفتاحك في الطريق إليك. ✉️",
  yourHaven: "ملاذك",
  yourStories: "قصصك",
  storiesPreserved: "القصص",
  videoMoments: "اللحظات",
  voiceCaptures: "الأصوات",
  previewMode: "✦ وضع المعاينة — سجّل أول ذكرى لك",
  tabAll: "الكل",
  tabMemories: "الذكريات",
  tabForever: "للأبد",
  tabVideo: "🎬 فيديو",
  tabVoices: "🎙️ صوت",
  openingChest: "جارٍ فتح صندوقك...",
  nothingYet: "لا شيء هنا بعد...",
  recordToFill: "سجّل ذكرى لملء هذه المساحة.",
  preserveStory: "احتفظ بقصة",
  privateVault: "خزنتي الخاصة",
  privateVaultSub: "أعمق ذكرياتك. مرئية لك وحدك.",
  lifeThrough: "حياتك عبر الزمن",
  yourStory: "قصتك",
  breathe: "خذ نفساً. تحدّث من القلب.",
  howShare: "كيف تريد المشاركة؟",
  videoShowFace: "فيديو — أظهر وجهك",
  voiceOnly: "صوت فقط — صوتك وحده",
  imReady: "أنا مستعد",
  weaving: "جارٍ نسج ذكراك...",
  oneMoreQuestion: "سؤال أخير",
  answerToo: "أجب على هذا أيضاً",
  nextQuestion: "السؤال التالي",
  seeMyMemory: "شاهد ذكراي",
  memoryReady: "ذكراك جاهزة",
  shareMemory: "شارك هذه الذكرى",
  whoHears: "من يجب أن يسمع هذا؟",
  myFamilyCircle: "🔒 دائرتي العائلية",
  shareInOcean: "🌊 مشاركة في المحيط",
  keepPrivate: "🔐 احتفظ بها لنفسك",
  sharedCircle: "تمت المشاركة مع دائرتك العائلية.",
  sharedOcean: "تمت المشاركة في المحيط.",
  keptPrivate: "تم حفظ الذكرى بشكل خاص.",
  ourCircle: "دائرة حياتنا",
  privateLabel: "🔒 خاص",
  thisWeek: "هذا الأسبوع",
  latestMemory: "آخر ذكرى",
  addVoice: "+ أضف صوتاً إلى الدائرة",
  inviteLink: "رابط دعوتك",
  inviteWhatsApp: "ادعُ عائلتك على واتساب",
  circlePrivate: "دائرتك خاصة. فقط الأعضاء المدعوون يمكنهم رؤية ذكرياتك.",
  seeAll: "عرض الكل ←",
  verifying: "جارٍ فتح مساحتك...",
  checkingProfile: "جارٍ التحقق من ملفك الشخصي...",
  welcomeBack: "مرحباً بعودتك ✦",
  setupProfile: "لنُعِدَّ ملفك الشخصي...",
  comingSoon: "قريباً",
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const translations: Record<Lang, Translations> = { en, fr, ar };

export const isRTL = (lang: Lang) => lang === "ar";

export const langLabel: Record<Lang, string> = {
  en: "EN",
  fr: "FR",
  ar: "عر",
};
