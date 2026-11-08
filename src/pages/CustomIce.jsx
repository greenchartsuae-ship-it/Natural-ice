import React from 'react';
import PublicHeader from '@/components/shared/PublicHeader';
import Footer from '@/components/shared/Footer';
import FAQSection from '@/components/shared/FAQSection';
import CustomIceDetails from '@/components/custom-ice/CustomIceDetails';
import { CUSTOM_ICE_FAQS } from '@/lib/pageFaqs';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

const VIDEO = '/media/05a8e44ac_naturalicecostumice.mp4';

export default function CustomIce() {
  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <PublicHeader />

      {/* Video at top of body */}
      <div className="relative w-full h-[40vh] min-h-[260px] lg:h-[55vh] overflow-hidden">
        <video
          src={VIDEO}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#29ABE2]/25 via-[#1D71B8]/15 to-[#005696]/30 pointer-events-none" />
      </div>

      <main className="px-4 pt-6 pb-8 max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-[#005696] mb-3">Custom Ice with Your Logo, Shape and Flavour</h1>
        <p className="text-xs text-slate-600 leading-relaxed mb-6">
          Select your preferred shape, size and finish to create ice made for your brand, event or celebration.
        </p>

        {/* Custom Ice Sculptures section */}
        <div className="bg-gradient-to-b from-blue-50 to-white rounded-2xl p-5 mb-6">
          <h2 className="text-base font-bold text-[#005696] mb-2">Custom Ice Sculptures</h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">Have a special design in mind? Logos, monograms, event pieces, or one-of-a-kind creations we sculpt it exactly to your vision.<br />Contact us to request your custom ice sculpture.
          </p>
          <Button asChild className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-full h-9 text-xs gap-1.5">
            <a href="https://wa.me/message/AR6CT6LVNQ5BP1" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4" /> Request via WhatsApp
            </a>
          </Button>
        </div>

        {/* Custom ice product showcases */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="aspect-square bg-slate-50 overflow-hidden">
              <img src="/media/8d2bbdbec_WhatsApp_Image_2026-08-10_at_145857_202608281650.jpeg" alt="2027 Happy New Year Ice Sculpture" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-slate-800 line-clamp-1">2027 Happy New Year Ice Sculpture</p>
              <p className="text-xs text-amber-600 font-bold mt-0.5">As per Request</p>
              <Button asChild className="mt-3 w-full bg-[#1D71B8] hover:bg-[#005696] text-white rounded-full h-8 text-xs gap-1">
                <a href="https://wa.me/message/AR6CT6LVNQ5BP1" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-3.5 h-3.5" /> Request
                </a>
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="aspect-square bg-slate-50 overflow-hidden">
              <img src="/media/ed0742df3_Make_ice_look_real_202608281650.jpeg" alt="Head Line Seafood Ice Bar Sculpture" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-slate-800 line-clamp-1">Head Line Seafood Ice Bar</p>
              <p className="text-xs text-amber-600 font-bold mt-0.5">As per Request</p>
              <Button asChild className="mt-3 w-full bg-[#1D71B8] hover:bg-[#005696] text-white rounded-full h-8 text-xs gap-1">
                <a href="https://wa.me/message/AR6CT6LVNQ5BP1" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-3.5 h-3.5" /> Request
                </a>
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="aspect-square bg-slate-50 overflow-hidden">
              <img src="/media/1038e1e02_Technical_diagram_of_ice_bar_202608281739.jpeg" alt="P&H Wedding Ice Bar Sculpture" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-slate-800 line-clamp-1">P&H Wedding Ice Bar</p>
              <p className="text-xs text-amber-600 font-bold mt-0.5">As per Request</p>
              <Button asChild className="mt-3 w-full bg-[#1D71B8] hover:bg-[#005696] text-white rounded-full h-8 text-xs gap-1">
                <a href="https://wa.me/message/AR6CT6LVNQ5BP1" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-3.5 h-3.5" /> Request
                </a>
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="aspect-square bg-slate-50 overflow-hidden">
              <img src="/media/159e21acf_Seafood_ice_sculpture_display_202608281746.jpeg" alt="Seafood Ice Display Tower" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-slate-800 line-clamp-1">Seafood Ice Display Tower</p>
              <p className="text-xs text-amber-600 font-bold mt-0.5">As per Request</p>
              <Button asChild className="mt-3 w-full bg-[#1D71B8] hover:bg-[#005696] text-white rounded-full h-8 text-xs gap-1">
                <a href="https://wa.me/message/AR6CT6LVNQ5BP1" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-3.5 h-3.5" /> Request
                </a>
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-8"><CustomIceDetails /></div>
      </main>

      <FAQSection faqs={CUSTOM_ICE_FAQS} />
      <Footer />
    </div>);

}