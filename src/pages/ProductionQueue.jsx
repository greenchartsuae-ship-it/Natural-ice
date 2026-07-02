import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusBadge from '@/components/shared/StatusBadge';
import OrderTracker from '@/components/shared/OrderTracker';
import { formatDubai } from '@/lib/formatDubaiTime';
import { Factory, CheckCircle, Play, Eye, Package, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function ProductionQueue() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['production-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => {
      const now = new Date().toISOString();
      const timestamps = {
        approved:  { approved_at: now },
        preparing: { preparing_at: now },
        ready:     { ready_at: now },
      };
      return base44.entities.Order.update(id, { status, ...(timestamps[status] || {}) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
      if (selected) setSelected(prev => ({ ...prev, status: prev._nextStatus }));
      toast.success('Status updated');
    },
  });

  const pending   = orders.filter(o => o.status === 'pending');
  const approved  = orders.filter(o => o.status === 'approved');
  const preparing = orders.filter(o => o.status === 'preparing');
  const ready     = orders.filter(o => o.status === 'ready');

  const renderCard = (order, action) => (
    <Card key={order.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <p className="font-semibold text-sm md:text-base">{order.client_name}</p>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mb-1.5">
              {order.created_date && formatDubai(order.created_date)}
              {order.delivery_date && ` · By ${order.delivery_date}`}
            </p>
            <div className="flex flex-wrap gap-1">
              {order.items?.map((item, i) => (
                <span key={i} className="text-[10px] md:text-xs bg-muted px-1.5 py-0.5 rounded-full font-medium">
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

  const Section = ({ title, count, color, children, emptyMsg }) => (
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
      <div>
        <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
            <Factory className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
          </div>
          Production Queue
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          {pending.length} new · {approved.length} approved · {preparing.length} preparing · {ready.length} ready
        </p>
      </div>

      <Section title="New Orders" count={pending.length} color="text-amber-600" emptyMsg="No new orders">
        {pending.map(o => renderCard(o,
          <Button size="sm" onClick={() => updateMutation.mutate({ id: o.id, status: 'approved' })} className="gap-1 text-xs h-7 px-2">
            <CheckCircle className="w-3 h-3" /> Approve
          </Button>
        ))}
      </Section>

      <Section title="Approved" count={approved.length} color="text-blue-600" emptyMsg="No approved orders">
        {approved.map(o => renderCard(o,
          <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: o.id, status: 'preparing' })} className="gap-1 text-xs h-7 px-2">
            <Play className="w-3 h-3" /> Prepare
          </Button>
        ))}
      </Section>

      <Section title="Preparing" count={preparing.length} color="text-purple-600" emptyMsg="No orders in preparation">
        {preparing.map(o => renderCard(o,
          <Button size="sm" onClick={() => updateMutation.mutate({ id: o.id, status: 'ready' })} className="gap-1 text-xs h-7 px-2 bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle className="w-3 h-3" /> Ready
          </Button>
        ))}
      </Section>

      <Section title="Ready for Pickup" count={ready.length} color="text-emerald-600" emptyMsg="No orders ready">
        {ready.map(o => renderCard(o, null))}
      </Section>

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
                <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{selected.delivery_date || '—'}</span></div>
                <div><span className="text-muted-foreground">Address:</span> <span className="font-medium">{selected.delivery_address || '—'}</span></div>
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
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Total: AED {selected.total_amount?.toFixed(2)}</span>
                <StatusBadge status={selected.status} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}