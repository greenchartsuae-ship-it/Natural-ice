import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import AdminProducts from '@/pages/AdminProducts';
import AdminClients from '@/pages/AdminClients';
import AdminOrders from '@/pages/AdminOrders';
import SpecialClients from '@/pages/SpecialClients';
import ProductionQueue from '@/pages/ProductionQueue';
import DeliveryQueue from '@/pages/DeliveryQueue';
import MyOrders from '@/pages/MyOrders';
import AdminDelivery from '@/pages/AdminDelivery';
import SpecialClientsTRN from '@/pages/SpecialClientsTRN';
import PublicStorefront from '@/pages/PublicStorefront';
import Login from '@/pages/Login';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // This component is now only used for protected routes
  return null;
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            {/* Public routes - no authentication required */}
            <Route path="/" element={<PublicStorefront />} />
            <Route path="/login" element={<Login />} />

            {/* Protected routes - require authentication */}
            <Route element={<AppLayout />}>
              <Route path="/products" element={<AdminProducts />} />
              <Route path="/clients" element={<AdminClients />} />
              <Route path="/orders" element={<AdminOrders />} />
              <Route path="/special-clients" element={<SpecialClients />} />
              <Route path="/production" element={<ProductionQueue />} />
              <Route path="/delivery" element={<DeliveryQueue />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/admin-delivery" element={<AdminDelivery />} />
              <Route path="/special-clients-trn" element={<SpecialClientsTRN />} />
              <Route path="/catalog" element={<Dashboard />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App