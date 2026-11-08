import React from 'react';
import { useLocation } from 'react-router-dom';
import { EMIRATE_PAGES } from '@/lib/emiratePages';
import { isArabicPath } from '@/lib/i18n';
import { MapPin, Phone, Mail, Globe, Clock } from 'lucide-react';

const LOGO = 'https://media.base44.com/images/public/6a742cb7f9842b00a4e6cd76/cf868753a_natural-ice-logo.png';

const T = {
  en: {
    tagline: 'Factory-direct ice delivery for homes, restaurants, hotels, supermarkets and events across the UAE.',
    contact: 'Contact Us', address: '22nd Street, Al Quoz Industrial Area 3, Dubai', box: 'P.O. Box 390805',
    hours: 'Working Hours', open: 'Open 24 hours / 7 days a week', byEmirate: 'Ice delivery by emirate',
    rights: '© 2026 Natural Ice. All rights reserved.', prefix: '',
    links: [['/products', 'Ice Products'], ['/wholesale-ice-supplier-uae', 'Business Supply'], ['/custom-ice', 'Custom Ice'], ['/ice-cubes-dubai', 'Ice Cubes'], ['/ice-block-dubai', 'Ice Blocks'], ['/tube-crushed-ice', 'Tube & Crushed Ice'], ['/dry-ice-dubai', 'Dry Ice'], ['/clear-ice', 'Clear Ice'], ['/ice-for-events', 'Events & Pools'], ['/best-ice-factory-uae', 'Why Natural Ice'], ['/about', 'About'], ['/contact', 'Contact']],
  },
  ar: {
    tagline: 'توصيل الثلج مباشرة من المصنع للمنازل والمطاعم والفنادق ومحلات السوبرماركت والفعاليات في جميع أنحاء الإمارات.',
    contact: 'تواصل معنا', address: 'الشارع 22، منطقة القوز الصناعية 3، دبي', box: 'ص.ب 390805',
    hours: 'ساعات العمل', open: 'مفتوح 24 ساعة / 7 أيام في الأسبوع', byEmirate: 'توصيل الثلج حسب الإمارة',
    rights: '© 2026 الثلج الطبيعي. جميع الحقوق محفوظة.', prefix: '/ar',
    links: [['/products', 'منتجات الثلج'], ['/wholesale-ice-supplier-uae', 'توريد للشركات'], ['/custom-ice', 'الثلج المخصص'], ['/ice-cubes-dubai', 'مكعبات الثلج'], ['/ice-block-dubai', 'ألواح الثلج'], ['/tube-crushed-ice', 'الثلج الأنبوبي والمجروش'], ['/dry-ice-dubai', 'الثلج الجاف'], ['/clear-ice', 'الثلج الشفاف'], ['/ice-for-events', 'الفعاليات والمسابح'], ['/best-ice-factory-uae', 'لماذا الثلج الطبيعي'], ['/about', 'من نحن'], ['/contact', 'اتصل بنا']],
  },
};

const EMIRATES_AR = { Dubai: 'دبي', 'Abu Dhabi': 'أبوظبي', Sharjah: 'الشارقة', Ajman: 'عجمان', 'Umm Al Quwain': 'أم القيوين', 'Ras Al Khaimah': 'رأس الخيمة', Fujairah: 'الفجيرة', 'Al Ain': 'العين' };

export default function Footer() {
  const ar = isArabicPath(useLocation().pathname);
  const s = T[ar ? 'ar' : 'en'];
  const link = 'text-[#1D71B8] hover:text-[#005696]';
  return (
    <footer className="bg-white border-t border-slate-100 px-4 pt-8 pb-24 lg:pb-10 mt-8" dir={ar ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <img src={LOGO} alt={ar ? 'الثلج الطبيعي' : 'Natural Ice'} className="h-12 w-auto object-contain mb-3" loading="lazy" />
          <p className="text-xs text-[#777] leading-relaxed max-w-xs">{s.tagline}</p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#333] mb-3">{s.contact}</h3>
          <ul className="space-y-2.5 text-xs text-[#777]">
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-[#3498db] mt-0.5 shrink-0" /><span className="leading-relaxed">{s.address}<br />{s.box}</span></li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#3498db] shrink-0" /><a href="tel:+97156334189" dir="ltr" className="hover:text-[#1D71B8]">+971 4 347 7727 / +971 56 533 4189</a></li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#3498db] shrink-0" /><a href="mailto:info@icenatural.com" className="hover:text-[#1D71B8]">info@icenatural.com</a></li>
            <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-[#3498db] shrink-0" /><a href="https://naturalice.ae" className="hover:text-[#1D71B8]">naturalice.ae</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#333] mb-3">{s.hours}</h3>
          <div className="flex items-center gap-2 text-xs text-[#777]"><Clock className="w-4 h-4 text-[#3498db] shrink-0" /><span>{s.open}</span></div>
          <nav aria-label="Footer navigation" className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {s.links.map(([path, label]) => <a key={path} href={s.prefix + path} className={link}>{label}</a>)}
          </nav>
          <h3 className="text-sm font-bold text-[#333] mt-5 mb-2">{s.byEmirate}</h3>
          <nav aria-label="Ice delivery by emirate" className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {Object.entries(EMIRATE_PAGES).map(([path, p]) => (
              <a key={path} href={s.prefix + path} className={link}>{ar ? EMIRATES_AR[p.short] || p.short : p.short}</a>
            ))}
          </nav>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-5 border-t border-[#dddddd]">
        <p className="text-center text-xs text-[#777]">{s.rights}</p>
      </div>
    </footer>
  );
}