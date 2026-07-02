import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Star, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

export default function SpecialClients() {
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProducts, setSelectedProducts] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
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
              <div>
                <Label>Select Products & Set Prices</Label>
                <div className="grid gap-3 mt-2 max-h-96 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                  {products.map(p => {
                    const isExisting = !!existingAssignmentMap[p.id];
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
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{p.name}</p>
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