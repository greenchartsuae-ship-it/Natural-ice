import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StatusBadge from '@/components/shared/StatusBadge';
import OrderTracker from '@/components/shared/OrderTracker';
import PrintInvoice from '@/components/shared/PrintInvoice';
import { formatDubai } from '@/lib/formatDubaiTime';
import { Eye, ShoppingCart, Trash2, Search, Printer, MapPin, Phone, Truck, Navigation, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const ALL_STATUSES = ['pending','approved','preparing','ready','collected','on_the_way','delivered','cancelled'];
const statusLabel = (s) => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

export default function AdminOrders() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);
  const [driverForm, setDriverForm] = useState({ driver_name: '', driver_phone: '' });
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 500),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const deliveryUsers = users.filter(u => u.role === 'delivery');

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // update selected if open
      if (selected?.id === vars.id) {
        setSelected(prev => ({ ...prev, ...vars.data }));
      }
      toast.success('Order updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Order.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelected(null);
      toast.success('Order deleted');
    },
  });

  // Role-based filtering
  const visibleOrders = orders.filter(o => {
    if (currentUser?.role === 'client' || currentUser?.role === 'special_client') {
      // Clients see only their own orders
      return o.client_email === currentUser.email;
    }
    if (currentUser?.role === 'delivery') {
      // Drivers see only orders they've been assigned and collected
      return (o.assigned_driver === currentUser.email && ['collected', 'on_the_way', 'delivered'].includes(o.status)) ||
             (o.status === 'ready' && !o.assigned_driver);
    }
    // Admin sees all
    return true;
  });

  const filtered = visibleOrders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter;
    const matchSearch = !search ||
      o.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.client_email?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const openOrder = (order) => {
    setSelected(order);
    setDriverForm({ driver_name: order.driver_name || '', driver_phone: order.driver_phone || '' });
  };

  const saveDriver = () => {
    updateMutation.mutate({ id: selected.id, data: driverForm });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-3xl font-bold">All Orders</h1>
        <p className="text-muted-foreground text-xs md:text-sm mt-1">{orders.length} total orders</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[140px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search client..." className="pl-9 h-8 text-xs md:text-sm" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36 md:w-48 h-8 text-xs md:text-sm"><SelectValue placeholder="Filter status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Card key={i} className="h-20 animate-pulse bg-muted" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No orders found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 md:p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold text-sm md:text-base truncate">{order.client_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.client_email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <p className="text-[10px] md:text-xs text-muted-foreground">
                        {order.created_date && formatDubai(order.created_date)}
                      </p>
                      <span className="text-[10px] md:text-xs text-muted-foreground">{order.items?.length} items</span>
                      <span className="text-xs font-bold text-primary">AED {order.total_amount?.toFixed(2)}</span>
                      {order.driver_name && (
                        <span className="text-[10px] md:text-xs text-cyan-600 flex items-center gap-1">
                          <Truck className="w-3 h-3" /> {order.driver_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Select
                      value={order.status}
                      onValueChange={(v) => updateMutation.mutate({ id: order.id, data: { status: v } })}
                    >
                      <SelectTrigger className="w-28 md:w-36 h-7 text-[10px] md:text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => openOrder(order)}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setPrintOrder(order)} title="Print Invoice">
                      <Printer className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <OrderTracker status={order.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <DialogTitle>Order — {selected?.client_name}</DialogTitle>
              <Button variant="outline" size="sm" onClick={() => setPrintOrder(selected)} className="gap-1.5">
                <Printer className="w-3.5 h-3.5" /> Print Invoice
              </Button>
            </div>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <OrderTracker status={selected.status} />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{selected.client_email}</span></div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  {selected.delivery_phone ? (
                    <a href={`tel:${selected.delivery_phone}`} className="font-medium text-primary hover:underline ml-1">{selected.delivery_phone}</a>
                  ) : <span className="font-medium ml-1">—</span>}
                </div>
                {selected.delivery_date && <div><span className="text-muted-foreground">Deliver by:</span> <span className="font-medium">{selected.delivery_date}</span></div>}
                {selected.delivery_address && (
                  <div className="col-span-2 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="font-medium text-sm">{selected.delivery_address}</span>
                    {selected.delivery_lat && selected.delivery_lng && (
                      <a
                        href={`https://www.google.com/maps?q=${selected.delivery_lat},${selected.delivery_lng}`}
                        target="_blank" rel="noopener noreferrer"
                        className="ml-1 text-xs text-primary hover:underline shrink-0"
                      >
                        View map
                      </a>
                    )}
                  </div>
                )}
              </div>

              {selected.notes && <p className="text-sm bg-muted rounded-lg p-3">{selected.notes}</p>}

              {/* Driver assignment */}
              <div className="border rounded-lg p-3 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Assign Driver
                </p>
                {/* Quick-pick from delivery users */}
                {deliveryUsers.length > 0 && (
                  <div>
                    <Label className="text-xs">Pick from delivery team</Label>
                    <Select
                      value={selected?.assigned_driver || ''}
                      onValueChange={(email) => {
                        const driver = deliveryUsers.find(u => u.email === email);
                        if (driver) {
                          setDriverForm({ driver_name: driver.display_name || driver.full_name || '', driver_phone: driver.phone || '' });
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs mt-1">
                        <SelectValue placeholder="Select a driver..." />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryUsers.map(u => (
                          <SelectItem key={u.id} value={u.email}>
                            {u.display_name || u.full_name || u.email} {u.phone ? `· ${u.phone}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Driver Name</Label>
                    <Input
                      value={driverForm.driver_name}
                      onChange={e => setDriverForm(f => ({...f, driver_name: e.target.value}))}
                      placeholder="Driver name"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Driver Phone</Label>
                    <Input
                      value={driverForm.driver_phone}
                      onChange={e => setDriverForm(f => ({...f, driver_phone: e.target.value}))}
                      placeholder="+971 ..."
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={saveDriver} disabled={updateMutation.isPending} className="text-xs gap-1">
                  Save & Assign Driver
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted"><tr>
                    <th className="text-left p-3 font-medium">Product</th>
                    <th className="text-right p-3 font-medium">Qty</th>
                    <th className="text-right p-3 font-medium">Price</th>
                    <th className="text-right p-3 font-medium">Total</th>
                  </tr></thead>
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

              <div className="flex items-center justify-between">
                <p className="text-lg font-bold">Total: AED {selected.total_amount?.toFixed(2)}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5"
                  onClick={() => deleteMutation.mutate(selected.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Invoice */}
      <PrintInvoice order={printOrder} open={!!printOrder} onOpenChange={() => setPrintOrder(null)} />
    </div>
  );
}