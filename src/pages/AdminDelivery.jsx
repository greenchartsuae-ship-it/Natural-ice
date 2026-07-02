import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Truck, Plus, Phone, Mail, Trash2, UserCheck, Car, Map, ChevronDown, ChevronUp } from 'lucide-react';
import ClientLiveMap from '@/components/delivery/ClientLiveMap';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function AdminDelivery() {
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ email: '', full_name: '', phone: '' });
  const [inviting, setInviting] = useState(false);
  const [mapOpen, setMapOpen] = useState({});

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: rawActiveOrders = [] } = useQuery({
    queryKey: ['active-delivery-orders'],
    queryFn: () => base44.entities.Order.filter({ status: 'on_the_way' }, '-updated_date'),
    refetchInterval: 15000,
  });

  // Show only one order per driver (the most recent one)
  const activeOrders = rawActiveOrders.reduce((acc, order) => {
    const key = order.assigned_driver || order.driver_name || order.id;
    if (!acc.find(o => (o.assigned_driver || o.driver_name || o.id) === key)) {
      acc.push(order);
    }
    return acc;
  }, []);

  const deliveryUsers = users.filter(u => u.role === 'delivery');

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Updated');
    },
  });

  const handleInvite = async () => {
    if (!form.email) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(form.email, 'delivery');
      // If user already exists or just created, update their phone
      toast.success(`Invitation sent to ${form.email}. They will log in and appear here as a delivery user.`);
      setShowInvite(false);
      setForm({ email: '', full_name: '', phone: '' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (e) {
      toast.error(e.message || 'Failed to invite');
    }
    setInviting(false);
  };

  const handleUpdatePhone = (user, phone) => {
    updateMutation.mutate({ id: user.id, data: { phone } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6 text-cyan-600" /> Delivery Accounts
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Manage delivery drivers — invite them so they can log in and access the delivery queue.
          </p>
        </div>
        <Button onClick={() => setShowInvite(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Driver
        </Button>
      </div>

      {/* Active deliveries with live maps */}
      {activeOrders.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-indigo-700 flex items-center gap-2">
            <Map className="w-4 h-4" /> Live Deliveries ({activeOrders.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeOrders.map(order => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{order.client_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.delivery_address || '—'}</p>
                      {order.driver_name && <p className="text-xs text-indigo-600">🚚 {order.driver_name}</p>}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs h-7 px-2 shrink-0"
                      onClick={() => setMapOpen(m => ({ ...m, [order.id]: !m[order.id] }))}
                    >
                      <Map className="w-3 h-3" />
                      {mapOpen[order.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </Button>
                  </div>
                  {mapOpen[order.id] && <ClientLiveMap order={order} />}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {deliveryUsers.length === 0 ? (
        <Card className="py-16 text-center">
          <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No delivery drivers yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add a driver by clicking "Add Driver"</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deliveryUsers.map(u => (
            <Card key={u.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{u.full_name || 'No name'}</p>
                      <Badge variant="outline" className="text-[10px] text-cyan-700 border-cyan-300 bg-cyan-50">Delivery</Badge>
                    </div>
                  </div>
                  <UserCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-1" title="Active" />
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> {u.email}
                  </div>
                  {u.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> {u.phone}
                    </div>
                  )}
                  {u.car_number && (
                    <div className="flex items-center gap-1.5">
                      <Car className="w-3 h-3" /> {u.car_number}
                    </div>
                  )}
                </div>

                <EditPhoneInline user={u} onSave={handleUpdatePhone} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invite dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Delivery Driver</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Enter the driver's email to send them an invitation. They will log in with that email and see the Delivery Queue.
            </p>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({...f, email: e.target.value}))}
                placeholder="driver@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={inviting || !form.email}>
              {inviting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditPhoneInline({ user, onSave }) {
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(user.phone || '');

  if (!editing) {
    return (
      <Button variant="outline" size="sm" className="text-xs w-full gap-1" onClick={() => setEditing(true)}>
        <Phone className="w-3 h-3" /> {user.phone ? 'Edit Phone' : 'Add Phone'}
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="+971 56 ..."
        className="h-8 text-xs flex-1"
      />
      <Button size="sm" className="h-8 text-xs" onClick={() => { onSave(user, phone); setEditing(false); }}>Save</Button>
    </div>
  );
}