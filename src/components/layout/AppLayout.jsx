import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from './Sidebar';
import MobileTabBar from './MobileTabBar';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

export default function AppLayout() {
  const { user, isLoadingAuth, authError, navigateToLogin } = useAuth();
  const [collapsed, setCollapsed] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('naturalice_sidebar_collapsed') || 'false'); } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    try { localStorage.setItem('naturalice_sidebar_collapsed', JSON.stringify(collapsed)); } catch {}
  }, [collapsed]);

  // Redirect to login if auth failed
  React.useEffect(() => {
    if (authError && authError.type === 'auth_required') {
      navigateToLogin();
    }
  }, [authError, navigateToLogin]);

  // Show loading while checking auth
  if (isLoadingAuth || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        user={user}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content — offset by sidebar width on desktop */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 w-full",
        collapsed ? "md:pl-16" : "md:pl-64"
      )}>
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-muted active:bg-muted/80 transition-colors"
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          <span className="font-bold text-foreground text-lg">Natural Ice</span>
        </header>

        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 max-w-7xl mx-auto w-full">
          <Outlet context={{ user }} />
        </main>
      </div>
      <MobileTabBar user={user} />
    </div>
  );
}