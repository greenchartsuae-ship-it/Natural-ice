import React from 'react';

const IMG = 'https://media.base44.com/images/public/6a742cb7f9842b00a4e6cd76/';
const CERTS = [
  { img: IMG + '9ae5b2e1b_natural-ice-iso-22000-certificate.jpg', alt: 'Natural Ice ISO 22000:2018 food safety certificate' },
  { img: IMG + 'f2937884f_natural-ice-haccp-certificate.jpg', alt: 'Natural Ice HACCP certificate' },
  { img: IMG + 'e5912973c_natural-ice-emirates-quality-mark-1.jpg', alt: 'Natural Ice Emirates Quality Mark license for tube ice' },
];

const TEXT = {
  en: ['Certified and built for scale', 'Natural Ice produces up to 1,000 tonnes of ice per day in our factory in Al Quoz Industrial Area 3, Dubai. Our food safety system is certified to ISO 22000:2018 (accredited by EIAC), we are HACCP certified since 2022, and our tube ice carries the Emirates Quality Mark from the UAE Ministry of Industry and Advanced Technology.'],
  ar: ['معتمدون ومجهزون للإنتاج الكبير', 'ينتج الثلج الطبيعي ما يصل إلى 1,000 طن من الثلج يومياً في مصنعنا بمنطقة القوز الصناعية 3 في دبي. نظام سلامة الغذاء لدينا حاصل على شهادة ISO 22000:2018 (معتمدة من مركز الإمارات للاعتماد EIAC)، ونحن حاصلون على شهادة HACCP منذ عام 2022، ويحمل الثلج الأنبوبي لدينا علامة الجودة الإماراتية من وزارة الصناعة والتكنولوجيا المتقدمة.'],
};

export default function CertifiedSection({ lang = 'en' }) {
  const [h, p] = TEXT[lang];
  return (
    <section>
      <h2 className="text-base font-bold text-[#005696] mb-2">{h}</h2>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">{p}</p>
      <div className="grid grid-cols-3 gap-3">
        {CERTS.map((c) => (
          <a key={c.img} href={c.img} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-100 bg-white p-2 shadow-sm">
            <img src={c.img} alt={c.alt} loading="lazy" className="w-full aspect-[1/1.41] object-cover rounded-lg bg-slate-50" />
          </a>
        ))}
      </div>
    </section>
  );
}