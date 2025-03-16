import { createI18n } from 'vue-i18n';
import en from './locales/en';
import ptBR from './locales/pt-BR';

// Get the user's preferred language from localStorage or default to pt-BR
const savedLocale = localStorage.getItem('user-locale') || 'pt-BR';

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    'pt-BR': ptBR
  }
});
