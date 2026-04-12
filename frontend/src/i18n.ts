import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import fa from './locales/fa.json';
import ps from './locales/ps.json';

const defaultLanguage = localStorage.getItem('lang') || 'en';
const direction = defaultLanguage === 'en' ? 'ltr' : 'rtl';
document.documentElement.dir = direction;
document.documentElement.lang = defaultLanguage;

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fa: { translation: fa }, ps: { translation: ps } },
  lng: defaultLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
