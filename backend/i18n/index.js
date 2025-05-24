import enLocale from './locales/en.js';
import ptBRLocale from './locales/pt-BR.js';

// Available locales
const locales = {
  'en': enLocale,
  'pt-BR': ptBRLocale
};

// Default locale
const defaultLocale = 'pt-BR';

/**
 * Get translation for a key in the specified locale
 * @param {string} key - The translation key in dot notation (e.g., 'email.subject')
 * @param {string} locale - The locale to use (e.g., 'en', 'pt-BR')
 * @param {Object} params - Parameters to replace in the translation
 * @returns {string} The translated string
 */
export function t(key, locale = defaultLocale, params = {}) {
  // Use the specified locale or fall back to default
  const translations = locales[locale] || locales[defaultLocale];

  // Split the key by dots to navigate the nested structure
  const keys = key.split('.');

  // Navigate through the translations object
  let result = translations;
  for (const k of keys) {
    if (result && result[k]) {
      result = result[k];
    } else {
      // Key not found, return the key itself
      return key;
    }
  }

  // If the result is not a string, return the key
  if (typeof result !== 'string') {
    return key;
  }

  // Replace parameters in the translation
  let translatedText = result;
  Object.entries(params).forEach(([paramKey, paramValue]) => {
    translatedText = translatedText.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), paramValue);
  });

  return translatedText;
}

export default {
  t,
  defaultLocale,
  locales
};
