import i18n from 'i18next';
import {
  initReactI18next,
} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import moment from 'moment/min/moment-with-locales';

import gb from 'date-fns/locale/en-GB';
import us from 'date-fns/locale/en-US';
import fr from 'date-fns/locale/fr';
import es from 'date-fns/locale/es';
import de from 'date-fns/locale/de';
import ja from 'date-fns/locale/ja';
import id from 'date-fns/locale/id';
import pt from 'date-fns/locale/pt';
import ptbr from 'date-fns/locale/pt-BR';

import {
  registerLocale,
} from 'react-datepicker';

import translationEN from './locales/en/translation.json';
import translationFR from './locales/fr/translation.json';
import translationES from './locales/es/translation.json';
import translationDE from './locales/de/translation.json';
import translationJA from './locales/ja/translation.json';
import translationID from './locales/id/translation.json';
import translationPT from './locales/pt/translation.json';
import translationPTBR from './locales/pt-br/translation.json';

// Variable for supported locales
registerLocale('en-GB', gb);
registerLocale('en-US', us);
registerLocale('fr', fr);
registerLocale('es', es);
registerLocale('de', de);
registerLocale('ja', ja);
registerLocale('id', id);
registerLocale('pt', pt);
registerLocale('pt-br', ptbr);

// the translations
export const lngs = {
  'en-GB': {
    translation: translationEN,
    nativeName: 'English (United Kingdom)',
  },
  'en-US': {
    translation: translationEN,
    nativeName: 'English (United States)',
  },
  fr: {
    translation: translationFR,
    nativeName: 'Français',
  },
  es: {
    translation: translationES,
    nativeName: 'Español',
  },
  de: {
    translation: translationDE,
    nativeName: 'Deutsch',
  },
  ja: {
    translation: translationJA,
    nativeName: '日本語',
  },
  id: {
    translation: translationID,
    nativeName: 'Bahasa Indonesia',
  },
  pt: {
    translation: translationPT,
    nativeName: 'Português',
  },
  'pt-BR': {
    translation: translationPTBR,
    nativeName: 'Português (Brasil)',
  },
};

moment.updateLocale('fr', {
  relativeTime: {
    future: 'dans %s',
    past: 'il y a %s',
    s: 'quelques secondes',
    m: 'une minute',
    mm: '%d minutes',
    h: 'une heure',
    hh: '%d heures',
    d: 'un jour',
    dd: '%d jours',
    M: 'un mois',
    MM: '%d mois',
    y: 'un an',
    yy: '%d ans',
  },
});

moment.updateLocale('es', {
  relativeTime: {
    future: 'en %s',
    past: 'hace %s',
    s: 'unos segundos',
    m: 'un minuto',
    mm: '%d minutos',
    h: 'una hora',
    hh: '%d horas',
    d: 'un día',
    dd: '%d días',
    M: 'un mes',
    MM: '%d meses',
    y: 'un año',
    yy: '%d años',
  },
});

moment.updateLocale('de', {
  relativeTime: {
    future: 'in %s',
    past: 'vor %s',
    s: 'ein paar Sekunden',
    m: 'einer Minute',
    mm: '%d Minuten',
    h: 'einer Stunde',
    hh: '%d Stunden',
    d: 'einem Tag',
    dd: '%d Tagen',
    M: 'einem Monat',
    MM: '%d Monaten',
    y: 'einem Jahr',
    yy: '%d Jahren',
  },
});

moment.updateLocale('ja', {
  relativeTime: {
    future: '%s後',
    past: '%s前',
    s: '数秒',
    m: '1分',
    mm: '%d分',
    h: '1時間',
    hh: '%d時間',
    d: '1日',
    dd: '%d日',
    M: '1ヶ月',
    MM: '%dヶ月',
    y: '1年',
    yy: '%d年',
  },
});

moment.updateLocale('id', {
  relativeTime: {
    future: 'dalam %s',
    past: '%s yang lalu',
    s: 'beberapa detik',
    m: 'semenit',
    mm: '%d menit',
    h: 'sejam',
    hh: '%d jam',
    d: 'sehari',
    dd: '%d hari',
    M: 'sebulan',
    MM: '%d bulan',
    y: 'setahun',
    yy: '%d tahun',
  },
});

moment.updateLocale('pt', {
  relativeTime: {
    future: 'em %s',
    past: 'há %s',
    s: 'alguns segundos',
    m: 'um minuto',
    mm: '%d minutos',
    h: 'uma hora',
    hh: '%d horas',
    d: 'um dia',
    dd: '%d dias',
    M: 'um mês',
    MM: '%d meses',
    y: 'um ano',
    yy: '%d anos',
  },
});

// locales is generated from the lngs object for compatibility with original locales implementation
/* eslint-disable no-param-reassign */
export const locales = Object.keys(lngs).reduce((acc, lng) => {
  acc[lng] = lngs[lng].nativeName;
  return acc;
}, {});

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector)
  .init({
    resources: lngs,
    fallbackLng: 'en', // use en if detected lng is not available
    // array of allowed languages
    supportedLngs: ['en', 'fr', 'es', 'de', 'ja', 'id', 'pt', 'pt-br'],
    // if true, will consider variants as supported when the main language is.
    // E.g. en-US will be valid if en is in supportedLngs.
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
