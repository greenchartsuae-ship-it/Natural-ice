import React from 'react';
import PublicHeader from '@/components/shared/PublicHeader';
import Footer from '@/components/shared/Footer';
import CertificatesSection from '@/components/shared/CertificatesSection';

export default function About() {
  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <PublicHeader />
      <main className="px-4 pt-6 pb-8 max-w-3xl mx-auto space-y-4 text-sm text-slate-600 leading-relaxed">
        <h1 className="text-xl font-bold text-[#005696]">About Our Ice Factory</h1>
        <p>
          Natural Ice is the online ordering app of Natural Ice Industry LLC, a Dubai-based ice factory located in Al Quoz Industrial Area 3.
          The app lets you browse our full range of purified ice, including cube ice, tube ice, crushed ice, large and long ice cubes,
          ice balls, diamond and luxury ice, dry ice and fully custom ice sculptures, then place an order for fast delivery anywhere in the UAE.
        </p>
        <p>
          It is built for everyone who needs reliable, clean ice: households hosting a party, restaurants, bars and cafés, hotels,
          supermarkets, caterers, event planners and wedding organisers. Business customers can get dedicated pricing, exclusive products,
          scheduled supply and tax invoices, while guests can order without an account and track their delivery using only a phone number.
        </p>
        <p>
          The app and the ice behind it are made by the Natural Ice team in Dubai. Our factory runs 24 hours a day, 7 days a week,
          producing ice from purified water under strict hygiene standards. Our production and delivery teams use the same app to
          prepare orders, follow live driver locations and keep customers updated at every step, from approval to delivery at your door.
        </p>
      </main>
      <CertificatesSection />
      <Footer />
    </div>
  );
}