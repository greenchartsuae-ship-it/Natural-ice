import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Home as HomeIcon, ShoppingBag, Truck, LogIn, BriefcaseBusiness } from 'lucide-react';

const items = [
  { label: 'Home', icon: HomeIcon, to: '/' },
  { label: 'Order', icon: ShoppingBag, to: '/order' },
  { label: 'Business', icon: BriefcaseBusiness, to: '/wholesale-ice-supplier-uae' },
  { label: 'Track Order', icon: Truck, to: '/track' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (label) => {
    if (label === 'Home') return location.pathname === '/';
    if (label === 'Order') return location.pathname === '/order' || location.pathname === '/products';
    if (label === 'Business') return location.pathname === '/wholesale-ice-supplier-uae';
    if (label === 'Track Order') return location.pathname === '/track';
    return false;
  };

  const allItems = [
    ...items.map(({ label, icon: Icon, to }) => ({
      label, Icon, onClick: () => navigate(to),
    })),
    { label: 'Login', Icon: LogIn, onClick: () => base44.auth.redirectToLogin(location.pathname) },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {allItems.map(({ label, Icon, onClick }) => {
          const active = isActive(label);
          return (
            <button key={label} onClick={onClick} className="flex flex-col items-center justify-center min-h-[44px] py-2 gap-0.5">
              <Icon className={`w-5 h-5 ${active ? 'text-[#1D71B8]' : 'text-slate-400'}`} />
              <span className={`text-[10px] ${active ? 'text-[#1D71B8] font-semibold' : 'text-slate-400'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}