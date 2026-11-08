import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, FileText } from 'lucide-react';
import { isArabicPath } from '@/lib/i18n';

const IMG = 'https://media.base44.com/images/public/6a742cb7f9842b00a4e6cd76/';
const CERTS = [
  { name: 'ISO 22000:2018', nameAr: 'ISO 22000:2018', desc: 'Food Safety Management System · No. CQ25-1111 · Valid until 11 Jul 2028', descAr: 'نظام إدارة سلامة الغذاء · رقم CQ25-1111 · صالحة حتى 11 يوليو 2028', img: IMG + '9ae5b2e1b_natural-ice-iso-22000-certificate.jpg', alt: 'Natural Ice ISO 22000:2018 food safety certificate' },
  { name: 'HACCP', nameAr: 'HACCP', desc: 'Codex CAC/RCP 1-1969 · No. CQ25-1110 · Valid until 11 Jul 2028', descAr: 'الدستور الغذائي CAC/RCP 1-1969 · رقم CQ25-1110 · صالحة حتى 11 يوليو 2028', img: IMG + 'f2937884f_natural-ice-haccp-certificate.jpg', alt: 'Natural Ice HACCP certificate' },
  { name: 'Emirates Quality Mark', nameAr: 'علامة الجودة الإماراتية', desc: 'Ministry of Industry & Advanced Technology · Valid until 16 Jul 2028', descAr: 'وزارة الصناعة والتكنولوجيا المتقدمة · صالحة حتى 16 يوليو 2028', img: IMG + 'e5912973c_natural-ice-emirates-quality-mark-1.jpg', alt: 'Natural Ice Emirates Quality Mark licence' },
];

export default function CertificatesSection() {
  const ar = isArabicPath(useLocation().pathname);
  return (
    <section className="max-w-5xl mx-auto px-4 py-8" dir={ar ? 'rtl' : 'ltr'}>
      <h2 className="text-lg font-bold text-[#005696] mb-1">{ar ? 'الشهادات' : 'Certificates'}</h2>
      <p className="text-sm text-slate-600 mb-4">{ar ? 'يُنتَج ثلجنا وفق معايير معتمدة لسلامة الغذاء والجودة.' : 'Our ice is produced under certified food-safety and quality standards.'}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CERTS.map((c) => (
          <a key={c.img} href={c.img} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:border-[#1D71B8] transition-colors">
            <ShieldCheck className="w-8 h-8 text-[#1D71B8]" aria-label={c.alt} />
            <h3 className="text-xs font-bold text-slate-800 mt-2">{ar ? c.nameAr : c.name}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{ar ? c.descAr : c.desc}</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D71B8] mt-2"><FileText className="w-3.5 h-3.5" /> {ar ? 'عرض الشهادة' : 'View certificate'}</span>
          </a>
        ))}
      </div>
    </section>
  );
}