import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import FAQSection from '@/components/shared/FAQSection';
import { ShoppingCart, Plus, Minus, Package, Search, X, Trash2, MapPin, Phone, Mail, Globe, Clock, CreditCard, ChevronLeft, ChevronRight, Crosshair, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import LoadingOverlay from '@/components/storefront/LoadingOverlay';
import PullToRefresh from '@/components/shared/PullToRefresh';
import { useBackButtonClose } from '@/hooks/useBackButtonClose';
import BottomNav from '@/components/shared/BottomNav';
import PublicHeader from '@/components/shared/PublicHeader';
import { trackEvent } from '@/lib/analytics';

export default function PublicStorefront() {
  const queryClient = useQueryClient();
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('naturalice_cart') || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    try { localStorage.setItem('naturalice_cart', JSON.stringify(cart)); } catch {}
  }, [cart]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [orderOpen, setOrderOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1 = details, 2 = payment
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [checkoutData, setCheckoutData] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('naturalice_guest') || '{}');
      return {
        client_name: saved.name || '',
        client_email: saved.email || '',
        delivery_address: saved.address || '',
        delivery_phone: saved.phone || '',
        notes: '',
        delivery_date: '',
      };
    } catch {
      return { client_name: '', client_email: '', delivery_address: '', delivery_phone: '', notes: '', delivery_date: '' };
    }
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [deliveryCoords, setDeliveryCoords] = useState(null); // { lat, lng }
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderedItems, setOrderedItems] = useState([]);
  const [previewProduct, setPreviewProduct] = useState(null);

  // Hardware back button closes modals gracefully inside WebView
  useBackButtonClose(orderOpen, () => setOrderOpen(false));
  useBackButtonClose(checkoutOpen, () => { setCheckoutStep(1); setCheckoutOpen(false); });
  useBackButtonClose(!!previewProduct, () => setPreviewProduct(null));
  useBackButtonClose(orderSuccess, () => setOrderSuccess(false));

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('sort_order'),
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  const activeProducts = products.filter(p => p.is_active !== false && !p.exclusive_client_email);
  const filtered = activeProducts.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  const updateCart = (productId, delta) => {
    const product = products.find(p => p.id === productId);
    const minQty = product?.min_order_quantity || 1;
    setCart(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = currentQty === 0 && delta > 0 ? minQty : currentQty + delta;
      if (newQty <= 0 || newQty < minQty) {
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

  const cartTotal = cartItems.reduce((s, item) => s + (item.product.price * item.quantity), 0);
  const deliveryFee = cartTotal >= 200 ? 0 : (cartTotal > 0 ? 50 : 0);
  const tax = cartTotal * 0.05;
  const grandTotal = cartTotal + deliveryFee + tax;

  const minQtyViolations = cartItems.filter(item => item.quantity < (item.product.min_order_quantity || 1));

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (minQtyViolations.length > 0) {
      toast.error('Please meet the minimum order quantity for all products before checking out.');
      return;
    }
    trackEvent('begin_checkout', {
      currency: 'AED',
      value: Number(grandTotal.toFixed(2)),
      items: cartItems.map((item) => ({
        item_id: item.product.id,
        item_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
    });
    setOrderOpen(false);
    setCheckoutOpen(true);
  };

  const createOrderMutation = useMutation({
    mutationFn: (orderData) => base44.entities.Order.create(orderData),
    onSuccess: (createdOrder) => {
      trackEvent('purchase', {
        transaction_id: createdOrder?.id || ('guest-' + Date.now()),
        currency: 'AED',
        value: Number(grandTotal.toFixed(2)),
        items: cartItems.map((item) => ({
          item_id: item.product.id,
          item_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });
      localStorage.setItem('naturalice_guest', JSON.stringify({
        name: checkoutData.client_name,
        email: checkoutData.client_email,
        phone: checkoutData.delivery_phone,
        address: checkoutData.delivery_address,
      }));
      setOrderedItems(cartItems.map(i => ({ name: i.product.name, image_url: i.product.image_url, quantity: i.quantity, unit: i.product.unit })));
      setCart({});
      try { localStorage.removeItem('naturalice_cart'); } catch {}
      setCheckoutOpen(false);
      setCheckoutStep(1);
      setOrderSuccess(true);
      toast.success('Order placed successfully!');
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
      unit_price: item.product.price,
      total: item.product.price * item.quantity,
    }));

    createOrderMutation.mutate({
      client_email: checkoutData.client_email,
      client_name: checkoutData.client_name,
      items,
      total_amount: grandTotal,
      delivery_address: checkoutData.delivery_address,
      delivery_phone: checkoutData.delivery_phone,
      notes: checkoutData.notes,
      delivery_date: checkoutData.delivery_date,
      ...(deliveryCoords ? { delivery_lat: deliveryCoords.lat, delivery_lng: deliveryCoords.lng } : {}),
    });
  };

  const DraggableMarker = ({ coords, onMove }) => {
    useMapEvents({
      click(e) {
        onMove(e.latlng.lat, e.latlng.lng);
      }
    });
    return (
      <Marker
        position={[coords.lat, coords.lng]}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const { lat, lng } = e.target.getLatLng();
            onMove(lat, lng);
          }
        }}
      />
    );
  };

  const handlePinMove = async (lat, lng) => {
    setDeliveryCoords({ lat, lng });
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      setCheckoutData(prev => ({ ...prev, delivery_address: data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
    } catch {
      setCheckoutData(prev => ({ ...prev, delivery_address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setDeliveryCoords({ lat, lng });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          const address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setCheckoutData(prev => ({ ...prev, delivery_address: address }));
        } catch {
          setCheckoutData(prev => ({ ...prev, delivery_address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
        }
        setLocationLoading(false);
      },
      (err) => {
        toast.error('Could not get your location. Please enter it manually.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <PullToRefresh onRefresh={async () => { await queryClient.refetchQueries({ queryKey: ['products'] }); }}>
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <LoadingOverlay />
      {/* Header */}
      <PublicHeader>
        {cartCount > 0 && (
          <Button onClick={() => setOrderOpen(true)} className="gap-2 relative">
            <ShoppingCart className="w-4 h-4" />
            Cart ({cartCount})
            <span className="text-sm font-bold ml-1">AED {grandTotal.toFixed(2)}</span>
          </Button>
        )}
      </PublicHeader>

      <h1 className="sr-only">Buy Ice Online – All Ice Products</h1>
      {/* Video Banner */}
      <section className="w-full overflow-hidden">
        <video
          src="/media/order-banner.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full h-[32vh] min-h-[200px] lg:h-[44vh] object-cover"
        />
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-3 flex-wrap mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Dropdown Menu */}
        <div className="mb-6">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full h-12 text-base font-medium">
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Category:</span>
                <SelectValue />
              </span>
            </SelectTrigger>
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
                <div className="h-44 bg-gradient-to-br from-muted to-muted/60 overflow-hidden cursor-zoom-in animate-pulse" onClick={() => setPreviewProduct(product)}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={`${product.name} from Natural Ice factory in Dubai`} width="400" height="176" loading={index < 6 ? "eager" : "lazy"} fetchPriority={index < 2 ? "high" : "auto"} decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 [background:theme(colors.muted)]" onLoad={(e) => e.currentTarget.parentElement.classList.remove('animate-pulse')} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <Package className="w-16 h-16 text-primary/30" />
                    </div>
                  )}
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <Badge variant="outline" className="capitalize text-xs">{product.category?.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                  {product.min_order_quantity > 1 && (
                    <p className="text-xs text-amber-600 font-medium mb-3">Min. order: {product.min_order_quantity} {product.unit}</p>
                  )}
                  <div className="flex items-center justify-between">
                    {product.price_on_request
                      ? <p className="text-lg font-bold text-amber-600">As per Request</p>
                      : <p className="text-2xl font-bold text-primary">AED {product.price}<span className="text-xs font-normal text-muted-foreground">/{product.unit}</span></p>
                    }
                    {cart[product.id] ? (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => updateCart(product.id, -1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{cart[product.id]}</span>
                        <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => updateCart(product.id, 1)}>
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

      {/* Product Preview Dialog */}
      <Dialog open={!!previewProduct} onOpenChange={(open) => !open && setPreviewProduct(null)}>
        <DialogContent className="max-w-[280px] sm:max-w-sm p-0 overflow-hidden">
          <DialogTitle className="sr-only">{previewProduct?.name}</DialogTitle>
          {previewProduct && (
            <div className="flex flex-col items-center text-center">
              <div className="w-full h-64 sm:h-80 bg-muted overflow-hidden">
                {previewProduct.image_url ? (
                  <img src={previewProduct.image_url} alt={`${previewProduct.name} from Natural Ice factory in Dubai`} width="320" height="320" decoding="async" fetchPriority="high" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <Package className="w-20 h-20 text-primary/30" />
                  </div>
                )}
              </div>
              <div className="p-3 sm:p-4 w-full">
                <Badge variant="outline" className="capitalize text-xs mb-1.5">{previewProduct.category?.replace('_', ' ')}</Badge>
                <h2 className="font-bold text-sm sm:text-base mb-0.5 line-clamp-1">{previewProduct.name}</h2>
                {previewProduct.price_on_request
                  ? <p className="text-sm font-bold text-amber-600 mb-2">As per Request</p>
                  : <p className="text-lg font-bold text-primary mb-2">AED {previewProduct.price}<span className="text-xs font-normal text-muted-foreground">/{previewProduct.unit}</span></p>
                }
                <Button className="w-full gap-1 h-11 text-xs" onClick={() => { updateCart(previewProduct.id, 1); setPreviewProduct(null); }}>
                  <Plus className="w-4 h-4" /> Add to Cart
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
              cartItems.map(({ product, quantity }) => {
                const minQty = product.min_order_quantity || 1;
                const belowMin = quantity < minQty;
                return (
                <div key={product.id} className={`p-3 rounded-lg ${belowMin ? 'bg-red-50 border border-red-200' : 'bg-muted'}`}>
                  <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-semibold">{product.name}</p>
                    {product.price_on_request
                      ? <p className="text-sm text-amber-600 font-medium">As per Request</p>
                      : <p className="text-sm text-muted-foreground">AED {product.price}/{product.unit}</p>
                    }
                    {belowMin && (
                      <p className="text-xs text-red-600 font-medium mt-1">⚠ Minimum order is {minQty} {product.unit}. Please add {minQty - quantity} more.</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => updateCart(product.id, -1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                    <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => updateCart(product.id, 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(product.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  </div>
                </div>
              )})
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>AED {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0
                    ? <span className="text-emerald-600 font-medium">Free 🎉</span>
                    : <span>AED {deliveryFee.toFixed(2)}</span>
                  }
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-amber-600">Add AED {(200 - cartTotal).toFixed(2)} more for free delivery</p>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT (5%)</span>
                  <span>AED {tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">AED {grandTotal.toFixed(2)}</span>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setOrderOpen(false)}>
                  <X className="w-4 h-4 mr-2" /> Continue Shopping
                </Button>
                <Button onClick={handleCheckout} className="gap-2" disabled={minQtyViolations.length > 0}>
                  {minQtyViolations.length > 0 ? `Fix Min. Quantities (${minQtyViolations.length})` : 'Proceed to Checkout'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <FAQSection />

      {/* Footer */}
      <footer className="bg-card border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <img
                src="/media/cf868753a_natural-ice-logo.png"
                alt="Natural Ice"
                className="h-16 w-auto object-contain mb-3"
              />
              <p className="text-sm text-muted-foreground">
                Factory-direct ice delivery for homes, restaurants, hotels, supermarkets and events across the UAE.
              </p>
            </div>
            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-3">Contact Us</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" /><span>22nd Street, Al Quoz Industrial Area 3, Dubai<br />P.O. Box 390805</span></li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary shrink-0" /><a href="tel:+97156334189" className="hover:text-primary transition-colors">+971 4 347 7727 / +971 56 533 4189</a></li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary shrink-0" /><a href="mailto:info@icenatural.com" className="hover:text-primary transition-colors">info@icenatural.com</a></li>
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
      <Dialog open={checkoutOpen} onOpenChange={(val) => { if (!val) setCheckoutStep(1); setCheckoutOpen(val); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {checkoutStep === 2 && (
                <button onClick={() => setCheckoutStep(1)} className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <DialogTitle>{checkoutStep === 1 ? 'Checkout' : 'Choose Payment Method'}</DialogTitle>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1.5 flex-1 rounded-full bg-primary" />
              <div className={`h-1.5 flex-1 rounded-full ${checkoutStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Step {checkoutStep} of 2 — {checkoutStep === 1 ? 'Delivery Details' : 'Payment'}</p>
          </DialogHeader>

          {/* Step 1: Delivery Details */}
          {checkoutStep === 1 && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Full Name *</Label>
                <Input value={checkoutData.client_name} onChange={e => setCheckoutData({ ...checkoutData, client_name: e.target.value })} placeholder="John Smith" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={checkoutData.client_email} onChange={e => setCheckoutData({ ...checkoutData, client_email: e.target.value })} placeholder="john@example.com" />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input value={checkoutData.delivery_phone} onChange={e => setCheckoutData({ ...checkoutData, delivery_phone: e.target.value })} placeholder="+971 50 123 4567" />
              </div>
              <div>
                <Label>Delivery Address *</Label>
                <div className="flex gap-2">
                  <Input
                    value={checkoutData.delivery_address}
                    onChange={e => {
                      setCheckoutData({ ...checkoutData, delivery_address: e.target.value });
                      setDeliveryCoords(null);
                    }}
                    placeholder="Street 22, Al Quoz, Dubai"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Use my current location"
                    onClick={handleGetLocation}
                    disabled={locationLoading}
                    className="shrink-0"
                  >
                    {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4 text-primary" />}
                  </Button>
                </div>
                {deliveryCoords && (
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <MapContainer
                      key={`${deliveryCoords.lat}-${deliveryCoords.lng}`}
                      center={[deliveryCoords.lat, deliveryCoords.lng]}
                      zoom={16}
                      style={{ height: '200px', width: '100%' }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <DraggableMarker coords={deliveryCoords} onMove={handlePinMove} />
                    </MapContainer>
                    <p className="text-xs text-muted-foreground text-center py-1 bg-muted/30">📍 Drag the pin or tap the map to adjust your exact location</p>
                  </div>
                )}
              </div>
              <div>
                <Label>Delivery Date (Optional)</Label>
                <Input type="date" value={checkoutData.delivery_date} onChange={e => setCheckoutData({ ...checkoutData, delivery_date: e.target.value })} />
              </div>
              <div>
                <Label>Notes (Optional)</Label>
                <Input value={checkoutData.notes} onChange={e => setCheckoutData({ ...checkoutData, notes: e.target.value })} placeholder="Any special instructions..." />
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {checkoutStep === 2 && (
            <div className="space-y-4 py-4">
              {/* Amount summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span><span>AED {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? <span className="text-emerald-600">Free</span> : <span>AED {deliveryFee.toFixed(2)}</span>}
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT (5%)</span><span>AED {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2 mt-1">
                  <span>Total</span><span className="text-primary">AED {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment method selection */}
              <div className="space-y-3">
                {/* Card */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'card' ? 'border-primary' : 'border-muted-foreground'}`}>
                    {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Pay by Card</p>
                    <p className="text-xs text-muted-foreground">Visa / Mastercard</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="bg-blue-700 text-white text-xs font-bold px-2 py-0.5 rounded">VISA</div>
                    <div className="flex">
                      <div className="w-6 h-6 rounded-full bg-red-500 opacity-90" />
                      <div className="w-6 h-6 rounded-full bg-yellow-400 -ml-3 opacity-90" />
                    </div>
                  </div>
                </button>

                {/* Apple Pay */}
                <button
                  onClick={() => setPaymentMethod('apple_pay')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === 'apple_pay' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'apple_pay' ? 'border-primary' : 'border-muted-foreground'}`}>
                    {paymentMethod === 'apple_pay' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Apple Pay</p>
                    <p className="text-xs text-muted-foreground">Pay with Touch ID or Face ID</p>
                  </div>
                  <div className="bg-black text-white text-xs font-semibold px-3 py-1 rounded-md" style={{fontFamily: '-apple-system, sans-serif'}}> Pay</div>
                </button>
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
                    <div className="h-9 rounded-md border border-input bg-background px-3 flex items-center text-sm text-muted-foreground">•••• •••• •••• ••••</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Expiry</Label>
                      <div className="h-9 rounded-md border border-input bg-background px-3 flex items-center text-sm text-muted-foreground">MM / YY</div>
                    </div>
                    <div>
                      <Label className="text-xs">CVV</Label>
                      <div className="h-9 rounded-md border border-input bg-background px-3 flex items-center text-sm text-muted-foreground">•••</div>
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 text-center">⚡ Payment integration coming soon — orders will be confirmed manually.</p>
                </div>
              )}

              {/* Apple Pay placeholder */}
              {paymentMethod === 'apple_pay' && (
                <div className="border rounded-xl p-4 flex flex-col items-center gap-3 bg-muted/30">
                  <div className="w-full h-12 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-base" style={{fontFamily: '-apple-system, sans-serif'}}> Pay</span>
                  </div>
                  <p className="text-xs text-amber-600 text-center">⚡ Apple Pay integration coming soon — orders will be confirmed manually.</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {checkoutStep === 1 ? (
              <>
                <Button variant="outline" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => setCheckoutStep(2)}
                  disabled={!checkoutData.client_name || !checkoutData.client_email || !checkoutData.delivery_address || !checkoutData.delivery_phone || !checkoutData.delivery_date}
                  className="gap-2"
                >
                  Next: Payment <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setCheckoutStep(1)}>Back</Button>
                <Button onClick={handleSubmitOrder} disabled={createOrderMutation.isPending}>
                  {createOrderMutation.isPending ? 'Placing Order...' : 'Place Order'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Success Dialog */}
      <Dialog open={orderSuccess} onOpenChange={setOrderSuccess}>
        <DialogContent className="max-w-md text-center">
          <DialogTitle className="sr-only">Order Confirmation</DialogTitle>
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            {orderedItems.length > 0 && (
              <div className="w-full flex flex-col items-center gap-3">
                {orderedItems.slice(0, 1).map((item, i) => (
                  <div key={i} className="flex flex-col items-center w-full">
                    <div className="w-44 h-44 rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted shadow-sm">
                      {item.image_url ? (
                        <img src={item.image_url} alt={`${item.name} from Natural Ice factory in Dubai`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package className="w-12 h-12 text-muted-foreground" /></div>
                      )}
                    </div>
                    <p className="font-bold text-base text-center mt-2">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity} {item.unit}</p>
                  </div>
                ))}
                {orderedItems.length > 1 && (
                  <div className="flex justify-center gap-2 flex-wrap mt-1">
                    {orderedItems.slice(1, 4).map((item, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border bg-muted">
                          {item.image_url ? (
                            <img src={item.image_url} alt={`${item.name} from Natural Ice factory in Dubai`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-muted-foreground" /></div>
                          )}
                        </div>
                        <p className="text-[10px] font-medium mt-1 text-center max-w-[60px] truncate">{item.name}</p>
                      </div>
                    ))}
                    {orderedItems.length > 4 && (
                      <div className="w-14 h-14 rounded-lg border bg-muted/50 flex items-center justify-center">
                        <span className="text-xs font-semibold text-muted-foreground">+{orderedItems.length - 4}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Order Received! 🎉</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Thank you for ordering from <span className="font-semibold text-primary">Natural Ice</span>! Your order has been successfully received and will be prepared shortly.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Our team will contact you soon to confirm your delivery details.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => setOrderSuccess(false)} className="gap-2">
                <ShoppingCart className="w-4 h-4" /> Continue Shopping
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <BottomNav />
    </div>
    </PullToRefresh>
  );
}