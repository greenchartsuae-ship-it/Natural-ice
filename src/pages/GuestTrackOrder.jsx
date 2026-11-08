import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import OrderTracker from '@/components/shared/OrderTracker';
import BottomNav from '@/components/shared/BottomNav';
import TopNav from '@/components/shared/TopNav';
import PublicHeader from '@/components/shared/PublicHeader';
import { Package, Search, ShoppingBag } from 'lucide-react';
import { formatDubai } from '@/lib/formatDubaiTime';

const STORAGE_KEY = 'naturalice_guest';
const loadGuest = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
};
const saveGuest = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

export default function GuestTrackOrder() {
  const navigate = useNavigate();
  const [guest, setGuest] = useState(loadGuest);
  const [phoneDraft, setPhoneDraft] = useState(guest.phone || '');
  const [emailDraft, setEmailDraft] = useState(guest.email || '');

  const { data, refetch, isLoading, isFetching } = useQuery({
    queryKey: ['guest-orders', guest.phone, guest.email],
    queryFn: async () => {
      const res = await base44.functions.invoke('trackGuestOrders', {
        phone: guest.phone || '',
        email: guest.email || '',
      });
      return res.data?.orders || [];
    },
    enabled: !!(guest.phone || guest.email),
    refetchInterval: 30000,
  });

  const orders = data || [];

  const handleLookup = () => {
    const next = { phone: phoneDraft.trim(), email: emailDraft.trim().toLowerCase() };
    if (!next.phone && !next.email) return;
    setGuest(next);
    saveGuest(next);
  };

  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <PublicHeader />

      <main className="px-4 pt-4 pb-8 max-w-2xl mx-auto">
        {/* Lookup card */}
        <Card className="border-slate-100 shadow-sm mb-5">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter the phone number (and/or email) you used to place your order. We'll remember you so you can track your order without an account.
            </p>
            <div>
              <Label className="text-[11px]">Phone</Label>
              <Input value={phoneDraft} onChange={e => setPhoneDraft(e.target.value)} placeholder="+971 50 123 4567" className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-[11px]">Email (optional)</Label>
              <Input value={emailDraft} onChange={e => setEmailDraft(e.target.value)} placeholder="you@example.com" className="h-9 text-sm" />
            </div>
            <Button onClick={handleLookup} disabled={!phoneDraft.trim() && !emailDraft.trim()} className="w-full bg-[#1D71B8] hover:bg-[#005696] h-9 text-xs gap-1">
              <Search className="w-4 h-4" /> Find My Orders
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {(isLoading || isFetching) ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Card key={i} className="h-24 animate-pulse bg-slate-100 border-slate-100" />)}
          </div>
        ) : !(guest.phone || guest.email) ? (
          <div className="text-center py-10 text-slate-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">Enter your details to see your orders.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Package className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">No orders found for these details.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">{orders.length} order{orders.length !== 1 ? 's' : ''} for {(guest.phone || guest.email)}</p>
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        <Button variant="outline" onClick={() => navigate('/order')} className="mt-6 w-full h-9 text-xs gap-1">
          <ShoppingBag className="w-4 h-4" /> Place a New Order
        </Button>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}

function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="border-slate-100 shadow-sm">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</p>
            <p className="text-[11px] text-slate-500">{formatDubai(order.created_date)}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm font-bold text-[#005696]">AED {order.total_amount?.toFixed(2)}</span>
            <StatusBadge status={order.status} />
          </div>
        </div>
        {order.driver_name && (
          <p className="text-xs text-indigo-600">🚚 {order.driver_name} {order.driver_phone ? `· ${order.driver_phone}` : ''}</p>
        )}
        {order.delivery_address && (
          <p className="text-[11px] text-slate-500 truncate">📍 {order.delivery_address}</p>
        )}
        <button onClick={() => setOpen(o => !o)} className="text-[11px] text-[#1D71B8] font-medium hover:underline">
          {open ? 'Hide details' : 'Show details'}
        </button>
        {open && (
          <div className="space-y-3 pt-1">
            <OrderTracker status={order.status} order={order} />
            <div className="space-y-1">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-slate-600">{item.product_name} × {item.quantity}</span>
                  <span className="text-slate-500">AED {(item.total || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}