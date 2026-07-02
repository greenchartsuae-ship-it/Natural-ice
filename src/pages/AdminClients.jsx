import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Users, Mail, Search, Trash2, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const ROLES = [
  { value: 'admin',          label: 'Admin' },
  { value: 'client',         label: 'Client' },
  { value: 'special_client', label: 'Special Client' },
  { value: 'production',     label: 'Production' },
  { value: 'delivery',       label: 'Delivery' },
];

const roleColors = {
  admin:          'bg-red-100 text-red-700 border-red-200',
  client:         'bg-blue-100 text-blue-700 border-blue-200',
  special_client: 'bg-amber-100 text-amber-700 border-amber-200',
  production:     'bg-purple-100 text-purple-700 border-purple-200',
  delivery:       'bg-cyan-100 text-cyan-700 border-cyan-200',
};

export default function AdminClients() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingName, setEditingName] = useState(null); // userId
  const [nameValue, setNameValue] = useState('');
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => base44.entities.User.update(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role updated');
    },
  });

  const updateNameMutation = useMutation({
    mutationFn: async ({ id, display_name, role, email }) => {
      await base44.functions.invoke('updateUserName', { userId: id, display_name });
      // For non-delivery users, also update driver_name in any orders they collected
      // For delivery users, we do NOT update their driver_name in orders (per requirement)
      if (role !== 'delivery') {
        // update client_name in orders placed by this user
        const userOrders = await base44.entities.Order.filter({ client_email: email });
        await Promise.all(userOrders.map(o => base44.entities.Order.update(o.id, { client_name: display_name })));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Name updated');
      setEditingName(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.User.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User removed');
    },
  });

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    await base44.users.inviteUser(inviteEmail, 'user');
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteOpen(false);
    setInviteEmail('');
    setInviting(false);
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || 
      u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Users & Clients</h1>
          <p className="text-muted-foreground mt-1">{users.length} registered users</p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="gap-2">
          <UserPlus className="w-4 h-4" /> Invite User
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="pl-10" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Filter by role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Card key={i} className="h-20 animate-pulse bg-muted" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No users found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(user => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {(user.display_name || user.full_name || user.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    {editingName === user.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={nameValue}
                          onChange={e => setNameValue(e.target.value)}
                          className="h-7 text-sm w-40"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') updateNameMutation.mutate({ id: user.id, display_name: nameValue, role: user.role, email: user.email });
                            if (e.key === 'Escape') setEditingName(null);
                          }}
                        />
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-green-600" onClick={() => updateNameMutation.mutate({ id: user.id, display_name: nameValue, role: user.role, email: user.email })}>
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => setEditingName(null)}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 group">
                        <p className="font-semibold">{user.display_name || user.full_name || 'No name'}</p>
                        <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setEditingName(user.id); setNameValue(user.display_name || user.full_name || ''); }}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className={roleColors[user.role] || 'bg-muted text-muted-foreground'}>
                    {ROLES.find(r => r.value === user.role)?.label || user.role || 'client'}
                  </Badge>
                  <Select
                    value={user.role || 'client'}
                    onValueChange={v => updateRoleMutation.mutate({ id: user.id, role: v })}
                  >
                    <SelectTrigger className="w-40 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove user?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove {user.display_name || user.full_name || user.email} from the system.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(user.id)} className="bg-destructive hover:bg-destructive/90">
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email address</Label>
              <Input
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                type="email"
              />
            </div>
            <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
              The user will receive an invitation email. Once they register, you can set their role (client, special client, production, delivery, etc.) from this page.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={!inviteEmail || inviting}>
              {inviting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}