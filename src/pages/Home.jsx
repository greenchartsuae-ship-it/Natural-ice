import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { Home as HomeIcon, ShoppingBag, Truck, LogIn, ChevronRight, Building2, CheckCircle2, BriefcaseBusiness } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import PublicHeader from '@/components/shared/PublicHeader';
import Footer from '@/components/shared/Footer';
import CertificatesSection from '@/components/shared/CertificatesSection';
import FAQSection, { FAQS } from '@/components/shared/FAQSection';

const HOME_FAQS = [
  { q: 'Where is the nearest ice factory in Dubai?', a: 'Natural Ice is in Al Quoz Industrial Area 3, Dubai, open 24/7, with delivery across Dubai and all 7 emirates.' },
  ...FAQS,
];

const LOGO = '/media/cf868753a_natural-ice-logo.png';
const VIDEO = '/media/53a6f6faf_re.mp4';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: products = [] } = useQuery({
    queryKey: ['home-popular'],
    queryFn: () => base44.entities.Product.list('sort_order'),
    staleTime: 5 * 60 * 1000
  });
  const activeProducts = products.filter((p) => p.is_active !== false);

  const customIceImage = '/media/de963edd8_costumice.jpeg';

  // Rotate the 4-item window every 30 minutes based on current time
  const [slotIndex, setSlotIndex] = useState(0);
  useEffect(() => {
    const compute = () => {
      const now = new Date();
      const slot = Math.floor((now.getHours() * 60 + now.getMinutes()) / 30);
      setSlotIndex(slot);
    };
    compute();
    const t = setInterval(compute, 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const popularPicks = (() => {
    if (activeProducts.length === 0) return [];
    const rotated = [];
    for (let i = 0; i < Math.min(4, activeProducts.length); i++) {
      rotated.push(activeProducts[(slotIndex * 4 + i) % activeProducts.length]);
    }
    return rotated;
  })();



  const navItems = [
  { label: 'Home', icon: HomeIcon, onClick: () => navigate('/') },
  { label: 'Order', icon: ShoppingBag, onClick: () => navigate('/order') },
  { label: 'Business', icon: BriefcaseBusiness, onClick: () => navigate('/wholesale-ice-supplier-uae') },
  { label: 'Track Order', icon: Truck, onClick: () => navigate('/track') },
  { label: 'Login', icon: LogIn, onClick: () => base44.auth.redirectToLogin('/catalog') }];


  const isActive = (label) => {
    if (label === 'Home') return location.pathname === '/';
    if (label === 'Order') return location.pathname === '/order' || location.pathname === '/products';
    if (label === 'Business') return location.pathname === '/wholesale-ice-supplier-uae';
    if (label === 'Track Order') return location.pathname === '/track';
    return false;
  };

  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      {/* Header */}
      <PublicHeader />

      {/* Video with transparent blue overlay */}
      <div className="relative w-full h-[40vh] min-h-[260px] lg:h-[60vh] overflow-hidden">
        <video
          src={VIDEO}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover" />
        
        <div className="absolute inset-0 bg-gradient-to-b from-[#29ABE2]/25 via-[#1D71B8]/15 to-[#005696]/30 pointer-events-none" />
      </div>

      {/* Content area */}
      <main className="px-4 pt-6 pb-8">
        {/* Hero text */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-3xl p-6 lg:p-10 mb-6 border border-blue-100">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1D71B8]">Factory-direct · Dubai · UAE-wide</p>
          <h1 className="text-3xl lg:text-5xl font-bold text-[#005696] tracking-tight mt-3 leading-tight">
            Ice Factory & Ice Delivery in Dubai and Across UAE
          </h1>
          <p className="text-sm lg:text-base text-slate-600 leading-relaxed mt-4 max-w-3xl">
            Natural Ice is an ice factory in Dubai (Al Quoz Industrial Area 3) and one of the largest ice manufacturers in the UAE, producing up to 1,000 tonnes of ice per day. Order purified cube, tube, crushed, block and premium cocktail ice, or request reliable wholesale supply for your restaurant, hotel, supermarket or event.
          </p>
          <div className="mt-6 grid sm:grid-cols-2 gap-3 max-w-2xl">
            <Button
              onClick={() => {
                trackEvent('cta_click', { cta: 'order_online', location: 'home_hero' });
                navigate('/order');
              }}
              className="w-full bg-[#1D71B8] hover:bg-[#005696] text-white rounded-full h-11 text-sm gap-1"
            >
              Order Ice Online <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => {
                trackEvent('cta_click', { cta: 'wholesale_quote', location: 'home_hero' });
                navigate('/wholesale-ice-supplier-uae');
              }}
              variant="outline"
              className="w-full border-[#1D71B8] text-[#005696] hover:bg-blue-50 rounded-full h-11 text-sm gap-2"
            >
              <Building2 className="w-4 h-4" /> Business Supply
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7">
            {['Open 24/7', 'Delivery across all 7 Emirates', 'Homes and business supply'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <h2 className="text-sm font-bold text-slate-800 mb-1">Ice factory near me in Dubai</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Looking for an ice factory near you? Our ice plant in Al Quoz, Dubai is open 24/7. Buy ice online or on WhatsApp and get ice delivery in Dubai the same day, or scheduled delivery to all 7 emirates.
          </p>
        </section>

        {/* Custom Ice Studio card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6 overflow-hidden">
          {customIceImage &&
          <div className="w-full bg-white">
              <img src={customIceImage} alt="Custom Ice" className="w-full h-auto" loading="eager" fetchpriority="high" />
            </div>
          }
          <div className="p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-1">CHOOSE YOUR OWN ICE.</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Create ice made for your brand, event or celebration. Choose the shape, size and finish then make it unmistakably yours.
            </p>
            <Button onClick={() => navigate('/custom-ice')} className="mt-3 w-full bg-[#1D71B8] hover:bg-[#005696] text-white rounded-full h-9 text-xs gap-1">
              Choose Now <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Popular Picks */}
        <div className="mb-2">
          <h2 className="text-sm font-bold text-slate-800">Popular Picks</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {popularPicks.length === 0 ?
          [1, 2, 3, 4].map((i) => <div key={i} className="aspect-square rounded-xl bg-blue-50 animate-pulse" />) :
          popularPicks.map((p) =>
          <div
            key={p.id}
            onClick={() => navigate('/order')}
            className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-transform">
            
              <div className="aspect-square bg-blue-50 overflow-hidden">
                {p.image_url ?
              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" /> :

              <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-blue-300" />
                  </div>
              }
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold text-slate-800 line-clamp-1">{p.name}</p>
                {p.price_on_request ?
              <p className="text-xs text-amber-600 font-bold mt-0.5">As per Request</p> :
              <p className="text-xs text-[#005696] font-bold mt-0.5">AED {p.price}<span className="text-[10px] text-slate-400 font-normal">/{p.unit}</span></p>
              }
              </div>
            </div>
          )}
        </div>
      </main>

      <CertificatesSection />
      <FAQSection faqs={HOME_FAQS} />
      <Footer />

      {/* Fixed bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 z-40 lg:hidden">
        <div className="grid grid-cols-5">
          {navItems.map(({ label, icon: Icon, onClick }) => {
            const active = isActive(label);
            return (
              <button key={label} onClick={onClick} className="flex flex-col items-center justify-center py-2 gap-0.5">
                <Icon className={`w-5 h-5 ${active ? 'text-[#1D71B8]' : 'text-slate-400'}`} />
                <span className={`text-[10px] ${active ? 'text-[#1D71B8] font-semibold' : 'text-slate-400'}`}>{label}</span>
              </button>);

          })}
        </div>
      </nav>
    </div>);

}