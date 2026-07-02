import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

export default function AppLayout() {
  const { user, isLoadingAuth, authError, navigateToLogin } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();

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
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <span className="font-bold text-foreground text-lg">Natural Ice</span>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}