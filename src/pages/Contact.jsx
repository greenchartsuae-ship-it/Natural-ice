import React from 'react';
import PublicHeader from '@/components/shared/PublicHeader';
import Footer from '@/components/shared/Footer';
import { Mail, Phone, MapPin, MessageCircle, Clock } from 'lucide-react';

const ITEMS = [
  { icon: MapPin, label: '22nd Street, Al Quoz Industrial Area 3, Dubai, UAE', href: null },
  { icon: Clock, label: 'Open 24 hours, 7 days a week (24/7)', href: null },
  { icon: Phone, label: '+971 56 533 4189', href: 'tel:+97156334189' },
  { icon: MessageCircle, label: 'WhatsApp us', href: 'https://wa.me/message/AR6CT6LVNQ5BP1' },
  { icon: Mail, label: 'info@icenatural.com', href: 'mailto:info@icenatural.com' },
];

const SECTIONS = [
  ['Ice delivery in Dubai, 24 hours a day', 'Buy ice in Dubai any time: our ice factory is open 24 hours, 7 days a week. Call or WhatsApp to order ice delivery in Dubai, Sharjah, Abu Dhabi and all 7 emirates. Businesses can set up daily or weekly supply.'],
  ['How to order', 'The fastest way to order is online through our shop or by sending us a message on WhatsApp with the product, quantity, delivery address and preferred time. You can also call our team directly. We confirm every order quickly and our own refrigerated trucks bring the ice to your door, so it arrives frozen and on time.'],
  ['Business and event enquiries', 'Hotels, restaurants, supermarkets, caterers, construction sites and event planners can contact us for wholesale pricing, scheduled deliveries and tax invoices. Tell us your daily volume or your guest count and we will recommend the right mix of cube, tube, crushed, block, clear or dry ice.'],
  ['Visit our factory', 'Our factory is located on 22nd Street in Al Quoz Industrial Area 3, Dubai. Customers are welcome to collect orders from the factory at any time of day or night. Use the map below for directions.'],
];

export default function Contact() {
  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <PublicHeader />
      <main className="px-4 pt-6 pb-8 max-w-3xl mx-auto">
        <h1 className="text-xl font-bold text-[#005696] mb-2">Order Ice – Open 24/7</h1>
        <p className="text-sm text-slate-600 mb-5">We are open 24 hours, 7 days a week. Reach us any way you like.</p>
        <ul className="space-y-3">
          {ITEMS.map(({ icon: Icon, label, href }) => (
            <li key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 min-h-11">
              <Icon className="w-5 h-5 text-[#1D71B8] shrink-0" />
              {href ? (
                <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-sm text-[#1D71B8] font-medium">{label}</a>
              ) : (
                <span className="text-sm text-slate-700">{label}</span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-8 space-y-6">
          {SECTIONS.map(([h, text]) => (
            <section key={h}>
              <h2 className="text-base font-bold text-[#005696] mb-2">{h}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
            </section>
          ))}
        </div>
        <iframe
          title="Natural Ice factory location, Al Quoz Industrial Area 3, Dubai"
          src="https://www.google.com/maps?q=Natural+Ice+Factory+Al+Quoz+Industrial+Area+3+Dubai&output=embed"
          className="mt-6 w-full h-72 rounded-2xl border border-slate-100"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </main>
      <Footer />
    </div>
  );
}