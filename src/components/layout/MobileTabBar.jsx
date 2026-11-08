import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { roleMenus } from './Sidebar';
import { cn } from '@/lib/utils';

/**
 * Fixed bottom tab bar shown on screens < 768px (md breakpoint) inside the
 * authenticated app, giving role-based navigation without opening the drawer.
 */
export default function MobileTabBar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role || 'client';
  const menu = roleMenus[role] || roleMenus.client;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {menu.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center min-h-[44px] min-w-[68px] px-3 py-1.5 gap-0.5 shrink-0',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}