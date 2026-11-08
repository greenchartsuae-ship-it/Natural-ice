import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock3,
  Factory,
  MapPinned,
  MessageCircle,
  PackageCheck,
  Phone,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import PublicHeader from '@/components/shared/PublicHeader';
import Footer from '@/components/shared/Footer';
import FAQSection from '@/components/shared/FAQSection';
import { WHOLESALE_FAQS } from '@/lib/pageFaqs';
import BottomNav from '@/components/shared/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trackEvent } from '@/lib/analytics';

const PHONE_DISPLAY = '+971 56 533 4189';
const PHONE_NUMBER = '971565334189';

const products = [
  'Tube ice and cube ice',
  'Crushed and flake ice',
  'Block ice',
  'Crystal-clear cocktail ice',
  'Ice balls and long cubes',
  'Dry ice for cooling and special effects',
];

const benefits = [
  { icon: Factory, title: 'Factory-direct supply', text: 'Consistent production and quality control from our Dubai facility.' },
  { icon: Truck, title: 'Scheduled UAE delivery', text: 'Regular and urgent delivery options for hospitality and retail operations.' },
  { icon: Clock3, title: '24/7 availability', text: 'Supply support designed for businesses that cannot afford to run out of ice.' },
  { icon: ShieldCheck, title: 'Hygiene-focused production', text: 'Purified water and controlled handling for dependable commercial use.' },
];

