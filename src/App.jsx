import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from '@/components/layout/AppLayout';
import SEO from '@/components/shared/SEO';
import { LANDING_PAGES } from '@/lib/landingPages';
import { AR_LANDING_PAGES } from '@/lib/landingPagesAr';
import { AR_MAIN_PAGES } from '@/lib/mainPagesAr';
import { isArabicPath, hasArabic, toEnPath, toArPath } from '@/lib/i18n';

// Code-splitting: lazy-load pages for faster initial load
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const AdminProducts = lazy(() => import('@/pages/AdminProducts'));
const AdminClients = lazy(() => import('@/pages/AdminClients'));
const AdminOrders = lazy(() => import('@/pages/AdminOrders'));
const SpecialClients = lazy(() => import('@/pages/SpecialClients'));
const ProductionQueue = lazy(() => import('@/pages/ProductionQueue'));
const DeliveryQueue = lazy(() => import('@/pages/DeliveryQueue'));
const MyOrders = lazy(() => import('@/pages/MyOrders'));
const AdminDelivery = lazy(() => import('@/pages/AdminDelivery'));
const SpecialClientsTRN = lazy(() => import('@/pages/SpecialClientsTRN'));
const PublicStorefront = lazy(() => import('@/pages/PublicStorefront'));
const Home = lazy(() => import('@/pages/Home'));
const GuestTrackOrder = lazy(() => import('@/pages/GuestTrackOrder'));
const CustomIce = lazy(() => import('@/pages/CustomIce'));
const WholesaleSupply = lazy(() => import('@/pages/WholesaleSupply'));
const Profile = lazy(() => import('@/pages/Profile'));
const Login = lazy(() => import('@/pages/Login'));
const About = lazy(() => import('@/pages/About'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const Contact = lazy(() => import('@/pages/Contact'));
const ArabicPage = lazy(() => import('@/pages/ArabicPage'));

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
  </div>
);

// Guard: only allows users with the specified roles; others are redirected to their home
const RoleGuard = ({ allowedRoles, redirectTo = '/catalog', children }) => {
  const { user, isLoadingAuth } = useAuth();
  if (isLoadingAuth || !user) return null;
  if (!allowedRoles.includes(user.role)) return <Navigate to={redirectTo} replace />;
  return children;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return null;
};


const HOME_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Natural Ice Industry LLC',
  url: 'https://naturalice.ae',
  telephone: '+97156334189',
  email: 'info@icenatural.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '22nd Street, Al Quoz Industrial Area 3',
    addressLocality: 'Dubai',
    addressCountry: 'AE',
  },
  areaServed: {
    '@type': 'Country',
    name: 'United Arab Emirates',
  },
  openingHours: 'Mo-Su 00:00-23:59',
};

const LANDING_SEO = Object.fromEntries(
  Object.entries(LANDING_PAGES).map(([path, p]) => [path, { title: p.title, description: p.description, canonicalPath: path }])
);

const AR_SEO = Object.fromEntries(
  Object.entries({ ...AR_LANDING_PAGES, ...AR_MAIN_PAGES }).map(([path, p]) => [path, { title: p.title, description: p.description, canonicalPath: path }])
);

