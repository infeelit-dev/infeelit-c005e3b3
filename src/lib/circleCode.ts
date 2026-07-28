const WORDS_FR = [
  "NID",
  "RACINE",
  "FOYER",
  "LIEN",
  "VOIX",
  "MÉMOIRE",
  "SOUFFLE",
  "ÂME",
  "FEU",
  "LUMIÈRE",
  "CHEMIN",
  "SOURCE",
];
const WORDS_EN = [
  "NEST",
  "ROOT",
  "HOME",
  "BOND",
  "VOICE",
  "MEMORY",
  "BREATH",
  "SOUL",
  "FLAME",
  "LIGHT",
  "PATH",
  "SOURCE",
];
const WORDS_AR = ["عش", "جذر", "بيت", "رابط", "صوت", "ذاكرة", "نَفَس", "روح"];

export const generateCircleCode = (lang = "fr"): string => {
  const words = lang === "ar" ? WORDS_AR : lang === "en" ? WORDS_EN : WORDS_FR;
  const word = words[Math.floor(Math.random() * words.length)];
  const number = Math.floor(100 + Math.random() * 900);
  return word + "-" + number;
};
