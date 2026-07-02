import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import StatusBadge from '@/components/shared/StatusBadge';
import OrderTracker from '@/components/shared/OrderTracker';
import { formatDubai } from '@/lib/formatDubaiTime';
import { ShoppingCart, Eye, Clock, CheckCircle, MapPin, Phone, Truck, Navigation, Map, ChevronDown, ChevronUp, User, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ClientLiveMap from '@/components/delivery/ClientLiveMap';

export default function MyOrders() {
  const { user } = useOutletContext();
  const [selected, setSelected] = useState(null);
  const [mapOpen, setMapOpen] = useState({});
  const [showNameSetup, setShowNameSetup] = useState(!user?.full_name);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSavingName(true);
    await base44.auth.updateMe({ full_name: nameInput.trim() });
    setSavingName(false);
    setShowNameSetup(false);
  };

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders', user?.email],
    queryFn: () => base44.entities.Order.filter({ client_email: user.email }, '-created_date'),
    enabled: !!user?.email,
    refetchInterval: 30000,
  });

  const FACTORY_PHONE = '+971 56 533 4189';

  const onTheWayOrders = orders.filter(o => o.status === 'on_the_way');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-3xl font-bold">My Orders</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">Track your orders in real time</p>
      </div>

      {/* Live Deliveries Section */}
      {onTheWayOrders.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-indigo-700 flex items-center gap-2">
            <Radio className="w-4 h-4 animate-pulse" /> Live Deliveries ({onTheWayOrders.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {onTheWayOrders.map(order => (
              <Card key={order.id} className="overflow-hidden border-indigo-200">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                      {order.driver_name && <p className="text-xs text-indigo-600">🚚 {order.driver_name}</p>}
                      {order.delivery_address && <p className="text-xs text-muted-foreground truncate">{order.delivery_address}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-bold text-primary shrink-0">AED {order.total_amount?.toFixed(2)}</span>
                      <Button variant="outline" size="sm" onClick={() => setSelected(order)} className="gap-1 text-xs h-7 px-2">
                        <Eye className="w-3 h-3" /> Details
                      </Button>
                    </div>
                  </div>
                  {mapOpen[order.id] && <ClientLiveMap order={order} />}
                  <button
                    onClick={() => setMapOpen(m => ({ ...m, [order.id]: !m[order.id] }))}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:underline w-fit font-medium"
                  >
                    <Map className="w-3 h-3" />
                    {mapOpen[order.id] ? 'Hide Map' : 'Show Live Map'}
                    {mapOpen[order.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Card key={i} className="h-24 animate-pulse bg-muted" />)}
        </div>
      ) : orders.length === 0 ? (
        <Card className="py-16 text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No orders yet</p>
          <p className="text-sm text-muted-foreground mt-1">Head to the catalog to place your first order!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-3 md:p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm md:text-base">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                      Placed {order.created_date && formatDubai(order.created_date)}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {order.items?.map((item, i) => (
                        <span key={i} className="text-[10px] md:text-xs bg-muted px-1.5 py-0.5 rounded-full">
                          {item.product_name} × {item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className="text-sm md:text-lg font-bold text-primary">AED {order.total_amount?.toFixed(2)}</p>
                    <Button variant="outline" size="sm" onClick={() => setSelected(order)} className="gap-1 text-xs h-7 px-2">
                      <Eye className="w-3 h-3" /> Details
                    </Button>
                  </div>
                </div>

                {order.status !== 'cancelled' && order.status !== 'pending' && (
                  <OrderTracker status={order.status} />
                )}
                {order.status === 'pending' && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs md:text-sm text-amber-600">
                    <Clock className="w-3.5 h-3.5" /> Waiting for production approval...
                  </div>
                )}
                {order.status === 'delivered' && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs md:text-sm text-green-600">
                    <CheckCircle className="w-3.5 h-3.5" /> Your order has been delivered!
                  </div>
                )}

                {/* Driver info when collected, on the way, or delivered */}
                {(order.status === 'collected' || order.status === 'on_the_way' || order.status === 'delivered') && (order.driver_name || order.driver_phone) && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                    <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> {order.status === 'delivered' ? 'Delivered by' : 'Your order is on the way!'}
                    </p>
                    {order.driver_name && (
                      <p className="text-xs text-blue-600">Driver: <strong>{order.driver_name}</strong></p>
                    )}
                    {order.driver_phone && (
                      <a href={`tel:${order.driver_phone}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline w-fit">
                        <Phone className="w-3 h-3" /> {order.driver_phone}
                      </a>
                    )}
                    {(order.driver_location_lat || order.delivery_lat) && (
                      <>
                        <button
                          onClick={() => setMapOpen(m => ({ ...m, [order.id]: !m[order.id] }))}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline w-fit font-medium"
                        >
                          <Map className="w-3 h-3" />
                          {mapOpen[order.id] === false ? 'Show Live Map' : 'Hide Map'}
                          {mapOpen[order.id] === false ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                        </button>
                        {mapOpen[order.id] !== false && (
                          <div className="pt-1">
                            <ClientLiveMap order={order} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Cancel notice */}
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
                    To cancel your order, please call the factory:
                    <a href={`tel:${FACTORY_PHONE}`} className="text-primary font-medium hover:underline ml-1">{FACTORY_PHONE}</a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* First-time name setup dialog */}
      <Dialog open={showNameSetup} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm" onInteractOutside={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><User className="w-4 h-4" /> Welcome! What's your name?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Please enter your full name to complete your account setup.</p>
          <div>
            <Label>Full Name *</Label>
            <Input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="e.g. John Smith"
              onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSaveName} disabled={savingName || !nameInput.trim()}>
              {savingName ? 'Saving...' : 'Continue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5 max-h-[75vh] overflow-y-auto">
              <OrderTracker status={selected.status} />

              {/* Driver info card */}
              {(selected.driver_name || selected.driver_phone || selected.driver_location_lat) && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                  <p className="text-xs font-semibold text-blue-700 flex items-center gap-1 uppercase tracking-wide">
                    <Truck className="w-3.5 h-3.5" /> Delivery Driver
                  </p>
                  {selected.driver_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold">{selected.driver_name}</span>
                    </div>
                  )}
                  {selected.driver_phone && (
                    <a href={`tel:${selected.driver_phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                      <Phone className="w-4 h-4" /> {selected.driver_phone}
                    </a>
                  )}
                  {selected.driver_location_lat && selected.driver_location_lng && (
                    <a
                      href={`https://www.google.com/maps?q=${selected.driver_location_lat},${selected.driver_location_lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <Navigation className="w-4 h-4" /> Track driver live on Google Maps
                    </a>
                  )}
                </div>
              )}

              {/* Delivery location map link */}
              {selected.delivery_lat && selected.delivery_lng && (
                <a
                  href={`https://www.google.com/maps?q=${selected.delivery_lat},${selected.delivery_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <MapPin className="w-4 h-4" /> View delivery location on map
                </a>
              )}

              {/* Timeline */}
              <div className="space-y-2 text-sm">
                <p className="font-medium text-muted-foreground uppercase text-xs tracking-wider">Timeline</p>
                {[
                  { label: 'Order placed', time: selected.created_date },
                  { label: 'Approved', time: selected.approved_at },
                  { label: 'Preparing', time: selected.preparing_at },
                  { label: 'Ready', time: selected.ready_at },
                  { label: 'Collected', time: selected.collected_at },
                  { label: 'On the way', time: selected.on_the_way_at },
                  { label: 'Delivered', time: selected.delivered_at },
                ].filter(t => t.time).map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium">{t.label}</span>
                    <span className="text-muted-foreground ml-auto">
                      {formatDubai(t.time, 'short')}
                    </span>
                  </div>
                ))}
              </div>

              {selected.delivery_address && (
                <div className="text-sm bg-muted rounded-lg p-3 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>{selected.delivery_address}</span>
                </div>
              )}

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">Product</th>
                      <th className="text-right p-3 font-medium">Qty</th>
                      <th className="text-right p-3 font-medium">Price</th>
                      <th className="text-right p-3 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selected.items?.map((item, i) => (
                      <tr key={i}>
                        <td className="p-3">{item.product_name}</td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right">AED {item.unit_price?.toFixed(2)}</td>
                        <td className="p-3 text-right font-medium">AED {item.total?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-right text-lg font-bold">Total: AED {selected.total_amount?.toFixed(2)}</p>

              {/* Cancel info */}
              {selected.status !== 'cancelled' && selected.status !== 'delivered' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>To cancel, please call the factory: <a href={`tel:${FACTORY_PHONE}`} className="font-bold hover:underline">{FACTORY_PHONE}</a></span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}