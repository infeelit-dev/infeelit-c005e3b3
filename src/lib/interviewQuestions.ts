export type InterviewQuestion = {
  id: number;
  optional: boolean;
  fr: string;
  en: string;
};

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 1,
    optional: false,
    fr: "Racontez la première fois où quelqu'un vous a remercié ou payé pour ce que vous saviez faire.",
    en: "Tell me about the first time someone thanked or paid you for what you knew how to do.",
  },
  {
    id: 2,
    optional: false,
    fr: "De quoi aviez-vous peur la première année ?",
    en: "What were you afraid of in the first year?",
  },
  {
    id: 3,
    optional: false,
    fr: "Quelle phrase entendue enfant vous suit encore au travail ?",
    en: "What phrase did you hear as a child that still follows you at work?",
  },
  {
    id: 4,
    optional: true,
    fr: "Ce que vous avez reçu de vos parents dont vous n'avez pas fini de vous servir — ou de vous défaire.",
    en: "What you received from your parents that you haven't finished using — or letting go of.",
  },
  {
    id: 5,
    optional: false,
    fr: "Quelle rencontre, quel hasard ou quel accident a changé votre direction ? Racontez la scène.",
    en: "What encounter, chance, or accident changed your direction? Tell me the scene.",
  },
  {
    id: 6,
    optional: true,
    fr: "Quelle révolte vous a donné des ailes ?",
    en: "What revolt gave you wings?",
  },
  {
    id: 7,
    optional: false,
    fr: "Racontez le jour où ça vous a coûté cher de rester fidèle à ce que vous croyez.",
    en: "Tell me about the day it cost you dearly to stay true to what you believe.",
  },
  {
    id: 8,
    optional: false,
    fr: "Ce que vous savez faire que personne n'a écrit nulle part.",
    en: "What you know how to do that nobody has ever written down anywhere.",
  },
  {
    id: 9,
    optional: false,
    fr: "Qui a cru en vous avant que vous y croyiez ? Dites son prénom.",
    en: "Who believed in you before you believed in yourself? Say their first name.",
  },
  {
    id: 10,
    optional: false,
    fr: "Ce que vous voulez transmettre à la personne qui prendra votre place.",
    en: "What you want to pass on to the person who will take your place.",
  },
];

export function questionText(q: InterviewQuestion, locale: string) {
  return locale === "en" ? q.en : q.fr;
}
