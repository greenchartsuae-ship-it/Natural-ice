import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import StatusBadge from '@/components/shared/StatusBadge';
import OrderTracker from '@/components/shared/OrderTracker';
import { format } from 'date-fns';
import { Truck, MapPin, Phone, CheckCircle, Package, Eye, Route, User, Car, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import RouteOptimizer from '@/components/delivery/RouteOptimizer';
import DriverLiveMap from '@/components/delivery/DriverLiveMap';

export default function DeliveryQueue() {
  const queryClient = useQueryClient();
  const { user } = useOutletContext();
  const [selected, setSelected] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const needsSetup = user?.role === 'delivery' && !user?.phone && !user?.car_number;
  const [showProfile, setShowProfile] = useState(false);
  const [showSetup, setShowSetup] = useState(needsSetup);
  const [profileForm, setProfileForm] = useState({ phone: user?.phone || '', car_number: user?.car_number || '' });

  const profileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      toast.success('Profile updated');
      setShowProfile(false);
      setShowSetup(false);
    },
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['delivery-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => {
      const now = new Date().toISOString();
      const timestamps = {
        collected:  { collected_at: now },
        on_the_way: { on_the_way_at: now },
        delivered:  { delivered_at: now },
      };
      // When driver collects the order, save their name and phone
      const driverInfo = status === 'collected' ? {
        driver_name: user?.display_name || user?.full_name || '',
        driver_phone: user?.phone || '',
        assigned_driver: user?.email || '',
      } : {};
      return base44.entities.Order.update(id, { status, ...(timestamps[status] || {}), ...driverInfo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      toast.success('Status updated');
    },
  });

  // All ready orders visible to every driver
  const ready      = orders.filter(o => o.status === 'ready');
  // Only this driver's collected/on_the_way/delivered orders
  const collected  = orders.filter(o => o.status === 'collected'  && o.assigned_driver === user?.email);
  const onTheWay   = orders.filter(o => o.status === 'on_the_way' && o.assigned_driver === user?.email);
  const delivered  = orders.filter(o => o.status === 'delivered'  && o.assigned_driver === user?.email).slice(0, 15);

  // Auto-update driver location every 15 seconds for active deliveries
  React.useEffect(() => {
    const activeOrders = orders.filter(o => 
      (o.status === 'collected' || o.status === 'on_the_way') && 
      o.assigned_driver === user?.email
    );
    
    if (activeOrders.length === 0 || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        // Update all active orders with driver location
        activeOrders.forEach(order => {
          base44.entities.Order.update(order.id, {
            driver_location_lat: lat,
            driver_location_lng: lng,
          });
        });
      },
      (err) => console.error('GPS Error:', err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [orders, user?.email]);

  const renderCard = (order, action) => (
    <Card key={order.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <p className="font-semibold text-sm md:text-base">{order.client_name}</p>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex flex-wrap gap-2 text-xs md:text-sm text-muted-foreground mt-1">
              {order.delivery_address && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" /><span className="truncate max-w-[150px] md:max-w-none">{order.delivery_address}</span></span>
              )}
              {order.delivery_phone && (
                <span className="flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" />{order.delivery_phone}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {order.items?.map((item, i) => (
                <span key={i} className="text-[10px] md:text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {item.product_name} × {item.quantity}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-xs md:text-sm font-bold text-primary">AED {order.total_amount?.toFixed(2)}</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(order)}>
                <Eye className="w-3.5 h-3.5" />
              </Button>
              {action}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const Section = ({ title, count, color, borderColor, children, emptyMsg }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className={`text-base font-semibold ${color}`}>{title}</h2>
        <Badge variant="outline" className="text-xs">{count}</Badge>
      </div>
      {count === 0 ? (
        <Card className="py-6 text-center">
          <p className="text-sm text-muted-foreground">{emptyMsg}</p>
        </Card>
      ) : children}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-cyan-100 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 md:w-5 md:h-5 text-cyan-600" />
            </div>
            Delivery Queue
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {ready.length} ready · {collected.length} collected · {onTheWay.length} on the way
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => { setProfileForm({ phone: user?.phone || '', car_number: user?.car_number || '' }); setShowProfile(true); }}>
          <Pencil className="w-3.5 h-3.5" /> My Info
        </Button>
      </div>

      {collected.length > 0 && (
        <Button onClick={() => setShowRoute(true)} className="gap-2 w-fit" variant="outline">
          <Route className="w-4 h-4" /> Optimize Route ({collected.length} stops)
        </Button>
      )}

      <Section title="Ready for Pickup" count={ready.length} color="text-emerald-600" emptyMsg="No orders ready for pickup">
        {ready.map(o => renderCard(o,
          <Button size="sm" onClick={() => updateMutation.mutate({ id: o.id, status: 'collected' })} className="gap-1 text-xs h-7 px-2 bg-emerald-600 hover:bg-emerald-700">
            <Package className="w-3 h-3" /> Collect
          </Button>
        ))}
      </Section>

      <Section title="Collected" count={collected.length} color="text-cyan-600" emptyMsg="No collected orders">
        {collected.map(o => renderCard(o,
          <Button size="sm" onClick={() => updateMutation.mutate({ id: o.id, status: 'on_the_way' })} className="gap-1 text-xs h-7 px-2">
            <Truck className="w-3 h-3" /> Deliver
          </Button>
        ))}
      </Section>

      <Section title="On the Way" count={onTheWay.length} color="text-indigo-600" emptyMsg="No deliveries in transit">
        {onTheWay.map(o => renderCard(o,
          <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: o.id, status: 'delivered' })} className="gap-1 text-xs h-7 px-2 text-green-600 border-green-300 hover:bg-green-50">
            <CheckCircle className="w-3 h-3" /> Done
          </Button>
        ))}
      </Section>

      {delivered.length > 0 && (
        <Section title="Recently Delivered" count={delivered.length} color="text-muted-foreground" emptyMsg="">
          {delivered.map(o => renderCard(o, null))}
        </Section>
      )}

      <RouteOptimizer orders={orders} open={showRoute} onOpenChange={setShowRoute} />

      {/* First-time setup dialog */}
      <Dialog open={showSetup} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm" onInteractOutside={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><User className="w-4 h-4" /> Complete Your Profile</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Welcome, <strong>{user?.display_name || user?.full_name}</strong>! Please add your contact info before starting deliveries.</p>
          <div className="space-y-3">
            <div>
              <Label className="flex items-center gap-1"><Phone className="w-3 h-3" /> Phone *</Label>
              <Input value={profileForm.phone} onChange={e => setProfileForm(f => ({...f, phone: e.target.value}))} placeholder="+971 56 ..." />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Car className="w-3 h-3" /> Car Plate Number *</Label>
              <Input value={profileForm.car_number} onChange={e => setProfileForm(f => ({...f, car_number: e.target.value}))} placeholder="e.g. A 12345 Dubai" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => profileMutation.mutate(profileForm)} disabled={profileMutation.isPending || !profileForm.phone || !profileForm.car_number}>
              {profileMutation.isPending ? 'Saving...' : 'Save & Continue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Driver profile dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><User className="w-4 h-4" /> My Info</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Full Name</Label>
              <Input value={user?.display_name || user?.full_name || ''} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">Name is managed by the administrator.</p>
            </div>
            <div>
              <Label className="flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</Label>
              <Input value={profileForm.phone} onChange={e => setProfileForm(f => ({...f, phone: e.target.value}))} placeholder="+971 56 ..." />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Car className="w-3 h-3" /> Car Plate Number</Label>
              <Input value={profileForm.car_number} onChange={e => setProfileForm(f => ({...f, car_number: e.target.value}))} placeholder="e.g. A 12345 Dubai" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProfile(false)}>Cancel</Button>
            <Button onClick={() => profileMutation.mutate(profileForm)} disabled={profileMutation.isPending}>
              {profileMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order — {selected?.client_name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <OrderTracker status={selected.status} />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{selected.client_email}</span></div>
                <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{selected.delivery_phone || '—'}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <span className="font-medium">{selected.delivery_address || '—'}</span></div>
                {selected.delivery_date && <div><span className="text-muted-foreground">Delivery Date:</span> <span className="font-medium">{selected.delivery_date}</span></div>}
              </div>
              {selected.notes && <p className="text-sm bg-muted rounded-lg p-3">{selected.notes}</p>}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted"><tr>
                    <th className="text-left p-3 font-medium">Product</th>
                    <th className="text-right p-3 font-medium">Qty</th>
                    <th className="text-right p-3 font-medium">Total</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {selected.items?.map((item, i) => (
                      <tr key={i}>
                        <td className="p-3">{item.product_name}</td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right font-medium">AED {item.total?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="font-bold text-lg text-right">Total: AED {selected.total_amount?.toFixed(2)}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}