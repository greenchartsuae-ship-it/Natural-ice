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
import { ShoppingCart, Plus, Minus, Package, Search, X, Trash2, LogIn, MapPin, Phone, Mail, Globe, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { computeDeliveryFee, amountUntilFreeDelivery } from '@/lib/deliveryFee';

export default function PublicStorefront() {
  const [cart, setCart] = useState({});
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [orderOpen, setOrderOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
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
  const grandTotal = cartTotal + deliveryFee;

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
    onSuccess: () => {
      setCart({});
      setCheckoutOpen(false);
      toast.success('Order placed successfully! We will contact you soon.');
    },
    onError: (error) => {
      toast.error('Failed to place order. Please try again.');
      console.error(error);
    },
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://media.base44.com/images/public/69e4d4aaed7dc3117eed9c83/ccd9c0ca3_logopng.png"
              alt="Natural Ice"
              className="h-12 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => base44.auth.redirectToLogin('/catalog')}
              className="gap-2"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Button>
            {cartCount > 0 && (
              <Button onClick={() => setOrderOpen(true)} className="gap-2 relative">
                <ShoppingCart className="w-4 h-4" />
                Cart ({cartCount})
                <span className="text-sm font-bold ml-1">AED {grandTotal.toFixed(2)}</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-12">
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <img
            src="https://media.base44.com/images/public/69e4d4aaed7dc3117eed9c83/ccd9c0ca3_logopng.png"
            alt="Natural Ice"
            className="h-48 md:h-64 w-auto object-contain"
          />
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-3 flex-wrap mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search products..." 
              className="pl-10" 
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="crushed_ice">Crushed Ice</SelectItem>
              <SelectItem value="custom_ice">Custom Ice</SelectItem>
              <SelectItem value="diamond_ice">Diamond Ice</SelectItem>
              <SelectItem value="dry_ice">Dry Ice</SelectItem>
              <SelectItem value="ice_ball">Ice Ball</SelectItem>
              <SelectItem value="ice_cream">Ice Cream</SelectItem>
              <SelectItem value="ice_cube">Ice Cube</SelectItem>
              <SelectItem value="large_ice_cube">Large Ice Cubes</SelectItem>
              <SelectItem value="long_ice_cube">Long Ice Cube</SelectItem>
              <SelectItem value="luxury_ice">Luxury Ice</SelectItem>
              <SelectItem value="tube_ice">Tube Ice</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <Card key={i} className="h-64 animate-pulse bg-muted" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="py-16 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No products found</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((product, index) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all group">
                {product.image_url ? (
                  <div className="h-44 bg-muted overflow-hidden">
                    <img src={product.image_url} alt={product.name} loading={index < 3 ? "eager" : "lazy"} fetchpriority={index === 0 ? "high" : "auto"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="h-44 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <Package className="w-16 h-16 text-primary/30" />
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <Badge variant="outline" className="capitalize text-xs">{product.category?.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    {product.price_on_request ? (
                      <p className="text-lg font-bold text-amber-600">As per Request</p>
                    ) : (
                      <p className="text-2xl font-bold text-primary">AED {product.price}<span className="text-xs font-normal text-muted-foreground">/{product.unit}</span></p>
                    )}
                    {product.price_on_request ? (
                      <a href="mailto:Info@icenatural.com" className="text-sm font-medium text-primary hover:underline">
                        Contact Us
                      </a>
                    ) : cart[product.id] ? (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateCart(product.id, -1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{cart[product.id]}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateCart(product.id, 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => updateCart(product.id, 1)} className="gap-1">
                        <Plus className="w-3 h-3" /> Add
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
              <Input
                value={checkoutData.delivery_address}
                onChange={e => setCheckoutData({ ...checkoutData, delivery_address: e.target.value })}
                placeholder="Street 22, Al Quoz, Dubai"
              />
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
    </div>
  );
}
