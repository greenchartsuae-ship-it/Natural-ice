import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import ClientCatalog from '@/components/client/ClientCatalog';
import SpecialClientCatalog from '@/components/client/SpecialClientCatalog';
import ProductionQueue from '@/pages/ProductionQueue';
import DeliveryQueue from '@/pages/DeliveryQueue';

export default function Dashboard() {
  const { user } = useOutletContext();
  const role = user?.role || 'client';

  if (role === 'admin')          return <AdminDashboard />;
  if (role === 'production')     return <ProductionQueue />;
  if (role === 'delivery')       return <DeliveryQueue />;
  if (role === 'special_client') return <SpecialClientCatalog user={user} />;
  return <ClientCatalog user={user} />;
}