export default function WholesaleSupply() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    company: '',
    businessType: '',
    emirate: '',
    requirement: '',
    phone: '',
  });

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const formComplete = Object.values(form).every((value) => value.trim().length > 0);

  const submitWhatsApp = (event) => {
    event.preventDefault();
    if (!formComplete) return;
    const message = [
      'Hello Natural Ice, I would like a wholesale supply quote.',
      '',
      'Name: ' + form.name,
      'Company: ' + form.company,
      'Business type: ' + form.businessType,
      'Emirate: ' + form.emirate,
      'Ice requirement: ' + form.requirement,
      'Contact number: ' + form.phone,
    ].join('\n');

    trackEvent('generate_lead', {
      lead_type: 'wholesale_quote',
      business_type: form.businessType,
      emirate: form.emirate,
    });

    window.open('https://wa.me/' + PHONE_NUMBER + '?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <PublicHeader />

      <main>
        <section className="bg-gradient-to-br from-[#003d70] via-[#005696] to-[#1D71B8] text-white">
          <div className="max-w-6xl mx-auto px-4 py-14 lg:py-20 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-semibold mb-5">
                <Building2 className="w-4 h-4" />
                Restaurants · Hotels · Supermarkets · Events
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold leading-tight">
                Wholesale Ice Supplier for Businesses in the UAE
              </h1>
              <p className="mt-4 text-blue-50 leading-relaxed max-w-2xl">
                Natural Ice is a wholesale ice supplier in the UAE for hotels, restaurants, supermarkets and caterers, with bulk ice delivered on a fixed daily schedule. Reliable bulk ice supply from our Dubai factory, with scheduled delivery across the UAE. Get the right product, quantity and delivery plan for your operation.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <a
                  href="#quote"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-[#005696] hover:bg-blue-50 transition-colors"
                  onClick={() => trackEvent('cta_click', { cta: 'wholesale_quote', location: 'hero' })}
                >
                  Request Wholesale Quote
                </a>
                <button
                  type="button"
                  onClick={() => {
                    trackEvent('cta_click', { cta: 'order_online', location: 'wholesale_hero' });
                    navigate('/order');
                  }}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/35 px-6 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Order Online
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-white/10 border border-white/20 p-6 backdrop-blur-sm">
              <h2 className="text-lg font-bold mb-4">Built for uninterrupted supply</h2>
              <div className="space-y-3">
                {[
                  'Regular delivery schedules',
                  'Bulk and recurring orders',
                  'Supply for all seven Emirates',
                  'Commercial product selection',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-blue-50">
                    <CheckCircle2 className="w-5 h-5 text-cyan-200 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
                <Icon className="w-7 h-7 text-[#1D71B8]" />
                <h2 className="font-bold text-slate-900 mt-4">{title}</h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-4 py-14 grid lg:grid-cols-2 gap-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1D71B8]">Commercial range</p>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mt-2">Ice products for every operation</h2>
              <p className="text-slate-600 mt-3 leading-relaxed">
                Tell us how the ice will be used. We will recommend the product, pack size and delivery schedule that fit the job.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mt-7">
                {products.map((product) => (
                  <div key={product} className="flex items-start gap-2 rounded-xl bg-white border border-slate-200 p-3 text-sm text-slate-700">
                    <PackageCheck className="w-5 h-5 text-[#1D71B8] shrink-0" />
                    {product}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Who we supply</h2>
              <div className="mt-5 space-y-4">
                {[
                  ['Restaurants & cafés', 'Drink service, kitchen operations and emergency replenishment.'],
                  ['Hotels & events', 'Reliable volume for banquets, bars, catering and guest service.'],
                  ['Supermarkets & retailers', 'Retail-ready ice supply and scheduled stock replenishment.'],
                  ['Food & cold chain', 'Cooling support for seafood, transport and temperature-sensitive goods.'],
                ].map(([title, text]) => (
                  <div key={title} className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="quote" className="max-w-6xl mx-auto px-4 py-14 scroll-mt-24">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1D71B8]">Business enquiry</p>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mt-2">Request a wholesale quote</h2>
              <p className="text-slate-600 mt-3 leading-relaxed">
                Share your expected quantity and frequency. Our team will continue the quotation with you on WhatsApp.
              </p>
              <div className="mt-7 space-y-4 text-sm text-slate-700">
                <div className="flex gap-3"><MapPinned className="w-5 h-5 text-[#1D71B8]" /> Delivery across the UAE</div>
                <a href={'tel:+' + PHONE_NUMBER} className="flex gap-3 hover:text-[#1D71B8]"><Phone className="w-5 h-5 text-[#1D71B8]" /> {PHONE_DISPLAY}</a>
                <div className="flex gap-3"><Truck className="w-5 h-5 text-[#1D71B8]" /> Regular and urgent supply options</div>
              </div>
            </div>

            <form onSubmit={submitWhatsApp} className="rounded-3xl border border-slate-200 bg-white p-6 lg:p-8 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="lead-name">Your name</Label>
                  <Input id="lead-name" required value={form.name} onChange={(event) => update('name', event.target.value)} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="lead-company">Company name</Label>
                  <Input id="lead-company" required value={form.company} onChange={(event) => update('company', event.target.value)} className="mt-2" />
                </div>
                <div>
                  <Label>Business type</Label>
                  <Select required value={form.businessType} onValueChange={(value) => update('businessType', value)}>
                    <SelectTrigger className="mt-2"><SelectValue placeholder="Select business type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant-cafe">Restaurant / Café</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="supermarket">Supermarket / Retailer</SelectItem>
                      <SelectItem value="events-catering">Events / Catering</SelectItem>
                      <SelectItem value="food-cold-chain">Food / Cold Chain</SelectItem>
                      <SelectItem value="other">Other business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Emirate</Label>
                  <Select required value={form.emirate} onValueChange={(value) => update('emirate', value)}>
                    <SelectTrigger className="mt-2"><SelectValue placeholder="Select Emirate" /></SelectTrigger>
                    <SelectContent>
                      {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'].map((emirate) => (
                        <SelectItem key={emirate} value={emirate}>{emirate}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="lead-requirement">Quantity and delivery frequency</Label>
                  <Input
                    id="lead-requirement"
                    required
                    placeholder="Example: 100 kg daily, tube ice"
                    value={form.requirement}
                    onChange={(event) => update('requirement', event.target.value)}
                    className="mt-2"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="lead-phone">Contact number</Label>
                  <Input id="lead-phone" required type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} className="mt-2" />
                </div>
              </div>
              <Button type="submit" disabled={!formComplete} className="w-full h-12 rounded-full mt-6 bg-[#1D71B8] hover:bg-[#005696] gap-2">
                <MessageCircle className="w-5 h-5" />
                Send Request on WhatsApp
              </Button>
              <p className="text-[11px] text-slate-500 text-center mt-3">
                Your information is sent to Natural Ice through WhatsApp only when you press the button.
              </p>
            </form>
          </div>
        </section>
      </main>

      <FAQSection faqs={WHOLESALE_FAQS} />
      <Footer />
      <BottomNav />
    </div>
  );
}