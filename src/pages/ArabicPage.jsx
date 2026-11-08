import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, ShoppingBag, CheckCircle2, Mail, Phone, MapPin } from 'lucide-react';
import PublicHeader from '@/components/shared/PublicHeader';
import Footer from '@/components/shared/Footer';
import FAQSection from '@/components/shared/FAQSection';
import CertificatesSection from '@/components/shared/CertificatesSection';
import LandingProducts from '@/components/landing/LandingProducts';
import { AR_MAIN_PAGES } from '@/lib/mainPagesAr';
import { PRODUCT_PAGES_AR } from '@/lib/landingPagesAr';

const CONTACTS = [
  { icon: Mail, label: 'info@icenatural.com', href: 'mailto:info@icenatural.com' },
  { icon: Phone, label: '+971 56 533 4189', href: 'tel:+97156334189' },
  { icon: MessageCircle, label: 'راسلنا عبر واتساب', href: 'https://wa.me/message/AR6CT6LVNQ5BP1' },
  { icon: MapPin, label: 'الشارع 22، منطقة القوز الصناعية 3، دبي، الإمارات', href: null },
];

export default function ArabicPage() {
  const { pathname } = useLocation();
  const page = AR_MAIN_PAGES[pathname];
  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0" lang="ar" dir="rtl">
      <PublicHeader />
      {page.video && (
        <div className="relative w-full h-[40vh] min-h-[260px] lg:h-[55vh] overflow-hidden">
          <video src={page.video} autoPlay loop muted playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      )}
      <main className="px-4 pt-6 pb-4 max-w-4xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#005696] mb-3">{page.h1}</h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{page.intro}</p>
        {page.bullets && (
          <div className="grid sm:grid-cols-3 gap-2 mb-4">
            {page.bullets.map((b) => (
              <div key={b} className="flex items-center gap-2 text-xs font-semibold text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />{b}</div>
            ))}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <Button asChild className="h-11 rounded-full bg-[#25D366] hover:bg-[#1ebe57] text-white gap-2">
            <a href="https://wa.me/message/AR6CT6LVNQ5BP1" target="_blank" rel="noopener noreferrer"><MessageCircle className="w-4 h-4" /> اطلب عبر واتساب</a>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full gap-2">
            <Link to="/order"><ShoppingBag className="w-4 h-4" /> اطلب أونلاين</Link>
          </Button>
        </div>
        {page.contact && (
          <ul className="space-y-3 mb-6">
            {CONTACTS.map(({ icon: Icon, label, href }) => (
              <li key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 min-h-11">
                <Icon className="w-5 h-5 text-[#1D71B8] shrink-0" />
                {href ? <a href={href} dir="auto" target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-sm text-[#1D71B8] font-medium">{label}</a> : <span className="text-sm text-slate-700">{label}</span>}
              </li>
            ))}
          </ul>
        )}
        {page.categories && <LandingProducts categories={page.categories} lang="ar" />}
        {pathname === '/ar/products' && (
          <nav className="mt-6 flex flex-wrap gap-2">
            {Object.entries(PRODUCT_PAGES_AR).map(([path, p]) => (
              <Link key={path} to={`/ar${path}`} className="h-11 px-4 inline-flex items-center rounded-full border border-slate-200 text-sm text-[#1D71B8]">{p.h1}</Link>
            ))}
          </nav>
        )}
        <div className="mt-8 space-y-6">
          {page.sections.map(([h, text]) => (
            <section key={h}>
              <h2 className="text-base font-bold text-[#005696] mb-2">{h}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
            </section>
          ))}
        </div>
      </main>
      {page.certificates && <CertificatesSection />}
      {page.faqs && <FAQSection faqs={page.faqs} heading="الأسئلة الشائعة" />}
      <Footer />
    </div>
  );
}