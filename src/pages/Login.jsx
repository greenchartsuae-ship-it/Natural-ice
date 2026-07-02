import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { checkUserAuth } = useAuth();

  const redirectBasedOnRole = (user) => {
    const role = user?.role || 'client';
    const returnTo = params.get('return');
    if (returnTo) return navigate(returnTo);
    if (role === 'admin') navigate('/catalog');
    else if (role === 'production') navigate('/production');
    else if (role === 'delivery') navigate('/delivery');
    else navigate('/catalog');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await base44.auth.login(email, password);
      await checkUserAuth();
      toast.success(`Welcome back, ${user.display_name || user.email}!`);
      redirectBasedOnRole(user);
    } catch (err) {
      toast.error(err.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <img
            src="https://media.base44.com/images/public/69e4d4aaed7dc3117eed9c83/ccd9c0ca3_logopng.png"
            alt="Natural Ice"
            className="h-16 w-auto object-contain mx-auto mb-2"
          />
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <Button variant="link" className="w-full mt-2" onClick={() => navigate('/')}>
            Back to storefront
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