const ROUTE_SEO = {
  ...LANDING_SEO,
  ...AR_SEO,
  '/': {
    title: 'Ice Factory Dubai – Ice Delivery 24/7 UAE | Natural Ice',
    description: 'Ice factory in Dubai delivering ice cubes, tube, crushed, block & dry ice 24/7 to homes and businesses in all 7 emirates. Order online.',
    canonicalPath: '/',
    schema: HOME_SCHEMA,
  },
  '/order': {
    title: 'Buy Ice Online Dubai – Cubes, Blocks, Dry Ice | Natural Ice',
    description: 'Shop ice cubes, ice blocks, crushed, tube, clear and dry ice online. Factory prices, fast delivery across Dubai and the UAE.',
    canonicalPath: '/products',
  },
  '/products': {
    title: 'Buy Ice Online Dubai – Cubes, Blocks, Dry Ice | Natural Ice',
    description: 'Shop ice cubes, ice blocks, crushed, tube, clear and dry ice online. Factory prices, fast delivery across Dubai and the UAE.',
    canonicalPath: '/products',
  },
  '/custom-ice': {
    title: 'Custom Logo Ice & Ice Balls Dubai | Natural Ice',
    description: 'Branded logo ice, flavoured ice balls and custom shapes for events, bars and brands in Dubai. Choose shape, size and finish.',
    canonicalPath: '/custom-ice',
  },
  '/about': {
    title: 'About Natural Ice – Ice Factory in Dubai',
    description: 'Natural Ice is a Dubai ice factory producing purified food-grade ice 24/7 and delivering across all 7 emirates.',
    canonicalPath: '/about',
  },
  '/contact': {
    title: 'Order Ice Now – Call or WhatsApp | Natural Ice Dubai',
    description: 'Order ice 24/7 by phone or WhatsApp. Same-day ice delivery in Dubai, Sharjah, Abu Dhabi and all UAE.',
    canonicalPath: '/contact',
  },
  '/wholesale-ice-supplier-uae': {
    title: 'Wholesale Ice Supplier UAE – Hotels & Restaurants | Natural Ice',
    description: 'Daily bulk ice supply for hotels, restaurants, supermarkets and events. HACCP food-grade ice, own fleet, contracts across the UAE.',
    canonicalPath: '/wholesale-ice-supplier-uae',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Wholesale ice supply across the UAE',
      provider: {
        '@type': 'LocalBusiness',
        name: 'Natural Ice Industry LLC',
        url: 'https://naturalice.ae',
        telephone: '+97156334189',
      },
      areaServed: 'United Arab Emirates',
      serviceType: 'Wholesale ice manufacturing and delivery',
    },
  },
};

const PRIVATE_ROUTES = [
  '/track',
  '/login',
  '/admin/products',
  '/clients',
  '/orders',
  '/special-clients',
  '/admin-delivery',
  '/special-clients-trn',
  '/production',
  '/delivery',
  '/my-orders',
  '/catalog',
];

function RouteSEO() {
  const location = useLocation();
  const config = ROUTE_SEO[location.pathname];
  const noindex = PRIVATE_ROUTES.includes(location.pathname) || !config;

  return (
    <SEO
      title={config?.title || 'Natural Ice'}
      description={config?.description || 'Natural Ice customer and operations portal.'}
      canonicalPath={config?.canonicalPath || location.pathname}
      schema={config?.schema || null}
      noindex={noindex}
      lang={isArabicPath(location.pathname) ? 'ar' : 'en'}
      alternates={hasArabic(location.pathname) ? { en: toEnPath(location.pathname), ar: toArPath(location.pathname) } : null}
    />
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Suspense fallback={<PageLoader />}>
        <Routes location={location}>
          {/* Public route - no authentication required */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/order" element={<PublicStorefront />} />
          <Route path="/products" element={<PublicStorefront />} />
          <Route path="/track" element={<GuestTrackOrder />} />
          <Route path="/custom-ice" element={<CustomIce />} />
          <Route path="/wholesale-ice-supplier-uae" element={<WholesaleSupply />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {[...Object.keys(LANDING_PAGES), ...Object.keys(AR_LANDING_PAGES)].map((path) => (
            <Route key={path} path={path} element={<LandingPage />} />
          ))}
          {Object.keys(AR_MAIN_PAGES).map((path) => (
            <Route key={path} path={path} element={<ArabicPage />} />
          ))}

          {/* Protected routes - require authentication */}
          <Route element={<AppLayout />}>
            {/* Admin-only pages */}
            <Route path="/admin/products" element={<RoleGuard allowedRoles={['admin']}><AdminProducts /></RoleGuard>} />
            <Route path="/clients" element={<RoleGuard allowedRoles={['admin']}><AdminClients /></RoleGuard>} />
            <Route path="/orders" element={<RoleGuard allowedRoles={['admin']}><AdminOrders /></RoleGuard>} />
            <Route path="/special-clients" element={<RoleGuard allowedRoles={['admin']}><SpecialClients /></RoleGuard>} />
            <Route path="/admin-delivery" element={<RoleGuard allowedRoles={['admin']}><AdminDelivery /></RoleGuard>} />
            <Route path="/special-clients-trn" element={<RoleGuard allowedRoles={['admin']}><SpecialClientsTRN /></RoleGuard>} />
            {/* Role-specific pages */}
            <Route path="/production" element={<RoleGuard allowedRoles={['admin', 'production']} redirectTo="/catalog"><ProductionQueue /></RoleGuard>} />
            <Route path="/delivery" element={<RoleGuard allowedRoles={['admin', 'delivery']} redirectTo="/catalog"><DeliveryQueue /></RoleGuard>} />
            {/* Client pages */}
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/catalog" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </motion.div>
  );
}

function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <RouteSEO />
          <AnimatedRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App