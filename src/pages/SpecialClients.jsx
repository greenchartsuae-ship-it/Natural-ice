import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Star, Package, ChevronDown, ChevronUp, Lock, X } from 'lucide-react';
import { toast } from 'sonner';

export default function SpecialClients() {
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProducts, setSelectedProducts] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const [showExclusive, setShowExclusive] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'other', unit: 'piece', price: '', image_url: '' });
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(null, 500),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['special-assignments'],
    queryFn: () => base44.entities.SpecialClientProduct.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SpecialClientProduct.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['special-assignments'] }),
  });

  const updatePriceMutation = useMutation({
    mutationFn: ({ id, special_price }) => base44.entities.SpecialClientProduct.update(id, { special_price }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['special-assignments'] }),
  });

  const createProductMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  // When client is selected, pre-populate selectedProducts from existing assignments
  const handleClientSelect = (email) => {
    setSelectedClient(email);
    const existing = assignments.filter(a => a.client_email === email);
    const pre = {};
    existing.forEach(a => { pre[a.product_id] = a.special_price.toString(); });
    setSelectedProducts(pre);
  };

  // Map productId -> existing assignment id for this client
  const existingAssignmentMap = Object.fromEntries(
    assignments.filter(a => a.client_email === selectedClient).map(a => [a.product_id, a.id])
  );

  // Only show shared products + products exclusive to the selected client (hide other clients' exclusives)
  const assignableProducts = products.filter(p => !p.exclusive_client_email || p.exclusive_client_email === selectedClient);

  const handleCreateExclusive = async () => {
    if (!selectedClient) { toast.error('Select a client first'); return; }
    if (!newProduct.name.trim() || !newProduct.price) { toast.error('Enter a name and price'); return; }
    const price = parseFloat(newProduct.price);
    const product = await createProductMutation.mutateAsync({
      name: newProduct.name.trim(),
      category: newProduct.category,
      unit: newProduct.unit,
      price,
      image_url: newProduct.image_url || undefined,
      exclusive_client_email: selectedClient,
      is_active: true,
    });
    await createMutation.mutateAsync({ client_email: selectedClient, product_id: product.id, special_price: price });
    toast.success('Exclusive product created and assigned');
    setSelectedProducts(prev => ({ ...prev, [product.id]: price.toString() }));
    setNewProduct({ name: '', category: 'other', unit: 'piece', price: '', image_url: '' });
    setShowExclusive(false);
  };

  const handleAssignProducts = async () => {
    const toProcess = Object.entries(selectedProducts).filter(([_, price]) => price);
    for (const [productId, price] of toProcess) {
      const existingId = existingAssignmentMap[productId];
      if (existingId) {
        await updatePriceMutation.mutateAsync({ id: existingId, special_price: parseFloat(price) });
      } else {
        await createMutation.mutateAsync({ client_email: selectedClient, product_id: productId, special_price: parseFloat(price) });
      }
    }
    toast.success(`${toProcess.length} product(s) saved`);
    setOpen(false);
    setSelectedClient('');
    setSelectedProducts({});
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SpecialClientProduct.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['special-assignments'] });
      toast.success('Assignment removed');
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (items) => {
      await Promise.all(items.map(i => base44.entities.SpecialClientProduct.delete(i.id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['special-assignments'] });
      toast.success('Client removed');
    },
  });

  const specialClients = users.filter(u => u.role === 'special_client');
  const specialClientEmails = new Set(specialClients.map(u => u.email));
  const productMap = Object.fromEntries(products.map(p => [p.id, p]));

  // Group assignments by client, only those still marked as special clients
  const grouped = {};
  assignments.forEach(a => {
    if (!specialClientEmails.has(a.client_email)) return;
    if (!grouped[a.client_email]) grouped[a.client_email] = [];
    grouped[a.client_email].push(a);
  });

  const toggleCollapse = (email) => {
    setCollapsed(prev => ({ ...prev, [email]: !prev[email] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Special Client Products</h1>
          <p className="text-muted-foreground mt-1">Assign products with custom prices to special clients</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Assign Product
        </Button>
      </div>

      {specialClients.length === 0 && (
        <Card className="py-8 text-center">
          <Star className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No special clients yet. Go to Clients and change a user's role to "Special Client" first.</p>
        </Card>
      )}

      {Object.entries(grouped).map(([email, items]) => {
        const client = users.find(u => u.email === email);
        const isCollapsed = collapsed[email];
        return (
          <Card key={email}>
            <CardHeader 
              className="pb-3 cursor-pointer select-none hover:bg-muted/30 rounded-t-xl transition-colors"
              onClick={() => toggleCollapse(email)}
            >
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="flex-1">{client?.display_name || client?.full_name || email}</span>
                <span className="text-sm font-normal text-muted-foreground hidden sm:inline">({email})</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{items.length} product{items.length !== 1 ? 's' : ''}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive shrink-0 h-7 w-7"
                  onClick={(e) => { e.stopPropagation(); deleteClientMutation.mutate(items); }}
                  title="Remove client"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                {isCollapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
              </CardTitle>
            </CardHeader>
            {!isCollapsed && (
              <CardContent>
                <div className="grid gap-2">
                  {items.map(item => {
                    const product = productMap[item.product_id];
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">{product?.name || 'Unknown Product'}</span>
                          {product && (
                            <span className="text-sm text-muted-foreground line-through">AED {product.price}/{product.unit}</span>
                          )}
                          <span className="text-sm font-bold text-primary">AED {item.special_price}/{product?.unit || 'unit'}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => deleteMutation.mutate(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Products to Special Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Special Client</Label>
              <Select value={selectedClient} onValueChange={handleClientSelect}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {specialClients.map(c => (
                    <SelectItem key={c.email} value={c.email}>{c.display_name || c.full_name || c.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClient && (
              <div className="space-y-3">
                {!showExclusive ? (
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowExclusive(true)}>
                    <Lock className="w-4 h-4" /> Create exclusive product for this client
                  </Button>
                ) : (
                  <div className="border rounded-lg p-3 bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium flex items-center gap-1.5"><Lock className="w-4 h-4" /> New exclusive product</p>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowExclusive(false)}><X className="w-4 h-4" /></Button>
                    </div>
                    <Input placeholder="Product name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={newProduct.category} onValueChange={v => setNewProduct({ ...newProduct, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
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
                      <Select value={newProduct.unit} onValueChange={v => setNewProduct({ ...newProduct, unit: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="piece">piece</SelectItem>
                          <SelectItem value="box">box</SelectItem>
                          <SelectItem value="pack">pack</SelectItem>
                          <SelectItem value="liter">liter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input type="number" step="0.01" placeholder="Price (AED)" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                    <Input placeholder="Image URL (optional)" value={newProduct.image_url} onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })} />
                    <Button className="w-full gap-2" disabled={createProductMutation.isPending || createMutation.isPending} onClick={handleCreateExclusive}>
                      {(createProductMutation.isPending || createMutation.isPending) ? 'Creating...' : 'Create & Assign'}
                    </Button>
                  </div>
                )}
                <div>
                <Label>Select Products & Set Prices</Label>
                <div className="grid gap-3 mt-2 max-h-96 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                  {assignableProducts.map(p => {
                    const isExisting = !!existingAssignmentMap[p.id];
                    const isExclusive = p.exclusive_client_email === selectedClient;
                    return (
                      <div key={p.id} className={`flex items-center gap-3 p-2 rounded-lg border hover:shadow-sm transition-shadow ${isExisting ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
                        <input
                          type="checkbox"
                          checked={!!selectedProducts[p.id]}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedProducts({...selectedProducts, [p.id]: p.price.toString()});
                            } else {
                              const newSelected = {...selectedProducts};
                              delete newSelected[p.id];
                              setSelectedProducts(newSelected);
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">{p.name}</p>
                            {isExclusive && <span className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full flex items-center gap-1"><Lock className="w-3 h-3" /> exclusive</span>}
                            {isExisting && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">assigned</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">Regular: AED {p.price}/{p.unit}</p>
                        </div>
                        {selectedProducts[p.id] && (
                          <input
                            type="number"
                            step="0.01"
                            value={selectedProducts[p.id]}
                            onChange={e => setSelectedProducts({...selectedProducts, [p.id]: e.target.value})}
                            placeholder="Price"
                            className="w-20 h-8 px-2 border rounded text-sm"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setSelectedClient(''); setSelectedProducts({}); }}>Cancel</Button>
            <Button 
              onClick={handleAssignProducts} 
              disabled={!selectedClient || Object.keys(selectedProducts).length === 0 || createMutation.isPending || updatePriceMutation.isPending}
            >
              {(createMutation.isPending || updatePriceMutation.isPending) ? 'Saving...' : `Save ${Object.keys(selectedProducts).length} Product(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}