import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Package, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import OrderDialog from './OrderDialog';

export default function SpecialClientCatalog({ user }) {
  const [cart, setCart] = useState({});
  const [orderOpen, setOrderOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['my-special-products', user.email],
    queryFn: () => base44.entities.SpecialClientProduct.filter({ client_email: user.email }),
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const isLoading = loadingAssignments || loadingProducts;

  // Build special product list with custom prices
  const specialProducts = assignments.map(a => {
    const product = products.find(p => p.id === a.product_id);
    if (!product) return null;
    return { ...product, special_price: a.special_price, original_price: product.price };
  }).filter(Boolean);

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

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const product = specialProducts.find(p => p.id === id);
    return product ? { product: { ...product, price: product.special_price }, quantity: qty } : null;
  }).filter(Boolean);

  const cartTotal = cartItems.reduce((s, item) => s + (item.product.price * item.quantity), 0);

  const createOrderMutation = useMutation({
    mutationFn: (orderData) => base44.entities.Order.create(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      setCart({});
      setOrderOpen(false);
      toast.success('Order placed successfully!');
    },
  });

  const handleOrder = (deliveryInfo) => {
    const items = cartItems.map(item => ({
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      total: item.product.price * item.quantity,
    }));
    createOrderMutation.mutate({
      client_email: user.email,
      client_name: user.display_name || user.full_name || user.email,
      items,
      total_amount: cartTotal,
      ...deliveryInfo,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Star className="w-7 h-7 text-amber-500" /> My Special Products
          </h1>
          <p className="text-muted-foreground mt-1">Exclusive products at your special prices</p>
        </div>
        {cartCount > 0 && (
          <Button onClick={() => setOrderOpen(true)} className="gap-2">
            <ShoppingCart className="w-4 h-4" /> Cart ({cartCount}) — AED {cartTotal.toFixed(2)}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Card key={i} className="h-64 animate-pulse bg-muted" />)}
        </div>
      ) : specialProducts.length === 0 ? (
        <Card className="py-16 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No products assigned to you yet. Please contact administration.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {specialProducts.map(product => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all group border-amber-200">
              {product.image_url ? (
                <div className="h-44 bg-muted overflow-hidden">
                  <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="h-44 bg-gradient-to-br from-amber-50 to-primary/10 flex items-center justify-center">
                  <Star className="w-16 h-16 text-amber-300" />
                </div>
              )}
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">Special</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">AED {product.special_price}<span className="text-xs font-normal text-muted-foreground">/{product.unit}</span></p>
                    <p className="text-sm text-muted-foreground line-through">AED {product.original_price}/{product.unit}</p>
                  </div>
                  {cart[product.id] ? (
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

      <OrderDialog
        open={orderOpen}
        onOpenChange={setOrderOpen}
        cartItems={cartItems}
        total={cartTotal}
        onSubmit={handleOrder}
        loading={createOrderMutation.isPending}
        user={user}
      />
    </div>
  );
}