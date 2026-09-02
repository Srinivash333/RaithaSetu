import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation } from '../i18n/index';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('raitha_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('raitha_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'kn' : 'en');
  };

  const t = (key, paramsOrFallback = {}, fallback = '') => {
    let params = {};
    let defaultFallback = '';

    if (typeof paramsOrFallback === 'string') {
      defaultFallback = paramsOrFallback;
    } else if (typeof paramsOrFallback === 'object' && paramsOrFallback !== null) {
      params = paramsOrFallback;
      defaultFallback = fallback;
    }

    let str = getTranslation(key, language, defaultFallback);

    if (params && typeof str === 'string') {
      Object.keys(params).forEach(pKey => {
        str = str.replace(new RegExp(`{{\\s*${pKey}\\s*}}`, 'g'), params[pKey]);
      });
    }

    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
