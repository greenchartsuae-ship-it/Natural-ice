import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User, Trash2, LogOut, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await base44.functions.invoke('deleteUserAccount', {});
      toast.success('Your account has been deleted.');
      setOpen(false);
      logout();
      navigate('/');
    } catch (e) {
      toast.error('Failed to delete account. Please try again or contact support.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Account</h1>
        <p className="text-muted-foreground text-sm">Manage your profile and account settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Profile</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{user?.display_name || user?.full_name || '—'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{user?.email || '—'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="font-medium capitalize">{user?.role || '—'}</span></div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive"><ShieldAlert className="w-5 h-5" /> Danger Zone</CardTitle>
          <CardDescription>Permanently delete your account. This action cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2"><Trash2 className="w-4 h-4" /> Delete my account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account and sign you out. Your past orders will remain in our records for accounting purposes. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => { e.preventDefault(); handleDelete(); }}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? 'Deleting...' : 'Yes, delete my account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" className="gap-2 mt-3" onClick={logout}><LogOut className="w-4 h-4" /> Sign out</Button>
        </CardContent>
      </Card>
    </div>
  );
}