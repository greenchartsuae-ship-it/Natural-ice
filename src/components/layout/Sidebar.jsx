import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Users, ShoppingCart, Factory, Truck,
  Star, LogOut, ChevronLeft, ChevronRight, Snowflake, ClipboardList, X, FileText
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const roleMenus = {
  admin: [
    { label: 'Dashboard',       icon: LayoutDashboard, path: '/catalog' },
    { label: 'Products',        icon: Package,         path: '/products' },
    { label: 'Users & Clients', icon: Users,           path: '/clients' },
    { label: 'Special Clients', icon: Star,            path: '/special-clients' },
    { label: 'All Orders',      icon: ClipboardList,   path: '/orders' },
    { label: 'Production',      icon: Factory,         path: '/production' },
    { label: 'Delivery',        icon: Truck,           path: '/delivery' },
    { label: 'Delivery Team',   icon: Users,           path: '/admin-delivery' },
    { label: 'Client TRN',      icon: FileText,        path: '/special-clients-trn' },
  ],
  production: [
    { label: 'Production Queue', icon: Factory,       path: '/production' },
  ],
  delivery: [
    { label: 'Delivery Queue',   icon: Truck,         path: '/delivery' },
  ],
  client: [
    { label: 'Catalog',          icon: Package,       path: '/' },
    { label: 'My Orders',        icon: ShoppingCart,  path: '/my-orders' },
  ],
  special_client: [
    { label: 'My Products',      icon: Star,          path: '/catalog' },
    { label: 'My Orders',        icon: ShoppingCart,  path: '/my-orders' },
  ],
};

const roleColors = {
  admin:          'text-red-500',
  production:     'text-purple-500',
  delivery:       'text-cyan-500',
  client:         'text-blue-500',
  special_client: 'text-amber-500',
};

const roleLabels = {
  admin:          'Administrator',
  production:     'Production',
  delivery:       'Delivery',
  client:         'Client',
  special_client: 'Special Client',
};

export default function Sidebar({ user, collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const role = user?.role || 'client';
  const menu = roleMenus[role] || roleMenus.client;

  const handleNavClick = () => {
    if (mobileOpen) setMobileOpen(false);
  };

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  const sidebarContent = (isMobile = false) => (
    <aside className={cn(
      "h-full bg-card border-r border-border flex flex-col shadow-sm",
      !isMobile && (collapsed ? "w-16" : "w-64"),
      isMobile && "w-72"
    )}>
      {/* Logo */}
      <div className="px-3 py-4 border-b border-border flex flex-col items-center gap-2 bg-white">
        <img
          src="https://media.base44.com/images/public/69e4d4aaed7dc3117eed9c83/4ef556cfe_WhatsAppImage2026-06-22at110035.jpg"
          alt="Natural Ice"
          className={cn("object-contain", collapsed && !isMobile ? "h-10 w-10" : "h-24 w-full max-w-[200px]")}
        />
        {(!collapsed || isMobile) && (
          <p className={cn("text-xs font-semibold", roleColors[role])}>
            {roleLabels[role]}
          </p>
        )}
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto p-1 rounded-lg hover:bg-muted">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed && !isMobile ? item.label : undefined}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {(!collapsed || isMobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-1">
        {(!collapsed || isMobile) && (
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-foreground truncate">{user?.display_name || user?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </Button>
      </div>

      {/* Collapse toggle — desktop only */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      )}
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className={cn(
        "hidden md:flex fixed left-0 top-0 h-full z-40 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}>
        {sidebarContent(false)}
      </div>

      {/* Mobile overlay + drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="relative z-10">
            {sidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}