import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggle = () => {
    const next = i18n.language === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <button
      onClick={toggle}
      className="px-3 py-1 rounded-full border border-white/30 text-sm font-medium hover:bg-white/10 transition"
    >
      {i18n.language === 'fr' ? 'عربي' : 'FR'}
    </button>
  );
}