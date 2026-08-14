import { useTranslation } from '@/context/LanguageContext';

export const LanguageToggle = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="relative flex items-center bg-sand/30 rounded-full p-1 border border-line-soft w-[80px] h-[34px]">
      {/* The Red Sliding "Thingy" */}
      <div 
        className={`absolute top-1 bottom-1 w-[36px] bg-crimson rounded-full transition-all duration-300 ease-in-out shadow-sm ${
          language === 'en' ? 'left-1' : 'left-[39px]'
        }`}
      />

      {/* Buttons */}
      <button
        onClick={() => setLanguage('en')}
        className={`relative z-10 flex-1 text-[10px] font-black transition-colors duration-300 ${
          language === 'en' ? 'text-white' : 'text-ink-soft hover:text-ink'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('am')}
        className={`relative z-10 flex-1 text-[10px] font-black transition-colors duration-300 ${
          language === 'am' ? 'text-white' : 'text-ink-soft hover:text-ink'
        }`}
      >
        AM
      </button>
    </div>
  );
};