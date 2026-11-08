import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MessageCircle, ShoppingBag } from 'lucide-react';
import PublicHeader from '@/components/shared/PublicHeader';
import Footer from '@/components/shared/Footer';
import FAQSection from '@/components/shared/FAQSection';
import { Button } from '@/components/ui/button';
import CertifiedSection from '@/components/landing/CertifiedSection';
import EmirateDetails from '@/components/landing/EmirateDetails';
import LandingProducts from '@/components/landing/LandingProducts';
import { LANDING_PAGES } from '@/lib/landingPages';
import { AR_LANDING_PAGES } from '@/lib/landingPagesAr';
import { isArabicPath, t } from '@/lib/i18n';

export default function LandingPage() {
  const { pathname } = useLocation();
  const lang = isArabicPath(pathname) ? 'ar' : 'en';
  const page = LANDING_PAGES[pathname] || AR_LANDING_PAGES[pathname];

  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0" lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <PublicHeader />
      <main className="px-4 pt-6 pb-4 max-w-4xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#005696] mb-3">{page.h1}</h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{page.intro || page.description}</p>
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <Button asChild className="h-11 rounded-full bg-[#25D366] hover:bg-[#1ebe57] text-white gap-2">
            <a href="https://wa.me/message/AR6CT6LVNQ5BP1" target="_blank" rel="noopener noreferrer"><MessageCircle className="w-4 h-4" /> {t(lang, 'whatsapp')}</a>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full gap-2">
            <Link to="/products"><ShoppingBag className="w-4 h-4" /> {t(lang, 'online')}</Link>
          </Button>
        </div>
        <LandingProducts categories={page.categories} names={page.names} lang={lang} />
        <div className="mt-8 space-y-6">
          {page.sections.map(([h, text]) => (
            <section key={h}>
              <h2 className="text-base font-bold text-[#005696] mb-2">{h}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
            </section>
          ))}
          {pathname.replace(/^\/ar/, '') === '/best-ice-factory-uae' && <CertifiedSection lang={lang} />}
          {page.areas && <EmirateDetails page={page} />}
        </div>
      </main>
      {page.faqs ? <FAQSection faqs={page.faqs} heading={t(lang, 'faq')} /> : <FAQSection />}
      <Footer />
    </div>
  );
}