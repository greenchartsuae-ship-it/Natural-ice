import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Loader2, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { FREE_DELIVERY_THRESHOLD, DELIVERY_FEE, VAT_RATE } from '@/lib/deliveryFee';

const TAX_RATE = VAT_RATE;

const PAYMENT_METHODS = [
  {
    id: 'card',
    label: 'Pay by Card',
    subtitle: 'Visa / Mastercard',
    icon: (
      <div className="flex gap-1">
        {/* Visa */}
        <svg viewBox="0 0 48 16" className="h-5 w-auto" fill="none">
          <rect width="48" height="16" rx="2" fill="#1A1F71"/>
          <text x="4" y="12" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">VISA</text>
        </svg>
        {/* Mastercard */}
        <svg viewBox="0 0 38 24" className="h-5 w-auto">
          <circle cx="15" cy="12" r="10" fill="#EB001B"/>
          <circle cx="23" cy="12" r="10" fill="#F79E1B"/>
          <path d="M19 5.3a10 10 0 0 1 0 13.4A10 10 0 0 1 19 5.3z" fill="#FF5F00"/>
        </svg>
      </div>
    ),
  },
  {
    id: 'apple_pay',
    label: 'Apple Pay',
    subtitle: 'Pay with Touch ID or Face ID',
    icon: (
      <svg viewBox="0 0 50 20" className="h-5 w-auto" fill="currentColor">
        <text x="2" y="15" fontSize="13" fontFamily="-apple-system, sans-serif" fontWeight="600"></text>
        <path d="M9.5 2.5c.8-1 1.3-2.3 1.2-3.6-1.2.1-2.6.8-3.4 1.8-.7.9-1.4 2.2-1.2 3.5 1.3.1 2.6-.6 3.4-1.7z" transform="translate(4,4)" fill="#000"/>
        <path d="M13.2 4.5c-1.8 0-3.4 1-4.3 1-1 0-2.4-.9-4-.9C2.7 4.7.5 6.4-.3 8.8c-1.7 4.8.3 11.9 2.8 15.8 1.2 1.9 2.7 3.9 4.6 3.8 1.8-.1 2.5-1.2 4.7-1.2 2.2 0 2.8 1.2 4.7 1.2 2 0 3.3-2 4.5-3.8.9-1.3 1.5-2.8 2-4.3-5.1-2-5.5-9.3-.4-12.1-.9-1.3-2.3-3.7-5.4-3.7z" transform="scale(0.55) translate(3, 2)" fill="#000"/>
      </svg>
    ),
  },
];

export default function OrderDialog({ open, onOpenChange, cartItems, total, onSubmit, loading, user, freeDelivery = false }) {
  const [step, setStep] = useState(1); // 1 = delivery, 2 = payment
  const [deliveryInfo, setDeliveryInfo] = useState({
    delivery_address: user?.address || '',
    delivery_phone: user?.phone || '',
    delivery_date: '',
    notes: '',
    delivery_lat: null,
    delivery_lng: null,
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [locating, setLocating] = useState(false);

  const deliveryFee = freeDelivery ? 0 : (total >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE);
  const tax = total * TAX_RATE;
  const grandTotal = total + tax + deliveryFee;

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
    onSubmit({ ...deliveryInfo, total_amount: grandTotal, delivery_fee: deliveryFee, payment_method: paymentMethod });
  };

  const handleClose = (val) => {
    if (!val) setStep(1);
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <DialogTitle>{step === 1 ? 'Complete Your Order' : 'Choose Payment Method'}</DialogTitle>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-2">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Step {step} of 2 — {step === 1 ? 'Delivery Details' : 'Payment'}</p>
        </DialogHeader>

        {/* STEP 1: Delivery Info */}
        {step === 1 && (
          <div className="space-y-4">
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
                      {item.product.price_on_request ? (
                        <td className="p-3 text-right text-amber-600 font-medium" colSpan={2}>As per Request</td>
                      ) : (
                        <>
                          <td className="p-3 text-right">AED {item.product.price?.toFixed(2)}</td>
                          <td className="p-3 text-right font-medium">AED {(item.product.price * item.quantity).toFixed(2)}</td>
                        </>
                      )}
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
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span>
                {deliveryFee === 0
                  ? <span className="text-emerald-600 font-medium">Free 🎉</span>
                  : <span>AED {deliveryFee.toFixed(2)}</span>
                }
              </div>
              {!freeDelivery && deliveryFee > 0 && (
                <p className="text-xs text-amber-600">Add AED {(FREE_DELIVERY_THRESHOLD - total).toFixed(2)} more for free delivery</p>
              )}
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
                  <Button type="button" variant="outline" size="icon" onClick={handleLocate} disabled={locating} title="Use my current location">
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
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={deliveryInfo.notes}
                  onChange={e => setDeliveryInfo({...deliveryInfo, notes: e.target.value})}
                  placeholder="Special instructions..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Payment Method */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Order summary */}
            <div className="bg-muted/50 rounded-lg p-3 flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Amount to pay</span>
              <span className="text-xl font-bold text-primary">AED {grandTotal.toFixed(2)}</span>
            </div>

            {/* Payment method selection */}
            <div className="space-y-3">
              {PAYMENT_METHODS.map(method => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    paymentMethod === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40 bg-background'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    paymentMethod === method.id ? 'border-primary' : 'border-muted-foreground'
                  }`}>
                    {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.subtitle}</p>
                  </div>
                  <div>{method.icon}</div>
                </button>
              ))}
            </div>

            {/* Card form placeholder */}
            {paymentMethod === 'card' && (
              <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <CreditCard className="w-4 h-4" />
                  <span>Card details</span>
                </div>
                <div>
                  <Label className="text-xs">Card Number</Label>
                  <div className="h-9 rounded-md border border-input bg-background px-3 flex items-center text-sm text-muted-foreground">
                    •••• •••• •••• ••••
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Expiry</Label>
                    <div className="h-9 rounded-md border border-input bg-background px-3 flex items-center text-sm text-muted-foreground">
                      MM / YY
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">CVV</Label>
                    <div className="h-9 rounded-md border border-input bg-background px-3 flex items-center text-sm text-muted-foreground">
                      •••
                    </div>
                  </div>
                </div>
                <p className="text-xs text-amber-600 text-center">⚡ Payment integration coming soon — orders will be confirmed manually.</p>
              </div>
            )}

            {/* Apple Pay placeholder */}
            {paymentMethod === 'apple_pay' && (
              <div className="border rounded-xl p-4 flex flex-col items-center gap-3 bg-muted/30">
                <div className="w-full h-12 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-base tracking-wide" style={{fontFamily: '-apple-system, sans-serif'}}> Pay</span>
                </div>
                <p className="text-xs text-amber-600 text-center">⚡ Apple Pay integration coming soon — orders will be confirmed manually.</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!deliveryInfo.delivery_address || !deliveryInfo.delivery_phone || !deliveryInfo.delivery_date}
                className="gap-2"
              >
                Next: Payment <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing...</> : 'Place Order'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}