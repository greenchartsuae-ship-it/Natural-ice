import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Save, X, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

export default function SpecialClientsTRN() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({ client_email: '', trn: '', company_name: '' });

  const { data: specialClients } = useQuery({
    queryKey: ['specialClients'],
    queryFn: () => base44.entities.SpecialClient.list(),
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SpecialClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialClients'] });
      setOpen(false);
      setFormData({ client_email: '', trn: '', company_name: '' });
      toast.success('Special client TRN added');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SpecialClient.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialClients'] });
      setEditingClient(null);
      toast.success('TRN updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SpecialClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialClients'] });
      toast.success('Special client TRN deleted');
    },
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this special client TRN?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = () => {
    if (!formData.client_email || !formData.trn) {
      toast.error('Email and TRN are required');
      return;
    }
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({ client_email: client.client_email, trn: client.trn || '', company_name: client.company_name || '' });
  };

  const specialClientEmails = specialClients?.map(c => c.client_email) || [];
  // Only users marked as "Special Client" in administration, not already added here
  const availableSpecialClients = users?.filter(
    u => u.role === 'special_client' && !specialClientEmails.includes(u.email)
  ) || [];

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Special Client TRN Management</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingClient(null); setFormData({ client_email: '', trn: '', company_name: '' }); }}>
                  <Plus className="w-4 h-4 mr-2" /> Add TRN
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingClient ? 'Edit TRN' : 'Add TRN for Special Client'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Special Client</Label>
                    {editingClient ? (
                      <Input value={formData.client_email} disabled />
                    ) : (
                      <Select
                        value={formData.client_email}
                        onValueChange={(v) => setFormData({ ...formData, client_email: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a special client" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSpecialClients.length === 0 ? (
                            <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                              No special clients available. Set a user's role to "Special Client" first.
                            </div>
                          ) : (
                            availableSpecialClients.map(u => (
                              <SelectItem key={u.email} value={u.email}>
                                {(u.display_name || u.full_name || u.email)} — {u.email}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label>Company Name (optional)</Label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Company LLC"
                    />
                  </div>
                  <div>
                    <Label>TRN Code *</Label>
                    <Input
                      value={formData.trn}
                      onChange={(e) => setFormData({ ...formData, trn: e.target.value })}
                      placeholder="100332279700003"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSubmit}>
                      <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Email</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>TRN Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specialClients?.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.client_email}</TableCell>
                  <TableCell>{client.company_name || '-'}</TableCell>
                  <TableCell className="font-mono">{client.trn || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(client)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(client.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!specialClients || specialClients.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No special client TRN codes added yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}