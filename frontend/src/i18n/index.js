import { en } from './en';
import { kn } from './kn';

export const translations = { en, kn };

/**
 * Nested key lookup resolver supporting dot notation like t("hero.title")
 */
export function getTranslation(key, lang = 'en', fallback = '') {
  if (!key) return '';
  
  const dict = translations[lang] || translations.en;
  const keys = key.split('.');
  
  let current = dict;
  for (const k of keys) {
    if (current && current[k] !== undefined) {
      current = current[k];
    } else {
      current = null;
      break;
    }
  }

  if (current !== null && current !== undefined) {
    return current;
  }

  // Fallback to English dictionary
  let enCurrent = translations.en;
  for (const k of keys) {
    if (enCurrent && enCurrent[k] !== undefined) {
      enCurrent = enCurrent[k];
    } else {
      enCurrent = null;
      break;
    }
  }

  return enCurrent !== null && enCurrent !== undefined ? enCurrent : (fallback || key);
}
