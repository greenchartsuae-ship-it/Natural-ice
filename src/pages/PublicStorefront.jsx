import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ShoppingCart, Plus, Minus, Package, Search, X, Trash2, LogIn, MapPin, Phone, Mail, Globe, Clock, LocateFixed, Loader2, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { computeDeliveryFee, amountUntilFreeDelivery, computeVat } from '@/lib/deliveryFee';
import OrderTracker from '@/components/shared/OrderTracker';

export default function PublicStorefront() {
  const [cart, setCart] = useState({});
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [orderOpen, setOrderOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [locating, setLocating] = useState(false);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location is not supported on this device/browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            const address = data?.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setCheckoutData((prev) => ({ ...prev, delivery_address: address }));
            toast.success('Location detected and address filled in.');
          } else {
            setCheckoutData((prev) => ({ ...prev, delivery_address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
            toast.success('Location detected.');
          }
        } catch (err) {
          setCheckoutData((prev) => ({ ...prev, delivery_address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
          toast.success('Location detected.');
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        toast.error('Could not get your location. Please allow location access or type your address manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  const [checkoutData, setCheckoutData] = useState({
    client_name: '',
    client_email: '',
    delivery_address: '',
    delivery_phone: '',
    notes: '',
    delivery_date: '',
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.public.listProducts(),
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  const activeProducts = products.filter(p => p.is_active !== false);
  const filtered = activeProducts.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const CATEGORY_LABELS = {
    crushed_ice: 'Crushed Ice',
    custom_ice: 'Custom Ice',
    diamond_ice: 'Diamond Ice',
    dry_ice: 'Dry Ice',
    ice_ball: 'Ice Ball',
    ice_cream: 'Ice Cream',
    ice_cube: 'Ice Cube',
    large_ice_cube: 'Large Ice Cubes',
    long_ice_cube: 'Long Ice Cube',
    luxury_ice: 'Luxury Ice',
    tube_ice: 'Tube Ice',
    other: 'Other',
  };
  const CATEGORY_ORDER = ['crushed_ice', 'custom_ice', 'diamond_ice', 'dry_ice', 'ice_ball', 'ice_cream', 'ice_cube', 'large_ice_cube', 'long_ice_cube', 'luxury_ice', 'tube_ice', 'other'];
  const presentCategories = CATEGORY_ORDER.filter(cat => activeProducts.some(p => p.category === cat));
  const sidebarCategories = presentCategories.map(cat => ({
    value: cat,
    label: CATEGORY_LABELS[cat] || cat.replace(/_/g, ' '),
    icon: activeProducts.find(p => p.category === cat && p.image_url)?.image_url || null,
  }));
  const currentCategoryLabel = categoryFilter === 'all' ? 'Our Products' : (CATEGORY_LABELS[categoryFilter] || categoryFilter.replace(/_/g, ' '));

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  const updateCart = (productId, delta) => {
    setCart(prev => {
      const newQty = (prev[productId] || 0) + delta;
      if (newQty <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const { [productId]: _, ...rest } = prev;
      return rest;
    });
  };

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const product = products.find(p => p.id === id);
    return product ? { product, quantity: qty } : null;
  }).filter(Boolean);

  const cartTotal = cartItems.reduce((s, item) => s + (item.product.price_on_request ? 0 : item.product.price * item.quantity), 0);
  const hasRequestPricedItems = cartItems.some(item => item.product.price_on_request);
  const deliveryFee = computeDeliveryFee(cartTotal);
  const remainingForFree = amountUntilFreeDelivery(cartTotal);
  const vatAmount = computeVat(cartTotal);
  const grandTotal = cartTotal + deliveryFee + vatAmount;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setOrderOpen(false);
    setCheckoutOpen(true);
  };

  const createOrderMutation = useMutation({
    mutationFn: (orderData) => base44.public.createOrder(orderData),
    onSuccess: (createdOrder) => {
      setCart({});
      setCheckoutOpen(false);
      setConfirmedOrder(createdOrder);
      toast.success('Order placed successfully! We will contact you soon.');
    },
    onError: (error) => {
      toast.error('Failed to place order. Please try again.');
      console.error(error);
    },
  });

  // Poll the order status live so the customer sees updates (Approved, Preparing, etc.)
  // as the team processes it, without needing to log in.
  const { data: trackedOrder } = useQuery({
    queryKey: ['track-order', confirmedOrder?.id],
    queryFn: () => base44.public.getOrderStatus(confirmedOrder.id),
    enabled: !!confirmedOrder?.id,
    refetchInterval: 15000,
  });

  const handleSubmitOrder = () => {
    if (!checkoutData.client_name || !checkoutData.client_email || !checkoutData.delivery_address || !checkoutData.delivery_phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    const items = cartItems.map(item => ({
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price_on_request ? null : item.product.price,
      total: item.product.price_on_request ? null : item.product.price * item.quantity,
      price_on_request: !!item.product.price_on_request,
    }));

    createOrderMutation.mutate({
      client_email: checkoutData.client_email,
      client_name: checkoutData.client_name,
      items,
      total_amount: grandTotal,
      delivery_fee: deliveryFee,
      delivery_address: checkoutData.delivery_address,
      delivery_phone: checkoutData.delivery_phone,
      notes: checkoutData.notes,
      delivery_date: checkoutData.delivery_date,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Utility Bar */}
      <div className="bg-neutral-900 text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-end gap-5">
          <a href="tel:+97143477727" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Phone className="w-3 h-3" /> +971 4 347 7727
          </a>
          <a href="mailto:Info@icenatural.com" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Mail className="w-3 h-3" /> Info@icenatural.com
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <img
              src="https://media.base44.com/images/public/69e4d4aaed7dc3117eed9c83/ccd9c0ca3_logopng.png"
              alt="Natural Ice"
              className="h-10 w-auto object-contain"
            />
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`transition-colors ${categoryFilter === 'all' ? 'text-primary' : 'hover:text-primary'}`}
            >
              Our Products
            </button>
            <a
              href="https://www.google.com/maps/search/?api=1&query=22nd+St+Al+Qouz+Ind+3+Al+Quoz+Dubai"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <MapPin className="w-4 h-4" /> Locate Us
            </a>
          </nav>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <div className="relative hidden sm:block w-full max-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search menu..."
                className="pl-10 h-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => base44.auth.redirectToLogin('/catalog')}
              className="gap-2 hidden sm:inline-flex"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Button>
            <Button
              onClick={() => setOrderOpen(true)}
              className="gap-2 relative rounded-full bg-primary hover:bg-primary/90 font-bold"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 ? `Cart (${cartCount}) · AED ${grandTotal.toFixed(2)}` : 'Order Now'}
            </Button>
          </div>
        </div>
        <div className="relative sm:hidden max-w-7xl mx-auto px-4 pb-3">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search menu..."
            className="pl-10 h-9"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Category Sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="sticky top-24 border rounded-lg overflow-hidden divide-y bg-card">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left text-sm font-medium transition-colors ${categoryFilter === 'all' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
              >
                <span className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                </span>
                All Products
              </button>
              {sidebarCategories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-left text-sm font-medium transition-colors ${categoryFilter === cat.value ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                >
                  {cat.icon ? (
                    <img src={cat.icon} alt={cat.label} className="w-10 h-10 rounded-md object-cover shrink-0" />
                  ) : (
                    <span className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-primary" />
                    </span>
                  )}
                  {cat.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Mobile Category Filter */}
          <div className="md:hidden">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {sidebarCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-extrabold text-center md:text-left mb-8">{currentCategoryLabel}</h1>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-56 animate-pulse bg-muted rounded-lg" />)}
              </div>
            ) : filtered.length === 0 ? (
              <Card className="py-16 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No products found</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-10">
                {filtered.map((product, index) => (
                  <div key={product.id} className="flex flex-col items-center text-center group">
                    {product.image_url ? (
                      <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-muted mb-3 ring-1 ring-border">
                        <img src={product.image_url} alt={product.name} loading={index < 3 ? "eager" : "lazy"} fetchpriority={index === 0 ? "high" : "auto"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-3 ring-1 ring-border">
                        <Package className="w-12 h-12 text-primary/30" />
                      </div>
                    )}
                    <h3 className="font-semibold text-sm sm:text-base leading-snug mb-1">{product.name}</h3>
                    {product.price_on_request ? (
                      <p className="text-sm font-bold text-amber-600 mb-2">As per Request</p>
                    ) : (
                      <p className="text-base font-bold text-primary mb-2">AED {product.price}<span className="text-xs font-normal text-muted-foreground">/{product.unit}</span></p>
                    )}
                    {product.price_on_request ? (
                      <a href="mailto:Info@icenatural.com" className="text-xs font-medium text-primary hover:underline">
                        Contact Us
                      </a>
                    ) : cart[product.id] ? (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCart(product.id, -1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">{cart[product.id]}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCart(product.id, 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => updateCart(product.id, 1)} className="gap-1 rounded-full">
                        <Plus className="w-3 h-3" /> Add
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cart Dialog */}
      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Your Cart
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.price_on_request ? 'As per Request' : `AED ${product.price}/${product.unit}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateCart(product.id, -1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateCart(product.id, 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(product.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>AED {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? 'FREE' : `AED ${deliveryFee.toFixed(2)}`}</span>
              </div>
              {remainingForFree > 0 && (
                <p className="text-xs text-orange-600">Add AED {remainingForFree.toFixed(2)} more for free delivery</p>
              )}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>VAT (5%)</span>
                <span>AED {vatAmount.toFixed(2)}</span>
              </div>
              {hasRequestPricedItems && (
                <p className="text-xs text-amber-600">Some items are priced "As per Request" — final total will be confirmed after we contact you.</p>
              )}
              <div className="flex items-center justify-between text-lg font-bold pt-2">
                <span>Total:</span>
                <span className="text-primary">AED {grandTotal.toFixed(2)}</span>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setOrderOpen(false)}>
                  <X className="w-4 h-4 mr-2" /> Continue Shopping
                </Button>
                <Button onClick={handleCheckout} className="gap-2">
                  Proceed to Checkout
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-card border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <img
                src="https://media.base44.com/images/public/69e4d4aaed7dc3117eed9c83/ccd9c0ca3_logopng.png"
                alt="Natural Ice"
                className="h-16 w-auto object-contain mb-3"
              />
              <p className="text-sm text-muted-foreground">
                Premium ice products delivered fresh to your door anywhere in Dubai and the UAE.
              </p>
            </div>
            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-3">Contact Us</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" /><span>22nd St - Al Qouz Ind.third - Al Quoz - Dubai<br />P.O. Box 390805</span></li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary shrink-0" /><span>+971 4 347 7727 / +971 56 533 4189</span></li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary shrink-0" /><a href="mailto:Info@icenatural.com" className="hover:text-primary transition-colors">Info@icenatural.com</a></li>
                <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-primary shrink-0" /><a href="https://naturalice.ae" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">naturalice.ae</a></li>
              </ul>
            </div>
            {/* Hours */}
            <div>
              <h4 className="font-semibold mb-3">Working Hours</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary shrink-0" /><span>Open 24 hours / 7 days a week</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Natural Ice. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={checkoutData.client_name}
                onChange={e => setCheckoutData({ ...checkoutData, client_name: e.target.value })}
                placeholder="John Smith"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={checkoutData.client_email}
                onChange={e => setCheckoutData({ ...checkoutData, client_email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input
                value={checkoutData.delivery_phone}
                onChange={e => setCheckoutData({ ...checkoutData, delivery_phone: e.target.value })}
                placeholder="+971 50 123 4567"
              />
            </div>
            <div>
              <Label>Delivery Address *</Label>
              <div className="flex gap-2">
                <Input
                  value={checkoutData.delivery_address}
                  onChange={e => setCheckoutData({ ...checkoutData, delivery_address: e.target.value })}
                  placeholder="Street 22, Al Quoz, Dubai"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleUseMyLocation}
                  disabled={locating}
                  title="Use my current location"
                >
                  {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label>Delivery Date (Optional)</Label>
              <Input
                type="date"
                value={checkoutData.delivery_date}
                onChange={e => setCheckoutData({ ...checkoutData, delivery_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Input
                value={checkoutData.notes}
                onChange={e => setCheckoutData({ ...checkoutData, notes: e.target.value })}
                placeholder="Any special instructions..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitOrder} disabled={createOrderMutation.isPending}>
              {createOrderMutation.isPending ? 'Placing Order...' : 'Place Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Confirmation + Live Tracking Dialog */}
      <Dialog open={!!confirmedOrder} onOpenChange={(open) => !open && setConfirmedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Confirmed 🎉</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Thank you! Your order has been received. Track its progress below — this updates automatically.
            </p>
            <OrderTracker status={trackedOrder?.status || confirmedOrder?.status || 'pending'} />
            <div className="flex items-center justify-between text-sm border-t pt-3">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono text-xs">{confirmedOrder?.id?.slice(0, 8)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">AED {(trackedOrder?.total_amount ?? confirmedOrder?.total_amount)?.toFixed(2)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setConfirmedOrder(null)}>Continue Shopping</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
