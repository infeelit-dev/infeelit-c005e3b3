import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang, translations, Translations, isRTL } from "@/lib/i18n";

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
  rtl: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
  rtl: false,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    // Persist language choice in localStorage
    const saved = localStorage.getItem("infeelit_lang") as Lang | null;
    return saved ?? "en";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("infeelit_lang", l);
  };

  // Apply RTL to document root when Arabic is selected
  useEffect(() => {
    const rtl = isRTL(lang);
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t: translations[lang],
        rtl: isRTL(lang),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
