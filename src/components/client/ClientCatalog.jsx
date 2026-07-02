import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Plus, Minus, Package, Search } from 'lucide-react';
import { toast } from 'sonner';
import OrderDialog from './OrderDialog';

export default function ClientCatalog({ user }) {
  const [cart, setCart] = useState({});
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [orderOpen, setOrderOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
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

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const product = products.find(p => p.id === id);
    return product ? { product, quantity: qty } : null;
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
          <h1 className="text-3xl font-bold">Product Catalog</h1>
          <p className="text-muted-foreground mt-1">Browse and order our ice products</p>
        </div>
        {cartCount > 0 && (
          <Button onClick={() => setOrderOpen(true)} className="gap-2 relative">
            <ShoppingCart className="w-4 h-4" />
            Cart ({cartCount})
            <span className="text-sm font-bold ml-1">AED {cartTotal.toFixed(2)}</span>
          </Button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="pl-10" />
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
          {filtered.map(product => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all group">
              {product.image_url ? (
                <div className="h-44 bg-muted overflow-hidden">
                  <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
                  <p className="text-2xl font-bold text-primary">AED {product.price}<span className="text-xs font-normal text-muted-foreground">/{product.unit}</span></p>
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