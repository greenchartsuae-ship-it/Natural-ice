import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Package, GripVertical, X, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const categories = [
  { value: 'crushed_ice', label: 'Crushed Ice' },
  { value: 'custom_ice', label: 'Custom Ice' },
  { value: 'diamond_ice', label: 'Diamond Ice' },
  { value: 'dry_ice', label: 'Dry Ice' },
  { value: 'ice_ball', label: 'Ice Ball' },
  { value: 'ice_cream', label: 'Ice Cream' },
  { value: 'ice_cube', label: 'Ice Cube' },
  { value: 'large_ice_cube', label: 'Large Ice Cubes' },
  { value: 'long_ice_cube', label: 'Long Ice Cube' },
  { value: 'luxury_ice', label: 'Luxury Ice' },
  { value: 'tube_ice', label: 'Tube Ice' },
  { value: 'other', label: 'Other' },
];

const units = [
  { value: 'kg', label: 'Kilogram' },
  { value: 'piece', label: 'Piece' },
  { value: 'box', label: 'Box' },
  { value: 'pack', label: 'Pack' },
  { value: 'liter', label: 'Liter' },
];

const defaultProduct = { name: '', description: '', category: 'ice_ball', price: '', unit: 'kg', image_url: '', is_active: true, min_order_quantity: 1, sort_order: 0, price_on_request: false };

export default function AdminProducts() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultProduct);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'sort'
  const [localProducts, setLocalProducts] = useState([]);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('sort_order'),
  });

  const productsRef = React.useRef(null);
  useEffect(() => {
    if (viewMode !== 'sort' && products !== productsRef.current) {
      productsRef.current = products;
      setLocalProducts(products);
    }
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.Product.update(editing.id, data)
      : base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setOpen(false);
      setEditing(null);
      setForm(defaultProduct);
      toast.success(editing ? 'Product updated' : 'Product created');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
    },
  });

  const saveOrderMutation = useMutation({
    mutationFn: async (orderedProducts) => {
      await Promise.all(
        orderedProducts.map((p, i) => base44.entities.Product.update(p.id, { sort_order: i }))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Order saved!');
      setViewMode('grid');
    },
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(localProducts);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setLocalProducts(reordered);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({ ...product });
    setOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultProduct, sort_order: products.length });
    setOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate({ ...form, price: parseFloat(form.price), min_order_quantity: parseInt(form.min_order_quantity) || 1 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your ice products</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'sort' ? 'default' : 'outline'}
            onClick={() => setViewMode(v => v === 'sort' ? 'grid' : 'sort')}
            className="gap-2"
          >
            <GripVertical className="w-4 h-4" />
            {viewMode === 'sort' ? 'Cancel Reorder' : 'Reorder'}
          </Button>
          {viewMode !== 'sort' && (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          )}
          {viewMode === 'sort' && (
            <Button onClick={() => saveOrderMutation.mutate(localProducts)} disabled={saveOrderMutation.isPending} className="gap-2">
              {saveOrderMutation.isPending ? 'Saving...' : 'Save Order'}
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Card key={i} className="h-48 animate-pulse bg-muted" />)}
        </div>
      ) : products.length === 0 ? (
        <Card className="py-16 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No products yet. Add your first product.</p>
        </Card>
      ) : viewMode === 'sort' ? (
        /* ── DRAG & DROP SORT VIEW ── */
        <div>
          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <GripVertical className="w-4 h-4" /> Drag products to reorder, then click <strong>Save Order</strong>
          </p>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="products">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-2">
                  {localProducts.map((product, index) => (
                    <Draggable key={product.id} draggableId={product.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-3 bg-card border rounded-xl px-4 py-3 shadow-sm transition-shadow ${snapshot.isDragging ? 'shadow-xl ring-2 ring-primary/30' : ''}`}
                        >
                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <span className="w-6 text-center text-xs font-bold text-muted-foreground">{index + 1}</span>
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Package className="w-6 h-6 text-muted-foreground/40" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {product.category?.replace(/_/g, ' ')} · {product.price_on_request ? 'As per Request' : `AED ${product.price}/${product.unit}`}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${product.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {product.is_active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      ) : (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, index) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div
                className="h-40 bg-muted cursor-pointer relative group"
                onClick={() => product.image_url && setPreviewProduct(product)}
              >
                {product.image_url ? (
                  <>
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:brightness-90 transition" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">Click to enlarge</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{product.category?.replace(/_/g, ' ')}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {product.is_active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-2xl font-bold text-primary">AED {product.price}<span className="text-sm font-normal text-muted-foreground">/{product.unit}</span></p>
                  <div className="flex gap-1 items-center">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(product.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit / Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'New Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Product name" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={v => setForm({...form, unit: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {units.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (AED)</Label>
                <Input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" />
              </div>
              <div>
                <Label>Min Order Qty</Label>
                <Input type="number" value={form.min_order_quantity} onChange={e => setForm({...form, min_order_quantity: e.target.value})} />
              </div>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active !== false} onCheckedChange={v => setForm({...form, is_active: v})} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview */}
      {previewProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewProduct(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <Button
              variant="ghost" size="icon"
              className="absolute -top-10 right-0 text-white hover:text-white hover:bg-white/20"
              onClick={() => setPreviewProduct(null)}
            >
              <X className="w-5 h-5" />
            </Button>
            <img src={previewProduct.image_url} alt={previewProduct.name} className="w-full rounded-xl object-contain max-h-[80vh]" />
            <p className="text-white text-center mt-3 font-semibold text-lg">{previewProduct.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}