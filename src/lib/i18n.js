import { AR_LANDING_PAGES } from '@/lib/landingPagesAr';
import { AR_MAIN_PAGES } from '@/lib/mainPagesAr';

// English paths that have an Arabic version under /ar
export const AR_AVAILABLE = new Set([...Object.keys(AR_LANDING_PAGES), ...Object.keys(AR_MAIN_PAGES)].map((p) => p.replace(/^\/ar/, '') || '/'));

export const isArabicPath = (path) => path === '/ar' || path.startsWith('/ar/');
export const toEnPath = (path) => (isArabicPath(path) ? path.replace(/^\/ar/, '') || '/' : path);
export const toArPath = (path) => `/ar${toEnPath(path) === '/' ? '' : toEnPath(path)}`;
export const hasArabic = (path) => AR_AVAILABLE.has(toEnPath(path));

const STRINGS = {
  en: { whatsapp: 'Order on WhatsApp', online: 'Order online', faq: 'Frequently Asked Questions', onRequest: 'As per Request', altSuffix: 'from Natural Ice factory in Dubai' },
  ar: { whatsapp: 'اطلب عبر واتساب', online: 'اطلب أونلاين', faq: 'الأسئلة الشائعة', onRequest: 'حسب الطلب', altSuffix: 'من مصنع الثلج الطبيعي في دبي' },
};
export const t = (lang, key) => STRINGS[lang][key];