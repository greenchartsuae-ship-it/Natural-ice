import React from 'react';
import { useLocation } from 'react-router-dom';
import TopNav from '@/components/shared/TopNav';
import BackButton from '@/components/shared/BackButton';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

const LOGO = '/media/cf868753a_natural-ice-logo.png';

export default function PublicHeader({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/ar';

  return (
    <header className="bg-white sticky top-0 z-40 border-b border-slate-100 pt-[env(safe-area-inset-top)]">
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isHome && <BackButton to={location.pathname.startsWith('/ar/') ? '/ar' : '/'} />}
          <img src={LOGO} alt="Natural Ice" className="h-9 w-auto object-contain" fetchpriority="high" loading="eager" />
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {children}
          <TopNav />
        </div>
      </div>
    </header>
  );
}