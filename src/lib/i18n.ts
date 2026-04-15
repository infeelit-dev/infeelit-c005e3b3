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
  listening: string;
  recording: string;
  timeLimitReached: string;

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
  memberJournal: string;
  grandfatherVoice: string;
  grandmotherVoice: string;

  // Auth callback
  verifying: string;
  checkingProfile: string;
  welcomeBack: string;
  setupProfile: string;

  // Portrait — step labels
  portraitStep1Label: string;
  portraitStep2Label: string;
  portraitStep3Label: string;

  // Portrait — step titles
  portraitStep1Title: string;
  portraitStep1Sub: string;
  portraitStep2Title: string;
  portraitStep2Sub: string;
  portraitStep3Title: string;
  portraitStep3Sub: string;

  // Portrait — generation options
  genSilent: string;
  genSilentSub: string;
  genBoomer: string;
  genBoomerSub: string;
  genX: string;
  genXSub: string;
  genMillennial: string;
  genMillennialSub: string;
  genZ: string;
  genZSub: string;
  genAlpha: string;
  genAlphaSub: string;

  // Portrait — audience options
  audChildren: string;
  audChildrenSub: string;
  audParents: string;
  audParentsSub: string;
  audSelf: string;
  audSelfSub: string;
  audAll: string;
  audAllSub: string;

  // Portrait — spark options
  sparkAfraid: string;
  sparkAfraidSub: string;
  sparkPresence: string;
  sparkPresenceSub: string;
  sparkTruth: string;
  sparkTruthSub: string;
  sparkLesson: string;
  sparkLessonSub: string;

  // Portrait — buttons
  portraitContinue: string;
  portraitFinish: string;
  portraitSaving: string;
  portraitError: string;

  // Loading
  loadingTitle: string;
  loadingQuote: string;
  loadingSubtitle: string;

  // General
  comingSoon: string;
  voiceLabel: string;
  videoLabel: string;
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
  listening: "Listening...",
  recording: "Recording",
  timeLimitReached: "3 minute limit reached. Saving your memory...",
  ourCircle: "Our Circle of Life",
  privateLabel: "🔒 Private",
  thisWeek: "This week",
  latestMemory: "Latest memory",
  addVoice: "+ Add a voice to the circle",
  inviteLink: "Your invite link",
  inviteWhatsApp: "Invite your family on WhatsApp",
  circlePrivate: "Your circle is private. Only invited members can see your memories.",
  seeAll: "See all →",
  memberJournal: "Member journal — coming soon",
  grandfatherVoice: "Grandfather's voice — coming soon",
  grandmotherVoice: "Grandmother's voice — coming soon",
  verifying: "Opening your space...",
  checkingProfile: "Checking your profile...",
  welcomeBack: "Welcome back ✦",
  setupProfile: "Let's set up your profile...",
  portraitStep1Label: "Origin — Step 1 of 3",
  portraitStep2Label: "Audience — Step 2 of 3",
  portraitStep3Label: "Spark — Step 3 of 3",
  portraitStep1Title: "Who is speaking today?",
  portraitStep1Sub: "When did your story begin?",
  portraitStep2Title: "Whose heart are you speaking to?",
  portraitStep2Sub: "Your message needs a destination.",
  portraitStep3Title: "What brought your voice here?",
  portraitStep3Sub: "The spark that lit the fire.",
  genSilent: "Silent Generation",
  genSilentSub: "The keepers of unseen memories.",
  genBoomer: "Baby Boomers",
  genBoomerSub: "Witnesses of the great transformation.",
  genX: "Generation X",
  genXSub: "The bridge between two eras.",
  genMillennial: "Millennials",
  genMillennialSub: "Architects of a changing world.",
  genZ: "Gen Z",
  genZSub: "Digital souls, infinite voices.",
  genAlpha: "Gen Alpha",
  genAlphaSub: "The first page of a new book.",
  audChildren: "To those who follow",
  audChildrenSub: "My children. The ones who carry my voice forward.",
  audParents: "To those who came before",
  audParentsSub: "My parents. The voices I still want to hear.",
  audSelf: "To my own soul",
  audSelfSub: "I need to speak my truth before I share it.",
  audAll: "To everyone I love",
  audAllSub: "Some voices are too important to keep to one heart.",
  sparkAfraid: "A voice I'm afraid to lose",
  sparkAfraidSub: "Someone I love is still here. Their story must never fade.",
  sparkPresence: "A presence that lives on",
  sparkPresenceSub: "They're gone. But their voice still lives inside me.",
  sparkTruth: "My own truth",
  sparkTruthSub: "I need to hear myself speak to understand who I am.",
  sparkLesson: "A lesson that must survive me",
  sparkLessonSub: "I know something important. It deserves to be heard forever.",
  portraitContinue: "Continue",
  portraitFinish: "Begin my story",
  portraitSaving: "Preparing your journey...",
  portraitError: "Error saving your profile. Please try again.",
  loadingTitle: "Weaving your eras...",
  loadingQuote: "Every memory is a thread in the tapestry of who you are.",
  loadingSubtitle: "Creating your unique voice",
  comingSoon: "Coming soon",
  voiceLabel: "Voice",
  videoLabel: "Video",
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
  listening: "Écoute...",
  recording: "Enregistrement",
  timeLimitReached: "Limite de 3 minutes atteinte. Sauvegarde en cours...",
  ourCircle: "Notre Cercle de Vie",
  privateLabel: "🔒 Privé",
  thisWeek: "Cette semaine",
  latestMemory: "Dernier souvenir",
  addVoice: "+ Ajouter une voix au cercle",
  inviteLink: "Votre lien d'invitation",
  inviteWhatsApp: "Inviter la famille sur WhatsApp",
  circlePrivate: "Votre cercle est privé. Seuls les membres invités peuvent voir vos souvenirs.",
  seeAll: "Tout voir →",
  memberJournal: "Journal du membre — bientôt disponible",
  grandfatherVoice: "Voix du grand-père — bientôt disponible",
  grandmotherVoice: "Voix de la grand-mère — bientôt disponible",
  verifying: "Ouverture de votre espace...",
  checkingProfile: "Vérification de votre profil...",
  welcomeBack: "Bon retour ✦",
  setupProfile: "Configurons votre profil...",
  portraitStep1Label: "Origine — Étape 1 sur 3",
  portraitStep2Label: "Destinataire — Étape 2 sur 3",
  portraitStep3Label: "Étincelle — Étape 3 sur 3",
  portraitStep1Title: "Qui parle aujourd'hui ?",
  portraitStep1Sub: "Quand votre histoire a-t-elle commencé ?",
  portraitStep2Title: "À quel cœur vous adressez-vous ?",
  portraitStep2Sub: "Votre message a besoin d'une destination.",
  portraitStep3Title: "Qu'est-ce qui vous a amené ici ?",
  portraitStep3Sub: "L'étincelle qui a allumé le feu.",
  genSilent: "Génération Silencieuse",
  genSilentSub: "Les gardiens des mémoires invisibles.",
  genBoomer: "Baby-Boomers",
  genBoomerSub: "Témoins de la grande transformation.",
  genX: "Génération X",
  genXSub: "Le pont entre deux époques.",
  genMillennial: "Millennials",
  genMillennialSub: "Architectes d'un monde en changement.",
  genZ: "Génération Z",
  genZSub: "Âmes numériques, voix infinies.",
  genAlpha: "Génération Alpha",
  genAlphaSub: "La première page d'un nouveau livre.",
  audChildren: "À ceux qui suivent",
  audChildrenSub: "Mes enfants. Ceux qui portent ma voix en avant.",
  audParents: "À ceux qui sont venus avant",
  audParentsSub: "Mes parents. Les voix que je veux encore entendre.",
  audSelf: "À ma propre âme",
  audSelfSub: "J'ai besoin de dire ma vérité avant de la partager.",
  audAll: "À tous ceux que j'aime",
  audAllSub: "Certaines voix sont trop importantes pour un seul cœur.",
  sparkAfraid: "Une voix que j'ai peur de perdre",
  sparkAfraidSub: "Quelqu'un que j'aime est encore là. Son histoire ne doit jamais s'effacer.",
  sparkP