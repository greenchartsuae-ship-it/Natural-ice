import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Home as HomeIcon, ShoppingBag, Truck, LogIn, BriefcaseBusiness } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { label: 'Home', icon: HomeIcon, to: '/' },
  { label: 'Order', icon: ShoppingBag, to: '/order' },
  { label: 'Business', icon: BriefcaseBusiness, to: '/wholesale-ice-supplier-uae' },
  { label: 'Track Order', icon: Truck, to: '/track' },
];

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (label) => {
    if (label === 'Home') return location.pathname === '/';
    if (label === 'Order') return location.pathname === '/order' || location.pathname === '/products';
    if (label === 'Business') return location.pathname === '/wholesale-ice-supplier-uae';
    if (label === 'Track Order') return location.pathname === '/track';
    return false;
  };

  return (
    <div className="hidden lg:flex items-center gap-1">
      {links.map(({ label, icon: Icon, to }) => {
        const active = isActive(label);
        return (
          <button
            key={label}
            onClick={() => navigate(to)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
              active ? 'bg-[#1D71B8] text-white' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        );
      })}
      <button
        onClick={() => base44.auth.redirectToLogin('/catalog')}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-100"
      >
        <LogIn className="w-4 h-4" />
        Login
      </button>
    </div>
  );
}