import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'am';

// Sample Translation Data
const translations = {
  en: {
    nav_how: 'How it works',
    nav_about: 'About Us',
    nav_privacy: 'Privacy',
    nav_hospitals: 'For hospitals',
    btn_login: 'Log in',
    btn_donor: 'Join as donor',
    hero_title: 'The right blood type, close enough, in time.',
    // ... add more keys as we go
  },
  am: {
    nav_how: 'እንዴት እንደሚሰራ',
    nav_about: 'ስለ እኛ',
    nav_privacy: 'ግላዊነት',
    nav_hospitals: 'ለሆስፒታሎች',
    btn_login: 'ግባ',
    btn_donor: 'ለጋሽ ሁን',
    hero_title: 'ትክክለኛው የደም አይነት፣ በቅርብ ርቀት፣ በወቅቱ።',
    // ... add more keys as we go
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within LanguageProvider');
  return context;
};