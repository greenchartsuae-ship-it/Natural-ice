import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Loader2 } from 'lucide-react';

const TAX_RATE = 0.05;

export default function OrderDialog({ open, onOpenChange, cartItems, total, onSubmit, loading, user }) {
  const [deliveryInfo, setDeliveryInfo] = useState({
    delivery_address: user?.address || '',
    delivery_phone: user?.phone || '',
    delivery_date: '',
    notes: '',
    delivery_lat: null,
    delivery_lng: null,
  });
  const [locating, setLocating] = useState(false);

  const tax = total * TAX_RATE;
  const grandTotal = total + tax;

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setDeliveryInfo(prev => ({
          ...prev,
          delivery_lat: latitude,
          delivery_lng: longitude,
          delivery_address: prev.delivery_address || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        }));
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleSubmit = () => {
    onSubmit({ ...deliveryInfo, total_amount: grandTotal });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Complete Your Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Cart items */}
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
                {cartItems.map(item => (
                  <tr key={item.product.id}>
                    <td className="p-3 font-medium">{item.product.name}</td>
                    <td className="p-3 text-right">{item.quantity}</td>
                    <td className="p-3 text-right">AED {item.product.price?.toFixed(2)}</td>
                    <td className="p-3 text-right font-medium">AED {(item.product.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border rounded-lg p-3 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>AED {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (5%)</span>
              <span>AED {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-1">
              <span>Total</span>
              <span>AED {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Delivery info */}
          <div className="space-y-3 pt-2">
            <div>
              <Label>Delivery Address</Label>
              <div className="flex gap-2">
                <Input
                  value={deliveryInfo.delivery_address}
                  onChange={e => setDeliveryInfo({...deliveryInfo, delivery_address: e.target.value})}
                  placeholder="Full delivery address"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleLocate}
                  disabled={locating}
                  title="Use my current location"
                >
                  {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                </Button>
              </div>
              {deliveryInfo.delivery_lat && (
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> GPS location captured ({deliveryInfo.delivery_lat.toFixed(4)}, {deliveryInfo.delivery_lng.toFixed(4)})
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Phone</Label>
                <Input
                  value={deliveryInfo.delivery_phone}
                  onChange={e => setDeliveryInfo({...deliveryInfo, delivery_phone: e.target.value})}
                  placeholder="Contact phone"
                />
              </div>
              <div>
                <Label>Delivery Date</Label>
                <Input
                  type="date"
                  value={deliveryInfo.delivery_date}
                  onChange={e => setDeliveryInfo({...deliveryInfo, delivery_date: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={deliveryInfo.notes}
                onChange={e => setDeliveryInfo({...deliveryInfo, notes: e.target.value})}
                placeholder="Special instructions..."
                rows={2}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !deliveryInfo.delivery_address}>
            {loading ? 'Placing Order...' : 'Place Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}